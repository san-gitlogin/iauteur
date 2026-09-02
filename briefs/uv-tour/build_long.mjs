#!/usr/bin/env node
// BUILD — topics/uv-getting-started/long.json
//
// Source: https://medium.com/@ammar_naich/getting-started-with-uv-…-69714fa50065
// Everything on screen was CAPTURED by running uv 0.12.9 on 2026-09-02, not read off a
// docs page (LAW 0m corollary). Where the article and the tool disagree the tool wins, and
// briefs/uv-tour/research.md records the measurement that settled it.
//
// Shape (LAW 0e.6a — budget SCENES, not words per scene): 19 beats, three acts, six
// RECORDED_STEP scenes carrying thirteen real clips. RECORDED_STEP is capped at
// ceil(19*0.35)=7 by the over-reliance rule, so clips are grouped two and three to a beat,
// which is also how a person narrates them (gotcha 50).
//
// Anchors: `node scripts/anchor-spec.mjs` solves every RECORDED_STEP atWord from the
// measured clip lengths. UV_STAGE steps are anchored HERE, by word, via at() — which
// throws if the word is not in the narration, so a reworded line cannot silently leave a
// terminal line typing on frame zero (LAW 0i).
import fs from 'node:fs';

const CH = 'THE NBX STUDIO';

const normw = (w) => String(w).toLowerCase().replace(/[^a-z0-9]/g, '');
/** 1-based index of `word` in `narration`. Throws rather than guess (LAW 0i). */
const at = (narration, word, nth = 1) => {
  const ws = narration.split(/\s+/).map(normw);
  const want = normw(word);
  let seen = 0;
  for (let i = 0; i < ws.length; i++) {
    if (ws[i] === want && ++seen === nth) return i + 1;
  }
  throw new Error(`anchor word ${JSON.stringify(word)} (#${nth}) not found in narration`);
};

// A long cut needs rhythm in the cutting, not one transition repeated (linter wants >=5
// distinct kinds across the video).
const TRANS = ['fade', 'push', 'slide', 'zoom', 'wipe', 'dip', 'morph', 'iris'];
const BG = ['zoneA', 'zoneB', 'zoneC'];
let i = 0;
const scene = (_id, type, narration, data, extra = {}) => {
  // The first argument is kept for readability at the call site and IGNORED: the id is the
  // position. Hand-numbered ids survived until a beat was inserted in the middle, which
  // produced a duplicate s12 the linter had to catch.
  const s = {id: `s${String(i + 1).padStart(2, '0')}`, type, narration,
             transition: TRANS[i % TRANS.length], background: BG[i % BG.length], data, ...extra};
  i++;
  return s;
};

/** A uv depiction beat. UV_STAGE's manifest data_key is `uvStage`. */
// UV_STAGE's terminal defaults to a `you@linux: ~` prompt. That is a fabricated machine,
// and this video's whole claim is that its terminals are real — so every beat carries the
// same honest label as the recorded footage beside it. The manifest is explicit that this
// must never be a real user or machine name.
const uv = (id, narration, data) =>
  scene(id, 'UV_STAGE', narration, {uvStage: {promptLabel: 'uv', cwd: 'myapp', ...data}});

/** A chapter card. CHAPTER's manifest data_key is `chapter` — unnested, the title is
 *  silently dropped and the upload kit's chapter list reads "Chapter" for every act. */
const chapter = (id, narration, number, title) =>
  scene(id, 'CHAPTER', narration, {chapter: {number: String(number).padStart(2, '0'), title}});

/** A recorded beat: caption + premise (LAW 0l.2) + the clips it plays. */
const rec = (id, narration, caption, premise, clips) =>
  scene(id, 'RECORDED_STEP', narration, {
    recordedStep: {caption, premise, layout: 'full', color: 'blue', clips},
  });

const clip = (step, label, opts = {}) =>
  ({ref: `rec:uv-tour#${step}`, label, focus: true, ...opts});

const scenes = [];

// ── ACT 0 — the promise ───────────────────────────────────────────────────────
// LAW 0g.1: the subject is named in the FIRST sentence, and missing it is an ERROR.
// LAW 0g.3: the headline shares its distinctive words with meta.seo.title.
scenes.push(scene('s01', 'HOOK',
  "uv replaces five separate Python tools with one binary. So what does that change?",
  {headline: 'ONE TOOL, NOT FIVE', subtext: 'Python packaging', heroAsset: 'si:uv',
   hookVariant: 'stack'}));

scenes.push(scene('s02', 'TITLE_CARD',
  "Empty folder to a published package, and every command starts with the same two letters.",
  {title: 'Getting Started with uv', subtitle: 'pip · virtualenv · pyenv · pipx · poetry'}));

{
  // LAW 0g.2: greet, and say what we're going to DO. LAW 0g.4: then open the loop.
  const n =
    `Welcome back to ${CH}, where we take one tool and actually use it — ` +
    "follow along if that is your kind of thing. " +
    "If you write Python, you already know the drill. " +
    "pip installs your packages. virtualenv keeps them apart. pyenv juggles interpreters. " +
    "pipx handles command-line tools, and poetry tries to hold the whole thing together. " +
    "Five tools, five ways to get it wrong. " +
    "uv is a single binary that covers all five, and today we're taking it from an empty " +
    "folder to a package you could publish. So where does that actually save you time?";
  scenes.push(uv('s03', n, {
    headline: 'Five tools, [one binary]',
    kind: 'install-routes',
    premise: 'Each row is a job Python developers reach for a different tool to do.',
    stageTitle: 'what you juggle today',
    steps: [
      {label: 'pip install rich', out: ['installs into whichever python is first on PATH'],
       detail: 'packages', atWord: at(n, 'pip')},
      {label: 'python -m venv .venv', out: ['and you must remember to activate it'],
       detail: 'environments', atWord: at(n, 'virtualenv')},
    ],
    // install-routes draws N ROUTES converging on a DESTINATION, and it takes the LAST
    // item as that destination (uvViz.tsx: items.slice(0,-1) / items[items.length-1]).
    // Authored without one, "poetry" became the endpoint and rendered as a pill floating
    // on its own in the middle of the pane. The five tools are the routes; uv is where
    // they all arrive, which is the whole point of the beat.
    stage: [
      {label: 'pip', text: 'packages', atWord: at(n, 'pip')},
      {label: 'virtualenv', text: 'environments', atWord: at(n, 'virtualenv')},
      {label: 'pyenv', text: 'interpreters', atWord: at(n, 'pyenv')},
      {label: 'pipx', text: 'CLI tools', atWord: at(n, 'pipx')},
      {label: 'poetry', text: 'projects', atWord: at(n, 'poetry')},
      {label: 'uv', text: 'all five', atWord: at(n, 'uv')},
    ],
    verdict: 'uv does all five',
    verdictAtWord: at(n, 'binary'),
    color: 'purple',
  }));
}

// ── ACT 1 — the project ───────────────────────────────────────────────────────
scenes.push(chapter('s04',
  "First, the project itself, because everything else builds on what uv writes to disk.",
  1, 'Your first project'));

scenes.push(rec('s05',
  "Open a terminal in an empty folder, and type uv init, dash dash app. " +
  "The project is initialised, uv says, and look what appeared alongside it. " +
  "There's a dot python dash version file, a pyproject dot toml, a README, and a src folder. " +
  "Now read the config uv wrote. Name, version, description, all filled in for you. " +
  "Then requires dash python, which means this project needs Python three point twelve or newer. " +
  "And dependencies sits empty, because we haven't asked for anything yet. " +
  "One file holds the whole configuration.",
  'uv init, and every file it wrote',
  'An empty folder, and the one command that fills it.',
  [
    clip('init', 'one command'),
    clip('tree', 'what appeared'),
    clip('pyproject', 'the one config file',
      {callouts: [{text: 'the Python floor', mark: 'reqpy', color: 'blue'},
                  {text: 'nothing added yet', mark: 'deps', color: 'orange'}]}),
  ]));

scenes.push(rec('s06',
  "Now let us run it. Back in the terminal — uv run, then the project name. " +
  "Watch the first two lines closely, because that's the part people miss. " +
  "An interpreter got picked, and then a virtual environment was built without being asked. " +
  "You never typed python dash m venv, and you never activated anything. " +
  "The program just ran. List the folder again and two new items are sitting there — " +
  "a dot venv directory, and a uv dot lock file. " +
  "Running your code is what created your environment.",
  'the environment builds itself',
  'The same folder, one command later.',
  [
    clip('run', 'uv run',
      {callouts: [{text: 'it made the venv for you', mark: 'venv', color: 'green'},
                  {text: 'and your code ran', mark: 'hello', color: 'blue'}]}),
    clip('after', 'two new things',
      {callouts: [{text: 'you never asked for this', mark: 'lock', color: 'purple'}]}),
  ]));

{
  const n =
    "So what is a virtual environment, really? Honestly, it's a folder. " +
    "Inside sits a Python interpreter, plus the packages this one project asked for. " +
    "Nothing lands system-wide, which means two projects can want two different versions " +
    "of the same library and neither one breaks the other.";
  scenes.push(uv('s07', n, {
    headline: 'A venv is [a folder]',
    kind: 'two-projects',
    premise: 'Two projects on one laptop. Each carries its own .venv, so neither can disturb the other.',
    stageTitle: 'one laptop, two projects',
    stage: [
      {label: 'myapp/.venv', text: 'rich 15.0.0', atWord: at(n, 'folder')},
      {label: 'other/.venv', text: 'rich 13.7.1', atWord: at(n, 'versions')},
    ],
    verdict: 'Same library, two versions',
    verdictAtWord: at(n, 'systemwide'),
    color: 'green',
  }));
}

// ── ACT 2 — dependencies ──────────────────────────────────────────────────────
scenes.push(chapter('s08',
  "Next: dependencies. Adding them, seeing what they drag along, and pinning the result.",
  2, 'Dependencies'));

scenes.push(rec('s09',
  "Say we need a library. Type uv add rich, and watch what comes back. " +
  "Now read the list it installed. There's rich, the one you named — " +
  "and three more you have never heard of. " +
  "So ask uv to draw the tree. rich sits at the top, where you put it. " +
  "Underneath sit markdown dash it dash py, mdurl, and pygments. " +
  "Those three came along because rich needs them to work. " +
  "That's how a small project gets large.",
  'One name, four installs',
  'Adding one dependency, then asking what came in with it.',
  [
    clip('add', 'uv add rich',
      {callouts: [{text: 'the one you asked for', mark: 'richv', color: 'blue'}]}),
    clip('deptree', 'uv tree',
      {callouts: [{text: 'these came along', mark: 'kids', color: 'orange'}]}),
  ]));

{
  const n =
    "Your pyproject records a floor, not a version. Written out, it says rich, " +
    "at least fifteen point zero. That's a rule, and a rule can resolve differently tomorrow. " +
    "The lockfile is the other half, because it records the exact versions actually chosen. " +
    "One file carries your intent; the other carries the answer.";
  scenes.push(uv('s10', n, {
    headline: 'A floor, and [an exact answer]',
    kind: 'constraint-line',
    premise: 'pyproject.toml states a rule. uv.lock states the one answer that rule produced today.',
    stageTitle: 'two different jobs',
    stage: [
      {label: 'pyproject.toml', text: 'rich>=15.0.0', detail: 'the rule you wrote',
       atWord: at(n, 'floor')},
      {label: 'uv.lock', text: 'rich 15.0.0', detail: 'the answer uv chose',
       atWord: at(n, 'lockfile')},
      {label: 'next month', text: 'rich 15.4.0', detail: 'same rule, new answer',
       atWord: at(n, 'tomorrow')},
    ],
    verdict: 'Intent, and the record',
    verdictAtWord: at(n, 'lockfile'),
    color: 'blue',
  }));
}

scenes.push(rec('s11',
  "Let us open the lockfile and read it. head, dash eleven, uv dot lock. " +
  "Version, revision, and the Python it was solved for. " +
  "Then a package block — markdown dash it dash py, pinned at four point two point zero. " +
  "Notice that's a package you never typed, and uv pinned it exactly anyway, " +
  "so your laptop and your CI install identical bytes. " +
  "Removing one is a single command. uv remove rich, " +
  "and all four go together, because nothing else needed them.",
  'the lockfile, and removing it',
  'uv.lock is generated. You read it; uv writes it.',
  [
    clip('lockfile', 'exact versions',
      {callouts: [{text: 'pinned, not a range', mark: 'exact', color: 'purple'}]}),
    clip('remove', 'uv remove rich',
      {callouts: [{text: 'and its three friends', mark: 'gone', color: 'red'}]}),
  ]));

{
  // Verified locally 2026-09-02: a workspace root holds exactly ONE uv.lock and ONE .venv,
  // and members share both. No terminal `steps` here — no workspace transcript was
  // captured, and LAW 0m forbids inventing one to fill a pane.
  const n =
    "One more thing before we leave dependencies. If you keep several projects in one " +
    "repository, uv calls that a workspace. " +
    "Members each keep their own pyproject, so every one of them declares what it needs. " +
    "But the whole workspace shares a single lockfile and a single environment, " +
    "which means two services in one repo can never drift onto different versions.";
  scenes.push(uv('s12', n, {
    headline: 'Many projects, [one lock]',
    kind: 'shelf-share',
    premise: 'One repository, several services. The shelf they share is the workspace root.',
    stageTitle: 'a workspace root',
    stage: [
      {label: 'api/', text: 'own pyproject', atWord: at(n, 'workspace')},
      {label: 'worker/', text: 'own pyproject', atWord: at(n, 'Members')},
      {label: 'root uv.lock', text: 'one, shared', atWord: at(n, 'lockfile')},
    ],
    verdict: 'They cannot drift apart',
    verdictAtWord: at(n, 'shares'),
    color: 'purple',
  }));
}

// ── ACT 3 — tools, Pythons, shipping ──────────────────────────────────────────
scenes.push(chapter('s12',
  "Last act: running tools, managing Python itself, and shipping what you've built.",
  3, 'Tools and publishing'));

scenes.push(rec('s13',
  "Sometimes you want to run a tool, not depend on it. Try this one with me — uvx, " +
  "then any tool name. " +
  "Name something you've never installed, and uv fetches it, runs it in a throwaway " +
  "environment, and leaves your project completely untouched. " +
  "Nothing got added to your dependencies. " +
  "For the ones you use daily, install them properly. " +
  "Running uv tool install ruff puts the executable straight on your PATH, managed for you, " +
  "and still isolated from every project you own.",
  'uvx, then uv tool install',
  'A tool you need once, and a tool you need every day.',
  [
    clip('uvx', 'uvx — no install',
      {callouts: [{text: 'never installed it', mark: 'cow', color: 'green'}]}),
    clip('toolinstall', 'uv tool install',
      {callouts: [{text: 'on your PATH now', mark: 'exe', color: 'blue'}]}),
  ]));

{
  const n =
    "The difference is worth holding onto. uvx builds an environment, runs your tool, " +
    "and then throws the environment away. " +
    "Its sibling, uv tool install, keeps that environment and drops a shim on your PATH. " +
    "Isolation is identical either way, so the only real question is whether " +
    "you'll want the same tool again tomorrow.";
  scenes.push(uv('s14', n, {
    headline: 'Borrow it, or [keep it]',
    kind: 'ephemeral-bay',
    premise: 'Each bay is one isolated environment. uvx returns the bay; uv tool install keeps it.',
    stageTitle: 'two ways to run a tool',
    stage: [
      {label: 'uvx ruff', text: 'discarded', atWord: at(n, 'uvx')},
      {label: 'uv tool install', text: 'kept on PATH', atWord: at(n, 'keeps')},
      {label: 'your project', text: 'untouched', atWord: at(n, 'Isolation')},
    ],
    verdict: 'Neither touches your project',
    verdictAtWord: at(n, 'keeps'),
    color: 'orange',
  }));
}

scenes.push(rec('s15',
  "Interpreters are uv's business too. Ask it what it can see — uv python list. " +
  "Some of these are already installed. " +
  "The ones marked download available get fetched on demand, " +
  "with no system package manager anywhere in the picture. " +
  "And when you're ready to ship, run uv build. " +
  "Two files came out — a source distribution, and a wheel. " +
  "Those are exactly what PyPI wants. " +
  "Empty folder to publishable package, on one binary.",
  'the interpreter, and the wheel',
  'The interpreter itself, and the two files PyPI wants.',
  [
    clip('pythons', 'uv python list',
      {callouts: [{text: 'uv will fetch these', mark: 'dl', color: 'purple'}]}),
    clip('build', 'uv build',
      {callouts: [{text: 'this is what PyPI wants', mark: 'wheel', color: 'green'}]}),
  ]));

{
  // LAW 3 + LAW 0m: measured on THIS machine, and said on screen to be measured here.
  const n =
    "Now, the speed. Same package, same laptop, into a fresh environment. " +
    "First with nothing cached: " +
    "pip took one point six nine seconds, and uv took zero point four four. " +
    "Run it again with the cache warm, which is what happens all day in practice. " +
    "pip needs one point three three seconds. Meanwhile uv finishes in three hundredths of a second. " +
    "That gap isn't a faster download, because uv is hard-linking files it already holds.";
  scenes.push(uv('s16', n, {
    headline: 'Warm cache: [1.33s vs 0.03s]',
    kind: 'depot-cache',
    premise: 'The same install, twice. Only the tool doing it changed.',
    stageTitle: 'install rich into a fresh venv',
    steps: [
      {label: 'pip install rich', out: ['cold  1.69s', 'warm  1.33s'],
       detail: 'downloads and unpacks every time', atWord: at(n, 'pip')},
      {label: 'uv pip install rich', out: ['cold  0.44s', 'warm  0.03s'],
       detail: 'hard-links out of its cache', atWord: at(n, 'uv', 2)},
    ],
    stage: [
      {label: 'cold cache', text: '1.69 → 0.44s', atWord: at(n, 'cached')},
      {label: 'warm cache', text: '1.33 → 0.03s', atWord: at(n, 'warm')},
    ],
    verdict: 'Hard links beat downloads',
    verdictSub: 'uv 0.12.9',
    verdictAtWord: at(n, 'finishes'),
    color: 'green',
  }));
}

{
  // The strongest argument for LAW 0m: three commands that appear in real write-ups and
  // are REJECTED by the real binary. Every error string is captured verbatim from uv 0.12.9.
  //
  // ONE beat, not two. Split across two scenes each pane held a single command in a
  // full-bleed terminal and read mostly empty — the proof still showed roughly a fifth of
  // the pane carrying ink. Three commands with their output and notes is twelve lines,
  // which fills it. The narration is cut to the 22s that three anchors earn rather than
  // padded to match (LAW 0e: trim the words, never invent motion).
  //
  // promptLabel/cwd are set explicitly: the component's default is `you@linux: ~`, which is
  // a fabricated machine in a video whose whole claim is that the terminals are real.
  const n =
    "One caution before you go. " +
    "Some command names you'll read online simply don't exist. " +
    "Shell completions don't come from uv completion. " +
    "Upgrading one package isn't uv lock upgrade. " +
    "And fixing your PATH isn't uv tool update shell. " +
    "Each one is rejected outright, so check uv dash dash help before you search.";
  scenes.push(uv('s18', n, {
    headline: 'Names people [get wrong]',
    kind: 'strict-gate',
    layout: 'terminal',
    promptLabel: 'uv',
    cwd: 'myapp',
    premise: 'Three commands you will find written down. This is what uv answers.',
    steps: [
      {label: 'uv completion zsh',
       out: ["error: unrecognized subcommand 'completion'", 'Usage: uv [OPTIONS] <COMMAND>'],
       detail: 'use: uv generate-shell-completion zsh',
       atWord: at(n, 'completions')},
      {label: 'uv lock upgrade rich',
       out: ["error: unexpected argument 'upgrade' found", 'Usage: uv lock [OPTIONS]'],
       detail: 'use: uv lock --upgrade-package rich',
       atWord: at(n, 'Upgrading')},
      {label: 'uv tool update shell',
       out: ['error: Failed to upgrade shell',
             '  Caused by: `shell` is not installed'],
       detail: 'use: uv tool update-shell',
       atWord: at(n, 'PATH')},
    ],
    verdict: 'Type it and see',
    verdictAtWord: at(n, 'rejected'),
    color: 'red',
  }));
}

{
  const n =
    "So that's uv, end to end. uv init lays down the project. " +
    "Then uv run builds the environment while it runs your code. " +
    "Dependencies go in and out with uv add and uv remove, and the lockfile records what you got. " +
    "uvx borrows a tool for one run, while uv tool install keeps one around. " +
    "Interpreters come from uv python, and uv build makes the files PyPI wants. " +
    "One binary, and it replaced every tool we opened with.";
  scenes.push(scene('s19', 'RECAP', n, {
    heading: 'uv, end to end',
    points: [
      {text: 'uv init — the project on disk', atWord: at(n, 'init')},
      {text: 'uv run — builds .venv as it runs', atWord: at(n, 'run')},
      {text: 'uv add / remove — dependencies', atWord: at(n, 'add')},
      {text: 'uvx / uv tool install — tools', atWord: at(n, 'uvx')},
      {text: 'uv build — sdist and wheel', atWord: at(n, 'build')},
    ],
  }));
}

scenes.push(scene('s20', 'OUTRO_CTA',
  "If this saved you an afternoon, hit like — it genuinely helps. " +
  "Subscribe for more of these, because there's a full fourteen-chapter uv course on the " +
  "channel that goes deeper on every one of them. " +
  "And send it to whoever is still fighting with virtualenv. See you next time.",
  {message: 'Subscribe for more', sub: 'the full uv course is on the channel'}));

const spec = {
  meta: {
    topic: 'Getting started with uv, the fast Python package manager',
    subject: 'uv',
    format: 'long',
    fps: 30,
    onePayoff: 'how one binary replaces pip, virtualenv, pyenv, pipx and poetry, from an empty folder to a published package',
    openLoop: 'What does collapsing five tools into one binary actually change about your day?',
    analogy: 'A toolbox in which five separate tools collapse into one.',
    screenplay: 'masterclass',
    topicAxes: ['entity-novelty', 'economic-pain'],
    seo: {
      title: 'Getting Started with uv — One Tool Instead of Five (Python)',
      description:
        'uv replaces pip, virtualenv, pyenv, pipx and poetry with a single Rust binary. ' +
        'The whole Python workflow, start to finish: uv init, uv run, uv add, the lockfile, ' +
        'uvx, uv tool install, uv python and uv build — plus three commands people write ' +
        'down that uv rejects, and what to type instead.',
      queries: [
        'what is uv python',
        'uv vs pip speed',
        'uv init project structure',
        'uv lock file explained',
        'uvx vs uv tool install',
        'how to publish a package with uv',
      ],
      tags: ['uv', 'python', 'uv python', 'python packaging', 'pip alternative', 'astral uv',
             'python tutorial', 'uv tutorial', 'virtualenv', 'pyenv', 'pipx', 'python venv',
             'uv lock', 'uvx', 'python for beginners'],
      sources: [
        'uv 0.12.9 run locally on macOS, 2026-09-02 — every command and transcript shown',
        'https://medium.com/@ammar_naich/getting-started-with-uv-a-fast-modern-python-package-manager-69714fa50065',
      ],
    },
  },
  brand: {
    theme: 'moderndark',
    themeLight: 'daylight',
    design: 'moderndark',
    background: 'plain',
    channel: CH,
    logo: 'img:channel_logo.png',
  },
  thumbnail: {
    title: 'ONE TOOL, NOT FIVE',
    badge: 'uv, start to finish',
    asset: 'si:uv',
    note: 'pip · virtualenv · pyenv · pipx · poetry',
    logos: ['si:uv', 'si:python', 'si:rust'],
  },
  scenes,
};

fs.writeFileSync('topics/uv-getting-started/long.json', JSON.stringify(spec, null, 2) + '\n');
console.log(`wrote topics/uv-getting-started/long.json — ${scenes.length} scenes`);
