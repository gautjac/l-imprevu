import type { Context } from "@netlify/functions";
import { breakdown, type BriefInput, type Lang } from "./lib/crew.ts";

interface Body {
  lang?: Lang;
  brief?: BriefInput;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const lang: Lang = body.lang === "en" ? "en" : "fr";
  const brief = body.brief;
  const scene = (brief?.scene ?? "").trim();
  if (!brief || scene.length < 12) {
    return json(
      {
        error:
          lang === "en"
            ? "Describe the scene in a couple sentences first."
            : "Décris la scène en quelques phrases d'abord.",
      },
      400,
    );
  }

  // The Opus breakdown runs ~25–55s — beyond the synchronous proxy's idle
  // timeout. We stream NDJSON: a heartbeat every 3s keeps the connection alive,
  // then a final {result|error} line carries the payload. The client reads to
  // end-of-stream and parses the last non-empty JSON line.
  const enc = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let done = false;
      const beat = setInterval(() => {
        if (!done) {
          try {
            controller.enqueue(enc.encode("\n"));
          } catch {
            /* closed */
          }
        }
      }, 3000);

      try {
        const result = await breakdown(brief, lang);
        done = true;
        clearInterval(beat);
        controller.enqueue(enc.encode(JSON.stringify({ result }) + "\n"));
      } catch (err) {
        done = true;
        clearInterval(beat);
        const message =
          err instanceof Error
            ? err.message
            : lang === "en"
              ? "Unknown error"
              : "Erreur inconnue";
        controller.enqueue(enc.encode(JSON.stringify({ error: message }) + "\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
};
