import { FileText, Eye, Clock, CheckCircle2, XCircle, AlertCircle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Badge } from "../ui/Badge";
import { Skeleton } from "../ui/Skeleton";

const STATUS_MAP = {
  pending: { labelKey: "history.pending", variant: "warning", icon: Clock },
  validated: { labelKey: "history.validated", variant: "success", icon: CheckCircle2 },
  corrected: { labelKey: "history.corrected", variant: "cyan", icon: AlertCircle },
  rejected: { labelKey: "history.rejected", variant: "danger", icon: XCircle },
};

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  const Icon = s.icon;
  return (
    <Badge variant={s.variant}>
      <Icon className="h-3 w-3" />
      {t(s.labelKey)}
    </Badge>
  );
}

function ConfidenceBar({ value }) {
  const pct = Math.round((value || 0) * 100);
  const color =
    pct >= 90 ? "bg-success" : pct >= 70 ? "bg-warning" : "bg-danger";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-12 overflow-hidden rounded-full bg-white/5">
        <div className={color} style={{ width: `${pct}%`, height: "100%" }} />
      </div>
      <span className="font-mono text-[10px] text-text-muted">{pct}%</span>
    </div>
  );
}

function formatDate(iso, lang) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString(lang === "en" ? "en-GB" : "fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ScansTable({ scans, loading, onRowClick, onDelete }) {
  const { t, i18n } = useTranslation();

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (!scans || scans.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface/30 py-16">
        <FileText className="h-10 w-10 text-text-muted opacity-40" />
        <p className="text-sm text-text-secondary">{t("history.noResults")}</p>
        <p className="text-xs text-text-muted">{t("history.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-surface/40">
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
                {t("history.date")}
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
                {t("history.file")}
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
                {t("history.documentType")}
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
                {t("history.status")}
              </th>
              <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
                {t("history.confidence")}
              </th>
              <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-text-muted">
                {t("history.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {scans.map((scan, i) => (
              <motion.tr
                key={scan.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
                onClick={() => onRowClick(scan)}
                className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3 text-xs text-text-secondary tabular-nums">
                  {formatDate(scan.created_at, i18n.language)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span
                      className="truncate text-xs text-text-primary"
                      title={scan.original_filename}
                    >
                      {scan.original_filename}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {scan.document_type ? (
                    <span className="text-xs text-text-secondary">
                      {scan.document_type.label}
                    </span>
                  ) : (
                    <span className="text-xs text-text-muted">-</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={scan.status} />
                </td>
                <td className="px-4 py-3">
                  <ConfidenceBar value={scan.ocr_confidence} />
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRowClick(scan);
                      }}
                      className="rounded p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-primary"
                      title={t("history.viewDetail")}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(scan);
                        }}
                        className="rounded p-1.5 text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                        title={t("history.delete")}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}