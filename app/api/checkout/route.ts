import { NextResponse } from "next/server";
import { SB_URL, SB_ANON, svcHeaders } from "@/lib/serverAuth";
import { stripeLocale } from "@/lib/stripeServer";

// Crée une session Stripe Checkout (abonnement Pro) pour l'utilisateur connecté.
// La clé secrète Stripe reste côté serveur (env). L'utilisateur est identifié via
// son jeton Supabase (vérifié ici) — impossible de s'abonner pour un autre compte.
export const runtime = "edge";
export const dynamic = "force-dynamic";

const SITE = "https://outils.ch";

export async function POST(req: Request) {
  const key = process.env.STRIPE_SECRET_KEY;
  const priceMonthly = process.env.STRIPE_PRICE_MONTHLY;
  const priceYearly = process.env.STRIPE_PRICE_YEARLY;
  if (!key || !priceMonthly || !priceYearly) {
    return NextResponse.json({ error: "not_configured", message: "Le paiement n'est pas encore activé." }, { status: 503 });
  }

  // 1) Identifier l'utilisateur via son jeton Supabase
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  let uid = "", email = "";
  try {
    const u = await fetch(`${SB_URL}/auth/v1/user`, { headers: { apikey: SB_ANON, authorization: `Bearer ${token}` } });
    if (!u.ok) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    const data = (await u.json()) as { id?: string; email?: string };
    uid = data.id || "";
    email = data.email || "";
    if (!uid) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  // 2) Choix du plan + domaine de retour (calorio.ch reste sur calorio.ch)
  let plan = "yearly";
  let base = SITE;
  let locale = "fr";
  try {
    const body = (await req.json()) as { plan?: string; origin?: string; lang?: string };
    if (body.plan === "monthly" || body.plan === "yearly") plan = body.plan;
    locale = stripeLocale(body.lang);
    const allowed = ["https://calorio.ch", "https://www.calorio.ch", "https://outils.ch"];
    if (body.origin && allowed.includes(body.origin)) base = body.origin;
  } catch { /* défaut yearly */ }
  const price = plan === "monthly" ? priceMonthly : priceYearly;

  // Déjà abonné (Stripe) ? → pas de second abonnement : le client ouvre le portail à la place.
  let existingCustomer = "";
  try {
    const pr = await fetch(`${SB_URL}/rest/v1/calorio_pro?id=eq.${uid}&select=is_pro,pro_until,stripe_customer_id,stripe_subscription_id`, { headers: svcHeaders() });
    const rows = pr.ok ? ((await pr.json()) as { is_pro?: boolean; pro_until?: string | null; stripe_customer_id?: string | null; stripe_subscription_id?: string | null }[]) : [];
    const p = rows[0];
    const activeStripe = !!p?.is_pro && !!p?.stripe_subscription_id && (!p.pro_until || new Date(p.pro_until) > new Date());
    if (activeStripe) return NextResponse.json({ error: "already_subscribed" }, { status: 409 });
    existingCustomer = p?.stripe_customer_id || "";
  } catch { /* on continue : Stripe reste la source de vérité */ }
  const returnPath = base === SITE ? "/o/calorio" : "/calorio";

  // 3) Créer la session Checkout (abonnement, essai 7 jours)
  const form = new URLSearchParams();
  form.set("mode", "subscription");
  form.set("line_items[0][price]", price);
  form.set("line_items[0][quantity]", "1");
  form.set("success_url", `${base}${returnPath}?pro=success`);
  form.set("cancel_url", `${base}${returnPath}`);
  form.set("client_reference_id", uid);
  if (existingCustomer) form.set("customer", existingCustomer); // réutilise le client Stripe (historique, carte)
  else form.set("customer_email", email);
  form.set("subscription_data[trial_period_days]", "7");
  form.set("subscription_data[metadata][supabase_uid]", uid);
  form.set("allow_promotion_codes", "true");
  form.set("locale", locale);

  try {
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const data = (await r.json()) as { url?: string; error?: { message?: string } };
    if (!r.ok || !data.url) {
      return NextResponse.json({ error: "stripe_error", message: data.error?.message || "" }, { status: 502 });
    }
    return NextResponse.json({ url: data.url });
  } catch {
    return NextResponse.json({ error: "network" }, { status: 502 });
  }
}
