import { describe, it, expect } from "vitest";
import { merge3, merge3Value, mergeDoc, emptyDoc, flattenDays, unflattenDays, stable, type SyncDoc } from "./syncMerge";

const L = (key: string, g = 100) => ({ key, grammes: g, food: { nom: key } });
const doc = (p: Partial<SyncDoc>): SyncDoc => ({ ...emptyDoc(), ...p });
const keys = (d: SyncDoc, day: string) => (d.journal[day] || []).map((l) => (l as { key: string }).key);

describe("stable", () => {
  it("ignore l'ordre des clés (jsonb)", () => {
    expect(stable({ a: 1, b: { c: 2, d: 3 } })).toBe(stable({ b: { d: 3, c: 2 }, a: 1 }));
  });
});

describe("merge3", () => {
  const M = (o: Record<string, number>) => new Map(Object.entries(o));
  it("ajouts des deux côtés conservés", () => {
    expect(Object.fromEntries(merge3(M({ a: 1 }), M({ a: 1, b: 2 }), M({ a: 1, c: 3 })))).toEqual({ a: 1, b: 2, c: 3 });
  });
  it("suppression d'un côté respectée si l'autre n'a pas modifié", () => {
    expect(Object.fromEntries(merge3(M({ a: 1, b: 2 }), M({ a: 1 }), M({ a: 1, b: 2 })))).toEqual({ a: 1 });
    expect(Object.fromEntries(merge3(M({ a: 1, b: 2 }), M({ a: 1, b: 2 }), M({ a: 1 })))).toEqual({ a: 1 });
  });
  it("modification d'un seul côté gagne", () => {
    expect(Object.fromEntries(merge3(M({ a: 1 }), M({ a: 1 }), M({ a: 5 })))).toEqual({ a: 5 });
    expect(Object.fromEntries(merge3(M({ a: 1 }), M({ a: 7 }), M({ a: 1 })))).toEqual({ a: 7 });
  });
  it("modifié des deux côtés → l'appareil gagne", () => {
    expect(Object.fromEntries(merge3(M({ a: 1 }), M({ a: 7 }), M({ a: 5 })))).toEqual({ a: 7 });
  });
  it("sans base : union", () => {
    expect(Object.fromEntries(merge3(null, M({ a: 1 }), M({ b: 2 })))).toEqual({ a: 1, b: 2 });
  });
});

describe("mergeDoc — scénario de l'audit (deux appareils, même jour)", () => {
  it("téléphone et ordinateur ajoutent au même jour : rien n'est perdu", () => {
    const D = "2026-09-26";
    // 1) Le téléphone (A) ajoute du pain blanc et synchronise.
    const cloud1 = mergeDoc(null, doc({ journal: { [D]: [L("pain-blanc")] } }), emptyDoc());
    const baseA = cloud1;
    // 2) L'ordinateur (B), sans base, ajoute du pain complet puis synchronise.
    const cloud2 = mergeDoc(null, doc({ journal: { [D]: [L("pain-complet")] } }), cloud1);
    const baseB = cloud2;
    expect(keys(cloud2, D).sort()).toEqual(["pain-blanc", "pain-complet"]);
    // 3) Le téléphone ajoute des pâtes (il ne voyait que le pain blanc) et synchronise.
    const cloud3 = mergeDoc(baseA, doc({ journal: { [D]: [L("pain-blanc"), L("pates")] } }), cloud2);
    expect(keys(cloud3, D).sort()).toEqual(["pain-blanc", "pain-complet", "pates"]);
    // 4) L'ordinateur supprime le pain blanc : la suppression part, le reste reste.
    const cloud4 = mergeDoc(baseB, doc({ journal: { [D]: [L("pain-complet")] } }), cloud3);
    expect(keys(cloud4, D).sort()).toEqual(["pain-complet", "pates"]);
  });
  it("modification des grammes d'un seul côté", () => {
    const D = "d";
    const base = doc({ journal: { [D]: [L("a", 100)] } });
    const r = mergeDoc(base, doc({ journal: { [D]: [L("a", 100)] } }), doc({ journal: { [D]: [L("a", 250)] } }));
    expect((r.journal[D][0] as { grammes: number }).grammes).toBe(250);
  });
  it("un aliment perso supprimé ne revient pas", () => {
    const base = doc({ foods: [{ id: "f1" }, { id: "f2" }] });
    const r = mergeDoc(base, doc({ foods: [{ id: "f2" }] }), doc({ foods: [{ id: "f1" }, { id: "f2" }] }));
    expect(r.foods.map((f) => f.id)).toEqual(["f2"]);
  });
  it("une pesée supprimée ne revient pas", () => {
    const p = { date: "2026-09-01", poids: 80 };
    const r = mergeDoc(doc({ pesees: [p] }), doc({ pesees: [] }), doc({ pesees: [p] }));
    expect(r.pesees).toEqual([]);
  });
  it("profil : sans base le cloud fait foi, ensuite la modification la plus récente d'un côté gagne", () => {
    const acc = { sexe: "femme", poids: 62 };
    expect(merge3Value(false, undefined, { sexe: "homme", poids: 80 }, acc)).toEqual(acc);
    expect(merge3Value(true, acc, acc, { ...acc, poids: 61 })).toEqual({ ...acc, poids: 61 });
    expect(merge3Value(true, acc, { ...acc, poids: 60 }, acc)).toEqual({ ...acc, poids: 60 });
  });
  it("anciennes séances identiques sans identifiant : distinguées par leur rang", () => {
    const s = { sportId: "velo", minutes: 30 };
    const m = flattenDays({ d: [s, s] });
    expect(m.size).toBe(2);
    expect(unflattenDays(m).d).toHaveLength(2);
  });
  it("trophées : union ; record de série : maximum", () => {
    const r = mergeDoc(null, doc({ trophies: { a: 1 }, streakBest: 12 }), doc({ trophies: { b: 2 }, streakBest: 30 }));
    expect(r.trophies).toEqual({ a: 1, b: 2 });
    expect(r.streakBest).toBe(30);
  });
});
