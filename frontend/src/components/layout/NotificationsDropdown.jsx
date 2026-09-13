import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  FileText,
  CheckCircle2,
  UserPlus,
  UserCog,
  UserX,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { fetchNotifications } from "../../api/auth";

const ACTION_ICONS = {
  "scan.create": FileText,
  "scan.validate": CheckCircle2,
  "user.create": UserPlus,
  "user.update": UserCog,
  "user.delete": UserX,
};

const ACTION_COLORS = {
  "scan.create": "text-primary",
  "scan.validate": "text-success",
  "user.create": "text-cyan",
  "user.update": "text-warning",
  "user.delete": "text-danger",
};

const ACTION_LABELS = {
  "scan.create": "notifications.scanCreate",
  "scan.validate": "notifications.scanValidate",
  "user.create": "notifications.userCreate",
  "user.update": "notifications.userUpdate",
  "user.delete": "notifications.userDelete",
};

export function NotificationsDropdown() {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("sds_read_notifs") || "[]");
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchNotifications()
      .then((res) => setItems(res.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [open]);

  function markAllRead() {
    const ids = items.map((i) => i.id);
    setReadIds(ids);
    localStorage.setItem("sds_read_notifs", JSON.stringify(ids));
  }

  function markOneRead(id) {
    const next = [...new Set([...readIds, id])];
    setReadIds(next);
    localStorage.setItem("sds_read_notifs", JSON.stringify(next));
  }

  const unreadCount = items.filter((i) => !readIds.includes(i.id)).length;

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString(i18n.language === "en" ? "en-GB" : "fr-FR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getLabel(item) {
    const key = ACTION_LABELS[item.action];
    return key ? t(key) : item.label;
  }

  return (
    <div className="relative" ref={ref} data-tour="notifications">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-[100] mt-2 w-80 overflow-hidden rounded-xl border border-border-strong bg-surface shadow-[0_20px_60px_-10px_rgba(0,0,0,0.4)]"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm font-semibold text-text-primary">
                  {t("notifications.title")}
                </span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] text-primary">
                    {unreadCount}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[10px] text-text-muted transition-colors hover:text-primary"
                >
                  {t("notifications.markAllRead")}
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-6 text-center text-xs text-text-muted">
                  {t("common.loading")}
                </div>
              ) : items.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-muted">
                  {t("notifications.noNotifications")}
                </div>
              ) : (
                items.map((item) => {
                  const Icon = ACTION_ICONS[item.action] || Bell;
                  const color = ACTION_COLORS[item.action] || "text-text-secondary";
                  const isUnread = !readIds.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => markOneRead(item.id)}
                      className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-white/[0.02] ${
                        isUnread ? "bg-primary/[0.03]" : ""
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/5 ${color}`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-text-primary">
                          {getLabel(item)}
                        </p>
                        <p className="mt-0.5 text-[10px] text-text-muted">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                      {isUnread && (
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-border px-4 py-2 text-center">
                <span className="text-[10px] text-text-muted">
                  {t("notifications.recentCount", { count: items.length })}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}