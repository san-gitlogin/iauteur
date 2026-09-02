// FRAMEPAINT — a dependency-free RGB canvas that can write a PNG.
//
// WHY THIS EXISTS. `gen-rec-fixture.mjs` burned its frame numbers in with ffmpeg's
// `drawtext`, which needs an ffmpeg compiled `--enable-libfreetype`. That is true of the
// gyan.dev Windows build the subsystem was developed against and NOT true of, for example,
// the slim Homebrew build on the macOS machine, where the whole 7-script `test-rec-*` suite
// died at `No such filter: 'drawtext'`. A test rig that only runs on the machine it was
// written on is not a test rig.
//
// So the fixture now paints its own pixels and hands ffmpeg a PNG sequence — which is the
// SAME encode path the real capture uses (`capture.mjs` concats screencast PNGs), so the
// fixture stops depending on an ffmpeg feature the product itself never needed.
//
// Deliberately no dependency: zlib and Buffer are enough for a PNG, and adding a raster
// library to draw ten digits would be worse than the problem.
import zlib from 'node:zlib';

// A 5x7 bitmap font. Only the glyphs a fixture label can contain — uppercase, digits,
// space and dash — because the labels are uppercased before they are drawn.
const GLYPHS = {
  A: '01110 10001 10001 11111 10001 10001 10001',
  B: '11110 10001 10001 11110 10001 10001 11110',
  C: '01110 10001 10000 10000 10000 10001 01110',
  D: '11110 10001 10001 10001 10001 10001 11110',
  E: '11111 10000 10000 11110 10000 10000 11111',
  F: '11111 10000 10000 11110 10000 10000 10000',
  G: '01110 10001 10000 10111 10001 10001 01111',
  H: '10001 10001 10001 11111 10001 10001 10001',
  I: '01110 00100 00100 00100 00100 00100 01110',
  J: '00111 00010 00010 00010 00010 10010 01100',
  K: '10001 10010 10100 11000 10100 10010 10001',
  L: '10000 10000 10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10101 10001 10001 10001',
  N: '10001 11001 10101 10011 10001 10001 10001',
  O: '01110 10001 10001 10001 10001 10001 01110',
  P: '11110 10001 10001 11110 10000 10000 10000',
  Q: '01110 10001 10001 10001 10101 10010 01101',
  R: '11110 10001 10001 11110 10100 10010 10001',
  S: '01111 10000 10000 01110 00001 00001 11110',
  T: '11111 00100 00100 00100 00100 00100 00100',
  U: '10001 10001 10001 10001 10001 10001 01110',
  V: '10001 10001 10001 10001 10001 01010 00100',
  W: '10001 10001 10001 10101 10101 11011 10001',
  X: '10001 10001 01010 00100 01010 10001 10001',
  Y: '10001 10001 01010 00100 00100 00100 00100',
  Z: '11111 00001 00010 00100 01000 10000 11111',
  0: '01110 10001 10011 10101 11001 10001 01110',
  1: '00100 01100 00100 00100 00100 00100 01110',
  2: '01110 10001 00001 00010 00100 01000 11111',
  3: '11111 00010 00100 00010 00001 10001 01110',
  4: '00010 00110 01010 10010 11111 00010 00010',
  5: '11111 10000 11110 00001 00001 10001 01110',
  6: '00110 01000 10000 11110 10001 10001 01110',
  7: '11111 00001 00010 00100 01000 01000 01000',
  8: '01110 10001 10001 01110 10001 10001 01110',
  9: '01110 10001 10001 01111 00001 00010 01100',
  '-': '00000 00000 00000 11111 00000 00000 00000',
  ' ': '00000 00000 00000 00000 00000 00000 00000',
};

const GW = 5, GH = 7;

const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

const crc32 = (buf) => {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
};

const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
};

export class Frame {
  constructor(width, height, rgb = [0, 0, 0]) {
    this.w = width;
    this.h = height;
    this.px = Buffer.alloc(width * height * 3);
    this.fill(0, 0, width, height, rgb);
  }

  fill(x, y, w, h, [r, g, b]) {
    const x0 = Math.max(0, x | 0), y0 = Math.max(0, y | 0);
    const x1 = Math.min(this.w, (x + w) | 0), y1 = Math.min(this.h, (y + h) | 0);
    for (let yy = y0; yy < y1; yy++) {
      let i = (yy * this.w + x0) * 3;
      for (let xx = x0; xx < x1; xx++) {
        this.px[i++] = r; this.px[i++] = g; this.px[i++] = b;
      }
    }
  }

  /** Draw uppercase text at `scale` device pixels per font pixel. */
  text(x, y, str, scale, rgb) {
    let cx = x;
    for (const ch of String(str).toUpperCase()) {
      const rows = (GLYPHS[ch] ?? GLYPHS[' ']).split(' ');
      for (let ry = 0; ry < GH; ry++) {
        for (let rx = 0; rx < GW; rx++) {
          if (rows[ry][rx] === '1') this.fill(cx + rx * scale, y + ry * scale, scale, scale, rgb);
        }
      }
      cx += (GW + 1) * scale;
    }
    return cx;
  }

  png() {
    // One filter byte (0 = None) per scanline, then deflate. Level 9 so two runs of the
    // fixture produce byte-identical files — the determinism test compares them.
    const stride = this.w * 3;
    const raw = Buffer.alloc((stride + 1) * this.h);
    for (let y = 0; y < this.h; y++) {
      raw[y * (stride + 1)] = 0;
      this.px.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
    }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(this.w, 0);
    ihdr.writeUInt32BE(this.h, 4);
    ihdr[8] = 8;   // bit depth
    ihdr[9] = 2;   // colour type: truecolour RGB
    return Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk('IHDR', ihdr),
      chunk('IDAT', zlib.deflateSync(raw, {level: 9})),
      chunk('IEND', Buffer.alloc(0)),
    ]);
  }
}

/** '0x1e3a5f' | '#1e3a5f' | '1e3a5f' -> [r,g,b] */
export const hex = (s) => {
  const h = String(s).replace(/^0x|^#/, '');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};
