// Pages comparatives « calorio vs <concurrent> » — aimants SEO à intention de switch.
// Composant serveur (aucun état), rendu côté serveur pour le référencement.
// Faits sourcés, présentés de façon factuelle et honnête (voir note de bas de page).

type Lang = "fr" | "en";
export type Comp = "myfitnesspal" | "yazio" | "lifesum";
type Row = { label: string; calorio: string; comp: string; good?: boolean };
type Block = {
  crumbHere: string; h1: string; intro: string; colComp: string;
  rows: Row[]; benefits: { t: string; d: string }[]; faq: { q: string; a: string }[]; disclaimer: string;
};

const COMMON = {
  fr: {
    crumbHome: "calorio", tableTitle: "Comparaison rapide", colCalorio: "calorio",
    benefitsTitle: "Pourquoi les gens passent à calorio", faqTitle: "Questions fréquentes",
    ctaTitle: "Essaie calorio — gratuitement", ctaSub: "Pas de carte, pas de pub. Ouvre-le dans ton navigateur en un clic.",
    ctaBtn: "Ouvrir calorio", langAlt: "English",
  },
  en: {
    crumbHome: "calorio", tableTitle: "Quick comparison", colCalorio: "calorio",
    benefitsTitle: "Why people switch to calorio", faqTitle: "Frequently asked questions",
    ctaTitle: "Try calorio — free", ctaSub: "No card, no ads. Open it in your browser in one click.",
    ctaBtn: "Open calorio", langAlt: "Français",
  },
} as const;

const DATA: Record<Comp, { slug: string; name: string; fr: Block; en: Block }> = {
  myfitnesspal: {
    slug: "calorio-vs-myfitnesspal", name: "MyFitnessPal",
    fr: {
      crumbHere: "vs MyFitnessPal",
      h1: "calorio vs MyFitnessPal : l’alternative gratuite, sans pub et honnête",
      intro:
        "MyFitnessPal a changé : le scan de code-barres est passé derrière l’abonnement, le gratuit est envahi de publicités, et l’abonnement coûte 80 à 100 $/an. calorio fait l’inverse — le scan reste gratuit, aucune pub, tes données restent privées, et le coaching nutrition par IA est inclus à prix juste.",
      colComp: "MyFitnessPal",
      rows: [
        { label: "Scan de code-barres", calorio: "Gratuit", comp: "Réservé au Premium", good: true },
        { label: "Publicités", calorio: "Aucune", comp: "Oui (version gratuite)", good: true },
        { label: "Prix par an", calorio: "CHF 39 (ou 4.90/mois)", comp: "≈ 80–100 $", good: true },
        { label: "Coach nutrition IA", calorio: "Inclus en Pro", comp: "Non", good: true },
        { label: "Analyse d’un repas en photo", calorio: "Oui (Pro)", comp: "Limitée", good: true },
        { label: "Revente de tes données", calorio: "Jamais", comp: "Modèle financé par la pub", good: true },
        { label: "Essai gratuit", calorio: "7 jours, sans engagement", comp: "Variable", good: true },
        { label: "100 % dans le navigateur", calorio: "Oui, rien à installer", comp: "Application à installer", good: true },
      ],
      benefits: [
        { t: "Tout ce qui compte, gratuit", d: "Compte tes calories, scanne tes produits et tiens ton journal sans payer ni voir une seule pub." },
        { t: "Un coach, pas un abonnement à 200 $", d: "Vito, ton coach nutrition IA, te répond et t’aide à équilibrer tes repas — le genre de coaching facturé ~200 $/an ailleurs, ici à prix juste." },
        { t: "Tes données t’appartiennent", d: "Sans compte, tout reste sur ton appareil. Avec un compte, la synchro est chiffrée et tes données ne sont jamais revendues." },
      ],
      faq: [
        { q: "calorio est-il vraiment gratuit ?", a: "Oui. Le suivi des calories, le journal, le suivi du poids et le scan de code-barres sont entièrement gratuits, sans publicité. La version Pro (coach IA + analyse photo) est optionnelle." },
        { q: "Le scan de code-barres est-il payant comme sur MyFitnessPal ?", a: "Non. Sur calorio, le scan de code-barres est gratuit pour tout le monde. C’est justement l’une des fonctions que MyFitnessPal a déplacées dans son offre payante." },
        { q: "Y a-t-il des publicités ?", a: "Aucune. calorio n’affiche pas de publicité et ne revend pas tes données." },
        { q: "Combien coûte la version Pro ?", a: "CHF 4.90/mois ou CHF 39/an, avec 7 jours d’essai gratuit sans engagement, résiliable en un clic. Elle débloque Vito (coach nutrition IA) et l’analyse de tes repas en photo." },
        { q: "Puis-je l’utiliser hors de Suisse ?", a: "Oui. calorio fonctionne partout, en français, allemand et anglais, avec une base alimentaire mondiale." },
      ],
      disclaimer:
        "MyFitnessPal est une marque de son propriétaire respectif. Cette comparaison est fournie à titre informatif et repose sur des informations publiquement disponibles en septembre 2026 ; les offres et prix peuvent changer.",
    },
    en: {
      crumbHere: "vs MyFitnessPal",
      h1: "calorio vs MyFitnessPal: the free, ad-free, honest alternative",
      intro:
        "MyFitnessPal has changed: barcode scanning moved behind the paywall, the free app is full of ads, and the subscription runs $80–100/year. calorio does the opposite — scanning stays free, no ads, your data stays private, and AI nutrition coaching is included at a fair price.",
      colComp: "MyFitnessPal",
      rows: [
        { label: "Barcode scanning", calorio: "Free", comp: "Premium only", good: true },
        { label: "Ads", calorio: "None", comp: "Yes (free version)", good: true },
        { label: "Price per year", calorio: "CHF 39 (or 4.90/mo)", comp: "≈ $80–100", good: true },
        { label: "AI nutrition coach", calorio: "Included in Pro", comp: "No", good: true },
        { label: "Photo meal analysis", calorio: "Yes (Pro)", comp: "Limited", good: true },
        { label: "Selling your data", calorio: "Never", comp: "Ad-funded model", good: true },
        { label: "Free trial", calorio: "7 days, no commitment", comp: "Varies", good: true },
        { label: "100% in the browser", calorio: "Yes, nothing to install", comp: "App install required", good: true },
      ],
      benefits: [
        { t: "Everything that matters, free", d: "Count calories, scan products and keep your log without paying or seeing a single ad." },
        { t: "A coach, not a $200 subscription", d: "Vito, your AI nutrition coach, answers you and helps balance your meals — the kind of coaching charged ~$200/yr elsewhere, here at a fair price." },
        { t: "Your data is yours", d: "Without an account, everything stays on your device. With an account, sync is encrypted and your data is never sold." },
      ],
      faq: [
        { q: "Is calorio really free?", a: "Yes. Calorie tracking, the food log, weight tracking and barcode scanning are fully free, with no ads. The Pro version (AI coach + photo analysis) is optional." },
        { q: "Is barcode scanning paywalled like MyFitnessPal?", a: "No. On calorio, barcode scanning is free for everyone. It’s one of the features MyFitnessPal moved into its paid plan." },
        { q: "Are there ads?", a: "None. calorio shows no ads and never sells your data." },
        { q: "How much is Pro?", a: "CHF 4.90/month or CHF 39/year, with a 7-day free trial, no commitment, cancel in one click. It unlocks Vito (AI nutrition coach) and photo meal analysis." },
        { q: "Can I use it outside Switzerland?", a: "Yes. calorio works everywhere, in French, German and English, with a worldwide food database." },
      ],
      disclaimer:
        "MyFitnessPal is a trademark of its respective owner. This comparison is informational and based on publicly available information as of September 2026; offers and prices may change.",
    },
  },

  yazio: {
    slug: "calorio-vs-yazio", name: "YAZIO",
    fr: {
      crumbHere: "vs YAZIO",
      h1: "calorio vs YAZIO : le suivi calories gratuit, sans pub, avec coach IA",
      intro:
        "YAZIO est solide, mais son scan de code-barres est passé en PRO, la version gratuite affiche des pubs après chaque repas noté, et YAZIO PRO coûte ~47,90 $/an. calorio garde le scan gratuit, n’affiche aucune pub, et ajoute Vito, un vrai coach nutrition par IA — le tout à CHF 39/an.",
      colComp: "YAZIO",
      rows: [
        { label: "Scan de code-barres", calorio: "Gratuit", comp: "Réservé à PRO", good: true },
        { label: "Publicités", calorio: "Aucune", comp: "Oui (après chaque repas noté)", good: true },
        { label: "Prix par an", calorio: "CHF 39 (ou 4.90/mois)", comp: "≈ 47,90 $ (PRO)", good: true },
        { label: "Coach nutrition IA (conversationnel)", calorio: "Inclus en Pro", comp: "Non", good: true },
        { label: "Analyse d’un repas en photo", calorio: "Oui (Pro)", comp: "PRO", good: false },
        { label: "Suivi des macros", calorio: "Gratuit", comp: "Gratuit (basique)", good: false },
        { label: "Essai / résiliation", calorio: "7 jours, résiliable en 1 clic", comp: "Selon le store", good: true },
        { label: "100 % dans le navigateur", calorio: "Oui, rien à installer", comp: "Application à installer", good: true },
      ],
      benefits: [
        { t: "Le scan reste gratuit", d: "Chez YAZIO, scanner un code-barres demande PRO. Chez calorio, c’est gratuit pour tout le monde, sans limite." },
        { t: "Zéro pub", d: "Pas de publicité après chaque repas noté — juste ton journal, propre et rapide." },
        { t: "Un coach en plus, pas juste un tracker", d: "Vito discute avec toi et t’aide à équilibrer tes repas. YAZIO PRO n’a pas de coach IA conversationnel." },
      ],
      faq: [
        { q: "calorio est-il moins cher que YAZIO PRO ?", a: "Oui. calorio Pro est à CHF 39/an (ou 4.90/mois) et inclut le coach IA. YAZIO PRO tourne autour de 47,90 $/an et ne propose pas de coach conversationnel." },
        { q: "Le scan de code-barres est-il gratuit ?", a: "Oui, chez calorio le scan est gratuit pour tout le monde. YAZIO l’a déplacé dans PRO." },
        { q: "Y a-t-il des pubs comme sur YAZIO gratuit ?", a: "Non. calorio n’affiche aucune publicité, même dans sa version gratuite." },
        { q: "Qu’apporte la version Pro de calorio ?", a: "Vito, ton coach nutrition IA, et l’analyse de tes repas en photo. 7 jours d’essai gratuit, résiliable en un clic." },
        { q: "Faut-il installer une application ?", a: "Non. calorio fonctionne directement dans le navigateur ; tu peux aussi l’ajouter à ton écran d’accueil si tu veux." },
      ],
      disclaimer:
        "YAZIO est une marque de son propriétaire respectif. Comparaison informative basée sur des informations publiquement disponibles en septembre 2026 (prix indicatifs en USD) ; les offres et prix peuvent changer.",
    },
    en: {
      crumbHere: "vs YAZIO",
      h1: "calorio vs YAZIO: free calorie tracking, no ads, with an AI coach",
      intro:
        "YAZIO is solid, but its barcode scanner moved to PRO, the free version shows ads after each logged meal, and YAZIO PRO costs ~$47.90/year. calorio keeps scanning free, shows no ads, and adds Vito, a real AI nutrition coach — all for CHF 39/year.",
      colComp: "YAZIO",
      rows: [
        { label: "Barcode scanning", calorio: "Free", comp: "PRO only", good: true },
        { label: "Ads", calorio: "None", comp: "Yes (after each logged meal)", good: true },
        { label: "Price per year", calorio: "CHF 39 (or 4.90/mo)", comp: "≈ $47.90 (PRO)", good: true },
        { label: "AI nutrition coach (chat)", calorio: "Included in Pro", comp: "No", good: true },
        { label: "Photo meal analysis", calorio: "Yes (Pro)", comp: "PRO", good: false },
        { label: "Macro tracking", calorio: "Free", comp: "Free (basic)", good: false },
        { label: "Trial / cancel", calorio: "7 days, cancel in 1 click", comp: "Store-dependent", good: true },
        { label: "100% in the browser", calorio: "Yes, nothing to install", comp: "App install required", good: true },
      ],
      benefits: [
        { t: "Scanning stays free", d: "On YAZIO, scanning a barcode needs PRO. On calorio it’s free for everyone, no limit." },
        { t: "Zero ads", d: "No ad after every logged meal — just your log, clean and fast." },
        { t: "A coach, not just a tracker", d: "Vito chats with you and helps balance your meals. YAZIO PRO has no conversational AI coach." },
      ],
      faq: [
        { q: "Is calorio cheaper than YAZIO PRO?", a: "Yes. calorio Pro is CHF 39/year (or 4.90/mo) and includes the AI coach. YAZIO PRO is around $47.90/year and has no conversational coach." },
        { q: "Is barcode scanning free?", a: "Yes, on calorio scanning is free for everyone. YAZIO moved it into PRO." },
        { q: "Are there ads like YAZIO free?", a: "No. calorio shows no ads, even in its free version." },
        { q: "What does calorio Pro add?", a: "Vito, your AI nutrition coach, and photo meal analysis. 7-day free trial, cancel in one click." },
        { q: "Do I need to install an app?", a: "No. calorio runs right in the browser; you can also add it to your home screen if you like." },
      ],
      disclaimer:
        "YAZIO is a trademark of its respective owner. Informational comparison based on publicly available information as of September 2026 (indicative USD prices); offers and prices may change.",
    },
  },

  lifesum: {
    slug: "calorio-vs-lifesum", name: "Lifesum",
    fr: {
      crumbHere: "vs Lifesum",
      h1: "calorio vs Lifesum : les macros gratuites, sans pub, à prix juste",
      intro:
        "Lifesum est joli, mais le suivi des macros (protéines, glucides, lipides) et la nutrition détaillée sont réservés au Premium, facturé jusqu’à 99,99 $/an. calorio affiche tes macros gratuitement, sans pub, ajoute un coach nutrition IA, et coûte CHF 39/an. (Point honnête : chez Lifesum aussi le scan de code-barres est gratuit.)",
      colComp: "Lifesum",
      rows: [
        { label: "Suivi des macros (prot./gluc./lip.)", calorio: "Gratuit", comp: "Réservé au Premium", good: true },
        { label: "Nutrition détaillée", calorio: "Gratuite", comp: "Premium", good: true },
        { label: "Publicités", calorio: "Aucune", comp: "Oui (version gratuite)", good: true },
        { label: "Prix par an", calorio: "CHF 39 (ou 4.90/mois)", comp: "≈ 99,99 $ (tarif affiché)", good: true },
        { label: "Coach nutrition IA (conversationnel)", calorio: "Inclus en Pro", comp: "Non", good: true },
        { label: "Scan de code-barres", calorio: "Gratuit", comp: "Gratuit aussi", good: false },
        { label: "Essai / résiliation", calorio: "7 jours, résiliable en 1 clic", comp: "Selon le store", good: true },
        { label: "100 % dans le navigateur", calorio: "Oui, rien à installer", comp: "Application à installer", good: true },
      ],
      benefits: [
        { t: "Tes macros, gratuitement", d: "Protéines, glucides, lipides : calorio te les montre sans payer. Lifesum réserve ça au Premium." },
        { t: "Sans pub, à prix juste", d: "Aucune publicité, et CHF 39/an au lieu d’un tarif affiché jusqu’à ~100 $/an." },
        { t: "Un coach en plus", d: "Vito, ton coach nutrition IA, t’aide à ajuster tes repas — ce que Lifesum ne propose pas." },
      ],
      faq: [
        { q: "Le suivi des macros est-il gratuit sur calorio ?", a: "Oui. Protéines, glucides et lipides sont affichés gratuitement. Chez Lifesum, le suivi des macros fait partie du Premium." },
        { q: "calorio est-il moins cher que Lifesum Premium ?", a: "Oui. calorio Pro est à CHF 39/an ; Lifesum Premium est affiché jusqu’à 99,99 $/an (des promotions existent)." },
        { q: "Et le scan de code-barres ?", a: "Il est gratuit sur les deux — c’est un point où Lifesum et calorio se valent. La différence se joue sur les macros, les pubs, le prix et le coach IA." },
        { q: "Y a-t-il des publicités sur calorio ?", a: "Aucune, même en version gratuite, et tes données ne sont jamais revendues." },
        { q: "Qu’apporte la version Pro de calorio ?", a: "Vito, ton coach nutrition IA, et l’analyse de tes repas en photo. 7 jours d’essai gratuit, résiliable en un clic." },
      ],
      disclaimer:
        "Lifesum est une marque de son propriétaire respectif. Comparaison informative basée sur des informations publiquement disponibles en septembre 2026 (prix indicatifs en USD) ; les offres et prix peuvent changer.",
    },
    en: {
      crumbHere: "vs Lifesum",
      h1: "calorio vs Lifesum: free macros, no ads, at a fair price",
      intro:
        "Lifesum looks nice, but macro tracking (protein, carbs, fat) and detailed nutrition are Premium-only, priced up to $99.99/year. calorio shows your macros for free, with no ads, adds an AI nutrition coach, and costs CHF 39/year. (Fair point: on Lifesum, barcode scanning is free too.)",
      colComp: "Lifesum",
      rows: [
        { label: "Macro tracking (protein/carbs/fat)", calorio: "Free", comp: "Premium only", good: true },
        { label: "Detailed nutrition", calorio: "Free", comp: "Premium", good: true },
        { label: "Ads", calorio: "None", comp: "Yes (free version)", good: true },
        { label: "Price per year", calorio: "CHF 39 (or 4.90/mo)", comp: "≈ $99.99 (list price)", good: true },
        { label: "AI nutrition coach (chat)", calorio: "Included in Pro", comp: "No", good: true },
        { label: "Barcode scanning", calorio: "Free", comp: "Free too", good: false },
        { label: "Trial / cancel", calorio: "7 days, cancel in 1 click", comp: "Store-dependent", good: true },
        { label: "100% in the browser", calorio: "Yes, nothing to install", comp: "App install required", good: true },
      ],
      benefits: [
        { t: "Your macros, for free", d: "Protein, carbs, fat: calorio shows them without paying. Lifesum keeps that for Premium." },
        { t: "No ads, fair price", d: "No advertising, and CHF 39/year instead of a list price up to ~$100/year." },
        { t: "A coach on top", d: "Vito, your AI nutrition coach, helps you adjust your meals — something Lifesum doesn’t offer." },
      ],
      faq: [
        { q: "Is macro tracking free on calorio?", a: "Yes. Protein, carbs and fat are shown for free. On Lifesum, macro tracking is part of Premium." },
        { q: "Is calorio cheaper than Lifesum Premium?", a: "Yes. calorio Pro is CHF 39/year; Lifesum Premium is listed up to $99.99/year (promotions exist)." },
        { q: "What about barcode scanning?", a: "It’s free on both — that’s a point where Lifesum and calorio match. The difference is in macros, ads, price and the AI coach." },
        { q: "Are there ads on calorio?", a: "None, even in the free version, and your data is never sold." },
        { q: "What does calorio Pro add?", a: "Vito, your AI nutrition coach, and photo meal analysis. 7-day free trial, cancel in one click." },
      ],
      disclaimer:
        "Lifesum is a trademark of its respective owner. Informational comparison based on publicly available information as of September 2026 (indicative USD prices); offers and prices may change.",
    },
  },
};

export default function VsView({ lang, comp = "myfitnesspal" }: { lang: Lang; comp?: Comp }) {
  const c = COMMON[lang];
  const d = DATA[comp][lang];
  const base = `/${DATA[comp].slug}`;
  const altHref = lang === "fr" ? `${base}/en` : base;
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: d.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <style dangerouslySetInnerHTML={{ __html: VS_CSS }} />
      <div className="vs-bg" aria-hidden />
      <main className="vs">
        <header className="vs-top">
          <a className="vs-brand" href="https://calorio.ch/"><img src="/calorio-icon-192.png" alt="" width={30} height={30} /> calorio</a>
          <a className="vs-alt" href={altHref}>{c.langAlt}</a>
        </header>

        <nav className="vs-crumb" aria-label="breadcrumb"><a href="https://calorio.ch/">{c.crumbHome}</a> <span aria-hidden>›</span> {d.crumbHere}</nav>

        <h1 className="vs-h1">{d.h1}</h1>
        <p className="vs-intro">{d.intro}</p>
        <a className="vs-cta vs-cta-top" href="https://calorio.ch/">{c.ctaBtn} <span aria-hidden>→</span></a>

        <h2 className="vs-h2">{c.tableTitle}</h2>
        <div className="vs-tablewrap">
          <table className="vs-table">
            <thead>
              <tr><th /><th className="vs-c">🥕 {c.colCalorio}</th><th>{d.colComp}</th></tr>
            </thead>
            <tbody>
              {d.rows.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  <td className="vs-c"><span className="vs-yes">✓</span> {r.calorio}</td>
                  <td className="vs-mfp">{r.comp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="vs-h2">{c.benefitsTitle}</h2>
        <div className="vs-cards">
          {d.benefits.map((b) => (
            <div className="vs-card" key={b.t}>
              <div className="vs-card-t">{b.t}</div>
              <p>{b.d}</p>
            </div>
          ))}
        </div>

        <h2 className="vs-h2">{c.faqTitle}</h2>
        <div className="vs-faq">
          {d.faq.map((f) => (
            <details className="vs-fitem" key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>

        <div className="vs-final">
          <div className="vs-final-t">{c.ctaTitle}</div>
          <p>{c.ctaSub}</p>
          <a className="vs-cta" href="https://calorio.ch/">{c.ctaBtn} <span aria-hidden>→</span></a>
        </div>

        <p className="vs-disc">{d.disclaimer}</p>
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
