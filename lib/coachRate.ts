// Garde-fou serveur pour le coach Vito (appels Gemini payants).
// - Origine : bloque une origine explicitement étrangère.
// - Pro vérifié en base (jamais sur la foi du client) : quota journalier par utilisateur.
// - Non-Pro : 3 messages d'essai, comptés côté serveur après chaque vraie réponse (à vie pour un compte,
//   par jour et par réseau sans compte).
// - Filet global par IP et par jour.
import { authUser, proStatus, dailyQuota, lifetimeQuota, refundFree, clientIp, ipFingerprint } from "@/lib/serverAuth";

const ALLOWED_HOSTS = ["calorio.ch", "outils.ch", "localhost", "127.0.0.1"];
export const IP_DAILY_MAX = 60; // filet anti-script (plusieurs appareils derrière une même box)
export const PRO_DAILY_MAX = 40; // le client s'arrête à 20/jour ; marge pour le repli non-streaming
export const FREE_TRIES = 3; // réservés atomiquement, rendus si le coach ne répond pas

// Les clients sans Origin (certaines WebView natives) passent — les quotas les couvrent.
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

export { clientIp };

export type CoachGate = { status: number | null; refund: () => Promise<void> };
const nothing = async () => {};
function swissDay(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich" }).format(new Date());
}

/**
 * status null = autorisé ; sinon statut HTTP à renvoyer (403 origine, 429 quota, 402 Pro requis, 503 statut inconnu).
 * L'essai gratuit est RÉSERVÉ de façon atomique avant l'appel (des requêtes en parallèle ne peuvent pas dépasser
 * la limite) ; `refund` le rend si le coach n'a finalement pas répondu.
 */
export async function coachGuard(req: Request): Promise<CoachGate> {
  if (!originAllowed(req)) return { status: 403, refund: nothing };
  const user = await authUser(req);
  if (user) {
    const pro = await proStatus(user.id);
    if (pro === null) return { status: 503, refund: nothing }; // base injoignable : on ne touche pas aux essais
    // Pro : quota par compte uniquement (pas de plafond par IP).
    if (pro) return { status: (await dailyQuota(`coach:u:${user.id}`, PRO_DAILY_MAX)) ? null : 429, refund: nothing };
  }
  // Non-Pro / anonyme : filet par IP (empreinte HMAC), puis essais gratuits.
  const ip = await ipFingerprint(req);
  if (ip !== "unknown" && !(await dailyQuota(`coach:ip:${ip}`, IP_DAILY_MAX))) return { status: 429, refund: nothing };
  // Compte gratuit : essais « à vie » du compte. Sans compte : par jour et par réseau.
  const key = user ? `coach:u:${user.id}` : ip === "unknown" ? "" : `coach:anon:${ip}:${swissDay()}`;
  if (!key) return { status: null, refund: nothing };
  if (!(await lifetimeQuota(key, FREE_TRIES))) return { status: 402, refund: nothing };
  return { status: null, refund: () => refundFree(key) };
}
