import { describe, expect, it } from "vitest";
import { partnerRedirect } from "./partnerLinks";

describe("partnerRedirect", () => {
  it("alias nommés et codes directs", () => {
    expect(partnerRedirect("/anne")).toBe("/?code=ANNE20&utm_source=partenaire&utm_medium=anne");
    expect(partnerRedirect("/Anne/")).toBe("/?code=ANNE20&utm_source=partenaire&utm_medium=anne");
    expect(partnerRedirect("/ANNE20")).toBe("/?code=ANNE20&utm_source=partenaire&utm_medium=anne20");
    expect(partnerRedirect("/anouchka")).toContain("code=ANOUCHKA20");
  });
  it("ne touche pas aux pages existantes", () => {
    for (const p of ["/", "/calorio", "/mag", "/recettes", "/calories", "/partenaires", "/de", "/mag/calories-soiree-raclette", "/calorio-vs-yazio", "/x20/y"]) {
      expect(partnerRedirect(p)).toBeNull();
    }
  });
});
