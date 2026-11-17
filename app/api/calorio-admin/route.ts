import { NextResponse } from "next/server";
import { ADMIN_EMAIL } from "@/lib/supabase";
import { authUser, SB_URL, svcHeaders, svcKey } from "@/lib/serverAuth";
import { stripe } from "@/lib/stripeServer";
import { MAG_ALL } from "@/lib/mag";
import { PARTNER_ALIASES } from "@/lib/partnerLinks";

// Tableau de bord privé calorio (calorio.ch/admin). Réservé à l'adresse ADMIN_EMAIL, vérifiée côté serveur
// avec le jeton Supabase. Agrège : base calorio (RPC calorio_dashboard), clics des liens partenaires,
// prospects, Stripe (abonnements, factures, codes promo) et état de la publication sociale.
// Lecture seule : rien n'est modifié.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type J = Record<string, unknown>;
const arr = (v: unknown) => (Array.isArray(v) ? (v as J[]) : []);
const num = (v: unknown) => (typeof v === "number" ? v : 0);
const str = (v: unknown) => (typeof v === "string" ? v : "");

async function sbGet(path: string): Promise<J[]> {
  const r = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: svcHeaders(), cache: "no-store" });
  if (!r.ok) return [];
  return ((await r.json()) as J[]) || [];
}

/** Code promo « partenaire » rattaché à un lien court (calorio.ch/anouchka → ANOUCHKA20). */
function codeForSlug(slug: string): string {
  const s = slug.toLowerCase();
  return PARTNER_ALIASES[s] ?? (/^[a-z]{2,16}20$/.test(s) ? s.toUpperCase() : s.toUpperCase());
}

async function stripeData() {
  const since90 = Math.floor(Date.now() / 1000) - 90 * 86400;
  const [subsR, invR, promoR] = await Promise.all([
    stripe("subscriptions?status=all&limit=100&expand[]=data.discounts", "GET"),
    stripe(`invoices?status=paid&limit=100&created[gte]=${since90}&expand[]=data.discounts`, "GET"),
    stripe("promotion_codes?limit=100", "GET"),
  ]);
  if (!subsR.ok && !invR.ok) return { ok: false, error: str((subsR.data.error as J | undefined)?.message) || `HTTP ${subsR.status}` };

  const promos = arr(promoR.data.data).map((p) => ({
    id: str(p.id),
    code: str(p.code),
    active: !!p.active,
    redeemed: num(p.times_redeemed),
    created: num(p.created),
  }));
  const codeOfPromo = new Map(promos.map((p) => [p.id, p.code]));
  const promoCodeOf = (discounts: unknown): string => {
    for (const d of arr(discounts)) {
      const pc = d.promotion_code;
      const id = typeof pc === "string" ? pc : str((pc as J | undefined)?.id);
      if (id && codeOfPromo.has(id)) return codeOfPromo.get(id) as string;
    }
    return "";
  };

  const subs = arr(subsR.data.data).map((s) => {
    const item = arr((s.items as J | undefined)?.data)[0] || {};
    const price = (item.price as J | undefined) || {};
    const rec = (price.recurring as J | undefined) || {};
    const interval = str(rec.interval);
    const amount = num(price.unit_amount) / 100;
    let pct = 0;
    for (const d of arr(s.discounts)) pct = Math.max(pct, num(((d.coupon as J | undefined) || {}).percent_off));
    const monthly = (interval === "year" ? amount / 12 : amount) * (1 - pct / 100);
    return {
      id: str(s.id),
      status: str(s.status),
      interval,
      amount,
      discountPct: pct,
      mrr: Math.round(monthly * 100) / 100,
      code: promoCodeOf(s.discounts),
      created: num(s.created),
      cancelAtPeriodEnd: !!s.cancel_at_period_end,
      periodEnd: num((item as J).current_period_end) || num(s.current_period_end),
      trialEnd: num(s.trial_end),
    };
  });

  const invoices = arr(invR.data.data)
    .filter((i) => num(i.amount_paid) > 0)
    .map((i) => ({ amount: num(i.amount_paid) / 100, created: num(i.created), code: promoCodeOf(i.discounts) }));

  const now = Date.now() / 1000;
  const sum = (from: number) => invoices.filter((i) => i.created >= from).reduce((a, i) => a + i.amount, 0);
  const revenue = { d30: sum(now - 30 * 86400), d90: sum(now - 90 * 86400) };
  const byCode: Record<string, number> = {};
  for (const i of invoices) if (i.code) byCode[i.code] = (byCode[i.code] || 0) + i.amount;

  const live = subs.filter((s) => s.status === "active" || s.status === "trialing" || s.status === "past_due");
  return {
    ok: true,
    active: subs.filter((s) => s.status === "active").length,
    trialing: subs.filter((s) => s.status === "trialing").length,
    pastDue: subs.filter((s) => s.status === "past_due").length,
    canceled: subs.filter((s) => s.status === "canceled").length,
    cancelingSoon: live.filter((s) => s.cancelAtPeriodEnd).length,
    mrr: Math.round(live.filter((s) => s.status !== "trialing").reduce((a, s) => a + s.mrr, 0) * 100) / 100,
    revenue,
    revenueByCode: byCode,
    subs: subs.slice(0, 40),
    promos,
  };
}

async function socialData() {
  const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Zurich" });
  const mag = MAG_ALL.map((a) => ({ date: a.date, title: a.fr.title, slug: a.fr.slug, cat: a.cat, social: !!a.fr.social }));
  const upcoming = mag.filter((a) => a.date > today).sort((a, b) => (a.date < b.date ? -1 : 1));
  const recent = mag.filter((a) => a.date <= today).slice(0, 6);
  let meta: J | null = null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const r = await fetch("https://sporadex.ch/api/cron/social?check=1", { cache: "no-store", signal: ctrl.signal });
    clearTimeout(t);
    meta = (await r.json()) as J;
  } catch { meta = null; }
  const cal = (meta?.comptes as J | undefined)?.calorio as J | undefined;
  return {
    meta: meta ? { ok: !!meta.ok && !cal?.erreur, page: str(cal?.page), instagram: str(cal?.instagram), error: str(cal?.erreur) } : null,
    upcoming: upcoming.slice(0, 6),
    recent,
    totalArticles: mag.filter((a) => a.date <= today).length,
  };
}

export async function GET(req: Request) {
  const u = await authUser(req);
  if (!u) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (u.email.toLowerCase() !== ADMIN_EMAIL) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!svcKey()) return NextResponse.json({ error: "not_configured" }, { status: 503 });

  const includeInternal = new URL(req.url).searchParams.get("internal") === "1";
  const since90 = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);

  const [dashR, clicks, prospects, comp, st, social] = await Promise.all([
    fetch(`${SB_URL}/rest/v1/rpc/calorio_dashboard`, { method: "POST", headers: svcHeaders(), body: JSON.stringify({ p_include_internal: includeInternal }), cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<J>) : null))
      .catch(() => null),
    sbGet(`page_stats?select=day,path,country,views&path=like./p/*&day=gte.${since90}&order=day.asc&limit=5000`),
    sbGet("calorio_partner_prospects?select=handle,platform,display_name,followers,status,proposed_code,channel,updated_at&order=updated_at.desc&limit=200"),
    sbGet("calorio_comp_emails?select=email,note,created_at&order=created_at.desc&limit=50"),
    stripeData().catch((e) => ({ ok: false, error: String(e) })),
    socialData().catch(() => null),
  ]);

  // Liens partenaires : clics par lien, par jour et par pays.
  const links: Record<string, { slug: string; code: string; clicks: number; d7: number; countries: Record<string, number>; daily: Record<string, number> }> = {};
  const d7 = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  for (const c of clicks) {
    const slug = str(c.path).replace(/^\/p\//, "");
    if (!slug) continue;
    const l = (links[slug] ||= { slug, code: codeForSlug(slug), clicks: 0, d7: 0, countries: {}, daily: {} });
    const v = num(c.views);
    l.clicks += v;
    if (str(c.day) >= d7) l.d7 += v;
    l.countries[str(c.country) || "XX"] = (l.countries[str(c.country) || "XX"] || 0) + v;
    l.daily[str(c.day)] = (l.daily[str(c.day)] || 0) + v;
  }

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      dash: dashR,
      partners: { links: Object.values(links).sort((a, b) => b.clicks - a.clicks), prospects, comp },
      stripe: st,
      social,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
