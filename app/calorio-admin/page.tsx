"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, ADMIN_EMAIL } from "@/lib/supabase";

// Tableau de bord privé calorio : calorio.ch/admin. Données en direct via /api/calorio-admin (réservé à ADMIN_EMAIL).

type J = Record<string, unknown>;
type Pt = { d: string; v: number };
type Phase = "loading" | "anon" | "denied" | "admin";

const arr = <T = J,>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);
const num = (v: unknown) => (typeof v === "number" ? v : 0);
const obj = (v: unknown) => (v && typeof v === "object" && !Array.isArray(v) ? (v as J) : {});
const nf = (n: number, d = 0) => new Intl.NumberFormat("fr-CH", { maximumFractionDigits: d, minimumFractionDigits: d }).format(n);
const chf = (n: number) => `CHF ${nf(n, 2)}`;
const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);
const dShort = (iso: string) => { const [, m, d] = iso.split("-"); return `${Number(d)}.${Number(m)}`; };
const FLAGS: Record<string, string> = { CH: "🇨🇭", FR: "🇫🇷", DE: "🇩🇪", BE: "🇧🇪", IT: "🇮🇹", US: "🇺🇸", AT: "🇦🇹", CA: "🇨🇦", GB: "🇬🇧", ES: "🇪🇸", PT: "🇵🇹", NL: "🇳🇱", LU: "🇱🇺", MA: "🇲🇦" };
const flag = (c: string) => FLAGS[c] || "🌍";

function sumLast(pts: Pt[], n: number, offset = 0) {
  return pts.slice(Math.max(0, pts.length - n - offset), pts.length - offset).reduce((a, p) => a + p.v, 0);
}
function Delta({ now, prev }: { now: number; prev: number }) {
  if (!prev && !now) return <span className="ca-delta">—</span>;
  if (!prev) return <span className="ca-delta up">nouveau</span>;
  const p = Math.round(((now - prev) / prev) * 100);
  return <span className={`ca-delta ${p >= 0 ? "up" : "down"}`}>{p >= 0 ? "▲" : "▼"} {Math.abs(p)} %</span>;
}

function Bars({ pts, height = 120, unit = "", accent = "var(--ca-green)" }: { pts: Pt[]; height?: number; unit?: string; accent?: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...pts.map((p) => p.v));
  const w = 100 / Math.max(1, pts.length);
  const h = hover !== null ? pts[hover] : null;
  return (
    <div className="ca-chart">
      <div className="ca-chart-tip">{h ? <><b>{nf(h.v)}{unit}</b> · {dShort(h.d)}</> : <span>max {nf(max)}{unit}</span>}</div>
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" style={{ height }} onMouseLeave={() => setHover(null)}>
        {pts.map((p, i) => {
          const bh = (p.v / max) * (height - 4);
          return (
            <g key={p.d} onMouseEnter={() => setHover(i)} onTouchStart={() => setHover(i)}>
              <rect x={i * w} y={0} width={w} height={height} fill="transparent" />
              <rect x={i * w + w * 0.14} y={height - bh} width={w * 0.72} height={Math.max(bh, p.v > 0 ? 1.5 : 0)} rx={0.6}
                fill={hover === i ? "var(--ca-ink)" : accent} opacity={hover === null || hover === i ? 1 : 0.55} />
            </g>
          );
        })}
      </svg>
      <div className="ca-chart-x"><span>{pts[0] ? dShort(pts[0].d) : ""}</span><span>{pts.length ? dShort(pts[pts.length - 1].d) : ""}</span></div>
    </div>
  );
}

function HBars({ rows, unit = "" }: { rows: { label: string; v: number; sub?: string }[]; unit?: string }) {
  const max = Math.max(1, ...rows.map((r) => r.v));
  if (!rows.length) return <p className="ca-empty">Rien pour l&apos;instant.</p>;
  return (
    <ul className="ca-hbars">
      {rows.map((r) => (
        <li key={r.label}>
          <span className="ca-hb-l" title={r.label}>{r.label}{r.sub && <small> {r.sub}</small>}</span>
          <span className="ca-hb-t"><i style={{ width: `${(r.v / max) * 100}%` }} /></span>
          <b>{nf(r.v)}{unit}</b>
        </li>
      ))}
    </ul>
  );
}

function Kpi({ label, value, sub, delta }: { label: string; value: string; sub?: string; delta?: React.ReactNode }) {
  return (
    <div className="ca-kpi">
      <span className="ca-kpi-l">{label}</span>
      <b className="ca-kpi-v">{value}</b>
      <span className="ca-kpi-s">{delta}{sub && <span>{sub}</span>}</span>
    </div>
  );
}

const SECTIONS = [
  ["apercu", "Aperçu"], ["sante", "Santé"], ["trafic", "Trafic"], ["users", "Utilisateurs"], ["argent", "Argent"], ["partenaires", "Partenaires"], ["reseaux", "Réseaux"],
] as const;

export default function CalorioAdmin() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState<J | null>(null);
  const [busy, setBusy] = useState(false);
  const [range, setRange] = useState(30);
  const [internal, setInternal] = useState(false);
  const [health, setHealth] = useState<J | null>(null);

  useEffect(() => {
    const sb = supabase();
    let alive = true;
    const apply = (s: Session | null) => {
      if (!alive) return;
      setSession(s);
      const em = s?.user?.email?.toLowerCase() || "";
      setPhase(!s ? "anon" : em === ADMIN_EMAIL ? "admin" : "denied");
    };
    sb.auth.getSession().then(({ data: d }) => apply(d.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, s) => apply(s));
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);

  const load = useCallback(async () => {
    if (!session) return;
    setBusy(true); setErr("");
    try {
      const r = await fetch(`/api/calorio-admin${internal ? "?internal=1" : ""}`, { headers: { authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
      if (!r.ok) throw new Error(r.status === 403 ? "Accès refusé." : `Erreur ${r.status}`);
      setData((await r.json()) as J);
    } catch (e) { setErr((e as Error).message); }
    setBusy(false);
  }, [session, internal]);
  useEffect(() => { if (phase === "admin") load(); }, [phase, load]);
  const loadHealth = useCallback(async () => {
    try { const r = await fetch("/api/health", { cache: "no-store" }); setHealth((await r.json()) as J); } catch { setHealth({ ok: false, checks: {} }); }
  }, []);
  useEffect(() => { if (phase === "admin") loadHealth(); }, [phase, loadHealth]);

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault(); setErr("");
    const { error } = await supabase().auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: window.location.origin + "/admin" } });
    if (error) setErr(error.message); else setSent(true);
  };

  const d = obj(data?.dash);
  const traffic = obj(d.traffic), users = obj(d.users), activity = obj(d.activity), coach = obj(d.coach), money = obj(d.money);
  const funnel = obj(d.funnel), features = obj(d.features), growth = obj(d.growth), profiles = obj(d.profiles), android = obj(d.android);
  const st = obj(data?.stripe), social = obj(data?.social), partners = obj(data?.partners);

  const tDaily = arr<Pt>(traffic.daily);
  const sDaily = arr<Pt>(users.signups_daily);
  const aDaily = useMemo(() => arr<{ d: string; users: number; entries: number }>(activity.daily), [activity.daily]);
  const cDaily = arr<Pt>(coach.daily);
  const slice = (pts: Pt[]) => pts.slice(-range);

  const vis7 = sumLast(tDaily, 7), visPrev = sumLast(tDaily, 7, 7);
  const su7 = sumLast(sDaily, 7), suPrev = sumLast(sDaily, 7, 7);
  const payingWeb = num(st.active) + num(st.pastDue);
  const payingPlay = num(money.paying_play);

  if (phase === "loading") return <Shell><p className="ca-muted">Chargement…</p></Shell>;
  if (phase !== "admin") {
    return (
      <Shell>
        <div className="ca-login">
          <h1>calorio · Admin</h1>
          {phase === "denied" ? (
            <>
              <p>Ce compte n&apos;a pas accès au tableau de bord.</p>
              <button className="ca-btn" onClick={() => supabase().auth.signOut()}>Se déconnecter</button>
            </>
          ) : sent ? (
            <p>Lien de connexion envoyé à <b>{email}</b>. Ouvre-le sur cet appareil.</p>
          ) : (
            <form onSubmit={sendLink}>
              <label htmlFor="ca-email">Adresse e-mail</label>
              <input id="ca-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              <button className="ca-btn" type="submit">Recevoir le lien de connexion</button>
              {err && <p className="ca-err">{err}</p>}
            </form>
          )}
        </div>
      </Shell>
    );
  }

  const links = arr<{ slug: string; code: string; clicks: number; d7: number; countries: Record<string, number>; daily: Record<string, number> }>(partners.links);
  const promos = arr<{ code: string; redeemed: number; active: boolean }>(st.promos);
  const revByCode = obj(st.revenueByCode);
  const prospects = arr<J>(partners.prospects);
  const partnersRows = prospects.filter((p) => ["partenaire", "repondu"].includes(String(p.status)));
  const pipe = obj(growth.partners);
  const cohorts = arr<J>(d.cohorts);
  const topFoods = arr<{ f: string; n: number; em?: string }>(activity.top_foods);
  const meals = obj(activity.meals_by_type);
  const featRows = Object.entries(features).filter(([k]) => k !== "trophies_avg").map(([k, v]) => ({ label: FEAT[k] || k, v: num(v) })).sort((a, b) => b.v - a.v);
  const subs = arr<J>(st.subs);
  const meta = obj(social.meta);
  const generated = typeof data?.generatedAt === "string" ? new Date(data.generatedAt as string) : null;

  return (
    <Shell>
      <header className="ca-head">
        <div className="ca-brand"><img src="/calorio-icon-192.png" alt="" width={34} height={34} /><div><b>calorio</b><small>Tableau de bord</small></div></div>
        <div className="ca-tools">
          <label className="ca-check"><input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} /> Inclure comptes internes</label>
          <button className="ca-btn ca-btn-sm" onClick={load} disabled={busy}>{busy ? "…" : "↻ Actualiser"}</button>
        </div>
      </header>
      <nav className="ca-nav" aria-label="Sections">{SECTIONS.map(([id, l]) => <a key={id} href={`#${id}`}>{l}</a>)}</nav>
      {err && <p className="ca-err">{err}</p>}
      {!data && !err && <p className="ca-muted">Chargement des données…</p>}

      {data && (
        <>
          <section id="apercu" className="ca-sec">
            <div className="ca-kpis">
              <Kpi label="Visites · 7 j" value={nf(vis7)} delta={<Delta now={vis7} prev={visPrev} />} sub="vs 7 j préc." />
              <Kpi label="Inscriptions · 7 j" value={nf(su7)} delta={<Delta now={su7} prev={suPrev} />} sub={`${nf(num(users.total))} au total`} />
              <Kpi label="Actifs" value={`${nf(num(activity.dau))} / ${nf(num(activity.wau))} / ${nf(num(activity.mau))}`} sub="jour / semaine / mois" />
              <Kpi label="Repas notés · 7 j" value={nf(num(activity.entries_7d))} delta={<Delta now={num(activity.entries_7d)} prev={num(activity.entries_prev7d)} />} sub={`${nf(num(activity.loggers_7d))} personnes`} />
              <Kpi label="Abonnés Pro payants" value={nf(payingWeb + payingPlay)} sub={`web ${payingWeb} · Play ${payingPlay} · offerts ${num(money.comp)}`} />
              <Kpi label="Revenu mensuel (MRR)" value={chf(num(st.mrr))} sub={`encaissé 30 j : ${chf(num(obj(st.revenue).d30))}`} />
            </div>
            {generated && <p className="ca-muted ca-small">Mis à jour {generated.toLocaleString("fr-CH", { dateStyle: "short", timeStyle: "short" })} · comptes internes {internal ? "inclus" : `exclus (${num(d.internal_accounts)})`}</p>}
          </section>

          <section id="sante" className="ca-sec">
            <div className="ca-sec-h"><h2>Santé des services</h2>
              <button className="ca-btn ca-btn-sm" onClick={loadHealth}>↻ Vérifier</button></div>
            {!health ? <p className="ca-muted">Vérification…</p> : (
              <div className="ca-health">
                {Object.entries(obj(health.checks)).map(([k, v]) => { const c = obj(v); return (
                  <div key={k} className={`ca-hc ${c.ok ? "ok" : "ko"}`}>
                    <span className="ca-dot" aria-hidden />
                    <div><b>{SVC[k] || k}</b><small>{String(c.detail || "")}{c.cached ? " · vérifié il y a moins d'1 h" : ""}</small></div>
                  </div>); })}
              </div>
            )}
            <p className="ca-small ca-muted">Surveillé toutes les 10 minutes. En cas de panne confirmée, une alerte part par e-mail (puis un e-mail « réparé » au retour à la normale).</p>
          </section>

          <section id="trafic" className="ca-sec">
            <div className="ca-sec-h"><h2>Trafic</h2>
              <div className="ca-seg">{[7, 30, 90].map((n) => <button key={n} className={range === n ? "on" : ""} onClick={() => setRange(n)}>{n} j</button>)}</div>
            </div>
            <div className="ca-card"><h3>Pages vues par jour</h3><Bars pts={slice(tDaily)} /></div>
            <div className="ca-grid3">
              <div className="ca-card"><h3>Sources · 30 j</h3><HBars rows={arr<{ h: string; v: number }>(traffic.referrers_30d).slice(0, 10).map((r) => ({ label: r.h, v: r.v }))} /></div>
              <div className="ca-card"><h3>Pays · 30 j</h3><HBars rows={arr<{ c: string; v: number }>(traffic.countries_30d).slice(0, 10).map((r) => ({ label: `${flag(r.c)} ${r.c}`, v: r.v }))} /></div>
              <div className="ca-card"><h3>Pages · 30 j</h3><HBars rows={arr<{ p: string; v: number }>(traffic.top_pages_30d).slice(0, 10).map((r) => ({ label: r.p, v: r.v }))} /></div>
            </div>
          </section>

          <section id="users" className="ca-sec">
            <div className="ca-sec-h"><h2>Utilisateurs</h2></div>
            <div className="ca-grid2">
              <div className="ca-card"><h3>Inscriptions par jour</h3><Bars pts={slice(sDaily)} accent="var(--ca-red)" /></div>
              <div className="ca-card"><h3>Personnes qui notent leurs repas</h3><Bars pts={aDaily.slice(-range).map((p) => ({ d: p.d, v: p.users }))} /></div>
              <div className="ca-card"><h3>Repas notés par jour</h3><Bars pts={aDaily.slice(-range).map((p) => ({ d: p.d, v: p.entries }))} accent="var(--ca-amber)" /></div>
              <div className="ca-card"><h3>Questions à Vito par jour</h3><Bars pts={slice(cDaily)} accent="var(--ca-violet)" />
                <p className="ca-small ca-muted">{nf(num(coach.msgs_30d))} messages · {nf(num(coach.people_30d))} personnes en 30 j · {nf(num(coach.anon_trials))} essais sans compte</p></div>
            </div>
            <div className="ca-grid2">
              <div className="ca-card"><h3>Parcours des inscrits</h3>
                <ol className="ca-funnel">
                  {[["Inscrits", num(funnel.signups)], ["Profil réglé", num(funnel.profile_custom)], ["1er repas noté", num(funnel.first_log)], ["Notent 3 jours+", num(funnel.logged_3d)], ["Notent 7 jours+", num(funnel.logged_7d)], ["Actifs après 1 semaine", num(funnel.active_after_w1)], ["Payants", num(funnel.paying)]].map(([l, v], i, all) => (
                    <li key={String(l)}><span>{l}</span><span className="ca-fbar"><i style={{ width: `${pct(Number(v), Number(all[0][1]))}%` }} /></span><b>{nf(Number(v))}</b><small>{pct(Number(v), Number(all[0][1]))} %</small></li>
                  ))}
                </ol>
              </div>
              <div className="ca-card"><h3>Fonctions utilisées <small>(personnes)</small></h3><HBars rows={featRows} /></div>
            </div>
            <div className="ca-grid3">
              <div className="ca-card"><h3>Rétention par semaine d&apos;inscription</h3>
                <div className="ca-scroll"><table className="ca-table"><thead><tr><th>Semaine</th><th>Inscrits</th><th>Ont noté</th><th>S1</th><th>S2</th><th>S3-4</th><th>M2</th></tr></thead>
                  <tbody>{cohorts.slice(-8).map((c) => <tr key={String(c.wk)}><td>{dShort(String(c.wk))}</td><td>{num(c.n)}</td><td>{num(c.logged)}</td><td>{num(c.w1)}</td><td>{num(c.w2)}</td><td>{num(c.w34)}</td><td>{num(c.m2)}</td></tr>)}</tbody></table></div></div>
              <div className="ca-card"><h3>Aliments les plus notés</h3><HBars rows={topFoods.slice(0, 8).map((f) => ({ label: `${f.em || ""} ${f.f}`.trim(), v: f.n }))} /></div>
              <div className="ca-card"><h3>Profils</h3>
                <HBars rows={Object.entries(obj(profiles.objectif)).map(([k, v]) => ({ label: OBJ[k] || k, v: num(v) }))} />
                <p className="ca-small ca-muted">Femmes {num(obj(profiles.sexe).femme)} · Hommes {num(obj(profiles.sexe).homme)} · Repas : matin {num(meals.matin)}, midi {num(meals.midi)}, soir {num(meals.soir)}, snack {num(meals.snack)} · moyenne {nf(num(activity.avg_kcal_logged_day))} kcal/jour noté</p>
                <p className="ca-small ca-muted">Connexions : {Object.entries(obj(users.providers)).map(([k, v]) => `${k} ${num(v)}`).join(" · ")} · App Android : {num(android.logins_30d)} connexions en 30 j</p></div>
            </div>
          </section>

          <section id="argent" className="ca-sec">
            <div className="ca-sec-h"><h2>Argent</h2></div>
            {st.ok === false ? <p className="ca-err">Stripe indisponible : {String(st.error || "")}</p> : (
              <>
                <div className="ca-kpis">
                  <Kpi label="Stripe · actifs" value={nf(num(st.active))} sub={`${num(st.trialing)} en essai · ${num(st.cancelingSoon)} s'arrêtent bientôt`} />
                  <Kpi label="Google Play · actifs" value={nf(payingPlay)} sub={Object.entries(obj(money.play_states)).map(([k, v]) => `${k.replace("SUBSCRIPTION_STATE_", "").toLowerCase()} ${num(v)}`).join(" · ") || "aucun"} />
                  <Kpi label="Encaissé 30 j" value={chf(num(obj(st.revenue).d30))} sub={`90 j : ${chf(num(obj(st.revenue).d90))}`} />
                  <Kpi label="Annulés (total)" value={nf(num(st.canceled))} sub={`${num(st.pastDue)} en retard de paiement`} />
                </div>
                <div className="ca-card"><h3>Abonnements Stripe</h3>
                  {subs.length === 0 ? <p className="ca-empty">Aucun abonnement pour l&apos;instant.</p> : (
                    <div className="ca-scroll"><table className="ca-table"><thead><tr><th>Début</th><th>Statut</th><th>Formule</th><th>Prix</th><th>Code</th><th>MRR</th></tr></thead>
                      <tbody>{subs.map((s) => <tr key={String(s.id)}><td>{new Date(num(s.created) * 1000).toLocaleDateString("fr-CH")}</td><td><span className={`ca-pill ${String(s.status)}`}>{STATUS[String(s.status)] || String(s.status)}{s.cancelAtPeriodEnd ? " · fin prévue" : ""}</span></td><td>{s.interval === "year" ? "annuel" : "mensuel"}</td><td>{chf(num(s.amount))}{num(s.discountPct) ? ` −${num(s.discountPct)} %` : ""}</td><td>{String(s.code || "—")}</td><td>{chf(num(s.mrr))}</td></tr>)}</tbody></table></div>
                  )}
                </div>
              </>
            )}
          </section>

          <section id="partenaires" className="ca-sec">
            <div className="ca-sec-h"><h2>Partenaires</h2></div>
            <div className="ca-card"><h3>Liens partenaires <small>(clics comptés depuis le 17.11.2026)</small></h3>
              <div className="ca-scroll"><table className="ca-table"><thead><tr><th>Lien</th><th>Code</th><th>Clics 7 j</th><th>Clics total</th><th>Pays</th><th>Utilisations du code</th><th>Encaissé</th><th>Commission 30 %</th></tr></thead>
                <tbody>{(() => {
                  const codes = new Set([...links.map((l) => l.code), ...promos.filter((p) => p.active && p.code !== "TESTPARTENAIRE").map((p) => p.code)]);
                  return [...codes].map((code) => {
                    const l = links.find((x) => x.code === code);
                    const p = promos.find((x) => x.code === code);
                    const paid = num(revByCode[code]);
                    return (
                      <tr key={code}><td>{`calorio.ch/${l ? l.slug : code.toLowerCase()}`}</td><td>{code}</td><td>{nf(l?.d7 || 0)}</td><td><b>{nf(l?.clicks || 0)}</b></td>
                        <td>{l ? Object.entries(l.countries).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([c, v]) => `${flag(c)} ${v}`).join(" ") : "—"}</td>
                        <td>{nf(p?.redeemed || 0)}</td><td>{chf(paid)}</td><td>{chf(paid * 0.3)}</td></tr>
                    );
                  });
                })()}</tbody></table></div>
              <p className="ca-small ca-muted">Les installations Google Play venues d&apos;un partenaire se voient dans la Play Console (Croissance → Acquisition des utilisateurs, source « partenaire »).</p>
            </div>
            <div className="ca-grid2">
              <div className="ca-card"><h3>Prospection</h3>
                <HBars rows={["partenaire", "repondu", "envoye", "brouillon", "refus", "ignore"].filter((k) => num(pipe[k])).map((k) => ({ label: PIPE[k] || k, v: num(pipe[k]) }))} />
                <p className="ca-small ca-muted">{num(growth.partners_total)} profils · {nf(num(growth.partners_followers))} abonnés cumulés · Pro offerts : {arr(partners.comp).length}</p></div>
              <div className="ca-card"><h3>Partenaires et réponses</h3>
                {partnersRows.length === 0 ? <p className="ca-empty">Aucune réponse pour l&apos;instant.</p> : (
                  <ul className="ca-list">{partnersRows.map((p) => <li key={String(p.handle)}><b>@{String(p.handle)}</b> <span className={`ca-pill ${String(p.status)}`}>{PIPE[String(p.status)] || String(p.status)}</span><small>{nf(num(p.followers))} abonnés · {String(p.proposed_code || "")}</small></li>)}</ul>
                )}</div>
            </div>
          </section>

          <section id="reseaux" className="ca-sec">
            <div className="ca-sec-h"><h2>Réseaux</h2></div>
            <div className="ca-grid2">
              <div className="ca-card"><h3>Connexion Meta (Facebook + Instagram)</h3>
                {social.meta ? (
                  <p className={meta.ok ? "ca-ok" : "ca-err"}>{meta.ok ? `✓ Connecté : page « ${String(meta.page)} » et Instagram @${String(meta.instagram)}` : `✗ Problème : ${String(meta.error || "connexion")}`}</p>
                ) : <p className="ca-muted">Vérification indisponible.</p>}
                <p className="ca-small ca-muted">Les posts du Mag partent automatiquement le jour de l&apos;article (file de publication sur sporadex.ch, puis secours à 18h30).</p></div>
              <div className="ca-card"><h3>Mag · prochains articles</h3>
                <ul className="ca-list">{arr<J>(social.upcoming).map((a) => <li key={String(a.slug)}><b>{dShort(String(a.date))}</b> {String(a.title)}{!a.social && <span className="ca-pill past_due">sans légende réseaux</span>}</li>)}</ul>
                <h3 style={{ marginTop: 14 }}>Derniers publiés <small>({num(social.totalArticles)} au total)</small></h3>
                <ul className="ca-list">{arr<J>(social.recent).map((a) => <li key={String(a.slug)}><b>{dShort(String(a.date))}</b> <a href={`/mag/${String(a.slug)}`} target="_blank" rel="noopener">{String(a.title)}</a></li>)}</ul></div>
            </div>
          </section>
        </>
      )}
    </Shell>
  );
}

const SVC: Record<string, string> = { site: "Site et app", base: "Base de données (Supabase)", vito: "Vito (Gemini)", aliments: "Scan et recherche (Open Food Facts)", stripe: "Paiements web (Stripe)", play: "Abonnements Google Play" };
const FEAT: Record<string, string> = { scan: "Scan code-barres", coach: "Vito (coach)", photo: "Photo de l'assiette", search: "Recherche en ligne", water: "Eau", sport: "Sport", weight: "Poids", fasting: "Jeûne", saved_meals: "Repas enregistrés", custom_foods: "Aliments créés", duo: "Mode duo", push: "Notifications" };
const OBJ: Record<string, string> = { perte: "Perdre du poids", perte_rapide: "Perdre vite", maintien: "Maintenir", prise: "Prendre du poids" };
const PIPE: Record<string, string> = { partenaire: "Partenaire", repondu: "A répondu", envoye: "Contacté", brouillon: "Brouillon", refus: "Refus", ignore: "Ignoré" };
const STATUS: Record<string, string> = { active: "actif", trialing: "essai", past_due: "impayé", canceled: "annulé", incomplete: "incomplet", incomplete_expired: "expiré", unpaid: "impayé" };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="ca">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ca-wrap">{children}</div>
    </div>
  );
}

const CSS = `
.ca{--ca-bg:#f3f7f3;--ca-card:#fff;--ca-ink:#1d2a22;--ca-soft:#5f6e65;--ca-line:#e1e9e3;--ca-green:#1f9d55;--ca-red:#e94867;--ca-amber:#e3a23b;--ca-violet:#7b61c9;--ca-chip:#eaf5ee;
  background:var(--ca-bg);color:var(--ca-ink);min-height:100vh;font-family:var(--font-nunito),Nunito,system-ui,sans-serif;font-size:14px}
@media (prefers-color-scheme:dark){.ca{--ca-bg:#0f1512;--ca-card:#18201b;--ca-ink:#e8f0ea;--ca-soft:#9aaba0;--ca-line:#26322b;--ca-green:#3cc274;--ca-chip:#1d2a22}}
.ca *{box-sizing:border-box}
.ca-wrap{max-width:1180px;margin:0 auto;padding:16px 16px 60px}
.ca h1,.ca h2,.ca h3{font-family:var(--font-fredoka),Fredoka,system-ui,sans-serif;margin:0;letter-spacing:-.2px}
.ca h2{font-size:1.35rem}.ca h3{font-size:.98rem;margin-bottom:10px}.ca h3 small{font-weight:500;color:var(--ca-soft);font-size:.8rem}
.ca-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.ca-brand{display:flex;align-items:center;gap:10px}.ca-brand img{border-radius:9px}.ca-brand b{font-family:var(--font-fredoka),Fredoka,sans-serif;font-size:1.3rem;display:block;line-height:1}.ca-brand small{color:var(--ca-soft);font-weight:700}
.ca-tools{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.ca-check{display:flex;align-items:center;gap:6px;color:var(--ca-soft);font-weight:700;font-size:.85rem}
.ca-btn{border:0;border-radius:12px;background:var(--ca-green);color:#fff;font-weight:800;padding:11px 18px;cursor:pointer;font-size:.95rem}
.ca-btn:disabled{opacity:.6}.ca-btn-sm{padding:8px 14px;font-size:.88rem}
.ca-btn:focus-visible,.ca-seg button:focus-visible,.ca-nav a:focus-visible{outline:2px solid var(--ca-ink);outline-offset:2px}
.ca-nav{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;display:flex;gap:6px;overflow-x:auto;margin:14px -16px 6px;padding:8px 16px;background:var(--ca-bg)}
.ca-nav a{flex:none;text-decoration:none;color:var(--ca-ink);background:var(--ca-card);border:1px solid var(--ca-line);border-radius:99px;padding:6px 13px;font-weight:800;font-size:.85rem}
.ca-sec{padding-top:18px;scroll-margin-top:60px;display:flex;flex-direction:column;gap:12px}
.ca-sec-h{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.ca-seg{display:flex;background:var(--ca-card);border:1px solid var(--ca-line);border-radius:99px;padding:3px}
.ca-seg button{border:0;background:none;color:var(--ca-soft);font-weight:800;padding:5px 12px;border-radius:99px;cursor:pointer}
.ca-seg button.on{background:var(--ca-green);color:#fff}
.ca-kpis{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px}
.ca-kpi{background:var(--ca-card);border:1px solid var(--ca-line);border-radius:16px;padding:13px 14px;display:flex;flex-direction:column;gap:4px;min-width:0}
.ca-kpi-l{color:var(--ca-soft);font-weight:800;font-size:.75rem;text-transform:uppercase;letter-spacing:.6px}
.ca-kpi-v{font-family:var(--font-fredoka),Fredoka,sans-serif;font-size:1.55rem;font-variant-numeric:tabular-nums;line-height:1.1}
.ca-kpi-s{display:flex;gap:6px;flex-wrap:wrap;color:var(--ca-soft);font-size:.78rem;font-weight:700}
.ca-delta{font-weight:800}.ca-delta.up{color:var(--ca-green)}.ca-delta.down{color:var(--ca-red)}
.ca-card{background:var(--ca-card);border:1px solid var(--ca-line);border-radius:16px;padding:14px;min-width:0}
.ca-grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
@media (max-width:760px){.ca-grid2{grid-template-columns:1fr}}
.ca-grid3{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}
@media (max-width:420px){.ca-grid2,.ca-grid3{grid-template-columns:1fr}}
.ca-chart svg{width:100%;display:block}
.ca-chart-tip{font-size:.8rem;color:var(--ca-soft);min-height:18px;font-variant-numeric:tabular-nums}.ca-chart-tip b{color:var(--ca-ink)}
.ca-chart-x{display:flex;justify-content:space-between;color:var(--ca-soft);font-size:.72rem;margin-top:4px}
.ca-hbars{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:7px}
.ca-hbars li{display:grid;grid-template-columns:minmax(0,1.3fr) 1fr auto;align-items:center;gap:8px;font-size:.85rem}
.ca-hb-l{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:700}
.ca-hb-t{height:8px;background:var(--ca-chip);border-radius:9px;overflow:hidden}.ca-hb-t i{display:block;height:100%;background:var(--ca-green);border-radius:9px}
.ca-hbars b{font-variant-numeric:tabular-nums}
.ca-funnel{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px}
.ca-funnel li{display:grid;grid-template-columns:150px 1fr 40px 42px;align-items:center;gap:8px;font-size:.85rem;font-weight:700}
.ca-funnel small{color:var(--ca-soft);text-align:right}.ca-funnel b{text-align:right;font-variant-numeric:tabular-nums}
.ca-fbar{height:10px;background:var(--ca-chip);border-radius:9px;overflow:hidden}.ca-fbar i{display:block;height:100%;background:var(--ca-red);border-radius:9px}
@media (max-width:420px){.ca-funnel li{grid-template-columns:110px 1fr 30px 38px}}
.ca-scroll{overflow-x:auto}
.ca-table{width:100%;border-collapse:collapse;font-size:.84rem;font-variant-numeric:tabular-nums}
.ca-table th{text-align:left;color:var(--ca-soft);font-size:.72rem;text-transform:uppercase;letter-spacing:.5px;padding:6px 8px;border-bottom:1px solid var(--ca-line);white-space:nowrap}
.ca-table td{padding:7px 8px;border-bottom:1px solid var(--ca-line);white-space:nowrap}
.ca-pill{display:inline-block;border-radius:99px;padding:2px 8px;font-size:.72rem;font-weight:800;background:var(--ca-chip);color:var(--ca-ink);margin-left:4px}
.ca-pill.active,.ca-pill.partenaire{background:#d7f3e1;color:#14663a}.ca-pill.trialing,.ca-pill.repondu{background:#fff0c9;color:#7a5508}.ca-pill.canceled,.ca-pill.past_due,.ca-pill.refus{background:#fde0e6;color:#9e2440}
.ca-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:7px;font-size:.88rem}
.ca-list small{display:block;color:var(--ca-soft);font-weight:700}.ca-list a{color:inherit}
.ca-health{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:10px}
.ca-hc{display:flex;gap:10px;align-items:flex-start;background:var(--ca-card);border:1px solid var(--ca-line);border-radius:14px;padding:12px}
.ca-hc b{display:block;font-size:.9rem}.ca-hc small{display:block;color:var(--ca-soft);font-weight:700;font-size:.76rem;margin-top:2px;word-break:break-word}
.ca-dot{flex:none;width:12px;height:12px;border-radius:50%;margin-top:4px;background:var(--ca-green);box-shadow:0 0 0 4px rgba(31,157,85,.15)}
.ca-hc.ko{border-color:var(--ca-red)}.ca-hc.ko .ca-dot{background:var(--ca-red);box-shadow:0 0 0 4px rgba(233,72,103,.18)}
.ca-muted{color:var(--ca-soft)}.ca-small{font-size:.78rem;margin:8px 0 0}.ca-empty{color:var(--ca-soft);margin:0}
.ca-err{color:var(--ca-red);font-weight:800}.ca-ok{color:var(--ca-green);font-weight:800;margin:0}
.ca-login{max-width:380px;margin:12vh auto 0;background:var(--ca-card);border:1px solid var(--ca-line);border-radius:18px;padding:22px;display:flex;flex-direction:column;gap:12px}
.ca-login form{display:flex;flex-direction:column;gap:10px}.ca-login label{font-weight:800;font-size:.85rem}
.ca-login input{border:1px solid var(--ca-line);border-radius:10px;padding:11px 12px;font-size:1rem;background:var(--ca-bg);color:var(--ca-ink)}
`;
