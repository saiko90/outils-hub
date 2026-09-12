"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { track } from "@vercel/analytics";
import { TOOLS, CATEGORIES, CAT_EMOJI, isPro, type Tool } from "@/lib/catalog";

/** Événement de conversion : quel outil est réellement ouvert (identifie les outils « héros »). */
function trackOpen(t: Tool, from: string) {
  try { track("tool_open", { slug: t.slug, cat: t.cat, ch: !!t.ch, pro: isPro(t.slug), from }); } catch { /* no-op */ }
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

function scoreTool(t: Tool, q: string): number {
  if (!q) return 1;
  const n = norm(t.name), tag = norm(t.tagline), tags = t.tags.map(norm);
  if (n.startsWith(q)) return 100;
  if (n.includes(q)) return 80;
  if (tags.some((x) => x.startsWith(q))) return 60;
  if (tag.includes(q)) return 40;
  if (tags.some((x) => x.includes(q))) return 30;
  if (norm(t.cat).includes(q)) return 20;
  return 0;
}
function filterTools(q: string, cat: string): Tool[] {
  return TOOLS.map((t) => ({ t, s: scoreTool(t, q) }))
    .filter((x) => x.s > 0 && (cat === "Tous" || x.t.cat === cat))
    .sort((a, b) => b.s - a.s || a.t.name.localeCompare(b.t.name))
    .map((x) => x.t);
}

function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const nt = norm(text), i = nt.indexOf(q);
  if (i < 0) return <>{text}</>;
  return <>{text.slice(0, i)}<mark>{text.slice(i, i + q.length)}</mark>{text.slice(i + q.length)}</>;
}

/* étincelles au clic (WAAPI, sans lib) */
function burst(x: number, y: number) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cols = ["#a78bfa", "#22d3ee", "#f472b6", "#34d399", "#fbbf24"];
  for (let i = 0; i < 10; i++) {
    const s = document.createElement("span");
    const a = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
    const d = 26 + Math.random() * 34;
    s.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:7px;height:7px;border-radius:50%;pointer-events:none;z-index:90;background:${cols[i % cols.length]};box-shadow:0 0 8px ${cols[i % cols.length]}`;
    document.body.appendChild(s);
    s.animate(
      [{ transform: "translate(-50%,-50%) scale(1)", opacity: 1 },
       { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d}px)) scale(0)`, opacity: 0 }],
      { duration: 560 + Math.random() * 220, easing: "cubic-bezier(.22,1,.36,1)" }
    ).onfinish = () => s.remove();
  }
}

function Sparkles() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    let raf = 0, w = 0, h = 0;
    const N = Math.min(90, Math.floor(window.innerWidth / 16));
    const cols = ["#a78bfa", "#22d3ee", "#f472b6", "#34d399", "#fbbf24"];
    const ps = Array.from({ length: N }, () => ({
      x: Math.random(), y: Math.random(), r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.0004, vy: (Math.random() - 0.5) * 0.0004 - 0.0002,
      a: Math.random() * 0.5 + 0.2, tw: Math.random() * Math.PI * 2, c: cols[(Math.random() * cols.length) | 0],
    }));
    const resize = () => { w = cv.width = innerWidth * devicePixelRatio; h = cv.height = innerHeight * devicePixelRatio; cv.style.width = innerWidth + "px"; cv.style.height = innerHeight + "px"; };
    resize(); addEventListener("resize", resize);
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.x += p.vx; p.y += p.vy; p.tw += 0.02;
        if (p.y < -0.02) p.y = 1.02; if (p.x < -0.02) p.x = 1.02; if (p.x > 1.02) p.x = -0.02;
        const tw = (Math.sin(p.tw) + 1) / 2;
        ctx.globalAlpha = p.a * (0.4 + tw * 0.6); ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x * w, p.y * h, p.r * devicePixelRatio * (0.7 + tw * 0.6), 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1; raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="sparkles" aria-hidden />;
}

function CountUp({ to, dur = 1100 }: { to: number; dur?: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const tick = (t: number) => { const p = Math.min(1, (t - t0) / dur); setN(Math.round((1 - Math.pow(1 - p, 3)) * to)); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [to, dur]);
  return <>{n}</>;
}

function Card({ t, q, i }: { t: Tool; q: string; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLAnchorElement>(null);
  function onMove(e: React.MouseEvent) {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", px * 100 + "%"); el.style.setProperty("--my", py * 100 + "%");
    el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 6}deg) rotateY(${(px - 0.5) * 8}deg) translateY(-4px)`;
    const b = btn.current; if (b) { const br = b.getBoundingClientRect(); const bx = e.clientX - (br.left + br.width / 2), by = e.clientY - (br.top + br.height / 2); b.style.transform = `translate(${bx * 0.12}px, ${by * 0.18}px)`; }
  }
  function onLeave() { const el = ref.current; if (el) el.style.transform = ""; const b = btn.current; if (b) b.style.transform = ""; }
  const initials = t.name.slice(0, 2).toUpperCase();
  return (
    <motion.div ref={ref} className="card" onMouseMove={onMove} onMouseLeave={onLeave} style={{ ["--c1" as string]: t.from }}
      initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(i * 0.03, 0.4), ease: [0.22, 1, 0.36, 1] }}>
      <div className="halo" />
      <div className="top">
        <Link href={`/o/${t.slug}`} className="logo" style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }} aria-label={`Détails ${t.name}`}>{initials}</Link>
        <div>
          <div className="nm"><Link href={`/o/${t.slug}`} style={{ color: "inherit", textDecoration: "none" }}><Highlight text={t.name} q={q} /></Link></div>
          <div className="cat">{t.ch && <span className="ch">🇨🇭</span>}{CAT_EMOJI[t.cat]} {t.cat}</div>
        </div>
      </div>
      <div className="tag"><Highlight text={t.tagline} q={q} /></div>
      <a ref={btn} className="go" href={t.url} target="_blank" rel="noopener noreferrer" onClick={() => trackOpen(t, "card")} style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}>
        <span className="sheen" />Utiliser <span aria-hidden>→</span>
      </a>
    </motion.div>
  );
}

/* palette de commande ⌘K */
function Palette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inp = useRef<HTMLInputElement>(null);
  const res = useMemo(() => filterTools(norm(q.trim()), "Tous").slice(0, 8), [q]);
  useEffect(() => { if (open) { setQ(""); setSel(0); setTimeout(() => inp.current?.focus(), 30); } }, [open]);
  useEffect(() => { setSel(0); }, [q]);
  const open2 = useCallback((t: Tool) => { trackOpen(t, "palette"); window.open(t.url, "_blank", "noopener"); onClose(); }, [onClose]);
  function onKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, res.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    else if (e.key === "Enter" && res[sel]) { open2(res[sel]); }
    else if (e.key === "Escape") onClose();
  }
  if (!open) return null;
  return (
    <div className="palette-back" onClick={onClose}>
      <motion.div className="palette" onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, y: -14, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.2 }}>
        <div className="pin">
          <span style={{ color: "var(--muted)" }} aria-hidden>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
          </span>
          <input ref={inp} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey} placeholder="Aller à un outil…" aria-label="Recherche rapide" />
        </div>
        <div className="plist">
          {res.length === 0 ? <div className="pempty">Aucun outil pour « {q} »</div> :
            res.map((t, idx) => (
              <a key={t.slug} className={"pitem" + (idx === sel ? " sel" : "")} href={t.url} target="_blank" rel="noopener noreferrer"
                onMouseEnter={() => setSel(idx)} onClick={() => { trackOpen(t, "palette"); onClose(); }}>
                <span className="plogo" style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}>{t.name.slice(0, 2).toUpperCase()}</span>
                <span className="pmeta"><b>{t.name}</b><small>{t.tagline}</small></span>
              </a>
            ))}
        </div>
        <div className="phint"><span><kbd>↑</kbd><kbd>↓</kbd> naviguer</span><span><kbd>↵</kbd> ouvrir</span><span><kbd>esc</kbd> fermer</span></div>
      </motion.div>
    </div>
  );
}

export default function Hub() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Tous");
  const [stuck, setStuck] = useState(false);
  const [palette, setPalette] = useState(false);
  const glowRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const { scrollY, scrollYProgress } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -120]);
  const heroFade = useTransform(scrollY, [0, 360], [1, 0]);
  const nq = norm(q.trim());

  useEffect(() => {
    try { const u = new URL(window.location.href); const v = u.searchParams.get("q"); if (v) setQ(v); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 40);
    onScroll(); addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const g = glowRef.current; if (!g) return;
    const onMove = (e: MouseEvent) => { g.style.left = e.clientX + "px"; g.style.top = e.clientY + "px"; };
    addEventListener("pointermove", onMove); return () => removeEventListener("pointermove", onMove);
  }, []);
  useEffect(() => {
    const onDown = (e: PointerEvent) => burst(e.clientX, e.clientY);
    addEventListener("pointerdown", onDown); return () => removeEventListener("pointerdown", onDown);
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setPalette((p) => !p); }
      else if (e.key === "/" && document.activeElement?.tagName !== "INPUT") { e.preventDefault(); searchRef.current?.focus(); }
    };
    addEventListener("keydown", onKey); return () => removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => filterTools(nq, cat), [nq, cat]);
  const catCount = useMemo(() => new Set(TOOLS.map((t) => t.cat)).size, []);

  return (
    <>
      <motion.div className="progress" style={{ scaleX: scrollYProgress, width: "100%" }} aria-hidden />
      <div className="fx" aria-hidden><div className="aurora a1" /><div className="aurora a2" /><div className="aurora a3" /><div className="aurora a4" /></div>
      <div className="grid-fx" aria-hidden /><div className="noise" aria-hidden />
      <Sparkles /><div className="cursor-glow" ref={glowRef} aria-hidden />
      <Palette open={palette} onClose={() => setPalette(false)} />

      <div className={"topbar" + (stuck ? " stuck" : "")}>
        <div className="brand">
          <span className="mark" aria-hidden><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 7l4-3 4 3 4-3 4 3v10l-4 3-4-3-4 3-4-3z" stroke="#06060c" strokeWidth="2" strokeLinejoin="round" /></svg></span>
          <span><b>outils</b><span className="tld">.ch</span></span>
        </div>
        <button className="kbtn" onClick={() => setPalette(true)}>Recherche rapide <kbd>⌘K</kbd></button>
      </div>

      <div className="shell">
        <motion.header className="hero" style={{ y: heroY, opacity: heroFade }}>
          <motion.div className="eyebrow" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="dot" /> Boîte à outils suisse — 100 % gratuit, 100 % navigateur
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.05 }}>
            <span className="g">outils</span><span className="tld">.ch</span>
          </motion.h1>
          <motion.p className="lead" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.14 }}>
            {TOOLS.length} micro-outils rapides pour les développeurs, les créatifs et les Suisses pressés.
            Aucune inscription, aucune donnée envoyée.
          </motion.p>
          <motion.div className="stats" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.24 }}>
            <div className="stat"><div className="n"><CountUp to={TOOLS.length} /></div><div className="l">outils</div></div>
            <div className="stat"><div className="n"><CountUp to={catCount} /></div><div className="l">catégories</div></div>
            <div className="stat"><div className="n">0.-</div><div className="l">gratuit</div></div>
            <div className="stat"><div className="n">100%</div><div className="l">navigateur</div></div>
          </motion.div>
        </motion.header>

        <div className="searchwrap">
          <div className="searchbar">
            <span className="ico" aria-hidden><svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></span>
            <input ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un outil… (ex. couleur, iban, json, durée)  — appuie sur /" aria-label="Rechercher un outil" />
            {q && <button className="clear" onClick={() => setQ("")} aria-label="Effacer">✕</button>}
          </div>
          <div className="chips">
            {CATEGORIES.map((c) => (
              <button key={c} className={"chip" + (cat === c ? " on" : "")} onClick={() => setCat(c)}>{CAT_EMOJI[c]} {c}</button>
            ))}
          </div>
        </div>

        <div className="count">
          {results.length === 0 ? "Aucun outil trouvé" : results.length === TOOLS.length ? `Les ${TOOLS.length} outils` : `${results.length} outil${results.length > 1 ? "s" : ""} trouvé${results.length > 1 ? "s" : ""}`}
        </div>

        {results.length === 0 ? (
          <div className="empty"><div className="big">🔍</div><div>Rien pour « {q} »{cat !== "Tous" ? ` dans ${cat}` : ""}.</div><button onClick={() => { setQ(""); setCat("Tous"); }}>Voir tous les outils</button></div>
        ) : (
          <div className="grid">{results.map((t, i) => <Card key={t.slug} t={t} q={nq} i={i} />)}</div>
        )}

        <footer className="foot">
          <span className="made">🇨🇭 Fait en Suisse — Swiss Digital Studio</span>
          <span>outils.ch · {TOOLS.length} outils · aucune donnée envoyée</span>
        </footer>
      </div>
    </>
  );
}
