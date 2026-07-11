// Minimal PNG reader (8-bit RGB / RGBA, no deps) — used by the frame-edge
// overflow detector (scripts/edge-scan.mjs). Node has no built-in image decode;
// this parses IHDR/IDAT/IEND, zlib-inflates the image data, and reverses the
// per-scanline PNG filters (None/Sub/Up/Average/Paeth). Enough to read the
// renderStill PNGs the sweep produces. Not a general PNG library.
import fs from 'node:fs';
import zlib from 'node:zlib';

export function readPng(path) {
  const buf = fs.readFileSync(path);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error(`not a PNG: ${path}`);
  let pos = 8;
  let width = 0, height = 0, bitDepth = 0, colorType = 0;
  const idat = [];
  while (pos + 8 <= buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') break;
    pos += 12 + len; // length(4) + type(4) + data + crc(4)
  }
  if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(`unsupported PNG (bitDepth=${bitDepth} colorType=${colorType}) in ${path}`);
  }
  const channels = colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const out = Buffer.alloc(height * stride);
  const paeth = (a, b, c) => {
    const p = a + b - c;
    const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };
  let rp = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[rp++];
    for (let x = 0; x < stride; x++) {
      const cur = raw[rp++];
      const a = x >= channels ? out[y * stride + x - channels] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = x >= channels && y > 0 ? out[(y - 1) * stride + x - channels] : 0;
      let val;
      switch (filter) {
        case 0: val = cur; break;
        case 1: val = cur + a; break;
        case 2: val = cur + b; break;
        case 3: val = cur + ((a + b) >> 1); break;
        case 4: val = cur + paeth(a, b, c); break;
        default: throw new Error(`bad PNG filter ${filter} in ${path}`);
      }
      out[y * stride + x] = val & 0xff;
    }
  }
  return {width, height, channels, data: out};
}
