export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div
        className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full opacity-[0.08] blur-[120px]"
        style={{ background: "radial-gradient(circle, #8B5CF6, transparent 70%)" }}
      />
      <div
        className="absolute -right-40 top-1/3 h-[600px] w-[600px] rounded-full opacity-[0.06] blur-[140px]"
        style={{ background: "radial-gradient(circle, #06B6D4, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-200px] left-1/3 h-[500px] w-[500px] rounded-full opacity-[0.05] blur-[120px]"
        style={{ background: "radial-gradient(circle, #EC4899, transparent 70%)" }}
      />
    </div>
  );
}