import { useCallback, useEffect, useState } from "react";
import { FileText, LayoutList, Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { Card, CardContent } from "../components/ui/Card";
import { ScanFilters } from "../components/history/ScanFilters";
import { ScansTable } from "../components/history/ScansTable";
import { ScanCalendar } from "../components/history/ScanCalendar";
import { ScanDetailModal } from "../components/history/ScanDetailModal";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { fetchScans, deleteScan } from "../api/scans";

export function History() {
  const { t } = useTranslation();
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [documentType, setDocumentType] = useState("");

  const [view, setView] = useState("table");
  const [selectedScan, setSelectedScan] = useState(null);

  // État pour la suppression
  const [scanToDelete, setScanToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("sds_search");
    if (stored) {
      setSearch(stored);
      sessionStorage.removeItem("sds_search");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadScans = useCallback(() => {
    setLoading(true);
    const perPage = view === "calendar" ? 500 : 20;
    fetchScans({
      page: view === "calendar" ? 1 : page,
      perPage,
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
  }, [page, status, documentType, debouncedSearch, view]);

  useEffect(() => {
    loadScans();
  }, [loadScans]);

  function resetFilters() {
    setSearch("");
    setStatus("");
    setDocumentType("");
    setPage(1);
  }

  async function handleConfirmDelete() {
    if (!scanToDelete) return;
    setDeleting(true);
    try {
      await deleteScan(scanToDelete.id);
      toast.success(t("history.deleted"));
      setScanToDelete(null);
      setSelectedScan(null);
      loadScans();
    } catch (err) {
      toast.error(err.message || t("history.deleteError"));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
      <Card>
        <CardContent className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h1 className="text-sm font-semibold text-text-primary">
                {t("history.scansList")}
              </h1>
              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-text-muted">
                {total} {total === 1 ? t("history.document") : t("history.documents")}
              </span>
            </div>

            <div className="flex rounded-lg border border-border bg-surface-2/40 p-1 self-start md:self-auto">
              <button
                onClick={() => setView("table")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors ${
                  view === "table"
                    ? "bg-primary/20 text-primary"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <LayoutList className="h-3.5 w-3.5" />
                {t("calendar.tableView")}
              </button>
              <button
                onClick={() => setView("calendar")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors ${
                  view === "calendar"
                    ? "bg-primary/20 text-primary"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                {t("calendar.calendarView")}
              </button>
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

      {view === "table" ? (
        <>
          <ScansTable
            scans={scans}
            loading={loading}
            onRowClick={setSelectedScan}
            onDelete={setScanToDelete}
          />

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-white/5 disabled:opacity-40"
              >
                {t("common.previous")}
              </button>
              <span className="px-3 text-xs text-text-muted">
                Page {page} / {pages}
              </span>
              <button
                disabled={page >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-white/5 disabled:opacity-40"
              >
                {t("common.next")}
              </button>
            </div>
          )}
        </>
      ) : (
        <ScanCalendar scans={scans} />
      )}

      <ScanDetailModal
        scan={selectedScan}
        onClose={() => setSelectedScan(null)}
        onDelete={(scan) => {
          setSelectedScan(null);
          setScanToDelete(scan);
        }}
      />

      <ConfirmModal
        open={!!scanToDelete}
        title={t("history.deleteConfirmTitle")}
        description={t("history.deleteConfirmDesc")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        onConfirm={handleConfirmDelete}
        onCancel={() => setScanToDelete(null)}
        isLoading={deleting}
        variant="danger"
      />
    </div>
  );
}