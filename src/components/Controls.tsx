import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { Flex, Text, Spinner, Box, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";

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
    <Flex align="center" gap="3">
      {/* Status indicator */}
      <Flex align="center" gap="2" style={{ background: "rgba(0,0,0,0.05)", padding: "4px 12px", borderRadius: 20 }}>
        <motion.div
          animate={{ scale: being.paused ? 1 : [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: being.paused ? "var(--gray-8)" : "var(--green-9)",
          }}
        />
        <Text size="2" weight="medium" color="gray">
          {being.paused ? "Paused" : "Running"}
        </Text>
      </Flex>

      {/* Trigger button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleTrigger}
        disabled={isTriggering || being.paused}
        style={{
          background: isTriggering || being.paused ? "rgba(255,255,255,0.1)" : "white",
          border: isTriggering || being.paused ? "1px solid rgba(255,255,255,0.1)" : "1px solid var(--gray-4)",
          borderRadius: 999,
          padding: "6px 16px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: isTriggering || being.paused ? "not-allowed" : "pointer",
          opacity: 1, // Keep opacity high for legibility
          color: isTriggering || being.paused ? "rgba(255,255,255,0.5)" : "var(--gray-12)",
          fontSize: 13,
          fontWeight: 500,
          boxShadow: isTriggering || being.paused ? "none" : "0 2px 4px rgba(0,0,0,0.05)"
        }}
      >
        {isTriggering ? (
          <Flex align="center" gap="2">
            <Spinner size="1" />
            <span>Running...</span>
          </Flex>
        ) : (
          <>
            <span>⚡</span>
            <span>Trigger</span>
          </>
        )}
      </motion.button>

      {/* Play/Pause button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        style={{
          background: being.paused ? "var(--green-9)" : "var(--gray-3)",
          color: being.paused ? "white" : "var(--gray-11)",
          border: "none",
          borderRadius: 999,
          padding: "6px 16px",
          display: "flex",
          alignItems: "center",
          gap: 6,
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 500,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}
      >
        {being.paused ? "▶ Start" : "⏸ Pause"}
      </motion.button>
    </Flex>
  );
}
