import { motion } from "framer-motion";
import {
  FileScan,
  LayoutDashboard,
  History,
  Settings,
  ChevronLeft,
  Shield,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "scan", label: "Scanner", icon: FileScan },
  { id: "history", label: "Historique", icon: History },
  { id: "admin", label: "Administration", icon: Shield, roles: ["admin"] },
  { id: "settings", label: "Paramètres", icon: Settings },
];

export function Sidebar({ active = "scan", onNavigate, collapsed = false, onToggle }) {
  const { user, signOut, role } = useAuth();

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
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-primary">
          <FileScan className="h-5 w-5 text-white" strokeWidth={2.2} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text-primary">Smart Scanner</p>
            <p className="truncate text-[10px] text-text-muted">Marsa Maroc</p>
          </div>
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
        {!collapsed && (
          <div className="mb-2 flex items-center gap-2 rounded-lg bg-surface-2/40 p-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <UserIcon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-text-primary">
                {user?.full_name || "Utilisateur"}
              </p>
              <p className="truncate text-[10px] text-text-muted capitalize">
                {user?.role || "—"}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={signOut}
          title="Déconnexion"
          className={cn(
            "flex h-9 w-full items-center gap-3 rounded-lg px-3 text-xs text-text-muted transition-colors hover:bg-danger/10 hover:text-danger",
            collapsed && "justify-center"
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
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