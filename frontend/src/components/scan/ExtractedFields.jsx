import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "../ui/Input";

export function ExtractedFields({ data = {}, loading = false }) {
  const { t } = useTranslation();
  const [copiedKey, setCopiedKey] = useState(null);

  const fieldKeys = [
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

  const copy = (key, value) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="space-y-3">
      {fieldKeys.map((key) => {
        const value = data[key] || "";
        const hasValue = value && value.length > 0;

        return (
          <div key={key}>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                {t(`fields.${key}`)}
              </label>
            </div>
            <div className="relative">
              <Input
                value={loading ? "" : value}
                readOnly
                placeholder={
                  loading ? t("scan.analyzing") : t("scan.waitingAnalysis")
                }
                className={loading ? "animate-pulse bg-white/[0.02]" : ""}
              />
              {hasValue && !loading && (
                <button
                  onClick={() => copy(key, value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
                >
                  {copiedKey === key ? (
                    <Check className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}