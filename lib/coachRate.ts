// Garde-fou serveur pour l'endpoint coach (Vito) : limite le nombre d'appels Gemini
// par IP et par jour, plus un contrôle d'origine. Tout est « fail-open » : au moindre
// doute (pas de clé, souci Supabase, IP inconnue), on laisse passer — jamais bloquer un
// vrai utilisateur. Le but est de stopper l'abus scripté, pas d'être infaillible.

const ALLOWED_HOSTS = ["calorio.ch", "outils.ch", "localhost", "127.0.0.1"];
const DAILY_IP_MAX = 40; // généreux pour un usage réel (Pro = 20/j côté client), bloque le spam.

// Bloque uniquement une origine explicitement étrangère. Les clients sans Origin
// (certaines WebView natives) passent — la limite par IP les couvre.
export function originAllowed(req: Request): boolean {
  const o = req.headers.get("origin") || req.headers.get("referer") || "";
  if (!o) return true;
  try {
    const h = new URL(o).hostname;
    return ALLOWED_HOSTS.some((a) => h === a || h.endsWith("." + a));
  } catch {
    return true;
  }
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// true = sous la limite (autorisé) ; false = limite dépassée.
export async function underRateLimit(ip: string): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://srcvnqfgtazupuzwznrr.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || ip === "unknown") return true; // fail-open
  try {
    const r = await fetch(`${url}/rest/v1/rpc/coach_rate_bump`, {
      method: "POST",
      headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({ p_ip: ip, p_max: DAILY_IP_MAX }),
    });
    if (!r.ok) return true; // fail-open
    const allowed = (await r.json()) as boolean;
    return allowed !== false;
  } catch {
    return true; // fail-open
  }
}

// Contrôle combiné. Renvoie null si tout va bien, sinon un statut HTTP à renvoyer.
export async function coachGuard(req: Request): Promise<number | null> {
  if (!originAllowed(req)) return 403;
  if (!(await underRateLimit(clientIp(req)))) return 429;
  return null;
}
