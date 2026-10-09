// Google Play Billing côté serveur : vérification des abonnements achetés dans l'app Android.
// Source de vérité = API Google Play Developer (jamais la parole de l'app).
// Configuration (Vercel) : GOOGLE_PLAY_SA_JSON = clé JSON du compte de service relié à la Play Console
// (droits « Afficher les données financières » + « Gérer les commandes et abonnements »).
import { createSign } from "crypto";

export const PLAY_PACKAGE = "ch.calorio.twa";
export const PLAY_PRODUCT = "calorio_pro"; // abonnement avec deux forfaits de base : « monthly » et « yearly »

type ServiceAccount = { client_email: string; private_key: string; token_uri?: string };

function serviceAccount(): ServiceAccount | null {
  const raw = process.env.GOOGLE_PLAY_SA_JSON;
  if (!raw) return null;
  try {
    const j = JSON.parse(raw) as ServiceAccount;
    return j.client_email && j.private_key ? j : null;
  } catch {
    return null;
  }
}

export function playConfigured(): boolean {
  return !!serviceAccount();
}

const b64url = (b: Buffer | string) => (typeof b === "string" ? Buffer.from(b, "utf8") : b).toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

let cached: { token: string; exp: number } | null = null;

async function accessToken(): Promise<string> {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const sa = serviceAccount();
  if (!sa) throw new Error("play_not_configured");
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/androidpublisher",
    aud: sa.token_uri || "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  }));
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claim}`);
  const jwt = `${header}.${claim}.${b64url(signer.sign(sa.private_key))}`;
  const r = await fetch(sa.token_uri || "https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
  });
  const j = (await r.json().catch(() => ({}))) as { access_token?: string; expires_in?: number };
  if (!r.ok || !j.access_token) throw new Error(`play_auth_${r.status}`);
  cached = { token: j.access_token, exp: Date.now() + (j.expires_in || 3600) * 1000 };
  return j.access_token;
}

const API = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PLAY_PACKAGE}`;

async function call(path: string, method = "GET"): Promise<{ status: number; data: Record<string, unknown> }> {
  const t = await accessToken();
  const r = await fetch(`${API}${path}`, { method, headers: { authorization: `Bearer ${t}` } });
  const data = (await r.json().catch(() => ({}))) as Record<string, unknown>;
  return { status: r.status, data };
}

/** Réponse brute de purchases.subscriptionsv2.get (champs utiles). */
export type SubV2 = {
  subscriptionState?: string;
  acknowledgementState?: string;
  linkedPurchaseToken?: string;
  externalAccountIdentifiers?: { obfuscatedExternalAccountId?: string };
  lineItems?: { productId?: string; expiryTime?: string; offerDetails?: { basePlanId?: string } }[];
};

export type PlaySub = {
  active: boolean;
  until: string | null; // fin de la période payée (ISO)
  state: string;
  productId: string;
  basePlan: string;
  accountId: string; // identifiant de compte calorio transmis lors de l'achat (uid Supabase)
  linkedToken: string;
  needsAck: boolean;
};

// États qui donnent accès : actif, période de grâce, ou résilié mais encore payé jusqu'à l'échéance.
const GRANTING = new Set(["SUBSCRIPTION_STATE_ACTIVE", "SUBSCRIPTION_STATE_IN_GRACE_PERIOD", "SUBSCRIPTION_STATE_CANCELED"]);

/** Fonction pure (testée) : traduit la réponse Google en statut Pro. */
export function interpretSub(s: SubV2, now = Date.now()): PlaySub {
  const items = s.lineItems || [];
  const expiries = items.map((i) => (i.expiryTime ? Date.parse(i.expiryTime) : NaN)).filter((n) => !Number.isNaN(n));
  const until = expiries.length ? new Date(Math.max(...expiries)).toISOString() : null;
  const state = s.subscriptionState || "SUBSCRIPTION_STATE_UNSPECIFIED";
  const active = GRANTING.has(state) && !!until && Date.parse(until) > now;
  return {
    active,
    until,
    state,
    productId: items[0]?.productId || "",
    basePlan: items[0]?.offerDetails?.basePlanId || "",
    accountId: s.externalAccountIdentifiers?.obfuscatedExternalAccountId || "",
    linkedToken: s.linkedPurchaseToken || "",
    needsAck: s.acknowledgementState === "ACKNOWLEDGEMENT_STATE_PENDING",
  };
}

/** Lit un abonnement chez Google. null = jeton inconnu/invalide. Lève une erreur si Google est injoignable. */
export async function fetchSub(purchaseToken: string): Promise<PlaySub | null> {
  const r = await call(`/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`);
  if (r.status === 404 || r.status === 400 || r.status === 410) return null;
  if (r.status !== 200) throw new Error(`play_get_${r.status}`);
  return interpretSub(r.data as SubV2);
}

/** Confirme l'achat (sinon Google le rembourse automatiquement après 3 jours). */
export async function acknowledge(productId: string, purchaseToken: string): Promise<boolean> {
  const r = await call(`/purchases/subscriptions/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:acknowledge`, "POST");
  return r.status === 200 || r.status === 204;
}

/** Arrête le renouvellement (suppression du compte). L'accès reste jusqu'à la fin de la période payée. */
export async function cancelRenewal(productId: string, purchaseToken: string): Promise<boolean> {
  const r = await call(`/purchases/subscriptions/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}:cancel`, "POST");
  return r.status === 200 || r.status === 204;
}
