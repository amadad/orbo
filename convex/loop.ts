import { action, internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

// Main loop - called by cron every few minutes
export const tick = internalAction({
  handler: async (ctx) => {
    // Get being state
    const being = await ctx.runQuery(api.being.get);
    if (!being || being.paused) {
      console.log("[loop] Being paused or not initialized");
      return { skipped: true, reason: "paused or not initialized" };
    }

    // Check energy threshold
    if (being.energy < 0.1) {
      console.log("[loop] Energy too low, recovering...");
      await ctx.runMutation(api.being.recoverEnergy, { amount: 0.1 });
      return { skipped: true, reason: "energy recovery" };
    }

    // Select next activity
    const activity = await ctx.runQuery(api.selector.selectNext);
    if (!activity) {
      console.log("[loop] No available activities");
      // Small energy recovery when idle
      await ctx.runMutation(api.being.recoverEnergy, { amount: 0.05 });
      return { skipped: true, reason: "no available activities" };
    }

    console.log(`[loop] Selected activity: ${activity.name}`);

    // Execute the activity
    const startTime = Date.now();
    const energyBefore = being.energy;
    const moodBefore = being.mood;

    try {
      // Run the activity handler
      // In a full implementation, this would dispatch to registered activity handlers
      const result = await ctx.runAction(internal.activityRunner.run, {
        activityName: activity.name,
        beingState: {
          name: being.name,
          mood: being.mood,
          energy: being.energy,
          objectives: being.objectives,
          personality: being.personality,
        },
      });

      const durationMs = Date.now() - startTime;

      // Update being state
      await ctx.runMutation(api.being.updateAfterActivity, {
        energyCost: result.energyCost ?? activity.energyCost,
        newMood: result.moodChange,
      });

      // Get updated state for recording
      const updatedBeing = await ctx.runQuery(api.being.get);

      // Record execution
      await ctx.runMutation(api.activities.recordExecution, {
        activityName: activity.name,
        success: result.success,
        error: result.error,
        result: result.data,
        energyBefore,
        energyAfter: updatedBeing?.energy ?? energyBefore - activity.energyCost,
        moodBefore,
        moodAfter: updatedBeing?.mood ?? moodBefore,
        durationMs,
      });

      // Store memory if provided
      if (result.memoryContent) {
        await ctx.runMutation(api.memory.remember, {
          content: result.memoryContent,
          type: "activity",
          metadata: { activityName: activity.name, success: result.success },
        });
      }

      console.log(`[loop] Activity ${activity.name} completed: ${result.success}`);
      return { executed: activity.name, success: result.success };
    } catch (error) {
      const durationMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      console.error(`[loop] Activity ${activity.name} failed:`, errorMessage);

      // Record failure
      await ctx.runMutation(api.activities.recordExecution, {
        activityName: activity.name,
        success: false,
        error: errorMessage,
        energyBefore,
        energyAfter: energyBefore, // No energy spent on failure
        moodBefore,
        moodAfter: moodBefore,
        durationMs,
      });

      return { executed: activity.name, success: false, error: errorMessage };
    }
  },
});

// Energy recovery - called less frequently
export const recoverEnergy = internalMutation({
  handler: async (ctx) => {
    const being = await ctx.db.query("beingState").first();
    if (!being) return;

    // Recover 5% energy per tick
    const newEnergy = Math.min(1.0, being.energy + 0.05);
    await ctx.db.patch(being._id, { energy: newEnergy });

    console.log(`[recovery] Energy: ${being.energy.toFixed(2)} -> ${newEnergy.toFixed(2)}`);
  },
});

// Manual trigger for testing
export const triggerNow = action({
  handler: async (ctx) => {
    return await ctx.runAction(internal.loop.tick);
  },
});
