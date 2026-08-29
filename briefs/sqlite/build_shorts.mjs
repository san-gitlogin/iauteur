#!/usr/bin/env node
// Builds the two SHORT cuts of the SQLite course:
//
//   topics/sqlite-the-database-that-is-just-a-file/shorts.json   9:16, ~50s
//   topics/sqlite-scan-vs-search/long.json                       16:9, ~90s
//
// They are not trailers for the long cut. Each takes ONE payoff that already stands on its
// own and shows it end to end, because a short that gestures at a lesson teaches nothing.
//   - 9:16 gets the injection beat: one row, or the whole table. It needs no setup beyond
//     the two lines on screen, and the two results side by side ARE the argument.
//   - 16:9 gets SCAN -> SEARCH, which needs one more step of build-up than a vertical
//     cut can carry, and is the single most useful habit in the whole course.
//
// LAW 0m's vertical corollary governs the 9:16 cut: less content per beat, never smaller
// type. So the short carries two clips, not five.
//
// Usage: node briefs/sqlite/build_shorts.mjs
import fs from 'node:fs';
import path from 'node:path';

const NL = String.fromCharCode(10);
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;

const mk = () => {
  const scenes = [];
  let n = 0;
  const TRANS = {HOOK: 'filmburn', RECORDED_STEP: 'push', OUTRO_CTA: 'dip'};
  const push = (type, narration, data, plusAnchors = 0) => {
    n++;
    const text = narration.trim().replace(/\s+/g, ' ');
    const w = words(text);
    scenes.push({
      id: 's' + String(n).padStart(2, '0'),
      type,
      transition: TRANS[type] ?? 'fade',
      background: 'zoneA',
      narration: text,
      data,
      durationFrames: w * 12 + 45,
      timingSource: 'estimate',
      _anchors: plusAnchors,
      _hook: type === 'HOOK',
    });
  };
  return {scenes, push};
};

const clip = (ref, label, opts = {}) => ({ref, label, focus: true, ...opts});

const brand = {
  theme: 'moderndark', design: 'moderndark', themeLight: 'daylight',
  channel: 'THE NBX STUDIO', logo: 'img:channel_logo.png',
  background: 'grid',
};

// ── 9:16 — one row, or the whole table ──────────────────────────────────────
{
  const {scenes, push} = mk();

  push('HOOK',
    `Two SQLite queries, four characters apart. One returns one row — the other returns everything.`,
    {headline: 'ONE QUOTE', subtext: 'and the whole table walks out',
     heroAsset: 'lucide:database', headlineAtWord: 2, heroAtWord: 11}, 2);

  push('RECORDED_STEP',
    `Look at the two lines. The first passes the name as a parameter — that's the question
     mark. The second glues the same name into the string. Four characters apart. Now run
     both. The safe one asked for a USB-C hub and got a USB-C hub. One row. The second was
     handed a quote, OR one equals one, and a comment marker, so every row matches and the
     rest of the query is dead. Four rows. The entire table.`,
    {recordedStep: {
      caption: 'one row, or all of them',
      premise: 'The same table and the same code path. Only the placeholder is different.',
      clips: [
        // THE CARD CARRIES THE MECHANISM, NOT A CAPTION.
        //
        // Owner, on this very cut: *"in shorts i dont see anything changed"*, and then
        // *"it would be great if we have this card in the shorts too because just
        // displaying text below the container doesnt help much again."* The card renders
        // in 9:16 now — but a card holding only a title and a sentence is the same
        // nothing, moved four hundred pixels down. So each clip gives it something to
        // draw, and both are the real thing rather than a chip with a word in it.
        //
        // Clip 1: a DECLARED graph (LAW 0k.1). The whole lesson is that one route keeps
        // the name as data and the other turns it into code, and a graph is the shape of
        // exactly that — two paths out of the same query text, converging on two
        // different fates. Every node lands on the word that names it.
        clip('rec:sqlite-act3#open-params', 'two ways to ask', {
          zooms: [{mark: 'safe'}, {mark: 'unsafe'}],
          callouts: [
            {text: 'the value stays a value', mark: 'safe', color: 'green'},
            {text: 'the value becomes code', mark: 'unsafe', color: 'red'},
          ],
          overlay: {
            kind: 'graph', atWord: 4,
            nodes: [
              {id: 'q', label: 'your query text', atWord: 4},
              {id: 'v', label: '"USB-C hub"', atWord: 10},
              {id: 'ph', label: '?  placeholder', atWord: 13},
              {id: 'glue', label: 'glued into the string', atWord: 21},
              {id: 'data', label: 'stays DATA', tone: 'green', atWord: 17},
              {id: 'code', label: 'becomes CODE', tone: 'red', atWord: 27},
            ],
            edges: [
              {from: 'q', to: 'ph', atWord: 13},
              {from: 'v', to: 'ph', atWord: 13},
              {from: 'ph', to: 'data', atWord: 17},
              {from: 'q', to: 'glue', atWord: 21},
              {from: 'glue', to: 'code', atWord: 27},
            ],
          },
        }),
        // Clip 2: the ROWS themselves. The argument of this short is a count — one row
        // against four — so the card shows the four products, with the one the safe query
        // legitimately returned landing on "One row" and the three it should never have
        // seen landing on "Four rows". A viewer with the sound off can still count them,
        // which is the test LAW 0d sets.
        clip('rec:sqlite-act3#run-params', 'safe, then not', {
          zooms: [{mark: 'one'}, {mark: 'all'}],
          callouts: [
            {text: 'exactly what was asked for', mark: 'one', color: 'green'},
            {text: 'the whole table', mark: 'all', color: 'red'},
          ],
          overlay: {
            kind: 'rows', atWord: 47, columns: ['name', 'price'],
            rows: [
              {cells: ['USB-C hub', '45.00'], state: 'kept', atWord: 47},
              // LAW 8 — these landed on words 75-77 of 79 and the linter called it: the payoff
              // was arriving in the last four percent of the read. They belong on *"so every
              // row matches"*, which is where the viewer actually learns the rest are coming,
              // and it teaches better too — the rows are already on screen when the voice
              // counts them.
              {cells: ['Mechanical keyboard', '89.00'], state: 'new', atWord: 64},
              {cells: ['27-inch monitor', '240.00'], state: 'new', atWord: 65},
              {cells: ['Desk lamp', '35.50'], state: 'new', atWord: 66},
            ],
          },
        }),
      ],
    }}, 10);

  push('OUTRO_CTA',
    `Use the question mark. Every time, in every language, forever.`,
    {message: 'Always pass the value as a parameter', sub: 'every language, every time'}, 0);

  const spec = {
    meta: {
      topic: 'SQL injection, in two lines of Python',
      subject: 'SQLite',
      format: 'shorts', fps: 30, screenplay: 'documentary',
      onePayoff: 'One row from a parameter, four rows from a glued string.',
      openLoop: 'Which of these two nearly identical queries returns the whole table?',
      analogy: 'A value handed over sealed, versus glued into the sentence.',
      topicAxes: ['entity-novelty', 'economic-pain'],
      seo: {
        title: 'One quote and the whole table walks out #python #sql',
        description: 'The same query, two ways. Real output, nothing faked.',
        tags: ['sql injection', 'python', 'sqlite', 'parameterised queries', 'security'],
        queries: ['sql injection python example', 'why use parameterised queries'],
      },
    },
    brand,
    thumbnail: {title: 'ONE QUOTE', badge: '4 ROWS', asset: 'lucide:database'},
    scenes,
  };
  check(spec, 'shorts');
  const dest = path.join('topics', 'sqlite-the-database-that-is-just-a-file', 'shorts.json');
  write(dest, spec);
}

// ── 16:9 — SCAN became SEARCH ───────────────────────────────────────────────
{
  const {scenes, push} = mk();

  push('HOOK',
    `SQLite gone slow on you? Before you rewrite a line, ask SQLite what it's planning.`,
    {headline: 'SCAN OR SEARCH', subtext: 'one word tells you everything',
     heroAsset: 'lucide:search', headlineAtWord: 2, heroAtWord: 11}, 2);

  push('SCAN_VS_SEEK',
    `Ask for the orders belonging to one product, and SQLite reads every row and checks each
     one, because reading everything is the only option available. Six rows here, so nobody
     cares. Six million and you would care enormously. An index gives the engine a second
     option: go straight to the answer.`,
    {scanVsSeek: {
      caption: 'the same question, asked two ways',
      premise: 'Six orders on disk. You want the ones for product 1.',
      scanLabel: 'SCAN orders', seekLabel: 'SEARCH orders USING INDEX',
      targetIndex: 4,
      rows: [
        {label: 'order 1', sub: 'product 2'}, {label: 'order 2', sub: 'product 3'},
        {label: 'order 3', sub: 'product 4'}, {label: 'order 4', sub: 'product 2'},
        {label: 'order 5', sub: 'product 1'}, {label: 'order 6', sub: 'product 3'},
      ],
      scanAtWord: 14, seekAtWord: 38, atWord: 3,
    }}, 3);

  push('RECORDED_STEP',
    `You don't have to guess about any of this, because SQLite will tell you outright. EXPLAIN
     QUERY PLAN asks what the engine intends to do before running anything at all, and the
     answer comes back as a single word: SCAN. The whole orders table, every row, to answer one
     small question. So — one command. Create an index on that column. It takes no arguments
     worth thinking about and prints no output whatsoever. Now run the identical query again.
     Same words, same table, same everything. And SCAN has become SEARCH, searching orders using
     the index we just built. One word changed, and that word is the difference between reading
     six million rows and jumping straight to the handful you asked for.`,
    {recordedStep: {
      caption: 'SCAN became SEARCH',
      premise: 'The identical query, before and after one CREATE INDEX.',
      // LET THE SOLVER PLACE IT. `place:'right'` was tried first and dropped the card straight onto
      // the terminal — the one region this beat is about. The ink-band measurement already knows
      // where the marks are; the card just needs to be narrow enough to sit in the space it finds.
      card: {width: 0.46},
      clips: [
        // THE CARD SHOWS THE TABLE, not a caption about the table. Six orders go in; five are cut
        // and one is kept, which is the whole difference between a scan and a seek — and it reads
        // with the sound off (LAW 0d).
        clip('rec:sqlite-act2#plan-before', 'the plan, before', {
          zooms: [{mark: 'scan'}],
          callouts: [{text: 'reads every row', mark: 'scan', color: 'orange'}],
          overlay: {kind: 'rows', columns: ['order', 'product'], color: 'orange', rows: [
            {cells: ['order 1', 'product 2'], state: 'cut'},
            {cells: ['order 2', 'product 3'], state: 'cut'},
            {cells: ['order 3', 'product 4'], state: 'cut'},
            {cells: ['order 4', 'product 2'], state: 'cut'},
            {cells: ['order 5', 'product 1'], state: 'kept'},
          ]},
        }),
        clip('rec:sqlite-act2#index', 'add the index', {
          overlay: {kind: 'swap', from: 'SCAN', to: 'SEARCH', color: 'green'},
        }),
        clip('rec:sqlite-act2#plan-after', 'the plan, after', {
          zooms: [{mark: 'search'}, {at: 'full'}],
          callouts: [{text: 'straight to the rows', mark: 'search', color: 'green'}],
          overlay: {kind: 'rows', columns: ['order', 'product'], color: 'green', rows: [
            {cells: ['order 5', 'product 1'], state: 'kept'},
          ]},
        }),
      ],
    }}, 8);

  push('OUTRO_CTA',
    `When something is slow, ask for the plan first. Guessing is how afternoons disappear.`,
    {message: 'Ask for the plan before you optimise', sub: 'the plan is a fact, a guess is not'}, 0);

  const spec = {
    meta: {
      topic: 'SCAN or SEARCH: reading a SQLite query plan',
      subject: 'SQLite',
      format: 'long', fps: 30, screenplay: 'documentary',
      onePayoff: 'One CREATE INDEX turns SCAN into SEARCH, and the plan says so.',
      openLoop: 'What is the database actually doing when your query is slow?',
      analogy: 'A finger down every row, versus one jump straight to the answer.',
      topicAxes: ['entity-novelty', 'economic-pain'],
      seo: {
        title: 'SCAN or SEARCH: Read a SQLite Query Plan in 90 Seconds',
        description: 'EXPLAIN QUERY PLAN, one index, and the one word that changes. Real output.',
        tags: ['sqlite', 'explain query plan', 'database index', 'sql performance',
               'query optimisation', 'sql tutorial'],
        queries: ['explain query plan sqlite', 'sqlite index slow query', 'sql scan vs search'],
      },
    },
    brand,
    thumbnail: {title: 'SCAN OR SEARCH', badge: '1 WORD', asset: 'lucide:search'},
    scenes,
  };
  check(spec, 'scan-vs-search');
  const dest = path.join('topics', 'sqlite-scan-vs-search', 'long.json');
  fs.mkdirSync(path.dirname(dest), {recursive: true});
  fs.mkdirSync(path.join(path.dirname(dest), 'out'), {recursive: true});
  write(dest, spec);
}

function check(spec, tag) {
  const T = spec.scenes.length;
  const cap = Math.max(4, Math.ceil(T * 0.35));
  const counts = {};
  for (const s of spec.scenes) counts[s.type] = (counts[s.type] || 0) + 1;
  for (const [t, c] of Object.entries(counts)) {
    if (c > cap) console.log(`  ! ${tag}: ${t} used ${c}x (cap ${cap})`);
  }
  for (const s of spec.scenes) {
    const ceil = s._hook ? 240 : Math.max(480, Math.min(2100, 180 * s._anchors + 120));
    if (s.durationFrames > ceil) {
      console.log(`  ! ${tag} ${s.id} ${s.type}: ${(s.durationFrames / 30).toFixed(1)}s vs ` +
        `${(ceil / 30).toFixed(0)}s earned — trim to ~${Math.floor((ceil - 45) / 12)} words ` +
        `(now ${words(s.narration)})`);
    }
  }
}

function write(dest, spec) {
  for (const s of spec.scenes) { delete s._anchors; delete s._hook; }
  fs.writeFileSync(dest, JSON.stringify(spec, null, 2) + NL);
  const f = spec.scenes.reduce((a, s) => a + s.durationFrames, 0);
  console.log(`${dest} — ${spec.scenes.length} scenes, ` +
    `${spec.scenes.reduce((a, s) => a + words(s.narration), 0)} words, ~${Math.round(f / 30)}s`);
}
