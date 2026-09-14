import webpush from "web-push";
import { pickPush, type PushType } from "@/lib/pushMessages";
import { VAPID_PUBLIC_KEY } from "@/lib/vapid";

// Cron d'envoi des notifications calorio Pro (rappels repas + encouragements).
// Sécurisé par CRON_SECRET (en-tête Authorization: Bearer <secret> ajouté par Vercel Cron).
// N'envoie un rappel repas QUE si rien n'a été noté aujourd'hui. Encouragement tous les 3 jours.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Sub = { user_id: string; endpoint: string; p256dh: string; auth: string; lang: string; last_encour: string | null };

function swissDay(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Zurich" }).format(d); // YYYY-MM-DD
}
function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const url = new URL(req.url);
  const auth = req.headers.get("authorization");
  const ok = (secret && auth === `Bearer ${secret}`) || (secret && url.searchParams.get("secret") === secret);
  if (secret && !ok) return new Response("unauthorized", { status: 401 });

  const job = (url.searchParams.get("job") || "lunch") as PushType;
  if (job !== "lunch" && job !== "dinner" && job !== "encourage") {
    return new Response(JSON.stringify({ error: "bad_job" }), { status: 400 });
  }

  const SB = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const VPUB = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY;
  const VPRIV = process.env.VAPID_PRIVATE_KEY;
  const VSUB = process.env.VAPID_SUBJECT || "mailto:contact@outils.ch";
  if (!SB || !KEY || !VPUB || !VPRIV) {
    return Response.json(
      { error: "not_configured", missing: { SUPABASE_URL: !SB, SERVICE_ROLE_KEY: !KEY, VAPID_PUBLIC: !VPUB, VAPID_PRIVATE: !VPRIV } },
      { status: 503 }
    );
  }
  webpush.setVapidDetails(VSUB, VPUB, VPRIV);

  const h = { apikey: KEY, authorization: `Bearer ${KEY}`, "content-type": "application/json" };
  const rest = async (path: string, init?: RequestInit) => fetch(`${SB}/rest/v1/${path}`, { ...init, headers: { ...h, ...(init?.headers || {}) } });

  // 1) abonnements actifs
  const subsRes = await rest("calorio_push?enabled=eq.true&select=user_id,endpoint,p256dh,auth,lang,last_encour");
  if (!subsRes.ok) return new Response(JSON.stringify({ error: "subs_fetch", detail: (await subsRes.text()).slice(0, 200) }), { status: 502 });
  const subs = (await subsRes.json()) as Sub[];
  if (subs.length === 0) return Response.json({ job, sent: 0, note: "no subscribers" });

  // 2) statut Pro (is_pro + pro_until)
  const proRes = await rest("calorio_pro?is_pro=eq.true&select=id,pro_until");
  const proRows = proRes.ok ? ((await proRes.json()) as { id: string; pro_until: string | null }[]) : [];
  const now = Date.now();
  const proSet = new Set(proRows.filter((p) => !p.pro_until || Date.parse(p.pro_until) > now).map((p) => p.id));

  let targets = subs.filter((s) => proSet.has(s.user_id));
  const today = swissDay();

  // 3) rappels repas : uniquement si rien n'a été noté aujourd'hui
  if (job === "lunch" || job === "dinner") {
    const ids = targets.map((s) => s.user_id);
    if (ids.length === 0) return Response.json({ job, sent: 0, note: "no pro subscribers" });
    const inList = `(${ids.map((i) => `"${i}"`).join(",")})`;
    const uRes = await rest(`calorio_users?select=id,journal&id=in.${encodeURIComponent(inList)}`);
    const users = uRes.ok ? ((await uRes.json()) as { id: string; journal: Record<string, unknown[]> | null }[]) : [];
    const loggedToday = new Set(
      users
        .filter((u) => Array.isArray(u.journal?.[today]) && (u.journal![today] as unknown[]).length > 0)
        .map((u) => u.id)
    );
    targets = targets.filter((s) => !loggedToday.has(s.user_id)); // rien noté → on rappelle
  } else {
    // 4) encouragement : au plus une fois tous les 3 jours
    targets = targets.filter((s) => !s.last_encour || daysBetween(s.last_encour, today) >= 3);
  }

  let sent = 0;
  const toDrop: string[] = [];
  const encouraged: string[] = [];
  await Promise.all(
    targets.map(async (s) => {
      const v = pickPush(s.lang, job);
      const payload = JSON.stringify({ title: v.title, body: v.body, url: "/", tag: `calorio-${job}` });
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
        sent++;
        if (job === "encourage") encouraged.push(s.user_id);
      } catch (e: unknown) {
        const code = (e as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) toDrop.push(s.user_id); // abonnement expiré
      }
    })
  );

  // maj / nettoyage
  if (encouraged.length) {
    const inList = `(${encouraged.map((i) => `"${i}"`).join(",")})`;
    await rest(`calorio_push?user_id=in.${encodeURIComponent(inList)}`, { method: "PATCH", body: JSON.stringify({ last_encour: today }) });
  }
  if (toDrop.length) {
    const inList = `(${toDrop.map((i) => `"${i}"`).join(",")})`;
    await rest(`calorio_push?user_id=in.${encodeURIComponent(inList)}`, { method: "DELETE" });
  }

  return Response.json({ job, day: today, candidates: targets.length, sent, dropped: toDrop.length });
}
