#!/usr/bin/env node
// CHAPTER 1 RECORDING — demos/allure-01.json
//
// THE CODE TYPED ON CAMERA IS SLICED FROM THE FILES THAT ACTUALLY RAN.
// Not retyped, not paraphrased. `src()` reads the verified chapter folder and cuts it by
// line range, so a transcription slip is impossible and the footage cannot drift from the
// run that produced the numbers in the script. (LAW 0m, and the corollary that a
// verification run is not the take — here they are literally the same bytes.)
import fs from 'node:fs';
import path from 'node:path';

const CH = '/Users/santhu/iauteur/AllureAI_VideoTutorial/chapter_01_generate_allure_report';
// The chapter folder is CRLF. Monaco normalises line endings as it types, so a slice
// carrying \r can never match what the editor shows — the recorder caught it, but the
// fix belongs here, at the source.
const lines = (rel) => fs.readFileSync(path.join(CH, rel), 'utf8')
  .replace(/\r\n/g, '\n').replace(/\s+$/, '').split('\n');
/** 1-indexed, inclusive — the same numbers `grep -n` prints. */
const src = (rel, from, to) => lines(rel).slice(from - 1, to).join('\n');

const FEAT = 'features/homepage_checks.feature';
const STEPS = 'features/steps/homepage_steps.py';
const ENV = 'features/environment.py';
const RPT = 'build_simple_html_report.py';

const type = (id, file, text, label, opts = {}) =>
  ({id, action: 'type', path: file, text, label, focus: 'editor', ...opts});
const open = (id, file, label) => ({id, action: 'openFile', path: file, label});
const settle = (id) => ({id: `${id}Settle`, action: 'pause', ms: 1800});
const run = (id, cmd, label, opts = {}) =>
  ({id, action: 'run', cmd, label, focus: 'terminal', ...opts});

const demo = {
  slug: 'allure-01',
  surface: 'vscode',
  theme: 'dark',
  workspace: 'allure-01',
  viewport: {width: 1600, height: 900},
  // THE MASTER MUST OUTLIVE THE ZOOM: RecordedStep can push to 3.2x, so a 1920 master is
  // 6144 painted pixels drawn from 1920. dsf 4 on a 1600 viewport gives a 6400px master.
  deviceScaleFactor: 4,
  fps: 30,
  maximizePanel: false,
  prep: {
    files: {
      'features/homepage_checks.feature': '',
      'features/environment.py': '',
      'features/steps/homepage_steps.py': '',
      'build_simple_html_report.py': '',
    },
    commands: [
      'mkdir -p /tmp/iauteur-bin && cp {{TOOLS}}/uv/uv /tmp/iauteur-bin/',
      'export PATH="/tmp/iauteur-bin:$PATH" UV_NO_MODIFY_PATH=1',
      // uv init stamps the local git identity into pyproject.toml; a recording must never
      // carry the operator's name or email (LAW 0m.2).
      "printf '[user]\\n\\tname = dev\\n\\temail = dev@example.com\\n' > /tmp/iauteur-gitconfig",
      'export GIT_CONFIG_GLOBAL=/tmp/iauteur-gitconfig',
      // Idempotent: take two starts from the same empty folder as take one.
      'rm -rf .venv uv.lock pyproject.toml README.md .python-version main.py .git allure-results-bdd report-python-only.html',
    ],
  },
  steps: [
    // ══ the empty folder, and the toolchain ═════════════════════════════════
    {id: 'look', action: 'run', cmd: 'ls -R', label: 'four empty files, nothing else',
     focus: 'terminal', clearFirst: true, expect: {exitCode: 0},
     marks: [{id: 'feat', text: 'homepage_checks.feature'}]},
    run('init', 'uv init --bare', 'one command makes it a project',
        {expect: {contains: 'Initialized project', exitCode: 0},
         marks: [{id: 'made', text: 'Initialized project'}]}),
    run('add', 'uv add behave allure-behave playwright requests', 'the four libraries',
        {expect: {exitCode: 0}, holdMs: 1200}),
    // `uv add` resolves dozens of packages and the interesting lines scroll off, so the
    // versions are read back from pyproject where they stay put and stay markable.
    run('deps', "sed -n '/dependencies/,/]/p' pyproject.toml", 'what landed in the project',
        {clearFirst: true, expect: {contains: 'behave', exitCode: 0},
         marks: [{id: 'behave', text: 'behave'}, {id: 'allure', text: 'allure-behave'},
                 {id: 'pw', text: 'playwright'}, {id: 'req', text: 'requests'}]}),
    run('browser', 'uv run playwright install chromium', 'and one real browser',
        {expect: {exitCode: 0}, holdMs: 1400}),

    // ══ the feature file — plain English first ══════════════════════════════
    open('openfeat', FEAT, 'plain English, before any Python'),
    settle('openfeat'),
    type('feat1', FEAT, src(FEAT, 1, 7), 'the feature, and one shared setup line'),
    type('feat2', FEAT, '\n' + src(FEAT, 8, 16), 'the first two checks'),
    type('feat3', FEAT, '\n' + src(FEAT, 17, 27), 'a screenshot, and a timing table'),
    type('feat4', FEAT, '\n' + src(FEAT, 28, 36), 'a zip, and three ways to write a summary'),
    type('feat5', FEAT, '\n' + src(FEAT, 37, 50), 'the three nobody shows you',
         {marks: [{id: 'broken', text: 'This check is broken by an unexpected error'},
                  {id: 'skip', text: 'This check is skipped on purpose'}]}),
    {id: 'savefeat', action: 'save', label: 'saved'},
    // All ten are written now, so the three that carry the chapter get a beat of their
    // own where every one of them is on screen at once and stays put.
    run('special', 'grep -A2 "Scenario: This check" features/homepage_checks.feature',
        'the three that teach the chapter',
        {clearFirst: true, expect: {contains: 'skipped on purpose'}, holdMs: 3400,
         marks: [{id: 'sfail', text: 'This check is written to fail on purpose'},
                 {id: 'sbrok', text: 'This check is broken by an unexpected error'},
                 {id: 'sskip', text: 'This check is skipped on purpose'}]}),

    // ══ the steps file — English sentences get Python behind them ═══════════
    open('opensteps', STEPS, 'now the Python behind each line'),
    settle('opensteps'),
    type('st1', STEPS, src(STEPS, 1, 9), 'a note to whoever opens this next'),
    type('st1b', STEPS, '\n' + src(STEPS, 10, 18), 'twenty attachment types exist'),
    type('st1c', STEPS, '\n' + src(STEPS, 19, 27), 'the imports, and what each is for'),
    type('st2', STEPS, '\n' + src(STEPS, 28, 48), 'a target, a request, a status check',
         {marks: [{id: 'assertline', text: 'assert context.response.status_code'}]}),
    type('st3', STEPS, '\n' + src(STEPS, 49, 64), 'the page HTML, attached as evidence',
         {marks: [{id: 'contains', text: 'assert expected_text in context.response.text'}]}),
    type('st4', STEPS, '\n' + src(STEPS, 65, 81), 'a real browser, and a screenshot'),
    type('st5', STEPS, '\n' + src(STEPS, 82, 108), 'three timed requests, as a table'),
    type('st6', STEPS, '\n' + src(STEPS, 109, 126), 'the same page as a JPEG'),
    type('st7', STEPS, '\n' + src(STEPS, 127, 148), 'a zip, built in memory'),
    type('st8', STEPS, '\n' + src(STEPS, 149, 172), 'one summary, three formats'),
    type('st9', STEPS, '\n' + src(STEPS, 173, 185), 'the broken one, and the skipped one',
         {marks: [{id: 'keyerror', text: 'X-Definitely-Not-A-Real-Header'},
                  {id: 'skipcall', text: 'context.scenario.skip'}]}),
    {id: 'savesteps', action: 'save', label: 'saved'},

    // ══ one browser, shared ═════════════════════════════════════════════════
    open('openenv', ENV, 'one browser for the whole run'),
    settle('openenv'),
    type('env1', ENV, src(ENV, 1, 9), 'why this file exists'),
    type('env2', ENV, '\n' + src(ENV, 10, 18), 'open it once, close it once',
         {marks: [{id: 'beforeall', text: 'def before_all'}]}),
    {id: 'saveenv', action: 'save', label: 'saved'},

    // ══ the first run ═══════════════════════════════════════════════════════
    run('behave', 'uv run python -m behave -f allure_behave.formatter:AllureFormatter -o allure-results-bdd features',
        'all four outcomes, in one run',
        {clearFirst: true, expect: {contains: '1 skipped'}, holdMs: 2600,
         marks: [{id: 'tally', text: '7 scenarios passed, 1 failed, 1 error, 1 skipped'}]}),

    // ══ the raw evidence, before any report ═════════════════════════════════
    run('rawcount', "ls allure-results-bdd | sed 's/.*-//' | sort | uniq -c | sort -rn",
        'what behave actually wrote', {clearFirst: true, expect: {contains: 'result.json'},
         holdMs: 2400, marks: [{id: 'results', text: 'result.json'}]}),
    // The status TALLY counts step-level statuses too, so it reads "2 broken" for one
    // broken scenario and invites a question the beat does not want. `sort -u` answers the
    // only question being asked: which outcomes exist at all.
    run('statuses', "grep -ho '\"status\": \"[a-z]*\"' allure-results-bdd/*result.json | sort -u",
        'four outcomes, in the files themselves',
        {clearFirst: true, expect: {contains: 'broken'}, holdMs: 3200,
         marks: [{id: 'sbroken', text: '"status": "broken"'},
                 {id: 'sskipped', text: '"status": "skipped"'}]}),
    run('messages', "grep -ho '\"message\": \"[^\"]*\"' allure-results-bdd/*result.json | sort -u",
        'two different kinds of breakage',
        {clearFirst: true, expect: {contains: 'KeyError'}, holdMs: 3400,
         marks: [{id: 'assertmsg', text: 'AssertionError'},
                 {id: 'keymsg', text: 'KeyError'}]}),

    // ══ our own report builder ══════════════════════════════════════════════
    open('openrpt', RPT, 'the part that replaces the Java tool'),
    settle('openrpt'),
    type('rpt1', RPT, src(RPT, 1, 10), 'what this script is for'),
    type('rpt2', RPT, '\n' + src(RPT, 11, 26), 'the rule it uses to classify evidence'),
    type('rpt3', RPT, '\n' + src(RPT, 27, 37), 'read every result file'),
    type('rpt4', RPT, '\n' + src(RPT, 38, 68), 'is it an image?',
         {marks: [{id: 'csvtable', text: 'csv-table'}]}),
    type('rpt5', RPT, '\n' + src(RPT, 69, 96), 'is it text-shaped? otherwise, a link',
         {marks: [{id: 'download', text: 'Download'}]}),
    type('rpt6', RPT, '\n' + src(RPT, 97, 116), 'one step, and the steps inside it'),
    type('rpt7', RPT, '\n' + src(RPT, 117, 140), 'one test, and its status'),
    type('rpt8', RPT, '\n' + src(RPT, 141, 165), 'its message, when it has one'),
    type('rpt9', RPT, '\n' + src(RPT, 166, 190), 'its steps and its evidence'),
    type('rpt10', RPT, '\n' + src(RPT, 191, 209), 'the shell of the page'),
    type('rpt11', RPT, '\n' + src(RPT, 210, 234), 'count all four, then write it out',
         {marks: [{id: 'counts', text: 'broken_count'}]}),
    type('rpt12', RPT, '\n' + src(RPT, 235, 245), 'the command line entry point'),
    {id: 'savertp', action: 'save', label: 'saved'},

    // ══ build it, and look at it ════════════════════════════════════════════
    run('build', 'uv run python build_simple_html_report.py allure-results-bdd -t "Homepage Health"',
        'four counts, correctly separated',
        {clearFirst: true, expect: {contains: '10 total'}, holdMs: 3000,
         marks: [{id: 'tally2', text: '7 passed, 1 failed, 1 broken, 1 skipped, 10 total'}]}),
    run('size', 'ls -lh report.html', 'one file, everything inside it',
        {expect: {exitCode: 0}, holdMs: 2000}),
  ],
};


const PROMPT_COLS = 14, TERM_COLS = 125;
for (const st of demo.steps) {
  if (st.action !== 'run') continue;
  const w = PROMPT_COLS + st.cmd.length;
  if (w > TERM_COLS - 4) {
    throw new Error(`step "${st.id}": the command is ${st.cmd.length} chars, which wraps at ` +
      `${TERM_COLS} columns — the implicit __cmd mark cannot resolve across two rows. Shorten it.`);
  }
}
fs.writeFileSync('/Users/santhu/iauteur/demos/allure-01.json', JSON.stringify(demo, null, 2) + '\n');
const typing = demo.steps.filter((s) => s.action === 'type');
console.log(`wrote demos/allure-01.json — ${demo.steps.length} steps, ${typing.length} typing blocks`);
for (const t of typing) console.log(`   ${t.id.padEnd(8)} ${String(t.text.split('\n').length).padStart(3)} lines  ${t.label}`);
