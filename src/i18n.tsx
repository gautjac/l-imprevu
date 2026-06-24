import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Lang } from "./types";

type Dict = Record<string, string>;

const FR: Dict = {
  "app.kicker": "moteur de pré-production",
  "app.tagline":
    "Décris ton tournage. Un 1er assistant, un DOP, un preneur de son et un directeur de prod te sortent ce qui va clocher — classé par gravité, chiffré, avec les parades.",
  "app.new": "Nouveau brief",
  "app.shoots": "Tournages",
  "app.empty": "Aucun tournage encore. Remplis un brief — l'équipe va te dépouiller ça.",
  "app.lang": "EN",

  "onb.title": "Comment ça marche",
  "onb.l1": "1 — Décris ta scène",
  "onb.l1b": "Lieu, heure d'appel, gear, contraintes. Quelques champs, un texte libre. Va vite.",
  "onb.l2": "2 — Le dépouillement",
  "onb.l2b": "L'équipe te sort les modes de défaillance qu'un pro flagerait, classés par gravité × probabilité.",
  "onb.l3": "3 — La feuille de risques",
  "onb.l3b": "Chaque risque a sa parade concrète, un plan B, et le verdict cash d'un bon 1er assistant. Tout reste sur ton appareil.",
  "onb.go": "Commencer",
  "onb.skip": "Passer",

  "brief.heading": "Le brief",
  "brief.sub": "Le strict nécessaire. Plus c'est précis, plus le dépouillement mord.",
  "brief.title": "Titre du tournage",
  "brief.titlePh": "ex. Scène d'ouverture — ruelle, aube",
  "brief.env": "Décor",
  "brief.env.interieur": "Intérieur",
  "brief.env.exterieur": "Extérieur",
  "brief.env.mixte": "Mixte",
  "brief.location": "Lieu / ambiance",
  "brief.locationPh": "ex. ruelle du Mile-End, près de l'autoroute 40, fils électriques",
  "brief.date": "Date",
  "brief.call": "Heure d'appel",
  "brief.callPh": "ex. 06:30, ou « golden hour »",
  "brief.crew": "Équipe / cast",
  "brief.crewPh": "ex. équipe légère, 4 pers. + 2 comédiens, 1 enfant",
  "brief.gear": "Gear",
  "brief.gearPh": "ex. FX3, 24-70, micro-cravate sans fil, un seul trépied, drone DJI",
  "brief.constraints": "Contraintes (tape pour activer)",
  "brief.scene": "La scène — décris-la",
  "brief.scenePh":
    "Raconte le plan : qui, quoi, où, le mouvement, l'effet recherché. Plan-séquence ? Pluie pratique ? Cascade ? Permis flou ? Plus tu donnes, plus l'équipe voit loin.",
  "brief.submit": "Dépouiller",
  "brief.submitting": "L'équipe lit ton brief…",
  "brief.tooShort": "Décris la scène en quelques phrases d'abord.",
  "brief.optional": "facultatif",

  "load.l1": "Le 1er assistant relit la feuille…",
  "load.l2": "Le DOP regarde la lumière et le temps…",
  "load.l3": "Le preneur de son écoute le lieu…",
  "load.l4": "Le directeur de prod compte les sous et les permis…",
  "load.l5": "On classe les risques par gravité…",

  "rep.heading": "Feuille de risques",
  "rep.verdict": "Ce qu'un bon 1er assistant te dirait",
  "rep.planB": "Plan B",
  "rep.risks": "{n} risques",
  "rep.sevHigh": "Critique",
  "rep.sevMed": "À surveiller",
  "rep.sevLow": "Mineur",
  "rep.parades": "Parades",
  "rep.why": "Pourquoi ça mord",
  "rep.sev": "Gravité",
  "rep.lik": "Probabilité",
  "rep.export": "Copier la feuille",
  "rep.exported": "Copié ✓",
  "rep.download": "Télécharger .md",
  "rep.redo": "Re-dépouiller",
  "rep.back": "Briefs",
  "rep.filterAll": "Toutes",

  "act.rename": "Renommer",
  "act.delete": "Supprimer",
  "act.deleteConfirm": "Supprimer ce tournage ?",
  "act.open": "Ouvrir",

  "err.generic": "L'équipe a perdu le fil. Réessaie.",
  "err.retry": "Réessayer",

  "foot": "Tout reste sur ton appareil — briefs et feuilles stockés en local. Le dépouillement est un avis de pré-prod, pas une garantie. Le tien a toujours le dernier mot.",
};

const EN: Dict = {
  "app.kicker": "pre-production engine",
  "app.tagline":
    "Describe your shoot. A 1st AD, a DP, a sound recordist and a line producer surface what'll go wrong — ranked by severity, scored, with the fixes.",
  "app.new": "New brief",
  "app.shoots": "Shoots",
  "app.empty": "No shoots yet. Fill a brief — the crew will break it down.",
  "app.lang": "FR",

  "onb.title": "How it works",
  "onb.l1": "1 — Describe your scene",
  "onb.l1b": "Location, call time, gear, constraints. A few fields, one freeform box. Move fast.",
  "onb.l2": "2 — The breakdown",
  "onb.l2b": "The crew surfaces the failure modes a pro would flag, ranked by severity × likelihood.",
  "onb.l3": "3 — The risk sheet",
  "onb.l3b": "Every risk gets a concrete fix, a plan B, and a blunt 1st-AD verdict. Everything stays on your device.",
  "onb.go": "Start",
  "onb.skip": "Skip",

  "brief.heading": "The brief",
  "brief.sub": "Just the essentials. The sharper the input, the harder the breakdown bites.",
  "brief.title": "Shoot title",
  "brief.titlePh": "e.g. Opening scene — alley, dawn",
  "brief.env": "Setting",
  "brief.env.interieur": "Interior",
  "brief.env.exterieur": "Exterior",
  "brief.env.mixte": "Mixed",
  "brief.location": "Location / vibe",
  "brief.locationPh": "e.g. Mile-End alley, near highway 40, overhead wires",
  "brief.date": "Date",
  "brief.call": "Call time",
  "brief.callPh": "e.g. 06:30, or “golden hour”",
  "brief.crew": "Crew / cast",
  "brief.crewPh": "e.g. light crew, 4 + 2 actors, 1 child",
  "brief.gear": "Gear",
  "brief.gearPh": "e.g. FX3, 24-70, wireless lav, one tripod, DJI drone",
  "brief.constraints": "Constraints (tap to toggle)",
  "brief.scene": "The scene — describe it",
  "brief.scenePh":
    "Tell the shot: who, what, where, the movement, the effect you want. Oner? Practical rain? Stunt? Murky permit? The more you give, the further the crew sees.",
  "brief.submit": "Break it down",
  "brief.submitting": "The crew is reading your brief…",
  "brief.tooShort": "Describe the scene in a couple sentences first.",
  "brief.optional": "optional",

  "load.l1": "The 1st AD re-reads the sheet…",
  "load.l2": "The DP studies light and weather…",
  "load.l3": "The sound recordist listens to the location…",
  "load.l4": "The line producer counts dollars and permits…",
  "load.l5": "Ranking risks by severity…",

  "rep.heading": "Risk sheet",
  "rep.verdict": "What a good 1st AD would tell you",
  "rep.planB": "Plan B",
  "rep.risks": "{n} risks",
  "rep.sevHigh": "Critical",
  "rep.sevMed": "Watch",
  "rep.sevLow": "Minor",
  "rep.parades": "Fixes",
  "rep.why": "Why it bites",
  "rep.sev": "Severity",
  "rep.lik": "Likelihood",
  "rep.export": "Copy the sheet",
  "rep.exported": "Copied ✓",
  "rep.download": "Download .md",
  "rep.redo": "Re-run",
  "rep.back": "Briefs",
  "rep.filterAll": "All",

  "act.rename": "Rename",
  "act.delete": "Delete",
  "act.deleteConfirm": "Delete this shoot?",
  "act.open": "Open",

  "err.generic": "The crew lost the thread. Try again.",
  "err.retry": "Retry",

  "foot": "Everything stays on your device — briefs and sheets stored locally. The breakdown is a pre-pro opinion, not a guarantee. You always have the last word.",
};

const DICTS: Record<Lang, Dict> = { fr: FR, en: EN };

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const Ctx = createContext<I18n | null>(null);

const KEY = "imprevu.lang";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === "fr" || saved === "en") return saved;
    return navigator.language.toLowerCase().startsWith("en") ? "en" : "fr";
  });

  useEffect(() => {
    localStorage.setItem(KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string, vars?: Record<string, string | number>) => {
    let s = DICTS[lang][key] ?? DICTS.fr[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
    }
    return s;
  };

  return (
    <Ctx.Provider value={{ lang, setLang: setLangState, t }}>
      {children}
    </Ctx.Provider>
  );
}

export function useI18n(): I18n {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n outside provider");
  return v;
}
