import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Initialize a new Orbo instance with default activities and skills
export const initialize = mutation({
  args: {
    name: v.string(),
    primaryObjective: v.string(),
    secondaryObjectives: v.optional(v.array(v.string())),
    personality: v.optional(
      v.object({
        friendliness: v.float64(),
        creativity: v.float64(),
        curiosity: v.float64(),
        enthusiasm: v.float64(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Check if already initialized
    const existingBeing = await ctx.db.query("beingState").first();
    if (existingBeing) {
      throw new Error("Orbo already initialized. Use reset first if you want to start over.");
    }

    // Create the being
    const beingId = await ctx.db.insert("beingState", {
      name: args.name,
      mood: "curious",
      energy: 1.0,
      personality: args.personality ?? {
        friendliness: 0.7,
        creativity: 0.8,
        curiosity: 0.9,
        enthusiasm: 0.75,
      },
      objectives: {
        primary: args.primaryObjective,
        secondary: args.secondaryObjectives,
      },
      paused: true, // Start paused until user is ready
      lastActivityAt: undefined,
    });

    // Create default skills
    const defaultSkills = [
      { name: "chat", requiredApiKeys: ["GOOGLE_GENERATIVE_AI_API_KEY"] },
      { name: "image_generation", requiredApiKeys: ["GOOGLE_GENERATIVE_AI_API_KEY"] },
      { name: "web_scraping", requiredApiKeys: [] },
    ];

    for (const skill of defaultSkills) {
      await ctx.db.insert("skills", {
        name: skill.name,
        enabled: skill.name === "chat", // Enable chat by default
        requiredApiKeys: skill.requiredApiKeys,
        configuredAt: skill.name === "chat" ? Date.now() : undefined,
      });
    }

    // Create default activities
    const defaultActivities = [
      {
        name: "daily_thought",
        description: "Generate a reflective thought about the day or objectives",
        energyCost: 0.1,
        cooldownMs: 4 * 60 * 60 * 1000, // 4 hours
        requiredSkills: ["chat"],
      },
      {
        name: "analyze_day",
        description: "Analyze recent activities and progress toward objectives",
        energyCost: 0.15,
        cooldownMs: 24 * 60 * 60 * 1000, // 24 hours
        requiredSkills: ["chat"],
      },
      {
        name: "rest",
        description: "Take a break and recover energy",
        energyCost: -0.2, // Negative = energy gain
        cooldownMs: 30 * 60 * 1000, // 30 minutes
        requiredSkills: [],
      },
      {
        name: "generate_image",
        description: "Create an image based on current mood or thoughts",
        energyCost: 0.3,
        cooldownMs: 2 * 60 * 60 * 1000, // 2 hours
        requiredSkills: ["chat", "image_generation"],
      },
      {
        name: "research_topic",
        description: "Research a topic related to objectives using web scraping",
        energyCost: 0.35,
        cooldownMs: 3 * 60 * 60 * 1000, // 3 hours
        requiredSkills: ["chat", "web_scraping"],
      },
    ];

    for (const activity of defaultActivities) {
      await ctx.db.insert("activities", {
        name: activity.name,
        description: activity.description,
        energyCost: activity.energyCost,
        cooldownMs: activity.cooldownMs,
        enabled: true,
        requiredSkills: activity.requiredSkills,
        lastExecutedAt: undefined,
        executionCount: 0,
      });
    }

    // Create initial memory
    await ctx.db.insert("shortTermMemory", {
      content: `${args.name} was born with the objective: "${args.primaryObjective}"`,
      type: "observation",
      metadata: { event: "initialization" },
      createdAt: Date.now(),
      importance: 1.0,
    });

    return {
      beingId,
      skillsCreated: defaultSkills.length,
      activitiesCreated: defaultActivities.length,
    };
  },
});

// Reset everything (for development)
export const reset = mutation({
  handler: async (ctx) => {
    // Delete all data from tables
    const tables = [
      "beingState",
      "activities",
      "activityHistory",
      "shortTermMemory",
      "skills",
    ] as const;

    let deletedCount = 0;

    for (const table of tables) {
      const docs = await ctx.db.query(table).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
        deletedCount++;
      }
    }

    // Clean up generated images and their storage
    const images = await ctx.db.query("generatedImages").collect();
    for (const image of images) {
      await ctx.storage.delete(image.storageId);
      await ctx.db.delete(image._id);
      deletedCount++;
    }

    return { deletedCount };
  },
});
