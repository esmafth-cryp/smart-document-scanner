import { useState, useRef, useEffect } from "react";
import { Search, Bell, Sun, Moon, User, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export function Header({ title, subtitle, dark = true, onToggleTheme }) {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

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

        {/* Avatar dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-full border border-border bg-surface-2 px-1 transition-colors hover:border-primary/50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <ChevronDown
              className={`mr-1 h-3 w-3 text-text-muted transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-border bg-[#0d1224] shadow-2xl">
              <div className="border-b border-border p-3">
                <p className="truncate text-sm font-medium text-text-primary">
                  {user?.full_name || "Utilisateur"}
                </p>
                <p className="truncate text-[11px] text-text-muted">{user?.email || "—"}</p>
                <span className="mt-1.5 inline-block rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium capitalize text-primary">
                  {user?.role || "—"}
                </span>
              </div>

              <button
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-text-secondary transition-colors hover:bg-danger/10 hover:text-danger"
              >
                <LogOut className="h-3.5 w-3.5" />
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}