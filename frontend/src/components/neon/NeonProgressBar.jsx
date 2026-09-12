import { cn } from "../../lib/utils";
import { STEP_COLORS } from "../../lib/constants";

export function NeonProgressBar({
  value = 0,
  color = "violet",
  label,
  showPercent = true,
  thickness = "md",
}) {
  const c = STEP_COLORS[color] || STEP_COLORS.violet;
  const h = thickness === "sm" ? "h-2" : thickness === "lg" ? "h-4" : "h-3";

  return (
    <div className="w-full">
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-[#0d1224]",
          h,
          "border border-white/5"
        )}
      >
        {/* Track glow */}
        <div className="absolute inset-0 rounded-full bg-white/[0.02]" />

        {/* Fill */}
        <div
          className={cn(
            "relative h-full rounded-full bg-gradient-to-r transition-all duration-300 ease-out",
            c.gradient,
            c.glow
          )}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        >
          {/* Inner highlight */}
          <div className="absolute inset-x-0 top-0 h-1/2 rounded-full bg-white/20 blur-[1px]" />
        </div>

        {/* Shimmer */}
        {value > 0 && value < 100 && (
          <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        )}
      </div>

      {(label || showPercent) && (
        <div className="mt-2 flex items-center justify-between px-1">
          {label && (
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-[0.2em]",
                c.text
              )}
            >
              {label}
            </span>
          )}
          {showPercent && (
            <span
              className={cn(
                "font-mono text-[10px] tabular-nums",
                c.text
              )}
            >
              {Math.round(value)}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}