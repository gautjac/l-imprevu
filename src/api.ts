import type { Brief, Category, Lang, RiskReport } from "./types";
import { tagLabel } from "./meta";

interface RawRisk {
  title: string;
  category: string;
  severity: number;
  likelihood: number;
  why: string;
  mitigations: string[];
}
interface RawReport {
  risks: RawRisk[];
  planB: string;
  verdict: string;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * The engine streams NDJSON: keepalive heartbeats (bare newlines) keep the
 * connection alive during the ~25–55s Opus call, then a final JSON line carries
 * { result } or { error }. We read the stream to its end and parse the last
 * non-empty line.
 */
export async function fetchBreakdown(brief: Brief, lang: Lang): Promise<RiskReport> {
  const en = lang === "en";
  // Send already-localized constraint labels so the crew reasons in the UI language.
  const payloadBrief = {
    ...brief,
    constraints: brief.constraints.map((id) => tagLabel(id, lang)),
  };

  const res = await fetch("/api/depouille", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lang, brief: payloadBrief }),
  });

  const raw = await res.text();
  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  const last = lines[lines.length - 1] ?? "";

  let parsed: { result?: RawReport; error?: string } | null = null;
  try {
    parsed = last ? JSON.parse(last) : null;
  } catch {
    parsed = null;
  }

  const invalid = en ? "Invalid response from the server." : "Réponse invalide du serveur.";

  if (!res.ok) {
    const fallback = en ? `Error ${res.status}` : `Erreur ${res.status}`;
    throw new Error(parsed?.error || fallback);
  }
  if (!parsed) throw new Error(invalid);
  if (parsed.error) throw new Error(parsed.error);
  if (!parsed.result) throw new Error(invalid);

  const r = parsed.result;
  return {
    risks: (r.risks ?? []).map((x) => ({
      id: uid(),
      title: x.title,
      category: x.category as Category,
      severity: x.severity,
      likelihood: x.likelihood,
      why: x.why,
      mitigations: x.mitigations ?? [],
    })),
    planB: r.planB ?? "",
    verdict: r.verdict ?? "",
  };
}
