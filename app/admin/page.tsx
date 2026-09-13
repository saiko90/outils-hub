"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, ADMIN_EMAIL } from "@/lib/supabase";

type Row = { email: string; source: string; lang: string | null; created_at: string };
type Stat = { day: string; path: string; country: string; views: number };
type Phase = "loading" | "anon" | "denied" | "admin";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function ago(iso: string): string {
  const s = Math.max(0, (Date.now() - +new Date(iso)) / 1000);
  if (s < 90) return "à l'instant";
  if (s < 3600) return `il y a ${Math.round(s / 60)} min`;
  if (s < 86400) return `il y a ${Math.round(s / 3600)} h`;
  const d = Math.round(s / 86400);
  return d === 1 ? "hier" : `il y a ${d} j`;
}

export default function AdminPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [userEmail, setUserEmail] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [stats, setStats] = useState<Stat[] | null>(null);
  const [loadErr, setLoadErr] = useState("");

  useEffect(() => {
    const sb = supabase();
    let mounted = true;
    const apply = (session: Session | null) => {
      if (!mounted) return;
      const em = session?.user?.email ? String(session.user.email) : "";
      setUserEmail(em);
      if (!session) setPhase("anon");
      else if (em.toLowerCase() !== ADMIN_EMAIL) setPhase("denied");
      else setPhase("admin");
    };
    sb.auth.getSession().then(({ data }) => apply(data.session));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => apply(session));
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (phase !== "admin") return;
    supabase().from("waitlist").select("email,source,lang,created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => { if (error) setLoadErr(error.message); else setRows((data as Row[]) || []); });
    supabase().from("page_stats").select("day,path,country,views")
      .then(({ data }) => setStats((data as Stat[]) || []));
  }, [phase]);

  const sendLink = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const em = email.trim();
    if (!EMAIL_RE.test(em)) { setErr("Adresse email invalide."); return; }
    setSending(true); setErr("");
    const { error } = await supabase().auth.signInWithOtp({
      email: em, options: { emailRedirectTo: window.location.origin + "/admin" },
    });
    setSending(false);
    if (error) setErr(error.message); else setSent(true);
  }, [email]);

  const signOut = useCallback(async () => { await supabase().auth.signOut(); setRows(null); }, []);

  const exportCsv = useCallback(() => {
    const r = rows || [];
    const head = "email,source,langue,inscrit_le\n";
    const body = r.map((x) => [x.email, x.source, x.lang || "", x.created_at].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([head + body], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `waitlist-facturama-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(a.href);
  }, [rows]);

  const m = useMemo(() => {
    const r = rows || [];
    const now = Date.now(), D = 864e5;
    const total = r.length;
    const w7 = r.filter((x) => +new Date(x.created_at) >= now - 7 * D).length;
    const prev7 = r.filter((x) => { const t = +new Date(x.created_at); return t >= now - 14 * D && t < now - 7 * D; }).length;
    const h24 = r.filter((x) => +new Date(x.created_at) >= now - D).length;
    const byLang: Record<string, number> = { fr: 0, de: 0, en: 0 };
    r.forEach((x) => { const l = (x.lang || "").toLowerCase(); if (l in byLang) byLang[l]++; });
    const topLang = (["fr", "de", "en"] as const).slice().sort((a, b) => byLang[b] - byLang[a])[0];
    const topPct = total ? Math.round(byLang[topLang] / total * 100) : 0;
    const series: number[] = [], labels: string[] = [];
    for (let i = 29; i >= 0; i--) {
      const end = new Date(now - i * D); end.setHours(23, 59, 59, 999);
      series.push(r.filter((x) => +new Date(x.created_at) <= +end).length);
      labels.push(new Date(now - i * D).toLocaleDateString("fr-CH", { day: "numeric", month: "short" }));
    }
    return { total, w7, prev7, h24, byLang, topLang, topPct, series, labels };
  }, [rows]);

  const tr = useMemo(() => {
    const s = stats || [];
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    const key = (d: Date) => d.toISOString().slice(0, 10);
    const cut = (n: number) => { const d = new Date(today); d.setUTCDate(d.getUTCDate() - n); return key(d); };
    const c7 = cut(6), c30 = cut(29);
    const sum = (arr: Stat[]) => arr.reduce((a, x) => a + (x.views || 0), 0);
    const total7 = sum(s.filter((x) => x.day >= c7));
    const total30 = sum(s.filter((x) => x.day >= c30));
    const s30 = s.filter((x) => x.day >= c30);
    const byPath: Record<string, number> = {};
    s30.forEach((x) => { byPath[x.path] = (byPath[x.path] || 0) + (x.views || 0); });
    const topPages = Object.entries(byPath).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const byCountry: Record<string, number> = {};
    s30.forEach((x) => { byCountry[x.country] = (byCountry[x.country] || 0) + (x.views || 0); });
    const topCountries = Object.entries(byCountry).sort((a, b) => b[1] - a[1]).slice(0, 4);
    return { total7, total30, topPages, topCountries, has: s.length > 0 };
  }, [stats]);

  return (
    <div className="adm">
      <style dangerouslySetInnerHTML={{ __html: ADMIN_CSS }} />
      {phase === "loading" && <div className="adm-center"><div className="adm-spin" /></div>}

      {phase === "anon" && (
        <div className="adm-center">
          <div className="adm-login">
            <div className="adm-logo">o</div>
            <h1>Cockpit <span>outils.ch</span></h1>
            <p className="adm-sub">Espace d'administration privé.</p>
            {sent ? (
              <div className="adm-sent">
                <b>Vérifie ta boîte mail 📬</b>
                <p>Un lien de connexion a été envoyé à <b>{email}</b>. Clique dessus pour entrer.</p>
              </div>
            ) : (
              <form onSubmit={sendLink} noValidate>
                <label htmlFor="adm-email">Ton email</label>
                <input id="adm-email" type="email" autoComplete="email" placeholder="m.kaeser90@gmail.com"
                  value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); }} disabled={sending} />
                {err && <div className="adm-err" role="alert">{err}</div>}
                <button type="submit" disabled={sending}>{sending ? "Envoi…" : "Recevoir le lien de connexion"}</button>
                <small>Connexion sans mot de passe. Réservé au propriétaire du site.</small>
              </form>
            )}
          </div>
        </div>
      )}

      {phase === "denied" && (
        <div className="adm-center">
          <div className="adm-login">
            <div className="adm-logo" style={{ background: "linear-gradient(135deg,#f87171,#f472b6)" }}>!</div>
            <h1>Accès refusé</h1>
            <p className="adm-sub">Le compte <b>{userEmail || "connecté"}</b> n'est pas autorisé à voir ce tableau de bord.</p>
            <button className="adm-out" onClick={signOut}>Se déconnecter</button>
          </div>
        </div>
      )}

      {phase === "admin" && (
        <div className="app">
          <aside className="side">
            <div className="brand">
              <div className="logo">o</div>
              <div><b>outils<span className="tld">.ch</span></b><small>Cockpit</small></div>
            </div>
            <nav className="nav">
              <div className="lbl">Pilotage</div>
              <a className="on" href="#"><span className="ic">▦</span>Vue d'ensemble</a>
              <a href="#"><span className="ic">☰</span>Liste d'attente<span className="cnt">{m.total}</span></a>
              <a href="#"><span className="ic">↗</span>Trafic</a>
              <a href="#"><span className="ic">♥</span>Santé du site</a>
            </nav>
            <div className="user">
              <div className="av">MK</div>
              <div className="who"><b>Michaël</b><span>{userEmail}</span></div>
              <button title="Se déconnecter" aria-label="Se déconnecter" onClick={signOut}>⎋</button>
            </div>
          </aside>

          <div className="main">
            <div className="top">
              <div className="h">
                <h1>Vue d'ensemble</h1>
                <p>{new Date().toLocaleDateString("fr-CH", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} · données en direct</p>
              </div>
              <span className="live-badge"><span className="dot" />En direct</span>
            </div>

            <div className="content">
              {loadErr && <div className="adm-banner">Erreur de chargement : {loadErr}</div>}

              <section className="kpis">
                <Kpi label="Inscrits — facturama Pro" val={m.total} chip={m.w7 > 0 ? `▲ +${m.w7}` : "—"} sub="au total" accent="var(--accent)" />
                <Kpi label="7 derniers jours" val={m.w7} chip={trend(m.w7, m.prev7)} sub="vs 7 j préc." accent="var(--accent-2)" />
                <Kpi label="Dernières 24 h" val={m.h24} chip={m.h24 > 0 ? "actif" : "—"} sub="nouvelles inscriptions" accent="var(--accent-3)" />
                <Kpi label="Langue principale" val={`${m.topPct}%`} chip={m.topLang.toUpperCase()} sub={`${m.byLang.fr} FR · ${m.byLang.de} DE · ${m.byLang.en} EN`} accent="var(--pink)" />
              </section>

              <section className="panel">
                <header>
                  <div><h2>Croissance de la liste d'attente</h2><div className="sub">Inscrits cumulés — 30 derniers jours</div></div>
                  <button className="btn" onClick={exportCsv} disabled={!rows || rows.length === 0}>⭳ Exporter CSV</button>
                </header>
                <div className="chartwrap"><Growth series={m.series} labels={m.labels} /></div>
              </section>

              <section className="grid-2">
                <div className="panel">
                  <header><div><h2>Dernières inscriptions</h2><div className="sub">{rows ? `${rows.length} au total` : "…"}</div></div></header>
                  <div className="rows">
                    {rows === null && <div className="empty">Chargement…</div>}
                    {rows && rows.length === 0 && <div className="empty">Aucune inscription pour l'instant. Elles apparaîtront ici en direct.</div>}
                    {rows && rows.slice(0, 8).map((r, i) => (
                      <div className="row" key={r.email + i}>
                        <div className="av" style={{ background: grad(r.email) }}>{initials(r.email)}</div>
                        <div className="em"><b>{r.email}</b><span>facturama Pro</span></div>
                        <span className="flag">{(r.lang || "—").toUpperCase()}</span>
                        <span className="t">{ago(r.created_at)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="panel">
                  <header><div><h2>Répartition par langue</h2><div className="sub">des inscrits</div></div></header>
                  <div className="bars">
                    {(["fr", "de", "en"] as const).map((l) => {
                      const v = m.byLang[l], pct = m.total ? v / m.total * 100 : 0;
                      return (
                        <div className="bar" key={l}>
                          <div className="bn">{l.toUpperCase()}</div>
                          <div className="track"><div className="fill" style={{ width: `${pct}%` }} /></div>
                          <div className="bv">{v}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="traffic">
                    <div className="tr-head">
                      <b>Trafic — 7 derniers jours</b>
                      <span className="tr-big">{tr.has ? tr.total7 : "—"}</span>
                    </div>
                    <div className="tr-sub">
                      {tr.has
                        ? `${tr.total30} visites sur 30 j · first-party, sans cookie`
                        : "first-party, sans cookie · aucune donnée perso"}
                    </div>
                    {!tr.has ? (
                      <p className="tr-wait">En attente des premières visites. Dès qu'un visiteur ouvre une page, les pages les plus vues s'afficheront ici en direct.</p>
                    ) : (
                      <>
                        <div className="tr-pages">
                          {tr.topPages.map(([p, v]) => (
                            <div className="tr-bar" key={p}>
                              <div className="tp">
                                <b title={p}>{prettyPath(p)}</b>
                                <div className="track"><div className="fill" style={{ width: `${(v / (tr.topPages[0][1] || 1)) * 100}%` }} /></div>
                              </div>
                              <div className="tv">{v}</div>
                            </div>
                          ))}
                        </div>
                        {tr.topCountries.length > 0 && (
                          <div className="tr-geo">
                            {tr.topCountries.map(([c, v]) => (
                              <span className="tr-chip" key={c}>{flagEmoji(c)} {c === "XX" ? "?" : c} <b>{v}</b></span>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </section>

              <div className="sec-title"><h2>Santé & raccourcis</h2><span>agir vite</span></div>
              <section className="health">
                <div className="panel status">
                  <div className="live"><span className="pulse" /><b>outils.ch — en ligne</b></div>
                  <div className="meta">
                    <div className="mrow"><span className="l">Liste d'attente</span><span className="v">{m.total} inscrit{m.total > 1 ? "s" : ""}</span></div>
                    <div className="mrow"><span className="l">Pages indexées</span><span className="v">176</span></div>
                    <div className="mrow"><span className="l">Langues</span><span className="v">FR · DE · EN</span></div>
                  </div>
                </div>
                <div className="panel shortcuts">
                  {SHORTCUTS.map((s) => (
                    <a className="sc" key={s.t} href={s.url} target="_blank" rel="noopener noreferrer">
                      <span className="si" style={{ background: s.bg }}>{s.i}</span>
                      <span className="st"><b>{s.t}</b><span>{s.d}</span></span><span className="go">→</span>
                    </a>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function trend(cur: number, prev: number): string {
  if (prev === 0) return cur > 0 ? "nouveau" : "—";
  const p = Math.round((cur - prev) / prev * 100);
  return (p >= 0 ? "▲ +" : "▼ ") + p + " %";
}
function initials(email: string) { return email.slice(0, 2).toUpperCase(); }
function prettyPath(p: string): string {
  if (p === "/") return "Accueil";
  return p.length > 26 ? "…" + p.slice(-25) : p;
}
function flagEmoji(cc: string): string {
  const c = (cc || "").toUpperCase();
  if (c.length !== 2 || c === "XX") return "🌐";
  return String.fromCodePoint(...[...c].map((ch) => 127397 + ch.charCodeAt(0)));
}
function grad(seed: string) {
  const pairs = [["#6366f1", "#22d3ee"], ["#34d399", "#0ea5e9"], ["#f472b6", "#a78bfa"], ["#f59e0b", "#ef4444"], ["#22d3ee", "#3b82f6"]];
  let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const [a, b] = pairs[h % pairs.length];
  return `linear-gradient(135deg,${a},${b})`;
}

function Kpi({ label, val, chip, sub, accent }: { label: string; val: number | string; chip: string; sub: string; accent: string }) {
  return (
    <div className="kpi">
      <div className="k-top"><div className="k-ic" style={{ background: `color-mix(in srgb,${accent} 16%,transparent)`, color: accent }}>●</div><div className="k-lbl">{label}</div></div>
      <div className="k-val">{val}</div>
      <div className="k-foot"><span className="chip up">{chip}</span><span className="k-sub">{sub}</span></div>
    </div>
  );
}

function Growth({ series, labels }: { series: number[]; labels: string[] }) {
  const W = 900, H = 230, L = 40, R = 14, T = 16, B = 26;
  const n = series.length, mx = Math.max(...series, 4);
  const x = (i: number) => L + i * (W - L - R) / (n - 1);
  const y = (v: number) => T + (1 - v / mx) * (H - T - B);
  const line = series.map((v, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(v).toFixed(1)).join(" ");
  const area = line + ` L${x(n - 1).toFixed(1)} ${y(0).toFixed(1)} L${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`;
  const gl = []; for (let g = 0; g <= 4; g++) { const gv = Math.round(mx / 4 * g), gy = y(gv); gl.push(<g key={g}><line x1={L} y1={gy} x2={W - R} y2={gy} stroke="var(--grid)" /><text x={L - 8} y={gy + 4} textAnchor="end" fontSize="11" fill="var(--faint)">{gv}</text></g>); }
  const tk = [0, 6, 12, 18, 24, 29];
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Croissance des inscrits">
      <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="var(--area-top)" /><stop offset="1" stopColor="var(--area-bot)" /></linearGradient></defs>
      {gl}
      {tk.map((ti, k) => <text key={k} x={x(ti)} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--faint)">{labels[ti]}</text>)}
      <path d={area} fill="url(#ag)" />
      <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(n - 1)} cy={y(series[n - 1])} r="4.5" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2.5" />
    </svg>
  );
}

const SHORTCUTS = [
  { t: "Supabase", d: "Base liste d'attente", i: "S", bg: "linear-gradient(135deg,#3ecf8e,#249d63)", url: "https://supabase.com/dashboard/project/srcvnqfgtazupuzwznrr/editor" },
  { t: "Vercel", d: "Déploiements & analytics", i: "▲", bg: "#000", url: "https://vercel.com/dashboard" },
  { t: "Search Console", d: "Indexation Google", i: "G", bg: "linear-gradient(135deg,#4285f4,#34a853)", url: "https://search.google.com/search-console?resource_id=sc-domain:outils.ch" },
  { t: "GitHub", d: "saiko90/outils-hub", i: "GH", bg: "#24292f", url: "https://github.com/saiko90/outils-hub" },
  { t: "Voir le site", d: "outils.ch", i: "o", bg: "linear-gradient(135deg,#6366f1,#22d3ee)", url: "https://outils.ch" },
  { t: "facturama Pro", d: "Page produit", i: "FA", bg: "linear-gradient(135deg,#3b82f6,#06b6d4)", url: "https://outils.ch/o/facturama" },
];

const ADMIN_CSS = `
.adm{--bg:#07070d;--surface:#0f1017;--surface-2:#14151f;--surface-3:#191b27;--border:rgba(150,165,240,.13);--border-strong:rgba(150,165,240,.22);--ink:#eef1fb;--muted:#97a0be;--faint:#6b7191;--accent:#818cf8;--accent-2:#22d3ee;--accent-3:#34d399;--pink:#f472b6;--good:#34d399;--crit:#f87171;--grid:rgba(150,165,240,.11);--area-top:#818cf855;--area-bot:#22d3ee06;--r:16px;
 position:fixed;inset:0;overflow:auto;background:var(--bg);color:var(--ink);font-family:"Inter",system-ui,sans-serif;font-size:14px;line-height:1.5;-webkit-font-smoothing:antialiased;}
.adm *{box-sizing:border-box;}
.adm .num,.adm .k-val,.adm .bv,.adm .cnt{font-variant-numeric:tabular-nums;}
.adm-center{min-height:100%;display:grid;place-items:center;padding:24px;}
.adm-spin{width:34px;height:34px;border-radius:99px;border:3px solid var(--surface-3);border-top-color:var(--accent);animation:admspin .8s linear infinite;}
@keyframes admspin{to{transform:rotate(360deg)}}
.adm-login{width:100%;max-width:400px;background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:34px 30px;box-shadow:0 30px 80px -30px #000;text-align:center;}
.adm-logo{width:52px;height:52px;border-radius:14px;margin:0 auto 18px;display:grid;place-items:center;font-weight:800;font-family:"Bricolage Grotesque",sans-serif;font-size:26px;color:#fff;background:linear-gradient(135deg,var(--accent),var(--accent-2) 60%,var(--accent-3));box-shadow:0 10px 26px -8px var(--accent);}
.adm-login h1{font-family:"Bricolage Grotesque",sans-serif;font-size:24px;font-weight:800;letter-spacing:-.02em;margin:0 0 4px;}
.adm-login h1 span{color:var(--faint);}
.adm-sub{color:var(--muted);margin:0 0 22px;font-size:13.5px;}
.adm-login form{display:flex;flex-direction:column;gap:10px;text-align:left;}
.adm-login label{font-size:12px;font-weight:600;color:var(--muted);}
.adm-login input{padding:13px 15px;border-radius:11px;border:1px solid var(--border-strong);background:var(--surface-2);color:var(--ink);font:inherit;font-size:15px;outline:none;}
.adm-login input:focus{border-color:var(--accent);}
.adm-login button{margin-top:4px;padding:13px;border-radius:11px;border:none;font:inherit;font-weight:700;font-size:14.5px;color:#fff;background:linear-gradient(135deg,var(--accent),#6366f1);cursor:pointer;box-shadow:0 10px 24px -10px var(--accent);}
.adm-login button:disabled{opacity:.6;cursor:progress;}
.adm-login small{color:var(--faint);font-size:11.5px;text-align:center;margin-top:2px;}
.adm-err{color:var(--crit);font-size:12.5px;font-weight:600;}
.adm-sent b{font-size:15px;}
.adm-sent p{color:var(--muted);font-size:13.5px;margin:8px 0 0;line-height:1.55;}
.adm-out{margin-top:8px;padding:11px 20px;border-radius:11px;border:1px solid var(--border-strong);background:var(--surface-2);color:var(--ink);font:inherit;font-weight:600;cursor:pointer;}
.adm-banner{background:color-mix(in srgb,var(--crit) 14%,transparent);border:1px solid color-mix(in srgb,var(--crit) 30%,transparent);color:var(--crit);padding:12px 16px;border-radius:12px;font-size:13px;font-weight:600;}
.adm .app{display:grid;grid-template-columns:250px 1fr;min-height:100%;}
.adm .side{border-right:1px solid var(--border);background:var(--surface);display:flex;flex-direction:column;padding:20px 14px;gap:22px;position:sticky;top:0;height:100vh;}
.adm .brand{display:flex;align-items:center;gap:11px;padding:4px 6px;}
.adm .brand .logo{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;color:#fff;font-weight:800;font-family:"Bricolage Grotesque",sans-serif;font-size:18px;background:linear-gradient(135deg,var(--accent),var(--accent-2) 60%,var(--accent-3));box-shadow:0 6px 18px -6px var(--accent);}
.adm .brand b{font-weight:800;font-size:16px;letter-spacing:-.02em;}
.adm .brand .tld{color:var(--faint);}
.adm .brand small{display:block;color:var(--faint);font-size:10.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;}
.adm .nav{display:flex;flex-direction:column;gap:3px;}
.adm .nav .lbl{font-size:10px;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--faint);padding:8px 10px 4px;}
.adm .nav a{display:flex;align-items:center;gap:11px;padding:9px 10px;border-radius:10px;text-decoration:none;color:var(--muted);font-weight:500;font-size:13.5px;}
.adm .nav a:hover{background:var(--surface-2);color:var(--ink);}
.adm .nav a.on{background:var(--surface-3);color:var(--ink);font-weight:600;}
.adm .nav a .ic{width:18px;text-align:center;color:var(--faint);}
.adm .nav a.on .ic{color:var(--accent);}
.adm .nav a .cnt{margin-left:auto;font-size:11px;font-weight:700;color:#fff;background:var(--accent);padding:1px 8px;border-radius:99px;}
.adm .user{margin-top:auto;display:flex;align-items:center;gap:10px;padding:8px;border-radius:12px;border:1px solid var(--border);background:var(--surface-2);}
.adm .user .av{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#f472b6,#a78bfa);color:#fff;display:grid;place-items:center;font-weight:700;font-size:12px;}
.adm .user .who{min-width:0;line-height:1.25;}
.adm .user .who b{font-size:13px;}
.adm .user .who span{display:block;font-size:11px;color:var(--faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.adm .user button{margin-left:auto;background:none;border:none;color:var(--faint);cursor:pointer;font-size:16px;padding:4px 8px;border-radius:8px;}
.adm .user button:hover{color:var(--crit);background:var(--surface-3);}
.adm .main{min-width:0;display:flex;flex-direction:column;}
.adm .top{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:14px;padding:16px 26px;background:color-mix(in srgb,var(--bg) 85%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);}
.adm .top .h h1{font-size:19px;font-weight:700;letter-spacing:-.02em;}
.adm .top .h p{margin:2px 0 0;font-size:12.5px;color:var(--faint);text-transform:capitalize;}
.adm .live-badge{margin-left:auto;display:inline-flex;align-items:center;gap:7px;font-size:12px;font-weight:700;color:var(--good);background:color-mix(in srgb,var(--good) 12%,transparent);border:1px solid color-mix(in srgb,var(--good) 28%,transparent);padding:5px 12px;border-radius:99px;}
.adm .live-badge .dot{width:7px;height:7px;border-radius:99px;background:var(--good);}
.adm .content{padding:24px 26px 48px;display:flex;flex-direction:column;gap:20px;max-width:1300px;width:100%;}
.adm .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
.adm .kpi{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);padding:18px;display:flex;flex-direction:column;gap:10px;}
.adm .k-top{display:flex;align-items:center;gap:9px;}
.adm .k-ic{width:26px;height:26px;border-radius:8px;display:grid;place-items:center;font-size:9px;}
.adm .k-lbl{font-size:12px;font-weight:600;color:var(--muted);}
.adm .k-val{font-family:"Bricolage Grotesque",sans-serif;font-weight:800;font-size:34px;line-height:1;letter-spacing:-.03em;}
.adm .k-foot{display:flex;align-items:center;gap:8px;}
.adm .chip{font-size:11.5px;font-weight:700;padding:3px 8px;border-radius:99px;color:var(--good);background:color-mix(in srgb,var(--good) 14%,transparent);}
.adm .k-sub{font-size:11.5px;color:var(--faint);}
.adm .panel{background:var(--surface);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;}
.adm .panel>header{display:flex;align-items:center;gap:12px;padding:15px 18px;border-bottom:1px solid var(--border);}
.adm .panel>header h2{font-size:14.5px;font-weight:700;}
.adm .panel>header .sub{font-size:12px;color:var(--faint);}
.adm .btn{margin-left:auto;font:inherit;font-size:12.5px;font-weight:600;padding:8px 14px;border-radius:9px;border:1px solid var(--border-strong);background:var(--surface-2);color:var(--ink);cursor:pointer;}
.adm .btn:hover:not(:disabled){background:var(--surface-3);}
.adm .btn:disabled{opacity:.5;cursor:not-allowed;}
.adm .chartwrap{padding:12px 8px 6px;}
.adm .chart{width:100%;height:230px;display:block;font-family:"JetBrains Mono",monospace;}
.adm .grid-2{display:grid;grid-template-columns:1.5fr 1fr;gap:20px;}
.adm .rows{display:flex;flex-direction:column;}
.adm .row{display:flex;align-items:center;gap:12px;padding:11px 18px;border-top:1px solid var(--border);}
.adm .row:first-child{border-top:none;}
.adm .row .av{width:34px;height:34px;border-radius:10px;display:grid;place-items:center;color:#fff;font-weight:700;font-size:12px;flex-shrink:0;}
.adm .row .em{min-width:0;flex:1;}
.adm .row .em b{font-weight:550;font-size:13.5px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.adm .row .em span{font-size:11px;color:var(--faint);}
.adm .flag{font-size:11px;font-weight:700;color:var(--muted);background:var(--surface-3);border-radius:6px;padding:2px 7px;}
.adm .row .t{font-size:12px;color:var(--faint);white-space:nowrap;}
.adm .empty{padding:26px 18px;color:var(--faint);font-size:13px;text-align:center;}
.adm .bars{display:flex;flex-direction:column;gap:13px;padding:16px 18px;}
.adm .bar{display:grid;grid-template-columns:40px 1fr auto;align-items:center;gap:12px;}
.adm .bar .bn{font-size:12.5px;font-weight:700;color:var(--muted);}
.adm .bar .track{height:9px;background:var(--surface-3);border-radius:99px;overflow:hidden;}
.adm .bar .fill{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--accent),var(--accent-2));min-width:2px;}
.adm .bar .bv{font-size:12.5px;font-weight:600;color:var(--muted);}
.adm .traffic{margin:4px 18px 18px;padding:16px;border-radius:12px;border:1px solid var(--border);background:var(--surface-2);}
.adm .tr-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;}
.adm .tr-head b{font-size:12.5px;color:var(--muted);}
.adm .tr-big{font-family:"Bricolage Grotesque",sans-serif;font-weight:800;font-size:27px;line-height:1;letter-spacing:-.02em;color:var(--accent-2);}
.adm .tr-sub{font-size:11px;color:var(--faint);margin-top:3px;}
.adm .tr-wait{font-size:11.5px;color:var(--faint);line-height:1.55;margin:13px 0 0;}
.adm .tr-pages{display:flex;flex-direction:column;gap:11px;margin-top:15px;}
.adm .tr-bar{display:grid;grid-template-columns:1fr 42px;align-items:center;gap:10px;}
.adm .tr-bar .tp{min-width:0;}
.adm .tr-bar .tp b{font-size:12px;font-weight:600;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.adm .tr-bar .track{height:6px;background:var(--surface-3);border-radius:99px;overflow:hidden;margin-top:5px;}
.adm .tr-bar .fill{height:100%;background:linear-gradient(90deg,var(--accent-2),var(--accent));border-radius:99px;min-width:2px;}
.adm .tr-bar .tv{font-size:12.5px;font-weight:700;color:var(--muted);text-align:right;}
.adm .tr-geo{display:flex;flex-wrap:wrap;gap:7px;margin-top:15px;padding-top:13px;border-top:1px solid var(--border);}
.adm .tr-chip{font-size:11.5px;color:var(--muted);background:var(--surface-3);border-radius:99px;padding:3px 9px;}
.adm .tr-chip b{color:var(--ink);font-weight:700;margin-left:2px;}
.adm .sec-title{display:flex;align-items:baseline;gap:10px;margin:4px 2px -4px;}
.adm .sec-title h2{font-size:15px;font-weight:700;}
.adm .sec-title span{font-size:12px;color:var(--faint);}
.adm .health{display:grid;grid-template-columns:1.1fr 2fr;gap:20px;}
.adm .status{padding:18px;display:flex;flex-direction:column;gap:14px;}
.adm .status .live{display:flex;align-items:center;gap:10px;}
.adm .status .pulse{width:11px;height:11px;border-radius:99px;background:var(--good);box-shadow:0 0 0 0 var(--good);animation:admpulse 2.4s infinite;}
@keyframes admpulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--good) 55%,transparent);}70%{box-shadow:0 0 0 9px transparent;}100%{box-shadow:0 0 0 0 transparent;}}
.adm .status .live b{font-size:15px;font-weight:700;}
.adm .meta{display:flex;flex-direction:column;gap:9px;}
.adm .mrow{display:flex;align-items:center;justify-content:space-between;font-size:12.5px;}
.adm .mrow .l{color:var(--faint);}
.adm .mrow .v{font-weight:600;}
.adm .shortcuts{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:18px;}
.adm .sc{display:flex;align-items:center;gap:11px;padding:14px;border-radius:12px;border:1px solid var(--border);background:var(--surface-2);text-decoration:none;color:var(--ink);}
.adm .sc:hover{border-color:var(--border-strong);transform:translateY(-2px);}
.adm .sc .si{width:34px;height:34px;border-radius:9px;display:grid;place-items:center;color:#fff;font-weight:800;font-size:12px;font-family:"Bricolage Grotesque",sans-serif;flex-shrink:0;}
.adm .sc .st b{font-size:13px;display:block;}
.adm .sc .st span{font-size:11px;color:var(--faint);}
.adm .sc .go{margin-left:auto;color:var(--faint);}
@media(max-width:1080px){.adm .kpis{grid-template-columns:repeat(2,1fr);}.adm .grid-2,.adm .health{grid-template-columns:1fr;}}
@media(max-width:760px){.adm .app{grid-template-columns:1fr;}.adm .side{position:static;height:auto;flex-direction:row;flex-wrap:wrap;align-items:center;}.adm .side .nav,.adm .side .user{display:none;}.adm .content,.adm .top{padding-left:16px;padding-right:16px;}.adm .shortcuts{grid-template-columns:1fr 1fr;}}
@media(max-width:460px){.adm .kpis{grid-template-columns:1fr;}}
@media(prefers-reduced-motion:reduce){.adm *{animation:none!important;transition:none!important;}}
.adm a:focus-visible,.adm button:focus-visible,.adm input:focus-visible{outline:2px solid var(--accent);outline-offset:2px;}
`;
