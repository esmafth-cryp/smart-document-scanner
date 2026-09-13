import { createContext, useContext, useEffect, useState } from "react";

const OnboardingContext = createContext(null);

const STORAGE_KEY = "sds_onboarding_done";

export function OnboardingProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // Vérifier au démarrage si l'utilisateur a déjà vu le tour
  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (done !== "true") {
      // Petit délai pour laisser l'app se charger
      setTimeout(() => setIsOpen(true), 800);
    }
  }, []);

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