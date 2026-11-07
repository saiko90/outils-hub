import type { Metadata } from "next";
import { TOOLS, bySlug } from "@/lib/catalog";
import { catLabel, altLanguages } from "@/lib/i18n";
import { toolTitle, toolDescription } from "@/lib/seo";
import ToolView from "../../../ToolView";

const lang = "de" as const;

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tool = bySlug(params.slug);
  if (!tool) return { title: "Tool nicht gefunden — outils.ch" };
  const title = toolTitle(lang, tool);
  const description = toolDescription(lang, tool);
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
