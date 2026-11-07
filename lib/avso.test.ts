import { describe, it, expect } from "vitest";
import { validateAvs, avsCheckDigit, formatAvs, normalizeAvs } from "./avso";

describe("avso — numéro AVS (AHVN13)", () => {
  it("clé EAN-13 calculée par la formule", () => {
    // 7×1+5×3+6×1+1×3+2×1+3×3+4×1+5×3+6×1+7×3+8×1+9×3 = 123 → (10 − 3) % 10 = 7
    expect(avsCheckDigit("756123456789")).toBe(7);
    expect(avsCheckDigit("756921707698")).toBe(5);
  });
  it("numéros valides, quel que soit le format saisi", () => {
    for (const n of ["756.1234.5678.97", "7561234567897", " 756 1234 5678 97 ", "756.9217.0769.85"]) {
      const r = validateAvs(n);
      expect(r.valid, n).toBe(true);
    }
    const r = validateAvs("7561234567897");
    if (r.valid) expect(r.formatted).toBe("756.1234.5678.97");
  });
  it("numéros invalides", () => {
    const bad = validateAvs("756.1234.5678.98");
    expect(bad.valid).toBe(false);
    if (!bad.valid) { expect(bad.error).toBe("checksum"); expect(bad.expected).toBe(7); }
    const pre = validateAvs("755.1234.5678.97");
    if (!pre.valid) expect(pre.error).toBe("prefix");
    const len = validateAvs("756.1234.5678.9");
    if (!len.valid) expect(len.error).toBe("length");
    expect(validateAvs("").valid).toBe(false);
  });
  it("normalise et formate", () => {
    expect(normalizeAvs("756.1234-5678 97")).toBe("7561234567897");
    expect(formatAvs("123")).toBe("123");
  });
});
