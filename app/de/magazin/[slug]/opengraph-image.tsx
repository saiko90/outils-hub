import { CALORIO_OG_SIZE, CALORIO_OG_TYPE } from "@/lib/calorioOg";
import { magBySlug } from "@/lib/mag";
import { magOg } from "@/lib/magOg";

export const size = CALORIO_OG_SIZE;
export const contentType = CALORIO_OG_TYPE;
export const alt = "Das calorio Magazin";
export default function Image({ params }: { params: { slug: string } }) {
  return magOg(magBySlug("de", params.slug), "de");
}
