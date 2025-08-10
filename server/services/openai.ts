import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface AspectAnalysis {
  aspect: string;
  sentiment: 'NEG' | 'NEUTRAL' | 'POS';
  score: number;
  reasoning: string;
}

export interface ReviewAnalysis {
  aspectScores: AspectAnalysis[];
  overallSentiment: 'NEG' | 'NEUTRAL' | 'POS';
  keyPoints: string[];
}

export async function analyzeReviewSentiment(reviewText: string): Promise<ReviewAnalysis> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a sentiment analysis expert for business reviews. Analyze the review across these 6 aspects:
          - CLEANLINESS: How clean and well-maintained the business is
          - STAFF: Quality of service, friendliness, and professionalism of staff
          - FOOD_QUALITY: Quality, taste, and presentation of food/products
          - VALUE: Price-to-quality ratio and overall value for money
          - LOCATION: Accessibility, convenience, and appeal of location
          - SPEED: Timeliness of service and efficiency

          For each aspect mentioned in the review, provide:
          - sentiment: NEG, NEUTRAL, or POS
          - score: 0-100 (0=very negative, 50=neutral, 100=very positive)
          - reasoning: brief explanation

          Respond with JSON in this format:
          {
            "aspectScores": [
              {
                "aspect": "CLEANLINESS",
                "sentiment": "POS",
                "score": 85,
                "reasoning": "Customer praised the spotless rooms"
              }
            ],
            "overallSentiment": "POS",
            "keyPoints": ["Clean facilities", "Friendly staff"]
          }`
        },
        {
          role: "user",
          content: reviewText
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as ReviewAnalysis;
  } catch (error) {
    console.error('Error analyzing review sentiment:', error);
    throw new Error('Failed to analyze review sentiment');
  }
}

export async function generateInsights(reviews: any[], aspects: string[]): Promise<{
  title: string;
  summary: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendations: string[];
}> {
  try {
    const reviewTexts = reviews.map(r => r.text).slice(0, 20); // Limit for token usage
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a business intelligence analyst. Analyze customer reviews to generate actionable insights.
          
          Focus on the aspects: ${aspects.join(', ')}
          
          Provide insights in JSON format:
          {
            "title": "Brief insight title",
            "summary": "2-3 sentence summary of the key finding",
            "severity": "LOW/MEDIUM/HIGH based on impact",
            "recommendations": ["actionable recommendation 1", "actionable recommendation 2"]
          }`
        },
        {
          role: "user",
          content: `Analyze these customer reviews:\n\n${reviewTexts.join('\n\n')}`
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    console.error('Error generating insights:', error);
    throw new Error('Failed to generate insights');
  }
}

export async function generateWeeklyReport(organizationName: string, data: {
  totalReviews: number;
  avgRating: number;
  aspectScores: Record<string, number>;
  keyInsights: string[];
  trends: any[];
}): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a business analyst creating a weekly review summary report. 
          Write a professional, concise report that business owners can use to understand their customer feedback trends.
          Include key metrics, insights, and actionable recommendations.`
        },
        {
          role: "user",
          content: `Create a weekly report for ${organizationName} with this data:
          
          Total Reviews: ${data.totalReviews}
          Average Rating: ${data.avgRating}/5
          Aspect Scores: ${JSON.stringify(data.aspectScores)}
          Key Insights: ${data.keyInsights.join(', ')}
          
          Make it concise but comprehensive, focusing on actionable insights.`
        }
      ],
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating weekly report:', error);
    throw new Error('Failed to generate weekly report');
  }
}