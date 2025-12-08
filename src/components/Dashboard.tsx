import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { StatusCard } from "./StatusCard";
import { ActivityList } from "./ActivityList";
import { MemoryFeed } from "./MemoryFeed";
import { Controls } from "./Controls";

interface DashboardProps {
  being: Doc<"beingState">;
}

export function Dashboard({ being }: DashboardProps) {
  const activities = useQuery(api.activities.list) ?? [];
  const availableActivities = useQuery(api.activities.getAvailable) ?? [];
  const recentMemories = useQuery(api.memory.getRecent, { limit: 10 }) ?? [];
  const history = useQuery(api.activities.getHistory, { limit: 10 }) ?? [];
  const selectionDebug = useQuery(api.selector.getSelectionDebug);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-lg font-bold">
              {being.name[0]}
            </div>
            <div>
              <h1 className="text-xl font-semibold">{being.name}</h1>
              <p className="text-sm text-zinc-500">{being.objectives.primary}</p>
            </div>
          </div>
          <Controls being={being} />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatusCard
            label="Energy"
            value={`${Math.round(being.energy * 100)}%`}
            icon="⚡"
            color={being.energy > 0.5 ? "green" : being.energy > 0.2 ? "yellow" : "red"}
          >
            <div className="mt-2 h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full energy-gradient transition-all duration-500"
                style={{ width: `${being.energy * 100}%` }}
              />
            </div>
          </StatusCard>

          <StatusCard
            label="Mood"
            value={being.mood}
            icon={getMoodEmoji(being.mood)}
            color="purple"
          >
            <div className="mt-2 flex gap-2">
              {["neutral", "curious", "creative", "focused"].map((mood) => (
                <span
                  key={mood}
                  className={`text-xs px-2 py-1 rounded ${
                    being.mood === mood
                      ? "bg-violet-500/20 text-violet-300"
                      : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {mood}
                </span>
              ))}
            </div>
          </StatusCard>

          <StatusCard
            label="Activities"
            value={`${availableActivities.length} available`}
            icon="🎯"
            color="blue"
          >
            <div className="mt-2 text-sm text-zinc-500">
              {activities.length} total · {history.length} executed
            </div>
          </StatusCard>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Activities */}
          <div className="lg:col-span-2 space-y-6">
            <section>
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <span className="text-zinc-400">📋</span> Activities
              </h2>
              <ActivityList
                activities={activities}
                available={availableActivities}
                debug={selectionDebug}
              />
            </section>

            <section>
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <span className="text-zinc-400">📜</span> Recent History
              </h2>
              <div className="space-y-2">
                {history.length === 0 ? (
                  <p className="text-zinc-500 text-sm">No activities executed yet.</p>
                ) : (
                  history.map((h) => (
                    <div
                      key={h._id}
                      className="bg-zinc-900 rounded-lg p-4 border border-zinc-800"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{h.activityName}</span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            h.success
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {h.success ? "Success" : "Failed"}
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-zinc-500 flex items-center gap-4">
                        <span>⚡ {Math.round((h.energyBefore - h.energyAfter) * 100)}%</span>
                        <span>⏱️ {h.durationMs}ms</span>
                        <span>{new Date(h.executedAt).toLocaleTimeString()}</span>
                      </div>
                      {h.error && (
                        <p className="mt-2 text-sm text-red-400">{h.error}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Memory Feed */}
          <div>
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <span className="text-zinc-400">💭</span> Memory
            </h2>
            <MemoryFeed memories={recentMemories} />
          </div>
        </div>
      </main>
    </div>
  );
}

function getMoodEmoji(mood: string): string {
  const emojis: Record<string, string> = {
    neutral: "😐",
    happy: "😊",
    tired: "😴",
    curious: "🤔",
    creative: "✨",
    focused: "🎯",
  };
  return emojis[mood] ?? "😐";
}
