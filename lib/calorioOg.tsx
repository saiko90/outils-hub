import { ImageResponse } from "next/og";

// Carte de partage calorio (1200×630) : fond vert clair de la marque, wordmark, titre, sous-titre
// et une pastille chiffrée optionnelle (ex. « 412 kcal / portion »). Sans emoji (compatible satori).
export const CALORIO_OG_SIZE = { width: 1200, height: 630 };
export const CALORIO_OG_TYPE = "image/png";

type Props = { title: string; subtitle: string; badge?: string; kicker?: string };

function Radish() {
  // Petit radis dessiné (formes simples) : la mascotte Vito, sans dépendre d'une police emoji.
  return (
    <div style={{ display: "flex", position: "relative", width: 96, height: 110 }}>
      <div style={{ position: "absolute", top: 0, left: 30, width: 16, height: 34, borderRadius: 16, background: "#2fa866", transform: "rotate(-22deg)", display: "flex" }} />
      <div style={{ position: "absolute", top: 0, left: 50, width: 16, height: 34, borderRadius: 16, background: "#43c07a", transform: "rotate(22deg)", display: "flex" }} />
      <div style={{ position: "absolute", top: 26, left: 8, width: 80, height: 80, borderRadius: 80, background: "#ef4a6a", display: "flex" }} />
      <div style={{ position: "absolute", top: 58, left: 30, width: 9, height: 11, borderRadius: 9, background: "#2b1a20", display: "flex" }} />
      <div style={{ position: "absolute", top: 58, left: 56, width: 9, height: 11, borderRadius: 9, background: "#2b1a20", display: "flex" }} />
    </div>
  );
}

export function calorioOg({ title, subtitle, badge, kicker = "calorio.ch" }: Props) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "64px 76px", background: "linear-gradient(160deg, #f1fbf4 0%, #e3f3e8 55%, #d6eedd 100%)",
          color: "#14301f", fontFamily: "sans-serif", position: "relative",
        }}
      >
        <div style={{ position: "absolute", right: -140, top: -160, width: 520, height: 520, borderRadius: 520, background: "#34d17f", opacity: 0.18, display: "flex" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Radish />
            <div style={{ display: "flex", fontSize: 58, fontWeight: 800, letterSpacing: -2, color: "#16a34a" }}>calorio</div>
          </div>
          {badge && (
            <div style={{ display: "flex", fontSize: 30, fontWeight: 800, color: "#fff", background: "#16a34a", borderRadius: 999, padding: "14px 30px" }}>{badge}</div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 980 }}>
          <div style={{ display: "flex", fontSize: title.length > 38 ? 60 : 72, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05 }}>{title}</div>
          <div style={{ display: "flex", fontSize: 32, color: "#3d5a48", lineHeight: 1.3 }}>{subtitle}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#4d6b58", fontWeight: 700 }}>
          <div style={{ display: "flex", width: 28, height: 28, borderRadius: 6, background: "#d52b1e", alignItems: "center", justifyContent: "center", position: "relative" }}>
            <div style={{ position: "absolute", width: 15, height: 5, background: "#fff", display: "flex" }} />
            <div style={{ position: "absolute", width: 5, height: 15, background: "#fff", display: "flex" }} />
          </div>
          {kicker}
        </div>
      </div>
    ),
    CALORIO_OG_SIZE
  );
}
