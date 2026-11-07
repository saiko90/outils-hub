// Styles des fiches calories (FR /calories/<slug> et DE /de/kalorien/<slug>).
export const CAL_CSS = `
body{background:#f3f7f2 !important}
.ca-bg{position:fixed;inset:0;z-index:-5;background:radial-gradient(1100px 560px at 50% -8%, #e9faf0, #f3f7f2 62%)}
.ca{max-width:760px;margin:0 auto;padding:16px 18px 70px;color:#2b3243;font-family:inherit}
.ca a{color:inherit}
.ca-top{display:flex;align-items:center;justify-content:space-between;padding:8px 2px 6px}
.ca-lang{font-size:.85rem;font-weight:700;color:#16a34a !important;text-decoration:none}
.ca-brand{display:inline-flex;align-items:center;gap:9px;font-size:1.2rem;font-weight:800;letter-spacing:-.3px;color:#16a34a;text-decoration:none}
.ca-brand img{border-radius:9px}
.ca-crumb{font-size:.82rem;color:#8a93a3;margin:6px 2px 16px;line-height:1.5}
.ca-crumb a{color:#16a34a;text-decoration:none}
.ca-h1{font-size:1.75rem;line-height:1.2;font-weight:800;letter-spacing:-.5px;color:#1a2030;margin:0 0 12px}
.ca-emo{margin-right:6px}
.ca-intro{font-size:1.02rem;line-height:1.6;color:#4b5563;margin:0 0 18px}
.ca-intro b{color:#166a3a}
.ca-kpis{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 8px}
.ca-kpi{background:#fff;border:1px solid #cdebd7;border-radius:18px;padding:18px;text-align:center;box-shadow:0 6px 20px -14px rgba(20,80,44,.4)}
.ca-kpi-alt{background:#e9f8ee}
.ca-kv{font-size:2.2rem;font-weight:800;letter-spacing:-1px;color:#16a34a;line-height:1;font-variant-numeric:tabular-nums}
.ca-kl{font-size:.78rem;font-weight:700;color:#6b7280;margin-top:5px}
.ca-h2{font-size:1.25rem;font-weight:800;letter-spacing:-.3px;color:#1a2030;margin:30px 0 12px;padding-bottom:10px;border-bottom:1px solid #f6cdd9}
.ca-tablewrap{overflow-x:auto;border:1px solid #e4e9f0;border-radius:16px;background:#fff;box-shadow:0 6px 20px -14px rgba(20,40,80,.2)}
.ca-table{width:100%;border-collapse:collapse;font-size:.94rem;min-width:360px}
.ca-table th,.ca-table td{text-align:left;padding:13px 15px;border-bottom:1px solid #eef1f6}
.ca-table thead th{font-size:.85rem;font-weight:800;color:#6b7280;background:#f8fafc}
.ca-table tbody th{font-weight:700;color:#374151}
.ca-table tbody td{font-weight:700;color:#166a3a;font-variant-numeric:tabular-nums}
.ca-table tbody tr:last-child th,.ca-table tbody tr:last-child td{border-bottom:0}
.ca-note{font-size:.78rem;color:#9aa2b4;margin:10px 2px 0;line-height:1.5}
.ca-slice{margin:12px 2px 0;font-size:.95rem;color:#166a3a}
.ca-slice span{color:#6b7280;font-size:.85rem}
.ca-links{margin:0;padding-left:20px;line-height:1.9}
.ca-links a{color:#166a3a;font-weight:700}
.ca-final{margin:26px 0 0;text-align:center;background:linear-gradient(135deg,#eafaf0,#fdecf1);border:1px solid #cdebd7;border-radius:20px;padding:26px 22px}
.ca-final-t{font-size:1.2rem;font-weight:800;color:#1a2030}
.ca-final p{margin:7px 0 15px;color:#4b5563;line-height:1.5}
.ca-cta{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,#34d17f,#16a34a);color:#fff;text-decoration:none;font-weight:800;font-size:1rem;border-radius:13px;padding:13px 22px;box-shadow:0 12px 26px -10px rgba(22,163,74,.55)}
.ca-rel{display:grid;grid-template-columns:1fr 1fr;gap:9px}
.ca-relcard{display:flex;align-items:center;gap:9px;background:#fff;border:1px solid #e4e9f0;border-radius:13px;padding:11px 12px;text-decoration:none;box-shadow:0 4px 14px -12px rgba(20,40,80,.2)}
.ca-relcard:hover{border-color:#bfe6cd}
.ca-relemo{font-size:1.2rem}
.ca-reln{flex:1;min-width:0;font-weight:700;color:#232a37;font-size:.9rem}
.ca-relk{font-size:.72rem;color:#6b7280;text-align:right;font-weight:700}
.ca-relk small{display:block;font-size:.62rem;opacity:.7}
.ca-faq{display:flex;flex-direction:column;gap:10px}
.ca-fitem{background:#fff;border:1px solid #e4e9f0;border-radius:13px;overflow:hidden}
.ca-fitem summary{cursor:pointer;padding:14px 16px;font-weight:700;color:#232a37;font-size:.95rem;list-style:none}
.ca-fitem summary::-webkit-details-marker{display:none}
.ca-fitem summary::after{content:"+";float:right;color:#16a34a;font-weight:800}
.ca-fitem[open] summary::after{content:"−"}
.ca-fitem p{margin:0;padding:0 16px 15px;color:#4b5563;line-height:1.6;font-size:.92rem}
.ca-back{margin:24px 0 0;text-align:center}
.ca-back a{color:#16a34a;text-decoration:none;font-weight:700;font-size:.9rem}
@media(max-width:560px){.ca-h1{font-size:1.45rem}.ca-rel{grid-template-columns:1fr}}
`;
