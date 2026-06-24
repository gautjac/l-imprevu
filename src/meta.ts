import type { Category, Lang } from "./types";

// Quick-toggle constraint tags. id is stable; label localized.
export interface ConstraintTag {
  id: string;
  fr: string;
  en: string;
}

export const CONSTRAINT_TAGS: ConstraintTag[] = [
  { id: "golden-hour", fr: "Golden hour", en: "Golden hour" },
  { id: "nuit", fr: "Tournage de nuit", en: "Night shoot" },
  { id: "marees", fr: "Marées / bord de l'eau", en: "Tides / waterside" },
  { id: "permis", fr: "Permis incertain", en: "Permit uncertain" },
  { id: "enfants", fr: "Enfants", en: "Children" },
  { id: "animaux", fr: "Animaux", en: "Animals" },
  { id: "fx-pratiques", fr: "Effets pratiques (feu, eau, fumée)", en: "Practical FX (fire, water, smoke)" },
  { id: "cascade", fr: "Cascade / action", en: "Stunt / action" },
  { id: "drone", fr: "Drone", en: "Drone" },
  { id: "vehicule", fr: "Véhicule en mouvement", en: "Moving vehicle" },
  { id: "foule", fr: "Foule / public", en: "Crowd / public" },
  { id: "plan-sequence", fr: "Plan-séquence", en: "Oner / long take" },
  { id: "sans-fil", fr: "Audio sans fil", en: "Wireless audio" },
  { id: "lieu-prive", fr: "Lieu privé / commerce", en: "Private venue / business" },
  { id: "hiver", fr: "Froid / hiver québécois", en: "Cold / Québec winter" },
  { id: "chaleur", fr: "Canicule", en: "Heatwave" },
  { id: "electricite", fr: "Alimentation limitée", en: "Limited power" },
  { id: "solo", fr: "Quasi solo / one-man-band", en: "Near-solo / one-man-band" },
];

export function tagLabel(id: string, lang: Lang): string {
  const t = CONSTRAINT_TAGS.find((x) => x.id === id);
  if (!t) return id;
  return lang === "en" ? t.en : t.fr;
}

// Category → short EN gloss + glyph (for the badge).
export const CATEGORY_META: Record<Category, { en: string; glyph: string }> = {
  Lumière: { en: "Light", glyph: "☼" },
  Son: { en: "Sound", glyph: "♪" },
  Météo: { en: "Weather", glyph: "☂" },
  Logistique: { en: "Logistics", glyph: "▦" },
  Technique: { en: "Technical", glyph: "⚙" },
  Humain: { en: "People", glyph: "☻" },
  Légal: { en: "Legal", glyph: "§" },
  Sécurité: { en: "Safety", glyph: "✚" },
};

export const CAT_HEX: Record<Category, string> = {
  Lumière: "#ffce4d",
  Son: "#7ad0e0",
  Météo: "#76b8ff",
  Logistique: "#c9a6ff",
  Technique: "#ff9d6e",
  Humain: "#ff8aa8",
  Légal: "#9fe0a8",
  Sécurité: "#ff5a5a",
};

export const SEV_HEX = ["#5fb06a", "#5fb06a", "#a9c23a", "#f5a01f", "#ff7a1f", "#ff3b30"];

export function sevHex(sev: number): string {
  return SEV_HEX[Math.max(1, Math.min(5, Math.round(sev)))];
}
