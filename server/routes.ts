import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { authService } from "./services/auth";
import { analyticsService } from "./services/analytics";
import { pdfService } from "./services/pdf";
import { requireAuth } from "./middleware/auth";
import { insertUserSchema, insertOrganizationSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import Papa from "papaparse";

const upload = multer({ storage: multer.memoryStorage() });

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["OWNER", "CREATOR"]),
  organizationName: z.string().min(1).optional(),
});

const creatorFiltersSchema = z.object({
  niches: z.array(z.string()).optional(),
  location: z.string().optional(),
  minFollowers: z.number().optional(),
  minBrandFit: z.number().optional(),
});

const reviewFiltersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  ratings: z.array(z.number().min(1).max(5)).optional(),
  sources: z.array(z.string()).optional(),
  aspects: z.array(z.string()).optional(),
  keyword: z.string().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const result = await authService.login(email, password);
      
      if (!result.success) {
        return res.status(401).json({ message: result.error });
      }

      // Set session
      req.session.userId = result.user!.id;
      res.json({ user: result.user, organizations: result.organizations });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post("/api/auth/signup", async (req, res) => {
    try {
      const data = signupSchema.parse(req.body);
      const result = await authService.signup(data);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      // Set session
      req.session.userId = result.user!.id;
      res.json({ user: result.user, organizations: result.organizations });
    } catch (error) {
      res.status(400).json({ message: "Invalid input" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req, res) => {
    const authReq = req as any;
    res.json({ user: authReq.user, organizations: authReq.organizations || [] });
  });

  app.post("/api/auth/demo", async (req, res) => {
    try {
      const result = await authService.demoLogin();
      
      if (!result.success) {
        return res.status(500).json({ message: result.error });
      }

      req.session.userId = result.user!.id;
      res.json({ user: result.user, organizations: result.organizations });
    } catch (error) {
      res.status(500).json({ message: "Demo login failed" });
    }
  });

  // Dashboard routes
  app.get("/api/dashboard/:orgId", requireAuth, async (req, res) => {
    try {
      const { orgId } = req.params;
      
      // Get key metrics
      const recentReviews = await storage.getReviewsWithSources(orgId, 10);
      const ratingTrends = await storage.getRatingTrends(orgId, 90);
      const aspectScores = await storage.getAspectScores(orgId);
      const insights = await storage.getInsights(orgId);
      
      const totalReviews = await storage.getReviews(orgId);
      const avgRating = totalReviews.length > 0 
        ? totalReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews.length 
        : 0;

      res.json({
        metrics: {
          totalReviews: totalReviews.length,
          averageRating: Math.round(avgRating * 10) / 10,
          responseRate: 87, // Mock for now
          sentimentScore: 0.74, // Mock for now
        },
        recentReviews,
        ratingTrends,
        aspectScores,
        keyAreas: insights.slice(0, 5),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Reviews routes
  app.get("/api/reviews/:orgId", requireAuth, async (req, res) => {
    try {
      const { orgId } = req.params;
      const filters = reviewFiltersSchema.parse(req.query);
      
      // Convert date strings to Date objects
      if (filters.dateFrom) filters.dateFrom = new Date(filters.dateFrom) as any;
      if (filters.dateTo) filters.dateTo = new Date(filters.dateTo) as any;
      
      const reviews = await storage.getReviewsWithSources(orgId, filters.limit || 50);
      
      res.json({ reviews });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/reviews/:orgId/upload", requireAuth, upload.single('file'), async (req, res) => {
    try {
      const { orgId } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const csvData = req.file.buffer.toString();
      const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });
      
      if (parsed.errors.length > 0) {
        return res.status(400).json({ message: "Invalid CSV format" });
      }

      // Get or create CSV source
      const sources = await storage.getReviews(orgId, { limit: 1 });
      let csvSourceId = "csv-source"; // This would be dynamically created
      
      // Transform CSV data to reviews
      const reviews = parsed.data.map((row: any) => ({
        organizationId: orgId,
        sourceId: csvSourceId,
        author: row.author || "Anonymous",
        rating: parseInt(row.rating) || 5,
        text: row.text || row.review || "",
        createdAt: row.date ? new Date(row.date) : new Date(),
      })).filter(r => r.text && r.rating);

      // Bulk insert reviews
      const createdReviews = await storage.bulkCreateReviews(reviews);
      
      // Log usage
      await storage.logUsage(orgId, 'UPLOAD', undefined, { 
        reviewsUploaded: createdReviews.length 
      });
      
      // Queue for AI analysis
      await analyticsService.analyzeReviews(orgId, createdReviews);

      res.json({ 
        message: `Successfully uploaded ${createdReviews.length} reviews`,
        count: createdReviews.length 
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: "Failed to process CSV upload" });
    }
  });

  // Analytics routes
  app.post("/api/insights/:orgId/recompute", requireAuth, async (req, res) => {
    try {
      const { orgId } = req.params;
      
      const reviews = await storage.getReviews(orgId, { limit: 100 });
      const insights = await analyticsService.analyzeReviews(orgId, reviews);
      
      res.json({ insights });
    } catch (error) {
      res.status(500).json({ message: "Failed to recompute insights" });
    }
  });

  app.get("/api/reports/:orgId/weekly", requireAuth, async (req, res) => {
    try {
      const { orgId } = req.params;
      
      const report = await analyticsService.generateWeeklyReport(orgId);
      const pdfBuffer = await pdfService.generatePDF(report);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=weekly-report.pdf');
      res.send(pdfBuffer);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  // Creator marketplace routes
  app.get("/api/creators", requireAuth, async (req, res) => {
    try {
      const filters = creatorFiltersSchema.parse(req.query);
      const creators = await storage.getCreators(filters);
      
      // Calculate brand fit scores (simplified algorithm)
      const creatorsWithScores = creators.map(creator => ({
        ...creator,
        brandFitScore: calculateBrandFitScore(creator),
      }));
      
      res.json({ creators: creatorsWithScores });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch creators" });
    }
  });

  app.get("/api/creators/profile", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const profile = await storage.getCreatorProfile(userId);
      
      res.json({ profile });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch creator profile" });
    }
  });

  app.post("/api/creators/profile", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const profileData = { ...req.body, userId };
      
      const existingProfile = await storage.getCreatorProfile(userId);
      
      if (existingProfile) {
        const updated = await storage.updateCreatorProfile(existingProfile.id, req.body);
        res.json({ profile: updated });
      } else {
        const created = await storage.createCreatorProfile(profileData);
        res.json({ profile: created });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to save creator profile" });
    }
  });

  app.post("/api/shortlist/:orgId/:creatorId", requireAuth, async (req, res) => {
    try {
      const { orgId, creatorId } = req.params;
      await storage.addToShortlist(orgId, creatorId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to shortlist creator" });
    }
  });

  app.delete("/api/shortlist/:orgId/:creatorId", requireAuth, async (req, res) => {
    try {
      const { orgId, creatorId } = req.params;
      await storage.removeFromShortlist(orgId, creatorId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from shortlist" });
    }
  });

  app.get("/api/shortlist/:orgId", requireAuth, async (req, res) => {
    try {
      const { orgId } = req.params;
      const shortlisted = await storage.getShortlistedCreators(orgId);
      res.json({ shortlisted });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shortlisted creators" });
    }
  });

  // Training routes
  app.get("/api/training", requireAuth, async (req, res) => {
    try {
      const { category } = req.query;
      const resources = await storage.getTrainingResources(category as string);
      res.json({ resources });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch training resources" });
    }
  });

  app.get("/api/training/recommended/:orgId", requireAuth, async (req, res) => {
    try {
      const { orgId } = req.params;
      const recommended = await storage.getRecommendedTraining(orgId);
      res.json({ recommended });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recommendations" });
    }
  });

  // Settings routes
  app.get("/api/usage/:orgId", requireAuth, async (req, res) => {
    try {
      const { orgId } = req.params;
      const usage = await storage.getUsageStats(orgId, 30);
      res.json({ usage });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch usage stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to calculate brand fit score
function calculateBrandFitScore(creator: any): number {
  let score = 0;
  
  // Niche overlap (0-60 points)
  const hotelNiches = ["travel", "tourism", "luxury", "lifestyle"];
  const nicheOverlap = creator.niches?.filter((n: string) => 
    hotelNiches.some(hn => n.toLowerCase().includes(hn))
  ).length || 0;
  score += Math.min(nicheOverlap * 15, 60);
  
  // Location proximity (0-30 points) - Caribbean/Jamaica gets higher scores
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
