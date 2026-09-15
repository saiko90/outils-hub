"use client";

import { useMemo, useState } from "react";
import { type Lang } from "@/lib/i18n";
import {
  parseUrlList, makeEntries, buildSitemap, buildRobots, analyze,
  CHANGEFREQS, type ChangeFreq,
} from "@/lib/sitemapo";

const L = {
  fr: {
    urlsLabel: "Tes URLs (une par ligne)",
    urlsPh: "https://exemple.ch/\nhttps://exemple.ch/blog\nhttps://exemple.ch/contact",
    example: "Exemple", clear: "Effacer",
    optsTitle: "Options du sitemap",
    changefreq: "Fréquence", cfNone: "(aucune)",
    priority: "Priorité", prNone: "(aucune)",
    lastmod: "Date de modif. (lastmod)", lmToday: "Aujourd'hui",
    robotsTitle: "robots.txt",
    sitemapUrl: "URL du sitemap (pour robots.txt)", sitemapUrlPh: "https://exemple.ch/sitemap.xml",
    disallow: "Chemins à bloquer (Disallow, un par ligne)", disallowPh: "/admin\n/panier",
    pretty: "Indenté (lisible)",
    outSitemap: "sitemap.xml", outRobots: "robots.txt",
    copy: "Copier", copied: "Copié ✓", download: "Télécharger",
    urlsCount: (n: number) => `${n} URL${n > 1 ? "s" : ""}`,
    invalidCount: (n: number) => `${n} ligne${n > 1 ? "s" : ""} ignorée${n > 1 ? "s" : ""} (non valides)`,
    multiHost: "Plusieurs domaines détectés — un sitemap devrait ne couvrir qu'un seul domaine.",
    overLimit: "Plus de 50 000 URLs — scinde en plusieurs sitemaps + un index.",
    empty: "Ajoute au moins une URL valide (http/https) à gauche.",
    hint: "100 % dans ton navigateur. Sitemap conforme au schéma sitemaps.org 0.9. Place sitemap.xml et robots.txt à la racine de ton site.",
    cf: { always: "toujours", hourly: "chaque heure", daily: "chaque jour", weekly: "chaque semaine", monthly: "chaque mois", yearly: "chaque année", never: "jamais" } as Record<ChangeFreq, string>,
  },
  de: {
    urlsLabel: "Deine URLs (eine pro Zeile)",
    urlsPh: "https://beispiel.ch/\nhttps://beispiel.ch/blog\nhttps://beispiel.ch/kontakt",
    example: "Beispiel", clear: "Leeren",
    optsTitle: "Sitemap-Optionen",
    changefreq: "Häufigkeit", cfNone: "(keine)",
    priority: "Priorität", prNone: "(keine)",
    lastmod: "Änderungsdatum (lastmod)", lmToday: "Heute",
    robotsTitle: "robots.txt",
    sitemapUrl: "Sitemap-URL (für robots.txt)", sitemapUrlPh: "https://beispiel.ch/sitemap.xml",
    disallow: "Zu sperrende Pfade (Disallow, einer pro Zeile)", disallowPh: "/admin\n/warenkorb",
    pretty: "Eingerückt (lesbar)",
    outSitemap: "sitemap.xml", outRobots: "robots.txt",
    copy: "Kopieren", copied: "Kopiert ✓", download: "Herunterladen",
    urlsCount: (n: number) => `${n} URL${n > 1 ? "s" : ""}`,
    invalidCount: (n: number) => `${n} Zeile${n > 1 ? "n" : ""} ignoriert (ungültig)`,
    multiHost: "Mehrere Domains erkannt — eine Sitemap sollte nur eine Domain abdecken.",
    overLimit: "Über 50 000 URLs — in mehrere Sitemaps + Index aufteilen.",
    empty: "Füge links mindestens eine gültige URL (http/https) hinzu.",
    hint: "100 % im Browser. Sitemap nach sitemaps.org-Schema 0.9. Lege sitemap.xml und robots.txt im Stammverzeichnis ab.",
    cf: { always: "immer", hourly: "stündlich", daily: "täglich", weekly: "wöchentlich", monthly: "monatlich", yearly: "jährlich", never: "nie" } as Record<ChangeFreq, string>,
  },
  en: {
    urlsLabel: "Your URLs (one per line)",
    urlsPh: "https://example.com/\nhttps://example.com/blog\nhttps://example.com/contact",
    example: "Example", clear: "Clear",
    optsTitle: "Sitemap options",
    changefreq: "Frequency", cfNone: "(none)",
    priority: "Priority", prNone: "(none)",
    lastmod: "Last modified (lastmod)", lmToday: "Today",
    robotsTitle: "robots.txt",
    sitemapUrl: "Sitemap URL (for robots.txt)", sitemapUrlPh: "https://example.com/sitemap.xml",
    disallow: "Paths to block (Disallow, one per line)", disallowPh: "/admin\n/cart",
    pretty: "Indented (readable)",
    outSitemap: "sitemap.xml", outRobots: "robots.txt",
    copy: "Copy", copied: "Copied ✓", download: "Download",
    urlsCount: (n: number) => `${n} URL${n > 1 ? "s" : ""}`,
    invalidCount: (n: number) => `${n} line${n > 1 ? "s" : ""} skipped (invalid)`,
    multiHost: "Multiple domains detected — a sitemap should cover a single domain.",
    overLimit: "Over 50,000 URLs — split into several sitemaps + an index.",
    empty: "Add at least one valid URL (http/https) on the left.",
    hint: "100% in your browser. Sitemap follows the sitemaps.org 0.9 schema. Put sitemap.xml and robots.txt at your site root.",
    cf: { always: "always", hourly: "hourly", daily: "daily", weekly: "weekly", monthly: "monthly", yearly: "yearly", never: "never" } as Record<ChangeFreq, string>,
  },
} as const;

const EXAMPLE_FR = "https://exemple.ch/\nhttps://exemple.ch/a-propos\nhttps://exemple.ch/blog\nhttps://exemple.ch/blog/article-1\nhttps://exemple.ch/contact";

function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 2000);
}

export default function SitemapoCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [text, setText] = useState("");
  const [changefreq, setChangefreq] = useState<"" | ChangeFreq>("");
  const [priority, setPriority] = useState("");
  const [useLastmod, setUseLastmod] = useState(false);
  const [pretty, setPretty] = useState(true);
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [disallow, setDisallow] = useState("");
  const [copied, setCopied] = useState<"" | "xml" | "txt">("");

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const { urls, invalid } = useMemo(() => parseUrlList(text), [text]);
  const stats = useMemo(() => analyze(urls), [urls]);

  const xml = useMemo(() => {
    if (urls.length === 0) return "";
    const entries = makeEntries(urls, {
      changefreq: changefreq || undefined,
      priority: priority || undefined,
      lastmod: useLastmod ? today : undefined,
    });
    return buildSitemap(entries, { pretty });
  }, [urls, changefreq, priority, useLastmod, today, pretty]);

  const robots = useMemo(
    () => buildRobots({ sitemapUrl: sitemapUrl.trim() || undefined, disallow: disallow.split(/\r?\n/) }),
    [sitemapUrl, disallow],
  );

  const copy = async (which: "xml" | "txt", content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(which);
      setTimeout(() => setCopied(""), 1600);
    } catch {
      /* ignore */
    }
  };

  const ready = urls.length > 0;

  return (
    <section className="sm" id="sitemapo">
      <style dangerouslySetInnerHTML={{ __html: SM_CSS }} />
      <div className="sm-grid">
        <div className="sm-left">
          <div className="sm-head">
            <span className="sm-lbl">{t.urlsLabel}</span>
            <div className="sm-btns">
              <button className="sm-mini" onClick={() => setText(EXAMPLE_FR)}>{t.example}</button>
              <button className="sm-mini" onClick={() => setText("")} disabled={!text.trim()}>{t.clear}</button>
            </div>
          </div>
          <textarea className="sm-ta" value={text} onChange={(e) => setText(e.target.value)} placeholder={t.urlsPh} spellCheck={false} rows={9} />
          <div className="sm-status">
            <span className="sm-pill sm-pgood">{t.urlsCount(urls.length)}</span>
            {invalid.length > 0 && <span className="sm-pill sm-pwarn">{t.invalidCount(invalid.length)}</span>}
          </div>

          <div className="sm-opts">
            <div className="sm-optttl">{t.optsTitle}</div>
            <div className="sm-row">
              <label className="sm-field">
                <span>{t.changefreq}</span>
                <select className="sm-in" value={changefreq} onChange={(e) => setChangefreq(e.target.value as "" | ChangeFreq)}>
                  <option value="">{t.cfNone}</option>
                  {CHANGEFREQS.map((c) => <option key={c} value={c}>{t.cf[c]}</option>)}
                </select>
              </label>
              <label className="sm-field">
                <span>{t.priority}</span>
                <select className="sm-in" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="">{t.prNone}</option>
                  {["1.0", "0.9", "0.8", "0.7", "0.6", "0.5", "0.4", "0.3", "0.2", "0.1", "0.0"].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
            </div>
            <div className="sm-checks">
              <label className="sm-check"><input type="checkbox" checked={useLastmod} onChange={(e) => setUseLastmod(e.target.checked)} /><span>{t.lastmod} — {t.lmToday}</span></label>
              <label className="sm-check"><input type="checkbox" checked={pretty} onChange={(e) => setPretty(e.target.checked)} /><span>{t.pretty}</span></label>
            </div>
          </div>

          <div className="sm-opts">
            <div className="sm-optttl">{t.robotsTitle}</div>
            <label className="sm-field">
              <span>{t.sitemapUrl}</span>
              <input className="sm-in" value={sitemapUrl} onChange={(e) => setSitemapUrl(e.target.value)} placeholder={t.sitemapUrlPh} />
            </label>
            <label className="sm-field">
              <span>{t.disallow}</span>
              <textarea className="sm-in sm-ta2" value={disallow} onChange={(e) => setDisallow(e.target.value)} placeholder={t.disallowPh} rows={2} spellCheck={false} />
            </label>
          </div>
        </div>

        <div className="sm-right">
          {stats.multiHost && <p className="sm-warn">⚠ {t.multiHost}</p>}
          {stats.overLimit && <p className="sm-warn">⚠ {t.overLimit}</p>}

          <div className="sm-outhead">
            <span>{t.outSitemap}</span>
            {ready && (
              <span className="sm-outbtns">
                <button className="sm-mini" onClick={() => copy("xml", xml)}>{copied === "xml" ? t.copied : t.copy}</button>
                <button className="sm-mini" onClick={() => download("sitemap.xml", xml, "application/xml;charset=utf-8")}>{t.download}</button>
              </span>
            )}
          </div>
          {ready ? <pre className="sm-pre">{xml}</pre> : <p className="sm-empty">{t.empty}</p>}

          <div className="sm-outhead">
            <span>{t.outRobots}</span>
            <span className="sm-outbtns">
              <button className="sm-mini" onClick={() => copy("txt", robots)}>{copied === "txt" ? t.copied : t.copy}</button>
              <button className="sm-mini" onClick={() => download("robots.txt", robots, "text/plain;charset=utf-8")}>{t.download}</button>
            </span>
          </div>
          <pre className="sm-pre sm-pre-sm">{robots}</pre>

          <p className="sm-hint">{t.hint}</p>
        </div>
      </div>
    </section>
  );
}

const SM_CSS = `
.sm{margin:22px 0 8px;color:#e6e9f5}
.sm-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px;align-items:start}
@media(max-width:860px){.sm-grid{grid-template-columns:1fr}}
.sm-left,.sm-right{display:flex;flex-direction:column;gap:12px}
.sm-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.sm-lbl{font-size:.82rem;color:#c3c8e2}
.sm-btns,.sm-outbtns{display:flex;gap:7px}
.sm-mini{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);color:#cdd4ee;border-radius:8px;padding:6px 11px;font-size:.78rem;font-weight:700;cursor:pointer}
.sm-mini:hover:not(:disabled){background:rgba(255,255,255,.1)}
.sm-mini:disabled{opacity:.4;cursor:not-allowed}
.sm-ta{width:100%;background:#0b1120;border:1px solid rgba(255,255,255,.12);border-radius:12px;color:#dbe4f7;padding:13px;font-family:var(--mono,ui-monospace,monospace);font-size:.82rem;line-height:1.55;resize:vertical;min-height:150px}
.sm-ta:focus,.sm-in:focus{outline:none;border-color:rgba(56,189,248,.55)}
.sm-status{display:flex;gap:8px;flex-wrap:wrap}
.sm-pill{font-size:.76rem;font-weight:800;border-radius:99px;padding:4px 11px;border:1px solid transparent}
.sm-pgood{background:rgba(52,211,153,.14);color:#6ee7b7;border-color:rgba(52,211,153,.35)}
.sm-pwarn{background:rgba(251,191,36,.14);color:#fcd34d;border-color:rgba(251,191,36,.35)}
.sm-opts{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:12px}
.sm-optttl{font-size:.78rem;font-weight:800;letter-spacing:.03em;text-transform:uppercase;color:#8b93b7}
.sm-row{display:flex;gap:12px;flex-wrap:wrap}
.sm-row .sm-field{flex:1;min-width:130px}
.sm-field{display:block}
.sm-field>span{display:block;font-size:.8rem;color:#c3c8e2;margin-bottom:6px}
.sm-in{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:9px;color:#f5f6fb;padding:10px 12px;font-size:.9rem;font-family:inherit}
.sm-ta2{font-family:var(--mono,ui-monospace,monospace);font-size:.82rem;resize:vertical;min-height:52px}
.sm-checks{display:flex;flex-direction:column;gap:9px}
.sm-check{display:flex;align-items:center;gap:9px;font-size:.87rem;color:#e6e9f5;cursor:pointer}
.sm-check input{width:17px;height:17px;accent-color:#38bdf8}
.sm-warn{margin:0;font-size:.83rem;line-height:1.5;color:#fcd34d;background:rgba(251,191,36,.1);border:1px solid rgba(251,191,36,.3);border-radius:10px;padding:9px 12px}
.sm-outhead{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:.8rem;font-weight:800;letter-spacing:.03em;text-transform:uppercase;color:#8b93b7;margin-top:2px}
.sm-pre{margin:0;background:#0b1120;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:14px;font-family:var(--mono,ui-monospace,monospace);font-size:.78rem;line-height:1.5;color:#c8d2ea;white-space:pre-wrap;word-break:break-word;max-height:300px;overflow:auto}
.sm-pre-sm{max-height:150px}
.sm-empty{margin:0;color:#8b93b7;font-size:.9rem;text-align:center;padding:26px 16px;background:rgba(255,255,255,.02);border:1px dashed rgba(255,255,255,.12);border-radius:12px}
.sm-hint{margin:2px 0 0;font-size:.8rem;line-height:1.5;color:#8b93b7}
`;
