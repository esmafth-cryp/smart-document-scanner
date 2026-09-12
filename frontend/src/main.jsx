import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
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
  </StrictMode>
);