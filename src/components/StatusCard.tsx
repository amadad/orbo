import type { ReactNode } from "react";

interface StatusCardProps {
  label: string;
  value: string;
  icon: string;
  color: "green" | "yellow" | "red" | "blue" | "purple";
  children?: ReactNode;
}

const colorMap = {
  green: "from-green-500/20 to-green-500/5 border-green-500/30",
  yellow: "from-yellow-500/20 to-yellow-500/5 border-yellow-500/30",
  red: "from-red-500/20 to-red-500/5 border-red-500/30",
  blue: "from-blue-500/20 to-blue-500/5 border-blue-500/30",
  purple: "from-violet-500/20 to-violet-500/5 border-violet-500/30",
};

export function StatusCard({ label, value, icon, color, children }: StatusCardProps) {
  return (
    <div
      className={`bg-gradient-to-br ${colorMap[color]} rounded-xl p-5 border backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-400 mb-1">{label}</p>
          <p className="text-2xl font-semibold capitalize">{value}</p>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
      {children}
    </div>
  );
}
