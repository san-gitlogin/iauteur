// Open Code Review — VERTICAL CUT (~40s). One idea only: a one-character bug that three
// Google reviewers approved, and the free tool that found it blind. Every claim is in
// briefs/opencodereview/00-dossier.md and 02-blindrun.md. Same beginner rule as the wide cut
// (01-plain-language.md): a variable is a box, nil is an empty box, and nothing is assumed.
import {short} from '../../scripts/lib/apple-build.mjs';

const c = short();

const wordIndex = (narration, phrase) => {
  const norm = (x) => x.replace(/[^\w']/g, '').toLowerCase();
  const w = narration.split(/\s+/), p = phrase.split(/\s+/);
  for (let i = 0; i < w.length; i++) if (p.every((x, j) => norm(w[i + j] ?? '') === norm(x))) return i + 1;
  throw new Error(`camera phrase not found in narration: "${phrase}"`);
};

const LOCAL = 'recorded on this machine · ocr v1.12.4 · Claude Code 2.1.274';

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

c.add('HOOK', 'dip', 'zoneA',
  "Google shipped this bug. Their reviewers approved it. One character caused it.",
  (A) => ({
    headline: 'One character shipped a bug',
    subtext: 'and a free tool found it blind',
    hookVariant: 'reveal',
    atWord: A(0.5),
  }));

c.add('CODE_RUN', 'fade', 'zoneA',
  "A variable is just a labelled box. This one's called err — short for error. Now look at that " +
  "colon before the equals sign. It makes a brand new box, right there.",
  (A) => ({
    codeRun: {
      filename: 'stream.go',
      language: 'go',
      resultLabel: 'what it means',
      color: 'red',
      atWord: A(0.06),
      lines: [
        {text: 'if err := recv(...); err == nil {', detail: 'the colon makes a NEW box',
          sub: 'a second err, born right here', label: 'new box', atWord: A(0.5)},
        {text: '}', detail: 'the block ends', sub: 'and the new box ends with it', atWord: A(0.72)},
        {text: 'if err == io.EOF {', detail: 'but which err is this?', sub: 'the old one', atWord: A(0.78)},
      ],
    },
    source: 'grpc/grpc-go stream.go at 6d0aaaec',
  }));

c.add('VAR_SCOPE', 'slide', 'zoneA',
  "The real error drops into that new box. Then the brackets close — and a box made inside " +
  "brackets dies with them. It's gone, and everything in it goes too.",
  (A) => ({
    varScope: {
      outerLabel: 'err',
      outerSub: 'the function\'s box — still empty',
      innerLabel: 'err',
      innerSub: 'made by the colon',
      fenceLabel: 'if err := recv(...) { }',
      emptyLabel: 'nil',
      valueLabel: 'the real error',
      steps: [
        {title: 'outer', label: 'old box', sub: 'the function already has an err', atWord: A(0.08)},
        {title: 'fence', label: 'inside', sub: 'now we are inside the brackets', atWord: A(0.16)},
        {title: 'inner', label: 'new box', sub: 'a second box, same name', atWord: A(0.2)},
        {title: 'fill', label: 'filled', sub: 'the real error goes in here', atWord: A(0.3)},
        {title: 'vanish', label: 'gone', sub: 'the brackets close, and it is swept away', atWord: A(0.6)},
      ],
      color: 'red',
      atWord: A(0.04),
    },
  }));

c.add('VAR_SCOPE', 'fade', 'zoneA',
  "Two lines later the code asks for err. It reads the only box left, the old one. Empty. " +
  "So a failed call reports success.",
  (A) => ({
    varScope: {
      outerLabel: 'err',
      outerSub: 'the only box left',
      innerLabel: 'err',
      innerSub: 'gone',
      fenceLabel: 'if err := recv(...) { }',
      emptyLabel: 'nil — empty',
      askLabel: 'if err == io.EOF',
      verdict: 'empty — reports success',
      steps: [
        {title: 'outer', label: 'old box', sub: 'still empty, never filled', atWord: A(0.06)},
        {title: 'ask', label: 'err?', sub: 'the code asks for err again', atWord: A(0.22)},
        {title: 'verdict', label: 'empty', sub: 'it finds nothing, so it says all is well', atWord: A(0.52)},
      ],
      caption: 'a failed call reports success',
      color: 'red',
      atWord: A(0.04),
    },
  }));

blind('letterbox', 'zoneB',
  "Alibaba's free reviewer found both, blind, in two minutes — then fixed them the same way " +
  "the maintainers did.",
  LOCAL,
  [{step: 'review', at: 0.06, label: 'found blind, in two minutes'}]);

c.add('OUTRO_CTA', 'fade', 'zoneA',
  "Open Code Review. Free, open licence, runs inside Claude Code. Full test on the channel.",
  (A) => ({
    headline: 'Open Code Review',
    subtext: 'free · Apache-2.0 · full test on the channel',
    atWord: A(0.4),
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
      pinned: 'One character. Which one would you have spotted?',
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
    badge: 'grpc-go',
    frames: 2,
  },
  scenes: c.S,
};

c.emitShort('topics/open-code-review/shorts.json', spec);
