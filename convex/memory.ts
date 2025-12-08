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

// Get memories by time range
export const getByTimeRange = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
  },
  handler: async (ctx, args) => {
    const memories = await ctx.db
      .query("shortTermMemory")
      .withIndex("by_time")
      .filter((q) =>
        q.and(
          q.gte(q.field("createdAt"), args.startTime),
          q.lte(q.field("createdAt"), args.endTime)
        )
      )
      .collect();

    return memories;
  },
});

// Consolidate short-term memories into long-term
export const consolidate = mutation({
  args: {
    summary: v.string(),
    category: v.string(),
    memoryIds: v.array(v.id("shortTermMemory")),
  },
  handler: async (ctx, args) => {
    // Create long-term memory
    const longTermId = await ctx.db.insert("longTermMemory", {
      summary: args.summary,
      category: args.category,
      sourceMemoryIds: args.memoryIds,
      consolidatedAt: Date.now(),
      accessCount: 0,
      lastAccessedAt: Date.now(),
    });

    // Delete consolidated short-term memories
    for (const id of args.memoryIds) {
      await ctx.db.delete(id);
    }

    return longTermId;
  },
});

// Search long-term memories by category
export const searchLongTerm = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;

    if (args.category) {
      return await ctx.db
        .query("longTermMemory")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .take(limit);
    }

    return await ctx.db
      .query("longTermMemory")
      .order("desc")
      .take(limit);
  },
});

// Access a long-term memory (updates access count)
export const accessLongTermMemory = mutation({
  args: {
    memoryId: v.id("longTermMemory"),
  },
  handler: async (ctx, args) => {
    const memory = await ctx.db.get(args.memoryId);
    if (!memory) throw new Error("Memory not found");

    await ctx.db.patch(args.memoryId, {
      accessCount: memory.accessCount + 1,
      lastAccessedAt: Date.now(),
    });

    return memory;
  },
});

// Get memory context for activities (recent + relevant long-term)
export const getContext = query({
  args: {
    recentLimit: v.optional(v.number()),
    longTermLimit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const recentLimit = args.recentLimit ?? 10;
    const longTermLimit = args.longTermLimit ?? 5;

    const recent = await ctx.db
      .query("shortTermMemory")
      .order("desc")
      .take(recentLimit);

    const longTerm = await ctx.db
      .query("longTermMemory")
      .withIndex("by_access")
      .order("desc")
      .take(longTermLimit);

    return { recent, longTerm };
  },
});
