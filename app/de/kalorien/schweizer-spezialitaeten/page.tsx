import type { Metadata, Viewport } from "next";
import { SpecialitesView, specialitesMetadata } from "@/app/calories/SpecialitesView";

export const revalidate = 3600; // der Block « Im Magazin » folgt den veröffentlichten Artikeln
export const metadata: Metadata = specialitesMetadata("de");
export const viewport: Viewport = { themeColor: "#f3f7f2" };

export default function Page() {
  return <SpecialitesView lang="de" />;
}
