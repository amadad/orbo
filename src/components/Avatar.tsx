import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";
import { useMemo } from "react";

interface AvatarProps {
  mood: string;
  energy: number;
  size?: number;
  activity?: string;
}

// Mood to color palette mapping - rich, saturated colors for depth
const moodColors = {
  neutral: { color1: "#6366f1", color2: "#8b5cf6", color3: "#4f46e5" },    // rich indigo/violet
  curious: { color1: "#06b6d4", color2: "#0ea5e9", color3: "#3b82f6" },    // vibrant cyan/blue
  creative: { color1: "#ec4899", color2: "#d946ef", color3: "#a855f7" },   // vivid pink/purple
  focused: { color1: "#10b981", color2: "#14b8a6", color3: "#06b6d4" },    // emerald/teal
  tired: { color1: "#6366f1", color2: "#4338ca", color3: "#3730a3" },      // deep indigo
  happy: { color1: "#f59e0b", color2: "#f97316", color3: "#eab308" },      // warm amber/orange
} as const;

const defaultColors = moodColors.neutral;

// Activity modifies the shader behavior - keep values subtle for more spherical shape
const activityEffects: Record<string, { uStrength: number; uDensity: number }> = {
  rest: { uStrength: 0.2, uDensity: 0.8 },
  daily_thought: { uStrength: 0.3, uDensity: 1.0 },
  research_topic: { uStrength: 0.4, uDensity: 1.1 },
  generate_image: { uStrength: 0.5, uDensity: 1.2 },
  analyze_day: { uStrength: 0.3, uDensity: 1.0 },
};

export function Avatar({ mood, energy, size = 280, activity }: AvatarProps) {
  const colors = moodColors[mood as keyof typeof moodColors] ?? defaultColors;
  const activityEffect = activityEffects[activity || ""] || { uStrength: 0.4, uDensity: 1.0 };

  // Animation speed based on energy (subtle range)
  const animationSpeed = useMemo(() => {
    return 0.1 + (energy * 0.2);
  }, [energy]);

  // Wave amplitude based on energy (keep very subtle for spherical shape)
  const amplitude = useMemo(() => {
    return 0.3 + (energy * 0.3);
  }, [energy]);

  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
      }}
    >
      <ShaderGradientCanvas
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <ShaderGradient
          type="sphere"
          animate="on"
          uSpeed={animationSpeed}
          uStrength={activityEffect.uStrength}
          uDensity={activityEffect.uDensity}
          uFrequency={4}
          uAmplitude={amplitude}
          positionX={0}
          positionY={0}
          positionZ={0}
          rotationX={0}
          rotationY={0}
          rotationZ={0}
          color1={colors.color1}
          color2={colors.color2}
          color3={colors.color3}
          reflection={0.8}
          wireframe={false}
          cAzimuthAngle={180}
          cPolarAngle={80}
          cDistance={1.4}
          cameraZoom={2.5}
          lightType="3d"
          brightness={1.6}
          grain="off"
          envPreset="lobby"
        />
      </ShaderGradientCanvas>
    </div>
  );
}
