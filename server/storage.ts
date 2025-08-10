import { 
  users, organizations, organizationMembers, reviewSources, reviews, 
  aspectScores, insights, aiLogs, creatorProfiles, creatorStats, 
  shortlists, trainingResources, usageEvents,
  type User, type InsertUser, type Organization, type InsertOrganization,
  type Review, type InsertReview, type CreatorProfile, type InsertCreatorProfile,
  type Insight, type InsertInsight, type AspectScore, type TrainingResource
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, ilike, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Organizations
  getOrganization(id: string): Promise<Organization | undefined>;
  getUserOrganizations(userId: string): Promise<Organization[]>;
  createOrganization(org: InsertOrganization, ownerId: string): Promise<Organization>;
  
  // Reviews
  getReviews(organizationId: string, filters?: ReviewFilters): Promise<Review[]>;
  getReviewsWithSources(organizationId: string, limit?: number): Promise<any[]>;
  createReview(review: InsertReview): Promise<Review>;
  bulkCreateReviews(reviews: InsertReview[]): Promise<Review[]>;
  
  // Insights
  getInsights(organizationId: string): Promise<Insight[]>;
  createInsight(insight: InsertInsight): Promise<Insight>;
  
  // Analytics
  getRatingTrends(organizationId: string, days: number): Promise<any[]>;
  getAspectScores(organizationId: string): Promise<any[]>;
  
  // Creators
  getCreators(filters?: CreatorFilters): Promise<any[]>;
  getCreatorProfile(userId: string): Promise<CreatorProfile | undefined>;
  createCreatorProfile(profile: InsertCreatorProfile): Promise<CreatorProfile>;
  updateCreatorProfile(id: string, updates: Partial<CreatorProfile>): Promise<CreatorProfile>;
  
  // Shortlists
  getShortlistedCreators(organizationId: string): Promise<any[]>;
  addToShortlist(organizationId: string, creatorId: string): Promise<void>;
  removeFromShortlist(organizationId: string, creatorId: string): Promise<void>;
  
  // Training
  getTrainingResources(category?: string): Promise<TrainingResource[]>;
  getRecommendedTraining(organizationId: string): Promise<TrainingResource[]>;
  
  // Usage
  logUsage(organizationId: string, type: 'AI_CALL' | 'UPLOAD', tokens?: number, meta?: any): Promise<void>;
  getUsageStats(organizationId: string, days: number): Promise<any>;
}

export interface ReviewFilters {
  dateFrom?: Date;
  dateTo?: Date;
  ratings?: number[];
  sources?: string[];
  aspects?: string[];
  keyword?: string;
  limit?: number;
  offset?: number;
}

export interface CreatorFilters {
  niches?: string[];
  location?: string;
  minFollowers?: number;
  minBrandFit?: number;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org || undefined;
  }

  async getUserOrganizations(userId: string): Promise<Organization[]> {
    const result = await db
      .select({ organization: organizations })
      .from(organizationMembers)
      .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
      .where(eq(organizationMembers.userId, userId));
    
    return result.map(r => r.organization);
  }

  async createOrganization(org: InsertOrganization, ownerId: string): Promise<Organization> {
    const [organization] = await db.insert(organizations).values(org).returning();
    
    await db.insert(organizationMembers).values({
      organizationId: organization.id,
      userId: ownerId,
      role: 'OWNER',
    });
    
    return organization;
  }

  async getReviews(organizationId: string, filters: ReviewFilters = {}): Promise<Review[]> {
    const conditions = [eq(reviews.organizationId, organizationId)];
    
    if (filters.dateFrom) {
      conditions.push(gte(reviews.createdAt, filters.dateFrom));
    }
    if (filters.dateTo) {
      conditions.push(lte(reviews.createdAt, filters.dateTo));
    }
    if (filters.ratings && filters.ratings.length > 0) {
      conditions.push(inArray(reviews.rating, filters.ratings));
    }
    if (filters.sources && filters.sources.length > 0) {
      conditions.push(inArray(reviews.sourceId, filters.sources));
    }
    if (filters.keyword) {
      conditions.push(ilike(reviews.text, `%${filters.keyword}%`));
    }
    
    let query = db.select().from(reviews).where(and(...conditions));
    
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.offset(filters.offset);
    }
    
    query = query.orderBy(desc(reviews.createdAt));
    
    return await query;
  }

  async getReviewsWithSources(organizationId: string, limit = 10): Promise<any[]> {
    return await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        text: reviews.text,
        author: reviews.author,
        createdAt: reviews.createdAt,
        source: {
          id: reviewSources.id,
          name: reviewSources.name,
        },
        aspects: sql`COALESCE(json_agg(
          CASE WHEN ${aspectScores.id} IS NOT NULL THEN
            json_build_object(
              'aspect', ${aspectScores.aspect},
              'sentiment', ${aspectScores.sentiment},
              'score', ${aspectScores.score}
            )
          END
        ) FILTER (WHERE ${aspectScores.id} IS NOT NULL), '[]'::json)`.as('aspects'),
      })
      .from(reviews)
      .innerJoin(reviewSources, eq(reviews.sourceId, reviewSources.id))
      .leftJoin(aspectScores, eq(reviews.id, aspectScores.reviewId))
      .where(eq(reviews.organizationId, organizationId))
      .groupBy(reviews.id, reviewSources.id, reviewSources.name)
      .orderBy(desc(reviews.createdAt))
      .limit(limit);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async bulkCreateReviews(reviewList: InsertReview[]): Promise<Review[]> {
    if (reviewList.length === 0) return [];
    return await db.insert(reviews).values(reviewList).returning();
  }

  async getInsights(organizationId: string): Promise<Insight[]> {
    return await db
      .select()
      .from(insights)
      .where(eq(insights.organizationId, organizationId))
      .orderBy(desc(insights.createdAt));
  }

  async createInsight(insight: InsertInsight): Promise<Insight> {
    const [newInsight] = await db.insert(insights).values(insight).returning();
    return newInsight;
  }

  async getRatingTrends(organizationId: string, days: number): Promise<any[]> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    return await db
      .select({
        date: sql`date_trunc('week', ${reviews.createdAt})`.as('date'),
        avgRating: sql`avg(${reviews.rating})`.as('avgRating'),
        count: sql`count(*)`.as('count'),
      })
      .from(reviews)
      .where(
        and(
          eq(reviews.organizationId, organizationId),
          gte(reviews.createdAt, fromDate)
        )
      )
      .groupBy(sql`date_trunc('week', ${reviews.createdAt})`)
      .orderBy(sql`date_trunc('week', ${reviews.createdAt})`);
  }

  async getAspectScores(organizationId: string): Promise<any[]> {
    return await db
      .select({
        aspect: aspectScores.aspect,
        avgScore: sql`avg(${aspectScores.score})`.as('avgScore'),
        sentiment: aspectScores.sentiment,
        count: sql`count(*)`.as('count'),
      })
      .from(aspectScores)
      .innerJoin(reviews, eq(aspectScores.reviewId, reviews.id))
      .where(eq(reviews.organizationId, organizationId))
      .groupBy(aspectScores.aspect, aspectScores.sentiment);
  }

  async getCreators(filters: CreatorFilters = {}): Promise<any[]> {
    let query = db
      .select({
        id: creatorProfiles.id,
        userId: creatorProfiles.userId,
        displayName: creatorProfiles.displayName,
        bio: creatorProfiles.bio,
        city: creatorProfiles.city,
        country: creatorProfiles.country,
        niches: creatorProfiles.niches,
        instagramUrl: creatorProfiles.instagramUrl,
        facebookUrl: creatorProfiles.facebookUrl,
        tiktokUrl: creatorProfiles.tiktokUrl,
        followers: creatorStats.followers,
        engagementRate: creatorStats.engagementRate,
        impressions30d: creatorStats.impressions30d,
        postFrequencyPerWeek: creatorStats.postFrequencyPerWeek,
      })
      .from(creatorProfiles)
      .leftJoin(creatorStats, eq(creatorProfiles.id, creatorStats.creatorId));

    const conditions = [];
    
    if (filters.minFollowers) {
      conditions.push(gte(creatorStats.followers, filters.minFollowers));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    return await query;
  }

  async getCreatorProfile(userId: string): Promise<CreatorProfile | undefined> {
    const [profile] = await db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.userId, userId));
    return profile || undefined;
  }

  async createCreatorProfile(profile: InsertCreatorProfile): Promise<CreatorProfile> {
    const [newProfile] = await db.insert(creatorProfiles).values(profile).returning();
    return newProfile;
  }

  async updateCreatorProfile(id: string, updates: Partial<CreatorProfile>): Promise<CreatorProfile> {
    const [updatedProfile] = await db
      .update(creatorProfiles)
      .set(updates)
      .where(eq(creatorProfiles.id, id))
      .returning();
    return updatedProfile;
  }

  async getShortlistedCreators(organizationId: string): Promise<any[]> {
    return await db
      .select({
        id: creatorProfiles.id,
        displayName: creatorProfiles.displayName,
        bio: creatorProfiles.bio,
        city: creatorProfiles.city,
        country: creatorProfiles.country,
        niches: creatorProfiles.niches,
        followers: creatorStats.followers,
        engagementRate: creatorStats.engagementRate,
        shortlistedAt: shortlists.createdAt,
      })
      .from(shortlists)
      .innerJoin(creatorProfiles, eq(shortlists.creatorId, creatorProfiles.id))
      .leftJoin(creatorStats, eq(creatorProfiles.id, creatorStats.creatorId))
      .where(eq(shortlists.organizationId, organizationId))
      .orderBy(desc(shortlists.createdAt));
  }

  async addToShortlist(organizationId: string, creatorId: string): Promise<void> {
    await db.insert(shortlists).values({
      organizationId,
      creatorId,
    });
  }

  async removeFromShortlist(organizationId: string, creatorId: string): Promise<void> {
    await db.delete(shortlists).where(
      and(
        eq(shortlists.organizationId, organizationId),
        eq(shortlists.creatorId, creatorId)
      )
    );
  }

  async getTrainingResources(category?: string): Promise<TrainingResource[]> {
    let query = db.select().from(trainingResources);
    
    if (category) {
      query = query.where(eq(trainingResources.category, category));
    }
    
    return await query.orderBy(trainingResources.title);
  }

  async getRecommendedTraining(organizationId: string): Promise<TrainingResource[]> {
    // Get recent insights to determine recommendations
    const recentInsights = await db
      .select({ aspects: insights.aspects })
      .from(insights)
      .where(eq(insights.organizationId, organizationId))
      .orderBy(desc(insights.createdAt))
      .limit(5);

    // Extract aspect keywords for matching
    const aspectKeywords = recentInsights
      .flatMap(i => i.aspects)
      .map(aspect => aspect.toLowerCase());

    // Simple keyword matching for recommendations
    const resources = await db.select().from(trainingResources);
    
    return resources
      .filter(r => 
        aspectKeywords.some(keyword => 
          r.title.toLowerCase().includes(keyword) || 
          r.category.toLowerCase().includes(keyword)
        )
      )
      .slice(0, 3);
  }

  async logUsage(organizationId: string, type: 'AI_CALL' | 'UPLOAD', tokens?: number, meta?: any): Promise<void> {
    await db.insert(usageEvents).values({
      organizationId,
      type,
      tokens,
      metaJson: meta ? JSON.stringify(meta) : null,
    });
  }

  async getUsageStats(organizationId: string, days: number): Promise<any> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const result = await db
      .select({
        type: usageEvents.type,
        totalTokens: sql`sum(${usageEvents.tokens})`.as('totalTokens'),
        count: sql`count(*)`.as('count'),
      })
      .from(usageEvents)
      .where(
        and(
          eq(usageEvents.organizationId, organizationId),
          gte(usageEvents.createdAt, fromDate)
        )
      )
      .groupBy(usageEvents.type);

    return result.reduce((acc, row) => {
      acc[row.type] = {
        tokens: parseInt(row.totalTokens as string) || 0,
        count: parseInt(row.count as string) || 0,
      };
      return acc;
    }, {} as Record<string, { tokens: number; count: number }>);
  }
}

export const storage = new DatabaseStorage();
