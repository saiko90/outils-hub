import { CALORIO_OG_SIZE, CALORIO_OG_TYPE } from "@/lib/calorioOg";
import { magOg } from "@/lib/magOg";

export const size = CALORIO_OG_SIZE;
export const contentType = CALORIO_OG_TYPE;
export const alt = "Das calorio Magazin";
export default function Image() {
  return magOg(undefined, "de");
}
