# ReviewScope - Business Review Analytics Platform

A comprehensive full-stack SaaS platform that aggregates customer reviews from multiple sources, analyzes them with AI, and provides actionable business intelligence to improve customer experience.

## Features

- **AI-Powered Analysis**: Advanced sentiment analysis across 6 key aspects (cleanliness, staff, food quality, value, location, speed)
- **Multi-Source Aggregation**: Collect reviews from Google, TripAdvisor, Yelp, and CSV uploads
- **Interactive Dashboard**: Real-time analytics with charts, trends, and key insights
- **Creator Marketplace**: Connect with content creators using intelligent brand-fit scoring
- **Training Library**: Personalized recommendations based on review insights
- **Weekly Reports**: AI-generated PDF reports with actionable recommendations
- **Role-Based Access**: Separate interfaces for business owners and content creators

## Tech Stack

### Frontend
- **React** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Chart.js** for data visualizations
- **React Query** for data fetching
- **Wouter** for routing

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** with Drizzle ORM
- **OpenAI API** for AI analysis
- **bcrypt** for authentication
- **Multer** for file uploads
- **PDFKit** for report generation

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd reviewscope
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your configuration:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `SESSION_SECRET`: Random string for session encryption

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Seed the database with demo data**
   ```bash
   npx tsx server/seed.ts
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Access the application**
   - Open http://localhost:5000
   - Use the demo login or create a new account

## Demo Accounts

The application comes with pre-seeded demo accounts:

**Business Owner Account:**
- Email: `owner@example.com`
- Password: `demo1234`
- Access: Full dashboard, analytics, creator marketplace

**Content Creator Account:**
- Email: `creator@example.com`
- Password: `demo1234`
- Access: Creator profile, marketplace visibility

## Key Features Guide

### Dashboard
- View rating trends over time
- Monitor key metrics (total reviews, average rating, sentiment score)
- Identify areas for development with AI insights
- Generate and download weekly PDF reports

### Reviews Management
- Search and filter reviews by date, rating, source, and aspects
- Upload CSV files with review data
- View detailed sentiment analysis for each review
- Track which reviews contribute to specific insights

### Creator Marketplace (Business Owners)
- Browse content creators with brand-fit scoring
- Filter by niche, location, followers, and engagement
- Shortlist creators for collaborations
- View detailed creator profiles and statistics

### Training Library
- Access categorized training resources
- Get personalized recommendations based on review insights
- View documents and video training materials
- Track progress and completion

### Settings
- Manage user profile and organization settings
- Invite team members (business owners)
- Monitor AI usage and token consumption
- Configure account preferences

## CSV Upload Format

To upload reviews via CSV, use this format:

```csv
date,rating,text,author,source
2024-01-15,5,"Great service and food!","John Doe","Google Reviews"
2024-01-14,4,"Nice location but slow service","Jane Smith","TripAdvisor"
