// Garde-fou serveur pour le coach Vito (appels Gemini payants).
// - Origine : bloque une origine explicitement étrangère.
// - Pro vérifié en base (jamais sur la foi du client) : quota journalier par utilisateur.
// - Non-Pro : quelques messages d'essai, comptés côté serveur « à vie » (par compte, ou par empreinte d'IP sans compte :
//   se déconnecter ne donne pas d'essais en plus).
// - Filet global par IP et par jour.
import { authUser, proStatus, dailyQuota, lifetimeQuota, clientIp, ipFingerprint } from "@/lib/serverAuth";

const ALLOWED_HOSTS = ["calorio.ch", "outils.ch", "localhost", "127.0.0.1"];
export const IP_DAILY_MAX = 60; // filet anti-script (plusieurs appareils derrière une même box)
export const PRO_DAILY_MAX = 40; // le client s'arrête à 20/jour ; marge pour le repli non-streaming
export const FREE_TRIES = 4; // 3 essais affichés + 1 de marge (repli streaming → non-streaming)

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

/** null = autorisé ; sinon statut HTTP à renvoyer (403 origine, 429 quota, 402 Pro requis, 503 statut inconnu). */
export async function coachGuard(req: Request): Promise<number | null> {
  if (!originAllowed(req)) return 403;
  const user = await authUser(req);
  if (user) {
    const pro = await proStatus(user.id);
    if (pro === null) return 503; // base injoignable : on ne consomme pas les essais d'un abonné
    // Pro : quota par compte uniquement (pas de plafond par IP, qui bloquerait des abonnés derrière
    // un même réseau d'opérateur ou d'entreprise).
    if (pro) return (await dailyQuota(`coach:u:${user.id}`, PRO_DAILY_MAX)) ? null : 429;
  }
  // Non-Pro / anonyme : filet par IP (empreinte HMAC) puis essais gratuits comptés côté serveur.
  const ip = await ipFingerprint(req);
  if (ip !== "unknown" && !(await dailyQuota(`coach:ip:${ip}`, IP_DAILY_MAX))) return 429;
  const ok = user
    ? await lifetimeQuota(`coach:u:${user.id}`, FREE_TRIES)
    : ip === "unknown" ? true : await lifetimeQuota(`coach:ip:${ip}`, FREE_TRIES);
  return ok ? null : 402;
}
