import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Doc } from "../../convex/_generated/dataModel";
import { useState } from "react";
import { Flex, Button, Text, Box, Spinner } from "@radix-ui/themes";

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
      <Flex align="center" gap="2">
        <Box
          width="8px"
          height="8px"
          style={{
            borderRadius: "50%",
            background: being.paused ? "var(--gray-8)" : "var(--green-9)",
            animation: being.paused ? "none" : "pulse 2s infinite",
          }}
        />
        <Text size="2" color="gray">
          {being.paused ? "Paused" : "Running"}
        </Text>
      </Flex>

      {/* Trigger button */}
      <Button
        variant="soft"
        color="gray"
        size="2"
        onClick={handleTrigger}
        disabled={isTriggering || being.paused}
      >
        {isTriggering ? (
          <Flex align="center" gap="2">
            <Spinner size="1" />
            Running...
          </Flex>
        ) : (
          <>
            <span>⚡</span>
            Trigger
          </>
        )}
      </Button>

      {/* Play/Pause button */}
      <Button
        color={being.paused ? "green" : "gray"}
        variant={being.paused ? "solid" : "soft"}
        size="2"
        onClick={handleToggle}
      >
        {being.paused ? "▶ Start" : "⏸ Pause"}
      </Button>
    </Flex>
  );
}
