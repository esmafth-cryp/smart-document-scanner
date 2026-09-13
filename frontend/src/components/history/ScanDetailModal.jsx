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
  Trash2,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Input } from "../ui/Input";
import { fetchScanDetail, validateScan, getExportUrl } from "../../api/scans";

const FIELD_KEYS = [
  "document_type",
  "student_name",
  "document_date",
  "reference",
  "internship_type",
  "start_date",
  "duration",
  "department",
  "company",
];

export function ScanDetailModal({ scan, onClose, onDelete }) {
  const { t } = useTranslation();
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
      .catch(() => toast.error(t("detail.loadingError")))
      .finally(() => setLoading(false));
  }, [scan, t]);

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
      toast.success(t("detail.validated"));
      setEdits({});
      onClose();
    } catch (err) {
      toast.error(err.message || t("detail.validationError"));
    } finally {
      setSaving(false);
    }
  }

  async function exportFile(format) {
    if (!detail) return;
    try {
      const url = getExportUrl(detail.id, format);
      const res = await fetch(url);
      if (!res.ok) throw new Error(t("common.error"));

      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `scan_${detail.id.slice(0, 8)}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      toast.success(t("detail.exported", { format: format.toUpperCase() }));
    } catch (err) {
      toast.error(err.message || t("common.error"));
    }
  }

  return (
    <AnimatePresence>
      {scan && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 backdrop-blur-sm md:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[95vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl"
          >
            {/* Header */}
            <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-surface/95 px-3 py-3 backdrop-blur md:px-6 md:py-4">
              <div className="flex min-w-0 items-center gap-2 md:gap-3">
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-text-primary">
                    {t("detail.title")}
                  </h2>
                  <p className="truncate text-[11px] text-text-muted">
                    {scan.original_filename}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1 md:gap-2">
                <div className="group relative">
                  <Button variant="secondary" size="sm">
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t("detail.export")}</span>
                  </Button>
                  <div className="invisible absolute right-0 top-full z-20 mt-1 w-36 overflow-hidden rounded-lg border border-border bg-surface-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
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

            {/* Body */}
            <div className="flex w-full flex-col gap-4 overflow-y-auto p-3 pb-32 pt-20 md:gap-6 md:p-6 md:pb-24 md:pt-20 lg:flex-row">
              {/* Image */}
              <div className="w-full shrink-0 lg:w-1/2">
                <div className="rounded-xl border border-border bg-surface/30 p-3 md:sticky md:top-6 md:p-4">
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

              {/* Fields */}
              <div className="min-w-0 flex-1 space-y-4 md:space-y-5">
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
                        {detail.status === "validated"
                          ? t("history.validated")
                          : t("history.pending")}
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
                          {t("detail.extractedInfo")}
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                                  {FIELD_KEYS.includes(key)
                                    ? t(`fields.${key}`)
                                    : key}
                                </p>
                                {isEditing && (
                                  <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[9px] font-medium text-primary">
                                    {t("detail.modified")}
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
                        {t("detail.rawText")}
                      </h3>
                      <pre className="max-h-64 overflow-auto rounded-lg border border-border bg-surface/40 p-3 font-mono text-[11px] leading-relaxed text-text-secondary">
                        {detail.raw_text}
                      </pre>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-text-muted">{t("common.loading")}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 border-t border-border bg-surface/95 px-3 py-3 backdrop-blur md:flex-row md:items-center md:justify-between md:px-6">
              <div className="flex items-center gap-3">
                {onDelete && detail && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(detail)}
                    className="text-danger hover:bg-danger/10 hover:text-danger"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{t("history.delete")}</span>
                  </Button>
                )}
                <p className="text-[11px] text-text-muted">
                  {hasChanges
                    ? t("detail.changesCount", { count: Object.keys(edits).length })
                    : t("detail.noChanges")}
                </p>
              </div>
              <Button
                onClick={handleValidate}
                disabled={!hasChanges || saving}
                isLoading={saving}
                className="w-full md:w-auto"
              >
                {!saving && <Save className="h-3.5 w-3.5" />}
                {t("detail.validateAndSave")}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}