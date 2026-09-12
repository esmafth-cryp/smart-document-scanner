import React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import "./i18n";
import App from "./App.jsx";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
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
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);