import { createContext, useContext, useEffect, useState } from "react";

const OnboardingContext = createContext(null);

const STORAGE_KEY = "sds_onboarding_done";

export function OnboardingProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [hasLaunched, setHasLaunched] = useState(false);

  // Lance le tour seulement si :
  // 1. L'utilisateur n'a pas encore vu le tour
  // 2. L'utilisateur est connecté (token présent)
  // 3. On est PAS sur la page login
  useEffect(() => {
    if (hasLaunched) return;

    const done = localStorage.getItem(STORAGE_KEY);
    if (done === "true") {
      setHasLaunched(true);
      return;
    }

    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem("sds_access_token");
    if (!token) {
      // Pas connecté → on n'affiche pas le tour pour l'instant
      // On va réessayer quand l'utilisateur se connecte
      return;
    }

    // Vérifier qu'on n'est PAS sur le login (URL)
    // On attend un peu que la page se charge
    const timer = setTimeout(() => {
      // Double vérification : le token est toujours là
      const tokenNow = localStorage.getItem("sds_access_token");
      if (!tokenNow) return;

      setIsOpen(true);
      setHasLaunched(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [hasLaunched]);

  // Relance le tour quand l'utilisateur se connecte
  useEffect(() => {
    function onStorageChange() {
      const done = localStorage.getItem(STORAGE_KEY);
      const token = localStorage.getItem("sds_access_token");

      if (done !== "true" && token && !hasLaunched) {
        // L'utilisateur vient de se connecter
        setTimeout(() => {
          setIsOpen(true);
          setHasLaunched(true);
        }, 1500);
      }
    }

    window.addEventListener("storage", onStorageChange);
    // Vérifier aussi régulièrement (car "storage" ne se déclenche pas dans le même onglet)
    const interval = setInterval(onStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", onStorageChange);
      clearInterval(interval);
    };
  }, [hasLaunched]);

  function startTour() {
    setStepIndex(0);
    setIsOpen(true);
  }

  function stopTour() {
    setIsOpen(false);
    setStepIndex(0);
    localStorage.setItem(STORAGE_KEY, "true");
  }

  function nextStep() {
    setStepIndex((i) => i + 1);
  }

  function prevStep() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function resetTour() {
    localStorage.removeItem(STORAGE_KEY);
    setStepIndex(0);
    setIsOpen(true);
  }

  return (
    <OnboardingContext.Provider
      value={{
        isOpen,
        stepIndex,
        startTour,
        stopTour,
        nextStep,
        prevStep,
        resetTour,
        setIsOpen,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used inside OnboardingProvider");
  return ctx;
}