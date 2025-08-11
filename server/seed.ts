// server/seed.ts
import { db } from "./db";
import {
  users, organizations, organizationMembers, reviewSources, reviews,
  creatorProfiles, creatorStats, trainingResources
} from "@shared/schema";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

// helper to shift days from now
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

async function ensureUser(name: string, email: string, role: "OWNER" | "CREATOR", pwd = "demo1234") {
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length) return existing[0];
  const passwordHash = await bcrypt.hash(pwd, 10);
  const [u] = await db.insert(users).values({ name, email, passwordHash, role }).returning();
  return u;
}

async function ensureOrg(name: string, slug: string, ownerId: string) {
  const existing = await db.select().from(organizations).where(eq(organizations.slug, slug));
  const org = existing.length
    ? existing[0]
    : (await db.insert(organizations).values({ name, slug }).returning())[0];

  // ensure membership
  const mem = await db.select().from(organizationMembers)
    .where(eq(organizationMembers.organizationId, org.id));
  if (!mem.find(m => m.userId === ownerId)) {
    await db.insert(organizationMembers).values({ organizationId: org.id, userId: ownerId, role: "OWNER" });
  }
  return org;
}

async function ensureSource(orgId: string, name: string, url: string) {
  const existing = await db.select().from(reviewSources).where(eq(reviewSources.name, name));
  return existing.length
    ? existing[0]
    : (await db.insert(reviewSources).values({ organizationId: orgId, name, url }).returning())[0];
}

async function seed() {
  console.log("Starting ADDITIVE seed...");

  // 1) Users/org
  const owner = await ensureUser("Demo Owner", "owner@example.com", "OWNER");
  const creator = await ensureUser("Demo Creator", "creator@example.com", "CREATOR");
  console.log("Ensured demo users exist");

  const org = await ensureOrg("Blue Lagoon Hotel", "blue-lagoon-hotel", owner.id);
  console.log("Ensured organization & membership exist");

  // 2) Sources
  const google = await ensureSource(org.id, "Google Reviews", "https://business.google.com");
  const trip = await ensureSource(org.id, "TripAdvisor", "https://tripadvisor.com");
  console.log("Ensured review sources exist");

  // 3) Recent reviews (last 7–60 days)
  const recentReviews = [
    {
      organizationId: org.id,
      sourceId: google.id,
      author: "Sarah Mitchell",
      rating: 4,
      text:
        "Great beachfront views and friendly staff. Room cleaning could be more thorough.",
      createdAt: daysAgo(12),
    },
    {
      organizationId: org.id,
      sourceId: trip.id,
      author: "Michael Rodriguez",
      rating: 5,
      text:
        "Fantastic experience! Food quality outstanding. Staff went above and beyond.",
      createdAt: daysAgo(26),
    },
    {
      organizationId: org.id,
      sourceId: google.id,
      author: "Jennifer Chen",
      rating: 3,
      text:
        "First room had cleanliness issues, but staff quickly moved us. Excellent location.",
      createdAt: daysAgo(41),
    },
    {
      organizationId: org.id,
      sourceId: trip.id,
      author: "David Thompson",
      rating: 2,
      text:
        "Service was very slow at breakfast and dinner. Food decent but long waits.",
      createdAt: daysAgo(7),
    },
    {
      organizationId: org.id,
      sourceId: google.id,
      author: "Lisa Johnson",
      rating: 5,
      text:
        "Perfect honeymoon destination—spotless room, breathtaking ocean view, amazing staff.",
      createdAt: daysAgo(18),
    },
    {
      organizationId: org.id,
      sourceId: trip.id,
      author: "Robert Wilson",
      rating: 4,
      text:
        "Great value right on the beach. Food good, staff friendly and accommodating.",
      createdAt: daysAgo(55),
    },
    {
      organizationId: org.id,
      sourceId: google.id,
      author: "Amanda Davis",
      rating: 3,
      text:
        "Beautiful location but some maintenance issues (AC, faucet). Slow response.",
      createdAt: daysAgo(33),
    },
    {
      organizationId: org.id,
      sourceId: trip.id,
      author: "James Brown",
      rating: 5,
      text:
        "Outstanding hospitality and exceptional restaurant—fresh and beautifully presented.",
      createdAt: daysAgo(21),
    },
  ];

  // Insert only if we don't already have recent ones (to keep additive)
  const existingCount = await db.select({}).from(reviews);
  if (existingCount.length < 8) {
    await db.insert(reviews).values(recentReviews);
    console.log("Added a small set of extra reviews (additive, recent dates)");
  } else {
    console.log("Reviews already exist; skipping insert to avoid duplicates");
  }

  // 4) Creators + stats (idempotent by displayName)
  const getCreatorByName = async (displayName: string) => {
    const rows = await db.select().from(creatorProfiles).where(eq(creatorProfiles.displayName, displayName));
    return rows[0];
  };

  const creatorsToEnsure = [
    {
      userId: creator.id,
      displayName: "Maya Thompson",
      bio:
        "Caribbean lifestyle and travel creator focusing on luxury resorts and authentic experiences.",
      city: "Kingston",
      country: "Jamaica",
      niches: ["travel", "luxury", "lifestyle"],
      instagramUrl: "https://instagram.com/maya_caribbean",
      facebookUrl: "https://facebook.com/maya.thompson",
      tiktokUrl: "https://tiktok.com/@maya_travel",
      followers: 127000,
      engagementRate: "8.2",
      impressions30d: 2400000,
      postFrequencyPerWeek: 5,
    },
    {
      userId: creator.id,
      displayName: "Marcus Johnson",
      bio:
        "Food & culture enthusiast showcasing Caribbean cuisine and hospitality.",
      city: "Montego Bay",
      country: "Jamaica",
      niches: ["food", "culture", "tourism"],
      instagramUrl: "https://instagram.com/marcus_caribbean_food",
      facebookUrl: "https://facebook.com/marcus.johnson",
      followers: 98000,
      engagementRate: "6.1",
      impressions30d: 1200000,
      postFrequencyPerWeek: 4,
    },
    {
      userId: creator.id,
      displayName: "Sophia Williams",
      bio:
        "Luxury travel blogger covering high‑end Caribbean resorts.",
      city: "Bridgetown",
      country: "Barbados",
      niches: ["luxury", "travel", "lifestyle"],
      instagramUrl: "https://instagram.com/sophia_luxury_travel",
      facebookUrl: "https://facebook.com/sophia.williams",
      followers: 152000,
      engagementRate: "5.4",
      impressions30d: 1800000,
      postFrequencyPerWeek: 3,
    },
  ];

  for (const c of creatorsToEnsure) {
    let profile = await getCreatorByName(c.displayName);
    if (!profile) {
      [profile] = await db.insert(creatorProfiles).values({
        userId: c.userId,
        displayName: c.displayName,
        bio: c.bio,
        city: c.city,
        country: c.country,
        niches: c.niches,
        instagramUrl: c.instagramUrl,
        facebookUrl: c.facebookUrl,
        tiktokUrl: c.tiktokUrl,
      }).returning();

      await db.insert(creatorStats).values({
        creatorId: profile.id,
        followers: c.followers,
        engagementRate: c.engagementRate,
        impressions30d: c.impressions30d,
        postFrequencyPerWeek: c.postFrequencyPerWeek,
      });
    }
  }
  console.log("Ensured creators & stats exist");

  // 5) Training (idempotent by title)
  const existingTraining = await db.select().from(trainingResources);
  if (existingTraining.length === 0) {
    await db.insert(trainingResources).values([
      {
        category: "Service Excellence",
        title: "Effective Complaint Resolution",
        format: "VIDEO",
        url: "https://youtu.be/dQw4w9WgXcQ",
      },
      {
        category: "Service Excellence",
        title: "Customer Service Standards Checklist",
        format: "DOC",
        markdown:
          "# Customer Service Standards\n\n- Greet guests warmly\n- Listen actively\n- Follow up promptly",
      },
    ]);
    console.log("Added training resources");
  }

  console.log("Additive seed complete.");
}

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
