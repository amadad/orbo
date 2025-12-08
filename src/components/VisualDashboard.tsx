import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { Avatar } from "./Avatar";
import { Controls } from "./Controls";
import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  Badge,
  Dialog,
  ScrollArea,
  IconButton,
} from "@radix-ui/themes";

interface VisualDashboardProps {
  being: Doc<"beingState">;
  onOpenDetails: () => void;
}

export function VisualDashboard({ being, onOpenDetails }: VisualDashboardProps) {
  const recentMemories = useQuery(api.memory.getRecent, { limit: 5 }) ?? [];
  const history = useQuery(api.activities.getHistory, { limit: 3 }) ?? [];
  const recentImages = useQuery(api.activityRunner.getRecentImages, { limit: 1 }) ?? [];

  const [showMemories, setShowMemories] = useState(false);
  const [showActivity, setShowActivity] = useState(false);

  const latestMemory = recentMemories[0];
  const latestActivity = history[0];
  const latestImage = recentImages[0];

  return (
    <Box
      style={{
        height: "100vh",
        background: "linear-gradient(180deg, var(--gray-1) 0%, var(--gray-2) 100%)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Minimal Header */}
      <Flex justify="between" align="center" px="4" py="3">
        <Text size="2" weight="medium" color="gray">{being.name}</Text>
        <Flex gap="2" align="center">
          <Controls being={being} />
          <IconButton
            variant="ghost"
            size="1"
            onClick={onOpenDetails}
            style={{ cursor: "pointer" }}
          >
            <Text size="1">⚙</Text>
          </IconButton>
        </Flex>
      </Flex>

      {/* Main Content - Centered Avatar */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ flex: 1, gap: 32 }}
      >
        {/* Avatar */}
        <Avatar
          mood={being.mood}
          energy={being.energy}
          name={being.name}
          size={240}
        />

        {/* Status Text */}
        <Flex direction="column" align="center" gap="2">
          <Text size="5" weight="medium">{getMoodEmoji(being.mood)} {being.mood}</Text>
          <Text size="2" color="gray">{Math.round(being.energy * 100)}% energy</Text>
        </Flex>

        {/* Quick Stats Row */}
        <Flex gap="4" wrap="wrap" justify="center" style={{ maxWidth: 400 }}>
          {/* Latest Thought */}
          <Box
            onClick={() => setShowMemories(true)}
            style={{
              background: "var(--gray-3)",
              borderRadius: 12,
              padding: "12px 16px",
              cursor: "pointer",
              maxWidth: 180,
              transition: "transform 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.background = "var(--gray-4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.background = "var(--gray-3)";
            }}
          >
            <Text size="1" color="gray" style={{ display: "block", marginBottom: 4 }}>
              💭 Latest Thought
            </Text>
            <Text size="1" style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.4,
            }}>
              {latestMemory?.content || "No thoughts yet..."}
            </Text>
          </Box>

          {/* Latest Activity */}
          <Box
            onClick={() => setShowActivity(true)}
            style={{
              background: "var(--gray-3)",
              borderRadius: 12,
              padding: "12px 16px",
              cursor: "pointer",
              maxWidth: 180,
              transition: "transform 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.background = "var(--gray-4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.background = "var(--gray-3)";
            }}
          >
            <Text size="1" color="gray" style={{ display: "block", marginBottom: 4 }}>
              ⚡ Latest Activity
            </Text>
            <Flex align="center" gap="2">
              <Text size="1">{latestActivity?.activityName || "None yet"}</Text>
              {latestActivity && (
                <Box
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: latestActivity.success ? "var(--green-9)" : "var(--red-9)",
                  }}
                />
              )}
            </Flex>
          </Box>
        </Flex>

        {/* Latest Generated Image (if any) */}
        {latestImage?.url && (
          <Box
            style={{
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
              maxWidth: 200,
            }}
          >
            <img
              src={latestImage.url}
              alt={latestImage.prompt}
              style={{ width: "100%", display: "block" }}
            />
          </Box>
        )}
      </Flex>

      {/* Objective Footer */}
      <Box px="4" py="3" style={{ borderTop: "1px solid var(--gray-3)" }}>
        <Text size="1" color="gray" style={{ textAlign: "center", display: "block" }}>
          🎯 {being.objectives.primary}
        </Text>
      </Box>

      {/* Memories Dialog */}
      <Dialog.Root open={showMemories} onOpenChange={setShowMemories}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Recent Memories</Dialog.Title>
          <ScrollArea style={{ maxHeight: 400 }}>
            <Flex direction="column" gap="3" pr="3">
              {recentMemories.map((memory) => (
                <Box
                  key={memory._id}
                  p="3"
                  style={{ background: "var(--gray-2)", borderRadius: 8 }}
                >
                  <Text size="2" style={{ lineHeight: 1.5, display: "block" }}>
                    {memory.content}
                  </Text>
                  <Flex gap="2" mt="2" align="center">
                    <Badge size="1" color={getMemoryColor(memory.type)} variant="soft">
                      {memory.type}
                    </Badge>
                    <Text size="1" color="gray">{formatTimeAgo(memory.createdAt)}</Text>
                  </Flex>
                </Box>
              ))}
            </Flex>
          </ScrollArea>
        </Dialog.Content>
      </Dialog.Root>

      {/* Activity Dialog */}
      <Dialog.Root open={showActivity} onOpenChange={setShowActivity}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Recent Activity</Dialog.Title>
          <ScrollArea style={{ maxHeight: 400 }}>
            <Flex direction="column" gap="3" pr="3">
              {history.map((h) => (
                <Box
                  key={h._id}
                  p="3"
                  style={{ background: "var(--gray-2)", borderRadius: 8 }}
                >
                  <Flex justify="between" align="center">
                    <Text size="2" weight="medium">{h.activityName}</Text>
                    <Box
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: h.success ? "var(--green-9)" : "var(--red-9)",
                      }}
                    />
                  </Flex>
                  <Flex gap="3" mt="2">
                    <Text size="1" color="gray">
                      Energy: {Math.round(h.energyBefore * 100)}% → {Math.round(h.energyAfter * 100)}%
                    </Text>
                    <Text size="1" color="gray">
                      {h.durationMs}ms
                    </Text>
                  </Flex>
                  <Text size="1" color="gray" style={{ display: "block", marginTop: 4 }}>
                    {formatTimeAgo(h.executedAt)}
                  </Text>
                </Box>
              ))}
            </Flex>
          </ScrollArea>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}

function getMoodEmoji(mood: string): string {
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

function getMemoryColor(type: string): "blue" | "violet" | "green" | "yellow" | "gray" {
  const colors: Record<string, "blue" | "violet" | "green" | "yellow" | "gray"> = {
    activity: "blue",
    thought: "violet",
    observation: "green",
    interaction: "yellow",
  };
  return colors[type] ?? "gray";
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
