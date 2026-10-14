// Styles partagés des pages légales de calorio (confidentialité, mentions légales).
export const PV_CSS = `
body{background:#f3f7f2 !important}
.pv-bg{position:fixed;inset:0;z-index:-5;background:radial-gradient(1100px 560px at 50% -8%, #e9faf0, #f3f7f2 62%)}
.pv{max-width:720px;margin:0 auto;padding:16px 18px 70px;color:#2b3243;font-family:inherit;line-height:1.6}
.pv a{color:#16a34a}
.pv-top{padding:8px 2px 10px}
.pv-brand{display:inline-flex;align-items:center;gap:9px;font-size:1.2rem;font-weight:800;letter-spacing:-.3px;color:#16a34a;text-decoration:none}
.pv-brand img{border-radius:9px}
.pv-h1{font-size:1.9rem;font-weight:800;letter-spacing:-.5px;color:#1a2030;margin:8px 0 4px}
.pv-maj{color:#9aa2b4;font-size:.85rem;margin:0 0 18px}
.pv-intro{font-size:1.02rem;color:#4b5563;margin:0 0 8px}
.pv-intro b{color:#166a3a}
.pv-h2{font-size:1.18rem;font-weight:800;color:#1a2030;margin:26px 0 8px;padding-bottom:8px;border-bottom:1px solid #f6cdd9}
.pv p{margin:0 0 10px;color:#3b4252}
.pv b{color:#232a37}
.pv-ul{margin:0 0 12px;padding-left:20px;color:#3b4252}
.pv-ul li{margin:6px 0}
.pv-back{margin:28px 0 0}
.pv-back a{text-decoration:none;font-weight:700}
@media(max-width:560px){.pv-h1{font-size:1.55rem}}
`;
