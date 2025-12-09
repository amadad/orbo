// Shared formatting utilities

export function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function getMemoryColor(type: string): "blue" | "violet" | "green" | "yellow" | "gray" {
  const colors: Record<string, "blue" | "violet" | "green" | "yellow" | "gray"> = {
    activity: "blue",
    thought: "violet",
    observation: "green",
    interaction: "yellow",
  };
  return colors[type] ?? "gray";
}

export function getMoodEmoji(mood: string): string {
  const emojis: Record<string, string> = {
    neutral: "😐",
    curious: "🤔",
    creative: "✨",
    focused: "🎯",
    tired: "😴",
    happy: "😊",
  };
  return emojis[mood] || "🤖";
}
