// Throwaway: generate license-safe SYNTHETIC demo clips for media-family fixtures.
// Remotion's bundled ffmpeg is stripped (no lavfi / no rawvideo demuxer), but it
// HAS image2 + png decode + wav demuxer + libx264/aac. So we hand-encode PNG
// frames and a WAV tone in Node (fully deterministic) and mux via ffmpeg.
// Provenance: 100% synthetic, no copyright, no real footage/faces.
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';

const FF = 'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe';
const OUT = 'public/assets/video';
fs.mkdirSync(OUT, {recursive: true});

const W = 480, H = 270, FPS = 30, SECS = 3, N = FPS * SECS;

// ── minimal PNG encoder (truecolor RGB, 8-bit) ──
const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return ~c >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}
function encodePng(rgb) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  const raw = Buffer.alloc((W * 3 + 1) * H);
  for (let y = 0; y < H; y++) {
    raw[y * (W * 3 + 1)] = 0; // filter none
    rgb.copy(raw, y * (W * 3 + 1) + 1, y * W * 3, y * W * 3 + W * 3);
  }
  const idat = zlib.deflateSync(raw, {level: 9});
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

function writeFrames(dir, painter) {
  fs.mkdirSync(dir, {recursive: true});
  const rgb = Buffer.alloc(W * H * 3);
  for (let f = 0; f < N; f++) {
    const t = f / N;
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const [r, g, b] = painter(x / W, y / H, t, f);
        const i = (y * W + x) * 3;
        rgb[i] = Math.max(0, Math.min(255, r | 0));
        rgb[i + 1] = Math.max(0, Math.min(255, g | 0));
        rgb[i + 2] = Math.max(0, Math.min(255, b | 0));
      }
    fs.writeFileSync(path.join(dir, `f${String(f).padStart(4, '0')}.png`), encodePng(rgb));
  }
}

function writeWav(file, freq) {
  const AR = 44100, samples = AR * SECS;
  const data = Buffer.alloc(samples * 2);
  for (let s = 0; s < samples; s++) data.writeInt16LE((Math.sin((2 * Math.PI * freq * s) / AR) * 0.25 * 32767) | 0, s * 2);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(AR, 24);
  header.writeUInt32LE(AR * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([header, data]));
}

function encode(out, dir, wav) {
  const args = ['-y', '-hide_banner', '-loglevel', 'error', '-framerate', `${FPS}`, '-i', path.join(dir, 'f%04d.png')];
  if (wav) args.push('-i', wav);
  args.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-b:v', '500k');
  if (wav) args.push('-c:a', 'aac', '-shortest');
  args.push(path.join(OUT, out));
  const r = spawnSync(FF, args, {stdio: 'inherit'});
  console.log(out, '=>', r.status);
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'clips-'));

writeFrames(path.join(tmp, 'ui'), (x, y, t) => {
  const band = Math.sin((x + y) * 8 - t * 6);
  return band > 0.4 ? [40 + 200 * (0.5 + 0.5 * band), 60, 70] : [18, 12, 16];
});
writeWav(path.join(tmp, 'ui.wav'), 220);
encode('demo_ui.mp4', path.join(tmp, 'ui'), path.join(tmp, 'ui.wav'));

writeFrames(path.join(tmp, 'flow'), (x, y, t) => {
  const v = Math.sin(x * 10 + t * 5) + Math.sin(y * 12 - t * 4) + Math.sin((x + y) * 8 + t * 3);
  const n = (v + 3) / 6;
  return [30 + n * 60, 40 + n * 120, 90 + n * 140];
});
encode('demo_flow.mp4', path.join(tmp, 'flow'), null);

writeFrames(path.join(tmp, 'grid'), (x, y, t) => {
  const cx = Math.floor((x + t * 0.2) * 12) % 2;
  const cy = Math.floor(y * 7) % 2;
  return cx === cy ? [220, 150, 60] : [22, 18, 24];
});
encode('demo_grid.mp4', path.join(tmp, 'grid'), null);

writeFrames(path.join(tmp, 'cam'), (x, y, t) => {
  const dx = x - 0.5, dy = y - 0.42, d = Math.sqrt(dx * dx + dy * dy);
  const glow = Math.max(0, 1 - d * 1.9) * (0.85 + 0.15 * Math.sin(t * 4));
  return [30 + glow * 150, 18 + glow * 60, 26 + glow * 70];
});
writeWav(path.join(tmp, 'cam.wav'), 180);
encode('demo_webcam.mp4', path.join(tmp, 'cam'), path.join(tmp, 'cam.wav'));

fs.rmSync(tmp, {recursive: true, force: true});
console.log('done');
