import { describe, it, expect } from "vitest";
import { mergeJournal, mergePesees, mergeDayMap, mergeTombstones } from "./syncMerge";

const L = (key: string, g = 100) => ({ key, grammes: g, food: { nom: key } });

describe("mergeJournal", () => {
  it("un nouvel appareil au journal vide n'efface pas le cloud", () => {
    const cloud = { "2026-09-20": [L("a")], "2026-09-21": [L("b")] };
    const r = mergeJournal({}, {}, cloud, { "2026-09-20": 5, "2026-09-21": 6 });
    expect(r.journal).toEqual(cloud);
  });
  it("garde les jours présents d'un seul côté", () => {
    const r = mergeJournal({ "2026-09-25": [L("x")] }, { "2026-09-25": 10 }, { "2026-09-24": [L("y")] }, { "2026-09-24": 9 });
    expect(Object.keys(r.journal).sort()).toEqual(["2026-09-24", "2026-09-25"]);
  });
  it("le côté le plus récent gagne quand les deux ont un horodatage", () => {
    const r1 = mergeJournal({ d: [L("old")] }, { d: 100 }, { d: [L("new")] }, { d: 200 });
    expect(r1.journal.d).toEqual([L("new")]);
    expect(r1.meta.d).toBe(200);
    const r2 = mergeJournal({ d: [L("mine")] }, { d: 300 }, { d: [L("theirs")] }, { d: 200 });
    expect(r2.journal.d).toEqual([L("mine")]);
  });
  it("une suppression récente est respectée (pas de résurrection)", () => {
    const r = mergeJournal({ d: [] }, { d: 500 }, { d: [L("deleted")] }, { d: 400 });
    expect(r.journal.d).toEqual([]);
  });
  it("le côté horodaté gagne contre une vieille copie sans horodatage", () => {
    const r = mergeJournal({ d: [L("a")] }, { d: 500 }, { d: [L("a"), L("supprimé")] }, {});
    expect(r.journal.d).toEqual([L("a")]);
    const r2 = mergeJournal({ d: [L("a"), L("vieux")] }, {}, { d: [L("a")] }, { d: 600 });
    expect(r2.journal.d).toEqual([L("a")]);
  });
  it("sans aucun horodatage : union dédoublonnée par clé", () => {
    const r = mergeJournal({ d: [L("a"), L("b")] }, {}, { d: [L("b"), L("c")] }, {});
    expect((r.journal.d as { key: string }[]).map((l) => l.key)).toEqual(["a", "b", "c"]);
  });
});

describe("mergeDayMap (eau, séances)", () => {
  it("eau sans horodatage : on garde le maximum", () => {
    const r = mergeDayMap<number>({ d: 3 }, {}, { d: 5 }, {}, (a, b) => Math.max(a, b));
    expect(r.data.d).toBe(5);
  });
  it("eau horodatée : la plus récente gagne même si plus petite", () => {
    const r = mergeDayMap<number>({ d: 2 }, { d: 900 }, { d: 5 }, { d: 100 }, (a, b) => Math.max(a, b));
    expect(r.data.d).toBe(2);
  });
});

describe("mergePesees", () => {
  it("union par date, local prioritaire, trié", () => {
    const r = mergePesees([{ date: "2026-09-02", poids: 80 }], [{ date: "2026-09-01", poids: 81 }, { date: "2026-09-02", poids: 79 }]);
    expect(r).toEqual([{ date: "2026-09-01", poids: 81 }, { date: "2026-09-02", poids: 80 }]);
  });
  it("une pesée supprimée ne revient pas du cloud", () => {
    const r = mergePesees([], [{ date: "2026-09-01", poids: 81, at: 100 }], { "2026-09-01": 200 });
    expect(r).toEqual([]);
  });
  it("une pesée ressaisie après suppression est conservée", () => {
    const r = mergePesees([{ date: "2026-09-01", poids: 80, at: 300 }], [], { "2026-09-01": 200 });
    expect(r).toHaveLength(1);
  });
  it("tombstones : union au plus récent", () => {
    expect(mergeTombstones({ a: 1, b: 5 }, { a: 3, c: 2 })).toEqual({ a: 3, b: 5, c: 2 });
  });
});
