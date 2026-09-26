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

/**
 * Pro actif selon la base (écrite uniquement par le webhook Stripe / service_role).
 * true / false = réponse sûre ; null = base injoignable (on ne sait pas : ne PAS traiter comme gratuit).
 */
export async function proStatus(uid: string): Promise<boolean | null> {
  if (!uid || !svcKey()) return null;
  try {
    const r = await fetch(`${SB_URL}/rest/v1/calorio_pro?id=eq.${encodeURIComponent(uid)}&select=is_pro,pro_until`, { headers: svcHeaders() });
    if (!r.ok) return null;
    const rows = (await r.json()) as { is_pro?: boolean; pro_until?: string | null }[];
    const p = rows[0];
    return !!p?.is_pro && (!p.pro_until || new Date(p.pro_until) > new Date());
  } catch {
    return null;
  }
}
export async function isProServer(uid: string): Promise<boolean> {
  return (await proStatus(uid)) === true;
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

/** Nombre d'essais déjà consommés pour une clé (sans consommer). 0 si inconnu. */
export async function freeUsed(key: string): Promise<number> {
  if (!svcKey()) return 0;
  try {
    const r = await fetch(`${SB_URL}/rest/v1/rpc/ai_free_get`, { method: "POST", headers: svcHeaders(), body: JSON.stringify({ p_key: key }) });
    if (!r.ok) return 0;
    const n = (await r.json()) as number;
    return typeof n === "number" ? n : 0;
  } catch {
    return 0;
  }
}
/** Consomme un essai (appelé seulement après une vraie réponse). */
export async function consumeFree(key: string): Promise<void> {
  if (!svcKey()) return;
  try {
    await fetch(`${SB_URL}/rest/v1/rpc/ai_free_bump`, { method: "POST", headers: svcHeaders(), body: JSON.stringify({ p_key: key, p_max: 1000 }) });
  } catch { /* ignore */ }
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

/** Empreinte HMAC-SHA-256 (clé serveur secrète) de l'adresse IP : quotas anti-abus sans conserver l'IP,
 *  et impossible à inverser sans la clé (contrairement à un simple hachage). */
export async function ipFingerprint(req: Request): Promise<string> {
  const ip = clientIp(req);
  if (ip === "unknown") return "unknown";
  const secret = process.env.IP_HASH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!secret) return "unknown";
  try {
    const enc = new TextEncoder();
    const k = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", k, enc.encode(`calorio-ip:${ip}`));
    return Array.from(new Uint8Array(sig)).slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return "unknown";
  }
}
