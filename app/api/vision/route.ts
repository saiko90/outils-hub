import { NextResponse } from "next/server";
import { authUser, isProServer, dailyQuota } from "@/lib/serverAuth";

// Analyse photo d'un repas → estimation des aliments et calories (Gemini Vision).
// La clé reste côté serveur (GEMINI_API_KEY). Fonction Pro.
export const runtime = "edge";
export const dynamic = "force-dynamic";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

const PROMPT = `Tu es un expert en nutrition. Analyse cette photo de repas et identifie les aliments visibles.
Pour chaque aliment, estime la quantité en grammes et ses valeurs nutritionnelles.
Réponds UNIQUEMENT avec un objet JSON valide, sans texte autour, au format exact :
{"items":[{"nom":"...","grammes":000,"kcal":000,"prot":00,"gluc":00,"lip":00}]}
- "nom" : nom court de l'aliment (dans la langue: __LANG__).
- "grammes" : portion estimée en grammes (entier).
- "kcal","prot","gluc","lip" : valeurs TOTALES pour la portion estimée (pas pour 100 g).
Si la photo ne contient pas de nourriture identifiable, renvoie {"items":[]}.
Sois réaliste et prudent dans les estimations. Maximum 8 aliments.`;

const VISION_DAILY_MAX = 30;
const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  // Fonction Pro : compte connecté + Pro vérifié en base + quota journalier par utilisateur.
  const user = await authUser(req);
  if (!user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!(await isProServer(user.id))) return NextResponse.json({ error: "pro_required" }, { status: 402 });
  if (!(await dailyQuota(`vision:u:${user.id}`, VISION_DAILY_MAX))) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  let body: { image?: string; mime?: string; lang?: string };
  try {
    body = (await req.json()) as { image?: string; mime?: string; lang?: string };
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const image = body.image || "";
  const mime = ALLOWED_MIME.includes(body.mime || "") ? (body.mime as string) : "image/jpeg";
  const lang = body.lang === "de" ? "allemand" : body.lang === "en" ? "anglais" : "français";
  if (!image || image.length < 100) return NextResponse.json({ error: "no_image" }, { status: 400 });
  if (image.length > 8_000_000) return NextResponse.json({ error: "too_large" }, { status: 413 });

  const payload = {
    contents: [
      {
        role: "user",
        parts: [
          { text: PROMPT.replace("__LANG__", lang) },
          { inline_data: { mime_type: mime, data: image } },
        ],
      },
    ],
    generationConfig: { temperature: 0.2, maxOutputTokens: 2048, responseMimeType: "application/json" },
  };

  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 30000);
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    clearTimeout(to);
    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      return NextResponse.json({ error: "gemini_error", status: r.status, message: detail.slice(0, 300) }, { status: 502 });
    }
    const data = (await r.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const raw = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim() || "";
    let items: { nom: string; grammes: number; kcal: number; prot: number; gluc: number; lip: number }[] = [];
    try {
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
      const parsed = JSON.parse(cleaned) as { items?: unknown };
      if (Array.isArray(parsed.items)) {
        items = parsed.items
          .map((it) => {
            const o = it as Record<string, unknown>;
            return {
              nom: String(o.nom ?? "").slice(0, 50),
              grammes: Math.max(0, Math.round(Number(o.grammes) || 0)),
              kcal: Math.max(0, Math.round(Number(o.kcal) || 0)),
              prot: Math.max(0, Math.round((Number(o.prot) || 0) * 10) / 10),
              gluc: Math.max(0, Math.round((Number(o.gluc) || 0) * 10) / 10),
              lip: Math.max(0, Math.round((Number(o.lip) || 0) * 10) / 10),
            };
          })
          .filter((x) => x.nom && x.kcal > 0)
          .slice(0, 8);
      }
    } catch {
      return NextResponse.json({ items: [], parseError: true });
    }
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "timeout" }, { status: 504 });
  }
}
