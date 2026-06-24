import { useMemo, useState } from "react";
import { useI18n } from "../i18n";
import type { Category, ShootRecord } from "../types";
import { score } from "../types";
import { CAT_HEX } from "../meta";
import { RiskCard } from "./RiskCard";
import { HazardRule } from "./Bits";
import { downloadMarkdown, toMarkdown } from "../export";

interface Props {
  rec: ShootRecord;
  onRedo: () => void;
  onBack: () => void;
}

type Tier = "high" | "med" | "low";

function tierOf(sc: number): Tier {
  if (sc >= 12) return "high";
  if (sc >= 6) return "med";
  return "low";
}

const TIER_COLOR: Record<Tier, string> = {
  high: "#ff3b30",
  med: "#f5a01f",
  low: "#5fb06a",
};

export function Report({ rec, onRedo, onBack }: Props) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<Category | null>(null);
  const [copied, setCopied] = useState(false);

  const report = rec.report;

  const sorted = useMemo(
    () => [...report.risks].sort((a, b) => score(b) - score(a)),
    [report.risks],
  );

  const presentCats = useMemo(() => {
    const set = new Set<Category>();
    for (const r of report.risks) set.add(r.category);
    return Array.from(set);
  }, [report.risks]);

  const visible = filter ? sorted.filter((r) => r.category === filter) : sorted;

  const tiers: { tier: Tier; label: string; risks: typeof visible }[] = [
    { tier: "high", label: t("rep.sevHigh"), risks: visible.filter((r) => tierOf(score(r)) === "high") },
    { tier: "med", label: t("rep.sevMed"), risks: visible.filter((r) => tierOf(score(r)) === "med") },
    { tier: "low", label: t("rep.sevLow"), risks: visible.filter((r) => tierOf(score(r)) === "low") },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(toMarkdown(rec));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — download instead */
      downloadMarkdown(rec);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      {/* masthead */}
      <div className="mb-5 overflow-hidden rounded-lg border border-ink-500/60 bg-ink-800 shadow-card">
        <HazardRule />
        <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6">
          <div className="min-w-0">
            <div className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-amber">
              {t("rep.heading")}
            </div>
            <h1 className="mt-0.5 truncate font-display text-3xl font-700 uppercase tracking-wide text-paper">
              {rec.name || rec.brief.title || "—"}
            </h1>
            <div className="mt-1 font-mono text-[0.78rem] text-paper-dim/70">
              {t("rep.risks", { n: report.risks.length })}
              {rec.brief.callTime ? ` · ${rec.brief.callTime}` : ""}
              {rec.brief.locationNote ? ` · ${rec.brief.locationNote}` : ""}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={copy}
              className="rounded border border-ink-500/70 bg-ink-700 px-3 py-1.5 font-display text-[0.8rem] font-500 uppercase tracking-wider text-paper-dim transition hover:border-amber/60 hover:text-paper"
            >
              {copied ? t("rep.exported") : t("rep.export")}
            </button>
            <button
              onClick={() => downloadMarkdown(rec)}
              className="rounded border border-ink-500/70 bg-ink-700 px-3 py-1.5 font-display text-[0.8rem] font-500 uppercase tracking-wider text-paper-dim transition hover:border-amber/60 hover:text-paper"
            >
              {t("rep.download")}
            </button>
            <button
              onClick={onRedo}
              className="rounded border border-safety/60 bg-safety/10 px-3 py-1.5 font-display text-[0.8rem] font-500 uppercase tracking-wider text-safety transition hover:bg-safety/20"
            >
              {t("rep.redo")}
            </button>
          </div>
        </div>
      </div>

      {/* verdict — the punch */}
      {report.verdict && (
        <div className="relative mb-5 overflow-hidden rounded-lg border-2 border-amber/50 bg-gradient-to-br from-ink-700 to-ink-800 p-5 shadow-card sm:p-6">
          <div
            className="pointer-events-none absolute -right-4 -top-2 select-none font-display text-7xl font-700 uppercase tracking-tight text-amber/10 animate-stamp sm:text-8xl"
            aria-hidden
          >
            1<span className="align-super text-4xl">er</span> AD
          </div>
          <div className="relative">
            <div className="mb-2 font-display text-[0.82rem] font-600 uppercase tracking-[0.16em] text-amber">
              {t("rep.verdict")}
            </div>
            <p className="max-w-2xl font-body text-lg leading-snug text-paper sm:text-xl">
              {report.verdict}
            </p>
          </div>
        </div>
      )}

      {/* filter row */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter(null)}
          className={`rounded px-2.5 py-1 font-display text-[0.74rem] font-500 uppercase tracking-wider transition ${
            filter === null
              ? "bg-paper text-ink-900"
              : "border border-ink-500/70 bg-ink-700 text-paper-dim hover:text-paper"
          }`}
        >
          {t("rep.filterAll")} ({report.risks.length})
        </button>
        {presentCats.map((c) => {
          const n = report.risks.filter((r) => r.category === c).length;
          const active = filter === c;
          return (
            <button
              key={c}
              onClick={() => setFilter(active ? null : c)}
              className="rounded px-2.5 py-1 font-display text-[0.74rem] font-500 uppercase tracking-wider transition"
              style={{
                color: active ? "#16151a" : CAT_HEX[c],
                background: active ? CAT_HEX[c] : `${CAT_HEX[c]}14`,
                border: `1px solid ${CAT_HEX[c]}55`,
              }}
            >
              {c} ({n})
            </button>
          );
        })}
      </div>

      {/* triage board */}
      <div className="space-y-6 pb-6">
        {tiers.map(({ tier, label, risks }) =>
          risks.length === 0 ? null : (
            <section key={tier}>
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-[2px]"
                  style={{ background: TIER_COLOR[tier] }}
                  aria-hidden
                />
                <h2
                  className="font-display text-sm font-600 uppercase tracking-[0.16em]"
                  style={{ color: TIER_COLOR[tier] }}
                >
                  {label}
                </h2>
                <span className="font-mono text-[0.72rem] text-paper-dim/50">
                  {risks.length}
                </span>
                <span className="h-px flex-1" style={{ background: `${TIER_COLOR[tier]}33` }} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {risks.map((r, i) => (
                  <RiskCard key={r.id} risk={r} index={i} />
                ))}
              </div>
            </section>
          ),
        )}
      </div>

      {/* plan B */}
      {report.planB && (
        <div className="mb-8 overflow-hidden rounded-lg border border-ink-500/60 bg-ink-800 shadow-card">
          <div className="hazard-thin h-2 w-full opacity-50" aria-hidden />
          <div className="p-5 sm:p-6">
            <div className="mb-2 inline-flex items-center gap-2 font-display text-base font-700 uppercase tracking-wider text-amber">
              <span className="flex h-6 w-6 items-center justify-center rounded border border-amber/50 bg-amber/10 font-mono text-sm">
                B
              </span>
              {t("rep.planB")}
            </div>
            <p className="max-w-2xl font-body text-[1.02rem] leading-relaxed text-paper-dim">
              {report.planB}
            </p>
          </div>
        </div>
      )}

      {/* footer note */}
      <div className="flex items-center justify-between gap-4 border-t border-ink-600/70 pt-4">
        <button
          onClick={onBack}
          className="font-display text-sm uppercase tracking-wider text-paper-dim/60 transition hover:text-paper"
        >
          ← {t("rep.back")}
        </button>
        <p className="max-w-md text-right font-body text-[0.78rem] leading-snug text-paper-dim/45">
          {t("foot")}
        </p>
      </div>
    </div>
  );
}
