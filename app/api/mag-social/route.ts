import { GRAPH, alreadyPosted, captionKey, inWindow, magForDay, postImageUrls, todayZurich } from "@/lib/magSocial";
import type { MagArticle } from "@/lib/mag";

// Publication automatique du Mag calorio sur Facebook (page Calorio) et Instagram (calorio_app).
// Appelée par GitHub Actions (.github/workflows/calorio-mag-social.yml) chaque soir vers 18h30 heure suisse.
// - Sécurisé par CRON_SECRET (en-tête Authorization: Bearer <secret>), comme /api/push-cron.
// - Publie uniquement les articles datés du jour (heure de Zurich), avec la légende `fr.social`.
// - Anti-doublon sans base de données : on relit les dernières publications avant de publier.
// - ?check=1 (sans secret) : vérifie seulement la connexion à Meta, ne publie rien, n'expose aucun secret.
// Aucune publicité, aucun boost : uniquement des publications organiques.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type GraphErr = { error?: { message?: string; code?: number; error_subcode?: number } };

async function graph<T>(path: string, token: string, form?: Record<string, string>): Promise<T> {
  const init: RequestInit = { headers: { authorization: `Bearer ${token}` }, cache: "no-store" };
  if (form) {
    init.method = "POST";
    init.body = new URLSearchParams(form);
  }
  const r = await fetch(`${GRAPH}/${path}`, init);
  const j = (await r.json().catch(() => ({}))) as T & GraphErr;
  if (!r.ok || j.error) {
    const e = j.error || {};
    throw new Error(`graph ${path.split("?")[0]}: ${e.message || r.status}${e.code ? ` (code ${e.code}${e.error_subcode ? `/${e.error_subcode}` : ""})` : ""}`);
  }
  return j;
}

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function postFacebook(a: MagArticle, pageId: string, token: string) {
  const caption = a.fr.social!.trim();
  const recent = await graph<{ data?: { message?: string }[] }>(`${pageId}/published_posts?fields=message&limit=15`, token);
  if (alreadyPosted(captionKey(caption), (recent.data || []).map((p) => p.message))) return { skipped: "already_posted" };
  // Déjà programmée à la main (Meta Business Suite) ? On ne la publie pas une deuxième fois.
  const planned = await graph<{ data?: { message?: string }[] }>(`${pageId}/scheduled_posts?fields=message&limit=25`, token).catch(() => ({ data: [] }));
  if (alreadyPosted(captionKey(caption), (planned.data || []).map((p) => p.message))) return { skipped: "already_scheduled" };
  const r = await graph<{ id?: string; post_id?: string }>(`${pageId}/photos`, token, {
    url: postImageUrls(a).png,
    message: caption,
    published: "true",
  });
  return { posted: r.post_id || r.id };
}

async function postInstagram(a: MagArticle, igId: string, token: string) {
  const caption = a.fr.social!.trim();
  const recent = await graph<{ data?: { caption?: string }[] }>(`${igId}/media?fields=caption&limit=15`, token);
  if (alreadyPosted(captionKey(caption), (recent.data || []).map((m) => m.caption))) return { skipped: "already_posted" };
  const c = await graph<{ id: string }>(`${igId}/media`, token, { image_url: postImageUrls(a).jpg, caption });
  // Le conteneur doit être prêt (FINISHED) avant la publication : on attend jusqu'à ~40 s.
  for (let i = 0; i < 10; i++) {
    const s = await graph<{ status_code?: string }>(`${c.id}?fields=status_code`, token);
    if (s.status_code === "FINISHED") break;
    if (s.status_code === "ERROR" || s.status_code === "EXPIRED") throw new Error(`instagram container ${s.status_code}`);
    await sleep(4000);
  }
  const p = await graph<{ id: string }>(`${igId}/media_publish`, token, { creation_id: c.id });
  return { posted: p.id };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pageId = process.env.META_PAGE_ID;
  const igId = process.env.META_IG_USER_ID;
  const token = process.env.META_PAGE_TOKEN;
  const missing = { META_PAGE_ID: !pageId, META_IG_USER_ID: !igId, META_PAGE_TOKEN: !token };

  // Vérification de la connexion (lecture seule, sans secret) : noms publics de la page et du compte Instagram.
  if (url.searchParams.get("check") === "1") {
    if (!pageId || !igId || !token) return Response.json({ ok: false, missing }, { status: 503 });
    try {
      const me = await graph<{ id: string; name: string }>("me?fields=id,name", token);
      const ig = await graph<{ username?: string }>(`${igId}?fields=username`, token);
      const day = todayZurich();
      return Response.json({
        ok: me.id === pageId,
        page: me.name,
        pageTokenMatchesPage: me.id === pageId,
        instagram: ig.username || null,
        today: day,
        articlesToday: magForDay(day).map((a) => a.id),
      });
    } catch (e) {
      return Response.json({ ok: false, error: (e as Error).message }, { status: 502 });
    }
  }

  const secret = process.env.CRON_SECRET;
  if (!secret) return new Response("not_configured", { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) return new Response("unauthorized", { status: 401 });
  if (!pageId || !igId || !token) return Response.json({ error: "not_configured", missing }, { status: 503 });

  const wantHour = url.searchParams.get("hour");
  if (wantHour !== null && !inWindow(Number(wantHour))) return Response.json({ skipped: "hour", wanted: Number(wantHour) });

  // Rattrapage manuel possible (?date=AAAA-MM-JJ), jamais pour une date future.
  const today = todayZurich();
  const q = url.searchParams.get("date");
  const day = q && /^\d{4}-\d{2}-\d{2}$/.test(q) && q <= today ? q : today;
  const articles = magForDay(day);
  if (articles.length === 0) return Response.json({ day, note: "no_article" });

  const results: Record<string, unknown>[] = [];
  let failed = false;
  for (const a of articles) {
    const res: Record<string, unknown> = { id: a.id };
    for (const [net, fn] of [["facebook", () => postFacebook(a, pageId, token)], ["instagram", () => postInstagram(a, igId, token)]] as const) {
      try {
        res[net] = await fn();
      } catch (e) {
        failed = true;
        res[net] = { error: (e as Error).message };
      }
    }
    results.push(res);
  }
  return Response.json({ day, results }, { status: failed ? 502 : 200 });
}
