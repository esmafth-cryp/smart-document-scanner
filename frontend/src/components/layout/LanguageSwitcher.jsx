import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current =
    LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function changeLanguage(code) {
    i18n.changeLanguage(code);
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref} data-tour="language">
      <button
        onClick={() => setOpen((o) => !o)}
        title={i18n.t("language.switch")}
        className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
      >
        <Globe className="h-4 w-4" />
        <span className="text-xs font-medium uppercase">{current.code}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-[100] mt-2 w-44 overflow-hidden rounded-xl border border-border-strong bg-surface shadow-[0_20px_60px_-10px_rgba(0,0,0,0.4)]"
          >
            <div className="border-b border-border px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-text-muted">
                {i18n.t("language.switch")}
              </p>
            </div>
            {LANGUAGES.map((lang) => {
              const isActive = i18n.language === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="flex-1 font-medium">{lang.label}</span>
                  {isActive && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}