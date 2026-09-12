import { createContext, useContext, useEffect, useState } from "react";

const DevModeContext = createContext(null);

export function DevModeProvider({ children }) {
  const [devMode, setDevMode] = useState(false);

  // Raccourci clavier global : Ctrl+Shift+D
  useEffect(() => {
    function onKey(e) {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setDevMode((d) => !d);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Log dans la console à chaque toggle
  useEffect(() => {
    if (devMode) {
      console.log(
        "%c[DEV MODE] Activé",
        "background: #EF4444; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;"
      );
      console.log(
        "%cCtrl+Shift+D pour désactiver",
        "color: #94A3B8; font-style: italic;"
      );
    } else {
      console.log(
        "%c[DEV MODE] Désactivé",
        "background: #64748B; color: white; padding: 4px 8px; border-radius: 4px;"
      );
    }
  }, [devMode]);

  return (
    <DevModeContext.Provider value={{ devMode, setDevMode }}>
      {children}
    </DevModeContext.Provider>
  );
}

export function useDevMode() {
  const ctx = useContext(DevModeContext);
  if (!ctx) throw new Error("useDevMode must be used inside DevModeProvider");
  return ctx;
}