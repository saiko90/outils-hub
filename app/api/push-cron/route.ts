import webpush from "web-push";
import { pickPush, buildStreak, buildRecap, type PushType } from "@/lib/pushMessages";
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
type JLine = { food?: { kcal?: number }; grammes?: number };
function dayKcal(rows: unknown): number {
  if (!Array.isArray(rows)) return 0;
  let k = 0;
  for (const r of rows as JLine[]) {
    if (r && r.food && typeof r.food.kcal === "number" && typeof r.grammes === "number") k += (r.food.kcal * r.grammes) / 100;
  }
  return k;
}
// Série en cours : nombre de jours consécutifs AVANT aujourd'hui avec au moins un aliment noté.
function streakBefore(journal: Record<string, unknown[]> | null): number {
  if (!journal) return 0;
  let n = 0;
  for (let i = 1; i <= 90; i++) {
    const rows = journal[swissDay(-i)];
    if (Array.isArray(rows) && rows.length > 0) n++;
    else break;
  }
  return n;
}

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const url = new URL(req.url);
  const auth = req.headers.get("authorization");
  const ok = (secret && auth === `Bearer ${secret}`) || (secret && url.searchParams.get("secret") === secret);
  if (secret && !ok) return new Response("unauthorized", { status: 401 });

  const job = (url.searchParams.get("job") || "lunch") as PushType | "recap";
  if (job !== "lunch" && job !== "dinner" && job !== "encourage" && job !== "recap") {
    return new Response(JSON.stringify({ error: "bad_job" }), { status: 400 });
  }

  const SB = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://srcvnqfgtazupuzwznrr.supabase.co";
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
  const streakOf: Record<string, number> = {}; // user_id → série en cours (pour les rappels du soir)

  // ── Bilan hebdo (dimanche) : résumé chiffré de la semaine, aux utilisateurs actifs ──
  if (job === "recap") {
    const ids = targets.map((s) => s.user_id);
    if (ids.length === 0) return Response.json({ job, sent: 0, note: "no pro subscribers" });
    const inList = `(${ids.map((i) => `"${i}"`).join(",")})`;
    const uRes = await rest(`calorio_users?select=id,journal,pesees&id=in.${encodeURIComponent(inList)}`);
    const users = uRes.ok ? ((await uRes.json()) as { id: string; journal: Record<string, unknown[]> | null; pesees: { date: string; poids: number }[] | null }[]) : [];
    const stats = new Map(users.map((u) => [u.id, u]));
    let sentR = 0;
    const dropR: string[] = [];
    const last7 = Array.from({ length: 7 }, (_, i) => swissDay(-1 - i)); // 7 derniers jours (hors aujourd'hui)
    await Promise.all(
      targets.map(async (s) => {
        const u = stats.get(s.user_id);
        const j = u?.journal || {};
        const kcals = last7.map((d) => dayKcal(j[d])).filter((k) => k > 0);
        const days = kcals.length;
        if (days < 1) return; // inactif cette semaine → pas de bilan
        const avg = kcals.reduce((a, b) => a + b, 0) / days;
        let wDelta: number | null = null;
        const pes = (u?.pesees || []).slice().sort((a, b) => a.date.localeCompare(b.date));
        if (pes.length >= 2) {
          const limit = swissDay(-7);
          const base = pes.filter((p) => p.date >= limit)[0] ?? pes[0];
          wDelta = Math.round((pes[pes.length - 1].poids - base.poids) * 10) / 10;
        }
        const v = buildRecap(s.lang, days, avg, wDelta);
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify({ title: v.title, body: v.body, url: "/", tag: "calorio-recap" }));
          sentR++;
        } catch (e: unknown) {
          const code = (e as { statusCode?: number })?.statusCode;
          if (code === 404 || code === 410) dropR.push(s.user_id);
        }
      })
    );
    if (dropR.length) {
      const dl = `(${dropR.map((i) => `"${i}"`).join(",")})`;
      await rest(`calorio_push?user_id=in.${encodeURIComponent(dl)}`, { method: "DELETE" });
    }
    return Response.json({ job, day: today, sent: sentR, dropped: dropR.length });
  }

  // 3) rappels repas : uniquement si rien n'a été noté aujourd'hui
  if (job === "lunch" || job === "dinner") {
    const ids = targets.map((s) => s.user_id);
    if (ids.length === 0) return Response.json({ job, sent: 0, note: "no pro subscribers" });
    const inList = `(${ids.map((i) => `"${i}"`).join(",")})`;
    const uRes = await rest(`calorio_users?select=id,journal&id=in.${encodeURIComponent(inList)}`);
    const users = uRes.ok ? ((await uRes.json()) as { id: string; journal: Record<string, unknown[]> | null }[]) : [];
    const jById = new Map(users.map((u) => [u.id, u.journal]));
    const loggedToday = new Set(
      users
        .filter((u) => Array.isArray(u.journal?.[today]) && (u.journal![today] as unknown[]).length > 0)
        .map((u) => u.id)
    );
    targets = targets.filter((s) => !loggedToday.has(s.user_id)); // rien noté → on rappelle
    // Le soir : si une série est en cours, on passe un message « série en jeu » (bien plus motivant).
    if (job === "dinner") for (const s of targets) streakOf[s.user_id] = streakBefore(jById.get(s.user_id) || null);
  } else {
    // 4) encouragement : au plus une fois tous les 3 jours
    targets = targets.filter((s) => !s.last_encour || daysBetween(s.last_encour, today) >= 3);
  }

  let sent = 0;
  let streaksSent = 0;
  const toDrop: string[] = [];
  const encouraged: string[] = [];
  await Promise.all(
    targets.map(async (s) => {
      const n = streakOf[s.user_id] || 0;
      const useStreak = job === "dinner" && n >= 2;
      const v = useStreak ? buildStreak(s.lang, n) : pickPush(s.lang, job as PushType);
      const payload = JSON.stringify({ title: v.title, body: v.body, url: "/", tag: useStreak ? "calorio-streak" : `calorio-${job}` });
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
        sent++;
        if (useStreak) streaksSent++;
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

  return Response.json({ job, day: today, candidates: targets.length, sent, streaks: streaksSent, dropped: toDrop.length });
}
