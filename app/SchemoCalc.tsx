"use client";

import { useMemo, useState } from "react";
import { type Lang } from "@/lib/i18n";
import { validateJsonLd, type IssueLevel } from "@/lib/schemo";

const L = {
  fr: {
    inLabel: "Colle ton JSON-LD (balise <script type=\"application/ld+json\">)",
    placeholder: "{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Product\",\n  ...\n}",
    example: "Charger un exemple",
    format: "Formater",
    clear: "Effacer",
    resultTitle: "Résultat",
    ok: "Valide — aucun problème bloquant",
    hasErrors: (n: number) => `${n} erreur${n > 1 ? "s" : ""} à corriger`,
    warnOnly: (n: number) => `Valide, mais ${n} recommandation${n > 1 ? "s" : ""}`,
    empty: "Colle un extrait JSON-LD à gauche pour le valider en direct.",
    invalid: "JSON invalide",
    typesFound: "Types détectés",
    none: "aucun",
    errors: "Erreurs",
    warnings: "Recommandations",
    infos: "Infos",
    lvl: { error: "Erreur", warning: "Reco", info: "Info" } as Record<IssueLevel, string>,
    hint: "100 % dans ton navigateur — rien n'est envoyé. schemo vérifie les champs requis et recommandés par Google (rich results) pour les types Schema.org courants.",
    root: "racine",
  },
  de: {
    inLabel: "JSON-LD einfügen (Tag <script type=\"application/ld+json\">)",
    placeholder: "{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Product\",\n  ...\n}",
    example: "Beispiel laden",
    format: "Formatieren",
    clear: "Leeren",
    resultTitle: "Ergebnis",
    ok: "Gültig — keine blockierenden Probleme",
    hasErrors: (n: number) => `${n} Fehler zu beheben`,
    warnOnly: (n: number) => `Gültig, aber ${n} Empfehlung${n > 1 ? "en" : ""}`,
    empty: "Füge links ein JSON-LD ein, um es live zu prüfen.",
    invalid: "Ungültiges JSON",
    typesFound: "Erkannte Typen",
    none: "keine",
    errors: "Fehler",
    warnings: "Empfehlungen",
    infos: "Infos",
    lvl: { error: "Fehler", warning: "Empf.", info: "Info" } as Record<IssueLevel, string>,
    hint: "100 % im Browser — nichts wird gesendet. schemo prüft die von Google (Rich Results) geforderten und empfohlenen Felder gängiger Schema.org-Typen.",
    root: "Wurzel",
  },
  en: {
    inLabel: "Paste your JSON-LD (<script type=\"application/ld+json\"> tag)",
    placeholder: "{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Product\",\n  ...\n}",
    example: "Load an example",
    format: "Format",
    clear: "Clear",
    resultTitle: "Result",
    ok: "Valid — no blocking issues",
    hasErrors: (n: number) => `${n} error${n > 1 ? "s" : ""} to fix`,
    warnOnly: (n: number) => `Valid, but ${n} recommendation${n > 1 ? "s" : ""}`,
    empty: "Paste a JSON-LD snippet on the left to validate it live.",
    invalid: "Invalid JSON",
    typesFound: "Types found",
    none: "none",
    errors: "Errors",
    warnings: "Recommendations",
    infos: "Info",
    lvl: { error: "Error", warning: "Rec.", info: "Info" } as Record<IssueLevel, string>,
    hint: "100% in your browser — nothing is sent. schemo checks the fields Google (rich results) requires and recommends for common Schema.org types.",
    root: "root",
  },
} as const;

const EXAMPLE = `{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Gourde isotherme 500 ml",
  "image": "https://exemple.ch/gourde.jpg",
  "description": "Garde tes boissons au frais 24 h.",
  "brand": { "@type": "Brand", "name": "Alpina" },
  "offers": {
    "@type": "Offer",
    "price": "29.90",
    "priceCurrency": "CHF",
    "availability": "https://schema.org/InStock"
  }
}`;

const BADGE: Record<IssueLevel, string> = { error: "sc-berr", warning: "sc-bwarn", info: "sc-binfo" };

export default function SchemoCalc({ lang }: { lang: Lang }) {
  const t = L[lang] ?? L.fr;
  const [text, setText] = useState("");

  const res = useMemo(() => validateJsonLd(text), [text]);
  const has = text.trim() !== "";

  const format = () => {
    try {
      setText(JSON.stringify(JSON.parse(text), null, 2));
    } catch {
      /* laisse tel quel si non parsable */
    }
  };

  const statusClass = !has
    ? "sc-idle"
    : !res.jsonValid
      ? "sc-bad"
      : res.counts.errors > 0
        ? "sc-bad"
        : res.counts.warnings > 0
          ? "sc-warn"
          : "sc-good";

  const statusText = !res.jsonValid
    ? `${t.invalid}${res.parseError ? " — " + res.parseError : ""}`
    : res.counts.errors > 0
      ? t.hasErrors(res.counts.errors)
      : res.counts.warnings > 0
        ? t.warnOnly(res.counts.warnings)
        : t.ok;

  const pathLabel = (p: string) => (p === "" ? t.root : p);

  return (
    <section className="sc" id="schemo">
      <style dangerouslySetInnerHTML={{ __html: SC_CSS }} />
      <div className="sc-grid">
        <div className="sc-left">
          <div className="sc-toolbar">
            <span className="sc-lbl">{t.inLabel}</span>
            <div className="sc-tb-btns">
              <button className="sc-mini" onClick={() => setText(EXAMPLE)}>{t.example}</button>
              <button className="sc-mini" onClick={format} disabled={!has}>{t.format}</button>
              <button className="sc-mini" onClick={() => setText("")} disabled={!has}>{t.clear}</button>
            </div>
          </div>
          <textarea
            className="sc-ta"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.placeholder}
            spellCheck={false}
            rows={18}
          />
          <p className="sc-hint">{t.hint}</p>
        </div>

        <div className="sc-right">
          <div className={`sc-status ${statusClass}`}>
            <span className="sc-status-ic" aria-hidden>
              {!has ? "•" : !res.jsonValid || res.counts.errors > 0 ? "✕" : res.counts.warnings > 0 ? "!" : "✓"}
            </span>
            <span className="sc-status-tx">{has ? statusText : t.resultTitle}</span>
          </div>

          {!has ? (
            <p className="sc-empty">{t.empty}</p>
          ) : (
            <>
              <div className="sc-meta">
                <div className="sc-counts">
                  <span className="sc-chip sc-berr">{res.counts.errors} {t.errors}</span>
                  <span className="sc-chip sc-bwarn">{res.counts.warnings} {t.warnings}</span>
                  <span className="sc-chip sc-binfo">{res.counts.infos} {t.infos}</span>
                </div>
                <div className="sc-types">
                  <span className="sc-types-l">{t.typesFound} :</span>{" "}
                  {res.types.length ? res.types.map((ty) => <span key={ty} className="sc-type">{ty}</span>) : <em>{t.none}</em>}
                </div>
              </div>

              {res.jsonValid && (
                <ul className="sc-issues">
                  {res.issues.length === 0 && <li className="sc-issue sc-ok-row"><span className="sc-badge sc-bgood">✓</span><span>{t.ok}</span></li>}
                  {res.issues.map((iss, i) => (
                    <li key={i} className="sc-issue">
                      <span className={`sc-badge ${BADGE[iss.level]}`}>{t.lvl[iss.level]}</span>
                      <span className="sc-issue-tx">
                        {iss.message}
                        {(iss.path || iss.field) && (
                          <code className="sc-loc">{pathLabel(iss.path)}{iss.field ? ` › ${iss.field}` : ""}</code>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

const SC_CSS = `
.sc{margin:22px 0 8px;color:#e6e9f5}
.sc-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px;align-items:start}
@media(max-width:860px){.sc-grid{grid-template-columns:1fr}}
.sc-left,.sc-right{display:flex;flex-direction:column;gap:12px}
.sc-toolbar{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
.sc-lbl{font-size:.82rem;color:#c3c8e2;flex:1;min-width:180px}
.sc-tb-btns{display:flex;gap:7px;flex-wrap:wrap}
.sc-mini{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);color:#cdd4ee;border-radius:8px;padding:6px 11px;font-size:.78rem;font-weight:700;cursor:pointer}
.sc-mini:hover:not(:disabled){background:rgba(255,255,255,.1)}
.sc-mini:disabled{opacity:.4;cursor:not-allowed}
.sc-ta{width:100%;background:#0b1120;border:1px solid rgba(255,255,255,.12);border-radius:12px;color:#dbe4f7;padding:14px;font-family:var(--mono,ui-monospace,monospace);font-size:.82rem;line-height:1.55;resize:vertical;min-height:280px;tab-size:2}
.sc-ta:focus{outline:none;border-color:rgba(139,92,246,.6)}
.sc-hint{margin:0;font-size:.8rem;line-height:1.5;color:#8b93b7}
.sc-status{display:flex;align-items:center;gap:11px;padding:14px 16px;border-radius:13px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);font-weight:800;font-size:.98rem}
.sc-status-ic{flex:none;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.95rem;color:#05131f}
.sc-idle .sc-status-ic{background:#64748b;color:#fff}
.sc-good{border-color:rgba(52,211,153,.4);background:rgba(52,211,153,.1);color:#6ee7b7}
.sc-good .sc-status-ic{background:#34d399}
.sc-warn{border-color:rgba(251,191,36,.4);background:rgba(251,191,36,.1);color:#fcd34d}
.sc-warn .sc-status-ic{background:#fbbf24}
.sc-bad{border-color:rgba(248,113,113,.4);background:rgba(248,113,113,.1);color:#fca5a5}
.sc-bad .sc-status-ic{background:#f87171}
.sc-idle{color:#c3c8e2}
.sc-empty{margin:0;color:#8b93b7;font-size:.9rem;text-align:center;padding:34px 16px;background:rgba(255,255,255,.02);border:1px dashed rgba(255,255,255,.12);border-radius:12px}
.sc-meta{display:flex;flex-direction:column;gap:10px}
.sc-counts{display:flex;gap:8px;flex-wrap:wrap}
.sc-chip{font-size:.76rem;font-weight:800;border-radius:99px;padding:4px 11px;border:1px solid transparent}
.sc-berr{background:rgba(248,113,113,.14);color:#fca5a5;border-color:rgba(248,113,113,.35)}
.sc-bwarn{background:rgba(251,191,36,.14);color:#fcd34d;border-color:rgba(251,191,36,.35)}
.sc-binfo{background:rgba(96,165,250,.14);color:#93c5fd;border-color:rgba(96,165,250,.35)}
.sc-bgood{background:rgba(52,211,153,.18);color:#6ee7b7;border-color:rgba(52,211,153,.4)}
.sc-types{font-size:.84rem;color:#9aa2c4;line-height:1.9}
.sc-types-l{color:#8b93b7}
.sc-type{display:inline-block;background:rgba(139,92,246,.16);border:1px solid rgba(139,92,246,.4);color:#c4b5fd;border-radius:7px;padding:2px 9px;font-weight:700;font-size:.8rem;margin:0 4px 4px 0}
.sc-issues{list-style:none;margin:6px 0 0;padding:0;display:flex;flex-direction:column;gap:8px}
.sc-issue{display:flex;align-items:flex-start;gap:10px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:11px;padding:11px 13px;font-size:.88rem;line-height:1.5}
.sc-ok-row{color:#6ee7b7}
.sc-badge{flex:none;font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.03em;border-radius:6px;padding:3px 8px;margin-top:1px}
.sc-issue-tx{color:#d7ddf0}
.sc-loc{display:inline-block;margin-left:6px;background:#0b1120;border:1px solid rgba(255,255,255,.1);border-radius:6px;padding:1px 7px;font-family:var(--mono,ui-monospace,monospace);font-size:.76rem;color:#93a1c9;word-break:break-word}
`;
