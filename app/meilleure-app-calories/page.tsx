import type { Metadata, Viewport } from "next";

const CANON = "https://calorio.ch/meilleure-app-calories";

export const metadata: Metadata = {
  title: "Meilleure app de calories gratuite en Suisse (2026) | calorio",
  description:
    "Quelle est la meilleure application de comptage de calories en Suisse ? Comparatif honnête : gratuite, sans pub, avec coach IA, scan de code-barres et produits Migros/Coop. Essaie calorio, sans installation.",
  alternates: { canonical: CANON },
  openGraph: { title: "Meilleure app de calories gratuite en Suisse — calorio", description: "Gratuite, sans pub, coach IA et produits suisses. Le comparatif 2026.", url: CANON, type: "article", siteName: "calorio" },
};

export const viewport: Viewport = { themeColor: "#f3f7f2" };

const rows: { label: string; calorio: string; autres: string }[] = [
  { label: "Prix", calorio: "Gratuit · Pro CHF 39/an", autres: "Souvent 50–100 $/an" },
  { label: "Publicités", calorio: "Aucune", autres: "Fréquentes (version gratuite)" },
  { label: "Scan de code-barres", calorio: "Gratuit", autres: "Souvent réservé au payant" },
  { label: "Coach nutrition IA", calorio: "Inclus en Pro", autres: "Rare" },
  { label: "Repas en photo → calories", calorio: "Oui (Pro)", autres: "Rare" },
  { label: "Produits suisses (Migros/Coop)", calorio: "Mis en avant", autres: "Limités" },
  { label: "Langues", calorio: "FR · DE · EN", autres: "Variable" },
  { label: "Installation", calorio: "Aucune (navigateur)", autres: "Application à installer" },
];

const faq = [
  { q: "Quelle est la meilleure app de calories gratuite en Suisse ?", a: "Pour un usage simple, gratuit et sans pub, avec un coach nutrition IA, le scan de code-barres inclus et des produits suisses (Migros, Coop), calorio est une excellente option — et il fonctionne directement dans le navigateur, sans rien installer." },
  { q: "Faut-il payer pour compter ses calories ?", a: "Non. Sur calorio, le comptage des calories, le journal alimentaire, le suivi du poids et le scan de code-barres sont entièrement gratuits. La version Pro (coach IA + analyse photo) est optionnelle, à CHF 4.90/mois ou CHF 39/an." },
  { q: "L'application connaît-elle les produits suisses ?", a: "Oui. calorio met en avant des produits Migros et Coop, des recettes et des spécialités suisses, ce qui manque souvent aux applications internationales." },
  { q: "Y a-t-il des publicités ?", a: "Non. calorio n'affiche aucune publicité et ne revend jamais tes données." },
  { q: "Peut-on l'utiliser sans créer de compte ?", a: "Oui. Tu peux tout utiliser sans compte : dans ce cas, tes données restent sur ton appareil. Un compte gratuit permet de synchroniser entre téléphone et ordinateur." },
];

const faqLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ml-bg" aria-hidden />
      <main className="ml">
        <header className="ml-top">
          <a className="ml-brand" href="https://calorio.ch/"><img src="/calorio-icon-192.png" alt="" width={30} height={30} /> calorio</a>
        </header>
        <nav className="ml-crumb" aria-label="fil d'ariane"><a href="https://calorio.ch/">calorio</a> <span aria-hidden>›</span> Meilleure app de calories</nav>

        <h1 className="ml-h1">Meilleure app de calories gratuite en Suisse</h1>
        <p className="ml-intro">Tu cherches une application simple pour compter tes calories, sans pub et sans te ruiner ? Voici ce qui compte vraiment, et pourquoi calorio coche les bonnes cases — gratuit, avec coach nutrition IA, scan de code-barres inclus et produits suisses.</p>
        <a className="ml-cta" href="https://calorio.ch/calorio">Ouvrir calorio gratuitement <span aria-hidden>→</span></a>

        <h2 className="ml-h2">Ce qu'une bonne app de calories doit avoir</h2>
        <div className="ml-tablewrap">
          <table className="ml-table">
            <thead><tr><th /><th>calorio</th><th>La plupart des autres</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label}><th scope="row">{r.label}</th><td className="ml-yes">{r.calorio}</td><td>{r.autres}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="ml-h2">Comparatifs détaillés</h2>
        <div className="ml-links">
          <a href="/calorio-vs-myfitnesspal">calorio vs MyFitnessPal →</a>
          <a href="/calorio-vs-yazio">calorio vs YAZIO →</a>
          <a href="/calorio-vs-lifesum">calorio vs Lifesum →</a>
          <a href="/calorio-vs-cronometer">calorio vs Cronometer →</a>
        </div>

        <h2 className="ml-h2">Explore avant de te lancer</h2>
        <div className="ml-links">
          <a href="/calories">Calories des aliments →</a>
          <a href="/recettes">Recettes & leurs calories →</a>
        </div>

        <h2 className="ml-h2">Questions fréquentes</h2>
        <div className="ml-faq">
          {faq.map((f) => (
            <details className="ml-fitem" key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
          ))}
        </div>

        <div className="ml-final">
          <div className="ml-final-t">Prêt à compter tes calories, simplement ?</div>
          <p>Gratuit, sans pub, sans installation. Ouvre calorio dans ton navigateur en un clic.</p>
          <a className="ml-cta" href="https://calorio.ch/calorio">Ouvrir calorio <span aria-hidden>→</span></a>
        </div>
        <p className="ml-disc">Comparaison indicative basée sur des informations publiques en septembre 2026 ; les offres et prix des autres applications peuvent changer. Les marques citées appartiennent à leurs propriétaires respectifs.</p>
      </main>
    </>
  );
}

const CSS = `
body{background:#f3f7f2 !important}
.ml-bg{position:fixed;inset:0;z-index:-5;background:radial-gradient(1100px 560px at 50% -8%, #e9faf0, #f3f7f2 62%)}
.ml{max-width:780px;margin:0 auto;padding:16px 18px 70px;color:#2b3243;font-family:inherit}
.ml a{color:inherit}
.ml-top{padding:8px 2px 6px}
.ml-brand{display:inline-flex;align-items:center;gap:9px;font-size:1.2rem;font-weight:800;letter-spacing:-.3px;color:#16a34a;text-decoration:none}
.ml-brand img{border-radius:9px}
.ml-crumb{font-size:.82rem;color:#8a93a3;margin:6px 2px 16px}
.ml-crumb a{color:#16a34a;text-decoration:none}
.ml-h1{font-size:1.9rem;line-height:1.2;font-weight:800;letter-spacing:-.5px;color:#1a2030;margin:0 0 12px;text-wrap:balance}
.ml-intro{font-size:1.04rem;line-height:1.6;color:#4b5563;margin:0 0 16px}
.ml-cta{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#34d17f,#16a34a);color:#fff;text-decoration:none;font-weight:800;font-size:1rem;border-radius:13px;padding:13px 22px;box-shadow:0 12px 26px -10px rgba(22,163,74,.55)}
.ml-h2{font-size:1.25rem;font-weight:800;letter-spacing:-.3px;color:#1a2030;margin:32px 0 12px;padding-bottom:10px;border-bottom:1px solid #f6cdd9}
.ml-tablewrap{overflow-x:auto;border:1px solid #e4e9f0;border-radius:16px;background:#fff;box-shadow:0 6px 20px -14px rgba(20,40,80,.2)}
.ml-table{width:100%;border-collapse:collapse;font-size:.92rem;min-width:420px}
.ml-table th,.ml-table td{text-align:left;padding:12px 14px;border-bottom:1px solid #eef1f6}
.ml-table thead th{font-size:.85rem;font-weight:800;color:#6b7280;background:#f8fafc}
.ml-table thead th:nth-child(2){color:#16a34a}
.ml-table tbody th{font-weight:700;color:#374151}
.ml-table tbody td{font-weight:700;color:#4b5563}
.ml-table tbody td.ml-yes{color:#166a3a}
.ml-table tbody tr:last-child th,.ml-table tbody tr:last-child td{border-bottom:0}
.ml-links{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.ml-links a{display:block;background:#fff;border:1px solid #e4e9f0;border-radius:13px;padding:13px 15px;text-decoration:none;font-weight:700;color:#166a3a;font-size:.92rem;box-shadow:0 4px 14px -12px rgba(20,40,80,.2)}
.ml-links a:hover{border-color:#bfe6cd}
.ml-faq{display:flex;flex-direction:column;gap:10px}
.ml-fitem{background:#fff;border:1px solid #e4e9f0;border-radius:13px;overflow:hidden}
.ml-fitem summary{cursor:pointer;padding:14px 16px;font-weight:700;color:#232a37;font-size:.95rem;list-style:none}
.ml-fitem summary::-webkit-details-marker{display:none}
.ml-fitem summary::after{content:"+";float:right;color:#16a34a;font-weight:800}
.ml-fitem[open] summary::after{content:"−"}
.ml-fitem p{margin:0;padding:0 16px 15px;color:#4b5563;line-height:1.6;font-size:.92rem}
.ml-final{margin:28px 0 0;text-align:center;background:linear-gradient(135deg,#eafaf0,#fdecf1);border:1px solid #cdebd7;border-radius:20px;padding:26px 22px}
.ml-final-t{font-size:1.2rem;font-weight:800;color:#1a2030}
.ml-final p{margin:7px 0 15px;color:#4b5563;line-height:1.5}
.ml-disc{margin:22px 0 0;font-size:.76rem;color:#9aa2b4;text-align:center;line-height:1.5}
@media(max-width:560px){.ml-h1{font-size:1.55rem}.ml-links{grid-template-columns:1fr}}
`;
