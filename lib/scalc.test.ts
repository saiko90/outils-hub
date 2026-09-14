import { describe, it, expect } from "vitest";
import { evaluate, evaluateSafe } from "./scalc";

describe("scalc — priorité & opérateurs", () => {
  it("multiplication avant addition", () => expect(evaluate("2+3*4")).toBe(14));
  it("parenthèses", () => expect(evaluate("(2+3)*4")).toBe(20));
  it("puissance", () => expect(evaluate("2^10")).toBe(1024));
  it("puissance droite-associative", () => expect(evaluate("2^2^3")).toBe(256));
  it("moins unaire", () => expect(evaluate("-3+5")).toBe(2));
  it("division", () => expect(evaluate("10/4")).toBe(2.5));
});

describe("scalc — fonctions & constantes", () => {
  it("sqrt", () => expect(evaluate("sqrt(16)")).toBe(4));
  it("log base 10", () => expect(evaluate("log(1000)")).toBe(3));
  it("ln(e) = 1", () => expect(evaluate("ln(e)")).toBeCloseTo(1, 10));
  it("sin(30°) = 0.5", () => expect(evaluate("sin(30)", { deg: true })).toBeCloseTo(0.5, 10));
  it("cos(0) = 1", () => expect(evaluate("cos(0)", { deg: true })).toBeCloseTo(1, 10));
  it("pi", () => expect(evaluate("pi")).toBeCloseTo(Math.PI, 10));
  it("factorielle", () => expect(evaluate("5!")).toBe(120));
  it("pourcentage : 200*5% = 10", () => expect(evaluate("200*5%")).toBe(10));
});

describe("scalc — erreurs", () => {
  it("expression invalide → erreur", () => {
    expect(() => evaluate("2++")).toThrow();
    expect(() => evaluate("sqrt(")).toThrow();
  });
  it("evaluateSafe ne lève pas", () => {
    expect(evaluateSafe("2+2").text).toBe("4");
    expect(evaluateSafe("bad(").ok).toBe(false);
  });
});
