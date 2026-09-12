import { FileText, Eye, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "../ui/Badge";
import { Skeleton } from "../ui/Skeleton";

const STATUS_MAP = {
  pending: { label: "En attente", variant: "warning", icon: Clock },
  validated: { label: "Validé", variant: "success", icon: CheckCircle2 },
  corrected: { label: "Corrigé", variant: "cyan", icon: AlertCircle },
  rejected: { label: "Rejeté", variant: "danger", icon: XCircle },
};

function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.pending;
  const Icon = s.icon;
  return (
    <Badge variant={s.variant}>
      <Icon className="h-3 w-3" />
      {s.label}
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

function formatDate(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ScansTable({ scans, loading, onRowClick }) {
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
        <p className="text-sm text-text-secondary">Aucun scan pour l'instant</p>
        <p className="text-xs text-text-muted">Scannez un document pour le voir apparaître ici.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-surface/40">
            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
              Date
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
              Fichier
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
              Type
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
              Statut
            </th>
            <th className="px-4 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-text-muted">
              Confiance
            </th>
            <th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-wider text-text-muted">
              Actions
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
                {formatDate(scan.created_at)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  <span className="truncate text-xs text-text-primary" title={scan.original_filename}>
                    {scan.original_filename}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                {scan.document_type ? (
                  <span className="text-xs text-text-secondary">{scan.document_type.label}</span>
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick(scan);
                  }}
                  className="rounded p-1.5 text-text-muted transition-colors hover:bg-white/5 hover:text-primary"
                  title="Voir le détail"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}