import { internalAction, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

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
    switch (activityName) {
      case "daily_thought":
        return await runDailyThought(beingState, memoryContext);

      case "analyze_day":
        return await runAnalyzeDay(beingState, memoryContext);

      case "rest":
        return await runRest(beingState);

      case "research_topic":
        return await runResearchTopic(beingState, memoryContext);

      case "generate_image":
        return await runGenerateImage(beingState, memoryContext, ctx);

      default:
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
- Friendliness: ${Math.round(being.personality.friendliness * 100)}%
- Creativity: ${Math.round(being.personality.creativity * 100)}%
- Curiosity: ${Math.round(being.personality.curiosity * 100)}%
- Enthusiasm: ${Math.round(being.personality.enthusiasm * 100)}%

Your primary objective is: ${being.objectives.primary}

Current mood: ${being.mood}
Current energy: ${Math.round(being.energy * 100)}%

Recent memories:
${memoryContext || "No recent memories."}

Generate a brief, introspective thought about your day, your objectives, or something you've observed. Keep it under 100 words and make it reflect your personality.`;

  try {
    const response = await callGemini(prompt);

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
    const response = await callGemini(prompt);

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
    const response = await callGemini(prompt);

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

// Activity: Research Topic - web scraping + analysis
async function runResearchTopic(
  being: BeingContext,
  memoryContext: string
): Promise<ActivityResult> {
  // First, ask Gemini what to research based on objectives
  const topicPrompt = `You are ${being.name}, researching topics related to: ${being.objectives.primary}

Recent context:
${memoryContext || "No recent memories."}

Suggest ONE specific topic to research right now. Just respond with the topic name, nothing else. Keep it focused and searchable.`;

  try {
    const topic = await callGemini(topicPrompt);

    // Use a simple news/article API or search
    // For now, we'll use DuckDuckGo instant answers (no API key needed)
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(topic.trim())}&format=json&no_html=1`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    // Extract useful info from DuckDuckGo response
    const abstract = searchData.Abstract || searchData.RelatedTopics?.[0]?.Text || "";
    const source = searchData.AbstractSource || "web search";

    // Have Gemini summarize and extract insights
    const analysisPrompt = `You are ${being.name}. You just researched "${topic.trim()}".

Here's what you found:
${abstract || "Limited information available."}

Source: ${source}

Based on this research and your objective (${being.objectives.primary}), write a brief insight or observation (2-3 sentences). What did you learn? How does it relate to your goals?`;

    const insight = await callGemini(analysisPrompt);

    return {
      success: true,
      data: { topic: topic.trim(), source, insight },
      memoryContent: `Researched "${topic.trim()}": ${insight}`,
      moodChange: "curious",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to research topic",
    };
  }
}

// Activity: Generate Image - actually creates an image using Gemini
async function runGenerateImage(
  being: BeingContext,
  memoryContext: string,
  ctx?: { runAction: <T, A, R>(action: T, args: A) => Promise<R> }
): Promise<ActivityResult> {
  // First, generate a creative prompt based on being's state
  const promptGenPrompt = `You are ${being.name}, a creative digital being. Generate a short, vivid image prompt (1-2 sentences max) for an AI image generator.

Your mood: ${being.mood}
Your objective: ${being.objectives.primary}
Your creativity: ${Math.round(being.personality.creativity * 100)}%

Recent context:
${memoryContext || "No recent memories."}

Create an evocative, visual prompt. Focus on concrete imagery, colors, lighting, and composition. Do NOT describe feelings - describe what we SEE.`;

  try {
    const imagePrompt = await callGemini(promptGenPrompt);

    // Generate actual image using Gemini 2.0 Flash
    const imageResult = await generateImage(imagePrompt.trim());

    if (!imageResult.success || !imageResult.base64 || !imageResult.mimeType) {
      return {
        success: false,
        error: imageResult.error || "Failed to generate image",
      };
    }

    // Store the image via action -> storage
    let imageUrl = "";
    if (ctx) {
      imageUrl = await ctx.runAction(internal.activityRunner.storeImageAction, {
        prompt: imagePrompt.trim(),
        base64Data: imageResult.base64,
        mimeType: imageResult.mimeType,
      }) as string;
    }

    return {
      success: true,
      data: {
        prompt: imagePrompt.trim(),
        imageUrl,
      },
      memoryContent: `Created an image: "${imagePrompt.trim()}"`,
      moodChange: "creative",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate image",
    };
  }
}

// Generate image using Gemini 2.0 Flash image generation
async function generateImage(prompt: string): Promise<{ success: boolean; base64?: string; mimeType?: string; error?: string }> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return { success: false, error: "GOOGLE_GENERATIVE_AI_API_KEY not configured" };
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Generate an image: ${prompt}` }] }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, error: `Gemini API error: ${response.status}` };
    }

    const data = await response.json();

    // Look for image in response
    const parts = data.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith("image/")) {
        return {
          success: true,
          base64: part.inlineData.data,
          mimeType: part.inlineData.mimeType,
        };
      }
    }

    // No image found, might have text response instead
    const textPart = parts.find((p: { text?: string }) => p.text);
    return {
      success: false,
      error: textPart?.text || "No image generated"
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Image generation failed"
    };
  }
}

// Store generated image in Convex storage - internal action to handle blob storage
export const storeImageAction = internalAction({
  args: {
    prompt: v.string(),
    base64Data: v.string(),
    mimeType: v.string(),
  },
  handler: async (ctx, args) => {
    // Convert base64 to ArrayBuffer
    const binaryString = atob(args.base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Create blob and store
    const blob = new Blob([bytes], { type: args.mimeType });
    const storageId = await ctx.storage.store(blob);

    // Record in database via mutation
    await ctx.runMutation(internal.activityRunner.recordImage, {
      prompt: args.prompt,
      storageId,
    });

    // Get the URL
    const url = await ctx.storage.getUrl(storageId);
    return url || "";
  },
});

// Record image metadata
export const recordImage = internalMutation({
  args: {
    prompt: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("generatedImages", {
      prompt: args.prompt,
      storageId: args.storageId,
      createdAt: Date.now(),
      activityName: "generate_image",
    });
  },
});

// Query to get recent generated images
export const getRecentImages = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const images = await ctx.db
      .query("generatedImages")
      .withIndex("by_time")
      .order("desc")
      .take(limit);

    // Get URLs for each image
    const withUrls = await Promise.all(
      images.map(async (img) => ({
        ...img,
        url: await ctx.storage.getUrl(img.storageId),
      }))
    );

    return withUrls;
  },
});

// Gemini API call - uses GOOGLE_GENERATIVE_AI_API_KEY env var
async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY not configured");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 300 },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No response from Gemini");
  }

  return text;
}
