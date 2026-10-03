// Agent Reach — the SHORT. One surprise, shown, then stop: the first search on X fails with a 404,
// and the working copy of the tool was one step further back, in its GitHub source.
import {short} from '../../scripts/lib/apple-build.mjs';

const c = short();
const norm = (x) => x.replace(/[^\w'$.%]/g, '').toLowerCase().replace(/[.]+$/, '');
const MISSES = [];
const wordIndex = (narration, phrase) => {
  const w = narration.split(/\s+/), p = phrase.split(/\s+/);
  for (let i = 0; i < w.length; i++) if (p.every((x, j) => norm(w[i + j] ?? '') === norm(x))) return i + 1;
  MISSES.push(`"${phrase}"`);
  return 1;
};
const ar = (transition, bg, narration, body) =>
  c.add('AR_STAGE', transition, bg, narration, () => ({
    ...body,
    stage: (body.stage ?? []).map(({at, ...it}) => ({...it, atWord: at ? wordIndex(narration, at) : 1})),
  }));

c.add('HOOK', 'dip', 'zoneA',
  "Agent Reach says your AI agent can read X for free. My first search failed.",
  (A) => ({
    headline: 'Agent Reach: Does It Work?',
    subtext: 'I tried it on X and Reddit.',
    heroAsset: 'lucide:eye',
    hookVariant: 'ask',
    atWord: A(0.5),
  }));

const N0 = "Here is Agent Reach on GitHub. Eighty-nine thousand stars, free, and it sets up the tools an AI agent needs " +
  "to read sites like X.";
c.add('RECORDED_STEP', 'push', 'zoneB', N0,
  (A) => ({
    sourceNote: 'github.com/Panniantong/Agent-Reach · MIT licence',
    clips: [{ref: 'rec:ar-repo#top', label: 'the official repo', focus: false, atWord: A(0.02), wantAtWord: A(0.02),
      zooms: [{marks: ['desc', 'stars'], wantAtWord: wordIndex(N0, 'on GitHub.')}],
      callouts: []}],
  }));

ar('fade', 'zoneA',
  "For X, a small program carries the login cookie from your own browser, so X sees you, not a robot, and " +
  "there's no are-you-human check at all.",
  {kind: 'key', color: 'blue', stageTitle: 'no robot check',
   stage: [
     {group: 'robot', label: 'a robot browser', sub: 'Are you a robot?', icon: 'lucide:bot', at: 'not a robot,'},
     {group: 'door', label: 'X', icon: 'si:x', at: 'For X, a'},
     {group: 'browser', label: 'your browser', sub: 'logged in', icon: 'si:googlechrome', at: 'your own browser,'},
     {group: 'key', label: 'your cookie', at: 'the login cookie'},
     {group: 'cli', label: 'twitter-cli', icon: 'lucide:terminal', at: 'a small program'},
     {group: 'pass', label: 'let through as you', at: 'so X sees you,'},
   ]});

const N1 = "So I installed the X tool and ran my first search. The search failed. X answered with a four-oh-four, which means " +
  "not found.";
c.add('RECORDED_STEP', 'fade', 'zoneB', N1,
  (A) => ({
    clips: [{ref: 'rec:ar-x#fail', label: 'the first search · 2×', focus: false, atWord: A(0.02), wantAtWord: A(0.02),
      zooms: [{marks: ['__cmd', 'err'], wantAtWord: wordIndex(N1, 'The search failed.')}], callouts: []}],
  }));

ar('slide', 'zoneA',
  "The packaged release was behind, and the fix was already sitting in the tool's source code on GitHub.",
  {kind: 'crate', color: 'blue', stageTitle: 'same tool, two places to get it',
   stage: [
     {group: 'gate', label: 'X', icon: 'si:x', at: 'The packaged release'},
     {group: 'old', label: 'PyPI', sub: 'v0.8.5', at: 'The packaged release'},
     {group: 'err', label: '404', at: 'was behind,'},
     {group: 'new', label: 'source', sub: 'v0.8.6', at: 'already sitting in'},
     {group: 'ok', label: 'the source build works', at: "tool's source code"},
   ]});

const N2 = "Installed from its GitHub source, the same search works: three posts from Claude's official account, " +
  "each with its likes and views. No browser, and no paid API.";
c.add('RECORDED_STEP', 'fade', 'zoneB', N2,
  (A) => ({
    clips: [{ref: 'rec:ar-x#search', label: 'the same search · 2×', focus: false, atWord: A(0.02), wantAtWord: A(0.02),
      zooms: [{marks: ['__cmd', 'ok'], wantAtWord: wordIndex(N2, 'the same search works:')}], callouts: []}],
  }));

c.add('OUTRO_CTA', 'dip', 'zoneA',
  "Reddit, YouTube and a live AI agent are in the full video.",
  () => ({headline: 'Agent Reach, tested', subtext: 'full hands-on on the channel'}));

const spec = {
  meta: {
    topic: 'Agent Reach on X: the first search failed',
    format: 'short',
    fps: 30,
    subject: 'Agent Reach',
    subjectKind: 'a free, open-source Python command-line installer and health checker that sets up the programs an AI agent uses to read X, Reddit, YouTube, GitHub and other sites',
    audioPrefix: 'agent-reach-hands-on_short',
    onePayoff: 'the first X search failed with a 404 on the packaged release and worked from the GitHub source',
    openLoop: 'Why did the first search on X fail?',
    topicAxes: ['hands-on', 'review'],
    screenplay: 'explainer',
    seo: {
      title: 'I Let My AI Agent Read X For Free. The First Search Failed. #aiagents #agentreach',
      altTitles: ['Agent Reach, Tested On X: 404, Then It Worked #ai'],
      hook: 'I tested Agent Reach, the free project that lets an AI agent read X. My first search came back with a 404, and here is what fixed it.',
      description:
        'Agent Reach sets up the programs an AI agent uses to read X, Reddit and YouTube. On X, the packaged ' +
        'release of twitter-cli answered with a 404; the build from its GitHub source worked. The full hands-on, ' +
        'with Reddit, YouTube subtitles and a live Claude Code session, is on the channel.',
      pinned: 'Would you connect your AI agent to X?',
      sources: [
        'Agent Reach by Panniantong (MIT): github.com/Panniantong/Agent-Reach — package: agent-reach',
        'twitter-cli: github.com/public-clis/twitter-cli',
      ],
      queries: ['agent reach', 'ai agent read twitter', 'twitter-cli 404'],
      tags: 'agent reach,ai agent,twitter cli,claude code,read twitter without api,open source ai,shorts',
    },
  },
  brand: c.brand(),
  cover: {
    title: 'My AI Agent Read X For Free',
    badge: 'AGENT REACH',
    note: 'THE FIRST TRY FAILED',
    art: 'lucide:eye',
    asset: 'lucide:eye',
    frames: 2,
  },
  scenes: c.S,
};

if (MISSES.length) { console.error('✗ phrases not found: ' + MISSES.join(', ')); process.exit(1); }
c.emitShort('topics/agent-reach-hands-on/shorts.json', spec);
