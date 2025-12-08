import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Dashboard } from "./components/Dashboard";
import { VisualDashboard } from "./components/VisualDashboard";
import { Onboarding } from "./components/Onboarding";
import { Box, Flex, Spinner, Text } from "@radix-ui/themes";
import { useState } from "react";

export function App() {
  const being = useQuery(api.being.get);
  const isLoading = being === undefined;
  const [showDetails, setShowDetails] = useState(false);

  if (isLoading) {
    return (
      <Box style={{ minHeight: "100vh", background: "var(--gray-1)" }}>
        <Flex align="center" justify="center" style={{ minHeight: "100vh" }}>
          <Flex align="center" gap="3">
            <Spinner size="2" />
            <Text color="gray">Loading...</Text>
          </Flex>
        </Flex>
      </Box>
    );
  }

  if (!being) {
    return <Onboarding />;
  }

  if (showDetails) {
    return (
      <Box style={{ position: "relative" }}>
        <Box
          onClick={() => setShowDetails(false)}
          style={{
            position: "fixed",
            top: 12,
            left: 12,
            zIndex: 100,
            background: "var(--gray-3)",
            borderRadius: 8,
            padding: "6px 12px",
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          ← Back
        </Box>
        <Dashboard being={being} />
      </Box>
    );
  }

  return <VisualDashboard being={being} onOpenDetails={() => setShowDetails(true)} />;
}
