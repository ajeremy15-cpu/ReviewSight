import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRole = pgEnum("user_role", ["OWNER", "CREATOR"]);
export const organizationMemberRole = pgEnum("organization_member_role", ["OWNER", "ADMIN", "MEMBER"]);
export const aspect = pgEnum("aspect", ["CLEANLINESS", "STAFF", "FOOD_QUALITY", "VALUE", "LOCATION", "SPEED"]);
export const sentiment = pgEnum("sentiment", ["NEG", "NEUTRAL", "POS"]);
export const severity = pgEnum("severity", ["LOW", "MEDIUM", "HIGH"]);
export const trainingFormat = pgEnum("training_format", ["DOC", "VIDEO"]);
export const usageEventType = pgEnum("usage_event_type", ["AI_CALL", "UPLOAD"]);

// Core tables
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const organizationMembers = pgTable("organization_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  userId: varchar("user_id").notNull(),
  role: organizationMemberRole("role").notNull(),
});

export const reviewSources = pgTable("review_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  name: text("name").notNull(),
  url: text("url"),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  sourceId: varchar("source_id").notNull(),
  externalId: text("external_id"),
  author: text("author"),
  rating: integer("rating").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  rawJson: jsonb("raw_json"),
});

export const aspectScores = pgTable("aspect_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewId: varchar("review_id").notNull(),
  aspect: aspect("aspect").notNull(),
  sentiment: sentiment("sentiment").notNull(),
  score: decimal("score", { precision: 3, scale: 2 }).notNull(),
});

export const insights = pgTable("insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  aspects: text("aspects").array().notNull(),
  severity: severity("severity").notNull(),
  fromDate: timestamp("from_date").notNull(),
  toDate: timestamp("to_date").notNull(),
  contributingReviewIds: text("contributing_review_ids").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const aiLogs = pgTable("ai_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  route: text("route").notNull(),
  promptHash: text("prompt_hash").notNull(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  tokensIn: integer("tokens_in").notNull(),
  tokensOut: integer("tokens_out").notNull(),
  success: boolean("success").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorProfiles = pgTable("creator_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  displayName: text("display_name").notNull(),
  bio: text("bio").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  niches: text("niches").array().notNull(),
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  tiktokUrl: text("tiktok_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creatorStats = pgTable("creator_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  creatorId: varchar("creator_id").notNull(),
  followers: integer("followers").notNull(),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }).notNull(),
  impressions30d: integer("impressions_30d").notNull(),
  postFrequencyPerWeek: integer("post_frequency_per_week").notNull(),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const shortlists = pgTable("shortlists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  creatorId: varchar("creator_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const trainingResources = pgTable("training_resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(),
  title: text("title").notNull(),
  format: trainingFormat("format").notNull(),
  url: text("url"),
  markdown: text("markdown"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const usageEvents = pgTable("usage_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  organizationId: varchar("organization_id").notNull(),
  type: usageEventType("type").notNull(),
  tokens: integer("tokens"),
  metaJson: jsonb("meta_json"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  organizationMembers: many(organizationMembers),
  creatorProfile: one(creatorProfiles, {
    fields: [users.id],
    references: [creatorProfiles.userId],
  }),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(organizationMembers),
  reviewSources: many(reviewSources),
  reviews: many(reviews),
  insights: many(insights),
  aiLogs: many(aiLogs),
  shortlists: many(shortlists),
  usageEvents: many(usageEvents),
}));

export const organizationMembersRelations = relations(organizationMembers, ({ one }) => ({
  organization: one(organizations, {
    fields: [organizationMembers.organizationId],
    references: [organizations.id],
  }),
  user: one(users, {
    fields: [organizationMembers.userId],
    references: [users.id],
  }),
}));

export const reviewSourcesRelations = relations(reviewSources, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [reviewSources.organizationId],
    references: [organizations.id],
  }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [reviews.organizationId],
    references: [organizations.id],
  }),
  source: one(reviewSources, {
    fields: [reviews.sourceId],
    references: [reviewSources.id],
  }),
  aspectScores: many(aspectScores),
}));

export const aspectScoresRelations = relations(aspectScores, ({ one }) => ({
  review: one(reviews, {
    fields: [aspectScores.reviewId],
    references: [reviews.id],
  }),
}));

export const insightsRelations = relations(insights, ({ one }) => ({
  organization: one(organizations, {
    fields: [insights.organizationId],
    references: [organizations.id],
  }),
}));

export const aiLogsRelations = relations(aiLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [aiLogs.organizationId],
    references: [organizations.id],
  }),
}));

export const creatorProfilesRelations = relations(creatorProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [creatorProfiles.userId],
    references: [users.id],
  }),
  stats: one(creatorStats, {
    fields: [creatorProfiles.id],
    references: [creatorStats.creatorId],
  }),
  shortlists: many(shortlists),
}));

export const creatorStatsRelations = relations(creatorStats, ({ one }) => ({
  creator: one(creatorProfiles, {
    fields: [creatorStats.creatorId],
    references: [creatorProfiles.id],
  }),
}));

export const shortlistsRelations = relations(shortlists, ({ one }) => ({
  organization: one(organizations, {
    fields: [shortlists.organizationId],
    references: [organizations.id],
  }),
  creator: one(creatorProfiles, {
    fields: [shortlists.creatorId],
    references: [creatorProfiles.id],
  }),
}));

export const usageEventsRelations = relations(usageEvents, ({ one }) => ({
  organization: one(organizations, {
    fields: [usageEvents.organizationId],
    references: [organizations.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertCreatorProfileSchema = createInsertSchema(creatorProfiles).omit({
  id: true,
  createdAt: true,
});

export const insertInsightSchema = createInsertSchema(insights).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type CreatorProfile = typeof creatorProfiles.$inferSelect;
export type InsertCreatorProfile = z.infer<typeof insertCreatorProfileSchema>;
export type Insight = typeof insights.$inferSelect;
export type InsertInsight = z.infer<typeof insertInsightSchema>;
export type AspectScore = typeof aspectScores.$inferSelect;
export type TrainingResource = typeof trainingResources.$inferSelect;
