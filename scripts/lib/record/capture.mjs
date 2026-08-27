// CAPTURE — turn a live page into FRAME-ACCURATE, CONSTANT-FRAME-RATE segments.
//
// WHY NOT Playwright's recordVideo: it writes a VARIABLE-frame-rate webm and only
// finalises on context close. Remotion's OffthreadVideo assumes a frame grid, so a VFR
// source drifts — invisibly in a 10-second test, obviously across a six-minute cut. And
// a single blob cannot be cut on step boundaries after the fact without re-deriving the
// timings we already knew at capture time.
//
// WHAT WE DO INSTEAD: CDP `Page.startScreencast` hands us individual frames, each with
// its own timestamp. We write them to disk as they arrive and remember when each one
// was painted. A segment is then RESAMPLED onto an exact 30fps grid: for output frame i
// at time t0 + i/fps, take the last captured frame painted at or before t. That is a
// real CFR clip whose frame N is genuinely the picture at N/fps seconds.
//
// Screencast only emits a frame when something CHANGES. That is not a problem — it is
// the point: holding the last frame across a still period is exactly what resampling
// does, and it means an idle demo costs almost no disk.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const pad = (n, w = 6) => String(n).padStart(w, '0');

/**
 * Start capturing. Returns a recorder:
 *   .mark(label)            -> record a wall-clock marker (step boundaries)
 *   .frameCount()
 *   .stop()                 -> stop the screencast
 *   .segment({t0,t1,out})   -> write one CFR mp4 covering [t0,t1] in wall-clock ms
 */
export const startCapture = async (page, {dir, quality = 92, maxWidth, maxHeight} = {}) => {
  fs.mkdirSync(dir, {recursive: true});
  const client = await page.context().newCDPSession(page);

  const frames = []; // {n, t (wall ms), file}
  const marks = [];
  let n = 0;

  client.on('Page.screencastFrame', async (ev) => {
    const now = Date.now();
    // MEASURED: `metadata.timestamp` is the frame-swap time in EPOCH SECONDS, and it
    // agrees with Date.now() to within 1ms. So it is directly comparable to our marks —
    // no offset, no anchoring. An earlier version "anchored" it to the arrival time of
    // the first frame, which only added a way to be wrong. `now` is the fallback for the
    // rare frame that carries no timestamp.
    const cdpMs = (ev.metadata?.timestamp ?? 0) * 1000;
    const t = cdpMs > 0 ? cdpMs : now;

    const file = `f${pad(n)}.jpg`;
    fs.writeFileSync(path.join(dir, file), Buffer.from(ev.data, 'base64'));
    frames.push({n, t, file});
    n++;
    // MUST ack, or the browser stops sending frames after a few.
    try {
      await client.send('Page.screencastFrameAck', {sessionId: ev.sessionId});
    } catch { /* page closed mid-flight */ }
  });

  const params = {format: 'jpeg', quality, everyNthFrame: 1};
  if (maxWidth) params.maxWidth = maxWidth;
  if (maxHeight) params.maxHeight = maxHeight;
  await client.send('Page.startScreencast', params);

  let stopped = false;
  return {
    dir,
    frames,
    marks,
    mark(label) {
      const m = {label, t: Date.now()};
      marks.push(m);
      return m;
    },
    frameCount: () => frames.length,
    async stop() {
      if (stopped) return;
      stopped = true;
      try { await client.send('Page.stopScreencast'); } catch { /* already gone */ }
      // let in-flight frames land
      await new Promise((r) => setTimeout(r, 400));
    },
    /** Resample [t0,t1] onto an exact fps grid and encode a CFR mp4. */
    segment(opts) {
      return writeSegment({frames, dir, ...opts});
    },
  };
};

/**
 * Build one CFR segment. Returns {out, frames, fps, source} or throws with a reason.
 * `t0`/`t1` are wall-clock ms.
 */
export const writeSegment = ({frames, dir, t0, t1, out, fps = 30, minFrames = 2, maxHoldMs = 1200}) => {
  if (!frames.length) throw new Error('No captured frames — was the screencast started?');
  const durMs = t1 - t0;
  if (durMs <= 0) throw new Error(`Segment has non-positive duration (${durMs}ms)`);

  const count = Math.max(minFrames, Math.round((durMs / 1000) * fps));

  // For each output frame, the last captured frame painted at or before it. Before the
  // first captured frame we hold frame 0 — a segment that starts in a still period is
  // normal, not an error.
  const raw = [];
  let idx = 0;
  for (let i = 0; i < count; i++) {
    const t = t0 + (i * 1000) / fps;
    while (idx + 1 < frames.length && frames[idx + 1].t <= t) idx++;
    // if we are still before the first frame, hold it rather than emitting nothing
    raw.push(frames[idx].file);
  }

  // ── DEAD-AIR TRIM (risk R3: recorded beats read as slow and boring) ─────────
  // Screencast only emits a frame when something CHANGES, so a long run of the same
  // source frame means the screen was FROZEN — the machine was waiting, and so was the
  // viewer. Capping how long any single frame may occupy removes that wait.
  //
  // This is not "speeding up the footage": during a trimmed run, nothing happened. No
  // information is lost and nothing is misrepresented, which is why it needs no on-screen
  // speed chip. A stretch where the picture IS changing (a spinner, a progress bar) has
  // no repeated frame and is never touched by this.
  //
  // The render-time FREEZE is a different thing and still does its job: it holds the last
  // frame while the VOICE catches up. This only removes waiting that is inside the take.
  const maxHold = maxHoldMs ? Math.max(2, Math.round((maxHoldMs / 1000) * fps)) : Infinity;
  const plan = [];
  let runFile = null;
  let runLen = 0;
  let trimmed = 0;
  for (const f of raw) {
    if (f === runFile) {
      runLen++;
      if (runLen > maxHold) { trimmed++; continue; }
    } else {
      runFile = f;
      runLen = 1;
    }
    plan.push(f);
  }
  // Never let trimming collapse a segment to nothing.
  while (plan.length < minFrames && raw.length) plan.push(raw[raw.length - 1]);
  const count2 = plan.length;

  // ffmpeg concat demuxer. NOTE: run with cwd = the frames dir and use BARE filenames —
  // an absolute Windows path in a concat list (and anywhere ffmpeg parses ':') is a trap.
  const listName = `${path.basename(out, '.mp4')}.concat.txt`;
  const perFrame = (1 / fps).toFixed(6);
  const lines = [];
  for (const f of plan) {
    lines.push(`file '${f}'`);
    lines.push(`duration ${perFrame}`);
  }
  lines.push(`file '${plan[plan.length - 1]}'`); // concat needs the last file repeated
  fs.writeFileSync(path.join(dir, listName), lines.join('\n') + '\n');

  const outAbs = path.resolve(out);
  fs.mkdirSync(path.dirname(outAbs), {recursive: true});
  execFileSync('ffmpeg', [
    '-y', '-v', 'error',
    '-f', 'concat', '-safe', '0', '-i', listName,
    // `-frames:v` is NOT redundant. The concat demuxer needs the last image listed a
    // second time for its duration to be honoured, and that repeat contributes extra
    // frames — measured 32 out for a 30-frame plan. Pin the count explicitly.
    '-frames:v', String(count2),
    '-vsync', 'cfr', '-r', String(fps),
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20',
    '-pix_fmt', 'yuv420p',
    // even dimensions are required by yuv420p; screen captures are often odd-sized
    '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
    outAbs,
  ], {cwd: dir, stdio: ['ignore', 'ignore', 'inherit']});

  fs.rmSync(path.join(dir, listName), {force: true});

  // MEASURE the artefact. Never report the number we asked for.
  const real = Number(execFileSync('ffprobe',
    ['-v', 'error', '-select_streams', 'v:0', '-count_frames',
     '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', outAbs],
  ).toString().trim().split(/\r?\n/)[0]);

  return {out: outAbs, frames: real, planned: count2, beforeTrim: count, trimmedFrames: trimmed, fps, sourceFrames: new Set(plan).size};
};
