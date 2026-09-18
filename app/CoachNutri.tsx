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
    hello: "Coucou, c'est Vito 🥕 Dis-moi ce que tu as mangé ou ce que tu prévois, et je t'aide à équilibrer ta journée !",
    notReady: "Le coach sera activé très bientôt. Reviens dans un instant !",
    err: "Oups, petit souci de connexion. Réessaie dans un moment.",
    limit: "Tu as atteint ta limite de messages pour aujourd'hui — on garde Vito léger et rapide 🥕 Reviens demain !",
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
    hello: "Hoi, ich bin Vito 🥕 Sag mir, was du gegessen oder geplant hast, und ich helfe dir, deinen Tag auszugleichen!",
    notReady: "Der Coach wird ganz bald aktiviert. Schau gleich nochmal vorbei!",
    err: "Ups, kleines Verbindungsproblem. Versuch es gleich nochmal.",
    limit: "Du hast dein heutiges Nachrichtenlimit erreicht 🥕 Komm morgen wieder!",
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
    hello: "Hi, I'm Vito 🥕 Tell me what you ate or plan to eat, and I'll help you balance your day!",
    notReady: "The coach will be activated very soon. Check back in a moment!",
    err: "Oops, small connection hiccup. Try again in a moment.",
    limit: "You've reached today's message limit 🥕 Come back tomorrow!",
    disclaimer: "Vito gives general nutrition tips, not medical advice. For personalised guidance, see a health professional.",
  },
} as const;

/* ---------------- Mascotte Vito (le radis) ---------------- */
function Avo({ state, size = 120 }: { state: AvoState; size?: number }) {
  return (
    <div className={`avo ${state}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 200 210" width={size} height={size * 1.05}>
        {/* bras gauche (petite feuille qui salue) */}
        <g className="avo-armL">
          <path d="M52 140 q-22 2 -34 -14" fill="none" stroke="#3fae5f" strokeWidth="7" strokeLinecap="round" />
          <ellipse cx="16" cy="122" rx="12" ry="7" fill="#6ed07a" transform="rotate(-28 16 122)" />
        </g>
        {/* bras droit (petite feuille) */}
        <path d="M148 142 q22 2 32 18" fill="none" stroke="#3fae5f" strokeWidth="7" strokeLinecap="round" />
        <ellipse cx="184" cy="164" rx="12" ry="7" fill="#6ed07a" transform="rotate(30 184 164)" />

        <g className="avo-body">
          {/* fanes (feuilles du radis) */}
          <path d="M100 96 C82 64 54 54 50 34 C74 40 94 66 100 92 Z" fill="#5cc26a" />
          <path d="M100 96 C118 64 146 54 150 34 C126 40 106 66 100 92 Z" fill="#4bb25c" />
          <path d="M100 96 C93 60 97 36 100 30 C103 36 107 60 100 96 Z" fill="#63cf72" />
          <path d="M66 48 q20 12 32 34" fill="none" stroke="#2f9c4c" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M134 48 q-20 12 -32 34" fill="none" stroke="#2f9c4c" strokeWidth="2.4" strokeLinecap="round" />
          {/* bulbe du radis (rouge, pointe en bas) */}
          <path d="M100 90 C58 90 44 120 49 148 C53 172 80 198 100 202 C120 198 147 172 151 148 C156 120 142 90 100 90 Z" fill="#f0506e" />
          <path d="M100 90 C58 90 44 120 49 148 C53 172 80 198 100 202 C120 198 147 172 151 148 C156 120 142 90 100 90 Z" fill="none" stroke="#d83a58" strokeWidth="3" />
          {/* ventre plus clair */}
          <ellipse cx="100" cy="150" rx="34" ry="38" fill="#ff738d" opacity="0.45" />
          {/* joues */}
          <circle cx="70" cy="146" r="9" fill="#ffd0d8" opacity="0.7" />
          <circle cx="130" cy="146" r="9" fill="#ffd0d8" opacity="0.7" />
          {/* yeux */}
          <g className="avo-eyes">
            <ellipse cx="83" cy="132" rx="11" ry="12" fill="#fff" />
            <ellipse cx="117" cy="132" rx="11" ry="12" fill="#fff" />
            <circle className="avo-pupil" cx="83" cy="134" r="5" fill="#3a2230" />
            <circle className="avo-pupil" cx="117" cy="134" r="5" fill="#3a2230" />
            <circle cx="85" cy="131" r="1.7" fill="#fff" />
            <circle cx="119" cy="131" r="1.7" fill="#fff" />
          </g>
          {/* sourcils */}
          <path className="avo-brow" d="M73 116 q10 -5 20 -1" fill="none" stroke="#d83a58" strokeWidth="4" strokeLinecap="round" />
          <path className="avo-brow" d="M107 115 q10 -4 20 1" fill="none" stroke="#d83a58" strokeWidth="4" strokeLinecap="round" />
          {/* bouche */}
          <ellipse className="avo-mouth" cx="100" cy="156" rx="12" ry="8" fill="#b02a44" />
        </g>
        {/* bulle réflexion */}
        <g className="avo-think">
          <circle cx="152" cy="42" r="4" fill="#f6a8b6" />
          <circle cx="165" cy="32" r="6" fill="#f6a8b6" />
          <circle cx="181" cy="22" r="8" fill="#f6a8b6" />
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
        const data = (await r.json()) as { reply?: string; busy?: boolean };
        const reply = data.reply || t.err;
        // On ne décompte le quota que pour une vraie réponse (pas un « je suis débordé » ni une erreur).
        if (data.reply && !data.busy) setUsed(bumpUsage());
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
      <p className="cn-disc">🥕 {t.disclaimer}</p>
    </section>
  );
}

/* ---------------- styles mascotte ---------------- */
const AVO_CSS = `
.avo{position:relative;display:inline-block}
.avo svg{overflow:visible;display:block}
.avo .avo-body{transform-origin:100px 200px;animation:avoBob 3.4s ease-in-out infinite}
.avo .avo-armL{transform-origin:48px 140px}
.avo .avo-eyes{transform-origin:100px 132px;animation:avoBlink 4.2s infinite}
.avo .avo-mouth{transform-origin:100px 156px;transform:scaleY(.5)}
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
.cn{margin:14px 0 8px;color:#2b3243}
/* paywall */
.cn-lock{display:flex;gap:22px;align-items:center;flex-wrap:wrap;background:linear-gradient(135deg,#fdeef1,#e9f8ee);border:1px solid #f3d0d8;border-radius:20px;padding:24px}
.cn-lockart{flex:none}
.cn-locktxt{flex:1;min-width:240px}
.cn-pro{display:inline-block;font-size:.72rem;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:#fff;background:#ef4457;border-radius:99px;padding:3px 10px}
.cn-pro.sm{font-size:.62rem;padding:2px 7px;vertical-align:middle;background:#16a34a}
.cn-locktxt h3{margin:10px 0 6px;font-size:1.28rem;line-height:1.2;color:#232a37}
.cn-locktxt p{margin:0 0 12px;color:#4b5563;font-size:.93rem;line-height:1.55}
.cn-feats{list-style:none;margin:0 0 16px;padding:0;display:flex;flex-direction:column;gap:8px}
.cn-feats li{display:flex;gap:9px;align-items:flex-start;font-size:.92rem;color:#3b4252}
.cn-feats li span{color:#16a34a;font-weight:800;flex:none}
.cn-cta{background:linear-gradient(135deg,#34d17f,#16a34a);color:#fff;border:0;border-radius:12px;padding:13px 22px;font-weight:800;font-size:.97rem;cursor:pointer;box-shadow:0 12px 24px -10px rgba(22,163,74,.5)}
/* chat */
.cn-head{display:flex;align-items:center;gap:12px;padding:10px 4px 14px;border-bottom:1px solid #e7ebf2}
.cn-name{font-weight:800;font-size:1.02rem;color:#232a37}
.cn-status{font-size:.8rem;color:#9aa2b4}
.cn-scroll{max-height:380px;overflow-y:auto;padding:16px 4px;display:flex;flex-direction:column;gap:10px}
.cn-bubble{max-width:82%;padding:11px 14px;border-radius:16px;font-size:.94rem;line-height:1.5;white-space:pre-wrap;word-wrap:break-word}
.cn-bubble.user{align-self:flex-end;background:linear-gradient(135deg,#34d17f,#16a34a);color:#fff;font-weight:600;border-bottom-right-radius:5px}
.cn-bubble.model{align-self:flex-start;background:#f4f6fa;border:1px solid #e7ebf2;color:#2b3243;border-bottom-left-radius:5px}
.cn-hello{color:#4b5563}
.cn-typing{display:flex;gap:5px;align-items:center}
.cn-typing span{width:7px;height:7px;border-radius:50%;background:#16a34a;animation:cnDot 1.2s infinite}
.cn-typing span:nth-child(2){animation-delay:.2s}
.cn-typing span:nth-child(3){animation-delay:.4s}
@keyframes cnDot{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}
.cn-starters{display:flex;flex-wrap:wrap;gap:8px;padding:4px 4px 10px}
.cn-starters button{background:#e9f8ee;border:1px solid #bfe6cd;color:#16a34a;border-radius:99px;padding:9px 14px;font-size:.84rem;font-weight:600;cursor:pointer}
.cn-starters button:hover{background:#dcf3e4}
.cn-input{display:flex;gap:8px;padding:8px 0}
.cn-input input{flex:1;background:#f6f8fb;border:1.5px solid #e7ebf2;border-radius:13px;color:#232a37;padding:13px 15px;font-size:.94rem}
.cn-input input:focus{outline:none;border-color:#8fdcac}
.cn-input button{background:linear-gradient(135deg,#34d17f,#16a34a);color:#fff;border:0;border-radius:13px;width:48px;font-size:1.15rem;font-weight:800;cursor:pointer}
.cn-input button:disabled{opacity:.4;cursor:not-allowed}
.cn-disc{margin:6px 0 0;font-size:.78rem;line-height:1.55;color:#9aa2b4;border-top:1px solid #e7ebf2;padding-top:10px}
`;
