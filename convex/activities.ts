import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Register a new activity
export const register = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    energyCost: v.float64(),
    cooldownMs: v.number(),
    requiredSkills: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if activity already exists
    const existing = await ctx.db
      .query("activities")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        description: args.description,
        energyCost: args.energyCost,
        cooldownMs: args.cooldownMs,
        requiredSkills: args.requiredSkills,
      });
      return existing._id;
    }

    // Create new
    return await ctx.db.insert("activities", {
      name: args.name,
      description: args.description,
      energyCost: args.energyCost,
      cooldownMs: args.cooldownMs,
      enabled: true,
      requiredSkills: args.requiredSkills,
      lastExecutedAt: undefined,
      executionCount: 0,
    });
  },
});

// Get all activities
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("activities").collect();
  },
});

// Get available activities (not on cooldown, has energy, has skills)
export const getAvailable = query({
  handler: async (ctx) => {
    const being = await ctx.db.query("beingState").first();
    if (!being) return [];

    const activities = await ctx.db.query("activities").collect();
    const skills = await ctx.db.query("skills").collect();
    const enabledSkillNames = skills.filter((s) => s.enabled).map((s) => s.name);
    const now = Date.now();

    return activities.filter((activity) => {
      // Must be enabled
      if (!activity.enabled) return false;

      // Must have enough energy
      if (being.energy < activity.energyCost) return false;

      // Must not be on cooldown
      if (activity.lastExecutedAt) {
        const cooldownEnd = activity.lastExecutedAt + activity.cooldownMs;
        if (now < cooldownEnd) return false;
      }

      // Must have required skills
      const hasAllSkills = activity.requiredSkills.every((skill) =>
        enabledSkillNames.includes(skill)
      );
      if (!hasAllSkills) return false;

      return true;
    });
  },
});

// Enable/disable an activity
export const setEnabled = mutation({
  args: {
    name: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (!activity) throw new Error(`Activity not found: ${args.name}`);

    await ctx.db.patch(activity._id, { enabled: args.enabled });
    return args.enabled;
  },
});

// Record activity execution
export const recordExecution = mutation({
  args: {
    activityName: v.string(),
    success: v.boolean(),
    error: v.optional(v.string()),
    result: v.optional(v.any()),
    energyBefore: v.float64(),
    energyAfter: v.float64(),
    moodBefore: v.string(),
    moodAfter: v.string(),
    durationMs: v.number(),
  },
  handler: async (ctx, args) => {
    // Record in history
    await ctx.db.insert("activityHistory", {
      activityName: args.activityName,
      success: args.success,
      error: args.error,
      result: args.result,
      energyBefore: args.energyBefore,
      energyAfter: args.energyAfter,
      moodBefore: args.moodBefore,
      moodAfter: args.moodAfter,
      executedAt: Date.now(),
      durationMs: args.durationMs,
    });

    // Update activity metadata
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_name", (q) => q.eq("name", args.activityName))
      .first();

    if (activity) {
      await ctx.db.patch(activity._id, {
        lastExecutedAt: Date.now(),
        executionCount: activity.executionCount + 1,
      });
    }
  },
});

// Reset cooldown for an activity (for testing/admin)
export const resetCooldown = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const activity = await ctx.db
      .query("activities")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();

    if (!activity) throw new Error(`Activity not found: ${args.name}`);

    await ctx.db.patch(activity._id, { lastExecutedAt: undefined });
    return true;
  },
});

// Get activity history
export const getHistory = query({
  args: {
    activityName: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    if (args.activityName) {
      return await ctx.db
        .query("activityHistory")
        .withIndex("by_activity", (q) => q.eq("activityName", args.activityName!))
        .order("desc")
        .take(limit);
    }

    return await ctx.db
      .query("activityHistory")
      .order("desc")
      .take(limit);
  },
});
