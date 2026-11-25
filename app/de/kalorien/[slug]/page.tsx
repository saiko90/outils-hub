import { ACTIVITIES, energySplit, minutesFor, profile } from "@/lib/foodInsights";
import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { DE_SLUGS, deBySlug, deSlugById, deName, alimentSlug, relatedAliments, SLICE_IDS, SLICE_G, type Aliment } from "@/lib/calorio";
import { magArticlesForAliment, magUrl } from "@/lib/mag";
import { CAL_CSS } from "@/app/calories/ficheCss";

// Fiches allemandes, limitées à la liste blanche des spécialités suisses (DE_SLUGS, environ 25 pages).
export const dynamicParams = false;
export const revalidate = 3600; // der Block « Im Magazin » folgt den veröffentlichten Artikeln
export function generateStaticParams() {
  return DE_SLUGS.map((x) => ({ slug: x.slug }));
}

const r0 = (n: number) => Math.round(n);
const r1 = (n: number) => Math.round(n * 10) / 10;
const ORIGIN = "https://calorio.ch";
const PIVOT = "/de/kalorien/schweizer-spezialitaeten";

function urls(al: Aliment, slug: string) {
  const de = `${ORIGIN}/de/kalorien/${slug}`;
  const fr = `${ORIGIN}/calories/${alimentSlug(al)}`;
  return { de, fr };
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const al = deBySlug(params.slug);
  if (!al) return {};
  const { de, fr } = urls(al, params.slug);
  const n = deName(al);
  const kcalP = r0((al.kcal * al.portion) / 100);
  const title = `${n} Kalorien: ${al.kcal} kcal pro 100 g`;
  const descBase = `${n} hat rund ${al.kcal} kcal pro 100 g, also ${kcalP} kcal pro Portion (${al.portion} g). Eiweiss ${r1(al.prot)} g, Kohlenhydrate ${r1(al.gluc)} g, Fett ${r1(al.lip)} g.`;
  const descTail = " Gratis tracken mit calorio.";
  const description = descBase.length + descTail.length <= 160 ? descBase + descTail : descBase;
  return {
    metadataBase: new URL(ORIGIN),
    title,
    description,
    alternates: { canonical: de, languages: { "fr-CH": fr, "de-CH": de, "x-default": fr } },
    openGraph: { title, description, url: de, type: "article", siteName: "calorio", locale: "de_CH" },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = { themeColor: "#f3f7f2" };

export default function Page({ params }: { params: { slug: string } }) {
  const al = deBySlug(params.slug);
  if (!al) notFound();
  const { de, fr } = urls(al, params.slug);
  const n = deName(al);
  const kcalP = r0((al.kcal * al.portion) / 100);
  const slice = SLICE_IDS.has(al.id) ? r0((al.kcal * SLICE_G) / 100) : null;
  const articles = magArticlesForAliment(al.id);
  const related = relatedAliments(al).filter((x) => deSlugById(x.id)).slice(0, 6);
  const macros = [
    { label: "Eiweiss", per100: al.prot, perPortion: (al.prot * al.portion) / 100 },
    { label: "Kohlenhydrate", per100: al.gluc, perPortion: (al.gluc * al.portion) / 100 },
    { label: "Fett", per100: al.lip, perPortion: (al.lip * al.portion) / 100 },
  ];
  const split = energySplit(al.prot, al.gluc, al.lip);
  const burn = ACTIVITIES.map((a) => ({ ...a, min: minutesFor(kcalP, a.met) }));
  const faq = [
    { q: `Wie viele Kalorien haben 100 g ${n}?`, a: `100 g ${n} liefern rund ${al.kcal} kcal.` },
    { q: `Wie viele Kalorien hat eine Portion ${n}?`, a: `Eine übliche Portion von ${al.portion} g hat rund ${kcalP} kcal.` },
    { q: `Wie viel Eiweiss, Kohlenhydrate und Fett hat ${n}?`, a: `Pro 100 g: ${r1(al.prot)} g Eiweiss, ${r1(al.gluc)} g Kohlenhydrate und ${r1(al.lip)} g Fett.` },
    ...(kcalP > 0 ? [{ q: `Wie lange muss ich gehen, um eine Portion ${n} zu verbrennen?`, a: `Bei 70 kg Körpergewicht entspricht eine Portion von ${al.portion} g (${kcalP} kcal) rund ${burn[0].min} Minuten Gehen mit 5 km/h oder ${burn[2].min} Minuten Joggen mit 10 km/h.` }] : []),
    { q: `Wie erfasse ich ${n} in calorio?`, a: `Suche in calorio nach «${al.nom.de}» und gib das Gewicht ein (${al.portion} g als Vorschlag). calorio rechnet Kalorien und Makros für deinen Tag aus.` },
  ];
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const breadcrumbLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "calorio", item: `${ORIGIN}/de` },
      { "@type": "ListItem", position: 2, name: "Schweizer Spezialitäten", item: ORIGIN + PIVOT },
      { "@type": "ListItem", position: 3, name: n, item: de },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <style dangerouslySetInnerHTML={{ __html: CAL_CSS }} />
      <div className="ca-bg" aria-hidden />
      <main className="ca" lang="de-CH">
        <header className="ca-top">
          <a className="ca-brand" href={`${ORIGIN}/de`}><img src="/calorio-icon-192.png" alt="" width={30} height={30} /> calorio</a>
          <a className="ca-lang" href={fr.replace(ORIGIN, "")} hrefLang="fr-CH">Version française</a>
        </header>
        <nav className="ca-crumb" aria-label="Brotkrümel"><a href={`${ORIGIN}/de`}>calorio</a> <span aria-hidden>›</span> <a href={PIVOT}>Schweizer Spezialitäten</a> <span aria-hidden>›</span> {n}</nav>

        <h1 className="ca-h1"><span className="ca-emo" aria-hidden>{al.emoji}</span> {n}: wie viele Kalorien?</h1>
        <p className="ca-intro">{n} hat <b>{al.kcal} kcal pro 100 g</b>, also rund <b>{kcalP} kcal</b> für eine übliche Portion von {al.portion} g. Hier sind Kalorien und Makronährstoffe im Detail, und wie du sie gratis erfassen kannst.</p>

        <div className="ca-kpis">
          <div className="ca-kpi"><div className="ca-kv">{al.kcal}</div><div className="ca-kl">kcal / 100 g</div></div>
          <div className="ca-kpi ca-kpi-alt"><div className="ca-kv">{kcalP}</div><div className="ca-kl">kcal / Portion ({al.portion} g)</div></div>
        </div>

        <h2 className="ca-h2">Nährwerte</h2>
        <div className="ca-tablewrap">
          <table className="ca-table">
            <thead><tr><th /><th>Pro 100 g</th><th>Pro Portion ({al.portion} g)</th></tr></thead>
            <tbody>
              <tr><th scope="row">Kalorien</th><td>{al.kcal} kcal</td><td>{kcalP} kcal</td></tr>
              {macros.map((m) => (
                <tr key={m.label}><th scope="row">{m.label}</th><td>{r1(m.per100)} g</td><td>{r1(m.perPortion)} g</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        {slice !== null && (
          <p className="ca-slice"><b>1 Scheibe ({SLICE_G} g): rund {slice} kcal</b> <span>(durchschnittliche Scheibe von {SLICE_G} g)</span></p>
        )}
        <p className="ca-note">Richtwerte pro 100 g (Durchschnitt). Die effektiven Werte variieren je nach Marke, Rezept und Zubereitung. <a href="/de/magazin/methode">Methode und Quellen</a></p>

        {split && (
          <>
            <h2 className="ca-h2">Woher kommen die Kalorien?</h2>
            <p>Bei {n} stammen <b>{split.p} %</b> der Energie aus Eiweiss, <b>{split.g} %</b> aus Kohlenhydraten und <b>{split.l} %</b> aus Fett: {profile(split, "de")}.</p>
          </>
        )}
        {kcalP > 0 && (
          <>
            <h2 className="ca-h2">Eine Portion in Bewegung umgerechnet</h2>
            <p>Um die {kcalP} kcal einer Portion von {al.portion} g zu verbrauchen, braucht eine Person mit 70 kg ungefähr:</p>
            <ul className="ca-links">
              {burn.map((b) => <li key={b.id}><b>{b.min} Min.</b> {b.de}</li>)}
            </ul>
            <p className="ca-note">Schätzung nach dem Compendium of Physical Activities 2024. Der effektive Verbrauch hängt von Gewicht, Tempo und Gelände ab.</p>
          </>
        )}

        <div className="ca-final">
          <div className="ca-final-t">{n} im Ernährungstagebuch erfassen</div>
          <p>In wenigen Sekunden erfasst: calorio rechnet Kalorien und Makros deines Tages aus. Gratis und ohne Werbung.</p>
          <a className="ca-cta" href="https://calorio.ch/calorio?lang=de">calorio öffnen <span aria-hidden>→</span></a>
        </div>

        {articles.length > 0 && (
          <>
            <h2 className="ca-h2">Im calorio Magazin</h2>
            <ul className="ca-links">
              {articles.map((a) => <li key={a.id}><a href={magUrl(a, "de")}>{a.emoji ? `${a.emoji} ` : ""}{a.de.title}</a></li>)}
            </ul>
          </>
        )}

        {related.length > 0 && (
          <>
            <h2 className="ca-h2">Weitere Schweizer Spezialitäten</h2>
            <div className="ca-rel">
              {related.map((x) => (
                <a className="ca-relcard" key={x.id} href={`/de/kalorien/${deSlugById(x.id)}`}>
                  <span className="ca-relemo" aria-hidden>{x.emoji}</span>
                  <span className="ca-reln">{deName(x)}</span>
                  <span className="ca-relk">{x.kcal} kcal<small>/100 g</small></span>
                </a>
              ))}
            </div>
          </>
        )}

        <h2 className="ca-h2">Häufige Fragen</h2>
        <div className="ca-faq">
          {faq.map((f) => (
            <details className="ca-fitem" key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
          ))}
        </div>

        <p className="ca-back"><a href={PIVOT}>← Alle Schweizer Spezialitäten</a></p>
      </main>
    </>
  );
}
