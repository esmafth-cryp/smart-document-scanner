export const ANALYSIS_STEPS = [
  { id: "preprocess", label: "PRÉTRAITEMENT", color: "pink" },
  { id: "ocr", label: "OCR", color: "violet" },
  { id: "extract", label: "EXTRACTION", color: "cyan" },
];

export const STEP_COLORS = {
  pink: {
    gradient: "from-pink-500 to-fuchsia-500",
    glow: "shadow-[0_0_30px_rgba(236,72,153,0.6)]",
    text: "text-pink-400",
    border: "border-pink-500/40",
  },
  violet: {
    gradient: "from-violet-500 to-blue-500",
    glow: "shadow-[0_0_30px_rgba(139,92,246,0.6)]",
    text: "text-violet-400",
    border: "border-violet-500/40",
  },
  cyan: {
    gradient: "from-cyan-400 to-blue-400",
    glow: "shadow-[0_0_30px_rgba(34,211,238,0.6)]",
    text: "text-cyan-400",
    border: "border-cyan-400/40",
  },
};