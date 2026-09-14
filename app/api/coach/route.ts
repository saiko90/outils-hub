import { NextResponse } from "next/server";

// Relais serveur « Coach nutrition » (Pro). La clé Gemini reste côté serveur
// (variable d'environnement GEMINI_API_KEY sur Vercel) : le navigateur parle à
// CE point d'accès, jamais directement à Gemini. La clé n'est jamais exposée.
export const runtime = "edge";
export const dynamic = "force-dynamic";

type Msg = { role: "user" | "model"; text: string };
type Ctx = {
  lang?: string;
  profil?: Record<string, unknown>;
  cible?: number;
  bmr?: number;
  tdee?: number;
  macrosCible?: { proteines: number; glucides: number; lipides: number };
  aujourdhui?: {
    kcal: number;
    prot: number;
    gluc: number;
    lip: number;
    aliments: { nom: string; grammes: number; kcal: number }[];
  };
  poids?: { debut: number; actuel: number; delta: number } | null;
};

const MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

function persona(lang: string): string {
  const base = {
    fr: `Tu es « Avo », un coach nutrition suisse chaleureux, positif et concret, en forme d'avocat rigolo. Tu tutoies l'utilisateur. Tu réponds TOUJOURS en français, de façon courte et actionnable (2-5 phrases max, pas de longs pavés). Tu t'appuies sur les données de la journée de l'utilisateur (calories cible, ce qu'il a mangé, macros, poids) pour donner des conseils personnalisés : quoi manger ce soir, comment équilibrer, des idées de repas suisses simples. Tu encourages, sans jamais culpabiliser. Tu utilises 1 emoji max par message. Tu ne donnes PAS de diagnostic médical, tu ne parles pas de régimes extrêmes ni de restriction dangereuse ; si l'utilisateur évoque un trouble alimentaire, une maladie ou un médicament, tu l'invites avec bienveillance à consulter un·e diététicien·ne ou un·e médecin. Tu restes sur le thème nutrition/alimentation/activité.`,
    de: `Du bist « Avo », ein herzlicher, positiver und konkreter Schweizer Ernährungscoach in Form einer lustigen Avocado. Du duzt die Person. Du antwortest IMMER auf Deutsch, kurz und umsetzbar (max. 2-5 Sätze). Du stützt dich auf die Tagesdaten (Zielkalorien, Gegessenes, Makros, Gewicht) für persönliche Tipps. Du ermutigst, ohne Schuldgefühle. Max. 1 Emoji pro Nachricht. Keine medizinische Diagnose, keine extremen Diäten; bei Essstörung, Krankheit oder Medikamenten empfiehlst du freundlich eine Ernährungsberatung oder einen Arzt. Bleib beim Thema Ernährung/Bewegung.`,
    en: `You are "Avo", a warm, positive, practical Swiss nutrition coach shaped like a funny avocado. Always answer in English, short and actionable (2-5 sentences max). Use the user's daily data (target calories, what they ate, macros, weight) for personalised tips. Encourage, never shame. Max 1 emoji per message. No medical diagnosis, no extreme diets; if the user mentions an eating disorder, illness or medication, kindly suggest seeing a dietitian or doctor. Stay on nutrition/food/activity.`,
  } as Record<string, string>;
  return base[lang] || base.fr;
}

function contextBlock(ctx: Ctx): string {
  const lines: string[] = [];
  if (ctx.profil) lines.push(`Profil: ${JSON.stringify(ctx.profil)}`);
  if (typeof ctx.cible === "number") lines.push(`Calories cible/jour: ${ctx.cible} kcal (BMR ${ctx.bmr}, dépense ${ctx.tdee}).`);
  if (ctx.macrosCible) lines.push(`Macros cible: ${ctx.macrosCible.proteines}g prot / ${ctx.macrosCible.glucides}g gluc / ${ctx.macrosCible.lipides}g lip.`);
  if (ctx.aujourdhui) {
    const a = ctx.aujourdhui;
    const foods = a.aliments.length ? a.aliments.map((f) => `${f.nom} ${f.grammes}g (${f.kcal}kcal)`).join(", ") : "rien enregistré pour l'instant";
    lines.push(`Aujourd'hui: ${a.kcal} kcal consommées (${a.prot}g P / ${a.gluc}g G / ${a.lip}g L). Aliments: ${foods}.`);
  }
  if (ctx.poids) lines.push(`Poids: départ ${ctx.poids.debut}kg, actuel ${ctx.poids.actuel}kg, variation ${ctx.poids.delta}kg.`);
  return lines.length ? `Données de l'utilisateur (contexte, ne pas répéter tel quel) :\n${lines.join("\n")}` : "";
}

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "not_configured", message: "Le coach n'est pas encore activé (clé API manquante côté serveur)." }, { status: 503 });
  }

  let body: { messages?: Msg[]; context?: Ctx };
  try {
    body = (await req.json()) as { messages?: Msg[]; context?: Ctx };
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const ctx = body.context || {};
  const lang = (ctx.lang === "de" || ctx.lang === "en" ? ctx.lang : "fr") as string;
  const msgs = (body.messages || []).filter((m) => m && typeof m.text === "string" && m.text.trim()).slice(-16);
  if (msgs.length === 0) return NextResponse.json({ error: "empty" }, { status: 400 });
  // garde-fou taille
  for (const m of msgs) m.text = m.text.slice(0, 1500);

  const sys = persona(lang) + "\n\n" + contextBlock(ctx);
  const contents = msgs.map((m) => ({ role: m.role === "model" ? "model" : "user", parts: [{ text: m.text }] }));

  const payload = {
    system_instruction: { parts: [{ text: sys }] },
    contents,
    generationConfig: { temperature: 0.6, maxOutputTokens: 700, topP: 0.95 },
    safetySettings: [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
    ],
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 25000);
    const r = await fetch(url, {
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
    const data = (await r.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
      promptFeedback?: { blockReason?: string };
    };
    const reply = data.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
    if (!reply) {
      const blocked = data.promptFeedback?.blockReason;
      return NextResponse.json({ reply: blocked ? "Désolé, je préfère ne pas répondre à ça — on reste sur la nutrition ? 🥑" : "Hmm, je n'ai pas de réponse là. Reformule ?" });
    }
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "timeout", message: "Le coach a mis trop de temps à répondre. Réessaie." }, { status: 504 });
  }
}
