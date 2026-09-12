import { Search, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "../ui/Input";

export function ScanFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  documentType,
  onDocumentTypeChange,
  onReset,
}) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative min-w-[260px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("history.search")}
          className="pl-9"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted hover:bg-white/5 hover:text-text-primary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Status */}
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="h-10 rounded-lg border border-border bg-surface-2/50 px-3 text-sm text-text-primary focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
      >
        <option value="">{t("history.allStatuses")}</option>
        <option value="pending">{t("history.pending")}</option>
        <option value="validated">{t("history.validated")}</option>
        <option value="corrected">{t("history.corrected")}</option>
        <option value="rejected">{t("history.rejected")}</option>
      </select>

      {/* Document type */}
      <select
        value={documentType}
        onChange={(e) => onDocumentTypeChange(e.target.value)}
        className="h-10 rounded-lg border border-border bg-surface-2/50 px-3 text-sm text-text-primary focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
      >
        <option value="">{t("history.allTypes")}</option>
        <option value="decision_stage">{t("documentTypes.decision_stage")}</option>
        <option value="invoice">{t("documentTypes.invoice")}</option>
        <option value="delivery_note">{t("documentTypes.delivery_note")}</option>
        <option value="unknown">{t("documentTypes.unknown")}</option>
      </select>

      {/* Reset */}
      {(search || status || documentType) && (
        <button
          onClick={onReset}
          className="h-10 rounded-lg border border-border px-3 text-xs text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
        >
          {t("common.reset")}
        </button>
      )}
    </div>
  );
}