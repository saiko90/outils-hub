import localFont from "next/font/local";

// Polices de calorio auto-hébergées (fichiers variables Fredoka + Nunito, licence SIL OFL, sous-ensemble latin) :
// aucune requête vers Google depuis le navigateur du visiteur, pas de CSS bloquant, et le build ne dépend pas du réseau.
export const fredoka = localFont({ src: "./fonts/fredoka-latin-var.woff2", weight: "300 700", variable: "--font-fredoka", display: "swap" });
export const nunito = localFont({ src: "./fonts/nunito-latin-var.woff2", weight: "200 1000", variable: "--font-nunito", display: "swap" });
export const calorioFontVars = `${fredoka.variable} ${nunito.variable}`;
