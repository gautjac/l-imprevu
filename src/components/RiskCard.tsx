import { useI18n } from "../i18n";
import type { Risk } from "../types";
import { score } from "../types";
import { CAT_HEX, CATEGORY_META, sevHex } from "../meta";
import { Dots } from "./Bits";

export function RiskCard({ risk, index }: { risk: Risk; index: number }) {
  const { t, lang } = useI18n();
  const sev = sevHex(risk.severity);
  const catHex = CAT_HEX[risk.category];
  const meta = CATEGORY_META[risk.category];
  const sc = score(risk);

  return (
    <article
      className="group relative animate-riseIn overflow-hidden rounded-md border border-ink-600/80 bg-ink-800 shadow-card"
      style={{ animationDelay: `${Math.min(index * 45, 360)}ms` }}
    >
      {/* severity spine */}
      <div className="absolute inset-y-0 left-0 w-1.5" style={{ background: sev }} aria-hidden />

      <div className="py-4 pl-5 pr-4">
        {/* header row */}
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-display text-[0.66rem] font-600 uppercase tracking-wider"
                style={{ color: catHex, background: `${catHex}1f`, border: `1px solid ${catHex}44` }}
              >
                <span aria-hidden>{meta.glyph}</span>
                {risk.category}
                {lang === "en" && (
                  <span className="opacity-60">· {meta.en}</span>
                )}
              </span>
            </div>
            <h3 className="font-display text-lg font-600 leading-tight text-paper">
              {risk.title}
            </h3>
          </div>
          {/* score chip */}
          <div
            className="flex shrink-0 flex-col items-center rounded border px-2 py-1 text-center"
            style={{ borderColor: `${sev}55`, background: `${sev}14` }}
            title={`${t("rep.sev")} ${risk.severity} × ${t("rep.lik")} ${risk.likelihood}`}
          >
            <span className="tnum font-mono text-xl font-800 leading-none" style={{ color: sev }}>
              {sc}
            </span>
            <span className="font-mono text-[0.58rem] uppercase tracking-wider text-paper-dim/60">
              S×P
            </span>
          </div>
        </div>

        {/* why */}
        {risk.why && (
          <p className="mb-3 text-[0.95rem] leading-snug text-paper-dim">{risk.why}</p>
        )}

        {/* gauges */}
        <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[0.68rem] uppercase tracking-wider text-paper-dim/70">
          <span className="flex items-center gap-1.5">
            {t("rep.sev")} <Dots n={risk.severity} color={sev} />
            <span className="tnum text-paper/80">{risk.severity}</span>
          </span>
          <span className="flex items-center gap-1.5">
            {t("rep.lik")} <Dots n={risk.likelihood} color="#bdb4a0" />
            <span className="tnum text-paper/80">{risk.likelihood}</span>
          </span>
        </div>

        {/* mitigations */}
        {risk.mitigations.length > 0 && (
          <div className="rounded border border-ink-600/70 bg-ink-900/50 p-3">
            <div className="mb-1.5 font-display text-[0.68rem] font-600 uppercase tracking-[0.14em] text-amber/90">
              {t("rep.parades")}
            </div>
            <ul className="space-y-1.5">
              {risk.mitigations.map((m, i) => (
                <li key={i} className="flex gap-2 text-[0.92rem] leading-snug text-paper">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-[1px] bg-amber" aria-hidden />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}
