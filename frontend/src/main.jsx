import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import "./i18n";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DevModeProvider } from "./contexts/DevModeContext";
import { OnboardingProvider } from "./contexts/OnboardingContext";
import { DevBadge } from "./components/dev/DevBadge";
import { OnboardingTour } from "./components/onboarding/OnboardingTour";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DevModeProvider>
      <ThemeProvider>
        <AuthProvider>
          <OnboardingProvider>
            <App />
            <DevBadge />
            <OnboardingTour />
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "#131826",
                  color: "#F8FAFC",
                  border: "1px solid rgba(255,255,255,0.06)",
                  fontSize: "13px",
                },
              }}
            />
          </OnboardingProvider>
        </AuthProvider>
      </ThemeProvider>
    </DevModeProvider>
  </StrictMode>
);