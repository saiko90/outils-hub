"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { type Lang } from "@/lib/i18n";
import { detectFoods, type Detected } from "@/lib/coachDetect";

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
type Conversation = { id: string; title: string; msgs: Msg[]; updated: number };

// Limite de messages par 24 h (protège le coût API si une conversation s'emballe).
const DAILY_LIMIT = 20;
// Clés de persistance (la conversation survit aux changements d'onglet et au rechargement).
const AK = "calorio.coach.active";
const RK = "calorio.coach.recent";
const FK = "calorio.coach.favs";
const MAX_RECENT = 5;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
function loadJSON<T>(k: string, d: T): T {
  try { const r = localStorage.getItem(k); return r ? (JSON.parse(r) as T) : d; } catch { return d; }
}
function saveJSON(k: string, v: unknown) {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ }
}
function newId() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}
function convTitle(msgs: Msg[]): string {
  const u = msgs.find((m) => m.role === "user");
  return u ? u.text.replace(/\s+/g, " ").trim().slice(0, 44) : "";
}
function readUsage(): { day: string; count: number } {
  const day = todayKey();
  try {
    const raw = localStorage.getItem("calorio.coach.usage");
    if (raw) { const u = JSON.parse(raw) as { day: string; count: number }; if (u.day === day) return u; }
  } catch { /* ignore */ }
  return { day, count: 0 };
}
function bumpUsage(): number {
  const u = readUsage();
  u.count += 1;
  try { localStorage.setItem("calorio.coach.usage", JSON.stringify(u)); } catch { /* ignore */ }
  return u.count;
}

/* Rendu léger et sûr des réponses de Vito : **gras**, listes à puces, paragraphes.
   Aucun HTML injecté (on construit des nœuds React) → pas de risque XSS. */
function inlineRich(s: string, keyBase: string): ReactNode[] {
  return s.split(/(\*\*[^*]+\*\*)/g).map((p, i) => {
    const b = p.match(/^\*\*([^*]+)\*\*$/);
    return b ? <strong key={`${keyBase}-${i}`}>{b[1]}</strong> : <span key={`${keyBase}-${i}`}>{p}</span>;
  });
}
function renderRich(text: string): ReactNode {
  const lines = text.split("\n");
  const out: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = (k: string) => {
    if (bullets.length) {
      out.push(<ul className="cn-ul" key={`ul-${k}`}>{bullets.map((li, i) => <li key={i}>{inlineRich(li, `li-${k}-${i}`)}</li>)}</ul>);
      bullets = [];
    }
  };
  lines.forEach((ln, i) => {
    const m = ln.match(/^\s*[-•*]\s+(.*)$/);
    if (m) { bullets.push(m[1]); return; }
    flush(String(i));
    if (ln.trim() === "") return;
    out.push(<p className="cn-p" key={`p-${i}`}>{inlineRich(ln, `p-${i}`)}</p>);
  });
  flush("end");
  return out.length ? out : text;
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
    followups: ["Une autre idée 🔄", "Combien de calories ?", "Et pour le dessert ?"],
    addTitle: "Ajouter au journal :", micTitle: "Dicter", speechLang: "fr-FR",
    hello: "Coucou, c'est Vito 🥕 Dis-moi ce que tu as mangé ou ce que tu prévois, et je t'aide à équilibrer ta journée !",
    openerLeft: (n: number) => `Coucou, c'est Vito 🥕 Il te reste ~${n} kcal aujourd'hui. Envie d'une idée pour équilibrer ta journée ?`,
    openerOver: (n: number) => `Coucou, c'est Vito 🥕 Tu as dépassé d'environ ${n} kcal aujourd'hui — pas de panique, on rééquilibre demain. Je t'aide ?`,
    openerOnTrack: "Bravo, tu es pile dans ton objectif du jour 🥕 Une idée de repas ou un conseil ?",
    notReady: "Le coach sera activé très bientôt. Reviens dans un instant !",
    err: "Oups, petit souci de connexion. Réessaie dans un moment.",
    limit: "Tu as atteint ta limite de messages pour aujourd'hui — on garde Vito léger et rapide 🥕 Reviens demain !",
    disclaimer: "Vito donne des conseils généraux de nutrition, pas un avis médical. Pour un suivi personnalisé (pathologie, trouble alimentaire, sport de haut niveau), consulte un·e professionnel·le de santé.",
    newChat: "Nouvelle", histBtn: "Historique", panelTitle: "Tes conversations", favs: "⭐ Favoris", recent: "🕘 Récentes",
    noRecent: "Aucune conversation récente.", noFavs: "Touche l'étoile pour garder une conversation ici.",
    saveFav: "Garder en favori", unFav: "Retirer des favoris", del: "Supprimer", close: "Fermer", untitled: "Conversation",
  },
  de: {
    proBadge: "Pro", coach: "Vito, dein Ernährungscoach",
    lockTitle: "Chatte mit Vito, deinem KI-Ernährungscoach",
    lockSub: "Er kennt deine Kalorien, dein Essen und dein Ziel — und sagt dir, was du heute Abend essen sollst und wie du ausgleichst.",
    feats: ["Persönliche Tipps aus deinem Tagesjournal", "Mahlzeiten- und Snack-Ideen für dein Ziel", "Sofortige Antworten, 100 % Ernährung, ohne Urteil"],
    cta: "Auf Pro upgraden", soon: "Bald verfügbar",
    placeholder: "Schreib Vito…", send: "Senden",
    starters: ["Was esse ich heute Abend?", "Wie viele Kalorien bleiben mir?", "Ein gesunder Snack?"],
    followups: ["Noch eine Idee 🔄", "Wie viele Kalorien?", "Und als Dessert?"],
    addTitle: "Zum Journal hinzufügen:", micTitle: "Diktieren", speechLang: "de-DE",
    hello: "Hoi, ich bin Vito 🥕 Sag mir, was du gegessen oder geplant hast, und ich helfe dir, deinen Tag auszugleichen!",
    openerLeft: (n: number) => `Hoi, ich bin Vito 🥕 Dir bleiben heute noch ~${n} kcal. Lust auf eine Idee zum Ausgleichen?`,
    openerOver: (n: number) => `Hoi, ich bin Vito 🥕 Du bist heute etwa ${n} kcal drüber — kein Stress, morgen gleichen wir aus. Soll ich helfen?`,
    openerOnTrack: "Stark, du bist genau in deinem Tagesziel 🥕 Eine Mahlzeitidee oder ein Tipp?",
    notReady: "Der Coach wird ganz bald aktiviert. Schau gleich nochmal vorbei!",
    err: "Ups, kleines Verbindungsproblem. Versuch es gleich nochmal.",
    limit: "Du hast dein heutiges Nachrichtenlimit erreicht 🥕 Komm morgen wieder!",
    disclaimer: "Vito gibt allgemeine Ernährungstipps, keine medizinische Beratung. Für persönliche Begleitung eine Fachperson beiziehen.",
    newChat: "Neu", histBtn: "Verlauf", panelTitle: "Deine Gespräche", favs: "⭐ Favoriten", recent: "🕘 Kürzlich",
    noRecent: "Keine kürzlichen Gespräche.", noFavs: "Tippe den Stern, um ein Gespräch hier zu behalten.",
    saveFav: "Als Favorit speichern", unFav: "Aus Favoriten entfernen", del: "Löschen", close: "Schliessen", untitled: "Gespräch",
  },
  en: {
    proBadge: "Pro", coach: "Vito, your nutrition coach",
    lockTitle: "Chat with Vito, your AI nutrition coach",
    lockSub: "He knows your calories, what you ate and your goal — and tells you what to eat tonight and how to balance your day.",
    feats: ["Personalised tips from your daily log", "Meal and snack ideas for your goal", "Instant answers, 100% nutrition, no judgement"],
    cta: "Go Pro", soon: "Coming soon",
    placeholder: "Message Vito…", send: "Send",
    starters: ["What should I eat tonight?", "How many calories do I have left?", "A healthy snack idea?"],
    followups: ["Another idea 🔄", "How many calories?", "And for dessert?"],
    addTitle: "Add to your log:", micTitle: "Dictate", speechLang: "en-US",
    hello: "Hi, I'm Vito 🥕 Tell me what you ate or plan to eat, and I'll help you balance your day!",
    openerLeft: (n: number) => `Hi, I'm Vito 🥕 You have ~${n} kcal left today. Want an idea to balance your day?`,
    openerOver: (n: number) => `Hi, I'm Vito 🥕 You're about ${n} kcal over today — no worries, we'll balance tomorrow. Want a hand?`,
    openerOnTrack: "Nice, you're right on your daily goal 🥕 A meal idea or a tip?",
    notReady: "The coach will be activated very soon. Check back in a moment!",
    err: "Oops, small connection hiccup. Try again in a moment.",
    limit: "You've reached today's message limit 🥕 Come back tomorrow!",
    disclaimer: "Vito gives general nutrition tips, not medical advice. For personalised guidance, see a health professional.",
    newChat: "New", histBtn: "History", panelTitle: "Your conversations", favs: "⭐ Favorites", recent: "🕘 Recent",
    noRecent: "No recent conversations.", noFavs: "Tap the star to keep a conversation here.",
    saveFav: "Save to favorites", unFav: "Remove from favorites", del: "Delete", close: "Close", untitled: "Conversation",
  },
} as const;

/* ---------------- Mascotte Vito (le radis) ---------------- */
function Avo({ state, size = 120 }: { state: AvoState; size?: number }) {
  return (
    <div className={`avo ${state}`} style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 200 210" width={size} height={size * 1.05}>
        <g className="avo-armL">
          <path d="M52 140 q-22 2 -34 -14" fill="none" stroke="#3fae5f" strokeWidth="7" strokeLinecap="round" />
          <ellipse cx="16" cy="122" rx="12" ry="7" fill="#6ed07a" transform="rotate(-28 16 122)" />
        </g>
        <path d="M148 142 q22 2 32 18" fill="none" stroke="#3fae5f" strokeWidth="7" strokeLinecap="round" />
        <ellipse cx="184" cy="164" rx="12" ry="7" fill="#6ed07a" transform="rotate(30 184 164)" />
        <g className="avo-body">
          <path d="M100 96 C82 64 54 54 50 34 C74 40 94 66 100 92 Z" fill="#5cc26a" />
          <path d="M100 96 C118 64 146 54 150 34 C126 40 106 66 100 92 Z" fill="#4bb25c" />
          <path d="M100 96 C93 60 97 36 100 30 C103 36 107 60 100 96 Z" fill="#63cf72" />
          <path d="M66 48 q20 12 32 34" fill="none" stroke="#2f9c4c" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M134 48 q-20 12 -32 34" fill="none" stroke="#2f9c4c" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M100 90 C58 90 44 120 49 148 C53 172 80 198 100 202 C120 198 147 172 151 148 C156 120 142 90 100 90 Z" fill="#f0506e" />
          <path d="M100 90 C58 90 44 120 49 148 C53 172 80 198 100 202 C120 198 147 172 151 148 C156 120 142 90 100 90 Z" fill="none" stroke="#d83a58" strokeWidth="3" />
          <ellipse cx="100" cy="150" rx="34" ry="38" fill="#ff738d" opacity="0.45" />
          <circle cx="70" cy="146" r="9" fill="#ffd0d8" opacity="0.7" />
          <circle cx="130" cy="146" r="9" fill="#ffd0d8" opacity="0.7" />
          <g className="avo-eyes">
            <ellipse cx="83" cy="132" rx="11" ry="12" fill="#fff" />
            <ellipse cx="117" cy="132" rx="11" ry="12" fill="#fff" />
            <circle className="avo-pupil" cx="83" cy="134" r="5" fill="#3a2230" />
            <circle className="avo-pupil" cx="117" cy="134" r="5" fill="#3a2230" />
            <circle cx="85" cy="131" r="1.7" fill="#fff" />
            <circle cx="119" cy="131" r="1.7" fill="#fff" />
          </g>
          <path className="avo-brow" d="M73 116 q10 -5 20 -1" fill="none" stroke="#d83a58" strokeWidth="4" strokeLinecap="round" />
          <path className="avo-brow" d="M107 115 q10 -4 20 1" fill="none" stroke="#d83a58" strokeWidth="4" strokeLinecap="round" />
          <ellipse className="avo-mouth" cx="100" cy="156" rx="12" ry="8" fill="#b02a44" />
        </g>
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
export default function CoachNutri({ ctx, isPro: proProp, onGoPro, seed, onConsumeSeed, onAddDetected }: { ctx: CoachCtx; isPro?: boolean; onGoPro?: () => void; seed?: string; onConsumeSeed?: () => void; onAddDetected?: (d: Detected) => void }) {
  const lang = ctx.lang;
  const t = L[lang] ?? L.fr;
  const [localPro, setLocalPro] = useState(false);
  const isPro = proProp ?? localPro;
  const [ready, setReady] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [recent, setRecent] = useState<Conversation[]>([]);
  const [favs, setFavs] = useState<Conversation[]>([]);
  const [panel, setPanel] = useState(false);
  const [input, setInput] = useState("");
  const [avo, setAvo] = useState<AvoState>("idle");
  const [busy, setBusy] = useState(false);
  const [used, setUsed] = useState(0);
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [listening, setListening] = useState(false);
  const [micOk, setMicOk] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const talkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recRef = useRef<{ stop: () => void } | null>(null);

  // Chargement initial : Pro + conversation active persistée + historique + favoris.
  useEffect(() => {
    let pro = false;
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.get("pro") === "preview") localStorage.setItem("calorio.pro", "1");
      pro = localStorage.getItem("calorio.pro") === "1";
    } catch { /* ignore */ }
    setLocalPro(pro);
    setUsed(readUsage().count);
    const a = loadJSON<{ id?: string; msgs?: Msg[] } | null>(AK, null);
    if (a && Array.isArray(a.msgs)) { setActiveId(a.id || newId()); setMsgs(a.msgs); }
    else setActiveId(newId());
    setRecent(loadJSON<Conversation[]>(RK, []));
    setFavs(loadJSON<Conversation[]>(FK, []));
    setReady(true);
  }, []);

  // Persistance (survit au démontage lors d'un changement d'onglet et au rechargement).
  useEffect(() => { if (ready) saveJSON(AK, { id: activeId, msgs }); }, [ready, activeId, msgs]);
  useEffect(() => { if (ready) saveJSON(RK, recent); }, [ready, recent]);
  useEffect(() => { if (ready) saveJSON(FK, favs); }, [ready, favs]);

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [msgs, avo]);

  const isActiveFav = favs.some((c) => c.id === activeId);

  // Message d'accueil contextuel (calories restantes / dépassement / pile dans l'objectif).
  const opener = useMemo(() => {
    const a = ctx.aujourdhui;
    const cible = ctx.cible;
    if (cible && a) {
      const reste = Math.round(cible - a.kcal);
      if (reste > 250) return t.openerLeft(reste);
      if (reste < -100) return t.openerOver(Math.abs(reste));
      return t.openerOnTrack;
    }
    return t.hello;
  }, [ctx.aujourdhui, ctx.cible, t]);

  // Aliments/recettes cités dans la dernière réponse de Vito → boutons « Ajouter au journal ».
  const lastModel = msgs.length && msgs[msgs.length - 1].role === "model" ? msgs[msgs.length - 1].text : "";
  const detected = useMemo(() => (lastModel && onAddDetected ? detectFoods(lastModel, lang) : []), [lastModel, lang, onAddDetected]);
  const addOne = (d: Detected) => {
    setAdded((a) => ({ ...a, [`${d.kind}:${d.id}`]: true }));
    onAddDetected?.(d);
  };

  // Entrée vocale (dicter à Vito) — Web Speech API, si disponible.
  useEffect(() => {
    try {
      const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
      setMicOk(!!(w.SpeechRecognition || w.webkitSpeechRecognition));
    } catch { /* ignore */ }
  }, []);
  const toggleMic = () => {
    if (listening) { recRef.current?.stop(); setListening(false); return; }
    try {
      const w = window as unknown as { SpeechRecognition?: new () => unknown; webkitSpeechRecognition?: new () => unknown };
      const Ctor = (w.SpeechRecognition || w.webkitSpeechRecognition) as (new () => {
        lang: string; interimResults: boolean; continuous: boolean;
        onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
        onend: (() => void) | null; onerror: (() => void) | null; start: () => void; stop: () => void;
      }) | undefined;
      if (!Ctor) return;
      const rec = new Ctor();
      rec.lang = t.speechLang; rec.interimResults = true; rec.continuous = false;
      let finalText = "";
      rec.onresult = (e) => {
        let s = "";
        for (let i = 0; i < e.results.length; i++) s += e.results[i][0].transcript;
        finalText = s;
        setInput(s);
      };
      rec.onend = () => { setListening(false); if (finalText.trim()) setInput(finalText); };
      rec.onerror = () => setListening(false);
      recRef.current = { stop: () => rec.stop() };
      rec.start();
      setListening(true);
    } catch { setListening(false); }
  };

  const finishTalking = (len: number) => {
    setAvo("talking");
    if (talkTimer.current) clearTimeout(talkTimer.current);
    talkTimer.current = setTimeout(() => setAvo("idle"), Math.min(6000, 1500 + len * 35));
  };

  // Streaming : la réponse de Vito s'affiche en direct. Renvoie true si une réponse a été produite.
  const streamReply = async (next: Msg[]): Promise<boolean> => {
    let acc = "";
    let started = false;
    try {
      const r = await fetch("/api/coach/stream", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next, context: ctx }),
      });
      if (!r.ok || !r.body) return false;
      const reader = r.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const raw = dec.decode(value, { stream: true });
        const chunk = raw.replace(/\u0000EMPTY/g, ""); // sentinelle « aucun token » du serveur
        if (!chunk) continue;
        acc += chunk;
        if (!started) {
          started = true;
          setMsgs((m) => [...m, { role: "model", text: acc }]);
        } else {
          setMsgs((m) => { const c = [...m]; c[c.length - 1] = { role: "model", text: acc }; return c; });
        }
      }
      if (!started || !acc.trim()) return false; // rien reçu → repli
      finishTalking(acc.length);
      setUsed(bumpUsage());
      return true;
    } catch {
      return started; // coupure après des tokens : on garde ce qu'on a
    }
  };

  // Repli non-streaming (robuste, avec réessais côté serveur).
  const fallbackReply = async (next: Msg[]) => {
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
        if (data.reply && !data.busy) setUsed(bumpUsage());
        setMsgs((m) => [...m, { role: "model", text: reply }]);
        finishTalking(reply.length);
        return;
      }
    } catch {
      setMsgs((m) => [...m, { role: "model", text: t.err }]);
    }
    setAvo("idle");
  };

  const send = async (text: string) => {
    const clean = text.trim();
    if (!clean || busy) return;
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
    const ok = await streamReply(next);
    if (!ok) await fallbackReply(next);
    setBusy(false);
  };

  // Question auto-envoyée (ex. « une idée de repas selon mes macros ») quand on ouvre Vito depuis un bouton.
  const seedSent = useRef("");
  useEffect(() => {
    if (!ready || !isPro || !seed || busy) return;
    if (seedSent.current === seed) return;
    seedSent.current = seed;
    onConsumeSeed?.();
    send(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, isPro, seed]);

  // Archive la conversation active (favori → mise à jour ; sinon → récentes).
  const archiveActive = () => {
    if (!msgs.length) return;
    const snap: Conversation = { id: activeId, title: convTitle(msgs) || t.untitled, msgs, updated: Date.now() };
    if (favs.some((c) => c.id === snap.id)) setFavs((prev) => prev.map((c) => (c.id === snap.id ? snap : c)));
    else setRecent((prev) => [snap, ...prev.filter((c) => c.id !== snap.id)].slice(0, MAX_RECENT));
  };
  const newConversation = () => {
    archiveActive();
    setMsgs([]); setActiveId(newId()); setInput(""); setPanel(false); seedSent.current = "";
  };
  const openConversation = (conv: Conversation) => {
    archiveActive();
    setMsgs(conv.msgs); setActiveId(conv.id);
    setRecent((prev) => prev.filter((c) => c.id !== conv.id)); // devient l'active
    setPanel(false);
  };
  const toggleFav = () => {
    if (favs.some((c) => c.id === activeId)) { setFavs((prev) => prev.filter((c) => c.id !== activeId)); return; }
    if (!msgs.length) return;
    const snap: Conversation = { id: activeId, title: convTitle(msgs) || t.untitled, msgs, updated: Date.now() };
    setFavs((prev) => [snap, ...prev.filter((c) => c.id !== snap.id)].slice(0, 50));
    setRecent((prev) => prev.filter((c) => c.id !== activeId));
  };
  const deleteFav = (id: string) => setFavs((prev) => prev.filter((c) => c.id !== id));
  const deleteRecent = (id: string) => setRecent((prev) => prev.filter((c) => c.id !== id));

  if (!ready) return <div className="cn" style={{ minHeight: 200 }} />;

  /* ---- Paywall (verrouillé) ---- */
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
        <div className="cn-headmid">
          <div className="cn-name">{t.coach} <span className="cn-pro sm">{t.proBadge}</span></div>
          <div className="cn-status">{avo === "thinking" ? "…" : "🟢"}</div>
        </div>
        <div className="cn-headact">
          <button className={`cn-hact ${isActiveFav ? "on" : ""}`} onClick={toggleFav} title={isActiveFav ? t.unFav : t.saveFav} aria-label={isActiveFav ? t.unFav : t.saveFav} disabled={!msgs.length}>{isActiveFav ? "★" : "☆"}</button>
          <button className="cn-hact" onClick={() => setPanel(true)} title={t.histBtn} aria-label={t.histBtn}>🕘</button>
          <button className="cn-hact" onClick={newConversation} title={t.newChat} aria-label={t.newChat}>✏️</button>
        </div>
      </div>

      <div className="cn-scroll" ref={scroller}>
        {msgs.length === 0 && <div className="cn-bubble model cn-hello">{opener}</div>}
        {msgs.map((m, i) => (
          <div key={i} className={`cn-bubble ${m.role}`}>{m.role === "model" ? renderRich(m.text) : m.text}</div>
        ))}
        {avo === "thinking" && <div className="cn-bubble model cn-typing"><span></span><span></span><span></span></div>}
      </div>

      {msgs.length === 0 ? (
        <div className="cn-starters">
          {t.starters.map((s) => <button key={s} onClick={() => send(s)} disabled={busy || used >= DAILY_LIMIT}>{s}</button>)}
        </div>
      ) : lastModel ? (
        <>
          {detected.length > 0 && (
            <div className="cn-addrow">
              <span className="cn-addlbl">{t.addTitle}</span>
              {detected.map((d) => {
                const k = `${d.kind}:${d.id}`;
                return (
                  <button key={k} className={`cn-addchip ${added[k] ? "done" : ""}`} onClick={() => addOne(d)} disabled={!!added[k]}>
                    {added[k] ? "✓" : "＋"} {d.emoji} {d.label}
                  </button>
                );
              })}
            </div>
          )}
          <div className="cn-starters">
            {t.followups.map((s) => <button key={s} onClick={() => send(s)} disabled={busy || used >= DAILY_LIMIT}>{s}</button>)}
          </div>
        </>
      ) : null}

      <div className="cn-input">
        <input
          value={input}
          placeholder={used >= DAILY_LIMIT ? t.limit : listening ? "🎤…" : t.placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") send(input); }}
          disabled={busy || used >= DAILY_LIMIT}
        />
        {micOk && (
          <button className={`cn-mic ${listening ? "on" : ""}`} onClick={toggleMic} title={t.micTitle} aria-label={t.micTitle} disabled={busy || used >= DAILY_LIMIT}>🎤</button>
        )}
        <button onClick={() => send(input)} disabled={busy || !input.trim() || used >= DAILY_LIMIT} aria-label={t.send}>➤</button>
      </div>
      <p className="cn-disc">🥕 {t.disclaimer}</p>

      {panel && (
        <div className="cn-panelwrap" onClick={() => setPanel(false)}>
          <div className="cn-panel" onClick={(e) => e.stopPropagation()}>
            <div className="cn-panel-h"><b>{t.panelTitle}</b><button className="cn-panel-x" onClick={() => setPanel(false)} aria-label={t.close}>×</button></div>
            <div className="cn-panel-body">
              <div className="cn-panel-sec">{t.favs}</div>
              {favs.length === 0 ? <p className="cn-panel-empty">{t.noFavs}</p> : (
                <div className="cn-conv-list">
                  {favs.map((c) => (
                    <div className={`cn-conv ${c.id === activeId ? "cur" : ""}`} key={c.id}>
                      <button className="cn-conv-open" onClick={() => openConversation(c)}>
                        <span className="cn-conv-t">{c.title || t.untitled}</span>
                        <span className="cn-conv-n">{c.msgs.filter((m) => m.role === "user").length} ·</span>
                      </button>
                      <button className="cn-conv-del" onClick={() => deleteFav(c.id)} aria-label={t.del}>×</button>
                    </div>
                  ))}
                </div>
              )}
              <div className="cn-panel-sec">{t.recent}</div>
              {recent.length === 0 ? <p className="cn-panel-empty">{t.noRecent}</p> : (
                <div className="cn-conv-list">
                  {recent.map((c) => (
                    <div className="cn-conv" key={c.id}>
                      <button className="cn-conv-open" onClick={() => openConversation(c)}>
                        <span className="cn-conv-t">{c.title || t.untitled}</span>
                        <span className="cn-conv-n">{c.msgs.filter((m) => m.role === "user").length} ·</span>
                      </button>
                      <button className="cn-conv-del" onClick={() => deleteRecent(c.id)} aria-label={t.del}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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
.avo.idle .avo-armL{animation:avoWave 3.8s ease-in-out infinite}
.avo.thinking .avo-body{animation:avoTilt 2s ease-in-out infinite}
.avo.thinking .avo-think{opacity:1;animation:avoThink 1.4s ease-in-out infinite}
.avo.thinking .avo-pupil{transform:translateY(-3px)}
.avo.thinking .avo-mouth{transform:scaleY(.25)}
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
.cn{margin:14px 0 8px;color:#2b3243;position:relative}
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
.cn-head{display:flex;align-items:center;gap:12px;padding:10px 4px 14px;border-bottom:1px solid #e7ebf2}
.cn-headmid{flex:1;min-width:0}
.cn-name{font-weight:800;font-size:1.02rem;color:#232a37}
.cn-status{font-size:.8rem;color:#9aa2b4}
.cn-headact{display:flex;gap:6px;flex:none}
.cn-hact{width:38px;height:38px;border:1px solid #e7ebf2;background:#f6f8fb;border-radius:11px;font-size:1.05rem;cursor:pointer;color:#4b5563;line-height:1;display:flex;align-items:center;justify-content:center}
.cn-hact:hover{background:#eef2f7}
.cn-hact.on{color:#f5a623;border-color:#f6d38a;background:#fff7e8}
.cn-hact:disabled{opacity:.4;cursor:not-allowed}
.cn-scroll{max-height:380px;overflow-y:auto;padding:16px 4px;display:flex;flex-direction:column;gap:10px}
.cn-bubble{max-width:82%;padding:11px 14px;border-radius:16px;font-size:.94rem;line-height:1.5;white-space:pre-wrap;word-wrap:break-word}
.cn-bubble.user{align-self:flex-end;background:linear-gradient(135deg,#34d17f,#16a34a);color:#fff;font-weight:600;border-bottom-right-radius:5px}
.cn-bubble.model{align-self:flex-start;background:#f4f6fa;border:1px solid #e7ebf2;color:#2b3243;border-bottom-left-radius:5px;white-space:normal}
.cn-hello{color:#4b5563}
.cn-p{margin:0 0 6px}
.cn-p:last-child{margin-bottom:0}
.cn-ul{margin:4px 0;padding-left:18px}
.cn-ul li{margin:2px 0}
.cn-bubble.model strong{color:#166a3a;font-weight:800}
.cn-typing{display:flex;gap:5px;align-items:center}
.cn-typing span{width:7px;height:7px;border-radius:50%;background:#16a34a;animation:cnDot 1.2s infinite}
.cn-typing span:nth-child(2){animation-delay:.2s}
.cn-typing span:nth-child(3){animation-delay:.4s}
@keyframes cnDot{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}
.cn-starters{display:flex;flex-wrap:wrap;gap:8px;padding:4px 4px 10px}
.cn-starters button{background:#e9f8ee;border:1px solid #bfe6cd;color:#16a34a;border-radius:99px;padding:9px 14px;font-size:.84rem;font-weight:600;cursor:pointer}
.cn-starters button:hover{background:#dcf3e4}
.cn-starters button:disabled{opacity:.4;cursor:not-allowed}
.cn-addrow{display:flex;flex-wrap:wrap;gap:7px;align-items:center;padding:2px 4px 8px}
.cn-addlbl{font-size:.78rem;font-weight:800;color:#9aa2b4;width:100%}
.cn-addchip{background:#fff7e8;border:1px solid #f6d38a;color:#a9772a;border-radius:99px;padding:8px 13px;font-size:.84rem;font-weight:700;cursor:pointer}
.cn-addchip:hover{background:#fdefcf}
.cn-addchip.done{background:#e9f8ee;border-color:#bfe6cd;color:#16a34a;cursor:default}
.cn-mic{background:#f6f8fb;border:1.5px solid #e7ebf2;color:#4b5563;border-radius:13px;width:48px;font-size:1.05rem;cursor:pointer}
.cn-mic.on{background:#fdeaec;border-color:#f3b0b8;color:#ef4457;animation:cnPulse 1s ease-in-out infinite}
.cn-mic:disabled{opacity:.4;cursor:not-allowed}
@keyframes cnPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
.cn-input{display:flex;gap:8px;padding:8px 0}
.cn-input input{flex:1;background:#f6f8fb;border:1.5px solid #e7ebf2;border-radius:13px;color:#232a37;padding:13px 15px;font-size:.94rem}
.cn-input input:focus{outline:none;border-color:#8fdcac}
.cn-input button{background:linear-gradient(135deg,#34d17f,#16a34a);color:#fff;border:0;border-radius:13px;width:48px;font-size:1.15rem;font-weight:800;cursor:pointer}
.cn-input button:disabled{opacity:.4;cursor:not-allowed}
.cn-disc{margin:6px 0 0;font-size:.78rem;line-height:1.55;color:#9aa2b4;border-top:1px solid #e7ebf2;padding-top:10px}
/* panneau historique / favoris */
.cn-panelwrap{position:fixed;inset:0;z-index:60;background:rgba(20,30,25,.4);display:flex;align-items:flex-end;justify-content:center}
.cn-panel{background:#fff;width:100%;max-width:520px;border-radius:20px 20px 0 0;max-height:80vh;display:flex;flex-direction:column;box-shadow:0 -10px 40px -12px rgba(0,0,0,.3);animation:cnUp .28s cubic-bezier(.2,.8,.3,1)}
@keyframes cnUp{from{transform:translateY(30px);opacity:.6}to{transform:translateY(0);opacity:1}}
.cn-panel-h{display:flex;align-items:center;justify-content:space-between;padding:16px 18px;border-bottom:1px solid #eef1f6}
.cn-panel-h b{font-size:1.05rem;color:#232a37}
.cn-panel-x{border:0;background:#f1f4f8;width:34px;height:34px;border-radius:10px;font-size:1.3rem;color:#6b7280;cursor:pointer;line-height:1}
.cn-panel-body{overflow-y:auto;padding:8px 14px 20px}
.cn-panel-sec{font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.4px;color:#9aa2b4;margin:14px 4px 8px}
.cn-panel-empty{margin:0 4px 6px;color:#9aa2b4;font-size:.88rem;line-height:1.4}
.cn-conv-list{display:flex;flex-direction:column;gap:7px}
.cn-conv{display:flex;align-items:center;gap:6px;background:#f6f8fb;border:1px solid #e7ebf2;border-radius:12px}
.cn-conv.cur{border-color:#bfe6cd;background:#f0faf3}
.cn-conv-open{flex:1;min-width:0;display:flex;align-items:center;gap:8px;background:none;border:0;padding:12px 14px;cursor:pointer;text-align:left}
.cn-conv-t{flex:1;min-width:0;font-weight:700;color:#232a37;font-size:.92rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.cn-conv-n{font-size:.72rem;color:#9aa2b4;font-weight:700;flex:none}
.cn-conv-del{border:0;background:none;color:#b9c0cc;font-size:1.3rem;padding:0 12px;cursor:pointer;line-height:1}
.cn-conv-del:hover{color:#ef4457}
`;
