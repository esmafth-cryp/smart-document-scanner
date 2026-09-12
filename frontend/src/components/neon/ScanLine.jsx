import { motion } from "framer-motion";

export function ScanLine() {
  return (
    <motion.div
      initial={{ top: "0%" }}
      animate={{ top: "100%" }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
        repeatType: "reverse",
      }}
      className="pointer-events-none absolute left-0 right-0 z-10 h-1"
      style={{
        background:
          "linear-gradient(90deg, transparent, rgba(139,92,246,0.8), transparent)",
        boxShadow: "0 0 20px rgba(139,92,246,0.6)",
      }}
    />
  );
}