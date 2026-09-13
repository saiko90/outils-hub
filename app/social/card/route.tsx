import { ImageResponse } from "next/og";

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Carte sociale carrée 1200×1200 pour LinkedIn, générée à la volée.
// Paramètres (query) :
//   e  = kicker / eyebrow (majuscules)        ex. "FACTURATION SUISSE"
//   hg = début du titre, mis en avant (cyan)  ex. "La QR-facture,"
//   t  = suite du titre (blanc)               ex. "sans friction"
//   s  = sous-titre                           ex. "Conforme ISO 20022 / SIX…"
// Tous facultatifs — des valeurs par défaut de marque sont utilisées.

function SwissMark() {
  return (
    <div style={{ width: 34, height: 34, borderRadius: 7, background: "#d52b1e", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}>
      <div style={{ position: "absolute", width: 18, height: 6, background: "#fff", borderRadius: 1, display: "flex" }} />
      <div style={{ position: "absolute", width: 6, height: 18, background: "#fff", borderRadius: 1, display: "flex" }} />
    </div>
  );
}

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clamp = (v: string | null, max: number) => (v ? v.slice(0, max) : "");
  const eyebrow = clamp(searchParams.get("e"), 42) || "LA BOÎTE À OUTILS SUISSE";
  const hg = clamp(searchParams.get("hg"), 60) || "Ta boîte";
  const rest = clamp(searchParams.get("t"), 60) || "à outils suisse";
  const sub =
    clamp(searchParams.get("s"), 160) ||
    "Convertisseurs, générateurs, calculateurs — et des outils pensés pour la Suisse.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: "96px 100px",
          background: "#07070d", color: "#f5f6fb", fontFamily: "sans-serif", position: "relative",
        }}
      >
        {/* glows d'ambiance */}
        <div style={{ position: "absolute", top: -220, left: -160, width: 720, height: 720, borderRadius: 9999, background: "#4f46e5", opacity: 0.5, filter: "blur(120px)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -260, right: -140, width: 640, height: 640, borderRadius: 9999, background: "#22d3ee", opacity: 0.38, filter: "blur(120px)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: 120, left: -180, width: 520, height: 520, borderRadius: 9999, background: "#34d399", opacity: 0.3, filter: "blur(120px)", display: "flex" }} />

        {/* haut : logo + wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 22, zIndex: 1 }}>
          <div style={{ width: 104, height: 104, borderRadius: 26, background: "linear-gradient(135deg, #6366f1, #22d3ee)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 58, fontWeight: 800, letterSpacing: -3, color: "#07070d" }}>
            o.
          </div>
          <div style={{ display: "flex", fontSize: 52, fontWeight: 800, letterSpacing: -2 }}>
            <span style={{ color: "#f5f6fb" }}>outils</span>
            <span style={{ color: "#5eead4" }}>.ch</span>
          </div>
        </div>

        {/* milieu : eyebrow + titre + sous-titre */}
        <div style={{ display: "flex", flexDirection: "column", zIndex: 1 }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600, letterSpacing: 2, color: "#8b93b7", marginBottom: 30 }}>
            {eyebrow.toUpperCase()}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", fontSize: 108, fontWeight: 800, lineHeight: 1.03, letterSpacing: -4, maxWidth: 1000 }}>
            <span style={{ color: "#4fd1e5", display: "flex" }}>{hg}</span>
            {rest ? <span style={{ color: "#f5f6fb", display: "flex", marginLeft: 22 }}>{rest}</span> : null}
          </div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 500, lineHeight: 1.3, color: "#c3c8e2", marginTop: 38, maxWidth: 940 }}>
            {sub}
          </div>
        </div>

        {/* bas : pill CH + baseline */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 32, fontWeight: 600, color: "#e7e9f6", border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.04)", borderRadius: 9999, padding: "16px 30px" }}>
            <SwissMark />
            <span style={{ color: "#22d3ee", display: "flex" }}>outils.ch</span>
          </div>
          <div style={{ display: "flex", fontSize: 32, fontWeight: 600, color: "#9aa1c4" }}>
            Gratuit · sans inscription · 100 % navigateur
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 1200 }
  );
}
