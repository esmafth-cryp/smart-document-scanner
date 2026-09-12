import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { AnimatedNumber } from "../ui/AnimatedNumber";

const COLOR_VARIANTS = {
  blue: {
    icon: "bg-blue-500/10 text-blue-400",
    glow: "shadow-[0_0_40px_-10px_rgba(59,130,246,0.5)]",
    border: "border-blue-500/20",
  },
  cyan: {
    icon: "bg-cyan-500/10 text-cyan-400",
    glow: "shadow-[0_0_40px_-10px_rgba(6,182,212,0.5)]",
    border: "border-cyan-500/20",
  },
  green: {
    icon: "bg-emerald-500/10 text-emerald-400",
    glow: "shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]",
    border: "border-emerald-500/20",
  },
  pink: {
    icon: "bg-pink-500/10 text-pink-400",
    glow: "shadow-[0_0_40px_-10px_rgba(236,72,153,0.5)]",
    border: "border-pink-500/20",
  },
};

export function KpiCard({ icon: Icon, label, value, subtitle, color = "blue", delay = 0 }) {
  const c = COLOR_VARIANTS[color] || COLOR_VARIANTS.blue;

  const isPercent = typeof value === "string" && value.includes("%");
  const numericValue = isPercent
    ? parseInt(value.replace(/[^\d]/g, ""), 10) || 0
    : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, delay, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-surface/40 p-5 backdrop-blur-sm transition-all hover:border-primary/40 hover:shadow-[0_0_30px_-10px_rgba(59,130,246,0.4)]",
        c.border
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-3xl transition-opacity group-hover:opacity-60",
          c.glow
        )}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-text-primary">
            {isPercent ? (
              <AnimatedNumber value={numericValue} suffix="%" />
            ) : (
              <AnimatedNumber value={numericValue} />
            )}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-text-secondary">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110",
              c.icon
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        )}
      </div>
    </motion.div>
  );
}