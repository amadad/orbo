import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";

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
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-3xl font-bold mb-4">
            O
          </div>
          <h1 className="text-3xl font-bold text-zinc-100">Create Your Being</h1>
          <p className="text-zinc-500 mt-2">
            Set up an autonomous digital being that pursues your objectives
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-colors ${
                s === step ? "bg-violet-500" : s < step ? "bg-violet-500/50" : "bg-zinc-700"
              }`}
            />
          ))}
        </div>

        {/* Form card */}
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  What should your being be called?
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Orbo"
                  className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!name.trim()}
                className="w-full py-3 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  What is {name}'s primary objective?
                </label>
                <textarea
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="e.g., Share interesting thoughts about AI and technology on Twitter, engage with the community, and build a following"
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!objective.trim()}
                  className="flex-1 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-4">
                  Adjust {name}'s personality
                </label>

                {Object.entries(personality).map(([trait, value]) => (
                  <div key={trait} className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-zinc-400">{trait}</span>
                      <span className="text-zinc-500">{Math.round(value * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={value * 100}
                      onChange={(e) =>
                        setPersonality((p) => ({
                          ...p,
                          [trait]: Number(e.target.value) / 100,
                        }))
                      }
                      className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                  </div>
                ))}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 font-medium transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="flex-1 py-3 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>Create {name}</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        {step === 3 && (
          <div className="mt-6 p-4 rounded-lg bg-zinc-900/50 border border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-400 mb-2">Preview</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center font-bold">
                {name[0]}
              </div>
              <div>
                <p className="font-medium text-zinc-200">{name}</p>
                <p className="text-sm text-zinc-500 truncate max-w-[280px]">
                  {objective}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
