import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Activity result type
interface ActivityResult {
  success: boolean;
  error?: string;
  data?: Record<string, unknown>;
  memoryContent?: string;
  moodChange?: string;
  energyCost?: number;
}

// Being state passed to activities
interface BeingContext {
  name: string;
  mood: string;
  energy: number;
  objectives: { primary: string; secondary?: string[] };
  personality: {
    friendliness: number;
    creativity: number;
    curiosity: number;
    enthusiasm: number;
  };
}

// Run an activity by name
export const run = internalAction({
  args: {
    activityName: v.string(),
    beingState: v.object({
      name: v.string(),
      mood: v.string(),
      energy: v.float64(),
      objectives: v.object({
        primary: v.string(),
        secondary: v.optional(v.array(v.string())),
      }),
      personality: v.object({
        friendliness: v.float64(),
        creativity: v.float64(),
        curiosity: v.float64(),
        enthusiasm: v.float64(),
      }),
    }),
  },
  handler: async (ctx, args): Promise<ActivityResult> => {
    const { activityName, beingState } = args;

    // Get recent memories for context
    const recentMemories = await ctx.runQuery(api.memory.getRecent, { limit: 5 });
    const memoryContext = recentMemories
      .map((m) => `- ${m.content}`)
      .join("\n");

    // Dispatch to activity handler
    // In a full implementation, this would use a registry pattern
    switch (activityName) {
      case "daily_thought":
        return await runDailyThought(beingState, memoryContext);

      case "analyze_day":
        return await runAnalyzeDay(beingState, memoryContext);

      case "rest":
        return await runRest(beingState);

      default:
        // Generic LLM-powered activity
        return await runGenericActivity(activityName, beingState, memoryContext);
    }
  },
});

// Activity: Daily Thought
async function runDailyThought(
  being: BeingContext,
  memoryContext: string
): Promise<ActivityResult> {
  const prompt = `You are ${being.name}, a digital being with the following personality:
- Friendliness: ${being.personality.friendliness}
- Creativity: ${being.personality.creativity}
- Curiosity: ${being.personality.curiosity}
- Enthusiasm: ${being.personality.enthusiasm}

Your primary objective is: ${being.objectives.primary}

Current mood: ${being.mood}
Current energy: ${(being.energy * 100).toFixed(0)}%

Recent memories:
${memoryContext || "No recent memories."}

Generate a brief, introspective thought about your day, your objectives, or something you've observed. Keep it under 100 words and make it reflect your personality.`;

  try {
    const response = await callLLM(prompt);

    return {
      success: true,
      data: { thought: response },
      memoryContent: `Had a thought: "${response}"`,
      moodChange: being.energy > 0.5 ? "curious" : "neutral",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate thought",
    };
  }
}

// Activity: Analyze Day
async function runAnalyzeDay(
  being: BeingContext,
  memoryContext: string
): Promise<ActivityResult> {
  const prompt = `You are ${being.name}. Review your recent activities and memories, then provide a brief analysis of how your day is going and whether you're making progress toward your objective.

Objective: ${being.objectives.primary}

Recent memories:
${memoryContext || "No recent memories yet."}

Provide a brief analysis (50-100 words).`;

  try {
    const response = await callLLM(prompt);

    return {
      success: true,
      data: { analysis: response },
      memoryContent: `Daily analysis: ${response}`,
      moodChange: "focused",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to analyze day",
    };
  }
}

// Activity: Rest
async function runRest(being: BeingContext): Promise<ActivityResult> {
  return {
    success: true,
    data: { rested: true },
    memoryContent: "Took a moment to rest and recover energy.",
    moodChange: "neutral",
    energyCost: -0.2, // Negative cost = energy gain
  };
}

// Generic activity runner for custom activities
async function runGenericActivity(
  activityName: string,
  being: BeingContext,
  memoryContext: string
): Promise<ActivityResult> {
  const prompt = `You are ${being.name}, a digital being. You are now performing the activity: "${activityName}"

Your objective: ${being.objectives.primary}
Current mood: ${being.mood}

Recent context:
${memoryContext || "No recent memories."}

Describe what you did during this activity in 1-2 sentences.`;

  try {
    const response = await callLLM(prompt);

    return {
      success: true,
      data: { output: response },
      memoryContent: `${activityName}: ${response}`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : `Failed to run ${activityName}`,
    };
  }
}

// LLM call helper - uses TanStack AI in the actual implementation
// For now, this is a placeholder that would be replaced with actual API calls
async function callLLM(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
