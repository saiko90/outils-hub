import type { Metadata, Viewport } from "next";
import { MagMethodView } from "@/app/mag/MagViews";
import { methodeMetadata } from "@/app/mag/meta";

export const metadata: Metadata = methodeMetadata("de");
export const viewport: Viewport = { themeColor: "#f3f7f2" };

export default function Page() {
  return <MagMethodView lang="de" />;
}
