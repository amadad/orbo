import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useState } from "react";
import { Dashboard } from "./components/Dashboard";
import { Onboarding } from "./components/Onboarding";

export function App() {
  const being = useQuery(api.being.get);
  const isLoading = being === undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-400 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  if (!being) {
    return <Onboarding />;
  }

  return <Dashboard being={being} />;
}
