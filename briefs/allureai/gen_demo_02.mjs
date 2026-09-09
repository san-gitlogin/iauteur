#!/usr/bin/env node
// CHAPTER 2 RECORDING — demos/allure-02.json
//
// Same discipline as chapter 1: every line typed on camera is SLICED from the verified
// chapter folder, so the footage and the numbers spoken over it come from the same bytes.
// This chapter consumes chapter 1's results folder, so prep copies it in rather than
// re-running behave on camera — the run itself was chapter 1's story, not this one's.
import fs from 'node:fs';
import path from 'node:path';

const CH = '/Users/santhu/iauteur/AllureAI_VideoTutorial/chapter_02_decode_allure_report';
const CH1 = '/Users/santhu/iauteur/AllureAI_VideoTutorial/chapter_01_generate_allure_report';
const lines = (rel) => fs.readFileSync(path.join(CH, rel), 'utf8')
  .replace(/\r\n/g, '\n').replace(/\s+$/, '').split('\n');
const src = (rel, from, to) => lines(rel).slice(from - 1, to).join('\n');

const PACK = 'build_single_file_report.py';
const DEC = 'decode_report.py';

const type = (id, file, text, label, opts = {}) =>
  ({id, action: 'type', path: file, text, label, focus: 'editor', ...opts});
const open = (id, file, label) => ({id, action: 'openFile', path: file, label});
const settle = (id) => ({id: `${id}Settle`, action: 'pause', ms: 1800});
const run = (id, cmd, label, opts = {}) =>
  ({id, action: 'run', cmd, label, focus: 'terminal', ...opts});

const demo = {
  slug: 'allure-02',
  surface: 'vscode',
  theme: 'dark',
  workspace: 'allure-02',
  viewport: {width: 1600, height: 900},
  deviceScaleFactor: 4,
  // AND KEEP WHAT WAS CAPTURED. `masterWidth` defaults to 1920, so a dsf-4 capture was
  // being downscaled from 6400 back to 1920 before it was ever written — the deep zooms
  // then upscaled 3.2x from that, and `check-recordings` refused to render eleven clips.
  // 0 means: write the native capture, only rounding to even dimensions.
  masterWidth: 0,
  fps: 30,
  maximizePanel: false,
  prep: {
    files: {
      'build_single_file_report.py': '',
      'decode_report.py': '',
    },
    commands: [
      'mkdir -p /tmp/iauteur-bin && cp {{TOOLS}}/uv/uv /tmp/iauteur-bin/',
      'export PATH="/tmp/iauteur-bin:$PATH" UV_NO_MODIFY_PATH=1',
      // Idempotent: take two starts from the same folder as take one.
      'rm -rf allure-results-bdd bundle.html',
      `cp -R ${CH1}/allure-results-bdd ./allure-results-bdd`,
    ],
  },
  steps: [
    // ══ what we are starting from ═══════════════════════════════════════════
    {id: 'look', action: 'run', cmd: 'ls allure-results-bdd | wc -l',
     label: 'twenty-two files from last time', focus: 'terminal', clearFirst: true,
     expect: {exitCode: 0}, holdMs: 2200, marks: [{id: 'count', text: '22'}]},
    run('kinds', "ls allure-results-bdd | sed 's/.*-//' | sort | uniq -c | sort -rn",
        'ten results, and their evidence',
        {clearFirst: true, expect: {contains: 'result.json'}, holdMs: 2600,
         marks: [{id: 'results', text: 'result.json'}]}),

    // ══ the packer ══════════════════════════════════════════════════════════
    open('openpack', PACK, 'the five-step trick, written down'),
    settle('openpack'),
    type('pk1', PACK, src(PACK, 1, 25), 'the trick, in five lines of English'),
    type('pk2', PACK, '\n' + src(PACK, 26, 31), 'four imports, all built in',
         {marks: [{id: 'gzip', text: 'import gzip'}]}),
    type('pk3', PACK, '\n' + src(PACK, 32, 46), 'one dictionary, everything in it',
         {marks: [{id: 'b64line', text: 'base64.b64encode'}]}),
    type('pk4', PACK, '\n' + src(PACK, 47, 58), 'json, then gzip, then base64',
         {marks: [{id: 'compress', text: 'gzip.compress'}]}),
    type('pk5', PACK, '\n' + src(PACK, 59, 72), 'and drop it inside a script tag',
         {marks: [{id: 'scripttag', text: 'id="report-bundle"'}]}),
    type('pk6', PACK, '\n' + src(PACK, 73, 83), 'the command line part'),
    {id: 'savepack', action: 'save', label: 'saved'},

    // ══ squash it ═══════════════════════════════════════════════════════════
    run('pack', 'uv run --no-project python build_single_file_report.py allure-results-bdd',
        'three numbers, one file',
        {clearFirst: true, expect: {contains: 'Single-file report'}, holdMs: 3400,
         marks: [{id: 'raw', text: 'Raw JSON size'},
                 {id: 'gz', text: 'Gzip-compressed size'},
                 {id: 'b64', text: 'Base64 (final) size'}]}),
    run('bundlesize', 'ls -lh bundle.html', 'one file on disk',
        {expect: {exitCode: 0}, holdMs: 2000}),
    run('peek', 'head -c 300 bundle.html', 'and it is unreadable on purpose',
        {clearFirst: true, expect: {exitCode: 0}, holdMs: 2800,
         marks: [{id: 'notice', text: 'packed test evidence'}]}),

    // ══ the decoder ═════════════════════════════════════════════════════════
    open('opendec', DEC, 'now open it back up'),
    settle('opendec'),
    type('dc1', DEC, src(DEC, 1, 27), 'the shape we are decoding into'),
    type('dc2', DEC, '\n' + src(DEC, 28, 50), 'three dataclasses, three levels',
         {marks: [{id: 'dcls', text: '@dataclass'}]}),
    type('dc3', DEC, '\n' + src(DEC, 51, 65), 'the same five steps, backwards',
         {marks: [{id: 'decompress', text: 'gzip.decompress'}]}),
    type('dc4', DEC, '\n' + src(DEC, 66, 76), 'a guess, when the type is missing'),
    // Split at 95: a 35-line block scrolls its own top away, and the `loop` mark would
    // resolve to a row that is no longer laid out (the chapter 1 failure, exactly).
    type('dc5', DEC, '\n' + src(DEC, 77, 95), 'one result becomes one object',
         {marks: [{id: 'loop', text: 'for raw_step in result.get'}]}),
    type('dc5b', DEC, '\n' + src(DEC, 96, 110), 'and its evidence comes back as bytes',
         {marks: [{id: 'b64dec', text: 'base64.b64decode'}]}),
    type('dc6', DEC, '\n' + src(DEC, 111, 131), 'count the four outcomes again',
         {marks: [{id: 'counts', text: 'broken = sum'}]}),
    type('dc7', DEC, '\n' + src(DEC, 132, 141), 'and print one line per test'),
    {id: 'savedec', action: 'save', label: 'saved'},

    // ══ prove it ════════════════════════════════════════════════════════════
    run('decode', 'uv run --no-project python decode_report.py bundle.html',
        'the same ten, back out again',
        {clearFirst: true, expect: {contains: 'Decoded 10 test cases'}, holdMs: 4200,
         marks: [{id: 'tally', text: 'passed: 7  failed: 1  broken: 1  skipped: 1'},
                 {id: 'reason', text: 'reason: AssertionError'}]}),
  ],
};

// EVERY TYPED BLOCK, CONCATENATED, MUST BE THE FILE — a skipped blank line between two
// ranges shipped a 184-line reconstruction of a 185-line file on chapter 1.
for (const file of [PACK, DEC]) {
  const typed = demo.steps.filter((s) => s.action === 'type' && s.path === file)
    .map((s) => s.text).join('');
  const want = lines(file).join('\n');
  if (typed.replace(/^\n/, '') !== want) {
    const a = typed.replace(/^\n/, '').split('\n'), b = want.split('\n');
    const i = a.findIndex((l, k) => l !== b[k]);
    throw new Error(`${file}: typed blocks do not reconstruct the file — ` +
      `${a.length} lines vs ${b.length}; first difference at line ${i + 1}: ` +
      `${JSON.stringify(a[i])} vs ${JSON.stringify(b[i])}`);
  }
}

const PROMPT_COLS = 14, TERM_COLS = 125;
for (const st of demo.steps) {
  if (st.action !== 'run') continue;
  if (PROMPT_COLS + st.cmd.length > TERM_COLS - 4) {
    throw new Error(`step "${st.id}": command is ${st.cmd.length} chars and would wrap.`);
  }
}
fs.writeFileSync('/Users/santhu/iauteur/demos/allure-02.json', JSON.stringify(demo, null, 2) + '\n');
const typing = demo.steps.filter((s) => s.action === 'type');
console.log(`wrote demos/allure-02.json — ${demo.steps.length} steps, ${typing.length} typing blocks`);
for (const t of typing) console.log(`   ${t.id.padEnd(8)} ${String(t.text.split('\n').length).padStart(3)} lines  ${t.label}`);
