import type { Metadata, Viewport } from "next";
import VsView from "../../VsView";

const BASE = "https://calorio.ch/calorio-vs-lifesum";
const CANON = `${BASE}/en`;

export const metadata: Metadata = {
  title: "calorio vs Lifesum: free macros, no ads, fair price (2026)",
  description:
    "Lifesum keeps macro tracking behind Premium (up to $99.99/year). calorio shows your macros for free, no ads, an AI nutrition coach, at CHF 39/year. Honest comparison.",
  alternates: { canonical: CANON, languages: { fr: BASE, en: CANON } },
  openGraph: {
    title: "calorio vs Lifesum — free macros, no ads",
    description: "Free macros, no ads, AI coach at a fair price. The comparison vs Lifesum.",
    url: CANON, type: "article", siteName: "calorio",
  },
};

export const viewport: Viewport = { themeColor: "#f3f7f2" };

export default function Page() {
  return <VsView lang="en" comp="lifesum" />;
}
