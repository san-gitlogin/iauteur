#!/usr/bin/env node
// Builds topics/vscode-shortcuts-that-actually-work/long.json from briefs/vscode-shortcuts/COURSE.md.
//
// Built, never hand-edited (LAW 0p corollary: a brief builder that is behind its own output is a
// trap — re-running it silently deletes whatever was patched into the JSON afterwards).
//
// EVERY SHORTCUT IN THIS COURSE WAS PRESSED. `briefs/vscode-shortcuts/VERIFIED.md` lists 103 that
// were measured against a real workbench; nothing else may be demonstrated. The nine unverified
// rows carry measured reasons and may be MENTIONED but never shown (LAW 0m, LAW 3).
//
// TWO NUMBERS SHAPE THIS FILE, both the linter's:
//   1. OVER-RELIANCE caps any sub-type at ceil(scenes * 0.35). 30 recorded steps go into TEN
//      scenes, two to four clips each — which is also how a person would narrate them.
//   2. The scene ceiling is 180 * distinct_anchors + 120 frames, hard-capped at 70s.
// The builder checks itself against both and prints what it would be rejected for.
import fs from 'node:fs';
import path from 'node:path';

const SLUG = 'vscode-shortcuts-that-actually-work';
const NL = String.fromCharCode(10);
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length;

const scenes = [];
let n = 0;

const countAnchors = (data, extra = 0) => {
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
  return seen.size + extra;
};

const scene = (type, narration, data = {}, extra = {}) => {
  n++;
  const text = narration.trim().replace(/\s+/g, ' ');
  const TRANSITION_BY_ROLE = {
    HOOK: 'filmburn', CHAPTER: 'wipe', TITLE_CARD: 'dip', RECORDED_STEP: 'push',
    QUIZ_CARD: 'iris', RECAP: 'blinds', OUTRO_CTA: 'dip', KEY_CHORD: 'push',
    BROWSER_STEALS: 'iris',
  };
  scenes.push({
    id: 's' + String(n).padStart(2, '0'),
    type,
    transition: TRANSITION_BY_ROLE[type] ?? 'fade',
    background: ['zoneA', 'zoneB', 'zoneC'][n % 3],
    narration: text,
    data,
    durationFrames: Math.max(90, Math.round(words(text) * 12 + 40)),
    timingSource: 'estimated',
    _anchors: countAnchors(data, extra.plusAnchors ?? 0),
    _words: words(text),
  });
};

/** A RECORDED_STEP. Anchors arrive later from anchor-spec; estimated here the way it solves them. */
const rec = (narration, {caption, premise, clips}) => {
  const est = clips.reduce((a, c) => a + 1 + (c.zooms?.length ?? 0) + (c.callouts?.length ?? 0), 0);
  scene('RECORDED_STEP', narration, {recordedStep: {caption, premise, clips}}, {plusAnchors: est});
};
const clip = (ref, label, opts = {}) => ({ref, label, focus: true, ...opts});

// ─────────────────────────────────────────────────────────────────────────────
// ACT I — the ones you reach for every hour
// ─────────────────────────────────────────────────────────────────────────────

// LAW 0g phase 1: continue the title's promise in the viewer's own words, inside 8 seconds.
// The title says shortcuts that actually work, so the first sentence is about one that does not.
scene('HOOK',
  `Six of the hundred and forty nine shortcuts on that card do nothing. Which six?`,
  {headline: '6 OF THEM LIE', subtext: 'and the card will not tell you which',
   heroAsset: 'lucide:keyboard', headlineAtWord: 1, heroAtWord: 6});

scene('TITLE_CARD',
  `So I pressed all of them — welcome back, by the way — every chord on that card, one at a time,
   against a real editor. A hundred and three work. What about the rest?`,
  {title: 'Shortcuts that actually work', subtitle: '103 pressed, one at a time'});

scene('CHAPTER',
  `We'll start with five you'll reach for every hour. Not the clever ones — the ones that stop your
   hand going to the mouse in the first place, which is where the time actually goes.`,
  {chapter: {number: '01', title: 'Every hour', subtitle: 'the five that replace the mouse'}});

scene('KEY_CHORD',
  `Everybody starts here. Hold control and shift and press P, and the command palette opens — the
   palette runs anything your editor can do, provided you remember what the command is called.
   Hold on to that, because there's a faster door.`,
  {keyChord: {
    caption: 'the door to everything',
    premise: 'The palette runs any command in the editor — if you can name it.',
    groups: [{keys: ['Ctrl', 'Shift', 'P'], atWord: 7}],
    command: 'Show All Commands',
    result: 'anything the editor can do',
    atWord: 2, commandAtWord: 16, color: 'blue',
  }});

rec(`Watch both. Shift makes the palette want a COMMAND name. Drop the shift and that same box wants
     a FILE name, which matters because you almost always know the filename.`,
  {caption: 'two doors, one box',
   premise: 'The same widget. The arrow in front is what decides whether it wants a command or a file.',
   clips: [
     clip('rec:vscode-keys-act1#palette', 'the command palette', {}),
     clip('rec:vscode-keys-act1#quickopen', 'quick open', {}),
   ]});

rec(`Three that cost nothing to learn. B hides the sidebar and hands that width back to the thing
     you're actually reading, because the file tree isn't what you're looking at. Press it again and
     the sidebar returns. Then F is find, right where your eyes already are.`,
  {caption: 'width back, and find',
   premise: 'Two keys that each replace a trip to the mouse and a click on a small target.',
   clips: [
     clip('rec:vscode-keys-act1#sidebar', 'hide the sidebar', {}),
     clip('rec:vscode-keys-act1#sidebar-back', 'and back', {}),
     clip('rec:vscode-keys-act1#find', 'find in this file', {}),
   ]});

rec(`Now the ones that move you between whole panes. Shift with F searches every file in the
     project rather than just this one, so the results come back as a list you can walk. Shift with
     E returns you to the file tree. Backtick raises the terminal and hides the terminal again — and
     then we just run the code, which is the whole point of a terminal one key down.`,
  {caption: 'across the project, and the terminal',
   premise: 'Search is project-wide. The terminal is one key from wherever you are.',
   clips: [
     clip('rec:vscode-keys-act1#search', 'search every file', {}),
     clip('rec:vscode-keys-act1#explorer', 'back to the files', {}),
     clip('rec:vscode-keys-act1#terminal', 'the terminal', {}),
     clip('rec:vscode-keys-act1#run', 'and run it', {
       callouts: [{text: 'no mouse touched', mark: 'out', color: 'green'}],
     }),
   ]});

scene('QUIZ_CARD',
  `Quick one. You know the file's called cart dot js. Which door's faster? Have a think, and pause
   if you want longer. Ready? It's B — you know the name, so skip the command entirely.`,
  {quiz: {
    question: 'You know the filename. Which door?',
    options: [{text: 'Ctrl+Shift+P'}, {text: 'Ctrl+P'}, {text: 'the file tree'}, {text: 'Ctrl+F'}],
    answerIndex: 1,
    why: 'Quick Open takes a filename directly.',
    revealAtWord: 23, atWord: 3,
  }});

// ─────────────────────────────────────────────────────────────────────────────
// ACT II — editing at the speed of thinking
// ─────────────────────────────────────────────────────────────────────────────

scene('RECAP',
  `Five keys, none of them clever. The palette for what you can't name, quick open for what you can,
   and the terminal one key down, so you never go looking for it.`,
  {recap: {
    title: 'Act one, in five keys',
    points: [
      {text: 'Ctrl+Shift+P — name a command'},
      {text: 'Ctrl+P — name a file'},
      {text: 'Ctrl+B — width back'},
      {text: 'Ctrl+F — find here'},
      {text: 'Ctrl+` — the terminal'},
    ],
    atWord: 2,
  }});

scene('CHAPTER',
  `These next four pay for themselves inside a day, because every one of them replaces a select, a
   drag and a click with a single chord.`,
  {chapter: {number: '02', title: 'Editing', subtitle: 'four that pay for themselves'}});

rec(`Slash comments a line out. Your caret's on the line and you select nothing first, which is the
     part people miss. Press slash again and the line comes back. Notice your editor picked the
     right comment marker on its own, because it already knows what language this file is.`,
  {caption: 'no selection needed',
   premise: 'The caret is on the line. That is the whole selection this command wants.',
   clips: [
     clip('rec:vscode-keys-act2#comment', 'comment it out', {
       callouts: [{text: 'it picked the right marker', mark: 'commented', color: 'blue'}],
     }),
     clip('rec:vscode-keys-act2#uncomment', 'and back again', {}),
   ]});

rec(`Three more that move whole lines, and none of them wants a selection either. Shift with alt and
     down copies the line below itself. Shift with K deletes that line outright — no select to end,
     no backspace. Alt and an arrow MOVES a line past its neighbours.`,
  {caption: 'copy, delete, move',
   premise: 'Three edits that each replace a select-drag-click with one chord.',
   clips: [
     clip('rec:vscode-keys-act2#copyline', 'copy it down', {}),
     clip('rec:vscode-keys-act2#deleteline', 'delete the line', {}),
     clip('rec:vscode-keys-act2#moveline', 'move it', {}),
   ]});

rec(`Then the one that feels like a superpower. Alt with down puts a SECOND caret on the line below,
     so you're typing in two places at once. U takes that caret back when you overshoot, and you
     will overshoot, which is why the undo matters more than the trick.`,
  {caption: 'two cursors, one keystroke',
   premise: 'A second caret is not a selection. Both of them type.',
   clips: [
     clip('rec:vscode-keys-act2#multicursor', 'a second cursor', {}),
     clip('rec:vscode-keys-act2#undocursor', 'take it back', {}),
     clip('rec:vscode-keys-act2#selectline', 'select the line', {}),
   ]});

scene('KEY_CHORD',
  `Here's a different SHAPE of shortcut, and it's the one that confuses everybody. K then zero isn't
   four keys held down together. You press control and K, let go, then press control and zero. Two
   presses — your editor genuinely waits for the second one.`,
  {keyChord: {
    caption: 'two presses, not four keys',
    premise: 'A chord is a rhythm. The gap in the middle is the part people miss.',
    groups: [{keys: ['Ctrl', 'K'], atWord: 16}, {keys: ['Ctrl', '0'], atWord: 25}],
    command: 'Fold All',
    result: 'every block collapses',
    atWord: 3, commandAtWord: 32, color: 'purple',
  }});

rec(`And there's that chord doing its job. Zero folds every block, so you see the shape of a file
     without the detail. J opens them all again.`,
  {caption: 'the shape, without the detail',
   premise: 'Folding is how you read a file you did not write.',
   clips: [
     clip('rec:vscode-keys-act2#fold', 'fold everything', {}),
     clip('rec:vscode-keys-act2#unfold', 'and open it up', {}),
   ]});

scene('QUIZ_CARD',
  `One more. K then S — how many presses is that? Have a think, and pause if you want longer.
   Ready? Two. You press K, you let go, then you press S.`,
  {quiz: {
    question: 'Ctrl+K Ctrl+S is how many presses?',
    options: [{text: 'One'}, {text: 'Two'}, {text: 'Four'}, {text: 'Three'}],
    answerIndex: 1,
    why: 'A chord is a sequence of simultaneous presses, not one big one.',
    revealAtWord: 20, atWord: 3,
  }});

// ─────────────────────────────────────────────────────────────────────────────
// ACT III — moving through a project you did not write
// ─────────────────────────────────────────────────────────────────────────────

scene('CHAPTER',
  `Everything so far assumed you know where you are. This next set is for the opposite: a project
   somebody else wrote, which you now have to find your way around.`,
  {chapter: {number: '03', title: 'Navigating', subtitle: 'someone else’s project'}});

rec(`Two ways to jump. Shift with O lists this file's symbols, so you land on a function instead of
     scrolling. G takes a line number, which is what a stack trace hands you.`,
  {caption: 'to a symbol, or to a line',
   premise: 'Both open the same box. What you type into it is what differs.',
   clips: [
     clip('rec:vscode-keys-act3#gotosymbol', 'jump to a symbol', {}),
     clip('rec:vscode-keys-act3#gotoline', 'jump to a line', {}),
   ]});

rec(`Now panes. Backslash splits the editor, so you can read one file while writing another. The
     number two jumps you to the second pane. W closes an editor — and here's the one nobody
     knows: shift with T reopens whatever you just closed. Closing stops being destructive once you
     can undo it, which changes how freely you do it.`,
  {caption: 'split, close, and undo the close',
   premise: 'Ctrl+Shift+T is the safety net that makes Ctrl+W worth using.',
   clips: [
     clip('rec:vscode-keys-act3#split', 'split the editor', {}),
     clip('rec:vscode-keys-act3#group2', 'jump to the second', {}),
     clip('rec:vscode-keys-act3#closeone', 'close it', {}),
     clip('rec:vscode-keys-act3#reopen', 'and undo that', {}),
   ]});

scene('KEY_CHORD',
  `That last one's worth committing to memory, because it changes a habit rather than saving a
   second. Shift with T reopens the editor you just closed, exactly the way your browser does.`,
  {keyChord: {
    caption: 'the undo you did not know about',
    premise: 'Closing an editor stops being a decision once you can take it back.',
    groups: [{keys: ['Ctrl', 'Shift', 'T'], atWord: 18}],
    command: 'Reopen Closed Editor',
    result: 'it comes straight back',
    atWord: 3, commandAtWord: 24, color: 'green',
  }});

rec(`Two to finish. K then Z is zen mode, where everything but the code goes away because none of it
     was helping. Escape twice brings the furniture back. K then S opens the shortcut list itself,
     which is the honest answer to anything I haven't shown you.`,
  {caption: 'nothing but the code',
   premise: 'The last shortcut is the one that shows you all the others.',
   clips: [
     clip('rec:vscode-keys-act3#zen', 'everything else, gone', {}),
     clip('rec:vscode-keys-act3#unzen', 'and back', {}),
     clip('rec:vscode-keys-act3#keyboard', 'the list itself', {}),
   ]});

// ─────────────────────────────────────────────────────────────────────────────
// ACT IV — the ones the browser steals
// ─────────────────────────────────────────────────────────────────────────────

scene('CHAPTER',
  `Which leaves the six I promised. They're printed on the card, they're in the documentation, and
   in a browser these six do nothing at all, because something else takes the key first.`,
  {chapter: {number: '04', title: 'The six that lie', subtitle: 'what the browser takes'}});

scene('BROWSER_STEALS',
  `Take shift with W. In the desktop app that closes an editor window. In a browser, your browser
   sees the key first and closes the whole tab, so the editor underneath never hears about it.
   Nothing's broken. The key simply never arrives.`,
  {browserSteals: {
    caption: 'the browser gets there first',
    premise: 'Both want this key. Only one of them is allowed to want it.',
    keys: ['Ctrl', 'Shift', 'W'],
    browserLabel: 'your browser', editorLabel: 'VS Code',
    browserDoes: 'closes the whole tab',
    editorWanted: 'never sees the key',
    atWord: 2, pressAtWord: 9, stealAtWord: 18, color: 'red',
  }});

scene('BROWSER_STEALS',
  `Same story for plus and minus. On the desktop those change your editor's font size; in a browser
   they're zoom, and zoom belongs to the browser. R after K is the fourth, because it wants your
   operating system's file manager, which a web page can't reach.`,
  {browserSteals: {
    caption: 'zoom belongs to the browser',
    premise: 'Some keys are not the editor’s to take, whatever the card says.',
    keys: ['Ctrl', '='],
    browserLabel: 'your browser', editorLabel: 'VS Code',
    browserDoes: 'zooms the page',
    editorWanted: 'wanted to resize the font',
    atWord: 2, pressAtWord: 8, stealAtWord: 16, color: 'orange',
  }});

scene('QUIZ_CARD',
  `Last one. Why does shift with W do nothing here? Have a think, and pause if you want longer.
   Ready? It's C — your browser takes the key before the editor can see it.`,
  {quiz: {
    question: 'Why does Ctrl+Shift+W do nothing here?',
    options: [
      {text: 'It is not implemented'},
      {text: 'It needs an extension'},
      {text: 'The browser takes it first'},
      {text: 'It was removed'},
    ],
    answerIndex: 2,
    why: 'Both are in the same path, and only the first gets a turn.',
    revealAtWord: 20, atWord: 3,
  }});

scene('RECAP',
  `So: quick open beats the palette whenever you know the name. Line edits want no selection. Any
   chord with a K is two presses. And if nothing happens, something else took the key.`,
  {recap: {
    title: 'What to actually remember',
    points: [
      {text: 'Ctrl+P when you know the name'},
      {text: 'Line edits need no selection'},
      {text: 'Ctrl+K anything is two presses'},
      {text: 'Ctrl+Shift+T undoes a close'},
      {text: 'Nothing happened? Something took the key'},
    ],
    atWord: 2,
  }});

scene('OUTRO_CTA',
  `Every shortcut here got pressed against a real editor before it went in, because a list you
   haven't tested is just a list. If that's your sort of thing, you know what to do.`,
  {outro: {headline: 'Pressed, not copied', sub: 'all 103 of them', atWord: 2}});

// ── self-check against the two numbers the linter actually enforces ───────────
const total = scenes.length;
const cap = Math.ceil(total * 0.35);
const counts = {};
for (const s of scenes) counts[s.type] = (counts[s.type] ?? 0) + 1;

const problems = [];
for (const [type, c] of Object.entries(counts)) {
  if (c > cap) problems.push(`OVER-RELIANCE: ${type} used ${c}x (cap ${cap} for ${total} scenes)`);
}
// Only these earn runtime from motion; everything else is a static card on a flat 16s ceiling.
// Mirrors the DYNAMIC list in scripts/lint-spec.mjs — get this wrong and the builder reports
// nonsense, which it did: a CHAPTER card was said to allow six words.
const DYNAMIC = new Set(['RECORDED_STEP', 'KEY_CHORD', 'BROWSER_STEALS']);
for (const s of scenes) {
  const ceiling = DYNAMIC.has(s.type) ? Math.min(180 * s._anchors + 120, 2100) : 480;
  const maxWords = Math.floor((ceiling - 40) / 12);
  const flag = s._words > maxWords ? '  OVER' : (s._words < maxWords * 0.55 ? '  thin (anchor-spec may overflow)' : '');
  console.log(`${s.id} ${s.type.padEnd(16)} ${String(s._words).padStart(4)}w / ${String(maxWords).padStart(3)} max${flag}`);
  if (s._words > maxWords) problems.push(`${s.id} ${s.type} is ${s._words}w, ceiling allows ${maxWords}`);
}

for (const s of scenes) { delete s._anchors; delete s._words; }

const spec = {
  meta: {
    topic: 'VS Code Shortcuts That Actually Work',
    format: 'long', fps: 30, screenplay: 'masterclass',
    onePayoff: 'the six shortcuts that do nothing in a browser, and why',
    openLoop: 'six of the card’s shortcuts do nothing — which six?',
    analogy: 'two things reaching for the same key',
    topicAxes: ['entity-novelty', 'tribal-conflict'],
    seo: {
      title: 'VS Code Shortcuts That Actually Work (I pressed all 149)',
      queries: ['vs code keyboard shortcuts', 'vscode shortcuts windows', 'vs code chord shortcuts'],
      tags: 'vs code,vscode,keyboard shortcuts,productivity,editor,developer tools',
    },
  },
  brand: {
    theme: 'moderndark', design: 'moderndark', themeLight: 'daylight',
    background: 'grid', logo: 'img:channel_logo.png',
  },
  // Derived from the topic, never generic: the number is the one this course measured.
  thumbnail: {title: '6 OF THEM LIE', badge: '103 VERIFIED', asset: 'lucide:keyboard'},
  scenes,
};

const out = path.join('topics', SLUG, 'long.json');
fs.writeFileSync(out, JSON.stringify(spec, null, 2) + NL);
console.log(`${NL}${total} scenes -> ${out}`);
console.log(`RECORDED_STEP ${counts.RECORDED_STEP ?? 0} / cap ${cap}`);
if (problems.length) {
  console.log(`${NL}  ${problems.length} thing(s) the linter will object to:`);
  for (const p of problems) console.log('   - ' + p);
}
