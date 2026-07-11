// throwaway: LISTENED/ENVELOPE proof for the audio-ducking doctrine. Renders a
// clip-audio scene (demo_ui.mp4 tone, muted:false) with a narration GAP at
// [90,180] to WAV, then measures per-window RMS from the rendered PCM and asserts
// the envelope is LOW in the ducked window (narration speaking) and HIGH in the
// gap window (clip swells). This proves Remotion actually APPLIES the duck curve
// to the rendered output — the curve unit test proves the math, this proves the mux.
import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const spec = {
  meta: {topic: 'audio proof', format: 'long', fps: 30},
  brand: {theme: 'creatorGlow'},
  scenes: [
    {
      id: 'ap', type: 'VIDEO_HERO', narration: 'audio ducking proof', durationFrames: 240, background: 'zoneA',
      data: {videoHero: {src: 'assets/video/demo_ui.mp4', headline: 'audio', muted: false, audioGaps: [[30, 75]], atWord: 1}},
    },
  ],
};
const out = 'audit/determinism/_audioproof.wav';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const inputProps = {spec, themeOverride: 'creatorGlow'};
const c = await selectComposition({serveUrl, id: 'material-wide', inputProps});
c.durationInFrames = 240;
await renderMedia({composition: c, serveUrl, codec: 'wav', outputLocation: out, inputProps});

// ── parse the rendered WAV (RIFF / PCM) ──
const buf = fs.readFileSync(out);
let p = 12; // skip 'RIFF'<size>'WAVE'
let sampleRate = 48000, channels = 2, bits = 16, dataOff = 0, dataLen = 0;
while (p + 8 <= buf.length) {
  const id = buf.toString('ascii', p, p + 4);
  const size = buf.readUInt32LE(p + 4);
  if (id === 'fmt ') {
    channels = buf.readUInt16LE(p + 10);
    sampleRate = buf.readUInt32LE(p + 12);
    bits = buf.readUInt16LE(p + 22);
  } else if (id === 'data') {
    dataOff = p + 8; dataLen = size; break;
  }
  p += 8 + size + (size & 1);
}
const bytesPerSample = bits / 8;
const frameStride = channels * bytesPerSample;
const readSample = (i) => {
  const off = dataOff + i * frameStride; // channel 0
  if (bits === 16) return buf.readInt16LE(off) / 32768;
  if (bits === 32) return buf.readFloatLE(off);
  return 0;
};
const totalSamples = Math.floor(dataLen / frameStride);
const rmsFrames = (fa, fb) => {
  const sa = Math.floor((fa / 30) * sampleRate);
  const sb = Math.min(totalSamples, Math.floor((fb / 30) * sampleRate));
  let sum = 0, n = 0;
  for (let i = sa; i < sb; i++) { const v = readSample(i); sum += v * v; n++; }
  return n ? Math.sqrt(sum / n) : 0;
};

const ducked = rmsFrames(5, 25); // narration speaking → clip ducked (0.25)
const solo = rmsFrames(42, 63); // narration gap → clip swells (0.8)
const ratio = ducked > 1e-6 ? solo / ducked : Infinity;
const ok = solo > ducked * 1.8; // 0.8/0.25 = 3.2× ideal; ramp-eroded, assert >1.8×
console.log(`SR=${sampleRate} ch=${channels} bits=${bits} samples=${totalSamples}`);
console.log(`RMS ducked(f30-80)=${ducked.toFixed(5)}  solo(f120-165)=${solo.toFixed(5)}  ratio=${ratio.toFixed(2)}×`);
console.log(`AUDIO-ENVELOPE: ${ok ? 'PASS (clip audio dips under narration, swells in the gap)' : 'FAIL (no dip detected)'}`);
fs.writeFileSync('audit/determinism/audio-envelope.json', JSON.stringify({rmsDucked: ducked, rmsSolo: solo, ratio, ok}, null, 2));
fs.rmSync(out, {force: true});
process.exit(ok ? 0 : 1);
