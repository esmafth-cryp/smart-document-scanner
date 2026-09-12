import { cn } from "../../lib/utils";

export function Card({ className, children, hover = false, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface/50 backdrop-blur-sm",
        "transition-all duration-200",
        hover &&
          "hover:border-primary/30 hover:shadow-[0_0_30px_-15px_rgba(59,130,246,0.35)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn("px-5 pt-5 pb-3", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn("text-sm font-semibold text-text-primary tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn("text-xs text-text-muted mt-1", className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("px-5 pb-5", className)} {...props}>
      {children}
    </div>
  );
}