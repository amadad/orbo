# Orbo - Digital Being Framework

## Overview

Orbo is an autonomous digital being that pursues objectives through personality-driven activity selection. Built with React, Convex, and ShaderGradient for 3D visuals.

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS + Radix UI
- **Backend**: Convex (database, crons, real-time subscriptions)
- **LLM**: Google Generative AI (Gemini)
- **3D Avatar**: ShaderGradient + Three.js
- **Runtime**: Bun

## Project Structure

```
orbo/
├── convex/                 # Backend (Convex functions)
│   ├── schema.ts          # Database tables
│   ├── being.ts           # Being state (mood, energy, personality)
│   ├── memory.ts          # Short-term memory
│   ├── activities.ts      # Activity queries and execution recording
│   ├── selector.ts        # Personality-weighted activity selection
│   ├── loop.ts            # Main execution loop (cron-triggered)
│   ├── crons.ts           # Scheduled jobs
│   ├── activityRunner.ts  # Activity execution + LLM calls
│   ├── skills.ts          # Skill queries
│   └── seed.ts            # Initialization
├── src/                    # Frontend (React)
│   ├── App.tsx            # Main component
│   ├── main.tsx           # Entry + Convex provider
│   ├── index.css          # Tailwind styles
│   ├── utils/
│   │   └── format.ts      # Shared formatting utilities
│   └── components/
│       ├── Avatar.tsx     # 3D ShaderGradient avatar
│       ├── VisualDashboard.tsx  # Main visual view
│       ├── Dashboard.tsx  # Detailed dashboard
│       ├── Onboarding.tsx # Setup wizard
│       └── Controls.tsx   # Pause/trigger controls
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
- **Short-term**: Recent memories (activity results, thoughts, observations)
- Stored with type, content, and importance

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
bunx convex env set GOOGLE_GENERATIVE_AI_API_KEY ...   # Set environment variable
bunx convex run seed:initialize '{"name":"Orbo","primaryObjective":"..."}'
bunx convex run seed:reset                   # Clear all data
bunx convex run loop:triggerNow              # Manual activity trigger
```

## Environment Variables

### Convex (set via `bunx convex env set`)
- `GOOGLE_GENERATIVE_AI_API_KEY` - Required for LLM activities

### Frontend (.env.local)
- `VITE_CONVEX_URL` - Auto-set by `bunx convex dev`

## Database Tables

| Table | Purpose |
|-------|---------|
| `beingState` | Single row with mood, energy, personality, objectives |
| `activities` | Activity definitions with cooldowns and requirements |
| `activityHistory` | Execution log with results and energy changes |
| `shortTermMemory` | Recent memories with type and importance |
| `longTermMemory` | Consolidated memory summaries (future use) |
| `skills` | Available skills and their API key requirements |
| `generatedImages` | Stored images from generate_image activity |

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
- Avatar uses ShaderGradient for mood/energy visualization
