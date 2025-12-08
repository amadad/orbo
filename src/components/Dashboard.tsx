import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { Controls } from "./Controls";
import {
  Box,
  Flex,
  Text,
  Avatar,
  Card,
  Badge,
  Progress,
  IconButton,
  Tooltip,
  ScrollArea,
} from "@radix-ui/themes";

interface DashboardProps {
  being: Doc<"beingState">;
}

export function Dashboard({ being }: DashboardProps) {
  const activities = useQuery(api.activities.list) ?? [];
  const availableActivities = useQuery(api.activities.getAvailable) ?? [];
  const recentMemories = useQuery(api.memory.getRecent, { limit: 20 }) ?? [];
  const history = useQuery(api.activities.getHistory, { limit: 5 }) ?? [];
  const recentImages = useQuery(api.activityRunner.getRecentImages, { limit: 4 }) ?? [];

  return (
    <Box
      style={{
        height: "100vh",
        background: "var(--gray-1)",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        overflow: "hidden",
      }}
    >
      {/* Compact Header */}
      <Box px="4" py="3" style={{ borderBottom: "1px solid var(--gray-4)" }}>
        <Flex justify="between" align="center">
          <Flex align="center" gap="3">
            <Avatar
              size="3"
              fallback={being.name[0]}
              radius="full"
              style={{
                background: "linear-gradient(135deg, var(--violet-9), var(--plum-9))",
              }}
            />
            <Box>
              <Text size="2" weight="medium">{being.name}</Text>
              <Text size="1" color="gray" style={{ display: "block", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {being.objectives.primary}
              </Text>
            </Box>
          </Flex>
          <Controls being={being} />
        </Flex>
      </Box>

      {/* Main Grid */}
      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr 280px",
          gap: 1,
          background: "var(--gray-4)",
          overflow: "hidden",
        }}
      >
        {/* Left: Status Panel */}
        <Box p="3" style={{ background: "var(--gray-1)", overflow: "auto" }}>
          {/* Energy */}
          <Box mb="4">
            <Flex justify="between" align="center" mb="1">
              <Text size="1" color="gray">Energy</Text>
              <Text size="1" weight="medium">{Math.round(being.energy * 100)}%</Text>
            </Flex>
            <Progress
              value={being.energy * 100}
              color={being.energy > 0.5 ? "green" : being.energy > 0.2 ? "yellow" : "red"}
              size="1"
            />
          </Box>

          {/* Mood */}
          <Box mb="4">
            <Text size="1" color="gray" mb="2" style={{ display: "block" }}>Mood</Text>
            <Flex gap="1" wrap="wrap">
              {["neutral", "curious", "creative", "focused", "tired"].map((mood) => (
                <Badge
                  key={mood}
                  size="1"
                  color={being.mood === mood ? "violet" : "gray"}
                  variant={being.mood === mood ? "solid" : "soft"}
                >
                  {mood}
                </Badge>
              ))}
            </Flex>
          </Box>

          {/* Personality */}
          <Box mb="4">
            <Text size="1" color="gray" mb="2" style={{ display: "block" }}>Personality</Text>
            <Flex direction="column" gap="2">
              {Object.entries(being.personality).map(([trait, value]) => (
                <Box key={trait}>
                  <Flex justify="between" mb="1">
                    <Text size="1" style={{ textTransform: "capitalize" }}>{trait}</Text>
                    <Text size="1" color="gray">{Math.round(value * 100)}%</Text>
                  </Flex>
                  <Progress value={value * 100} size="1" color="gray" />
                </Box>
              ))}
            </Flex>
          </Box>

          {/* Activities */}
          <Box mb="4">
            <Flex justify="between" align="center" mb="2">
              <Text size="1" color="gray">Activities</Text>
              <Text size="1" color="gray">{availableActivities.length}/{activities.length}</Text>
            </Flex>
            <Flex direction="column" gap="1">
              {activities.slice(0, 6).map((activity) => {
                const isAvailable = availableActivities.some(a => a._id === activity._id);
                return (
                  <Flex key={activity._id} justify="between" align="center" py="1">
                    <Text size="1" color={isAvailable ? undefined : "gray"} style={{ opacity: isAvailable ? 1 : 0.5 }}>
                      {activity.name}
                    </Text>
                    {isAvailable && (
                      <Box
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "var(--green-9)",
                        }}
                      />
                    )}
                  </Flex>
                );
              })}
            </Flex>
          </Box>

          {/* Generated Images */}
          {recentImages.length > 0 && (
            <Box>
              <Text size="1" color="gray" mb="2" style={{ display: "block" }}>Generated Images</Text>
              <Flex direction="column" gap="2">
                {recentImages.map((img) => (
                  <Box key={img._id}>
                    {img.url && (
                      <img
                        src={img.url}
                        alt={img.prompt}
                        style={{
                          width: "100%",
                          borderRadius: 6,
                          marginBottom: 4,
                        }}
                      />
                    )}
                    <Text size="1" color="gray" style={{ display: "block", fontSize: 10, lineHeight: 1.3 }}>
                      {img.prompt.slice(0, 80)}...
                    </Text>
                  </Box>
                ))}
              </Flex>
            </Box>
          )}
        </Box>

        {/* Center: Memory Stream */}
        <ScrollArea style={{ background: "var(--gray-1)" }}>
          <Box p="3">
            <Text size="1" color="gray" mb="3" style={{ display: "block" }}>Memory Stream</Text>
            <Flex direction="column" gap="2">
              {recentMemories.length === 0 ? (
                <Text size="1" color="gray">No memories yet</Text>
              ) : (
                recentMemories.map((memory) => (
                  <Box
                    key={memory._id}
                    py="2"
                    style={{ borderBottom: "1px solid var(--gray-3)" }}
                  >
                    <Text size="1" style={{ lineHeight: 1.5 }}>
                      {memory.content}
                    </Text>
                    <Flex gap="2" mt="1" align="center">
                      <Badge size="1" color={getMemoryColor(memory.type)} variant="soft">
                        {memory.type}
                      </Badge>
                      <Text size="1" color="gray">{formatTimeAgo(memory.createdAt)}</Text>
                    </Flex>
                  </Box>
                ))
              )}
            </Flex>
          </Box>
        </ScrollArea>

        {/* Right: History */}
        <Box p="3" style={{ background: "var(--gray-1)", overflow: "auto" }}>
          <Text size="1" color="gray" mb="3" style={{ display: "block" }}>Recent Activity</Text>
          <Flex direction="column" gap="2">
            {history.length === 0 ? (
              <Text size="1" color="gray">No activity yet</Text>
            ) : (
              history.map((h) => (
                <Box key={h._id} py="2" style={{ borderBottom: "1px solid var(--gray-3)" }}>
                  <Flex justify="between" align="center">
                    <Text size="1" weight="medium">{h.activityName}</Text>
                    <Box
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: h.success ? "var(--green-9)" : "var(--red-9)",
                      }}
                    />
                  </Flex>
                  <Flex gap="2" mt="1">
                    <Text size="1" color="gray">
                      -{Math.round((h.energyBefore - h.energyAfter) * 100)}%
                    </Text>
                    <Text size="1" color="gray">{h.durationMs}ms</Text>
                  </Flex>
                </Box>
              ))
            )}
          </Flex>
        </Box>
      </Box>
    </Box>
  );
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
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}
