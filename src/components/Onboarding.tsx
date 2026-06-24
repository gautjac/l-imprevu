import { useI18n } from "../i18n";
import { HazardRule, Mark } from "./Bits";

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const steps = [
    { h: t("onb.l1"), b: t("onb.l1b") },
    { h: t("onb.l2"), b: t("onb.l2b") },
    { h: t("onb.l3"), b: t("onb.l3b") },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/85 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-lg border border-ink-500/70 bg-ink-800 shadow-lift animate-riseIn">
        <HazardRule />
        <div className="p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-3">
            <Mark size={34} />
            <div>
              <div className="font-display text-2xl font-700 uppercase tracking-wide text-paper">
                L'Imprévu
              </div>
              <div className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-amber">
                {t("onb.title")}
              </div>
            </div>
          </div>

          <ol className="space-y-4">
            {steps.map((s, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded border border-amber/50 bg-amber/10 font-mono text-sm font-700 text-amber">
                  {i + 1}
                </span>
                <div>
                  <div className="font-display text-lg font-600 uppercase tracking-wide text-paper">
                    {s.h.replace(/^\d+\s—\s/, "")}
                  </div>
                  <p className="text-[0.95rem] leading-snug text-paper-dim">{s.b}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-7 flex items-center justify-between gap-3">
            <button
              onClick={onDone}
              className="font-display text-sm uppercase tracking-wider text-paper-dim/70 underline-offset-4 hover:text-paper hover:underline"
            >
              {t("onb.skip")}
            </button>
            <button
              onClick={onDone}
              className="rounded bg-safety px-6 py-2.5 font-display text-base font-600 uppercase tracking-wider text-ink-900 shadow-tape transition hover:bg-safety/90 active:translate-y-px"
            >
              {t("onb.go")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
