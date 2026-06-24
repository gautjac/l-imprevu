import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { I18nProvider, useI18n } from "./i18n";
import { db, deleteShoot, renameShoot, saveShoot } from "./db";
import type { Brief, ShootRecord } from "./types";
import { fetchBreakdown } from "./api";
import { Onboarding } from "./components/Onboarding";
import { BriefForm } from "./components/BriefForm";
import { Loading } from "./components/Loading";
import { Report } from "./components/Report";
import { Sidebar } from "./components/Sidebar";
import { HazardRule, Mark } from "./components/Bits";

type View =
  | { kind: "brief"; initial?: Brief }
  | { kind: "loading" }
  | { kind: "report"; rec: ShootRecord }
  | { kind: "error"; message: string; brief: Brief };

const ONB_KEY = "imprevu.onboarded";

function Shell() {
  const { t, lang, setLang } = useI18n();
  const [view, setView] = useState<View>({ kind: "brief" });
  const [onboarded, setOnboarded] = useState(
    () => localStorage.getItem(ONB_KEY) === "1",
  );
  const [navOpen, setNavOpen] = useState(false);

  const shoots = useLiveQuery(
    () => db.shoots.orderBy("updatedAt").reverse().toArray(),
    [],
    [] as ShootRecord[],
  );

  const activeId = view.kind === "report" ? (view.rec.id ?? null) : null;

  const finishOnboarding = () => {
    localStorage.setItem(ONB_KEY, "1");
    setOnboarded(true);
  };

  const runBreakdown = async (brief: Brief) => {
    setView({ kind: "loading" });
    try {
      const report = await fetchBreakdown(brief, lang);
      const name = brief.title.trim() || autoName(brief, lang);
      const rec: ShootRecord = {
        name,
        brief,
        report,
        lang,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      const id = await saveShoot(rec);
      setView({ kind: "report", rec: { ...rec, id } });
    } catch (err) {
      const message = err instanceof Error ? err.message : t("err.generic");
      setView({ kind: "error", message, brief });
    }
  };

  const openShoot = (rec: ShootRecord) => {
    setView({ kind: "report", rec });
    setNavOpen(false);
  };

  const newBrief = () => {
    setView({ kind: "brief" });
    setNavOpen(false);
  };

  // Reflect the most recent saved version when shoots refresh (after rename).
  useEffect(() => {
    if (view.kind === "report" && shoots) {
      const fresh = shoots.find((s) => s.id === view.rec.id);
      if (fresh && fresh.updatedAt !== view.rec.updatedAt) {
        setView({ kind: "report", rec: fresh });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shoots]);

  return (
    <div className="min-h-screen">
      {!onboarded && <Onboarding onDone={finishOnboarding} />}

      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-ink-600/70 bg-ink-900/60 lg:flex">
          <BrandHeader onNew={newBrief} />
          <Sidebar
            shoots={shoots ?? []}
            activeId={activeId}
            onOpen={openShoot}
            onRename={renameShoot}
            onDelete={async (id) => {
              await deleteShoot(id);
              if (activeId === id) newBrief();
            }}
          />
          <Footer />
        </aside>

        {/* Mobile nav drawer */}
        {navOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-ink-900/70 backdrop-blur-sm"
              onClick={() => setNavOpen(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-ink-600 bg-ink-900 shadow-lift animate-riseIn">
              <BrandHeader onNew={newBrief} />
              <Sidebar
                shoots={shoots ?? []}
                activeId={activeId}
                onOpen={openShoot}
                onRename={renameShoot}
                onDelete={async (id) => {
                  await deleteShoot(id);
                  if (activeId === id) newBrief();
                }}
              />
            </aside>
          </div>
        )}

        {/* Main */}
        <main className="min-w-0 flex-1">
          {/* Mobile top bar */}
          <div className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-ink-600/70 bg-ink-900/85 px-4 py-2.5 backdrop-blur lg:hidden">
            <button
              onClick={() => setNavOpen(true)}
              className="flex items-center gap-2 text-paper"
              aria-label={t("app.shoots")}
            >
              <span className="text-xl leading-none">≡</span>
              <Mark size={22} />
              <span className="font-display text-lg font-700 uppercase tracking-wide">
                L'Imprévu
              </span>
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={newBrief}
                className="rounded bg-safety px-3 py-1.5 font-display text-[0.78rem] font-600 uppercase tracking-wider text-ink-900"
              >
                {t("app.new")}
              </button>
              <LangToggle lang={lang} setLang={setLang} t={t} />
            </div>
          </div>

          {/* Desktop tagline header (brief view only) */}
          {view.kind === "brief" && (
            <header className="hidden px-8 pb-2 pt-8 lg:block">
              <div className="mx-auto max-w-3xl">
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <div className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-amber">
                      {t("app.kicker")}
                    </div>
                    <h1 className="mt-1 font-display text-5xl font-700 uppercase leading-none tracking-tight text-paper">
                      L'Imprévu
                    </h1>
                    <p className="mt-3 max-w-xl font-body text-[1.05rem] leading-snug text-paper-dim">
                      {t("app.tagline")}
                    </p>
                  </div>
                  <LangToggle lang={lang} setLang={setLang} t={t} />
                </div>
                <HazardRule className="mt-5 opacity-80" />
              </div>
            </header>
          )}

          <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {view.kind === "brief" && (
              <BriefForm initial={view.initial} onSubmit={runBreakdown} busy={false} />
            )}
            {view.kind === "loading" && <Loading />}
            {view.kind === "report" && (
              <Report
                rec={view.rec}
                onRedo={() => setView({ kind: "brief", initial: view.rec.brief })}
                onBack={newBrief}
              />
            )}
            {view.kind === "error" && (
              <ErrorView
                message={view.message}
                onRetry={() => runBreakdown(view.brief)}
                onBack={() => setView({ kind: "brief", initial: view.brief })}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function BrandHeader({ onNew }: { onNew: () => void }) {
  const { t } = useI18n();
  return (
    <div className="border-b border-ink-600/70">
      <HazardRule />
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <button onClick={onNew} className="flex items-center gap-2 text-left">
          <Mark size={26} />
          <div>
            <div className="font-display text-xl font-700 uppercase leading-none tracking-wide text-paper">
              L'Imprévu
            </div>
            <div className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-amber/80">
              {t("app.kicker")}
            </div>
          </div>
        </button>
      </div>
      <div className="px-4 pb-3">
        <button
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-safety px-3 py-2 font-display text-[0.86rem] font-600 uppercase tracking-wider text-ink-900 shadow-tape transition hover:bg-safety/90 active:translate-y-px"
        >
          <span className="text-base leading-none">＋</span>
          {t("app.new")}
        </button>
      </div>
    </div>
  );
}

function Footer() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="border-t border-ink-600/70 px-4 py-3">
      <div className="mb-2 flex justify-end">
        <LangToggle lang={lang} setLang={setLang} t={t} />
      </div>
      <p className="font-body text-[0.72rem] leading-snug text-paper-dim/45">{t("foot")}</p>
    </div>
  );
}

function LangToggle({
  lang,
  setLang,
  t,
}: {
  lang: "fr" | "en";
  setLang: (l: "fr" | "en") => void;
  t: (k: string) => string;
}) {
  return (
    <button
      onClick={() => setLang(lang === "fr" ? "en" : "fr")}
      className="rounded border border-ink-500/70 bg-ink-700 px-2.5 py-1 font-mono text-[0.72rem] font-700 uppercase tracking-wider text-paper-dim transition hover:border-amber/60 hover:text-amber"
      title={lang === "fr" ? "Switch to English" : "Passer en français"}
    >
      {t("app.lang")}
    </button>
  );
}

function ErrorView({
  message,
  onRetry,
  onBack,
}: {
  message: string;
  onRetry: () => void;
  onBack: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="mx-auto max-w-xl">
      <div className="overflow-hidden rounded-lg border border-safety/50 bg-ink-800 shadow-card">
        <div className="hazard h-1.5 w-full" aria-hidden />
        <div className="p-7 text-center">
          <div className="mb-3 text-4xl">⚠</div>
          <p className="mb-1 font-display text-lg font-600 uppercase tracking-wide text-safety">
            {t("err.generic")}
          </p>
          <p className="mb-5 font-mono text-[0.8rem] text-paper-dim/60">{message}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={onBack}
              className="rounded border border-ink-500/70 bg-ink-700 px-4 py-2 font-display text-sm uppercase tracking-wider text-paper-dim hover:text-paper"
            >
              {t("rep.back")}
            </button>
            <button
              onClick={onRetry}
              className="rounded bg-safety px-5 py-2 font-display text-sm font-600 uppercase tracking-wider text-ink-900 hover:bg-safety/90"
            >
              {t("err.retry")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function autoName(brief: Brief, lang: "fr" | "en"): string {
  const first = brief.scene.trim().split(/[.\n!?]/)[0]?.trim() ?? "";
  if (first) return first.length > 48 ? first.slice(0, 46) + "…" : first;
  return lang === "en" ? "Untitled shoot" : "Tournage sans titre";
}

export default function App() {
  return (
    <I18nProvider>
      <Shell />
    </I18nProvider>
  );
}
