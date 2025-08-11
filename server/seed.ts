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

/**
 * This seed is ADDITIVE:
 * - No deletes
 * - Uses onConflictDoNothing to avoid duplicates when re-running
 * - Adds a small amount of extra data
 */
async function seed() {
  console.log("Starting ADDITIVE seed...");

  // 1) Ensure demo users exist
  const ownerEmail = "owner@example.com";
  const creatorEmail = "creator@example.com";
  const passwordHash = await bcrypt.hash("demo1234", 10);

  const [owner] = await db
    .insert(users)
    .values({
      name: "Demo Owner",
      email: ownerEmail,
      passwordHash,
      role: "OWNER",
    })
    // UNIQUE(users.email) assumed
    .onConflictDoNothing({ target: users.email })
    .returning();

  const [creatorUser] = await db
    .insert(users)
    .values({
      name: "Demo Creator",
      email: creatorEmail,
      passwordHash,
      role: "CREATOR",
    })
    .onConflictDoNothing({ target: users.email })
    .returning();

  // If they already existed, fetch them (so we have their IDs)
  const [ownerRow] =
    owner ??
    (await db.query.users.findMany({
      where: (u, { eq }) => eq(u.email, ownerEmail),
      limit: 1,
    }));
  const [creatorUserRow] =
    creatorUser ??
    (await db.query.users.findMany({
      where: (u, { eq }) => eq(u.email, creatorEmail),
      limit: 1,
    }));

  console.log("Ensured demo users exist");

  // 2) Ensure organization exists
  const orgSlug = "blue-lagoon-hotel";
  const [org] = await db
    .insert(organizations)
    .values({
      name: "Blue Lagoon Hotel",
      slug: orgSlug,
    })
    // UNIQUE(organizations.slug) assumed
    .onConflictDoNothing({ target: organizations.slug })
    .returning();

  const [orgRow] =
    org ??
    (await db.query.organizations.findMany({
      where: (o, { eq }) => eq(o.slug, orgSlug),
      limit: 1,
    }));

  // 3) Ensure owner is a member
  await db
    .insert(organizationMembers)
    .values({
      organizationId: orgRow.id,
      userId: ownerRow.id,
      role: "OWNER",
    })
    // If you have a unique composite on (organizationId, userId), use it here:
    // .onConflictDoNothing({ target: [organizationMembers.organizationId, organizationMembers.userId] })
    .onConflictDoNothing();

  console.log("Ensured organization & membership exist");

  // 4) Review sources (Google + TripAdvisor)
  const [googleSrc] = await db
    .insert(reviewSources)
    .values({
      organizationId: orgRow.id,
      name: "Google Reviews",
      url: "https://business.google.com",
    })
    // If you have a unique composite like (organizationId, name), use it:
    .onConflictDoNothing()
    .returning();

  const [tripSrc] = await db
    .insert(reviewSources)
    .values({
      organizationId: orgRow.id,
      name: "TripAdvisor",
      url: "https://tripadvisor.com",
    })
    .onConflictDoNothing()
    .returning();

  // Fetch if already existed
  const googleSource =
    googleSrc ??
    (await db.query.reviewSources.findFirst({
      where: (s, { and, eq }) =>
        and(eq(s.organizationId, orgRow.id), eq(s.name, "Google Reviews")),
    }))!;
  const tripAdvisorSource =
    tripSrc ??
    (await db.query.reviewSources.findFirst({
      where: (s, { and, eq }) =>
        and(eq(s.organizationId, orgRow.id), eq(s.name, "TripAdvisor")),
    }))!;

  console.log("Ensured review sources exist");

  // 5) Add a SMALL batch of reviews (skips duplicates by (orgId, sourceId, author, createdAt))
  const extraReviews = [
    {
      organizationId: orgRow.id,
      sourceId: googleSource.id,
      author: "Test Guest A",
      rating: 4,
      text:
        "Lovely beach and friendly staff. Room was comfy, breakfast could improve.",
      createdAt: new Date("2024-04-01"),
    },
    {
      organizationId: orgRow.id,
      sourceId: tripAdvisorSource.id,
      author: "Test Guest B",
      rating: 5,
      text:
        "Excellent stay! Fast check-in and beautiful ocean views. Will return.",
      createdAt: new Date("2024-04-03"),
    },
    {
      organizationId: orgRow.id,
      sourceId: googleSource.id,
      author: "Test Guest C",
      rating: 3,
      text:
        "Great location, but our AC was noisy. Staff handled it the next day.",
      createdAt: new Date("2024-04-05"),
    },
  ];

  // If you have a unique index on (organizationId, sourceId, author, createdAt), target it.
  for (const r of extraReviews) {
    await db.insert(reviews).values(r).onConflictDoNothing();
  }

  console.log("Added a small set of extra reviews (additive)");

  // 6) Creators — ensure one main creator profile, then add 2 tiny extras
  // Main creator (idempotent by userId)
  const [mayaProfile] = await db
    .insert(creatorProfiles)
    .values({
      userId: creatorUserRow.id,
      displayName: "Maya Thompson",
      bio:
        "Caribbean lifestyle & travel content creator; luxury resorts & local experiences.",
      city: "Kingston",
      country: "Jamaica",
      niches: ["travel", "luxury", "lifestyle"],
      instagramUrl: "https://instagram.com/maya_caribbean",
      facebookUrl: "https://facebook.com/maya.thompson",
      tiktokUrl: "https://tiktok.com/@maya_travel",
    })
    // If creatorProfiles.userId is unique, this will upsert safely
    .onConflictDoNothing({ target: creatorProfiles.userId })
    .returning();

  const maya =
    mayaProfile ??
    (await db.query.creatorProfiles.findFirst({
      where: (p, { eq }) => eq(p.userId, creatorUserRow.id),
    }))!;

  // Stats for Maya (idempotent by creatorId)
  await db
    .insert(creatorStats)
    .values({
      creatorId: maya.id,
      followers: 127_000,
      engagementRate: "8.2",
      impressions30d: 2_400_000,
      postFrequencyPerWeek: 5,
    })
    .onConflictDoNothing({ target: creatorStats.creatorId });

  // Two additional creators (very small set)
  const tinyCreators = [
    {
      displayName: "Marcus Johnson",
      bio:
        "Food & culture across the Caribbean. Hospitality & culinary experiences.",
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
      bio:
        "Luxury travel blogger covering high-end resorts & exclusive beach spots.",
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
    // Upsert a creator profile by (displayName, country) as a simple uniqueness heuristic
    const [profile] = await db
      .insert(creatorProfiles)
      .values({
        userId: creatorUserRow.id, // reusing demo creator user
        displayName: c.displayName,
        bio: c.bio,
        city: c.city,
        country: c.country,
        niches: c.niches,
        instagramUrl: c.instagramUrl,
        facebookUrl: c.facebookUrl,
      })
      .onConflictDoNothing()
      .returning();

    // fetch if skipped
    const prof =
      profile ??
      (await db.query.creatorProfiles.findFirst({
        where: (p, { and, eq }) =>
          and(eq(p.displayName, c.displayName), eq(p.country, c.country)),
      }));

    if (prof) {
      await db
        .insert(creatorStats)
        .values({
          creatorId: prof.id,
          followers: c.followers,
          engagementRate: c.engagementRate,
          impressions30d: c.impressions30d,
          postFrequencyPerWeek: c.postFrequencyPerWeek,
        })
        .onConflictDoNothing({ target: creatorStats.creatorId });
    }
  }

  console.log("Added a tiny set of creators (additive)");

  // 7) A couple extra training resources (idempotent by title)
  const extraTraining = [
    {
      category: "Service Excellence",
      title: "Handling Peak-Time Breakfast Rush",
      format: "DOC" as const,
      markdown:
        "# Breakfast Rush Playbook\n\n- Pre-set tables\n- Expedite coffee/tea service\n- Stagger hot-food orders\n- Assign a floating runner",
    },
    {
      category: "Housekeeping",
      title: "Quick-Turn Room Prep (20 min)",
      format: "DOC" as const,
      markdown:
        "# Quick Turnover\n\n- Strip bedding (3m)\n- Bathroom sanitize (7m)\n- Surfaces & floors (6m)\n- Final restock & check (4m)",
    },
  ];

  for (const t of extraTraining) {
    await db.insert(trainingResources).values(t).onConflictDoNothing();
  }

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
