import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Register a skill
export const register = mutation({
  args: {
    name: v.string(),
    requiredApiKeys: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("skills")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        requiredApiKeys: args.requiredApiKeys,
      });
      return existing._id;
    }

    return await ctx.db.insert("skills", {
      name: args.name,
      enabled: false,
      requiredApiKeys: args.requiredApiKeys,
      configuredAt: undefined,
    });
  },
});

// Enable a skill
export const enable = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const skill = await ctx.db
      .query("skills")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (!skill) throw new Error(`Skill not found: ${args.name}`);

    await ctx.db.patch(skill._id, {
      enabled: true,
      configuredAt: Date.now(),
    });

    return true;
  },
});

// Disable a skill
export const disable = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const skill = await ctx.db
      .query("skills")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (!skill) throw new Error(`Skill not found: ${args.name}`);

    await ctx.db.patch(skill._id, { enabled: false });
    return true;
  },
});

// List all skills
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("skills").collect();
  },
});

// Get enabled skills
export const getEnabled = query({
  handler: async (ctx) => {
    const skills = await ctx.db.query("skills").collect();
    return skills.filter((s) => s.enabled);
  },
});

// Initialize default skills
export const initializeDefaults = mutation({
  handler: async (ctx) => {
    const defaultSkills = [
      { name: "chat", requiredApiKeys: ["GOOGLE_GENERATIVE_AI_API_KEY"] },
      { name: "twitter", requiredApiKeys: ["TWITTER_API_KEY", "TWITTER_API_SECRET"] },
      { name: "image_generation", requiredApiKeys: ["GOOGLE_GENERATIVE_AI_API_KEY"] },
      { name: "web_scraping", requiredApiKeys: [] },
    ];

    for (const skill of defaultSkills) {
      const existing = await ctx.db
        .query("skills")
        .withIndex("by_name", (q) => q.eq("name", skill.name))
        .first();

      if (!existing) {
        await ctx.db.insert("skills", {
          name: skill.name,
          enabled: false,
          requiredApiKeys: skill.requiredApiKeys,
          configuredAt: undefined,
        });
      }
    }

    return defaultSkills.map((s) => s.name);
  },
});
