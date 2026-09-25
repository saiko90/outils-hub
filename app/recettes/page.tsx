import type { Metadata, Viewport } from "next";
import { RECETTES, recetteSlug, recetteNutri, type RecetteCat } from "@/lib/calorio";

const CANON = "https://calorio.ch/recettes";

export const metadata: Metadata = {
  title: "Recettes équilibrées et leurs calories | calorio",
  description:
    "Des recettes simples (lasagnes, poke bowl, curry, raclette, porridge…) avec calories et macros par portion. Ajoute-les à ton journal en un tap, gratuitement, avec calorio.",
  alternates: { canonical: CANON },
  openGraph: { title: "Recettes & calories — calorio", description: "Recettes équilibrées avec calories et macros par portion.", url: CANON, type: "website", siteName: "calorio" },
};

export const viewport: Viewport = { themeColor: "#f3f7f2" };

const CAT_ORDER: RecetteCat[] = ["petitdej", "healthy", "plat", "sucre"];
const CAT_FR: Record<RecetteCat, string> = {
  petitdej: "Petit-déjeuner", healthy: "Healthy & fitness", plat: "Plats", sucre: "Sucré & desserts",
};

export default function Page() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: IDX_CSS }} />
      <div className="ci-bg" aria-hidden />
      <main className="ci">
        <header className="ci-top">
          <a className="ci-brand" href="https://calorio.ch/"><img src="/calorio-icon-192.png" alt="" width={30} height={30} /> calorio</a>
        </header>
        <nav className="ci-crumb" aria-label="fil d'ariane"><a href="https://calorio.ch/">calorio</a> <span aria-hidden>›</span> Recettes</nav>

        <h1 className="ci-h1">Recettes équilibrées & calories</h1>
        <p className="ci-intro">Des recettes simples avec leurs calories et macros par portion. Clique pour le détail — et dans calorio, ajoute une recette entière à ton journal en un seul tap. Gratuit, sans pub.</p>
        <a className="ci-cta" href="https://calorio.ch/calorio">Ouvrir calorio <span aria-hidden>→</span></a>

        {CAT_ORDER.map((cat) => {
          const items = RECETTES.filter((r) => r.cat === cat);
          if (items.length === 0) return null;
          return (
            <section key={cat}>
              <h2 className="ci-h2">{CAT_FR[cat]}</h2>
              <div className="ci-grid">
                {items.map((r) => {
                  const n = recetteNutri(r);
                  return (
                    <a className="ci-card" key={r.id} href={`/recettes/${recetteSlug(r)}`}>
                      <span className="ci-emo" aria-hidden>{r.emoji}</span>
                      <span className="ci-n">{r.nom.fr}<small>⏱️ {r.temps} min</small></span>
                      <span className="ci-k">{n.parPortion.kcal} kcal<small>/portion</small></span>
                    </a>
                  );
                })}
              </div>
            </section>
          );
        })}

        <p className="ci-disc">Valeurs indicatives (moyennes par ingrédient) ; elles varient selon les marques et la préparation.</p>
        <p className="ci-back"><a href="/calories">Voir aussi : calories des aliments →</a></p>
      </main>
    </>
  );
}

const IDX_CSS = `
body{background:#f3f7f2 !important}
.ci-bg{position:fixed;inset:0;z-index:-5;background:radial-gradient(1100px 560px at 50% -8%, #e9faf0, #f3f7f2 62%)}
.ci{max-width:820px;margin:0 auto;padding:16px 18px 70px;color:#2b3243;font-family:inherit}
.ci a{color:inherit}
.ci-top{padding:8px 2px 6px}
.ci-brand{display:inline-flex;align-items:center;gap:9px;font-size:1.2rem;font-weight:800;letter-spacing:-.3px;color:#16a34a;text-decoration:none}
.ci-brand img{border-radius:9px}
.ci-crumb{font-size:.82rem;color:#8a93a3;margin:6px 2px 16px}
.ci-crumb a{color:#16a34a;text-decoration:none}
.ci-h1{font-size:1.85rem;line-height:1.2;font-weight:800;letter-spacing:-.5px;color:#1a2030;margin:0 0 12px}
.ci-intro{font-size:1.02rem;line-height:1.6;color:#4b5563;margin:0 0 14px}
.ci-cta{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#34d17f,#16a34a);color:#fff;text-decoration:none;font-weight:800;font-size:1rem;border-radius:13px;padding:12px 20px;box-shadow:0 12px 26px -10px rgba(22,163,74,.55)}
.ci-h2{font-size:1.2rem;font-weight:800;letter-spacing:-.3px;color:#1a2030;margin:30px 0 12px;padding-bottom:10px;border-bottom:1px solid #f6cdd9}
.ci-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.ci-card{display:flex;align-items:center;gap:9px;background:#fff;border:1px solid #e4e9f0;border-radius:13px;padding:11px 12px;text-decoration:none;box-shadow:0 4px 14px -12px rgba(20,40,80,.2)}
.ci-card:hover{border-color:#bfe6cd}
.ci-emo{font-size:1.35rem}
.ci-n{flex:1;min-width:0;font-weight:700;color:#232a37;font-size:.9rem;line-height:1.25}
.ci-n small{display:block;font-size:.66rem;font-weight:600;color:#9aa2b4;margin-top:2px}
.ci-k{font-size:.74rem;color:#166a3a;text-align:right;font-weight:800;font-variant-numeric:tabular-nums}
.ci-k small{display:block;font-size:.62rem;color:#9aa2b4;font-weight:600}
.ci-disc{margin:26px 0 0;font-size:.78rem;color:#9aa2b4;text-align:center;line-height:1.5}
.ci-back{margin:14px 0 0;text-align:center}
.ci-back a{color:#16a34a;text-decoration:none;font-weight:700;font-size:.9rem}
@media(max-width:560px){.ci-h1{font-size:1.5rem}.ci-grid{grid-template-columns:1fr}}
`;
