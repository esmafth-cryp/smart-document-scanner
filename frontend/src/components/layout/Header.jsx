import { Search, Bell, Sun, Moon, User } from "lucide-react";
import { Button } from "../ui/Button";

export function Header({ title, subtitle, dark = true, onToggleTheme }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface/30 px-6 backdrop-blur-sm">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-text-primary">{title}</h1>
        {subtitle && <p className="truncate text-xs text-text-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="h-9 w-64 rounded-lg border border-border bg-surface-2/50 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30"
          />
        </div>

        {/* Notifications */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary">
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface-2">
          <User className="h-4 w-4 text-text-secondary" />
        </div>
      </div>
    </header>
  );
}