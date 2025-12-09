import type { Doc } from "./_generated/dataModel";

// Re-export generated types
export type BeingState = Doc<"beingState">;
export type Activity = Doc<"activities">;
export type ActivityHistory = Doc<"activityHistory">;
export type ShortTermMemory = Doc<"shortTermMemory">;
export type Skill = Doc<"skills">;

// Activity execution context
export interface ActivityContext {
  being: BeingState;
  recentMemories: ShortTermMemory[];
  skills: Skill[];
}

// Activity result from execution
export interface ActivityResult {
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
  memoryContent?: string; // What to remember about this activity
  moodChange?: string; // New mood after activity
  energyCost?: number; // Override default energy cost
}

// Activity handler function type
export type ActivityHandler = (
  ctx: ActivityContext,
  llm: LLMClient
) => Promise<ActivityResult>;

// LLM client interface (implemented by TanStack AI)
export interface LLMClient {
  chat(options: {
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
    model?: string;
    maxTokens?: number;
  }): Promise<{ text: string }>;

  stream(options: {
    messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
    model?: string;
  }): AsyncIterable<{ delta: string }>;
}

// Personality weights for activity selection
export interface PersonalityWeights {
  social: number; // Prefers interactive activities
  creative: number; // Prefers generative activities
  analytical: number; // Prefers research activities
  restful: number; // Prefers low-energy activities
}

// Activity metadata for registration
export interface ActivityDefinition {
  name: string;
  description: string;
  energyCost: number;
  cooldownMs: number;
  requiredSkills: string[];
  personalityAffinity: Partial<PersonalityWeights>;
  handler: ActivityHandler;
}

// Mood types
export type Mood = "neutral" | "happy" | "tired" | "curious" | "creative" | "focused";

// Memory types
export type MemoryType = "activity" | "thought" | "observation" | "interaction";
