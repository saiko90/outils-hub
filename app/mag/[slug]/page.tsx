import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { MAG_ALL, magBySlug, isPublished } from "@/lib/mag";
import { MagArticleView } from "../MagViews";
import { magArticleMetadata } from "../meta";

export const revalidate = 3600;
export const dynamicParams = true;
export function generateStaticParams() {
  return MAG_ALL.filter((a) => isPublished(a)).map((a) => ({ slug: a.fr.slug }));
}
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const a = magBySlug("fr", params.slug);
  return a && isPublished(a) ? magArticleMetadata(a, "fr") : {};
}
export const viewport: Viewport = { themeColor: "#f3f7f2" };

export default function Page({ params }: { params: { slug: string } }) {
  const a = magBySlug("fr", params.slug);
  if (!a || !isPublished(a)) notFound();
  return <MagArticleView a={a} lang="fr" />;
}
