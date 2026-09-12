import { useEffect, useState } from "react";
import { FileText, Calendar, CheckCircle2, Target, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card";
import { KpiCard } from "../components/dashboard/KpiCard";
import { ScansAreaChart, TypesDonutChart } from "../components/dashboard/Charts";
import { Skeleton } from "../components/ui/Skeleton";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { fetchOverview, fetchTimeline, fetchDocumentTypes } from "../api/stats";
import { fetchScans } from "../api/scans";

function formatPct(v) {
  return `${Math.round((v || 0) * 100)}%`;
}

function formatDate(iso, lang) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString(lang === "en" ? "en-GB" : "fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Dashboard({ onNavigate }) {
  const { t, i18n } = useTranslation();
  const [overview, setOverview] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [types, setTypes] = useState([]);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchOverview(),
      fetchTimeline(30),
      fetchDocumentTypes(),
      fetchScans({ page: 1, perPage: 5 }),
    ])
      .then(([ov, tl, dt, scans]) => {
        setOverview(ov.overview);
        setTimeline(tl.series || []);
        setTypes(dt.types || []);
        setRecentScans(scans.items || []);
      })
      .catch(() => toast.error(t("common.error")))
      .finally(() => setLoading(false));
  }, [t]);

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-6">
      {/* === 4 KPI Cards === */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : (
          <>
            <KpiCard
              icon={FileText}
              label={t("dashboard.totalScans")}
              value={overview?.total_scans ?? 0}
              subtitle={t("dashboard.totalScansSub")}
              color="blue"
              delay={0}
            />
            <KpiCard
              icon={Calendar}
              label={t("dashboard.today")}
              value={overview?.scans_today ?? 0}
              subtitle={t("dashboard.todaySub")}
              color="cyan"
              delay={0}
            />
            <KpiCard
              icon={CheckCircle2}
              label={t("dashboard.successRate")}
              value={formatPct(overview?.success_rate)}
              subtitle={t("dashboard.successRateSub")}
              color="green"
              delay={0}
            />
            <KpiCard
              icon={Target}
              label={t("dashboard.ocrConfidence")}
              value={formatPct(overview?.avg_ocr_confidence)}
              subtitle={t("dashboard.ocrConfidenceSub")}
              color="pink"
              delay={0}
            />
          </>
        )}
      </div>

      {/* === Graphiques === */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("dashboard.activity")}</CardTitle>
            <CardDescription>{t("dashboard.activitySub")}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[280px]" />
            ) : (
              <ScansAreaChart data={timeline} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.repartition")}</CardTitle>
            <CardDescription>{t("dashboard.repartitionSub")}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[280px]" />
            ) : (
              <TypesDonutChart data={types} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* === Scans récents === */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("dashboard.recentScans")}</CardTitle>
            <CardDescription>{t("dashboard.recentScansSub")}</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onNavigate?.("history")}>
            {t("dashboard.seeAll")}
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40" />
          ) : recentScans.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-muted">
              {t("history.noResults")}
            </p>
          ) : (
            <div className="space-y-2">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface/30 px-4 py-3 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-text-primary">
                        {scan.original_filename}
                      </p>
                      <p className="text-[10px] text-text-muted">
                        {formatDate(scan.created_at, i18n.language)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="warning">
                      <Clock className="h-3 w-3" />
                      {t(`history.${scan.status}`, scan.status)}
                    </Badge>
                    <span className="font-mono text-[10px] text-text-muted">
                      {formatPct(scan.ocr_confidence)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}