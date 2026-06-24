import type { ReactNode } from "react";

/** A thin hazard-stripe rule — the signature motif, used sparingly. */
export function HazardRule({ className = "" }: { className?: string }) {
  return <div className={`hazard h-1.5 w-full ${className}`} aria-hidden />;
}

/** The triangular caution badge / logo mark. */
export function Mark({ size = 26 }: { size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
      <path
        d="M32 12 L54 50 L10 50 Z"
        fill="none"
        stroke="#ff5a1f"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <rect x="29.8" y="25" width="4.4" height="13" rx="2.2" fill="#ff5a1f" />
      <circle cx="32" cy="44" r="2.6" fill="#ff5a1f" />
    </svg>
  );
}

/** A small uppercase label chip in the call-sheet style. */
export function Tag({
  children,
  color,
  active,
  onClick,
  title,
}: {
  children: ReactNode;
  color?: string;
  active?: boolean;
  onClick?: () => void;
  title?: string;
}) {
  const base =
    "inline-flex items-center gap-1.5 rounded px-2.5 py-1 font-display text-[0.72rem] font-500 uppercase tracking-wider transition select-none";
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        className={`${base} border ${
          active
            ? "border-amber bg-amber/15 text-amber-soft"
            : "border-ink-500/70 bg-ink-700/60 text-paper-dim hover:border-amber/60 hover:text-paper"
        }`}
      >
        {children}
      </button>
    );
  }
  return (
    <span
      className={`${base} border border-ink-500/70 bg-ink-700/70`}
      style={color ? { color, borderColor: `${color}55` } : undefined}
    >
      {children}
    </span>
  );
}

/** Severity × likelihood gauge — five mono dots. */
export function Dots({ n, color }: { n: number; color: string }) {
  return (
    <span className="inline-flex gap-[3px]" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="h-[7px] w-[7px] rounded-[1px]"
          style={{
            background: i <= n ? color : "transparent",
            boxShadow: i <= n ? "none" : "inset 0 0 0 1px rgba(236,230,218,0.22)",
          }}
        />
      ))}
    </span>
  );
}
