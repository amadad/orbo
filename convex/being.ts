import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { Mood } from "./types";

// Get the current being state
export const get = query({
  handler: async (ctx) => {
    return await ctx.db.query("beingState").first();
  },
});

// Initialize a new being
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
    // Check if being already exists
    const existing = await ctx.db.query("beingState").first();
    if (existing) {
      throw new Error("Being already initialized. Use update instead.");
    }

    const beingId = await ctx.db.insert("beingState", {
      name: args.name,
      mood: "neutral",
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
      paused: true,
      lastActivityAt: undefined,
    });

    return beingId;
  },
});

// Update being state after activity
export const updateAfterActivity = mutation({
  args: {
    energyCost: v.float64(),
    newMood: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const being = await ctx.db.query("beingState").first();
    if (!being) throw new Error("Being not initialized");

    const newEnergy = Math.max(0, Math.min(1, being.energy - args.energyCost));

    await ctx.db.patch(being._id, {
      energy: newEnergy,
      mood: (args.newMood as Mood) ?? being.mood,
      lastActivityAt: Date.now(),
    });

    return { energy: newEnergy, mood: args.newMood ?? being.mood };
  },
});

// Recover energy over time
export const recoverEnergy = mutation({
  args: {
    amount: v.float64(),
  },
  handler: async (ctx, args) => {
    const being = await ctx.db.query("beingState").first();
    if (!being) return;

    const newEnergy = Math.min(1.0, being.energy + args.amount);
    await ctx.db.patch(being._id, { energy: newEnergy });

    return newEnergy;
  },
});

// Pause/resume the being
export const setPaused = mutation({
  args: { paused: v.boolean() },
  handler: async (ctx, args) => {
    const being = await ctx.db.query("beingState").first();
    if (!being) throw new Error("Being not initialized");

    await ctx.db.patch(being._id, { paused: args.paused });
    return args.paused;
  },
});

// Update objectives
export const updateObjectives = mutation({
  args: {
    primary: v.optional(v.string()),
    secondary: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const being = await ctx.db.query("beingState").first();
    if (!being) throw new Error("Being not initialized");

    const objectives = {
      primary: args.primary ?? being.objectives.primary,
      secondary: args.secondary ?? being.objectives.secondary,
    };

    await ctx.db.patch(being._id, { objectives });
    return objectives;
  },
});
