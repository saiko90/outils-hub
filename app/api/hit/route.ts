import { NextResponse } from "next/server";

// Analytics first-party, sans cookie. Reçoit un ping de page vue, l'agrège dans Supabase
// via la RPC track_view (SECURITY DEFINER). Aucune donnée perso : pas d'IP stockée,
// pas d'identifiant visiteur. Le pays vient du header géo de Vercel (grossier, 2 lettres).
export const runtime = "edge";
export const dynamic = "force-dynamic";

// Valeurs PUBLIQUES par conception (la table est protégée par RLS ; la RPC n'incrémente qu'un compteur).
const SB_URL = "https://srcvnqfgtazupuzwznrr.supabase.co";
const SB_ANON = "sb_publishable_YUwom0kvnMbpn8Rpug1FaA_1H35zkY_";

const BOT = /bot|crawl|spider|slurp|bing|googlebot|facebookexternalhit|embedly|preview|headless|lighthouse|pingdom|monitor|curl|wget|python-requests|axios|node-fetch/i;

function ok() {
  return new NextResponse(null, { status: 204 });
}

export async function POST(req: Request) {
  try {
    const ua = req.headers.get("user-agent") || "";
    if (BOT.test(ua)) return ok();

    const body = (await req.json().catch(() => ({}))) as { p?: unknown; ref?: unknown };
    let path = typeof body.p === "string" ? body.p : "/";
    if (!path.startsWith("/")) path = "/" + path;
    path = path.split("?")[0].split("#")[0].slice(0, 200) || "/";
    if (path.startsWith("/admin") || path.startsWith("/api")) return ok();

    const country = (req.headers.get("x-vercel-ip-country") || "XX").slice(0, 2);
    const ref = (typeof body.ref === "string" ? body.ref : "").toLowerCase().slice(0, 100);
    // Domaine du visiteur (calorio.ch vs outils.ch) : le beacon est same-origin, donc
    // l'en-tête Host = le site visité. On normalise (minuscules, sans port ni "www.").
    const host = (req.headers.get("host") || "").toLowerCase().split(":")[0].replace(/^www\./, "").slice(0, 64);

    await fetch(`${SB_URL}/rest/v1/rpc/track_view`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        apikey: SB_ANON,
        authorization: `Bearer ${SB_ANON}`,
      },
      body: JSON.stringify({ p_path: path, p_country: country, p_ref: ref, p_host: host }),
    }).catch(() => {});

    return ok();
  } catch {
    return ok();
  }
}
