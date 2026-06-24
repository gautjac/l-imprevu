import { useEffect, useState } from "react";
import { useI18n } from "../i18n";
import { Mark } from "./Bits";

export function Loading() {
  const { t } = useI18n();
  const lines = [t("load.l1"), t("load.l2"), t("load.l3"), t("load.l4"), t("load.l5")];
  const [i, setI] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const id = setInterval(() => setI((x) => (x + 1) % lines.length), 2600);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="scanbox overflow-hidden rounded-lg border border-ink-500/60 bg-ink-800 shadow-card">
        <div className="flex flex-col items-center gap-5 px-6 py-16 text-center">
          <div className="animate-pulse">
            <Mark size={48} />
          </div>
          <div className="font-display text-xl font-600 uppercase tracking-wide text-paper">
            {t("brief.submitting")}
          </div>
          <div
            key={i}
            className="min-h-[1.5rem] animate-riseIn font-mono text-[0.92rem] text-amber"
          >
            {lines[i]}
          </div>
          <div className="mt-2 flex gap-1.5" aria-hidden>
            {lines.map((_, k) => (
              <span
                key={k}
                className="h-[6px] w-6 rounded-full transition-colors"
                style={{ background: k === i ? "#f5a01f" : "rgba(236,230,218,0.16)" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
