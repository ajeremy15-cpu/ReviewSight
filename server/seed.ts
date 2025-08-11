import { db } from "./db";
import {
  users,
  organizations,
  organizationMembers,
  reviewSources,
  reviews,
  creatorProfiles,
  creatorStats,
  trainingResources,
} from "@shared/schema";
import bcrypt from "bcrypt";

async function ensureUser(email: string, data: Omit<typeof users.$inferInsert, "email">) {
  const existing = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, email),
  });
  if (existing) return existing;
  const [row] = await db.insert(users).values({ email, ...data }).returning();
  return row;
}

async function ensureOrganization(slug: string, name: string) {
  const existing = await db.query.organizations.findFirst({
    where: (o, { eq }) => eq(o.slug, slug),
  });
  if (existing) return existing;
  const [row] = await db.insert(organizations).values({ slug, name }).returning();
  return row;
}

async function ensureOrgMember(organizationId: string, userId: string, role: "OWNER" | "CREATOR") {
  const existing = await db.query.organizationMembers.findFirst({
    where: (m, { and, eq }) => and(eq(m.organizationId, organizationId), eq(m.userId, userId)),
  });
  if (existing) return existing;
  const [row] = await db.insert(organizationMembers).values({ organizationId, userId, role }).returning();
  return row;
}

async function ensureReviewSource(organizationId: string, name: string, url: string) {
  const existing = await db.query.reviewSources.findFirst({
    where: (s, { and, eq }) => and(eq(s.organizationId, organizationId), eq(s.name, name)),
  });
  if (existing) return existing;
  const [row] = await db.insert(reviewSources).values({ organizationId, name, url }).returning();
  return row;
}

async function ensureReview(r: typeof reviews.$inferInsert) {
  // crude idempotency: author + createdAt + source + org
  const existing = await db.query.reviews.findFirst({
    where: (rv, { and, eq }) =>
      and(
        eq(rv.organizationId, r.organizationId),
        eq(rv.sourceId, r.sourceId),
        eq(rv.author, r.author),
        eq(rv.createdAt, r.createdAt as Date)
      ),
  });
  if (existing) return existing;
  const [row] = await db.insert(reviews).values(r).returning();
  return row;
}

async function ensureCreatorProfile(match: { displayName: string; country: string }, data: Omit<typeof creatorProfiles.$inferInsert, "id">) {
  const existing = await db.query.creatorProfiles.findFirst({
    where: (p, { and, eq }) => and(eq(p.displayName, match.displayName), eq(p.country, match.country)),
  });
  if (existing) return existing;
  const [row] = await db.insert(creatorProfiles).values(data).returning();
  return row;
}

async function ensureCreatorStats(creatorId: string, data: Omit<typeof creatorStats.$inferInsert, "id" | "creatorId">) {
  const existing = await db.query.creatorStats.findFirst({
    where: (s, { eq }) => eq(s.creatorId, creatorId),
  });
  if (existing) return existing;
  const [row] = await db.insert(creatorStats).values({ creatorId, ...data }).returning();
  return row;
}

async function ensureTraining(title: string, data: Omit<typeof trainingResources.$inferInsert, "id" | "title">) {
  const existing = await db.query.trainingResources.findFirst({
    where: (t, { eq }) => eq(t.title, title),
  });
  if (existing) return existing;
  const [row] = await db.insert(trainingResources).values({ title, ...data }).returning();
  return row;
}

/**
 * ADDITIVE seed: does not delete anything and does not rely on ON CONFLICT targets.
 * Safe to re-run; it checks for existence before inserting.
 */
async function seed() {
  console.log("Starting ADDITIVE seed (no ON CONFLICT targets)...");

  // Users
  const passwordHash = await bcrypt.hash("demo1234", 10);
  const owner = await ensureUser("owner@example.com", {
    name: "Demo Owner",
    passwordHash,
    role: "OWNER",
  });
  const creatorUser = await ensureUser("creator@example.com", {
    name: "Demo Creator",
    passwordHash,
    role: "CREATOR",
  });
  console.log("Ensured demo users exist");

  // Organization + membership
  const org = await ensureOrganization("blue-lagoon-hotel", "Blue Lagoon Hotel");
  await ensureOrgMember(org.id, owner.id, "OWNER");
  console.log("Ensured organization & membership exist");

  // Review sources
  const googleSource = await ensureReviewSource(org.id, "Google Reviews", "https://business.google.com");
  const tripSource = await ensureReviewSource(org.id, "TripAdvisor", "https://tripadvisor.com");
  console.log("Ensured review sources exist");

  // Small batch of reviews
  const extraReviews = [
    {
      organizationId: org.id,
      sourceId: googleSource.id,
      author: "Test Guest A",
      rating: 4,
      text: "Lovely beach and friendly staff. Room was comfy, breakfast could improve.",
      createdAt: new Date("2024-04-01"),
    },
    {
      organizationId: org.id,
      sourceId: tripSource.id,
      author: "Test Guest B",
      rating: 5,
      text: "Excellent stay! Fast check-in and beautiful ocean views. Will return.",
      createdAt: new Date("2024-04-03"),
    },
    {
      organizationId: org.id,
      sourceId: googleSource.id,
      author: "Test Guest C",
      rating: 3,
      text: "Great location, but our AC was noisy. Staff handled it the next day.",
      createdAt: new Date("2024-04-05"),
    },
  ] satisfies Array<typeof reviews.$inferInsert>;

  for (const r of extraReviews) await ensureReview(r);
  console.log("Added a small set of extra reviews (additive)");

  // Creators
  const maya = await ensureCreatorProfile(
    { displayName: "Maya Thompson", country: "Jamaica" },
    {
      userId: creatorUser.id,
      displayName: "Maya Thompson",
      bio: "Caribbean lifestyle & travel content creator; luxury resorts & local experiences.",
      city: "Kingston",
      country: "Jamaica",
      niches: ["travel", "luxury", "lifestyle"],
      instagramUrl: "https://instagram.com/maya_caribbean",
      facebookUrl: "https://facebook.com/maya.thompson",
      tiktokUrl: "https://tiktok.com/@maya_travel",
    }
  );
  await ensureCreatorStats(maya.id, {
    followers: 127_000,
    engagementRate: "8.2",
    impressions30d: 2_400_000,
    postFrequencyPerWeek: 5,
  });

  const tinyCreators = [
    {
      displayName: "Marcus Johnson",
      bio: "Food & culture across the Caribbean. Hospitality & culinary experiences.",
      city: "Montego Bay",
      country: "Jamaica",
      niches: ["food", "culture", "tourism"],
      instagramUrl: "https://instagram.com/marcus_caribbean_food",
      facebookUrl: "https://facebook.com/marcus.johnson",
      followers: 84_200,
      engagementRate: "5.3",
      impressions30d: 920_000,
      postFrequencyPerWeek: 3,
    },
    {
      displayName: "Sophia Williams",
      bio: "Luxury travel blogger covering high-end resorts & exclusive beach spots.",
      city: "Bridgetown",
      country: "Barbados",
      niches: ["luxury", "travel", "lifestyle"],
      instagramUrl: "https://instagram.com/sophia_luxury_travel",
      facebookUrl: "https://facebook.com/sophia.williams",
      followers: 101_400,
      engagementRate: "6.1",
      impressions30d: 1_150_000,
      postFrequencyPerWeek: 4,
    },
  ];

  for (const c of tinyCreators) {
    const profile = await ensureCreatorProfile(
      { displayName: c.displayName, country: c.country },
      {
        userId: creatorUser.id, // reuse demo creator
        displayName: c.displayName,
        bio: c.bio,
        city: c.city,
        country: c.country,
        niches: c.niches,
        instagramUrl: c.instagramUrl,
        facebookUrl: c.facebookUrl,
      }
    );
    await ensureCreatorStats(profile.id, {
      followers: c.followers,
      engagementRate: c.engagementRate,
      impressions30d: c.impressions30d,
      postFrequencyPerWeek: c.postFrequencyPerWeek,
    });
  }
  console.log("Added a tiny set of creators (additive)");

  // Training
  await ensureTraining("Handling Peak-Time Breakfast Rush", {
    category: "Service Excellence",
    format: "DOC",
    markdown:
      "# Breakfast Rush Playbook\n\n- Pre-set tables\n- Expedite coffee/tea service\n- Stagger hot-food orders\n- Assign a floating runner",
  });

  await ensureTraining("Quick-Turn Room Prep (20 min)", {
    category: "Housekeeping",
    format: "DOC",
    markdown:
      "# Quick Turnover\n\n- Strip bedding (3m)\n- Bathroom sanitize (7m)\n- Surfaces & floors (6m)\n- Final restock & check (4m)",
  });

  console.log("Additive seed complete!");
}

// Run seed if called directly
seed()
  .then(() => {
    console.log("Seed completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });

export default seed;
