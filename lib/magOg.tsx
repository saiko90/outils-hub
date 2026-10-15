import { ImageResponse } from "next/og";
import { calorioOg } from "@/lib/calorioOg";
import { MAG_CATS, plain, type MagArticle, type MagLang } from "@/lib/mag";

// Images du Mag : carte de partage 1200×630 (Open Graph) et visuel de publication 1080×1350
// pour Facebook / Instagram, aux couleurs de calorio. Sans emoji (compatibilité satori).

export function magOg(a: MagArticle | undefined, lang: MagLang) {
  if (!a) return calorioOg({ title: lang === "de" ? "Das calorio Magazin" : "Le Mag calorio", subtitle: lang === "de" ? "Schweizer Klassiker, leichte Rezepte und Ratgeber" : "Classiques suisses, recettes légères et guides pratiques", kicker: lang === "de" ? "calorio.ch/de/magazin" : "calorio.ch/mag" });
  const l = a[lang];
  return calorioOg({
    title: plain(l.cardTitle || l.title),
    subtitle: MAG_CATS[a.cat][lang],
    badge: a.kcal ? `${a.kcal.value} kcal` : undefined,
    kicker: lang === "de" ? "calorio.ch/de/magazin" : "calorio.ch/mag",
  });
}

function Radish({ s = 1 }: { s?: number }) {
  return (
    <div style={{ display: "flex", position: "relative", width: 96 * s, height: 110 * s }}>
      <div style={{ position: "absolute", top: 0, left: 30 * s, width: 16 * s, height: 34 * s, borderRadius: 16 * s, background: "#2fa866", transform: "rotate(-22deg)", display: "flex" }} />
      <div style={{ position: "absolute", top: 0, left: 50 * s, width: 16 * s, height: 34 * s, borderRadius: 16 * s, background: "#43c07a", transform: "rotate(22deg)", display: "flex" }} />
      <div style={{ position: "absolute", top: 26 * s, left: 8 * s, width: 80 * s, height: 80 * s, borderRadius: 80 * s, background: "#ef4a6a", display: "flex" }} />
      <div style={{ position: "absolute", top: 58 * s, left: 30 * s, width: 9 * s, height: 11 * s, borderRadius: 9 * s, background: "#2b1a20", display: "flex" }} />
      <div style={{ position: "absolute", top: 58 * s, left: 56 * s, width: 9 * s, height: 11 * s, borderRadius: 9 * s, background: "#2b1a20", display: "flex" }} />
    </div>
  );
}

// Polices de la marque (Fredoka pour les titres, Nunito pour le texte), en WOFF (lisible par satori).
let FONTS: Promise<{ name: string; data: ArrayBuffer; weight: 600 | 700; style: "normal" }[]> | null = null;
function fonts() {
  if (!FONTS) {
    // URL littérales : webpack doit pouvoir les analyser pour embarquer les fichiers.
    const load = (u: URL) => fetch(u).then((r) => { if (!r.ok) throw new Error("font"); return r.arrayBuffer(); });
    FONTS = Promise.all([
      load(new URL("./fonts/fredoka-latin-700-normal.woff", import.meta.url)).then((data) => ({ name: "Fredoka", data, weight: 700 as const, style: "normal" as const })),
      load(new URL("./fonts/nunito-latin-600-normal.woff", import.meta.url)).then((data) => ({ name: "Nunito", data, weight: 600 as const, style: "normal" as const })),
      load(new URL("./fonts/nunito-latin-700-normal.woff", import.meta.url)).then((data) => ({ name: "Nunito", data, weight: 700 as const, style: "normal" as const })),
    ]).catch((e) => { FONTS = null; throw e; });
  }
  return FONTS;
}

/** Les lignes clés du premier tableau de l'article (sans le total), pour le visuel. */
function keyRows(a: MagArticle, lang: MagLang): { name: string; qty: string; kcal: string }[] {
  const t = a[lang].blocks.find((b) => b.type === "table");
  if (!t || t.type !== "table") return [];
  return t.rows
    .filter((r) => !/^(total|summe|gesamt)/i.test(plain(r[0])))
    .slice(0, 5)
    .map((r) => ({ name: plain(r[0]), qty: plain(r.length > 2 ? r[1] : ""), kcal: plain(r[r.length - 1]) }));
}

/** Visuel 1080×1350 pour une publication Facebook / Instagram. */
export async function magPost(a: MagArticle, lang: MagLang) {
  const l = a[lang];
  const title = plain(l.cardTitle || l.title);
  const big = title.length <= 30 ? 92 : title.length <= 48 ? 80 : 68;
  const rows = keyRows(a, lang);
  let f: Awaited<ReturnType<typeof fonts>> | undefined;
  try { f = await fonts(); } catch { f = undefined; }
  const H = f ? "Fredoka" : "sans-serif", B = f ? "Nunito" : "sans-serif";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "80px 84px 74px", background: "linear-gradient(165deg, #f4fcf6 0%, #e6f5ea 52%, #d3eddb 100%)", color: "#14301f", fontFamily: B, position: "relative" }}>
        <div style={{ position: "absolute", right: -180, top: -200, width: 640, height: 640, borderRadius: 640, background: "#34d17f", opacity: 0.16, display: "flex" }} />
        <div style={{ position: "absolute", left: -160, bottom: -220, width: 560, height: 560, borderRadius: 560, background: "#ef4a6a", opacity: 0.07, display: "flex" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
          <div style={{ display: "flex", fontFamily: H, fontSize: 34, fontWeight: 700, letterSpacing: 1, color: "#16a34a", textTransform: "uppercase" }}>{MAG_CATS[a.cat][lang]}</div>
          <div style={{ display: "flex", fontFamily: H, fontSize: big, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05, color: "#13261a" }}>{title}</div>
          {a.kcal && (
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, background: "#16a34a", borderRadius: 34, padding: "22px 34px", alignSelf: "flex-start", boxShadow: "0 18px 40px -22px rgba(20,80,44,.6)" }}>
              <div style={{ display: "flex", fontFamily: H, fontSize: 72, fontWeight: 700, color: "#ffffff", letterSpacing: -1 }}>{a.kcal.value}</div>
              <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: "#dcfce7" }}>{a.kcal.label[lang]}</div>
            </div>
          )}
          {rows.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", background: "#ffffff", borderRadius: 32, padding: "14px 34px", boxShadow: "0 18px 40px -26px rgba(20,60,40,.45)", border: "2px solid #dcefe2" }}>
              {rows.map((r, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "17px 0", borderTop: i ? "2px solid #eef4f0" : "none", gap: 20 }}>
                  <div style={{ display: "flex", flex: 1, fontSize: 34, fontWeight: 700, color: "#1f2f25" }}>{r.name}</div>
                  {r.qty && <div style={{ display: "flex", fontSize: 30, fontWeight: 600, color: "#6b7f72" }}>{r.qty}</div>}
                  <div style={{ display: "flex", width: 200, justifyContent: "flex-end", fontSize: 34, fontWeight: 700, color: "#16a34a" }}>{r.kcal}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Radish s={0.75} />
            <div style={{ display: "flex", fontFamily: H, fontSize: 60, fontWeight: 700, letterSpacing: -1, color: "#16a34a" }}>calorio</div>
          </div>
          <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: "#16a34a", background: "#ffffff", borderRadius: 999, padding: "16px 28px", border: "3px solid #cdebd7" }}>{lang === "de" ? "calorio.ch/de/magazin" : "calorio.ch/mag"}</div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350, fonts: f }
  );
}
