import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { useState } from "react";

interface ControlsProps {
  being: Doc<"beingState">;
}

export function Controls({ being }: ControlsProps) {
  const [isTriggering, setIsTriggering] = useState(false);

  const setPaused = useMutation(api.being.setPaused);
  const triggerNow = useAction(api.loop.triggerNow);

  const handleToggle = async () => {
    await setPaused({ paused: !being.paused });
  };

  const handleTrigger = async () => {
    setIsTriggering(true);
    try {
      await triggerNow();
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            being.paused ? "bg-zinc-500" : "bg-green-500 animate-pulse"
          }`}
        />
        <span className="text-sm text-zinc-400">
          {being.paused ? "Paused" : "Running"}
        </span>
      </div>

      {/* Trigger button */}
      <button
        onClick={handleTrigger}
        disabled={isTriggering || being.paused}
        className="px-3 py-1.5 text-sm rounded-lg bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
      >
        {isTriggering ? (
          <>
            <div className="w-3 h-3 border-2 border-zinc-500 border-t-zinc-300 rounded-full animate-spin" />
            Running...
          </>
        ) : (
          <>
            <span>⚡</span>
            Trigger
          </>
        )}
      </button>

      {/* Play/Pause button */}
      <button
        onClick={handleToggle}
        className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors ${
          being.paused
            ? "bg-green-600 hover:bg-green-500 text-white"
            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
        }`}
      >
        {being.paused ? "▶ Start" : "⏸ Pause"}
      </button>
    </div>
  );
}
