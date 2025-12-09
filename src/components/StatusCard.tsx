import type { ReactNode } from "react";
import { Flex, Text, Box } from "@radix-ui/themes";
import { motion } from "framer-motion";

interface StatusCardProps {
  label: string;
  value: string;
  icon: string;
  color: "green" | "yellow" | "red" | "blue" | "purple";
  children?: ReactNode;
}

const colorStyles = {
  green: { from: "var(--green-3)", to: "var(--green-2)", border: "var(--green-6)" },
  yellow: { from: "var(--yellow-3)", to: "var(--yellow-2)", border: "var(--yellow-6)" },
  red: { from: "var(--red-3)", to: "var(--red-2)", border: "var(--red-6)" },
  blue: { from: "var(--blue-3)", to: "var(--blue-2)", border: "var(--blue-6)" },
  purple: { from: "var(--violet-3)", to: "var(--violet-2)", border: "var(--violet-6)" },
};

export function StatusCard({ label, value, icon, color, children }: StatusCardProps) {
  const styles = colorStyles[color];

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: `linear-gradient(135deg, ${styles.from}, ${styles.to})`,
        border: `1px solid ${styles.border}`,
        borderRadius: 24,
        padding: 24,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
      }}
    >
      <Flex justify="between" align="start">
        <Box>
          <Text size="2" weight="medium" style={{ display: "block", color: "var(--gray-11)", textTransform: "uppercase", letterSpacing: "0.05em", fontSize: 11 }}>
            {label}
          </Text>
          <Text size="6" weight="bold" style={{ textTransform: "capitalize", letterSpacing: "-0.02em", color: "var(--gray-12)" }}>
            {value}
          </Text>
        </Box>
        <Box
          style={{
            fontSize: 32,
            opacity: 0.8,
            filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
          }}
        >
          {icon}
        </Box>
      </Flex>
      {children}
    </motion.div>
  );
}
