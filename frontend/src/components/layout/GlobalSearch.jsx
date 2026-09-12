import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FileText, X, Loader2, ArrowRight } from "lucide-react";

import { fetchScans } from "../../api/scans";

export function GlobalSearch({ onSelectScan, onSeeAll }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (debounced.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetchScans({ search: debounced, perPage: 8 })
      .then((data) => setResults(data.items || []))
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debounced]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function handleSelect(scan) {
    setOpen(false);
    setQuery("");
    onSelectScan?.(scan);
  }

  function handleSeeAll() {
    setOpen(false);
    onSeeAll?.(query);
    setQuery("");
  }

  return (
    <div className="relative hidden md:block" ref={ref}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher un document..."
          className="h-9 w-72 rounded-lg border border-border bg-surface-2/50 pl-9 pr-8 text-sm text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && query.trim().length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-[100] mt-2 w-96 overflow-hidden rounded-xl border border-border-strong bg-[#0d1224] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)]"
          >
            <div className="border-b border-border px-4 py-2.5">
              <p className="text-[10px] uppercase tracking-wider text-text-muted">
                Résultats pour "{query}"
              </p>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center gap-2 p-6 text-xs text-text-muted">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Recherche...
                </div>
              ) : results.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-muted">
                  Aucun résultat
                </div>
              ) : (
                results.map((scan) => (
                  <button
                    key={scan.id}
                    onClick={() => handleSelect(scan)}
                    className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-white/[0.03]"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-text-primary">
                        {scan.original_filename}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-[10px] text-text-muted">
                        <span>{scan.document_type?.label || "Type inconnu"}</span>
                        <span>•</span>
                        <span>{formatDate(scan.created_at)}</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {results.length > 0 && (
              <button
                onClick={handleSeeAll}
                className="flex w-full items-center justify-center gap-2 border-t border-border bg-surface/40 px-4 py-2.5 text-xs text-primary transition-colors hover:bg-primary/5"
              >
                Voir tous les résultats dans l'historique
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}