import { motion } from "framer-motion";
import { FileScan, LayoutDashboard, History, Settings, ChevronLeft, Shield } from "lucide-react";
import { cn } from "../../lib/utils";

const navItems = [
  { id: "dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { id: "scan", label: "Scanner", icon: FileScan },
  { id: "history", label: "Historique", icon: History },
  { id: "admin", label: "Administration", icon: Shield },
  { id: "settings", label: "Paramètres", icon: Settings },
];

export function Sidebar({ active = "scan", onNavigate, collapsed = false, onToggle }) {
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
        {navItems.map((item) => {
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

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="flex h-12 items-center justify-center border-t border-border text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
      >
        <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
      </button>
    </motion.aside>
  );
}