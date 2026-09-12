import { motion, AnimatePresence } from "framer-motion";
import { NeonProgressBar } from "./NeonProgressBar";
import { ANALYSIS_STEPS } from "../../lib/constants";
import { useAnimatedProgress } from "../../hooks/useAnimatedProgress";

export function ProcessingOverlay({ isRunning, isDone }) {
  const { progress, activeIndex } = useAnimatedProgress({
    steps: ANALYSIS_STEPS,
    isRunning,
    isDone,
    durationMs: 4000,
  });

  if (!isRunning && !isDone) return null;

  // Distribution par étape : 0-33%, 33-66%, 66-100%
  const stepProgress = (i) => {
    const segStart = (i / ANALYSIS_STEPS.length) * 100;
    const segEnd = ((i + 1) / ANALYSIS_STEPS.length) * 100;
    if (progress <= segStart) return 0;
    if (progress >= segEnd) return 100;
    return ((progress - segStart) / (segEnd - segStart)) * 100;
  };

  return (
    <AnimatePresence>
      {isRunning && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-md"
          style={{
            background:
              "radial-gradient(circle at center, rgba(99,102,241,0.15) 0%, rgba(11,15,26,0.85) 70%)",
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1224]/80 p-8 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-6 text-center">
              <p className="text-[10px] uppercase tracking-[0.3em] text-violet-400">
                Analyse en cours
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Ne fermez pas cette page
              </p>
            </div>

            <div className="space-y-6">
              {ANALYSIS_STEPS.map((step, i) => (
                <NeonProgressBar
                  key={step.id}
                  value={stepProgress(i)}
                  color={step.color}
                  label={step.label}
                />
              ))}
            </div>

            <div className="mt-6 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-muted">
                {progress >= 100
                  ? "TERMINÉ"
                  : `ÉTAPE ${activeIndex + 1} / ${ANALYSIS_STEPS.length}`}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}