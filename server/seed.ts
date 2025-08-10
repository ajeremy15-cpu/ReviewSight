import { db } from "./db";
import { 
  users, organizations, organizationMembers, reviewSources, reviews,
  creatorProfiles, creatorStats, trainingResources
} from "@shared/schema";
import bcrypt from "bcrypt";

async function seed() {
  console.log("Starting database seed...");

  try {
    // Clear existing data (in reverse order of dependencies)
    await db.delete(creatorStats);
    await db.delete(creatorProfiles);
    await db.delete(reviews);
    await db.delete(reviewSources);
    await db.delete(organizationMembers);
    await db.delete(organizations);
    await db.delete(users);
    await db.delete(trainingResources);

    console.log("Cleared existing data");

    // Create demo users
    const ownerPasswordHash = await bcrypt.hash('demo1234', 10);
    const creatorPasswordHash = await bcrypt.hash('demo1234', 10);

    const [demoOwner] = await db.insert(users).values({
      name: 'Demo Owner',
      email: 'owner@example.com',
      passwordHash: ownerPasswordHash,
      role: 'OWNER',
    }).returning();

    const [demoCreator] = await db.insert(users).values({
      name: 'Demo Creator',
      email: 'creator@example.com',
      passwordHash: creatorPasswordHash,
      role: 'CREATOR',
    }).returning();

    console.log("Created demo users");

    // Create demo organization
    const [blueLogoonHotel] = await db.insert(organizations).values({
      name: 'Blue Lagoon Hotel',
      slug: 'blue-lagoon-hotel',
    }).returning();

    // Add owner to organization
    await db.insert(organizationMembers).values({
      organizationId: blueLogoonHotel.id,
      userId: demoOwner.id,
      role: 'OWNER',
    });

    console.log("Created demo organization");

    // Create review sources
    const [googleSource] = await db.insert(reviewSources).values({
      organizationId: blueLogoonHotel.id,
      name: 'Google Reviews',
      url: 'https://business.google.com',
    }).returning();

    const [tripAdvisorSource] = await db.insert(reviewSources).values({
      organizationId: blueLogoonHotel.id,
      name: 'TripAdvisor',
      url: 'https://tripadvisor.com',
    }).returning();

    console.log("Created review sources");

    // Create sample reviews
    const sampleReviews = [
      {
        organizationId: blueLogoonHotel.id,
        sourceId: googleSource.id,
        author: 'Sarah Mitchell',
        rating: 4,
        text: 'Great location with beautiful beachfront views. The staff was very friendly and helpful throughout our stay. However, the room cleaning could have been more thorough - found some dust on the furniture.',
        createdAt: new Date('2024-03-15'),
      },
      {
        organizationId: blueLogoonHotel.id,
        sourceId: tripAdvisorSource.id,
        author: 'Michael Rodriguez',
        rating: 5,
        text: 'Absolutely fantastic experience! The food quality was outstanding, especially the seafood dishes. Staff went above and beyond to make our stay memorable. Excellent value for money considering the beachfront location.',
        createdAt: new Date('2024-03-12'),
      },
      {
        organizationId: blueLogoonHotel.id,
        sourceId: googleSource.id,
        author: 'Jennifer Chen',
        rating: 3,
        text: 'The hotel room was quite dirty when we arrived. Housekeeping clearly didn\'t do a thorough job. However, the staff was very apologetic and quickly moved us to a cleaner room. The location is excellent for beach access.',
        createdAt: new Date('2024-03-10'),
      },
      {
        organizationId: blueLogoonHotel.id,
        sourceId: tripAdvisorSource.id,
        author: 'David Thompson',
        rating: 2,
        text: 'Service was extremely slow during breakfast and dinner. We waited over 45 minutes just to place our order. The food was decent when it finally arrived, but the long wait times really affected our experience.',
        createdAt: new Date('2024-03-08'),
      },
      {
        organizationId: blueLogoonHotel.id,
        sourceId: googleSource.id,
        author: 'Lisa Johnson',
        rating: 5,
        text: 'Perfect honeymoon destination! The staff made us feel so special with thoughtful touches and excellent service. Room was spotless and the oceanview was breathtaking. Will definitely return!',
        createdAt: new Date('2024-03-05'),
      },
      {
        organizationId: blueLogoonHotel.id,
        sourceId: tripAdvisorSource.id,
        author: 'Robert Wilson',
        rating: 4,
        text: 'Great value for a beachfront hotel. The location can\'t be beat - right on the beach with easy access to water activities. Food was good but not exceptional. Staff was friendly and accommodating.',
        createdAt: new Date('2024-03-03'),
      },
      {
        organizationId: blueLogoonHotel.id,
        sourceId: googleSource.id,
        author: 'Amanda Davis',
        rating: 3,
        text: 'Mixed experience. Beautiful location and the staff tried their best, but there were several maintenance issues in our room - broken AC, leaky faucet. When reported, maintenance was slow to respond.',
        createdAt: new Date('2024-03-01'),
      },
      {
        organizationId: blueLogoonHotel.id,
        sourceId: tripAdvisorSource.id,
        author: 'James Brown',
        rating: 5,
        text: 'Outstanding hospitality! Every staff member we encountered was professional, friendly, and genuinely caring. The food at the restaurant was exceptional - fresh, flavorful, and beautifully presented. Highly recommended!',
        createdAt: new Date('2024-02-28'),
      },
    ];

    await db.insert(reviews).values(sampleReviews);

    console.log("Created sample reviews");

    // Create demo creator profile
    const [creatorProfile] = await db.insert(creatorProfiles).values({
      userId: demoCreator.id,
      displayName: 'Maya Thompson',
      bio: 'Caribbean lifestyle and travel content creator specializing in luxury resorts and authentic local experiences.',
      city: 'Kingston',
      country: 'Jamaica',
      niches: ['travel', 'luxury', 'lifestyle'],
      instagramUrl: 'https://instagram.com/maya_caribbean',
      facebookUrl: 'https://facebook.com/maya.thompson',
      tiktokUrl: 'https://tiktok.com/@maya_travel',
    }).returning();

    await db.insert(creatorStats).values({
      creatorId: creatorProfile.id,
      followers: 127000,
      engagementRate: "8.2",
      impressions30d: 2400000,
      postFrequencyPerWeek: 5,
    });

    // Create additional creators
    const additionalCreators = [
      {
        userId: demoCreator.id, // Reusing for simplicity
        displayName: 'Marcus Johnson',
        bio: 'Food and culture enthusiast showcasing Caribbean cuisine and hospitality experiences across the islands.',
        city: 'Montego Bay',
        country: 'Jamaica',
        niches: ['food', 'culture', 'tourism'],
        instagramUrl: 'https://instagram.com/marcus_caribbean_food',
        facebookUrl: 'https://facebook.com/marcus.johnson',
      },
      {
        userId: demoCreator.id,
        displayName: 'Sophia Williams',
        bio: 'Luxury travel blogger focusing on high-end Caribbean resorts and exclusive beach destinations.',
        city: 'Bridgetown',
        country: 'Barbados',
        niches: ['luxury', 'travel', 'lifestyle'],
        instagramUrl: 'https://instagram.com/sophia_luxury_travel',
        facebookUrl: 'https://facebook.com/sophia.williams',
      },
    ];

    for (const creator of additionalCreators) {
      const [profile] = await db.insert(creatorProfiles).values(creator).returning();
      
      await db.insert(creatorStats).values({
        creatorId: profile.id,
        followers: Math.floor(Math.random() * 100000) + 50000,
        engagementRate: (Math.round((Math.random() * 5 + 4) * 100) / 100).toString(),
        impressions30d: Math.floor(Math.random() * 1000000) + 500000,
        postFrequencyPerWeek: Math.floor(Math.random() * 5) + 3,
      });
    }

    console.log("Created demo creators");

    // Create training resources
    const trainingData = [
      {
        category: 'Service Excellence',
        title: 'Effective Complaint Resolution',
        format: 'VIDEO' as const,
        url: 'https://youtube.com/watch?v=example1',
      },
      {
        category: 'Service Excellence',
        title: 'Customer Service Standards Checklist',
        format: 'DOC' as const,
        markdown: '# Customer Service Standards\n\n## Key Principles\n- Always greet guests warmly\n- Listen actively to concerns\n- Follow up on requests\n\n## Response Times\n- Phone calls: Answer within 3 rings\n- Emails: Respond within 24 hours\n- Complaints: Address within 1 hour',
      },
      {
        category: 'Service Excellence',
        title: 'Building Customer Loyalty',
        format: 'VIDEO' as const,
        url: 'https://vimeo.com/example2',
      },
      {
        category: 'Housekeeping',
        title: 'Room Cleaning Standards Manual',
        format: 'DOC' as const,
        markdown: '# Housekeeping Standards\n\n## Daily Cleaning Checklist\n- [ ] Change bed linens\n- [ ] Clean and sanitize bathroom\n- [ ] Vacuum carpets and mop floors\n- [ ] Dust all surfaces\n- [ ] Restock amenities\n\n## Quality Control\n- Supervisory inspection required\n- Guest satisfaction priority',
      },
      {
        category: 'Housekeeping',
        title: 'Deep Cleaning Procedures',
        format: 'VIDEO' as const,
        url: 'https://youtube.com/watch?v=example3',
      },
      {
        category: 'Food & Beverage',
        title: 'Food Safety Guidelines',
        format: 'DOC' as const,
        markdown: '# Food Safety Protocol\n\n## Temperature Control\n- Cold foods: Below 41°F (5°C)\n- Hot foods: Above 140°F (60°C)\n\n## Hygiene Standards\n- Wash hands frequently\n- Use gloves when handling food\n- Clean utensils between uses\n\n## Storage Guidelines\n- First In, First Out (FIFO) rotation\n- Proper labeling with dates\n- Separate raw and cooked foods',
      },
      {
        category: 'Front Desk',
        title: 'Check-in Process Excellence',
        format: 'VIDEO' as const,
        url: 'https://youtube.com/watch?v=example4',
      },
      {
        category: 'Front Desk',
        title: 'Guest Communication Scripts',
        format: 'DOC' as const,
        markdown: '# Guest Communication Scripts\n\n## Check-in Greeting\n"Good [morning/afternoon/evening]! Welcome to Blue Lagoon Hotel. How may I assist you today?"\n\n## Handling Complaints\n1. Listen actively\n2. Acknowledge the concern\n3. Apologize sincerely\n4. Take action to resolve\n5. Follow up\n\n## Upselling Techniques\n- Room upgrades\n- Restaurant reservations\n- Spa services\n- Activity bookings',
      },
      {
        category: 'Social Media',
        title: 'Responding to Online Reviews',
        format: 'VIDEO' as const,
        url: 'https://vimeo.com/example5',
      },
      {
        category: 'Social Media',
        title: 'Social Media Crisis Management',
        format: 'DOC' as const,
        markdown: '# Social Media Crisis Management\n\n## Response Timeline\n- Negative review: Respond within 4 hours\n- Viral complaint: Respond within 1 hour\n- General inquiry: Respond within 24 hours\n\n## Response Guidelines\n1. Stay professional and courteous\n2. Take responsibility when appropriate\n3. Offer to resolve privately\n4. Follow up publicly when resolved\n\n## Escalation Process\n- Manager approval for sensitive issues\n- Legal review for potential disputes',
      },
    ];

    await db.insert(trainingResources).values(trainingData);

    console.log("Created training resources");

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Seed failed:", error);
    throw error;
  }
}

// Run seed if called directly
seed().then(() => {
  console.log("Seed completed");
  process.exit(0);
}).catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});

export default seed;
