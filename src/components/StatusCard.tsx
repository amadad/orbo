import type { ReactNode } from "react";
import { Card, Flex, Text, Box } from "@radix-ui/themes";

interface StatusCardProps {
  label: string;
  value: string;
  icon: string;
  color: "green" | "yellow" | "red" | "blue" | "purple";
  children?: ReactNode;
}

const colorStyles = {
  green: { background: "linear-gradient(135deg, var(--green-3), var(--green-2))", borderColor: "var(--green-6)" },
  yellow: { background: "linear-gradient(135deg, var(--yellow-3), var(--yellow-2))", borderColor: "var(--yellow-6)" },
  red: { background: "linear-gradient(135deg, var(--red-3), var(--red-2))", borderColor: "var(--red-6)" },
  blue: { background: "linear-gradient(135deg, var(--blue-3), var(--blue-2))", borderColor: "var(--blue-6)" },
  purple: { background: "linear-gradient(135deg, var(--violet-3), var(--violet-2))", borderColor: "var(--violet-6)" },
};

export function StatusCard({ label, value, icon, color, children }: StatusCardProps) {
  return (
    <Card
      size="3"
      style={{
        background: colorStyles[color].background,
        borderColor: colorStyles[color].borderColor,
        borderWidth: 1,
        borderStyle: "solid",
      }}
    >
      <Flex justify="between" align="start">
        <Box>
          <Text size="2" color="gray" mb="1" style={{ display: "block" }}>
            {label}
          </Text>
          <Text size="6" weight="bold" style={{ textTransform: "capitalize" }}>
            {value}
          </Text>
        </Box>
        <Text size="6">{icon}</Text>
      </Flex>
      {children}
    </Card>
  );
}
