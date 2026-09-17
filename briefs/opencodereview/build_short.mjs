// Open Code Review — VERTICAL CUT (~45s). One idea: a one-character bug that Google shipped, and
// the free reviewer that found it blind. Claims live in briefs/opencodereview/00-dossier.md and
// 02-blindrun.md; the beginner rule is 01-plain-language.md — a variable is a box, nil is an empty
// box, and nothing is assumed.
//
// Structure is set by two linter laws the first draft broke: SHOW THE RESULT BEFORE THE METHOD (a
// recorded beat inside the first three scenes), and SHOW THE SOURCE OF TRUTH (the project's own
// page on camera, because a cut that reviews a thing and never opens it asks for trust it has not
// earned).
import {short} from '../../scripts/lib/apple-build.mjs';
import {MANIFEST} from '../../scripts/lib/manifest.mjs';

const c = short();

const wordIndex = (narration, phrase) => {
  const norm = (x) => x.replace(/[^\w']/g, '').toLowerCase();
  const w = narration.split(/\s+/), p = phrase.split(/\s+/);
  for (let i = 0; i < w.length; i++) if (p.every((x, j) => norm(w[i + j] ?? '') === norm(x))) return i + 1;
  throw new Error(`camera phrase not found in narration: "${phrase}"`);
};

// `add` already wraps a body in the manifest's data_key; unwrap one accidental level.
const add = (type, transition, bg, narration, mk = () => ({}), opts) =>
  c.add(type, transition, bg, narration, (A, n, str) => {
    const body = mk(A, n, str) ?? {};
    const key = MANIFEST[type]?.data_key;
    if (!key || !body[key]) return body;
    const {[key]: inner, ...rest} = body;
    return {...inner, ...rest};
  }, opts);

const LOCAL = 'ocr v1.12.4 · Claude Code 2.1.274';
const OCRGH = 'alibaba/open-code-review · github.com · Apache-2.0';

const rec = (defTake) => (transition, bg, narration, source, clips) =>
  c.add('RECORDED_STEP', transition, bg, narration, (A) => ({
    clips: clips.map((k) => ({
      ref: `rec:${k.take ?? defTake}#${k.step}`, label: k.label, focus: k.focus ?? false, atWord: A(k.at ?? 0.05),
      ...(k.pivot ? {wantAtWord: wordIndex(narration, k.pivot)} : {}),
      zooms: (k.camera ?? []).map((m) => (m.frame === 'full'
        ? {at: 'full', wantAtWord: wordIndex(narration, m.at)}
        : {marks: [].concat(m.frame), ...(m.band ? {band: true} : {}), wantAtWord: wordIndex(narration, m.at)})),
      callouts: [],
    })),
    sourceNote: source,
  }));

const blind = rec('ocr-blind');
const gh = rec('ocr-gh');

// 1 · HOOK — names the subject at second zero.
add('HOOK', 'dip', 'zoneA',
  "Open Code Review just caught a bug Google shipped.",
  (A) => ({
    headline: 'Open Code Review',
    subtext: 'it caught a bug Google shipped',
    headlineAtWord: 1,
    heroAtWord: A(0.6),
  }));

// 2 · THE RESULT FIRST — the finding, before any explanation.
blind('letterbox', 'zoneB',
  "One finding, marked high. Two places. On a pull request Google reviewed, approved and merged.",
  LOCAL,
  [{step: 'review', at: 0.1, label: 'found blind'}]);

// 3 · the colon
add('CODE_RUN', 'fade', 'zoneA',
  "A variable is a labelled box you drop a value into, and this box is called err — short for " +
  "error. Now look at the tiny colon before the equals sign. That colon builds a brand new box.",
  (A) => ({
    codeRun: {
      filename: 'stream.go',
      language: 'go',
      resultLabel: 'what it means',
      color: 'red',
      atWord: A(0.06),
      lines: [
        {text: 'if err := recv(...); err == nil {', detail: 'the colon makes a NEW box',
          sub: 'a second err, born here', label: 'new', atWord: A(0.44)},
        {text: 'if err == io.EOF {', detail: 'which err is this?', sub: 'the old one', atWord: A(0.74)},
      ],
      caption: 'one character, and the meaning inverts',
    },
    source: 'grpc/grpc-go stream.go at 6d0aaaec',
  }));

// 4 · the box vanishes
add('VAR_SCOPE', 'slide', 'zoneA',
  "The real error drops into the new box. Then the brackets close — and a box built inside " +
  "brackets dies with them.",
  (A) => ({
    varScope: {
      outerLabel: 'err',
      outerSub: "the function's box",
      innerLabel: 'err',
      innerSub: 'made by the colon',
      fenceLabel: 'if err := recv(...) { }',
      emptyLabel: 'nil',
      valueLabel: 'the real error',
      steps: [
        {title: 'outer', label: 'old box', sub: 'the function already has an err', atWord: A(0.06)},
        {title: 'inner', label: 'new box', sub: 'a second box, same name', atWord: A(0.14)},
        {title: 'fill', label: 'filled', sub: 'the real error goes in here', atWord: A(0.26)},
        {title: 'vanish', label: 'gone', sub: 'the brackets close, and it is swept away', atWord: A(0.62)},
      ],
      color: 'red',
      source: 'grpc/grpc-go, fixed by commit 5c4da090',
      atWord: A(0.04),
    },
  }));

// 5 · the verdict
add('VAR_SCOPE', 'fade', 'zoneA',
  "So the next line reaches for err and finds the old box, never filled. Empty. A failed call " +
  "reports success.",
  (A) => ({
    varScope: {
      outerLabel: 'err',
      outerSub: 'the only box left',
      innerLabel: 'err',
      innerSub: 'gone',
      emptyLabel: 'nil — empty',
      askLabel: 'if err == io.EOF',
      verdict: 'empty — reports success',
      steps: [
        {title: 'outer', label: 'old box', sub: 'never filled', atWord: A(0.1)},
        {title: 'ask', label: 'err?', sub: 'the code asks for err again', atWord: A(0.3)},
        {title: 'verdict', label: 'empty', sub: 'it finds nothing, so it says all is well', atWord: A(0.62)},
      ],
      caption: 'a failed call reports success',
      color: 'red',
      atWord: A(0.04),
    },
  }));

// 6 · SOURCE OF TRUTH — the project's own page, said out loud.
gh('slide', 'zoneB',
  "Here's the official page. Alibaba built Open Code Review, Apache licensed and free.",
  OCRGH,
  [{step: 'about', at: 0.12, label: 'the official page',
    camera: [{frame: 'licence', at: 'Apache licensed'}]}]);

// 7 · outro
add('OUTRO_CTA', 'fade', 'zoneA',
  "Open Code Review runs inside Claude Code. Full test on the channel.",
  () => ({
    message: 'Full test on the channel',
    sub: 'github.com/alibaba/open-code-review',
  }));

const spec = {
  meta: {
    topic: 'Open Code Review — the one-character bug Google shipped',
    format: 'short',
    fps: 30,
    subject: 'Open Code Review',
    audioPrefix: 'open-code-review_short',
    onePayoff: 'a one-character scope bug that shipped in gRPC, and the free reviewer that found it blind',
    openLoop: 'How does one colon hide a bug from three reviewers?',
    topicAxes: ['entity-novelty'],
    screenplay: 'documentary',
    seo: {
      title: 'One Character Shipped This Bug #golang #codereview',
      altTitles: [
        'Google Approved This Bug. One Colon Caused It. #golang',
        'The One-Character Bug That Got Past Google #programming',
      ],
      hook:
        'A single colon turned a caught error into a silent success in Google\'s gRPC library. It was reviewed, ' +
        'approved, merged, and fixed a week later. Alibaba\'s free open-source reviewer found it blind.',
      description:
        'A variable-scope bug in grpc/grpc-go: err := inside an if creates a new variable, so the check two lines ' +
        'later reads the function\'s own nil return value and reports success. Found blind by Open Code Review.',
      breakdown: 'the colon, the box that disappears, and the tool that caught it',
      pinned: 'One character. Would you have spotted it?',
      tags: [
        'golang', 'go programming', 'code review', 'AI code review', 'Open Code Review', 'gRPC',
        'variable shadowing', 'programming bugs', 'Claude Code', 'software engineering', 'developer tools',
      ],
      queries: ['go variable shadowing bug', 'AI code review tool', 'grpc-go bug'],
      sources: [
        'github.com/alibaba/open-code-review — Open Code Review (Apache-2.0)',
        'github.com/grpc/grpc-go/pull/7461 — the pull request that shipped the bug',
        'github.com/grpc/grpc-go/commit/5c4da090 — the maintainers\' own fix',
      ],
    },
  },
  brand: c.brand(),
  thumbnail: {
    title: 'ONE CHARACTER SHIPPED THIS BUG',
    badge: 'Open Code Review',
    note: 'found blind · Apache-2.0',
  },
  cover: {
    title: 'ONE CHARACTER SHIPPED THIS BUG',
    badge: 'Open Code Review',
    frames: 2,
  },
  scenes: c.S,
};

c.emitShort('topics/open-code-review/shorts.json', spec);
