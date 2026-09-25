import { calorioOg } from "@/lib/calorioOg";

// Image de partage de calorio.ch (réseaux sociaux, WhatsApp, résultats enrichis). ?lang=fr|de|en
export const runtime = "edge";

const T = {
  fr: { title: "Compte tes calories, sans te prendre la tête.", subtitle: "Journal, scan de code-barres, suivi du poids et coach IA. Gratuit, sans pub.", badge: "Gratuit" },
  de: { title: "Kalorien zählen, ganz ohne Stress.", subtitle: "Tagebuch, Barcode-Scan, Gewichtsverlauf und KI-Coach. Gratis, ohne Werbung.", badge: "Gratis" },
  en: { title: "Count your calories, without the headache.", subtitle: "Food log, barcode scanning, weight tracking and AI coach. Free, no ads.", badge: "Free" },
} as const;

export function GET(req: Request) {
  const l = new URL(req.url).searchParams.get("lang");
  const c = l === "de" ? T.de : l === "en" ? T.en : T.fr;
  const res = calorioOg({ title: c.title, subtitle: c.subtitle, badge: c.badge });
  res.headers.set("cache-control", "public, max-age=86400, s-maxage=604800, immutable");
  return res;
}
