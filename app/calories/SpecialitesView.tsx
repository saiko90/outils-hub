import type { Metadata } from "next";
import { CH_GROUPS, CH_IDS, CH_RECETTES, aliment, alimentSlug, seoName, recette, recetteSlug, recetteNutri, type Aliment } from "@/lib/calorio";
import { magPublished, magUrl, type MagLang } from "@/lib/mag";

// Pages pivots « Calories des spécialités suisses » (FR) et « Kalorien Schweizer Spezialitäten » (DE).
// Les liens vont vers les fiches /calories (FR) tant qu'il n'existe pas de fiches allemandes.

export const SPECIALITES_PATH: Record<MagLang, string> = { fr: "/calories/specialites-suisses", de: "/de/kalorien/schweizer-spezialitaeten" };
const ORIGIN = "https://calorio.ch";

const T = {
  fr: {
    title: "Calories des spécialités suisses : raclette, fondue, rösti",
    description: "Combien de calories dans les plats suisses ? Raclette, fondue, papet vaudois, Älplermagronen, cuchaule, tresse : valeurs pour 100 g et par portion.",
    h1: "Calories des spécialités suisses",
    intro: "Raclette, fondue, rösti, tresse ou Läckerli : voici les calories des spécialités suisses, pour 100 g et pour une portion courante. Clique sur un aliment pour le détail des protéines, glucides et lipides.",
    crumbHome: "calorio", crumbFoods: "Calories des aliments",
    head: ["Spécialité", "Pour 100 g", "Par portion", "Portion"],
    mag: "Dans le Mag", recipes: "Recettes suisses", perPortion: "par portion",
    other: "Deutsche Version", method: "Méthode et sources", open: "Ouvrir calorio",
    note: "Valeurs indicatives ; elles varient selon la recette, le producteur et la préparation.",
  },
  de: {
    title: "Kalorien Schweizer Spezialitäten: Raclette, Fondue, Rösti",
    description: "Wie viele Kalorien haben Schweizer Gerichte? Raclette, Fondue, Älplermagronen, Butterzopf, Capuns, Nusstorte: Werte pro 100 g und pro Portion.",
    h1: "Kalorien Schweizer Spezialitäten",
    intro: "Raclette, Fondue, Rösti, Zopf oder Läckerli: Hier findest du die Kalorien der Schweizer Spezialitäten, pro 100 g und pro übliche Portion. Ein Klick auf ein Lebensmittel zeigt Eiweiss, Kohlenhydrate und Fett (Detailseiten auf Französisch).",
    crumbHome: "calorio", crumbFoods: "",
    head: ["Spezialität", "Pro 100 g", "Pro Portion", "Portion"],
    mag: "Im Magazin", recipes: "Schweizer Rezepte (Französisch)", perPortion: "pro Portion",
    other: "Version française", method: "Methode und Quellen", open: "calorio öffnen",
    note: "Richtwerte; sie variieren je nach Rezept, Hersteller und Zubereitung.",
  },
} as const;

const r0 = (n: number) => Math.round(n);
const nameOf = (al: Aliment, lang: MagLang) => (lang === "de" ? al.nom.de : seoName(al));

export function specialitesMetadata(lang: MagLang): Metadata {
  const t = T[lang];
  const fr = ORIGIN + SPECIALITES_PATH.fr, de = ORIGIN + SPECIALITES_PATH.de;
  const url = lang === "fr" ? fr : de;
  return {
    title: t.title,
    description: t.description,
    alternates: { canonical: url, languages: { "fr-CH": fr, "de-CH": de, "x-default": fr } },
    openGraph: { title: t.title, description: t.description, url, type: "website", siteName: "calorio", locale: lang === "fr" ? "fr_CH" : "de_CH" },
    robots: { index: true, follow: true },
    applicationName: "calorio",
    icons: { icon: [{ url: "/calorio-icon-192.png", sizes: "192x192", type: "image/png" }], apple: [{ url: "/calorio-icon-180.png", sizes: "180x180", type: "image/png" }] },
  };
}

export function SpecialitesView({ lang }: { lang: MagLang }) {
  const t = T[lang];
  const other: MagLang = lang === "fr" ? "de" : "fr";
  const url = ORIGIN + SPECIALITES_PATH[lang];
  const groups = CH_GROUPS.map((g) => ({ ...g, items: g.ids.map((id) => aliment(id)).filter((x): x is Aliment => !!x) }));
  const articles = magPublished().filter((a) => (a.related?.aliments || []).some((id) => CH_IDS.includes(id))).slice(0, 6);
  const recipes = CH_RECETTES.map((id) => recette(id)).filter((r): r is NonNullable<ReturnType<typeof recette>> => !!r);
  const home = lang === "de" ? `${ORIGIN}/de` : `${ORIGIN}/`;

  const crumbs = lang === "fr"
    ? [{ name: t.crumbHome, item: home }, { name: t.crumbFoods, item: `${ORIGIN}/calories` }, { name: t.h1, item: url }]
    : [{ name: t.crumbHome, item: home }, { name: t.h1, item: url }];
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ItemList", name: t.h1, url,
        numberOfItems: groups.reduce((n, g) => n + g.items.length, 0),
        itemListElement: groups.flatMap((g) => g.items).map((al, i) => ({ "@type": "ListItem", position: i + 1, name: nameOf(al, lang), url: `${ORIGIN}/calories/${alimentSlug(al)}` })),
      },
      { "@type": "BreadcrumbList", itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })) },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <style dangerouslySetInnerHTML={{ __html: SP_CSS }} />
      <div className="sp-bg" aria-hidden />
      <main className="sp" lang={lang === "de" ? "de-CH" : "fr-CH"}>
        <header className="sp-top">
          <a className="sp-brand" href={home}><img src="/calorio-icon-192.png" alt="" width={30} height={30} /> calorio</a>
          <a className="sp-lang" href={SPECIALITES_PATH[other]} hrefLang={other === "de" ? "de-CH" : "fr-CH"}>{t.other}</a>
        </header>
        <nav className="sp-crumb" aria-label={lang === "de" ? "Brotkrümel" : "fil d'ariane"}>
          {crumbs.slice(0, -1).map((c) => <span key={c.item}><a href={c.item}>{c.name}</a> <span aria-hidden>›</span> </span>)}
          {t.h1}
        </nav>

        <h1 className="sp-h1">🇨🇭 {t.h1}</h1>
        <p className="sp-intro">{t.intro}</p>

        {groups.map((g) => (
          <section key={g.id}>
            <h2 className="sp-h2">{g[lang]}</h2>
            <div className="sp-tablewrap">
              <table className="sp-table">
                <thead><tr>{t.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
                <tbody>
                  {g.items.map((al) => (
                    <tr key={al.id}>
                      <th scope="row"><a href={`/calories/${alimentSlug(al)}`}><span aria-hidden>{al.emoji} </span>{nameOf(al, lang)}</a></th>
                      <td>{al.kcal} kcal</td>
                      <td>{r0((al.kcal * al.portion) / 100)} kcal</td>
                      <td>{al.portion} g</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
        <p className="sp-note">{t.note} <a href={lang === "de" ? "/de/magazin/methode" : "/mag/methode"}>{t.method}</a></p>

        {articles.length > 0 && (
          <>
            <h2 className="sp-h2">{t.mag}</h2>
            <ul className="sp-list">
              {articles.map((a) => <li key={a.id}><a href={magUrl(a, lang)}>{a.emoji ? `${a.emoji} ` : ""}{a[lang].title}</a></li>)}
            </ul>
          </>
        )}

        {recipes.length > 0 && (
          <>
            <h2 className="sp-h2">{t.recipes}</h2>
            <ul className="sp-list">
              {recipes.map((r) => <li key={r.id}><a href={`/recettes/${recetteSlug(r)}`}>{r.emoji} {r.nom[lang]}</a> · {recetteNutri(r).parPortion.kcal} kcal {t.perPortion}</li>)}
            </ul>
          </>
        )}

        <p className="sp-cta-wrap"><a className="sp-cta" href="https://calorio.ch/calorio">{t.open} <span aria-hidden>→</span></a></p>
      </main>
    </>
  );
}

const SP_CSS = `
body{background:#f3f7f2 !important}
.sp-bg{position:fixed;inset:0;z-index:-5;background:radial-gradient(1100px 560px at 50% -8%, #e9faf0, #f3f7f2 62%)}
.sp{max-width:820px;margin:0 auto;padding:16px 18px 70px;color:#2b3243;font-family:inherit}
.sp a{color:inherit}
.sp-top{display:flex;align-items:center;justify-content:space-between;padding:8px 2px 6px}
.sp-brand{display:inline-flex;align-items:center;gap:9px;font-size:1.2rem;font-weight:800;letter-spacing:-.3px;color:#16a34a !important;text-decoration:none}
.sp-brand img{border-radius:9px}
.sp-lang{font-size:.85rem;font-weight:700;color:#16a34a !important;text-decoration:none}
.sp-crumb{font-size:.82rem;color:#8a93a3;margin:6px 2px 16px}
.sp-crumb a{color:#16a34a;text-decoration:none}
.sp-h1{font-size:1.85rem;line-height:1.2;font-weight:800;letter-spacing:-.5px;color:#1a2030;margin:0 0 12px}
.sp-intro{font-size:1.02rem;line-height:1.6;color:#4b5563;margin:0 0 8px}
.sp-h2{font-size:1.2rem;font-weight:800;letter-spacing:-.3px;color:#1a2030;margin:30px 0 12px;padding-bottom:10px;border-bottom:1px solid #f6cdd9}
.sp-tablewrap{overflow-x:auto;border:1px solid #e4e9f0;border-radius:16px;background:#fff;box-shadow:0 6px 20px -14px rgba(20,40,80,.2)}
.sp-table{width:100%;border-collapse:collapse;font-size:.94rem;min-width:440px}
.sp-table th,.sp-table td{text-align:left;padding:11px 14px;border-bottom:1px solid #eef1f6}
.sp-table thead th{font-size:.8rem;font-weight:800;color:#6b7280;background:#f8fafc}
.sp-table tbody th{font-weight:700;color:#232a37}
.sp-table tbody th a{text-decoration:none}
.sp-table tbody th a:hover{color:#16a34a}
.sp-table tbody td{font-variant-numeric:tabular-nums;color:#1f2937}
.sp-table tbody tr:last-child th,.sp-table tbody tr:last-child td{border-bottom:0}
.sp-note{font-size:.78rem;color:#9aa2b4;margin:14px 2px 0;line-height:1.5}
.sp-list{margin:0;padding-left:20px;line-height:1.9}
.sp-list a{color:#166a3a;font-weight:700}
.sp-cta-wrap{text-align:center;margin:30px 0 0}
.sp-cta{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#34d17f,#16a34a);color:#fff !important;text-decoration:none;font-weight:800;font-size:1rem;border-radius:13px;padding:12px 20px;box-shadow:0 12px 26px -10px rgba(22,163,74,.55)}
@media(max-width:560px){.sp-h1{font-size:1.5rem}}
`;
