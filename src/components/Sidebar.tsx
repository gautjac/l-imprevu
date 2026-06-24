import { useState } from "react";
import { useI18n } from "../i18n";
import type { ShootRecord } from "../types";
import { score } from "../types";
import { sevHex } from "../meta";

interface Props {
  shoots: ShootRecord[];
  activeId: number | null;
  onOpen: (rec: ShootRecord) => void;
  onRename: (id: number, name: string) => void;
  onDelete: (id: number) => void;
}

export function Sidebar({ shoots, activeId, onOpen, onRename, onDelete }: Props) {
  const { t, lang } = useI18n();
  const [editing, setEditing] = useState<number | null>(null);
  const [draft, setDraft] = useState("");

  const startRename = (rec: ShootRecord) => {
    setEditing(rec.id!);
    setDraft(rec.name || rec.brief.title || "");
  };
  const commit = (id: number) => {
    const name = draft.trim();
    if (name) onRename(id, name);
    setEditing(null);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-ink-600/70 px-4 py-3">
        <div className="font-display text-sm font-600 uppercase tracking-[0.16em] text-paper-dim/70">
          {t("app.shoots")}
        </div>
      </div>

      {shoots.length === 0 ? (
        <p className="px-4 py-6 text-[0.88rem] leading-snug text-paper-dim/50">
          {t("app.empty")}
        </p>
      ) : (
        <ul className="flex-1 overflow-y-auto py-2">
          {shoots.map((rec) => {
            const top = rec.report.risks.reduce((m, r) => Math.max(m, score(r)), 0);
            const topSev = rec.report.risks.reduce(
              (m, r) => (score(r) === top ? Math.max(m, r.severity) : m),
              1,
            );
            const active = rec.id === activeId;
            const d = new Date(rec.updatedAt);
            const when = d.toLocaleDateString(lang === "en" ? "en-CA" : "fr-CA", {
              day: "2-digit",
              month: "short",
            });
            return (
              <li key={rec.id}>
                <div
                  className={`group relative mx-2 mb-1 rounded-md border px-3 py-2.5 transition ${
                    active
                      ? "border-amber/50 bg-amber/10"
                      : "border-transparent hover:border-ink-500/60 hover:bg-ink-700/50"
                  }`}
                >
                  {editing === rec.id ? (
                    <input
                      autoFocus
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onBlur={() => commit(rec.id!)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commit(rec.id!);
                        if (e.key === "Escape") setEditing(null);
                      }}
                      className="w-full rounded border border-amber/60 bg-ink-900 px-2 py-1 font-display text-sm text-paper outline-none"
                    />
                  ) : (
                    <button
                      onClick={() => onOpen(rec)}
                      className="block w-full text-left"
                      title={t("act.open")}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                          style={{ background: sevHex(topSev) }}
                          aria-hidden
                        />
                        <span className="truncate font-display text-[0.98rem] font-500 leading-tight text-paper">
                          {rec.name || rec.brief.title || "—"}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 pl-[18px] font-mono text-[0.68rem] text-paper-dim/50">
                        <span>{when}</span>
                        <span>·</span>
                        <span>{t("rep.risks", { n: rec.report.risks.length })}</span>
                      </div>
                    </button>
                  )}

                  {editing !== rec.id && (
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition group-hover:opacity-100">
                      <button
                        onClick={() => startRename(rec)}
                        title={t("act.rename")}
                        className="flex h-6 w-6 items-center justify-center rounded border border-ink-500/60 bg-ink-800 text-[0.7rem] text-paper-dim hover:text-amber"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(t("act.deleteConfirm"))) onDelete(rec.id!);
                        }}
                        title={t("act.delete")}
                        className="flex h-6 w-6 items-center justify-center rounded border border-ink-500/60 bg-ink-800 text-[0.7rem] text-paper-dim hover:text-safety"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
