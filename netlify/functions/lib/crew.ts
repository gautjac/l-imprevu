import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-4-8";

export type Lang = "fr" | "en";

export interface BriefInput {
  title: string;
  env: "interieur" | "exterieur" | "mixte";
  locationNote: string;
  date: string;
  callTime: string;
  crewSize: string;
  gear: string;
  constraints: string[]; // already-localized labels
  scene: string;
}

export interface RiskOut {
  title: string;
  category: string;
  severity: number;
  likelihood: number;
  why: string;
  mitigations: string[];
}

export interface ReportOut {
  risks: RiskOut[];
  planB: string;
  verdict: string;
}

function client(): Anthropic {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("Server missing CLAUDE_API_KEY");
  return new Anthropic({ apiKey, baseURL: "https://api.anthropic.com" });
}

const VOICE_FR = `Tu es le cerveau collectif d'une équipe de tournage chevronnée qui fait le « war-gaming » d'un plan de tournage avant le jour J. Tu incarnes quatre voix qui se parlent :
- le 1er assistant-réalisateur (le plan de match, le timing, ce qui fait dérailler une journée) ;
- le directeur photo / DOP (lumière, météo, continuité, gear caméra, mouvement) ;
- le preneur de son (RF, bruit ambiant, vent, lavaliers, le lieu qui « sonne ») ;
- le directeur de production (permis, assurances, sécurité, argent, accès, plan B).
Tu connais le terrain québécois (météo qui vire vite, hiver, SODEC/permis municipaux, bord du fleuve, ruelles, autoroutes). Tu es franc, concret, jamais générique. Tu raisonnes au deuxième degré : tu vois le problème CAUSÉ par le problème (ex. « extérieur + cravate sans fil près de l'autoroute = bruit RF ; prévois un filaire de secours »). Tu écris en français québécois professionnel de plateau — précis, sans jargon inutile, sans niaiseries.`;

const VOICE_EN = `You are the collective brain of a seasoned film crew war-gaming a shoot plan before the day. You embody four voices in conversation:
- the 1st AD (the plan, timing, what derails a day);
- the DP (light, weather, continuity, camera gear, movement);
- the sound recordist (RF, ambient noise, wind, lavs, how a room "sounds");
- the line producer (permits, insurance, safety, money, access, plan B).
You know real-world production (weather that turns fast, winter, municipal permits, waterside, alleys, highways). You are blunt, concrete, never generic. You reason to the second order: you see the problem CAUSED by the problem (e.g. "exterior + wireless lav near the highway = RF noise; bring a backup hardline"). You write like a working pro, precise, no filler.`;

function briefBlock(b: BriefInput, lang: Lang): string {
  const L = lang === "en";
  const env =
    b.env === "interieur"
      ? L ? "Interior" : "Intérieur"
      : b.env === "exterieur"
        ? L ? "Exterior" : "Extérieur"
        : L ? "Mixed" : "Mixte";
  const rows: [string, string][] = [
    [L ? "Title" : "Titre", b.title],
    [L ? "Setting" : "Décor", env],
    [L ? "Location/vibe" : "Lieu/ambiance", b.locationNote],
    [L ? "Date" : "Date", b.date],
    [L ? "Call time" : "Heure d'appel", b.callTime],
    [L ? "Crew/cast" : "Équipe/cast", b.crewSize],
    [L ? "Gear" : "Gear", b.gear],
    [L ? "Constraints" : "Contraintes", (b.constraints ?? []).join(", ")],
  ];
  const lines = rows
    .filter(([, v]) => v && v.trim())
    .map(([k, v]) => `- ${k}: ${v.trim()}`);
  lines.push("");
  lines.push((L ? "SCENE: " : "SCÈNE : ") + (b.scene ?? "").trim());
  return lines.join("\n");
}

const CATS = [
  "Lumière",
  "Son",
  "Météo",
  "Logistique",
  "Technique",
  "Humain",
  "Légal",
  "Sécurité",
];

const TOOL: Anthropic.Tool = {
  name: "deliver_risk_sheet",
  description:
    "Deliver the full risk breakdown of the shoot: a ranked list of risks with concrete mitigations, a plan B, and a blunt verdict.",
  input_schema: {
    type: "object",
    required: ["risks", "planB", "verdict"],
    properties: {
      risks: {
        type: "array",
        minItems: 5,
        maxItems: 12,
        description:
          "The risks a pro crew would actually flag for THIS shoot, specific to the inputs — not a generic checklist. Reason to the second order. Sort is not required (the client sorts by severity×likelihood).",
        items: {
          type: "object",
          required: ["title", "category", "severity", "likelihood", "why", "mitigations"],
          properties: {
            title: {
              type: "string",
              description: "Short, punchy risk title (max ~7 words). Concrete, not abstract.",
            },
            category: {
              type: "string",
              enum: CATS,
              description: "Exactly one of the eight categories.",
            },
            severity: {
              type: "integer",
              minimum: 1,
              maximum: 5,
              description: "How bad if it hits (1 minor … 5 the shoot is dead).",
            },
            likelihood: {
              type: "integer",
              minimum: 1,
              maximum: 5,
              description: "How likely on THIS shoot (1 rare … 5 near-certain).",
            },
            why: {
              type: "string",
              description:
                "One sharp line on why this specifically bites THIS shoot — name the mechanism (second-order where relevant).",
            },
            mitigations: {
              type: "array",
              minItems: 1,
              maxItems: 3,
              items: { type: "string" },
              description:
                "1–3 concrete 'parades' a crew can act on (gear to bring, a call to make, a timing change). Specific, never 'be careful'.",
            },
          },
        },
      },
      planB: {
        type: "string",
        description:
          "One tight paragraph: the fallback if the day goes sideways (weather, location lost, talent late). Concrete and shoot-specific.",
      },
      verdict: {
        type: "string",
        description:
          "2–4 punchy sentences — what a seasoned 1st AD would tell the director straight, in the room. The single most important thing to do, said plainly. No hedging.",
      },
    },
  },
};

export async function breakdown(b: BriefInput, lang: Lang): Promise<ReportOut> {
  const L = lang === "en";
  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 4000,
    system: L ? VOICE_EN : VOICE_FR,
    messages: [
      {
        role: "user",
        content: [
          L
            ? "War-game this shoot. Surface the real failure modes a pro crew would flag for THIS specific plan — not a generic checklist. Be specific to the location, gear, timing and constraints given. Push for second-order problems (the problem caused by the problem). Give each risk a concrete fix. Then a plan B and a blunt verdict."
            : "War-game ce tournage. Sors les vrais modes de défaillance qu'une équipe de pro flagerait pour CE plan précis — pas une checklist générique. Sois spécifique au lieu, au gear, au timing et aux contraintes donnés. Pousse vers les problèmes de deuxième degré (le problème causé par le problème). Donne à chaque risque une parade concrète. Puis un plan B et un verdict cash.",
          "",
          briefBlock(b, lang),
          "",
          L
            ? "Respond only by calling deliver_risk_sheet. Write all text in English."
            : "Réponds uniquement en appelant deliver_risk_sheet. Écris tout le texte en français.",
        ].join("\n"),
      },
    ],
    tools: [TOOL],
    tool_choice: { type: "tool", name: "deliver_risk_sheet" },
  });

  const tool = res.content.find((blk) => blk.type === "tool_use");
  if (!tool || tool.type !== "tool_use") throw new Error("No risk sheet returned");
  const i = tool.input as Record<string, unknown>;

  const rawRisks = Array.isArray(i.risks) ? (i.risks as Record<string, unknown>[]) : [];
  const risks: RiskOut[] = rawRisks.map((r) => {
    const cat = String(r.category ?? "Logistique");
    return {
      title: String(r.title ?? "—").trim(),
      category: CATS.includes(cat) ? cat : "Logistique",
      severity: clamp(Number(r.severity ?? 3)),
      likelihood: clamp(Number(r.likelihood ?? 3)),
      why: String(r.why ?? "").trim(),
      mitigations: (Array.isArray(r.mitigations) ? (r.mitigations as unknown[]) : [])
        .map((m) => String(m).trim())
        .filter(Boolean)
        .slice(0, 3),
    };
  });

  return {
    risks,
    planB: String(i.planB ?? "").trim(),
    verdict: String(i.verdict ?? "").trim(),
  };
}

function clamp(n: number): number {
  if (!Number.isFinite(n)) return 3;
  return Math.max(1, Math.min(5, Math.round(n)));
}
