import { forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Input = forwardRef(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-border bg-surface-2/50 px-3 py-2 text-sm text-text-primary",
        "placeholder:text-text-muted",
        "focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30",
        "transition-colors",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export const Textarea = forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-lg border border-border bg-surface-2/50 px-3 py-2 text-sm text-text-primary",
        "placeholder:text-text-muted font-mono",
        "focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/30",
        "resize-none transition-colors",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";