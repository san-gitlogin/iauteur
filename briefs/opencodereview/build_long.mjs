// Open Code Review — Alibaba's reviewer, tested against a bug Google shipped. WIDE CUT.
//
// Every claim traces to briefs/opencodereview/00-dossier.md (the repo's own README, the two PNGs
// it embeds, the GitHub and npm APIs) or to 02-blindrun.md (the two reviews we actually ran).
//
// THE RULE THAT GOVERNS THIS SCRIPT is 01-plain-language.md. Owner, 2026-09-17: "beginners will be
// watching... narrate to the viewers like they are 5." Every technical word is defined in the same
// breath it first appears — code review, pull request, diff, token, variable, nil, scope. Where a
// beat needed two definitions it was SPLIT rather than compressed. Runtime is free; a lost viewer
// is not.
//
// BUDGET DISCIPLINE (LAW 0e.6 / the linter's dwell rule): a beat earns 16s at two anchored
// elements and six more seconds per anchor after that, so words <= 3.1 x earned seconds. Every
// drawn beat below is cast for a component that can carry ENOUGH ANCHORS for what it has to say —
// adding anchors, never trimming the teaching (owner: "i dont want you to take any sort of easy
// path").
//
// Takes: ocr-gh (the repository page), ocr-setup (install), ocr-rules (the checklists),
// ocr-control (a good pull request), ocr-proof (the PR and the answer key), ocr-blind (the test).
import {cut} from '../../scripts/lib/apple-build.mjs';
import {MANIFEST} from '../../scripts/lib/manifest.mjs';

const c = cut();

const wordIndex = (narration, phrase) => {
  const norm = (x) => x.replace(/[^\w']/g, '').toLowerCase();
  const w = narration.split(/\s+/), p = phrase.split(/\s+/);
  for (let i = 0; i < w.length; i++) if (p.every((x, j) => norm(w[i + j] ?? '') === norm(x))) return i + 1;
  throw new Error(`camera phrase not found in narration: "${phrase}"`);
};

const OCRGH = 'alibaba/open-code-review · github.com · Apache-2.0';
const GRPC = 'grpc/grpc-go · github.com · Apache-2.0';
const LOCAL = 'ocr v1.12.4 · Claude Code 2.1.274';
const BENCH = 'AACR-Bench, published by Alibaba · Claude-4.6-Opus rows';

const rec = (defTake) => (transition, bg, narration, source, clips) =>
  c.add('RECORDED_STEP', transition, bg, narration, (A) => ({
    clips: clips.map((k) => ({
      ref: `rec:${k.take ?? defTake}#${k.step}`, label: k.label, focus: true, atWord: A(k.at ?? 0.05),
      ...(k.pivot ? {wantAtWord: wordIndex(narration, k.pivot)} : {}),
      ...(k.source ? {sourceNote: k.source} : {}),
      zooms: (k.camera ?? []).map((m) => (m.frame === 'full'
        ? {at: 'full', wantAtWord: wordIndex(narration, m.at)}
        : {marks: [].concat(m.frame), ...(m.band ? {band: true} : {}), wantAtWord: wordIndex(narration, m.at)})),
      callouts: [],
    })),
    sourceNote: source,
  }));

// `cut().add` already wraps a beat's body in the manifest's data_key, so a body authored as
// {varScope: {...}} lands at data.varScope.varScope and every required field reads as missing.
// This unwraps one accidental level and folds any siblings (e.g. `source`) into the inner object,
// which is where the manifest examples keep them.
const add = (type, transition, bg, narration, mk = () => ({}), opts) =>
  c.add(type, transition, bg, narration, (A, n, str) => {
    const body = mk(A, n, str) ?? {};
    const key = MANIFEST[type]?.data_key;
    if (!key || !body[key]) return body;
    const {[key]: inner, ...rest} = body;
    return {...inner, ...rest};
  }, opts);

const gh = rec('ocr-gh');
const setup = rec('ocr-setup');
const rules = rec('ocr-rules');
const control = rec('ocr-control');
const blind = rec('ocr-blind');
const proof = rec('ocr-proof');

// ═══ 1 · HOOK ═══════════════════════════════════════════════════════════════════
add('HOOK', 'dip', 'zoneA',
  "Open Code Review is free. We gave it a bug that Google shipped.",
  (A) => ({
    headline: 'Open Code Review',
    subtext: 'the free reviewer that caught what Google missed',
    headlineAtWord: 1,
    heroAtWord: A(0.55),
  }));

// ═══ 2 · TITLE — 2 anchors, ~50 words ═══════════════════════════════════════════
add('TITLE_CARD', 'fade', 'zoneA',
  "Welcome back. Today we install Alibaba's code reviewer, plug it into Claude Code, and point it " +
  "at two real pull requests from Google. One is fine. The other hid a bug for a week. Can a " +
  "machine find what three professional reviewers walked straight past?",
  () => ({
    title: 'Two pull requests. One hidden bug.',
    subtitle: 'Open Code Review, installed and tested live',
  }));

// ═══ I · WHAT IT IS ═════════════════════════════════════════════════════════════

// 3 · the repository page. 2 clips + 4 zooms = 6 anchors → 40s → ~124 words.
gh('letterbox', 'zoneB',
  "Let's start where anyone sensible starts, which is the project's own page on GitHub. GitHub is " +
  "where programmers keep their code, and a page like this is called a repository — think of it as " +
  "the project's folder, holding every file and its whole history. Look at who publishes this one. " +
  "That's Alibaba. Underneath sits the description, and they've written it plainly: fast, " +
  "efficient, battle-tested at Alibaba's scale. Over on the right, the licence reads Apache two " +
  "point oh, which matters more than it sounds. Apache two point oh means free, readable, and " +
  "usable at work without asking anyone's permission.",
  OCRGH,
  [
    {step: 'repo', at: 0.04, label: 'the official page',
      camera: [{frame: 'owner', at: "That's Alibaba", band: true}]},
    {step: 'about', at: 0.45, pivot: 'Underneath sits the description', label: 'description and licence',
      camera: [
        {frame: 'desc', at: "battle-tested at Alibaba's"},
        {frame: 'licence', at: 'the licence reads Apache'},
        {frame: 'licence', at: 'which matters more', band: true},
      ]},
  ]);

// 4 · what a code review IS. 6 anchors → 40s → ~124 words.
add('STEP_FLOW', 'slide', 'zoneA',
  "Before we go further, let's agree on one idea, because everything today rests on it. When a " +
  "programmer finishes a piece of work, they don't drop it straight into the company's product. " +
  "The programmer packages the work up and asks permission, because nobody merges straight into a live product. That package has a name: a pull request. Picture a folder " +
  "with a note on the front saying here's what I changed, please look before you let this in. " +
  "Another programmer reads it and either agrees or asks for changes. That reading is the code review — the last check before code reaches real people.",
  (A) => ({
    steps: [
      {title: 'A change', sub: 'someone writes new code', atWord: A(0.14)},
      {title: 'A pull request', sub: 'here is what I changed', atWord: A(0.3)},
      {title: 'Please look', sub: 'permission asked, not taken', atWord: A(0.44)},
      {title: 'The review', sub: 'another programmer decides', atWord: A(0.58)},
      {title: 'Merged', sub: 'it reaches real users', atWord: A(0.72)},
    ],
    source: 'how every team on GitHub ships code',
  }));

// 5 · where it came from. 1 clip + 2 zooms = 3 anchors → 22s → ~68 words.
gh('fade', 'zoneB',
  "So what is this thing, and why trust it? Here's their answer, in their own words. Open Code " +
  "Review didn't begin as a weekend project. Open Code Review began inside Alibaba as their official internal " +
  "reviewer, and it has run there for two years. Read that line: tens of thousands of developers, " +
  "and millions of defects found. A defect is simply a bug, so that line means millions of real problems caught before anyone shipped them, which is a claim worth testing.",
  OCRGH,
  [{step: 'what', at: 0.08, label: 'where it came from',
    camera: [
      {frame: 'origin', at: 'tens of thousands of developers'},
      {frame: 'origin', at: 'millions of defects found', band: true},
      {frame: 'full', at: 'millions of real problems caught'},
    ]}]);

// 6 · the scale numbers. 4 anchors → 28s → ~87 words.
add('STAT_PANELS', 'slide', 'zoneA',
  "Those numbers deserve a moment, because they're why this is interesting rather than merely new. " +
  "Twenty thousand engineers inside Alibaba use the tool, and between them have run three million reviews. And in the " +
  "last thirty days, people downloaded it three hundred and twenty-nine thousand times. I checked " +
  "that download figure against the registry myself, because internal usage can just be a company " +
  "telling its own staff what to use. Three hundred thousand downloads a month is the rest of the " +
  "world volunteering.",
  (A) => ({
    stats: [
      {kicker: 'Alibaba engineers', value: '20K+', atWord: A(0.14)},
      {kicker: 'Reviews run', value: '3M+', atWord: A(0.24)},
      {kicker: 'Downloads, 30 days', value: '329K', color: 'green', atWord: A(0.36)},
    ],
    verdict: {text: 'the world volunteering', color: 'green', atWord: A(0.62)},
    source: 'alibaba/open-code-review README + npm registry API, 17 Sep 2026',
  }));

// ═══ II · THE CLAIM ═════════════════════════════════════════════════════════════

add('CHAPTER', 'wipe', 'zoneC',
  "Now for the claim that made me want to make this video at all.",
  () => ({chapter: {number: '01', title: 'The claim', subtitle: 'it says it beats Claude Code'}}));

// 8 · the benchmark page. 1 clip + 4 zooms = 5 anchors → 34s → ~105 words.
gh('letterbox', 'zoneB',
  "Here's their benchmark. A benchmark is a test run over many examples so tools can be compared " +
  "fairly, and theirs is a serious one: fifty popular open-source projects, two hundred real pull " +
  "requests, ten programming languages. Then more than eighty senior engineers went through it by " +
  "hand and agreed on fifteen hundred and five genuine bugs. That list of fifteen hundred is the answer key, because without one you cannot score anything. Now, one word before the claim itself. A token is a chunk of text, roughly three-quarters of a word, and " +
  "tokens are what you are billed for. Against Claude Code, on the same model, Alibaba report " +
  "better results using about a ninth of the tokens. That is a very large claim, so the rest of this video is me checking it against real code, on two real pull requests.",
  OCRGH,
  [{step: 'bench', at: 0.05, label: 'the benchmark',
    camera: [
      {frame: 'built', at: 'fifty popular open-source projects'},
      {frame: 'built', at: 'fifteen hundred and five'},
      {frame: 'built', at: 'the answer key', band: true},
      {frame: 'ninth', at: 'one word before the claim', band: true},
      {frame: 'ninth', at: 'a ninth of the tokens'},
      {frame: 'full', at: 'a very large claim'},
    ]}]);

// 9 ★ the findings wall. 3 anchors + narration split so the wall earns its time.
add('REVIEW_YIELD', 'slide', 'zoneA',
  "Here's the number that matters, and it isn't a percentage. On the very same model, Claude Code wrote five thousand nine hundred and eighty comments. Four " +
  "hundred and thirty-five were real bugs. Open Code Review wrote eight hundred and eighty-nine, " +
  "and three hundred and one were real.",
  (A) => ({
    unitLabel: 'one mark = 100 review comments',
    perMark: 100,
    hitLabel: 'a real bug',
    missLabel: 'a false alarm',
    columns: [
      {label: 'Claude Code', sub: 'same model underneath', value: 5980, detail: '435',
        tag: '5,980 written · 435 real', color: 'red', atWord: A(0.26)},
      {label: 'Open Code Review', sub: 'same model underneath', value: 889, detail: '301',
        tag: '889 written · 301 real', color: 'green', atWord: A(0.62)},
    ],
    caption: 'the pile you must sort through is the real cost',
    color: 'yellow',
    source: BENCH,
  }));

// 10 · what the wall costs a person. 2 anchors -> ~50 words.
add('BAR_COMPARE', 'fade', 'zoneA',
  "Forget the benchmark for a second and picture the person. Somebody has to read every comment Claude Code wrote and decide what to do with it. At nearly six thousand, you're discarding about nine in every ten, and " +
  "that costs real minutes and real patience.",
  (A) => ({
    bars: [
      {label: 'Claude Code', value: 100, display: '5,980', color: 'red', atWord: A(0.42)},
      {label: 'Open Code Review', value: 15, display: '889', color: 'green', atWord: A(0.58)},
    ],
    source: BENCH,
  }));

// 10b · time and money. 2 anchors -> ~50 words.
add('BAR_COMPARE', 'slide', 'zoneA',
  "The other columns are blunt too. Claude Code took thirteen minutes per review against one minute twenty-three, and burned five point six million tokens against three hundred and eighty-five thousand. Because tokens are the bill, that gap is money.",
  (A) => ({
    bars: [
      {label: 'Claude Code', value: 100, display: '13m 6s', color: 'red', atWord: A(0.3)},
      {label: 'Open Code Review', value: 10, display: '1m 23s', color: 'green', atWord: A(0.46)},
    ],
    source: BENCH,
  }));

// 11 · the honest ceiling. RULE_TEST carries a rule plus cases = plenty of anchors.
add('RULE_TEST', 'slide', 'zoneC',
  "Now let me be straight with you, because a review that only reads out the good numbers is an " +
  "advert. Flip those same figures around. Open Code Review got about thirty-four percent of its " +
  "comments right, which beats seven by miles — and still means two out of every three things it " +
  "flags are not real bugs. Open Code Review found twenty percent of the known problems, so it missed four in " +
  "five. Claude Code actually found more of them; it simply buried them. Neither tool is anywhere near solved. Open Code Review is a better reviewer, not a finished one.",
  (A) => ({
    ruleTest: {
      kicker: 'read it honestly',
      rule: 'a better reviewer is not a finished one',
      okLabel: 'the win',
      noLabel: 'the ceiling',
      cases: [
        {text: '33.9% precision, up from 7.2%', title: 'ok', sub: 'a real, large improvement', atWord: A(0.26)},
        {text: '2 in 3 flags are still not bugs', title: 'no', sub: 'you still triage', atWord: A(0.44)},
        {text: '20% recall', title: 'no', sub: 'four in five are missed', atWord: A(0.6)},
        {text: 'Claude Code found more, buried', title: 'ok', sub: 'recall is not the whole story', atWord: A(0.72)},
      ],
      caption: 'both numbers are true, and both matter',
      color: 'orange',
      atWord: A(0.06),
    },
  }));

// 12 · whose benchmark. CLAIM_CHECK with a real tally.
add('CLAIM_CHECK', 'fade', 'zoneA',
  "One more thing you should be suspicious about, and I'd rather raise it than have you shout it at " +
  "the screen. This is Alibaba's benchmark, measuring Alibaba's own tool. Always raise an eyebrow " +
  "at that. So here's what shifted my view. Look at who sits top of their leaderboard. Not Alibaba. " +
  "The best score belongs to a model built by Anthropic, a competitor. Alibaba's own Qwen sits " +
  "second, on a chart Alibaba published, and the whole dataset is public so you can check it " +
  "yourself. That doesn't make the benchmark perfect, but publishing a row your own model loses does make it honest.",
  (A) => ({
    claimCheck: {
      headline: 'Whose leaderboard is it?',
      claims: [{text: "Alibaba's benchmark, measuring Alibaba's own tool.", tag: 'the worry', color: 'orange', atWord: A(0.22)}],
      subject: 'Alibaba',
      tallyLabel: 'who actually ranks first',
      hitLabel: 'Alibaba',
      tally: [
        {label: 'Anthropic', value: 0, threshold: 1, atWord: A(0.5)},
        {label: 'Alibaba', value: 1, threshold: 1, color: 'orange', atWord: A(0.62)},
      ],
      verdict: 'Their own model is second',
      verdictAtWord: A(0.72),
      source: BENCH,
      atWord: A(0.06),
    },
  }));

// 12b · the answer key, drawn — a benchmark is only as good as the labels under it
add('PICTOGRAM', 'fade', 'zoneA',
  "One more thing about that benchmark, because it's the part people skip. Eighty senior engineers read two hundred pull requests and agreed on fifteen hundred and five genuine defects. Get that answer key wrong, and every percentage above it is decoration.",
  (A) => ({
    pictogram: {
      rows: [
        {label: 'Real defects found', value: 60, color: 'green', atWord: A(0.4)},
        {label: 'Pull requests read', value: 20, color: 'blue', atWord: A(0.28)},
      ],
      icon: 'lucide:check-check',
      unit: '',
    },
    source: 'AACR-Bench: 1,505 ground-truth issues, 200 PRs, 80+ senior engineers',
  }));

// ═══ III · WHY IT WORKS ═════════════════════════════════════════════════════════

add('CHAPTER', 'wipe', 'zoneC',
  "Which leaves one obvious question. If the model underneath is the same, why are the answers better?",
  () => ({chapter: {number: '02', title: 'Why the same model wins', subtitle: 'the part that is not the model'}}));

// 14 · the three failures. 1 clip + 3 zooms = 4 anchors → 28s → ~87 words.
gh('letterbox', 'zoneB',
  "They answer that here, and they start by naming what goes wrong when a general-purpose assistant " +
  "is handed a large review. Three things. First, it cuts corners, reading some files and quietly skipping others. Second, it drifts, pointing at line two hundred when the problem lives on line four hundred. Third, its quality wobbles, so the same question asked twice gives two different answers. Then comes the " +
  "sentence the whole design grows from: when a language model decides everything, nothing about the " +
  "process is guaranteed.",
  OCRGH,
  [{step: 'pain', at: 0.06, label: 'the three failures',
    camera: [
      {frame: 'three', at: 'reading some files'},
      {frame: 'three', at: 'line two hundred'},
      {frame: 'three', at: 'two different answers', band: true},
    ]}]);

// 15 ★ the split. 6 anchors → 40s → ~124 words.
add('RESPONSIBILITY_SPLIT', 'slide', 'zoneA',
  "Their fix is a split, and once you've seen it you can't unsee it. Parts of a review must never " +
  "be left to a guess, so those parts are done by ordinary, boring, predictable code. Which files " +
  "get read? Code decides. Which files belong together? Code decides. Which checklist fits this " +
  "file? Code decides. Where exactly does a comment get pinned? Code decides. Then the single job " +
  "that genuinely needs judgement — reading these lines and deciding whether they're wrong — that " +
  "one goes to the AI, so the AI never wanders the building. The AI gets one room, one checklist, and " +
  "one question.",
  (A) => ({
    respSplit: {
      leftLabel: 'Ordinary code',
      leftSub: 'same answer every time',
      rightLabel: 'The AI',
      rightSub: 'judgement',
      pileLabel: 'all the review work',
      lines: [
        {text: 'which files get read', title: 'left', sub: 'no guessing', atWord: A(0.26)},
        {text: 'which files belong together', title: 'left', sub: 'no guessing', atWord: A(0.36)},
        {text: 'which checklist fits', title: 'left', sub: 'no guessing', atWord: A(0.46)},
        {text: 'where the comment is pinned', title: 'left', sub: 'no guessing', atWord: A(0.54)},
        {text: 'is this code actually wrong?', title: 'right', sub: 'judgement', atWord: A(0.66)},
      ],
      caption: 'one room, one checklist, one question',
      color: 'purple',
      atWord: A(0.06),
    },
  }));

// 16 · the checklists on camera. 2 clips + 4 zooms = 6 anchors → 40s → ~124 words.
rules('fade', 'zoneB',
  "You don't have to take that on faith either, because you can ask it directly. One command prints " +
  "the exact checklist a file would be handed. Watch what a Go file gets — Go being the language " +
  "this project is written in. The pattern line says star star slash star dot go, meaning this " +
  "checklist applies to Go files only. Then read its opening sentence, because it's remarkable. " +
  "Favour precision over recall. A false positive costs reviewer trust. That's a design decision, " +
  "written in plain English, sitting inside a rule file. Now watch a plain text file instead. " +
  "Pattern: default. Four vague questions — is the logic correct, are there security problems. One file gets a specialist; the other gets a shrug. That difference is the whole product, and it cost nothing to check. Any file the engine does not recognise falls back to those four questions, which is honest, but it is not the thing you are paying for.",
  LOCAL,
  [
    {step: 'gorule', at: 0.06, label: 'what a Go file gets',
      camera: [
        {frame: 'pattern', at: 'star star slash star dot go'},
        {frame: 'trust', at: 'Favour precision over recall'},
        {frame: 'trust', at: 'costs reviewer trust', band: true},
      ]},
    {step: 'mdrule', at: 0.40, pivot: 'Now watch a plain text', label: 'what everything else gets',
      camera: [{frame: 'default', at: 'Pattern: default'}, {frame: 'generic', at: 'Four vague questions'}]},
  ]);

// ═══ IV · INSTALL ═══════════════════════════════════════════════════════════════

add('CHAPTER', 'wipe', 'zoneC',
  "Enough reading. Let's try installing it, and then aim it at real code.",
  () => ({chapter: {number: '03', title: 'Installing it', subtitle: 'two commands, and one you must not skip'}}));

// 18 · install. 3 clips + 3 zooms = 6 anchors → 40s → ~124 words.
setup('letterbox', 'zoneB',
  "One thing needs checking first, and it caught me out. Open Code Review needs Git version two " +
  "point four one or newer. Git is the tool that tracks every change to a project, and an older " +
  "copy makes every command print a warning, so check yours before anything else. After that, " +
  "installing is a single line. That's npm, the installer bundled with Node, and dash g means " +
  "install this for the whole machine rather than one folder. Seconds later we can ask which version arrived. And notice the command itself is only three letters — O, C, R — which is the whole tool, sitting on your machine, ready to be pointed at anything with a git history. No service to sign up for, no dashboard, no seat licence. That matters more than it sounds, because a reviewer you have to justify to someone is a reviewer you quietly stop using.",
  LOCAL,
  [
    {step: 'gitv', at: 0.08, label: 'the one prerequisite',
      camera: [{frame: 'ver', at: 'two point four one'}]},
    {step: 'install', at: 0.28, pivot: 'After that, installing', label: 'a single line',
      camera: [{frame: 'pkg', at: "That's npm"}]},
    {step: 'version', at: 0.50, pivot: 'Seconds later we can ask', label: 'which version arrived',
      camera: [{frame: 'v', at: 'no seat licence'}]},
  ]);

// 19 · the plugin. 2 clips + 3 zooms = 5 anchors → 34s → ~105 words.
setup('fade', 'zoneB',
  "Now the part that makes this genuinely odd. Open Code Review ships a plugin for Claude Code, so " +
  "it runs inside the very tool it just outscored. The first command points Claude Code at " +
  "Alibaba's plugin list, which they call a marketplace. Then the second installs the plugin. " +
  "Successfully added. Successfully installed. No account to create, no key to paste. What we've gained are two slash commands — those are shortcuts you type inside Claude Code to trigger something specific — and one of those two does all the work from here. Everything after this point runs through that one command.",
  LOCAL,
  [
    {step: 'market', at: 0.10, label: 'point it at the list',
      camera: [{frame: 'added', at: 'Successfully added'}]},
    {step: 'plugin', at: 0.48, pivot: 'The second installs', label: 'install the plugin',
      camera: [{frame: 'ok', at: 'Successfully installed'}, {frame: 'ok', at: 'no key to paste', band: true}]},
  ]);

// 20 · the two modes. Honesty beat. 3 anchors → 22s → ~68 words.
add('SPLIT_PATHS', 'slide', 'zoneA',
  "There are two ways to run it, and you need to know which one you're watching. In the first, Open " +
  "Code Review calls a model itself using a key you supply, and that's how the benchmark was " +
  "measured. In the second, called delegation, Claude Code's own model does the judging instead.",
  (A) => ({
    center: {title: 'two ways to run it', atWord: A(0.1)},
    left: {title: 'Open Code Review judges', sub: 'its own key · the benchmark setup', color: 'blue', atWord: A(0.36)},
    right: {title: 'Claude Code judges', sub: 'delegation · no extra key', color: 'green', atWord: A(0.68)},
    source: 'alibaba/open-code-review — Default vs Delegation Mode',
  }));

// 21 · and which one we filmed. Kept separate so the caveat gets its own air.
add('LOWER_THIRD', 'fade', 'zoneC',
  "Delegation is what we're using, and that carries a caveat. The file picking and the checklists " +
  "still come from Open Code Review, so the clever half is theirs — but the judging is Claude " +
  "Code's model, not the benchmark setup.",
  (A) => ({
    lowerThird: {
      kicker: 'ON THE RECORD',
      title: 'Not the benchmark setup',
      subtitle: "their rules, Claude Code's model",
      asset: 'lucide:scale',
      atWord: A(0.4),
    },
  }));

// ═══ V · THE CONTROL RUN ════════════════════════════════════════════════════════

add('CHAPTER', 'wipe', 'zoneC',
  "First, a test most reviews of review tools skip entirely.",
  () => ({chapter: {number: '04', title: 'Test one: good code', subtitle: 'does it stay quiet?'}}));

// 23 · the target. 1 clip + 2 zooms = 3 anchors → 22s → ~68 words.
proof('letterbox', 'zoneB',
  "This is gRPC, a library built and maintained by Google that lets programs on different computers " +
  "talk to each other. A great deal of the internet leans on it. Our first pull request rewrites " +
  "the locking inside a load balancer, and locking is how a program stops two things colliding when " +
  "they run at once.",
  GRPC,
  [{step: 'repo', at: 0.06, label: 'the library under review',
    camera: [{frame: 'name', at: 'This is gRPC'}, {frame: 'name', at: 'rewrites the locking', band: true}]}]);

// 24 · why this one is hard. 4 anchors.
add('RULE_TEST', 'slide', 'zoneA',
  "Locking is the hardest thing in programming to review by eye, because getting it wrong breaks nothing today — it breaks next Tuesday, under load, for one customer, and never while you're watching. Google engineers read this change, approved it, and merged it, and as far " +
  "as anybody knows it's correct. Which makes it the perfect first test, because the right answer " +
  "here is silence.",
  (A) => ({
    ruleTest: {
      kicker: 'the fair first test',
      rule: 'on correct code, the right answer is nothing',
      okLabel: 'what we want',
      noLabel: 'what we fear',
      cases: [
        {text: 'reports nothing', title: 'ok', sub: 'it can tell good code from bad', atWord: A(0.62)},
        {text: 'invents a problem', title: 'no', sub: 'it just wants to look busy', atWord: A(0.78)},
      ],
      caption: 'approved and merged by Google',
      color: 'green',
      atWord: A(0.1),
    },
  }));

// 25 · file selection + bundling. 2 clips + 4 zooms = 6 anchors → 40s → ~124 words.
control('fade', 'zoneB',
  "Watch this first command, because here the predictable half does its whole job on one screen. " +
  "Three reviewable, five total. Open Code Review examined the five changed files and decided only three deserve " +
  "a reviewer's attention — and look at the two crossed out. Those are test files, and Open Code Review prints exactly why it dropped them, because a reason you can read is a decision you can argue with. No model touched that decision. The " +
  "second command fetches the checklists, and notice the heading: rule group one, with all three " +
  "files listed beneath it. Behind that heading, Open Code Review worked out those three files need the same checklist, so they travel together as one job rather than three separate ones. Fewer trips, and the reviewer sees related files side by side, which matters when a change only makes sense across two of them.",
  LOCAL,
  [
    {step: 'preview', at: 0.05, label: 'which files, and why not',
      camera: [
        {frame: 'count', at: 'Three reviewable, five total'},
        {frame: 'dropped', at: 'exactly why it dropped them'},
        {frame: 'dropped', at: 'No model touched', band: true},
      ]},
    {step: 'bundle', at: 0.40, pivot: 'The second command fetches', label: 'three files, one list',
      camera: [{frame: 'group', at: 'rule group one'}]},
  ]);

// 26 · the control review. 1 clip + camera holds; narration sized to 2 anchors → ~50 words.
control('letterbox', 'zoneB',
  "And here's the review itself, running inside Claude Code. Every green dot is a tool call — the " +
  "reviewer deciding what it needs and going to fetch it, out in the open where you can watch. The " +
  "first call is the one we just ran by hand: delegate preview. Three reviewable, five total. The " +
  "second asks for the rules, and there's rule group one again, the Go checklist, five hundred and " +
  "eighty-seven lines of it folded away. The third pulls the actual diff — the list of changed " +
  "lines — five hundred and sixty lines this time. So before a single judgement gets made, the " +
  "reviewer has been handed exactly which files, exactly which checklist, and exactly what " +
  "changed. None of that was guessed.",
  LOCAL,
  [{step: 'tools', at: 0.06, label: 'three tool calls'}]);

// 27b · the thinking, which is the honest part of the run
control('fade', 'zoneB',
  "Then the reviewer stops, and that counter is real — it is still thinking. Twenty-four seconds gone, five hundred and " +
  "thirty-two tokens spent, still going. I want to sit on this for a second, because it is the " +
  "least glamorous thing in the video and the most reassuring. Locking is genuinely hard. A reviewer that answered instantly here would be guessing at it.",
  LOCAL,
  [{step: 'think2', at: 0.08, label: 'it is still thinking'}]);

// 27c · the verdict
control('fade', 'zoneB',
  "About eighty seconds after it started, it comes back. Nothing to report. Nothing high, nothing " +
  "medium, because there was genuinely nothing to say. No hedging, no let-me-flag-this-just-in-case, and no invented concern dressed up to justify the time it spent. It looked properly, and then it said so. Which sounds like nothing happened, and is in fact the hardest behaviour to get out of a tool like this — because saying nothing looks, to whoever is paying, like the tool did nothing.",
  LOCAL,
  [{step: 'verdict2', at: 0.08, label: 'nothing to report'}]);

add('CLAIM_CHECK', 'slide', 'zoneA',
  "Stay with that a second, because watching nothing happen can feel like a let-down. That silence is the product, because silence is a finding too. Open Code Review even listed what it had ruled out: the lock ordering, a write " +
  "it judged safe, a loop variable it judged fine. A reviewer that cannot say nothing gets muted, and a muted reviewer is worse than none, because " +
  "now you believe you're covered when you aren't.",
  (A) => ({
    claimCheck: {
      headline: 'Nothing to report, on code that was right',
      claims: [{text: 'A reviewer that never says nothing gets muted.', tag: 'the point', color: 'green', atWord: A(0.62)}],
      subject: 'high',
      tallyLabel: 'comments produced',
      hitLabel: 'raised',
      tally: [
        {label: 'high', value: 0, threshold: 1, color: 'green', atWord: A(0.18)},
        {label: 'medium', value: 0, threshold: 1, color: 'green', atWord: A(0.26)},
      ],
      verdict: 'Zero noise added to correct code',
      verdictAtWord: A(0.44),
      source: 'delegated review of grpc/grpc-go #9290',
      atWord: A(0.06),
    },
  }));

// ═══ VI · THE BLIND TEST ════════════════════════════════════════════════════════

add('CHAPTER', 'wipe', 'zoneC',
  "Now the real test. A pull request that was already broken when Google merged it.",
  () => ({chapter: {number: '05', title: 'Test two: the blind test', subtitle: 'a bug that shipped'}}));

// 29 · the PR and the answer key. 2 clips + 3 zooms = 5 anchors → 34s → ~105 words.
proof('letterbox', 'zoneB',
  "Here's the second pull request. Somebody at Google wrote it, colleagues reviewed it, and it went " +
  "into gRPC. Read the title: it makes the client report a particular kind of error properly. " +
  "Ordinary, careful work, which is exactly why what follows matters. So how do I know something was wrong with it? Seven days later, this " +
  "commit landed. A commit is one saved change with a note attached. Read that note — fix a bug " +
  "introduced in seven four six one. Seven four six one is the pull request we were just looking " +
  "at. The maintainers are telling us, in writing, that something got through their own review. So " +
  "we have a pull request, and we have proof a bug was hiding in it.",
  GRPC,
  [
    {step: 'pr', at: 0.05, label: 'approved and merged',
      camera: [{frame: 'merged', at: 'it went into gRPC'}]},
    {step: 'fix', at: 0.48, pivot: 'Seven days later', label: 'the answer key',
      camera: [
        {frame: 'msg', at: 'fix a bug introduced'},
        {frame: 'msg', at: 'seven four six one is the pull request'},
        {frame: 'msg', at: 'something got through', band: true},
      ]},
  ]);

// 30 · sealing the test. 2 clips + 3 zooms = 5 anchors → 34s → ~105 words.
blind('fade', 'zoneB',
  "Which hands me a problem, and I want to show you how I dealt with it rather than ask you to " +
  "trust me. If the reviewer can see that fix, this stops being a test and becomes a spoiler. So " +
  "the copy of the project here has been cut back to two commits: the broken one, and the one " +
  "immediately before it. That's the entire history available to it. That fix does not exist in this folder. Then the same command as before — three files to review out of four, the test file " +
  "dropped again. The one that matters is stream dot go, and the reviewer has no idea anything is " +
  "wrong with it, because nothing in this folder says so.",
  LOCAL,
  [
    {step: 'sealed', at: 0.10, label: 'the whole history',
      camera: [{frame: 'two', at: 'two commits'}, {frame: 'two', at: 'does not exist', band: true}]},
    {step: 'preview', at: 0.62, pivot: 'Then the same command', label: 'three files of four',
      camera: [{frame: 'count', at: 'three files to review'}, {frame: 'stream', at: 'stream dot go'}]},
  ]);

// 31 · the rule that predicts it. 1 clip + 2 zooms = 3 anchors → 22s → ~68 words.
rules('slide', 'zoneB',
  "One more thing before we run it, because this is what makes the test fair rather than lucky. " +
  "Here's a rule the reviewer gets handed for every Go file. Errors that are ignored, overwritten, " +
  "or turned into a success — hiding the fact that something failed. Hold that sentence, because it decides the next two minutes. We're about to watch it catch exactly that.",
  LOCAL,
  [{step: 'errrule', at: 0.3, label: 'the rule that matters',
    camera: [{frame: 'swallow', at: 'Errors that are ignored'}, {frame: 'swallow', at: 'something failed', band: true}]}]);

// 32 ★ the blind run. 1 clip; narration sized modestly.
blind('letterbox', 'zoneB',
  "Same command, same tool, no hints. The same three steps go past: which files, which rules, what " +
  "changed. Nothing here knows that this pull request is the broken one — as far as this copy of " +
  "the project is concerned, it is just another change waiting to be read.",
  LOCAL,
  [{step: 'scan', at: 0.08, label: 'the same three steps'}]);

// 33b ★ the finding
blind('fade', 'zoneB',
  "Then the reviewer reads stream dot go, and stops. One finding, marked high — that's the top severity, " +
  "the bucket for real bugs rather than style suggestions. Read the line it wrote: the second recv " +
  "loses its error, so non-streaming client calls report success when they fail. Underneath, it names two places — line eleven twenty-four, and line fourteen forty-four — and I checked both of those line numbers against the file myself.",
  LOCAL,
  [{step: 'finding', at: 0.06, label: 'one finding, marked high'}]);

// 33c · what it says breaks
blind('fade', 'zoneB',
  "And look at the note it left inside the code itself: this err is the function's return value, " +
  "not the recv result. The shadowed err is the whole bug, in one sentence. The report doesn't stop at naming the line either — it spells out what actually breaks. If the server sends a reply and then an error, the " +
  "client never sees that error. If the connection drops on that last read, the call still looks " +
  "like it worked. Three different failures, every one of them turned into silence. And silence, in " +
  "a library this widely used, is the worst possible way for something to go wrong.",
  LOCAL,
  [{step: 'detail', at: 0.05, label: 'what actually breaks'}]);

// 36b · position drift, checked rather than assumed
add('TEST_MATRIX', 'slide', 'zoneA',
  "Remember the README accusing general-purpose assistants of position drift — pointing at one line when the problem is on another. This review gave six line numbers, and all six land exactly where it said. A reviewer you have to double-check costs more than it saves.",
  (A) => ({
    testMatrix: {
      headline: 'Six line numbers, checked by hand',
      rows: ['recvMsg', 'RecvMsg'],
      cols: ['the call', 'the check', 'the return'],
      cells: [
        {r: 0, c: 0, status: 'pass'}, {r: 0, c: 1, status: 'pass'}, {r: 0, c: 2, status: 'pass'},
        {r: 1, c: 0, status: 'pass'}, {r: 1, c: 1, status: 'pass'}, {r: 1, c: 2, status: 'pass'},
      ],
      atWord: A(0.5),
    },
    source: 'stream.go at 6d0aaaec, lines 1124/1127/1130 and 1444/1447/1450',
  }));

// ═══ VII · THE BUG, TAUGHT ══════════════════════════════════════════════════════

// 33 · the box. 3 anchors → 22s → ~68 words.
add('VAR_SCOPE', 'slide', 'zoneA',
  "Let's build this from the smallest idea, because you don't need to know Go to follow it. A variable is a labelled box you put a value into. The box we care about is called err, short for error. If something goes wrong, the error goes in the box. If nothing goes wrong, the box stays empty — and programmers call an empty box nil.",
  (A) => ({
    varScope: {
      title: 'inside the function that receives a reply',
      outerLabel: 'err',
      outerSub: 'a box called err',
      innerLabel: 'err',
      innerSub: 'not yet',
      emptyLabel: 'nil — empty',
      steps: [
        {title: 'outer', label: 'one box', sub: 'a labelled box you put a value into', atWord: A(0.34)},
        {title: 'fence', label: 'empty', sub: 'nothing went wrong, so nothing was put in it', atWord: A(0.72)},
      ],
      caption: 'a variable is a box. nil means the box is empty.',
      color: 'blue',
      atWord: A(0.12),
    },
  }));

// 34 · the one character. CODE_RUN, 7 anchored lines → plenty.
add('CODE_RUN', 'fade', 'zoneA',
  "Here are the two lines that broke gRPC. The first calls a function that fetches the next piece " +
  "of data, and puts whatever happened into err. Two lines down, the code asks a question about " +
  "err — did this finish normally? — and then passes err onwards. Straightforward. Now look very " +
  "carefully at the first line, at the small colon sitting just before the equals sign. That colon " +
  "is the whole bug. Without it, you're putting a value into a box that already exists. With it, " +
  "you're making a brand new box that merely happens to share the name.",
  (A) => ({
    codeRun: {
      filename: 'stream.go',
      language: 'go',
      resultLabel: 'what it means',
      color: 'red',
      atWord: A(0.04),
      lines: [
        {text: 'if err := recv(...); err == nil {', detail: 'fetch the next piece of data',
          sub: 'the colon makes a NEW box', label: 'new box', atWord: A(0.14)},
        {text: '    return protocolViolation()', detail: 'nothing came back, so complain',
          sub: 'this part is fine', atWord: A(0.24)},
        {text: '}', detail: 'the block ends here', sub: 'and the new box ends with it', atWord: A(0.3)},
        {text: 'if err == io.EOF {', detail: 'did this finish normally?',
          sub: 'but which err is this?', label: 'which?', atWord: A(0.36)},
        {text: '    return status()', detail: 'report the real outcome', sub: 'never reached', atWord: A(0.44)},
        {text: '}', detail: '', sub: '', atWord: A(0.48)},
        {text: 'return toRPCErr(err)', detail: 'pass the error onwards',
          sub: 'passes on an empty box', label: 'empty', atWord: A(0.54)},
      ],
      caption: 'one character, and the meaning inverts',
    },
    source: 'grpc/grpc-go stream.go at commit 6d0aaaec, lines 1124–1130',
  }));

// 35 ★★ the vanishing box — the centrepiece. 7 phases = 7 anchors → 46s → ~145 words.
add('VAR_SCOPE', 'slide', 'zoneA',
  "So follow what actually happens. The function already owns a box called err, and it's empty. We " +
  "step inside the if — those curly brackets — and the colon makes a second box, also called err. " +
  "Whatever that fetch returned drops into the new box. So far, so good. Then the if finishes, " +
  "and here's the thing about a box made inside brackets: when the brackets close, the box is gone. " +
  "Swept away, with everything in it. Two lines later the code asks for err again. The new box no " +
  "longer exists, so it reads the only box left, the old one from outside. That box was never " +
  "filled, so that box is still empty. The code checks whether anything went wrong, looks inside an empty " +
  "box, finds nothing, and cheerfully reports success. The error wasn't handled — the error was dropped on " +
  "the floor.",
  (A) => ({
    varScope: {
      title: 'the same name, two different boxes',
      outerLabel: 'err',
      outerSub: "the function's own box — never filled",
      innerLabel: 'err',
      innerSub: 'made by the colon',
      fenceLabel: 'if err := recv(...) { }',
      emptyLabel: 'nil — empty',
      valueLabel: 'the real error',
      askLabel: 'if err == io.EOF',
      verdict: 'empty, so it reports success',
      steps: [
        {title: 'outer', label: 'the old box', sub: 'the function already owns an err, and it is empty', atWord: A(0.08)},
        {title: 'fence', label: 'step inside', sub: 'now we are inside the curly brackets', atWord: A(0.18)},
        {title: 'inner', label: 'a new box', sub: 'the colon makes a SECOND box, also called err', atWord: A(0.26)},
        {title: 'fill', label: 'filled', sub: 'the real answer drops into the new box', atWord: A(0.34)},
        {title: 'vanish', label: 'gone', sub: 'the brackets close, and the box is swept away', atWord: A(0.46)},
        {title: 'ask', label: 'err?', sub: 'two lines later the code asks for err again', atWord: A(0.58)},
        {title: 'verdict', label: 'empty', sub: 'it reads the only box left, and nothing was ever put in it', atWord: A(0.7)},
      ],
      caption: 'a failed call now reports success',
      color: 'red',
      source: 'grpc/grpc-go stream.go, the defect fixed by commit 5c4da090',
      atWord: A(0.04),
    },
  }));

// 36 · why nobody caught it. PIPELINE_GATE.
add('PIPELINE_GATE', 'fade', 'zoneA',
  "Don't programmers have tools? They do, which is why this bug is nasty. Nothing about that line is illegal, so the compiler — which turns code into what a machine runs — is happy. Go's checker is happy, the tests pass. Every light green, code wrong.",
  (A) => ({
    pipelineGate: {
      headline: 'Every light [green]',
      proposerLabel: 'the change',
      gateLabel: 'every check',
      outputLabel: 'shipped to users',
      passLabel: 'passes',
      rejectLabel: 'nothing was turned back',
      checks: ['the compiler', "Go's checker", 'the tests', 'three reviewers'],
      footNote: 'valid code can still be wrong code',
      color: 'orange',
      atWord: A(0.4),
    },
  }));

// 37 · the irony. REVEAL is 2 anchors → keep to ~50 words.
add('REVEAL', 'slide', 'zoneC',
  "And now the part that made me sit back. Read that pull request title once more. Its entire " +
  "purpose was to make the client report one particular error properly. This bug throws that exact " +
  "error away.",
  (A) => ({
    reveal: {
      statement: 'It broke the thing it was written to do.',
      sub: 'the error it existed to deliver is the one that vanishes',
      atWord: A(0.55),
    },
  }));

// 38 · the decency beat. Not optional.
add('LOWER_THIRD', 'fade', 'zoneA',
  "One more thing, and I mean it. This is not a story about an engineer having a bad day. Several experienced people approved this change because it reads as correct — and it reads correct to me. A colon is small, and the eye slides over it.",
  (A) => ({
    lowerThird: {
      kicker: 'TO BE CLEAR',
      title: 'About review, not the author',
      subtitle: 'a colon is very small',
      asset: 'lucide:heart-handshake',
      atWord: A(0.3),
    },
  }));

// ═══ VIII · THE FIX ═════════════════════════════════════════════════════════════

// 39 · it fixed it, and what Google shipped. 3 clips + 3 zooms = 6 anchors → 40s → ~124 words.
blind('letterbox', 'zoneB',
  "Open Code Review didn't stop at telling us, either. That slash command does two jobs: it reviews, then it " +
  "repairs whatever it's confident about. Ask the project what changed and stream dot go has been " +
  "edited. Here's the repair it wrote — the line is back to the older form, where the answer goes " +
  "into the box that already exists instead of making a new one. No colon. So does that match what " +
  "Google actually did? Here's their real fix, seven days later. Not character for character; they " +
  "restructured it a little differently. Same bug though, same two places, same outcome. a machine and a team of maintainers, a week apart, reached the same conclusion.",
  LOCAL,
  [
    {take: 'ocr-fix', step: 'changed', at: 0.10, label: 'it edited the file',
      camera: [{frame: 'mod', at: 'stream dot go has been edited'}]},
    {take: 'ocr-fix', step: 'patch', at: 0.38, pivot: "Here's the repair it wrote", label: 'the repair',
      camera: [{frame: 'fix', at: 'No colon'}]},
    {take: 'ocr-proof', step: 'realfix', at: 0.66, pivot: "Here's their real fix", label: 'what Google shipped',
      source: GRPC, camera: [{frame: 'line', at: 'Same bug though'}]},
  ]);

// 41b · what happens to a finding before you ever see it
add('CHECK_SWEEP', 'slide', 'zoneA',
  "There's a step in that slash command worth knowing about, because it happens before anything " +
  "reaches your screen. Every comment gets sorted into three buckets. High is an obvious bug or a " +
  "security problem. Medium is a fair concern that depends on context. Low is a nitpick or a likely " +
  "false alarm — and Low gets thrown away without ever being shown to you. Discarding them is a deliberate choice, and the same choice as the benchmark: fewer things said, so the things said get read.",
  (A) => ({
    checkSweep: {
      headline: 'Three buckets, and one is [discarded]',
      subjectLabel: 'every comment',
      checks: [
        {label: 'High — a real bug', atWord: A(0.3)},
        {label: 'Medium — it depends', atWord: A(0.42)},
        {label: 'Low — discarded unseen', atWord: A(0.54)},
      ],
      caughtIndex: 2,
      caughtNote: 'never shown to you',
      fixNote: 'dropped on purpose',
      verdict: 'fewer, so they get read',
      color: 'purple',
      atWord: A(0.08),
    },
    source: 'the plugin\'s own review workflow, plugins/open-code-review/claude-code/commands',
  }));

// ═══ IX · WHO IT IS FOR ═════════════════════════════════════════════════════════

add('CHAPTER', 'wipe', 'zoneC',
  "So who is this actually for — developers, testers, the person running the team — and where does it fit in a normal week?",
  () => ({chapter: {number: '06', title: 'Who this is for', subtitle: 'developers, testers, team leads'}}));

add('ICON_GRID', 'slide', 'zoneA',
  "If you write code, this is a second pair of eyes before you trouble a colleague — and being told " +
  "your own mistake in private costs nothing but a minute. If you review other people's code, it " +
  "clears the dull layer so your attention goes where only a human helps — whether the design is " +
  "right at all. If you test software, it reads paths your tests never covered. And if you run a " +
  "team, the honest pitch isn't replacing review. Rather, every change gets the same first pass " +
  "at three in the morning, when whoever would have caught it is asleep.",
  (A) => ({
    iconGrid: {
      items: [
        {icon: 'lucide:code', label: 'Developers', atWord: A(0.06)},
        {icon: 'lucide:eye', label: 'Reviewers', color: 'green', atWord: A(0.28)},
        {icon: 'lucide:flask-conical', label: 'Testers', atWord: A(0.52)},
        {icon: 'lucide:users', label: 'Team leads', color: 'orange', atWord: A(0.64)},
        {icon: 'lucide:graduation-cap', label: 'Learners', atWord: A(0.82)},
      ],
      cols: 5,
    },
  }));

add('LAYERED_STACK', 'fade', 'zoneA',
  "Open Code Review isn't only for your keyboard, either. That same reviewer plugs into the robots " +
  "that check every proposed change — GitHub Actions, GitLab, Gerrit — works with Codex, Cursor and " +
  "Kimi, and scans whole files when nobody understands the codebase any more.",
  (A) => ({
    stack: {
      headline: 'The same reviewer, wherever the code is',
      layers: [
        {label: 'Your pipeline', sub: 'GitHub Actions, GitLab, Gerrit'},
        {label: 'Your editor', sub: 'Claude Code, Codex, Cursor'},
        {label: 'Whole-file scans', sub: 'for code nobody has touched'},
        {label: 'Structured output', sub: 'JSON you can feed anywhere', color: 'green'},
      ],
      signal: 'down',
      atWord: A(0.14),
    },
  }));

// 43 · final honesty. SPEC_COMPARE with correct a/b shape.
add('SPEC_COMPARE', 'slide', 'zoneC',
  "Before you go and install it, here's what I'd want a friend to tell me. Two pull requests is a " +
  "demonstration, not a measurement. I chose them, I ran each once, and I didn't retry anything to " +
  "get a prettier answer. Open Code Review still misses most bugs — four in five, remember — and " +
  "most of what it flags still isn't real. And the judging you watched came from Claude Code's model, not the benchmark setup. So my claim is narrower: it stayed quiet on good code, and on a change " +
  "that fooled several professionals it found what they missed and repaired it.",
  (A, n, nar) => ({
    compare: {
      headline: 'What this showed, and what it did not',
      a: {name: 'Shown', color: 'green'},
      b: {name: 'Not shown', color: 'orange'},
      rows: [
        {label: 'Silence on good code', a: 'Yes', b: '—', winner: 'a', atWord: A(0.62)},
        {label: 'A shipped bug, blind', a: 'Yes', b: '—', winner: 'a', atWord: A(0.7)},
        {label: 'A success rate', a: '—', b: 'No', winner: 'b', atWord: A(0.36)},
        {label: 'The benchmark setup', a: '—', b: 'No', winner: 'b', atWord: wordIndex(nar, 'the benchmark setup')},
      ],
      atWord: A(0.12),
    },
  }));

// 43b · a chapter for the close, and a recap of the three things that happened
add('CHAPTER', 'wipe', 'zoneC',
  "So let's put the whole thing back together, because three separate things happened today.",
  () => ({chapter: {number: '07', title: 'What actually happened', subtitle: 'three results, honestly'}}));

add('RECAP', 'slide', 'zoneA',
  "First, pointed at a pull request Google had already approved, Open Code Review said nothing — and nothing was correct. Second, pointed at one they later had to fix, with that fix hidden, it found the bug, named both places and repaired it. Third, the repair matched what the maintainers landed a week later. None of that is magic, and all of it took two minutes.",
  (A) => ({
    heading: 'Two pull requests, two honest answers',
    points: [
      {text: 'Correct code: nothing reported', atWord: A(0.14)},
      {text: 'Broken code: found it blind', atWord: A(0.4)},
      {text: 'Its repair matched the maintainers', atWord: A(0.66)},
    ],
  }));

// 44 · outro
add('OUTRO_CTA', 'fade', 'zoneA',
  "Everything's linked below, so you can check every number I've said out loud. If you've inherited " +
  "a repository you don't fully trust, point Open Code Review at that one first. More agent tooling " +
  "next time.",
  () => ({
    message: 'More agent tooling next time',
    sub: 'github.com/alibaba/open-code-review — Apache-2.0',
  }));

const spec = {
  meta: {
    topic: "Open Code Review — Alibaba's reviewer, tested against a bug Google shipped",
    format: 'long',
    fps: 30,
    subject: 'Open Code Review',
    audioPrefix: 'open-code-review_long',
    onePayoff: 'whether a free AI reviewer can catch a real bug that human reviewers at Google approved and shipped',
    openLoop: 'Can a machine find what three professional reviewers walked straight past?',
    topicAxes: ['entity-novelty', 'workflow'],
    screenplay: 'documentary',
    seo: {
      title: 'An Open Source CLI Tool That Beats Claude Code At Code Reviews',
      altTitles: [
        'I Gave Alibaba\'s AI Reviewer A Bug Google Missed',
        'Open Code Review: Beats Claude Code, Then Installs Inside It',
        'The Free AI Code Reviewer That Found What Google Missed',
      ],
      hook:
        'Alibaba open-sourced the code reviewer that reads Alibaba\'s own code — 33.9% precision against Claude ' +
        "Code's 7.2% on the same model, on about a ninth of the tokens. Then it ships as a Claude Code plugin. We " +
        'install it, point it at a correct pull request from Google\'s gRPC library (it stays silent), and then at ' +
        'one that was merged with a bug in it and fixed a week later — without letting it see the fix.',
      description:
        'Open Code Review is Alibaba\'s internal AI code review tool, now Apache-2.0 and free. We install it, add ' +
        'the Claude Code plugin, read its built-in rulesets on camera, and run two tests on real pull requests from ' +
        'grpc/grpc-go. Includes a full beginner-level explanation of the variable-scope bug it found, and an honest ' +
        'look at what the benchmark numbers do and do not mean.',
      breakdown:
        'what a code review is, where Open Code Review came from, the AACR-Bench numbers and what they honestly ' +
        'mean, the deterministic-plus-agent split, the built-in rulesets on camera, installing the CLI and the ' +
        'Claude Code plugin, a control run on correct code, a blind test on a pull request that shipped a bug, the ' +
        "bug explained from first principles, and the repair compared with the maintainers' own fix",
      pinned: 'The bug was one character — a colon. Which repository are you pointing this at first?',
      tags: [
        'Open Code Review', 'Alibaba', 'AI code review', 'code review', 'Claude Code', 'Claude Code plugin',
        'static analysis', 'gRPC', 'grpc-go', 'Go programming', 'variable shadowing', 'developer tools',
        'open source', 'code quality', 'pull request review', 'CI CD', 'GitHub Actions', 'software testing',
        'QA automation', 'AI agents', 'agentic coding', 'software engineering', 'code review automation',
      ],
      queries: [
        'AI code review tool open source',
        'Open Code Review Alibaba tutorial',
        'best AI code reviewer 2026',
        'Claude Code plugins',
        'automated pull request review',
      ],
      sources: [
        'github.com/alibaba/open-code-review — Open Code Review by Alibaba (Apache-2.0)',
        'npmjs.com/package/@alibaba-group/open-code-review — the CLI installed in this video',
        'huggingface.co/datasets/Alibaba-Aone/aacr-bench — the benchmark dataset',
        'github.com/grpc/grpc-go/pull/9290 — the correct pull request used as a control',
        'github.com/grpc/grpc-go/pull/7461 — the pull request that shipped the bug',
        'github.com/grpc/grpc-go/commit/5c4da090 — the maintainers\' own fix',
      ],
    },
  },
  brand: c.brand(),
  thumbnail: {
    title: 'OPEN SOURCE CLI THAT BEATS CLAUDE CODE',
    badge: 'Open Code Review',
    note: 'IN CODE REVIEWS',
    art: 'img:ocr-trending.png',
    asset: 'img:ocr-trending.png',
  },
  scenes: c.S,
};

c.emit('topics/open-code-review/long.json', spec);
