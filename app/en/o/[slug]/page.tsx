import type { Metadata } from "next";
import { TOOLS, bySlug } from "@/lib/catalog";
import { toolTagline, catLabel, altLanguages } from "@/lib/i18n";
import ToolView from "../../../ToolView";

const lang = "en" as const;

export function generateStaticParams() {
  return TOOLS.map((t) => ({ slug: t.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const tool = bySlug(params.slug);
  if (!tool) return { title: "Tool not found — outils.ch" };
  const tag = toolTagline(lang, tool);
  const title = `${tool.name} — ${tag} | outils.ch`;
  const description = `${tag}. Free ${catLabel(lang, tool.cat).toLowerCase()} tool, no sign-up, 100% in your browser. ${tool.ch ? "Built for Switzerland. " : ""}Open ${tool.name} in one click on outils.ch.`;
  return {
    title, description,
    keywords: [tool.name, ...tool.tags, "online tool", "free", catLabel(lang, tool.cat).toLowerCase()],
    alternates: { canonical: `/en/o/${params.slug}`, languages: altLanguages(`/o/${params.slug}`) },
    openGraph: { title, description, type: "article", url: `https://outils.ch/en/o/${params.slug}`, locale: "en" },
  };
}

export default function Page({ params }: { params: { slug: string } }) {
  return <ToolView slug={params.slug} lang={lang} />;
}
