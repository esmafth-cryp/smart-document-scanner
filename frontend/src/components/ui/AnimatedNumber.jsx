import { useEffect, useRef, useState } from "react";

export function AnimatedNumber({ value, duration = 600, suffix = "", prefix = "" }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const numericValue =
      typeof value === "string"
        ? parseFloat(value.replace(/[^\d.-]/g, "")) || 0
        : Number(value) || 0;

    const start = performance.now();
    const startValue = 0;
    const endValue = numericValue;

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (endValue - startValue) * eased);
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setDisplay(endValue);
      }
    }

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const hasPercent = typeof value === "string" && value.includes("%");

  return (
    <span>
      {prefix}
      {display}
      {hasPercent ? "%" : suffix}
    </span>
  );
}