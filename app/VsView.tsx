// Page comparative « calorio vs MyFitnessPal » — aimant SEO à intention de switch.
// Composant serveur (aucun état) : entièrement rendu côté serveur pour le référencement.
// Faits sourcés et présentés de façon factuelle (voir note de bas de page).

type Lang = "fr" | "en";

type Row = { label: string; calorio: string; mfp: string; good: boolean };

const C = {
  fr: {
    crumbHome: "calorio",
    crumbHere: "vs MyFitnessPal",
    h1: "calorio vs MyFitnessPal : l’alternative gratuite, sans pub et honnête",
    intro:
      "MyFitnessPal a changé : le scan de code-barres est passé derrière l’abonnement, le gratuit est envahi de publicités, et l’abonnement coûte 80 à 100 $/an. calorio fait l’inverse — le scan reste gratuit, aucune pub, tes données restent privées, et le coaching nutrition par IA est inclus à prix juste.",
    tableTitle: "Comparaison rapide",
    colCalorio: "calorio",
    colMfp: "MyFitnessPal",
    rows: [
      { label: "Scan de code-barres", calorio: "Gratuit", mfp: "Réservé au Premium", good: true },
      { label: "Publicités", calorio: "Aucune", mfp: "Oui (version gratuite)", good: true },
      { label: "Prix par an", calorio: "CHF 39 (ou 4.90/mois)", mfp: "≈ 80–100 $", good: true },
      { label: "Coach nutrition IA", calorio: "Inclus en Pro", mfp: "Non", good: true },
      { label: "Analyse d’un repas en photo", calorio: "Oui (Pro)", mfp: "Limitée", good: true },
      { label: "Revente de tes données", calorio: "Jamais", mfp: "Modèle financé par la pub", good: true },
      { label: "Essai gratuit", calorio: "7 jours, sans engagement", mfp: "Variable", good: true },
      { label: "100 % dans le navigateur", calorio: "Oui, rien à installer", mfp: "Application à installer", good: true },
    ] as Row[],
    benefitsTitle: "Pourquoi les gens passent à calorio",
    benefits: [
      { t: "Tout ce qui compte, gratuit", d: "Compte tes calories, scanne tes produits et tiens ton journal sans payer ni voir une seule pub." },
      { t: "Un coach, pas un abonnement à 200 $", d: "Vito, ton coach nutrition IA, te répond et t’aide à équilibrer tes repas — le genre de coaching facturé ~200 $/an ailleurs, ici à prix juste." },
      { t: "Tes données t’appartiennent", d: "Sans compte, tout reste sur ton appareil. Avec un compte, la synchro est chiffrée et tes données ne sont jamais revendues." },
    ],
    faqTitle: "Questions fréquentes",
    faq: [
      { q: "calorio est-il vraiment gratuit ?", a: "Oui. Le suivi des calories, le journal, le suivi du poids et le scan de code-barres sont entièrement gratuits, sans publicité. La version Pro (coach IA + analyse photo) est optionnelle." },
      { q: "Le scan de code-barres est-il payant comme sur MyFitnessPal ?", a: "Non. Sur calorio, le scan de code-barres est gratuit pour tout le monde. C’est justement l’une des fonctions que MyFitnessPal a déplacées dans son offre payante." },
      { q: "Y a-t-il des publicités ?", a: "Aucune. calorio n’affiche pas de publicité et ne revend pas tes données." },
      { q: "Combien coûte la version Pro ?", a: "CHF 4.90/mois ou CHF 39/an, avec 7 jours d’essai gratuit sans engagement, résiliable en un clic. Elle débloque Vito (coach nutrition IA) et l’analyse de tes repas en photo." },
      { q: "Puis-je l’utiliser hors de Suisse ?", a: "Oui. calorio fonctionne partout, en français, allemand et anglais, avec une base alimentaire mondiale." },
    ],
    ctaTitle: "Essaie calorio — gratuitement",
    ctaSub: "Pas de carte, pas de pub. Ouvre-le dans ton navigateur en un clic.",
    ctaBtn: "Ouvrir calorio",
    disclaimer:
      "MyFitnessPal est une marque de son propriétaire respectif. Cette comparaison est fournie à titre informatif et repose sur des informations publiquement disponibles en septembre 2026 ; les offres et prix peuvent changer.",
    langAlt: "English",
  },
  en: {
    crumbHome: "calorio",
    crumbHere: "vs MyFitnessPal",
    h1: "calorio vs MyFitnessPal: the free, ad-free, honest alternative",
    intro:
      "MyFitnessPal has changed: barcode scanning moved behind the paywall, the free app is full of ads, and the subscription runs $80–100/year. calorio does the opposite — scanning stays free, no ads, your data stays private, and AI nutrition coaching is included at a fair price.",
    tableTitle: "Quick comparison",
    colCalorio: "calorio",
    colMfp: "MyFitnessPal",
    rows: [
      { label: "Barcode scanning", calorio: "Free", mfp: "Premium only", good: true },
      { label: "Ads", calorio: "None", mfp: "Yes (free version)", good: true },
      { label: "Price per year", calorio: "CHF 39 (or 4.90/mo)", mfp: "≈ $80–100", good: true },
      { label: "AI nutrition coach", calorio: "Included in Pro", mfp: "No", good: true },
      { label: "Photo meal analysis", calorio: "Yes (Pro)", mfp: "Limited", good: true },
      { label: "Selling your data", calorio: "Never", mfp: "Ad-funded model", good: true },
      { label: "Free trial", calorio: "7 days, no commitment", mfp: "Varies", good: true },
      { label: "100% in the browser", calorio: "Yes, nothing to install", mfp: "App install required", good: true },
    ] as Row[],
    benefitsTitle: "Why people switch to calorio",
    benefits: [
      { t: "Everything that matters, free", d: "Count calories, scan products and keep your log without paying or seeing a single ad." },
      { t: "A coach, not a $200 subscription", d: "Vito, your AI nutrition coach, answers you and helps balance your meals — the kind of coaching charged ~$200/yr elsewhere, here at a fair price." },
      { t: "Your data is yours", d: "Without an account, everything stays on your device. With an account, sync is encrypted and your data is never sold." },
    ],
    faqTitle: "Frequently asked questions",
    faq: [
      { q: "Is calorio really free?", a: "Yes. Calorie tracking, the food log, weight tracking and barcode scanning are fully free, with no ads. The Pro version (AI coach + photo analysis) is optional." },
      { q: "Is barcode scanning paywalled like MyFitnessPal?", a: "No. On calorio, barcode scanning is free for everyone. It’s one of the features MyFitnessPal moved into its paid plan." },
      { q: "Are there ads?", a: "None. calorio shows no ads and never sells your data." },
      { q: "How much is Pro?", a: "CHF 4.90/month or CHF 39/year, with a 7-day free trial, no commitment, cancel in one click. It unlocks Vito (AI nutrition coach) and photo meal analysis." },
      { q: "Can I use it outside Switzerland?", a: "Yes. calorio works everywhere, in French, German and English, with a worldwide food database." },
    ],
    ctaTitle: "Try calorio — free",
    ctaSub: "No card, no ads. Open it in your browser in one click.",
    ctaBtn: "Open calorio",
    disclaimer:
      "MyFitnessPal is a trademark of its respective owner. This comparison is informational and based on publicly available information as of September 2026; offers and prices may change.",
    langAlt: "Français",
  },
} as const;

export default function VsView({ lang }: { lang: Lang }) {
  const t = C[lang];
  const altHref = lang === "fr" ? "/calorio-vs-myfitnesspal/en" : "/calorio-vs-myfitnesspal";
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: t.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <style dangerouslySetInnerHTML={{ __html: VS_CSS }} />
      <div className="vs-bg" aria-hidden />
      <main className="vs">
        <header className="vs-top">
          <a className="vs-brand" href="https://calorio.ch/"><img src="/calorio-icon-192.png" alt="" width={30} height={30} /> calorio</a>
          <a className="vs-alt" href={altHref}>{t.langAlt}</a>
        </header>

        <nav className="vs-crumb" aria-label="breadcrumb"><a href="https://calorio.ch/">{t.crumbHome}</a> <span aria-hidden>›</span> {t.crumbHere}</nav>

        <h1 className="vs-h1">{t.h1}</h1>
        <p className="vs-intro">{t.intro}</p>
        <a className="vs-cta vs-cta-top" href="https://calorio.ch/">{t.ctaBtn} <span aria-hidden>→</span></a>

        <h2 className="vs-h2">{t.tableTitle}</h2>
        <div className="vs-tablewrap">
          <table className="vs-table">
            <thead>
              <tr><th /><th className="vs-c">🥕 {t.colCalorio}</th><th>{t.colMfp}</th></tr>
            </thead>
            <tbody>
              {t.rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  <td className="vs-c"><span className="vs-yes">✓</span> {r.calorio}</td>
                  <td className="vs-mfp">{r.mfp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="vs-h2">{t.benefitsTitle}</h2>
        <div className="vs-cards">
          {t.benefits.map((b) => (
            <div className="vs-card" key={b.t}>
              <div className="vs-card-t">{b.t}</div>
              <p>{b.d}</p>
            </div>
          ))}
        </div>

        <h2 className="vs-h2">{t.faqTitle}</h2>
        <div className="vs-faq">
          {t.faq.map((f) => (
            <details className="vs-fitem" key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        <div className="vs-final">
          <div className="vs-final-t">{t.ctaTitle}</div>
          <p>{t.ctaSub}</p>
          <a className="vs-cta" href="https://calorio.ch/">{t.ctaBtn} <span aria-hidden>→</span></a>
        </div>

        <p className="vs-disc">{t.disclaimer}</p>
      </main>
    </>
  );
}

const VS_CSS = `
body{background:#f3f7f2 !important}
.vs-bg{position:fixed;inset:0;z-index:-5;background:radial-gradient(1100px 560px at 50% -8%, #e9faf0, #f3f7f2 62%)}
.vs{max-width:820px;margin:0 auto;padding:16px 18px 70px;color:#2b3243;font-family:inherit}
.vs a{color:inherit}
.vs-top{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 2px 6px}
.vs-brand{display:inline-flex;align-items:center;gap:9px;font-size:1.2rem;font-weight:800;letter-spacing:-.3px;color:#16a34a;text-decoration:none}
.vs-brand img{border-radius:9px}
.vs-alt{font-size:.82rem;color:#6b7280;text-decoration:none;border:1px solid #e0e6ee;background:#fff;border-radius:99px;padding:6px 13px}
.vs-crumb{font-size:.82rem;color:#8a93a3;margin:6px 2px 18px}
.vs-crumb a{color:#16a34a;text-decoration:none}
.vs-h1{font-size:1.9rem;line-height:1.2;font-weight:800;letter-spacing:-.5px;color:#1a2030;margin:0 0 14px}
.vs-intro{font-size:1.02rem;line-height:1.6;color:#4b5563;margin:0 0 20px}
.vs-cta{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#34d17f,#16a34a);color:#fff;text-decoration:none;font-weight:800;font-size:1rem;border-radius:13px;padding:14px 22px;box-shadow:0 12px 26px -10px rgba(22,163,74,.55)}
.vs-cta-top{margin-bottom:10px}
.vs-h2{font-size:1.3rem;font-weight:800;letter-spacing:-.3px;color:#1a2030;margin:34px 0 14px;padding-bottom:12px;border-bottom:1px solid #f6cdd9}
.vs-tablewrap{overflow-x:auto;border:1px solid #e4e9f0;border-radius:16px;background:#fff;box-shadow:0 6px 20px -14px rgba(20,40,80,.2)}
.vs-table{width:100%;border-collapse:collapse;font-size:.92rem;min-width:460px}
.vs-table th,.vs-table td{text-align:left;padding:13px 15px;border-bottom:1px solid #eef1f6;vertical-align:top}
.vs-table thead th{font-size:.9rem;font-weight:800;color:#6b7280;background:#f8fafc}
.vs-table tbody th{font-weight:700;color:#374151;width:38%}
.vs-table .vs-c{background:#e9f8ee}
.vs-table thead th.vs-c{color:#16a34a}
.vs-table td.vs-c{font-weight:700;color:#166a3a}
.vs-yes{color:#16a34a;font-weight:900}
.vs-mfp{color:#9aa2b4}
.vs-table tbody tr:last-child th,.vs-table tbody tr:last-child td{border-bottom:0}
.vs-cards{display:grid;grid-template-columns:1fr;gap:12px}
.vs-card{background:#fff;border:1px solid #e4e9f0;border-radius:16px;padding:18px;box-shadow:0 4px 16px -12px rgba(20,40,80,.15)}
.vs-card-t{font-weight:800;color:#1a2030;font-size:1.04rem;margin-bottom:5px}
.vs-card p{margin:0;color:#4b5563;line-height:1.55;font-size:.94rem}
.vs-faq{display:flex;flex-direction:column;gap:10px}
.vs-fitem{background:#fff;border:1px solid #e4e9f0;border-radius:13px;overflow:hidden}
.vs-fitem summary{cursor:pointer;padding:15px 17px;font-weight:700;color:#232a37;font-size:.97rem;list-style:none}
.vs-fitem summary::-webkit-details-marker{display:none}
.vs-fitem summary::after{content:"+";float:right;color:#16a34a;font-weight:800}
.vs-fitem[open] summary::after{content:"−"}
.vs-fitem p{margin:0;padding:0 17px 16px;color:#4b5563;line-height:1.6;font-size:.93rem}
.vs-final{margin:34px 0 0;text-align:center;background:linear-gradient(135deg,#eafaf0,#fdecf1);border:1px solid #cdebd7;border-radius:20px;padding:30px 22px}
.vs-final-t{font-size:1.35rem;font-weight:800;color:#1a2030}
.vs-final p{margin:7px 0 16px;color:#4b5563}
.vs-disc{margin:26px 0 0;font-size:.76rem;line-height:1.5;color:#9aa2b4;text-align:center}
@media(max-width:560px){.vs-h1{font-size:1.55rem}}
`;
