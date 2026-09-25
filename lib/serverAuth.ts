// Aides serveur partagées (routes API calorio) : identité Supabase, statut Pro, quotas.
// Tout ce qui décide d'un accès payant se fait ICI, côté serveur — jamais sur la foi du client.

export const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://srcvnqfgtazupuzwznrr.supabase.co";
export const SB_ANON = "sb_publishable_YUwom0kvnMbpn8Rpug1FaA_1H35zkY_";

export const svcKey = () => process.env.SUPABASE_SERVICE_ROLE_KEY || "";
export function svcHeaders(): Record<string, string> {
  const k = svcKey();
  return { apikey: k, authorization: `Bearer ${k}`, "content-type": "application/json" };
}

export type AuthUser = { id: string; email: string };

/** Utilisateur identifié par son jeton Supabase (en-tête Authorization: Bearer …), sinon null. */
export async function authUser(req: Request): Promise<AuthUser | null> {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return null;
  try {
    const u = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_ANON, authorization: `Bearer ${token}` } });
    if (!u.ok) return null;
    const d = (await u.json()) as { id?: string; email?: string };
    return d.id ? { id: d.id, email: d.email || "" } : null;
  } catch {
    return null;
  }
}

export async function authUid(req: Request): Promise<string> {
  return (await authUser(req))?.id || "";
}

/** Pro actif selon la base (écrite uniquement par le webhook Stripe / service_role). */
export async function isProServer(uid: string): Promise<boolean> {
  if (!uid || !svcKey()) return false;
  try {
    const r = await fetch(`${SB_URL}/rest/v1/calorio_pro?id=eq.${encodeURIComponent(uid)}&select=is_pro,pro_until`, { headers: svcHeaders() });
    if (!r.ok) return false;
    const rows = (await r.json()) as { is_pro?: boolean; pro_until?: string | null }[];
    const p = rows[0];
    return !!p?.is_pro && (!p.pro_until || new Date(p.pro_until) > new Date());
  } catch {
    return false;
  }
}

/** Quota journalier (clé libre, ex. "vision:u:<uid>"). true = autorisé. */
export async function dailyQuota(key: string, max: number): Promise<boolean> {
  if (!svcKey()) return true; // configuration incomplète : on ne bloque pas les vrais utilisateurs
  try {
    const r = await fetch(`${SB_URL}/rest/v1/rpc/coach_rate_bump`, { method: "POST", headers: svcHeaders(), body: JSON.stringify({ p_ip: key, p_max: max }) });
    if (!r.ok) return true;
    return (await r.json()) !== false;
  } catch {
    return true;
  }
}

/** Quota « à vie » (essais gratuits). true = encore autorisé. */
export async function lifetimeQuota(key: string, max: number): Promise<boolean> {
  if (!svcKey()) return true;
  try {
    const r = await fetch(`${SB_URL}/rest/v1/rpc/ai_free_bump`, { method: "POST", headers: svcHeaders(), body: JSON.stringify({ p_key: key, p_max: max }) });
    if (!r.ok) return true;
    return (await r.json()) !== false;
  } catch {
    return true;
  }
}

export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

/** Empreinte (SHA-256 tronqué) de l'adresse IP : sert aux quotas anti-abus sans conserver l'IP en clair. */
export async function ipFingerprint(req: Request): Promise<string> {
  const ip = clientIp(req);
  if (ip === "unknown") return "unknown";
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`calorio:${ip}`));
    return Array.from(new Uint8Array(buf)).slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return "unknown";
  }
}
