import type { Metadata, Viewport } from "next";
import { SpecialitesView, specialitesMetadata } from "../SpecialitesView";

export const revalidate = 3600; // le bloc « Dans le Mag » suit les articles publiés
export const metadata: Metadata = specialitesMetadata("fr");
export const viewport: Viewport = { themeColor: "#f3f7f2" };

export default function Page() {
  return <SpecialitesView lang="fr" />;
}
