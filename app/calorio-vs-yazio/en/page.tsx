import type { Metadata, Viewport } from "next";
import VsView from "../../VsView";

const BASE = "https://calorio.ch/calorio-vs-yazio";
const CANON = `${BASE}/en`;

export const metadata: Metadata = {
  title: "calorio vs YAZIO: the free, ad-free alternative with an AI coach (2026)",
  description:
    "YAZIO moved barcode scanning to PRO and shows ads; PRO costs ~$47.90/year. calorio keeps scanning free, no ads, an AI nutrition coach, at CHF 39/year. Honest comparison.",
  alternates: { canonical: CANON, languages: { fr: BASE, en: CANON } },
  openGraph: {
    title: "calorio vs YAZIO — free, ad-free, with an AI coach",
    description: "Free scanning, no ads, AI nutrition coach at a fair price. The comparison vs YAZIO.",
    url: CANON, type: "article", siteName: "calorio",
  },
};

export const viewport: Viewport = { themeColor: "#f3f7f2" };

export default function Page() {
  return <VsView lang="en" comp="yazio" />;
}
