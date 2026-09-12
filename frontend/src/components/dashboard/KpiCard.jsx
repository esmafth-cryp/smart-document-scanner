import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const COLOR_VARIANTS = {
  violet: {
    icon: "bg-violet-500/10 text-violet-400",
    glow: "shadow-[0_0_40px_-10px_rgba(139,92,246,0.5)]",
    border: "border-violet-500/20",
  },
  cyan: {
    icon: "bg-cyan-500/10 text-cyan-400",
    glow: "shadow-[0_0_40px_-10px_rgba(34,211,238,0.5)]",
    border: "border-cyan-500/20",
  },
  pink: {
    icon: "bg-pink-500/10 text-pink-400",
    glow: "shadow-[0_0_40px_-10px_rgba(236,72,153,0.5)]",
    border: "border-pink-500/20",
  },
  green: {
    icon: "bg-emerald-500/10 text-emerald-400",
    glow: "shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)]",
    border: "border-emerald-500/20",
  },
};

export function KpiCard({ icon: Icon, label, value, subtitle, color = "violet", delay = 0 }) {
  const c = COLOR_VARIANTS[color] || COLOR_VARIANTS.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        "relative overflow-hidden rounded-xl border bg-surface/40 p-5 backdrop-blur-sm",
        c.border
      )}
    >
      {/* Glow décoratif */}
      <div
        className={cn(
          "pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-3xl",
          c.glow
        )}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-text-primary">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-text-secondary">{subtitle}</p>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
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