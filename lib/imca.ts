// imca — cœur de calcul : IMC (indice de masse corporelle) / BMI + classification OMS.
// Indicateur général — pas un avis médical (ne tient pas compte de la masse musculaire, etc.).

export type CategorieIMC =
  | "maigreur" | "normal" | "surpoids" | "obesite1" | "obesite2" | "obesite3";

export type ImcaResult = {
  imc: number;              // arrondi à 1 décimale
  categorie: CategorieIMC;
  poidsSainMin: number;     // kg (IMC 18.5)
  poidsSainMax: number;     // kg (IMC 24.9)
};

const r1 = (v: number) => Math.round(v * 10) / 10;

export function categorieIMC(imc: number): CategorieIMC {
  if (imc < 18.5) return "maigreur";
  if (imc < 25) return "normal";
  if (imc < 30) return "surpoids";
  if (imc < 35) return "obesite1";
  if (imc < 40) return "obesite2";
  return "obesite3";
}

export function computeImca(poidsKg: number, tailleCm: number): ImcaResult {
  const t = Math.max(0.5, tailleCm / 100); // m
  const imcBrut = Math.max(0, poidsKg) / (t * t);
  return {
    imc: r1(imcBrut),
    categorie: categorieIMC(imcBrut),
    poidsSainMin: r1(18.5 * t * t),
    poidsSainMax: r1(24.9 * t * t),
  };
}
