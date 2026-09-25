import webpush from "web-push";
import { pickPush, buildStreak, buildRecap, buildRemaining, type PushType } from "@/lib/pushMessages";
import { cibleFromProfil } from "@/lib/duo";
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
  // Fermé par défaut : sans secret configuré, personne ne déclenche d'envoi. Secret uniquement en en-tête
  // (jamais dans l'URL, qui finit dans les journaux).
  const secret = process.env.CRON_SECRET;
  const url = new URL(req.url);
  const auth = req.headers.get("authorization");
  if (!secret) return new Response("not_configured", { status: 503 });
  if (auth !== `Bearer ${secret}`) return new Response("unauthorized", { status: 401 });

  // Heure suisse garantie malgré les changements d'heure : le planificateur (UTC) appelle deux fois
  // (été + hiver) avec ?hour=HH et seul l'appel qui tombe à HH heure de Zurich envoie.
  // Fenêtre de 2 h pour absorber les retards du planificateur ; le doublon est évité par push_runs.
  const wantHour = url.searchParams.get("hour");
  if (wantHour !== null) {
    const zh = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Zurich", hour: "2-digit", hourCycle: "h23" }).format(new Date()));
    const w = Number(wantHour);
    if (!(zh >= w && zh < w + 2)) return Response.json({ skipped: "hour", zurichHour: zh, wanted: w });
  }

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

  // Une seule exécution par tâche et par jour (heure suisse), même si le cron est appelé deux fois.
  if (wantHour !== null) {
    const claim = await rest("push_runs?on_conflict=job,day", {
      method: "POST",
      headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
      body: JSON.stringify({ job, day: swissDay() }),
    });
    const rows = claim.ok ? ((await claim.json()) as unknown[]) : [];
    if (claim.ok && rows.length === 0) return Response.json({ job, skipped: "already_ran", day: swissDay() });
  }
  // Lecture des comptes par lots de 100 (évite des URL géantes quand les abonnés se comptent en milliers).
  const usersByIds = async <T,>(cols: string, ids: string[]): Promise<T[]> => {
    const uniq = Array.from(new Set(ids));
    const out: T[] = [];
    for (let i = 0; i < uniq.length; i += 100) {
      const part = uniq.slice(i, i + 100);
      const inList = `(${part.map((x) => `"${x}"`).join(",")})`;
      const r = await rest(`calorio_users?select=${cols}&id=in.${encodeURIComponent(inList)}`);
      if (r.ok) out.push(...((await r.json()) as T[]));
    }
    return out;
  };
  // Suppression des abonnements expirés (par appareil).
  const dropEndpoints = async (endpoints: string[]) => {
    for (const e of Array.from(new Set(endpoints))) await rest(`calorio_push?endpoint=eq.${encodeURIComponent(e)}`, { method: "DELETE" });
  };

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

  // Rappels de base (midi, soir, encouragement) → TOUS les abonnés (rétention des gratuits).
  // Le rappel personnalisé « calories restantes » (avec Vito) et le bilan hebdo restent réservés au Pro.
  let targets = subs;
  const today = swissDay();
  const streakOf: Record<string, number> = {}; // user_id → série en cours (pour les rappels du soir)
  const remainingOf: Record<string, number> = {}; // user_id → kcal restantes (rappel perso du soir)

  // ── Bilan hebdo (dimanche) : résumé chiffré de la semaine, aux utilisateurs actifs ──
  if (job === "recap") {
    targets = targets.filter((s) => proSet.has(s.user_id)); // bilan hebdo = Pro
    const ids = targets.map((s) => s.user_id);
    if (ids.length === 0) return Response.json({ job, sent: 0, note: "no pro subscribers" });
    const users = await usersByIds<{ id: string; journal: Record<string, unknown[]> | null; pesees: { date: string; poids: number }[] | null }>("id,journal,pesees", ids);
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
          if (code === 404 || code === 410) dropR.push(s.endpoint);
        }
      })
    );
    if (dropR.length) await dropEndpoints(dropR);
    return Response.json({ job, day: today, sent: sentR, dropped: dropR.length });
  }

  // 3) rappels repas
  if (job === "lunch" || job === "dinner") {
    const ids = targets.map((s) => s.user_id);
    if (ids.length === 0) return Response.json({ job, sent: 0, note: "no subscribers" });
    // Le soir on lit aussi le profil pour un rappel personnalisé (calories restantes).
    const cols = job === "dinner" ? "id,journal,profil" : "id,journal";
    const users = await usersByIds<{ id: string; journal: Record<string, unknown[]> | null; profil?: unknown }>(cols, ids);
    const jById = new Map(users.map((u) => [u.id, u.journal]));
    const pById = new Map(users.map((u) => [u.id, u.profil]));
    const loggedToday = new Set(
      users
        .filter((u) => Array.isArray(u.journal?.[today]) && (u.journal![today] as unknown[]).length > 0)
        .map((u) => u.id)
    );
    if (job === "lunch") {
      // Midi : rappel uniquement si rien n'a été noté aujourd'hui.
      targets = targets.filter((s) => !loggedToday.has(s.user_id));
    } else {
      // Soir : deux cas —
      //  A) rien noté → rappel générique, ou « série en jeu » si une série est en cours ;
      //  B) déjà noté mais il reste ≥ 400 kcal → rappel personnalisé « il te reste ~X kcal ».
      const keep: typeof targets = [];
      for (const s of targets) {
        if (!loggedToday.has(s.user_id)) {
          streakOf[s.user_id] = streakBefore(jById.get(s.user_id) || null);
          keep.push(s);
        } else {
          if (!proSet.has(s.user_id)) continue; // rappel « calories restantes » (suggestion Vito) = Pro
          const cible = cibleFromProfil(pById.get(s.user_id));
          if (cible == null) continue; // pas de profil exploitable → on ne dérange pas
          const consumed = dayKcal(jById.get(s.user_id)?.[today]);
          const remaining = cible - consumed;
          if (remaining >= 400) { remainingOf[s.user_id] = remaining; keep.push(s); }
        }
      }
      targets = keep;
    }
  } else {
    // 4) encouragement : au plus une fois tous les 3 jours
    targets = targets.filter((s) => !s.last_encour || daysBetween(s.last_encour, today) >= 3);
  }

  let sent = 0;
  let streaksSent = 0;
  let remindersSent = 0;
  const toDrop: string[] = [];
  const encouraged: string[] = [];
  await Promise.all(
    targets.map(async (s) => {
      const n = streakOf[s.user_id] || 0;
      const rem = remainingOf[s.user_id];
      const usePerso = job === "dinner" && typeof rem === "number";
      const useStreak = job === "dinner" && !usePerso && n >= 2;
      const v = usePerso ? buildRemaining(s.lang, rem) : useStreak ? buildStreak(s.lang, n) : pickPush(s.lang, job as PushType);
      const tag = usePerso ? "calorio-remaining" : useStreak ? "calorio-streak" : `calorio-${job}`;
      const payload = JSON.stringify({ title: v.title, body: v.body, url: "/", tag });
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
        sent++;
        if (useStreak) streaksSent++;
        if (usePerso) remindersSent++;
        if (job === "encourage") encouraged.push(s.user_id);
      } catch (e: unknown) {
        const code = (e as { statusCode?: number })?.statusCode;
        if (code === 404 || code === 410) toDrop.push(s.endpoint); // abonnement expiré (cet appareil)
      }
    })
  );

  // maj / nettoyage
  if (encouraged.length) {
    const inList = `(${Array.from(new Set(encouraged)).map((i) => `"${i}"`).join(",")})`;
    await rest(`calorio_push?user_id=in.${encodeURIComponent(inList)}`, { method: "PATCH", body: JSON.stringify({ last_encour: today }) });
  }
  if (toDrop.length) await dropEndpoints(toDrop);

  return Response.json({ job, day: today, candidates: targets.length, sent, streaks: streaksSent, remaining: remindersSent, dropped: toDrop.length });
}
