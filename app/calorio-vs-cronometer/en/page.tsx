import type { Metadata, Viewport } from "next";
import VsView from "../../VsView";

const BASE = "https://calorio.ch/calorio-vs-cronometer";
const CANON = `${BASE}/en`;

export const metadata: Metadata = {
  title: "calorio vs Cronometer: simpler, with an AI coach and Swiss products (2026)",
  description:
    "Cronometer is thorough on micronutrients but dense, with ads, and Gold costs ~$54.99/year. calorio is simple, ad-free, with an AI coach and Migros/Coop products, at CHF 39/year. Honest comparison.",
  alternates: { canonical: CANON, languages: { fr: BASE, en: CANON } },
  openGraph: {
    title: "calorio vs Cronometer — simple, ad-free, AI coach",
    description: "Simple day to day, no ads, AI nutrition coach and Swiss products. The comparison vs Cronometer.",
    url: CANON, type: "article", siteName: "calorio",
  },
};

export const viewport: Viewport = { themeColor: "#f3f7f2" };

export default function Page() {
  return <VsView lang="en" comp="cronometer" />;
}
