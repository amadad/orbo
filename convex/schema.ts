import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Being state - mood, energy, personality
  beingState: defineTable({
    name: v.string(),
    mood: v.string(), // "neutral" | "happy" | "tired" | "curious" | "creative"
    energy: v.float64(), // 0.0 - 1.0
    personality: v.object({
      friendliness: v.float64(),
      creativity: v.float64(),
      curiosity: v.float64(),
      enthusiasm: v.float64(),
    }),
    objectives: v.object({
      primary: v.string(),
      secondary: v.optional(v.array(v.string())),
    }),
    paused: v.boolean(),
    lastActivityAt: v.optional(v.number()),
  }),

  // Activity definitions - what the being can do
  activities: defineTable({
    name: v.string(),
    description: v.string(),
    energyCost: v.float64(),
    cooldownMs: v.number(), // milliseconds
    enabled: v.boolean(),
    requiredSkills: v.array(v.string()),
    lastExecutedAt: v.optional(v.number()),
    executionCount: v.number(),
  }).index("by_name", ["name"]),

  // Activity execution history
  activityHistory: defineTable({
    activityName: v.string(),
    success: v.boolean(),
    error: v.optional(v.string()),
    result: v.optional(v.any()),
    energyBefore: v.float64(),
    energyAfter: v.float64(),
    moodBefore: v.string(),
    moodAfter: v.string(),
    executedAt: v.number(),
    durationMs: v.number(),
  }).index("by_activity", ["activityName"])
    .index("by_time", ["executedAt"]),

  // Short-term memory - recent events
  shortTermMemory: defineTable({
    content: v.string(),
    type: v.string(), // "activity" | "thought" | "observation" | "interaction"
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    importance: v.float64(), // 0.0 - 1.0 for consolidation
  }).index("by_time", ["createdAt"])
    .index("by_type", ["type"]),

  // Long-term memory - consolidated memories
  longTermMemory: defineTable({
    summary: v.string(),
    category: v.string(),
    sourceMemoryIds: v.array(v.id("shortTermMemory")),
    consolidatedAt: v.number(),
    accessCount: v.number(),
    lastAccessedAt: v.number(),
  }).index("by_category", ["category"])
    .index("by_access", ["lastAccessedAt"]),

  // Skills configuration
  skills: defineTable({
    name: v.string(),
    enabled: v.boolean(),
    requiredApiKeys: v.array(v.string()),
    configuredAt: v.optional(v.number()),
  }).index("by_name", ["name"]),

  // Threads for agent conversations (used by @convex-dev/agent)
  threads: defineTable({
    userId: v.optional(v.string()),
    context: v.optional(v.string()), // e.g., "activity:post_tweet"
    createdAt: v.number(),
  }).index("by_context", ["context"]),
});
