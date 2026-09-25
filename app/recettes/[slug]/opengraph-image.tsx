import { calorioOg, CALORIO_OG_SIZE, CALORIO_OG_TYPE } from "@/lib/calorioOg";
import { recetteBySlug, recetteNutri } from "@/lib/calorio";

export const size = CALORIO_OG_SIZE;
export const contentType = CALORIO_OG_TYPE;
export const alt = "Recette calorio";

export default function Image({ params }: { params: { slug: string } }) {
  const rec = recetteBySlug(params.slug);
  if (!rec) return calorioOg({ title: "Recettes calorio", subtitle: "Calories et macros de recettes simples" });
  const n = recetteNutri(rec);
  return calorioOg({
    title: rec.nom.fr,
    subtitle: `${n.parPortion.prot} g protéines · ${n.parPortion.gluc} g glucides · ${n.parPortion.lip} g lipides · ${rec.temps} min`,
    badge: `${n.parPortion.kcal} kcal / portion`,
    kicker: "calorio.ch/recettes",
  });
}
