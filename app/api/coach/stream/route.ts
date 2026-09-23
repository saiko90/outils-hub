import { persona, contextBlock, trimMessages, geminiPayload, modelList, coachLang, sseTextDelta, type CoachMsg, type CoachApiCtx } from "@/lib/coachPrompt";

// Relais « Coach nutrition » en STREAMING (réponse en direct, mot par mot).
// Renvoie un flux texte brut (text/plain) : le client l'affiche au fil de l'eau.
// En cas d'échec au démarrage (surcharge, clé manquante…), renvoie un statut != 200
// → le client bascule sur /api/coach (non-streaming, avec tous ses réessais).
export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return new Response("not_configured", { status: 503 });

  let body: { messages?: CoachMsg[]; context?: CoachApiCtx };
  try {
    body = (await req.json()) as { messages?: CoachMsg[]; context?: CoachApiCtx };
  } catch {
    return new Response("bad_request", { status: 400 });
  }

  const ctx = body.context || {};
  const lang = coachLang(ctx);
  const msgs = trimMessages(body.messages);
  if (msgs.length === 0) return new Response("empty", { status: 400 });

  const sys = persona(lang) + "\n\n" + contextBlock(ctx);
  const payload = geminiPayload(sys, msgs);

  // On tente chaque modèle une fois ; le premier qui répond OK est diffusé.
  let upstream: Response | null = null;
  for (const model of modelList()) {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 12000);
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
      clearTimeout(to);
      if (r.ok && r.body) { upstream = r; break; }
      // non-ok → on essaie le modèle suivant (le client repliera si tout échoue)
    } catch { clearTimeout(to); }
  }
  if (!upstream || !upstream.body) return new Response("upstream_unavailable", { status: 503 });

  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let buf = "";
      let sent = 0;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          // SSE : blocs séparés par des lignes vides ; chaque ligne « data: {json} ».
          let nl: number;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl).replace(/\r$/, "");
            buf = buf.slice(nl + 1);
            if (!line.startsWith("data:")) continue;
            const delta = sseTextDelta(line.slice(5).trim());
            if (delta) { controller.enqueue(encoder.encode(delta)); sent += delta.length; }
          }
        }
      } catch { /* coupure réseau : on clôt proprement avec ce qu'on a */ }
      if (sent === 0) {
        // rien reçu : signale au client de basculer sur le repli non-streaming
        controller.enqueue(encoder.encode("\u0000EMPTY"));
      }
      controller.close();
    },
    cancel() { reader.cancel().catch(() => {}); },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  });
}
