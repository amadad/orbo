#!/usr/bin/env bun
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";

// Set via: export CONVEX_URL=$(bunx convex dev --url-only)
// Or for prod: export CONVEX_URL=https://academic-toad-450.convex.cloud
const CONVEX_URL = process.env.CONVEX_URL;

if (!CONVEX_URL) {
  console.error("Error: CONVEX_URL environment variable not set");
  console.error("Run: export CONVEX_URL=$(bunx convex dev --url-only)");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

// ANSI colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function print(text: string, color?: keyof typeof colors) {
  if (color) {
    console.log(`${colors[color]}${text}${colors.reset}`);
  } else {
    console.log(text);
  }
}

async function prompt(question: string): Promise<string> {
  process.stdout.write(`${colors.cyan}${question}${colors.reset} `);
  for await (const line of console) {
    return line.trim();
  }
  return "";
}

async function promptWithDefault(question: string, defaultValue: string): Promise<string> {
  const answer = await prompt(`${question} [${defaultValue}]:`);
  return answer || defaultValue;
}

async function promptYesNo(question: string, defaultYes = true): Promise<boolean> {
  const hint = defaultYes ? "[Y/n]" : "[y/N]";
  const answer = await prompt(`${question} ${hint}:`);
  if (!answer) return defaultYes;
  return answer.toLowerCase().startsWith("y");
}

async function showStatus() {
  print("\n📊 Current Status", "bright");
  print("─".repeat(40), "dim");

  try {
    const being = await client.query(api.being.get);
    if (!being) {
      print("No being initialized. Run 'bun src/cli.ts init' to get started.", "yellow");
      return;
    }

    print(`Name: ${being.name}`, "green");
    print(`Mood: ${being.mood}`);
    print(`Energy: ${(being.energy * 100).toFixed(0)}%`);
    print(`Status: ${being.paused ? "⏸️  Paused" : "▶️  Running"}`);
    print(`Objective: ${being.objectives.primary}`);

    print("\n🎯 Activities", "bright");
    const activities = await client.query(api.activities.list);
    for (const activity of activities) {
      const status = activity.enabled ? "✓" : "✗";
      print(`  ${status} ${activity.name} (${activity.executionCount} runs)`, activity.enabled ? "green" : "dim");
    }

    print("\n🔧 Skills", "bright");
    const skills = await client.query(api.skills.list);
    for (const skill of skills) {
      const status = skill.enabled ? "✓" : "✗";
      print(`  ${status} ${skill.name}`, skill.enabled ? "green" : "dim");
    }

    print("\n💭 Recent Memories", "bright");
    const memories = await client.query(api.memory.getRecent, { limit: 5 });
    for (const memory of memories) {
      const time = new Date(memory.createdAt).toLocaleTimeString();
      print(`  [${time}] ${memory.content.slice(0, 60)}...`, "dim");
    }
  } catch (error) {
    print(`Error: ${error}`, "yellow");
  }
}

async function initialize() {
  print("\n🌟 Initialize Orbo", "bright");
  print("─".repeat(40), "dim");

  const name = await promptWithDefault("What should your being be called?", "Orbo");
  const objective = await prompt("What is your being's primary objective?");

  if (!objective) {
    print("Objective is required!", "yellow");
    return;
  }

  const friendliness = parseFloat(await promptWithDefault("Friendliness (0-1)", "0.7"));
  const creativity = parseFloat(await promptWithDefault("Creativity (0-1)", "0.8"));
  const curiosity = parseFloat(await promptWithDefault("Curiosity (0-1)", "0.9"));
  const enthusiasm = parseFloat(await promptWithDefault("Enthusiasm (0-1)", "0.75"));

  print("\nCreating your being...", "cyan");

  try {
    const result = await client.mutation(api.seed.initialize, {
      name,
      primaryObjective: objective,
      personality: { friendliness, creativity, curiosity, enthusiasm },
    });

    print(`\n✅ ${name} has been created!`, "green");
    print(`   ${result.skillsCreated} skills registered`);
    print(`   ${result.activitiesCreated} activities ready`);
    print(`\nRun 'bun src/cli.ts start' to begin the loop.`, "cyan");
  } catch (error) {
    print(`Error: ${error}`, "yellow");
  }
}

async function start() {
  print("\n▶️  Starting Orbo...", "bright");

  try {
    await client.mutation(api.being.setPaused, { paused: false });
    print("Orbo is now running! The cron will execute every 5 minutes.", "green");
    print("Run 'bun src/cli.ts trigger' to execute immediately.", "cyan");
  } catch (error) {
    print(`Error: ${error}`, "yellow");
  }
}

async function stop() {
  print("\n⏸️  Pausing Orbo...", "bright");

  try {
    await client.mutation(api.being.setPaused, { paused: true });
    print("Orbo is now paused.", "green");
  } catch (error) {
    print(`Error: ${error}`, "yellow");
  }
}

async function trigger() {
  print("\n⚡ Triggering activity...", "bright");

  try {
    const result = await client.action(api.loop.triggerNow);
    print(`Result: ${JSON.stringify(result, null, 2)}`, "cyan");
  } catch (error) {
    print(`Error: ${error}`, "yellow");
  }
}

async function reset() {
  print("\n⚠️  Reset Orbo", "yellow");

  const confirm = await promptYesNo("This will delete ALL data. Are you sure?", false);
  if (!confirm) {
    print("Cancelled.", "dim");
    return;
  }

  try {
    const result = await client.mutation(api.seed.reset);
    print(`Deleted ${result.deletedCount} records.`, "green");
  } catch (error) {
    print(`Error: ${error}`, "yellow");
  }
}

async function showHelp() {
  print("\n🤖 Orbo CLI", "bright");
  print("─".repeat(40), "dim");
  print("Commands:");
  print("  init      Initialize a new being");
  print("  status    Show current status");
  print("  start     Start the activity loop");
  print("  stop      Pause the activity loop");
  print("  trigger   Trigger an activity immediately");
  print("  reset     Delete all data and start over");
  print("  help      Show this help message");
}

// Main
const command = process.argv[2];

switch (command) {
  case "init":
    await initialize();
    break;
  case "status":
    await showStatus();
    break;
  case "start":
    await start();
    break;
  case "stop":
    await stop();
    break;
  case "trigger":
    await trigger();
    break;
  case "reset":
    await reset();
    break;
  case "help":
  default:
    await showHelp();
}
