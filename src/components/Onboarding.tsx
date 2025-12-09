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
  Spinner,
} from "@radix-ui/themes";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "./Avatar";

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

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <Box style={{
      minHeight: "100vh",
      background: "var(--gray-1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative"
    }}>
      <div className="bg-noise" />

      <motion.div
        layout
        style={{
          width: "100%",
          maxWidth: 420,
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(20px)",
          borderRadius: 32,
          padding: 40,
          boxShadow: "0 20px 40px rgba(0,0,0,0.05)",
          border: "1px solid rgba(255,255,255,0.5)",
          position: "relative",
          zIndex: 10
        }}
      >
        {/* Progress Dots */}
        <Flex justify="center" gap="2" mb="6">
          {[1, 2, 3].map((s) => (
            <motion.div
              key={s}
              animate={{
                width: s === step ? 24 : 8,
                background: s <= step ? "var(--violet-9)" : "var(--gray-4)"
              }}
              style={{
                height: 8,
                borderRadius: 4,
              }}
            />
          ))}
        </Flex>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Flex direction="column" align="center" gap="5">
                <Avatar
                  mood="neutral"
                  energy={0.8}
                  size={120}
                />
                <Box style={{ textAlign: "center" }}>
                  <Text size="5" weight="bold" mb="2" style={{ display: "block" }}>Hello, I'm...</Text>
                  <TextField.Root
                    size="3"
                    value={name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                    placeholder="Name your being"
                    style={{ textAlign: "center", fontSize: 18 }}
                  />
                </Box>
                <Button size="3" onClick={nextStep} disabled={!name.trim()} style={{ width: "100%", borderRadius: 12 }}>
                  Continue
                </Button>
              </Flex>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Flex direction="column" gap="4">
                <Box>
                  <Text size="5" weight="bold" mb="2" style={{ display: "block" }}>What is my purpose?</Text>
                  <Text size="2" color="gray" mb="4" style={{ display: "block" }}>Define the primary objective for {name}.</Text>
                </Box>
                <TextArea
                  size="3"
                  value={objective}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setObjective(e.target.value)}
                  placeholder="e.g., To explore the universe of digital art..."
                  rows={4}
                  style={{ borderRadius: 12 }}
                />
                <Flex gap="3" mt="2">
                  <Button size="3" variant="soft" color="gray" onClick={prevStep} style={{ flex: 1, borderRadius: 12 }}>
                    Back
                  </Button>
                  <Button size="3" onClick={nextStep} disabled={!objective.trim()} style={{ flex: 1, borderRadius: 12 }}>
                    Continue
                  </Button>
                </Flex>
              </Flex>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Flex direction="column" gap="5">
                <Box>
                  <Text size="5" weight="bold" mb="2" style={{ display: "block" }}>Personality</Text>
                  <Text size="2" color="gray" style={{ display: "block" }}>Fine-tune how {name} behaves.</Text>
                </Box>

                <Flex direction="column" gap="4">
                  {Object.entries(personality).map(([trait, value]) => (
                    <Box key={trait}>
                      <Flex justify="between" mb="1" align="center">
                        <Text size="2" weight="medium" style={{ textTransform: "capitalize" }}>{trait}</Text>
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
                </Flex>

                {error && (
                  <Box p="2" style={{ background: "var(--red-3)", borderRadius: 8 }}>
                    <Text size="1" color="red">{error}</Text>
                  </Box>
                )}

                <Flex gap="3" mt="2">
                  <Button size="3" variant="soft" color="gray" onClick={prevStep} style={{ flex: 1, borderRadius: 12 }}>
                    Back
                  </Button>
                  <Button size="3" onClick={handleCreate} disabled={isCreating} style={{ flex: 1, borderRadius: 12 }}>
                    {isCreating ? <><Spinner /> Creating...</> : "Bring to Life"}
                  </Button>
                </Flex>
              </Flex>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Box>
  );
}
