import { describe, it, expect } from "vitest";
import { createHash } from "crypto";
import { APP_LOGIN_TTL_MS, codeFromHash, isHex64, parsePendingApp } from "./appLogin";

const H = createHash("sha256").update("secret-de-test").digest("hex");

describe("Connexion de l'app via le navigateur", () => {
  it("n'accepte que des empreintes sha256 hexadécimales", () => {
    expect(isHex64(H)).toBe(true);
    expect(isHex64(H.toUpperCase())).toBe(false);
    expect(isHex64(H.slice(1))).toBe(false);
    expect(isHex64("x".repeat(64))).toBe(false);
    expect(isHex64(undefined)).toBe(false);
  });
  it("code à 4 chiffres identique des deux côtés", () => {
    expect(codeFromHash(H)).toMatch(/^\d{4}$/);
    expect(codeFromHash(H)).toBe(codeFromHash(H));
    expect(codeFromHash("0000000a" + "0".repeat(56))).toBe("0010");
  });
  it("demande en attente : valide 10 minutes, ensuite oubliée", () => {
    const now = 1_800_000_000_000;
    expect(parsePendingApp(JSON.stringify({ h: H, t: now - 60_000 }), now)).toEqual({ h: H, code: codeFromHash(H) });
    expect(parsePendingApp(JSON.stringify({ h: H, t: now - APP_LOGIN_TTL_MS - 1 }), now)).toBeNull();
    expect(parsePendingApp(JSON.stringify({ h: "abc", t: now }), now)).toBeNull();
    expect(parsePendingApp("pas du json", now)).toBeNull();
    expect(parsePendingApp(null, now)).toBeNull();
  });
});
