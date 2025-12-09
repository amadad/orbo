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
import { motion } from "framer-motion";
import { formatTimeAgo, getMemoryColor, getMoodEmoji } from "../utils/format";

interface VisualDashboardProps {
  being: Doc<"beingState">;
  onOpenDetails: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    } as any,
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    } as any,
  },
};

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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      style={{
        height: "100vh",
        background: "linear-gradient(180deg, var(--gray-1) 0%, var(--gray-3) 100%)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "var(--font-family-sans)",
      }}
    >
      <div className="bg-noise" />
      {/* Organic Header */}
      <Flex justify="between" align="center" px="5" py="4">
        <motion.div variants={itemVariants}>
          <Text size="3" weight="bold" style={{ letterSpacing: "-0.02em" }}>
            {being.name}
          </Text>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Flex gap="3" align="center">
            <Controls being={being} />
            <IconButton
              variant="soft"
              size="2"
              onClick={onOpenDetails}
              style={{ cursor: "pointer", borderRadius: "50%" }}
            >
              <Text size="2">⚙</Text>
            </IconButton>
          </Flex>
        </motion.div>
      </Flex>

      {/* Main Content */}
      <Flex
        direction="column"
        align="center"
        justify="center"
        style={{ flex: 1, gap: 40 }}
      >
        {/* Avatar */}
        <motion.div variants={itemVariants}>
          <Avatar
            mood={being.mood}
            energy={being.energy}
            size={400}
            activity={latestActivity?.activityName}
          />
        </motion.div>

        {/* Status: Mood + Energy + Current Activity */}
        <motion.div variants={itemVariants}>
          <Flex direction="column" align="center" gap="2">
            <Text size="6" weight="medium" style={{ letterSpacing: "-0.01em" }}>
              {getMoodEmoji(being.mood)} {being.mood}
            </Text>
            <Flex align="center" gap="3">
              <Text size="2" color="gray">{Math.round(being.energy * 100)}% energy</Text>
              {latestActivity && (
                <>
                  <Text size="2" color="gray">·</Text>
                  <Flex
                    align="center"
                    gap="2"
                    onClick={() => setShowActivity(true)}
                    style={{ cursor: "pointer" }}
                  >
                    <Box
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: latestActivity.success ? "var(--green-9)" : "var(--red-9)",
                      }}
                    />
                    <Text size="2" weight="medium" style={{ color: "var(--gray-11)" }}>
                      {latestActivity.activityName?.replace(/_/g, " ")}
                    </Text>
                  </Flex>
                </>
              )}
            </Flex>
          </Flex>
        </motion.div>

        {/* Latest Memory - contextual display */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01 }}
          onClick={() => setShowMemories(true)}
          style={{
            width: "100%",
            maxWidth: 480,
            padding: "0 24px",
            cursor: "pointer",
          }}
        >
          <Flex
            direction="column"
            gap="3"
            style={{ background: "var(--gray-2)", borderRadius: 16, padding: 20 }}
          >
            {/* If this memory is about image generation, show the image */}
            {latestMemory?.content?.toLowerCase().includes("created an image") && latestImage?.url && (
              <Box
                style={{
                  width: "100%",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <img
                  src={latestImage.url}
                  alt={latestImage.prompt}
                  style={{
                    width: "100%",
                    height: "auto",
                    display: "block"
                  }}
                />
              </Box>
            )}

            {/* Memory text */}
            <Flex direction="column" gap="1">
              <Text size="3" style={{ lineHeight: 1.6 }}>
                {latestMemory?.content || "Waiting for first thought..."}
              </Text>
              {latestMemory && (
                <Text size="1" color="gray">
                  {formatTimeAgo(latestMemory.createdAt)}
                </Text>
              )}
            </Flex>
          </Flex>
        </motion.div>

      </Flex>

      {/* Objective Footer */}
      <motion.div variants={itemVariants}>
        <Box px="4" py="4" style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }}>
          <Text size="2" color="gray" style={{ textAlign: "center", display: "block", opacity: 0.8 }}>
            🎯 {being.objectives.primary}
          </Text>
        </Box>
      </motion.div>

      {/* Memories Dialog using Radix (simpler than replacing with Motion modal for now) */}
      <Dialog.Root open={showMemories} onOpenChange={setShowMemories}>
        <Dialog.Content style={{ maxWidth: 450, borderRadius: 24, padding: 30 }}>
          <Dialog.Title size="5" mb="4">Recent Memories</Dialog.Title>
          <ScrollArea style={{ maxHeight: 400 }}>
            <Flex direction="column" gap="3" pr="3">
              {recentMemories.map((memory: Doc<"shortTermMemory">) => (
                <Box
                  key={memory._id}
                  p="3"
                  style={{ background: "var(--gray-2)", borderRadius: 16 }}
                >
                  <Text size="2" style={{ lineHeight: 1.5, display: "block" }}>
                    {memory.content}
                  </Text>
                  <Flex gap="2" mt="2" align="center">
                    <Badge size="1" color={getMemoryColor(memory.type)} variant="soft" radius="full">
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
        <Dialog.Content style={{ maxWidth: 450, borderRadius: 24, padding: 30 }}>
          <Dialog.Title size="5" mb="4">Recent Activity</Dialog.Title>
          <ScrollArea style={{ maxHeight: 400 }}>
            <Flex direction="column" gap="3" pr="3">
              {history.map((h: Doc<"activityHistory">) => (
                <Box
                  key={h._id}
                  p="3"
                  style={{ background: "var(--gray-2)", borderRadius: 16 }}
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
    </motion.div>
  );
}

