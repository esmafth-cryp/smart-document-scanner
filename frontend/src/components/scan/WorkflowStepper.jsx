import { Check, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";

export function WorkflowStepper({ currentStep = 0, status = "idle" }) {
  const { t } = useTranslation();

  const steps = [
    { id: "preprocess", label: t("scan.steps.preprocess"), short: "Prép." },
    { id: "ocr", label: t("scan.steps.ocr"), short: "OCR" },
    { id: "detect", label: t("scan.steps.detection"), short: "Dét." },
    { id: "extract", label: t("scan.steps.extraction"), short: "Extr." },
  ];

  return (
    <div className="flex items-center gap-1 overflow-x-auto md:gap-2 lg:gap-3">
      {steps.map((step, i) => {
        const isDone = i < currentStep || status === "done";
        const isActive = i === currentStep && status === "processing";

        return (
          <div key={step.id} className="flex shrink-0 items-center gap-1 md:gap-2 lg:gap-3">
            <div className="flex items-center gap-1 md:gap-2">
              <div
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-medium transition-all md:h-6 md:w-6 md:text-[10px]",
                  isDone
                    ? "border-success bg-success/20 text-success"
                    : isActive
                      ? "border-primary bg-primary/20 text-primary"
                      : "border-border text-text-muted"
                )}
              >
                {isDone ? (
                  <Check className="h-2.5 w-2.5 md:h-3 md:w-3" strokeWidth={3} />
                ) : isActive ? (
                  <Loader2 className="h-2.5 w-2.5 animate-spin md:h-3 md:w-3" />
                ) : (
                  <span>{i + 1}</span>
                )}
              </div>
              <span
                className={cn(
                  "hidden whitespace-nowrap text-[10px] md:inline md:text-xs",
                  isDone
                    ? "text-success"
                    : isActive
                      ? "text-primary"
                      : "text-text-muted"
                )}
              >
                {step.label}
              </span>
              <span
                className={cn(
                  "whitespace-nowrap text-[10px] md:hidden",
                  isDone
                    ? "text-success"
                    : isActive
                      ? "text-primary"
                      : "text-text-muted"
                )}
              >
                {step.short}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div className="h-px w-3 shrink-0 bg-border md:w-6 lg:w-8">
                {isDone && <div className="h-full bg-success" />}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}