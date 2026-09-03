#!/usr/bin/env node
// BUILD — topics/point-ai-03-data/long.json
//
// "Point AI At It", episode 3: Data — the mistake everyone makes.
//
// SOURCES. Every figure spoken or drawn in this cut comes from the tutorial project's own
// documents, which the owner set as the only truth for the series:
//   ai-analyst-tutorial/docs/02-PRODUCTION-BIBLE.md  §E   shot list + verbatim captures
//   ai-analyst-tutorial/docs/03-PROVIDERS-AND-COSTS.md §6 the measured token counts
//   ai-analyst-tutorial/docs/04-TEST-EVIDENCE.md      §3,4 the profile and the three failures
// Nothing is estimated and nothing is rounded. Where the arithmetic is DERIVED — the
// per-row token cost in s07 — the assumption is spoken out loud and the legend carries the
// figures it came from, so a viewer can check the slope instead of trusting it.
//
// ONE THING THE SOURCES DO NOT SUPPORT, and it is flagged rather than invented: the
// curriculum's chapter 1 says the pasted-rows answer gets "the arithmetic wrong", and no
// capture of that exists in any of the four documents. So chapter one argues what IS
// measured — four times the input, and a worse answer — and the wrongness is promised and
// then paid off twice, in chapter four and chapter seven, where it was really recorded.
//
// FOOTAGE. demos/analyst-{data,code,fixed}.json, three takes over one workspace, read-back
// verified. Cast by watching the last frame of each segment, never by its label.
//
// TONE. LAW 0f: no beat announces that any of this is genuine, measured or captured. The
// terminal is on screen; that is the argument.
import fs from 'node:fs';

const CH = 'THE NBX STUDIO';
const FILE = 'samples/orders.csv';
const RUN = 'Live run, 2026-09-03';

const normw = (w) => String(w).toLowerCase().replace(/[^a-z0-9]/g, '');
/** 1-based index of `word` in `narration`. Throws rather than guess (LAW 0i). */
const at = (narration, word, nth = 1) => {
  const ws = narration.split(/\s+/).map(normw);
  const want = normw(word);
  let seen = 0;
  for (let i = 0; i < ws.length; i++) if (ws[i] === want && ++seen === nth) return i + 1;
  throw new Error(`anchor word ${JSON.stringify(word)} (#${nth}) not found in: ${narration.slice(0, 90)}…`);
};

const TRANS = ['fade', 'push', 'slide', 'zoom', 'wipe', 'dip', 'morph', 'iris'];
const BG = ['zoneA', 'zoneB', 'zoneC'];
let i = 0;
const scene = (type, narration, data, extra = {}) => {
  const s = {
    id: `s${String(i + 1).padStart(2, '0')}`, type, narration,
    transition: TRANS[i % TRANS.length], background: BG[i % BG.length], data, ...extra,
  };
  i++;
  return s;
};
const chapter = (narration, number, title, subtitle) =>
  scene('CHAPTER', narration, {chapter: {number: String(number).padStart(2, '0'), title, subtitle}});

/** A RECORDED_STEP beat. Clip anchors are left to anchor-spec.mjs, which solves them from
 *  the measured frame counts; `wantAtWord` is the author's intent where one is needed. */
const rec = (narration, caption, premise, clips, extra = {}) =>
  scene('RECORDED_STEP', narration, {
    recordedStep: {caption, premise, layout: 'full', color: 'blue', clips, ...extra},
  });

const scenes = [];

// ── OPENING ──────────────────────────────────────────────────────────────────
{
  const n =
    "A spreadsheet, and a model that's just read it. " +
    "Every line of the answer sounds equally sure of itself. " +
    "One line is flatly wrong, and the tone will not tell you which.";
  scenes.push(scene('HOOK', n, {
    headline: "DON'T PASTE THE SPREADSHEET",
    subtext: 'it counts badly, and confidently',
    hookVariant: 'statement',
    headlineAtWord: at(n, 'spreadsheet'),
  }));
}

{
  const n =
    `Welcome back to ${CH}. This is part three of Point AI At It, and today we're pointing ` +
    "a model at a spreadsheet — fifty orders from a made-up online shop called Bramble and Co. " +
    "So when can a model be trusted with a number, and when can it absolutely not? " +
    "That's the rule I want you to leave with, because it decides everything else. " +
    "And somewhere in the middle, you'll watch the model blame a courier that lost nothing at all.";
  scenes.push(scene('TITLE_CARD', n, {
    title: 'Data: the mistake everyone makes',
    subtitle: 'Point AI At It · part three',
  }));
}

{
  const n =
    "So, the file. Fifty orders, eight columns — who carried the parcel, how many days it " +
    "took, what it was worth, and whether it turned up. " +
    "Two of those fifty never turned up, and their delivery time is blank. " +
    "Hold on to those two, because that pair comes back three times before the end.";
  scenes.push(scene('DATABASE_TABLE', n, {database: {
    headline: 'Fifty orders, eight columns',
    tableName: 'orders.csv',
    columns: ['order_id', 'courier', 'days', 'status'],
    rows: [
      ['SO-1001', 'RapidPost', '4.10', 'delivered'],
      ['SO-1003', 'CityLink', '3.90', 'delivered'],
      ['SO-1042', 'RapidPost', '--', 'lost_in_transit'],
      ['SO-1045', 'FarReach', '19.40', 'delivered'],
      ['SO-1047', 'RapidPost', '--', 'lost_in_transit'],
    ],
    highlight: [2, 4],
    query: 'the two that never arrived',
    atWord: at(n, 'file'),
    source: FILE,
  }}));
}

// ── CHAPTER 1 ────────────────────────────────────────────────────────────────
scenes.push(chapter(
  "Let's start with the thing almost everybody does first, because the trouble hides inside it.",
  1, 'Don’t paste the rows', 'the instinct, and what it costs'));

{
  const n =
    "You open a chat, you select the whole sheet, you paste the lot in, and you ask your question. " +
    "And honestly? On fifty rows, that works fine. " +
    "But look at what you've actually asked for: " +
    "you've handed a model a wall of text and asked it to do arithmetic inside the wall.";
  scenes.push(scene('CHAT_MOCKUP', n, {
    panelLabel: 'the thing almost everybody does first',
    messages: [
      {from: 'user', text: 'order_id,date,region,courier,delivery_days…', atWord: at(n, 'paste')},
      {from: 'user', text: '(fifty rows, pasted)', atWord: at(n, 'in')},
      {from: 'user', text: 'Which courier is slowest, and how bad is it?', atWord: at(n, 'question')},
    ],
    source: FILE,
  }));
}

{
  const n =
    "Those fifty rows cost about two thousand four hundred tokens going in. " +
    "A token is roughly three quarters of a word, and a token is the unit you're billed in. " +
    "Fifty rows is nothing, so nobody notices. The trouble is what happens next.";
  scenes.push(scene('STAT_CALLOUT', n, {
    value: 2400, label: 'input tokens for fifty pasted rows',
    atWord: at(n, 'thousand'),
    source: 'Measured workload, 2026-09-03',
  }));
}

{
  const n =
    "That's about forty-eight tokens a row, so the bill grows in a straight line with the file. " +
    "Fifty rows is two thousand four hundred. " +
    "A thousand rows is nearly fifty thousand. " +
    "Forty thousand rows — an ordinary export, the kind that lands in your inbox on a Monday — " +
    "is close to two million tokens, and no model on earth will read that in one go, " +
    "because every one of those rows has to sit in the window at the same moment. " +
    "Pasting doesn't get expensive. Pasting stops working.";
  scenes.push(scene('LINE_CHART', n, {lineChart: {
    headline: 'The bill grows with the file',
    series: [{
      label: 'pasted rows',
      // DERIVED, AND DECLARED. 2,400 tokens for 50 rows is the measured figure; ~48 a row is
      // that number divided by that number of rows, and the sentence says so out loud. The
      // legend carries the rate so the slope can be checked rather than trusted.
      values: [2400, 12000, 48000, 240000, 960000, 1920000],
      color: 'red',
      atWord: at(n, 'line'),
    }],
    xAxis: ['50', '250', '1k', '5k', '20k', '40k'],
    yUnit: 'tok',
    area: true,
    atWord: at(n, 'row'),
    source: '~48 tokens per row · measured 2026-09-03',
  }}));
}

// ── CHAPTER 2 ────────────────────────────────────────────────────────────────
scenes.push(chapter(
  "So don't send the rows. Send what the rows add up to.",
  2, 'Python counts better', 'twenty lines, no model, no cost'));

{
  const n =
    "Here's the function that builds that summary, and it's worth walking a line at a time. " +
    "First, read the file into a list of rows — that's Python's csv reader, and the reader is free. " +
    "Then, for every column, pull out its values. " +
    "Count the blanks, because a blank is information. " +
    "Try turning each value into a number; if every filled value converts, the column is numeric. " +
    "And a numeric column gets a smallest, a largest, and an average. " +
    "No model has been involved yet, and nothing has left your machine — " +
    "so far this is a program reading a file, start to finish.";
  scenes.push(scene('CODE_RUN', n, {codeRun: {
    filename: 'analyst/data.py',
    language: 'py',
    resultLabel: 'what it produces',
    color: 'green',
    atWord: at(n, 'function'),
    lines: [
      {text: 'rows = list(csv.DictReader(path.open()))',
       detail: 'read the file into a list of rows', sub: '50 rows', label: 'rows',
       atWord: at(n, 'read')},
      {text: 'for name in rows[0]:',
       detail: 'walk the columns one at a time', sub: '8 columns', label: 'cols',
       atWord: at(n, 'column')},
      {text: '    values = [r[name] for r in rows]',
       detail: 'every value in this column', sub: 'delivery_days', label: 'now on',
       atWord: at(n, 'values')},
      {text: '    filled = [v for v in values if v]',
       detail: 'drop the blanks, and count them', sub: 'missing: 2', label: 'blanks',
       atWord: at(n, 'blanks')},
      {text: '    nums = [float(v) for v in filled]',
       detail: 'if every filled value converts', sub: "kind: 'number'", label: 'type',
       atWord: at(n, 'numeric')},
      {text: '    info["min"] = min(nums)',
       detail: 'the smallest value in the column', sub: '3.87', label: 'min',
       atWord: at(n, 'smallest')},
      {text: '    info["max"] = max(nums)',
       detail: 'and the largest', sub: '19.4', label: 'max',
       atWord: at(n, 'largest')},
      {text: '    info["mean"] = fmean(nums)',
       detail: 'and the average of all of them', sub: '5.2592', label: 'mean',
       atWord: at(n, 'average')},
    ],
    caption: 'one pass over the file, no model',
  }}));
}

{
  const n =
    "Run the profile, and here's what fifty rows turn into. " +
    "Two missing values, forty-six distinct ones. " +
    "The quickest delivery took three point eight seven days, the slowest took nineteen point four, " +
    "and the average sits at five point two six days. " +
    "Then the two text columns: three couriers, and two possible outcomes — " +
    "forty-eight delivered, two lost in transit. " +
    "Eight columns, described. The whole summary is a few hundred tokens.";
  scenes.push(rec(n,
    'fifty rows, described',
    'The order file, and the twenty lines that describe it without a model.',
    [
      {ref: 'rec:analyst-data#rows', label: 'the first rows of the file', focus: true,
       callouts: [{text: 'one row is one order', mark: 'first', side: 'bottom', color: 'blue'}]},
      {ref: 'rec:analyst-data#profile', label: 'the profile it prints', focus: true,
       wantAtWord: at(n, 'missing'),
       zooms: [
         {mark: 'max', atWord: at(n, 'slowest')},
         {mark: 'mean', atWord: at(n, 'average')},
         {marks: ['courier', 'status'], atWord: at(n, 'text')},
         {at: 'full', atWord: at(n, 'described')},
       ],
       callouts: [
         {text: 'the slowest delivery', mark: 'max', side: 'right', color: 'orange',
          atWord: at(n, 'nineteen')},
         {text: 'the average', mark: 'mean', side: 'right', color: 'blue',
          atWord: at(n, 'average')},
         {text: 'two never arrived', mark: 'status', side: 'right', color: 'red',
          atWord: at(n, 'lost')},
       ]},
    ]));
}

{
  const n =
    "Two of those eight columns aren't numbers at all. " +
    "Courier is a name, so there's no average to take — names get counted instead. " +
    "RapidPost carried twenty of the fifty. CityLink carried twenty. " +
    "FarReach carried the other ten, which makes FarReach the small one — and that matters later. " +
    "Status works the same way: forty-eight delivered, two lost. " +
    "Counting is all you can do with a word, and counting is enough, " +
    "because a count is what tells you FarReach is a tenth of the file rather than a third.";
  scenes.push(scene('BAR_COMPARE', n, {
    bars: [
      {label: 'RapidPost', sub: 'orders carried', value: 20, atWord: at(n, 'RapidPost')},
      {label: 'CityLink', sub: 'orders carried', value: 20, atWord: at(n, 'CityLink')},
      {label: 'FarReach', sub: 'orders carried', value: 10, color: 'orange',
       atWord: at(n, 'FarReach')},
    ],
    maxValue: 20,
    source: FILE,
  }));
}

// ── CHAPTER 3 ────────────────────────────────────────────────────────────────
scenes.push(chapter(
  "Now send that instead of the rows, and watch the bill.",
  3, 'Hand it facts', 'a quarter of the input, a better answer'));

{
  const n =
    "Here's the same question, priced both ways. " +
    "Pasting the rows costs two thousand four hundred tokens going in. " +
    "Sending the profile costs about six hundred — a quarter of that. " +
    "What comes back is the same length either way, so the output line doesn't move. " +
    "And the answer is better, which is the part that surprises people: " +
    "you spent less and got more, because you stopped asking the model to do arithmetic " +
    "and started handing it the arithmetic already done.";
  scenes.push(scene('RATE_SHEET', n, {rateSheet: {
    headline: 'The same question, priced both ways',
    unit: 'tokens per question',
    rows: [
      {label: 'Input', value: '~600', was: '~2,400', note: 'the profile, not the rows',
       atWord: at(n, 'profile')},
      {label: 'Output', value: '~400', note: 'the answer is the same length',
       atWord: at(n, 'output')},
    ],
    foot: 'On fifty rows that is small change. On forty thousand it is the whole game.',
    footAtWord: at(n, 'better'),
    atWord: at(n, 'question'),
    source: 'Measured workload, 2026-09-03',
  }}));
}

{
  const n =
    "And here's what actually goes over the wire now. " +
    "Fifty rows: gone. In their place, one line per column. " +
    "Delivery days, with its range and its average and its two blanks. " +
    "Courier, with its three names and their counts. " +
    "Then the same question as before. " +
    "Notice what the model is being asked to do here — read a summary, not run a calculator.";
  scenes.push(scene('CHAT_MOCKUP', n, {
    panelLabel: 'the same question, eight lines instead of fifty rows',
    messages: [
      {from: 'user', text: 'Rows: 50', atWord: at(n, 'column')},
      {from: 'user', text: 'delivery_days: min=3.87 max=19.4 mean=5.2592 missing=2',
       atWord: at(n, 'Delivery')},
      {from: 'user', text: 'courier: RapidPost(20), CityLink(20), FarReach(10)',
       atWord: at(n, 'Courier')},
      {from: 'user', text: 'Which courier is slowest, and how bad is it?',
       atWord: at(n, 'question')},
    ],
    source: 'The profile, as the model receives it',
  }));
}

// ── CHAPTER 4 ────────────────────────────────────────────────────────────────
scenes.push(chapter(
  "Which brings us to the first of three things that went wrong.",
  4, 'It saw it and shrugged', 'the failure nobody talks about'));

{
  const n =
    "Read what the model wrote back. " +
    "The delivery_days column has two missing values and forty-six distinct ones, " +
    "with a minimum of three point eight seven days, a maximum of nineteen point four days, " +
    "and an average of five point two six. " +
    "The model typed nineteen point four days, so the model knew. " +
    "Now read the second half of the same answer — the list of what the model called unusual. " +
    "Missing values. Two lost parcels. " +
    "A parcel took nineteen days against a five-day average, and that never made the list. " +
    "Which is a stranger failure than a wrong answer, because nothing the model said was false.";
  scenes.push(scene('MODEL_SHRUG', n, {modelShrug: {
    headline: 'It wrote the number down',
    needle: '19.4 days',
    saidLabel: 'what it found',
    missedLabel: 'what it called unusual',
    said: [
      {text: 'The delivery_days column has 2 missing values and 46 distinct values,',
       atWord: at(n, 'delivery_days')},
      {text: 'with a minimum of 3.87 days, a maximum of 19.4 days, and an average of 5.2592.',
       atWord: at(n, 'minimum')},
    ],
    missed: [
      {text: 'The delivery_days column has 2 missing values, which is unusual given that all other columns have no missing values.',
       atWord: at(n, 'Missing')},
      {text: 'The status column shows that 2 orders were lost in transit, which might require further investigation.',
       atWord: at(n, 'parcels')},
    ],
    verdict: 'never on the list',
    verdictAtWord: at(n, 'list', 2),
    source: RUN,
    atWord: at(n, 'wrote'),
  }}));
}

{
  const n =
    "And those parcels are in the file, in black and white. " +
    "Order SO-1040 took eighteen point nine days. SO-1045 took nineteen point four. " +
    "SO-1050 took nineteen point one. " +
    "Same courier, same region, three of them in a row. " +
    "That is not noise, because noise doesn't arrive three times in a row. " +
    "That is somebody's fortnight.";
  scenes.push(scene('DATABASE_TABLE', n, {database: {
    headline: 'The three that took a fortnight',
    tableName: 'orders.csv',
    columns: ['order_id', 'region', 'courier', 'days'],
    rows: [
      ['SO-1040', 'Remote', 'FarReach', '18.90'],
      ['SO-1045', 'Remote', 'FarReach', '19.40'],
      ['SO-1050', 'Remote', 'FarReach', '19.10'],
    ],
    highlight: [0, 1, 2],
    query: 'delivery_days > 18',
    atWord: at(n, 'file'),
    source: FILE,
  }}));
}

{
  const n =
    "Here's the thing though — the model isn't being stupid. " +
    "Look at everything the model was given about that column. " +
    "A smallest value, a largest value, and an average. " +
    "Three numbers, standing in for forty-eight. " +
    "From three numbers, nothing looks wrong: a range is just a range. " +
    "The spike is invisible unless somebody points at it.";
  scenes.push(scene('STAT_PANELS', n, {
    stats: [
      {kicker: 'minimum', value: '3.87', note: 'days', atWord: at(n, 'smallest')},
      {kicker: 'maximum', value: '19.4', note: 'days', color: 'orange', atWord: at(n, 'largest')},
      {kicker: 'average', value: '5.2592', note: 'days', atWord: at(n, 'average')},
    ],
    source: 'Everything the model was told about 48 values',
  }));
}

{
  const n = "So write this line down, because these nine words are the whole episode.";
  scenes.push(scene('KINETIC_TEXT', n, {kinetic: {
    text: 'The model is only as good as what you hand it',
    fx: 'highlight',
    sub: 'not smarter or dumber, just better fed',
    color: 'orange',
    atWord: at(n, 'down'),
  }}));
}

// ── CHAPTER 5 ────────────────────────────────────────────────────────────────
scenes.push(chapter(
  "The fix isn't a cleverer question — the fix is twelve more lines of Python.",
  5, 'Give it the odd values', 'the same model, better fed'));

{
  const n =
    "Here's the outlier check, and the idea behind it is far older than any of this. " +
    "Sort the values. " +
    "Find the point a quarter of the way in, and the point three quarters of the way in — " +
    "the middle half of your data sits between those two. " +
    "Measure that gap. " +
    "Then draw a fence one and a half gaps out on each side. " +
    "Anything outside the fence is odd enough to mention — and the fence is built from " +
    "your own data, which means it moves to fit whatever you point it at. " +
    "Twelve lines, no model, and now the spike has a name.";
  scenes.push(scene('CODE_RUN', n, {codeRun: {
    filename: 'analyst/data.py',
    language: 'py',
    resultLabel: 'on delivery_days',
    color: 'purple',
    atWord: at(n, 'outlier'),
    lines: [
      {text: 'ordered = sorted(numbers)',
       detail: 'put the values in order', sub: '3.87 … 19.4', label: 'sorted',
       atWord: at(n, 'Sort')},
      {text: 'q1 = median(ordered[:len(ordered)//2])',
       detail: 'a quarter of the way in', sub: '4.035', label: 'q1',
       atWord: at(n, 'quarter')},
      {text: 'q3 = median(ordered[(len(ordered)+1)//2:])',
       detail: 'three quarters of the way in', sub: '4.325', label: 'q3',
       atWord: at(n, 'three')},
      {text: 'gap = q3 - q1',
       detail: 'the middle half of the data', sub: '0.29', label: 'gap',
       atWord: at(n, 'gap')},
      {text: 'low, high = q1 - 1.5*gap, q3 + 1.5*gap',
       detail: 'the fence, one and a half gaps out', sub: '3.60 to 4.76', label: 'fence',
       atWord: at(n, 'fence')},
      {text: 'odd = {n for n in numbers',
       detail: 'anything outside the fence', sub: '10 values', label: 'odd',
       atWord: at(n, 'outside')},
      {text: '       if n < low or n > high}',
       atWord: at(n, 'outside')},
    ],
    caption: 'the middle half, and a fence around it',
  }}));
}

{
  const n =
    "Re-run the analysis, and the answer changes shape. " +
    "The same model, the same question, the same price — " +
    "and now the unusual list opens with the three numbers that matter. " +
    "The follow-up changed too — the model now wants to know whether those delays " +
    "line up with a region or a courier. " +
    "That's a useful question, and the model only asked because somebody handed over the values.";
  scenes.push(scene('QUOTE_SPOTLIGHT', n, {
    quote: "The 'delivery_days' column has some unusually high values: 19.4, 19.1, and 18.9",
    person: {name: 'the same model', role: 'same prompt, same price, twelve more lines'},
    source: RUN,
    atWord: at(n, 'opens'),
  }));
}

// ── CHAPTER 6 ────────────────────────────────────────────────────────────────
scenes.push(chapter(
  "Second thing that went wrong, and this one was mine.",
  6, 'The bug I shipped', 'caught by a question I only asked once'));

{
  const n =
    "The check that goes with those twelve lines asks something specific: " +
    "does the tool name the worst delay, nineteen point four days? " +
    "The check went red. " +
    "Look at what it was handed instead — five point four eight, five point five, " +
    "five point five two, five point five four, five point five five. " +
    "Those are outliers. They're just the wrong ones — the five mildest of the ten. " +
    "And here's the line that chose them. " +
    "Sorting them smallest-first put the three that mattered at the far end of the list, " +
    "and then only the first five were ever shown.";
  scenes.push(rec(n,
    'the five it was handed, and why',
    'The check asserts something specific about the output, and the tool fails it.',
    [
      {ref: 'rec:analyst-data#redtest', label: 'the check goes red', focus: true,
       zooms: [
         {mark: 'fail', atWord: at(n, 'red')},
         {mark: 'mild', atWord: at(n, 'four')},
         {at: 'full', atWord: at(n, 'mildest')},
       ],
       callouts: [
         {text: 'a specific claim, and it failed', mark: 'fail', side: 'bottom', color: 'red',
          atWord: at(n, 'red')},
         {text: 'the five mildest of ten', mark: 'mild', side: 'bottom', color: 'orange',
          atWord: at(n, 'outliers')},
       ]},
      {ref: 'rec:analyst-code#line', label: 'the line that sorted them', focus: true,
       wantAtWord: at(n, 'line'),
       zooms: [{at: 'full', atWord: at(n, 'shown')}]},
    ]));
}

{
  const n =
    "One line changes. " +
    "Instead of sorting by value, sort by distance from the middle — " +
    "so the furthest-out value comes first and the mildest comes last. " +
    "Same twelve lines otherwise, same everything else, " +
    "because the only thing that was ever wrong here was the order.";
  scenes.push(scene('CODE_DIFF', n, {diff: {
    fileName: 'analyst/data.py',
    rows: [
      {kind: 'ctx', text: '  middle = statistics.median(ordered)'},
      {kind: 'del', text: '  return sorted(odd)'},
      {kind: 'add', text: '  return sorted(odd, key=lambda n: -abs(n - middle))'},
    ],
    stat: {plus: 1, minus: 1},
    atWord: at(n, 'line'),
  }}));
}

{
  const n =
    "Run the check again. Green — and the list now opens on nineteen point four, " +
    "nineteen point one, eighteen point nine. " +
    "The three that mattered, at the front — which matters, because only the first five " +
    "are ever sent. " +
    "I didn't spot that by reading the code. A question I'd written down spotted it for me.";
  scenes.push(rec(n,
    'the same check, one line later',
    'The same check, after the sort key changed.',
    [
      {ref: 'rec:analyst-fixed#greentest', label: 'the check passes', focus: true,
       zooms: [
         {mark: 'pass', atWord: at(n, 'Green')},
         {mark: 'worst', atWord: at(n, 'nineteen')},
         {at: 'full', atWord: at(n, 'code')},
       ],
       callouts: [
         {text: 'the three that mattered, first', mark: 'worst', side: 'bottom', color: 'green',
          atWord: at(n, 'front')},
       ]},
    ]));
}

{
  const n =
    "One more thing about a red line, because this is the part people get wrong. " +
    "A failing check asks you two questions, not one. " +
    "Is the code wrong? Sometimes — that's what happened here, and one line fixed it. " +
    "Or is the check wrong? " +
    "Earlier in this same project I'd written one asserting that delivery days would come " +
    "out as text, on the grounds that two cells were empty. " +
    "Delivery days comes out as a number, correctly, because a column counts as numeric when " +
    "every filled value converts. " +
    "The code was right. My assumption wasn't. Red means look at both.";
  scenes.push(scene('FLIP_CARD', n, {flip: {
    front: {label: 'red', text: 'Is the code wrong?', color: 'red'},
    back: {label: 'or', text: 'Is the check wrong?', color: 'blue'},
    atWord: at(n, 'two'),
  }}));
}

{
  const n =
    "Which is the second line worth writing down, and this one has nothing to do with models.";
  scenes.push(scene('QUOTE_SPOTLIGHT', n, {
    quote: 'A test is a question you only have to ask once.',
    person: {name: 'the rule', role: 'ask something specific, or it catches nothing'},
    source: 'tests/test_analyst.py · 37 checks',
    atWord: at(n, 'down'),
  }));
}

// ── CHAPTER 7 ────────────────────────────────────────────────────────────────
scenes.push(chapter(
  "Third thing, and this is the one to remember.",
  7, 'It blamed the wrong one', 'confident, specific, and false'));

{
  const n =
    "I asked one question about one courier: is anything wrong with FarReach? " +
    "The model came back with two findings, in the same even tone. " +
    "First: FarReach is responsible for two out of two lost-in-transit orders. " +
    "That's a specific, checkable claim, so let's check it. " +
    "Every order in the file, one square each, and the lost ones lit. " +
    "CityLink lost none of twenty. " +
    "FarReach lost none of ten. Zero. " +
    "RapidPost lost two of twenty, and both of them are RapidPost's. " +
    "Now look at the second finding: FarReach really is the slow one, and that part is true. " +
    "One right, one wrong, and nothing in the wording tells you which is which, " +
    "because both sentences were produced exactly the same way.";
  scenes.push(scene('CLAIM_CHECK', n, {claimCheck: {
    headline: 'One right, one wrong, same voice',
    claims: [
      {text: "FarReach is responsible for 2 out of 2 'lost_in_transit' orders.",
       tag: 'it said', color: 'red', atWord: at(n, 'First')},
      {text: 'FarReach has the highest delivery days, well above the mean.',
       tag: 'it also said', color: 'green', atWord: at(n, 'second')},
    ],
    subject: 'FarReach',
    tallyLabel: 'every order, counted',
    hitLabel: 'lost',
    tally: [
      {label: 'CityLink', value: 0, threshold: 20, atWord: at(n, 'CityLink')},
      {label: 'FarReach', value: 0, threshold: 10, color: 'red', atWord: at(n, 'FarReach', 3)},
      {label: 'RapidPost', value: 2, threshold: 20, color: 'green', atWord: at(n, 'RapidPost')},
    ],
    verdict: 'Both lost parcels are RapidPost’s',
    verdictAtWord: at(n, 'both'),
    source: FILE,
    atWord: at(n, 'asked'),
  }}));
}

{
  const n =
    "You don't have to take my word for the count — the count is twenty lines of Python over the same file. " +
    "Two orders lost, both in the North region, both carried by RapidPost. " +
    "Per courier: CityLink zero, FarReach zero, RapidPost two. " +
    "And the delivery times underneath say the rest: " +
    "FarReach runs from five and a half days to nineteen point four, against about four for everyone else. " +
    "Slow, yes. Losing parcels, no.";
  scenes.push(rec(n,
    'the same question, counted in Python',
    'The order file, counted per courier and per region.',
    [
      {ref: 'rec:analyst-fixed#truth', label: 'the count, per courier', focus: true,
       zooms: [
         {mark: 'north', atWord: at(n, 'lost')},
         {marks: ['farreach', 'rapidpost'], atWord: at(n, 'courier')},
         {at: 'full', atWord: at(n, 'underneath')},
       ],
       callouts: [
         {text: 'both are RapidPost', mark: 'north', side: 'right', color: 'blue',
          atWord: at(n, 'North')},
         {text: 'not one parcel', mark: 'farreach', side: 'right', color: 'red',
          atWord: at(n, 'zero', 2)},
         {text: 'this is the true half', mark: 'rapidpost', side: 'right', color: 'green',
          atWord: at(n, 'two', 2)},
       ]},
    ]));
}

{
  const n =
    "And the FarReach answer wasn't a one-off. Ask the same tool about regions instead of couriers " +
    "and it says two orders were lost in transit, which is twenty per cent of the orders " +
    "from the Remote region. " +
    "Count the file again. Remote lost none. Central lost none. " +
    "Both lost orders are in North — a region the model never mentioned. " +
    "Same shape of mistake, different column, and just as calmly delivered.";
  scenes.push(scene('BAR_COMPARE', n, {
    bars: [
      {label: 'North', sub: 'lost in transit', value: 2, color: 'red', atWord: at(n, 'North')},
      {label: 'Central', sub: 'lost in transit', value: 0, atWord: at(n, 'Central')},
      {label: 'Remote', sub: 'lost in transit', value: 0, color: 'orange', atWord: at(n, 'Remote', 2)},
    ],
    maxValue: 2,
    source: 'It said 20% of Remote · the file says none',
  }));
}

{
  const n = "So here's the third line to write down, and this is the one I'd tattoo on the inside of my eyelids.";
  scenes.push(scene('KINETIC_TEXT', n, {kinetic: {
    text: 'Right and confident are not the same thing',
    fx: 'split',
    sub: 'the tone is identical either way',
    color: 'red',
    atWord: at(n, 'third')},
  }));
}

// ── CHAPTER 8 ────────────────────────────────────────────────────────────────
scenes.push(chapter(
  "One question left, and it's the useful one: why did the model do that?",
  8, 'Why it did that', 'the join that was never there'));

{
  // PRECISION, AND IT COST A RE-WRITE. docs/04-TEST-EVIDENCE.md §4.3 explains the wrong
  // courier with *"There is no row anywhere in it"* — and `_render()` in analyst/data.py
  // does append five sample rows under "First rows:". The explanation still holds, and it
  // holds for a sharper reason: the five it sends are the FIRST five, and all five arrived
  // safely, so the only rows the model could see were the ones where nothing went wrong.
  // Repeating the document's sentence would have put a false statement on screen (LAW 3
  // outranks the source's phrasing), and the true version is the better beat.
  const n =
    "Here's the file as rows. Every row ties one courier to one outcome — that's what a row is for. " +
    "Now watch what the profile does to those rows. " +
    "Courier becomes three names with counts. Status becomes two words with counts. " +
    "Two tidy lists, and the rows are gone. " +
    "Well — nearly. The profile does send five sample rows, and they're the first five in the file. " +
    "All five of them arrived safely. " +
    "So when I asked whether FarReach was losing parcels, " +
    "the only rows the model could see were rows where nothing had gone wrong, " +
    "and the two that were lost existed as the number two in a column tally and nothing else. " +
    "The model couldn't look the answer up, so the model filled the gap with something that sounded right.";
  scenes.push(scene('COLUMN_SPLIT', n, {columnSplit: {
    headline: 'The profile is per column',
    tableName: 'orders.csv',
    columns: [{label: 'courier'}, {label: 'status'}],
    rows: [
      {label: 'RapidPost', text: 'lost_in_transit'},
      {label: 'CityLink', text: 'delivered'},
      {label: 'FarReach', text: 'delivered'},
      {label: 'RapidPost', text: 'lost_in_transit'},
    ],
    splitAtWord: at(n, 'profile'),
    left: [
      {label: 'RapidPost', value: 20},
      {label: 'CityLink', value: 20},
      {label: 'FarReach', value: 10},
    ],
    right: [
      {label: 'delivered', value: 48},
      {label: 'lost_in_transit', value: 2},
    ],
    question: 'is anything wrong with FarReach?',
    askAtWord: at(n, 'asked'),
    gapNote: 'counts, not rows',
    source: FILE,
    atWord: at(n, 'rows'),
  }}));
}

{
  const n =
    "There are two honest fixes for that, and neither is a better question. " +
    "One: group the profile by the column you're asking about, so lost parcels are counted " +
    "per courier before anything is sent. " +
    "Two: give the model a tool it can call — a small Python function that goes and counts " +
    "the actual parcels, on demand. That's where part five goes. " +
    "Both fixes are the same move: compute it, then hand it over — " +
    "because a model can only join what's on the page in front of it.";
  scenes.push(scene('DIAGRAM', n, {diagram: {
    layout: 'flow',
    direction: 'horizontal',
    nodes: [
      {id: 'q', label: 'The question', sub: 'courier × status', color: 'orange',
       atWord: at(n, 'fixes')},
      {id: 'g', label: 'Group the profile', sub: 'counted per courier', color: 'blue',
       atWord: at(n, 'group')},
      {id: 't', label: 'Give it a tool', sub: 'a function it can call', color: 'green',
       atWord: at(n, 'tool')},
    ],
    edges: [
      {from: 'q', to: 'g', label: 'before you ask', atWord: at(n, 'group')},
      {from: 'q', to: 't', label: 'while it asks', atWord: at(n, 'tool')},
    ],
  }}));
}

{
  const n =
    "Which leaves one rule, and it's short. If a number matters, compute it. " +
    "How many rows are in this file? Compute it — that's counting, and Python never miscounts. " +
    "Which courier lost the most parcels? Compute it — that's counting too, wearing a hat. " +
    "What do these six complaints have in common? Ask the model. " +
    "That's reading, and reading is what a model is for.";
  scenes.push(scene('RULE_TEST', n, {ruleTest: {
    rule: 'If a number matters, compute it',
    kicker: 'the rule',
    okLabel: 'compute it',
    noLabel: 'ask it',
    cases: [
      {text: 'How many rows are in this file?', title: 'ok', sub: 'counting', color: 'green',
       atWord: at(n, 'rows')},
      {text: 'Which courier lost the most parcels?', title: 'ok', sub: 'counting, joined first',
       color: 'green', atWord: at(n, 'courier')},
      {text: 'What do these complaints share?', title: 'no', sub: 'reading, not counting',
       color: 'blue', atWord: at(n, 'complaints')},
    ],
    atWord: at(n, 'rule'),
  }}));
}

// ── CLOSE ────────────────────────────────────────────────────────────────────
{
  const n =
    "So: three failures, and not one of them was the model being dim. " +
    "The model shrugged at nineteen days because nobody sent the odd values. " +
    "The tool handed my check five useless numbers because I sorted a list the wrong way round. " +
    "And the model blamed the wrong courier because the summary I sent had no lost parcel on any row. " +
    "Every one of those is an input problem, which means every one of them is yours to fix — " +
    "and that is genuinely good news, because inputs are the part you control.";
  scenes.push(scene('RECAP', n, {
    heading: 'Three failures, three inputs',
    points: [
      {text: 'It shrugged — nobody sent the odd values', atWord: at(n, 'shrugged')},
      {text: 'My check caught my own sort bug', atWord: at(n, 'check')},
      {text: 'It guessed a join that was never sent', atWord: at(n, 'blamed')},
      {text: 'The model reads. Python counts.', atWord: at(n, 'input')},
    ],
  }));
}

{
  const n =
    "Point the same tool at your own export next — a test run, a sprint, a stock report, whatever " +
    "lands on your desk. Profile it first, then ask. " +
    "Part four is pictures: we hand a model a screenshot, and it reads the error code straight off " +
    "the pixels. " +
    "If this saved you an afternoon, subscribe, and I'll see you there.";
  scenes.push(scene('OUTRO_CTA', n, {
    message: 'Profile it first, then ask',
    sub: 'Part four — Images: it can see your screen',
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
const spec = {
  meta: {
    topic: 'Analysing a spreadsheet with an AI without getting a wrong answer',
    subject: 'spreadsheet',
    format: 'long',
    fps: 30,
    audience: 'beginner',
    onePayoff: 'compute the numbers in Python and let the model do the reading',
    openLoop: 'why did it blame a courier that lost nothing?',
    analogy: 'a profile is a summary sheet — and a summary has no rows in it',
    screenplay: 'documentary',
    topicAxes: ['skill-build', 'economic-pain', 'sovereignty'],
    seo: {
      title: 'Point AI At It #3 — Never Paste A Spreadsheet Into An AI',
      altTitles: [
        'Point AI At It #3 — The Spreadsheet Mistake Everyone Makes',
        'Point AI At It #3 — Why Your AI Gets Numbers Wrong',
      ],
      hook: 'Why does an AI get a spreadsheet question confidently wrong?',
      breakdown:
        'why pasting rows into a model costs four times as much and answers worse, how twenty ' +
        'lines of Python fix it, and the three recorded failures that show when a number can be trusted',
      queries: [
        'how to analyse a csv with an AI',
        'why does chatgpt get numbers wrong',
        'ai spreadsheet analysis python',
        'how many tokens is a csv file',
        'ai hallucination example data',
        'python data profiling for llm',
        'iqr outlier detection python',
        'why does the ai make up statistics',
        'send facts not data to an llm',
        'ai analyst tool python tutorial',
      ],
      hashtags: ['#python', '#ai', '#dataanalysis', '#tutorial'],
      pinned: 'Which number would you never let a model compute for you?',
      tags: [
        'python', 'ai', 'data analysis', 'csv', 'spreadsheet', 'llm', 'openai api',
        'data profiling', 'outlier detection', 'iqr', 'hallucination', 'tutorial',
        'point ai at it', 'beginner python', 'ai for testers', 'ai for analysts',
      ],
      sources: [
        'https://github.com/san-gitlogin/iauteur',
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
    title: 'SPREADSHEET → AI',
    badge: 'the mistake everyone makes',
    note: 'it blamed the wrong courier',
    asset: 'si:python',
  },
  scenes,
};

fs.writeFileSync('topics/point-ai-03-data/long.json', JSON.stringify(spec, null, 2) + '\n');
const words = scenes.reduce((a, s) => a + s.narration.split(/\s+/).length, 0);
console.log(`wrote topics/point-ai-03-data/long.json — ${scenes.length} scenes, ${words} words ` +
  `(~${Math.round(words / 2.5)}s ≈ ${Math.floor(words / 150)}m${String(Math.round((words / 2.5) % 60)).padStart(2, '0')}s)`);
