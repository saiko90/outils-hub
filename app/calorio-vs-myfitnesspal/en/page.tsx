import type { Metadata, Viewport } from "next";
import VsView from "../../VsView";

const BASE = "https://calorio.ch/calorio-vs-myfitnesspal";
const CANON = `${BASE}/en`;

export const metadata: Metadata = {
  title: "calorio vs MyFitnessPal: the free, ad-free alternative (2026)",
  description:
    "MyFitnessPal moved barcode scanning behind the paywall and shows ads at $80–100/year. calorio keeps scanning free, no ads, your data private, and AI nutrition coaching at a fair price. Honest comparison.",
  alternates: {
    canonical: CANON,
    languages: { fr: BASE, en: CANON },
  },
  openGraph: {
    title: "calorio vs MyFitnessPal — the free, ad-free, honest alternative",
    description: "Free scanning, no ads, private data, AI coach at a fair price. The comparison vs MyFitnessPal.",
    url: CANON,
    type: "article",
    siteName: "calorio",
  },
};

export const viewport: Viewport = { themeColor: "#f3f7f2" };

export default function Page() {
  return <VsView lang="en" />;
}
