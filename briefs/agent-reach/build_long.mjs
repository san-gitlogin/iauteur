// Agent Reach, hands-on — WIDE CUT.
//
// Facts: briefs/agent-reach/FACTS.md (the project's own README and the probe on this machine) and the
// takes in public/rec/ar-* (every number spoken below is read off a take's own frame).
// The tool prints Chinese; the script translates it. Where the README and the machine disagreed, the
// machine wins and the narration says so.
//
// Anchors: every drawn element names the PHRASE that introduces it (`at`), resolved to a word index
// here, so an element lands on its own words. Every beat ends on a landing sentence after its last anchor.
//
// Durations: cut() estimates at 9.5 frames a word, which is the measured Ava rate, so a "runs longer
// than it earns" warning here is REAL (the x0.8 rule in VIDEO_METHOD is for 12-frame estimates).
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

const GH = 'github.com/Panniantong/Agent-Reach · MIT licence';
const README = 'Agent Reach README · github.com/Panniantong/Agent-Reach';

/** A RECORDED_STEP beat. clips: {take, step, label, at (fraction), camera: [{frame, at, band}], notes: [{text, mark, at, side, color}]} */
const rec = (transition, bg, narration, source, clips, extra = {}) =>
  c.add('RECORDED_STEP', transition, bg, narration, (A) => ({
    clips: clips.map((k) => ({
      ref: `rec:${k.take}#${k.step}`, label: k.label, focus: k.focus ?? true, atWord: A(k.at ?? 0.03),
      // The solver owns atWord and otherwise pushes the last clip towards the end of the read; wantAtWord
      // pins each clip to the words that introduce it.
      wantAtWord: A(k.at ?? 0.03),
      ...(k.source ? {sourceNote: k.source} : {}),
      zooms: (k.camera ?? []).map((m) => (m.frame === 'full'
        ? {at: 'full', wantAtWord: wordIndex(narration, m.at)}
        : {marks: [].concat(m.frame), ...(m.band ? {band: true} : {}), wantAtWord: wordIndex(narration, m.at)})),
      callouts: (k.notes ?? []).map((n) => ({text: n.text, mark: n.mark ?? null, side: n.side ?? 'right',
        color: n.color ?? 'blue', wantAtWord: wordIndex(narration, n.at)})),
    })),
    ...(source ? {sourceNote: source} : {}),
    ...extra,
  }));

/** An AR_STAGE beat. stage items carry `at: 'phrase'`; everything else is passed through. */
const ar = (transition, bg, narration, body, source) => {
  const sc = c.add('AR_STAGE', transition, bg, narration, () => ({
    ...body,
    stage: (body.stage ?? []).map(({at, ...it}) => ({...it, atWord: at ? wordIndex(narration, at) : 1})),
  }));
  if (source) sc.data.source = source;
  return sc;
};

const chapter = (transition, bg, narration, number, title, subtitle) =>
  c.add('CHAPTER', transition, bg, narration, (A) => ({number, title, subtitle, atWord: A(0.2)}));

// ═══ OPEN ════════════════════════════════════════════════════════════════════════════════
c.add('HOOK', 'dip', 'zoneA',
  "Agent Reach says your AI agent can read X and Reddit free. I tested it.",
  (A) => ({
    headline: 'Agent Reach: Does It Work?',
    subtext: 'X · Reddit · YouTube · GitHub — installed and tested',
    heroAsset: 'lucide:eye',
    hookVariant: 'ask',
    atWord: A(0.5),
  }));

rec('zoom', 'zoneB',
  "Here's where we'll end up. On screen is X, searched from a plain terminal — the latest posts from Claude's " +
  "official account — with no browser window and no paid API. And next is Reddit: this week's most talked-about " +
  "posts on Claude Code, pulled the same way. By the end you'll know how to set up both, and where the setup " +
  "didn't go smoothly for me.",
  null,
  [{take: 'ar-x', step: 'search', label: 'X search · 2× speed', at: 0.02,
    camera: [{frame: ['__cmd', 'stats'], at: 'searched from a plain'}]},
   {take: 'ar-reddit', step: 'search', label: 'Reddit · 2× speed', at: 0.44,
    camera: [{frame: ['__cmd', 'more'], at: "this week's most"}]}]);

c.add('TITLE_CARD', 'fade', 'zoneA',
  "Welcome to the channel. Today we're going to install Agent Reach, a free project, and try the " +
  "platforms it promises: YouTube, X and Reddit. Everything it prints is in Chinese, so I'll " +
  "translate. Does it hand an AI agent the whole internet?",
  (A) => ({
    title: 'Agent Reach, hands-on',
    subtitle: 'installed, translated and tested',
    atWord: A(0.3),
  }));

rec('push', 'zoneB',
  "So, what is Agent Reach? Here's its official page on GitHub, and you can open the same page yourself, because " +
  "the link's in the description. On the right, the summary says it plainly: give your AI agent eyes to see the " +
  "entire internet. Read and search Twitter, Reddit, YouTube and GitHub, with one command-line tool and zero API " +
  "fees. An API fee, by the way, is what a platform charges a program for reading its data. Under the summary " +
  "you'll find the MIT license, which means the project is free to use, even at work. And the star count, " +
  "GitHub's version of a like, sits at eighty-nine thousand. So plenty of people rely on a project most English " +
  "speakers have never heard of, and I wanted to know whether it holds up.",
  GH,
  [{take: 'ar-repo', step: 'top', label: 'the official repo', at: 0.02,
    camera: [{frame: ['desc', 'stars'], at: 'On the right, the'}, {frame: ['desc', 'license'], at: 'the MIT license,'},
             {frame: ['desc', 'stars'], at: 'the star count,'}],
    notes: [{text: 'what the project says about itself', mark: 'desc', at: 'says it plainly:', side: 'left', color: 'blue'},
            {text: 'free to use, even at work', mark: 'license', at: 'free to use,', side: 'left', color: 'green'},
            {text: '89 thousand stars', mark: 'stars', at: 'eighty-nine thousand.', side: 'left', color: 'yellow'}]},
   {take: 'ar-repo', step: 'zh', label: 'down to the README', at: 0.84, focus: false}]);

rec('zoom', 'zoneA',
  "Now for the catch. Scroll down to the README, which is a project's front page, and the headline about your AI " +
  "agent is written in Chinese. You don't need to read Chinese to follow along, because your browser can do the " +
  "work. In Chrome, right-click anywhere on the page and choose Translate to English. A moment later the same " +
  "headline reads: equip your AI agent with internet capabilities with a single click. Under the address bar, the small " +
  "Google Translate panel lets you flip back to the original whenever you like. A machine " +
  "translation is a little stiff, but more than good enough to follow. Its author has also written an English " +
  "README by hand, so that's the version I'll quote from next.",
  GH,
  [{take: 'ar-translate', step: 'zh', label: 'README in Chinese · 2×', at: 0.02, focus: false,
    camera: [{frame: 'tagline', at: 'headline about your AI', band: true}, {frame: 'full', at: "You don't need"}]},
   {take: 'ar-translate', step: 'menu', label: 'right-click → Translate', at: 0.36, focus: false,
    notes: [{text: 'right-click, then Translate to English', mark: 'item', at: 'right-click anywhere', color: 'green'}]},
   {take: 'ar-translate', step: 'translated', label: 'now in English · 2×', at: 0.48, focus: false,
    // The camera goes from the translated headline to Chrome's own panel, then lets go. A callout on the panel
    // while the camera was still on the headline pointed at the edge of the frame (proof sheet, 2026-10-03).
    camera: [{frame: 'tagline', at: 'equip your AI agent', band: true}, {frame: 'panel', at: 'Google Translate panel', band: true},
             {frame: 'full', at: 'A machine translation'}]}]);

// ═══ WHAT IT IS ══════════════════════════════════════════════════════════════════════════
ar('wipe', 'zoneB',
  "Why would anyone need this? Picture your AI agent — an AI that can run commands, like Claude Code. " +
  "The trouble starts where the good discussions live. " +
  "According to the README, X charges for its official API, and moderate use comes to about two hundred and " +
  "fifteen dollars a month. Reddit answers a server with error four-oh-three, which means forbidden. " +
  "XiaoHongShu, a Chinese review app, wants a login before you can browse. And Bilibili, China's answer to " +
  "YouTube, blocks visitors from overseas servers. So that's the problem " +
  "Agent Reach sets out to solve.",
  {kind: 'gates', color: 'blue', stageTitle: 'what stops a program at each platform',
   premise: 'Your AI agent on the left. Each platform on the right has its own barrier, as the README lists them.',
   stage: [
     {group: 'agent', label: 'your AI agent', icon: 'lucide:bot', at: 'Picture your AI agent'},
     {group: 'gate', label: 'X (Twitter)', icon: 'si:x', sub: 'a paid API', at: 'X charges'},
     {group: 'gate', label: 'Reddit', icon: 'si:reddit', sub: '403 forbidden', at: 'Reddit answers'},
     {group: 'gate', label: 'XiaoHongShu', icon: 'si:xiaohongshu', sub: 'login required', at: 'XiaoHongShu, a Chinese'},
     {group: 'gate', label: 'Bilibili', icon: 'si:bilibili', sub: 'blocked overseas', at: 'And Bilibili,'},
   ]},
  README);

rec('fade', 'zoneA',
  "Here's the English README. At the top, the promise is one-click access to the entire internet, with the most " +
  "reliable access path for each platform chosen, installed and health-checked for you. Hold on to those two " +
  "words, access path, because they're the whole idea. Just below sits the table we drew a moment ago: the price " +
  "of the X API, and Reddit turning servers away. Then come the supported platforms. Any web page is returned as " +
  "clean Markdown, which is plain text with simple formatting. X needs a cookie, and I'll explain what a cookie " +
  "is when we get there. Further down is YouTube, with subtitles and search. And for Reddit, the README admits " +
  "there's no zero-config path, because Reddit blocks anonymous visitors. So even the project's own page tells " +
  "you that two of the big names will take some effort, which I appreciated.",
  README,
  [{take: 'ar-readme', step: 'top', label: 'the English README', at: 0.02,
    camera: [{frame: 'tagline', at: 'one-click access', band: true}, {frame: 'promise', at: 'reliable access path', band: true}]},
   {take: 'ar-readme', step: 'pain', label: 'why it is hard', at: 0.34,
    camera: [{frame: 'reddit', at: 'Reddit turning servers', band: true}]},
   {take: 'ar-readme', step: 'platforms', label: 'supported platforms', at: 0.5,
    camera: [{frame: 'web', at: 'clean Markdown,', band: true}, {frame: 'x', at: 'X needs a cookie,', band: true}]},
   {take: 'ar-readme', step: 'platforms2', label: 'further down the table', at: 0.7,
    camera: [{frame: 'yt', at: 'with subtitles and search.', band: true}, {frame: 'reddit', at: 'no zero-config path,', band: true}]}]);

ar('slide', 'zoneB',
  "So what is Agent Reach, really? Most people get this part wrong, and I did too at first. Agent Reach doesn't " +
  "read anything itself. Its author calls it a capability layer, so picture a thin shelf sitting between your " +
  "agent and a set of ordinary tools. That shelf has four jobs. First, the shelf picks the tool that currently " +
  "works for each platform. Second, it installs that tool. Third, it checks the tool is healthy. And fourth, it " +
  "tells your agent which one to use. After that, your agent calls those tools directly — yt-dlp for YouTube, " +
  "the GitHub command line for GitHub, twitter-cli for X. Nothing sits in the middle, which means I can run " +
  "every one of them by hand in this video and show you exactly what your agent would see.",
  {kind: 'layer', color: 'blue', stageTitle: 'a layer, not another tool',
   premise: 'Agent Reach is the shelf in the middle. The tools underneath do the reading; the agent calls them itself.',
   stage: [
     {group: 'agent', label: 'your AI agent', sub: 'Claude Code, Cursor…', icon: 'lucide:bot', at: 'So what is'},
     {group: 'layer', label: 'Agent Reach', sub: 'the capability layer', at: 'capability layer,'},
     {group: 'job', label: 'picks', icon: 'lucide:list-checks', at: 'the shelf picks'},
     {group: 'job', label: 'installs', icon: 'lucide:download', at: 'it installs that tool.'},
     {group: 'job', label: 'checks', icon: 'lucide:stethoscope', at: 'it checks the tool'},
     {group: 'job', label: 'routes', icon: 'lucide:signpost', at: 'it tells your agent'},
     {group: 'tool', label: 'Jina Reader', icon: 'lucide:globe', at: 'calls those tools directly'},
     {group: 'tool', label: 'yt-dlp', icon: 'si:youtube', at: 'yt-dlp for YouTube,'},
     {group: 'tool', label: 'gh', icon: 'si:github', at: 'the GitHub command'},
     {group: 'tool', label: 'twitter-cli', icon: 'si:x', at: 'twitter-cli for X.'},
     {group: 'tool', label: 'rdt-cli', icon: 'si:reddit', at: 'twitter-cli for X.'},
     {group: 'direct', label: 'the agent calls the tools itself', sub: 'nothing in between', at: 'calls those tools directly'},
   ]},
  README);

ar('fade', 'zoneA',
  "Tools for reading these sites break all the time, because the sites " +
  "keep changing. So for every platform, Agent Reach keeps an ordered list of tools: a first choice, then " +
  "fallbacks. Take Bilibili. Its first choice used to be yt-dlp. In June, " +
  "according to the README, Bilibili started refusing it with an error four-one-two. So the list was reordered: " +
  "a tool called bili-cli took over, OpenCLI waits behind it, and a plain search API sits last. Anyone who had " +
  "Agent Reach installed, the README says, didn't have to do a thing.",
  {kind: 'plugs', color: 'blue', stageTitle: 'one platform, an ordered list of tools',
   premise: 'The green cable is the tool in use. When a tool stops working, the cable moves to the next one down.',
   stage: [
     {group: 'platform', label: 'Bilibili', icon: 'si:bilibili', at: 'Take Bilibili.'},
     {group: 'back', label: 'yt-dlp', sub: 'refused with a 412 in June', text: 'dead', icon: 'lucide:download', at: 'started refusing it'},
     {group: 'back', label: 'bili-cli', sub: 'in use now', icon: 'lucide:terminal', at: 'bili-cli took over,'},
     {group: 'back', label: 'OpenCLI', sub: 'waiting behind it', icon: 'lucide:app-window', at: 'OpenCLI waits behind'},
     {group: 'back', label: 'search API', sub: 'the last resort', icon: 'lucide:search', at: 'a plain search API'},
   ]},
  README);

// ═══ 1 · INSTALL ═════════════════════════════════════════════════════════════════════════
chapter('dip', 'zoneB',
  "Right. Enough reading. Let's install Agent Reach on a clean setup and see what it actually does.",
  '1', 'Install it', 'one package, one read-only check');

rec('zoom', 'zoneA',
  "I'm starting in a fresh Python environment, which is an empty box for packages, so nothing here can touch the " +
  "rest of my computer. Installing is one line: pip, Python's package installer, pointed straight at the " +
  "project's GitHub address. I've sped this part up, because in real time the install took a little over two " +
  "minutes. Next comes agent-reach install. Look at the first thing it prints: safe mode. In safe mode the " +
  "installer only looks. It checks what's on your computer and changes nothing, so you'd have to add a flag " +
  "called system before it's allowed to install anything more. Near the end, one line confirms it: no changes " +
  "were made. Further up, the report says a helper called mcporter is not installed, which we'll need later for " +
  "web search. And those stray codes in square brackets are only a display bug in the installer. So after one " +
  "install command, the only new thing on this computer is the package itself.",
  null,
  [{take: 'ar-install', step: 'pip', label: 'pip install · 12× speed', at: 0.02,
    camera: [{frame: 'ok', at: 'a little over two', band: true}]},
   {take: 'ar-install', step: 'check', label: 'agent-reach install · 2×', at: 0.3,
    camera: [{frame: 'safe', at: 'safe mode. In', band: true}, {frame: 'full', at: "It checks what's"},
             {frame: 'done', at: 'no changes were made.', band: true}, {frame: 'mcp', at: 'mcporter is not', band: true},
             {frame: 'full', at: 'So after one'}]}]);

ar('push', 'zoneB',
  "Before we read the health check, you need three symbols, because Agent Reach only prints Chinese. A green tick " +
  "means ready to use. An exclamation mark in square brackets means installed, but still waiting for setup or a " +
  "login. And an X in square brackets means not installed. Learn those three and the whole screen opens up.",
  {kind: 'lamps', color: 'green', stageTitle: 'the three symbols, translated',
   premise: 'The tool’s own Chinese legend on top, and what each symbol means underneath.',
   stage: [
     {group: 'lamp', label: '✅ 可用', sub: 'ready to use', text: 'ok', at: 'A green tick'},
     {group: 'lamp', label: '[!] 已装但需配置/登录', sub: 'installed — needs setup or login', text: 'warn', at: 'installed, but still'},
     {group: 'lamp', label: '[X] 未安装', sub: 'not installed', text: 'off', at: 'not installed.'},
   ]});

rec('zoom', 'zoneA',
  "Now the health check itself, a command called agent-reach doctor. Up top is that legend. YouTube has the " +
  "green tick, so videos and subtitles are ready. RSS feeds are ready too, and so is reading any web page. GitHub " +
  "has the exclamation mark, because the GitHub tool is here but the doctor hasn't confirmed I'm logged in. Next, the " +
  "line with the X is web search, which is waiting for the mcporter helper. And at the bottom, the score: five of " +
  "sixteen channels available. A channel is simply one platform Agent Reach can reach. So a fresh install gives " +
  "you five, and the other eleven each need something from you. Getting them is what the rest of this video is about.",
  null,
  [{take: 'ar-install', step: 'doctor', label: 'agent-reach doctor · 2×', at: 0.02,
    camera: [{frame: ['__cmd', 'status'], at: 'a command called'}, {frame: 'gh', at: 'GitHub has the exclamation', band: true},
             {frame: 'full', at: 'And at the bottom,'}],
    notes: [{text: 'YouTube: ready', mark: 'yt', at: 'YouTube has the', side: 'right', color: 'green'},
            {text: 'web search: not installed yet', mark: 'exa', at: 'the line with', side: 'right', color: 'red'},
            {text: '5 of 16 channels available', mark: 'status', at: 'five of sixteen', side: 'right', color: 'green'}]}]);

ar('slide', 'zoneB',
  "Here are all sixteen at a glance. Five lit up straight after installing: web pages, YouTube, RSS feeds, and two " +
  "Chinese sites, the developer forum V2EX and Bilibili. GitHub and web search are one small step away. X and " +
  "Reddit need you to be logged in. And the rest — Facebook, Instagram and LinkedIn, plus a handful of Chinese " +
  "platforms — need a logged-in desktop browser or extra setup, so I'm leaving those out today and sticking to " +
  "the ones most of you will use.",
  {kind: 'board', color: 'green', stageTitle: 'sixteen channels, after a fresh install',
   premise: 'Green is ready now. Yellow needs a login or one more step. Grey is not set up in this video.',
   stage: [
     {group: 'ch', label: 'Web pages', icon: 'lucide:globe', text: 'ok', sub: 'ready', at: 'web pages,'},
     {group: 'ch', label: 'YouTube', icon: 'si:youtube', text: 'ok', sub: 'ready', at: 'YouTube, RSS'},
     {group: 'ch', label: 'RSS feeds', icon: 'si:rss', text: 'ok', sub: 'ready', at: 'RSS feeds,'},
     {group: 'ch', label: 'V2EX', icon: 'si:v2ex', text: 'ok', sub: 'ready', at: 'forum V2EX'},
     {group: 'ch', label: 'Bilibili', icon: 'si:bilibili', text: 'ok', sub: 'ready', at: 'and Bilibili.'},
     {group: 'ch', label: 'GitHub', icon: 'si:github', text: 'login', sub: 'login check', at: 'GitHub and web'},
     {group: 'ch', label: 'Web search', icon: 'lucide:search', text: 'login', sub: 'one helper', at: 'GitHub and web'},
     {group: 'ch', label: 'X', icon: 'si:x', text: 'login', sub: 'needs login', at: 'X and Reddit'},
     {group: 'ch', label: 'Reddit', icon: 'si:reddit', text: 'login', sub: 'needs login', at: 'X and Reddit'},
     {group: 'ch', label: 'Facebook', icon: 'si:facebook', text: 'off', sub: 'skipped', at: 'Facebook, Instagram'},
     {group: 'ch', label: 'Instagram', icon: 'si:instagram', text: 'off', sub: 'skipped', at: 'Facebook, Instagram'},
     {group: 'ch', label: 'LinkedIn', icon: 'lucide:briefcase', text: 'off', sub: 'skipped', at: 'Facebook, Instagram'},
     {group: 'ch', label: 'XiaoHongShu', icon: 'si:xiaohongshu', text: 'off', sub: 'skipped', at: 'a handful of'},
     {group: 'ch', label: 'Xueqiu', icon: 'lucide:chart-candlestick', text: 'off', sub: 'skipped', at: 'a handful of'},
     {group: 'ch', label: 'Xiaoyuzhou', icon: 'lucide:podcast', text: 'off', sub: 'skipped', at: 'a handful of'},
     {group: 'ch', label: 'Boss Zhipin', icon: 'lucide:id-card', text: 'off', sub: 'skipped', at: 'a handful of'},
     {group: 'tally', label: 'ready after a fresh install', at: 'straight after installing:'},
   ]});

// ═══ 2 · NO LOGIN ════════════════════════════════════════════════════════════════════════
chapter('dip', 'zoneA',
  "Let's start with everything that works with no login at all.",
  '2', 'No login needed', 'web pages, YouTube, RSS, GitHub, search');

ar('wipe', 'zoneB',
  "How is your agent meant to use all this? You don't learn any commands. You simply ask, in plain words, and a " +
  "small instruction file that Agent Reach installs — the project calls it a skill — points the agent at the " +
  "right tool. Read this link goes to a free service called Jina Reader. What does this video cover goes to " +
  "yt-dlp. Search GitHub goes to the GitHub command line. And subscribe to this feed goes to a Python library " +
  "called feedparser. I'm going to run each of those by hand now, so you can see exactly what your agent gets back.",
  {kind: 'signpost', color: 'blue', stageTitle: 'what you ask, and where it goes',
   premise: 'Your request on the left. Each arm of the signpost is the tool the skill file points the agent to.',
   stage: [
     {group: 'ask', label: 'you say', at: 'How is your'},
     {group: 'arm', label: 'curl r.jina.ai/URL', sub: '“Read this link”', icon: 'lucide:globe', at: 'Read this link'},
     {group: 'arm', label: 'yt-dlp', sub: '“What does this video cover?”', icon: 'si:youtube', at: 'What does this video'},
     {group: 'arm', label: 'gh search repos', sub: '“Search GitHub for…”', icon: 'si:github', at: 'Search GitHub goes'},
     {group: 'arm', label: 'feedparser', sub: '“Subscribe to this feed”', icon: 'si:rss', at: 'And subscribe to'},
   ]},
  README);

rec('zoom', 'zoneA',
  "First, a web page. I'm asking Jina Reader for Wikipedia's article on the Model Context Protocol, and I've kept " +
  "just the first few lines. Look at what arrives: a title, the source address, and then the article as clean " +
  "text, with no adverts, no menus and no scripts. Clean text matters because an AI reads words, so every bit of " +
  "clutter you strip out is something it doesn't have to wade through. One Windows tip: type " +
  "curl dot e-x-e, because plain curl means something else in PowerShell. Next, YouTube search, with yt-dlp. I " +
  "asked for five results for what is Claude Code, and here they are — the channel on the left, the title on " +
  "the right — without opening a browser.",
  null,
  [{take: 'ar-read', step: 'web', label: 'a web page as text · 2×', at: 0.02,
    camera: [{frame: 'title', at: 'a title, the', band: true}, {frame: 'src', at: 'the source address,', band: true},
             {frame: 'full', at: 'Clean text matters'}]},
   {take: 'ar-read', step: 'ytsearch', label: 'YouTube search · 3×', at: 0.78,
    camera: [{frame: '__cmd', at: 'asked for five results'}]}]);

ar('iris', 'zoneB',
  "Search is handy, but the next feature is the one I'd install Agent Reach for. A video is the worst thing you " +
  "can hand an AI, because it can't sit and watch for half an hour. But nearly every YouTube video carries " +
  "subtitles, and subtitles are just text with timestamps. So yt-dlp skips the video completely and downloads " +
  "only the words. I'm Boris, I'm an engineer. I'm a product manager. What people build. Line by line, a " +
  "four-minute video turns into a small text file, which means your agent can read it, summarise it, or search " +
  "inside it.",
  {kind: 'reel', color: 'blue', stageTitle: 'a video, turned into text',
   premise: 'The film strip is the video. Each line on the right is a subtitle line from it, as plain text.',
   stage: [
     {group: 'video', label: 'Introducing Claude Code', sub: 'Anthropic · 3:55', at: 'A video is'},
     {group: 'line', label: "I'm Boris I'm an engineer I'm cat", at: "I'm Boris,"},
     {group: 'line', label: "I'm a product manager we love seeing", at: "I'm a product"},
     {group: 'line', label: 'what people build with quad especially', at: 'What people build.'},
     {group: 'read', label: 'text your agent can read', sub: 'the video itself is never downloaded', at: 'small text file,'},
   ]},
  'Captions: “Introducing Claude Code” (Anthropic), YouTube');

rec('zoom', 'zoneA',
  "Here's the actual command. Its options say: write the automatic subtitles, in English, and skip the download " +
  "of the video itself. One line near the bottom tells you it worked, writing video subtitles. " +
  "Open the file, and there's the start of the video as plain text. Now look closely. You'll " +
  "read quad where the speakers are saying Claude. Why? Because these are YouTube's automatic captions, and " +
  "automatic captions mishear names. An AI reading them will usually work the name out from context, but it's " +
  "worth knowing the text isn't perfect. Also, on my first attempt, with a different video, " +
  "YouTube refused with a too-many-requests error. So subtitles work, but YouTube does push back when it's asked " +
  "too often.",
  null,
  [{take: 'ar-read', step: 'subs', label: 'subtitles only · 3×', at: 0.02,
    camera: [{frame: '__cmd', at: 'write the automatic'}, {frame: 'wrote', at: 'writing video subtitles,', band: true}],
    notes: [{text: 'the words only — no video file', mark: 'wrote', at: 'tells you it worked,', color: 'green'}]},
   {take: 'ar-read', step: 'read', label: 'the video as text · 3×', at: 0.27,
    camera: [{frame: 'kind', at: 'automatic captions,'}],
    notes: [{text: 'auto-captions: “quad” below is “Claude”', mark: 'kind', at: 'read quad where', side: 'right', color: 'orange'}]}]);

rec('fade', 'zoneB',
  "Three quick ones. RSS is the feed format most blogs still publish, and here are the six latest headlines from " +
  "GitHub's own blog, from one line of Python. GitHub search runs through gh, GitHub's official tool: five " +
  "repositories about agent skills, sorted by stars. To be straight with you, that one only worked " +
  "since I was already logged in to gh. Logged out, gh refused and asked me to sign in, so the README's " +
  "zero-config label is a bit generous there. Last, web search, through a service called Exa. Web search needed " +
  "the mcporter helper from earlier, installed with one npm command. No API " +
  "key was involved, and the first result is the project's own GitHub page.",
  null,
  [{take: 'ar-read', step: 'rss', label: 'an RSS feed · 3×', at: 0.02,
    camera: [{frame: '__cmd', at: 'latest headlines from'}]},
   {take: 'ar-read', step: 'gh', label: 'GitHub search · 2×', at: 0.24,
    camera: [{frame: 'count', at: 'five repositories about', band: true}, {frame: 'full', at: 'Logged out, gh'}],
    notes: [{text: 'only worked logged in', mark: 'head', at: 'already logged in', side: 'bottom', color: 'orange'}]},
   {take: 'ar-exa', step: 'search', label: 'Exa web search · 3×', at: 0.7,
    camera: [{frame: '__cmd', at: 'the mcporter helper'}]}]);

// ═══ 3 · LOGINS ══════════════════════════════════════════════════════════════════════════
chapter('dip', 'zoneA',
  "Now the two everyone asks about, and the two that fight back the hardest: X and Reddit.",
  '3', 'X and Reddit', 'the ones that need your login');

ar('push', 'zoneB',
  "If you've ever tried to automate a browser on X or Reddit, you know what happens. The site spots a robot, and " +
  "you get the are-you-human check, or a temporary block. Agent Reach's tools take a different road, and here's " +
  "why it works. When you log in to X in your own browser, X hands that browser a " +
  "cookie. A cookie is a small piece of text that says: this person is already logged in. For X, two values " +
  "matter, called auth token and c-t-zero. You copy those two values out of your browser once and give them to a " +
  "small program. Then the program asks X for data the way your browser would, carrying your cookie. So " +
  "there's no fake browser for X to catch, because there's no browser at all — only a small program that X " +
  "recognises as you.",
  {kind: 'key', color: 'blue', stageTitle: 'why the robot check never shows up',
   premise: 'Top lane: an automated browser, stopped. Bottom lane: your own cookie, carried by a small program.',
   stage: [
     {group: 'robot', label: 'an automated browser', sub: 'Are you a robot?', icon: 'lucide:bot', at: 'automate a browser'},
     {group: 'door', label: 'X', icon: 'si:x', at: 'The site spots'},
     {group: 'browser', label: 'your own browser', sub: 'already logged in', icon: 'si:googlechrome', at: 'in your own browser,'},
     {group: 'key', label: 'auth_token', at: 'auth token'},
     {group: 'key', label: 'ct0', at: 'c-t-zero.'},
     {group: 'cli', label: 'twitter-cli', sub: 'a small program', icon: 'lucide:terminal', at: 'small program. Then'},
     {group: 'pass', label: 'let through as you', sub: 'nothing for X to detect', at: 'the program asks X'},
   ]});

c.add('QUIZ_CARD', 'fade', 'zoneA',
  "Quick check before we run it. Why doesn't X show the are-you-a-robot test to this program? Is it A, because " +
  "Agent Reach pays for the official API? B, because the program carries the cookie from a browser where you've " +
  "already logged in? Or C, because it hides behind a proxy server? Have a think, and pause the video if you want " +
  "longer. Ready? The answer is B. There's no payment and no proxy, because the program simply shows X your own login.",
  (A, n, narration) => ({
    question: 'Why is there no “are you a robot?” check?',
    answerIndex: 1,
    why: 'The program carries your own login cookie. No API fee, no proxy.',
    atWord: 1,
    options: [
      {text: 'It pays for the official API', atWord: wordIndex(narration, 'Is it A,')},
      {text: 'It carries your logged-in cookie', atWord: wordIndex(narration, 'B, because the program')},
      {text: 'It hides behind a proxy', atWord: wordIndex(narration, 'Or C,')},
    ],
    revealAtWord: wordIndex(narration, 'Ready?'),
  }));

rec('zoom', 'zoneB',
  "I've put my two cookie values into the terminal beforehand, off camera, because they're as " +
  "sensitive as a password. Then I install the X tool, twitter-cli, from PyPI, which is Python's package index. " +
  "And I run my first search: posts about Claude Code from Claude's official account. And the search fails. X " +
  "answers with a four-oh-four, which means not found. Notice the warning too: failed to init " +
  "client transaction. So the very first thing I tried on X didn't work — and that failure is the most " +
  "useful moment in this video, because it's exactly what Agent Reach claims to protect you from.",
  null,
  [{take: 'ar-x', step: 'pip', label: 'install twitter-cli', at: 0.02,
    camera: [{frame: '__cmd', at: 'install the X tool,'}]},
   {take: 'ar-x', step: 'fail', label: 'the first search · 2×', at: 0.36,
    camera: [{frame: '__cmd', at: 'my first search:'}],
    notes: [{text: 'X refused the request: HTTP 404', mark: 'err', at: 'the search fails.', color: 'red'}]}]);

ar('slide', 'zoneA',
  "So what went wrong? I can't tell you what changed on X's side. What I can show you is where the working copy " +
  "was. On PyPI, the packaged release of twitter-cli, version zero point eight point five, got a four-oh-four. " +
  "But the tool's developers had already moved on in their source code on GitHub, to version zero point eight " +
  "point six, and that newer version hadn't been published as a package yet. So a working tool existed. That fix " +
  "was simply one step further back than the usual install command reaches.",
  {kind: 'crate', color: 'blue', stageTitle: 'same tool, two places to get it',
   premise: 'Two copies of twitter-cli heading for X: the packaged release, and the newer source on GitHub.',
   stage: [
     {group: 'gate', label: 'X', icon: 'si:x', at: 'So what went'},
     {group: 'old', label: 'PyPI', sub: 'v0.8.5', at: 'the packaged release'},
     {group: 'err', label: '404', at: 'got a four-oh-four.'},
     {group: 'new', label: 'GitHub', sub: 'v0.8.6', at: 'in their source code'},
     {group: 'ok', label: 'the source build gets through', sub: 'not yet published as a package', at: 'So a working tool'},
   ]});

ar('wipe', 'zoneB',
  "Here's where the ordered list earns its keep. For X, the README lists twitter-cli first, then OpenCLI, which " +
  "borrows your logged-in browser, and then an older tool called bird. Agent Reach's job is to notice when the " +
  "first choice is broken and move you along. In my case the first choice wasn't dead, because it only needed " +
  "the newer build — so the newer build is what I installed.",
  {kind: 'plugs', color: 'green', stageTitle: 'the list for X, from the README',
   premise: 'The green cable is the tool in use for X. The others are the fallbacks, in order.',
   stage: [
     {group: 'platform', label: 'X', icon: 'si:x', at: 'For X, the'},
     {group: 'back', label: 'twitter-cli', sub: 'first choice — needed the newer build', icon: 'lucide:terminal', at: 'twitter-cli first,'},
     {group: 'back', label: 'OpenCLI', sub: 'borrows your logged-in browser', icon: 'lucide:app-window', at: 'then OpenCLI,'},
     {group: 'back', label: 'bird', sub: 'an older tool', icon: 'lucide:bird', at: 'tool called bird.'},
   ]},
  README);

rec('zoom', 'zoneA',
  "So I install twitter-cli again, this time straight from its GitHub source. Same search, same cookies. And " +
  "there's the result: fetched three posts, each with its likes, reposts and views beside it. Yes, the warning's " +
  "still printed, but the search works. Here's a second command, the latest posts from Anthropic's account, and " +
  "that works too. Now Reddit. Reddit's tool is called rdt, and it carries my Reddit session cookie in exactly " +
  "the same way. I ask for this week's posts about Claude Code and get five results, with the score, the " +
  "subreddit, the title and the number of comments. Notice what never appeared, on either site: the " +
  "are-you-a-robot page. Both sites treated these requests as me, sitting at my own browser, because that's " +
  "exactly what the cookie tells them.",
  null,
  [{take: 'ar-x', step: 'fix', label: 'install from source · 4×', at: 0.02},
   {take: 'ar-x', step: 'search', label: 'the same search · 2×', at: 0.13,
    camera: [{frame: 'ok', at: 'fetched three posts,', band: true}, {frame: 'full', at: "the warning's still"}],
    notes: [{text: 'three posts fetched', mark: 'ok', at: 'reposts and views', color: 'green'}]},
   {take: 'ar-x', step: 'posts', label: 'a second command · 2×', at: 0.3,
    camera: [{frame: 'who', at: "posts from Anthropic's account,", band: true}]},
   {take: 'ar-reddit', step: 'search', label: 'Reddit, this week · 2×', at: 0.52,
    camera: [{frame: 'count', at: 'get five results,', band: true}, {frame: 'head', at: 'subreddit, the title'}]}]);

ar('wipe', 'zoneB',
  "A word of caution before you copy me, because this part matters. Those cookies are keys to your account. " +
  "Anyone who gets hold of them can act as you, without ever knowing your password. So here are three rules I'd " +
  "follow. One: use a spare account if you can, not your main one, because these are unofficial tools and a " +
  "platform can restrict an account that uses them. Two: stick to reading. twitter-cli can also post, like and " +
  "follow, so I'd keep an AI agent well away from those commands. And three: never let the cookie values appear " +
  "on screen, in a screenshot, or in anything you share.",
  {kind: 'ring', color: 'yellow', stageTitle: 'your cookies are keys',
   premise: 'The key ring is what you handed over. The three guards are how to keep it safe.',
   stage: [
     {group: 'ring', label: 'your cookies', sub: 'as good as a password', at: 'Those cookies are'},
     {group: 'key', label: 'X', sub: 'auth_token · ct0', icon: 'si:x', at: 'keys to your account.'},
     {group: 'key', label: 'Reddit', sub: 'reddit_session', icon: 'si:reddit', at: 'Anyone who gets'},
     {group: 'guard', label: 'use a spare account', sub: 'unofficial tools can get an account restricted', icon: 'lucide:user-round-plus', at: 'One: use a spare'},
     {group: 'guard', label: 'stick to reading', sub: 'no post, like or follow commands', icon: 'lucide:book-open', at: 'Two: stick to'},
     {group: 'guard', label: 'never show the values', sub: 'not on screen, not in a screenshot', icon: 'lucide:eye-off', at: 'And three: never'},
   ]});

// ═══ 4 · THE AGENT ═══════════════════════════════════════════════════════════════════════
chapter('dip', 'zoneA',
  "Everything so far, I typed by hand. Time to let an actual AI agent do it.",
  '4', 'Hand it to the agent', 'the one-line install, in Claude Code');

ar('push', 'zoneB',
  "According to the README, you paste one sentence into your agent: install Agent Reach, followed by a link " +
  "to a file called install dot m-d. That file is a set of instructions written for the AI, not for you. So the " +
  "agent is meant to read the guide, install the package, run the read-only check, read the health report, and " +
  "then ask you which optional platforms you want before it changes anything else. That's the plan. Here's what " +
  "happened when I tried it.",
  {kind: 'fuse', color: 'blue', stageTitle: 'what one pasted line is meant to set off',
   premise: 'The line at the top is what you paste. Each stop is a step the agent is meant to take, in order.',
   stage: [
     {group: 'line', label: 'Install Agent Reach: https://raw.githubusercontent.com/Panniantong/agent-reach/main/docs/install.md', at: 'you paste one'},
     {group: 'step', label: 'reads the guide', sub: 'install.md', icon: 'lucide:file-text', at: 'read the guide,'},
     {group: 'step', label: 'installs', sub: 'the package', icon: 'lucide:package', at: 'install the package,'},
     {group: 'step', label: 'checks', sub: 'read-only', icon: 'lucide:shield-check', at: 'run the read-only'},
     {group: 'step', label: 'reports', sub: 'health check', icon: 'lucide:stethoscope', at: 'read the health'},
     {group: 'step', label: 'asks you', sub: 'which extras', icon: 'lucide:message-circle-question', at: 'then ask you'},
   ]},
  README);

rec('zoom', 'zoneA',
  "Here's Claude Code, Anthropic's coding agent, and I've pasted the one line from the README. Claude fetches " +
  "the installation guide and reads its four hundred-odd lines. Claude looks around the computer and finds " +
  "Agent Reach is already installed. Then Claude tries the read-only check — and gets stopped. Not by Agent " +
  "Reach. By Claude Code itself. On screen, the line reads denied by auto mode classifier, and the reason given " +
  "is unauthorized persistence. Claude was in auto mode, where it approves safe steps on its own, and a web " +
  "page telling it to set up software isn't one of them. I think that's the right call. Claude stops and gives " +
  "me two options: run the command myself, or add a permission rule.",
  null,
  [{take: 'ar-agent', step: 'install', label: 'Claude Code · 8× speed', at: 0.02,
    camera: [{frame: 'found', at: 'finds Agent Reach'}, {frame: 'denied', at: 'denied by auto mode', band: true},
             {frame: 'full', at: 'Claude was in'}],
    notes: [{text: 'already installed here', mark: 'found', at: 'is already installed.', side: 'bottom', color: 'blue'},
            {text: 'denied: unauthorized persistence', mark: 'denied', at: 'the reason given', side: 'top', color: 'red'}]}]);

rec('fade', 'zoneB',
  "So I allowed it for this session, and installed Agent Reach's skill file, because my earlier try " +
  "without it went badly: Claude trusted the health check and skipped X and Reddit. With the skill, " +
  "watch Claude. First it loads the skill. Next it runs the health check. Then Claude says which tool " +
  "it'll use for each platform: twitter-cli for X, rdt-cli for Reddit, yt-dlp for YouTube. Claude calls the same " +
  "tools I ran by hand and writes two points from each platform, with links. I never told Claude which tool to " +
  "use, because the skill file had already told it where to go.",
  null,
  [{take: 'ar-agent2', step: 'ask', label: 'one question · 6× speed', at: 0.02,
    camera: [{frame: 'plan', at: 'which tool', band: true}, {frame: 'answer', at: 'writes two points'}, {frame: 'full', at: 'I never told'}],
    notes: [{text: 'its plan, in one line', mark: 'plan', at: 'twitter-cli for X,', side: 'bottom', color: 'green'}]}]);

ar('slide', 'zoneA',
  "So, the verdict, channel by channel. Web pages, YouTube and RSS worked with no setup at all. GitHub worked " +
  "once I was logged in. Web search worked after one helper. X worked, but only from the newer source build. " +
  "Reddit worked with my session cookie. Both Chinese sites, Bilibili and V2EX, worked out of the box. So " +
  "nine channels are up and running by the end of this video. As for the other seven, I didn't attempt them, which " +
  "means I can't vouch for them.",
  {kind: 'board', color: 'green', stageTitle: 'what worked for me',
   premise: 'Green means it worked when I ran it. Grey means I did not try it.',
   stage: [
     {group: 'ch', label: 'Web pages', icon: 'lucide:globe', text: 'ok', sub: 'no setup', at: 'Web pages,'},
     {group: 'ch', label: 'YouTube', icon: 'si:youtube', text: 'ok', sub: 'no setup', at: 'YouTube and RSS'},
     {group: 'ch', label: 'RSS feeds', icon: 'si:rss', text: 'ok', sub: 'no setup', at: 'and RSS worked'},
     {group: 'ch', label: 'GitHub', icon: 'si:github', text: 'ok', sub: 'after login', at: 'GitHub worked'},
     {group: 'ch', label: 'Web search', icon: 'lucide:search', text: 'ok', sub: 'one helper', at: 'Web search worked'},
     {group: 'ch', label: 'X', icon: 'si:x', text: 'ok', sub: 'source build', at: 'only from the newer'},
     {group: 'ch', label: 'Reddit', icon: 'si:reddit', text: 'ok', sub: 'session cookie', at: 'Reddit worked'},
     {group: 'ch', label: 'Bilibili', icon: 'si:bilibili', text: 'ok', sub: 'no setup', at: 'Bilibili and V2EX,'},
     {group: 'ch', label: 'V2EX', icon: 'si:v2ex', text: 'ok', sub: 'no setup', at: 'and V2EX, worked'},
     {group: 'ch', label: 'Facebook', icon: 'si:facebook', text: 'off', sub: 'not tried', at: 'the other seven,'},
     {group: 'ch', label: 'Instagram', icon: 'si:instagram', text: 'off', sub: 'not tried', at: 'the other seven,'},
     {group: 'ch', label: 'LinkedIn', icon: 'lucide:briefcase', text: 'off', sub: 'not tried', at: 'the other seven,'},
     {group: 'ch', label: 'XiaoHongShu', icon: 'si:xiaohongshu', text: 'off', sub: 'not tried', at: 'the other seven,'},
     {group: 'ch', label: 'Xueqiu', icon: 'lucide:chart-candlestick', text: 'off', sub: 'not tried', at: 'the other seven,'},
     {group: 'ch', label: 'Xiaoyuzhou', icon: 'lucide:podcast', text: 'off', sub: 'not tried', at: 'the other seven,'},
     {group: 'ch', label: 'Boss Zhipin', icon: 'lucide:id-card', text: 'off', sub: 'not tried', at: 'the other seven,'},
     {group: 'tally', label: 'up and running', at: 'nine channels are up'},
   ]});

c.add('RECAP', 'fade', 'zoneB',
  "If you remember four things, make it these. Agent Reach doesn't read the internet itself; it picks, installs " +
  "and checks the tools that do. Its screen is in Chinese, but three symbols are all you need. X and Reddit work " +
  "through your own login cookies, so treat those cookies like passwords. And when a tool breaks, check its " +
  "GitHub source before you give up, because that's what fixed X for me.",
  (A, n, narration) => ({
    heading: 'Four things to remember',
    points: [
      {text: 'It picks, installs and checks the tools', atWord: wordIndex(narration, "Agent Reach doesn't read")},
      {text: 'Three symbols unlock the Chinese screen', atWord: wordIndex(narration, 'Its screen is')},
      {text: 'Cookies are passwords: protect them', atWord: wordIndex(narration, 'X and Reddit work')},
      {text: 'Broken tool? Try its GitHub source', atWord: wordIndex(narration, 'And when a tool')},
    ],
  }));

c.add('OUTRO_CTA', 'dip', 'zoneA',
  "Agent Reach is made by Panniantong, and it stands on other people's free work: twitter-cli, rdt-cli, " +
  "yt-dlp, Jina Reader, Exa and feedparser, all linked below. Which platform would you connect first? " +
  "Thanks for watching.",
  () => ({
    headline: 'Nine channels worked for me',
    subtext: 'Agent Reach · github.com/Panniantong/Agent-Reach',
  }));

// ── emit ──────────────────────────────────────────────────────────────────────────────
const spec = {
  meta: {
    topic: 'Agent Reach, installed and tested',
    format: 'long',
    fps: 30,
    subject: 'Agent Reach',
    subjectKind: 'a free, open-source Python command-line installer and health checker that sets up the programs an AI agent uses to read X, Reddit, YouTube, GitHub and other sites',
    audioPrefix: 'agent-reach-hands-on_long',
    onePayoff: 'what Agent Reach actually is, how to read its Chinese output, and which sites really worked when it was installed and run',
    openLoop: 'Does Agent Reach really hand an AI agent the whole internet?',
    topicAxes: ['hands-on', 'review'],
    screenplay: 'documentary',
    seo: {
      title: 'If You Use AI Agents, You Are Missing This: Agent Reach, Tested (Free X, Reddit & YouTube Access)',
      altTitles: [
        'I Gave My AI Agent Free Access To X, Reddit & YouTube — Agent Reach, Full Hands-On',
        'Agent Reach In English: Install It, Read Its Chinese Output, Test Every Site',
        'My AI Agent Could Not Read X Or Reddit. I Tested Agent Reach To Fix That.',
      ],
      hook:
        'Agent Reach has 89 thousand stars on GitHub and promises your AI agent free access to X, Reddit, YouTube ' +
        'and more — but the whole project is written in Chinese. I install it on camera, translate everything it ' +
        'prints, and try each site myself, including the one that failed first time.',
      description:
        'Agent Reach is a free, open-source project that picks, installs and health-checks the programs an AI agent ' +
        'needs to read the internet: Jina Reader for web pages, yt-dlp for YouTube subtitles and search, gh for ' +
        'GitHub, twitter-cli for X, rdt-cli for Reddit, Exa for web search. In this hands-on I show how to translate ' +
        'the Chinese README in Chrome, install it safely, read the Chinese health check, and run every channel by ' +
        'hand on Windows. X failed with a 404 on the PyPI release and worked from the GitHub source. Claude Code’s ' +
        'auto mode refused the one-line install, and I show what it said. Nine of sixteen channels worked.',
      pinned: 'Which site would you connect your AI agent to first?',
      sources: [
        'Agent Reach by Panniantong (MIT): github.com/Panniantong/Agent-Reach — package: agent-reach',
        'twitter-cli (X backend): github.com/public-clis/twitter-cli — installed from git+https://github.com/public-clis/twitter-cli.git',
        'rdt-cli (Reddit backend): github.com/public-clis/rdt-cli',
        'yt-dlp (YouTube): github.com/yt-dlp/yt-dlp',
        'Jina Reader (web pages): github.com/jina-ai/reader',
        'Exa web search via mcporter: exa.ai · github.com/nicobailon/mcporter',
        'feedparser (RSS): github.com/kurtmckee/feedparser',
        'bilibili-cli: github.com/public-clis/bilibili-cli',
        'Claude Code auto mode: code.claude.com/docs/s/claude-code-auto-mode',
        'Subtitle demo video: “Introducing Claude Code” by Anthropic — youtube.com/watch?v=AJpK3YTTKZ4',
      ],
      queries: [
        'agent reach github',
        'agent reach english',
        'how to let ai agent read twitter',
        'ai agent read reddit',
        'claude code read youtube subtitles',
        'twitter-cli 404',
        'agent reach install windows',
      ],
      tags: 'agent reach,agent-reach,ai agent,claude code,twitter cli,rdt cli,yt-dlp,jina reader,exa search,' +
        'ai agent internet access,read twitter without api,reddit without api,youtube subtitles,open source ai,github trending',
    },
  },
  brand: c.brand(),
  thumbnail: {layout: 'hero', badge: 'AGENT REACH · 89K STARS ON GITHUB', title: 'Your AI Can’t Read X? [I Tested It]',
    art: 'img:agent-reach-header.png', asset: 'img:agent-reach-header.png', artWide: true},
  scenes: c.S,
};

if (MISSES.length) { console.error(`✗ ${MISSES.length} anchor phrase(s) not found:\n  ` + MISSES.join('\n  ')); process.exit(1); }
c.emit('topics/agent-reach-hands-on/long.json', spec);
