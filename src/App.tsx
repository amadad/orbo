import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Dashboard } from "./components/Dashboard";
import { Onboarding } from "./components/Onboarding";
import { Box, Flex, Spinner, Text } from "@radix-ui/themes";

export function App() {
  const being = useQuery(api.being.get);
  const isLoading = being === undefined;

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

  return <Dashboard being={being} />;
}
