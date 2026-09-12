// FluidRAM, read and tested — WIDE CUT.
//
// A fair expert review of Aditya Raj's FluidRAM (and the AdiOS project it grew out of).
// Every figure below has a row in briefs/fluidram/00-dossier.md, with the file and line it
// came from or the measurement that produced it. Only the author and his two repositories
// are credited; no other person is named (owner's instruction).
//
// The house rules for narration are the Apple series' rules (scripts/lib/apple-build.mjs):
// name the subject, contractions, explain a term in the same breath, never defend the
// footage. Two more for this video: never call the project dishonest (the author's own
// audit already separates modeled from measured — we credit it), and never call it slow
// (the scatter decode measured 159 ns, faster than LZ4).
import {cut} from '../../scripts/lib/apple-build.mjs';

const c = cut();
// SNAP EVERY ANCHOR ONTO ITS OWN WORDS (audit-sync, 2026-09-11: 40 of 164 elements landed
// away from the words that name them). A fraction of the narration is an estimate of where a
// word falls, and retarget-anchors refuses to choose when a label's word is spoken twice
// ("byte", "FluidRAM"), so the estimate shipped. Here each anchor moves to the NEAREST spoken
// occurrence of any of its own words (label, sub, role) within 14 words of where it was placed,
// never into the last 15% of the beat (LAW 8). Nearest-to-intent keeps the authored order.
const STOP = new Set(['a', 'an', 'the', 'of', 'and', 'or', 'to', 'in', 'on', 'at', 'is', 'it', 'its',
  'for', 'with', 'by', 'as', 'from', 'that', 'this', 'be', 'are', 'was', 'you', 'your', 'can', 'one',
  'two', 'per', 'not', 'has', 'have']);
const stem = (w) => {
  w = w.toLowerCase().replace(/'s$/, '');
  for (const suf of ['ing', 'ed', 'es', 'e', 's']) if (w.endsWith(suf) && w.length - suf.length >= 3) return w.slice(0, -suf.length);
  return w;
};
const keysOf = (...ss) => new Set(ss.flatMap((x) => String(x ?? '').toLowerCase().split(/[^a-z0-9']+/))
  .filter((w) => w.length > 2 && !STOP.has(w)).map(stem));
const snapTo = (T, want, ...texts) => {
  const keys = keysOf(...texts);
  const words = T.split(/\s+/);
  const cap = Math.floor(words.length * 0.85);
  let best = null;
  words.forEach((w, i) => {
    const idx = i + 1;
    const hit = w.toLowerCase().split(/[^a-z0-9']+/).some((p) => p.length > 2 && keys.has(stem(p)));
    if (hit && idx <= cap && Math.abs(idx - want) <= 14 && (best == null || Math.abs(idx - want) < Math.abs(best - want))) best = idx;
  });
  return best ?? want;
};
// `at: '<phrase>'` pins a cell to the first word of that exact phrase — for the cases the
// snap cannot reach (its word is >14 words from the estimate, or two cells would snap onto
// the same word and the beat would lose an earned anchor).
const snapCells = (T, body) => {
  for (const x of body.cells ?? []) {
    if (typeof x.at === 'string') { x.atWord = wordIndex(T, x.at); delete x.at; }
    else if (typeof x.atWord === 'number') x.atWord = snapTo(T, x.atWord, x.label, x.sub, x.text);
  }
  return body;
};
const M = (t, bg, n, mk, o) => c.add('MEM_STAGE', t, bg, n, (A, cnt, T) => snapCells(T, mk(A, cnt, T)), o);
const ADIOS = 'Aditya Raj · github.com/adityarajIITj/adios · MIT licence · commit 0a85d38';
const FLUID = 'Aditya Raj · github.com/adityarajIITj/fluidram · GPL-2.0 · commit bbecc61';

// A recorded GitHub beat. Each clip punches in on its mark, names what the mark covers,
// then lands back on the whole page (the camera reads like a person: in, point, out).
// `marks` lets one clip visit two marks in narration order, one callout per mark.
//
// `pivot` pins a clip to the sentence that turns to it. The anchor solver otherwise places
// a second clip wherever the first clip's slack runs out, and it plans at 12 frames a word
// against the voice's ~9.6, so a second clip drifts late and its zoom, callout and
// pull-back are left with no words to land on (anchor-spec: "only 0 word(s) of script
// after its footage ends"). Naming the phrase makes the placement the script's decision.
const wordIndex = (narration, phrase) => {
  const norm = (x) => x.replace(/[^\w']/g, '').toLowerCase();
  const w = narration.split(/\s+/), p = phrase.split(/\s+/);
  for (let i = 0; i < w.length; i++) if (p.every((x, j) => norm(w[i + j] ?? '') === norm(x))) return i + 1;
  throw new Error(`pivot not found in narration: "${phrase}"`);
};
const rec = (transition, bg, narration, source, clips) =>
  c.add('RECORDED_STEP', transition, bg, narration, (A) => ({
    clips: clips.map((k) => ({
      ref: `rec:fluidram-repos#${k.step}`, label: k.label, focus: true, atWord: A(k.at ?? 0.05),
      ...(k.pivot ? {wantAtWord: wordIndex(narration, k.pivot)} : {}),
      // A clip quotes its OWN page. s19 cuts from AdiOS to the FluidRAM repo mid-beat, and a
      // scene-level credit named the wrong repo and licence under the second clip.
      ...(k.source ? {sourceNote: k.source} : {}),
      // THE CAMERA FOLLOWS THE VOICE (owner, 2026-09-11: "you zoom in at a specific place only,
      // and you are speaking about something which is not in focus"). Each move is pinned to
      // the exact phrase that names what it frames; `frame` is one mark or a block (the union
      // of its first and last line); `band` lays the quiet highlight on it while the camera is
      // there; 'full' pulls back when the sentence leaves the page. No callout labels and no
      // caption card: the page is the picture, the band is the pointer.
      zooms: (k.camera ?? []).map((m) => (m.frame === 'full'
        ? {at: 'full', wantAtWord: wordIndex(narration, m.at)}
        : {marks: [].concat(m.frame), ...(m.band ? {band: true} : {}), wantAtWord: wordIndex(narration, m.at)})),
      callouts: [],
    })),
    sourceNote: source,
  }));

// ── 1 · HOOK ─────────────────────────────────────────────────────────────────────────
c.add('HOOK', 'dip', 'zoneA',
  "FluidRAM says it gives Linux four times more memory. I ran its code to check.",
  (A) => ({
    headline: 'FluidRAM: 4× more RAM?',
    subtext: 'An open-source Linux memory project, tested',
    heroAsset: 'si:linux',
    hookVariant: 'ask',
    atWord: A(0.5),
  }));

// ── 2 · Greeting, intent, the loop ───────────────────────────────────────────────────
c.add('TITLE_CARD', 'fade', 'zoneA',
  "Welcome back. FluidRAM is an open-source Linux project by Aditya Raj, and its promise is huge: " +
  "squeeze memory until your machine never has to touch the disk. Today we're going to read " +
  "that code, test it, and ask one question: does four times hold up?",
  (A) => ({
    title: 'Four times more RAM?',
    subtitle: 'FluidRAM, read and tested',
    atWord: A(0.4),
  }));

// ═══ I · WHAT THE PROJECT IS ══════════════════════════════════════════════════════════
rec('letterbox', 'zoneB',
  "This is Aditya Raj's AdiOS repository on GitHub, and FluidRAM grew out of it. Its very first line asks what would happen if memory behaved like a fluid — if it could flow to wherever it's needed, instead of sitting in fixed boxes. What a lovely question, and one that deserves to be taken seriously. Scroll down and the README lays out three memory ideas in plain English, which is a kindness most research projects never offer. And because it's MIT licensed, anyone can read, run and build on every line of it.",
  ADIOS,
  [
    {step: 'adios-thesis', label: "Aditya Raj's AdiOS", camera: [
      {at: 'Its very first line asks', frame: 'thesis', band: true},
      {at: 'What a lovely question', frame: 'full'}]},
    {step: 'adios-three', pivot: 'Scroll down', label: 'Scroll down the README', camera: [
      {at: 'lays out three memory ideas', frame: 'threes', band: true},
      {at: "And because it's MIT", frame: 'full'}]},
  ]);

M('iris', 'zoneA',
  "So what is AdiOS, exactly? AdiOS isn't an operating system that boots your laptop. Instead, it runs as one ordinary Python program, inside the operating system you already have: a whole desktop, apps, even a little CPU interpreter, all living in one window. And here's the part that matters for everything later. Inside AdiOS, one gigabyte of physical RAM is a single Python bytearray, which is just a slice of your computer's RAM. Aditya's own notes say exactly that, and we'll come back to them.",
  (A) => ({
    headline: 'AdiOS runs [inside] your OS',
    kind: 'host-guest',
    caption: 'An OS inside a program',
    premise: 'The big frame is your computer. AdiOS lives inside one program window on it.',
    color: 'blue',
    atWord: A(0.05),
    cells: [
      {label: "Your computer's operating system", text: 'host', sub: 'Windows, Linux or macOS', atWord: A(0.14)},
      {label: 'python run_desktop.py', text: 'process', sub: 'one ordinary program', atWord: A(0.24)},
      {label: 'AdiOS', text: 'guest', sub: 'a desktop, apps and a CPU interpreter', atWord: A(0.36)},
      {label: '1 GB of "physical" RAM', text: 'ram', atWord: A(0.55)},
      {label: "your computer's RAM", text: 'hostram', atWord: A(0.6)},
      {label: '= one Python bytearray', text: 'truth', sub: "a slice of the host's memory", atWord: A(0.64)},
    ],
  }));

rec('letterbox', 'zoneC',
  "Aditya's second repository is FluidRAM itself: a Linux memory subsystem without disk swap, released under the GPL. FluidRAM's comparison table is where the big claims live. Four point one two times more memory density in a simulated suite, thirty five times on what it calls bare-metal QEMU, zero swap writes, zero page faults, and no process ever killed. Hold on to those numbers, because the rest of this video is about where each one comes from.",
  FLUID,
  [
    {step: 'fr-readme', label: 'The FluidRAM repo', camera: [
      {at: 'a Linux memory subsystem without disk swap', frame: 'frtitle', band: true}]},
    {step: 'fr-table', pivot: "FluidRAM's comparison table", label: 'The claims table', camera: [
      {at: 'Four point one two times', frame: 'multRow', band: true},
      {at: 'zero swap writes', frame: 'zeroRows', band: true},
      {at: 'Hold on to those numbers', frame: 'full'}]},
  ]);

// ═══ II · MEMORY, FROM ZERO ═══════════════════════════════════════════════════════════
M('wipe', 'zoneA',
  "Before we can judge any of this, we need three ideas about memory, and they're simpler than they " +
  "sound. Your RAM is handed out in pages: fixed squares of four kilobytes, four thousand and ninety six " +
  "bytes each. Every program, your browser, your editor, a game, gets its memory a page at a time. And " +
  "here's the odd bit, called overcommit: Linux happily promises programs more pages than physically " +
  "exist, betting they won't all use them at once, because most programs never do.",
  (A) => ({
    headline: 'RAM comes in [4 KB pages]',
    kind: 'page-wall',
    token: 'RAM · every square is one 4 KB page',
    caption: 'Pages, and a promise',
    premise: 'The wall is your RAM. Each square is one page; its colour says which program owns it.',
    color: 'blue',
    atWord: A(0.05),
    cells: [
      {label: 'one page', text: 'tile', sub: '4,096 bytes', atWord: A(0.2)},
      {label: 'your browser', text: 'program', sub: '80 pages here', value: 80, atWord: A(0.34)},
      {label: 'your editor', text: 'program', sub: '48 pages', value: 48, atWord: A(0.38)},
      {label: 'a game', text: 'program', sub: '64 pages', value: 64, color: 'orange', atWord: A(0.41)},
      {label: 'promised, not there', text: 'overcommit', sub: 'overcommit', value: 12, atWord: A(0.6)},
    ],
  }));

M('push', 'zoneB',
  "So what happens when that wall fills up? Linux has to move something out. Option one is swap: copy a " +
  "page nobody's touched lately onto the disk, an SSD usually, and reuse its square. Distance is the " +
  "catch. RAM answers in about a hundred nanoseconds, an SSD takes tens of microseconds, and an old " +
  "hard drive takes milliseconds. Option two is zram, which Linux has shipped for years: squeeze the " +
  "page with a fast compressor and keep it in RAM, so getting it back costs about a microsecond.",
  (A) => ({
    headline: 'When RAM fills: [disk, or squeeze]',
    kind: 'evict-paths',
    caption: 'Two ways out',
    premise: 'Left, your RAM. The long wire runs to a drive; the green corner is zram. Below: how long each takes.',
    color: 'blue',
    atWord: A(0.04),
    cells: [
      {label: 'RAM', text: 'ram', sub: 'full, so something has to move', atWord: A(0.08)},
      {label: 'swap on disk', text: 'disk', sub: 'copy the page out, reuse the square', atWord: A(0.2)},
      {label: 'RAM read', text: 'rung', sub: 'about 100 ns', value: 100, atWord: A(0.4)},
      {label: 'SSD read', text: 'rung', sub: 'tens of µs', value: 50000, color: 'orange', atWord: A(0.45)},
      {label: 'Hard drive', text: 'rung', sub: 'milliseconds', value: 5000000, color: 'red', atWord: A(0.52)},
      {label: 'zram', text: 'zram', sub: 'squeezed, still in RAM', atWord: A(0.58)},
      {label: 'zram read', text: 'rung', sub: 'about 1 µs', value: 1000, color: 'green', atWord: A(0.66)},
      {label: 'each step right is ten times slower', text: 'axis', atWord: A(0.44)},
    ],
  }));

M('slide', 'zoneC',
  "And when even that isn't enough, things get ugly. A page gets pushed out, needed again a moment later, pulled back, then pushed out again. That loop is called thrashing, and it's the reason a struggling machine freezes instead of crashing. A page fault, by the way, is just the CPU saying this page isn't where I expected; a major fault means fetching it from disk. When nothing can be freed, Linux calls the OOM killer, short for out of memory, which picks the biggest process and ends it. That's brutal, but it keeps the rest of the machine alive, and it's exactly the problem FluidRAM sets out to solve.",
  (A) => ({
    headline: 'Thrashing, then the [OOM killer]',
    kind: 'oom-kill',
    caption: 'When nothing fits',
    premise: 'The white frame is RAM. The blocks are programs; together they need more than it holds.',
    color: 'orange',
    atWord: A(0.04),
    cells: [
      {label: 'RAM', text: 'ram', sub: "more than RAM holds", value: 8, atWord: A(0.06)},
      {label: 'Browser', text: 'proc', value: 3.2, atWord: A(0.08)},
      {label: 'Editor', text: 'proc', value: 1.6, color: 'green', atWord: A(0.1)},
      {label: 'Game', text: 'proc', value: 4.4, color: 'purple', atWord: A(0.12)},
      {label: 'thrashing', text: 'thrash', sub: 'pushed out, needed, pulled back, again', atWord: A(0.22)},
      {label: 'OOM killer', text: 'kill', sub: 'ends the biggest process', at: 'OOM killer'},
    ],
  }));

// ═══ III · WHAT FLUIDRAM PROPOSES ═════════════════════════════════════════════════════
M('zoom', 'zoneA',
  "FluidRAM's first idea is where the name comes from. Memory is kept in pools, and each pool has a quota, its share of the space. When pool zero is full, instead of evicting anything, it borrows unused room from pool one next door, like water finding its level between two tanks. What moves is the allowance, not your data. Borrowing is a neat idea, so hold on to it, because it's also where two of the problems later on are hiding.",
  (A) => ({
    headline: 'Pools that [lend each other] room',
    kind: 'pool-borrow',
    token: 'quota',
    caption: 'The fluid idea',
    premise: 'Each tank is a memory pool. The dashed line is its quota; the liquid is what it holds.',
    color: 'blue',
    atWord: A(0.05),
    cells: [
      {label: 'pool zero', text: 'pool', sub: 'full: at its quota', value: 100, atWord: A(0.26)},
      {label: 'pool one', text: 'pool', sub: 'plenty of room', value: 35, color: 'green', atWord: A(0.36)},
      {label: 'borrows unused room', text: 'borrow', atWord: A(0.4)},
    ],
  }));

M('fade', 'zoneB',
  "FluidRAM's second idea is in its full name: Galois field compression. A Galois field is a set of numbers with its own rules for adding and multiplying, and every byte is one of them. The code builds a multiply for that field, a function called G F mul, but nothing in the driver ever calls G F mul. What does run is the field's addition. Take byte A and byte B, eight bits each. Adding them means XOR: compare each column, write one if they differ and zero if they match, and nothing ever carries. XOR byte B in again and the original comes back. Hold on to that, because it's the key to the fix at the end.",
  (A) => ({
    headline: 'Galois field: [adding is XOR]',
    kind: 'gf-xor',
    caption: 'Arithmetic on bytes',
    premise: 'Each row is one byte, drawn as its eight bits. A lit square is a one.',
    color: 'blue',
    atWord: A(0.04),
    cells: [
      {label: 'gf_mul(a, b)', text: 'mul', sub: 'defined — never called', at: 'a function called G F mul'},
      {label: 'byte A', text: 'a', value: 90, at: 'Take byte A'},
      {label: 'byte B', text: 'b', value: 60, at: 'and byte B'},
      {label: 'A XOR B', text: 'sum', sub: 'no carries: every column on its own', at: 'Adding them means XOR'},
      {label: 'XOR B again', text: 'undo', at: 'XOR byte B in again'},
    ],
  }));

M('wipe', 'zoneC',
  "So what does the encoder do with a page? Picture the page as a grid of four thousand and ninety six " +
  "bytes. First, every zero byte is simply dropped. Then each byte that survives is written out as a " +
  "tuple of three bytes: two saying where it was, one saying what it was. Add a twelve byte header and a " +
  "two byte count, and that's the whole page. This mode only runs when fewer than a thousand and twenty " +
  "four bytes are non-zero, because past that, three bytes each would cost more than the page. And notice " +
  "what it is: a delta against zero, not against an older version of the page.",
  (A) => ({
    headline: 'Zeros vanish, [survivors cost 3]',
    kind: 'sparse-encode',
    caption: 'The sparse mode',
    premise: 'The grid is one page, 64 × 64 bytes. The lit squares are the few bytes that are not zero.',
    color: 'blue',
    atWord: A(0.04),
    cells: [
      {label: 'one page · 4,096 bytes', text: 'page', value: 40, atWord: A(0.08)},
      {label: 'every zero byte: dropped', text: 'zeros', atWord: A(0.17)},
      {label: 'each survivor → 3 bytes', text: 'tuple', sub: 'two for where, one for what', atWord: A(0.26)},
      {label: 'header + count + 3 per byte', text: 'total', sub: '12 + 2 + 3 × 40', atWord: A(0.4)},
      {label: 'under 1,024 non-zero only', text: 'limit', atWord: A(0.55)},
    ],
  }));

rec('letterbox', 'zoneA',
  "Here's that code in the repository, in fluid galois dot c. At line sixty five, G F mul is defined, a " +
  "proper multiply built from log and exponent tables, and searching the driver finds no caller at all. A " +
  "little further down, at line one thirty four, is the sparse branch, with its own comment: fewer than a " +
  "thousand and twenty four non-zero bytes, seventy five percent sparsity. Underneath, a loop writes the " +
  "offset's low byte, then its high byte, then the value. Three bytes per survivor, exactly as drawn.",
  FLUID,
  [
    {step: 'gf-mul', label: 'gf_mul, never called', camera: [
      {at: 'At line sixty five', frame: 'gfBody', band: true}]},
    {step: 'sparse-mode', pivot: 'A little further down', label: 'Further down: line 134', camera: [
      {at: 'with its own comment', frame: 'spc', band: true},
      {at: 'Underneath, a loop writes', frame: 'loopBody', band: true}]},
  ]);

M('push', 'zoneB',
  "What about a page that's full of content, a chunk of JSON or program code? There's a dense mode: XOR each byte with the one before it, then collapse runs of repeats. Dense mode is only kept if it saves a quarter of the page, so the output has to fit under three thousand and seventy two bytes. Ordinary content rarely does, because neighbouring bytes aren't similar enough. So the page is stored raw: all four thousand and ninety six bytes, plus the twelve byte header. Keep that four thousand one hundred and eight in mind.",
  (A) => ({
    headline: 'Full pages fall back to [raw]',
    kind: 'dense-fallback',
    caption: 'The dense mode',
    premise: 'The grid is a page of ordinary content. Below the line it saves memory; past it, it does not.',
    color: 'orange',
    atWord: A(0.04),
    cells: [
      {label: 'a page full of content', text: 'page', value: 2300, sub: 'most bytes are not zero', atWord: A(0.06)},
      {label: 'dense mode: XOR neighbours, then runs', text: 'dense', sub: 'kept only under 3,072 bytes', atWord: A(0.2)},
      {label: 'no saving', text: 'fail', atWord: A(0.5)},
      {label: 'stored raw', text: 'raw', sub: '4,108 B', atWord: A(0.6)},
    ],
  }));

// ═══ IV · WHERE THE NUMBERS COME FROM ═════════════════════════════════════════════════
M('iris', 'zoneC',
  "Now the numbers. In the README, a six-panel dashboard shows plain Linux at one point seven one times " +
  "and FluidRAM at four point one two. A Python script draws that chart, and here's the thing: those two " +
  "bars are typed straight into it as a list, multipliers equals one point seven one, four point one two. " +
  "A results file sits in the same repository, with different numbers for the same test, and the plotting " +
  "script never opens it, which means the chart and the results can quietly disagree.",
  (A) => ({
    headline: 'The bars are [typed in]',
    kind: 'chart-literals',
    caption: 'Where the chart gets its bars',
    premise: 'Left, the README chart. Right, the line of Python that draws it, and the results file beside it.',
    color: 'purple',
    atWord: A(0.04),
    cells: [
      {label: 'Plain Linux', text: 'bar', value: 1.71, atWord: A(0.1)},
      {label: 'FluidRAM', text: 'bar', value: 4.12, color: 'purple', atWord: A(0.16)},
      {label: 'multipliers = [1.71, 4.12]', text: 'code', sub: 'generate_comparison_visuals.py · line 58', atWord: A(0.4)},
      {label: 'benchmark_data.json', text: 'json', sub: 'the results file: 3.93× and 9.19×', atWord: A(0.6)},
    ],
  }));

rec('letterbox', 'zoneA',
  "Here's the plotting script. Line fifty eight: multipliers equals one point seven one, four point one " +
  "two. Further down, line one thirty eight does the same for the latency panel, twenty five thousand one " +
  "hundred microseconds for Linux against zero point two eight for FluidRAM, with a comment spelling out " +
  "what each one stands for. None of that is wrong for a mock-up. Trouble is, a mock-up and a " +
  "measurement look identical once they've become a chart, and that's why the source matters.",
  FLUID,
  [
    {step: 'chart-literals', label: "The chart's bar values", camera: [
      {at: 'Line fifty eight', frame: 'mult', band: true}]},
    {step: 'chart-latency', pivot: 'Further down, line', label: 'Further down: line 138', camera: [
      {at: 'microseconds for Linux', frame: 'latLine', band: true},
      {at: 'None of that is wrong', frame: 'full'}]},
  ]);

M('slide', 'zoneB',
  "Those results come from a simulator, also in Python, which runs a model of plain Linux beside a model of FluidRAM. On the Linux side, zram is modeled with Python's zlib rather than LZ4, and it's charged a fixed one and a half milliseconds for every swap write and two and a half for every read. Those are constants, not measurements, which means Linux loses by exactly what the constants say. Meanwhile the FluidRAM side sets its major page fault counter and its OOM kill counter to zero, never touches either again, and its write function always says yes, so it can never run out. In other words, the comparison was settled by the settings before any page was tested. Neither result could have come out any other way.",
  (A) => ({
    headline: 'A simulator with [fixed answers]',
    kind: 'sim-constants',
    caption: 'benchmark/*.py',
    premise: 'Left, how the simulated Linux is charged. Right, the simulated FluidRAM counters.',
    color: 'orange',
    atWord: A(0.04),
    cells: [
      {label: 'Plain Linux (simulated)', text: 'linux', sub: "zram modeled with Python's zlib", atWord: A(0.12)},
      {label: '+1.5 ms', text: 'write', sub: 'every swap write', value: 1.5, atWord: A(0.3)},
      {label: '+2.5 ms', text: 'read', sub: 'every swap read', value: 2.5, atWord: A(0.36)},
      {label: 'FluidRAM (simulated)', text: 'fr', sub: 'fluidram_sim.py', atWord: A(0.46)},
      {label: 'major_page_faults = 0', text: 'faults', sub: 'set once, never incremented', atWord: A(0.52)},
      {label: 'oom_kills = 0', text: 'oom', at: 'OOM kill counter'},
      {label: 'write_page() → True', text: 'always', sub: 'the pool can never run out', atWord: A(0.66)},
    ],
  }));

rec('letterbox', 'zoneC',
  "You can see both in the code. In fluidram sim dot py, line one eighty one: major page faults equals " +
  "zero, with the comment strictly zero by invariant. That's true, but only because nothing ever adds to " +
  "it. And in the plain Linux simulator, line one thirty five, every swap read adds a flat two and a half " +
  "milliseconds, labelled as an NVMe penalty. Those two lines decide most of the dashboard before a single " +
  "page has been compressed.",
  FLUID,
  [
    {step: 'sim-zero', label: 'A fault counter at zero', camera: [
      {at: 'line one eighty one', frame: 'telBody', band: true}]},
    {step: 'sim-latency', pivot: 'And in the plain', label: 'The plain Linux simulator', camera: [
      {at: 'line one thirty five', frame: 'penBody', band: true},
      {at: 'Those two lines decide', frame: 'full'}]},
  ]);

M('zoom', 'zoneA',
  "Thirty five times, the biggest number, comes from the AdiOS side. The benchmark declares a one thousand and twenty four megabyte workload, but that's a number in a variable, never allocated. Then it measures what's resident, meaning what is sitting in memory: twenty nine point two megabytes. Divide one by the other and you get thirty five point zero seven. So the ratio compares a promise with a measurement, which means it grows with whatever number you declare.",
  (A) => ({
    headline: '35× is [1,024 ÷ 29.2]',
    kind: 'declared-vs-real',
    caption: 'How 35× is computed',
    premise: 'Areas to scale: the dashed block is what was declared, the solid one what was resident.',
    color: 'red',
    atWord: A(0.04),
    cells: [
      {label: 'declared workload', text: 'declared', value: 1024, sub: 'a number — never allocated', atWord: A(0.18)},
      {label: 'resident', text: 'resident', value: 29.2, sub: '10% of the limit + a video buffer + deltas', atWord: A(0.45)},
      {label: '35.07×', text: 'ratio', sub: 'divide one by the other', atWord: A(0.62)},
    ],
  }));

rec('letterbox', 'zoneB',
  "Here's that function in AdiOS. Step six measures the resident physical footprint, and just below it, density is the declared size divided by that footprint. As for the QEMU run labelled bare metal, QEMU is a virtual machine, and its start-up script loads the kernel's own zram module, then runs a Python file. Nowhere does it load fluidram dot k o, the compiled driver. So thirty five times isn't a measurement of the driver. The driver was never in the room.",
  ADIOS,
  [
    {step: 'declared', label: 'How 35× is computed', camera: [
      {at: 'Step six measures', frame: 'resBody', band: true},
      {at: 'density is the declared size', frame: 'density', band: true}]},
    {step: 'qemu-zram', pivot: 'As for the QEMU', label: 'The QEMU run', source: FLUID, camera: [
      {at: "loads the kernel's own zram module", frame: 'insBody', band: true},
      {at: 'then runs a Python file', frame: 'py', band: true},
      {at: 'Nowhere does it load', frame: 'full'}]},
  ]);

rec('letterbox', 'zoneC',
  "And this is the part I want to give proper credit for. Aditya's own audit, in the AdiOS docs, " +
  "has a section called modeled abstractions, and it says plainly which pieces are models: the one " +
  "gigabyte of memory is a Python bytearray, the Linux comparisons are modeled values, and the stress " +
  "test's compression ratio is an assumption. Most projects never write that page. So the honest summary " +
  "was in the repository all along.",
  ADIOS,
  [
    {step: 'audit', label: "The author's own audit", camera: [
      {at: 'a section called modeled abstractions', frame: 'modeled', band: true},
      {at: 'the one gigabyte of memory', frame: 'rowPair', band: true}]},
    {step: 'audit-tags', pivot: 'the Linux comparisons are', label: 'Modeled and assumed', camera: [
      {at: 'modeled values', frame: 'tagRows', band: true},
      {at: 'Most projects never write', frame: 'full'}]},
  ]);

// ═══ V · WE RAN IT OURSELVES ══════════════════════════════════════════════════════════
M('iris', 'zoneA',
  "So I ran it. Take pages of memory from two programs running on a laptop: a browser with three public tabs, and a Python program holding the standard library's parsed source. Feed every page to three encoders side by side. FluidRAM's C encoder, compiled unmodified, then LZ4, one of zram's standard compressors, and zstd, a stronger one. Decode each page back and compare it with the original, then count the bytes a kernel would allocate for each. That last count matters most, because it's what your RAM pays, and it's exactly where the published numbers and ours part ways.",
  (A) => ({
    headline: 'Same pages, [three encoders]',
    kind: 'test-rig',
    caption: 'The test bench',
    premise: 'Pages leave two running programs, pass through three encoders, and come back to be compared.',
    color: 'green',
    atWord: A(0.04),
    cells: [
      {label: 'a browser, 3 tabs', text: 'source', sub: '107,654 pages', icon: 'lucide:globe', atWord: A(0.12)},
      {label: 'a Python program', text: 'source', sub: '43,680 pages', icon: 'si:python', atWord: A(0.2)},
      {label: 'FluidRAM', text: 'codec', sub: 'C, unmodified', atWord: A(0.42)},
      {label: 'LZ4', text: 'codec', sub: 'a zram compressor', color: 'green', atWord: A(0.47)},
      {label: 'zstd', text: 'codec', sub: 'level 3', color: 'purple', atWord: A(0.53)},
      {label: 'decoded back, compared', text: 'check', atWord: A(0.6)},
      {label: 'bytes a kernel would allocate', text: 'count', sub: 'kmalloc boxes for FluidRAM, a zram model for the others', atWord: A(0.7)},
    ],
  }));

M('wipe', 'zoneB',
  "First, a sanity check on the author's own test pages. On the sparse heap pages the benchmark uses, FluidRAM reports nine point eight five times, close to the nine point four five saved in the repository, which means the harness reproduces the result. Count what a kernel would allocate, though, and FluidRAM's allocated figure is six point eight three. On those same pages LZ4 manages almost twelve, and zstd over fifteen. On the code-like and JSON pages, LZ4 and zstd still shrink things two to nearly thirty times, but FluidRAM stores everything raw, which lands at zero point five, so each page costs twice its size. Kmalloc's rounding causes the zero point five, and we'll see exactly how it happens in a minute, because it matters for every number that follows.",
  (A) => ({
    headline: 'Its own test pages: [LZ4 wins]',
    kind: 'codec-bars',
    token: '1× = no saving',
    caption: "The author's page generators",
    premise: 'Each bar grows from 1×. Right of the line saves memory; left of it costs more than the page.',
    color: 'green',
    atWord: A(0.04),
    cells: [
      {text: 'sparse heap', label: 'FluidRAM, reported', value: 9.85, color: 'purple', at: 'FluidRAM reports nine'},
      {text: 'sparse heap', label: 'FluidRAM, allocated', value: 6.83, color: 'red', at: "FluidRAM's allocated figure"},
      {text: 'sparse heap', label: 'LZ4', value: 11.92, color: 'green', at: 'LZ4 manages'},
      {text: 'sparse heap', label: 'zstd', value: 15.43, color: 'blue', at: 'zstd over fifteen'},
      {text: 'code-like', label: 'FluidRAM, reported', value: 1.0, color: 'purple', at: 'but FluidRAM stores'},
      {text: 'code-like', label: 'LZ4', value: 1.96, color: 'green', at: 'LZ4 and zstd still'},
      {text: 'code-like', label: 'zstd', value: 5.68, color: 'blue', at: 'zstd still shrink'},
      {text: 'code-like', label: 'FluidRAM, allocated', value: 0.5, color: 'red', at: 'but FluidRAM stores'},
      {text: 'JSON', label: 'FluidRAM, reported', value: 1.0, color: 'purple', at: 'FluidRAM stores everything'},
      {text: 'JSON', label: 'LZ4', value: 23.27, color: 'green', at: 'still shrink things'},
      {text: 'JSON', label: 'zstd', value: 28.67, color: 'blue', at: 'two to nearly thirty'},
      {text: 'JSON', label: 'FluidRAM, allocated', value: 0.5, color: 'red', at: 'everything raw, which lands'},
    ],
  }));

M('push', 'zoneC',
  "Now memory from running programs, and what the encoder decided for every page. In the browser, a quarter of the pages are all zeros and a few are one byte repeated, which any system handles for free. About a fifth are sparse enough for the tuple trick, and a tenth went to dense mode. But nearly half get stored raw, because they're too full of data. Pause here and look at the Python program: almost every square is red, ninety eight percent of its pages stored raw, at four thousand one hundred and eight bytes each.",
  (A) => ({
    headline: 'Half the browser, [stored raw]',
    kind: 'page-mix',
    caption: 'What each page became',
    premise: 'Each block of 100 squares is one program; every square is one per cent of its pages.',
    color: 'red',
    atWord: A(0.04),
    cells: [
      {sub: 'Browser', text: 'zero', label: 'all zeros', value: 24.8, atWord: A(0.24)},
      {sub: 'Browser', text: 'uniform', label: 'one byte repeated', value: 0.7, atWord: A(0.3)},
      {sub: 'Browser', text: 'sparse', label: 'sparse tuples', value: 20.2, atWord: A(0.43)},
      {sub: 'Browser', text: 'dense', label: 'dense mode', value: 9.6, atWord: A(0.55)},
      {sub: 'Browser', text: 'raw', label: 'stored raw', value: 44.6, atWord: A(0.6)},
      {sub: 'Python', text: 'zero', label: 'all zeros', value: 1.5, atWord: A(0.7)},
      {sub: 'Python', text: 'sparse', label: 'sparse tuples', value: 0.4, atWord: A(0.7)},
      {sub: 'Python', text: 'dense', label: 'dense mode', value: 0.3, atWord: A(0.7)},
      {sub: 'Python', text: 'raw', label: 'stored raw', value: 97.8, atWord: A(0.7)},
    ],
  }));

M('fade', 'zoneA',
  "Why the gap between the test pages and these? One number explains it: how many bytes in a page aren't zero. In the benchmark, sparse pages have a median of a hundred and twenty seven, and every single one sits under the thousand and twenty four limit. A browser page, at the median, has eleven hundred and seventy nine. For the Python program it's nineteen hundred and sixty seven. So the test pages suit the trick, because each one holds only a few dozen values; live memory mostly doesn't.",
  (A) => ({
    headline: 'Test pages are [far sparser]',
    kind: 'sparsity-ruler',
    token: 'non-zero bytes in one 4 KB page (median)',
    caption: 'How sparse is a page?',
    premise: 'A ruler from 0 to 4,096 non-zero bytes. Sparse mode only works left of the red wall.',
    color: 'orange',
    atWord: A(0.04),
    cells: [
      {label: 'the limit', text: 'limit', value: 1024, atWord: A(0.36)},
      {label: 'benchmark pages', text: 'pop', value: 127, sub: 'all of them under the limit', color: 'green', at: 'In the benchmark,'},
      {label: 'browser', text: 'pop', value: 1179, sub: '55% at or over 1,024', atWord: A(0.5)},
      {label: 'Python', text: 'pop', value: 1967, sub: '98% at or over 1,024', color: 'red', atWord: A(0.6)},
    ],
  }));

M('slide', 'zoneB',
  "And the ratios on that memory. For the browser, FluidRAM reports one point seven nine times, but FluidRAM's allocated figure, the memory a kernel would hand out, is zero point nine five. That's slightly more than the pages themselves. LZ4 gets four point three three, zstd six. For Python, FluidRAM reports one point oh two and allocates zero point five one, against LZ4's two point nine three and zstd's four point eight. Every page did decode back perfectly, all hundred and fifty one thousand of them. So the encoder is correct; it just finds very little to remove, because live pages aren't mostly zeros.",
  (A) => ({
    headline: 'Live memory: [below 1×]',
    kind: 'codec-bars',
    token: '1× = no saving',
    caption: 'Running programs',
    premise: 'Same bars as before, now on pages taken from a browser and a Python program.',
    color: 'red',
    atWord: A(0.04),
    cells: [
      {text: 'Browser', label: 'FluidRAM, reported', value: 1.79, color: 'purple', at: 'FluidRAM reports one point seven'},
      {text: 'Browser', label: 'FluidRAM, allocated', value: 0.95, color: 'red', at: "FluidRAM's allocated figure"},
      {text: 'Browser', label: 'LZ4', value: 4.33, color: 'green', at: 'LZ4 gets'},
      {text: 'Browser', label: 'zstd', value: 6.07, color: 'blue', at: 'zstd six'},
      {text: 'Python', label: 'FluidRAM, reported', value: 1.02, color: 'purple', at: 'For Python, FluidRAM reports'},
      {text: 'Python', label: 'FluidRAM, allocated', value: 0.51, color: 'red', at: 'allocates zero point'},
      {text: 'Python', label: 'LZ4', value: 2.93, color: 'green', at: "against LZ4's"},
      {text: 'Python', label: 'zstd', value: 4.8, color: 'blue', at: "and zstd's four"},
    ],
  }));

M('zoom', 'zoneC',
  "Why do reported and allocated differ? The driver allocates with kmalloc, which hands out fixed boxes rather than exact sizes: thirty two bytes, sixty four, ninety six, up to eight kilobytes. A sparse page of three hundred and ninety five bytes gets a five hundred and twelve byte box. An encoding of three thousand and eighty three bytes takes a whole four kilobyte box. A raw page, four thousand one hundred and eight bytes, is twelve too many, which means eight kilobytes: double the page. zram packs in sixteen byte steps instead.",
  (A) => ({
    headline: 'kmalloc rounds up: [4,108 → 8,192]',
    kind: 'slab-buckets',
    caption: "kmalloc's fixed box sizes",
    premise: 'Each cup is one kmalloc size. A chunk takes the smallest cup it fits, and the whole cup is spent.',
    color: 'orange',
    atWord: A(0.04),
    cells: [
      {label: 'a sparse page', text: 'chunk', value: 395, color: 'green', atWord: A(0.36)},
      {label: 'an encoding', text: 'chunk', value: 3083, color: 'yellow', atWord: A(0.48)},
      {label: 'a raw page', text: 'chunk', value: 4108, color: 'red', atWord: A(0.58)},
      {label: "zram's allocator: 16-byte steps", text: 'zram', sub: 'and a raw page costs exactly 4 KB', atWord: A(0.68)},
    ],
  }));

M('fade', 'zoneA',
  "Speed, then, and here FluidRAM deserves a fair hearing. Reading a sparse page back, the scatter itself takes a hundred and fifty nine nanoseconds. LZ4, for comparison, takes six hundred and fourteen. But every read also runs a checksum over the whole page, because the code wants proof it came back bit for bit. With a table-driven checksum like the kernel's, that's eight thousand three hundred nanoseconds; the bit by bit version the code ships takes twenty six thousand. So the checksum is the cost, not the idea.",
  (A) => ({
    headline: 'Fast scatter, [slow checksum]',
    kind: 'decode-race',
    caption: 'Reading one sparse page back',
    premise: 'One bar per way of reading a sparse page back, to one scale. Shorter is faster.',
    color: 'green',
    atWord: A(0.04),
    cells: [
      {label: 'Scatter only', text: 'lane', value: 159, sub: 'no checksum', color: 'green', atWord: A(0.14)},
      {label: 'LZ4', text: 'lane', value: 614, sub: 'for comparison', color: 'blue', atWord: A(0.24)},
      {label: 'With a table CRC', text: 'lane', value: 8330, sub: 'kernel-style checksum', color: 'orange', atWord: A(0.5)},
      {label: 'As shipped', text: 'lane', value: 26296, sub: 'bit-by-bit checksum', color: 'red', atWord: A(0.6)},
      {label: 'the checksum', text: 'gap', value: 0, atWord: A(0.66)},
    ],
  }));

rec('letterbox', 'zoneB',
  "You'll find the checksum at the bottom of the decompress function: line three oh eight, bit-exact verification. Here the code recomputes a CRC sixteen, which is a sixteen bit fingerprint of the page, and compares it with the one stored when the page was written. zram doesn't run a check like this on every read, and that's why making it optional, or dropping it, is the cheapest speed-up in the whole driver.",
  FLUID,
  [
    {step: 'crc-read', label: 'The checksum on read', camera: [
      {at: 'line three oh eight', frame: 'crcBody', band: true},
      {at: 'recomputes a CRC sixteen', frame: 'crcCmp', band: true},
      {at: "zram doesn't run a check", frame: 'full'}]},
  ]);

// ═══ VI · WHAT THE KERNEL SIDE DOESN'T HANDLE YET ═════════════════════════════════════
M('push', 'zoneC',
  "Now the kernel side. First, a limit. When a FluidRAM pool goes over quota, it tries to borrow " +
  "from its neighbour, then stores the page whether the borrow worked or not, which means nothing stops it growing. " +
  "zram has a setting called mem limit: once the compressed data reaches it, zram refuses the write, and " +
  "the page stays where it was.",
  (A) => ({
    headline: 'No [hard limit]',
    kind: 'no-cap',
    caption: 'fluid_slab.c against zram',
    premise: 'Two stores filling up. Only one of them has a line it will not cross.',
    color: 'red',
    atWord: A(0.04),
    cells: [
      {label: 'FluidRAM pool', text: 'fr', sub: 'borrow failed? stores it anyway', atWord: A(0.14)},
      {label: 'zram with mem_limit', text: 'zram', sub: 'full: the write is refused', atWord: A(0.5)},
      {label: 'mem_limit', text: 'limit', atWord: A(0.56)},
    ],
  }));

M('iris', 'zoneA',
  "Second, there's a deadlock waiting to happen. Writing a page takes the pool's own lock, then the " +
  "neighbour pool's lock, to borrow. With two devices, CPU zero writing to pool zero takes lock zero, then " +
  "reaches for lock one. At the same moment, CPU one, writing to pool one, takes lock one and reaches for " +
  "lock zero. Each is holding exactly what the other needs, so both wait forever. Kernel code avoids that " +
  "with one agreed order: always take the lower-numbered lock first.",
  (A) => ({
    headline: 'Two locks, [opposite order]',
    kind: 'abba-lock',
    caption: 'An ABBA deadlock',
    premise: 'Two CPUs, two locks. A solid arrow means holding; a dashed one means waiting.',
    color: 'purple',
    atWord: A(0.04),
    cells: [
      {label: 'CPU 0', text: 'cpu0', sub: 'writing to pool 0', atWord: A(0.22)},
      {label: 'CPU 1', text: 'cpu1', sub: 'writing to pool 1', color: 'orange', atWord: A(0.42)},
      {label: 'lock 0', text: 'lockA', atWord: A(0.28)},
      {label: 'lock 1', text: 'lockB', atWord: A(0.32)},
      {label: 'takes its own', text: 'take', atWord: A(0.46)},
      {label: 'reaches for the other', text: 'wait', atWord: A(0.5)},
      {label: 'Each waits for the other, forever', text: 'cycle', atWord: A(0.62)},
    ],
  }));

M('wipe', 'zoneB',
  "Third, errors. The design document says a full driver returns an out of memory error to the program that asked. Follow a page fault down, though. Your program touches memory. Then the CPU faults into the kernel. Next, the kernel needs a free page, so reclaim picks a cold one and writes it to the swap device. If FluidRAM says no there, the error goes back to reclaim; your program was never on the line. When reclaim can't free anything, the OOM killer decides. So a swap device can refuse a page, but it can't hand that error to your program, and it can't save the program from the OOM killer.",
  (A) => ({
    headline: 'The error [never reaches] you',
    kind: 'fault-path',
    caption: "Where would -ENOMEM go?",
    premise: 'A page fault travels down through three layers. Watch where the error stops on the way back.',
    color: 'red',
    atWord: A(0.04),
    cells: [
      {label: 'your program', text: 'band', value: 0},
      {label: 'the kernel', text: 'band', value: 1},
      {label: 'the swap device', text: 'band', value: 2},
      {label: 'touches memory', text: 'stage', value: 0, atWord: A(0.3)},
      {label: 'page fault', text: 'stage', value: 1, sub: 'the CPU traps into the kernel', atWord: A(0.34)},
      {label: 'needs a free page', text: 'stage', value: 1, atWord: A(0.4)},
      {label: 'reclaim picks a cold page', text: 'stage', value: 1, atWord: A(0.44)},
      {label: 'writes it to swap', text: 'stage', value: 2, sub: "FluidRAM's block device", atWord: A(0.5)},
      {label: '-ENOMEM', text: 'error', atWord: A(0.56)},
      {label: 'the error stops in reclaim', text: 'lands', value: 3, atWord: A(0.62)},
      {label: 'the OOM killer decides', text: 'oom', atWord: A(0.68)},
    ],
  }));

rec('letterbox', 'zoneC',
  "And here are both of those in fluid slab dot c. Line one twenty four is the peer to peer borrowing " +
  "check: the pool's own lock is already held, and inside it, the peer pool's lock is taken. Just above, " +
  "at line one seventeen, the allocation asks with GFP kernel, a flag that lets the kernel sleep and go " +
  "looking for free memory to satisfy it. zram asks with flags that won't start new disk traffic, because " +
  "this code runs while the kernel is already trying to free memory.",
  FLUID,
  [
    {step: 'locks', label: 'Two locks, one path', camera: [
      {at: 'Line one twenty four', frame: 'lockBody', band: true},
      {at: 'at line one seventeen', frame: 'gfp', band: true},
      {at: 'zram asks with flags', frame: 'full'}]},
  ]);

// ═══ VII · WHAT COULD GENUINELY WORK ══════════════════════════════════════════════════
M('zoom', 'zoneA',
  "So could the idea work? I think parts of it could, and the fix starts with the name. Make the delta properly differential, because a page rarely changes all at once: keep its last version, and XOR the new one against it. Wherever nothing changed you get zeros, and you send only the lengths of those zero runs, plus the few bytes that did change. QEMU does exactly this when it moves a running virtual machine between hosts, and calls it XBZRLE. For memory that changes a little at a time, it's brilliant.",
  (A) => ({
    headline: 'A true delta: [XOR the last version]',
    kind: 'xbzrle-delta',
    caption: 'Idea 1 · a real delta',
    premise: 'Top, a strip of a page last time. Below, the same strip now. Yellow marks what changed.',
    color: 'green',
    atWord: A(0.04),
    cells: [
      {label: 'the page, last time', text: 'old', atWord: A(0.22)},
      {label: 'the page, now', text: 'new', atWord: A(0.28)},
      {label: 'last XOR now', text: 'xor', atWord: A(0.34)},
      {label: 'what you send', text: 'runs', sub: 'only the zero runs, as lengths', atWord: A(0.42)},
    ],
  }));

M('slide', 'zoneB',
  "Idea two is memory you can regenerate. Linux already has a small version of this. Since Linux four point five, a program can mark pages with MADV free, which means you may drop these under pressure, I'll cope. When memory gets tight, the kernel frees those pages instantly: no disk, no compression. Pages that must keep their bytes still have to go to swap or zram. FluidRAM's fluid idea points at a richer contract: pages that can be rebuilt from a recipe instead of stored, like a cache or a decoded image. That's where the name could earn itself.",
  (A) => ({
    headline: 'Memory you can [rebuild]',
    kind: 'memory-contract',
    caption: 'Idea 2 · a memory contract',
    premise: 'A shelf of pages, each tagged with what the kernel may do with it when memory runs low.',
    color: 'green',
    atWord: A(0.04),
    cells: [
      {label: 'MADV_FREE: may drop', text: 'drop', value: 14, sub: 'Linux 4.5 and later: freed with no disk trip', atWord: A(0.26)},
      {label: 'memory gets tight', text: 'sweep', atWord: A(0.42)},
      {label: 'must keep', text: 'keep', value: 12, sub: 'still has to go to swap or zram', atWord: A(0.66)},
      {label: 'can be rebuilt', text: 'rebuild', value: 10, sub: 'a recipe instead of the bytes', atWord: A(0.7)},
    ],
  }));

M('push', 'zoneC',
  "And the third is to use the fast part where it wins. The hundred and fifty nine nanosecond scatter beats LZ4 on a mostly empty page. So put a sorting line in front of a proper compressor. Pages that are all zeros store nothing, pages with only a few bytes go to the scatter, and everything else goes on to LZ4 or zstd. zram already has the first stage, because zero pages are that common. The middle one is a contribution waiting to be measured.",
  (A) => ({
    headline: 'Use the scatter [where it wins]',
    kind: 'fast-path',
    caption: 'Idea 3 · a fast path',
    premise: 'Pages ride along the line. Each diamond asks one question; a yes drops the page into that bin.',
    color: 'green',
    atWord: A(0.04),
    cells: [
      {label: 'all zeros?', text: 'gate', sub: 'store nothing', atWord: A(0.4)},
      {label: 'a few bytes?', text: 'gate', sub: 'scatter tuples · 159 ns', color: 'green', atWord: A(0.48)},
      {label: 'everything else', text: 'rest', sub: 'LZ4 or zstd', atWord: A(0.58)},
    ],
  }));

M('wipe', 'zoneA',
  "If the author wants the next benchmark to be convincing, and I hope they do, five changes would do it. " +
  "Load fluidram dot k o in the virtual machine. Test on memory from live programs, not generated pages. " +
  "Count the bytes kmalloc hands out, not the encoded length. Draw every chart from the results file. And " +
  "race it side by side with zram, zstd and zswap, because that's the bar a new idea has to clear.",
  (A) => ({
    headline: 'Five fixes for [a convincing test]',
    kind: 'roadmap',
    caption: 'From driver to chart',
    premise: 'A circuit from the driver to the chart. Each stop is one change to the benchmark.',
    color: 'blue',
    atWord: A(0.04),
    cells: [
      {label: 'Load fluidram.ko in the VM', text: 'step', sub: 'measure the driver itself', icon: 'lucide:cpu', atWord: A(0.26)},
      {label: 'Live programs, not generated pages', text: 'step', sub: 'memory as it really looks', icon: 'lucide:app-window', atWord: A(0.36)},
      {label: 'Count allocated bytes', text: 'step', sub: 'kmalloc boxes, not encoded length', icon: 'lucide:ruler', atWord: A(0.48)},
      {label: 'Chart from the results file', text: 'step', sub: 'no typed-in bars', icon: 'lucide:chart-line', atWord: A(0.58)},
      {label: 'Race zram, zstd and zswap', text: 'step', sub: 'the bar a new idea has to clear', icon: 'lucide:gauge', atWord: A(0.66)},
    ],
  }));

M('fade', 'zoneB',
  "So, is four times more RAM real? Not from this code, not yet. Its numbers come from typed-in charts, a simulator with fixed answers, and a driver that wasn't loaded. But the idea is worth building, the encoder is correct on every page I threw at it, and the author's own audit was honest about what's modeled. Most projects start from somewhere much worse.",
  (A) => ({
    headline: 'Verdict: [a good idea], unproven',
    kind: 'verdict',
    caption: 'Where FluidRAM stands',
    premise: 'Three things to judge separately: the idea, the code and the numbers.',
    color: 'blue',
    atWord: A(0.04),
    cells: [
      {label: 'The numbers', text: 'item', sub: 'typed in, simulated, driver not loaded', icon: 'lucide:chart-column', value: 'Modeled', color: 'red', atWord: A(0.2)},
      {label: 'The idea', text: 'item', sub: 'fluid pools and memory you can rebuild', icon: 'lucide:lightbulb', value: 'Worth building', color: 'green', atWord: A(0.48)},
      {label: 'The code', text: 'item', sub: '0 mismatches in 151,334 pages', icon: 'lucide:cpu', value: 'Correct', color: 'yellow', atWord: A(0.56)},
    ],
  }));

c.add('OUTRO_CTA', 'fade', 'zoneA',
  "Both of Aditya's repositories are linked in the description. Go and read the code, and if you try the " +
  "fast path idea, I'd love to see your numbers. Which part would you build first?",
  (A) => ({
    headline: 'Which part would you build first?',
    subtext: 'Both repositories are linked below',
    atWord: A(0.5),
  }));

const spec = {
  meta: {
    topic: 'FluidRAM Claims 4x More RAM on Linux — I Tested the Code',
    format: 'long',
    fps: 30,
    subject: 'FluidRAM',
    // render-long guesses `<first slug word>_long`; the voice files are `fluidram-tested_long_sNN`.
    audioPrefix: 'fluidram-tested_long',
    topicAxes: ['entity-novelty', 'myth-busting'],
    screenplay: 'documentary',
    onePayoff: 'where every FluidRAM headline number comes from, what the encoder does on live memory, and what could make the idea work',
    openLoop: 'Does four times more RAM hold up on a real workload?',
    analogy: 'Pools of memory that lend each other room, like water finding its level between tanks.',
    seo: {
      title: "Did Someone Just Solve the RAM Crisis? FluidRAM’s 4× More RAM, Tested",
      altTitles: ["FluidRAM Is Here: 4× More RAM From the Memory You Already Have?","Could This End the Global Memory Crisis? FluidRAM, Tested","FluidRAM Claims 4× More RAM on Linux — I Tested the Code"],
      hook: "RAM has become expensive, with AI data centres buying up memory. So when an open-source Linux project promises 4× more RAM from the memory you already own, it deserves a proper look. FluidRAM, by Aditya Raj, claims 4× more memory, zero swap and up to 35× density. We read the driver, traced where every headline number comes from, ran its encoder on memory from a browser and a Python program beside LZ4 and zstd, and found the ideas that could make software-made memory work.",
      description: "FluidRAM, an open-source Linux memory project by Aditya Raj, promises 4× more RAM and zero swap at a time when RAM prices are climbing. We read the driver, traced where each headline number comes from, ran the encoder on memory from a browser and a Python program beside LZ4 and zstd, and looked at what could make the idea work: true deltas, rebuildable memory, and a zero-page fast path.",
      breakdown: "whether software can really stretch your RAM: pages, swap and zram from zero; the Galois-field encoder; where 4.12× and 35× come from; our own test on a browser’s memory; the kernel gaps; and three ideas that could make it work",
      pinned: "RAM is not getting cheaper soon. Which idea would you build first to stretch it: true deltas, rebuildable memory, or the zero-page fast path?",
      tags: [
        "RAM prices", "memory crisis", "AI memory", "DRAM", "RAM shortage", "more RAM", "Linux RAM",
        'FluidRAM', 'AdiOS', 'Linux memory', 'zram', 'zswap', 'swap', 'memory compression',
        'Linux kernel', 'page fault', 'OOM killer', 'thrashing', 'kmalloc', 'zsmalloc', 'LZ4', 'zstd',
        'Galois field', 'GF(2^8)', 'XOR delta', 'XBZRLE', 'MADV_FREE', 'deadlock', 'lock ordering',
        'benchmark', 'open source review', 'operating systems', 'computer science', 'systems programming',
        'Linux 6.6', 'block device driver', 'memory management',
      ],
      queries: [
        'does FluidRAM really give 4x RAM',
        'how does zram work',
        'what is a Galois field in compression',
        'kmalloc size classes explained',
        'FluidRAM vs zram',
        "will RAM prices go down", "can software give you more RAM", "how to get more RAM on Linux",
      ],
      sources: [
        'github.com/adityarajIITj/adios — AdiOS by Aditya Raj (MIT), commit 0a85d38',
        'github.com/adityarajIITj/fluidram — FluidRAM by Aditya Raj (GPL-2.0), commit bbecc61',
        'Linux v6.6 — drivers/block/zram/zram_drv.c, include/linux/blkdev.h',
        'man7.org — madvise(2), MADV_FREE',
        'qemu.org — XBZRLE (devel/migration)',
        'LZ4 v1.10.0 reference C; zstd via python-zstandard 0.25',
      ],
    },
  },
  brand: c.brand(),
  thumbnail: {title: "THE END OF THE RAM CRISIS?",badge: "FluidRAM",note: "BY ADITYA RAJ · TESTED",asset: "img:fluidram_ram_hero.png",art: "img:fluidram_ram_hero.png"},
  scenes: c.S,
};

c.emit('topics/fluidram-tested/long.json', spec);
