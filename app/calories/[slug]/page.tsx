import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { ACTIVITIES, energySplit, minutesFor, profile } from "@/lib/foodInsights";
import { ALIMENT_SLUGS, alimentBySlug, alimentSlug, seoName, inText, deNom, ficheTitle, isChSpecialite, relatedAliments, recettesWithAliment, recetteSlug, recetteNutri, SLICE_IDS, SLICE_G, deSlugById, type Aliment, type AlimentCat } from "@/lib/calorio";
import { magArticlesForAliment, magUrl } from "@/lib/mag";
import { CAL_CSS } from "../ficheCss";

export const dynamicParams = false;
export const revalidate = 3600; // le bloc « Dans le Mag calorio » suit les articles publiés
export function generateStaticParams() {
  return ALIMENT_SLUGS.map((x) => ({ slug: x.slug }));
}

const CAT_FR: Record<AlimentCat, string> = {
  feculents: "Féculents", viandes: "Viandes & poissons", laitiers: "Produits laitiers",
  fruits: "Fruits", legumes: "Légumes", boissons: "Boissons", snacks: "Snacks & sucré", plats: "Plats & fast-food",
};
/** hreflang FR ↔ DE, seulement pour les spécialités qui ont une fiche allemande. */
function deAlternates(id: string, canon: string): Record<string, string> | undefined {
  const de = deSlugById(id);
  return de ? { "fr-CH": canon, "de-CH": `https://calorio.ch/de/kalorien/${de}`, "x-default": canon } : undefined;
}
const r0 = (n: number) => Math.round(n);
const r1 = (n: number) => Math.round(n * 10) / 10;

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const al = alimentBySlug(params.slug);
  if (!al) return {};
  const canon = `https://calorio.ch/calories/${params.slug}`;
  const kcalP = r0((al.kcal * al.portion) / 100);
  const title = ficheTitle(al);
  // ≤ 160 caractères : la mention finale saute pour les noms longs (« Viande pour fondue chinoise »…).
  const descBase = `${seoName(al)} apporte environ ${al.kcal} kcal pour 100 g, soit ${kcalP} kcal par portion de ${al.portion} g. Protéines ${r1(al.prot)} g, glucides ${r1(al.gluc)} g, lipides ${r1(al.lip)} g.`;
  const descTail = " Suivi gratuit avec calorio.";
  const description = descBase.length + descTail.length <= 160 ? descBase + descTail : descBase;
  return {
    title,
    description,
    alternates: { canonical: canon, languages: deAlternates(al.id, canon) },
    openGraph: { title, description, url: canon, type: "article", siteName: "calorio", locale: "fr_CH" },
  };
}

export const viewport: Viewport = { themeColor: "#f3f7f2" };

export default function Page({ params }: { params: { slug: string } }) {
  const al = alimentBySlug(params.slug);
  if (!al) notFound();
  const kcalP = r0((al.kcal * al.portion) / 100);
  const related = relatedAliments(al);
  const articles = magArticlesForAliment(al.id);
  const recettes = recettesWithAliment(al.id).slice(0, 4);
  const slice = SLICE_IDS.has(al.id) ? r0((al.kcal * SLICE_G) / 100) : null;
  const macros: { label: string; per100: number; perPortion: number }[] = [
    { label: "Protéines", per100: al.prot, perPortion: (al.prot * al.portion) / 100 },
    { label: "Glucides", per100: al.gluc, perPortion: (al.gluc * al.portion) / 100 },
    { label: "Lipides", per100: al.lip, perPortion: (al.lip * al.portion) / 100 },
  ];
  const name = seoName(al);
  const ch = isChSpecialite(al.id);
  const nt = inText(name);
  const split = energySplit(al.prot, al.gluc, al.lip);
  const burn = ACTIVITIES.map((a) => ({ ...a, min: minutesFor(kcalP, a.met) }));
  const faq = [
    { q: `Combien de calories dans 100 g ${deNom(nt)} ?`, a: `100 g ${deNom(nt)} apportent environ ${al.kcal} kcal.` },
    { q: `Combien de calories pour une portion ${deNom(nt)} ?`, a: `Une portion usuelle de ${al.portion} g représente environ ${kcalP} kcal.` },
    { q: `Quels sont les macros ${deNom(nt)} ?`, a: `Pour 100 g : ${r1(al.prot)} g de protéines, ${r1(al.gluc)} g de glucides et ${r1(al.lip)} g de lipides.` },
    ...(kcalP > 0 ? [{ q: `Combien de temps de marche pour brûler une portion ${deNom(nt)} ?`, a: `Pour une personne de 70 kg, une portion de ${al.portion} g (${kcalP} kcal) correspond à environ ${burn[0].min} minutes de marche à 5 km/h, ou ${burn[2].min} minutes de course à 10 km/h.` }] : []),
  ];
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
  const canon = `https://calorio.ch/calories/${params.slug}`;
  const breadcrumbLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "calorio", item: "https://calorio.ch/" },
      { "@type": "ListItem", position: 2, name: "Calories des aliments", item: "https://calorio.ch/calories" },
      ...(ch ? [{ "@type": "ListItem", position: 3, name: "Spécialités suisses", item: "https://calorio.ch/calories/specialites-suisses" }] : []),
      { "@type": "ListItem", position: ch ? 4 : 3, name, item: canon },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <style dangerouslySetInnerHTML={{ __html: CAL_CSS }} />
      <div className="ca-bg" aria-hidden />
      <main className="ca">
        <header className="ca-top">
          <a className="ca-brand" href="https://calorio.ch/"><img src="/calorio-icon-192.png" alt="" width={30} height={30} /> calorio</a>
          {deSlugById(al.id) && <a className="ca-lang" href={`/de/kalorien/${deSlugById(al.id)}`} hrefLang="de-CH">Deutsche Version</a>}
        </header>
        <nav className="ca-crumb" aria-label="fil d'ariane"><a href="https://calorio.ch/">calorio</a> <span aria-hidden>›</span> <a href="/calories">Calories des aliments</a> <span aria-hidden>›</span> {ch && <><a href="/calories/specialites-suisses">Spécialités suisses</a> <span aria-hidden>›</span> </>}{name}</nav>

        <h1 className="ca-h1"><span className="ca-emo" aria-hidden>{al.emoji}</span> {name} : combien de calories ?</h1>
        <p className="ca-intro">{name} apporte <b>{al.kcal} kcal pour 100 g</b>, soit environ <b>{kcalP} kcal</b> pour une portion usuelle de {al.portion} g. Voici le détail des calories et des macronutriments — et de quoi les suivre gratuitement.</p>

        <div className="ca-kpis">
          <div className="ca-kpi"><div className="ca-kv">{al.kcal}</div><div className="ca-kl">kcal / 100 g</div></div>
          <div className="ca-kpi ca-kpi-alt"><div className="ca-kv">{kcalP}</div><div className="ca-kl">kcal / portion ({al.portion} g)</div></div>
        </div>

        <h2 className="ca-h2">Valeurs nutritionnelles</h2>
        <div className="ca-tablewrap">
          <table className="ca-table">
            <thead><tr><th /><th>Pour 100 g</th><th>Par portion ({al.portion} g)</th></tr></thead>
            <tbody>
              <tr><th scope="row">Calories</th><td>{al.kcal} kcal</td><td>{kcalP} kcal</td></tr>
              {macros.map((m) => (
                <tr key={m.label}><th scope="row">{m.label}</th><td>{r1(m.per100)} g</td><td>{r1(m.perPortion)} g</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        {slice !== null && (
          <p className="ca-slice"><b>1 tranche ({SLICE_G} g) : environ {slice} kcal</b> <span>(tranche moyenne de {SLICE_G} g)</span></p>
        )}
        <p className="ca-note">Valeurs indicatives par 100 g (moyennes). Les valeurs réelles varient selon la marque et la préparation. <a href="/mag/methode">Méthode et sources</a></p>

        {split && (
          <>
            <h2 className="ca-h2">D'où viennent les calories ?</h2>
            <p>Dans {nt}, <b>{split.p} %</b> de l'énergie vient des protéines, <b>{split.g} %</b> des glucides et <b>{split.l} %</b> des lipides : c'est un aliment {profile(split, "fr")}.</p>
          </>
        )}
        {kcalP > 0 && (
          <>
            <h2 className="ca-h2">Une portion, c'est combien d'activité ?</h2>
            <p>Pour dépenser les {kcalP} kcal d'une portion de {al.portion} g, une personne de 70 kg a besoin d'environ :</p>
            <ul className="ca-links">
              {burn.map((b) => <li key={b.id}><b>{b.min} min</b> {b.fr}</li>)}
            </ul>
            <p className="ca-note">Estimation selon le Compendium of Physical Activities 2024. La dépense réelle dépend du poids, du rythme et du terrain.</p>
          </>
        )}

        <div className="ca-final">
          <div className="ca-final-t">Suis {nt} dans ton journal</div>
          <p>Ajoute cet aliment en deux tapes, calorio calcule tes calories et tes macros du jour. Gratuit, sans pub.</p>
          <a className="ca-cta" href="https://calorio.ch/calorio">Ouvrir calorio <span aria-hidden>→</span></a>
        </div>

        {related.length > 0 && (
          <>
            <h2 className="ca-h2">{CAT_FR[al.cat]} : autres aliments</h2>
            <div className="ca-rel">
              {related.map((x: Aliment) => (
                <a className="ca-relcard" key={x.id} href={`/calories/${alimentSlug(x)}`}>
                  <span className="ca-relemo" aria-hidden>{x.emoji}</span>
                  <span className="ca-reln">{x.nom.fr}</span>
                  <span className="ca-relk">{x.kcal} kcal<small>/100 g</small></span>
                </a>
              ))}
            </div>
          </>
        )}

        {articles.length > 0 && (
          <>
            <h2 className="ca-h2">Dans le Mag calorio</h2>
            <ul className="ca-links">
              {articles.map((a) => <li key={a.id}><a href={magUrl(a, "fr")}>{a.emoji ? `${a.emoji} ` : ""}{a.fr.title}</a></li>)}
            </ul>
          </>
        )}

        {recettes.length > 0 && (
          <>
            <h2 className="ca-h2">Recettes avec cet aliment</h2>
            <ul className="ca-links">
              {recettes.map((r) => <li key={r.id}><a href={`/recettes/${recetteSlug(r)}`}>{r.emoji} {r.nom.fr}</a> · {recetteNutri(r).parPortion.kcal} kcal par portion</li>)}
            </ul>
          </>
        )}

        <h2 className="ca-h2">Questions fréquentes</h2>
        <div className="ca-faq">
          {faq.map((f) => (
            <details className="ca-fitem" key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
          ))}
        </div>

        <p className="ca-back"><a href="/calories">← Toutes les calories des aliments</a></p>
      </main>
    </>
  );
}
