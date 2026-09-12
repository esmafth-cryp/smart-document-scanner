import { Search, X } from "lucide-react";
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
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative min-w-[260px] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Rechercher un fichier, un texte..."
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
        <option value="">Tous les statuts</option>
        <option value="pending">En attente</option>
        <option value="validated">Validé</option>
        <option value="corrected">Corrigé</option>
        <option value="rejected">Rejeté</option>
      </select>

      {/* Document type */}
      <select
        value={documentType}
        onChange={(e) => onDocumentTypeChange(e.target.value)}
        className="h-10 rounded-lg border border-border bg-surface-2/50 px-3 text-sm text-text-primary focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
      >
        <option value="">Tous les types</option>
        <option value="decision_stage">Décision de stage</option>
        <option value="invoice">Facture</option>
        <option value="delivery_note">Bon de livraison</option>
        <option value="unknown">Inconnu</option>
      </select>

      {/* Reset */}
      {(search || status || documentType) && (
        <button
          onClick={onReset}
          className="h-10 rounded-lg border border-border px-3 text-xs text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
        >
          Réinitialiser
        </button>
      )}
    </div>
  );
}