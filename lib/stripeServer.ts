// Appels Stripe côté serveur (form-encoded), sans SDK. La clé secrète reste dans l'environnement.
export async function stripe(path: string, method: "GET" | "POST" | "DELETE" = "POST", form?: URLSearchParams, idempotencyKey?: string): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return { ok: false, status: 503, data: { error: { message: "not_configured" } } };
  const r = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: { authorization: `Bearer ${key}`, "content-type": "application/x-www-form-urlencoded", ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}) },
    body: method === "GET" ? undefined : form ? form.toString() : undefined,
  });
  const data = (await r.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: r.ok, status: r.status, data };
}

export const ALLOWED_ORIGINS = ["https://calorio.ch", "https://www.calorio.ch", "https://outils.ch"];
export function safeBase(origin: unknown): string {
  return typeof origin === "string" && ALLOWED_ORIGINS.includes(origin) ? origin : "https://calorio.ch";
}
export function stripeLocale(lang: unknown): string {
  return lang === "de" ? "de" : lang === "en" ? "en" : "fr";
}
