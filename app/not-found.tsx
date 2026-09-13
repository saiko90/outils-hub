import type { Metadata } from "next";
import Link from "next/link";
import { TOOLS, bySlug, CAT_SLUG, CAT_EMOJI } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Page introuvable (404) — outils.ch",
  description: "Cette page n'existe pas. Retourne à la boîte à outils suisse : micro-outils gratuits.",
  robots: { index: false, follow: true },
};

const POPULAR_CATS = ["Suisse", "Dev", "Données"];
const FEATURED = ["facturama", "tvaflash", "paletto", "jsono"];

export default function NotFound() {
  const cats = POPULAR_CATS.filter((c) => CAT_SLUG[c]);
  const tools = FEATURED.map((s) => bySlug(s)).filter(Boolean).slice(0, 4);

  return (
    <>
      <div className="fx" aria-hidden>
        <div className="aurora a1" /><div className="aurora a2" /><div className="aurora a3" /><div className="aurora a4" />
      </div>
      <div className="grid-fx" aria-hidden />

      <main className="nf">
        <div className="nf-code" aria-hidden>404</div>
        <h1 className="nf-title">Cette page a filé…</h1>
        <p className="nf-lead">
          La page que tu cherches n'existe pas (ou plus). Pas de panique — la boîte à outils est juste là.
        </p>

        <Link href="/" className="nf-home">← Retour à outils.ch</Link>

        <div className="nf-cats">
          {cats.map((c) => (
            <Link key={c} href={`/c/${CAT_SLUG[c]}`} className="nf-chip">
              {CAT_EMOJI[c]} {c}
            </Link>
          ))}
        </div>

        {tools.length > 0 && (
          <section className="nf-tools" aria-label="Outils populaires">
            <div className="nf-tools-h">Outils populaires</div>
            <div className="nf-grid">
              {tools.map((t) => t && (
                <Link key={t.slug} href={`/o/${t.slug}`} className="nf-card">
                  <span className="nf-logo" style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}>
                    {t.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="nf-card-t"><b>{t.name}</b></span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <footer className="nf-foot">
          outils.ch · {TOOLS.length} outils gratuits · <span aria-hidden>🇨🇭</span> fait en Suisse
        </footer>
      </main>
    </>
  );
}
