import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { MemoryType } from "./types";

const MEMORY_TYPES = ["activity", "thought", "observation", "interaction"] as const;

// Store a new short-term memory
export const remember = mutation({
  args: {
    content: v.string(),
    type: v.union(
      v.literal("activity"),
      v.literal("thought"),
      v.literal("observation"),
      v.literal("interaction")
    ),
    metadata: v.optional(v.any()),
    importance: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const memoryId = await ctx.db.insert("shortTermMemory", {
      content: args.content,
      type: args.type,
      metadata: args.metadata,
      createdAt: Date.now(),
      importance: args.importance ?? 0.5,
    });

    // Check if we need to consolidate (more than 100 short-term memories)
    const count = await ctx.db.query("shortTermMemory").collect();
    if (count.length > 100) {
      // Schedule consolidation
      // In a real implementation, this would trigger the consolidate function
    }

    return memoryId;
  },
});

// Get recent memories
export const getRecent = query({
  args: {
    limit: v.optional(v.number()),
    type: v.optional(
      v.union(
        v.literal("activity"),
        v.literal("thought"),
        v.literal("observation"),
        v.literal("interaction")
      )
    ),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    let q = ctx.db.query("shortTermMemory").order("desc");

    if (args.type) {
      q = ctx.db
        .query("shortTermMemory")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .order("desc");
    }

    return await q.take(limit);
  },
});

