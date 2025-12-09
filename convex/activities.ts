import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
