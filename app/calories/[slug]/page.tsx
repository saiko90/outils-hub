import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { ALIMENTS, ALIMENT_SLUGS, alimentBySlug, alimentSlug, type Aliment, type AlimentCat } from "@/lib/calorio";

export const dynamicParams = false;
export function generateStaticParams() {
  return ALIMENT_SLUGS.map((x) => ({ slug: x.slug }));
}

const CAT_FR: Record<AlimentCat, string> = {
  feculents: "Féculents", viandes: "Viandes & poissons", laitiers: "Produits laitiers",
  fruits: "Fruits", legumes: "Légumes", boissons: "Boissons", snacks: "Snacks & sucré", plats: "Plats & fast-food",
};
const r0 = (n: number) => Math.round(n);
const r1 = (n: number) => Math.round(n * 10) / 10;

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const al = alimentBySlug(params.slug);
  if (!al) return {};
  const canon = `https://calorio.ch/calories/${params.slug}`;
  const kcalP = r0((al.kcal * al.portion) / 100);
  return {
    title: `Combien de calories dans ${al.nom.fr} ? ${al.kcal} kcal/100 g`,
    description: `${al.nom.fr} : ${al.kcal} kcal pour 100 g (≈ ${kcalP} kcal par portion de ${al.portion} g). Protéines ${r1(al.prot)} g, glucides ${r1(al.gluc)} g, lipides ${r1(al.lip)} g. Suis tes calories gratuitement avec calorio.`,
    alternates: { canonical: canon },
    openGraph: { title: `${al.nom.fr} — ${al.kcal} kcal/100 g`, description: `Calories et macros de ${al.nom.fr}, et comment les suivre gratuitement avec calorio.`, url: canon, type: "article", siteName: "calorio" },
  };
}

export const viewport: Viewport = { themeColor: "#f3f7f2" };

export default function Page({ params }: { params: { slug: string } }) {
  const al = alimentBySlug(params.slug);
  if (!al) notFound();
  const kcalP = r0((al.kcal * al.portion) / 100);
  const related = ALIMENTS.filter((x) => x.cat === al.cat && x.id !== al.id).slice(0, 8);
  const macros: { label: string; per100: number; perPortion: number }[] = [
    { label: "Protéines", per100: al.prot, perPortion: (al.prot * al.portion) / 100 },
    { label: "Glucides", per100: al.gluc, perPortion: (al.gluc * al.portion) / 100 },
    { label: "Lipides", per100: al.lip, perPortion: (al.lip * al.portion) / 100 },
  ];
  const faq = [
    { q: `Combien de calories dans 100 g de ${al.nom.fr.toLowerCase()} ?`, a: `100 g de ${al.nom.fr.toLowerCase()} apportent environ ${al.kcal} kcal.` },
    { q: `Combien de calories pour une portion de ${al.nom.fr.toLowerCase()} ?`, a: `Une portion usuelle de ${al.portion} g représente environ ${kcalP} kcal.` },
    { q: `Quels sont les macros de ${al.nom.fr.toLowerCase()} ?`, a: `Pour 100 g : ${r1(al.prot)} g de protéines, ${r1(al.gluc)} g de glucides et ${r1(al.lip)} g de lipides.` },
  ];
  const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <style dangerouslySetInnerHTML={{ __html: CAL_CSS }} />
      <div className="ca-bg" aria-hidden />
      <main className="ca">
        <header className="ca-top">
          <a className="ca-brand" href="https://calorio.ch/"><img src="/calorio-icon-192.png" alt="" width={30} height={30} /> calorio</a>
        </header>
        <nav className="ca-crumb" aria-label="fil d'ariane"><a href="https://calorio.ch/">calorio</a> <span aria-hidden>›</span> <a href="/calories">Calories des aliments</a> <span aria-hidden>›</span> {al.nom.fr}</nav>

        <h1 className="ca-h1"><span className="ca-emo" aria-hidden>{al.emoji}</span> Combien de calories dans {al.nom.fr.toLowerCase()} ?</h1>
        <p className="ca-intro">{al.nom.fr} apporte <b>{al.kcal} kcal pour 100 g</b>, soit environ <b>{kcalP} kcal</b> pour une portion usuelle de {al.portion} g. Voici le détail des calories et des macronutriments — et de quoi les suivre gratuitement.</p>

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
        <p className="ca-note">Valeurs indicatives par 100 g (moyennes). Les valeurs réelles varient selon la marque et la préparation.</p>

        <div className="ca-final">
          <div className="ca-final-t">Suis {al.nom.fr.toLowerCase()} dans ton journal</div>
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

const CAL_CSS = `
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
.ca-intro{font-size:1.02rem;line-height:1.6;color:#4b5563;margin:0 0 18px}
.ca-intro b{color:#166a3a}
.ca-kpis{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 8px}
.ca-kpi{background:#fff;border:1px solid #cdebd7;border-radius:18px;padding:18px;text-align:center;box-shadow:0 6px 20px -14px rgba(20,80,44,.4)}
.ca-kpi-alt{background:#e9f8ee}
.ca-kv{font-size:2.2rem;font-weight:800;letter-spacing:-1px;color:#16a34a;line-height:1;font-variant-numeric:tabular-nums}
.ca-kl{font-size:.78rem;font-weight:700;color:#6b7280;margin-top:5px}
.ca-h2{font-size:1.25rem;font-weight:800;letter-spacing:-.3px;color:#1a2030;margin:30px 0 12px;padding-bottom:10px;border-bottom:1px solid #f6cdd9}
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
