import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Loader2,
  FileText,
  Image as ImageIcon,
  Edit3,
  Save,
} from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Input } from "../ui/Input";
import { fetchScanDetail, validateScan, getExportUrl } from "../../api/scans";

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
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!scan) return;
    setLoading(true);
    setEdits({});
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

  const hasChanges = useMemo(() => Object.keys(edits).length > 0, [edits]);

  function setFieldEdit(key, value) {
    setEdits((prev) => {
      const next = { ...prev };
      const original =
        detail?.extracted?.[key]?.validated || detail?.extracted?.[key]?.raw || "";
      if (value === original) delete next[key];
      else next[key] = value;
      return next;
    });
  }

  async function handleValidate() {
    if (!detail) return;
    setSaving(true);
    try {
      await validateScan(detail.id, edits);
      toast.success("Scan validé et corrections enregistrées");
      setEdits({});
      onClose();
    } catch (err) {
      toast.error(err.message || "Erreur de validation");
    } finally {
      setSaving(false);
    }
  }

    async function exportFile(format) {
    if (!detail) return;
    try {
      const url = getExportUrl(detail.id, format);
      const res = await fetch(url);
      if (!res.ok) throw new Error("Erreur d'export");

      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `scan_${detail.id.slice(0, 8)}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      toast.success(`Export ${format.toUpperCase()} téléchargé`);
    } catch (err) {
      toast.error(err.message || "Erreur d'export");
    }
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
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-border bg-[#0d1224]/95 px-6 py-4 backdrop-blur">
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-primary" />
                <div>
                  <h2 className="text-sm font-semibold text-text-primary">Détail du scan</h2>
                  <p className="text-[11px] text-text-muted">{scan.original_filename}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="group relative">
                  <Button variant="secondary" size="sm">
                    <Download className="h-3.5 w-3.5" />
                    Exporter
                  </Button>
                  <div className="invisible absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-lg border border-border bg-[#131826] opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                    {["json", "csv", "xlsx"].map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => exportFile(fmt)}
                        className="block w-full px-3 py-2 text-left text-xs text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex w-full gap-6 overflow-y-auto p-6 pb-24 pt-20">
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

              <div className="flex-1 space-y-5">
                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : detail ? (
                  <>
                    <div className="flex flex-wrap gap-2">
                      {detail.document_type && (
                        <Badge variant="primary">{detail.document_type.label}</Badge>
                      )}
                      <Badge
                        variant={
                          detail.status === "validated" ? "success" : "warning"
                        }
                      >
                        {detail.status === "validated" ? "Validé" : "En attente"}
                      </Badge>
                      {detail.ocr_confidence && (
                        <Badge variant="cyan">
                          OCR {Math.round(detail.ocr_confidence * 100)}%
                        </Badge>
                      )}
                    </div>

                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <Edit3 className="h-3.5 w-3.5 text-primary" />
                        <h3 className="text-xs font-medium uppercase tracking-wider text-text-muted">
                          Informations extraites (éditables)
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(detail.extracted || {}).map(([key, obj]) => {
                          const value = obj.validated || obj.raw || "";
                          const isEditing = key in edits;
                          return (
                            <div
                              key={key}
                              className={`rounded-lg border p-3 transition-colors ${
                                isEditing
                                  ? "border-primary/50 bg-primary/5"
                                  : "border-border bg-surface/40"
                              }`}
                            >
                              <div className="mb-1.5 flex items-center justify-between">
                                <p className="text-[10px] uppercase tracking-wider text-text-muted">
                                  {FIELD_LABELS[key] || key}
                                </p>
                                {isEditing && (
                                  <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                                    modifié
                                  </span>
                                )}
                              </div>
                              <Input
                                value={edits[key] ?? value}
                                onChange={(e) => setFieldEdit(key, e.target.value)}
                                className="!h-8 !text-xs"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

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

            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between border-t border-border bg-[#0d1224]/95 px-6 py-3 backdrop-blur">
              <p className="text-[11px] text-text-muted">
                {hasChanges
                  ? `${Object.keys(edits).length} champ(s) modifié(s)`
                  : "Aucune modification"}
              </p>
              <Button
                onClick={handleValidate}
                disabled={!hasChanges || saving}
                isLoading={saving}
              >
                {!saving && <Save className="h-3.5 w-3.5" />}
                Valider et enregistrer
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}