#!/usr/bin/env node
// Builds topics/sqlite-the-database-that-is-just-a-file/long.json from the course plan in
// briefs/sqlite/COURSE.md.
//
// The spec is BUILT, not hand-edited, so the plan and the video cannot drift apart. LAW 0p's
// corollary is the reason: a brief builder that is behind its own output is a trap — re-running
// it silently deletes whatever was patched into the JSON afterwards. If a beat needs changing,
// change it here.
//
// TWO NUMBERS SHAPE THIS FILE, and both are the linter's, not mine:
//
//   1. OVER-RELIANCE caps any one sub-type at `ceil(scenes * 0.35)`. A first pass put every
//      recorded step in its own scene — 29 RECORDED_STEPs out of 47 — and was rejected. The
//      fix is not fewer captures, it is FEWER, RICHER SCENES: 31 clips across 13 scenes, two
//      or three to a beat, which is also how a person would narrate them.
//   2. The scene ceiling is `180 * distinct_anchors + 120` frames, hard-capped at 70s. So a
//      beat earns its runtime by actually depicting more. A recorded scene with three clips,
//      their zooms and their callouts earns close to a minute; a component with three anchors
//      earns 22 seconds and its narration has to fit inside that.
//
// This builder therefore CHECKS ITSELF against both before writing, and prints what it would
// be rejected for. Anchors for the recorded clips are placed afterwards by
// `npm run anchor-spec`, which measures the real footage.
//
// Usage: node briefs/sqlite/build_long.mjs
import fs from 'node:fs';
import path from 'node:path';

const SLUG = 'sqlite-the-database-that-is-just-a-file';
const NL = String.fromCharCode(10);
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;

const scenes = [];
let n = 0;

/** anchors we can count at BUILD time (anchor-spec adds the recorded ones later) */
const countAnchors = (data, extraAnchors = 0) => {
  const seen = new Set();
  const walk = (v) => {
    if (Array.isArray(v)) return v.forEach(walk);
    if (v && typeof v === 'object') {
      for (const [k, x] of Object.entries(v)) {
        if (/atword$/i.test(k) && typeof x === 'number') seen.add(x);
        else walk(x);
      }
    }
  };
  walk(data);
  return seen.size + extraAnchors;
};

const scene = (type, narration, data = {}, extra = {}) => {
  n++;
  const text = narration.trim().replace(/\s+/g, ' ');
  const w = words(text);
  const TRANSITION_BY_ROLE = {
    HOOK: 'filmburn', CHAPTER: 'wipe', TITLE_CARD: 'dip', RECORDED_STEP: 'push',
    QUIZ_CARD: 'iris', RECAP: 'blinds', OUTRO_CTA: 'dip',
  };
  scenes.push({
    id: 's' + String(n).padStart(2, '0'),
    type,
    // Cutting grammar, chosen by what the scene IS: a push into live footage, an iris on a
    // quiz, blinds on a recap. Concept components fade, so the picture arrives quietly.
    transition: TRANSITION_BY_ROLE[type] ?? 'fade',
    background: 'zoneA',
    narration: text,
    data,
    // Pre-sync estimate. sync.mjs replaces it from the real audio; 12 frames per word is the
    // repo's 150wpm/30fps rate, plus a settle tail so the last anchor can land.
    durationFrames: w * 12 + 45,
    timingSource: 'estimate',
    _anchors: countAnchors(data, extra.plusAnchors ?? 0),
    _hookCap: type === 'HOOK',
  });
};

/** A RECORDED_STEP scene. Clip anchors arrive later from anchor-spec, so they are ESTIMATED
 *  here as one per clip plus one per zoom plus one per callout — which is exactly what the
 *  solver places. */
// ── WHAT THE CARD DRAWS, PER BEAT ────────────────────────────────────────────
//
// Owner: *"the text you put there is certainly very much AI-ish, I would like it to have
// meaningful animation components and data rather than just showing texts... Maybe you can
// display what happens in the table, maybe you can display a component graph, a sequence
// diagram."*
//
// The shorts got that first. This cut still had a card holding a caption, a premise and a
// step rule on TWELVE of its fifteen recorded beats — the same complaint at fifteen times the
// runtime, which is worse, not better.
//
// Keyed by caption because that is what identifies a beat here, and applied to the LAST clip
// of the beat: the card should draw the beat's CONCLUSION, and the last clip is the one still
// on screen when the voice reaches it.
//
// EVERY FIGURE IS FROM THE CAPTURE OR THE FIXTURE IT RAN (LAW 3, LAW 0m). The four products
// and their prices are `seed.sql` verbatim; the six orders, the aggregate line and the exit
// code are what the terminal actually printed. Nothing here is decoration invented to fill a
// box — that is the defect being fixed, not a new one to introduce.
const CARD_CONTENT = {
  // The beat IS the schema, so the card carries the schema: one row per promise, in the
  // order the file declares them.
  'four lines, four promises': {
    kind: 'rows', color: 'blue', columns: ['line', 'the promise it makes'],
    rows: [
      {cells: ['id INTEGER', 'PRIMARY KEY'], state: 'plain'},
      {cells: ['name TEXT', 'NOT NULL'], state: 'kept'},
      {cells: ['price REAL', 'NOT NULL'], state: 'kept'},
      {cells: [') STRICT', 'types get checked'], state: 'new'},
    ],
  },
  // Two commands, two fates — which is what `split` is for, and the exit codes are real.
  'the error is the lesson': {
    kind: 'split', color: 'blue',
    left: '.read schema.sql', leftNote: 'silence, exit 0',
    right: "price = 'not-a-number'", rightNote: 'exit 1, names the column',
  },
  // The table, as it now stands on disk.
  'four rows, and a readable box': {
    kind: 'rows', color: 'green', columns: ['name', 'price'],
    rows: [
      {cells: ['Mechanical keyboard', '89.00'], state: 'new'},
      {cells: ['27-inch monitor', '240.00'], state: 'new'},
      {cells: ['Desk lamp', '35.50'], state: 'new'},
      {cells: ['USB-C hub', '45.00'], state: 'new'},
    ],
  },
  // WHERE price < 60 — the monitor is the row that leaves, and the card shows it leaving.
  'some of them, in an order': {
    kind: 'rows', color: 'orange', columns: ['name', 'price'],
    rows: [
      {cells: ['27-inch monitor', '240.00'], state: 'cut'},
      {cells: ['Mechanical keyboard', '89.00'], state: 'kept'},
      {cells: ['USB-C hub', '45.00'], state: 'kept'},
      {cells: ['Desk lamp', '35.50'], state: 'kept'},
    ],
  },
  // Two verbs, two ways of proving they happened.
  'change one, take one away': {
    kind: 'split', color: 'purple',
    left: 'UPDATE … RETURNING', leftNote: 'hands the changed row back',
    right: 'DELETE, then changes()', rightNote: 'reports how many it touched',
  },
  // The number the whole act has been building to.
  'eight kilobytes, and that is all': {kind: 'tally', color: 'green', value: '8192', label: 'bytes on disk — schema, rows and all'},
  // A JOIN is a CONVERGENCE: two tables that share only an id, meeting to make a third thing.
  // A declared topology (LAW 0k.1) says that far better than a list of steps.
  'six rows in, four lines out': {
    kind: 'graph', color: 'blue',
    nodes: [
      {id: 'o', label: 'orders · 6 rows'},
      {id: 'p', label: 'products · 4 rows'},
      {id: 'j', label: 'JOIN ON p.id = o.product_id'},
      {id: 'r', label: 'revenue · 4 lines', tone: 'green'},
    ],
    edges: [{from: 'o', to: 'j'}, {from: 'p', to: 'j'}, {from: 'j', to: 'r'}],
  },
  // Six rows of input collapsing into one line of output, with the real numbers on it.
  'numbers, groups, and the NULL trap': {
    kind: 'rows', color: 'purple', columns: ['aggregate', 'over six orders'],
    rows: [
      {cells: ['COUNT(*)', '6'], state: 'plain'},
      {cells: ['SUM(qty)', '13'], state: 'plain'},
      {cells: ['AVG(qty)', '2.17'], state: 'kept'},
      {cells: ['COUNT(note)', 'skips the NULLs'], state: 'cut'},
    ],
  },
  // One word of the plan moved, and the whole act is about that word.
  'SCAN became SEARCH': {kind: 'swap', from: 'SCAN', to: 'SEARCH', color: 'green'},
  // Two languages, one file, in two different sessions — an EXCHANGE, so a sequence diagram.
  'the shell wrote it, Python reads it': {
    kind: 'seq', color: 'blue',
    actors: ['sqlite3 shell', 'shop.db', 'Python'],
    messages: [
      // Anchored on the words that name each hop: "the shell inserted" (w19), "Python just
      // opened it" (w67), and the four products themselves (w13), which is the return.
      {from: 2, to: 1, text: 'connect + SELECT', atWord: 3},
      {from: 1, to: 2, text: 'the same four rows', ret: true, atWord: 13},
      {from: 0, to: 1, text: 'INSERT, in another session', atWord: 19},
    ],
  },
  // Prepared once, run three times — the whole point of executemany, as a sequence.
  'prepared once, run many times': {
    kind: 'seq', color: 'purple',
    actors: ['your code', 'sqlite3', 'shop.db'],
    messages: [
      // "Execute many takes a LIST" (w15), "prepares the sentence once" (w31), and the
      // total we watch climb at the bottom (w44).
      {from: 0, to: 1, text: 'executemany(sql, 3 rows)', atWord: 15},
      {from: 1, to: 2, text: 'prepare once, run x3', atWord: 31},
      {from: 2, to: 0, text: 'rowcount: 3', ret: true, atWord: 44},
    ],
  },
  // The whole of transactions in one contrast.
  'zero rows, then eight again': {
    kind: 'split', color: 'orange',
    left: 'commit()', leftNote: 'the file keeps it',
    right: 'rollback()', rightNote: 'the file never saw it',
  },
};

const rec = (narration, {caption, premise, clips, layout}) => {
  const est = clips.reduce((a, c) =>
    a + 1 + (c.zooms?.length ?? 0) + (c.callouts?.length ?? 0), 0);
  // The card's depiction rides on the LAST clip, unless the beat already authored one there.
  const card = CARD_CONTENT[caption];
  const withCard = card
    ? clips.map((c, i) => (i === clips.length - 1 && !c.overlay ? {...c, overlay: card} : c))
    : clips;
  scene('RECORDED_STEP', narration, {
    recordedStep: {caption, premise, ...(layout ? {layout} : {}), clips: withCard},
  }, {plusAnchors: est});
};

const clip = (ref, label, opts = {}) => ({ref, label, focus: true, ...opts});

// ─────────────────────────────────────────────────────────────────────────────
// ACT I — it is a FILE
// ─────────────────────────────────────────────────────────────────────────────

// LAW 0g phase 1: continue the title's promise in the viewer's own words, inside 8 seconds.
// No welcome, no channel name — that arrives later, woven in.
scene('HOOK',
  `Today it's SQLite — a database that's just one file. So where does the data live?`,
  {headline: 'JUST A FILE', subtext: 'no server, no install, no password',
   heroAsset: 'lucide:file', headlineAtWord: 2, heroAtWord: 13});

scene('CHAPTER',
  `Welcome in. Empty folder to two tables to Python, and everything you see me run is running
   live — so when something fails, you'll see the error.`,
  {chapter: {number: '01', title: 'It is a file', subtitle: 'no server, no port, no password'}});

scene('DB_TWO_WAYS',
  `Here's what trips people up, because every database tutorial you have opened starts the
   same way. First a machine for the server to run on. Then a service that has to stay running, or
   the whole thing is dead. Then a port to listen on. Then a user and a password, and the twenty minutes
   you'll spend getting those wrong. SQLite skips the list. On the right is the whole thing —
   one file, eight kilobytes, finished before we start.`,
  {dbTwoWays: {
    caption: 'what you have to run first',
    premise: 'Both of these store the same four rows.',
    serverLabel: 'a database server', fileLabel: 'SQLite',
    fileName: 'shop.db', fileSize: '8192 bytes',
    fileNote: 'no port, no daemon, no password',
    serverParts: [
      {label: 'a machine to run on', asset: 'lucide:server', atWord: 19},
      {label: 'a service, kept running', asset: 'lucide:activity', atWord: 25},
      {label: 'a port to listen on', asset: 'lucide:plug', atWord: 35},
      {label: 'a user and a password', asset: 'lucide:key-round', atWord: 41},
    ],
    atWord: 3,
  }});

scene('TITLE_CARD',
  `We're going to build this twice. First in the shell, where every single thing is visible.
   Then from Python, reading the very same file. No export step in between — the same file, both times.`,
  {title: 'SQLite, from nothing', subtitle: 'the shell first, then Python'});

rec(`Let's prove the thing exists. That's the version I am teaching and I want to be specific,
     because SQLite has been quietly gaining features for twenty five years. Now, before I run
     anything, look at the schema file itself. Four lines, and every one is a promise. The id is
     the row's own number. The name is text, and NOT NULL means the database will refuse a row
     that leaves the name blank. Price is a real number. And that last word, STRICT, is the one people
     skip past — hold on to STRICT, because in about a minute it's going to bite something on
     purpose.`,
  {caption: 'four lines, four promises',
   premise: 'The version being taught, and the shape of the table before a single row exists.',
   clips: [
     clip('rec:sqlite-act1#version', 'check the version', {
       callouts: [{text: 'strict tables need 3.37+', mark: 'ver', color: 'blue'}],
     }),
     clip('rec:sqlite-act1#open-schema', 'read the schema', {
       zooms: [{mark: 'notnull'}, {mark: 'strict'}],
       callouts: [
         {text: 'refuses a blank name', mark: 'notnull', color: 'blue'},
         {text: 'and this one checks types', mark: 'strict', color: 'orange'},
       ],
     }),
   ]});

scene('TYPE_GATE',
  `Without STRICT, SQLite is famously relaxed about types. Declare a column as a number and SQLite
   will happily accept the word banana and hand the value back months later. STRICT turns that off. The
   column becomes a gate — a number goes through, text stops dead, and you get told why.`,
  {typeGate: {
    caption: 'a promise the table keeps',
    premise: 'The column was declared REAL. STRICT is what makes that a rule rather than a hint.',
    columnName: 'products.price', columnType: 'REAL',
    goodValue: '89.00', badValue: "'not-a-number'",
    errorText: 'cannot store TEXT value in REAL column products.price',
    passAtWord: 30, rejectAtWord: 38, atWord: 3,
  }});

rec(`So let's make the table, and then break the table deliberately. The first command reads that file
     and creates the table. Silence means the command worked, because SQLite only speaks when something
     is wrong. The second one tries to put the string not-a-number into the price column. Watch.
     SQLite refuses, and names the column and the type, and the row never lands. STRICT earned its place.`,
  {caption: 'the error is the lesson',
   premise: 'The second command FAILS on purpose. Exit code 1, and the message names the column.',
   clips: [
     clip('rec:sqlite-act1#create', 'create the table'),
     clip('rec:sqlite-act1#strict-error', 'break it on purpose', {
       zooms: [{mark: 'err'}],
       callouts: [{text: 'refused, and it says why', mark: 'err', color: 'red'}],
     }),
   ]});

rec(`Right, four real rows. The insert is silent again, so the next command asks for the whole table
     back. And there's your table — headers, a box drawn round the rows, four products with prices.
     That box isn't me formatting anything, by the way. That's dot mode box, a display setting
     in the shell, and it's the fastest way to make SQLite readable while you're learning. Keep
     an eye on the keyboard row, because we come back to the keyboard several times. And keep half an eye
     on the monitor at two hundred and forty, because the next command is about to drop the monitor.`,
  {caption: 'four rows, and a readable box',
   premise: 'shop.db now holds four products. `.mode box` is what draws the borders.',
   clips: [
     clip('rec:sqlite-act1#insert', 'put four rows in'),
     clip('rec:sqlite-act1#select', 'read them back', {
       zooms: [{mark: 'kb'}, {mark: 'mon'}, {at: 'full'}],
       callouts: [
         {text: 'the row we keep returning to', mark: 'kb', color: 'green'},
         {text: 'and the one WHERE is about to drop', mark: 'mon', color: 'blue'},
       ],
     }),
   ]});

rec(`You'll almost never want the whole table. WHERE is how you ask for some of the table. Price under
     sixty, and three rows come back instead of four. The monitor is gone, because two hundred
     and forty isn't under sixty. It's that literal. ORDER BY decides what comes out first.
     Descending by price, limit three, and the monitor is back on top. Here's the part worth
     keeping: without ORDER BY, a database may hand rows back in any order the engine likes. The output usually
     looks sorted. It's never promised to be. So ask.`,
  {caption: 'some of them, in an order',
   premise: 'WHERE picks the rows. ORDER BY is the only thing that promises their order.',
   clips: [
     clip('rec:sqlite-act1#where', 'filter the rows', {
       zooms: [{mark: 'cheap'}],
       callouts: [{text: 'under sixty, so it stays', mark: 'cheap', color: 'green'}],
     }),
     clip('rec:sqlite-act1#order', 'sort and limit', {
       zooms: [{mark: 'top'}],
       callouts: [{text: 'most expensive, first', mark: 'top', color: 'blue'}],
     }),
   ]});

rec(`Changing a row is UPDATE, and watch the end of that command, because RETURNING is the bit I
     wish somebody had shown me years earlier. Normally you run an update, get silence, then run
     a SELECT to check. RETURNING hands the changed rows straight back, confirmed by the database
     rather than assumed by you. DELETE takes rows away, and it's worth being nervous about,
     because there's no undo. So I asked for changes as well. One row. If that had said three, I
     would want to know right now, rather than tomorrow morning.`,
  {caption: 'change one, take one away',
   premise: 'RETURNING shows what changed. changes() reports how many rows were really touched.',
   clips: [
     clip('rec:sqlite-act1#update', 'update, and see it', {
       zooms: [{mark: 'newprice'}],
       callouts: [{text: 'the database confirming, not me', mark: 'newprice', color: 'green'}],
     }),
     clip('rec:sqlite-act1#delete', 'delete, and count it', {
       zooms: [{mark: 'n'}],
       callouts: [{text: 'one row, as expected', mark: 'n', color: 'orange'}],
     }),
   ]});

rec(`Two more. Dot schema asks the file to describe itself, and back comes the exact statement
     that created the table — the same words we typed, kept inside the file. You never have to
     guess the shape of a SQLite database. Ask it. And then the thing I promised at the very
     start. Where does all of this actually live? One file. Eight thousand one hundred and
     ninety two bytes, which is eight kilobytes — smaller than most photos on your phone, and
     it holds the schema, the rows and every change we made. Email it. Copy it to a stick. Put
     it in version control.`,
  {caption: 'eight kilobytes, and that is all',
   premise: 'The schema, the rows and every edit — all inside one ordinary file.',
   clips: [
     clip('rec:sqlite-act1#schema', 'ask it to describe itself', {
       zooms: [{mark: 'sch'}],
       callouts: [{text: 'the words I typed, stored', mark: 'sch', color: 'purple'}],
     }),
     clip('rec:sqlite-act1#just-a-file', 'look at the file', {
       zooms: [{mark: 'file'}, {at: 'full'}],
       callouts: [{text: 'the entire database', mark: 'file', color: 'green'}],
     }),
   ]});

scene('WHERE_IT_RUNS',
  `That one property is why you're carrying several copies right now, whether you knew or
   not. Your phone keeps contacts and messages in SQLite. Your browser keeps history and settings
   in SQLite. The same engine flies in aircraft, and sits in the dashboard of a lot of cars. Same engine, same file
   format, four machines with almost no common ground — because a thing with no server to run has
   almost nowhere SQLite can't go.`,
  {whereItRuns: {
    caption: 'already in your pocket',
    premise: 'One engine, one file format, in four places that share nothing else.',
    fileName: '*.db',
    note: 'one engine, one file format, everywhere it runs',
    places: [
      {label: 'every phone', sub: 'contacts, messages', asset: 'lucide:smartphone', atWord: 11},
      {label: 'every browser', sub: 'history, settings', asset: 'lucide:globe', atWord: 18},
      {label: 'aircraft', sub: 'flight software', asset: 'lucide:plane', atWord: 24},
      {label: 'cars', sub: 'infotainment', asset: 'lucide:car', atWord: 30},
    ],
    atWord: 3,
  }});

scene('QUIZ_CARD',
  `Quick check. Which of these does SQLite genuinely not need? Have a think, and pause if you
   want longer. Ready. It is B. There's no port, because there's no service listening.`,
  {quiz: {
    question: 'Which does SQLite genuinely not need?',
    options: [{text: 'A table'}, {text: 'A port'}, {text: 'A file'}, {text: 'A query'}],
    answerIndex: 1,
    why: 'There is no server, so there is nothing to connect to.',
    revealAtWord: 22, atWord: 3,
  }});

scene('RECAP',
  `So that's the first third of this. A table with constraints that are actually enforced. Rows
   going in, coming back out, changing, and being deleted with a count to prove the change. And the whole
   database sitting in one small file you could attach to an email without thinking twice.`,
  {heading: 'Act one, in three facts',
   points: [
     {text: 'STRICT refused a bad type', atWord: 8},
     {text: 'RETURNING showed what changed', atWord: 17},
     {text: 'The database is one 8 KB file', atWord: 24},
   ]});

// ─────────────────────────────────────────────────────────────────────────────
// ACT II — real querying
// ─────────────────────────────────────────────────────────────────────────────

scene('CHAPTER',
  `One table is fine while you're learning. One table stops being fine the moment two things in your
   data relate to each other, which in practice is almost immediately.`,
  {chapter: {number: '02', title: 'Asking real questions',
             subtitle: 'joins, groups, and how it finds a row'}});

scene('TABLE_SPLIT',
  `Say every order also recorded the product name. Mechanical keyboard, typed three separate
   times. That's fragile, because the day somebody fixes a typo in one of them you have two
   products that are secretly one.`,
  {tableSplit: {
    caption: 'the same words, over and over',
    premise: 'Four orders. The same product name typed out three times.',
    tableLabel: 'one big table', splitLeftLabel: 'orders', splitRightLabel: 'products',
    note: 'stored once, referenced anywhere',
    headers: ['id', 'product', 'qty'],
    rows: [
      {label: '1', sub: 'Mechanical keyboard', text: '2'},
      {label: '2', sub: 'Mechanical keyboard', text: '1'},
      {label: '3', sub: 'Desk lamp', text: '4'},
      {label: '4', sub: 'Mechanical keyboard', text: '3'},
    ],
    splitAtWord: 24, atWord: 3,
  }});

scene('JOIN_MERGE',
  `If the price lives in one table and the quantity lives in another, how do you multiply them?
   That's what a JOIN is for. Take a row from here, take a row from there. They share one
   value. Line them up on it, and they become a single wider row.`,
  {joinMerge: {
    caption: 'two rows, one answer',
    premise: 'One row from each table. They have exactly one thing in common.',
    leftTable: 'products', rightTable: 'orders',
    keyLeft: 'id', keyRight: 'product_id',
    resultLabel: 'one joined row',
    leftRow: [{label: 'id', sub: '1'}, {label: 'name', sub: 'Mechanical keyboard'},
              {label: 'price', sub: '89.00'}],
    rightRow: [{label: 'id', sub: '3'}, {label: 'product_id', sub: '1'},
               {label: 'qty', sub: '2'}],
    keyAtWord: 32, mergeAtWord: 40, atWord: 3,
  }});

rec(`Here's that second table. Orders, with an id of its own, a product id pointing across, and
     a quantity. Six rows go in, and notice what isn't in there — not one product name. Now the
     query. Read the FROM and JOIN lines together, because that's the whole idea in a sentence:
     take orders, and join products where the product's id matches the order's product id. Run
     it, and two tables become one answer. Six order rows went in. Four lines came out, one per
     product, sorted by revenue, and the keyboard is on top at five hundred and thirty four —
     six units at eighty nine each. The orders table has never seen the word keyboard, and the products
     table has never seen a quantity.`,
  {caption: 'six rows in, four lines out',
   premise: 'Revenue per product — arithmetic across two tables that share only an id.',
   clips: [
     clip('rec:sqlite-act2#add-orders', 'add a second table'),
     clip('rec:sqlite-act2#open-revenue', 'read the join', {
       zooms: [{mark: 'joinline'}],
       callouts: [{text: 'matched on the id', mark: 'joinline', color: 'blue'}],
     }),
     clip('rec:sqlite-act2#revenue', 'run it', {
       zooms: [{mark: 'top'}, {at: 'full'}],
       callouts: [{text: 'six units, eighty nine each', mark: 'rev', color: 'green'}],
     }),
   ]});

rec(`Sometimes you don't want rows at all, you want a number. COUNT, SUM and AVG collapse the
     whole table into one line — six orders, thirteen units, an average of two point one seven
     per order. One row of output from six rows of input. Then HAVING, which confuses almost everybody the first time they meet
     HAVING. WHERE filters rows before they're grouped. HAVING filters the groups afterwards. This
     asks for products with more than two units in total, and two of the four survive. You couldn't have written that with WHERE, because the total doesn't exist yet when WHERE runs. And
     this last one is worth thirty seconds of your life, because the NULL rule catches everyone eventually.
     I have added an empty column. Is the note equal to an empty string? Blank. Not true, not
     false — blank. Is it NULL? One, meaning yes. NULL means unknown, and comparing anything to
     unknown gives you unknown, which is why IS NULL is the only test that works.`,
  {caption: 'numbers, groups, and the NULL trap',
   premise: 'Aggregates collapse rows. HAVING filters groups. NULL answers neither yes nor no.',
   clips: [
     clip('rec:sqlite-act2#aggregate', 'count the whole table', {
       zooms: [{mark: 'avg'}],
       callouts: [{text: 'thirteen units across six orders', mark: 'units', color: 'blue'}],
     }),
     clip('rec:sqlite-act2#having', 'filter the groups', {
       zooms: [{mark: 'kept'}],
       callouts: [{text: 'two of four survived', mark: 'kept', color: 'orange'}],
     }),
     clip('rec:sqlite-act2#null', 'the NULL trap', {
       zooms: [{mark: 'blank'}, {mark: 'isnull'}],
       callouts: [
         {text: 'the comparison is unknown', mark: 'blank', color: 'orange'},
         {text: 'and this one answers it', mark: 'isnull', color: 'green'},
       ],
     }),
   ]});

scene('GROUP_BUCKETS',
  `Usually you want that number per something. Per product, per customer, per day. GROUP BY
   sorts your rows into buckets by whatever you grouped on. Then every bucket collapses into
   exactly one line, with the aggregate worked out inside the bucket rather than across the
   whole table.`,
  {groupBuckets: {
    caption: 'many rows in, one row out',
    premise: 'Six order rows. Four different products.',
    sourceLabel: 'orders', groupBy: 'GROUP BY product_id',
    rows: [
      {label: 'qty 2', sub: '1'}, {label: 'qty 1', sub: '2'},
      {label: 'qty 1', sub: '1'}, {label: 'qty 4', sub: '3'},
      {label: 'qty 2', sub: '4'}, {label: 'qty 3', sub: '1'},
    ],
    buckets: [
      {label: 'product 1', sub: '6 units', text: '1'},
      {label: 'product 2', sub: '1 unit', text: '2'},
      {label: 'product 3', sub: '4 units', text: '3'},
      {label: 'product 4', sub: '2 units', text: '4'},
    ],
    fallAtWord: 19, collapseAtWord: 33, atWord: 3,
  }});

scene('SCAN_VS_SEEK',
  `Now the thing you can't see. When you ask for orders where product id is one, SQLite reads
   every row and checks each one, because that's the only option SQLite has. Six rows here, so who
   cares. Six million and you would care enormously.`,
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
    scanAtWord: 21, seekAtWord: 36, atWord: 3,
  }});

rec(`And you don't have to take my word here, because SQLite will tell you. EXPLAIN QUERY PLAN
     asks the engine what it intends to do before running the query, and the answer comes back as one word: SCAN.
     It's going to read the whole orders table to answer this. So, one command. Create an index
     on the product id column. No arguments to think about, and no output at all. Now the
     identical query. Same words, same table, same everything. And SCAN has become SEARCH,
     searching orders using the index we just made. One word changed, and that word is the
     difference between reading six million rows and jumping straight to the ones you asked for.`,
  {caption: 'SCAN became SEARCH',
   premise: 'The identical query, before and after one CREATE INDEX. One word of the plan moved.',
   clips: [
     clip('rec:sqlite-act2#plan-before', 'the plan, before', {
       zooms: [{mark: 'scan'}],
       callouts: [{text: 'reads every row', mark: 'scan', color: 'orange'}],
     }),
     clip('rec:sqlite-act2#index', 'add the index'),
     clip('rec:sqlite-act2#plan-after', 'the plan, after', {
       zooms: [{mark: 'search'}, {at: 'full'}],
       callouts: [{text: 'straight to the rows', mark: 'search', color: 'green'}],
     }),
   ]});

scene('INDEX_LEDGER',
  `Before you index everything, the other half of the trade. An index is a second copy of that
   column, kept sorted, and the index has to stay correct. So every insert now writes twice, once into
   the table and once into the index. Reads got faster; writes and disk paid.`,
  {indexLedger: {
    caption: 'every write now pays twice',
    premise: 'The index made the read fast. It did not make it free.',
    writeLabel: 'INSERT', tableLabel: 'the table', indexLabel: 'the index',
    sizeBefore: '8 KB', sizeAfter: '12 KB', sizeGrow: 0.5,
    bought: 'SCAN became SEARCH',
    forkAtWord: 21, costAtWord: 37, atWord: 3,
  }});

scene('QUIZ_CARD',
  `Another one. Your query got slow. What do you do first? Have a think, and pause if you want
   longer. Ready. It is C, because a guess about slowness is usually wrong.`,
  {quiz: {
    question: 'A query got slow. What do you do first?',
    options: [
      {text: 'Index every column'}, {text: 'Rewrite it with fewer joins'},
      {text: 'Run EXPLAIN QUERY PLAN'}, {text: 'Move to a bigger database'},
    ],
    answerIndex: 2,
    why: 'A guess about slowness is usually wrong. The plan is a fact.',
    revealAtWord: 21, atWord: 3,
  }});

scene('RECAP',
  `Second third done. Two tables joined on a value they share. Rows collapsed into buckets by
   GROUP BY, one line out per bucket. And a query plan that changed a single word the moment we
   gave the query an index to work with.`,
  {heading: 'Act two, in three facts',
   points: [
     {text: 'A join lines rows up on one value', atWord: 5},
     {text: 'GROUP BY makes one row per bucket', atWord: 14},
     {text: 'SCAN became SEARCH', atWord: 22},
   ]});

// ─────────────────────────────────────────────────────────────────────────────
// ACT III — from real code
// ─────────────────────────────────────────────────────────────────────────────

scene('CHAPTER',
  `Everything so far has been the shell, which is wonderful for learning and not how you'll
   actually use this. So let's open the same file from Python, without installing anything.`,
  {chapter: {number: '03', title: 'The same file, from code',
             subtitle: 'Python, parameters, and commit'}});

// LAW 0d: the script says one is the door and the other is the desk. An analogy that is SAID and
// not DRAWN is the weakest beat you can ship, so it gets drawn — and LAW 0l says draw it BEFORE
// the words are leaned on, not after.
scene('CURSOR_WALK',
  `Two words are about to do all the work, so let's see them before we type them. The connection is
   the open file — that is all it is. The cursor is the thing you hand a question to, and the thing
   that hands rows back. And here is the part people get wrong: the rows do not arrive as a list you
   already hold. The cursor walks them, and gives you one per turn of the loop.`,
  {cursorWalk: {
    caption: 'rows, one at a time',
    premise: 'con is the open file. cur is the thing you hand a question to.',
    connectionLabel: 'con - the open file',
    cursorLabel: 'cur - the read head',
    fileName: 'shop.db',
    query: 'SELECT name, price FROM products',
    loopLabel: 'for name, price in cur.execute(...)',
    rows: [
      {label: 'Mechanical keyboard', sub: '89.00', atWord: 47},
      {label: '27-inch monitor', sub: '240.00', atWord: 53},
      {label: 'Desk lamp', sub: '35.50', atWord: 58},
    ],
    atWord: 3, queryAtWord: 14, color: 'blue',
  }});

rec(`There it is in real code. First line: we call sqlite3 dot connect and we hand it a filename,
     and what comes back we call con. Second line: we ask con for a cursor and we call it cur.
     Third line: we loop over cur dot execute, which is us handing the sentence over, and the rows
     come back one at a time. Then we close the file behind us.
     Six lines. And notice what is missing — no host, no port, no password. If you have used
     Postgres or MySQL, that is the line where you would be pasting credentials, and here you are
     naming a file.`,
  {caption: 'a filename, not a connection string',
   premise: 'The same shop.db the shell created, opened by Python on a different engine build.',
   clips: [
     clip('rec:sqlite-act3#open-read', 'read the file', {
       zooms: [{mark: 'connect'}, {mark: 'cursor'}, {mark: 'loop'}],
       callouts: [
         {text: 'con IS the file', mark: 'connect', color: 'blue'},
         {text: 'cur is who you talk to', mark: 'cursor', color: 'purple'},
         {text: 'hand it the sentence', mark: 'loop', color: 'green'},
       ],
       // THE OVERLAY EXPLAINS THE SHAPE, not the words. Three named stops and one token
       // travelling them is what "connect, then cursor, then rows" actually IS.
       overlay: {kind: 'chain', steps: ['connect', 'cursor', 'rows'], color: 'blue'},
     }),
   ]});

rec(`Now we run it. And we see, down at the bottom, the four products — the ones the shell inserted,
     in the shell, in a completely separate session. The monitor is right there at two hundred and
     forty, the same number we typed in Act one. Nothing was exported. Nothing was converted. There
     was no migration step and no import. It is the same file, and Python just opened it.`,
  {caption: 'the shell wrote it, Python reads it',
   premise: 'No export, no import, no conversion step. One file, two languages.',
   clips: [
     clip('rec:sqlite-act3#run-read', 'run it', {
       zooms: [{mark: 'firstrow'}, {mark: 'top'}],
       callouts: [
         {text: 'written by the shell, read by Python', mark: 'firstrow', color: 'green'},
         {text: 'same price, same file', mark: 'top', color: 'blue'},
       ],
     }),
   ]});

rec(`One small thing that will save you real pain. By default a row comes back as a tuple, so you
     write row square bracket one — and then somebody adds a column to the SELECT and every
     number you wrote is quietly pointing at the wrong thing. Setting row factory to sqlite3 dot
     Row gives you rows you can index by name instead. Same data, two ways of reaching the value. Row
     one, and row name. The second still works after somebody reorders the columns. The first
     silently returns the wrong value, and Python raises no error to warn you, which is
     exactly why the bug survives code review and then bites you in production.`,
  {caption: 'index by name, not by number',
   premise: 'Both print the same value today. Only one keeps working after a schema change.',
   clips: [
     clip('rec:sqlite-act3#open-rowfac', 'name your columns', {
       zooms: [{mark: 'rf'}, {mark: 'byname'}],
       callouts: [
         {text: 'one line, and rows get names', mark: 'rf', color: 'purple'},
         {text: 'now you can ask for it by name', mark: 'byname', color: 'green'},
       ],
       overlay: {kind: 'swap', from: 'row[1]', to: 'row["name"]', color: 'green'},
     }),
     clip('rec:sqlite-act3#run-rowfac', 'by index, by name', {
       zooms: [{mark: 'byidx'}, {mark: 'byname'}],
       callouts: [
         {text: 'breaks when columns move', mark: 'byidx', color: 'orange'},
         {text: 'this one does not', mark: 'byname', color: 'green'},
       ],
     }),
   ]});

scene('PLACEHOLDER_SEAL',
  `Now the most important thirty seconds in this video. You have a value to put inside
   a query. There are two ways, and only one is safe. With a placeholder the value never becomes
   part of the sentence. Glue the query together as text, and the value becomes code.`,
  {placeholderSeal: {
    caption: 'a value, or a piece of the sentence',
    premise: 'The same question, asked twice. Only one of them stays a question.',
    queryHead: 'SELECT name, price FROM products WHERE name = ',
    queryTail: "'",
    value: 'USB-C hub',
    evil: "' OR 1=1 --",
    evilHighlight: 'OR 1=1',
    safeLabel: 'parameterised', evilLabel: 'built by hand',
    safeResult: '1 row', evilResult: 'all 4 rows',
    safeAtWord: 28, evilAtWord: 39, atWord: 3,
  }});

rec(`Both of these are in one file and they look almost the same, so let's go slowly. Up top we set
     two variables. Wanted is an ordinary product name. Evil is a string somebody could type into a
     search box.
     Now the two calls. cur dot execute is how we hand a query to the database. The first hands it
     TWO separate things — the sentence, and the value, kept apart by a comma. That is what the
     question mark is for: a value goes here, pass it to me separately, do not read it as part of
     the sentence. The second glues the value in with an f-string. That is the whole difference.
     Watch the bottom. The safe call asked for the hub: one row. The second was handed a quote,
     which closes the string early, then OR one equals one, true of every row, then two dashes,
     which comment out the rest. Four rows. The whole table. Nobody broke in — the value was
     allowed to become code.`,
  {caption: 'one row, or all of them',
   premise: 'The same table, the same code path. The difference is where the value went.',
   clips: [
     clip('rec:sqlite-act3#open-params', 'two ways to ask', {
       zooms: [{mark: 'wanted'}, {mark: 'evil'}, {mark: 'safe'}, {mark: 'unsafe'}],
       callouts: [
         {text: 'an ordinary product name', mark: 'wanted', color: 'blue'},
         {text: 'and something somebody typed', mark: 'evil', color: 'orange'},
         {text: 'the value stays a value', mark: 'safe', color: 'green'},
         {text: 'the value becomes code', mark: 'unsafe', color: 'red'},
       ],
       overlay: {kind: 'split', left: '?', right: 'f-string',
                 leftNote: 'stays a value', rightNote: 'becomes code'},
     }),
     clip('rec:sqlite-act3#run-params', 'safe, then not', {
       zooms: [{mark: 'one'}, {mark: 'all'}],
       callouts: [
         {text: 'exactly what was asked for', mark: 'one', color: 'green'},
         {text: 'the whole table', mark: 'all', color: 'red'},
       ],
     }),
   ]});

rec(`Placeholders do not only keep you safe, they are also how you go fast. Execute many takes a
     LIST and sends the whole lot in one call — the database prepares the sentence once and runs it
     three times, and we see the total climb at the bottom. If you are inserting in a loop and it
     feels slow, this is the line you want.`,
  {caption: 'prepared once, run many times',
   premise: 'The same placeholder that stops an injection is also what lets a batch go in one call.',
   clips: [
     clip('rec:sqlite-act3#run-many', 'insert three at once', {
       zooms: [{mark: 'many'}, {mark: 'total'}],
       callouts: [
         {text: 'prepared once, run three times', mark: 'many', color: 'blue'},
         {text: 'and the count moves', mark: 'total', color: 'green'},
       ],
     }),
   ]});

scene('QUIZ_CARD',
  `Putting a name a user typed into a query. Which one keeps it a value? Have a think, and pause
   if you want longer. Ready. It is C — the value gets handed over separately.`,
  {quiz: {
    question: 'Which one keeps a typed-in name a VALUE?',
    options: [
      {text: 'An f-string'},
      {text: 'Adding the strings together'},
      {text: 'A question-mark placeholder'},
      {text: 'Quoting it yourself'},
    ],
    answerIndex: 2,
    why: 'The value is passed separately, so it is never part of the sentence.',
    revealAtWord: 27, atWord: 3,
  }});

scene('TRANSACTION_DOOR',
  `Something I have deliberately not mentioned yet. In Python your changes are not real until you
   commit them. They pile up inside your connection, invisible to everybody else, and commit is
   what lands the whole lot in the file at once.`,
  {transactionDoor: {
    caption: 'nothing is real until you commit',
    premise: 'The statement ran. Whether it HAPPENED is a different question.',
    pendingLabel: 'in this connection', diskLabel: 'shop.db',
    outcome: 'commit',
    diskBefore: '7 rows', diskAfter: '8 rows',
    rows: [{label: 'INSERT Webcam'}, {label: 'new row id: 8'}],
    stageAtWord: 14, actAtWord: 27, atWord: 3,
  }});

rec(`So here's commit doing its job. Insert a webcam, print the new row id, commit, then count.
     Eight rows on disk. If I had forgotten that commit line, the insert would have printed a
     perfectly convincing row id and then vanished the moment the script ended, and that's the number one confusion for
     people new to this driver. Now the other side of the coin, which is
     much more fun. This script deletes everything and then rolls back.
     Watch what happens. After the delete, this connection genuinely sees zero rows. As far as it's concerned the table is empty and the data is gone. Then roll back, and all eight are
     back, because they never actually left in the first place. If you have ever wondered what
     a transaction actually means, that's it, in two lines of output — work that was real to
     one connection and invisible to the file underneath.`,
  {caption: 'zero rows, then eight again',
   premise: 'The connection saw an empty table. The file on disk never did.',
   clips: [
     clip('rec:sqlite-act3#run-write', 'insert, then commit', {
       zooms: [{mark: 'newid'}, {mark: 'count'}],
       callouts: [
         {text: 'the id SQLite just assigned', mark: 'newid', color: 'purple'},
         {text: 'on disk, for good', mark: 'count', color: 'green'},
       ],
     }),
     clip('rec:sqlite-act3#open-rollback', 'delete it all', {
       callouts: [{text: 'the undo', mark: 'rb', color: 'purple'}],
     }),
     clip('rec:sqlite-act3#run-rollback', 'and take it back', {
       zooms: [{mark: 'gone'}, {mark: 'back'}],
       callouts: [
         {text: 'this connection sees nothing', mark: 'gone', color: 'red'},
         {text: 'and nothing was lost', mark: 'back', color: 'green'},
       ],
     }),
   ]});

scene('TRANSACTION_DOOR',
  `That's what a transaction actually means, and it's worth saying plainly. The delete was
   completely real inside the transaction, and the delete never happened outside the transaction. Roll back, and the
   file on disk never hears a word about the work you just did.`,
  {transactionDoor: {
    caption: 'a rollback leaves no trace',
    premise: 'The DELETE ran. Whether it HAPPENED is a different question.',
    pendingLabel: 'in this connection', diskLabel: 'shop.db',
    outcome: 'rollback',
    diskBefore: '8 rows', diskAfter: '8 rows',
    rows: [{label: 'DELETE FROM products'}, {label: 'COUNT(*) now 0'}],
    stageAtWord: 12, actAtWord: 24, atWord: 3,
  }});

scene('WHEN_NOT_SQLITE',
  `One honest limit, because a course that only sells you its subject is advertising, not teaching.
   Readers are cheap, as many as you like, all at once. Writers are not. SQLite lets one writer
   in at a time, so many processes writing constantly will queue behind that door.`,
  {whenNotSqlite: {
    caption: 'one door for the writers',
    premise: 'Many readers at once is fine. Many writers at once is the limit.',
    fileLabel: 'shop.db', readerLabel: 'readers', writerLabel: 'writers',
    readers: 5, writers: 5,
    verdict: 'a busy write workload wants a server',
    readAtWord: 16, writeAtWord: 30, atWord: 3,
  }});

scene('QUIZ_CARD',
  `Your script inserts a row, prints the id, and the row is gone. Why? Have a think, and pause
   if you want longer. Ready. It is D — the script never called commit.`,
  {quiz: {
    question: 'The row vanished after the script exited. Why?',
    options: [
      {text: 'The file was read-only'}, {text: 'The table had no primary key'},
      {text: 'The cursor was not closed'}, {text: 'It never called commit()'},
    ],
    answerIndex: 3,
    why: 'Changes live in the connection until commit() lands them in the file.',
    revealAtWord: 24, atWord: 3,
  }});

scene('RECAP',
  `Three things, and you watched every one of them happen. The whole database was one file of
   eight kilobytes. One word of a query plan changed from SCAN to SEARCH. And a value passed as
   a parameter returned one row, while the same value glued into a string returned
   everything.`,
  {heading: 'What you actually saw',
   points: [
     {text: 'The database was one 8 KB file', atWord: 12},
     {text: 'SCAN became SEARCH', atWord: 24},
     {text: 'One row, or the whole table', atWord: 38},
   ]});

scene('OUTRO_CTA',
  `Everything here runs on a plain install with no extra packages, so go and open a shell and break
   something. Genuinely — that's how this sticks.`,
  {message: 'Open a shell and break something',
   sub: 'that is genuinely how it sticks'});

// ─────────────────────────────────────────────────────────────────────────────
// SELF-CHECK against the two rules that shaped this file
// ─────────────────────────────────────────────────────────────────────────────
const T = scenes.length;
const cap = Math.max(4, Math.ceil(T * 0.35));
const counts = {};
for (const s of scenes) counts[s.type] = (counts[s.type] || 0) + 1;

const problems = [];
for (const [type, c] of Object.entries(counts)) {
  if (c > cap) problems.push(`OVER-RELIANCE: ${type} used ${c}x (cap ${cap} for ${T} scenes)`);
}
const table = [];
for (const s of scenes) {
  const ceil = s._hookCap ? 240 : Math.max(480, Math.min(2100, 180 * s._anchors + 120));
  const maxW = Math.floor((ceil - 45) / 12);
  const w = words(s.narration);
  // anchor-spec has to fit one anchor per depicted moment AND honour the gap rule, so a
  // recorded beat needs its narration NEAR the cap, not comfortably under it. Undershooting
  // is what pushed anchors past the last word on the first pass.
  const tight = s.type === 'RECORDED_STEP' && w < maxW * 0.88;
  table.push(`${s.id} ${String(s.type).padEnd(18)} ${String(w).padStart(3)}w / ${String(maxW).padStart(3)} max` +
    (w > maxW ? '   OVER' : tight ? '   thin (anchor-spec may overflow)' : ''));
  if (s.durationFrames > ceil) {
    const over = ((s.durationFrames - ceil) / 30).toFixed(1);
    const maxWords = Math.floor((ceil - 45) / 12);
    problems.push(`${s.id} ${s.type}: ${(s.durationFrames / 30).toFixed(1)}s vs ${(ceil / 30).toFixed(0)}s earned ` +
      `(${s._anchors} anchors) — over by ${over}s, trim to ~${maxWords} words ` +
      `(now ${words(s.narration)})`);
  }
}
for (const s of scenes) delete s._anchors, delete s._hookCap;

const spec = {
  meta: {
    topic: 'SQLite: the database that is just a file',
    // How the thing is SAID out loud. Scene 1 has to contain it — the viewer clicked a
    // title with this word in it (LAW 0g.1).
    subject: 'SQLite',
    format: 'long',
    // 37 scenes is deliberate for a course of this length; the linter asks long-form to say so.
    screenplay: 'documentary',
    // LAW: the playbook wants two strategy axes. SQLite is a specific named thing most
    // viewers already run without knowing it (entity-novelty), and the pitch is the cost and
    // ceremony of standing up a server you did not need (economic-pain).
    topicAxes: ['entity-novelty', 'economic-pain'],
    fps: 30,
    onePayoff: 'The entire database is one 8 KB file you can email.',
    openLoop: 'You did not install anything — so where does the data actually live?',
    analogy: 'A gate that checks a value, a queue at one door, a sentence that grows a clause.',
    seo: {
      title: 'SQLite Tutorial: The Database That Is Just A File',
      description: 'SQLite from nothing — the shell first, then Python. Real commands, real output, nothing faked.',
      queries: [
        'what is sqlite', 'sqlite tutorial for beginners', 'sqlite vs mysql',
        'sqlite python tutorial', 'sql injection python sqlite', 'explain query plan sqlite',
      ],
      tags: [
        'sqlite', 'sqlite tutorial', 'sql', 'sql tutorial', 'database', 'python sqlite',
        'sqlite3', 'sql for beginners', 'explain query plan', 'sql injection',
        'parameterised queries', 'database tutorial', 'learn sql', 'sqlite python',
      ],
    },
  },
  brand: {
    theme: 'moderndark', design: 'moderndark', themeLight: 'daylight',
    channel: 'THE NBX STUDIO', logo: 'img:channel_logo.png',
    // LAW 0h — a still grid. Nothing behind the lesson may move.
    background: 'grid',
  },
  thumbnail: {title: 'JUST A FILE', badge: '8 KB', asset: 'lucide:file'},
  scenes,
};

const dest = path.join('topics', SLUG, 'long.json');
fs.writeFileSync(dest, JSON.stringify(spec, null, 2) + NL);

const totalWords = scenes.reduce((a, s) => a + words(s.narration), 0);
const totalFrames = scenes.reduce((a, s) => a + s.durationFrames, 0);
const clipCount = scenes.reduce((a, s) => a + (s.data.recordedStep?.clips?.length ?? 0), 0);
console.log(`${dest}`);
console.log(`  ${T} scenes · ${totalWords} words · ~${(totalFrames / 30 / 60).toFixed(1)} min pre-sync`);
console.log(`  ${counts.RECORDED_STEP ?? 0} recorded scenes carrying ${clipCount} clips (cap ${cap})`);
console.log(`  ${Object.keys(counts).length} distinct scene types`);
if (problems.length) {
  console.log(`${NL}  ${problems.length} thing(s) the linter will object to:`);
  for (const p of problems) console.log('   - ' + p);
} else {
  console.log(`${NL}  self-check clean`);
}
console.log(NL + table.join(NL));
