import { Check, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

const steps = [
  { id: "preprocess", label: "Prétraitement" },
  { id: "ocr", label: "OCR" },
  { id: "detect", label: "Détection" },
  { id: "extract", label: "Extraction" },
];

export function WorkflowStepper({ currentStep = 0, status = "idle" }) {
  return (
    <div className="flex items-center gap-3">
      {steps.map((step, i) => {
        const isDone = i < currentStep || status === "done";
        const isActive = i === currentStep && status === "processing";

        return (
          <div key={step.id} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-medium transition-all",
                  isDone
                    ? "border-success bg-success/20 text-success"
                    : isActive
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border text-text-muted"
                )}
              >
                {isDone ? (
                  <Check className="h-3 w-3" strokeWidth={3} />
                ) : isActive ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs",
                  isDone
                    ? "text-success"
                    : isActive
                      ? "text-primary"
                      : "text-text-muted"
                )}
              >
                {step.label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div className="h-px w-8 bg-border">
                {isDone && <div className="h-full bg-success" />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}