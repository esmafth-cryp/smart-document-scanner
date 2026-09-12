import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/Input";

const fieldLabels = {
  document_type: "Type de document",
  student_name: "Nom de la stagiaire",
  document_date: "Date du document",
  reference: "Référence",
  internship_type: "Type de stage",
  start_date: "Date de début",
  duration: "Durée",
  department: "Service / Division",
  company: "Entreprise",
};

export function ExtractedFields({ data = {}, loading = false }) {
  const [copiedKey, setCopiedKey] = useState(null);

  const copy = (key, value) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const entries = Object.entries(fieldLabels);

  return (
    <div className="space-y-3">
      {entries.map(([key, label]) => {
        const value = data[key] || "";
        const hasValue = value && value.length > 0;

        return (
          <div key={key}>
           <div className="mb-1.5 flex items-center justify-between">
      <label className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
    {label}
      </label>
       </div>
            <div className="relative">
              <Input
                value={loading ? "" : value}
                readOnly
                placeholder={loading ? "Analyse en cours..." : "En attente d'analyse"}
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