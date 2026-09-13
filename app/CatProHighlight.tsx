import Link from "next/link";
import { toolsByCat, isPro, type Tool } from "@/lib/catalog";
import { type Lang, langPrefix, toolTagline, t as tr } from "@/lib/i18n";

/**
 * Bloc « Outils métier pros » en tête de la page catégorie Suisse.
 * Canalise le trafic organique vers les outils qui portent le revenu (facturama & co).
 */
export default function CatProHighlight({ cat, lang }: { cat: string; lang: Lang }) {
  if (cat !== "Suisse") return null;
  const pros: Tool[] = toolsByCat(cat).filter((t) => isPro(t.slug));
  if (pros.length === 0) return null;
  const p = langPrefix(lang);

  return (
    <section className="catpro" aria-labelledby="catpro-h">
      <div className="catpro-head">
        <span className="catpro-badge">🇨🇭 Pro</span>
        <div>
          <h2 id="catpro-h">{tr(lang, "catProTitle")}</h2>
          <p>{tr(lang, "catProSub")}</p>
        </div>
      </div>
      <div className="catpro-grid">
        {pros.map((t) => (
          <Link key={t.slug} href={`${p}/o/${t.slug}`} className="catpro-card">
            <span className="catpro-logo" style={{ background: `linear-gradient(135deg, ${t.from}, ${t.to})` }}>
              {t.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="catpro-txt"><b>{t.name}</b><small>{toolTagline(lang, t)}</small></span>
          </Link>
        ))}
      </div>
    </section>
  );
}
