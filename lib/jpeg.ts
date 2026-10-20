// Conversion PNG → JPEG sans dépendance (Instagram n'accepte que le JPEG).
// - decodePng : PNG 8 bits RGB/RGBA non entrelacé (format produit par next/og), via zlib de Node.
// - encodeJpeg : JPEG baseline 4:4:4, tables standard (ITU T.81, annexe K), DCT AAN.
import { inflateSync } from "node:zlib";

export type Rgba = { width: number; height: number; data: Uint8Array };

export function decodePng(buf: Uint8Array): Rgba {
  const b = buf, dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (b.length < 8 || dv.getUint32(0) !== 0x89504e47) throw new Error("png: signature");
  let pos = 8, width = 0, height = 0, ctype = 0;
  const idat: Uint8Array[] = [];
  while (pos + 8 <= b.length) {
    const len = dv.getUint32(pos), type = String.fromCharCode(b[pos + 4], b[pos + 5], b[pos + 6], b[pos + 7]), d = b.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      width = dv.getUint32(pos + 8); height = dv.getUint32(pos + 12); ctype = d[9];
      if (d[8] !== 8 || (ctype !== 6 && ctype !== 2) || d[12] !== 0) throw new Error("png: format non pris en charge");
    } else if (type === "IDAT") idat.push(d);
    else if (type === "IEND") break;
    pos += 12 + len;
  }
  const bpp = ctype === 6 ? 4 : 3, stride = width * bpp;
  const all = new Uint8Array(idat.reduce((n, c) => n + c.length, 0));
  idat.reduce((o, c) => (all.set(c, o), o + c.length), 0);
  const raw = new Uint8Array(inflateSync(all));
  const px = new Uint8Array(stride * height);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)], src = y * (stride + 1) + 1, row = y * stride, up = row - stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[row + x - bpp] : 0, u = y ? px[up + x] : 0, c = x >= bpp && y ? px[up + x - bpp] : 0;
      let p = raw[src + x];
      if (f === 1) p += a;
      else if (f === 2) p += u;
      else if (f === 3) p += (a + u) >> 1;
      else if (f === 4) { const q = a + u - c, pa = Math.abs(q - a), pb = Math.abs(q - u), pc = Math.abs(q - c); p += pa <= pb && pa <= pc ? a : pb <= pc ? u : c; }
      px[row + x] = p & 255;
    }
  }
  if (bpp === 4) return { width, height, data: px };
  const out = new Uint8Array(width * height * 4);
  for (let i = 0, j = 0; i < px.length; i += 3, j += 4) { out[j] = px[i]; out[j + 1] = px[i + 1]; out[j + 2] = px[i + 2]; out[j + 3] = 255; }
  return { width, height, data: out };
}

const ZZ = [0, 1, 5, 6, 14, 15, 27, 28, 2, 4, 7, 13, 16, 26, 29, 42, 3, 8, 12, 17, 25, 30, 41, 43, 9, 11, 18, 24, 31, 40, 44, 53, 10, 19, 23, 32, 39, 45, 52, 54, 20, 22, 33, 38, 46, 51, 55, 60, 21, 34, 37, 47, 50, 56, 59, 61, 35, 36, 48, 49, 57, 58, 62, 63];
const QY = [16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99];
const QC = [17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99, 24, 26, 56, 99, 99, 99, 99, 99, 47, 66, 99, 99, 99, 99, 99, 99, ...Array(32).fill(99)];
// Tables de Huffman standard : nombre de codes par longueur (1..16) puis valeurs.
const DC_L_N = [0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0], DC_L_V = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const DC_C_N = [0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0], DC_C_V = DC_L_V;
const AC_L_N = [0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d];
const AC_L_V = [0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08, 0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa];
const AC_C_N = [0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77];
const AC_C_V = [0x00, 0x01, 0x02, 0x03, 0x11, 0x04, 0x05, 0x21, 0x31, 0x06, 0x12, 0x41, 0x51, 0x07, 0x61, 0x71, 0x13, 0x22, 0x32, 0x81, 0x08, 0x14, 0x42, 0x91, 0xa1, 0xb1, 0xc1, 0x09, 0x23, 0x33, 0x52, 0xf0, 0x15, 0x62, 0x72, 0xd1, 0x0a, 0x16, 0x24, 0x34, 0xe1, 0x25, 0xf1, 0x17, 0x18, 0x19, 0x1a, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa];

type Code = [code: number, len: number];
function huffTable(n: number[], v: number[]): Code[] {
  const t: Code[] = [];
  let code = 0, k = 0;
  for (let len = 1; len <= 16; len++) {
    for (let i = 0; i < n[len - 1]; i++) t[v[k++]] = [code++, len];
    code <<= 1;
  }
  return t;
}
const H = { dcL: huffTable(DC_L_N, DC_L_V), acL: huffTable(AC_L_N, AC_L_V), dcC: huffTable(DC_C_N, DC_C_V), acC: huffTable(AC_C_N, AC_C_V) };
const AAN = [1, 1.387039845, 1.306562965, 1.175875602, 1, 0.785694958, 0.5411961, 0.275899379];

function scaled(base: number[], quality: number): number[] {
  const q = Math.max(1, Math.min(100, quality));
  const s = q < 50 ? Math.floor(5000 / q) : 200 - q * 2;
  return base.map((v) => Math.max(1, Math.min(255, Math.floor((v * s + 50) / 100))));
}

export function encodeJpeg(img: Rgba, quality = 90): Uint8Array {
  const { width: w, height: h, data } = img;
  const qy = scaled(QY, quality), qc = scaled(QC, quality);
  // Diviseurs combinant quantification et facteurs AAN, dans l'ordre naturel (ligne par ligne).
  const fy = new Float64Array(64), fc = new Float64Array(64);
  for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
    const i = r * 8 + c;
    fy[i] = 1 / (qy[i] * AAN[r] * AAN[c] * 8);
    fc[i] = 1 / (qc[i] * AAN[r] * AAN[c] * 8);
  }
  const out: number[] = [];
  const w8 = (x: number) => out.push(x & 255), w16 = (x: number) => { w8(x >> 8); w8(x); };
  w16(0xffd8);
  w16(0xffe0); w16(16); [0x4a, 0x46, 0x49, 0x46, 0, 1, 1, 0].forEach(w8); w16(1); w16(1); w8(0); w8(0);
  w16(0xffdb); w16(132);
  // Tables écrites dans l'ordre zigzag.
  const zy: number[] = [], zc: number[] = [];
  for (let i = 0; i < 64; i++) { zy[ZZ[i]] = qy[i]; zc[ZZ[i]] = qc[i]; }
  w8(0); zy.forEach(w8);
  w8(1); zc.forEach(w8);
  w16(0xffc0); w16(17); w8(8); w16(h); w16(w); w8(3);
  w8(1); w8(0x11); w8(0); w8(2); w8(0x11); w8(1); w8(3); w8(0x11); w8(1);
  w16(0xffc4); w16(418);
  for (const [cls, n, v] of [[0x00, DC_L_N, DC_L_V], [0x10, AC_L_N, AC_L_V], [0x01, DC_C_N, DC_C_V], [0x11, AC_C_N, AC_C_V]] as const) {
    w8(cls); n.forEach(w8); v.forEach(w8);
  }
  w16(0xffda); w16(12); w8(3); w8(1); w8(0); w8(2); w8(0x11); w8(3); w8(0x11); w8(0); w8(0x3f); w8(0);

  let acc = 0, nb = 0;
  const bits = (code: number, len: number) => {
    acc = (acc << len) | (code & ((1 << len) - 1)); nb += len;
    while (nb >= 8) { const byte = (acc >> (nb - 8)) & 255; w8(byte); if (byte === 255) w8(0); nb -= 8; acc &= (1 << nb) - 1; }
  };
  const cat = (v: number) => { let a = Math.abs(v), n = 0; while (a) { n++; a >>= 1; } return n; };
  const put = (v: number, n: number) => bits(v < 0 ? v + (1 << n) - 1 : v, n);

  const blk = new Float64Array(64), q = new Int32Array(64);
  const block = (f: Float64Array, prev: number, dc: Code[], ac: Code[]): number => {
    // DCT 2D (AAN) sur place : lignes puis colonnes.
    for (let p = 0; p < 2; p++) for (let k = 0; k < 8; k++) {
      const o = p ? k : k * 8, s = p ? 8 : 1;
      const d0 = blk[o], d1 = blk[o + s], d2 = blk[o + 2 * s], d3 = blk[o + 3 * s], d4 = blk[o + 4 * s], d5 = blk[o + 5 * s], d6 = blk[o + 6 * s], d7 = blk[o + 7 * s];
      const t0 = d0 + d7, t7 = d0 - d7, t1 = d1 + d6, t6 = d1 - d6, t2 = d2 + d5, t5 = d2 - d5, t3 = d3 + d4, t4 = d3 - d4;
      let t10 = t0 + t3; const t13 = t0 - t3, t11 = t1 + t2; let t12 = t1 - t2;
      blk[o] = t10 + t11; blk[o + 4 * s] = t10 - t11;
      const z1 = (t12 + t13) * 0.707106781;
      blk[o + 2 * s] = t13 + z1; blk[o + 6 * s] = t13 - z1;
      t10 = t4 + t5; const t11b = t5 + t6; t12 = t6 + t7;
      const z5 = (t10 - t12) * 0.382683433, z2 = 0.5411961 * t10 + z5, z4 = 1.306562965 * t12 + z5, z3 = t11b * 0.707106781;
      const z11 = t7 + z3, z13 = t7 - z3;
      blk[o + 5 * s] = z13 + z2; blk[o + 3 * s] = z13 - z2; blk[o + s] = z11 + z4; blk[o + 7 * s] = z11 - z4;
    }
    for (let i = 0; i < 64; i++) q[ZZ[i]] = Math.round(blk[i] * f[i]);
    const diff = q[0] - prev, n = cat(diff);
    bits(dc[n][0], dc[n][1]); if (n) put(diff, n);
    let run = 0;
    for (let i = 1; i < 64; i++) {
      if (q[i] === 0) { run++; continue; }
      while (run > 15) { bits(ac[0xf0][0], ac[0xf0][1]); run -= 16; }
      const m = cat(q[i]), sym = (run << 4) | m;
      bits(ac[sym][0], ac[sym][1]); put(q[i], m); run = 0;
    }
    if (run) bits(ac[0][0], ac[0][1]);
    return q[0];
  };

  let py = 0, pcb = 0, pcr = 0;
  const Y = new Float64Array(64), CB = new Float64Array(64), CR = new Float64Array(64);
  for (let by = 0; by < h; by += 8) for (let bx = 0; bx < w; bx += 8) {
    for (let i = 0; i < 64; i++) {
      const x = Math.min(w - 1, bx + (i & 7)), y = Math.min(h - 1, by + (i >> 3)), p = (y * w + x) * 4;
      const r = data[p], g = data[p + 1], b = data[p + 2];
      Y[i] = 0.299 * r + 0.587 * g + 0.114 * b - 128;
      CB[i] = -0.168736 * r - 0.331264 * g + 0.5 * b;
      CR[i] = 0.5 * r - 0.418688 * g - 0.081312 * b;
    }
    blk.set(Y); py = block(fy, py, H.dcL, H.acL);
    blk.set(CB); pcb = block(fc, pcb, H.dcC, H.acC);
    blk.set(CR); pcr = block(fc, pcr, H.dcC, H.acC);
  }
  if (nb > 0) bits(0x7f, 8 - nb);
  w16(0xffd9);
  return Uint8Array.from(out);
}

/** Aplatit la transparence sur fond blanc (le JPEG n'a pas de canal alpha). */
export function flattenOnWhite(img: Rgba): Rgba {
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const al = d[i + 3] / 255;
    if (al < 1) { for (let k = 0; k < 3; k++) d[i + k] = Math.round(d[i + k] * al + 255 * (1 - al)); d[i + 3] = 255; }
  }
  return img;
}
