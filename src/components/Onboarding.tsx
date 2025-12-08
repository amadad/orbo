import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import {
  Box,
  Flex,
  Text,
  TextField,
  TextArea,
  Button,
  Slider,
  Avatar,
} from "@radix-ui/themes";

export function Onboarding() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("Orbo");
  const [objective, setObjective] = useState("");
  const [personality, setPersonality] = useState({
    friendliness: 0.7,
    creativity: 0.8,
    curiosity: 0.9,
    enthusiasm: 0.75,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialize = useMutation(api.seed.initialize);

  const handleCreate = async () => {
    if (!objective.trim()) {
      setError("Please enter an objective");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await initialize({
        name,
        primaryObjective: objective,
        personality,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create being");
      setIsCreating(false);
    }
  };

  return (
    <Box style={{ minHeight: "100vh", background: "var(--gray-1)" }}>
      <Flex direction="column" align="center" justify="center" style={{ minHeight: "100vh" }} p="4">
        <Box style={{ width: "100%", maxWidth: 360 }}>
          {/* Logo */}
          <Flex direction="column" align="center" mb="6">
            <Avatar
              size="5"
              fallback={name[0] || "O"}
              radius="full"
              style={{ background: "linear-gradient(135deg, var(--violet-9), var(--plum-9))" }}
            />
            <Text size="5" weight="medium" mt="3">{step === 1 ? "Name your being" : step === 2 ? "Set objective" : "Personality"}</Text>
          </Flex>

          {/* Steps */}
          <Flex justify="center" gap="1" mb="5">
            {[1, 2, 3].map((s) => (
              <Box
                key={s}
                style={{
                  width: 24,
                  height: 2,
                  borderRadius: 1,
                  background: s <= step ? "var(--violet-9)" : "var(--gray-6)",
                }}
              />
            ))}
          </Flex>

          {step === 1 && (
            <Flex direction="column" gap="4">
              <TextField.Root
                size="3"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name"
              />
              <Button size="3" onClick={() => setStep(2)} disabled={!name.trim()}>
                Continue
              </Button>
            </Flex>
          )}

          {step === 2 && (
            <Flex direction="column" gap="4">
              <TextArea
                size="2"
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                placeholder="What should this being do?"
                rows={3}
              />
              <Flex gap="2">
                <Button size="3" variant="soft" color="gray" onClick={() => setStep(1)} style={{ flex: 1 }}>
                  Back
                </Button>
                <Button size="3" onClick={() => setStep(3)} disabled={!objective.trim()} style={{ flex: 1 }}>
                  Continue
                </Button>
              </Flex>
            </Flex>
          )}

          {step === 3 && (
            <Flex direction="column" gap="4">
              {Object.entries(personality).map(([trait, value]) => (
                <Box key={trait}>
                  <Flex justify="between" mb="1">
                    <Text size="1" style={{ textTransform: "capitalize" }}>{trait}</Text>
                    <Text size="1" color="gray">{Math.round(value * 100)}%</Text>
                  </Flex>
                  <Slider
                    size="1"
                    value={[value * 100]}
                    onValueChange={(v) => setPersonality((p) => ({ ...p, [trait]: v[0] / 100 }))}
                    min={0}
                    max={100}
                  />
                </Box>
              ))}

              {error && (
                <Text size="1" color="red">{error}</Text>
              )}

              <Flex gap="2">
                <Button size="3" variant="soft" color="gray" onClick={() => setStep(2)} style={{ flex: 1 }}>
                  Back
                </Button>
                <Button size="3" onClick={handleCreate} disabled={isCreating} style={{ flex: 1 }}>
                  {isCreating ? "Creating..." : "Create"}
                </Button>
              </Flex>
            </Flex>
          )}
        </Box>
      </Flex>
    </Box>
  );
}
