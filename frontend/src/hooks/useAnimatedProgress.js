import { useEffect, useRef, useState } from "react";

/**
 * Simule une progression étape par étape entre 0 et 100%.
 * Quand `isRunning` passe à true, la progression repart de 0.
 * Quand `isDone` passe à true, on force la progression à 100% rapidement.
 */
export function useAnimatedProgress({
  steps,
  isRunning,
  isDone,
  durationMs = 4000,
}) {
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    if (!isRunning) {
      if (isDone) {
        setProgress(100);
        setActiveIndex(steps.length);
      }
      return;
    }

    // Reset
    setProgress(0);
    setActiveIndex(0);
    startRef.current = performance.now();

    const tick = (now) => {
      const elapsed = now - startRef.current;
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(pct);

      const idx = Math.min(
        steps.length - 1,
        Math.floor((pct / 100) * steps.length)
      );
      setActiveIndex(idx);

      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isRunning, isDone, durationMs, steps.length]);

  return { progress, activeIndex };
}