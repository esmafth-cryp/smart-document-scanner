import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  FileText,
  Clock,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { Badge } from "../ui/Badge";

const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const MONTHS_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DAYS_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function ScanCalendar({ scans = [] }) {
  const { t, i18n } = useTranslation();
  const lang = (i18n.language || "fr").startsWith("en") ? "en" : "fr";
  const MONTHS = lang === "en" ? MONTHS_EN : MONTHS_FR;
  const DAYS = lang === "en" ? DAYS_EN : DAYS_FR;

  const [current, setCurrent] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selectedDay, setSelectedDay] = useState(null);

  // Groupe les scans par jour
  const scansByDay = useMemo(() => {
    const map = {};
    scans.forEach((s) => {
      if (!s.created_at) return;
      const d = new Date(s.created_at);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [scans]);

  // Grille du mois (6 semaines x 7 jours)
  const grid = useMemo(() => {
    const { year, month } = current;
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Lundi = 0, Dimanche = 6
    let startWeekday = firstDay.getDay() - 1;
    if (startWeekday < 0) startWeekday = 6;

    const cells = [];

    // Cellules vides avant le 1er
    for (let i = 0; i < startWeekday; i++) {
      cells.push({ empty: true, key: `empty-${i}` });
    }
    // Jours du mois
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const key = `${year}-${month}-${d}`;
      cells.push({
        day: d,
        date,
        key,
        scans: scansByDay[key] || [],
      });
    }
    // Compléter à 42 cellules
    while (cells.length < 42) {
      cells.push({ empty: true, key: `empty-end-${cells.length}` });
    }
    return cells;
  }, [current, scansByDay]);

  const today = new Date();
  const isToday = (d) =>
    d &&
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  function prevMonth() {
    setSelectedDay(null);
    setCurrent((c) => {
      const m = c.month - 1;
      return m < 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: m };
    });
  }

  function nextMonth() {
    setSelectedDay(null);
    setCurrent((c) => {
      const m = c.month + 1;
      return m > 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: m };
    });
  }

  function goToday() {
    setSelectedDay(null);
    setCurrent({ year: today.getFullYear(), month: today.getMonth() });
  }

  function getIntensity(count) {
    if (count === 0) return "bg-transparent";
    if (count <= 2) return "bg-primary/20";
    if (count <= 5) return "bg-primary/40";
    if (count <= 10) return "bg-primary/60";
    return "bg-primary/80";
  }

  const selectedScans = selectedDay ? scansByDay[selectedDay] || [] : [];

  return (
    <div className="space-y-4">
      {/* Header navigation */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-surface/30 p-4">
        <button
          onClick={prevMonth}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-3">
          <CalendarIcon className="h-4 w-4 text-primary" />
          <h2 className="text-base font-semibold text-text-primary">
            {MONTHS[current.month]} {current.year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
          >
            {t("calendar.today")}
          </button>
          <button
            onClick={nextMonth}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grille calendrier */}
      <div className="overflow-hidden rounded-xl border border-border bg-surface/30 p-4">
        {/* Jours de la semaine */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {DAYS.map((d) => (
            <div
              key={d}
              className="py-2 text-center text-[10px] font-medium uppercase tracking-wider text-text-muted"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Cellules */}
        <div className="grid grid-cols-7 gap-1">
          {grid.map((cell) => {
            if (cell.empty) {
              return <div key={cell.key} className="aspect-square" />;
            }
            const count = cell.scans.length;
            const selected = selectedDay === cell.key;
            const todayCell = isToday(cell.date);

            return (
              <motion.button
                key={cell.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setSelectedDay(selected ? null : cell.key)
                }
                className={`relative flex aspect-square flex-col items-center justify-center rounded-lg border text-xs transition-all ${
                  selected
                    ? "border-primary bg-primary/10 text-primary shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]"
                    : todayCell
                      ? "border-primary/50 bg-surface-2/40 text-text-primary"
                      : "border-border bg-surface/40 text-text-secondary hover:border-primary/40"
                }`}
              >
                <span className="relative font-medium">{cell.day}</span>

                {/* Indicateur de scans */}
                {count > 0 && (
                  <div className="mt-1 flex gap-0.5">
                    {count <= 3 ? (
                      Array.from({ length: count }).map((_, i) => (
                        <span
                          key={i}
                          className={`h-1 w-1 rounded-full ${
                            selected ? "bg-primary" : "bg-primary/70"
                          }`}
                        />
                      ))
                    ) : (
                      <span
                        className={`rounded-full px-1.5 text-[8px] font-bold ${
                          selected
                            ? "bg-primary text-white"
                            : "bg-primary/20 text-primary"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </div>
                )}

                {/* Barre d'intensité en bas */}
                {count > 0 && (
                  <div
                    className={`absolute bottom-0.5 left-1/2 h-0.5 -translate-x-1/2 rounded-full ${getIntensity(
                      count
                    )}`}
                    style={{ width: `${Math.min(80, count * 10)}%` }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Scans du jour sélectionné */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="rounded-xl border border-border bg-surface/30 p-4"
          >
            <div className="mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-text-primary">
                {t("calendar.scansOn")}{" "}
                {selectedDay.split("-")[2]}/{parseInt(selectedDay.split("-")[1]) + 1}/
                {selectedDay.split("-")[0]}
              </h3>
              <Badge variant="primary">
                {selectedScans.length}{" "}
                {selectedScans.length === 1
                  ? t("history.document")
                  : t("history.documents")}
              </Badge>
            </div>

            {selectedScans.length === 0 ? (
              <p className="py-4 text-center text-xs text-text-muted">
                {t("calendar.noScans")}
              </p>
            ) : (
              <div className="space-y-2">
                {selectedScans.map((scan) => (
                  <div
                    key={scan.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-4 py-2.5 transition-colors hover:bg-white/[0.02]"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <FileText className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="truncate text-xs text-text-primary">
                        {scan.original_filename}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-text-muted" />
                      <span className="text-[10px] text-text-muted">
                        {new Date(scan.created_at).toLocaleTimeString(
                          lang === "en" ? "en-GB" : "fr-FR",
                          { hour: "2-digit", minute: "2-digit" }
                        )}
                      </span>
                      <Badge
                        variant={
                          scan.status === "validated" ? "success" : "warning"
                        }
                      >
                        {t(`history.${scan.status}`, scan.status)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}