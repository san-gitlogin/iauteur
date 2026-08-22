// UV_STAGE MIN/MAX/MIX STRESS FIXTURES.
//
// Every uv depiction, three times over: the sparsest legal content, content authored
// EXACTLY at the linter's caps, and the realistic content the course will actually ship.
// Render with `node scripts/_proof.mjs <out.json> <design> <tag>` and edge-scan the
// result — a still is two seconds, a render is hours (verify before you render).
//
// MAX is the one that matters. A depiction that looks composed with three parcels and
// bursts its pane with ten is not finished, and ten is a number the linter permits, so
// somebody will eventually author it.
//
//   node scripts/gen-uv-fixtures.mjs [out.json]
import fs from 'node:fs';

// ── content authored TO the cap, not near it ─────────────────────────────────
// `at(n, seed)` returns a string of exactly n visible chars, still readable, so a
// burst layout is obviously a layout failure rather than obviously nonsense text.
const at = (n, seed) => {
  let s = seed;
  const filler = ' the very edge of the contract cap here now ok';
  let i = 0;
  while (s.length < n) { s += filler[i % filler.length]; i++; }
  return s.slice(0, n);
};

const CAP = {headline: 38, premise: 120, stageTitle: 30, verdict: 40, verdictSub: 48,
             token: 28, promptLabel: 26, cwd: 26, stepLabel: 52, stepDetail: 48,
             outLine: 62, stageLabel: 22, stageLabelCmd: 40, stageText: 14, stageSub: 54, stageDetail: 34};

// A headline must carry exactly one [accent phrase] (grammar rule), and the linter's
// `len` COUNTS the brackets — so put the accent in first, then pad the whole thing to 48.
const maxHeadline = at(CAP.headline, 'A [hostile] headline at the ');
// The pane does not scroll, so MAX here means the most LINES the linter allows, not
// the most steps: 17 for the split layout, 26 for terminal-only, counting one line per
// command, one per output line and one per detail note.
const maxSteps = (steps, outEach) => Array.from({length: steps}, (_, i) => ({
  label: at(CAP.stepLabel, 'uv run --with pygments --python 3.12 s' + i),
  detail: at(CAP.stepDetail, 'step ' + (i + 1) + ' detail pushed to'),
  out: Array.from({length: outEach}, (_, j) => at(CAP.outLine, '  ' + i + '.' + j + ' Resolved 47 packages in 812ms and then some')),
  atWord: 2 + i,
}));
// `env-ceremony` labels are COMMANDS and get the wider cap; every other kind labels a
// parcel or a folder. The fixture has to stress the cap that actually applies to it.
const maxStage = (n, kind) => Array.from({length: n}, (_, i) => ({
  label: kind === 'env-ceremony'
    ? at(CAP.stageLabelCmd, 'source .venv' + i + '/bin/activate')
    : at(CAP.stageLabel, 'pkg-name-' + i),
  ...(kind === 'env-ceremony' ? {icon: RING_ICONS[i % RING_ICONS.length]} : {}),
  text: at(CAP.stageText, i + '.21.0'),
  sub: at(CAP.stageSub, 'sub line ' + i + ' carried all the way to'),
  detail: at(CAP.stageDetail, 'pygments<3.0.0,>=2.13.' + i),
  atWord: 3 + i,
}));

const KINDS = ['pkg-parcel', 'pkg-index', 'dep-unfold', 'shelf-share', 'shelf-evict',
               'shelf-split', 'two-projects', 'env-ceremony'];
// the linter's own NEED / MAXI maps — MIN and MAX are authored at exactly the bounds
// it permits, so the fixture stresses the contract rather than somebody's taste.
const NEED = {'pkg-parcel': 1, 'pkg-index': 1, 'dep-unfold': 2, 'shelf-share': 3,
              'shelf-evict': 2, 'shelf-split': 2, 'two-projects': 2, 'env-ceremony': 2};
const MAXI = {'pkg-parcel': 4, 'pkg-index': 6, 'dep-unfold': 6, 'shelf-share': 3,
              'shelf-evict': 3, 'shelf-split': 3, 'two-projects': 2, 'env-ceremony': 7};
// env-ceremony stations are OBJECTS, so the fixture gives them objects too — a fixture
// that skips the icons would not stress the thing the redesign is about.
const RING_ICONS = ['lucide:package-plus', 'lucide:toggle-right', 'lucide:brain',
                    'lucide:toggle-left', 'lucide:rotate-ccw', 'lucide:alarm-clock'];

// ── MIX — the realistic column, the content the course actually ships ────────
const MIX = {
  'pkg-parcel': {headline: 'A package is a [name and a number]', stageTitle: 'the label',
    premise: 'Picture a shelf. Each parcel is a package; the label says its name and version.',
    steps: [{label: 'pip download rich', out: ['Saved ./rich-15.0.0-py3-none-any.whl'], detail: 'one file, one version', atWord: 3}],
    stage: [{label: 'rich', text: '15.0.0', sub: 'the version is the part that changes', atWord: 6}]},
  'pkg-index': {headline: 'They all come from [one warehouse]', stageTitle: 'where parcels come from', token: 'PyPI',
    steps: [{label: 'pip install rich', out: ['Collecting rich', '  Downloading rich-15.0.0-py3-none-any.whl (310 kB)'], atWord: 4}],
    stage: [{label: 'rich', text: '15.0.0', color: 'blue', sub: 'pulled out of the stack', atWord: 9}]},
  'dep-unfold': {headline: 'One package, [four arrived]', stageTitle: 'what came with it',
    premise: 'Each parcel is a package. Open one and a note inside names the others it needs.',
    steps: [{label: 'pip install rich', out: ['Collecting markdown-it-py>=2.2.0', 'Collecting pygments<3.0.0,>=2.13.0', 'Collecting mdurl~=0.1'], detail: 'you asked for one', atWord: 3}],
    stage: [{label: 'rich', text: '15.0.0', atWord: 4}, {label: 'markdown-it-py', text: '4.2.0', detail: 'markdown-it-py>=2.2.0', atWord: 7},
            {label: 'pygments', text: '2.21.0', detail: 'pygments<3.0.0,>=2.13.0', atWord: 9}, {label: 'mdurl', text: '0.1.2', detail: 'mdurl~=0.1', atWord: 11}],
    verdict: 'Three you never asked for', verdictAtWord: 13},
  'shelf-share': {headline: 'Two projects, [one shelf]', stageTitle: 'one slot, two demands',
    premise: 'One shelf for the whole machine. Every project reaches into it.',
    steps: [{label: 'pip list', out: ['pygments  2.21.0'], detail: 'one version, for everyone', atWord: 4}],
    stage: [{label: 'invoice-app', text: '2.21.0', atWord: 2}, {label: 'report-tool', text: '2.0', atWord: 5},
            {label: 'pygments', text: '2.21.0', sub: 'the slot holds exactly one', atWord: 9}]},
  'shelf-evict': {headline: 'The last install [wins]', stageTitle: 'the overwrite',
    steps: [{label: 'pip install pygments==2.0.0', out: ['  Uninstalling Pygments-2.21.0:', '    Successfully uninstalled Pygments-2.21.0'], atWord: 2}],
    stage: [{label: 'pygments', text: '2.21.0', value: 0, atWord: 3}, {label: 'pygments', text: '2.0', sub: 'nobody asked the project that needed the old one', atWord: 6},
            {label: 'rich 15.0.0', detail: 'requires pygments>=2.13.0', atWord: 11}],
    verdict: 'It said ERROR and Successfully', verdictAtWord: 13},
  'shelf-split': {headline: 'A shelf [each]', stageTitle: 'the wall goes up',
    stage: [{label: 'invoice-app', text: '2.21.0', detail: 'pygments', atWord: 3}, {label: 'report-tool', text: '2.0', detail: 'pygments', atWord: 6},
            {label: 'wall', sub: 'neither project can reach the other shelf', atWord: 9}]},
  'two-projects': {headline: 'You never opened [the other one]', stageTitle: 'the blast radius',
    stage: [{label: 'report-tool', sub: 'you installed something here', atWord: 3}, {label: 'invoice-app', sub: 'and this one stopped working', atWord: 8}]},
  'env-ceremony': {headline: 'The ritual nobody [keeps up]', stageTitle: 'every single time',
    stage: [{label: 'make it', icon: 'lucide:package-plus', atWord: 2},
            {label: 'switch it on', icon: 'lucide:toggle-right', atWord: 4},
            {label: 'remember', icon: 'lucide:brain', atWord: 7},
            {label: 'switch it off', icon: 'lucide:toggle-left', atWord: 11},
            {label: 'uv run main.py', sub: 'created, used and forgotten for you', atWord: 15}]},
};

// Narration long enough that every anchor above has already fired by the 55% mark
// _proof.mjs shoots at — a fixture that shoots mid-entrance measures the animation,
// not the layout.
const NARRATION = 'One two three four five six seven eight nine ten eleven twelve thirteen '
  + 'fourteen fifteen sixteen seventeen eighteen nineteen twenty twenty-one twenty-two '
  + 'twenty-three twenty-four twenty-five twenty-six twenty-seven twenty-eight and stop.';

const scene = (id, uvStage) => ({
  id, type: 'UV_STAGE', narration: NARRATION, durationFrames: 240,
  timingSource: 'estimated', background: 'zoneA', data: {uvStage},
});

const scenes = [];
for (const kind of KINDS) {
  const short = kind.replace(/-/g, '');
  // MIN — the sparsest content the linter permits. Tests centring and small layouts.
  scenes.push(scene('uv-' + short + '-min', {
    kind, color: 'blue', promptLabel: 'you@laptop', cwd: '~/w',
    stage: Array.from({length: NEED[kind]}, (_, i) => ({label: 'p' + i, atWord: 3 + i})),
  }));
  // MAX — every field at its cap, every collection at its ceiling.
  scenes.push(scene('uv-' + short + '-max', {
    kind, color: 'orange', headline: maxHeadline,
    premise: at(CAP.premise, 'A premise carried right out to the limit so the pane has to hold it '),
    stageTitle: at(CAP.stageTitle, 'stage title to the cap'),
    token: at(CAP.token, 'TOKEN AT THE CAP'),
    promptLabel: at(CAP.promptLabel, 'longest@promptlabel'),
    cwd: at(CAP.cwd, '~/projects/deep/nested'),
    highlight: 'uv',
    steps: maxSteps(2, 6),
    // the collapse is the LAST item, and for env-ceremony it must not have fired by the
    // 55% shot or MAX proofs an empty ring
    stage: maxStage(MAXI[kind], kind).map((x, i, a) =>
      kind === 'env-ceremony' && i === a.length - 1 ? {...x, atWord: 22} : x),
    verdict: at(CAP.verdict, 'A verdict pushed to its'),
    verdictSub: at(CAP.verdictSub, 'and a sub-line pushed to its'),
    verdictAtWord: 20,
  }));
  // MIX — what the course will actually ship.
  scenes.push(scene('uv-' + short + '-mix', {kind, color: 'blue', promptLabel: 'you@laptop', cwd: '~/work', ...MIX[kind]}));
}
// env-ceremony has TWO states and one still can only show one of them: the ring turning,
// and the ring collapsed into a single command. The mix fixture catches the collapse
// (its last anchor has fired by the 55% mark); this one holds the collapse back so the
// ring itself is what gets proofed. A component with a payoff state needs a fixture for
// each, or half of it ships unlooked-at.
scenes.push(scene('uv-envceremony-ring', {
  kind: 'env-ceremony', color: 'blue', promptLabel: 'you@laptop', cwd: '~/work',
  headline: 'The ritual nobody [keeps up]', stageTitle: 'round and round',
  stage: [{label: 'make it', icon: 'lucide:package-plus', atWord: 2},
          {label: 'switch it on', icon: 'lucide:toggle-right', atWord: 4},
          {label: 'remember', icon: 'lucide:brain', atWord: 6},
          {label: 'switch it off', icon: 'lucide:toggle-left', atWord: 8},
          {label: 'and again', icon: 'lucide:rotate-ccw', atWord: 10},
          {label: 'every project', icon: 'lucide:alarm-clock', atWord: 12},
          {label: 'uv run main.py', sub: 'the whole ring, gone', atWord: 22}],
}));

// The terminal-only layout, at MAX: 5 commands and 45 output lines and no second pane.
scenes.push(scene('uv-terminal-max', {
  layout: 'terminal', color: 'green', headline: maxHeadline,
  premise: at(CAP.premise, 'A terminal-only beat: the whole content is the screen, so there is '),
  promptLabel: at(CAP.promptLabel, 'longest@promptlabel'), cwd: at(CAP.cwd, '~/projects/deep/nested'),
  highlight: 'uv', steps: maxSteps(3, 6),
}));
// ...and at MIX, which is how it will really be authored.
scenes.push(scene('uv-terminal-mix', {
  layout: 'terminal', color: 'green', headline: 'uv installs in [one line]',
  premise: 'No Python needed to install it. That is the whole point of this step.',
  promptLabel: 'you@laptop', cwd: '~/work', highlight: 'uv',
  steps: [{label: 'curl -LsSf https://astral.sh/uv/install.sh | sh',
           out: ['downloading uv 0.12.5 x86_64-unknown-linux-gnu', 'installing to ~/.local/bin', '  uv', '  uvx', 'everything is installed!'],
           atWord: 3}],
}));

const out = process.argv[2] || 'out/uv-fixtures.json';
const dir = out.replace(/[^/\\]+$/, '');
if (dir) fs.mkdirSync(dir, {recursive: true});
fs.writeFileSync(out, JSON.stringify({
  meta: {title: 'UV_STAGE stress fixtures', format: 'long', topicAxes: ['economic-pain', 'sovereignty']},
  brand: {theme: 'terminalcli'},
  scenes,
}, null, 2));
console.log(out + ' — ' + scenes.length + ' fixtures (' + KINDS.length + ' kinds x min/max/mix + 2 terminal)');
