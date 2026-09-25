import { NextResponse } from "next/server";
import { authUid, SB_URL, svcHeaders } from "@/lib/serverAuth";
import { stripe, safeBase, stripeLocale } from "@/lib/stripeServer";

// Portail client Stripe : changer de carte, voir les factures, résilier en un clic.
export const runtime = "edge";
export const dynamic = "force-dynamic";

// Configuration du portail créée à la volée si le compte Stripe n'en a pas encore.
async function ensurePortalConfig(returnUrl: string): Promise<string | null> {
  const f = new URLSearchParams();
  f.set("features[subscription_cancel][enabled]", "true");
  f.set("features[subscription_cancel][mode]", "at_period_end");
  f.set("features[payment_method_update][enabled]", "true");
  f.set("features[invoice_history][enabled]", "true");
  f.set("business_profile[privacy_policy_url]", "https://calorio.ch/confidentialite-calorio");
  f.set("default_return_url", returnUrl);
  const r = await stripe("billing_portal/configurations", "POST", f);
  return r.ok ? String(r.data.id || "") || null : null;
}

export async function POST(req: Request) {
  const uid = await authUid(req);
  if (!uid) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  let body: { origin?: string; lang?: string } = {};
  try { body = (await req.json()) as typeof body; } catch { /* défauts */ }
  const base = safeBase(body.origin);
  const returnUrl = `${base}${base.includes("outils.ch") ? "/o/calorio" : "/calorio"}`;

  const r = await fetch(`${SB_URL}/rest/v1/calorio_pro?id=eq.${uid}&select=stripe_customer_id`, { headers: svcHeaders() });
  const rows = r.ok ? ((await r.json()) as { stripe_customer_id?: string | null }[]) : [];
  const customer = rows[0]?.stripe_customer_id;
  if (!customer) return NextResponse.json({ error: "no_customer" }, { status: 404 });

  const mk = (config?: string) => {
    const f = new URLSearchParams();
    f.set("customer", customer);
    f.set("return_url", returnUrl);
    f.set("locale", stripeLocale(body.lang));
    if (config) f.set("configuration", config);
    return stripe("billing_portal/sessions", "POST", f);
  };
  let s = await mk();
  if (!s.ok && /configuration/i.test(JSON.stringify(s.data))) {
    const cfg = await ensurePortalConfig(returnUrl);
    if (cfg) s = await mk(cfg);
  }
  if (!s.ok || !s.data.url) return NextResponse.json({ error: "stripe_error" }, { status: 502 });
  return NextResponse.json({ url: s.data.url });
}
