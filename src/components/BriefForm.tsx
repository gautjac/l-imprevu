import { useState } from "react";
import { useI18n } from "../i18n";
import type { Brief, ShootEnv } from "../types";
import { emptyBrief } from "../types";
import { CONSTRAINT_TAGS } from "../meta";
import { HazardRule, Tag } from "./Bits";

interface Props {
  initial?: Brief;
  onSubmit: (b: Brief) => void;
  busy: boolean;
}

const ENVS: ShootEnv[] = ["interieur", "exterieur", "mixte"];

export function BriefForm({ initial, onSubmit, busy }: Props) {
  const { t, lang } = useI18n();
  const [b, setB] = useState<Brief>(initial ?? emptyBrief());
  const [touched, setTouched] = useState(false);

  const set = <K extends keyof Brief>(k: K, v: Brief[K]) =>
    setB((prev) => ({ ...prev, [k]: v }));

  const toggleTag = (id: string) =>
    setB((prev) => ({
      ...prev,
      constraints: prev.constraints.includes(id)
        ? prev.constraints.filter((x) => x !== id)
        : [...prev.constraints, id],
    }));

  const tooShort = b.scene.trim().length < 12;

  const submit = () => {
    setTouched(true);
    if (tooShort || busy) return;
    onSubmit(b);
  };

  const field =
    "w-full rounded-md border border-ink-500/70 bg-ink-900/60 px-3 py-2 text-paper placeholder:text-paper-dim/40 outline-none transition focus:border-amber focus:bg-ink-900";
  const labelCls =
    "mb-1.5 block font-display text-[0.78rem] font-500 uppercase tracking-[0.12em] text-amber/90";
  const opt = (
    <span className="ml-1.5 font-body text-[0.7rem] normal-case tracking-normal text-paper-dim/40">
      ({t("brief.optional")})
    </span>
  );

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-lg border border-ink-500/60 bg-ink-800 shadow-card">
        <div className="flex items-stretch">
          <HazardRule />
        </div>
        <div className="border-b border-ink-600/70 px-5 py-4 sm:px-7">
          <h2 className="font-display text-2xl font-700 uppercase tracking-wide text-paper">
            {t("brief.heading")}
          </h2>
          <p className="mt-0.5 max-w-xl text-[0.92rem] leading-snug text-paper-dim">
            {t("brief.sub")}
          </p>
        </div>

        <div className="space-y-5 p-5 sm:p-7">
          {/* Title */}
          <div>
            <label className={labelCls}>{t("brief.title")}</label>
            <input
              className={field}
              value={b.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder={t("brief.titlePh")}
            />
          </div>

          {/* Env segmented + date + call */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls}>{t("brief.env")}</label>
              <div className="inline-flex overflow-hidden rounded-md border border-ink-500/70">
                {ENVS.map((e, i) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => set("env", e)}
                    className={`px-3.5 py-2 font-display text-[0.82rem] font-500 uppercase tracking-wide transition ${
                      b.env === e
                        ? "bg-amber text-ink-900"
                        : "bg-ink-900/50 text-paper-dim hover:bg-ink-700"
                    } ${i > 0 ? "border-l border-ink-500/70" : ""}`}
                  >
                    {t(`brief.env.${e}`)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>
                  {t("brief.date")} {opt}
                </label>
                <input
                  type="date"
                  className={field}
                  value={/^\d{4}-\d{2}-\d{2}$/.test(b.date) ? b.date : ""}
                  onChange={(e) => set("date", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>
                  {t("brief.call")} {opt}
                </label>
                <input
                  className={field}
                  value={b.callTime}
                  onChange={(e) => set("callTime", e.target.value)}
                  placeholder={t("brief.callPh")}
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className={labelCls}>
              {t("brief.location")} {opt}
            </label>
            <input
              className={field}
              value={b.locationNote}
              onChange={(e) => set("locationNote", e.target.value)}
              placeholder={t("brief.locationPh")}
            />
          </div>

          {/* Crew + gear */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls}>
                {t("brief.crew")} {opt}
              </label>
              <input
                className={field}
                value={b.crewSize}
                onChange={(e) => set("crewSize", e.target.value)}
                placeholder={t("brief.crewPh")}
              />
            </div>
            <div>
              <label className={labelCls}>
                {t("brief.gear")} {opt}
              </label>
              <input
                className={field}
                value={b.gear}
                onChange={(e) => set("gear", e.target.value)}
                placeholder={t("brief.gearPh")}
              />
            </div>
          </div>

          {/* Constraints */}
          <div>
            <label className={labelCls}>{t("brief.constraints")}</label>
            <div className="flex flex-wrap gap-2">
              {CONSTRAINT_TAGS.map((tag) => (
                <Tag
                  key={tag.id}
                  active={b.constraints.includes(tag.id)}
                  onClick={() => toggleTag(tag.id)}
                >
                  {lang === "en" ? tag.en : tag.fr}
                </Tag>
              ))}
            </div>
          </div>

          {/* Scene — the heart */}
          <div>
            <label className={labelCls}>{t("brief.scene")}</label>
            <textarea
              className={`${field} min-h-[140px] leading-relaxed`}
              value={b.scene}
              onChange={(e) => set("scene", e.target.value)}
              placeholder={t("brief.scenePh")}
            />
            {touched && tooShort && (
              <p className="mt-1.5 font-mono text-[0.78rem] text-safety">
                {t("brief.tooShort")}
              </p>
            )}
          </div>
        </div>

        <div className="hazard-thin h-2 w-full opacity-50" aria-hidden />
        <div className="flex items-center justify-end gap-3 px-5 py-4 sm:px-7">
          <button
            onClick={submit}
            disabled={busy}
            className="group inline-flex items-center gap-2.5 rounded-md bg-safety px-7 py-3 font-display text-lg font-700 uppercase tracking-wider text-ink-900 shadow-tape transition hover:bg-safety/90 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink-900/40 border-t-ink-900" />
            ) : (
              <span className="text-xl leading-none">⚠</span>
            )}
            {busy ? t("brief.submitting") : t("brief.submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
