import type { Doc } from "../../convex/_generated/dataModel";

interface MemoryFeedProps {
  memories: Doc<"shortTermMemory">[];
}

const typeIcons: Record<string, string> = {
  activity: "🎯",
  thought: "💭",
  observation: "👁️",
  interaction: "💬",
};

const typeColors: Record<string, string> = {
  activity: "border-l-blue-500",
  thought: "border-l-violet-500",
  observation: "border-l-green-500",
  interaction: "border-l-yellow-500",
};

export function MemoryFeed({ memories }: MemoryFeedProps) {
  if (memories.length === 0) {
    return (
      <div className="bg-zinc-900 rounded-lg p-6 border border-zinc-800 text-center">
        <p className="text-zinc-500">No memories yet.</p>
        <p className="text-sm text-zinc-600 mt-1">
          Memories will appear as activities are executed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {memories.map((memory) => (
        <div
          key={memory._id}
          className={`bg-zinc-900 rounded-lg p-4 border border-zinc-800 border-l-2 ${
            typeColors[memory.type] ?? "border-l-zinc-500"
          }`}
        >
          <div className="flex items-start gap-3">
            <span className="text-lg">{typeIcons[memory.type] ?? "📝"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-zinc-300 leading-relaxed">
                {memory.content}
              </p>
              <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                <span className="capitalize">{memory.type}</span>
                <span>•</span>
                <span>{formatTimeAgo(memory.createdAt)}</span>
                {memory.importance > 0.7 && (
                  <>
                    <span>•</span>
                    <span className="text-yellow-500">★ Important</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
