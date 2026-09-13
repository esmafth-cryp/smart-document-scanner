import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "./Button";

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isLoading = false,
  variant = "danger",
}) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                    variant === "danger"
                      ? "bg-danger/10 text-danger"
                      : "bg-warning/10 text-warning"
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-semibold text-text-primary">
                  {title || t("common.confirm")}
                </h2>
              </div>
              <button
                onClick={onCancel}
                className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              <p className="text-sm leading-relaxed text-text-secondary">
                {description}
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 border-t border-border bg-surface/50 px-5 py-3">
              <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
                {cancelLabel || t("common.cancel")}
              </Button>
              <Button
                variant={variant === "danger" ? "danger" : "primary"}
                onClick={onConfirm}
                isLoading={isLoading}
              >
                {confirmLabel || t("common.delete")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}