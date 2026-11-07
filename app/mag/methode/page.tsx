import type { Metadata, Viewport } from "next";
import { MagMethodView } from "../MagViews";
import { methodeMetadata } from "../meta";

export const metadata: Metadata = methodeMetadata("fr");
export const viewport: Viewport = { themeColor: "#f3f7f2" };

export default function Page() {
  return <MagMethodView lang="fr" />;
}
