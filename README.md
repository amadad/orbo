# Orbo

An autonomous digital being framework built with TypeScript, Convex, and TanStack AI.

Orbo is a self-improving AI agent that learns about your objectives, develops its own personality, and autonomously executes activities to pursue its goals.

## Features

- **Autonomous Activity Loop** - Runs on a schedule, selecting and executing activities based on energy, mood, and personality
- **Memory System** - Short-term and long-term memory with automatic consolidation
- **Personality-Driven Selection** - Activities weighted by personality traits and current mood
- **Energy Management** - Activities cost energy; the being rests and recovers
- **Extensible Skills** - Add new capabilities (Twitter, image generation, web scraping, etc.)
- **Real-time Dashboard** - Convex provides live updates to any connected UI

## Tech Stack

- **Runtime**: [Bun](https://bun.sh)
- **Backend**: [Convex](https://convex.dev) (database, crons, real-time)
- **LLM**: [TanStack AI](https://tanstack.com/ai) + OpenAI
- **Language**: TypeScript

## Quick Start

### 1. Install dependencies

```bash
bun install
```

### 2. Set up Convex

```bash
bunx convex dev
```

This will prompt you to create a Convex project. Follow the instructions.

### 3. Configure environment

Create a `.env.local` file:

```env
OPENAI_API_KEY=sk-...
```

Add it to Convex:

```bash
bunx convex env set OPENAI_API_KEY sk-...
```

### 4. Initialize your being

```bash
bun src/cli.ts init
```

Follow the prompts to name your being and set its objectives.

### 5. Start the loop

```bash
bun src/cli.ts start
```

## CLI Commands

```bash
bun src/cli.ts init      # Initialize a new being
bun src/cli.ts status    # Show current status
bun src/cli.ts start     # Start the activity loop
bun src/cli.ts stop      # Pause the activity loop
bun src/cli.ts trigger   # Trigger an activity immediately
bun src/cli.ts reset     # Delete all data and start over
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
│   ├── crons.ts           # Scheduled jobs
│   ├── activityRunner.ts  # Activity execution
│   ├── skills.ts          # Skill management
│   └── seed.ts            # Initialization
├── src/
│   └── cli.ts             # Command-line interface
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

Activities are registered in the database. To add a new one:

```typescript
await client.mutation(api.activities.register, {
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
