import { motion } from "framer-motion";
import {
  LayoutDashboard,
  History,
  Settings,
  ChevronLeft,
  Shield,
  LogOut,
  User as UserIcon,
  FileScan,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";
import { MarsaLogo } from "../brand/MarsaLogo";

export function Sidebar({ active = "scan", onNavigate, collapsed = false, onToggle }) {
  const { user, signOut, role } = useAuth();
  const { t } = useTranslation();

  const navItems = [
    { id: "dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
    { id: "scan", label: t("nav.scan"), icon: FileScan },
    { id: "history", label: t("nav.history"), icon: History },
    { id: "admin", label: t("nav.admin"), icon: Shield, roles: ["admin"] },
    { id: "settings", label: t("nav.settings"), icon: Settings },
  ];

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex h-full flex-col border-r border-border bg-surface/30 backdrop-blur-sm"
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-border px-4">
        {collapsed ? (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-primary shadow-lg shadow-primary/20">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-white"
              fill="currentColor"
            >
              <path d="M12 2l2.9 6.9L22 10l-5.5 4.7L18.2 22 12 18.3 5.8 22l1.7-7.3L2 10l7.1-1.1L12 2z" />
            </svg>
          </div>
        ) : (
          <MarsaLogo size="md" />
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {visibleItems.map((item) => {
          const isActive = active === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group relative flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg border border-primary/20 bg-primary/10"
                  transition={{ duration: 0.2 }}
                />
              )}
              <Icon className="relative h-4 w-4 shrink-0" strokeWidth={2} />
              {!collapsed && <span className="relative truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-border p-3">
        {!collapsed ? (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-surface-2/40 p-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <UserIcon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-text-primary">
                {user?.full_name || "Utilisateur"}
              </p>
              <p className="truncate text-[10px] text-text-muted">
                {user?.role ? t(`roles.${user.role}`) : "—"}
              </p>
            </div>
          </div>
        ) : null}

        <button
          onClick={signOut}
          title={t("nav.logout")}
          className={cn(
            "flex h-9 w-full items-center gap-3 rounded-lg px-3 text-xs text-text-muted transition-colors hover:bg-danger/10 hover:text-danger",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>{t("nav.logout")}</span>}
        </button>
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="flex h-10 items-center justify-center border-t border-border text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
      </button>
    </motion.aside>
  );
}