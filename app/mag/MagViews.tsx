import type { ReactNode } from "react";
import {
  MAG_CATS, MAG_CAT_ORDER, MAG_ORIGIN, magPublished, magUrl, magDate, readingMinutes, inlineParts, plain,
  type MagArticle, type MagBlock, type MagLang, type MagCat,
} from "@/lib/mag";
import { ALIMENTS, RECETTES, alimentSlug, recetteSlug, recetteNutri } from "@/lib/calorio";

// Vues partagées du Mag calorio (index + article), en français et en allemand.

const T = {
  fr: {
    mag: "Le Mag calorio",
    home: "calorio",
    indexIntro: "Les classiques suisses passés à la loupe, des recettes légères ou nourrissantes et des guides pratiques pour manger équilibré sans prise de tête. Les calories sont calculées pour des portions suisses réalistes.",
    all: "Tous les articles",
    read: "min de lecture",
    open: "Ouvrir calorio",
    ctaTitle: "Note ce repas en un clic",
    ctaText: "calorio compte tes calories et tes macros, connaît les produits Migros et Coop, et t'aide à garder le cap. Gratuit, sans pub.",
    faq: "Questions fréquentes",
    sources: "Sources",
    more: "À lire aussi",
    relatedFoods: "Calories détaillées",
    relatedRecipes: "Recettes liées",
    other: "Deutsche Version",
    back: "← Tout le Mag",
    empty: "Les premiers articles arrivent très bientôt.",
    seeAlso: "Voir aussi : calories des aliments et recettes",
    perPortion: "/portion",
    disclaimer: "Valeurs indicatives, calculées pour des portions courantes ; elles varient selon les produits et la préparation. Ces conseils ne remplacent pas l'avis d'un·e professionnel·le de santé.",
  },
  de: {
    mag: "Das calorio Magazin",
    home: "calorio",
    indexIntro: "Schweizer Klassiker unter der Lupe, leichte oder sättigende Rezepte und praktische Ratgeber für eine ausgewogene Ernährung ohne Stress. Die Kalorien sind für realistische Schweizer Portionen berechnet.",
    all: "Alle Artikel",
    read: "Min. Lesezeit",
    open: "calorio öffnen",
    ctaTitle: "Diese Mahlzeit mit einem Klick erfassen",
    ctaText: "calorio zählt deine Kalorien und Makros, kennt die Produkte von Migros und Coop und hilft dir, dranzubleiben. Gratis und ohne Werbung.",
    faq: "Häufige Fragen",
    sources: "Quellen",
    more: "Weiterlesen",
    relatedFoods: "Kalorien im Detail (Französisch)",
    relatedRecipes: "Passende Rezepte (Französisch)",
    other: "Version française",
    back: "← Zum Magazin",
    empty: "Die ersten Artikel erscheinen in Kürze.",
    seeAlso: "",
    perPortion: "/Portion",
    disclaimer: "Richtwerte, berechnet für übliche Portionen; sie variieren je nach Produkt und Zubereitung. Diese Tipps ersetzen keine Beratung durch eine Fachperson.",
  },
} as const;

function Inline({ text }: { text: string }) {
  return (
    <>
      {inlineParts(text).map((p, i) =>
        p.t === "b" ? <b key={i}>{p.v}</b> : p.t === "a" ? <a key={i} href={p.href}>{p.v}</a> : <span key={i}>{p.v}</span>
      )}
    </>
  );
}

function Block({ b }: { b: MagBlock }) {
  switch (b.type) {
    case "h2": return <h2 className="mg-h2">{b.text}</h2>;
    case "p": return <p className="mg-p"><Inline text={b.text} /></p>;
    case "ul": return <ul className="mg-ul">{b.items.map((t, i) => <li key={i}><Inline text={t} /></li>)}</ul>;
    case "ol": return <ol className="mg-ol">{b.items.map((t, i) => <li key={i}><Inline text={t} /></li>)}</ol>;
    case "tip": return (
      <aside className="mg-tip">
        {b.title && <div className="mg-tip-t">{b.title}</div>}
        <p><Inline text={b.text} /></p>
      </aside>
    );
    case "table": return (
      <>
        <div className="mg-tablewrap">
          <table className="mg-table">
            <thead><tr>{b.head.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
            <tbody>{b.rows.map((r, i) => <tr key={i}>{r.map((c, j) => j === 0 ? <th key={j} scope="row"><Inline text={c} /></th> : <td key={j}><Inline text={c} /></td>)}</tr>)}</tbody>
          </table>
        </div>
        {b.note && <p className="mg-note">{b.note}</p>}
      </>
    );
    default: return null;
  }
}

function Shell({ lang, children, crumb }: { lang: MagLang; children: ReactNode; crumb: ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: MAG_CSS }} />
      <div className="mg-bg" aria-hidden />
      <main className="mg" lang={lang === "de" ? "de-CH" : "fr-CH"}>
        <header className="mg-top">
          <a className="mg-brand" href={lang === "de" ? "https://calorio.ch/de" : "https://calorio.ch/"}><img src="/calorio-icon-192.png" alt="" width={30} height={30} /> calorio</a>
          <a className="mg-topcta" href="https://calorio.ch/calorio">{T[lang].open}</a>
        </header>
        <nav className="mg-crumb" aria-label={lang === "de" ? "Brotkrümel" : "fil d'ariane"}>{crumb}</nav>
        {children}
      </main>
    </>
  );
}

function Card({ a, lang }: { a: MagArticle; lang: MagLang }) {
  const l = a[lang];
  return (
    <a className="mg-card" href={magUrl(a, lang)}>
      <div className="mg-card-top">
        <span className="mg-card-emo" aria-hidden>{a.emoji || MAG_CATS[a.cat].emoji}</span>
        <span className="mg-card-cat">{MAG_CATS[a.cat][lang]}</span>
        {a.kcal && <span className="mg-card-k">{a.kcal.value} kcal</span>}
      </div>
      <span className="mg-card-t">{l.title}</span>
      <span className="mg-card-d">{l.description}</span>
      <span className="mg-card-m">{magDate(a.date, lang)} · {readingMinutes(l)} {T[lang].read}</span>
    </a>
  );
}

export function MagIndexView({ lang, cat }: { lang: MagLang; cat?: MagCat }) {
  const t = T[lang];
  const list = magPublished().filter((a) => !cat || a.cat === cat);
  const used = MAG_CAT_ORDER.filter((c) => magPublished().some((a) => a.cat === c));
  const base = lang === "de" ? "/de/magazin" : "/mag";
  const ld = {
    "@context": "https://schema.org", "@type": "Blog", name: t.mag, url: MAG_ORIGIN + base, inLanguage: lang === "de" ? "de-CH" : "fr-CH",
    publisher: { "@type": "Organization", name: "calorio", url: "https://calorio.ch/", logo: { "@type": "ImageObject", url: "https://calorio.ch/calorio-icon-512.png" } },
    blogPost: list.slice(0, 20).map((a) => ({ "@type": "BlogPosting", headline: a[lang].title, url: magUrl(a, lang, true), datePublished: a.date })),
  };
  return (
    <Shell lang={lang} crumb={<><a href={lang === "de" ? "https://calorio.ch/de" : "https://calorio.ch/"}>calorio</a> <span aria-hidden>›</span> {t.mag}</>}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <h1 className="mg-h1">{t.mag}</h1>
      <p className="mg-intro">{t.indexIntro}</p>
      {used.length > 1 && (
        <div className="mg-chips" role="list">
          {used.map((c) => <a role="listitem" key={c} className="mg-chip" href={`${base}#${c}`}>{MAG_CATS[c].emoji} {MAG_CATS[c][lang]}</a>)}
        </div>
      )}
      {list.length === 0 && <p className="mg-intro">{t.empty}</p>}
      {list.length > 0 && <div className="mg-grid">{list.map((a) => <Card key={a.id} a={a} lang={lang} />)}</div>}
      {lang === "fr" && (
        <p className="mg-xlink"><a href="/calories">Calories des aliments</a> · <a href="/recettes">Recettes et leurs calories</a> · <a href="/de/magazin">Deutsch</a></p>
      )}
      {lang === "de" && <p className="mg-xlink"><a href="/mag">Version française</a></p>}
      <div className="mg-final">
        <div className="mg-final-t">{t.ctaTitle}</div>
        <p>{t.ctaText}</p>
        <a className="mg-cta" href="https://calorio.ch/calorio">{t.open} <span aria-hidden>→</span></a>
      </div>
    </Shell>
  );
}

export function MagArticleView({ a, lang }: { a: MagArticle; lang: MagLang }) {
  const t = T[lang];
  const l = a[lang];
  const other: MagLang = lang === "fr" ? "de" : "fr";
  const url = magUrl(a, lang, true);
  const img = `${MAG_ORIGIN}/mag/${a.fr.slug}/image?lang=${lang}&format=og`;
  const more = magPublished().filter((x) => x.id !== a.id).sort((x, y) => (x.cat === a.cat ? -1 : 0) - (y.cat === a.cat ? -1 : 0)).slice(0, 4);
  const foods = (a.related?.aliments || []).map((id) => ALIMENTS.find((x) => x.id === id)).filter((x): x is (typeof ALIMENTS)[number] => !!x);
  const recipes = (a.related?.recettes || []).map((id) => RECETTES.find((x) => x.id === id)).filter((x): x is (typeof RECETTES)[number] => !!x);
  const base = lang === "de" ? "/de/magazin" : "/mag";

  const articleLd = {
    "@context": "https://schema.org", "@type": "Article", headline: l.title, description: l.description, image: [img],
    datePublished: a.date, dateModified: a.updated || a.date, inLanguage: lang === "de" ? "de-CH" : "fr-CH", mainEntityOfPage: url,
    author: { "@type": "Organization", name: "calorio", url: "https://calorio.ch/" },
    publisher: { "@type": "Organization", name: "calorio", url: "https://calorio.ch/", logo: { "@type": "ImageObject", url: "https://calorio.ch/calorio-icon-512.png" } },
  };
  const crumbLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "calorio", item: lang === "de" ? "https://calorio.ch/de" : "https://calorio.ch/" },
      { "@type": "ListItem", position: 2, name: t.mag, item: MAG_ORIGIN + base },
      { "@type": "ListItem", position: 3, name: l.title, item: url },
    ],
  };
  const faqLd = l.faq && l.faq.length ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: l.faq.map((f) => ({ "@type": "Question", name: plain(f.q), acceptedAnswer: { "@type": "Answer", text: plain(f.a) } })) } : null;

  return (
    <Shell lang={lang} crumb={<><a href={lang === "de" ? "https://calorio.ch/de" : "https://calorio.ch/"}>calorio</a> <span aria-hidden>›</span> <a href={base}>{t.mag}</a> <span aria-hidden>›</span> {MAG_CATS[a.cat][lang]}</>}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(crumbLd) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      <article>
        <div className="mg-meta">
          <span className="mg-chip mg-chip-s">{MAG_CATS[a.cat].emoji} {MAG_CATS[a.cat][lang]}</span>
          <span className="mg-meta-t">{magDate(a.date, lang)} · {readingMinutes(l)} {t.read}</span>
          <a className="mg-meta-l" href={magUrl(a, other)} hrefLang={other === "de" ? "de-CH" : "fr-CH"}>{t.other}</a>
        </div>
        <h1 className="mg-h1">{a.emoji && <span className="mg-emo" aria-hidden>{a.emoji}</span>}{l.title}</h1>
        <p className="mg-lead"><Inline text={l.intro} /></p>
        {a.kcal && (
          <div className="mg-kpi"><div className="mg-kv">{a.kcal.value}</div><div className="mg-kl">{a.kcal.label[lang]}</div></div>
        )}
        {l.blocks.map((b, i) => <Block key={i} b={b} />)}

        <div className="mg-final">
          <div className="mg-final-t">{t.ctaTitle}</div>
          <p>{t.ctaText}</p>
          <a className="mg-cta" href="https://calorio.ch/calorio">{t.open} <span aria-hidden>→</span></a>
        </div>

        {(foods.length > 0 || recipes.length > 0) && (
          <>
            {foods.length > 0 && <h2 className="mg-h2">{t.relatedFoods}</h2>}
            {foods.length > 0 && (
              <div className="mg-rel">
                {foods.map((f) => (
                  <a className="mg-relcard" key={f.id} href={`/calories/${alimentSlug(f)}`}>
                    <span className="mg-relemo" aria-hidden>{f.emoji}</span>
                    <span className="mg-reln">{f.nom[lang]}</span>
                    <span className="mg-relk">{f.kcal} kcal<small>/100 g</small></span>
                  </a>
                ))}
              </div>
            )}
            {recipes.length > 0 && <h2 className="mg-h2">{t.relatedRecipes}</h2>}
            {recipes.length > 0 && (
              <div className="mg-rel">
                {recipes.map((r) => (
                  <a className="mg-relcard" key={r.id} href={`/recettes/${recetteSlug(r)}`}>
                    <span className="mg-relemo" aria-hidden>{r.emoji}</span>
                    <span className="mg-reln">{r.nom[lang]}</span>
                    <span className="mg-relk">{recetteNutri(r).parPortion.kcal} kcal<small>{t.perPortion}</small></span>
                  </a>
                ))}
              </div>
            )}
          </>
        )}

        {l.faq && l.faq.length > 0 && (
          <>
            <h2 className="mg-h2">{t.faq}</h2>
            <div className="mg-faq">
              {l.faq.map((f) => <details className="mg-fitem" key={f.q}><summary>{f.q}</summary><p><Inline text={f.a} /></p></details>)}
            </div>
          </>
        )}

        <p className="mg-disc">{t.disclaimer}</p>
        {a.sources && a.sources.length > 0 && (
          <p className="mg-src">{t.sources} : {a.sources.map((s, i) => <span key={s.url}>{i > 0 && " · "}<a href={s.url} rel="noopener nofollow" target="_blank">{s.label}</a></span>)}</p>
        )}
      </article>

      {more.length > 0 && (
        <>
          <h2 className="mg-h2">{t.more}</h2>
          <div className="mg-grid mg-grid-2">{more.map((x) => <Card key={x.id} a={x} lang={lang} />)}</div>
        </>
      )}
      <p className="mg-back"><a href={base}>{t.back}</a></p>
    </Shell>
  );
}

const MAG_CSS = `
body{background:#f3f7f2 !important}
.mg-bg{position:fixed;inset:0;z-index:-5;background:radial-gradient(1100px 560px at 50% -8%, #e9faf0, #f3f7f2 62%)}
.mg{max-width:780px;margin:0 auto;padding:16px 18px 70px;color:#2b3243;font-family:inherit}
.mg a{color:#12813b}
.mg-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 2px 6px}
.mg-brand{display:inline-flex;align-items:center;gap:9px;font-size:1.2rem;font-weight:800;letter-spacing:-.3px;color:#16a34a !important;text-decoration:none}
.mg-brand img{border-radius:9px}
.mg-topcta{font-size:.85rem;font-weight:800;color:#fff !important;background:#16a34a;text-decoration:none;border-radius:11px;padding:8px 13px}
.mg-crumb{font-size:.82rem;color:#8a93a3;margin:6px 2px 16px;line-height:1.5}
.mg-crumb a{color:#16a34a;text-decoration:none}
.mg-h1{font-size:2rem;line-height:1.15;font-weight:800;letter-spacing:-.6px;color:#1a2030;margin:4px 0 14px;text-wrap:balance}
.mg-emo{margin-right:10px}
.mg-intro{font-size:1.04rem;line-height:1.65;color:#4b5563;margin:0 0 18px;max-width:66ch}
.mg-lead{font-size:1.12rem;line-height:1.65;color:#374151;margin:0 0 18px;max-width:66ch}
.mg-lead b{color:#166a3a}
.mg-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;margin:0 0 12px}
.mg-meta-t{font-size:.82rem;color:#6b7280;font-weight:600}
.mg-meta-l{font-size:.8rem;font-weight:700;margin-left:auto;text-decoration:none}
.mg-chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 18px}
.mg-chip{font-size:.8rem;font-weight:700;color:#374151 !important;background:#fff;border:1px solid #dfe8e1;border-radius:999px;padding:6px 12px;text-decoration:none}
.mg-chip-s{padding:4px 10px;font-size:.76rem}
.mg-kpi{display:inline-flex;flex-direction:column;align-items:flex-start;background:#fff;border:1px solid #cdebd7;border-radius:18px;padding:16px 20px;margin:0 0 8px;box-shadow:0 6px 20px -14px rgba(20,80,44,.4)}
.mg-kv{font-size:2.2rem;font-weight:800;letter-spacing:-1px;color:#16a34a;line-height:1}
.mg-kl{font-size:.8rem;font-weight:700;color:#6b7280;margin-top:6px}
.mg-h2{font-size:1.32rem;font-weight:800;letter-spacing:-.3px;color:#1a2030;margin:32px 0 12px;text-wrap:balance}
.mg-p{font-size:1.02rem;line-height:1.72;color:#374151;margin:0 0 14px;max-width:68ch}
.mg-p b,.mg-ul b,.mg-ol b{color:#1f2937}
.mg-ul,.mg-ol{margin:0 0 16px;padding-left:22px;line-height:1.7;font-size:1.02rem;color:#374151;max-width:66ch}
.mg-ul li,.mg-ol li{margin:4px 0}
.mg-tip{background:linear-gradient(135deg,#eafaf0,#f5fbf7);border:1px solid #cdebd7;border-radius:16px;padding:14px 16px;margin:6px 0 18px}
.mg-tip-t{font-weight:800;color:#12813b;margin-bottom:4px}
.mg-tip p{margin:0;line-height:1.6;color:#374151}
.mg-tablewrap{overflow-x:auto;border:1px solid #e4e9f0;border-radius:16px;background:#fff;box-shadow:0 6px 20px -14px rgba(20,40,80,.2);margin:4px 0 6px}
.mg-table{width:100%;border-collapse:collapse;font-size:.94rem;min-width:420px}
.mg-table th,.mg-table td{text-align:left;padding:11px 14px;border-bottom:1px solid #eef1f6;vertical-align:top}
.mg-table thead th{font-size:.8rem;font-weight:800;color:#6b7280;background:#f8fafc;text-transform:none}
.mg-table tbody th{font-weight:700;color:#374151}
.mg-table tbody td{font-variant-numeric:tabular-nums;color:#1f2937}
.mg-table tbody tr:last-child th,.mg-table tbody tr:last-child td{border-bottom:0;font-weight:800;color:#166a3a}
.mg-note{font-size:.8rem;color:#8a93a3;margin:6px 2px 16px;line-height:1.5}
.mg-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:4px 0 8px}
.mg-card{display:flex;flex-direction:column;gap:6px;background:#fff;border:1px solid #e4e9f0;border-radius:16px;padding:16px;text-decoration:none;box-shadow:0 6px 18px -14px rgba(20,40,80,.25);transition:border-color .15s}
.mg-card:hover{border-color:#bfe6cd}
.mg-card-top{display:flex;align-items:center;gap:8px}
.mg-card-emo{font-size:1.2rem}
.mg-card-cat{font-size:.72rem;font-weight:800;letter-spacing:.05em;text-transform:uppercase;color:#12813b}
.mg-card-k{margin-left:auto;font-size:.74rem;font-weight:800;color:#166a3a;background:#e9f8ee;border-radius:999px;padding:3px 9px;white-space:nowrap}
.mg-card-t{font-size:1.06rem;font-weight:800;color:#1a2030;line-height:1.3}
.mg-card-d{font-size:.88rem;color:#5b6474;line-height:1.5}
.mg-card-m{font-size:.76rem;color:#8a93a3;font-weight:600;margin-top:auto}
.mg-xlink{font-size:.88rem;margin:14px 2px 0;color:#6b7280}
.mg-xlink a{font-weight:700;text-decoration:none}
.mg-final{margin:28px 0 0;text-align:center;background:linear-gradient(135deg,#eafaf0,#fdecf1);border:1px solid #cdebd7;border-radius:20px;padding:24px 20px}
.mg-final-t{font-size:1.2rem;font-weight:800;color:#1a2030}
.mg-final p{margin:7px auto 15px;color:#4b5563;line-height:1.55;max-width:56ch}
.mg-cta{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#34d17f,#16a34a);color:#fff !important;text-decoration:none;font-weight:800;font-size:1rem;border-radius:13px;padding:13px 22px;box-shadow:0 12px 26px -10px rgba(22,163,74,.55)}
.mg-rel{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.mg-relcard{display:flex;align-items:center;gap:9px;background:#fff;border:1px solid #e4e9f0;border-radius:13px;padding:11px 12px;text-decoration:none}
.mg-relcard:hover{border-color:#bfe6cd}
.mg-relemo{font-size:1.2rem}
.mg-reln{flex:1;min-width:0;font-weight:700;color:#232a37;font-size:.9rem}
.mg-relk{font-size:.74rem;color:#6b7280;text-align:right;font-weight:700}
.mg-relk small{display:block;font-size:.62rem;opacity:.7}
.mg-faq{display:flex;flex-direction:column;gap:10px}
.mg-fitem{background:#fff;border:1px solid #e4e9f0;border-radius:13px;overflow:hidden}
.mg-fitem summary{cursor:pointer;padding:14px 16px;font-weight:700;color:#232a37;font-size:.96rem;list-style:none}
.mg-fitem summary::-webkit-details-marker{display:none}
.mg-fitem summary::after{content:"+";float:right;color:#16a34a;font-weight:800}
.mg-fitem[open] summary::after{content:"−"}
.mg-fitem p{margin:0;padding:0 16px 15px;color:#4b5563;line-height:1.6;font-size:.94rem}
.mg-disc{font-size:.8rem;color:#8a93a3;margin:22px 2px 4px;line-height:1.55}
.mg-src{font-size:.8rem;color:#8a93a3;margin:0 2px;line-height:1.55}
.mg-src a{color:#6b7280}
.mg-back{margin:24px 0 0;text-align:center}
.mg-back a{text-decoration:none;font-weight:700;font-size:.9rem}
@media(max-width:620px){.mg-h1{font-size:1.6rem}.mg-grid,.mg-rel{grid-template-columns:1fr}.mg-meta-l{margin-left:0}}
`;
