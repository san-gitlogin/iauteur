#!/usr/bin/env node
// BUILD — topics/allure-ai-02-open-it-back-up/long.json
//
// ALLURE AI, CHAPTER 2 — one folder squashed into one file, and a decoder that opens it.
//
// Every number spoken here was measured on THIS machine (LAW 0m), not taken from the doc:
//   raw JSON 965,820 chars · gzip 647,981 bytes · base64 863,976 chars
//   (the doc, written on another machine, says 660,296 and 880,396 — unused here)
//   decode: 10 test cases, passed 7 / failed 1 / broken 1 / skipped 1, reason AssertionError
//   gzip by kind: result JSON 19% · jpg 81% · png 95% · zip 99% of original
//   the folder is 22 files: 10 *-result.json + 12 *-attachment.*
import fs from 'node:fs';

const CH = 'THE NBX STUDIO';
const SLUG = 'allure-ai-02-open-it-back-up';

const normw = (w) => String(w).toLowerCase().replace(/[^a-z0-9]/g, '');
const at = (narration, word, nth = 1) => {
  const ws = narration.split(/\s+/).map(normw);
  const want = normw(word);
  let seen = 0;
  for (let i = 0; i < ws.length; i++) if (ws[i] === want && ++seen === nth) return i + 1;
  throw new Error(`anchor ${JSON.stringify(word)} (#${nth}) not found in: ${narration.slice(0, 90)}…`);
};
const atFrac = (n, f) => Math.max(1, Math.round(n.trim().split(/\s+/).length * f));

const TRANS = ['fade', 'push', 'slide', 'zoom', 'wipe', 'dip', 'morph', 'iris'];
const BG = ['zoneA', 'zoneB', 'zoneC'];
let i = 0;
const scenes = [];
const scene = (type, narration, data, extra = {}) => {
  const s = {id: `s${String(i + 1).padStart(2, '0')}`, type, narration,
             transition: TRANS[i % TRANS.length], background: BG[i % BG.length], data, ...extra};
  i++;
  return s;
};
const chapter = (narration, number, title, subtitle) =>
  scene('CHAPTER', narration, {chapter: {number: String(number).padStart(2, '0'), title, subtitle}});
const rec = (narration, caption, premise, clips, extra = {}) =>
  scene('RECORDED_STEP', narration, {
    recordedStep: {caption, premise, layout: 'full', color: 'blue', clips, ...extra},
  });
const intent = (o = {}) => {
  const move = (e) => (e && e.atWord != null ? {...e, wantAtWord: e.atWord, atWord: undefined} : e);
  const out = {...o};
  if (o.callouts) out.callouts = o.callouts.map(move);
  if (o.zooms) out.zooms = o.zooms.map(move);
  return out;
};
const A = (id, label, opts = {}) => ({ref: `rec:allure-02#${id}`, label, focus: true, ...intent(opts)});
const stage = (narration, kind, data) => scene('ALLURE_STAGE', narration, {allureStage: {kind, ...data}});
const diagram = (n, d) => scene('DIAGRAM', n, {diagram: {layout: 'tree', ...d}});
const list    = (n, heading, items) => scene('LIST_BUILD', n, {heading, items});
const compare = (n, d) => scene('SPEC_COMPARE', n, {compare: d});
const layers  = (n, d) => scene('LAYERED_STACK', n, {stack: {signal: 'down', ...d}});
const tree    = (n, d) => scene('FILE_TREE', n, {fileTree: d});
const table   = (n, d) => scene('DATABASE_TABLE', n, {database: d});
const logs    = (n, d) => scene('LOG_STREAM', n, {logs: d});

// ═══ OPENING ═════════════════════════════════════════════════════════════════
{
  const n = "An Allure run leaves twenty-two files. " +
            "We squash them into one, then write the decoder that opens it.";
  scenes.push(scene('HOOK', n, {
    headline: 'ALLURE, PACKED INTO ONE FILE',
    subtext: 'gzip, base64, and a decoder you write',
    hookVariant: 'statement',
    headlineAtWord: at(n, 'Allure'),
  }));
}

{
  const n =
    `Welcome back to ${CH}. ` +
    "Last time we produced a folder of test evidence and rendered it as a report. " +
    "Today we do the thing every reporting tool does and nobody explains: " +
    "we take that entire folder and squash it into one single file, " +
    "and then we write the code that opens it back up into real Python objects. " +
    "Everything today is the standard library. There is nothing to install at all.";
  scenes.push(scene('TITLE_CARD', n, {
    title: 'What is inside a report, and how to open it',
    subtitle: 'gzip, base64, and a decoder written from nothing',
  }));
}

{
  const n =
    "Here is the problem, before any code. " +
    "A single run left twenty-two separate files on disk. " +
    "Ten result files, one per scenario, " +
    "and twelve attachment files holding the screenshots, the tables and the archive. " +
    "Now try to send that to somebody. " +
    "You cannot attach a folder to a message. " +
    "You cannot drop twenty-two files into a chat and expect anyone to keep them together. " +
    "And a build server that stores test output somewhere " +
    "would much rather store one thing than twenty-two. " +
    "So every reporting tool you have ever used does the same trick: " +
    "it packs the whole folder into one file. " +
    "Watch them go in.";
  scenes.push(stage(n, 'files-merge', {
    headline: 'Twenty-two files, [one destination]',
    caption: 'why anything gets packed',
    premise: 'Every file from the run travels into a single document. The count underneath is what has actually arrived.',
    color: 'blue',
    atWord: 1,
    cells: Array.from({length: 22}, (_, k) => ({
      label: k < 10 ? 'result.json' : 'attachment',
      color: k < 10 ? 'green' : 'purple',
      // spread the tiles across the tail of the read, never past its last word
      atWord: Math.min(at(n, 'trick') + Math.round(k * 0.55), atFrac(n, 0.97)),
    })),
  }));
}

// ═══ CHAPTER 1 — what we are starting from ═══════════════════════════════════
scenes.push(chapter(
  "Let's look at the folder we are packing, and count what is actually in it.",
  1, 'The folder from last time', 'ten results, twelve attachments'));

{
  const n =
    "This is chapter one's output, sitting where it was left. " +
    "One command counts it: twenty-two files. " +
    "That number matters more than it looks, " +
    "because it is the number we have to get back out at the end. " +
    "If the decoder returns twenty-one, something was dropped, " +
    "and a decoder that quietly drops things is worse than one that crashes — " +
    "you would never know to go looking.";
  scenes.push(rec(n, 'twenty-two files, counted',
    'The results folder from chapter one, exactly as it was left.',
    [A('look', 'twenty-two files', {wantAtWord: at(n, 'command'),
       callouts: [{text: 'the number we must get back', mark: 'count', side: 'right',
                   color: 'blue', atWord: at(n, 'looking')}]})]));
}

{
  const n =
    "Drawn out, the folder is flat and boring, and that is the point. " +
    "One directory. No subfolders, no index, no manifest listing what is inside. " +
    "Just files whose names encode what they are: " +
    "something dash result dot json, or something dash attachment dot png. " +
    "Every tool that reads Allure results reads exactly this — " +
    "there is no hidden state and no database behind it. " +
    "Which is precisely why a hundred and forty line Python script " +
    "can do what the official Java tool does.";
  scenes.push(tree(n, {
    headline: 'One folder, [no hidden state]',
    atWord: at(n, 'flat'),
    highlight: 1,
    nodes: [
      {name: 'allure-results-bdd', depth: 0, kind: 'folder', color: 'blue',
       atWord: at(n, 'directory')},
      {name: '*-result.json  x10', depth: 1, kind: 'file', color: 'green',
       atWord: at(n, 'result')},
      {name: '*-attachment.*  x12', depth: 1, kind: 'file', color: 'purple',
       atWord: at(n, 'attachment')},
      {name: 'no index, no manifest', depth: 1, kind: 'file', color: 'orange',
       atWord: at(n, 'manifest')},
    ],
  }));
}

{
  const n =
    "And broken down by kind, it is ten and twelve. " +
    "Ten result files — one per scenario, holding the name, the outcome, " +
    "the steps, and a pointer to each piece of evidence. " +
    "Twelve attachment files holding the evidence itself: " +
    "four HTML snippets, and one each of png, jpg, csv, txt, json, xml, yaml and zip. " +
    "Notice the two halves have completely different characters. " +
    "The result files are small and repetitive text. " +
    "The attachments are large and mostly binary. " +
    "Hold on to that, because in about five minutes " +
    "it turns out to be the most important fact in the chapter.";
  scenes.push(rec(n, 'ten results, twelve attachments',
    'The same folder, counted by file kind.',
    [A('kinds', 'two halves, two characters', {wantAtWord: at(n, 'broken'),
       callouts: [{text: 'small repetitive text', mark: 'results', side: 'right',
                   color: 'green', atWord: at(n, 'repetitive')},
                  {text: 'large and mostly binary', mark: null, side: 'top',
                   color: 'orange', atWord: at(n, 'binary')}]})]));
}

{
  const n =
    "Those two halves are worth naming properly, " +
    "because everything that happens next treats them differently. " +
    "The result files are JSON: braces, quotes, and the same field names " +
    "repeated in every single file. " +
    "The word status appears dozens of times. So does name, and steps, and attachments. " +
    "The attachments are the opposite: " +
    "a PNG is already a compressed format, " +
    "a JPEG is already a compressed format, " +
    "and a zip is compression by definition. " +
    "Repetitive text on one side, and bytes that have already been squeezed on the other.";
  scenes.push(compare(n, {
    headline: 'Two halves, [two natures]',
    source: 'the 22 files in allure-results-bdd, measured on this machine',
    atWord: at(n, 'naming'),
    a: {name: 'result JSON', color: 'green'},
    b: {name: 'attachments', color: 'orange'},
    rows: [
      {label: 'what it is', a: 'text', b: 'bytes', winner: 'tie', atWord: at(n, 'JSON')},
      {label: 'repeats itself', a: 'constantly', b: 'never', winner: 'tie', atWord: at(n, 'repeated')},
      {label: 'already squeezed', a: 'no', b: 'yes', winner: 'tie', atWord: at(n, 'compressed')},
      {label: 'size on disk', a: 'small', b: 'large', winner: 'tie', atWord: at(n, 'squeezed')},
    ],
  }));
}

// ═══ CHAPTER 2 — the five-step trick ═════════════════════════════════════════
scenes.push(chapter(
  "Now the packer. The whole trick is five steps, and they fit on one screen.",
  2, 'The five-step trick', 'gather, compress, encode, hide'));

{
  const n =
    "Before a line of code, here is the shape of what we are about to write, " +
    "because once you have seen it you have seen every single-file format there is. " +
    "Step one, gather: read every file into one Python dictionary. " +
    "Step two, serialise: turn that dictionary into JSON text. " +
    "Step three, compress: squeeze the text with gzip. " +
    "Step four, encode: turn the squeezed bytes into base sixty four, " +
    "which is text made only of safe, ordinary characters. " +
    "Step five, hide: drop that text inside a script tag in an HTML file. " +
    "Gather, serialise, compress, encode, hide. " +
    "That is the whole idea, and the decoder later is those same five steps backwards.";
  scenes.push(list(n, 'Five steps, and no magic', [
    {text: '1 · gather into one dictionary', atWord: at(n, 'gather')},
    {text: '2 · serialise to JSON text', atWord: at(n, 'serialise')},
    {text: '3 · compress with gzip', atWord: at(n, 'compress')},
    {text: '4 · encode as base64', atWord: at(n, 'encode')},
    {text: '5 · hide inside a script tag', atWord: at(n, 'hide')},
  ]));
}

{
  const n =
    "And the same five steps as a pipeline, " +
    "because the shape is what you want to remember, not the words. " +
    "A folder goes in. It becomes one dictionary. " +
    "The dictionary becomes text. " +
    "The text becomes compressed bytes. " +
    "The bytes become safe text again. " +
    "And that text goes inside a page. " +
    "Every arrow is reversible, which is the only reason a decoder is possible at all. " +
    "If any step threw information away, " +
    "the second half of this chapter could not exist.";
  scenes.push(diagram(n, {
    nodes: [
      {id: 'dir', label: 'the folder', sub: '22 files', color: 'blue', atWord: at(n, 'folder')},
      {id: 'dict', label: 'one dictionary', sub: 'results + attachments', color: 'purple',
       parent: 'dir', atWord: at(n, 'dictionary')},
      {id: 'json', label: 'JSON text', sub: 'one long string', color: 'green',
       parent: 'dict', atWord: at(n, 'text')},
      {id: 'gz', label: 'gzip bytes', sub: 'smaller, unreadable', color: 'orange',
       parent: 'json', atWord: at(n, 'compressed')},
      {id: 'b64', label: 'base64 text', sub: 'safe to embed', color: 'blue',
       parent: 'gz', atWord: at(n, 'safe')},
      {id: 'html', label: 'bundle.html', sub: 'one file', color: 'green',
       parent: 'b64', atWord: at(n, 'page')},
    ],
  }));
}

{
  const n =
    "New file, and it opens with the docstring that says exactly that. " +
    "I want you to read it rather than skip it, " +
    "because the last paragraph is the point of the whole chapter: " +
    "nothing here is unique to Allure. " +
    "This is the same idea behind every single-file format you will ever meet — " +
    "a saved web page, a notebook with its outputs, a crash report with its logs attached. " +
    "Learn it once here on something small, " +
    "and you will recognise it everywhere afterwards. " +
    "And notice the shape of the docstring itself. " +
    "It opens with what the file does in one sentence. " +
    "Then the five steps, numbered, in the order they happen. " +
    "Then a usage line showing exactly how to run it. " +
    "That is a template you can copy for anything you write. " +
    "Somebody opening this file — including you, months from now — " +
    "gets the what, the how and the command " +
    "before reading a single line of Python. " +
    "Most files make you read the code to find out what the code is for, " +
    "and that is a tax you pay every time you come back to it. " +
    "Twenty-five lines of English at the top " +
    "is the cheapest documentation there is, " +
    "because it lives in the same file and moves when the file moves. " +
    "One more thing before the code. " +
    "Notice that the docstring says what this is NOT, as well as what it is. " +
    "It says nothing here is unique to Allure. " +
    "Telling a reader what a thing is not " +
    "is often more useful than another sentence about what it is, " +
    "because it heads off the wrong assumption before they make it.";
  scenes.push(rec(n, 'the trick, written down first',
    'The packer, and the five steps stated in English at the top of it.',
    [A('openpack', 'a new file'),
     A('pk1', 'five steps, in English', {wantAtWord: at(n, 'docstring'),
       callouts: [{text: 'not an Allure thing — a general one', mark: null, side: 'top',
                   color: 'green', atWord: at(n, 'everywhere')}]})]));
}

{
  const n =
    "Four imports, and every one of them ships with Python. " +
    "argparse reads the command line. " +
    "base sixty four does step four. " +
    "gzip does step three. " +
    "json does step two. " +
    "And Path, from pathlib, walks the folder for step one. " +
    "Look at what is missing from that list: there is no pip install in this chapter at all. " +
    "The entire single-file trick is built from things " +
    "that were already on your machine the day you installed Python.";
  scenes.push(rec(n, 'four imports, nothing installed',
    'Every import in the packer, and none of them third-party.',
    [A('pk2', 'all standard library', {wantAtWord: at(n, 'imports'),
       callouts: [{text: 'no pip install anywhere', mark: 'gzip', side: 'right',
                   color: 'green', atWord: at(n, 'missing')}]})]));
}

{
  const n =
    "Step one, and it is the longest of the five. " +
    "collect bundle builds one dictionary with two keys: " +
    "results, which is a list, and attachments, which is a map. " +
    "For every result file, we load the JSON and append it to the list. " +
    "For every attachment file, we read the raw bytes " +
    "and store them under the file's name. " +
    "But look at what happens to those bytes on the way in: " +
    "they get base sixty four encoded immediately. " +
    "That is because the whole thing has to become JSON in step two, " +
    "and JSON has no way to hold raw bytes at all. " +
    "It holds text, numbers, lists and maps, and that is the entire list. " +
    "So the bytes become text here, at the door, " +
    "or they could never go into the bundle in the first place.";
  scenes.push(rec(n, 'one dictionary, everything in it',
    'Reading every result and every attachment into a single structure.',
    [A('pk3', 'bytes become text', {wantAtWord: at(n, 'collect'),
       zooms: [{mark: 'b64line', atWord: at(n, 'immediately')}],
       callouts: [{text: 'JSON cannot hold raw bytes', mark: 'b64line', side: 'right',
                   color: 'orange', atWord: at(n, 'list', 3)}]})]));
}

{
  const n =
    "The dictionary it builds has exactly two keys, and they are not symmetrical. " +
    "results is a list — order matters, and there can be ten of them. " +
    "attachments is a map from file name to encoded data, " +
    "because a result file refers to its evidence by name, " +
    "and a map is how you look something up by name. " +
    "That choice is worth noticing. " +
    "If attachments had been a list too, " +
    "every lookup would mean scanning the whole thing. " +
    "The structure you choose here decides how the decoder reads later, " +
    "and picking the right one costs nothing at the time.";
  scenes.push(table(n, {
    headline: 'Two keys, [two shapes]',
    tableName: 'the bundle dict',
    query: 'a list for order, a map for names',
    columns: ['key', 'shape', 'why'],
    rows: [
      ['results', 'list', 'order matters'],
      ['attachments', 'map', 'found by name'],
    ],
    highlight: [0, 1],
    highlightAtWords: [at(n, 'results'), at(n, 'attachments')],
    atWord: at(n, 'keys'),
  }));
}

{
  const n =
    "That last point deserves its own picture, " +
    "because it is the reason base sixty four exists at all. " +
    "JSON can hold exactly four kinds of thing: " +
    "text, numbers, true and false, and lists and maps made of those. " +
    "Raw bytes are not on the list. " +
    "A screenshot is four hundred thousand bytes, " +
    "many of which are not printable characters and some of which would break the file. " +
    "So we rewrite those bytes using sixty four characters that are always safe — " +
    "the letters, the digits, plus and slash. " +
    "The result is text, and text goes into JSON without complaint. " +
    "It costs about a third more space, and it buys the ability to travel at all.";
  scenes.push(layers(n, {
    headline: 'Why bytes [become letters]',
    atWord: at(n, 'picture'),
    layers: [
      {label: 'a PNG on disk', sub: 'raw bytes, not all printable', color: 'orange',
       atWord: at(n, 'bytes')},
      {label: 'base64', sub: '64 always-safe characters', color: 'purple',
       atWord: at(n, 'rewrite')},
      {label: 'a JSON string', sub: 'travels anywhere text travels', color: 'green',
       atWord: at(n, 'text', 3)},
    ],
  }));
}

{
  const n =
    "Steps two, three and four, and they are three lines. " +
    "json dot dumps turns the dictionary into one long string of text. " +
    "gzip dot compress squeezes that text into bytes. " +
    "And base sixty four encodes those bytes back into text. " +
    "Read that sequence again, because there is something odd in it: " +
    "we turn text into bytes, and then immediately turn the bytes back into text. " +
    "That looks like a round trip that achieves nothing. " +
    "It is not. " +
    "The text that comes out is a fraction of the size of the text that went in, " +
    "and in a moment we will watch exactly how much.";
  scenes.push(rec(n, 'json, then gzip, then base64',
    'The three lines that do the compressing and the encoding.',
    [A('pk4', 'text, bytes, text again', {wantAtWord: at(n, 'dumps'),
       zooms: [{mark: 'compress', atWord: at(n, 'squeezes')}],
       callouts: [{text: 'text -> bytes -> text', mark: 'compress', side: 'right',
                   color: 'blue', atWord: at(n, 'odd')}]})]));
}

{
  const n =
    "Three transformations, stacked. " +
    "At the bottom, a Python dictionary — a live object in memory. " +
    "Above it, JSON text: the same information, written down as characters. " +
    "Above that, compressed bytes: the same information again, " +
    "with the repetition folded away. " +
    "And on top, base sixty four: the same information once more, " +
    "written in characters that survive anywhere. " +
    "Four representations of one thing. " +
    "Nothing was added and nothing was lost at any layer, " +
    "which is exactly why every arrow can be walked backwards.";
  scenes.push(layers(n, {
    headline: 'One thing, [four representations]',
    atWord: at(n, 'transformations'),
    layers: [
      {label: 'base64 text', sub: 'survives an HTML file', color: 'blue',
       atWord: at(n, 'sixty')},
      {label: 'gzip bytes', sub: 'repetition folded away', color: 'orange',
       atWord: at(n, 'compressed')},
      {label: 'JSON text', sub: 'written as characters', color: 'green',
       atWord: at(n, 'JSON')},
      {label: 'a Python dict', sub: 'a live object', color: 'purple',
       atWord: at(n, 'dictionary')},
    ],
  }));
}

{
  const n =
    "And then the three print lines, which are the reason this script teaches anything. " +
    "It could have done its job silently. " +
    "Instead it prints the size at each stage, " +
    "so the person running it can see what the compression actually bought. " +
    "This is a small habit worth stealing: " +
    "when your code does something whose effect is invisible, " +
    "print the number that makes it visible. " +
    "Then the script stops being a black box you trust " +
    "and starts being a thing you can reason about, " +
    "and argue with when the number looks wrong. " +
    "The three lines cost nothing to write " +
    "and they are the reason the next two minutes of this video " +
    "are about real measurements instead of a claim that compression helps. " +
    "Print the number. It is almost always worth it.";
  scenes.push(rec(n, 'print what would be invisible',
    'Three print lines that turn compression into something you can see.',
    [A('pk5', 'the numbers, on purpose', {wantAtWord: at(n, 'print'),
       callouts: [{text: 'make the invisible measurable', mark: 'scripttag', side: 'right',
                   color: 'purple', atWord: at(n, 'visible')}]})]));
}

{
  const n =
    "Step five, and it is almost an anticlimax. " +
    "We write an ordinary HTML page with a paragraph explaining what it is, " +
    "and then one script tag with our base sixty four text inside it. " +
    "Two details are doing real work there. " +
    "The tag has an id, report dash bundle, " +
    "which is how the decoder will find it later. " +
    "And its type is application slash octet dash stream, " +
    "which tells a browser: this is not JavaScript, do not try to run it. " +
    "Without that type, a browser would attempt to execute " +
    "eight hundred thousand characters of base sixty four as code. " +
    "Then main, and argparse, and the file is done.";
  scenes.push(rec(n, 'hidden inside a script tag',
    'The container, and the two attributes that make it work.',
    [A('pk6', 'an id, and a type', {wantAtWord: at(n, 'HTML'),
       callouts: [{text: 'do not run this as JavaScript', mark: null, side: 'top',
                   color: 'red', atWord: at(n, 'execute')}]}),
     A('savepack', 'saved', {wantAtWord: atFrac(n, 0.93)})]));
}

{
  const n =
    "So the finished file has three parts, and only one of them is data. " +
    "A head, with a title. " +
    "A paragraph in plain English telling whoever opens it what this is " +
    "and which script will open it back up. " +
    "And the script tag carrying the payload. " +
    "That middle part is a courtesy that costs four lines. " +
    "Somebody will double-click this file two years from now, " +
    "see a blank-looking page, and wonder if it is corrupt. " +
    "Four lines of English is the difference between " +
    "a file they throw away and a file they can use.";
  scenes.push(layers(n, {
    headline: 'Three parts, [one is the data]',
    atWord: at(n, 'parts'),
    layers: [
      {label: '<head> and title', sub: 'so it opens as a page', color: 'blue',
       atWord: at(n, 'head')},
      {label: 'a paragraph of English', sub: 'what this is, how to open it', color: 'green',
       atWord: at(n, 'paragraph')},
      {label: '<script id=report-bundle>', sub: 'the payload', color: 'purple',
       atWord: at(n, 'payload')},
    ],
  }));
}

// ═══ CHAPTER 3 — run it, and watch the sizes ═════════════════════════════════
scenes.push(chapter(
  "Run it, and the three numbers it prints are the lesson of this chapter.",
  3, 'Three numbers', 'what compression actually did'));

{
  const n =
    "One command, and three numbers come back. " +
    "The raw JSON is nine hundred and sixty five thousand, eight hundred and twenty characters. " +
    "Almost a million. " +
    "Gzip takes that down to six hundred and forty seven thousand, nine hundred and eighty one bytes. " +
    "And base sixty four brings it back up " +
    "to eight hundred and sixty three thousand, nine hundred and seventy six characters. " +
    "Read those three again in order, " +
    "because the middle one goes down and the last one goes up, " +
    "and almost everybody expects both of them to go down.";
  scenes.push(rec(n, 'three numbers, one command',
    'The packer, run over chapter one\'s results folder.',
    [A('pack', 'down, then back up', {wantAtWord: at(n, 'command'),
       zooms: [{mark: 'gz', atWord: at(n, 'Gzip')}],
       callouts: [{text: 'this one goes UP', mark: 'b64', side: 'right',
                   color: 'orange', atWord: at(n, 'up', 2)}]})]));
}

{
  const n =
    "Those three lines are the script talking to you, " +
    "and each one is a different kind of number. " +
    "The first is characters of text — " +
    "what the whole folder looks like once it is written out as JSON. " +
    "The second is bytes, not characters, " +
    "because after gzip it is no longer text at all. " +
    "The third is characters again, " +
    "because base sixty four turned it back into something you could type. " +
    "Characters, bytes, characters. " +
    "The unit changing is the clue that the data changed form, " +
    "not just size.";
  scenes.push(logs(n, {
    rate: 'the packer',
    highlight: 1,
    atWord: at(n, 'lines'),
    lines: [
      {level: 'info', tag: 'characters', text: 'Raw JSON size:        965,820',
       atWord: at(n, 'first')},
      {level: 'warn', tag: 'BYTES', text: 'Gzip-compressed size: 647,981',
       atWord: at(n, 'second')},
      {level: 'info', tag: 'characters', text: 'Base64 (final) size:  863,976',
       atWord: at(n, 'third')},
    ],
  }));
}

{
  const n =
    "Drawn to scale, the shape is obvious. " +
    "The bar starts at nine hundred and sixty five thousand. " +
    "Gzip cuts it to six hundred and forty eight thousand — " +
    "about a third gone. " +
    "And then base sixty four adds a third back on, " +
    "landing at eight hundred and sixty four thousand. " +
    "So we ended up smaller than we started, but only just. " +
    "The obvious question is why bother with the last step at all, " +
    "if it undoes most of the saving. " +
    "The answer is that the two steps are not doing the same job. " +
    "One is about size. The other is about survival.";
  scenes.push(stage(n, 'size-bar', {
    headline: 'Down a third, [then up a third]',
    caption: 'measured on this machine',
    premise: 'The same data at three stages. Each bar is drawn from the real number, so the shape cannot flatter the story.',
    color: 'blue',
    atWord: 1,
    cells: [
      {label: 'raw JSON', value: 965820, sub: 'characters', color: 'blue',
       atWord: at(n, 'starts')},
      {label: 'after gzip', value: 647981, sub: 'bytes', color: 'green',
       atWord: at(n, 'cuts')},
      {label: 'after base64', value: 863976, sub: 'characters', color: 'orange',
       atWord: at(n, 'landing')},
    ],
  }));
}

{
  const n =
    "So here is the distinction that trips up almost everyone. " +
    "gzip is compression. Its job is to make the thing smaller, " +
    "and it does that by noticing repetition and writing it down once. " +
    "base sixty four is not compression. It has never compressed anything. " +
    "Its job is to let bytes survive a journey through a place that only accepts text — " +
    "an HTML file, an email body, a JSON string, a URL. " +
    "It always makes data bigger, by about a third, and that is the fare for the journey. " +
    "If you remember one sentence from this chapter, " +
    "make it this one: gzip is for size, base sixty four is for transport.";
  scenes.push(compare(n, {
    headline: 'One shrinks, [one travels]',
    source: 'RFC 1952 (gzip) and RFC 4648 (base64)',
    atWord: at(n, 'distinction'),
    a: {name: 'gzip', color: 'green'},
    b: {name: 'base64', color: 'orange'},
    rows: [
      {label: 'what it is for', a: 'size', b: 'transport', winner: 'tie', atWord: at(n, 'compression')},
      {label: 'effect on size', a: 'smaller', b: '+33%', winner: 'a', atWord: at(n, 'bigger')},
      {label: 'output', a: 'bytes', b: 'safe text', winner: 'tie', atWord: at(n, 'text')},
      {label: 'reversible', a: 'yes', b: 'yes', winner: 'tie', atWord: at(n, 'fare')},
    ],
  }));
}

{
  const n =
    "And now the fact I asked you to hold on to. " +
    "Gzip only took a third off, and a third is a disappointing number for text. " +
    "So let's ask why, by running gzip over each kind of file separately. " +
    "The result files compress to nineteen percent of their original size — " +
    "they lose four fifths, which is what repetitive text is supposed to do. " +
    "The JPEG only gets down to eighty one percent. " +
    "The PNG barely moves, at ninety five percent. " +
    "And the zip file lands at ninety nine percent — " +
    "gzip found essentially nothing to do. " +
    "That is the whole explanation. " +
    "Our bundle is mostly screenshots, and screenshots are already compressed. " +
    "Compressing compressed data is work with almost no reward, " +
    "and it is one of the most common wasted steps in software.";
  scenes.push(stage(n, 'compression-ratio', {
    headline: 'Why a third, [and not four fifths]',
    caption: 'gzip, measured per file kind',
    premise: 'Each bar is what SURVIVES compression. Short is good. The already-compressed files barely move.',
    color: 'green',
    atWord: 1,
    cells: [
      {label: 'result JSON', value: 19, sub: 'repetitive text — four fifths gone',
       color: 'green', atWord: at(n, 'nineteen')},
      {label: '.jpg', value: 81, sub: 'already compressed', color: 'orange',
       atWord: at(n, 'JPEG')},
      {label: '.png', value: 95, sub: 'already compressed', color: 'orange',
       atWord: at(n, 'PNG')},
      {label: '.zip', value: 99, sub: 'compression, compressed again', color: 'red',
       atWord: at(n, 'zip')},
    ],
  }));
}

{
  const n =
    "There is a practical rule in that table. " +
    "Before you add compression to anything, ask what the data actually is. " +
    "Logs, JSON, HTML, CSV, source code — all repetitive text, all compress beautifully. " +
    "Images, video, audio, archives, anything ending in a format you recognise as compressed — " +
    "you will spend processor time and get almost nothing back. " +
    "Plenty of systems gzip every response they send, " +
    "including the images, and pay for it on every single request forever.";
  scenes.push(list(n, 'Compress this, not that', [
    {text: 'worth it — JSON, logs, HTML, CSV, code', atWord: at(n, 'Logs')},
    {text: 'wasted — png, jpg, mp4, zip', atWord: at(n, 'Images')},
    {text: 'the cost is paid on every request', atWord: at(n, 'forever')},
  ]));
}

{
  const n =
    "There is a second reading of that table, " +
    "and it explains something you have probably wondered about. " +
    "Why is a zip of your holiday photos barely smaller than the photos? " +
    "Because JPEG already did the compressing. " +
    "Why does zipping a folder of source code save so much? " +
    "Because code is text, and text repeats itself constantly. " +
    "And why do video files not compress at all? " +
    "Same answer: the format already spent enormous effort " +
    "removing every redundancy it could find. " +
    "Compression works by finding repetition. " +
    "If something has already been through that, there is no repetition left to find.";
  scenes.push(diagram(n, {
    nodes: [
      {id: 'rep', label: 'repetition', sub: 'what compression eats', color: 'blue',
       atWord: at(n, 'repetition')},
      {id: 'text', label: 'text and code', sub: 'full of it — shrinks', color: 'green',
       parent: 'rep', atWord: at(n, 'code')},
      {id: 'media', label: 'jpeg, mp4, zip', sub: 'already eaten', color: 'red',
       parent: 'rep', atWord: at(n, 'video')},
    ],
  }));
}

{
  const n =
    "The file itself is on disk now, and it is about eight hundred and sixty kilobytes. " +
    "One file. You can attach that to an email, " +
    "drop it in a chat, or hand it to a build server as a single artefact. " +
    "That was the entire goal, and it is done in eighty three lines.";
  scenes.push(rec(n, 'one file, on disk',
    'The bundle, sitting in the folder as a single artefact.',
    [A('bundlesize', 'one file, 860 KB', {wantAtWord: at(n, 'disk')})]));
}

{
  const n =
    "And if you open it expecting to read something, you get this. " +
    "A short paragraph telling you what the file is, " +
    "and then a wall of base sixty four that means nothing to a human eye. " +
    "That is not a failure — it is the point. " +
    "The data is intact and complete, " +
    "it is simply in a form built for travelling rather than for reading. " +
    "Which is exactly why the second half of this chapter exists. " +
    "A format nobody can open is not a format, it is a hole. " +
    "So we are going to write the thing that opens it.";
  scenes.push(rec(n, 'unreadable, on purpose',
    'The head of the bundle: a human note, and then the payload.',
    [A('peek', 'built to travel', {wantAtWord: at(n, 'open'),
       callouts: [{text: 'intact, just not readable', mark: 'notice', side: 'right',
                   color: 'blue', atWord: at(n, 'travelling')}]})]));
}

{
  const n =
    "So here is the whole chapter in one picture, " +
    "and the second half is about to be the mirror of the first. " +
    "Going right, we gathered, serialised, compressed, encoded and hid. " +
    "Coming back, we will find, decode, decompress, parse and build. " +
    "Each step on the way back undoes exactly one step on the way out, " +
    "in the opposite order. " +
    "That mirror is not a coincidence — it is the definition of a format. " +
    "If you can describe your packing as an ordered list of reversible steps, " +
    "you have already designed the unpacker.";
  scenes.push(compare(n, {
    headline: 'Out, [and back]',
    source: 'build_single_file_report.py and decode_report.py',
    atWord: at(n, 'picture'),
    a: {name: 'packing', color: 'orange'},
    b: {name: 'unpacking', color: 'green'},
    rows: [
      {label: 'the folder', a: 'gather', b: 'build objects', winner: 'tie', atWord: at(n, 'gathered')},
      {label: 'the text', a: 'json.dumps', b: 'json.loads', winner: 'tie', atWord: at(n, 'serialised')},
      {label: 'the size', a: 'gzip', b: 'gunzip', winner: 'tie', atWord: at(n, 'compressed')},
      {label: 'the transport', a: 'b64encode', b: 'b64decode', winner: 'tie', atWord: at(n, 'encoded')},
      {label: 'the container', a: 'write tag', b: 'find tag', winner: 'tie', atWord: at(n, 'hid')},
    ],
  }));
}

// ═══ CHAPTER 4 — decide the shape before writing the decoder ═════════════════
scenes.push(chapter(
  "Now the decoder. And the first thing to decide is not code — it is a shape.",
  4, 'The shape, first', 'three classes, three levels'));

{
  const n =
    "Before we write a decoder, we decide what it should produce. " +
    "Not vaguely — precisely. " +
    "A report is a list of test cases. " +
    "Each test case has a name, a status, " +
    "and a failure message when something went wrong. " +
    "Each test case holds steps, and each step has its own name and status. " +
    "And each step holds attachments, " +
    "which have a name, a type, and the actual bytes. " +
    "Three levels, and that is the whole model. " +
    "This shape is not just for today. " +
    "It is the shape chapter three stores into a database, " +
    "chapter five serves over HTTP, " +
    "and chapter eight hands to a language model. " +
    "Getting it right here is worth ten minutes now " +
    "and saves a rewrite in four chapters' time.";
  scenes.push(stage(n, 'nested-boxes', {
    headline: 'Three levels, [decided first]',
    caption: 'used by every later chapter',
    premise: 'A TestCase holds Steps. A Step holds Attachments. Everything after this chapter is built on these three boxes.',
    color: 'purple',
    atWord: 1,
    cells: [
      {label: 'TestCase', sub: 'name, status, failure', color: 'blue', atWord: at(n, 'case')},
      {label: 'Step', sub: 'name, status', color: 'purple', atWord: at(n, 'steps')},
      {label: 'Attachment', sub: 'name, type, bytes', color: 'green', atWord: at(n, 'attachments')},
    ],
  }));
}

{
  const n =
    "Second file. It opens with the same courtesy as the first: " +
    "a docstring that draws the shape in text, " +
    "so anyone opening this file knows what it produces before reading a line of code. " +
    "Then the imports. " +
    "Seven this time, and again every one is standard library. " +
    "re is new — that is regular expressions, for finding the script tag. " +
    "dataclass is new too, and it is about to save us thirty lines. " +
    "And Optional, from typing, which is how you say " +
    "this field holds a string, or it holds nothing at all. " +
    "That matters here because a passing test has no failure message, " +
    "and the type should say so rather than pretending " +
    "every test has one and leaving it empty. " +
    "Read the docstring's little diagram once more before we start typing. " +
    "Report, holding test cases, holding steps, holding attachments. " +
    "Four words, and they are the whole architecture of the next six chapters. " +
    "Notice the file does that drawing in plain text, with arrows made of dashes. " +
    "There is no diagram tool involved and nothing to keep in sync. " +
    "A shape you can draw in six lines of a docstring " +
    "is a shape simple enough to be worth having.";
  scenes.push(rec(n, 'the shape, stated in the file',
    'The decoder, and the model drawn in its docstring.',
    [A('opendec', 'the second file'),
     A('dc1', 'seven built-in imports', {wantAtWord: at(n, 'docstring'),
       callouts: [{text: 're for finding, dataclass for holding', mark: null,
                   side: 'top', color: 'purple', atWord: at(n, 'lines')}]})]));
}

{
  const n =
    "Field by field, this is the model. " +
    "A TestCase carries a name, a status, " +
    "and two optional strings for the failure message and the traceback. " +
    "A Step carries a name and a status. " +
    "An Attachment carries a name, a mime type, and bytes. " +
    "Count the fields: nine, across three classes. " +
    "Nine fields is small enough to hold in your head, " +
    "and that is deliberate. " +
    "A model you can recite is a model you use correctly. " +
    "One you have to look up is one you will guess at.";
  scenes.push(table(n, {
    headline: 'Nine fields, [three classes]',
    tableName: 'decode_report.py',
    query: 'small enough to recite from memory',
    columns: ['class', 'fields', 'holds'],
    rows: [
      ['TestCase', 'name, status, +2', 'one scenario'],
      ['Step', 'name, status', 'one step'],
      ['Attachment', 'name, type, data', 'the bytes'],
    ],
    highlight: [0, 1, 2],
    highlightAtWords: [at(n, 'TestCase'), at(n, 'Step'), at(n, 'Attachment')],
    atWord: at(n, 'model')
  }));
}

{
  const n =
    "Three classes, and look how little there is to them. " +
    "An Attachment is a name, a mime type, and some bytes. " +
    "A Step is a name, a status, and a list of attachments. " +
    "A TestCase is a name, a status, two optional failure fields, and a list of steps. " +
    "The at dataclass line above each one is doing real work. " +
    "Normally you would write an init method that takes those arguments " +
    "and assigns each one to self, " +
    "plus a repr so printing the object shows something useful, " +
    "plus an equals so two identical objects compare as equal. " +
    "That is thirty-odd lines of code that says nothing interesting. " +
    "dataclass writes all of it from the field names alone. " +
    "One other detail worth catching: " +
    "field with default factory list, rather than just an empty list. " +
    "A plain empty list as a default would be shared by every instance of the class, " +
    "which is one of the oldest and most confusing bugs in Python. " +
    "default factory makes a fresh one each time.";
  scenes.push(rec(n, 'three dataclasses, three levels',
    'The model in code, and the two decorator details that matter.',
    [A('dc2', 'thirty lines you skip', {wantAtWord: at(n, 'classes'),
       zooms: [{mark: 'dcls', atWord: at(n, 'dataclass')}],
       callouts: [{text: 'a shared default list is a classic bug', mark: null,
                   side: 'top', color: 'red', atWord: at(n, 'shared')}]})]));
}

{
  const n =
    "That default argument trap deserves ten seconds on its own, " +
    "because it catches everyone once and it is genuinely hard to spot. " +
    "In Python, a default value is created once, when the function is defined — " +
    "not each time it is called. " +
    "So a default of empty-list gives every object the same list. " +
    "Append to one, and it appears in all of them. " +
    "You get a bug where test case number four " +
    "mysteriously has the steps of test cases one, two and three as well. " +
    "field with default factory says: call this to make a new one, every time. " +
    "It is one of the very few Python rules worth memorising outright.";
  scenes.push(compare(n, {
    headline: 'The default [that is shared]',
    source: 'Python default arguments — evaluated once, at definition',
    atWord: at(n, 'trap'),
    a: {name: '= []', color: 'red'},
    b: {name: 'default_factory', color: 'green'},
    rows: [
      {label: 'made when', a: 'once at import', b: 'every instance', winner: 'b',
       atWord: at(n, 'defined')},
      {label: 'shared', a: 'by all objects', b: 'never', winner: 'b', atWord: at(n, 'same')},
      {label: 'symptom', a: 'stray data', b: 'none', winner: 'b', atWord: at(n, 'mysteriously')},
    ],
  }));
}

// ═══ CHAPTER 5 — the same five steps, backwards ══════════════════════════════
scenes.push(chapter(
  "And now backwards: find it, decode it, decompress it, parse it, build the objects.",
  5, 'Backwards', 'find, decode, decompress, parse, build'));

{
  const n =
    "Step one of the reverse: find the payload. " +
    "A regular expression looks for a script tag whose id is report dash bundle, " +
    "and captures everything between the tags. " +
    "Then the three lines that undo the packer, in exact mirror image. " +
    "base sixty four decode turns the text back into compressed bytes. " +
    "gzip decompress turns those into the JSON text. " +
    "json loads turns that into the dictionary we started with. " +
    "Three lines out, three lines back. " +
    "And there is a guard first: if the script tag is not there, " +
    "it raises an error saying so, in plain words. " +
    "That matters, because the alternative is a crash forty lines later " +
    "with a message about None having no attribute group, " +
    "which tells the person reading it nothing about what actually went wrong.";
  scenes.push(rec(n, 'the same three lines, reversed',
    'Finding the payload, and undoing the encode and the compress.',
    [A('dc3', 'decode, decompress, parse', {wantAtWord: at(n, 'expression'),
       zooms: [{mark: 'decompress', atWord: at(n, 'decompress')}],
       callouts: [{text: 'fail with a sentence, not a crash', mark: null, side: 'top',
                   color: 'orange', atWord: at(n, 'guard')}]})]));
}

{
  const n =
    "Four operations, in strict order, and each one only works " +
    "because the one below it already succeeded. " +
    "Find the tag, or there is nothing to decode. " +
    "Decode the base sixty four, or there are no bytes to decompress. " +
    "Decompress, or there is no text to parse. " +
    "Parse, and you have the dictionary back. " +
    "This is why the guard at the top matters so much: " +
    "a failure at the bottom of that stack " +
    "shows up as a confusing error three steps higher, " +
    "and the further the error travels from its cause, " +
    "the longer you spend looking in the wrong place.";
  scenes.push(layers(n, {
    headline: 'Four steps, [each one earned]',
    atWord: at(n, 'operations'),
    layers: [
      {label: 'json.loads', sub: 'the dictionary is back', color: 'green',
       atWord: at(n, 'Parse')},
      {label: 'gzip.decompress', sub: 'bytes become text', color: 'blue',
       atWord: at(n, 'Decompress')},
      {label: 'b64decode', sub: 'text becomes bytes', color: 'purple',
       atWord: at(n, 'Decode')},
      {label: 'find the script tag', sub: 'or fail with a sentence', color: 'orange',
       atWord: at(n, 'Find')},
    ],
  }));
}

{
  const n =
    "A small helper, and it exists because of a gap in the data. " +
    "Most attachments in the bundle carry their own type — " +
    "the result file recorded it when the test attached the evidence. " +
    "But not every one does, and a decoder that assumes a field is always present " +
    "is a decoder that crashes on somebody else's results. " +
    "So this maps a file extension to a type: png to image slash png, and so on. " +
    "And the last argument to get is the fallback: " +
    "application slash octet dash stream, which is the formal way of saying " +
    "I do not know what this is, treat it as bytes. " +
    "Always have that fallback. " +
    "The unknown case is the one that shows up in production.";
  scenes.push(rec(n, 'a guess, when the type is missing',
    'Mapping an extension to a type, with an honest fallback.',
    [A('dc4', 'the unknown case, handled', {wantAtWord: at(n, 'helper'),
       callouts: [{text: 'the fallback is the important line', mark: null, side: 'top',
                   color: 'purple', atWord: at(n, 'production')}]})]));
}

{
  const n =
    "Two ways to know what a file is, and they are not equally good. " +
    "The declared type is what the test recorded when it attached the evidence: " +
    "the code knew it was writing a PNG, so it said so. " +
    "The guessed type comes from the file extension, " +
    "which is a name somebody chose and could be wrong. " +
    "Prefer the declaration, fall back to the guess, " +
    "and when both fail, say so honestly with octet dash stream. " +
    "That order — declared, guessed, admitted — " +
    "is worth applying anywhere you have to identify data you did not create.";
  scenes.push(compare(n, {
    headline: 'Declared, [or guessed]',
    source: 'the type field in a result, against the file extension',
    atWord: at(n, 'ways'),
    a: {name: 'declared', color: 'green'},
    b: {name: 'guessed', color: 'orange'},
    rows: [
      {label: 'comes from', a: 'the test code', b: 'the file name', winner: 'a',
       atWord: at(n, 'recorded')},
      {label: 'can be wrong', a: 'rarely', b: 'easily', winner: 'a', atWord: at(n, 'extension')},
      {label: 'when neither', a: 'octet-stream', b: 'octet-stream', winner: 'tie',
       atWord: at(n, 'honestly')},
    ],
  }));
}

{
  const n =
    "And now the assembly, which is where the shape we decided pays off. " +
    "For every result in the bundle, we make a TestCase, " +
    "pulling the name, the status, and the two failure fields out of status details. " +
    "Notice get with a default everywhere, rather than square brackets. " +
    "Square brackets on a missing key raise an error; " +
    "get returns a sensible default and carries on. " +
    "When you are reading someone else's data format, " +
    "get is almost always what you want, " +
    "because their file will one day have a field yours does not expect. " +
    "Read this function and notice how boring it is. " +
    "There are no clever tricks in it at all. " +
    "That is the payoff for deciding the shape before writing the code: " +
    "the code becomes obvious. " +
    "There is no cleverness to admire and nothing to puzzle over, " +
    "which is exactly what you want in the part of a system " +
    "that reads somebody else's file format. " +
    "Clever code is where the bugs hide, " +
    "and a decoder is the last place you want a bug, " +
    "because everything downstream believes whatever it hands over.";
  scenes.push(rec(n, 'one result becomes one object',
    'Turning each raw result into a TestCase, field by field.',
    [A('dc5', 'boring, and that is right', {wantAtWord: at(n, 'assembly'),
       zooms: [{mark: 'loop', atWord: at(n, 'every')}],
       callouts: [{text: 'get, not square brackets', mark: null, side: 'top',
                   color: 'green', atWord: at(n, 'expect')}]})]));
}

{
  const n =
    "There is a discipline running through that function " +
    "that is worth pulling out on its own, " +
    "because it is the difference between code that survives contact with somebody " +
    "else's data and code that does not. " +
    "Use get with a default instead of square brackets. " +
    "Give every list a default of empty rather than assuming it is there. " +
    "Treat a missing field as a fact about the data, not as an error in your program. " +
    "And skip what you cannot handle instead of stopping everything. " +
    "None of those are clever. " +
    "All of them are the reason this script still works " +
    "when somebody points it at results from a different tool.";
  scenes.push(list(n, 'Reading data you did not write', [
    {text: 'get with a default, not brackets', atWord: at(n, 'get')},
    {text: 'lists default to empty', atWord: at(n, 'list')},
    {text: 'missing is a fact, not a crash', atWord: at(n, 'missing')},
    {text: 'skip one, keep the other nine', atWord: at(n, 'skip')},
  ]));
}

{
  const n =
    "Then the evidence comes back. " +
    "For each attachment on each step, " +
    "we look up its stored data by file name, " +
    "and base sixty four decode turns that text back into the original bytes. " +
    "Those are the original bytes now — " +
    "the same four hundred thousand that made up the screenshot when the test ran. " +
    "You could write them to a file and open the picture. " +
    "And there is a quiet guard in the middle: " +
    "if the data is missing, we skip that attachment rather than crash. " +
    "A report with one missing screenshot is still a useful report. " +
    "A decoder that refuses to return anything because one file was absent is not.";
  scenes.push(rec(n, 'evidence, back as real bytes',
    'The attachments decoded from text into the original bytes.',
    [A('dc5b', 'skip, rather than crash', {wantAtWord: at(n, 'evidence'),
       zooms: [{mark: 'b64dec', atWord: at(n, 'decode')}],
       callouts: [{text: 'one missing file is not a reason to fail', mark: null,
                   side: 'top', color: 'blue', atWord: at(n, 'absent')}]})]));
}

{
  const n =
    "And the decoded evidence lines up scenario by scenario. " +
    "The three-formats scenario carries four attachments — " +
    "the page snippet plus the JSON, XML and YAML summaries. " +
    "The zip scenario carries two. " +
    "Most of the passing ones carry one. " +
    "And the broken and skipped scenarios carry none at all, " +
    "which makes complete sense: " +
    "one fell over before it attached anything, " +
    "and the other never ran. " +
    "When your decoded numbers explain themselves like that, " +
    "you are almost certainly reading the data correctly.";
  scenes.push(table(n, {
    headline: 'Evidence, [scenario by scenario]',
    tableName: 'decoded objects',
    query: 'counts the decoder printed here',
    columns: ['scenario', 'steps', 'attachments'],
    rows: [
      ['three formats', '5', '4'],
      ['zipped evidence', '3', '2'],
      ['screenshot, JPEG', '3', '1'],
      ['broken', '2', '0'],
      ['skipped', '2', '0'],
    ],
    highlight: [0, 1, 3, 4],
    highlightAtWords: [at(n, 'four'), at(n, 'two'), at(n, 'over'), at(n, 'ran')],
    atWord: at(n, 'evidence'),
  }));
}

// ═══ CHAPTER 6 — the summary that lied ═══════════════════════════════════════
scenes.push(chapter(
  "Now the counting, and a summary that lied while the data underneath it was right.",
  6, 'A summary that lied', 'the data was right the whole time'));

{
  const n =
    "Four counters, one per outcome, and then a line per test case. " +
    "You have seen this pattern before — chapter one ended on it. " +
    "But this time the lesson is a different one, " +
    "and it is the most useful thing in this chapter. " +
    "The first version of this script counted only passed and failed. " +
    "It printed a summary. The summary looked completely normal. " +
    "And it was wrong, because two of the ten test cases " +
    "were not represented in it anywhere. " +
    "Here is the part worth sitting with: " +
    "the decode was correct the entire time. " +
    "Every one of the ten objects was built properly, " +
    "with the right status on each. " +
    "The data was never wrong. Only the summary printed from it was. " +
    "Sit with how uncomfortable that is for a second. " +
    "Every test you could have written against the decoder would have passed. " +
    "The objects were right. The statuses were right. " +
    "The counts of everything the code actually counted were right. " +
    "And the person reading the output still got a false picture, " +
    "because two categories were missing from the report entirely.";
  scenes.push(rec(n, 'count all four, not two',
    'The four counters, and the version of this that had two.',
    [A('dc6', 'right data, wrong print', {wantAtWord: at(n, 'counters'),
       zooms: [{mark: 'counts', atWord: at(n, 'version')}],
       callouts: [{text: 'correct data, wrong summary', mark: 'counts', side: 'right',
                   color: 'red', atWord: at(n, 'summary', 3)}]})]));
}

{
  const n =
    "Two counters against four, as numbers. " +
    "The two-counter version reports seven passed and one failed. " +
    "Eight, out of ten test cases it had decoded perfectly. " +
    "No error, no warning, no missing key — " +
    "just two rows of truth that never reached the screen. " +
    "This is the most dangerous shape a bug can take, " +
    "because everything looks healthy. " +
    "The check that catches it costs one line: " +
    "print the total alongside the parts, and see whether they add up. " +
    "If your summary counts categories, " +
    "count the whole as well, and let the two disagree out loud.";
  scenes.push(table(n, {
    headline: 'Eight, [out of ten]',
    tableName: 'the same objects',
    query: 'counted two ways, from identical objects',
    columns: ['version', 'summary says', 'really there'],
    rows: [
      ['passed + failed', '8', '10'],
      ['all four', '10', '10'],
    ],
    highlight: [0, 1],
    highlightAtWords: [at(n, 'Eight'), at(n, 'total')],
    atWord: at(n, 'numbers'),
  }));
}

{
  const n =
    "And the last few lines print one row per test case: " +
    "the status in brackets, the name, " +
    "then how many steps and how many attachments it carried. " +
    "For a failed one, it also prints the reason. " +
    "None of that is required to make the script work. " +
    "All of it is required to make the script trustworthy, " +
    "because it is what lets you check the output against something you already know. " +
    "Save the file. That is a hundred and forty one lines, " +
    "and two hundred and twenty four for the chapter — " +
    "a packer and a decoder, both of them standard library only. " +
    "Two files, and between them they can take a folder of test evidence, " +
    "turn it into something you can email, " +
    "and turn it back into objects a program can work with. " +
    "That is a genuinely useful pair of scripts " +
    "and you now know every line in both of them.";
  scenes.push(rec(n, 'one row per test case',
    'The per-test output, and why it exists.',
    [A('dc7', 'output you can check', {wantAtWord: at(n, 'lines'),
       callouts: [{text: 'checkable beats minimal', mark: null, side: 'top',
                   color: 'green', atWord: at(n, 'trustworthy')}]}),
     A('savedec', 'saved', {wantAtWord: atFrac(n, 0.93)})]));
}

// ═══ CHAPTER 7 — the proof ═══════════════════════════════════════════════════
scenes.push(chapter(
  "Run it, and check the numbers: ten out, ten back. Proof, not a claim.",
  7, 'Proof, not a claim', 'ten out, ten back'));

{
  const n =
    "Seven passed, one failed, one broken, one skipped — " +
    "and then a row for every scenario, by name, " +
    "with its step count and its attachment count beside it. " +
    "Count the rows: there are ten of them, one per scenario. " +
    "And the failed one carries its reason: AssertionError. " +
    "Now compare that against chapter one. " +
    "behave reported seven passed, one failed, one error, one skipped. " +
    "The official Allure tool reported seven, one, one, one. " +
    "Our Python report printed seven, one, one, one. " +
    "And now this decoder, " +
    "having gone through JSON, gzip, base sixty four, an HTML file, " +
    "and all the way back, " +
    "returns seven, one, one, one. " +
    "Four independent readings of the same run, and they all agree. " +
    "That is what proof looks like: " +
    "not one program saying it worked, but several arriving at the same number separately.";
  scenes.push(rec(n, 'ten out, ten back',
    'The decoder\'s output, against the run that produced it.',
    [A('decode', 'seven, one, one, one', {wantAtWord: at(n, 'Seven'),
       zooms: [{mark: 'tally', atWord: at(n, 'compare')}],
       callouts: [{text: 'the same four numbers, a fourth time', mark: 'tally',
                   side: 'right', color: 'green', atWord: at(n, 'separately')}]})]));
}

{
  const n =
    "Four readings, side by side. " +
    "behave, at the moment the tests ran. " +
    "The official Allure tool, reading the results folder. " +
    "Our own Python report, reading the same folder. " +
    "And this decoder, reading a single HTML file " +
    "that was built from that folder and then unpacked again. " +
    "The only difference anywhere is a word: " +
    "behave says error where Allure says broken. " +
    "Same scenario, same cause, two vocabularies — " +
    "and every count identical.";
  scenes.push(table(n, {
    headline: 'Four readings, [one answer]',
    tableName: 'ten scenarios',
    query: 'four programs, measured on this machine',
    columns: ['who', 'passed', 'the other 3'],
    rows: [
      ['behave', '7', '1 / 1 err / 1'],
      ['official Allure', '7', '1 / 1 / 1'],
      ['our HTML report', '7', '1 / 1 / 1'],
      ['this decoder', '7', '1 / 1 / 1'],
    ],
    highlight: [0, 1, 2, 3],
    highlightAtWords: [at(n, 'behave'), at(n, 'official'), at(n, 'own'), at(n, 'decoder')],
    atWord: at(n, 'readings'),
  }));
}

{
  const n =
    "That habit is the takeaway of the whole chapter, " +
    "so here it is as a rule you can apply anywhere. " +
    "When you write something that reads a format, " +
    "find a second thing that reads the same format and compare the answers. " +
    "When you write something that transforms data, " +
    "count the items before and count them after. " +
    "When you print a summary, print the total too, " +
    "so the parts have something to disagree with. " +
    "And when your numbers match a source you did not write, " +
    "you have evidence rather than confidence. " +
    "Those are cheap habits, and each one has caught a real bug in this series already.";
  scenes.push(list(n, 'How to know your code is right', [
    {text: 'compare against a second reader', atWord: at(n, 'compare')},
    {text: 'count in, count out', atWord: at(n, 'count')},
    {text: 'print the total beside the parts', atWord: at(n, 'total')},
    {text: 'evidence, not confidence', atWord: at(n, 'evidence')},
  ]));
}

{
  const n =
    "One more thing before we finish, " +
    "because it is what the next chapter is built on. " +
    "What came out of that decoder is not text and not a file. " +
    "It is a list of Python objects. " +
    "Test cases you can loop over, " +
    "steps you can count, " +
    "and attachments whose data is real bytes you could write straight to disk. " +
    "That is the difference between having a report and having your data. " +
    "A report is something a person reads. " +
    "Objects are something a program can act on — " +
    "store, query, serve, or hand to a model. " +
    "Next chapter, these exact objects go into a database.";
  scenes.push(diagram(n, {
    nodes: [
      {id: 'html', label: 'bundle.html', sub: 'one file, packed', color: 'orange',
       atWord: at(n, 'file')},
      {id: 'dec', label: 'decode_report', sub: 'the code you wrote', color: 'purple',
       parent: 'html', atWord: at(n, 'decoder')},
      {id: 'obj', label: 'TestCase objects', sub: 'a program can act', color: 'green',
       parent: 'dec', atWord: at(n, 'objects')},
      {id: 'db', label: 'SQLite', sub: 'chapter three', color: 'blue',
       parent: 'obj', atWord: at(n, 'database')},
    ],
  }));
}

{
  const n =
    "So: we took a folder of twenty-two files and packed it into one, " +
    "watching the size change at every stage. " +
    "We learned that gzip is for size and base sixty four is for transport, " +
    "and that compressing an already-compressed file buys you one percent. " +
    "We decided a shape before writing the decoder, " +
    "which made the decoder boring to write. " +
    "We got all ten test cases back, with their evidence as real bytes, " +
    "and checked the count against three other programs. " +
    "And we met a bug where the data was perfect and the summary lied. " +
    "Next time, these objects go into a real database, " +
    "and we start being able to ask questions across runs instead of one at a time.";
  scenes.push(scene('RECAP', n, {
    recap: {
      heading: 'What you built',
      points: [
        {text: 'A packer: gather, compress, encode, hide', atWord: at(n, 'packed')},
        {text: 'gzip is size, base64 is transport', atWord: at(n, 'transport')},
        {text: 'A shape decided before the code', atWord: at(n, 'shape')},
        {text: 'Ten cases back, evidence as bytes', atWord: at(n, 'bytes')},
        {text: 'A summary that lied over correct data', atWord: at(n, 'lied')},
      ],
    },
  }));
}

{
  const n = "If this made the inside of a report make sense, subscribe — " +
            "chapter three puts all of it into a database. " +
            "Every file is on the channel, and the questions go in the comments.";
  scenes.push(scene('OUTRO_CTA', n, {
    message: 'Chapter 3: into a database',
    sub: 'the whole series on the channel',
  }));
}

const spec = {
  meta: {
    topic: 'What is inside a test report, and how to open it back up',
    subject: 'Allure',
    audience: 'beginner',
    screenplay: 'masterclass',
    audioPrefix: 'allure02_long',
    series: 'Allure AI',
    chapterNumber: 2,
    fps: 30,
    seo: {
      title: 'Allure AI #2 — Pack a Test Report into One File, Then Open It Back Up (Python)',
      description: 'Twenty-two files squashed into one HTML file with gzip and base64, then a decoder written from nothing that returns all ten test cases with their evidence as real bytes. Standard library only.',
      queries: ['python gzip base64 single file report', 'decode allure results python',
                'what is base64 vs gzip', 'single file html report python'],
      tags: ['python', 'allure', 'gzip', 'base64', 'dataclasses', 'testing', 'bdd', 'qa'],
      sources: ['https://allurereport.org/docs/', 'https://docs.python.org/3/library/gzip.html',
                'https://docs.python.org/3/library/base64.html',
                'https://docs.python.org/3/library/dataclasses.html'],
      pinned: 'Which surprised you more — that gzip only took a third off, or that base64 made it bigger again? And had you met the shared-default-list trap before?',
    },
  },
  brand: {
    channel: CH,
    logo: 'img:channel_logo.png',
    theme: 'moderndark',
    design: 'moderndark',
    background: 'grid',
  },
  thumbnail: {
    title: 'Pack an Allure Report Into ONE File',
    badge: 'Python · gzip + base64',
    note: '22 files in, 10 test cases back',
    asset: 'si:python',
    logos: ['si:python', 'lucide:file-archive', 'lucide:file-code', 'lucide:package-open'],
  },
  scenes,
};

// ESTIMATE A DURATION FOR EVERY SCENE, ALWAYS.
//
// A scene with no `durationFrames` makes its composition NaN, and Remotion refuses to build
// the WHOLE bundle when any single composition is invalid — so one un-voiced spec sitting in
// topics/ blocks the render of every other topic in the repo. That is exactly what happened
// while chapter 2 was authored and chapter 1's short was queued behind it.
//
// 9.65 frames per word is the measured voice rate; `sync.mjs` overwrites all of this with
// real audio timings and sets timingSource:'tts', and render-topic still refuses to ship a
// narrated spec that has not been synced. This only makes the spec previewable.
for (const s of scenes) {
  if (s.durationFrames == null) {
    const w = s.narration.trim().split(/\s+/).length;
    s.durationFrames = Math.max(90, Math.round(w * 9.65) + 30);
    s.timingSource = 'estimated';
  }
}

fs.writeFileSync(`topics/${SLUG}/long.json`, JSON.stringify(spec, null, 2) + '\n');
const words = scenes.reduce((a, s) => a + s.narration.trim().split(/\s+/).length, 0);
const census = {};
for (const s of scenes) census[s.type] = (census[s.type] || 0) + 1;
console.log(`wrote topics/${SLUG}/long.json — ${scenes.length} scenes, ${words} words (~${Math.floor(words * 9.65 / 30 / 60)}m${Math.round((words * 9.65 / 30) % 60)}s)`);
console.log('  ' + Object.entries(census).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(' '));
