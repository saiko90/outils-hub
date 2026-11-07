// Styles communs des calculateurs intégrés récents (avso, pourcento, prorato, ibano), même look qu'InteroCalc.
export const CALC_CSS = `
.oc{margin:22px 0 8px}
.oc-grid{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:22px;align-items:start}
@media(max-width:820px){.oc-grid{grid-template-columns:1fr}}
.oc-params{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.09);border-radius:16px;padding:18px}
.oc-field{display:block;margin:0 0 16px}
.oc-field>span{display:block;font-size:.85rem;color:#c3c8e2;margin-bottom:6px}
.oc-in{width:100%;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:8px;color:#f5f6fb;padding:9px 10px;font-size:.95rem;font-family:inherit}
.oc-in.mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.03em}
.oc-in.ok{border-color:rgba(52,211,153,.7)}
.oc-in.bad{border-color:rgba(248,113,113,.7)}
.oc-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.oc-note{display:block;font-style:normal;font-size:.74rem;color:#8b93b7;margin-top:5px;line-height:1.4}
.oc-seg{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 16px}
.oc-seg button{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.12);color:#c3c8e2;border-radius:999px;padding:7px 12px;font-size:.82rem;font-weight:700;cursor:pointer;font-family:inherit}
.oc-seg button.on{background:rgba(165,180,252,.16);border-color:rgba(165,180,252,.6);color:#f5f6fb}
.oc-chip{background:none;border:1px dashed rgba(255,255,255,.22);color:#c3c8e2;border-radius:999px;padding:6px 12px;font-size:.8rem;cursor:pointer;font-family:inherit}
.oc-check{display:flex;align-items:center;gap:8px;font-size:.85rem;color:#c3c8e2}
.oc-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px}
.oc-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:14px}
.oc-card>span{font-size:.75rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#8b93b7}
.oc-card>b{display:block;font-size:1.25rem;font-weight:800;color:#f5f6fb;margin-top:2px;word-break:break-word}
.oc-total{background:linear-gradient(135deg,rgba(99,102,241,.18),rgba(52,211,153,.1));border:1px solid rgba(129,140,248,.4);border-radius:16px;padding:18px}
.oc-total.ok{background:linear-gradient(135deg,rgba(52,211,153,.18),rgba(34,211,238,.08));border-color:rgba(52,211,153,.45)}
.oc-total.bad{background:linear-gradient(135deg,rgba(248,113,113,.16),rgba(251,191,36,.08));border-color:rgba(248,113,113,.45)}
.oc-tlabel{font-size:.8rem;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#c7d2fe}
.oc-tval{font-size:2rem;font-weight:800;letter-spacing:-.5px;color:#f5f6fb;margin-top:2px;word-break:break-word}
.oc-thint{font-size:.88rem;color:#c3c8e2;margin-top:4px;line-height:1.5}
.oc-disclaimer{margin:18px 0 0;font-size:.8rem;line-height:1.5;color:#8b93b7;border-top:1px solid rgba(255,255,255,.08);padding-top:12px}
`;

export const fmtNum = (n: number, lang: "fr" | "de" | "en", digits = 2) =>
  new Intl.NumberFormat(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(n);
export const fmtChf = (n: number, lang: "fr" | "de" | "en") =>
  new Intl.NumberFormat(lang === "de" ? "de-CH" : lang === "en" ? "en-CH" : "fr-CH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) + " CHF";
