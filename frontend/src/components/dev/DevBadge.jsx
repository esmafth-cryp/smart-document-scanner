import { motion, AnimatePresence } from "framer-motion";
import { Bug, X } from "lucide-react";
import { useDevMode } from "../../contexts/DevModeContext";

export function DevBadge() {
  const { devMode, setDevMode } = useDevMode();

  return (
    <AnimatePresence>
      {devMode && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className="fixed right-4 top-20 z-[200] flex items-center gap-2 rounded-full border border-danger/40 bg-danger/10 px-3 py-1.5 backdrop-blur-md"
        >
          <span className="flex h-2 w-2 animate-pulse rounded-full bg-danger" />
          <Bug className="h-3.5 w-3.5 text-danger" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-danger">
            Dev Mode
          </span>
          <button
            onClick={() => setDevMode(false)}
            className="ml-1 rounded-full p-0.5 text-danger/70 transition-colors hover:bg-danger/20 hover:text-danger"
            title="Désactiver (Ctrl+Shift+D)"
          >
            <X className="h-3 w-3" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}