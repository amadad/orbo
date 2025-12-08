# Orbo

An autonomous digital being framework built with TypeScript, Convex, React, and Tailwind.

Orbo is a self-improving AI agent that learns about your objectives, develops its own personality, and autonomously executes activities to pursue its goals.

> Inspired by [Pippin](https://github.com/yoheinakajima/pippin) by Yohei Nakajima - an autonomous AI agent framework that explores personality-driven activity selection and memory systems.

## Features

- **Real-time Dashboard** - Watch your being think, act, and remember in real-time
- **Autonomous Activity Loop** - Runs on a schedule, selecting activities based on energy, mood, and personality
- **Memory System** - Short-term and long-term memory with automatic consolidation
- **Personality-Driven Selection** - Activities weighted by personality traits and current mood
- **Energy Management** - Activities cost energy; the being rests and recovers
- **Extensible Skills** - Add new capabilities (Twitter, image generation, web scraping, etc.)

## Tech Stack

- **Frontend**: React 19 + Radix UI + Tailwind CSS + Vite
- **Backend**: [Convex](https://convex.dev) (database, crons, real-time)
- **LLM**: Google Gemini 2.0 Flash-Lite
- **Runtime**: [Bun](https://bun.sh)

## Quick Start

### 1. Install dependencies

```bash
bun install
```

### 2. Start Convex backend

```bash
bun run dev:backend
```

This will prompt you to create a Convex project and set up your `.env.local` with `VITE_CONVEX_URL`.

### 3. Add your Gemini API key to Convex

```bash
bunx convex env set GOOGLE_GENERATIVE_AI_API_KEY your-api-key
```

### 4. Start the frontend

In a new terminal:

```bash
bun run dev
```

### 5. Open the dashboard

Visit `http://localhost:5173` and create your being through the onboarding flow.

## Scripts

```bash
bun run dev          # Start Vite dev server
bun run dev:backend  # Start Convex dev server
bun run dev:all      # Start both (background)
bun run build        # Build for production
bun run deploy       # Deploy Convex + build frontend
```

## Architecture

```
orbo/
├── convex/                 # Convex backend
│   ├── schema.ts          # Database schema
│   ├── being.ts           # Being state management
│   ├── memory.ts          # Memory system
│   ├── activities.ts      # Activity management
│   ├── selector.ts        # Activity selection logic
│   ├── loop.ts            # Main execution loop
│   ├── crons.ts           # Scheduled jobs (every 5 min)
│   ├── activityRunner.ts  # Activity execution + LLM
│   ├── skills.ts          # Skill management
│   └── seed.ts            # Initialization
├── src/
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   ├── index.css          # Tailwind styles
│   └── components/
│       ├── Dashboard.tsx  # Main dashboard view
│       ├── Onboarding.tsx # Setup wizard
│       ├── StatusCard.tsx # Status display cards
│       ├── ActivityList.tsx
│       ├── MemoryFeed.tsx
│       └── Controls.tsx
├── index.html
└── package.json
```

## Default Activities

| Activity | Description | Energy | Cooldown |
|----------|-------------|--------|----------|
| `daily_thought` | Generate a reflective thought | 10% | 4 hours |
| `analyze_day` | Analyze progress toward objectives | 15% | 24 hours |
| `rest` | Recover energy | -20% | 30 minutes |
| `post_tweet` | Generate and post a tweet | 25% | 1 hour |
| `generate_image` | Create an image | 30% | 2 hours |
| `research_topic` | Research via web scraping | 35% | 3 hours |

## Adding Custom Activities

Register via the Convex dashboard or API:

```typescript
import { api } from "./convex/_generated/api";

await convex.mutation(api.activities.register, {
  name: "my_activity",
  description: "Does something cool",
  energyCost: 0.2,
  cooldownMs: 60 * 60 * 1000, // 1 hour
  requiredSkills: ["chat"],
});
```

Then add the handler in `convex/activityRunner.ts`.

## Python Version

The original Python implementation is preserved in the `python-archive` branch.

## License

MIT
