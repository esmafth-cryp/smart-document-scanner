import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, ChevronDown, ChevronUp } from "lucide-react";
import { useDevMode } from "../../contexts/DevModeContext";

export function DevInfo({ name, props, children }) {
  const { devMode } = useDevMode();
  const [open, setOpen] = useState(false);

  if (!devMode) return children;

  // On retire les props React internes (key, ref, children...)
  const cleanProps = Object.fromEntries(
    Object.entries(props || {}).filter(
      ([k]) =>
        !["children", "key", "ref"].includes(k) &&
        typeof props[k] !== "function" &&
        typeof props[k] !== "object"
    )
  );

  const propsToShow = Object.keys(cleanProps).length > 0 ? cleanProps : { info: "(aucune prop simple)" };

  return (
    <div className="relative">
      {/* Badge en haut à droite du composant */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="absolute right-1 top-1 z-[60] flex items-center gap-1 rounded-md border border-danger/40 bg-danger/20 px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase text-danger backdrop-blur-md transition-all hover:bg-danger/40"
        title={`DEV: ${name}`}
      >
        <Code2 className="h-2.5 w-2.5" />
        {open ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
      </button>

      {/* Panneau des props */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-1 top-8 z-[60] max-w-[300px] overflow-hidden rounded-lg border border-danger/30 bg-[#0B0F1A] p-2 shadow-2xl"
          >
            <p className="mb-1 text-[9px] font-bold uppercase tracking-wider text-danger">
              {name}
            </p>
            <div className="space-y-0.5 font-mono text-[10px]">
              {Object.entries(propsToShow).map(([key, value]) => (
                <div key={key} className="flex items-start gap-1.5">
                  <span className="text-primary">{key}:</span>
                  <span className="text-text-secondary">
                    {String(value).length > 60
                      ? String(value).slice(0, 60) + "…"
                      : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}