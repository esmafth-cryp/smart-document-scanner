import { useState, useRef, useEffect } from "react";
import { Sun, Moon, User, LogOut, ChevronDown, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { NotificationsDropdown } from "./NotificationsDropdown";
import { GlobalSearch } from "./GlobalSearch";
import { LanguageSwitcher } from "./LanguageSwitcher";

export function Header({ title, subtitle, onSelectScan, onSeeAll }) {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { resetTour } = useOnboarding();
  const { t } = useTranslation();
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
    <header className="relative z-40 flex h-16 items-center justify-between border-b border-border bg-surface/30 px-6 backdrop-blur-sm">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-text-primary">{title}</h1>
        {subtitle && <p className="truncate text-xs text-text-muted">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        <GlobalSearch onSelectScan={onSelectScan} onSeeAll={onSeeAll} />

        <LanguageSwitcher />

        <NotificationsDropdown />

        <button
          onClick={resetTour}
          title={t("onboarding.restart")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
        >
          <HelpCircle className="h-4 w-4" />
        </button>

        <button
          onClick={toggleTheme}
          data-tour="theme"
          title={theme === "dark" ? t("theme.lightMode") : t("theme.darkMode")}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

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
            <div className="absolute right-0 top-full z-[100] mt-2 w-64 overflow-hidden rounded-xl border border-border-strong bg-surface shadow-[0_20px_60px_-10px_rgba(0,0,0,0.4)]">
              <div className="border-b border-border p-3">
                <p className="truncate text-sm font-medium text-text-primary">
                  {user?.full_name || "Utilisateur"}
                </p>
                <p className="truncate text-[11px] text-text-muted">{user?.email || "—"}</p>
                <span className="mt-1.5 inline-block rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                  {user?.role ? t(`roles.${user.role}`) : "—"}
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
                {t("auth.signOut")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}