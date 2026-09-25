import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripeServer";

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
  // En-tête : t=…,v1=…[,v1=…] (plusieurs v1 pendant une rotation du secret).
  let t = "";
  const v1s: string[] = [];
  for (const part of header.split(",")) {
    const [k, v] = part.split("=");
    if (k === "t") t = v;
    else if (k === "v1" && v) v1s.push(v);
  }
  if (!t || v1s.length === 0) return false;
  // Tolérance 5 min pour éviter le rejeu
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false;
  const expected = await hmacHex(secret, `${t}.${raw}`);
  return v1s.some((v1) => {
    if (expected.length !== v1.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ v1.charCodeAt(i);
    return diff === 0;
  });
}

type ProRow = { is_pro?: boolean; plan?: string | null; stripe_event_at?: string | null; stripe_subscription_id?: string | null };

async function getPro(service: string, uid: string): Promise<ProRow | null> {
  const r = await fetch(`${SB_URL}/rest/v1/calorio_pro?id=eq.${encodeURIComponent(uid)}&select=is_pro,plan,stripe_event_at,stripe_subscription_id`, {
    headers: { apikey: service, authorization: `Bearer ${service}` },
  });
  if (!r.ok) throw new Error("pro_read_failed");
  const rows = (await r.json()) as ProRow[];
  return rows[0] || null;
}

// Écrit le statut Pro ; lève une erreur si la base refuse → réponse 500 → Stripe réessaie.
async function setPro(service: string, row: Record<string, unknown>) {
  const r = await fetch(`${SB_URL}/rest/v1/calorio_pro`, {
    method: "POST",
    headers: {
      apikey: service,
      authorization: `Bearer ${service}`,
      "content-type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    // 23503 = clé étrangère : le compte n'existe plus (supprimé par l'utilisateur). Rien à mettre à jour,
    // et surtout pas de 500 : Stripe réessaierait pendant 3 jours puis désactiverait le webhook.
    if (body.includes("23503")) return;
    throw new Error(`pro_write_failed_${r.status}`);
  }
}

// Ignore un événement plus ancien que le dernier appliqué (Stripe ne garantit pas l'ordre),
// et ne retire jamais un Pro offert (plan « comp ») sur la foi d'un événement Stripe.
function shouldApply(prev: ProRow | null, eventAt: string, turnsOff: boolean): boolean {
  if (!prev) return true;
  if (prev.stripe_event_at && new Date(prev.stripe_event_at) > new Date(eventAt)) return false;
  if (turnsOff && prev.plan === "comp") return false;
  return true;
}

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !service) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const raw = await req.text();
  const sigHeader = req.headers.get("stripe-signature") || "";
  const ok = await verify(raw, sigHeader, secret);
  if (!ok) return NextResponse.json({ error: "bad_signature" }, { status: 400 });

  let event: { type?: string; created?: number; data?: { object?: Record<string, unknown> } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const type = event.type || "";
  const obj = event.data?.object || {};
  const eventAt = new Date((event.created || Date.now() / 1000) * 1000).toISOString();

  try {
    if (type.startsWith("customer.subscription.")) {
      type Sub = {
        id?: string;
        status?: string;
        customer?: string;
        current_period_end?: number;
        metadata?: { supabase_uid?: string };
        items?: { data?: { current_period_end?: number; price?: { id?: string } }[] };
      };
      // Source de vérité : on relit l'abonnement chez Stripe (l'ordre et le contenu des événements ne
      // sont pas garantis : « incomplete » puis « active » dans la même seconde, par exemple).
      let sub = obj as Sub;
      let fresh = false;
      if (sub.id) {
        const cur = await stripe(`subscriptions/${encodeURIComponent(sub.id)}`, "GET");
        if (cur.ok && cur.data && cur.data.id) { sub = cur.data as unknown as Sub; fresh = true; }
      }
      const uid = sub.metadata?.supabase_uid;
      const active = sub.status === "active" || sub.status === "trialing";
      const turnsOff = !active;
      const prev = uid ? await getPro(service, uid) : null;
      // Un ancien abonnement qui s'arrête ne doit pas couper un abonnement plus récent encore actif.
      const otherSubActive = !!(turnsOff && prev?.is_pro && prev.stripe_subscription_id && sub.id && prev.stripe_subscription_id !== sub.id);
      const orderOk = fresh ? !(turnsOff && prev?.plan === "comp") : shouldApply(prev, eventAt, turnsOff);
      if (uid && !otherSubActive && orderOk) {
        const end = sub.current_period_end || sub.items?.data?.[0]?.current_period_end;
        await setPro(service, {
          id: uid,
          is_pro: active,
          pro_until: end ? new Date(end * 1000).toISOString() : null,
          stripe_customer_id: sub.customer || null,
          stripe_subscription_id: sub.id || null,
          plan: sub.items?.data?.[0]?.price?.id || null,
          stripe_event_at: fresh ? new Date().toISOString() : eventAt,
          updated_at: new Date().toISOString(),
        });
      }
    } else if (type === "checkout.session.completed") {
      // Filet de sécurité : active dès la fin du paiement, même avant l'event subscription.
      const s = obj as { client_reference_id?: string; customer?: string; subscription?: string };
      if (s.client_reference_id) {
        const prev = await getPro(service, s.client_reference_id);
        if (shouldApply(prev, eventAt, false)) {
          await setPro(service, {
            id: s.client_reference_id,
            is_pro: true,
            stripe_customer_id: s.customer || null,
            stripe_subscription_id: s.subscription || null,
            stripe_event_at: eventAt,
            updated_at: new Date().toISOString(),
          });
        }
      }
    }
  } catch (e) {
    // Échec d'écriture : 500 → Stripe renverra l'événement (jusqu'à 3 jours). Un client qui a payé
    // ne reste jamais sans Pro à cause d'un incident passager.
    return NextResponse.json({ error: "handler_error", detail: String((e as Error)?.message || e).slice(0, 120) }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
