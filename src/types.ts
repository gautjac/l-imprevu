// Shared domain types for L'Imprévu — used by the client, the db, and mirrored
// by the Netlify function's tool schema.

export type Lang = "fr" | "en";

export type Category =
  | "Lumière"
  | "Son"
  | "Météo"
  | "Logistique"
  | "Technique"
  | "Humain"
  | "Légal"
  | "Sécurité";

export const CATEGORIES: Category[] = [
  "Lumière",
  "Son",
  "Météo",
  "Logistique",
  "Technique",
  "Humain",
  "Légal",
  "Sécurité",
];

export type ShootEnv = "interieur" | "exterieur" | "mixte";

/** What the user fills in. Fast, mostly optional, one freeform field. */
export interface Brief {
  title: string;
  env: ShootEnv;
  locationNote: string; // "ruelle du Mile-End, près de l'autoroute 40"
  date: string; // ISO date (yyyy-mm-dd) or freeform
  callTime: string; // "06:30" or "golden hour"
  crewSize: string; // freeform: "équipe légère, 4 personnes"
  gear: string; // freeform gear list
  constraints: string[]; // selected quick-tags
  scene: string; // the freeform brief — the heart of it
}

export interface Mitigation {
  text: string;
}

export interface Risk {
  id: string;
  title: string;
  category: Category;
  severity: number; // 1..5
  likelihood: number; // 1..5
  why: string; // one-line "why this bites you"
  mitigations: string[]; // 1..3 concrete parades
}

export interface RiskReport {
  risks: Risk[];
  planB: string;
  verdict: string; // "ce qu'un bon 1er assistant te dirait"
  oneSecondOrder?: string; // optional sharp second-order callout (kept in verdict normally)
}

/** A saved shoot = brief + its generated report. */
export interface ShootRecord {
  id?: number;
  name: string;
  brief: Brief;
  report: RiskReport;
  lang: Lang;
  createdAt: number;
  updatedAt: number;
}

export function score(r: Pick<Risk, "severity" | "likelihood">): number {
  return r.severity * r.likelihood;
}

export function emptyBrief(): Brief {
  return {
    title: "",
    env: "exterieur",
    locationNote: "",
    date: "",
    callTime: "",
    crewSize: "",
    gear: "",
    constraints: [],
    scene: "",
  };
}
