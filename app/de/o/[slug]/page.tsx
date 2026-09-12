import type { Metadata } from "next";
import { TOOLS, bySlug } from "@/lib/catalog";
import { toolTagline, catLabel, altLanguages } from "@/lib/i18n";
import ToolView from "../../../ToolView";

const lang = "de" as const;

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tool = bySlug(params.slug);
  if (!tool) return { title: "Tool nicht gefunden — outils.ch" };
  const tag = toolTagline(lang, tool);
  const title = `${tool.name} — ${tag} | outils.ch`;
  const description = `${tag}. Gratis ${catLabel(lang, tool.cat)}-Tool, ohne Anmeldung, 100 % im Browser. ${tool.ch ? "Für die Schweiz gedacht. " : ""}${tool.name} mit einem Klick öffnen auf outils.ch.`;
  return {
    title, description,
    keywords: [tool.name, ...tool.tags, "online tool", "gratis", catLabel(lang, tool.cat).toLowerCase()],
    alternates: { canonical: `/de/o/${params.slug}`, languages: altLanguages(`/o/${params.slug}`) },
    openGraph: { title, description, type: "article", url: `https://outils.ch/de/o/${params.slug}`, locale: "de_CH" },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ToolView slug={params.slug} lang={lang} />;
}
