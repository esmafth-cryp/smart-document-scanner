import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, X, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useOnboarding } from "../../contexts/OnboardingContext";

const STEPS = [
  {
    key: "sidebar",
    target: "[data-tour='sidebar']",
    titleKey: "onboarding.sidebar.title",
    descKey: "onboarding.sidebar.desc",
    position: "right",
    mobileSkip: true,
  },
  {
    key: "search",
    target: "[data-tour='search']",
    titleKey: "onboarding.search.title",
    descKey: "onboarding.search.desc",
    position: "bottom",
    mobileSkip: true,
  },
  {
    key: "language",
    target: "[data-tour='language']",
    titleKey: "onboarding.language.title",
    descKey: "onboarding.language.desc",
    position: "bottom",
  },
  {
    key: "theme",
    target: "[data-tour='theme']",
    titleKey: "onboarding.theme.title",
    descKey: "onboarding.theme.desc",
    position: "bottom",
    mobileSkip: true,
  },
  {
    key: "notifications",
    target: "[data-tour='notifications']",
    titleKey: "onboarding.notifications.title",
    descKey: "onboarding.notifications.desc",
    position: "bottom",
  },
  {
    key: "scan",
    target: "[data-tour='nav-scan']",
    titleKey: "onboarding.scan.title",
    descKey: "onboarding.scan.desc",
    position: "right",
    mobileSkip: true,
  },
  {
    key: "chat",
    target: "[data-tour='chat']",
    titleKey: "onboarding.chat.title",
    descKey: "onboarding.chat.desc",
    position: "top",
  },
  {
    key: "dashboard",
    target: "[data-tour='nav-dashboard']",
    titleKey: "onboarding.dashboard.title",
    descKey: "onboarding.dashboard.desc",
    position: "right",
    mobileSkip: true,
  },
];

export function OnboardingTour() {
  const { t } = useTranslation();
  const { isOpen, stepIndex, nextStep, prevStep, stopTour } = useOnboarding();
  const [rect, setRect] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const retryRef = useRef(null);

  // Détecte si on est sur mobile
  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth < 1024);
    }
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Filtrer les étapes selon le device
  const visibleSteps = STEPS.filter(
    (s) => !(isMobile && s.mobileSkip)
  );

  const currentStep = visibleSteps[stepIndex];
  const isLast = stepIndex === visibleSteps.length - 1;

  // Calcule la position de l'élément cible
  const updatePosition = useCallback(() => {
    if (!isOpen || !currentStep) return;

    const el = document.querySelector(currentStep.target);

    if (!el) {
      // Élément non trouvé : on attend 500ms et on réessaie
      // Si toujours pas trouvé après 3 tentatives, on skip
      let attempts = 0;
      const tryFind = () => {
        attempts++;
        const el2 = document.querySelector(currentStep.target);
        if (el2) {
          updatePositionWithElement(el2);
        } else if (attempts < 3) {
          retryRef.current = setTimeout(tryFind, 500);
        } else {
          // Skip après 3 tentatives
          if (stepIndex < visibleSteps.length - 1) {
            nextStep();
          } else {
            stopTour();
          }
        }
      };
      retryRef.current = setTimeout(tryFind, 500);
      return;
    }

    updatePositionWithElement(el);
  }, [isOpen, currentStep, stepIndex, visibleSteps.length, nextStep, stopTour]);

  function updatePositionWithElement(el) {
    // Scroll l'élément en vue
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    const r = el.getBoundingClientRect();
    const padding = 8;

    setRect({
      top: r.top - padding,
      left: r.left - padding,
      width: r.width + padding * 2,
      height: r.height + padding * 2,
    });

    // Position du tooltip
    const TOOLTIP_W = Math.min(320, window.innerWidth - 32);
    const TOOLTIP_H = 200;
    const gap = 16;
    let top, left;

    if (currentStep.position === "right") {
      top = r.top + r.height / 2 - TOOLTIP_H / 2;
      left = r.right + gap;
      // Si ça dépasse à droite, on met en dessous
      if (left + TOOLTIP_W > window.innerWidth - 16) {
        top = r.bottom + gap;
        left = r.left + r.width / 2 - TOOLTIP_W / 2;
      }
    } else if (currentStep.position === "bottom") {
      top = r.bottom + gap;
      left = r.left + r.width / 2 - TOOLTIP_W / 2;
    } else if (currentStep.position === "top") {
      top = r.top - TOOLTIP_H - gap;
      left = r.left + r.width / 2 - TOOLTIP_W / 2;
    } else {
      top = r.top + r.height / 2 - TOOLTIP_H / 2;
      left = r.left - TOOLTIP_W - gap;
    }

    // Empêcher le dépassement de l'écran
    if (left < 16) left = 16;
    if (left + TOOLTIP_W > window.innerWidth - 16) {
      left = window.innerWidth - TOOLTIP_W - 16;
    }
    if (top < 16) top = 16;
    if (top + TOOLTIP_H > window.innerHeight - 16) {
      top = window.innerHeight - TOOLTIP_H - 16;
    }

    setTooltipPos({ top, left });
  }

  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [updatePosition]);

  // Clavier : Échap, flèches
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") stopTour();
      if (e.key === "ArrowRight" && !isLast) nextStep();
      if (e.key === "ArrowLeft" && stepIndex > 0) prevStep();
    }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, isLast, stepIndex, nextStep, prevStep, stopTour]);

  if (!isOpen || !rect || !currentStep) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[300]"
        style={{ pointerEvents: "auto" }}
      >
        {/* Overlay sombre avec trou (spotlight) via box-shadow */}
        <div
          className="absolute rounded-xl transition-all duration-300 ease-out"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.75)",
            border: "2px solid rgba(59, 130, 246, 0.6)",
            pointerEvents: "none",
          }}
        />

        {/* Overlay clickable pour fermer */}
        <div
          className="absolute inset-0"
          onClick={stopTour}
          style={{ pointerEvents: "auto" }}
        />

        {/* Tooltip */}
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute w-[320px] max-w-[calc(100vw-32px)] overflow-hidden rounded-xl border border-border-strong bg-surface shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)]"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            pointerEvents: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-surface/95 px-4 py-3 backdrop-blur">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md gradient-primary">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                {stepIndex + 1} / {visibleSteps.length}
              </span>
            </div>
            <button
              onClick={stopTour}
              className="rounded p-1 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary"
              title={t("onboarding.skip")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="mb-1.5 text-sm font-semibold text-text-primary">
              {t(currentStep.titleKey)}
            </h3>
            <p className="text-xs leading-relaxed text-text-secondary">
              {t(currentStep.descKey)}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border bg-surface/50 px-4 py-3">
            <button
              onClick={stopTour}
              className="text-[11px] text-text-muted transition-colors hover:text-text-primary"
            >
              {t("onboarding.skip")}
            </button>

            <div className="flex items-center gap-2">
              {stepIndex > 0 && (
                <button
                  onClick={prevStep}
                  className="flex h-7 items-center gap-1 rounded-md border border-border px-2.5 text-[11px] text-text-secondary transition-colors hover:bg-white/5 hover:text-text-primary"
                >
                  <ChevronLeft className="h-3 w-3" />
                  {t("onboarding.previous")}
                </button>
              )}
              <button
                onClick={isLast ? stopTour : nextStep}
                className="flex h-7 items-center gap-1 rounded-md gradient-primary px-3 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
              >
                {isLast ? t("onboarding.finish") : t("onboarding.next")}
                {!isLast && <ChevronRight className="h-3 w-3" />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}