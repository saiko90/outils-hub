import { NextResponse } from "next/server";
import { persona, contextBlock, trimMessages, geminiPayload, modelList, coachLang, sanitizeCtx, type CoachMsg, type CoachApiCtx } from "@/lib/coachPrompt";
import { coachGuard } from "@/lib/coachRate";

// Relais serveur « Coach nutrition » (Pro), NON-streaming et robuste — sert aussi de
// repli quand le streaming échoue. La clé Gemini reste côté serveur (GEMINI_API_KEY).
export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "not_configured", message: "Le coach n'est pas encore activé (clé API manquante côté serveur)." }, { status: 503 });
  }

  let body: { messages?: CoachMsg[]; context?: CoachApiCtx };
  try {
    body = (await req.json()) as { messages?: CoachMsg[]; context?: CoachApiCtx };
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const ctx = sanitizeCtx(body.context); // types vérifiés + tailles bornées (coût Gemini maîtrisé)
  const lang = coachLang(ctx);
  const msgs = trimMessages(body.messages);
  if (msgs.length === 0) return NextResponse.json({ error: "empty" }, { status: 400 });

  // Garde-fou serveur (origine, Pro vérifié en base, essais gratuits, quotas).
  const gate = await coachGuard(req);
  const blocked = gate.status;
  if (blocked === 402) return NextResponse.json({ error: "pro_required" }, { status: 402 });
  if (blocked === 429) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  if (blocked === 503) return NextResponse.json({ error: "busy" }, { status: 503 });
  if (blocked) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const sys = persona(lang) + "\n\n" + contextBlock(ctx);
  const payload = geminiPayload(sys, msgs);

  const MODELS = modelList();
  const MAX_CALLS = 5;
  const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
  const busyMsg =
    lang === "de" ? "Ich bin gerade etwas überlastet 🥕 versuch es gleich nochmal, ich bin schnell zurück!"
    : lang === "en" ? "I'm a bit swamped right now 🥕 try again in a moment, I'll be right back!"
    : "Je suis un peu débordé là 🥕 réessaie dans un instant, je reviens vite !";

  const callOnce = async (model: string): Promise<Response | null> => {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 12000);
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
      clearTimeout(to);
      return r;
    } catch { clearTimeout(to); return null; }
  };

  let lastStatus = 0;
  let lastDetail = "";
  let calls = 0;
  for (const model of MODELS) {
    for (let attempt = 0; attempt < MAX_CALLS && calls < MAX_CALLS; attempt++) {
      calls++;
      const r = await callOnce(model);
      if (!r) { lastStatus = 504; await sleep(300); continue; }
      if (r.ok) {
        const data = (await r.json().catch(() => ({}))) as {
          candidates?: { content?: { parts?: { text?: string }[] } }[];
          promptFeedback?: { blockReason?: string };
        };
        const reply = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
        if (!reply) {
          await gate.refund(); // pas de vraie réponse : l'essai est rendu
          const blocked = data.promptFeedback?.blockReason;
          return NextResponse.json({ reply: blocked ? "Désolé, je préfère ne pas répondre à ça — on reste sur la nutrition ? 🥕" : "Hmm, je n'ai pas de réponse là. Reformule ?" });
        }
        return NextResponse.json({ reply }); // l'essai réservé est consommé
      }
      lastStatus = r.status;
      lastDetail = (await r.text().catch(() => "")).slice(0, 300);
      if (r.status === 404) break;
      const retryable = r.status === 503 || r.status === 429 || r.status === 500 || r.status === 502;
      if (!retryable) {
        await gate.refund();
        return NextResponse.json({ error: "gemini_error", status: r.status, message: lastDetail }, { status: 502 });
      }
      await sleep(400 * (attempt + 1));
    }
  }
  await gate.refund();
  return NextResponse.json({ reply: busyMsg, busy: true, lastStatus });
}
