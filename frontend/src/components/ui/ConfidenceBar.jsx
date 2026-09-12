import { cn } from "../../lib/utils";

export function ConfidenceBar({ value = 0, className }) {
  const pct = Math.round((value || 0) * 100);
  const color =
    pct >= 90 ? "bg-success" : pct >= 70 ? "bg-warning" : "bg-danger";
  const textColor =
    pct >= 90 ? "text-success" : pct >= 70 ? "text-warning" : "text-danger";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-1 w-16 overflow-hidden rounded-full bg-white/5">
        <div className={cn("h-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className={cn("text-[10px] font-mono tabular-nums", textColor)}>
        {pct}%
      </span>
    </div>
  );
}