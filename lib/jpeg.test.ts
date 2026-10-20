import { describe, it, expect } from "vitest";
import { deflateSync } from "node:zlib";
import { decodePng, encodeJpeg, flattenOnWhite } from "./jpeg";

const u32 = (n: number) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
// PNG RGBA minimal (filtre 0 sur chaque ligne).
function png(w: number, h: number, px: (x: number, y: number) => number[]): Uint8Array {
  const raw: number[] = [];
  for (let y = 0; y < h; y++) { raw.push(0); for (let x = 0; x < w; x++) raw.push(...px(x, y)); }
  const chunk = (t: string, d: number[]) => [...u32(d.length), ...Array.from(t, (c) => c.charCodeAt(0)), ...d, 0, 0, 0, 0];
  const ihdr = [...u32(w), ...u32(h), 8, 6, 0, 0, 0];
  const z = Array.from(new Uint8Array(deflateSync(new Uint8Array(raw))));
  return new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...chunk("IHDR", ihdr), ...chunk("IDAT", z), ...chunk("IEND", [])]);
}

describe("conversion PNG → JPEG (visuels Instagram)", () => {
  it("décode un PNG RGBA", () => {
    const img = decodePng(png(3, 2, (x, y) => [x * 50, y * 100, 7, 255]));
    expect([img.width, img.height]).toEqual([3, 2]);
    expect(Array.from(img.data.slice(4 * 4, 4 * 4 + 4))).toEqual([50, 100, 7, 255]);
  });
  it("aplatit la transparence sur du blanc", () => {
    const img = flattenOnWhite(decodePng(png(1, 1, () => [0, 0, 0, 0])));
    expect(Array.from(img.data)).toEqual([255, 255, 255, 255]);
  });
  it("produit un JPEG baseline valide aux bonnes dimensions", () => {
    const j = encodeJpeg(decodePng(png(20, 13, (x, y) => [x * 12, y * 19, 128, 255])), 90);
    expect([j[0], j[1]]).toEqual([0xff, 0xd8]);
    expect([j[j.length - 2], j[j.length - 1]]).toEqual([0xff, 0xd9]);
    let sof = -1;
    for (let i = 0; i < j.length - 1; i++) if (j[i] === 0xff && j[i + 1] === 0xc0) { sof = i; break; }
    expect(sof).toBeGreaterThan(0);
    expect([(j[sof + 5] << 8) | j[sof + 6], (j[sof + 7] << 8) | j[sof + 8]]).toEqual([13, 20]);
  });
});
