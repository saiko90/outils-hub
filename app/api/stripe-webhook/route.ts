import { NextResponse } from "next/server";

// Webhook Stripe : à chaque changement d'abonnement, met à jour le statut Pro dans
// Supabase (table calorio_pro) via la clé service_role — la SEULE autorisée à l'écrire.
// La signature Stripe est vérifiée pour rejeter toute requête non authentique.
export const runtime = "edge";
export const dynamic = "force-dynamic";

const SB_URL = "https://srcvnqfgtazupuzwznrr.supabase.co";

async function hmacHex(secret: string, msg: string): Promise<string> {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, enc.encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verify(raw: string, header: string, secret: string): Promise<boolean> {
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")) as [string, string][]);
  const t = parts["t"];
  const v1 = parts["v1"];
  if (!t || !v1) return false;
  // Tolérance 5 min pour éviter le rejeu
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const expected = await hmacHex(secret, `${t}.${raw}`);
  if (expected.length !== v1.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
  return diff === 0;
}

async function setPro(service: string, row: Record<string, unknown>) {
  await fetch(`${SB_URL}/rest/v1/calorio_pro`, {
    method: "POST",
    headers: {
      apikey: service,
      authorization: `Bearer ${service}`,
      "content-type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(row),
  });
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !service) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const raw = await req.text();
  const sigHeader = req.headers.get("stripe-signature") || "";
  const ok = await verify(raw, sigHeader, secret);
  if (!ok) return NextResponse.json({ error: "bad_signature" }, { status: 400 });

  let event: { type?: string; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const type = event.type || "";
  const obj = event.data?.object || {};

  try {
    if (type.startsWith("customer.subscription.")) {
      const sub = obj as {
        id?: string;
        status?: string;
        customer?: string;
        current_period_end?: number;
        metadata?: { supabase_uid?: string };
        items?: { data?: { current_period_end?: number; price?: { id?: string } }[] };
      };
      const uid = sub.metadata?.supabase_uid;
      if (uid) {
        const active = sub.status === "active" || sub.status === "trialing";
        const end = sub.current_period_end || sub.items?.data?.[0]?.current_period_end;
        await setPro(service, {
          id: uid,
          is_pro: type === "customer.subscription.deleted" ? false : active,
          pro_until: end ? new Date(end * 1000).toISOString() : null,
          stripe_customer_id: sub.customer || null,
          stripe_subscription_id: sub.id || null,
          plan: sub.items?.data?.[0]?.price?.id || null,
          updated_at: new Date().toISOString(),
        });
      }
    } else if (type === "checkout.session.completed") {
      // Filet de sécurité : active dès la fin du paiement, même avant l'event subscription.
      const s = obj as { client_reference_id?: string; customer?: string; subscription?: string };
      if (s.client_reference_id) {
        await setPro(service, {
          id: s.client_reference_id,
          is_pro: true,
          stripe_customer_id: s.customer || null,
          stripe_subscription_id: s.subscription || null,
          updated_at: new Date().toISOString(),
        });
      }
    }
  } catch {
    return NextResponse.json({ received: true, warn: "handler_error" });
  }

  return NextResponse.json({ received: true });
}
