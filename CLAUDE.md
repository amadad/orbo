# Orbo - Digital Being Framework

## Overview

Orbo is an autonomous digital being that pursues objectives through personality-driven activity selection. Built with TypeScript, Convex, React, and Tailwind.

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Convex (database, crons, real-time subscriptions)
- **LLM**: OpenAI via TanStack AI
- **Runtime**: Bun

## Project Structure

```
orbo/
├── convex/                 # Backend (Convex functions)
│   ├── schema.ts          # Database tables
│   ├── being.ts           # Being state (mood, energy, personality)
│   ├── memory.ts          # Short-term & long-term memory
│   ├── activities.ts      # Activity CRUD
│   ├── selector.ts        # Personality-weighted activity selection
│   ├── loop.ts            # Main execution loop (cron-triggered)
│   ├── crons.ts           # Scheduled jobs
│   ├── activityRunner.ts  # Activity execution + LLM calls
│   ├── skills.ts          # Skill/API management
│   └── seed.ts            # Initialization
├── src/                    # Frontend (React)
│   ├── App.tsx            # Main component
│   ├── main.tsx           # Entry + Convex provider
│   ├── index.css          # Tailwind styles
│   └── components/
│       ├── Dashboard.tsx  # Real-time dashboard
│       ├── Onboarding.tsx # Setup wizard
│       ├── StatusCard.tsx
│       ├── ActivityList.tsx
│       ├── MemoryFeed.tsx
│       └── Controls.tsx
├── index.html
├── convex.json            # Convex project config
├── vite.config.ts
└── package.json
```

## Key Concepts

### Being State
- **Energy**: 0-1, depleted by activities, recovers over time
- **Mood**: neutral, curious, creative, focused, tired, happy
- **Personality**: friendliness, creativity, curiosity, enthusiasm (0-1 each)
- **Objectives**: primary goal + optional secondary goals

### Activity System
- Activities have energy cost, cooldown, and required skills
- Selection weighted by personality traits and current mood
- Execution recorded in history with success/error status

### Memory System
- **Short-term**: Recent 100 memories (activity results, thoughts, observations)
- **Long-term**: Consolidated summaries by category
- Automatic consolidation when short-term exceeds threshold

### Cron Jobs
- `main-loop`: Every 5 minutes - selects and executes an activity
- `energy-recovery`: Every 15 minutes - passive energy regeneration

## Commands

```bash
bun run dev          # Start Vite frontend
bun run dev:backend  # Start Convex backend
bun run dev:all      # Start both
bun run build        # Production build
bun run deploy       # Deploy Convex + build
```

## Convex CLI

```bash
bunx convex dev                              # Dev server + type generation
bunx convex deploy                           # Deploy to production
bunx convex env set OPENAI_API_KEY sk-...   # Set environment variable
bunx convex run seed:initialize '{"name":"Orbo","primaryObjective":"..."}'
bunx convex run seed:reset                   # Clear all data
bunx convex run loop:triggerNow              # Manual activity trigger
```

## Adding Activities

1. Register in database:
```typescript
await convex.mutation(api.activities.register, {
  name: "my_activity",
  description: "What it does",
  energyCost: 0.2,
  cooldownMs: 3600000, // 1 hour
  requiredSkills: ["chat"],
});
```

2. Add handler in `convex/activityRunner.ts`:
```typescript
case "my_activity":
  return await runMyActivity(beingState, memoryContext);
```

## Environment Variables

### Convex (set via `bunx convex env set`)
- `OPENAI_API_KEY` - Required for LLM activities

### Frontend (.env.local)
- `VITE_CONVEX_URL` - Auto-set by `bunx convex dev`

## Database Tables

| Table | Purpose |
|-------|---------|
| `beingState` | Single row with mood, energy, personality, objectives |
| `activities` | Activity definitions with cooldowns and requirements |
| `activityHistory` | Execution log with results and energy changes |
| `shortTermMemory` | Recent memories with type and importance |
| `longTermMemory` | Consolidated memory summaries |
| `skills` | Available skills and their API key requirements |
| `threads` | Agent conversation threads (for @convex-dev/agent) |

## Convex Patterns Used

- **Queries**: Read-only, reactive (auto-refresh UI)
- **Mutations**: Write operations, transactional
- **Actions**: Can call external APIs (LLM), non-deterministic
- **Internal functions**: Backend-only (`internal.loop.tick`)
- **Crons**: Scheduled via `convex/crons.ts`

## Notes

- The `_generated` folder is created by `bunx convex dev`
- Frontend uses Convex React hooks (`useQuery`, `useMutation`, `useAction`)
- All state updates are real-time via Convex subscriptions
- Python version archived in `python-archive` branch
