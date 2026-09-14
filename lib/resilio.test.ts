import { describe, it, expect } from "vitest";
import { lastDayOfMonth, deadlinePourEcheance, computeResilio } from "./resilio";

const isod = (d: Date) => d.toISOString().slice(0, 10);

describe("resilio — helpers de date", () => {
  it("dernier jour du mois", () => {
    expect(isod(lastDayOfMonth(2026, 9))).toBe("2026-09-30");
    expect(isod(lastDayOfMonth(2026, 2))).toBe("2026-02-28");
    expect(isod(lastDayOfMonth(2028, 2))).toBe("2028-02-29"); // bissextile
  });
  it("date limite = dernier jour du mois (échéance − préavis)", () => {
    // échéance sept, préavis 3 → fin juin
    expect(isod(deadlinePourEcheance(2026, 9, 3))).toBe("2026-06-30");
    // échéance janvier 2027, préavis 3 → fin octobre 2026 (passage d'année)
    expect(isod(deadlinePourEcheance(2027, 1, 3))).toBe("2026-10-31");
  });
});

describe("resilio — cas type (préavis 3 mois, termes mars/juin/sept)", () => {
  const r = computeResilio({
    preavisMois: 3, moisEcheances: [3, 6, 9], dateDepart: "2026-08-01", aujourdhui: "2026-06-01",
  });
  it("prochaine échéance = 30 septembre 2026, à recevoir au plus tard le 30 juin 2026", () => {
    expect(r.recommandee).not.toBeNull();
    expect(r.recommandee!.echeance).toBe("2026-09-30");
    expect(r.recommandee!.deadlineRecu).toBe("2026-06-30");
    expect(r.recommandee!.possible).toBe(true);
  });
});

describe("resilio — délai déjà dépassé → échéance suivante", () => {
  it("si la date limite de la prochaine échéance est passée, on recommande la suivante", () => {
    // départ août, mais on est déjà le 15 juillet : le délai pour le 30 sept (30 juin) est passé
    const r = computeResilio({
      preavisMois: 3, moisEcheances: [3, 6, 9], dateDepart: "2026-08-01", aujourdhui: "2026-07-15",
    });
    // 30 sept n'est plus possible → prochaine possible = 31 mars 2027 (limite 31 déc 2026)
    expect(r.recommandee!.echeance).toBe("2027-03-31");
    expect(r.recommandee!.deadlineRecu).toBe("2026-12-31");
    // la 1re listée reste 30 sept mais marquée impossible
    expect(r.prochaines[0].echeance).toBe("2026-09-30");
    expect(r.prochaines[0].possible).toBe(false);
  });
});

describe("resilio — fin de chaque mois", () => {
  it("échéances tous les mois : préavis 3 depuis un départ en janvier", () => {
    const r = computeResilio({ preavisMois: 3, moisEcheances: [], dateDepart: "2026-01-10", aujourdhui: "2025-01-01" });
    // 1re échéance ≥ 10 janvier = 31 janvier 2026, limite = 31 octobre 2025
    expect(r.prochaines[0].echeance).toBe("2026-01-31");
    expect(r.prochaines[0].deadlineRecu).toBe("2025-10-31");
  });
});
