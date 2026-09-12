import type { Metadata } from "next";
import { TOOLS, bySlug } from "@/lib/catalog";
import { toolTagline, altLanguages } from "@/lib/i18n";
import ToolView from "../../ToolView";

const lang = "fr" as const;

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tool = bySlug(params.slug);
  if (!tool) return { title: "Outil introuvable — outils.ch" };
  const tag = toolTagline(lang, tool);
  const title = `${tool.name} — ${tag} | outils.ch`;
  const description = `${tag}. Outil ${tool.cat.toLowerCase()} gratuit, sans inscription, 100 % dans ton navigateur. ${tool.ch ? "Pensé pour la Suisse. " : ""}Ouvre ${tool.name} en un clic sur outils.ch.`;
  return {
    title, description,
    keywords: [tool.name, ...tool.tags, "outil en ligne", "gratuit", tool.cat.toLowerCase()],
    alternates: { canonical: `/o/${params.slug}`, languages: altLanguages(`/o/${params.slug}`) },
    openGraph: { title, description, type: "article", url: `https://outils.ch/o/${params.slug}` },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ToolView slug={params.slug} lang={lang} />;
}
