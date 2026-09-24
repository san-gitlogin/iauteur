// Agent Skills — the Prove-It pattern. WIDE CUT.
//
// Every claim comes from briefs/agentskills/00-dossier.md (measured on this machine) or from
// briefs/agentskills/01-ab-finding.md (the two recorded agent runs, read out of Claude Code's
// own transcripts). The rule governing the script is in the finding doc: the skill did not make
// the agent smarter — both arms reached the maintainer's own mechanism — it made the agent PROVE
// it. Nothing here claims more than one run can carry.
//
// Takes: askills-gh (the repository page), askills-files (one skill, on disk), askills-install,
// askills-bug (the sealed bench), askills-control + askills-control-diff (run one),
// askills-invoked (run two), askills-key (both fixes against upstream).
import {cut} from '../../scripts/lib/apple-build.mjs';

const c = cut();

const wordIndex = (narration, phrase) => {
  const norm = (x) => x.replace(/[^\w']/g, '').toLowerCase();
  const w = narration.split(/\s+/), p = phrase.split(/\s+/);
  for (let i = 0; i < w.length; i++) if (p.every((x, j) => norm(w[i + j] ?? '') === norm(x))) return i + 1;
  throw new Error(`camera phrase not found in narration: "${phrase}"`);
};

const SKILLS = 'addyosmani/agent-skills · MIT · 98,799 stars at time of recording';
const SLUGIFY = 'sindresorhus/slugify · MIT · recorded at commit 2acf5b3';

const rec = (defTake) => (transition, bg, narration, source, clips) =>
  c.add('RECORDED_STEP', transition, bg, narration, (A) => ({
    clips: clips.map((k) => ({
      ref: `rec:${k.take ?? defTake}#${k.step}`, label: k.label, focus: true, atWord: A(k.at ?? 0.05),
      ...(k.source ? {sourceNote: k.source} : {}),
      zooms: (k.camera ?? []).map((m) => (m.frame === 'full'
        ? {at: 'full', wantAtWord: wordIndex(narration, m.at)}
        : {marks: [].concat(m.frame), ...(m.band ? {band: true} : {}), wantAtWord: wordIndex(narration, m.at)})),
      callouts: [],
    })),
    sourceNote: source,
  }));

const gh = rec('askills-gh');
const files = rec('askills-files');
const install = rec('askills-install');
const bug = rec('askills-bug');
const control = rec('askills-control');
const cdiff = rec('askills-control-diff');
const invoked = rec('askills-invoked');
const key = rec('askills-key');

// ── 1 · HOOK ──────────────────────────────────────────────────────────────────────────
c.add('HOOK', 'dip', 'zoneA',
  "Agent Skills is installed. Twenty-four tests passed. The bug was still there.",
  (A) => ({
    headline: 'Agent Skills, tested',
    subtext: 'twenty-four tests passed — the bug was still there',
    heroAsset: 'lucide:flask-conical',
    hookVariant: 'statement',
    headlineAtWord: 1,
    heroAtWord: A(0.55),
  }));

// ── 2 · Greeting, intent, the loop ────────────────────────────────────────────────────
c.add('TITLE_CARD', 'fade', 'zoneA',
  "Welcome back. Today we're installing Agent Skills — a pack of twenty-five engineering workflows for AI coding " +
  "agents — and then we're pointing it at a library that's genuinely broken. We'll run the same bug twice. Once " +
  "we just tell the agent what's wrong. Once we tell it to use the testing skill. Same bug, same code, one " +
  "sentence different. And the thing that changes isn't the answer — it's whether anything ever got proved.",
  (A) => ({
    title: 'Same bug, twice. One sentence apart.',
    subtitle: 'Agent Skills, installed and tested live',
    atWord: A(0.4),
  }));

// ═══ I · WHAT IT IS ════════════════════════════════════════════════════════════════════
// ── 3 · The repository page. LAW: the source of truth, on camera, early. ──────────────
gh('letterbox', 'zoneB',
  "So what is Agent Skills? This is its page on GitHub, which is where programmers keep their code. A page like " +
  "this is called a repository — think of it as the project's folder, holding every file and its whole history. " +
  "Look at who publishes it. That's Addy Osmani, a well-known engineer at Google. The description underneath is " +
  "one line: production-grade engineering skills for AI coding agents. Scroll down and the project draws its own " +
  "diagram of the six phases it covers, from define, through plan, build, verify and review, all the way to ship. " +
  "Nine slash commands sit under those phases, and twenty-five skills sit under those. " +
  "Now read this part carefully, because the whole video turns on it. Under key design choices, they write: " +
  "anti-rationalization. Every skill ships a table of the excuses an agent makes to skip a step, with the " +
  "counter-arguments written out. And then the line I want you to hold onto: verification is non-negotiable, " +
  "and seems right is never sufficient. Remember that sentence. We're going to watch it get broken, by an agent " +
  "with this very pack installed. The licence is MIT, which means free to read, free to use, including at work.",
  SKILLS,
  [
    {step: 'repo', label: 'the official page', at: 0.02, source: SKILLS,
     camera: [{frame: 'owner', at: "That's Addy Osmani", band: true}]},
    {step: 'about', label: 'the one-line description', at: 0.28,
     camera: [{frame: 'desc', at: 'production-grade engineering skills', band: true}]},
    {step: 'lifecycle', label: 'the six phases, drawn', at: 0.42},
    {step: 'commands', label: 'nine slash commands', at: 0.56},
    {step: 'design', label: 'the design choices', at: 0.66,
     camera: [{frame: 'anti', at: 'anti-rationalization', band: true},
              {frame: 'seems', at: 'seems right is never sufficient', band: true},
              {frame: 'full', at: 'Remember that sentence'}]},
    {step: 'licence', label: 'the licence', at: 0.92},
  ]);

// ── 4 · What a skill actually IS ──────────────────────────────────────────────────────
c.add('FILE_TREE', 'fade', 'zoneA',
  "Before we install anything, let's clear up what a skill even is, because the word sounds like software and it " +
  "isn't. Here's the folder for the testing skill. One directory, and inside it, one file. That's the whole skill. " +
  "It's a markdown file — markdown is just plain text with a bit of formatting, the same stuff a README is written " +
  "in. No code, no plugin to compile, nothing to run. Sixteen and a half kilobytes of writing, and that is the " +
  "entire product.",
  (A) => ({
    headline: 'One skill, one file',
    nodes: [
      {name: 'skills/', depth: 0, kind: 'folder', atWord: A(0.30)},
      {name: 'test-driven-development/', depth: 1, kind: 'folder', atWord: A(0.36)},
      {name: 'SKILL.md', depth: 2, kind: 'file', color: 'green', atWord: A(0.44)},
    ],
    highlight: 2,
    atWord: A(0.30),
  }));

// ── 5 · The real file, on disk ────────────────────────────────────────────────────────
files('push', 'zoneB',
  "And here it is for real. Twenty-five skills in the pack, and the testing one holds a single file of sixteen " +
  "thousand five hundred and seventeen bytes. Open it, and the top of the file is the part that matters. Those " +
  "first few lines between the dashes are called frontmatter — a small block of settings at the head of a text " +
  "file. There are two things in it. A name. And a description. " +
  "That description is not documentation. It's the trigger. Further down sits the rule the whole skill exists to " +
  "enforce, and it's worth reading slowly: write the test first, it must fail, and a test that passes immediately " +
  "proves nothing. One more line, near the top, that I like a lot — never assume a default like npm test. The " +
  "skill refuses to guess how your project runs its tests, and tells the agent to go and find out.",
  SKILLS,
  [
    {step: 'count', label: 'twenty-five skills', at: 0.03},
    {step: 'onedir', label: 'one file, and its size', at: 0.13,
     camera: [{frame: 'bytes', at: 'thousand five hundred', band: true}]},
    {step: 'frontmatter', label: 'the name and the trigger', at: 0.38,
     camera: [{frame: 'name', at: 'And a description', band: true}]},
    {step: 'trigger', label: 'the rule it enforces', at: 0.63,
     camera: [{frame: 'rule', at: 'proves nothing', band: true}]},
    {step: 'stack', label: "it won't guess your tools", at: 0.83},
  ]);

// ── 6 · Description = trigger, and the trap hiding in it ──────────────────────────────
c.add('AGENT_HARNESS', 'morph', 'zoneA',
  "So here's how it's supposed to work. When you install the pack, every skill's description gets handed to the " +
  "agent — all twenty-five of them, sitting in its context. Context just means everything the model can currently " +
  "see. You ask for something, the agent looks down that list, and when your request matches a description, it " +
  "loads that file's body and follows it. " +
  "Now hold on to the exact shape of that sentence, because there's a gap in it that cost us a whole take to find. " +
  "Being handed a list is not the same as acting on it. A menu on the table doesn't mean anybody ordered. " +
  "Twenty-five descriptions can sit in front of the model for the entire session, and nothing whatsoever obliges " +
  "it to pick one up.",
  (A) => ({
    agent: 'the agent',
    rings: [
      {label: '25 descriptions', chips: ['name', 'description']},
      {label: 'the skill body', chips: ['the workflow']},
    ],
    guardrail: {label: 'nothing invokes it', ring: 1, reason: 'a menu is not an order'},
    atWord: A(0.55),
  }));

// ── 7 · The six phases ────────────────────────────────────────────────────────────────
c.add('DIAGRAM', 'slide', 'zoneA',
  "The twenty-five skills are grouped into six phases, and they follow a project the way you'd actually build one. " +
  "Define is where you work out what you're making. Plan breaks it into pieces. Build is the code itself, and " +
  "that's where our testing skill lives. Verify proves it works. Review is the quality gate before anything merges. " +
  "And ship is getting it out the door. Nine of those skills have a slash command in front of them — a shortcut " +
  "you type to call one directly. We're going to use exactly one skill, from the build phase, and use it properly.",
  (A) => ({
    layout: 'flow',
    direction: 'horizontal',
    nodes: [
      {id: 'd', label: 'Define', sub: 'what are we making', atWord: A(0.18)},
      {id: 'p', label: 'Plan', sub: 'break it down', atWord: A(0.28)},
      {id: 'b', label: 'Build', sub: 'the testing skill', color: 'green', atWord: A(0.34)},
      {id: 'v', label: 'Verify', sub: 'prove it works', atWord: A(0.47)},
      {id: 'r', label: 'Review', sub: 'the quality gate', atWord: A(0.53)},
      {id: 's', label: 'Ship', sub: 'out the door', atWord: A(0.62)},
    ],
    edges: [
      {from: 'd', to: 'p', kind: 'straight'}, {from: 'p', to: 'b', kind: 'straight'},
      {from: 'b', to: 'v', kind: 'straight'}, {from: 'v', to: 'r', kind: 'straight'},
      {from: 'r', to: 's', kind: 'straight'},
    ],
  }));

// ═══ II · THE BENCH ════════════════════════════════════════════════════════════════════
c.add('CHAPTER', 'wipe', 'zoneB',
  "Right. Enough reading. Let's install this thing and point it at something that's actually broken.",
  () => ({number: '01', title: 'Install it. Break it.', subtitle: 'a real library, at a real commit'}));

// ── 9 · The install ───────────────────────────────────────────────────────────────────
install('slide', 'zoneB',
  "Installation is one line. This is the project folder we'll be working in — a real library, nothing of ours in " +
  "it yet. Now watch. That command pulls the pack down and fans every skill out to more than twenty different " +
  "agents at once, whichever ones you happen to use. When it finishes, twenty-five skills have landed. " +
  "And look how Claude Code actually sees them — those arrows mean symbolic links, which are pointers to a file " +
  "rather than copies of it. One folder, many agents reading from it. It also writes a lock file, pinning the " +
  "exact version of the pack you installed, so your teammates get the same one.",
  SKILLS,
  [
    {step: 'before', label: 'the project, untouched', at: 0.04},
    {step: 'add', label: 'one line installs the pack', at: 0.17},
    {step: 'count', label: 'twenty-five landed', at: 0.44},
    {step: 'wired', label: 'symlinks, not copies', at: 0.56,
     camera: [{frame: 'link', at: 'those arrows mean symbolic links', band: true}]},
    {step: 'lock', label: 'and a lockfile', at: 0.82},
  ]);

// ── 10 · What the library does, and the counter's one job ─────────────────────────────
c.add('DIAGRAM', 'fade', 'zoneA',
  "The library is called slugify, and its job is small and easy to picture. You give it the title of a page, and " +
  "it gives you back the bit that goes in the web address — lowercase, no spaces, no punctuation. That bit is " +
  "called a slug. So hello world becomes hello-world. " +
  "Now, two different pages can obviously have the same title, and they can't both live at the same address. So " +
  "slugify ships a counter — a version that remembers what it's handed out, and sticks a number on the end when " +
  "something repeats. Ask it for foo twice and the second one comes back as foo-2. " +
  "The counter has exactly one job. Never hand out the same slug twice. That's the entire contract, and it's the " +
  "only thing we're going to test.",
  (A) => ({
    layout: 'flow',
    direction: 'horizontal',
    nodes: [
      {id: 't', label: 'Hello World!', sub: 'a page title', atWord: A(0.10)},
      {id: 's', label: 'slugify', sub: 'the library', color: 'blue', atWord: A(0.16)},
      {id: 'g', label: 'hello-world', sub: 'the web address', color: 'green', atWord: A(0.26)},
      {id: 'a', label: 'asked again?', sub: 'same title twice', atWord: A(0.46)},
      {id: 'n', label: 'foo-2', sub: 'the counter adds one', color: 'orange', atWord: A(0.60)},
    ],
    edges: [
      {from: 't', to: 's', kind: 'straight'},
      {from: 's', to: 'g', kind: 'straight'},
      {from: 'g', to: 'a', kind: 'curve'},
      {from: 'a', to: 'n', kind: 'straight'},
    ],
  }));

// ── 11 · The sealed bench, the bug, and the green suite ───────────────────────────────
bug('letterbox', 'zoneB',
  "Here's our bench. This is slugify's real code, parked at one specific commit — a commit is a saved point in a " +
  "project's history, and this one is the version just before the maintainer fixed the bug we're about to hunt. " +
  "So the bug is genuinely here, and the fix genuinely isn't. " +
  "Three lines, that's all it takes. Ask for a slug for foo, and you get foo. Ask again, and the counter does its " +
  "job: foo-2. Now ask for a completely different title — foo space two — and look at what comes back. Foo-2. " +
  "Again. Two different titles, one address. The one thing the counter exists to prevent. " +
  "And now the part I actually care about. Let's run the library's own test suite — the set of automated checks " +
  "the maintainer wrote. Twenty-four tests passed. Exit code zero, which is how a program says everything's fine. " +
  "Twenty-four green ticks, and the bug is sitting right there underneath them.",
  SLUGIFY,
  [
    {step: 'sealed', label: 'parked just before the fix', at: 0.03,
     camera: [{frame: 'sha', at: 'one specific commit', band: true}]},
    {step: 'what', label: 'three calls', at: 0.30},
    {step: 'repro', label: 'the same slug, twice', at: 0.38,
     camera: [{frame: 'dupe', at: 'Foo-2. Again', band: true}]},
    {step: 'suite', label: "the library's own tests", at: 0.68,
     camera: [{frame: 'green', at: 'Twenty-four tests passed', band: true}]},
    {step: 'exit', label: 'a clean exit code', at: 0.87},
  ]);

// ── 12 · Why a green suite proves nothing here ────────────────────────────────────────
c.add('TEST_RUNNER', 'morph', 'zoneA',
  "Sit with that for a second, because it's the whole argument of this video. Every test the maintainer wrote " +
  "passes. The suite is completely green. And the software is broken anyway. " +
  "That isn't a criticism of the tests — they're good tests. It's just that a test can only ever check the thing " +
  "somebody thought to check. Nobody had thought to ask whether a counted slug could collide with a plain one. So " +
  "there's no test for it, and a green suite says nothing at all about it. " +
  "Green doesn't mean correct. Green means nothing you asked about is broken.",
  (A) => ({
    headline: 'Green means: nothing you asked about',
    nodes: [
      {name: 'slugify', depth: 0, kind: 'describe', status: 'pass', atWord: A(0.14)},
      {name: 'counter', depth: 1, kind: 'it', status: 'pass', ms: 3, atWord: A(0.20)},
      {name: 'leading underscore', depth: 1, kind: 'it', status: 'pass', ms: 2, atWord: A(0.24)},
      {name: 'not vulnerable to ReDoS', depth: 1, kind: 'it', status: 'pass', ms: 4, atWord: A(0.28)},
      {name: 'a counted slug hitting a plain one', depth: 1, kind: 'it', status: 'skip', atWord: A(0.55)},
    ],
    passed: 24,
    failed: 0,
    atWord: A(0.14),
  }));

// ── 13 · The blind spot, in the code ──────────────────────────────────────────────────
c.add('CODE_DIFF', 'slide', 'zoneA',
  "And here's the reason, in the code itself. The counter keeps one thing: a map of every title it's been given, " +
  "and how many times. A map is just a lookup table — this input, that count. " +
  "But look at what it never keeps. It never writes down the slugs it actually handed out. So when foo comes in " +
  "twice, it makes foo-2 and gives it away, and that slug is gone from its memory the moment it leaves. Then a " +
  "different title, foo space two, arrives. The counter looks it up, has never seen it, calls it a first-timer, " +
  "and hands back foo-2 for the second time. " +
  "One missing list. That's the entire bug.",
  (A) => ({
    fileName: 'index.js',
    rows: [
      {kind: 'ctx', text: 'export function slugifyWithCounter() {'},
      {kind: 'ctx', text: '  const occurrences = new Map();  // titles seen'},
      {kind: 'del', text: '  // nothing records the slugs already handed out'},
      {kind: 'ctx', text: '  const countable = (string, options) => {'},
      {kind: 'ctx', text: '    const counter = occurrences.get(stringLower);'},
      {kind: 'ctx', text: '    return string;  // may belong to another title'},
      {kind: 'ctx', text: '  };'},
    ],
    stat: {plus: 0, minus: 1},
    atWord: A(0.2),
  }));

// ═══ III · RUN ONE ═════════════════════════════════════════════════════════════════════
c.add('CHAPTER', 'wipe', 'zoneB',
  "So let's give it to the agent. Run one: we just ask. We tell it what's broken, and let it work however it " +
  "likes — with the skills installed the whole time.",
  () => ({number: '02', title: 'Run one: just ask', subtitle: 'the skills are installed the whole time'}));

// ── 15 · The control run ──────────────────────────────────────────────────────────────
control('push', 'zoneB',
  "Here's exactly what we asked, and notice what isn't in it. There's no mention of skills, no slash command, " +
  "nothing about testing. Just a plain bug report, the kind you'd paste into a chat: the counter hands out the " +
  "same slug twice, here are the three lines that show it, please fix it. " +
  "And the skills are installed and visible the entire time — twenty-five of them, right there. " +
  "Now we let it run. What you're watching is Claude Code streaming its work as it goes: every line that scrolls " +
  "past is a tool call, which just means the agent reaching out and doing something — reading a file, running a " +
  "command, editing code. You don't have to follow every line. Watch for one thing only: what it reaches for " +
  "first, and whether a test ever shows up before the fix does. It thinks for about forty seconds, and it does " +
  "arrive at an answer — a confident one, written out at the end in full sentences. Hold your judgement on that " +
  "answer until we've looked underneath it.",
  SLUGIFY,
  [
    {step: 'ask', label: 'a plain bug report', at: 0.04},
    {step: 'skills', label: 'all twenty-five, installed', at: 0.55,
     camera: [{frame: 'n', at: 'twenty-five of them', band: true}]},
    {step: 'run', label: 'run one, start to finish', at: 0.92},
  ]);

// ── 16 · What it actually did ─────────────────────────────────────────────────────────
cdiff('slide', 'zoneB',
  "And it fixed it. Genuinely fixed it — we'll check that against the maintainer in a minute. But I want to show " +
  "you how it got there, because Claude Code keeps a transcript of every tool it used, so we don't have to take " +
  "anybody's word for it. " +
  "Three tool calls. That's the whole run. It read the code. Then, second call, it rewrote the fix straight into " +
  "the file. Then it checked its own work by writing a little random loop of its own. " +
  "Look at the order. The fix lands second, before a single test exists. No skill was ever loaded. And the third " +
  "call is the one I'd point at in a code review — it satisfied itself with a script it invented on the spot, " +
  "instead of the test suite sitting right there in the project.",
  SLUGIFY,
  [
    {step: 'order', label: 'every tool call, in order', at: 0.30,
     camera: [{frame: 'full', at: 'Three tool calls'}]},
    {step: 'stat', label: 'what it changed', at: 0.56},
    {step: 'howverified', label: 'how it satisfied itself', at: 0.78},
    {step: 'suite', label: 'the suite it never ran', at: 0.90},
  ]);

// ── 17 · The three steps, named ───────────────────────────────────────────────────────
c.add('STEP_STACK_OVERLAY', 'fade', 'zoneA',
  "Put those three steps side by side and the shape is obvious. Read the code. Write the fix. Then go looking for " +
  "something that agrees with you. " +
  "That last step is the one worth naming, because it feels like diligence and isn't quite. Writing your own check " +
  "after you've written your own fix tests one thing: that you were consistent with yourself. Both halves came " +
  "from the same idea about what was wrong. If that idea had a hole in it, the check has the same hole.",
  (A) => ({
    headline: 'Read. Fix. Then look for agreement.',
    chip: 'filled',
    dock: 'left',
    steps: [
      {label: 'read the code', sub: 'call one', atWord: A(0.14)},
      {label: 'write the fix', sub: 'call two', color: 'orange', atWord: A(0.19)},
      {label: 'invent a check that agrees', sub: 'call three', color: 'red', atWord: A(0.26)},
    ],
  }));

// ── 18 · THE BEAT: a claim it never measured ──────────────────────────────────────────
c.add('CLAIM_CHECK', 'morph', 'zoneA',
  "And then it told us this. All the old counter tests pass as before. " +
  "Now here's the thing. That sentence is true. I ran the suite myself afterwards and it does pass, twenty-four " +
  "tests, all green. The statement is completely correct. " +
  "It just never ran them. There's no test command anywhere in that transcript. It reported the result of a test " +
  "run that never happened, and it happened to be right. " +
  "And remember what's installed while it says that — a pack whose own front page says " +
  "verification is non-negotiable, and seems right is never sufficient. That's not me marking its homework. " +
  "That's the pack's own standard, sitting in the folder, unopened.",
  (A) => ({
    headline: 'True. And never measured.',
    subject: 'test runs',
    tallyLabel: 'every tool call, counted',
    hitLabel: 'used',
    claims: [
      {text: '"All the old counter tests pass as before."', tag: 'it said', color: 'green', atWord: A(0.04)},
      {text: 'No test command appears anywhere in the transcript.', tag: 'the log', color: 'red', atWord: A(0.45)},
    ],
    tally: [
      {label: 'reads', value: 1, threshold: 3, atWord: A(0.52)},
      {label: 'edits', value: 1, threshold: 3, atWord: A(0.56)},
      {label: 'test runs', value: 0, threshold: 3, color: 'red', atWord: A(0.62)},
    ],
    atWord: A(0.04),
  }));

// ── 19 · The rule, tested ─────────────────────────────────────────────────────────────
c.add('RULE_TEST', 'slide', 'zoneA',
  "Which brings us back to that line in the skill file. A test that passes immediately proves nothing. " +
  "It sounds like a slogan until you apply it to what we just watched. A check written after the fix, by the same " +
  "mind that wrote the fix, passing on the first run — that's a test that passed immediately. It proved the author " +
  "agreed with themselves. " +
  "A test written before the fix, that fails, and then passes once you've changed the code — that one proved " +
  "something. It proved the failure was real, and that your change is what removed it.",
  (A) => ({
    kicker: 'the rule in the skill',
    rule: 'A test that passes immediately proves nothing.',
    okLabel: 'proves it',
    noLabel: 'proves nothing',
    cases: [
      {text: 'a check written after the fix', title: 'no',
       sub: 'you agreed with yourself', color: 'red', atWord: A(0.36)},
      {text: 'a test written first, that fails', title: 'ok',
       sub: 'the failure was real', color: 'green', atWord: A(0.62)},
      {text: 'a suite that was green all along', title: 'no',
       sub: 'it never asked', color: 'red', atWord: A(0.78)},
    ],
  }));

// ── 20 · Red, green, refactor ─────────────────────────────────────────────────────────
c.add('CYCLE_LOOP', 'fade', 'zoneA',
  "That's the loop the skill is built around, and it has a name: red, green, refactor. " +
  "Red is where you start — you write a test for the behaviour you want, run it, and watch it fail. That failure " +
  "is the proof that the problem is real and that your test can actually see it. Green is the smallest change " +
  "that makes the test pass. Refactor is tidying up afterwards, with the test still watching. " +
  "Most of us skip straight to green. That's the habit the skill exists to interrupt.",
  (A) => ({
    headline: 'Red, green, refactor',
    nodes: [
      {label: 'RED', sub: 'watch it fail', color: 'red', atWord: A(0.20)},
      {label: 'GREEN', sub: 'make it pass', color: 'green', atWord: A(0.46)},
      {label: 'REFACTOR', sub: 'tidy up, safely', color: 'blue', atWord: A(0.56)},
    ],
  }));

// ═══ IV · RUN TWO ══════════════════════════════════════════════════════════════════════
c.add('CHAPTER', 'wipe', 'zoneB',
  "So let's run it again. Same bug, same code, fresh copy — and this time we name the skill.",
  () => ({number: '03', title: 'Run two: name the skill', subtitle: 'one sentence added to the request'}));

// ── 22 · The invoked run ──────────────────────────────────────────────────────────────
invoked('push', 'zoneB',
  "The request is identical. I checked that mechanically rather than by eye — the two prompts are the same string, " +
  "with one sentence added at the front: use the test-driven-development skill. That's the only difference between " +
  "these two runs. " +
  "And the very first thing it does is different. Before it reads a single line of code, it loads the skill — " +
  "that's the top line, and it's the call that never appeared in run one. Loading it drops the whole workflow into " +
  "the conversation: the red-green-refactor loop, the rule about failing first, and the instruction to go and find " +
  "out how this project runs its tests rather than guessing. " +
  "Then it reads the project. Then — and this is the bit we didn't get last time — it writes the tests, and runs " +
  "them, and they fail. Two failures, for the exact collision we found by hand. Watch that it does this while the " +
  "broken code is still completely untouched, because that ordering is the entire point. Only after the failure is " +
  "on the screen does it open the file with the bug in it. And when it's done, it runs the project's own suite — " +
  "the real one, the same command the maintainer uses. Twenty-seven tests, all passing: the original twenty-four, " +
  "plus the three it just wrote.",
  SLUGIFY,
  [
    {step: 'ask', label: 'the identical request', at: 0.04},
    {step: 'skills', label: 'the same skills', at: 0.28},
    {step: 'run', label: 'run two, start to finish', at: 0.44},
  ]);

// ── 23 · The failure it produced ──────────────────────────────────────────────────────
c.add('TEST_RUNNER', 'morph', 'zoneA',
  "This is the frame that run one never produced. A real failing test, before any fix existed. " +
  "Read what it says. It expected foo-3 and it got foo-2 — the collision, caught by a test rather than by us. And " +
  "the second failure is a nice piece of thinking: it takes thirteen mixed titles, slugs all of them, and simply " +
  "asserts that the list has no duplicates in it. That's not checking one example. That's checking the rule.",
  (A) => ({
    headline: 'The frame run one never produced',
    nodes: [
      {name: 'counter', depth: 0, kind: 'it', status: 'pass', atWord: A(0.10)},
      {name: 'skips a slug already taken', depth: 0, kind: 'it', status: 'fail', atWord: A(0.30)},
      {name: 'output stays unique across mixed inputs', depth: 0, kind: 'it', status: 'fail', atWord: A(0.58)},
    ],
    passed: 24,
    failed: 2,
    failIndex: 1,
    expected: "'foo-3'",
    actual: "'foo-2'",
    atWord: A(0.10),
  }));

// ── 24 · The two runs, side by side ───────────────────────────────────────────────────
c.add('SPEC_COMPARE', 'slide', 'zoneA',
  "So here are the two runs together, and I want to be careful about what this does and doesn't show. " +
  "Run one never loaded a skill; run two loaded it first. Run one never ran the test suite at all; run two ran it " +
  "and left it green. Run one added no tests to the project — the suite is still twenty-four. Run two left three " +
  "new ones behind, so the next person who breaks this gets told. " +
  "And the difference that actually matters is the last row. In run one, a failing test never existed at any point. " +
  "In run two, it did, and that's the only moment in either run where anything was genuinely proved.",
  (A) => ({
    headline: 'The same bug, one sentence apart',
    source: "Claude Code session transcripts for both runs · npm test on each bench",
    a: {name: 'just ask', color: 'red'},
    b: {name: 'name the skill', color: 'green'},
    rows: [
      {label: 'loaded a skill', a: 'never', b: 'first call', winner: 'b', atWord: A(0.16)},
      {label: 'ran the suite', a: 'never', b: 'yes, green', winner: 'b', atWord: A(0.28)},
      {label: 'tests in the suite', a: '24', b: '27', winner: 'b', atWord: A(0.40)},
      {label: 'a failing test existed', a: 'no', b: 'yes', winner: 'b', atWord: A(0.62)},
    ],
  }));

// ═══ V · THE ANSWER KEY ════════════════════════════════════════════════════════════════
// ── 25 · Grading both against the maintainer ──────────────────────────────────────────
key('letterbox', 'zoneB',
  "Now for the part that keeps me honest. This bug is real, and the maintainer fixed it himself, in public, a few " +
  "weeks ago. So we have an answer key. " +
  "Here's what our agent wrote: a second collection, a set, holding every slug already handed out — and a loop " +
  "that keeps bumping the number while the next one's taken. " +
  "And here is the maintainer's own fix, from the actual commit. A set of every slug already returned, and a loop " +
  "that keeps bumping while the candidate's taken. " +
  "That's the same idea. He called his set returned, ours called it usedSlugs, and beyond the name there's nothing " +
  "between them.",
  SLUGIFY,
  [
    {step: 'order', label: 'the run that used it', at: 0.03},
    {step: 'stat', label: 'what it changed', at: 0.16},
    {step: 'mine', label: 'the fix our agent wrote', at: 0.30,
     camera: [{frame: 'full', at: 'a second collection'}]},
    {step: 'theirs', label: "the maintainer's own fix", at: 0.58},
  ]);

// ── 26 · Both arms matched — so say what actually changed ─────────────────────────────
c.add('CODE_DIFF', 'morph', 'zoneA',
  "And I should tell you that run one landed on that same idea too. In index.js, all three agree: the maintainer " +
  "called his set returned, both of our runs called it usedSlugs, and underneath the names it is the same set and " +
  "the same loop. So let's kill one conclusion right now: the skill did not make the agent smarter. The code came " +
  "out the same. " +
  "What changed was whether anybody could tell. Run two leaves behind a test that fails on the old code and " +
  "passes on the new one. Run one leaves behind a fix and a promise.",
  (A) => ({
    fileName: 'index.js — all three agree',
    rows: [
      {kind: 'ctx', text: 'export function slugifyWithCounter() {'},
      {kind: 'ctx', text: '  const occurrences = new Map();'},
      {kind: 'add', text: '  const returned = new Set();      // the maintainer'},
      {kind: 'add', text: '  const usedSlugs = new Set();   // both our runs'},
      {kind: 'ctx', text: '    while (taken(candidate)) {'},
      {kind: 'ctx', text: '      counter += 1;'},
      {kind: 'ctx', text: '    }'},
    ],
    stat: {plus: 2, minus: 0},
    atWord: A(0.35),
  }));

// ── 27 · The honest verdict ───────────────────────────────────────────────────────────
c.add('CHECK_SWEEP', 'fade', 'zoneA',
  "So what can we actually say, from two runs? Let's be strict about it, because one run of one agent on one bug " +
  "is not a study. " +
  "We can say the skills were installed and advertised, and that on its own didn't make the agent use them. We can " +
  "say naming the skill changed the order of work, and produced a failing test where there hadn't been one. We can " +
  "say it ran the project's real suite instead of a check it made up. " +
  "What we cannot say is that this happens every time — agents aren't repeatable, and a different run could go " +
  "differently. And we can't say the code was better, because it wasn't; it was the same.",
  (A) => ({
    headline: 'What two runs can honestly support',
    subjectLabel: 'the claims made here',
    checks: [
      {label: "installed isn't invoked", atWord: A(0.26)},
      {label: 'naming changed the order', atWord: A(0.36)},
      {label: 'it ran the real suite', atWord: A(0.48)},
      {label: 'this happens every time', atWord: A(0.58)},
      {label: 'the code came out better', atWord: A(0.72)},
    ],
    caughtIndex: 3,
    caughtNote: 'one run is one run',
    fixNote: 'say what you measured',
    atWord: A(0.26),
  }));

// ── 28 · Outro ────────────────────────────────────────────────────────────────────────
c.add('OUTRO_CTA', 'dip', 'zoneA',
  "So the takeaway isn't that you need this pack. It's smaller and more useful than that. Installed is not invoked. " +
  "Installing a skill puts a description in front of your agent, and something still has to invoke it — and what " +
  "that buys you isn't a better " +
  "answer, it's an answer with proof attached. Agent Skills is on GitHub under the MIT licence, and the link's in " +
  "the description along with the library we broke. Next time your agent tells you the tests pass, ask it to show " +
  "you the run. Thanks for watching.",
  () => ({
    message: 'Installed is not invoked.',
    sub: 'addyosmani/agent-skills · MIT',
  }));

// ── emit ──────────────────────────────────────────────────────────────────────────────
const spec = {
  meta: {
    topic: 'Agent Skills — the Prove-It pattern',
    format: 'long',
    fps: 30,
    subject: 'Agent Skills',
    audioPrefix: 'agent-skills-prove-it_long',
    pronounce: {slugify: 'slug-ih-fy', Osmani: 'Oz-mah-nee'},
    onePayoff:
      'installing a skill pack advertises 25 workflows to the agent but does not put them in effect — naming the ' +
      'skill changed the order of work and produced a failing test where one had never existed, while the code ' +
      'itself came out the same either way',
    openLoop: 'Twenty-four tests passed and the bug was still there — so what is a green test suite actually worth?',
    topicAxes: ['entity-novelty', 'workflow'],
    screenplay: 'documentary',
    seo: {
      title: 'I Installed 25 Agent Skills — Then Watched The Agent Ignore Every One',
      altTitles: [
        '24 Tests Passed. The Bug Was Still There.',
        'Agent Skills Tested: The One Sentence That Changed What My AI Proved',
        'Addy Osmani\'s Agent Skills, Tested Against A Real Bug (With An Answer Key)',
      ],
      hook:
        'Agent Skills is a pack of 25 engineering workflows for AI coding agents with 98,000 stars. We install it on ' +
        'a real broken library, run the same bug twice — once just asking, once naming the testing skill — and grade ' +
        'both against the fix the maintainer actually shipped.',
      description:
        'We install addyosmani/agent-skills on a sealed copy of sindresorhus/slugify, parked one commit before a ' +
        'real bug fix, and run the same bug report twice. The only difference between the runs is one sentence. ' +
        'Everything on screen is the real thing: the repo page, the skill file, Claude Code\'s own tool transcripts, ' +
        'and the maintainer\'s published commit as an answer key.',
      pinned: 'Twenty-four tests passed and the bug was still there — does your green suite actually prove anything?',
      sources: [
        'Agent Skills — github.com/addyosmani/agent-skills (MIT)',
        'slugify — github.com/sindresorhus/slugify (MIT), recorded at commit 2acf5b3',
        'The maintainer\'s fix — sindresorhus/slugify commit 6d97501',
      ],
      queries: [
        'what are agent skills',
        'addy osmani agent skills',
        'claude code skills explained',
        'test driven development with ai agents',
        'do ai coding agents actually use skills',
      ],
      tags: 'agent skills,addy osmani,claude code,ai coding agent,tdd,test driven development,slugify,' +
        'open source,github,ai agents,skills,coding with ai,claude,software testing',
    },
  },
  brand: c.brand(),
  thumbnail: {
    title: '24 TESTS PASSED',
    badge: 'Agent Skills',
    note: 'THE BUG WAS STILL THERE',
    art: 'img:askills-green-wall.png',
    asset: 'img:askills-green-wall.png',
  },
  scenes: c.S,
};

c.emit('topics/agent-skills-prove-it/long.json', spec);
