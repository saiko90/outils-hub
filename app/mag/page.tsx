import type { Viewport } from "next";
import { MagIndexView } from "./MagViews";
import { magIndexMetadata } from "./meta";

export const revalidate = 3600;
export const metadata = magIndexMetadata("fr");
export const viewport: Viewport = { themeColor: "#f3f7f2" };

export default function Page() {
  return <MagIndexView lang="fr" />;
}
