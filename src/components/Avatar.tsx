import { motion } from "framer-motion";
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
  const gradient = moodGradients[mood] ?? moodGradients.neutral!;

  // Animation derived from energy
  const breatheDuration = useMemo(() => 4 - (energy * 2), [energy]); // 4s (low) to 2s (high)

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Strong Outer Haze */}
      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.2, 0.4, 0.2],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: breatheDuration * 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          width: size * 1.1,
          height: size * 1.1,
          borderRadius: "50%",
          background: `conic-gradient(from 0deg, ${gradient.from}00, ${gradient.to}40, ${gradient.from}00)`,
          filter: "blur(30px)",
        }}
      />

      {/* Pulse Aura */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: breatheDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          position: "absolute",
          width: size * 0.9,
          height: size * 0.9,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${gradient.from}50 0%, transparent 70%)`,
          filter: "blur(15px)",
        }}
      />

      {/* Main Orb */}
      <motion.div
        animate={{
          y: [-10, 10, -10],
          scale: [1, 1.05, 1],
        }}
        transition={{
          y: {
            duration: breatheDuration * 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
          scale: {
            duration: breatheDuration,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
        style={{
          width: size * 0.75,
          height: size * 0.75,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
          boxShadow: `
            0 0 ${size * 0.1}px ${gradient.from}80,
            inset 0 -${size * 0.1}px ${size * 0.2}px rgba(0,0,0,0.2),
            inset 0 ${size * 0.1}px ${size * 0.2}px rgba(255,255,255,0.4)
          `,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Specular Highlight - fixed to look like a glossy surface */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "20%",
            width: "30%",
            height: "30%",
            borderRadius: "50%",
            background: "radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)",
            filter: "blur(5px)",
          }}
        />
      </motion.div>
    </div>
  );
}
