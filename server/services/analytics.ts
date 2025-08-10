import { storage } from "../storage";
import { analyzeReviewSentiment, generateInsights } from "./openai";

class AnalyticsService {
  async getDashboardMetrics(organizationId: string) {
    try {
      // Get basic metrics
      const reviews = await storage.getReviews(organizationId, { limit: 1000 });
      const totalReviews = reviews.length;
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 0;

      // Get recent reviews with sources
      const recentReviews = await storage.getReviewsWithSources(organizationId, 5);

      // Get aspect scores
      const aspectScores = await storage.getAspectScores(organizationId);
      const keyAreas = this.processAspectScores(aspectScores);

      // Get rating trends
      const ratingTrends = await storage.getRatingTrends(organizationId, 30);

      return {
        metrics: {
          totalReviews,
          avgRating: Math.round(avgRating * 10) / 10,
          positiveReviews: reviews.filter(r => r.rating >= 4).length,
          responseRate: 85, // Mock data for now
        },
        recentReviews: recentReviews.slice(0, 5),
        keyAreas,
        ratingTrends: ratingTrends.map(trend => ({
          date: trend.date,
          rating: Math.round(parseFloat(trend.avgRating) * 10) / 10,
          count: parseInt(trend.count),
        })),
      };
    } catch (error) {
      console.error("Error getting dashboard metrics:", error);
      throw new Error("Failed to get dashboard metrics");
    }
  }

  async getReviewsData(organizationId: string, filters: any = {}) {
    try {
      const reviews = await storage.getReviewsWithSources(organizationId, filters.limit || 50);
      return {
        reviews: reviews.map(review => ({
          ...review,
          sentiment: this.calculateOverallSentiment(review.aspects || []),
        })),
      };
    } catch (error) {
      console.error("Error getting reviews data:", error);
      throw new Error("Failed to get reviews data");
    }
  }

  async getCreatorsData(filters: any = {}) {
    try {
      const creators = await storage.getCreators(filters);
      return {
        creators: creators.map(creator => ({
          ...creator,
          brandFitScore: this.calculateBrandFitScore(creator),
        })),
      };
    } catch (error) {
      console.error("Error getting creators data:", error);
      throw new Error("Failed to get creators data");
    }
  }

  async getShortlistedCreators(organizationId: string) {
    try {
      const shortlisted = await storage.getShortlistedCreators(organizationId);
      return {
        shortlisted: shortlisted.map(creator => ({
          ...creator,
          brandFitScore: this.calculateBrandFitScore(creator),
        })),
      };
    } catch (error) {
      console.error("Error getting shortlisted creators:", error);
      throw new Error("Failed to get shortlisted creators");
    }
  }

  async getTrainingData(organizationId: string, category?: string) {
    try {
      const resources = await storage.getTrainingResources(category);
      const recommended = await storage.getRecommendedTraining(organizationId);

      return {
        resources,
        recommended,
      };
    } catch (error) {
      console.error("Error getting training data:", error);
      throw new Error("Failed to get training data");
    }
  }

  async getUsageData(organizationId: string, days: number = 30) {
    try {
      const usage = await storage.getUsageStats(organizationId, days);
      return { usage };
    } catch (error) {
      console.error("Error getting usage data:", error);
      throw new Error("Failed to get usage data");
    }
  }

  private processAspectScores(aspectScores: any[]) {
    const aspectMap = new Map();

    aspectScores.forEach(score => {
      const key = score.aspect;
      if (!aspectMap.has(key)) {
        aspectMap.set(key, { positive: 0, negative: 0, neutral: 0, total: 0 });
      }
      
      const data = aspectMap.get(key);
      data.total += parseInt(score.count);
      
      if (score.sentiment === 'POS') data.positive += parseInt(score.count);
      else if (score.sentiment === 'NEG') data.negative += parseInt(score.count);
      else data.neutral += parseInt(score.count);
    });

    return Array.from(aspectMap.entries()).map(([aspect, data]) => ({
      aspect: aspect.toLowerCase().replace('_', ' '),
      score: data.total > 0 ? Math.round((data.positive / data.total) * 100) : 50,
      trend: Math.random() > 0.5 ? 'up' : 'down', // Mock trend data
      issues: data.negative,
    }));
  }

  private calculateOverallSentiment(aspects: any[]): 'positive' | 'negative' | 'neutral' {
    if (aspects.length === 0) return 'neutral';
    
    const avgScore = aspects.reduce((sum, aspect) => sum + parseFloat(aspect.score), 0) / aspects.length;
    
    if (avgScore >= 70) return 'positive';
    if (avgScore <= 40) return 'negative';
    return 'neutral';
  }

  private calculateBrandFitScore(creator: any): number {
    let score = 0;
    
    // Niche overlap (0-60 points)
    const hotelNiches = ["travel", "tourism", "luxury", "lifestyle"];
    const nicheOverlap = creator.niches?.filter((n: string) => 
      hotelNiches.some(hn => n.toLowerCase().includes(hn))
    ).length || 0;
    score += Math.min(nicheOverlap * 15, 60);
    
    // Location proximity (0-30 points)
    if (creator.country?.toLowerCase().includes('jamaica') || 
        creator.city?.toLowerCase().includes('caribbean')) {
      score += 30;
    } else if (creator.country?.toLowerCase().includes('caribbean')) {
      score += 20;
    } else {
      score += 10;
    }
    
    // Engagement threshold (bonus up to 10 points)
    const engagementRate = parseFloat(creator.engagementRate) || 0;
    if (engagementRate > 8) score += 10;
    else if (engagementRate > 5) score += 7;
    else if (engagementRate > 3) score += 5;
    
    return Math.min(Math.round(score), 100);
  }
}

export const analyticsService = new AnalyticsService();