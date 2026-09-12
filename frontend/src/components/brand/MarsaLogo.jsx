export function MarsaLogo({ size = "md" }) {
  const sizes = {
    sm: { text: "text-[10px]", star: "h-2 w-2", gap: "gap-0.5" },
    md: { text: "text-sm", star: "h-3 w-3", gap: "gap-1" },
    lg: { text: "text-2xl", star: "h-5 w-5", gap: "gap-1.5" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className="flex flex-col items-center leading-none">
      {/* Ligne 1 : M ★ RSA */}
      <div className={`flex items-center justify-center ${s.gap}`}>
        <span className={`${s.text} font-black tracking-tight text-text-primary`}>
          M
        </span>
        <svg
          viewBox="0 0 24 24"
          className={`${s.star} shrink-0 text-primary`}
          fill="currentColor"
        >
          <path d="M12 2l2.9 6.9L22 10l-5.5 4.7L18.2 22 12 18.3 5.8 22l1.7-7.3L2 10l7.1-1.1L12 2z" />
        </svg>
        <span className={`${s.text} font-black tracking-tight text-text-primary`}>
          RSA
        </span>
      </div>

      {/* Ligne 2 : MAROC aligné sous le bloc complet */}
      <span
        className={`${s.text} mt-0.5 font-black tracking-tight text-primary`}
        style={{ letterSpacing: "0.02em" }}
      >
        MAROC
      </span>
    </div>
  );
}