import type { Doc } from "../../convex/_generated/dataModel";
import { Card, Flex, Text, Box, Badge } from "@radix-ui/themes";

interface MemoryFeedProps {
  memories: Doc<"shortTermMemory">[];
}

const typeIcons: Record<string, string> = {
  activity: "🎯",
  thought: "💭",
  observation: "👁️",
  interaction: "💬",
};

const typeColors: Record<string, "blue" | "violet" | "green" | "yellow" | "gray"> = {
  activity: "blue",
  thought: "violet",
  observation: "green",
  interaction: "yellow",
};

export function MemoryFeed({ memories }: MemoryFeedProps) {
  if (memories.length === 0) {
    return (
      <Card size="3">
        <Flex direction="column" align="center" py="4">
          <Text color="gray">No memories yet.</Text>
          <Text size="2" color="gray" mt="1">
            Memories will appear as activities are executed.
          </Text>
        </Flex>
      </Card>
    );
  }

  return (
    <Flex direction="column" gap="3">
      {memories.map((memory) => (
        <Card
          key={memory._id}
          size="2"
          style={{
            borderLeft: `3px solid var(--${typeColors[memory.type] ?? "gray"}-9)`,
          }}
        >
          <Flex gap="3">
            <Text size="4">{typeIcons[memory.type] ?? "📝"}</Text>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="2" style={{ lineHeight: 1.5 }}>
                {memory.content}
              </Text>
              <Flex align="center" gap="2" mt="2">
                <Badge size="1" color={typeColors[memory.type] ?? "gray"}>
                  {memory.type}
                </Badge>
                <Text size="1" color="gray">
                  {formatTimeAgo(memory.createdAt)}
                </Text>
                {memory.importance > 0.7 && (
                  <Badge size="1" color="yellow" variant="soft">
                    ★ Important
                  </Badge>
                )}
              </Flex>
            </Box>
          </Flex>
        </Card>
      ))}
    </Flex>
  );
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
