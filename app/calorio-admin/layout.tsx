import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "calorio · Admin",
  description: "Tableau de bord privé de calorio.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#12733a" };

export default function CalorioAdminLayout({ children }: { children: ReactNode }) {
  return children;
}
