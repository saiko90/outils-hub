import { describe, it, expect } from "vitest";
import { alreadyPosted, captionKey, inWindow, magForDay, postImageUrls, zurichHour } from "./magSocial";
import type { MagArticle } from "./mag";

const art = (id: string, date: string, social?: string) =>
  ({ id, date, cat: "leger", fr: { slug: `${id}-fr`, title: "t", description: "", intro: "", blocks: [], social }, de: { slug: `${id}-de`, title: "t", description: "", intro: "", blocks: [] } }) as unknown as MagArticle;

describe("Mag : publication réseaux sociaux", () => {
  it("ne retient que les articles du jour avec une légende", () => {
    const all = [art("a", "2026-10-25", "Soupe 🎃\n\ntexte"), art("b", "2026-10-25"), art("c", "2026-10-22", "x")];
    expect(magForDay("2026-10-25", all).map((a) => a.id)).toEqual(["a"]);
  });
  it("repère une publication déjà faite par sa première ligne", () => {
    const k = captionKey("\nSoupe de courge : un vrai repas à 425 kcal 🎃\n\nUn grand bol…");
    expect(k).toBe("Soupe de courge : un vrai repas à 425 kcal 🎃");
    expect(alreadyPosted(k, [undefined, "Autre chose", "Soupe de courge : un vrai repas à 425 kcal 🎃\n\n…"])).toBe(true);
    expect(alreadyPosted(k, ["Une fondue moitié-moitié, combien de calories ? 🫕"])).toBe(false);
    expect(alreadyPosted("", ["x"])).toBe(false);
  });
  it("publie seulement entre 18h et 21h à Zurich (heure d'été et d'hiver)", () => {
    // 25.10.2026 : passage à l'heure d'hiver. 16:30 UTC le 24 = 18:30 (été) ; 17:30 UTC le 26 = 18:30 (hiver).
    expect(zurichHour(new Date("2026-10-24T16:30:00Z"))).toBe(18);
    expect(inWindow(18, new Date("2026-10-24T16:30:00Z"))).toBe(true);
    expect(inWindow(18, new Date("2026-10-26T16:30:00Z"))).toBe(false);
    expect(inWindow(18, new Date("2026-10-26T17:30:00Z"))).toBe(true);
  });
  it("donne le visuel PNG et JPEG de l'article", () => {
    expect(postImageUrls(art("soupe", "2026-10-25", "x"))).toEqual({
      png: "https://calorio.ch/mag/soupe-fr/image?lang=fr&format=post",
      jpg: "https://calorio.ch/mag/soupe-fr/post.jpg",
    });
  });
});
