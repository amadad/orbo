import type { Doc } from "../../convex/_generated/dataModel";

interface ActivityListProps {
  activities: Doc<"activities">[];
  available: Doc<"activities">[];
  debug?: {
    being?: { name: string; mood: string; energy: number; paused: boolean };
    activities?: Array<{
      name: string;
      available: boolean;
      reasons: string[];
      energyCost: number;
      executionCount: number;
    }>;
    enabledSkills?: string[];
  } | null;
}

export function ActivityList({ activities, available, debug }: ActivityListProps) {
  const availableNames = new Set(available.map((a) => a.name));
  const debugMap = new Map(debug?.activities?.map((a) => [a.name, a]));

  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const isAvailable = availableNames.has(activity.name);
        const debugInfo = debugMap.get(activity.name);
        const cooldownRemaining = activity.lastExecutedAt
          ? Math.max(0, activity.lastExecutedAt + activity.cooldownMs - Date.now())
          : 0;

        return (
          <div
            key={activity._id}
            className={`rounded-lg p-4 border transition-all ${
              isAvailable
                ? "bg-zinc-900 border-zinc-700 hover:border-zinc-600"
                : "bg-zinc-900/50 border-zinc-800 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{activity.name}</h3>
                  {isAvailable && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">
                      Ready
                    </span>
                  )}
                  {!activity.enabled && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-400">
                      Disabled
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-500 mt-1">{activity.description}</p>

                {/* Debug reasons */}
                {debugInfo && !debugInfo.available && debugInfo.reasons.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {debugInfo.reasons.map((reason, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-right text-sm space-y-1 flex-shrink-0">
                <div className="text-zinc-400">
                  ⚡ {Math.round(activity.energyCost * 100)}%
                </div>
                <div className="text-zinc-500">
                  {activity.executionCount} runs
                </div>
                {cooldownRemaining > 0 && (
                  <div className="text-yellow-500">
                    ⏳ {formatCooldown(cooldownRemaining)}
                  </div>
                )}
              </div>
            </div>

            {/* Cooldown bar */}
            {cooldownRemaining > 0 && (
              <div className="mt-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500/50 transition-all"
                  style={{
                    width: `${(cooldownRemaining / activity.cooldownMs) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatCooldown(ms: number): string {
  const minutes = Math.ceil(ms / 1000 / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}
