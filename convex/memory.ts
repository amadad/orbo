import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const MAX_SHORT_TERM_MEMORIES = 100;

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

    // Prune old memories if we exceed the limit
    const allMemories = await ctx.db
      .query("shortTermMemory")
      .withIndex("by_time")
      .order("asc")
      .collect();

    if (allMemories.length > MAX_SHORT_TERM_MEMORIES) {
      // Delete oldest memories, keeping the most recent MAX_SHORT_TERM_MEMORIES
      const toDelete = allMemories.slice(0, allMemories.length - MAX_SHORT_TERM_MEMORIES);
      for (const memory of toDelete) {
        await ctx.db.delete(memory._id);
      }
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

