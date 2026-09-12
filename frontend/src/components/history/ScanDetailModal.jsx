import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { fetchScanDetail } from "../../api/scans";

const FIELD_LABELS = {
  document_type: "Type de document",
  student_name: "Nom du stagiaire",
  document_date: "Date du document",
  reference: "Référence",
  internship_type: "Type de stage",
  start_date: "Date de début",
  duration: "Durée",
  department: "Service / Division",
  company: "Entreprise",
};

export function ScanDetailModal({ scan, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!scan) return;
    setLoading(true);
    fetchScanDetail(scan.id)
      .then((res) => setDetail(res.scan))
      .catch(() => toast.error("Impossible de charger le détail"))
      .finally(() => setLoading(false));
  }, [scan]);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  function exportJson() {
    if (!detail) return;
    const blob = new Blob([JSON.stringify(detail, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `scan_${detail.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON téléchargé");
  }

  return (
    <AnimatePresence>
      {scan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-border bg-[#0d1224] shadow-2xl"
          >
            {/* Header */}
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-border bg-[#0d1224]/95 px-6 py-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">
                    Détail du scan
                  </h2>
                  <p className="text-[11px] text-text-muted">
                    {scan.original_filename}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" onClick={exportJson} disabled={!detail}>
                  <Download className="h-3.5 w-3.5" />
                  Exporter JSON
                </Button>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex w-full gap-6 overflow-y-auto p-6 pt-20">
              {/* Colonne gauche : image */}
              <div className="w-1/2 shrink-0">
                <div className="sticky top-6 rounded-xl border border-border bg-surface/30 p-4">
                  {detail?.saved_filename ? (
                    <img
                      src={`/api/uploads/${detail.saved_filename}`}
                      alt="Document"
                      className="w-full rounded-lg"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-64 items-center justify-center rounded-lg border border-border bg-surface/30">
                      <ImageIcon className="h-10 w-10 text-text-muted opacity-40" />
                    </div>
                  )}
                </div>
              </div>

              {/* Colonne droite : champs */}
              <div className="flex-1 space-y-5">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : detail ? (
                  <>
                    {/* Meta */}
                    <div className="flex flex-wrap gap-2">
                      {detail.document_type && (
                        <Badge variant="primary">{detail.document_type.label}</Badge>
                      )}
                      <Badge variant="warning">{detail.status}</Badge>
                      {detail.ocr_confidence && (
                        <Badge variant="cyan">
                          OCR {Math.round(detail.ocr_confidence * 100)}%
                        </Badge>
                      )}
                    </div>

                    {/* Fields */}
                    <div>
                      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-text-muted">
                        Informations extraites
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(detail.extracted || {}).map(([key, obj]) => (
                          <div
                            key={key}
                            className="rounded-lg border border-border bg-surface/40 p-3"
                          >
                            <p className="text-[10px] uppercase tracking-wider text-text-muted">
                              {FIELD_LABELS[key] || key}
                            </p>
                            <p className="mt-1 truncate text-sm text-text-primary">
                              {obj.validated || obj.raw || "-"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Raw text */}
                    <div>
                      <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-text-muted">
                        Texte OCR brut
                      </h3>
                      <pre className="max-h-64 overflow-auto rounded-lg border border-border bg-surface/40 p-3 font-mono text-[11px] leading-relaxed text-text-secondary">
                        {detail.raw_text}
                      </pre>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-text-muted">Chargement...</p>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}