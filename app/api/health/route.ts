import { NextResponse } from "next/server";
import { SB_URL, svcHeaders, svcKey } from "@/lib/serverAuth";
import { calorioPrices } from "@/lib/stripeServer";
import { modelList, sseTextDelta } from "@/lib/coachPrompt";
import { accessToken, playConfigured } from "@/lib/googlePlay";

// Santé de calorio — GET /api/health
// Contrôle chaque service dont dépend l'app et répond { ok, checks: { … } }. Public et sans secret :
// on n'expose que des états et des messages courts. Surveillé toutes les 10 minutes par la surveillance
// de Sporadex (sporadex.ch, cron /api/cron/surveillance), qui prévient Michaël par e-mail en cas de panne.
// Les contrôles payants ou lents (Vito, Google Play) sont gardés en cache 60 min dans public.calorio_health.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Check = { ok: boolean; detail: string; ms?: number; cached?: boolean; degraded?: boolean };
const CACHE_MIN = 60;

async function timed<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const t0 = Date.now();
  const r = await fn();
  return [r, Date.now() - t0];
}
const short = (e: unknown) => String((e as Error)?.message || e).replace(/\s+/g, " ").slice(0, 140);

async function readCache(svc: string): Promise<Check | null> {
  try {
    const r = await fetch(`${SB_URL}/rest/v1/calorio_health?svc=eq.${svc}&select=ok,detail,ms,checked_at`, { headers: svcHeaders(), cache: "no-store" });
    const rows = (await r.json()) as { ok: boolean; detail: string; ms: number; checked_at: string }[];
    const row = rows?.[0];
    // Un échec est revérifié dès le passage suivant ; un succès reste valable CACHE_MIN minutes.
    if (row && row.ok && !/en échec/.test(row.detail) && Date.now() - Date.parse(row.checked_at) < CACHE_MIN * 60_000) return { ok: true, detail: row.detail, ms: row.ms, cached: true };
  } catch { /* pas de cache */ }
  return null;
}
async function writeCache(svc: string, c: Check) {
  try {
    await fetch(`${SB_URL}/rest/v1/calorio_health`, {
      method: "POST",
      headers: { ...svcHeaders(), prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ svc, ok: c.ok, detail: c.detail, ms: c.ms ?? null, checked_at: new Date().toISOString() }),
    });
  } catch { /* ignore */ }
}

async function checkBase(): Promise<Check> {
  if (!svcKey()) return { ok: false, detail: "clé serveur Supabase absente" };
  try {
    const [r, ms] = await timed(() => fetch(`${SB_URL}/rest/v1/calorio_pro?select=id&limit=1`, { headers: svcHeaders(), cache: "no-store", signal: AbortSignal.timeout(8000) }));
    if (!r.ok) return { ok: false, detail: `Supabase HTTP ${r.status} : ${(await r.text()).slice(0, 100)}`, ms };
    return { ok: ms < 5000, detail: `Supabase répond en ${ms} ms`, ms };
  } catch (e) {
    return { ok: false, detail: `Supabase injoignable : ${short(e)}` };
  }
}

async function checkSite(origin: string): Promise<Check> {
  try {
    const [r, ms] = await timed(() => fetch(`${origin}/calorio`, { cache: "no-store", signal: AbortSignal.timeout(10000), headers: { "user-agent": "calorio-health" } }));
    return { ok: r.ok && ms < 8000, detail: `app : HTTP ${r.status} en ${ms} ms`, ms };
  } catch (e) {
    return { ok: false, detail: `app injoignable : ${short(e)}` };
  }
}

async function checkAliments(origin: string): Promise<Check> {
  // Un produit très connu de la base Open Food Facts (scan de code-barres) + une recherche par nom.
  try {
    const [[a, ms1], [b, ms2]] = await Promise.all([
      timed(() => fetch(`${origin}/api/foods?code=3017620422003`, { cache: "no-store", signal: AbortSignal.timeout(12000) }).then((r) => r.json() as Promise<{ foods?: unknown[] }>)),
      timed(() => fetch(`${origin}/api/foods?q=pomme`, { cache: "no-store", signal: AbortSignal.timeout(12000) }).then((r) => r.json() as Promise<{ foods?: unknown[] }>)),
    ]);
    const scan = (a.foods?.length ?? 0) > 0, search = (b.foods?.length ?? 0) > 0;
    if (scan && search) return { ok: true, detail: `scan ${ms1} ms, recherche ${ms2} ms`, ms: Math.max(ms1, ms2) };
    return { ok: false, detail: `${scan ? "" : "scan sans résultat"}${!scan && !search ? ", " : ""}${search ? "" : "recherche sans résultat"} (Open Food Facts)` };
  } catch (e) {
    return { ok: false, detail: `Open Food Facts injoignable : ${short(e)}` };
  }
}

async function checkStripe(): Promise<Check> {
  if (!process.env.STRIPE_SECRET_KEY) return { ok: false, detail: "clé Stripe absente" };
  try {
    const [p, ms] = await timed(() => calorioPrices());
    return p.monthly && p.yearly ? { ok: true, detail: `prix Pro trouvés en ${ms} ms`, ms } : { ok: false, detail: "prix Pro introuvables chez Stripe (abonnement impossible)" };
  } catch (e) {
    return { ok: false, detail: `Stripe injoignable : ${short(e)}` };
  }
}

async function checkVito(): Promise<Check> {
  const hit = await readCache("vito");
  if (hit) return hit;
  const key = process.env.GEMINI_API_KEY;
  let c: Check;
  if (!key) c = { ok: false, detail: "clé Gemini absente" };
  else {
    // Exactement comme le vrai coach : réponse en flux (streaming), modèle principal puis secours.
    // On attend le premier morceau de texte : c'est ce que voit l'utilisateur quand Vito commence à écrire.
    const fails: string[] = [];
    c = { ok: false, detail: "" };
    for (const model of modelList()) {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), 13000);
      const t0 = Date.now();
      try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`, {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Dis bonjour en un mot." }] }], generationConfig: { maxOutputTokens: 512, temperature: 0 } }),
          signal: ctrl.signal,
        });
        if (!r.ok || !r.body) {
          const j = (await r.json().catch(() => ({}))) as { error?: { message?: string } };
          fails.push(`${model} HTTP ${r.status} ${j.error?.message?.slice(0, 80) || ""}`.trim());
          continue;
        }
        const reader = r.body.getReader();
        const dec = new TextDecoder();
        let buf = "", got = "";
        while (!got) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let nl: number;
          while ((nl = buf.indexOf("\n")) >= 0) {
            const line = buf.slice(0, nl).replace(/\r$/, "");
            buf = buf.slice(nl + 1);
            if (line.startsWith("data:")) got += sseTextDelta(line.slice(5).trim());
          }
        }
        reader.cancel().catch(() => {});
        const ms = Date.now() - t0;
        if (got.trim()) { c = { ok: true, degraded: fails.length > 0, detail: `${model} répond en ${ms} ms${fails.length ? ` (principal en échec : ${fails.join(" ; ")})` : ""}`, ms }; break; }
        fails.push(`${model} réponse vide`);
      } catch (e) {
        fails.push(`${model} ${Date.now() - t0 >= 12500 ? "pas de réponse en 13 s" : short(e).slice(0, 60)}`);
      } finally {
        clearTimeout(to);
      }
    }
    if (!c.ok) c = { ok: false, detail: `Vito ne répond plus : ${fails.join(" ; ")}` };
  }
  await writeCache("vito", c);
  return c;
}

async function checkPlay(): Promise<Check> {
  const hit = await readCache("play");
  if (hit) return hit;
  let c: Check;
  if (!playConfigured()) c = { ok: false, detail: "compte de service Google Play absent" };
  else {
    try {
      const [, ms] = await timed(() => accessToken());
      c = { ok: true, detail: `accès Google Play OK (${ms} ms)`, ms };
    } catch (e) {
      c = { ok: false, detail: `Google Play : ${short(e)} (abonnements Play non vérifiables)` };
    }
  }
  await writeCache("play", c);
  return c;
}

// Résultat réutilisé 60 s : appeler la page en boucle ne relance pas les contrôles.
let last: { at: number; body: unknown } | null = null;

export async function GET(req: Request) {
  if (last && Date.now() - last.at < 60_000) return NextResponse.json(last.body, { headers: { "cache-control": "no-store" } });
  const origin = new URL(req.url).origin.includes("localhost") ? new URL(req.url).origin : "https://calorio.ch";
  const [base, site, aliments, stripe, vito, play] = await Promise.all([
    checkBase(), checkSite(origin), checkAliments(origin), checkStripe(), checkVito(), checkPlay(),
  ]);
  const checks = { site, base, vito, aliments, stripe, play };
  const ok = Object.values(checks).every((c) => c.ok);
  const body = { ok, at: new Date().toISOString(), checks };
  last = { at: Date.now(), body };
  return NextResponse.json(body, { status: 200, headers: { "cache-control": "no-store" } });
}
