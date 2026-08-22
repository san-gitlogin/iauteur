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
             token: 28, promptLabel: 26, cwd: 26, stepLabel: 60, stepDetail: 48,
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
  label: ['env-ceremony', 'project-tree', 'install-routes', 'script-header', 'dist-output', 'depot-cache'].includes(kind)
    ? at(CAP.stageLabelCmd, 'source .venv' + i + '/bin/activate')
    : at(CAP.stageLabel, 'pkg-name-' + i),
  ...(kind === 'env-ceremony' ? {icon: RING_ICONS[i % RING_ICONS.length]} : {}),
  text: kind === 'constraint-line'
    ? [Math.min(0.5, 0.05 * i), Math.min(1, 0.45 + 0.09 * i)].map((x) => x.toFixed(2)).join('..')
    : at(CAP.stageText, i + '.21.0'),
  sub: at(CAP.stageSub, 'sub line ' + i + ' carried all the way to'),
  detail: at(CAP.stageDetail, 'pygments<3.0.0,>=2.13.' + i),
  ...(kind === 'project-tree' ? {value: i % 3} : {}),
  atWord: 3 + i,
}));

const KINDS = ['pkg-parcel', 'pkg-index', 'dep-unfold', 'shelf-share', 'shelf-evict',
               'shelf-split', 'two-projects', 'env-ceremony', 'bootstrap-paradox',
               'install-routes', 'ephemeral-bay', 'interpreter-rack', 'project-tree',
               'constraint-line', 'packing-list', 'depot-cache', 'script-header',
               'strict-gate', 'dist-output'];
// the linter's own NEED / MAXI maps — MIN and MAX are authored at exactly the bounds
// it permits, so the fixture stresses the contract rather than somebody's taste.
const NEED = {'pkg-parcel': 1, 'pkg-index': 1, 'dep-unfold': 2, 'shelf-share': 3,
              'shelf-evict': 2, 'shelf-split': 2, 'two-projects': 2, 'env-ceremony': 2,
              'bootstrap-paradox': 2, 'install-routes': 2, 'ephemeral-bay': 1,
              'interpreter-rack': 2, 'project-tree': 2, 'constraint-line': 2,
              'packing-list': 2, 'depot-cache': 2, 'script-header': 2,
              'strict-gate': 3, 'dist-output': 3};
const MAXI = {'pkg-parcel': 4, 'pkg-index': 6, 'dep-unfold': 6, 'shelf-share': 3,
              'shelf-evict': 3, 'shelf-split': 3, 'two-projects': 2, 'env-ceremony': 7,
              'bootstrap-paradox': 3, 'install-routes': 6, 'ephemeral-bay': 4,
              'interpreter-rack': 8, 'project-tree': 8, 'constraint-line': 5,
              'packing-list': 7, 'depot-cache': 3, 'script-header': 6,
              'strict-gate': 3, 'dist-output': 3};
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

// ── the eleven kinds the later chapters need ─────────────────────────────────
Object.assign(MIX, {
  'bootstrap-paradox': {headline: 'pip lives [inside] Python', stageTitle: 'inside, or beside',
    premise: 'pip is a Python package, so pip needs a working Python before pip can do anything.',
    steps: [{label: 'python -m pip --version', out: ['pip 25.2 from .../site-packages/pip'], detail: 'pip lives in that folder', atWord: 3}],
    stage: [{label: 'CPython 3.12', sub: 'the interpreter', detail: 'no Python, no pip', atWord: 2},
            {label: 'pip', sub: 'a package, in site-packages', atWord: 5},
            {label: 'uv', sub: 'one Rust binary, on its own', detail: 'no Python needed to install it', atWord: 9}]},
  'install-routes': {headline: 'Several roads, [one] destination', stageTitle: 'pick your road', token: 'one binary, four roads',
    steps: [{label: 'curl -LsSf https://astral.sh/uv/install.sh | sh', out: ['installing to ~/.local/bin', '  uv', '  uvx'], detail: 'the standalone installer', atWord: 3}],
    stage: [{label: 'curl | sh', text: 'macOS/Linux', sub: 'the standalone binary', atWord: 2},
            {label: 'irm | iex', text: 'Windows', sub: 'the same binary, PowerShell', atWord: 4},
            {label: 'brew install uv', text: 'macOS', sub: 'homebrew keeps it updated', atWord: 6},
            {label: 'pip install uv', text: 'the trap', sub: 'puts uv inside what uv manages', value: 0, atWord: 8},
            {label: 'uv --version', sub: 'uv 0.12.5', atWord: 11}]},
  'ephemeral-bay': {headline: 'Borrowed, not [installed]', stageTitle: 'wheeled in, wheeled out',
    premise: 'uvx builds a throwaway environment in the cache, runs the tool, and lets it go.',
    steps: [{label: 'uvx ruff check .', out: ['Installed 1 package in 8ms', 'All checks passed!'], detail: 'you never installed ruff', atWord: 3}],
    stage: [{label: 'ruff', text: '0.14.2', icon: 'lucide:wrench', atWord: 2},
            {label: 'nothing on PATH', sub: 'the bay is empty again', atWord: 8}]},
  'interpreter-rack': {headline: 'A rack of [Pythons]', stageTitle: 'what uv can reach', token: 'uv python list',
    steps: [{label: 'uv python list', out: ['cpython-3.13.1-macos  <download available>', 'cpython-3.12.14-macos /Users/.../bin/python3'], detail: 'installed, or one command away', atWord: 3}],
    stage: [{label: 'cpython-3.13.1', text: 'newest', sub: 'download available', value: 0, atWord: 2},
            {label: 'cpython-3.12.14', text: 'installed', sub: 'managed by uv', detail: 'pinned', atWord: 4},
            {label: 'cpython-3.11.9', text: 'installed', sub: 'managed by uv', atWord: 6},
            {label: 'pypy-3.11', text: 'available', sub: 'a different implementation', value: 0, atWord: 8}]},
  'project-tree': {headline: 'What [uv init] wrote', stageTitle: 'six things, one command',
    premise: 'Every file uv init writes has a job. Nothing in this tree is decoration.',
    steps: [{label: 'uv init hello-world && ls -a hello-world', out: ['.git  .gitignore  .python-version', 'README.md  main.py  pyproject.toml'], detail: 'six things, from one word', atWord: 4}],
    stage: [{label: 'hello-world/', value: 0, sub: 'the project folder', atWord: 2},
            {label: 'pyproject.toml', value: 1, detail: 'the one', sub: 'what your project is, and what it needs', atWord: 4},
            {label: '.python-version', value: 1, sub: 'which Python this project uses', atWord: 6},
            {label: 'main.py', value: 1, sub: 'somewhere to start', atWord: 8},
            {label: '.gitignore', value: 1, sub: 'written for you, and it excludes .venv', atWord: 10}]},
  'constraint-line': {headline: 'Where the brackets [overlap]', stageTitle: 'one number line',
    premise: 'One line of pluggy versions. Each package lays a bracketed range across it.',
    steps: [{label: 'uv add "pluggy<1.0" pytest', out: ['x No solution found when resolving dependencies'], detail: 'the brackets never meet', atWord: 3}],
    stage: [{label: 'pluggy', sub: '0.9, 1.0, 1.2, 1.5, 2.0', atWord: 2},
            {label: 'pytest wants', text: '0.55..0.95', detail: '>=1.5,<2', atWord: 5},
            {label: 'you want', text: '0.02..0.30', detail: '<1.0', value: 0, atWord: 8}]},
  'packing-list': {headline: 'Which exact [bytes]', stageTitle: 'the packing list',
    premise: 'A lockfile records the exact file, not just the version. The seal is a sha256.',
    steps: [{label: 'head -6 uv.lock', out: ['name = "rich"', 'version = "15.0.0"', 'wheels = [{ url = "...", hash = "sha256:1f2a..." }]'], detail: 'a name, a number, and a seal', atWord: 4}],
    stage: [{label: 'rich', text: '15.0.0', detail: 'sha256:1f2a9c...', atWord: 2},
            {label: 'pygments', text: '2.21.0', detail: 'sha256:8b4e10...', atWord: 4},
            {label: 'mdurl', text: '0.1.2', detail: 'sha256:aa30de...', sub: 'the same bytes on every machine', atWord: 7}]},
  'depot-cache': {headline: 'The second run is [instant]', stageTitle: 'measured on this machine', token: 'PyPI',
    premise: 'The same command twice. The only difference is whether the depot already had it.',
    steps: [{label: 'uvx ruff --version', out: ['ruff 0.14.2'], detail: 'cold: fetched, unpacked, run', atWord: 3},
            {label: 'uvx ruff --version', out: ['ruff 0.14.2'], detail: 'warm: the depot already had it', atWord: 8}],
    stage: [{label: 'cold', text: '5.792s', sub: 'all the way from the warehouse', atWord: 4},
            {label: 'warm', text: '0.294s', sub: 'from the depot down the road', atWord: 9},
            {label: 'nineteen times faster, here', atWord: 12}]},
  'script-header': {headline: 'The comment that [builds] a shelf', stageTitle: 'PEP 723, lifting off',
    premise: 'Those lines at the top of the file are not a comment. They are the environment.',
    steps: [{label: 'uv run demo.py', out: ['Reading inline script metadata from: demo.py', 'Installed 4 packages in 9ms', 'Hello!'], detail: 'no project, no venv, no setup', atWord: 4}],
    stage: [{label: 'demo.py', sub: 'one file, nothing else', detail: 'and uv built its shelf for it', atWord: 2},
            {label: '# /// script', sub: 'the block opens', atWord: 5},
            {label: '# requires-python = ">=3.12"', sub: 'which Python it needs', atWord: 7},
            {label: '# dependencies = ["rich"]', sub: 'and what to put on the shelf', atWord: 9},
            {label: '# ///', sub: 'the block closes', atWord: 11}]},
  'strict-gate': {headline: 'uv stops what [pip waves] through', stageTitle: 'two gates, one parcel',
    premise: 'The same package offered to both tools. Only one of them reads the small print.',
    steps: [{label: 'uv pip install broken-metadata', out: ['x Failed to parse metadata', '  Caused by: expected a version specifier'], detail: 'uv refuses, and says why', atWord: 4}],
    stage: [{label: 'broken-metadata', text: '1.0.0', atWord: 2},
            {label: 'pip', sub: 'installed', detail: 'and you find out later', atWord: 5},
            {label: 'uv', sub: 'rejected', detail: 'stricter, and it tells you now', atWord: 8}]},
  'dist-output': {headline: 'The wheel is built [from] the sdist', stageTitle: 'what uv build writes',
    premise: 'Two files in dist/, and the second is made out of the first. uv build says so.',
    steps: [{label: 'uv build', out: ['Building source distribution...', 'Building wheel from source distribution...', 'Successfully built dist/hello_world-0.1.0.tar.gz', 'and dist/hello_world-0.1.0-py3-none-any.whl'], detail: 'read the second line again', atWord: 3}],
    stage: [{label: 'your project', text: 'src/', sub: 'the code as you wrote it', detail: 'packed up', atWord: 2},
            {label: 'hello_world-0.1.0.tar.gz', text: 'sdist', sub: 'the source, packaged', atWord: 5},
            {label: 'hello_world-...any.whl', text: '1614 bytes', sub: 'the installable one', detail: 'built out of the sdist', atWord: 9}]},
});

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
