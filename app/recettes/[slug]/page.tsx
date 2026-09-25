import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { RECETTES, RECETTE_SLUGS, recetteBySlug, recetteSlug, recetteNutri, alimentSlug, type Recette, type RecetteCat } from "@/lib/calorio";
import { RECETTE_ETAPES } from "@/lib/recetteEtapes";

export const dynamicParams = false;
export function generateStaticParams() {
  return RECETTE_SLUGS.map((x) => ({ slug: x.slug }));
}

const CAT_FR: Record<RecetteCat, string> = {
  petitdej: "Petit-déjeuner", plat: "Plats", healthy: "Healthy & fitness", sucre: "Sucré & desserts",
};
const r0 = (n: number) => Math.round(n);
const r1 = (n: number) => Math.round(n * 10) / 10;

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const rec = recetteBySlug(params.slug);
  if (!rec) return {};
  const n = recetteNutri(rec);
  const canon = `https://calorio.ch/recettes/${params.slug}`;
  return {
    title: `${rec.nom.fr} : calories et recette (${n.parPortion.kcal} kcal / portion)`,
    description: `${rec.nom.fr} : ${n.parPortion.kcal} kcal par portion (${n.parPortion.prot} g de protéines, ${n.parPortion.gluc} g de glucides, ${n.parPortion.lip} g de lipides). Ingrédients, valeurs nutritionnelles et suivi gratuit avec calorio.`,
    alternates: { canonical: canon },
    openGraph: { title: `${rec.nom.fr} — ${n.parPortion.kcal} kcal/portion`, description: `Calories, macros et ingrédients de ${rec.nom.fr}. Suis tes repas gratuitement avec calorio.`, url: canon, type: "article", siteName: "calorio", locale: "fr_CH" },
    twitter: { card: "summary_large_image", title: `${rec.nom.fr} — ${n.parPortion.kcal} kcal/portion`, description: `Calories, macros et ingrédients de ${rec.nom.fr}.` },
    keywords: [rec.nom.fr, `${rec.nom.fr} calories`, "recette healthy", "calories recette", "macros"],
  };
}

export const viewport: Viewport = { themeColor: "#f3f7f2" };

export default function Page({ params }: { params: { slug: string } }) {
  const rec = recetteBySlug(params.slug);
  if (!rec) notFound();
  const n = recetteNutri(rec);
  const related = RECETTES.filter((x) => x.cat === rec.cat && x.id !== rec.id).slice(0, 6);

  const macros: { label: string; total: number; portion: number }[] = [
    { label: "Protéines", total: n.total.prot, portion: n.parPortion.prot },
    { label: "Glucides", total: n.total.gluc, portion: n.parPortion.gluc },
    { label: "Lipides", total: n.total.lip, portion: n.parPortion.lip },
  ];
  const faq = [
    { q: `Combien de calories dans ${rec.nom.fr.toLowerCase()} ?`, a: `Une portion de ${rec.nom.fr.toLowerCase()} apporte environ ${n.parPortion.kcal} kcal. La recette entière (${rec.portions} portion${rec.portions > 1 ? "s" : ""}) totalise ${n.total.kcal} kcal.` },
    { q: `Quels sont les macros par portion ?`, a: `Par portion : ${n.parPortion.prot} g de protéines, ${n.parPortion.gluc} g de glucides et ${n.parPortion.lip} g de lipides.` },
    { q: `Combien de temps pour préparer ${rec.nom.fr.toLowerCase()} ?`, a: `Compte environ ${rec.temps} minutes pour ${rec.portions} portion${rec.portions > 1 ? "s" : ""}.` },
  ];

  const etapes = RECETTE_ETAPES[rec.id] || [];
  const url = `https://calorio.ch/recettes/${params.slug}`;
  const recipeLd = {
    "@context": "https://schema.org", "@type": "Recipe",
    name: rec.nom.fr, recipeYield: `${rec.portions} portion${rec.portions > 1 ? "s" : ""}`,
    description: `${rec.nom.fr} : ${n.parPortion.kcal} kcal par portion, ${n.parPortion.prot} g de protéines. Recette simple avec calories et macros détaillées.`,
    image: [`${url}/opengraph-image`],
    author: { "@type": "Organization", name: "calorio", url: "https://calorio.ch/" },
    recipeCategory: CAT_FR[rec.cat],
    recipeCuisine: rec.id === "raclette_valais" || rec.id === "fondue_moitie" || rec.id === "rosti_oeuf" ? "Suisse" : "Maison",
    keywords: `${rec.nom.fr}, calories, macros, recette ${CAT_FR[rec.cat].toLowerCase()}`,
    totalTime: `PT${rec.temps}M`,
    recipeInstructions: etapes.map((t, i) => ({ "@type": "HowToStep", position: i + 1, text: t })),
    recipeIngredient: n.ingredients.map((i) => `${i.g} g ${i.al.nom.fr.toLowerCase()}`),
    nutrition: { "@type": "NutritionInformation", calories: `${n.parPortion.kcal} kcal`, proteinContent: `${n.parPortion.prot} g`, carbohydrateContent: `${n.parPortion.gluc} g`, fatContent: `${n.parPortion.lip} g` },
  };
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(recipeLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <style dangerouslySetInnerHTML={{ __html: RE_CSS }} />
      <div className="ca-bg" aria-hidden />
      <main className="ca">
        <header className="ca-top">
          <a className="ca-brand" href="https://calorio.ch/"><img src="/calorio-icon-192.png" alt="" width={30} height={30} /> calorio</a>
        </header>
        <nav className="ca-crumb" aria-label="fil d'ariane"><a href="https://calorio.ch/">calorio</a> <span aria-hidden>›</span> <a href="/recettes">Recettes</a> <span aria-hidden>›</span> {rec.nom.fr}</nav>

        <h1 className="ca-h1"><span className="ca-emo" aria-hidden>{rec.emoji}</span> {rec.nom.fr}</h1>
        <p className="ca-intro">{rec.nom.fr} apporte environ <b>{n.parPortion.kcal} kcal par portion</b> — {n.parPortion.prot} g de protéines, {n.parPortion.gluc} g de glucides et {n.parPortion.lip} g de lipides. Voici les ingrédients, les valeurs nutritionnelles, et de quoi les suivre gratuitement.</p>

        <div className="ca-meta">
          <span className="ca-chip">⏱️ {rec.temps} min</span>
          <span className="ca-chip">🍽️ {rec.portions} portion{rec.portions > 1 ? "s" : ""}</span>
          <span className="ca-chip">{CAT_FR[rec.cat]}</span>
        </div>

        <div className="ca-kpis">
          <div className="ca-kpi"><div className="ca-kv">{n.parPortion.kcal}</div><div className="ca-kl">kcal / portion</div></div>
          <div className="ca-kpi ca-kpi-alt"><div className="ca-kv">{n.total.kcal}</div><div className="ca-kl">kcal / recette entière</div></div>
        </div>

        <h2 className="ca-h2">Ingrédients</h2>
        <div className="ca-ing">
          {n.ingredients.map((i) => (
            <a className="ca-ingrow" key={i.al.id} href={`/calories/${alimentSlug(i.al)}`}>
              <span className="ca-ingemo" aria-hidden>{i.al.emoji}</span>
              <span className="ca-ingn">{i.al.nom.fr}</span>
              <span className="ca-ingg">{i.g} g</span>
              <span className="ca-ingk">{i.kcal} kcal</span>
            </a>
          ))}
        </div>
        <p className="ca-note">Quantités pour {rec.portions} portion{rec.portions > 1 ? "s" : ""}. Clique un ingrédient pour ses calories détaillées.</p>

        {etapes.length > 0 && (
          <>
            <h2 className="ca-h2">Préparation</h2>
            <ol className="ca-steps">
              {etapes.map((t) => <li key={t}>{t}</li>)}
            </ol>
          </>
        )}

        <h2 className="ca-h2">Valeurs nutritionnelles</h2>
        <div className="ca-tablewrap">
          <table className="ca-table">
            <thead><tr><th /><th>Par portion</th><th>Recette entière</th></tr></thead>
            <tbody>
              <tr><th scope="row">Calories</th><td>{n.parPortion.kcal} kcal</td><td>{n.total.kcal} kcal</td></tr>
              {macros.map((m) => (
                <tr key={m.label}><th scope="row">{m.label}</th><td>{r1(m.portion)} g</td><td>{r1(m.total)} g</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="ca-note">Valeurs indicatives (moyennes par ingrédient). Elles varient selon les marques et la préparation.</p>

        <div className="ca-final">
          <div className="ca-final-t">Ajoute {rec.nom.fr.toLowerCase()} à ton journal</div>
          <p>Dans calorio, cette recette s'ajoute en un tap et compte tes calories et macros du jour. Gratuit, sans pub.</p>
          <a className="ca-cta" href="https://calorio.ch/calorio">Ouvrir calorio <span aria-hidden>→</span></a>
        </div>

        {related.length > 0 && (
          <>
            <h2 className="ca-h2">{CAT_FR[rec.cat]} : autres recettes</h2>
            <div className="ca-rel">
              {related.map((x) => {
                const rn = recetteNutri(x);
                return (
                  <a className="ca-relcard" key={x.id} href={`/recettes/${recetteSlug(x)}`}>
                    <span className="ca-relemo" aria-hidden>{x.emoji}</span>
                    <span className="ca-reln">{x.nom.fr}</span>
                    <span className="ca-relk">{rn.parPortion.kcal} kcal<small>/portion</small></span>
                  </a>
                );
              })}
            </div>
          </>
        )}

        <h2 className="ca-h2">Questions fréquentes</h2>
        <div className="ca-faq">
          {faq.map((f) => (
            <details className="ca-fitem" key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
          ))}
        </div>

        <p className="ca-back"><a href="/recettes">← Toutes les recettes</a></p>
      </main>
    </>
  );
}

const RE_CSS = `
.ca-steps{margin:0 0 8px;padding:0;list-style:none;counter-reset:st;display:grid;gap:10px}
.ca-steps li{counter-increment:st;position:relative;padding:12px 14px 12px 50px;background:#fff;border:1px solid #dcebe0;border-radius:14px;line-height:1.5}
.ca-steps li::before{content:counter(st);position:absolute;left:14px;top:11px;width:26px;height:26px;border-radius:50%;background:#16a34a;color:#fff;font-weight:800;font-size:.85rem;display:grid;place-items:center}
body{background:#f3f7f2 !important}
.ca-bg{position:fixed;inset:0;z-index:-5;background:radial-gradient(1100px 560px at 50% -8%, #e9faf0, #f3f7f2 62%)}
.ca{max-width:760px;margin:0 auto;padding:16px 18px 70px;color:#2b3243;font-family:inherit}
.ca a{color:inherit}
.ca-top{padding:8px 2px 6px}
.ca-brand{display:inline-flex;align-items:center;gap:9px;font-size:1.2rem;font-weight:800;letter-spacing:-.3px;color:#16a34a;text-decoration:none}
.ca-brand img{border-radius:9px}
.ca-crumb{font-size:.82rem;color:#8a93a3;margin:6px 2px 16px;line-height:1.5}
.ca-crumb a{color:#16a34a;text-decoration:none}
.ca-h1{font-size:1.75rem;line-height:1.2;font-weight:800;letter-spacing:-.5px;color:#1a2030;margin:0 0 12px}
.ca-emo{margin-right:6px}
.ca-intro{font-size:1.02rem;line-height:1.6;color:#4b5563;margin:0 0 14px}
.ca-intro b{color:#166a3a}
.ca-meta{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}
.ca-chip{font-size:.78rem;font-weight:700;color:#4b5563;background:#fff;border:1px solid #e4e9f0;border-radius:999px;padding:6px 12px}
.ca-kpis{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 8px}
.ca-kpi{background:#fff;border:1px solid #cdebd7;border-radius:18px;padding:18px;text-align:center;box-shadow:0 6px 20px -14px rgba(20,80,44,.4)}
.ca-kpi-alt{background:#e9f8ee}
.ca-kv{font-size:2.2rem;font-weight:800;letter-spacing:-1px;color:#16a34a;line-height:1;font-variant-numeric:tabular-nums}
.ca-kl{font-size:.78rem;font-weight:700;color:#6b7280;margin-top:5px}
.ca-h2{font-size:1.25rem;font-weight:800;letter-spacing:-.3px;color:#1a2030;margin:30px 0 12px;padding-bottom:10px;border-bottom:1px solid #f6cdd9}
.ca-ing{display:flex;flex-direction:column;gap:8px}
.ca-ingrow{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e4e9f0;border-radius:13px;padding:11px 13px;text-decoration:none;box-shadow:0 4px 14px -12px rgba(20,40,80,.2)}
.ca-ingrow:hover{border-color:#bfe6cd}
.ca-ingemo{font-size:1.2rem}
.ca-ingn{flex:1;min-width:0;font-weight:700;color:#232a37;font-size:.94rem}
.ca-ingg{font-size:.85rem;font-weight:700;color:#6b7280;font-variant-numeric:tabular-nums}
.ca-ingk{font-size:.82rem;font-weight:800;color:#166a3a;font-variant-numeric:tabular-nums;min-width:64px;text-align:right}
.ca-tablewrap{overflow-x:auto;border:1px solid #e4e9f0;border-radius:16px;background:#fff;box-shadow:0 6px 20px -14px rgba(20,40,80,.2)}
.ca-table{width:100%;border-collapse:collapse;font-size:.94rem;min-width:360px}
.ca-table th,.ca-table td{text-align:left;padding:13px 15px;border-bottom:1px solid #eef1f6}
.ca-table thead th{font-size:.85rem;font-weight:800;color:#6b7280;background:#f8fafc}
.ca-table tbody th{font-weight:700;color:#374151}
.ca-table tbody td{font-weight:700;color:#166a3a;font-variant-numeric:tabular-nums}
.ca-table tbody tr:last-child th,.ca-table tbody tr:last-child td{border-bottom:0}
.ca-note{font-size:.78rem;color:#9aa2b4;margin:10px 2px 0;line-height:1.5}
.ca-final{margin:26px 0 0;text-align:center;background:linear-gradient(135deg,#eafaf0,#fdecf1);border:1px solid #cdebd7;border-radius:20px;padding:26px 22px}
.ca-final-t{font-size:1.2rem;font-weight:800;color:#1a2030}
.ca-final p{margin:7px 0 15px;color:#4b5563;line-height:1.5}
.ca-cta{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#34d17f,#16a34a);color:#fff;text-decoration:none;font-weight:800;font-size:1rem;border-radius:13px;padding:13px 22px;box-shadow:0 12px 26px -10px rgba(22,163,74,.55)}
.ca-rel{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.ca-relcard{display:flex;align-items:center;gap:9px;background:#fff;border:1px solid #e4e9f0;border-radius:13px;padding:11px 12px;text-decoration:none;box-shadow:0 4px 14px -12px rgba(20,40,80,.2)}
.ca-relcard:hover{border-color:#bfe6cd}
.ca-relemo{font-size:1.2rem}
.ca-reln{flex:1;min-width:0;font-weight:700;color:#232a37;font-size:.9rem}
.ca-relk{font-size:.72rem;color:#6b7280;text-align:right;font-weight:700}
.ca-relk small{display:block;font-size:.62rem;opacity:.7}
.ca-faq{display:flex;flex-direction:column;gap:10px}
.ca-fitem{background:#fff;border:1px solid #e4e9f0;border-radius:13px;overflow:hidden}
.ca-fitem summary{cursor:pointer;padding:14px 16px;font-weight:700;color:#232a37;font-size:.95rem;list-style:none}
.ca-fitem summary::-webkit-details-marker{display:none}
.ca-fitem summary::after{content:"+";float:right;color:#16a34a;font-weight:800}
.ca-fitem[open] summary::after{content:"−"}
.ca-fitem p{margin:0;padding:0 16px 15px;color:#4b5563;line-height:1.6;font-size:.92rem}
.ca-back{margin:24px 0 0;text-align:center}
.ca-back a{color:#16a34a;text-decoration:none;font-weight:700;font-size:.9rem}
@media(max-width:560px){.ca-h1{font-size:1.45rem}.ca-rel{grid-template-columns:1fr}}
`;
