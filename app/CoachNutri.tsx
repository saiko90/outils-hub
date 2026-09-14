"use client";

import { useEffect, useRef, useState } from "react";
import { type Lang } from "@/lib/i18n";

export type CoachCtx = {
  lang: Lang;
  profil?: Record<string, unknown>;
  cible?: number;
  bmr?: number;
  tdee?: number;
  macrosCible?: { proteines: number; glucides: number; lipides: number };
  aujourdhui?: { kcal: number; prot: number; gluc: number; lip: number; aliments: { nom: string; grammes: number; kcal: number }[] };
  poids?: { debut: number; actuel: number; delta: number } | null;
};

type Msg = { role: "user" | "model"; text: string };
type AvoState = "idle" | "thinking" | "talking";

// Limite de messages par 24 h (protège le coût API si une conversation s'emballe).
const DAILY_LIMIT = 20;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
function readUsage(): { day: string; count: number } {
  const day = todayKey();
  try {
    const raw = localStorage.getItem("calorio.coach.usage");
    if (raw) {
      const u = JSON.parse(raw) as { day: string; count: number };
      if (u.day === day) return u;
    }
  } catch {
    /* ignore */
  }
  return { day, count: 0 };
}
function bumpUsage(): number {
  const u = readUsage();
  u.count += 1;
  try {
    localStorage.setItem("calorio.coach.usage", JSON.stringify(u));
  } catch {
    /* ignore */
  }
  return u.count;
}

const L = {
  fr: {
    proBadge: "Pro", coach: "Vito, ton coach nutrition",
    lockTitle: "Discute avec Vito, ton coach nutrition IA",
    lockSub: "Il connaît tes calories, ce que tu as mangé et ton objectif — et te dit quoi manger ce soir, comment équilibrer, des idées de repas.",
    feats: ["Conseils personnalisés à partir de ton journal du jour", "Idées de repas et de snacks adaptés à ton objectif", "Réponses instantanées, 100 % nutrition, sans jugement"],
    cta: "Passer en Pro", soon: "Bientôt disponible",
    placeholder: "Écris à Vito…", send: "Envoyer",
    starters: ["Qu'est-ce que je mange ce soir ?", "Il me reste combien de calories ?", "Un snack sain à me conseiller ?"],
    hello: "Coucou, c'est Vito 🌱 Dis-moi ce que tu as mangé ou ce que tu prévois, et je t'aide à équilibrer ta journée !",
    notReady: "Le coach sera activé très bientôt. Reviens dans un instant !",
    err: "Oups, petit souci de connexion. Réessaie dans un moment.",
    limit: "Tu as atteint ta limite de messages pour aujourd'hui — on garde Vito léger et rapide 🌱 Reviens demain !",
    disclaimer: "Vito donne des conseils généraux de nutrition, pas un avis médical. Pour un suivi personnalisé (pathologie, trouble alimentaire, sport de haut niveau), consulte un·e professionnel·le de santé.",
  },
  de: {
    proBadge: "Pro", coach: "Vito, dein Ernährungscoach",
    lockTitle: "Chatte mit Vito, deinem KI-Ernährungscoach",
    lockSub: "Er kennt deine Kalorien, dein Essen und dein Ziel — und sagt dir, was du heute Abend essen sollst und wie du ausgleichst.",
    feats: ["Persönliche Tipps aus deinem Tagesjournal", "Mahlzeiten- und Snack-Ideen für dein Ziel", "Sofortige Antworten, 100 % Ernährung, ohne Urteil"],
    cta: "Auf Pro upgraden", soon: "Bald verfügbar",
    placeholder: "Schreib Vito…", send: "Senden",
    starters: ["Was esse ich heute Abend?", "Wie viele Kalorien bleiben mir?", "Ein gesunder Snack?"],
    hello: "Hoi, ich bin Vito 🌱 Sag mir, was du gegessen oder geplant hast, und ich helfe dir, deinen Tag auszugleichen!",
    notReady: "Der Coach wird ganz bald aktiviert. Schau gleich nochmal vorbei!",
    err: "Ups, kleines Verbindungsproblem. Versuch es gleich nochmal.",
    limit: "Du hast dein heutiges Nachrichtenlimit erreicht 🌱 Komm morgen wieder!",
    disclaimer: "Vito gibt allgemeine Ernährungstipps, keine medizinische Beratung. Für persönliche Begleitung eine Fachperson beiziehen.",
  },
  en: {
    proBadge: "Pro", coach: "Vito, your nutrition coach",
    lockTitle: "Chat with Vito, your AI nutrition coach",
    lockSub: "He knows your calories, what you ate and your goal — and tells you what to eat tonight and how to balance your day.",
    feats: ["Personalised tips from your daily log", "Meal and snack ideas for your goal", "Instant answers, 100% nutrition, no judgement"],
    cta: "Go Pro", soon: "Coming soon",
    placeholder: "Message Vito…", send: "Send",
    starters: ["What should I eat tonight?", "How many calories do I have left?", "A healthy snack idea?"],
    hello: "Hi, I'm Vito 🌱 Tell me what you ate or plan to eat, and I'll help you balance your day!",
    notReady: "The coach will be activated very soon. Check back in a moment!",
    err: "Oops, small connection hiccup. Try again in a moment.",
    limit: "You've reached today's message limit 🌱 Come back tomorrow!",
    disclaimer: "Vito gives general nutrition tips, not medical advice. For personalised guidance, see a health professional.",
  },
} as const;

/* ---------------- Mascotte Vito (la pousse) ---------------- */
function Avo({ state, size = 120 }: { state: AvoState; size?: number }) {
  return (
    <div className={`avo ${state}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 200 210" width={size} height={size * 1.05}>
        {/* bras gauche (feuille qui salue) */}
        <g className="avo-armL">
          <path d="M58 138 q-24 -2 -36 -22" fill="none" stroke="#57c274" strokeWidth="8" strokeLinecap="round" />
          <ellipse cx="18" cy="110" rx="12" ry="7" fill="#7dd992" transform="rotate(-32 18 110)" />
        </g>
        {/* bras droit (feuille) */}
        <path d="M142 140 q22 0 32 18" fill="none" stroke="#57c274" strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="182" cy="160" rx="12" ry="7" fill="#7dd992" transform="rotate(32 182 160)" />
        {/* corps pousse */}
        <g className="avo-body">
          {/* deux feuilles */}
          <path d="M100 66 C70 22 28 26 33 60 C37 90 80 78 100 66 Z" fill="#6ed88a" />
          <path d="M100 66 C130 22 172 26 167 60 C163 90 120 78 100 66 Z" fill="#54c877" />
          <path d="M60 46 q20 9 36 16" fill="none" stroke="#3fae5f" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M140 46 q-20 9 -36 16" fill="none" stroke="#3fae5f" strokeWidth="2.5" strokeLinecap="round" />
          {/* tige */}
          <path d="M100 66 L100 100" stroke="#57c274" strokeWidth="7" strokeLinecap="round" />
          {/* graine / corps */}
          <ellipse cx="100" cy="146" rx="52" ry="52" fill="#effadf" />
          <ellipse cx="100" cy="146" rx="52" ry="52" fill="none" stroke="#cdeaa9" strokeWidth="3" />
          {/* joues */}
          <circle cx="70" cy="156" r="9" fill="#f6b9a4" opacity="0.55" />
          <circle cx="130" cy="156" r="9" fill="#f6b9a4" opacity="0.55" />
          {/* yeux */}
          <g className="avo-eyes">
            <ellipse cx="82" cy="140" rx="11" ry="12" fill="#fff" />
            <ellipse cx="118" cy="140" rx="11" ry="12" fill="#fff" />
            <circle className="avo-pupil" cx="82" cy="142" r="5" fill="#2f3b2a" />
            <circle className="avo-pupil" cx="118" cy="142" r="5" fill="#2f3b2a" />
            <circle cx="84" cy="139" r="1.6" fill="#fff" />
            <circle cx="120" cy="139" r="1.6" fill="#fff" />
          </g>
          {/* sourcils */}
          <path className="avo-brow" d="M72 124 q10 -5 20 -1" fill="none" stroke="#57c274" strokeWidth="4" strokeLinecap="round" />
          <path className="avo-brow" d="M108 123 q10 -4 20 1" fill="none" stroke="#57c274" strokeWidth="4" strokeLinecap="round" />
          {/* bouche */}
          <ellipse className="avo-mouth" cx="100" cy="166" rx="12" ry="8" fill="#e06a5a" />
        </g>
        {/* bulle réflexion */}
        <g className="avo-think">
          <circle cx="150" cy="40" r="4" fill="#bfe39a" />
          <circle cx="163" cy="30" r="6" fill="#bfe39a" />
          <circle cx="179" cy="20" r="8" fill="#bfe39a" />
        </g>
      </svg>
      <style>{AVO_CSS}</style>
    </div>
  );
}

/* ---------------- Coach ---------------- */
export default function CoachNutri({ ctx, isPro: proProp, onGoPro }: { ctx: CoachCtx; isPro?: boolean; onGoPro?: () => void }) {
  const lang = ctx.lang;
  const t = L[lang] ?? L.fr;
  const [localPro, setLocalPro] = useState(false);
  const isPro = proProp ?? localPro;
  const [ready, setReady] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [avo, setAvo] = useState<AvoState>("idle");
  const [busy, setBusy] = useState(false);
  const [used, setUsed] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const talkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let pro = false;
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("pro") === "preview") {
        localStorage.setItem("calorio.pro", "1");
      }
      pro = localStorage.getItem("calorio.pro") === "1";
    } catch {
      /* ignore */
    }
    setLocalPro(pro);
    setUsed(readUsage().count);
    setReady(true);
  }, []);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [msgs, avo]);

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || busy) return;
    // Limite quotidienne : on bloque avant tout appel API.
    if (readUsage().count >= DAILY_LIMIT) {
      setMsgs((m) => [...m, { role: "user", text: clean }, { role: "model", text: t.limit }]);
      setInput("");
      return;
    }
    const next: Msg[] = [...msgs, { role: "user", text: clean }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    setAvo("thinking");
    setUsed(bumpUsage());
    try {
      const r = await fetch("/api/coach", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next, context: ctx }),
      });
      if (r.status === 503) {
        setMsgs((m) => [...m, { role: "model", text: t.notReady }]);
      } else if (!r.ok) {
        setMsgs((m) => [...m, { role: "model", text: t.err }]);
      } else {
        const data = (await r.json()) as { reply?: string };
        const reply = data.reply || t.err;
        setMsgs((m) => [...m, { role: "model", text: reply }]);
        setAvo("talking");
        if (talkTimer.current) clearTimeout(talkTimer.current);
        talkTimer.current = setTimeout(() => setAvo("idle"), Math.min(6000, 1500 + reply.length * 35));
        setBusy(false);
        return;
      }
    } catch {
      setMsgs((m) => [...m, { role: "model", text: t.err }]);
    }
    setAvo("idle");
    setBusy(false);
  };

  if (!ready) return <div className="cn" style={{ minHeight: 200 }} />;

  /* ---- Paywall (verrouillé, prêt à brancher le paiement) ---- */
  if (!isPro) {
    return (
      <section className="cn cn-lock">
        <style>{CSS}</style>
        <div className="cn-lockart"><Avo state="idle" size={130} /></div>
        <div className="cn-locktxt">
          <span className="cn-pro">🔒 {t.proBadge}</span>
          <h3>{t.lockTitle}</h3>
          <p>{t.lockSub}</p>
          <ul className="cn-feats">
            {t.feats.map((f) => <li key={f}><span>✓</span>{f}</li>)}
          </ul>
          <button className="cn-cta" onClick={onGoPro}>{t.cta}</button>
        </div>
      </section>
    );
  }

  /* ---- Chat (Pro déverrouillé) ---- */
  return (
    <section className="cn">
      <style>{CSS}</style>
      <div className="cn-head">
        <Avo state={avo} size={64} />
        <div>
          <div className="cn-name">{t.coach} <span className="cn-pro sm">{t.proBadge}</span></div>
          <div className="cn-status">{avo === "thinking" ? "…" : "🟢"}</div>
        </div>
      </div>

      <div className="cn-scroll" ref={scroller}>
        {msgs.length === 0 && <div className="cn-bubble model cn-hello">{t.hello}</div>}
        {msgs.map((m, i) => (
          <div key={i} className={`cn-bubble ${m.role}`}>{m.text}</div>
        ))}
        {avo === "thinking" && <div className="cn-bubble model cn-typing"><span></span><span></span><span></span></div>}
      </div>

      {msgs.length === 0 && (
        <div className="cn-starters">
          {t.starters.map((s) => <button key={s} onClick={() => send(s)}>{s}</button>)}
        </div>
      )}

      <div className="cn-input">
        <input
          value={input}
          placeholder={used >= DAILY_LIMIT ? t.limit : t.placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
          disabled={busy || used >= DAILY_LIMIT}
        />
        <button onClick={() => send(input)} disabled={busy || !input.trim() || used >= DAILY_LIMIT} aria-label={t.send}>➤</button>
      </div>
      <p className="cn-disc">🌱 {t.disclaimer}</p>
    </section>
  );
}

/* ---------------- styles mascotte ---------------- */
const AVO_CSS = `
.avo{position:relative;display:inline-block}
.avo svg{overflow:visible;display:block}
.avo .avo-body{transform-origin:100px 198px;animation:avoBob 3.4s ease-in-out infinite}
.avo .avo-armL{transform-origin:58px 138px}
.avo .avo-eyes{transform-origin:100px 140px;animation:avoBlink 4.2s infinite}
.avo .avo-mouth{transform-origin:100px 166px;transform:scaleY(.5)}
.avo .avo-think{opacity:0;transition:opacity .2s}
/* idle : petit coucou du bras */
.avo.idle .avo-armL{animation:avoWave 3.8s ease-in-out infinite}
/* thinking */
.avo.thinking .avo-body{animation:avoTilt 2s ease-in-out infinite}
.avo.thinking .avo-think{opacity:1;animation:avoThink 1.4s ease-in-out infinite}
.avo.thinking .avo-pupil{transform:translateY(-3px)}
.avo.thinking .avo-mouth{transform:scaleY(.25)}
/* talking */
.avo.talking .avo-body{animation:avoBounce .5s ease-in-out infinite}
.avo.talking .avo-mouth{animation:avoTalk .28s ease-in-out infinite}
.avo.talking .avo-armL{animation:avoWave 1.2s ease-in-out infinite}
@keyframes avoBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes avoBounce{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-7px) scale(1.03,.97)}}
@keyframes avoBlink{0%,92%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}
@keyframes avoTalk{0%,100%{transform:scaleY(.35)}50%{transform:scaleY(1)}}
@keyframes avoWave{0%,100%{transform:rotate(0)}50%{transform:rotate(-16deg)}}
@keyframes avoTilt{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
@keyframes avoThink{0%,100%{opacity:.5}50%{opacity:1}}
@media(prefers-reduced-motion:reduce){.avo *{animation:none!important}}
`;

/* ---------------- styles coach ---------------- */
const CSS = `
.cn{margin:14px 0 8px;color:#e6e9f5}
/* paywall */
.cn-lock{display:flex;gap:22px;align-items:center;flex-wrap:wrap;background:linear-gradient(135deg,rgba(34,197,94,.1),rgba(132,204,22,.04));border:1px solid rgba(34,197,94,.3);border-radius:18px;padding:22px}
.cn-lockart{flex:none}
.cn-locktxt{flex:1;min-width:240px}
.cn-pro{display:inline-block;font-size:.72rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#a3e635;background:rgba(163,230,53,.14);border:1px solid rgba(163,230,53,.35);border-radius:99px;padding:3px 10px}
.cn-pro.sm{font-size:.62rem;padding:2px 7px;vertical-align:middle}
.cn-locktxt h3{margin:10px 0 6px;font-size:1.25rem;line-height:1.2}
.cn-locktxt p{margin:0 0 12px;color:#c3c8e2;font-size:.92rem;line-height:1.5}
.cn-feats{list-style:none;margin:0 0 16px;padding:0;display:flex;flex-direction:column;gap:7px}
.cn-feats li{display:flex;gap:9px;align-items:flex-start;font-size:.9rem;color:#d5d9ec}
.cn-feats li span{color:#a3e635;font-weight:800;flex:none}
.cn-cta{background:linear-gradient(135deg,#22c55e,#84cc16);color:#05210f;border:0;border-radius:11px;padding:12px 20px;font-weight:800;font-size:.95rem;cursor:pointer}
/* chat */
.cn-head{display:flex;align-items:center;gap:12px;padding:10px 4px 14px;border-bottom:1px solid rgba(255,255,255,.08)}
.cn-name{font-weight:800;font-size:1rem}
.cn-status{font-size:.8rem;color:#8b93b7}
.cn-scroll{max-height:380px;overflow-y:auto;padding:16px 4px;display:flex;flex-direction:column;gap:10px}
.cn-bubble{max-width:82%;padding:11px 14px;border-radius:15px;font-size:.93rem;line-height:1.45;white-space:pre-wrap;word-wrap:break-word}
.cn-bubble.user{align-self:flex-end;background:linear-gradient(135deg,#22c55e,#84cc16);color:#05210f;font-weight:600;border-bottom-right-radius:5px}
.cn-bubble.model{align-self:flex-start;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);border-bottom-left-radius:5px}
.cn-hello{color:#d5d9ec}
.cn-typing{display:flex;gap:5px;align-items:center}
.cn-typing span{width:7px;height:7px;border-radius:50%;background:#84cc16;animation:cnDot 1.2s infinite}
.cn-typing span:nth-child(2){animation-delay:.2s}
.cn-typing span:nth-child(3){animation-delay:.4s}
@keyframes cnDot{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}
.cn-starters{display:flex;flex-wrap:wrap;gap:7px;padding:4px 4px 10px}
.cn-starters button{background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.3);color:#a3e635;border-radius:99px;padding:8px 13px;font-size:.83rem;cursor:pointer}
.cn-starters button:hover{background:rgba(34,197,94,.16)}
.cn-input{display:flex;gap:8px;padding:8px 0}
.cn-input input{flex:1;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:12px;color:#f5f6fb;padding:12px 14px;font-size:.93rem}
.cn-input input:focus{outline:none;border-color:rgba(34,197,94,.5)}
.cn-input button{background:linear-gradient(135deg,#22c55e,#84cc16);color:#05210f;border:0;border-radius:12px;width:46px;font-size:1.1rem;font-weight:800;cursor:pointer}
.cn-input button:disabled{opacity:.4;cursor:not-allowed}
.cn-disc{margin:6px 0 0;font-size:.76rem;line-height:1.5;color:#8b93b7;border-top:1px solid rgba(255,255,255,.08);padding-top:10px}
`;
