// Connexion de l'app Android (WebView Capacitor) via le navigateur du téléphone.
// Google interdit la connexion Google dans une WebView : le bouton ouvrait Chrome et l'utilisateur
// se retrouvait connecté… sur le site, pas dans l'app. Parcours :
//  1. l'app tire un secret s, envoie h = sha256(s) au serveur et ouvre le navigateur sur ?applogin=h ;
//  2. dans le navigateur, l'utilisateur se connecte (Google ou e-mail) puis approuve, code à l'appui ;
//  3. l'app prouve qu'elle connaît s et reçoit une connexion à usage unique (lien magique côté serveur).
// Connaître h (visible dans l'historique du navigateur) ne suffit pas pour récupérer la connexion.

export const APP_LOGIN_TTL_MS = 10 * 60 * 1000; // une demande vit 10 minutes
export const APP_LOGIN_KEY = "calorio.applogin"; // demande en attente, côté navigateur

export const isHex64 = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{64}$/.test(v);

/** Code à 4 chiffres affiché dans l'app ET dans le navigateur, pour vérifier qu'il s'agit bien de la même demande. */
export function codeFromHash(h: string): string {
  return String(parseInt(h.slice(0, 8), 16) % 10000).padStart(4, "0");
}

/** Lit la demande en attente stockée dans le navigateur ; null si absente, invalide ou expirée. */
export function parsePendingApp(raw: string | null, now = Date.now()): { h: string; code: string } | null {
  if (!raw) return null;
  try {
    const j = JSON.parse(raw) as { h?: unknown; t?: unknown };
    if (!isHex64(j.h) || typeof j.t !== "number" || now - j.t > APP_LOGIN_TTL_MS || j.t > now + 60_000) return null;
    return { h: j.h, code: codeFromHash(j.h) };
  } catch {
    return null;
  }
}

/** Lien Android qui ramène l'utilisateur dans l'app calorio (bouton « Retour à l'app » dans Chrome). */
export const APP_INTENT_URL = "intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=ch.calorio.twa;end";
