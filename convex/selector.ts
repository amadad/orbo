import { query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

type Activity = Doc<"activities">;
type BeingState = Doc<"beingState">;

// Personality-weighted activity selection
export const selectNext = query({
  handler: async (ctx): Promise<Activity | null> => {
    const being = await ctx.db.query("beingState").first();
    if (!being || being.paused) return null;

    const activities = await ctx.db.query("activities").collect();
    const skills = await ctx.db.query("skills").collect();
    const enabledSkillNames = skills.filter((s) => s.enabled).map((s) => s.name);
    const now = Date.now();

    // Filter to available activities
    const available = activities.filter((activity) => {
      if (!activity.enabled) return false;
      if (being.energy < activity.energyCost) return false;

      if (activity.lastExecutedAt) {
        const cooldownEnd = activity.lastExecutedAt + activity.cooldownMs;
        if (now < cooldownEnd) return false;
      }

      const hasAllSkills = activity.requiredSkills.every((skill) =>
        enabledSkillNames.includes(skill)
      );
      if (!hasAllSkills) return false;

      return true;
    });

    if (available.length === 0) return null;

    // Weight activities by personality and current state
    const weights = available.map((activity) => {
      let weight = 1.0;

      // Energy-based weighting (prefer low-cost when tired)
      if (being.energy < 0.3) {
        weight *= 1.0 - activity.energyCost;
      }

      // Mood-based weighting
      if (being.mood === "creative") {
        // Boost creative activities (those with "create", "generate", "write" in description)
        if (/create|generate|write|draw/i.test(activity.description)) {
          weight *= 1.5 * being.personality.creativity;
        }
      } else if (being.mood === "curious") {
        // Boost research activities
        if (/research|analyze|explore|learn/i.test(activity.description)) {
          weight *= 1.5 * being.personality.curiosity;
        }
      } else if (being.mood === "tired") {
        // Prefer rest or low-energy activities
        weight *= 1.0 - activity.energyCost;
      }

      // Enthusiasm bonus for less-frequently done activities
      const recencyPenalty = activity.executionCount > 0 ? 1.0 / Math.log2(activity.executionCount + 2) : 1.0;
      weight *= recencyPenalty * being.personality.enthusiasm;

      return { activity, weight };
    });

    // Weighted random selection
    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    for (const { activity, weight } of weights) {
      random -= weight;
      if (random <= 0) {
        return activity;
      }
    }

    // Fallback to first available
    return available[0];
  },
});

// Get selection debug info (for dashboard)
export const getSelectionDebug = query({
  handler: async (ctx) => {
    const being = await ctx.db.query("beingState").first();
    if (!being) return { error: "Being not initialized" };

    const activities = await ctx.db.query("activities").collect();
    const skills = await ctx.db.query("skills").collect();
    const enabledSkillNames = skills.filter((s) => s.enabled).map((s) => s.name);
    const now = Date.now();

    const activityStatus = activities.map((activity) => {
      const reasons: string[] = [];

      if (!activity.enabled) reasons.push("disabled");
      if (being.energy < activity.energyCost) reasons.push(`low energy (need ${activity.energyCost}, have ${being.energy.toFixed(2)})`);

      if (activity.lastExecutedAt) {
        const cooldownEnd = activity.lastExecutedAt + activity.cooldownMs;
        if (now < cooldownEnd) {
          const remaining = Math.ceil((cooldownEnd - now) / 1000 / 60);
          reasons.push(`on cooldown (${remaining}m remaining)`);
        }
      }

      const missingSkills = activity.requiredSkills.filter(
        (skill) => !enabledSkillNames.includes(skill)
      );
      if (missingSkills.length > 0) {
        reasons.push(`missing skills: ${missingSkills.join(", ")}`);
      }

      return {
        name: activity.name,
        available: reasons.length === 0,
        reasons,
        energyCost: activity.energyCost,
        executionCount: activity.executionCount,
      };
    });

    return {
      being: {
        name: being.name,
        mood: being.mood,
        energy: being.energy,
        paused: being.paused,
      },
      activities: activityStatus,
      enabledSkills: enabledSkillNames,
    };
  },
});
