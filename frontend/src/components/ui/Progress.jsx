import { cn } from "../../lib/utils";

export function Progress({ value = 0, className, color = "primary" }) {
  const colors = {
    primary: "gradient-primary",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };

  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/5", className)}>
      <div
        className={cn("h-full transition-all duration-500", colors[color])}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}