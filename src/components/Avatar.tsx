import { Box } from "@radix-ui/themes";
import { useMemo } from "react";

interface AvatarProps {
  mood: string;
  energy: number;
  name: string;
  size?: number;
}

// Mood to gradient color mapping
const moodGradients: Record<string, { from: string; to: string }> = {
  neutral: { from: "#8b5cf6", to: "#6366f1" },    // violet to indigo
  curious: { from: "#06b6d4", to: "#3b82f6" },    // cyan to blue
  creative: { from: "#f472b6", to: "#c084fc" },   // pink to purple
  focused: { from: "#10b981", to: "#14b8a6" },    // emerald to teal
  tired: { from: "#6b7280", to: "#9ca3af" },      // gray shades
  happy: { from: "#fbbf24", to: "#f97316" },      // amber to orange
};

export function Avatar({ mood, energy, name, size = 200 }: AvatarProps) {
  const gradient = moodGradients[mood] || moodGradients.neutral;

  // Animation speed based on energy (more energy = faster bounce)
  const animationDuration = useMemo(() => {
    // Range from 3s (low energy) to 1s (high energy)
    return 3 - (energy * 2);
  }, [energy]);

  // Bounce amplitude based on energy
  const bounceAmount = useMemo(() => {
    // Range from 2px (low energy) to 15px (high energy)
    return Math.max(2, energy * 15);
  }, [energy]);

  // Pulse scale based on mood
  const pulseScale = useMemo(() => {
    if (mood === "creative" || mood === "happy") return 1.08;
    if (mood === "curious") return 1.05;
    if (mood === "tired") return 1.01;
    return 1.03;
  }, [mood]);

  return (
    <Box
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Outer glow */}
      <Box
        style={{
          position: "absolute",
          width: size * 0.9,
          height: size * 0.9,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${gradient.from}40 0%, transparent 70%)`,
          animation: `pulse ${animationDuration * 1.5}s ease-in-out infinite`,
        }}
      />

      {/* Main avatar orb */}
      <Box
        style={{
          width: size * 0.7,
          height: size * 0.7,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
          boxShadow: `
            0 0 ${size * 0.2}px ${gradient.from}60,
            0 0 ${size * 0.4}px ${gradient.from}30,
            inset 0 -${size * 0.05}px ${size * 0.1}px rgba(0,0,0,0.3),
            inset 0 ${size * 0.05}px ${size * 0.1}px rgba(255,255,255,0.2)
          `,
          animation: `bounce ${animationDuration}s ease-in-out infinite`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Inner highlight */}
        <Box
          style={{
            width: "30%",
            height: "30%",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.3)",
            transform: "translate(-30%, -30%)",
            filter: "blur(8px)",
          }}
        />
      </Box>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes bounce {
            0%, 100% {
              transform: translateY(0) scale(1);
            }
            50% {
              transform: translateY(-${bounceAmount}px) scale(${pulseScale});
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 0.6;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.1);
            }
          }
        `}
      </style>
    </Box>
  );
}
