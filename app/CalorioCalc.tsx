"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { type Lang } from "@/lib/i18n";
import {
  type Sexe,
  type Activite,
  type Objectif,
  type Pesee,
  type AlimentCat,
  ALIMENTS,
  aliment,
  computeBesoins,
  computeJournal,
  calcAliment,
  bilan,
  tendancePoids,
} from "@/lib/calorio";
import CoachNutri, { type CoachCtx } from "./CoachNutri";

/* ---------------- i18n ---------------- */
const L = {
  fr: {
    tabs: { besoins: "Mes besoins", journal: "Journal du jour", poids: "Suivi du poids", coach: "Coach 🥑" },
    sexe: "Sexe", homme: "Homme", femme: "Femme",
    age: "Âge", poids: "Poids (kg)", taille: "Taille (cm)",
    activite: "Niveau d'activité", objectif: "Objectif",
    act: { sedentaire: "Sédentaire", leger: "Léger (1-3×/sem)", modere: "Modéré (3-5×/sem)", intense: "Intense (6-7×/sem)", tres_intense: "Très intense (athlète)" },
    obj: { perte_rapide: "Perte rapide (−0.5 kg/sem)", perte: "Perte douce", maintien: "Maintien", prise: "Prise de masse", prise_rapide: "Prise rapide" },
    bmr: "Métabolisme de base", bmrSub: "au repos, 24 h",
    tdee: "Dépense totale", tdeeSub: "avec ton activité",
    cible: "Calories cible", cibleSub: "pour ton objectif",
    kcalJour: "kcal / jour",
    repartition: "Répartition des macros (cible)",
    prot: "Protéines", gluc: "Glucides", lip: "Lipides",
    // journal
    ajouter: "Ajouter un aliment", rechercher: "Rechercher…",
    consomme: "Consommé aujourd'hui", reste: "Il te reste", depasse: "Dépassement de",
    surCible: "sur", vide: "Aucun aliment ajouté. Choisis ci-dessous ce que tu as mangé aujourd'hui.",
    portion: "portion", supprimer: "Retirer",
    cats: { feculents: "Féculents", viandes: "Viandes & poissons", laitiers: "Laitiers", fruits: "Fruits", legumes: "Légumes", boissons: "Boissons", snacks: "Snacks & sucré", plats: "Plats & fast-food" },
    tousAliments: "Tout",
    // poids
    poidsAuj: "Ton poids aujourd'hui", enregistrer: "Enregistrer",
    depart: "Départ", actuel: "Actuel", variation: "Variation",
    pasPesee: "Enregistre ton poids régulièrement pour voir ta courbe et suivre ta progression.",
    objVer: "objectif", historique: "Historique",
    memo: "Tes données restent sur cet appareil (dans ton navigateur) — rien n'est envoyé sur un serveur.",
    disclaimer: "Estimations basées sur des formules standard (Mifflin-St Jeor) et des valeurs nutritionnelles moyennes. Ce n'est pas un plan nutritionnel ni un avis médical. Pour un suivi personnalisé (régime, pathologie, sport de haut niveau), consulte un·e diététicien·ne ou un·e médecin.",
  },
  de: {
    tabs: { besoins: "Mein Bedarf", journal: "Tagesjournal", poids: "Gewichtsverlauf", coach: "Coach 🥑" },
    sexe: "Geschlecht", homme: "Mann", femme: "Frau",
    age: "Alter", poids: "Gewicht (kg)", taille: "Grösse (cm)",
    activite: "Aktivitätsniveau", objectif: "Ziel",
    act: { sedentaire: "Sitzend", leger: "Leicht (1-3×/Wo)", modere: "Mässig (3-5×/Wo)", intense: "Intensiv (6-7×/Wo)", tres_intense: "Sehr intensiv (Athlet)" },
    obj: { perte_rapide: "Schnell abnehmen (−0.5 kg/Wo)", perte: "Sanft abnehmen", maintien: "Halten", prise: "Aufbau", prise_rapide: "Schneller Aufbau" },
    bmr: "Grundumsatz", bmrSub: "in Ruhe, 24 h",
    tdee: "Gesamtumsatz", tdeeSub: "mit deiner Aktivität",
    cible: "Zielkalorien", cibleSub: "für dein Ziel",
    kcalJour: "kcal / Tag",
    repartition: "Makro-Verteilung (Ziel)",
    prot: "Proteine", gluc: "Kohlenhydrate", lip: "Fette",
    ajouter: "Lebensmittel hinzufügen", rechercher: "Suchen…",
    consomme: "Heute konsumiert", reste: "Dir bleiben", depasse: "Überschreitung um",
    surCible: "von", vide: "Noch nichts hinzugefügt. Wähle unten, was du heute gegessen hast.",
    portion: "Portion", supprimer: "Entfernen",
    cats: { feculents: "Stärke", viandes: "Fleisch & Fisch", laitiers: "Milchprodukte", fruits: "Früchte", legumes: "Gemüse", boissons: "Getränke", snacks: "Snacks & Süsses", plats: "Gerichte & Fast Food" },
    tousAliments: "Alle",
    poidsAuj: "Dein Gewicht heute", enregistrer: "Speichern",
    depart: "Start", actuel: "Aktuell", variation: "Veränderung",
    pasPesee: "Erfasse dein Gewicht regelmässig, um deine Kurve und deinen Fortschritt zu sehen.",
    objVer: "Ziel", historique: "Verlauf",
    memo: "Deine Daten bleiben auf diesem Gerät (in deinem Browser) — nichts wird an einen Server gesendet.",
    disclaimer: "Schätzungen auf Basis von Standardformeln (Mifflin-St Jeor) und durchschnittlichen Nährwerten. Kein Ernährungsplan und keine medizinische Beratung. Für eine persönliche Begleitung eine Ernährungsberatung oder einen Arzt beiziehen.",
  },
  en: {
    tabs: { besoins: "My needs", journal: "Today's log", poids: "Weight tracking", coach: "Coach 🥑" },
    sexe: "Sex", homme: "Male", femme: "Female",
    age: "Age", poids: "Weight (kg)", taille: "Height (cm)",
    activite: "Activity level", objectif: "Goal",
    act: { sedentaire: "Sedentary", leger: "Light (1-3×/wk)", modere: "Moderate (3-5×/wk)", intense: "Intense (6-7×/wk)", tres_intense: "Very intense (athlete)" },
    obj: { perte_rapide: "Fast loss (−0.5 kg/wk)", perte: "Gentle loss", maintien: "Maintain", prise: "Muscle gain", prise_rapide: "Fast gain" },
    bmr: "Basal metabolism", bmrSub: "at rest, 24 h",
    tdee: "Total expenditure", tdeeSub: "with your activity",
    cible: "Target calories", cibleSub: "for your goal",
    kcalJour: "kcal / day",
    repartition: "Macro split (target)",
    prot: "Protein", gluc: "Carbs", lip: "Fat",
    ajouter: "Add a food", rechercher: "Search…",
    consomme: "Eaten today", reste: "You have left", depasse: "Over by",
    surCible: "of", vide: "Nothing added yet. Pick below what you ate today.",
    portion: "portion", supprimer: "Remove",
    cats: { feculents: "Starches", viandes: "Meat & fish", laitiers: "Dairy", fruits: "Fruit", legumes: "Vegetables", boissons: "Drinks", snacks: "Snacks & sweets", plats: "Meals & fast food" },
    tousAliments: "All",
    poidsAuj: "Your weight today", enregistrer: "Save",
    depart: "Start", actuel: "Current", variation: "Change",
    pasPesee: "Log your weight regularly to see your curve and track your progress.",
    objVer: "goal", historique: "History",
    memo: "Your data stays on this device (in your browser) — nothing is sent to a server.",
    disclaimer: "Estimates based on standard formulas (Mifflin-St Jeor) and average nutritional values. Not a nutrition plan or medical advice. For personalised guidance (diet, condition, high-level sport), consult a dietitian or doctor.",
  },
} as const;

/* ---------------- helpers ---------------- */
const CATS: AlimentCat[] = ["feculents", "viandes", "laitiers", "fruits", "legumes", "boissons", "snacks", "plats"];
const C_PROT = "#34d399", C_GLUC = "#f59e0b", C_LIP = "#f472b6";
const ACCENT = "#22c55e", ACCENT2 = "#84cc16";

const todayISO = () => new Date().toISOString().slice(0, 10);
const nf = (lang: Lang, d = 0) =>
  new Intl.NumberFormat(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { maximumFractionDigits: d });
const noAccent = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

type Line = { key: string; alimentId: string; grammes: number };

function load<T>(k: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function save(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* stockage indisponible : on ignore */
  }
}

/* ---------------- component ---------------- */
export default function CalorioCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [tab, setTab] = useState<"besoins" | "journal" | "poids" | "coach">("besoins");
  const [mounted, setMounted] = useState(false);

  // profil
  const [sexe, setSexe] = useState<Sexe>("homme");
  const [age, setAge] = useState(35);
  const [poids, setPoids] = useState(80);
  const [taille, setTaille] = useState(180);
  const [activite, setActivite] = useState<Activite>("modere");
  const [objectif, setObjectif] = useState<Objectif>("maintien");

  // journal (par date) + poids
  const [lines, setLines] = useState<Line[]>([]);
  const [pesees, setPesees] = useState<Pesee[]>([]);
  const [poidsInput, setPoidsInput] = useState<number | "">("");
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState<AlimentCat | "tous">("tous");

  const day = todayISO();

  // chargement mémoire
  useEffect(() => {
    const p = load("calorio.profil", null as null | Record<string, unknown>);
    if (p) {
      if (p.sexe) setSexe(p.sexe as Sexe);
      if (typeof p.age === "number") setAge(p.age);
      if (typeof p.poids === "number") setPoids(p.poids);
      if (typeof p.taille === "number") setTaille(p.taille);
      if (p.activite) setActivite(p.activite as Activite);
      if (p.objectif) setObjectif(p.objectif as Objectif);
    }
    const jour = load<Record<string, Line[]>>("calorio.journal", {});
    setLines(jour[day] ?? []);
    setPesees(load<Pesee[]>("calorio.pesees", []));
    setPoidsInput("");
    setMounted(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sauvegardes
  useEffect(() => {
    if (!mounted) return;
    save("calorio.profil", { sexe, age, poids, taille, activite, objectif });
  }, [mounted, sexe, age, poids, taille, activite, objectif]);
  useEffect(() => {
    if (!mounted) return;
    const jour = load<Record<string, Line[]>>("calorio.journal", {});
    jour[day] = lines;
    save("calorio.journal", jour);
  }, [mounted, lines, day]);
  useEffect(() => {
    if (!mounted) return;
    save("calorio.pesees", pesees);
  }, [mounted, pesees]);

  const besoins = useMemo(
    () => computeBesoins({ sexe, age, poids, taille, activite, objectif }),
    [sexe, age, poids, taille, activite, objectif]
  );

  const lignesMap = useMemo(
    () => lines.map((l) => ({ al: aliment(l.alimentId)!, grammes: l.grammes })).filter((x) => x.al),
    [lines]
  );
  const total = useMemo(() => computeJournal(lignesMap), [lignesMap]);
  const bil = useMemo(() => bilan(total, besoins.cible), [total, besoins.cible]);
  const tend = useMemo(() => tendancePoids(pesees), [pesees]);

  const coachCtx: CoachCtx = useMemo(
    () => ({
      lang,
      profil: { sexe, age, poids, taille, activite, objectif },
      cible: besoins.cible,
      bmr: besoins.bmr,
      tdee: besoins.tdee,
      macrosCible: besoins.macros,
      aujourdhui: {
        kcal: total.kcal,
        prot: total.prot,
        gluc: total.gluc,
        lip: total.lip,
        aliments: lignesMap.map(({ al, grammes }) => ({ nom: al.nom[lang], grammes, kcal: calcAliment(al, grammes).kcal })),
      },
      poids: tend ? { debut: tend.debut, actuel: tend.actuel, delta: tend.delta } : null,
    }),
    [lang, sexe, age, poids, taille, activite, objectif, besoins, total, lignesMap, tend]
  );

  const resultats = useMemo(() => {
    const query = noAccent(q.trim());
    return ALIMENTS.filter((al) => {
      if (catFilter !== "tous" && al.cat !== catFilter) return false;
      if (query && !noAccent(al.nom[lang]).includes(query)) return false;
      return true;
    });
  }, [q, catFilter, lang]);

  const addAliment = (id: string) => {
    const al = aliment(id);
    if (!al) return;
    setLines((prev) => [...prev, { key: `${id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, alimentId: id, grammes: al.portion }]);
    setTab("journal");
  };
  const setGrammes = (key: string, g: number) =>
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, grammes: Math.max(0, g) } : l)));
  const removeLine = (key: string) => setLines((prev) => prev.filter((l) => l.key !== key));

  const savePoids = () => {
    if (poidsInput === "" || !(poidsInput > 0)) return;
    setPesees((prev) => {
      const others = prev.filter((p) => p.date !== day);
      return [...others, { date: day, poids: Number(poidsInput) }].sort((x, y) => x.date.localeCompare(y.date));
    });
    setPoidsInput("");
  };
  const removePesee = (date: string) => setPesees((prev) => prev.filter((p) => p.date !== date));

  return (
    <section className="cl" id="calorio">
      <style>{CSS}</style>

      <div className="cl-tabs" role="tablist">
        {(["besoins", "journal", "poids", "coach"] as const).map((k) => (
          <button key={k} role="tab" aria-selected={tab === k} className={`cl-tab ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>
            {k === "journal" && lignesMap.length > 0 ? `${t.tabs[k]} · ${lignesMap.length}` : t.tabs[k]}
          </button>
        ))}
      </div>

      {/* ---------- BESOINS ---------- */}
      {tab === "besoins" && (
        <div className="cl-grid">
          <div className="cl-params">
            <div className="cl-field">
              <span>{t.sexe}</span>
              <div className="cl-seg">
                <button className={sexe === "homme" ? "on" : ""} onClick={() => setSexe("homme")}>{t.homme}</button>
                <button className={sexe === "femme" ? "on" : ""} onClick={() => setSexe("femme")}>{t.femme}</button>
              </div>
            </div>
            <Slider label={t.age} value={age} min={14} max={99} onChange={setAge} />
            <Slider label={t.poids} value={poids} min={35} max={200} onChange={setPoids} />
            <Slider label={t.taille} value={taille} min={130} max={220} onChange={setTaille} />
            <label className="cl-field">
              <span>{t.activite}</span>
              <select className="cl-select" value={activite} onChange={(e) => setActivite(e.target.value as Activite)}>
                {(Object.keys(t.act) as Activite[]).map((k) => <option key={k} value={k}>{t.act[k]}</option>)}
              </select>
            </label>
            <label className="cl-field">
              <span>{t.objectif}</span>
              <select className="cl-select" value={objectif} onChange={(e) => setObjectif(e.target.value as Objectif)}>
                {(Object.keys(t.obj) as Objectif[]).map((k) => <option key={k} value={k}>{t.obj[k]}</option>)}
              </select>
            </label>
          </div>

          <div className="cl-out">
            <div className="cl-stats">
              <Stat label={t.bmr} sub={t.bmrSub} val={nf(lang).format(besoins.bmr)} unit="kcal" />
              <Stat label={t.tdee} sub={t.tdeeSub} val={nf(lang).format(besoins.tdee)} unit="kcal" />
              <Stat label={t.cible} sub={t.cibleSub} val={nf(lang).format(besoins.cible)} unit="kcal" big />
            </div>

            <div className="cl-card">
              <div className="cl-cardh">{t.repartition}</div>
              <div className="cl-macrorow">
                <MacroDonut p={besoins.macros.proteines} g={besoins.macros.glucides} l={besoins.macros.lipides} />
                <div className="cl-macleg">
                  <MacroLeg color={C_PROT} name={t.prot} grams={besoins.macros.proteines} kcal={besoins.macros.proteines * 4} lang={lang} />
                  <MacroLeg color={C_GLUC} name={t.gluc} grams={besoins.macros.glucides} kcal={besoins.macros.glucides * 4} lang={lang} />
                  <MacroLeg color={C_LIP} name={t.lip} grams={besoins.macros.lipides} kcal={besoins.macros.lipides * 9} lang={lang} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------- JOURNAL ---------- */}
      {tab === "journal" && (
        <div className="cl-journal">
          <div className="cl-jhead">
            <RingGauge pct={bil.pct} consomme={total.kcal} cible={besoins.cible} lang={lang} t={t} />
            <div className="cl-jbars">
              <MacroBar name={t.prot} color={C_PROT} val={total.prot} target={besoins.macros.proteines} lang={lang} />
              <MacroBar name={t.gluc} color={C_GLUC} val={total.gluc} target={besoins.macros.glucides} lang={lang} />
              <MacroBar name={t.lip} color={C_LIP} val={total.lip} target={besoins.macros.lipides} lang={lang} />
            </div>
          </div>

          {lignesMap.length === 0 ? (
            <p className="cl-empty">{t.vide}</p>
          ) : (
            <div className="cl-lines">
              {lines.map((l) => {
                const al = aliment(l.alimentId);
                if (!al) return null;
                const c = calcAliment(al, l.grammes);
                return (
                  <div key={l.key} className="cl-line">
                    <span className="cl-lem">{al.emoji}</span>
                    <span className="cl-lname">{al.nom[lang]}</span>
                    <span className="cl-lg">
                      <input type="number" min={0} step={10} value={l.grammes} onChange={(e) => setGrammes(l.key, Number(e.target.value))} /> g
                    </span>
                    <span className="cl-lkcal">{nf(lang).format(c.kcal)} kcal</span>
                    <button className="cl-lx" onClick={() => removeLine(l.key)} aria-label={t.supprimer}>×</button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="cl-picker">
            <div className="cl-picktop">
              <input className="cl-search" placeholder={t.rechercher} value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <div className="cl-chips">
              <button className={catFilter === "tous" ? "on" : ""} onClick={() => setCatFilter("tous")}>{t.tousAliments}</button>
              {CATS.map((c) => (
                <button key={c} className={catFilter === c ? "on" : ""} onClick={() => setCatFilter(c)}>{t.cats[c]}</button>
              ))}
            </div>
            <div className="cl-foods">
              {resultats.map((al) => (
                <button key={al.id} className="cl-food" onClick={() => addAliment(al.id)}>
                  <span className="cl-fem">{al.emoji}</span>
                  <span className="cl-fn">{al.nom[lang]}</span>
                  <span className="cl-fk">{al.kcal} kcal<small>/100 g</small></span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---------- POIDS ---------- */}
      {tab === "poids" && (
        <div className="cl-poids">
          <div className="cl-pinput">
            <label className="cl-field cl-pin">
              <span>{t.poidsAuj}</span>
              <span className="cl-frow">
                <input type="number" min={0} step={0.1} value={poidsInput} placeholder={String(poids)} onChange={(e) => setPoidsInput(e.target.value === "" ? "" : Number(e.target.value))} className="cl-num" />
                <button className="cl-save" onClick={savePoids}>{t.enregistrer}</button>
              </span>
            </label>
            {tend && (
              <div className="cl-trend">
                <div><small>{t.depart}</small><b>{nf(lang, 1).format(tend.debut)} kg</b></div>
                <div><small>{t.actuel}</small><b>{nf(lang, 1).format(tend.actuel)} kg</b></div>
                <div><small>{t.variation}</small><b style={{ color: deltaColor(tend.delta, objectif) }}>{tend.delta > 0 ? "+" : ""}{nf(lang, 1).format(tend.delta)} kg</b></div>
              </div>
            )}
          </div>

          {pesees.length >= 2 ? (
            <WeightChart pesees={pesees} lang={lang} />
          ) : (
            <p className="cl-empty">{t.pasPesee}</p>
          )}

          {pesees.length > 0 && (
            <div className="cl-plist">
              <div className="cl-plisth">{t.historique}</div>
              {[...pesees].reverse().map((p) => (
                <div key={p.date} className="cl-prow">
                  <span>{new Date(p.date).toLocaleDateString(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { day: "2-digit", month: "short", year: "numeric" })}</span>
                  <b>{nf(lang, 1).format(p.poids)} kg</b>
                  <button className="cl-lx" onClick={() => removePesee(p.date)} aria-label={t.supprimer}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------- COACH ---------- */}
      {tab === "coach" && <CoachNutri ctx={coachCtx} />}

      {tab !== "coach" && <p className="cl-memo">🔒 {t.memo}</p>}
      {tab !== "coach" && <p className="cl-disclaimer">⚠︎ {t.disclaimer}</p>}
    </section>
  );
}

/* ---------------- sub-components ---------------- */
function Slider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (n: number) => void }) {
  return (
    <label className="cl-field">
      <span>{label}</span>
      <span className="cl-frow">
        <input type="range" min={min} max={max} step={1} value={value} onChange={(e) => onChange(Number(e.target.value))} className="cl-range" />
        <input type="number" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="cl-num" />
      </span>
    </label>
  );
}

function Stat({ label, sub, val, unit, big }: { label: string; sub: string; val: string; unit: string; big?: boolean }) {
  return (
    <div className={`cl-stat ${big ? "big" : ""}`}>
      <div className="cl-stl">{label}</div>
      <div className="cl-stv">{val} <span>{unit}</span></div>
      <div className="cl-sts">{sub}</div>
    </div>
  );
}

function MacroLeg({ color, name, grams, kcal, lang }: { color: string; name: string; grams: number; kcal: number; lang: Lang }) {
  return (
    <div className="cl-mleg">
      <span className="cl-dot" style={{ background: color }} />
      <span className="cl-mln">{name}</span>
      <span className="cl-mlg"><b>{nf(lang).format(grams)} g</b> · {nf(lang).format(kcal)} kcal</span>
    </div>
  );
}

function MacroDonut({ p, g, l }: { p: number; g: number; l: number }) {
  const kp = p * 4, kg = g * 4, kl = l * 9;
  const tot = Math.max(1, kp + kg + kl);
  const R = 52, C = 2 * Math.PI * R;
  const segs = [
    { v: kp, color: C_PROT },
    { v: kg, color: C_GLUC },
    { v: kl, color: C_LIP },
  ];
  let off = 0;
  return (
    <svg viewBox="0 0 140 140" className="cl-donut" role="img" aria-hidden>
      <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="16" />
      {segs.map((s, i) => {
        const len = (s.v / tot) * C;
        const el = (
          <circle key={i} cx="70" cy="70" r={R} fill="none" stroke={s.color} strokeWidth="16"
            strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} transform="rotate(-90 70 70)" strokeLinecap="butt" />
        );
        off += len;
        return el;
      })}
      <text x="70" y="66" textAnchor="middle" className="cl-dcx">{Math.round(tot)}</text>
      <text x="70" y="84" textAnchor="middle" className="cl-dcs">kcal</text>
    </svg>
  );
}

function RingGauge({ pct, consomme, cible, lang, t }: { pct: number; consomme: number; cible: number; lang: Lang; t: { surCible: string; reste: string; depasse: string } }) {
  const R = 62, C = 2 * Math.PI * R;
  const shown = Math.min(pct, 100);
  const over = consomme > cible;
  const reste = cible - consomme;
  const col = over ? "#f87171" : pct > 85 ? "#fbbf24" : ACCENT;
  return (
    <div className="cl-ring">
      <svg viewBox="0 0 150 150" role="img" aria-hidden>
        <circle cx="75" cy="75" r={R} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="13" />
        <circle cx="75" cy="75" r={R} fill="none" stroke={col} strokeWidth="13"
          strokeDasharray={`${(shown / 100) * C} ${C}`} strokeLinecap="round" transform="rotate(-90 75 75)" />
        <text x="75" y="68" textAnchor="middle" className="cl-rgv">{nf(lang).format(consomme)}</text>
        <text x="75" y="88" textAnchor="middle" className="cl-rgs">{t.surCible} {nf(lang).format(cible)} kcal</text>
        <text x="75" y="106" textAnchor="middle" className="cl-rgp" fill={col}>{pct}%</text>
      </svg>
      <div className="cl-rgr" style={{ color: over ? "#f87171" : ACCENT }}>
        {over ? `${t.depasse} ${nf(lang).format(Math.abs(reste))} kcal` : `${t.reste} ${nf(lang).format(reste)} kcal`}
      </div>
    </div>
  );
}

function MacroBar({ name, color, val, target, lang }: { name: string; color: string; val: number; target: number; lang: Lang }) {
  const pct = target > 0 ? Math.min(100, (val / target) * 100) : 0;
  return (
    <div className="cl-mbar">
      <div className="cl-mbh"><span style={{ color }}>{name}</span><span>{nf(lang).format(val)} / {nf(lang).format(target)} g</span></div>
      <div className="cl-mbt"><span style={{ width: `${pct}%`, background: color }} /></div>
    </div>
  );
}

function WeightChart({ pesees, lang }: { pesees: Pesee[]; lang: Lang }) {
  const ref = useRef<HTMLDivElement>(null);
  const tri = [...pesees].sort((a, b) => a.date.localeCompare(b.date));
  const W = 640, H = 220, PADX = 40, PADY = 26;
  const poids = tri.map((p) => p.poids);
  const min = Math.min(...poids), max = Math.max(...poids);
  const span = Math.max(1, max - min);
  const lo = min - span * 0.25, hi = max + span * 0.25;
  const x = (i: number) => PADX + (tri.length === 1 ? (W - 2 * PADX) / 2 : (i / (tri.length - 1)) * (W - 2 * PADX));
  const y = (v: number) => PADY + (1 - (v - lo) / (hi - lo)) * (H - 2 * PADY);
  const pts = tri.map((p, i) => `${x(i)},${y(p.poids)}`).join(" ");
  const area = `${PADX},${H - PADY} ${pts} ${x(tri.length - 1)},${H - PADY}`;
  const ticks = [hi, (hi + lo) / 2, lo];
  return (
    <div className="cl-chart" ref={ref}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Courbe de poids">
        <defs>
          <linearGradient id="clg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity="0.35" />
            <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((tk, i) => (
          <g key={i}>
            <line x1={PADX} y1={y(tk)} x2={W - PADX / 2} y2={y(tk)} stroke="rgba(255,255,255,.08)" />
            <text x={8} y={y(tk) + 4} className="cl-ytk">{nf(lang, 1).format(tk)}</text>
          </g>
        ))}
        <polygon points={area} fill="url(#clg)" />
        <polyline points={pts} fill="none" stroke={ACCENT} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        {tri.map((p, i) => (
          <g key={p.date}>
            <circle cx={x(i)} cy={y(p.poids)} r="4" fill={ACCENT2} stroke="#0b1120" strokeWidth="2" />
            {(i === 0 || i === tri.length - 1) && (
              <text x={x(i)} y={y(p.poids) - 12} textAnchor="middle" className="cl-pv">{nf(lang, 1).format(p.poids)}</text>
            )}
          </g>
        ))}
        <text x={PADX} y={H - 6} className="cl-xtk">{new Date(tri[0].date).toLocaleDateString(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { day: "2-digit", month: "short" })}</text>
        <text x={W - PADX} y={H - 6} textAnchor="end" className="cl-xtk">{new Date(tri[tri.length - 1].date).toLocaleDateString(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { day: "2-digit", month: "short" })}</text>
      </svg>
    </div>
  );
}

function deltaColor(delta: number, objectif: Objectif): string {
  const wantsLoss = objectif === "perte" || objectif === "perte_rapide";
  const wantsGain = objectif === "prise" || objectif === "prise_rapide";
  if (wantsLoss) return delta <= 0 ? "#34d399" : "#f87171";
  if (wantsGain) return delta >= 0 ? "#34d399" : "#f87171";
  return Math.abs(delta) <= 1 ? "#34d399" : "#fbbf24";
}

/* ---------------- styles ---------------- */
const CSS = `
.cl{margin:22px 0 8px;color:#e6e9f5}
.cl-tabs{display:flex;gap:6px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:5px;margin-bottom:18px;flex-wrap:wrap}
.cl-tab{flex:1;min-width:110px;padding:10px 12px;border:0;border-radius:10px;background:transparent;color:#aeb4d6;font-size:.9rem;font-weight:700;cursor:pointer;transition:.15s}
.cl-tab.on{background:linear-gradient(135deg,${ACCENT},${ACCENT2});color:#05210f;box-shadow:0 6px 18px rgba(34,197,94,.25)}
.cl-grid{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:20px;align-items:start}
@media(max-width:820px){.cl-grid{grid-template-columns:1fr}}
.cl-params{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:18px}
.cl-field{display:block;margin:0 0 15px}
.cl-field>span{display:block;font-size:.82rem;color:#c3c8e2;margin-bottom:6px}
.cl-frow{display:flex;align-items:center;gap:8px}
.cl-range{flex:1;min-width:0;accent-color:${ACCENT}}
.cl-num{width:82px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#f5f6fb;padding:8px;font-size:.9rem;text-align:right}
.cl-select{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#f5f6fb;padding:9px 10px;font-size:.88rem}
.cl-select option{background:#131a2e}
.cl-seg{display:flex;gap:6px}
.cl-seg button{flex:1;padding:9px;border:1px solid rgba(255,255,255,.12);border-radius:9px;background:rgba(255,255,255,.04);color:#c3c8e2;font-weight:700;font-size:.88rem;cursor:pointer}
.cl-seg button.on{background:linear-gradient(135deg,${ACCENT},${ACCENT2});color:#05210f;border-color:transparent}
.cl-stats{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.cl-stat{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:14px 16px}
.cl-stat.big{grid-column:1/-1;background:linear-gradient(135deg,rgba(34,197,94,.14),rgba(132,204,22,.06));border-color:rgba(34,197,94,.35)}
.cl-stl{font-size:.78rem;font-weight:700;letter-spacing:.03em;text-transform:uppercase;color:#8b93b7}
.cl-stv{font-size:1.9rem;font-weight:800;letter-spacing:-1px;line-height:1.1;margin-top:2px}
.cl-stat.big .cl-stv{font-size:2.6rem;color:#a3e635}
.cl-stv span{font-size:.9rem;font-weight:600;color:#8b93b7}
.cl-sts{font-size:.76rem;color:#8b93b7;margin-top:2px}
.cl-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:16px;margin-top:14px}
.cl-cardh{font-size:.9rem;font-weight:700;color:#c3c8e2;margin-bottom:8px}
.cl-macrorow{display:flex;align-items:center;gap:18px;flex-wrap:wrap}
.cl-donut{width:140px;height:140px;flex:none}
.cl-dcx{fill:#f5f6fb;font-size:26px;font-weight:800}
.cl-dcs{fill:#8b93b7;font-size:12px;font-weight:600}
.cl-macleg{flex:1;min-width:180px;display:flex;flex-direction:column;gap:9px}
.cl-mleg{display:flex;align-items:center;gap:9px;font-size:.9rem}
.cl-dot{width:11px;height:11px;border-radius:3px;flex:none}
.cl-mln{color:#c3c8e2;min-width:74px}
.cl-mlg{color:#8b93b7}.cl-mlg b{color:#e6e9f5}
/* journal */
.cl-jhead{display:flex;gap:22px;align-items:center;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:18px;flex-wrap:wrap}
.cl-ring{display:flex;flex-direction:column;align-items:center;gap:8px}
.cl-ring svg{width:150px;height:150px}
.cl-rgv{fill:#f5f6fb;font-size:26px;font-weight:800}
.cl-rgs{fill:#8b93b7;font-size:11px}
.cl-rgp{font-size:15px;font-weight:800}
.cl-rgr{font-size:.9rem;font-weight:700}
.cl-jbars{flex:1;min-width:220px;display:flex;flex-direction:column;gap:12px}
.cl-mbar{}
.cl-mbh{display:flex;justify-content:space-between;font-size:.84rem;margin-bottom:5px;color:#c3c8e2}
.cl-mbh span:first-child{font-weight:700}
.cl-mbt{height:9px;border-radius:99px;background:rgba(255,255,255,.08);overflow:hidden}
.cl-mbt span{display:block;height:100%;border-radius:99px;transition:width .25s}
.cl-empty{color:#8b93b7;font-size:.9rem;text-align:center;padding:26px 16px;background:rgba(255,255,255,.02);border:1px dashed rgba(255,255,255,.12);border-radius:14px;margin:16px 0}
.cl-lines{margin:16px 0;display:flex;flex-direction:column;gap:7px}
.cl-line{display:flex;align-items:center;gap:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:11px;padding:8px 12px}
.cl-lem{font-size:1.2rem}
.cl-lname{flex:1;min-width:0;font-size:.92rem;color:#e6e9f5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cl-lg{font-size:.82rem;color:#8b93b7;display:flex;align-items:center;gap:4px}
.cl-lg input{width:64px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:7px;color:#f5f6fb;padding:5px 6px;font-size:.82rem;text-align:right}
.cl-lkcal{font-size:.88rem;font-weight:700;color:#a3e635;min-width:74px;text-align:right}
.cl-lx{width:26px;height:26px;border:0;border-radius:7px;background:rgba(248,113,113,.13);color:#f87171;font-size:1.1rem;cursor:pointer;line-height:1}
.cl-picker{margin-top:8px}
.cl-search{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:10px;color:#f5f6fb;padding:11px 14px;font-size:.92rem;margin-bottom:10px}
.cl-chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.cl-chips button{padding:6px 11px;border:1px solid rgba(255,255,255,.12);border-radius:99px;background:rgba(255,255,255,.04);color:#aeb4d6;font-size:.8rem;font-weight:600;cursor:pointer}
.cl-chips button.on{background:rgba(34,197,94,.16);border-color:rgba(34,197,94,.45);color:#a3e635}
.cl-foods{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px}
.cl-food{display:flex;align-items:center;gap:9px;text-align:left;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:11px;padding:9px 11px;cursor:pointer;transition:.15s}
.cl-food:hover{border-color:rgba(34,197,94,.5);background:rgba(34,197,94,.06)}
.cl-fem{font-size:1.25rem;flex:none}
.cl-fn{flex:1;min-width:0;font-size:.85rem;color:#e6e9f5;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.cl-fk{font-size:.72rem;color:#8b93b7;text-align:right;line-height:1.15}
.cl-fk small{display:block;font-size:.62rem;opacity:.7}
/* poids */
.cl-pinput{display:flex;gap:16px;align-items:flex-end;flex-wrap:wrap;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:18px}
.cl-pin{margin:0;flex:1;min-width:200px}
.cl-save{background:linear-gradient(135deg,${ACCENT},${ACCENT2});color:#05210f;border:0;border-radius:9px;padding:9px 18px;font-weight:800;font-size:.9rem;cursor:pointer;white-space:nowrap}
.cl-trend{display:flex;gap:20px}
.cl-trend div{display:flex;flex-direction:column}
.cl-trend small{font-size:.72rem;color:#8b93b7;text-transform:uppercase;letter-spacing:.03em}
.cl-trend b{font-size:1.3rem;font-weight:800}
.cl-chart{margin-top:16px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:12px}
.cl-chart svg{width:100%;height:auto;display:block}
.cl-ytk,.cl-xtk{fill:#8b93b7;font-size:11px}
.cl-pv{fill:#e6e9f5;font-size:12px;font-weight:700}
.cl-plist{margin-top:14px}
.cl-plisth{font-size:.82rem;font-weight:700;color:#8b93b7;text-transform:uppercase;letter-spacing:.03em;margin-bottom:8px}
.cl-prow{display:flex;align-items:center;gap:12px;padding:9px 12px;border-bottom:1px solid rgba(255,255,255,.06)}
.cl-prow span{flex:1;font-size:.88rem;color:#c3c8e2}
.cl-prow b{font-size:.95rem}
.cl-memo{margin:18px 0 0;font-size:.8rem;color:#7fb98f}
.cl-disclaimer{margin:8px 0 0;font-size:.78rem;line-height:1.5;color:#8b93b7;border-top:1px solid rgba(255,255,255,.08);padding-top:12px}
`;
