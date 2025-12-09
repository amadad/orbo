import { query } from "./_generated/server";

// List all skills
export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("skills").collect();
  },
});

// Get enabled skills
export const getEnabled = query({
  handler: async (ctx) => {
    const skills = await ctx.db.query("skills").collect();
    return skills.filter((s) => s.enabled);
  },
});
