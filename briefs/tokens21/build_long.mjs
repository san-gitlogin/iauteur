// 21 ways to save Claude Code tokens — WIDE CUT.
//
// Facts: briefs/tokens21/FACTS.md (Anthropic's own docs, fetched 2026-09-30) and the takes in
// public/rec/tok-* (every number spoken below is read off a take's own frame, not off a rehearsal).
// The infographic is Charlie Hills' (credited on screen whenever it is shown). Where Anthropic's docs
// disagree with the infographic, the docs win and the narration says so out loud.
//
// Anchors: every drawn element names the PHRASE that introduces it (`at`), resolved to a word index
// here, so an element lands on its own words instead of on a fraction of the read. Every beat ends on
// a landing sentence AFTER its last anchor (the payoff is named early, never in the last 15%).
import {cut} from '../../scripts/lib/apple-build.mjs';

const c = cut();

const norm = (x) => x.replace(/[^\w'$.%]/g, '').toLowerCase().replace(/[.]+$/, '');
const MISSES = [];
const wordIndex = (narration, phrase) => {
  const w = narration.split(/\s+/), p = phrase.split(/\s+/);
  for (let i = 0; i < w.length; i++) if (p.every((x, j) => norm(w[i + j] ?? '') === norm(x))) return i + 1;
  MISSES.push(`"${phrase}"  in: ${narration.slice(0, 70)}…`);
  return 1;
};

const DOCS = 'Anthropic · code.claude.com/docs/en/costs';
const CACHEDOCS = 'Anthropic · code.claude.com/docs/en/prompt-caching';
const CREDIT = 'Infographic: Charlie Hills · charliehills.substack.com';

/** A RECORDED_STEP beat. clips: {take, step, label, at (fraction), camera: [{frame: mark | 'full', at: phrase, band}]} */
const rec = (transition, bg, narration, source, clips, extra = {}) =>
  c.add('RECORDED_STEP', transition, bg, narration, (A) => ({
    clips: clips.map((k) => ({
      ref: `rec:${k.take}#${k.step}`, label: k.label, focus: k.focus ?? true, atWord: A(k.at ?? 0.03),
      ...(k.source ? {sourceNote: k.source} : {}),
      zooms: (k.camera ?? []).map((m) => (m.frame === 'full'
        ? {at: 'full', wantAtWord: wordIndex(narration, m.at)}
        : {marks: [].concat(m.frame), ...(m.band ? {band: true} : {}), wantAtWord: wordIndex(narration, m.at)})),
      callouts: [],
    })),
    ...(source ? {sourceNote: source} : {}),
    ...extra,
  }));

/** A TOK_STAGE beat. stage items carry `at: 'phrase'`; everything else is passed through. */
const tok = (transition, bg, narration, body) =>
  c.add('TOK_STAGE', transition, bg, narration, () => ({
    ...body,
    stage: (body.stage ?? []).map(({at, ...it}) => ({...it, atWord: at ? wordIndex(narration, at) : 1})),
  }));

const chapter = (transition, bg, narration, number, title, subtitle) =>
  c.add('CHAPTER', transition, bg, narration, (A) => ({number, title, subtitle, atWord: A(0.2)}));

/** A quiz: options land on their words, the answer on the word after the pause invitation. */
const quiz = (transition, bg, narration, question, options, answerIndex, why, reveal) =>
  c.add('QUIZ_CARD', transition, bg, narration, () => ({
    question, answerIndex, why, atWord: 1,
    options: options.map(([text, at]) => ({text, atWord: wordIndex(narration, at)})),
    revealAtWord: wordIndex(narration, reveal),
  }));

// ═══ OPEN ══════════════════════════════════════════════════════════════════════════════
c.add('HOOK', 'dip', 'zoneA',
  "I asked Claude Code to say hi, and it sent twenty-three thousand tokens.",
  (A) => ({
    headline: '21 Ways To Save Claude Tokens',
    subtext: '23,883 tokens sent for 6 words.',
    heroAsset: 'lucide:coins',
    hookVariant: 'figure',
    atWord: A(0.5),
  }));

c.add('TITLE_CARD', 'fade', 'zoneA',
  "Welcome back. Today we're going through twenty-one ways to spend fewer tokens in Claude Code, Anthropic's AI " +
  "coding agent that runs in your terminal. The list comes from an infographic by Charlie Hills, and rather than " +
  "just read it out, we're going to try every one of the twenty-one on camera and check each against Anthropic's " +
  "own documentation. A few of them, it turns out, don't do what the picture says.",
  (A) => ({
    title: 'All 21, tested in Claude Code',
    subtitle: 'checked against Anthropic’s own docs',
    atWord: A(0.3),
  }));

rec('zoom', 'zoneB',
  "Here's where we're heading. This is Claude Code's own map of a brand new session, before I've typed a thing, " +
  "and it's already carrying about thirty-one thousand tokens. By the end you'll know what each of those lines is, " +
  "and which ones you can shrink.",
  null,
  [{take: 'tok-context', step: 'ctx-up', label: 'what rides along', at: 0.02}]);

tok('fade', 'zoneA',
  "So what does the infographic claim? It's drawn as an iceberg. Above the water sit the four things everyone " +
  "reaches for: a cheaper model, shorter prompts, clearing the chat now and then, and turning thinking off. Under " +
  "the water there are twelve moves that are nothing more than a command. Right at the bottom, nine need a little " +
  "setting up — a file, a flag, or something you type in front of claude when you start it. And the line across " +
  "the top is the claim we're testing: Anthropic published how Claude Code bills you, and almost none of it is " +
  "your prompt. Let's see if that holds.",
  {kind: 'sheet', token: 'tok-infographic.jpg', stageTitle: 'the source: 21 moves, 3 levels',
   stage: [
     {group: 'focus', value: 0.24, text: '1.9', label: 'Above the water: four', at: 'Above the water'},
     {group: 'focus', value: 0.48, text: '1.7', label: 'Under it: twelve commands', at: 'Under the water'},
     {group: 'focus', value: 0.77, text: '1.6', label: 'At the bottom: nine to set up', at: 'Right at the bottom,'},
     {group: 'focus', value: 0.07, text: '1.25', label: 'The claim we are testing', at: 'the line across'},
     {group: 'credit', label: CREDIT, sub: 'shown and credited with thanks', at: "It's drawn"},
   ]});

rec('letterbox', 'zoneB',
  "To check it, we need the source. This is Anthropic's official documentation for Claude Code, on the page about " +
  "managing costs, and the very first line says Claude Code charges by API token consumption. A token is a small " +
  "piece of text, roughly three quarters of a word, and everything is counted in them, going in and coming out. " +
  "Further down, under why usage climbs in a long session, is the sentence this whole video rests on: Claude Code " +
  "sends your full conversation with every request. That one line explains almost everything that follows.",
  DOCS,
  [{take: 'tok-docs', step: 'top', label: 'Anthropic’s cost page', at: 0.02,
    camera: [{frame: 'charges', at: 'charges by API token consumption.', band: true}, {frame: 'full', at: 'A token is'}]},
   {take: 'tok-docs', step: 'resend', label: 'the key sentence', at: 0.62}]);

tok('push', 'zoneA',
  "Picture every message you send as a stack. At the bottom sit Claude Code's own instructions. Above them are " +
  "the descriptions of every tool it can use, and then your project notes and skills. On top of those comes every " +
  "message and every answer so far, and at the very top, the thin red slice you just typed. Each time you press " +
  "enter, the whole stack goes out again. Turn one, turn two, turn twenty: the base never shrinks, and the history " +
  "only grows. That's why a long session gets expensive even when every message you type is short.",
  {kind: 'resend', stageTitle: 'every request re-sends the stack',
   premise: 'One column per request. The base repeats every time; red is what you typed. History sizes are illustrative.',
   stage: [
     {group: 'base', label: "Claude Code's instructions", sub: '2.4k tokens', value: 2.4, text: 'system', at: "Claude Code's own instructions."},
     {group: 'base', label: 'tool descriptions', sub: '24.7k tokens', value: 24.7, text: 'tools', at: 'the descriptions of every tool'},
     {group: 'base', label: 'notes and skills', sub: '3.0k tokens', value: 3.0, text: 'skills', at: 'project notes and skills.'},
     {group: 'you', label: 'what you typed', at: 'thin red slice'},
     {group: 'turn', label: 'turn 1', value: 0.2, at: 'Turn one,'},
     {group: 'turn', label: 'turn 2', value: 4, at: 'turn two,'},
     {group: 'turn', label: 'turn 5', value: 14, at: 'turn twenty:'},
     {group: 'turn', label: 'turn 10', value: 30, at: 'the base never shrinks,'},
     {group: 'turn', label: 'turn 20', value: 62, at: 'the history only grows.'},
     {group: 'total', label: '~30k before you type', sub: 'measured with /context', at: 'the whole stack goes out again.'},
   ]});

tok('slide', 'zoneB',
  "If that sounds ruinous, it would be — except for something called prompt caching. A cache is a short-term " +
  "memory on Anthropic's side. When the start of your request matches the last one exactly, that part is served " +
  "from the cache at about a tenth of the normal input price, and only the new slice is charged in full. Here's " +
  "the catch, though, and half of these twenty-one tips are really about it: the match has to be exact, from the " +
  "very first token. Switch the model and nothing matches any more, so every layer is billed again at full price. " +
  "Keep that picture in mind, because it comes back again and again.",
  {kind: 'prefix', stageTitle: 'the cache works from the top down',
   premise: 'The request as one bar. Dim and sealed means served from the cache; red means billed again in full.',
   stage: [
     {group: 'seg', label: 'instructions', value: 1.2, text: 'system', at: 'prompt caching.'},
     {group: 'seg', label: 'tools', value: 3, text: 'tools', at: 'short-term memory'},
     {group: 'seg', label: 'notes + skills', value: 1.4, text: 'skills', at: 'matches the last one'},
     {group: 'seg', label: 'the conversation', value: 3.6, text: 'history', at: 'served from the cache'},
     {group: 'new', label: 'new', at: 'the new slice'},
     {group: 'break', text: 'instructions', label: 'switch the model: nothing matches', sub: 'each model keeps its own cache', at: 'Switch the model'},
     {group: 'verdict', label: 'Most tips are about keeping this cache.', at: 'billed again at full price.'},
   ]});

// ═══ ACT 1 · SURFACE ═══════════════════════════════════════════════════════════════════
chapter('wipe', 'zoneA',
  "With that picture in your head, let's start at the tip of the iceberg, with the four things everyone reaches for.",
  'I', 'Surface level', 'the four everyone reaches for');

rec('push', 'zoneB',
  "Number one on the list: write shorter prompts. You can run this test yourself. I'm asking Claude Code, in print " +
  "mode — that's the dash p flag, one question and one answer, no chat — to reply with just the word hi, and a " +
  "tiny script adds up the bill. It takes a few seconds, because even a one-word answer means sending the whole " +
  "request and waiting for the reply to come back. My prompt was six words, about eight tokens. The request that went out was " +
  "twenty-three thousand eight hundred and eighty-three tokens, most of it served from the cache. So cutting my " +
  "six words down to three would barely move that number. The words you type are the smallest thing in the request. Try it yourself, too: the dash dash output-format " +
  "json flag prints these same numbers for any prompt.",
  null,
  [{take: 'tok-bill', step: 'bill', label: 'one tiny prompt · 2×', at: 0.02}]);

tok('fade', 'zoneA',
  "Here's that same bill with every dot standing for a hundred tokens. Blue dots were served from the cache, and " +
  "purple ones were written into it for next time. My prompt isn't even one whole dot, which means trimming it can't save much. So yes, write clearly, " +
  "because a vague prompt costs you in a different way, and we'll get to that. But the number of words you type " +
  "is not where the bill lives.",
  {kind: 'grain', stageTitle: 'one request, dot by dot',
   stage: [
     {group: 'per', value: 100},
     {group: 'cache', value: 15249, label: '15,249 served from the cache', sub: 'about a tenth of the price', at: 'Blue dots'},
     {group: 'write', value: 8632, label: '8,632 written to the cache', sub: 'kept for next time', at: 'purple ones'},
     {group: 'prompt', value: 8, label: 'my prompt: ~8 tokens', sub: 'not even one dot', at: "My prompt isn't"},
   ]});

tok('iris', 'zoneB',
  "Number two, use a cheaper model, is true, and it's simple. These are Anthropic's list prices for a million " +
  "tokens, and each step up the ladder roughly doubles the price, with Fable at five times Sonnet. Anthropic's own " +
  "advice is that Sonnet handles most coding work and Opus is for the hard architectural calls. Just don't switch " +
  "halfway through a conversation, because of that cache, and we'll see the right way to do it shortly.",
  {kind: 'price', stageTitle: 'list price, per million tokens',
   premise: 'Input price on each tag, output underneath. From Anthropic’s pricing page.',
   stage: [
     {group: 'tag', label: 'Haiku 4.5', value: 1, sub: '$5 out', color: 'green', at: 'list prices'},
     {group: 'tag', label: 'Sonnet 5.5', value: 2, sub: '$10 out', color: 'blue', at: 'a million tokens,'},
     {group: 'tag', label: 'Opus 5.5', value: 4, sub: '$20 out', color: 'purple', at: 'roughly doubles'},
     {group: 'tag', label: 'Fable 5.1', value: 10, sub: '$50 out', color: 'orange', at: 'Fable at five times'},
     {group: 'pick', text: 'Sonnet 5.5', label: 'Sonnet handles most coding work', sub: 'Anthropic’s own advice', at: 'Sonnet handles most'},
   ]});

tok('fade', 'zoneA',
  "Number three is clear the chat sometimes, and it's the word sometimes that's wrong. Every old task you leave in " +
  "the conversation rides along with every message after it, like a backpack you never empty. You fix a bug, then " +
  "ask about the docs, then start a new feature, and that bug fix is still in the bag, still being sent. So clear " +
  "whenever you switch to something unrelated. We'll do it properly with the real command in a minute.",
  {kind: 'backpack', stageTitle: 'stale context rides along',
   stage: [
     {group: 'task', label: 'fix a bug', value: 18, at: 'You fix a bug,'},
     {group: 'task', label: 'ask about the docs', value: 9, at: 'ask about the docs,'},
     {group: 'task', label: 'new feature', value: 14, at: 'start a new feature,'},
     {group: 'task', label: 'next task', value: 6, at: 'still being sent.'},
     {group: 'clear', text: '3', label: '/clear', at: 'clear whenever you switch'},
     {group: 'note', label: 'Clear when the task changes, not now and then.', at: 'something unrelated.'},
   ]});

rec('push', 'zoneB',
  "Number four is turn thinking off. Thinking is the model working a problem through before it answers, and those " +
  "tokens are billed like any other output. But look at what Anthropic says, further down that same page: you " +
  "can't turn off thinking on Opus 5.5, Sonnet 5.5, or the Fable models. They always think a little, which means the switch isn't really " +
  "yours to flip, and they decide for themselves how much.",
  DOCS,
  [{take: 'tok-docs', step: 'thinking2', label: 'the docs disagree', at: 0.3,
    camera: [{frame: 'cant', at: "can't turn off thinking", band: true}, {frame: 'full', at: 'They always think'}]}]);

rec('fade', 'zoneB',
  "So I tested it. First, I set MAX_THINKING_TOKENS to zero here, which is the setting from the bottom of the " +
  "infographic. I'm in PowerShell on Windows, so it's dollar env, colon, then the name. While it works, notice how long this takes. Thinking is slow as well " +
  "as billed, because the model writes out its reasoning before the answer, and every word of that counts as " +
  "output. Next, an awkward little " +
  "counting question at high effort. Sonnet thought for two thousand four hundred and twenty-four tokens anyway, and " +
  "got it right: sixty-three. With effort turned down to low, same question, same setting, it was one thousand five " +
  "hundred and ninety-eight. The switch changed nothing, and the effort dial did. So on the newest models, lower the effort for simple jobs and " +
  "keep it high for the ones that genuinely need it.",
  null,
  [{take: 'tok-thinking', step: 'zero', label: 'thinking “off”', at: 0.02},
   {take: 'tok-thinking', step: 'high', label: 'effort high · 3× speed', at: 0.3},
   {take: 'tok-thinking', step: 'low', label: 'effort low · 3× speed', at: 0.66}]);

tok('fade', 'zoneA',
  "Drawn out, it looks like this. The switch on the wall is thrown, but on the newest models its wire isn't " +
  "connected to anything. What is wired in is the effort level, which you set with slash effort, from low up to " +
  "max, and on Sonnet 5.5 the default is medium. On older models, like Sonnet 4.6, the zero setting still works. " +
  "On the current ones, reach for the dial.",
  {kind: 'switch', stageTitle: 'the switch vs the dial',
   stage: [
     {group: 'switch', label: 'MAX_THINKING_TOKENS=0', at: 'The switch on the wall'},
     {group: 'cut', label: 'not connected on 5.5 or Fable', sub: 'still works on older models like Sonnet 4.6', at: "isn't connected"},
     {group: 'reading', text: 'high', value: 2424, label: 'effort high: 2,424', at: 'the effort level,'},
     {group: 'dial', label: '/effort', at: 'slash effort,'},
     {group: 'reading', text: 'low', value: 1598, label: 'effort low: 1,598', at: 'from low up'},
   ]});

quiz('zoom', 'zoneB',
  "Quick check before we go under the water. You've written one long, detailed prompt, and separately you've had a " +
  "session open all afternoon on unrelated jobs. Which one costs more tokens on your next message? The long prompt, " +
  "the long session, or are they about the same? Have a think, and pause the video if you want longer. Ready? It's " +
  "the long session, because every earlier message rides along with the next one.",
  'Your next message: which costs more?',
  [['one long prompt', 'The long prompt,'], ['a long session', 'the long session,'], ['about the same', 'about the same?']],
  1, 'The whole session is re-sent; the prompt is one slice.', 'Ready?');

// ═══ ACT 2 · TWELVE COMMANDS ═══════════════════════════════════════════════════════════
chapter('wipe', 'zoneA',
  "Now under the water, where the infographic says the real savings are: twelve moves that are nothing more than a " +
  "command you type inside Claude Code.",
  'II', 'What it actually is', 'twelve moves that are only a command');

rec('push', 'zoneB',
  "Start with the one that shows you everything, slash context. In a fresh session, before I've said a word, the " +
  "grid is your context window, which is the most the model can hold at once, and the filled squares are already " +
  "spoken for. Scroll up to the list and the biggest line by far is system tools, nearly twenty-five thousand tokens " +
  "describing what Claude Code can reach for. My own messages come to ten. And every line on that list goes out " +
  "again with every single message, so check this screen before you blame your prompt. It's the quickest way to see where your tokens go, and it " +
  "costs nothing to run.",
  null,
  [{take: 'tok-context', step: 'ctx-up', label: '/context', at: 0.02,
    camera: [{frame: 'tools', at: 'system tools, nearly', band: true}, {frame: 'msgs', at: 'My own messages', band: true},
             {frame: 'full', at: 'every line on that'}]}]);

tok('fade', 'zoneA',
  "Here's that screen redrawn as a jar. The jar is the whole window, a million tokens on Sonnet 5.5, and the " +
  "bright sliver at the bottom is what's already used. Blow the sliver up and it's mostly tool descriptions, then " +
  "skills, then Claude Code's own instructions. That striped band at the top is a buffer kept free, so there's " +
  "always room to summarise when the jar fills. Most of the jar is empty, but everything in the sliver is sent " +
  "every time, which is why it matters more than all that empty space.",
  {kind: 'jar', stageTitle: 'the context window, as a jar',
   stage: [
     {group: 'window', value: 1000, label: '1M-token window', sub: 'Sonnet 5.5', at: 'The jar is the whole window,'},
     {group: 'layer', label: 'instructions', value: 2.4, text: 'system', at: "Claude Code's own instructions."},
     {group: 'layer', label: 'tool descriptions', value: 24.7, text: 'tools', at: "it's mostly tool descriptions,"},
     {group: 'layer', label: 'MCP servers', value: 1.4, text: 'mcp', at: 'Blow the sliver up'},
     {group: 'layer', label: 'skills', value: 2.9, text: 'skills', at: 'then skills,'},
     {group: 'free', label: 'free: 935.6k', at: "what's already used."},
     {group: 'buffer', value: 33, label: '33k buffer', sub: 'room to summarise', at: 'That striped band'},
   ]});

rec('push', 'zoneB',
  "Next up is slash m c p, and it matters because every connected server adds to that list. MCP is the Model Context Protocol, the standard way to plug extra tools into Claude Code, " +
  "and every server you connect brings a pile of tools with it. I've got five here: an Atlassian connector with " +
  "thirty-two tools, Claude Docs, Google Drive, and two more tucked away. If you're not using one today, switch it " +
  "off from this menu.",
  null,
  [{take: 'tok-mcp', step: 'mcp', label: '/mcp', at: 0.05,
    camera: [{frame: 'servers', at: "I've got five", band: true}, {frame: 'atlassian', at: 'an Atlassian connector', band: true},
             {frame: 'full', at: "If you're not using"}]}]);

tok('fade', 'zoneA',
  "The good news is that Claude Code already does the clever part. Tools from MCP servers are deferred by default, " +
  "which means only their names sit on the shelf. A tool's full manual is pulled down and loaded only when Claude " +
  "decides to use it. So a connected server is cheap until it's used — but even an unused one costs its names and " +
  "its instructions, and adding one mid-session can break the cache. Anthropic's docs add one more tip: a " +
  "command-line tool like g h is cheaper than an MCP server doing the same job.",
  {kind: 'shelf', stageTitle: 'names on the shelf, manuals on demand',
   stage: [
     {group: 'spine', label: 'createJiraIssue', at: 'deferred by default,'},
     {group: 'spine', label: 'search_files', at: 'only their names'},
     {group: 'spine', label: 'read_file_content', at: 'sit on the shelf.'},
     {group: 'spine', label: 'getConfluencePage', at: "A tool's full manual"},
     {group: 'spine', label: 'list_recent_files', at: 'pulled down'},
     {group: 'spine', label: 'create_file', at: 'and loaded only'},
     {group: 'spine', label: 'addWorklogToJiraIssue', at: 'when Claude'},
     {group: 'open', text: 'search_files', label: 'search_files: full definition loaded', sub: 'only now, because Claude used it', at: 'decides to use it.'},
     {group: 'note', label: 'Unused servers still cost their names: /mcp', at: 'even an unused one'},
   ]});

rec('push', 'zoneB',
  "Now clearing, done properly. I ask a small question, get the answer, and that task's finished. It's a one-line question, but look at the time " +
  "it takes: Claude reads the file first, because it can't answer about code it hasn't seen, and that read now " +
  "sits in the conversation. Before I move " +
  "on, slash rename gives this conversation a name, so that I'll recognise it later. Then slash clear, and the conversation's gone, " +
  "so the next task starts from the base stack with nothing trailing behind it. Should I ever need the old one " +
  "back, slash resume lists it by that name. According to Anthropic's docs, clear costs nothing at all. It doesn't delete anything from your disk either: " +
  "the old conversation is saved, it just stops being sent with every message, so you lose nothing. Make it a habit.",
  null,
  [{take: 'tok-clear', step: 'ask', label: 'a small task · 2.5×', at: 0.02},
   {take: 'tok-clear', step: 'rename', label: '/rename', at: 0.22},
   {take: 'tok-clear', step: 'clear', label: '/clear', at: 0.36},
   {take: 'tok-clear', step: 'resume', label: '/resume', at: 0.62}]);

rec('push', 'zoneB',
  "Sometimes you can't start again, because you still need the thread, and that's what slash compact is for. " +
  "Here's a conversation with some work in it, and slash context shows how heavy it's getting. Now slash compact, " +
  "and after the command I tell it what to keep: the function names and the test command. Claude writes a " +
  "summary, and the long history is swapped for that summary, so every message after this one carries far less. Compacting takes a little while, because Claude has to read " +
  "the whole conversation to write that summary, and that reading is itself a request you pay for. That's why " +
  "it's best done at a natural break, between tasks, rather than in the middle of one.",
  null,
  [{take: 'tok-compact', step: 'work', label: 'some work · 3× speed', at: 0.02},
   {take: 'tok-compact', step: 'before-up', label: 'before', at: 0.2},
   {take: 'tok-compact', step: 'compact', label: '/compact · 3× speed', at: 0.4}]);

tok('fade', 'zoneA',
  "Think of compact as a press. The whole history goes in and comes out as one short summary. The words you type " +
  "after slash compact are instructions for the press, telling it what must survive. Leave them out and Claude " +
  "decides what matters, which means it might not be what you'd choose. Put them in, and the function names and the test " +
  "command make it through while the rest is squeezed out.",
  {kind: 'press', stageTitle: 'compact: squeeze it, say what to keep',
   stage: [
     {group: 'msg', label: 'read shop/prices.py', at: 'The whole history'},
     {group: 'msg', label: 'read shop/cart.py', at: 'goes in'},
     {group: 'msg', label: 'apply_discount: price after a discount'},
     {group: 'msg', label: 'with_tax: adds the 8% tax'},
     {group: 'msg', label: 'Cart.add / subtotal / total'},
     {group: 'msg', label: 'the test command'},
     {group: 'plate', label: '/compact keep the function names…', at: 'The words you type'},
     {group: 'keep', label: 'function names', text: 'apply_discount: price after a discount', at: 'the function names'},
     {group: 'keep', label: 'the test command', text: 'the test command', at: 'and the test'},
   ]});

rec('push', 'zoneB',
  "When you've gone down the wrong path entirely, don't compact — rewind. I make a change I wanted, then a change " +
  "I didn't — here, renaming a setting across the file, and let's say that was a mistake. Slash rewind, or escape pressed twice, lists every point in the conversation you can jump back to, " +
  "with the option of restoring the code as well. Pick the point just before the wrong turn, and choose whether " +
  "to restore the conversation, the code, or both. Everything after that point is dropped, so the next message " +
  "carries a shorter history that the cache has already seen. It's an undo button, and it's cheaper than asking " +
  "Claude to fix its own mistake.",
  null,
  [{take: 'tok-rewind', step: 'one', label: 'wanted · 3× speed', at: 0.02},
   {take: 'tok-rewind', step: 'two', label: 'not wanted · 3× speed', at: 0.22},
   {take: 'tok-rewind', step: 'rewind', label: '/rewind', at: 0.46}]);

tok('fade', 'zoneA',
  "Why is rewind the cheaper of the two? Because it just snips the conversation back to an earlier turn, and " +
  "everything before the snip is exactly what the cache already holds, so the next message reads it cheaply. " +
  "Compact has to read the whole conversation to write its summary, and that summary is new text the cache has " +
  "never seen. So if you're abandoning a path, rewind; if you need to keep going, compact.",
  {kind: 'rewind', stageTitle: 'rewind vs compact',
   stage: [
     {group: 'lane', label: '/rewind', at: 'it just snips'},
     {group: 'lane', label: '/compact', at: 'Compact has to read'},
     {group: 'turn', label: 'turn 1', at: 'Why is'},
     {group: 'turn', label: 'turn 2', at: 'rewind the'},
     {group: 'turn', label: 'turn 3', at: 'cheaper of'},
     {group: 'turn', label: 'turn 4', at: 'the two?'},
     {group: 'turn', label: 'turn 5', at: 'Because it'},
     {group: 'cut', text: '3', label: 'what is left is still cached', at: 'what the cache already holds,'},
     {group: 'rebuild', label: 'a new summary: written fresh', at: 'new text the cache'},
   ]});

rec('push', 'zoneB',
  "Slash autocompact decides when Claude Code compacts on its own. On Sonnet 5.5 the window is a million tokens, " +
  "and by default it waits until you're close to the end of it. I'll set it to two hundred thousand, and slash " +
  "context confirms the new window straight away. From now on it squeezes the conversation much earlier, and that's a trade-off we'll look at on the next screen.",
  null,
  [{take: 'tok-autocompact', step: 'set', label: '/autocompact 200k', at: 0.3},
   {take: 'tok-autocompact', step: 'ctx-up', label: 'the new window', at: 0.45,
}]);

tok('fade', 'zoneA',
  "Why would you want it to compact sooner? Because history is re-sent on every turn, so what you really pay for " +
  "is the area under this curve. Both rows do the same work. With the default window the conversation climbs close " +
  "to a million before it's squeezed, while at two hundred thousand it's squeezed much earlier, and the area — " +
  "everything re-sent — shrinks with it. The trade-off is that each compaction loses a little detail, which is " +
  "exactly why the compact instructions matter.",
  {kind: 'window', stageTitle: 'what gets re-sent is the area',
   premise: 'Context size over one long session. Same work in both rows; only the compaction point moves.',
   stage: [
     {group: 'axis', value: 1000},
     {group: 'limit', value: 967, label: 'default', sub: '~967k', at: 'With the default window'},
     {group: 'limit', value: 200, label: '200k', sub: '/autocompact 200k', at: 'at two hundred thousand'},
     {group: 'note', label: 'Smaller window, smaller area, less detail.', at: 'The trade-off'},
   ]});

rec('push', 'zoneB',
  "Next, the at mention. First, a vague question: where's the tax rate set in this project? Claude has to search " +
  "for it before it can answer. Then the same question with the file named, at shop slash prices dot p y, and Claude " +
  "Code puts that file straight into the conversation. On a thirteen-line project the difference is tiny, one " +
  "search against one read, but in a big codebase that search is where the tokens go. If you know which file it is, say so, and Claude won't " +
  "go looking.",
  null,
  [{take: 'tok-mention', step: 'vague', label: 'vague · 2.5× speed', at: 0.02},
   {take: 'tok-mention', step: 'mention', label: '@-mention · 2.5× speed', at: 0.42}]);

tok('fade', 'zoneA',
  "Scaled up to a bigger project, the vague question fans out: search, open a file, open another, and every file it " +
  "opens joins the stack and is re-sent on every turn after that. The mention is one straight line to the one file " +
  "that matters. Anthropic's docs put it the same way, that vague requests trigger broad scanning. Name the file " +
  "when you know it.",
  {kind: 'fan', stageTitle: 'a vague question vs a named file',
   premise: 'On a larger codebase. Every file Claude opens stays in the conversation.',
   stage: [
     {group: 'ask', text: 'vague', label: 'where is the tax rate set?', at: 'the vague question'},
     {group: 'ask', text: 'mention', label: '@shop/prices.py tax rate?', at: 'The mention'},
     {group: 'file', label: 'shop/cart.py'},
     {group: 'file', label: 'shop/prices.py'},
     {group: 'file', label: 'tests/test_prices.py'},
     {group: 'file', label: 'CLAUDE.md'},
     {group: 'read', text: 'CLAUDE.md', at: 'search,'},
     {group: 'read', text: 'shop/cart.py', at: 'open a file,'},
     {group: 'read', text: 'shop/prices.py', at: 'open another,'},
     {group: 'read', text: 'tests/test_prices.py', at: 'every file it'},
     {group: 'hit', text: 'shop/prices.py', at: 'one straight line'},
     {group: 'tally', text: 'vague', label: 'searches, then reads', at: 'joins the stack'},
     {group: 'tally', text: 'mention', label: 'one file, no search', at: 'that matters.'},
   ]});

tok('fade', 'zoneB',
  "Mention it once is the same idea seen from the other side. Once a file or a log is in the conversation, it stays " +
  "in the stack for good. Paste it in again and you've got two copies, and both of them ride along on every turn " +
  "that follows. If it's already there, just refer to it by name, because nothing " +
  "leaves the stack until you clear or compact.",
  {kind: 'twice', stageTitle: 'mention it once',
   stage: [
     {group: 'turn', label: 'turn 1', at: 'Mention it once'},
     {group: 'paste', text: '0', label: 'error.log', at: 'in the conversation,'},
     {group: 'turn', label: 'turn 2', at: 'stays in'},
     {group: 'turn', label: 'turn 3', at: 'Paste it in again'},
     {group: 'paste', text: '2', label: 'error.log', at: 'Paste it in again'},
     {group: 'turn', label: 'turn 4', at: 'two copies,'},
     {group: 'turn', label: 'turn 5', at: 'ride along'},
     {group: 'note', label: 'Already there? Refer to it by name.', at: 'every turn that follows.'},
   ]});

rec('push', 'zoneB',
  "Slash model opens the model picker, with a line on what each one's good at: Sonnet 5.5 is down as the most " +
  "efficient for simpler tasks, and Haiku as the fastest. I'll keep Sonnet, because it's what most of my work needs. Then slash effort, set to low for quick " +
  "jobs, and notice it's saved as the default for new sessions too.",
  null,
  [{take: 'tok-model', step: 'model', label: '/model', at: 0.02},
   {take: 'tok-model', step: 'close', label: 'keep Sonnet', at: 0.5},
   {take: 'tok-model', step: 'effort', label: '/effort low', at: 0.6}]);

tok('fade', 'zoneA',
  "Those two controls behave very differently with the cache. Changing the effort level on Sonnet 5.5, Opus 5.5 or " +
  "Fable keeps the cache, so the seal holds. Switching the model breaks it, because every model keeps its own " +
  "cache, which means the next message re-reads the whole conversation at full price. Pick your model at the start " +
  "of a session, and turn the effort dial as often as you like.",
  {kind: 'seal', stageTitle: 'effort keeps the cache, model swaps break it',
   stage: [
     {group: 'model', label: 'Sonnet 5.5', sub: 'this session', at: 'Those two controls'},
     {group: 'level', label: 'low'}, {group: 'level', label: 'medium', text: 'default'}, {group: 'level', label: 'high'},
     {group: 'level', label: 'xhigh'}, {group: 'level', label: 'max'},
     {group: 'set', text: 'high', label: 'changed: cache kept', at: 'keeps the cache,'},
     {group: 'kept', label: 'effort change: cache kept', at: 'the seal holds.'},
     {group: 'swap', label: 'Opus 5.5', sub: 'switched mid-session', at: 'Switching the model breaks'},
     {group: 'broken', label: 'model swap: everything re-read', at: 'at full price.'},
   ]});

rec('push', 'zoneB',
  "Slash loop runs a prompt on a timer. Here it's set to run the tests every thirty minutes and only tell me if one " +
  "fails, and you can see it scheduled, then straight away run the first check. It's useful, and it's on this list " +
  "because each time it fires, the whole context goes out again.",
  null,
  [{take: 'tok-loop', step: 'loop', label: '/loop 30m · 2× speed', at: 0.05}]);

tok('fade', 'zoneA',
  "Every tick of that clock is a full request, because a scheduled prompt is just another message, even while " +
  "you're away from the keyboard. So a loop in a heavy " +
  "session is expensive, and the same loop in a fresh, light one is cheap. Give it the longest interval you can " +
  "live with. Leave the interval out altogether and Claude picks one itself, waiting longer when nothing's " +
  "happening, which is kinder on your limits.",
  {kind: 'clock', stageTitle: 'every tick re-sends the stack',
   stage: [
     {group: 'interval', value: 30, label: 'every 30m', at: 'Every tick'},
     {group: 'stack', label: 'the whole conversation, again'},
     {group: 'fire', label: '09:00', at: 'a full request,'},
     {group: 'fire', label: '09:30', at: 'away from the keyboard.'},
     {group: 'fire', label: '10:00', at: 'a heavy session'},
     {group: 'fire', label: '10:30', at: 'a fresh, light one'},
     {group: 'result', label: 'Light session, long interval.', at: 'the longest interval'},
   ]});

quiz('zoom', 'zoneB',
  "Another quick one. You've spent twenty minutes on a fix that turned out to be the wrong approach, and you want " +
  "to try again from where you started. Do you clear, compact, or rewind? Have a think, and pause if you'd like a " +
  "moment. Ready? Rewind, because it goes back to a point the cache already holds, and you keep everything before " +
  "the wrong turn.",
  'Wrong approach, 20 minutes in. Which?',
  [['/clear', 'Do you clear,'], ['/compact', 'compact,'], ['/rewind', 'or rewind?']],
  2, 'Rewind goes back to a point the cache already holds.', 'Ready?');

// ═══ ACT 3 · NINE TO SET UP ════════════════════════════════════════════════════════════
chapter('wipe', 'zoneA',
  "That's the twelve commands. At the bottom of the iceberg are nine moves you set up once, with a file, a flag, or " +
  "something typed before claude, and then they keep paying off.",
  'III', 'The deeper level', 'nine that need setting up');

rec('push', 'zoneB',
  "CLAUDE.md is the project notes file Claude Code loads at the start of every session, which means it's paid for on every message. In this one, somebody's " +
  "pasted three whole workflows: the release checklist, the database migration steps and the code review routine. " +
  "Slash context calls it memory files, at twelve point eight thousand tokens on every message, whatever you're " +
  "working on. With the same workflows moved into a skill, memory drops to a hundred and three tokens, and the " +
  "skill costs about thirty, because until it's used only its one-line description is loaded. That's twelve thousand tokens you stop paying " +
  "for on every message, just by moving text into a different file.",
  null,
  [{take: 'tok-claudemd', step: 'ctx-up', label: 'a bloated CLAUDE.md', at: 0.24,
    camera: [{frame: 'memory', at: 'calls it memory files,', band: true}]},
   {take: 'tok-skills', step: 'ctx-up', label: 'moved into a skill', at: 0.55}]);

tok('fade', 'zoneA',
  "Picture every session as a trip. CLAUDE.md rides along on every single one. A skill waits at home and sends " +
  "only its label, until the one trip that actually needs it. Anthropic's advice is to keep CLAUDE.md under two " +
  "hundred lines, holding only what's true for every task. Specific instructions belong there; whole procedures " +
  "belong in skills.",
  {kind: 'trips', stageTitle: 'CLAUDE.md every trip; a skill when needed',
   stage: [
     {group: 'trip', label: 'fix a bug', at: 'every session'},
     {group: 'trip', label: 'add a test', at: 'as a trip.'},
     {group: 'md', value: 12.8, label: 'CLAUDE.md, workflows pasted in', at: 'CLAUDE.md rides along'},
     {group: 'trip', label: 'cut a release', at: 'A skill waits'},
     {group: 'stub', label: 'other trips: its description only, ~30 tokens', at: 'only its label,'},
     {group: 'trip', label: 'review a PR', at: 'the one trip'},
     {group: 'skill', value: 12.7, label: 'release skill', text: 'cut a release', at: 'actually needs it.'},
     {group: 'note', label: 'Under 200 lines: facts, not procedures.', at: 'under two'},
   ]});

rec('push', 'zoneB',
  "These next three belong together. First, quiet flags. Run the tests the chatty way, with dash v, and you get a " +
  "line for every test. The quiet way, dash q, gives the same result in two lines. Counted, that's forty-eight " +
  "lines against two for the same forty passing tests. Second, the two or three commands you run all day go in " +
  "CLAUDE.md, so Claude never has to work out how to run them. Third comes the compact instructions section, which " +
  "tells slash compact what to keep every time without you typing it. Small savings each, but they happen on every " +
  "single run. Set these three up once, and you never have to think about them again.",
  null,
  [{take: 'tok-quiet', step: 'loud', label: 'the chatty run', at: 0.04},
   {take: 'tok-quiet', step: 'quiet', label: 'the quiet run', at: 0.2},
   {take: 'tok-quiet', step: 'count', label: '48 lines vs 2', at: 0.3},
   {take: 'tok-quiet', step: 'md', label: 'written down once', at: 0.5}]);

tok('fade', 'zoneA',
  "Whatever a command prints, Claude reads, and whatever Claude reads joins the stack for the rest of the " +
  "conversation. So a quiet flag works like a funnel: forty-eight lines go in the top and the two that matter come " +
  "out the bottom. Most tools have one, which is why it's worth checking the help for the commands you run most. Pip has dash q, npm has dash dash silent, and git log has dash dash one line.",
  {kind: 'sieve', stageTitle: 'whatever it prints, Claude reads',
   stage: [
     {group: 'pour', label: 'pytest -v', sub: '48 lines', at: 'Whatever a command prints,'},
     {group: 'line', label: 'tests/test_prices.py::test_apply_discount[100-0-100] PASSED'},
     {group: 'line', label: 'tests/test_prices.py::test_apply_discount[100-10-90] PASSED'},
     {group: 'line', label: 'tests/test_prices.py::test_apply_discount[100-25-75] PASSED'},
     {group: 'line', label: 'tests/test_prices.py::test_with_tax[100-108] PASSED'},
     {group: 'line', label: 'tests/test_prices.py::test_with_tax[0-0] PASSED'},
     {group: 'line', label: 'tests/test_prices.py::test_cart_total[items0-0-6.48] PASSED'},
     {group: 'line', label: 'tests/test_prices.py::test_cart_total[items1-10-19.44] PASSED'},
     {group: 'flag', label: '-q', at: 'works like a funnel:'},
     {group: 'out', label: '40 passed', sub: '2 lines', at: 'come out the bottom.'},
   ]});

tok('fade', 'zoneB',
  "And here's why those commands belong in CLAUDE.md. Without them, Claude has to go hunting: is there a config " +
  "file, a makefile, a readme, and which test runner is this? Every guess is a read, and every read stays in the " +
  "stack. Pin two lines in CLAUDE.md and it simply reads the card instead, which costs almost nothing and never guesses " +
  "wrong.",
  {kind: 'card', stageTitle: 'write the commands down once',
   stage: [
     {group: 'hunt', label: 'pyproject.toml?', at: 'is there a config'},
     {group: 'hunt', label: 'setup.cfg?', at: 'file,'},
     {group: 'hunt', label: 'Makefile?', at: 'a makefile,'},
     {group: 'hunt', label: 'README.md?', at: 'a readme,'},
     {group: 'hunt', label: 'pytest or unittest?', at: 'which test runner'},
     {group: 'found', label: 'every guess is a read that stays', at: 'Every guess is a read,'},
     {group: 'pin', label: 'Run tests: python -m pytest -q', at: 'Pin two lines'},
     {group: 'pin', label: 'One file: python -m pytest -q tests/…', at: 'in CLAUDE.md'},
     {group: 'note', label: 'It reads the card instead of hunting.', at: 'reads the card'},
   ]});

rec('push', 'zoneA',
  "Next, run it in a subagent. A subagent is a helper Claude can hand a job to, and it works in its own separate " +
  "conversation. Here's a six-thousand-line log, and a helper defined in its own small file. Look at this line, " +
  "model colon haiku, because that's another move from the list. I ask Claude to have the log digger find the " +
  "errors, the helper reads the whole log on Haiku in the background, and all that comes back to my conversation " +
  "is the answer: three error lines. It ran in the background while the main conversation waited for the note, and " +
  "the log itself never entered my conversation, so it isn't sent again with every message after this.",
  null,
  [{take: 'tok-subagent', step: 'size', label: 'the log and the helper', at: 0.1,
    camera: [{frame: 'haiku', at: 'model colon haiku,', band: true}]},
   {take: 'tok-subagent', step: 'dig', label: 'handed off · 3× speed', at: 0.54}]);

tok('fade', 'zoneB',
  "Think of it as a side room. The six thousand lines pile up in there, not in your main conversation, and the " +
  "subagent reads them, writes a short note, and only the note comes back through the door. Because its own file " +
  "says model colon haiku, the reading is done at a dollar per million tokens instead of two. Anthropic's docs do " +
  "point out that the subagent's own requests still count, so it saves most on big, noisy jobs.",
  {kind: 'room', stageTitle: 'a subagent works in its own room',
   stage: [
     {group: 'side', label: 'log-digger', sub: 'model: haiku', at: 'a side room.'},
     {group: 'load', label: 'logs/app.log · 6,000 lines', at: 'The six thousand lines'},
     {group: 'main', label: 'your conversation', sub: 'stays light', at: 'your main conversation,'},
     {group: 'slip', label: '3 ERROR lines', sub: 'the answer, nothing else', at: 'only the note comes back'},
     {group: 'note', label: 'Its own requests still count.', at: 'a dollar per million'},
   ]});

rec('push', 'zoneA',
  "Fast mode is where the infographic needs a footnote. Slash fast describes itself as a high-speed mode for Opus " +
  "5.5 that draws from usage credits at a higher rate, and on my Pro plan it won't even switch on without those " +
  "credits. So fast mode is never a saving in itself, because it's Opus only, at twice the price.",
  null,
  [{take: 'tok-fast', step: 'fast', label: '/fast', at: 0.08,
    camera: [{frame: 'what', at: 'a high-speed mode', band: true}, {frame: 'credits', at: "it won't even switch", band: true}]}]);

tok('fade', 'zoneB',
  "So why is it on the list at all? Because of when you switch it on. The first time fast mode goes on in a " +
  "conversation, everything so far is billed again, once, at the fast rate, and that comes straight from " +
  "Anthropic's fast mode page. At turn one, that toll is small. Forty turns in, it's the entire conversation. If " +
  "you're going to use fast mode, turn it on at the start, never midway.",
  {kind: 'toll', stageTitle: 'fast mode: a one-time toll on the past',
   premise: 'Bars are the context at each turn. The gate re-bills everything before it, once, at the fast rate.',
   stage: [
     {group: 'turn', label: 't1', value: 31, at: 'So why'},
     {group: 'turn', label: 't5', value: 48, at: 'on the list'},
     {group: 'turn', label: 't10', value: 70, at: 'when you switch'},
     {group: 'turn', label: 't20', value: 112, at: 'The first time'},
     {group: 'turn', label: 't30', value: 150, at: 'everything so far'},
     {group: 'turn', label: 't40', value: 190, at: 'at the fast rate,'},
     {group: 'gate', text: '0', label: 'on at turn one', sub: 'a small toll', at: 'At turn one,'},
     {group: 'gate', text: '5', label: 'on at turn forty', sub: 'the whole conversation', at: 'Forty turns in,'},
     {group: 'rate', label: 'Turn it on at the start, never midway.', at: "it's the entire conversation."},
   ]});

rec('push', 'zoneA',
  "The last move on the infographic is ENABLE_PROMPT_CACHING_1H equals one, marked only if you use an API key, and " +
  "Anthropic's caching page explains why. On a subscription, the main conversation already gets a one-hour cache, " +
  "while an API key defaults to five minutes. Further down is the setting itself, which asks for an hour. And " +
  "remember the bill from the start? All eight thousand six hundred tokens it wrote to the cache were kept for an " +
  "hour on my Pro plan, with no setting at all. In other words, the flag only helps if you pay per token through an API key, and even " +
  "then only if you take breaks, which is exactly what the next picture shows.",
  CACHEDOCS,
  [{take: 'tok-cachedocs', step: 'ttl', label: 'who gets which cache', at: 0.12,
    camera: [{frame: 'table', at: 'already gets a one-hour', band: true}]},
   {take: 'tok-cachedocs', step: 'flag', label: 'the setting, in the docs', at: 0.48},
   {take: 'tok-bill', step: 'bill', label: 'kept 1 hour · 2× speed', at: 0.6, source: 'our own run, on a Pro plan'}]);

tok('fade', 'zoneB',
  "So, on an API key, is it worth turning on? That depends on your breaks. Writing to the one-hour cache costs " +
  "twice the normal input price, against one and a quarter for five minutes. Step away for twenty minutes, and the " +
  "five-minute cache has already gone, so your next message pays for the whole conversation again, while the " +
  "one-hour cache is still warm. For long sittings with breaks, turn it on. For quick bursts that never pause, it " +
  "just costs more.",
  {kind: 'ttl', stageTitle: 'five minutes or an hour',
   stage: [
     {group: 'clock', value: 5, label: '5 min', sub: 'write: 1.25× input', at: 'one and a quarter'},
     {group: 'clock', value: 60, label: '1 hour', sub: 'write: 2× input', at: 'the one-hour cache costs'},
     {group: 'pause', value: 20, label: 'you step away for 20 minutes', at: 'Step away for twenty minutes,'},
     {group: 'verdict', text: '0', label: 'expired: next message pays again', at: 'has already gone,'},
     {group: 'verdict', text: '1', label: 'still warm', at: 'is still warm.'},
   ]});

quiz('zoom', 'zoneA',
  "Last one. On an API key, you work in a single twenty-minute burst and never pause for more than a minute. Should " +
  "you turn on the one-hour cache? Yes, no, or it makes no difference? Take a second, and pause the video if you " +
  "need to. Ready? No, because the five-minute cache never goes cold, and the one-hour one just costs more to write.",
  'API key, no pauses. Turn on the 1-hour cache?',
  [['yes', 'Yes,'], ['no', 'no,'], ['no difference', 'makes no difference?']],
  1, 'The 5-minute cache never expires; 1 hour costs more to write.', 'Ready?');

// ═══ ACT 4 · VERDICT ═══════════════════════════════════════════════════════════════════
chapter('dip', 'zoneB',
  "Time for the verdict: which of the 21 actually matter? Let's sort them by what they change.",
  'IV', 'The verdict', 'all 21, sorted by what they change');

tok('fade', 'zoneA',
  "Sorted by what each one really does to the bill, some shrink what rides in the stack: slash clear, compact, a " +
  "lean CLAUDE.md, quiet flags, subagents, and switching off unused MCP servers. Others keep the cache working, like " +
  "choosing your model at the start, rewinding instead of compacting, and turning fast mode on early or not at all. " +
  "A few make each token cheaper: the right model and a Haiku subagent. And two did nothing here — turning thinking " +
  "off, and writing shorter prompts. In the end, the infographic's headline held up. Almost none of it is your " +
  "prompt.",
  {kind: 'board', stageTitle: 'the 21, sorted',
   stage: [
     {group: 'bin', text: 'shrink', label: 'Shrink the stack', color: 'green', at: 'some shrink what rides'},
     {group: 'bin', text: 'cache', label: 'Keep the cache', color: 'blue', at: 'Others keep the cache'},
     {group: 'bin', text: 'cheap', label: 'Cheaper tokens', color: 'purple', at: 'A few make each token'},
     {group: 'bin', text: 'none', label: 'No effect here', color: 'red', at: 'two did nothing'},
     {group: 'move', text: 'shrink', label: '/clear', at: 'slash clear,'},
     {group: 'move', text: 'shrink', label: '/compact', at: 'compact, a'},
     {group: 'move', text: 'shrink', label: 'lean CLAUDE.md', at: 'lean CLAUDE.md,'},
     {group: 'move', text: 'shrink', label: 'quiet flags', at: 'quiet flags,'},
     {group: 'move', text: 'shrink', label: 'subagents', at: 'subagents, and'},
     {group: 'move', text: 'shrink', label: '/mcp', at: 'unused MCP servers.'},
     {group: 'move', text: 'shrink', label: '@-mention · once', at: 'unused MCP servers.'},
     {group: 'move', text: 'shrink', label: '/autocompact', at: 'unused MCP servers.'},
     {group: 'move', text: 'cache', label: '/model at the start', at: 'choosing your model'},
     {group: 'move', text: 'cache', label: '/rewind', at: 'rewinding instead'},
     {group: 'move', text: 'cache', label: 'fast mode early', at: 'fast mode on early'},
     {group: 'move', text: 'cache', label: '1h cache (API key)', at: 'or not at all.'},
     {group: 'move', text: 'cheap', label: 'cheaper model', at: 'the right model'},
     {group: 'move', text: 'cheap', label: 'model: haiku', at: 'a Haiku subagent.'},
     {group: 'move', text: 'cheap', label: '/effort', at: 'a Haiku subagent.'},
     {group: 'move', text: 'none', label: 'thinking off', at: 'turning thinking off,'},
     {group: 'move', text: 'none', label: 'shorter prompts', at: 'writing shorter prompts.'},
   ]});

c.add('RECAP', 'fade', 'zoneB',
  "If you only do four things after watching this, check slash context once so you know what's riding along. " +
  "Clear between tasks, because old work rides along. Pick your model at the start and use the effort dial instead of switching. And keep " +
  "CLAUDE.md for facts, with every long procedure moved into a skill.",
  (A) => ({
    heading: 'If you only do four things',
    points: [
      {text: 'Look at /context once', atWord: A(0.14)},
      {text: '/clear between tasks', atWord: A(0.38)},
      {text: 'Choose the model early; use /effort', atWord: A(0.52)},
      {text: 'CLAUDE.md for facts, skills for procedures', atWord: A(0.76)},
    ],
  }));

c.add('OUTRO_CTA', 'dip', 'zoneA',
  "The infographic is by Charlie Hills, and his Substack is linked in the description, along with Anthropic's cost " +
  "and caching pages that every claim here was checked against. Which of the twenty-one were you already doing? Let " +
  "me know in the comments. Thanks for watching.",
  () => ({
    headline: 'Almost none of it is your prompt',
    subtext: 'Infographic: Charlie Hills · docs: code.claude.com/docs/en/costs',
  }));

// ── emit ──────────────────────────────────────────────────────────────────────────────
const spec = {
  meta: {
    topic: '21 ways to save Claude Code tokens, tested',
    format: 'long',
    fps: 30,
    subject: 'Claude Code',
    subjectKind: 'an AI coding agent that runs in your terminal, made by Anthropic',
    audioPrefix: 'claude-code-21-token-savers_long',
    onePayoff: "why Claude Code re-sends the whole conversation on every request, which makes your prompt a rounding error, and which of the 21 moves actually shrink the bill",
    openLoop: 'How does one word end up costing twenty-three thousand tokens?',
    topicAxes: ['workflow', 'myth-bust'],
    screenplay: 'documentary',
    seo: {
      title: 'Claude Code Essentials 2026: Save Your Tokens & Money (21 Tips I Tested)',
      altTitles: [
        'I Said Hi To Claude Code. It Sent 23,883 Tokens.',
        'You Can’t Turn Thinking Off: 21 Claude Code Token Tips, Tested',
        'Where Your Claude Code Tokens Actually Go (21 Fixes, Tested)',
      ],
      hook:
        'I asked Claude Code to say hi and it sent 23,883 tokens. We take a popular infographic of 21 ways to save ' +
        'Claude Code tokens, try every one of them on camera, and check each against Anthropic’s own documentation ' +
        '— including two that do nothing on Sonnet 5.5.',
      description:
        'Claude Code sends your full conversation with every request, so what you pay for is the context riding ' +
        'along, not your prompt. We test all 21 moves from Charlie Hills’ infographic in a live Claude Code session ' +
        '(Sonnet 5.5, Windows, Pro plan): /context, /mcp, /clear, /rename, /resume, /compact, /rewind, /autocompact, ' +
        '@-mentions, /model, /effort, /loop, CLAUDE.md vs skills, quiet flags, subagents on Haiku, fast mode, ' +
        'MAX_THINKING_TOKENS and the one-hour prompt cache. Where Anthropic’s docs disagree with the infographic, we ' +
        'say so and show the evidence.',
      pinned: 'Which of the 21 were you already doing — and which one surprised you?',
      sources: [
        'Infographic "21 ways to save Claude tokens" by Charlie Hills — charliehills.substack.com',
        'Claude Code — Manage costs effectively (Anthropic): code.claude.com/docs/en/costs',
        'Claude Code — How Claude Code uses prompt caching (Anthropic): code.claude.com/docs/en/prompt-caching',
        'Claude Code — Model configuration (Anthropic): code.claude.com/docs/en/model-config',
        'Claude Code — Fast mode (Anthropic): code.claude.com/docs/en/fast-mode',
        'Claude API pricing (Anthropic): platform.claude.com/docs/en/about-claude/pricing',
      ],
      queries: [
        'how to save tokens in claude code',
        'claude code usage limit',
        'claude code context command',
        'claude code compact vs clear',
        'claude code max thinking tokens',
        'claude code prompt caching',
        'claude code cost',
      ],
      tags: 'claude code,claude code tokens,save tokens,claude code tips,claude code usage limit,/context,/compact,' +
        '/clear,prompt caching,claude.md,claude skills,subagents,sonnet 5.5,anthropic,ai coding agent',
    },
  },
  brand: c.brand(),
  thumbnail: {"layout":"hero","badge":"CLAUDE CODE ESSENTIALS 2026","title":"Use Claude Code [Like a Pro]","note":"SAVE YOUR TOKENS & MONEY · UNDER 25 MIN","art":"si:claude","asset":"si:claude"},
  scenes: c.S,
};

if (MISSES.length) { console.error(`✗ ${MISSES.length} anchor phrase(s) not found:\n  ` + MISSES.join('\n  ')); process.exit(1); }
c.emit('topics/claude-code-21-token-savers/long.json', spec);
