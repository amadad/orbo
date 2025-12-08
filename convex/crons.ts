import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Main activity loop - runs every 5 minutes
crons.interval(
  "main-loop",
  { minutes: 5 },
  internal.loop.tick
);

// Energy recovery - runs every 15 minutes
crons.interval(
  "energy-recovery",
  { minutes: 15 },
  internal.loop.recoverEnergy
);

export default crons;
