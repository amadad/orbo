import type { Doc } from "../../convex/_generated/dataModel";
import { Card, Flex, Text, Badge, Box, Progress } from "@radix-ui/themes";

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
    <Flex direction="column" gap="3">
      {activities.map((activity) => {
        const isAvailable = availableNames.has(activity.name);
        const debugInfo = debugMap.get(activity.name);
        const cooldownRemaining = activity.lastExecutedAt
          ? Math.max(0, activity.lastExecutedAt + activity.cooldownMs - Date.now())
          : 0;

        return (
          <Card
            key={activity._id}
            size="2"
            style={{
              opacity: isAvailable ? 1 : 0.6,
              background: isAvailable ? "var(--gray-2)" : "var(--gray-1)",
            }}
          >
            <Flex justify="between" gap="4">
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Flex align="center" gap="2">
                  <Text weight="medium" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {activity.name}
                  </Text>
                  {isAvailable && (
                    <Badge color="green" size="1">
                      Ready
                    </Badge>
                  )}
                  {!activity.enabled && (
                    <Badge color="gray" size="1">
                      Disabled
                    </Badge>
                  )}
                </Flex>
                <Text size="2" color="gray" mt="1" style={{ display: "block" }}>
                  {activity.description}
                </Text>

                {debugInfo && !debugInfo.available && debugInfo.reasons.length > 0 && (
                  <Flex gap="1" wrap="wrap" mt="2">
                    {debugInfo.reasons.map((reason, i) => (
                      <Badge key={i} color="gray" variant="soft" size="1">
                        {reason}
                      </Badge>
                    ))}
                  </Flex>
                )}
              </Box>

              <Flex direction="column" align="end" gap="1" style={{ flexShrink: 0 }}>
                <Text size="2" color="gray">
                  ⚡ {Math.round(activity.energyCost * 100)}%
                </Text>
                <Text size="1" color="gray">
                  {activity.executionCount} runs
                </Text>
                {cooldownRemaining > 0 && (
                  <Text size="1" color="yellow">
                    ⏳ {formatCooldown(cooldownRemaining)}
                  </Text>
                )}
              </Flex>
            </Flex>

            {cooldownRemaining > 0 && (
              <Box mt="3">
                <Progress
                  value={(cooldownRemaining / activity.cooldownMs) * 100}
                  color="yellow"
                  size="1"
                />
              </Box>
            )}
          </Card>
        );
      })}
    </Flex>
  );
}

function formatCooldown(ms: number): string {
  const minutes = Math.ceil(ms / 1000 / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}
