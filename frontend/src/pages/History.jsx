import { useCallback, useEffect, useState } from "react";
import { FileText } from "lucide-react";

import { Card, CardContent } from "../components/ui/Card";
import { ScanFilters } from "../components/history/ScanFilters";
import { ScansTable } from "../components/history/ScansTable";
import { ScanDetailModal } from "../components/history/ScanDetailModal";
import { fetchScans } from "../api/scans";

export function History() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [documentType, setDocumentType] = useState("");

  const [selectedScan, setSelectedScan] = useState(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const loadScans = useCallback(() => {
    setLoading(true);
    fetchScans({
      page,
      perPage: 20,
      status,
      documentType,
      search: debouncedSearch,
    })
      .then((data) => {
        setScans(data.items || []);
        setTotal(data.total || 0);
        setPages(data.pages || 1);
      })
      .catch(() => {
        setScans([]);
        setTotal(0);
        setPages(1);
      })
      .finally(() => setLoading(false));
  }, [page, status, documentType, debouncedSearch]);

  useEffect(() => {
    loadScans();
  }, [loadScans]);

  function resetFilters() {
    setSearch("");
    setStatus("");
    setDocumentType("");
    setPage(1);
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <Card>
        <CardContent className="flex flex-col gap-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h1 className="text-sm font-semibold text-text-primary">
                Historique des scans
              </h1>
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-text-muted">
                {total} {total === 1 ? "document" : "documents"}
              </span>
            </div>
          </div>

          <ScanFilters
            search={search}
            onSearchChange={setSearch}
            status={status}
            onStatusChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            documentType={documentType}
            onDocumentTypeChange={(v) => {
              setDocumentType(v);
              setPage(1);
            }}
            onReset={resetFilters}
          />
        </CardContent>
      </Card>

      <ScansTable scans={scans} loading={loading} onRowClick={setSelectedScan} />

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-white/5 disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="px-3 text-xs text-text-muted">
            Page {page} / {pages}
          </span>
          <button
            disabled={page >= pages}
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-white/5 disabled:opacity-40"
          >
            Suivant
          </button>
        </div>
      )}

      <ScanDetailModal scan={selectedScan} onClose={() => setSelectedScan(null)} />
    </div>
  );
}