import { motion } from "framer-motion";
import { ScanLine as ScanLineIcon, Maximize2 } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { ScanLine } from "../neon/ScanLine";

export function DocumentPreview({ image, status, onZoom, children }) {
  const statusMap = {
    idle: { label: "En attente", variant: "default" },
    ready: { label: "Prêt à analyser", variant: "primary" },
    processing: { label: "Analyse en cours", variant: "warning" },
    done: { label: "Analyse terminée", variant: "success" },
    error: { label: "Erreur", variant: "danger" },
  };
  const s = statusMap[status] || statusMap.idle;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <ScanLineIcon className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-text-primary">Aperçu du document</h3>
        </div>
        <Badge variant={s.variant}>{s.label}</Badge>
      </div>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#0a0e18] p-6">
        {image ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="group relative max-h-full max-w-full"
          >
            <div className="absolute -inset-2 rounded-xl border border-primary/30 bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
            <img
              src={image}
              alt="Document"
              className="relative max-h-[calc(100vh-320px)] rounded-lg object-contain shadow-2xl"
            />
            {status === "processing" && <ScanLine />}
            <Button
              variant="secondary"
              size="icon"
              onClick={onZoom}
              className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-text-muted">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface/50">
              <ScanLineIcon className="h-7 w-7 opacity-40" />
            </div>
            <p className="text-xs">Aucun document sélectionné</p>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}