import type { Metadata, Viewport } from "next";
import { COPY, type LLang } from "./content";
import { calorioFontVars } from "../calorioFonts";

const BASE = "https://calorio.ch";
const PATH: Record<LLang, string> = { fr: "/", de: "/de", en: "/en" };
const OG_LOCALE: Record<LLang, string> = { fr: "fr_CH", de: "de_CH", en: "en_GB" };

export function landingMetadata(lang: LLang): Metadata {
  const c = COPY[lang];
  const url = `${BASE}${PATH[lang] === "/" ? "/" : PATH[lang]}`;
  return {
    title: c.htmlTitle,
    description: c.metaDesc,
    applicationName: "calorio",
    manifest: "/calorio.webmanifest",
    icons: { icon: "/calorio-icon-192.png", apple: "/calorio-icon-180.png" },
    keywords: lang === "de"
      ? ["Kalorienzähler", "Kalorien zählen", "Ernährungstagebuch", "Makros", "Schweiz", "calorio"]
      : lang === "en"
        ? ["calorie counter", "calorie tracker", "food diary", "macros", "Switzerland", "calorio"]
        : ["compteur de calories", "compter ses calories", "journal alimentaire", "macros", "Suisse", "calorio"],
    alternates: {
      canonical: url,
      languages: { fr: `${BASE}/`, de: `${BASE}/de`, en: `${BASE}/en`, "x-default": `${BASE}/` },
    },
    robots: { index: true, follow: true },
    openGraph: {
      title: c.htmlTitle,
      description: c.metaDesc,
      url,
      siteName: "calorio",
      type: "website",
      locale: OG_LOCALE[lang],
      images: [{ url: `${BASE}/og-calorio?lang=${lang}`, width: 1200, height: 630, alt: "calorio" }],
    },
    twitter: { card: "summary_large_image", title: c.htmlTitle, description: c.metaDesc, images: [`${BASE}/og-calorio?lang=${lang}`] },
  };
}

export const landingViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#101a14" },
  ],
  colorScheme: "light dark",
};

// Icônes au trait (pas d'emoji comme marqueurs de section).
const ICONS: Record<string, string> = {
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14ZM21 21l-5.2-5.2",
  scan: "M4 8V5h3M17 5h3v3M20 16v3h-3M7 19H4v-3M8 8v8M11 8v8M14 8v8M17 8v8",
  ring: "M12 3a9 9 0 1 0 9 9M12 3a9 9 0 0 1 9 9M12 7a5 5 0 1 0 5 5",
  coach: "M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.6A8 8 0 1 1 21 12ZM8.5 11h.01M12 11h.01M15.5 11h.01",
  photo: "M4 8h3l2-3h6l2 3h3v11H4ZM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  steps: "M7 4c2 0 3 2 3 5s-1 5-3 5-3-2-3-5 1-5 3-5ZM5 17h4v3H5ZM17 7c2 0 3 2 3 5s-1 5-3 5-3-2-3-5 1-5 3-5ZM15 20h4v-1",
  chart: "M4 19h16M6 15l4-5 3 3 5-7",
  duo: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3.5 3.5 0 0 1 0 6.5M18 14c2 .8 3 3 3 6",
};

function Icon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={ICONS[name] || ICONS.ring} />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 10.5 8.5 14.5 15.5 6" /></svg>
  );
}

export default function Landing({ lang }: { lang: LLang }) {
  const c = COPY[lang];
  const app = `/calorio${lang === "fr" ? "" : `?lang=${lang}`}`;
  const shots = ["/calorio-shot-stats.jpg", "/calorio-shot-journee.jpg", "/calorio-shot-poids.jpg"];

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "calorio",
        url: `${BASE}/`,
        description: c.metaDesc,
        applicationCategory: "HealthApplication",
        operatingSystem: "Web, Android",
        inLanguage: ["fr", "de", "en"],
        image: `${BASE}/og-calorio?lang=${lang}`,
        offers: [
          { "@type": "Offer", name: c.free.name, price: "0", priceCurrency: "CHF" },
          { "@type": "Offer", name: "Pro (mensuel)", price: "4.90", priceCurrency: "CHF", category: "subscription" },
          { "@type": "Offer", name: "Pro (annuel)", price: "39.00", priceCurrency: "CHF", category: "subscription" },
        ],
        publisher: { "@type": "Organization", name: "Swiss Digital Studio", url: "https://www.swissdigitalstudio.ch" },
      },
      {
        "@type": "FAQPage",
        mainEntity: c.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };

  // Utilisateur qui revient (profil déjà réglé, app installée) ou lien d'intention (?pro, ?go) :
  // on l'emmène directement dans l'app, avant tout affichage. Les nouveaux visiteurs voient cette page.
  // Un lien de parrainage (?ref) est conservé sur les boutons « commencer ».
  const bootScript = `(function(){try{var s=location.search,q=new URLSearchParams(s);var back=localStorage.getItem('calorio.onboarded')==='1'||!!localStorage.getItem('calorio.journal');var standalone=window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches;if(back||standalone||q.has('pro')||q.has('go')){location.replace('/calorio'+s+location.hash);return;}if(q.has('ref')){document.documentElement.classList.add('lp-has-ref');}}catch(e){}})();`;
  const refScript = `(function(){try{var r=new URLSearchParams(location.search).get('ref');if(!r||!/^[A-Za-z0-9]{4,10}$/.test(r))return;document.querySelectorAll('a[data-app]').forEach(function(a){var u=new URL(a.getAttribute('href'),location.origin);u.searchParams.set('ref',r);a.setAttribute('href',u.pathname+u.search);});}catch(e){}})();`;

  return (
    <div className={`lp ${calorioFontVars}`} lang={lang}>
      <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="lp-top">
        <a className="lp-brand" href={PATH[lang]}>
          <img src="/calorio-icon-192.png" alt="" width={34} height={34} />
          <span>calorio</span>
        </a>
        <nav className="lp-nav" aria-label="calorio">
          <a href="#fonctions">{c.nav.features}</a>
          <a href="#prix">{c.nav.pricing}</a>
          <a href="#faq">{c.nav.faq}</a>
        </nav>
        <div className="lp-langs" aria-label="Langue / Sprache / Language">
          {(["fr", "de", "en"] as LLang[]).map((l) => (
            <a key={l} href={PATH[l]} hrefLang={l} aria-current={l === lang ? "page" : undefined} className={l === lang ? "on" : ""}>{l.toUpperCase()}</a>
          ))}
        </div>
        <a className="lp-btn lp-btn-sm" href={app} data-app>{c.nav.open}</a>
      </header>

      <main>
        <section className="lp-hero">
          <div className="lp-hero-tx">
            <p className="lp-ref">{c.refBanner}</p>
            <p className="lp-eyebrow">{c.eyebrow}</p>
            <h1 className="lp-h1">{c.h1a} <em>{c.h1b}</em></h1>
            <p className="lp-lead">{c.lead}</p>
            <div className="lp-cta-row">
              <a className="lp-btn" href={app} data-app>{c.ctaMain}<span aria-hidden> →</span></a>
            </div>
            <p className="lp-cta-sub">{c.ctaSub}</p>
            <ul className="lp-trust">
              {c.trust.map((t) => <li key={t}><Check />{t}</li>)}
            </ul>
          </div>
          <div className="lp-hero-vis" aria-hidden>
            <div className="lp-phone lp-phone-back"><img src={shots[1]} alt="" width={390} height={844} loading="eager" /></div>
            <div className="lp-phone lp-phone-front"><img src={shots[0]} alt="" width={390} height={844} loading="eager" fetchPriority="high" /></div>
          </div>
        </section>

        <section className="lp-sec" id="fonctions">
          <h2 className="lp-h2">{c.featTitle}</h2>
          <p className="lp-sub">{c.featLead}</p>
          <div className="lp-feats">
            {c.features.map((f) => (
              <article className="lp-feat" key={f.title}>
                <div className="lp-feat-ic"><Icon name={f.icon} /></div>
                <h3>{f.title}{f.pro && <span className="lp-pro">{c.proTag}</span>}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="lp-sec lp-shots-sec" aria-label={c.howTitle}>
          <div className="lp-shots">
            {shots.map((s, i) => (
              <figure className="lp-shot" key={s}>
                <div className="lp-phone"><img src={s} alt={c.shotsAlt[i]} width={390} height={844} loading="lazy" /></div>
              </figure>
            ))}
          </div>
        </section>

        <section className="lp-sec">
          <h2 className="lp-h2">{c.howTitle}</h2>
          <ol className="lp-how">
            {c.how.map((h) => (
              <li key={h.title}><h3>{h.title}</h3><p>{h.text}</p></li>
            ))}
          </ol>
        </section>

        <section className="lp-sec" id="prix">
          <h2 className="lp-h2">{c.priceTitle}</h2>
          <p className="lp-sub">{c.priceLead}</p>
          <div className="lp-plans">
            <div className="lp-plan">
              <h3>{c.free.name}</h3>
              <p className="lp-price">{c.free.price}<small> {c.free.per}</small></p>
              <ul>{c.free.items.map((i) => <li key={i}><Check />{i}</li>)}</ul>
              <a className="lp-btn lp-btn-ghost" href={app} data-app>{c.free.cta}</a>
            </div>
            <div className="lp-plan lp-plan-pro">
              <span className="lp-badge">{c.pro.badge}</span>
              <h3>{c.pro.name}</h3>
              <p className="lp-price">{c.pro.price}<small> {c.pro.per}</small></p>
              <p className="lp-alt">{c.pro.alt}</p>
              <ul>{c.pro.items.map((i) => <li key={i}><Check />{i}</li>)}</ul>
              <a className="lp-btn" href={app} data-app>{c.pro.cta}</a>
            </div>
          </div>
        </section>

        <section className="lp-sec" id="faq">
          <h2 className="lp-h2">{c.faqTitle}</h2>
          <div className="lp-faq">
            {c.faq.map((f) => (
              <details key={f.q}><summary>{f.q}</summary><p>{f.a}</p></details>
            ))}
          </div>
        </section>

        <section className="lp-final">
          <h2>{c.finalTitle}</h2>
          <p>{c.finalText}</p>
          <a className="lp-btn" href={app} data-app>{c.ctaMain}<span aria-hidden> →</span></a>
        </section>
      </main>

      <footer className="lp-foot">
        <p>{c.footer.made}</p>
        <nav aria-label="Liens">
          <a href="/recettes">{c.footer.recipes}</a>
          <a href="/calories">{c.footer.foods}</a>
          <a href={lang === "en" ? "/calorio-vs-myfitnesspal/en" : "/calorio-vs-myfitnesspal"}>{c.footer.compare}</a>
          <a href="/confidentialite-calorio">{c.footer.privacy}</a>
        </nav>
      </footer>
      <script dangerouslySetInnerHTML={{ __html: refScript }} />
    </div>
  );
}

const CSS = `
:root{--lp-bg:#f3f7f2;--lp-bg2:#e6f2e9;--lp-card:#ffffff;--lp-ink:#15261b;--lp-muted:#4f6356;--lp-line:#dbe8de;
  --lp-green:#16a34a;--lp-green-ink:#12733a;--lp-btn:linear-gradient(135deg,#1c9c55,#11743a);--lp-rose:#e23d62;--lp-shadow:20,60,35}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--lp-bg:#0f1812;--lp-bg2:#15231a;--lp-card:#18251d;--lp-ink:#e6efe8;--lp-muted:#a2b3a8;--lp-line:#26382c;--lp-green:#46d487;--lp-green-ink:#6fe0a2;--lp-shadow:0,0,0}}
:root[data-theme="dark"]{--lp-bg:#0f1812;--lp-bg2:#15231a;--lp-card:#18251d;--lp-ink:#e6efe8;--lp-muted:#a2b3a8;--lp-line:#26382c;--lp-green:#46d487;--lp-green-ink:#6fe0a2;--lp-shadow:0,0,0}
html.lp-has-ref .lp-ref{display:block}
body{background:var(--lp-bg) !important;color:var(--lp-ink)}
.lp{font-family:var(--font-nunito),"Nunito",system-ui,sans-serif;color:var(--lp-ink);background:radial-gradient(1200px 600px at 70% -10%,var(--lp-bg2),transparent 70%),var(--lp-bg);min-height:100vh;padding-inline:max(16px,calc((100vw - 1120px)/2));overflow-x:hidden}
.lp a{color:inherit}
.lp h1,.lp h2,.lp h3{font-family:var(--font-fredoka),"Fredoka",system-ui,sans-serif;text-wrap:balance;margin:0}
.lp-top{display:flex;align-items:center;gap:18px;padding-block:18px;flex-wrap:wrap}
.lp-brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-family:var(--font-fredoka),sans-serif;font-weight:700;font-size:1.45rem;color:var(--lp-green-ink) !important;letter-spacing:-.5px}
.lp-brand img{border-radius:10px}
.lp-nav{display:flex;gap:20px;margin-left:auto}
.lp-nav a{text-decoration:none;font-weight:700;color:var(--lp-muted)}
.lp-nav a:hover{color:var(--lp-ink)}
.lp-langs{display:flex;gap:2px;background:var(--lp-card);border:1px solid var(--lp-line);border-radius:99px;padding:3px}
.lp-langs a{text-decoration:none;font-size:.78rem;font-weight:800;padding:5px 9px;border-radius:99px;color:var(--lp-muted)}
.lp-langs a.on{background:var(--lp-green);color:#fff}
.lp-btn{display:inline-flex;align-items:center;justify-content:center;gap:4px;background:var(--lp-btn);color:#fff !important;text-decoration:none;font-weight:800;font-size:1.05rem;padding:15px 26px;border-radius:16px;box-shadow:0 14px 28px -12px rgba(18,115,58,.6);transition:transform .15s ease,box-shadow .15s ease}
.lp-btn:hover{transform:translateY(-1px);box-shadow:0 18px 32px -12px rgba(18,115,58,.7)}
.lp-btn:focus-visible,.lp a:focus-visible,.lp summary:focus-visible{outline:3px solid var(--lp-green);outline-offset:3px}
.lp-btn-sm{font-size:.9rem;padding:10px 16px;border-radius:12px}
.lp-btn-ghost{background:transparent;color:var(--lp-green-ink) !important;border:2px solid var(--lp-green);box-shadow:none}
.lp-hero{display:grid;grid-template-columns:1.05fr .95fr;gap:40px;align-items:center;padding-block:36px 56px}
.lp-ref{display:none;margin:0 0 14px;padding:10px 14px;border-radius:12px;background:#fff1c7;color:#5a4410;font-weight:800;font-size:.92rem}
.lp-eyebrow{margin:0 0 14px;font-weight:800;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;color:var(--lp-green-ink)}
.lp-h1{font-size:clamp(2.3rem,5.2vw,3.9rem);line-height:1.02;letter-spacing:-1.5px;font-weight:700}
.lp-h1 em{font-style:normal;color:var(--lp-green-ink);display:block}
.lp-lead{font-size:1.15rem;line-height:1.6;color:var(--lp-muted);max-width:52ch;margin:20px 0 26px}
.lp-cta-sub{margin:12px 0 0;font-size:.88rem;color:var(--lp-muted)}
.lp-trust{list-style:none;padding:0;margin:26px 0 0;display:flex;flex-wrap:wrap;gap:10px 18px}
.lp-trust li{display:flex;align-items:center;gap:6px;font-weight:700;font-size:.9rem;color:var(--lp-ink)}
.lp-trust svg,.lp-plan li svg{color:var(--lp-green);flex:none}
.lp-hero-vis{position:relative;height:min(620px,78vw);display:flex;justify-content:center}
.lp-phone{border-radius:34px;overflow:hidden;background:#0d1510;padding:8px;box-shadow:0 40px 70px -30px rgba(var(--lp-shadow),.55),0 0 0 1px rgba(0,0,0,.06)}
.lp-phone img{display:block;width:100%;height:auto;border-radius:27px}
.lp-hero-vis .lp-phone{position:absolute;width:min(290px,48%)}
.lp-phone-front{left:12%;top:0;z-index:2;transform:rotate(-3deg)}
.lp-phone-back{right:6%;top:46px;transform:rotate(5deg);opacity:.92}
.lp-sec{padding-block:48px}
.lp-h2{font-size:clamp(1.7rem,3.4vw,2.5rem);letter-spacing:-.8px;line-height:1.1;font-weight:700;max-width:22ch}
.lp-sub{color:var(--lp-muted);font-size:1.05rem;line-height:1.6;max-width:60ch;margin:12px 0 0}
.lp-feats{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:30px}
.lp-feat{background:var(--lp-card);border:1px solid var(--lp-line);border-radius:20px;padding:20px}
.lp-feat-ic{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:var(--lp-bg2);color:var(--lp-green-ink);margin-bottom:14px}
.lp-feat h3{font-size:1.08rem;font-weight:600;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.lp-feat p{margin:8px 0 0;color:var(--lp-muted);line-height:1.55;font-size:.95rem}
.lp-pro{font-family:var(--font-nunito),sans-serif;font-size:.68rem;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:#fff;background:var(--lp-rose);padding:3px 8px;border-radius:99px}
.lp-shots{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:900px;margin:0 auto}
.lp-shot{margin:0}
.lp-how{list-style:none;padding:0;margin:28px 0 0;display:grid;grid-template-columns:repeat(3,1fr);gap:16px;counter-reset:st}
.lp-how li{counter-increment:st;position:relative;background:var(--lp-card);border:1px solid var(--lp-line);border-radius:20px;padding:22px 20px 20px}
.lp-how li::before{content:counter(st);font-family:var(--font-fredoka),sans-serif;font-weight:700;font-size:1.1rem;width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:var(--lp-green);color:#fff;margin-bottom:12px}
.lp-how h3{font-size:1.12rem;font-weight:600}
.lp-how p{margin:8px 0 0;color:var(--lp-muted);line-height:1.55}
.lp-plans{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:30px;max-width:860px}
.lp-plan{position:relative;background:var(--lp-card);border:1px solid var(--lp-line);border-radius:24px;padding:26px;display:flex;flex-direction:column}
.lp-plan-pro{border:2px solid var(--lp-green);box-shadow:0 30px 60px -34px rgba(18,115,58,.55)}
.lp-plan h3{font-size:1.3rem;font-weight:700}
.lp-price{font-family:var(--font-fredoka),sans-serif;font-size:2.3rem;font-weight:700;margin:10px 0 0;font-variant-numeric:tabular-nums}
.lp-price small{font-family:var(--font-nunito),sans-serif;font-size:.95rem;font-weight:700;color:var(--lp-muted)}
.lp-alt{margin:4px 0 0;color:var(--lp-muted);font-size:.9rem}
.lp-plan ul{list-style:none;padding:0;margin:18px 0 22px;display:grid;gap:10px;flex:1}
.lp-plan li{display:flex;gap:8px;align-items:flex-start;line-height:1.45}
.lp-badge{position:absolute;top:-13px;right:22px;background:var(--lp-rose);color:#fff;font-weight:900;font-size:.75rem;padding:5px 11px;border-radius:99px}
.lp-faq{margin-top:24px;display:grid;gap:10px;max-width:820px}
.lp-faq details{background:var(--lp-card);border:1px solid var(--lp-line);border-radius:16px;padding:4px 18px}
.lp-faq summary{cursor:pointer;font-weight:800;padding:14px 0;list-style:none}
.lp-faq summary::-webkit-details-marker{display:none}
.lp-faq summary::after{content:"+";float:right;color:var(--lp-green-ink);font-weight:900}
.lp-faq details[open] summary::after{content:"–"}
.lp-faq p{margin:0 0 14px;color:var(--lp-muted);line-height:1.6}
.lp-final{margin:40px 0 20px;padding:44px 28px;border-radius:28px;text-align:center;background:linear-gradient(150deg,#123d24,#0e2a19);color:#eaf6ee}
.lp-final h2{font-size:clamp(1.6rem,3.2vw,2.3rem);font-weight:700;color:#fff}
.lp-final p{color:#b9d4c3;margin:12px auto 24px;max-width:48ch;line-height:1.55}
.lp-foot{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;padding-block:28px 40px;color:var(--lp-muted);font-size:.9rem;border-top:1px solid var(--lp-line)}
.lp-foot p{margin:0}
.lp-foot nav{display:flex;gap:16px;flex-wrap:wrap}
.lp-foot a{text-decoration:none;font-weight:700}
@media (max-width:980px){.lp-feats{grid-template-columns:repeat(2,1fr)}}
@media (max-width:820px){
  .lp-hero{grid-template-columns:1fr;padding-top:16px;gap:24px}
  .lp-hero-vis{height:auto;min-height:0;padding-bottom:10px}
  .lp-hero-vis .lp-phone{position:relative;width:min(250px,60vw)}
  .lp-phone-back{display:none}
  .lp-phone-front{left:auto;transform:rotate(-2deg)}
  .lp-nav{display:none}
  .lp-langs{margin-left:auto}
  .lp-how,.lp-plans{grid-template-columns:1fr}
  .lp-shots{grid-template-columns:repeat(3,minmax(170px,1fr));overflow-x:auto;scroll-snap-type:x mandatory;padding-bottom:8px}
  .lp-shot{scroll-snap-align:center}
}
@media (max-width:520px){.lp-feats{grid-template-columns:1fr}.lp-top .lp-btn-sm{display:none}}
@media (prefers-reduced-motion:reduce){.lp-btn{transition:none}}
`;
