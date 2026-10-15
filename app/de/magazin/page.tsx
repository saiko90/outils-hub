import type { Viewport } from "next";
import { MagIndexView } from "@/app/mag/MagViews";
import { magIndexMetadata } from "@/app/mag/meta";

export const revalidate = 3600;
export const metadata = magIndexMetadata("de");
export const viewport: Viewport = { themeColor: "#f3f7f2" };

export default function Page() {
  return <MagIndexView lang="de" />;
}
