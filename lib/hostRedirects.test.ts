import { describe, it, expect } from "vitest";
import { canonicalRedirect as r } from "./hostRedirects";

describe("canonicalRedirect", () => {
  it("ramène www.outils.ch et outils-hub.vercel.app vers outils.ch", () => {
    expect(r("www.outils.ch", "/", "")).toBe("https://outils.ch/");
    expect(r("www.outils.ch", "/o/avso", "?x=1")).toBe("https://outils.ch/o/avso?x=1");
    expect(r("outils-hub.vercel.app", "/de/o/salaro", "")).toBe("https://outils.ch/de/o/salaro");
  });

  it("ne touche pas aux autres hôtes Vercel ni à admin", () => {
    expect(r("outils-hub-git-main-saiko90.vercel.app", "/", "")).toBeNull();
    expect(r("admin.outils.ch", "/", "")).toBeNull();
    expect(r("outils.ch", "/o/avso", "")).toBeNull();
    expect(r("calorio.ch", "/calories/raclette-fromage", "")).toBeNull();
  });

  it("envoie les copies calorio d'outils.ch vers calorio.ch", () => {
    expect(r("outils.ch", "/calories/raclette-fromage", "")).toBe("https://calorio.ch/calories/raclette-fromage");
    expect(r("outils.ch", "/calories", "")).toBe("https://calorio.ch/calories");
    expect(r("outils.ch", "/recettes/raclette-valaisanne", "")).toBe("https://calorio.ch/recettes/raclette-valaisanne");
    expect(r("outils.ch", "/meilleure-app-calories", "")).toBe("https://calorio.ch/meilleure-app-calories");
    expect(r("outils.ch", "/calorio-vs-yazio/en", "")).toBe("https://calorio.ch/calorio-vs-yazio/en");
    expect(r("outils.ch", "/confidentialite-calorio", "")).toBe("https://calorio.ch/confidentialite-calorio");
    expect(r("outils.ch", "/mag/calories-soiree-raclette", "?a=b")).toBe("https://calorio.ch/mag/calories-soiree-raclette?a=b");
    expect(r("outils.ch", "/de/magazin", "")).toBe("https://calorio.ch/de/magazin");
    expect(r("www.outils.ch", "/mag", "")).toBe("https://calorio.ch/mag");
    expect(r("outils.ch", "/partenaires-calorio", "")).toBe("https://calorio.ch/partenaires");
    expect(r("outils.ch", "/mentions-legales-calorio", "")).toBe("https://calorio.ch/mentions-legales");
  });

  it("ne redirige jamais l'app, l'API ni les visuels", () => {
    expect(r("outils.ch", "/calorio", "")).toBeNull();
    expect(r("outils.ch", "/api/push-cron", "?job=lunch")).toBeNull();
    expect(r("outils.ch", "/og-calorio", "")).toBeNull();
    expect(r("outils-hub.vercel.app", "/api/stripe-webhook", "")).toBeNull();
    expect(r("outils.ch", "/magasin", "")).toBeNull();
    expect(r("outils.ch", "/c/calcul", "")).toBeNull();
  });

  it("ramène les pages indexables de www.calorio.ch vers calorio.ch, sauf la connexion de l'app", () => {
    expect(r("www.calorio.ch", "/", "")).toBe("https://calorio.ch/");
    expect(r("www.calorio.ch", "/de", "")).toBe("https://calorio.ch/de");
    expect(r("www.calorio.ch", "/en", "")).toBe("https://calorio.ch/en");
    expect(r("www.calorio.ch", "/calories/mojito", "")).toBe("https://calorio.ch/calories/mojito");
    expect(r("www.calorio.ch", "/de/magazin/kalorien-raclette-abend", "")).toBe("https://calorio.ch/de/magazin/kalorien-raclette-abend");
    expect(r("www.calorio.ch", "/calorio-vs-yazio", "")).toBe("https://calorio.ch/calorio-vs-yazio");
    expect(r("www.calorio.ch", "/calorio", "?applogin=abc")).toBeNull();
    expect(r("www.calorio.ch", "/", "?applogin=abc")).toBeNull();
    expect(r("www.calorio.ch", "/calorio", "")).toBeNull();
    expect(r("www.calorio.ch", "/api/app-login/start", "")).toBeNull();
  });
});
