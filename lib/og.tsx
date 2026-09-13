import { ImageResponse } from "next/og";
import type { Lang } from "./i18n";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

const BRAND = {
  fr: { tools: "outils gratuits", browser: "100 % navigateur · aucune inscription", by: "Swiss Digital Studio" },
  de: { tools: "gratis Tools", browser: "100 % im Browser · ohne Anmeldung", by: "Swiss Digital Studio" },
  en: { tools: "free tools", browser: "100% in your browser · no sign-up", by: "Swiss Digital Studio" },
} as const;

type OgProps = {
  lang: Lang;
  title: string;
  subtitle: string;
  badge?: string;      // e.g. category label
  initials?: string;   // logo square text
  from?: string;       // gradient start
  to?: string;         // gradient end
  ch?: boolean;        // show Swiss marker
};

/** Drawn Swiss flag marker (red square + white cross), avoids emoji fetch. */
function SwissMark() {
  return (
    <div style={{ width: 30, height: 30, borderRadius: 6, background: "#d52b1e", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexShrink: 0 }}>
      <div style={{ position: "absolute", width: 16, height: 5, background: "#fff", borderRadius: 1, display: "flex" }} />
      <div style={{ position: "absolute", width: 5, height: 16, background: "#fff", borderRadius: 1, display: "flex" }} />
    </div>
  );
}

/** Shared Swiss-style Open Graph card (1200×630), no emoji (satori-safe). */
export function ogImage({ lang, title, subtitle, badge, initials, from = "#6366f1", to = "#ec4899", ch }: OgProps) {
  const b = BRAND[lang];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: "72px 80px",
          background: "#0a0a0f", color: "#fff",
          fontFamily: "sans-serif", position: "relative",
        }}
      >
        {/* ambient glows */}
        <div style={{ position: "absolute", top: -160, right: -120, width: 520, height: 520, borderRadius: 9999, background: from, opacity: 0.28, filter: "blur(40px)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -180, left: -100, width: 480, height: 480, borderRadius: 9999, background: to, opacity: 0.24, filter: "blur(40px)", display: "flex" }} />

        {/* top row: brand + badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 800, letterSpacing: -1 }}>
            <span style={{ color: "#fff" }}>outils</span>
            <span style={{ color: "#a5b4fc" }}>.ch</span>
          </div>
          {badge && (
            <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, fontWeight: 600, color: "#cbd5e1", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9999, padding: "12px 28px" }}>
              {ch && <SwissMark />}
              {badge}
            </div>
          )}
        </div>

        {/* center: logo + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 40, zIndex: 1 }}>
          {initials && (
            <div style={{ width: 168, height: 168, borderRadius: 40, background: `linear-gradient(135deg, ${from}, ${to})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 76, fontWeight: 800, flexShrink: 0, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
              {initials}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: initials ? 82 : 92, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2, maxWidth: 820 }}>{title}</div>
            <div style={{ fontSize: 36, color: "#cbd5e1", marginTop: 20, maxWidth: 820, lineHeight: 1.25 }}>{subtitle}</div>
          </div>
        </div>

        {/* bottom row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 1, fontSize: 26, color: "#94a3b8" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 12, height: 12, borderRadius: 9999, background: "#22c55e", display: "flex" }} />
            {b.browser}
          </div>
          <div style={{ display: "flex" }}>{b.by}</div>
        </div>
      </div>
    ),
    { ...OG_SIZE }
  );
}
