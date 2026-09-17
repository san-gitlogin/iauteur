// Open Code Review — Alibaba's reviewer, tested against a bug Google shipped. WIDE CUT.
//
// Every claim traces to briefs/opencodereview/00-dossier.md (the repo's own README, the two
// PNGs it embeds, the GitHub and npm APIs) or to briefs/opencodereview/02-blindrun.md (the two
// reviews we actually ran). No number came from a blog post.
//
// THE RULE THAT GOVERNS THIS SCRIPT is briefs/opencodereview/01-plain-language.md. Owner,
// 2026-09-17: "beginners will be watching... narrate to the viewers like they are 5." Every
// technical word is defined in the same breath it first appears — code review, pull request,
// diff, token, variable, nil, scope. If a beat needs two definitions, it is split. Runtime is
// free; a viewer who is lost is not.
//
// Takes: ocr-gh (the repository page), ocr-setup (install), ocr-rules (the checklists),
// ocr-control (a good pull request), ocr-proof (the PR and the answer key on GitHub),
// ocr-blind (the blind test).
import {cut} from '../../scripts/lib/apple-build.mjs';

const c = cut();

const wordIndex = (narration, phrase) => {
  const norm = (x) => x.replace(/[^\w']/g, '').toLowerCase();
  const w = narration.split(/\s+/), p = phrase.split(/\s+/);
  for (let i = 0; i < w.length; i++) if (p.every((x, j) => norm(w[i + j] ?? '') === norm(x))) return i + 1;
  throw new Error(`camera phrase not found in narration: "${phrase}"`);
};

const OCRGH = 'alibaba/open-code-review · github.com · Apache-2.0';
const GRPC = 'grpc/grpc-go · github.com · Apache-2.0';
const LOCAL = 'recorded on this machine · ocr v1.12.4 · Claude Code 2.1.274';

const rec = (defTake) => (transition, bg, narration, source, clips) =>
  c.add('RECORDED_STEP', transition, bg, narration, (A) => ({
    clips: clips.map((k) => ({
      ref: `rec:${k.take ?? defTake}#${k.step}`, label: k.label, focus: true, atWord: A(k.at ?? 0.05),
      ...(k.pivot ? {wantAtWord: wordIndex(narration, k.pivot)} : {}),
      ...(k.source ? {sourceNote: k.source} : {}),
      zooms: (k.camera ?? []).map((m) => (m.frame === 'full'
        ? {at: 'full', wantAtWord: wordIndex(narration, m.at)}
        : {marks: [].concat(m.frame), ...(m.band ? {band: true} : {}), wantAtWord: wordIndex(narration, m.at)})),
      callouts: [],
    })),
    sourceNote: source,
  }));

const gh = rec('ocr-gh');
const setup = rec('ocr-setup');
const rules = rec('ocr-rules');
const control = rec('ocr-control');
const blind = rec('ocr-blind');
const proof = rec('ocr-proof');

// ═══ 1 · HOOK ═══════════════════════════════════════════════════════════════════
c.add('HOOK', 'dip', 'zoneA',
  "Alibaba just open-sourced their code reviewer. We gave it a bug Google shipped.",
  (A) => ({
    headline: 'The reviewer that caught what Google missed',
    subtext: 'Open Code Review, tested on a real pull request',
    hookVariant: 'reveal',
    atWord: A(0.5),
  }));

// ═══ 2 · TITLE ══════════════════════════════════════════════════════════════════
c.add('TITLE_CARD', 'fade', 'zoneA',
  "Welcome back. Today we're going to install a tool called Open Code Review, plug it straight into " +
  "Claude Code, and point it at two real pull requests from Google's gRPC library. One of them is " +
  "fine. The other one had a bug in it — a bug that got approved, merged, and shipped, and then had " +
  "to be fixed a week later. We won't tell the reviewer which is which. And by the end, you'll " +
  "understand exactly what that bug was, even if you've never written a line of Go in your life.",
  (A) => ({
    title: 'Two pull requests. One hidden bug.',
    subtitle: 'Open Code Review, installed and tested live',
    atWord: A(0.35),
  }));

// ═══ I · WHAT IT IS ═════════════════════════════════════════════════════════════

// 3 · the repository page — LAW: show the source of truth, early, on camera.
gh('letterbox', 'zoneB',
  "So let's start where anyone should start, which is the project's own page on GitHub. This is it — " +
  "Open Code Review, and look at who publishes it. That's Alibaba. Now, GitHub is just the place " +
  "programmers keep their code, and a page like this one is called a repository — think of it as the " +
  "project's folder, with every file and its whole history in it. Read the description underneath, " +
  "because they've written it plainly: fast, efficient, battle-tested at Alibaba's scale. And over on " +
  "the right, the licence says Apache two point oh, which is the important bit for you — that's a " +
  "proper open licence. It's free, you can read every line of it, and you can use it at work without " +
  "asking anyone's permission.",
  OCRGH,
  [
    {step: 'repo', at: 0.04, label: 'the official page', camera: [{frame: 'owner', at: 'That\'s Alibaba', band: true}]},
    {step: 'about', pivot: 'Read the description', label: 'the description and the licence',
      camera: [{frame: 'desc', at: 'battle-tested at Alibaba\'s scale'}, {frame: 'licence', at: 'Apache two point oh'}]},
  ]);

// 4 · what a code review even is. The whole video rests on this; a beginner cannot
// evaluate a reviewer until they know what reviewing IS.
c.add('STEP_FLOW', 'slide', 'zoneA',
  "Before we go any further, let's make sure we're talking about the same thing, because everything " +
  "today hangs on one idea. When a programmer finishes a piece of work, they don't just drop it into " +
  "the company's product. They package it up and ask permission. That package has a name — it's called " +
  "a pull request, and you can think of it as a folder that says: here's what I changed, please look " +
  "before you let it in. Then another programmer reads it and either says yes, or asks for changes. " +
  "That reading is the code review. And it is, genuinely, the last human check before code reaches " +
  "real people. Which is why it matters so much when something slips through it.",
  (A) => ({
    stepFlow: {
      title: 'how code gets in',
      steps: [
        {label: 'a change', sub: 'someone writes new code', atWord: A(0.18)},
        {label: 'a pull request', sub: 'here is what I changed — please look', atWord: A(0.36)},
        {label: 'the review', sub: 'another programmer reads it and decides', atWord: A(0.55)},
        {label: 'merged', sub: 'it goes into the real product', atWord: A(0.68)},
      ],
      caption: 'the review is the last human check before your users get it',
      color: 'blue',
      atWord: A(0.08),
    },
  }));

// 5 · where it came from
gh('fade', 'zoneB',
  "Right — so what is this thing, and why should you trust it? Here's the answer, in their own words. " +
  "Open Code Review didn't start as an open-source side project. It started inside Alibaba as their " +
  "official internal reviewer, and it's been running there for two years. Read that line: tens of " +
  "thousands of developers, and millions of code defects found. A defect is just a bug — something " +
  "wrong in the code. So this is not somebody's weekend experiment that got popular. It's a tool that " +
  "has already done this job, at enormous scale, inside one of the largest engineering companies on " +
  "earth, and they've now given it away.",
  OCRGH,
  [{step: 'what', at: 0.06, label: 'where it came from',
    camera: [{frame: 'origin', at: 'tens of thousands of developers'}]}]);

// 6 · the scale numbers, drawn
c.add('STAT_PANELS', 'slide', 'zoneA',
  "And those numbers are worth sitting with for a second, because they're the reason this is " +
  "interesting rather than just new. Twenty thousand engineers inside Alibaba use it. It has run " +
  "three million reviews. And in the last thirty days alone, people downloaded it three hundred and " +
  "twenty-nine thousand times — I checked that one myself against the download counter, and it's " +
  "real. That last number is the one I'd watch, honestly. Internal usage can be a company telling its " +
  "own staff what to use. Three hundred thousand downloads a month is the rest of the world " +
  "volunteering.",
  (A) => ({
    stats: [
      {label: 'engineers inside Alibaba', value: '20K+', sub: 'daily users', atWord: A(0.15)},
      {label: 'reviews already run', value: '3M+', sub: 'to date', atWord: A(0.28)},
      {label: 'downloads last 30 days', value: '329K', sub: 'verified on npm', atWord: A(0.42)},
    ],
    source: 'alibaba/open-code-review README + npm registry API, 17 Sep 2026',
  }));

// ═══ II · THE CLAIM ═════════════════════════════════════════════════════════════

c.add('CHAPTER', 'wipe', 'zoneC',
  "Now we get to the claim that made me want to make this video at all.",
  (A) => ({title: 'The claim', subtitle: 'it says it beats Claude Code', atWord: A(0.4)}));

// 8 · the benchmark page
gh('letterbox', 'zoneB',
  "Here's the benchmark on their page. A benchmark is just a test you run on lots of examples so you " +
  "can compare tools fairly. And they built a serious one: fifty popular open-source projects, two " +
  "hundred real pull requests, ten different programming languages — and then, this is the part I " +
  "like, more than eighty senior engineers went through it by hand and agreed on fifteen hundred and " +
  "five real bugs. That's the answer key. Now read the claim above it. Compared with a general-purpose " +
  "agent — and the one they name is Claude Code — they say they find better results using about a " +
  "ninth of the tokens. A token is just a chunk of text, roughly three-quarters of a word, and it's " +
  "what you're billed for. So a ninth of the tokens means a ninth of the bill.",
  OCRGH,
  [{step: 'bench', at: 0.05, label: 'the benchmark, and how it was built',
    camera: [{frame: 'built', at: 'fifty popular open-source projects'}, {frame: 'ninth', at: 'a ninth of the tokens'}]}]);

// 9 ★ the findings wall — the precision argument, without the word 'precision'
c.add('REVIEW_YIELD', 'slide', 'zoneA',
  "But here's the number that actually tells you what's going on, and it isn't a percentage. It's a " +
  "count. Running the same model underneath — the exact same brain — Claude Code wrote five thousand " +
  "nine hundred and eighty review comments. Of those, four hundred and thirty-five were real bugs. " +
  "Every other mark on that wall is a false alarm: the tool telling you something's broken when it " +
  "isn't. Open Code Review, same model, same pull requests, wrote eight hundred and eighty-nine " +
  "comments, and three hundred and one of them were real. Look at the two walls rather than the " +
  "arithmetic. One of them hands you a small list where a third of it matters. The other hands you " +
  "nearly six thousand comments and lets you find the thirteen that do.",
  (A) => ({
    reviewYield: {
      unitLabel: 'one mark = 100 review comments',
      perMark: 100,
      hitLabel: 'a real bug',
      missLabel: 'a false alarm',
      columns: [
        {label: 'Claude Code', sub: 'same model underneath', value: 5980, detail: '435',
          tag: '5,980 written · 435 real', color: 'red', atWord: A(0.22)},
        {label: 'Open Code Review', sub: 'same model underneath', value: 889, detail: '301',
          tag: '889 written · 301 real', color: 'green', atWord: A(0.52)},
      ],
      caption: 'the pile you have to sort through is the real cost',
      color: 'yellow',
      atWord: A(0.06),
    },
    source: 'AACR-Bench leaderboard, alibaba/open-code-review (Claude-4.6-Opus rows)',
  }));

// 10 · time and money
c.add('BAR_COMPARE', 'fade', 'zoneA',
  "The other two columns are just as blunt. Same model, same job: Claude Code took thirteen minutes " +
  "and six seconds per review. Open Code Review took one minute and twenty-three seconds. That's " +
  "roughly nine and a half times faster. And on tokens — remember, that's the thing you pay for — it " +
  "used three hundred and eighty-five thousand against five point six million. If you're a single " +
  "developer, that's the difference between a coffee and a meal. If you're a company running this on " +
  "every pull request, all day, every day, it's the difference between a tool you can afford and one " +
  "you quietly turn off.",
  (A) => ({
    bars: [
      {label: 'Claude Code · tokens per review', value: 100, display: '5,664K', color: 'red', atWord: A(0.5)},
      {label: 'Open Code Review · tokens per review', value: 7, display: '385K', color: 'green', atWord: A(0.62)},
    ],
    source: 'AACR-Bench, same model (Claude-4.6-Opus), 200 real pull requests',
  }));

// 11 · the honest ceiling — the trust beat. Do not cut.
c.add('STAT_CALLOUT', 'slide', 'zoneC',
  "And now let me be straight with you, because a review that only reads out the good numbers isn't a " +
  "review, it's an advert. Look at what those same figures mean if you flip them round. Open Code " +
  "Review got about thirty-four percent of its comments right — which is a huge win over seven — but " +
  "it still means roughly two out of every three things it flags are not real bugs. And it found " +
  "twenty percent of the known problems, so it missed four out of every five. Claude Code actually " +
  "found more of them; it just buried them. Neither of these tools is anywhere close to solved. What " +
  "you're looking at is a better reviewer, not a finished one, and anyone who tells you otherwise is " +
  "selling something.",
  (A) => ({
    statCallout: {
      value: '2 in 3',
      label: 'of its findings are still not real bugs',
      sub: 'and it misses four defects in five — this is the honest state of the art',
      color: 'orange',
      atWord: A(0.3),
    },
    source: 'AACR-Bench: precision 33.90%, recall 20.00% (Open Code Review, Claude-4.6-Opus)',
  }));

// 12 · whose benchmark is it — the credibility beat
c.add('REVEAL', 'fade', 'zoneA',
  "There's one more thing you should be suspicious about, and I want to raise it before you do. This " +
  "is Alibaba's benchmark, measuring Alibaba's own tool. You should always raise an eyebrow at that. " +
  "So here's what changed my mind. Go and look at who's sitting at the top of their leaderboard. It " +
  "isn't Alibaba's model. The best score on that chart belongs to a model made by Anthropic — one of " +
  "their competitors. Alibaba's own Qwen is second, on a chart that Alibaba published. They could have " +
  "quietly left that row out. They didn't, and the whole dataset is public so you can go and check it. " +
  "That doesn't make the benchmark perfect, but it does make it honest.",
  (A) => ({
    headline: 'Their own model is not first',
    items: [
      {label: '#1  Claude-4.6-Opus', sub: 'Anthropic — a competitor', atWord: A(0.45)},
      {label: '#2  Qwen3.8-Max', sub: 'Alibaba — their own', atWord: A(0.58)},
    ],
    source: 'AACR-Bench leaderboard, published by Alibaba',
  }));

// ═══ III · WHY IT WORKS ═════════════════════════════════════════════════════════

c.add('CHAPTER', 'wipe', 'zoneC',
  "Which leaves the obvious question. If the brain is the same, why would the answers be better?",
  (A) => ({title: 'Why the same model does better', subtitle: 'the part that is not the model', atWord: A(0.4)}));

// 14 · the three failures
gh('letterbox', 'zoneB',
  "They answer that on the page, and they start by naming what goes wrong when you hand a big code " +
  "review to a general-purpose AI assistant. Three things. First, on a big change it cuts corners — " +
  "it reads some of the files and quietly skips others. Second, position drift, which means it tells " +
  "you there's a problem on line two hundred when the problem is actually on line four hundred. And " +
  "third, the quality wobbles: ask the same question twice, phrased slightly differently, get two " +
  "different answers. And then they name the cause, which is the sentence the whole design comes from. " +
  "When everything is decided by a language model, nothing about the process is actually guaranteed.",
  OCRGH,
  [{step: 'pain', at: 0.05, label: 'the three failures they name',
    camera: [{frame: 'three', at: 'it reads some of the files'}]}]);

// 15 ★ the split — what code decides, what the AI decides
c.add('RESPONSIBILITY_SPLIT', 'slide', 'zoneA',
  "So their fix is a split, and once you see it you can't unsee it. Some parts of a review must never " +
  "be left to a guess, so those are done by ordinary, boring, predictable code. Which files get read? " +
  "Code decides. Which files get grouped together? Code decides. Which checklist applies to this file? " +
  "Code decides. Where exactly does the comment get pinned? Code decides. And then the one job that " +
  "genuinely needs judgement — actually looking at these lines and deciding whether they're wrong — " +
  "that's the only thing handed to the AI. The AI doesn't get to wander round the building. It's given " +
  "a specific room, a specific checklist, and asked one question.",
  (A) => ({
    respSplit: {
      leftLabel: 'Ordinary code',
      leftSub: 'always the same answer',
      rightLabel: 'The AI',
      rightSub: 'judgement',
      pileLabel: 'everything a review has to do',
      lines: [
        {text: 'which files get read', title: 'left', sub: 'no guessing', atWord: A(0.28)},
        {text: 'which files group together', title: 'left', sub: 'no guessing', atWord: A(0.36)},
        {text: 'which checklist applies', title: 'left', sub: 'no guessing', atWord: A(0.44)},
        {text: 'where the comment is pinned', title: 'left', sub: 'no guessing', atWord: A(0.52)},
        {text: 'is this code actually wrong?', title: 'right', sub: 'judgement', atWord: A(0.64)},
      ],
      caption: 'the AI is given a room and a checklist, not the run of the building',
      color: 'purple',
      atWord: A(0.06),
    },
    source: 'alibaba/open-code-review — "Deterministic Engineering × Agent Hybrid"',
  }));

// 16 · the checklists, on camera — specific vs generic
rules('fade', 'zoneB',
  "And you don't have to take that on faith, because you can just ask it. There's a command that " +
  "prints the exact checklist a file would be handed. Watch what a Go file gets — Go is the language " +
  "this project is written in. Look at the pattern line: star star slash star dot go. That means this " +
  "checklist is only for Go files. And read the first sentence of it, because it's remarkable. Favour " +
  "precision over recall. A false positive costs reviewer trust. That's a design decision, written in " +
  "plain English, sitting inside a rule file. Now watch what a plain text file gets instead. Pattern: " +
  "default. And the checklist is four vague questions — is the logic correct, are there security " +
  "problems. That contrast is the entire product. One file gets a specialist. The other gets a shrug.",
  LOCAL,
  [
    {step: 'gorule', at: 0.08, label: 'what a Go file is handed',
      camera: [{frame: 'pattern', at: 'star star slash star dot go'}, {frame: 'trust', at: 'A false positive costs reviewer trust'}]},
    {step: 'mdrule', pivot: 'Now watch what a plain', label: 'what everything else is handed',
      camera: [{frame: 'default', at: 'Pattern: default'}, {frame: 'generic', at: 'is the logic correct'}]},
  ]);

// ═══ IV · INSTALL ═══════════════════════════════════════════════════════════════

c.add('CHAPTER', 'wipe', 'zoneC',
  "Enough reading. Let's put it on this machine and point it at some real code.",
  (A) => ({title: 'Installing it', subtitle: 'two commands, and one you must not skip', atWord: A(0.4)}));

// 18 · install the CLI
setup('letterbox', 'zoneB',
  "There's exactly one thing to check first, and it's the one that caught me out. Open Code Review " +
  "needs Git version two point four one or newer. Git is the tool that tracks every change to a " +
  "project, and this machine was running an older copy, so every single command printed a warning " +
  "until I upgraded it. Check yours. Then the install itself is one line — that's npm, the package " +
  "installer that comes with Node, and the dash g just means install it for the whole machine rather " +
  "than one folder. A few seconds later we can ask it what version it is, and there it is: version " +
  "one point twelve point four. The command is three letters. O, C, R.",
  LOCAL,
  [
    {step: 'gitv', at: 0.1, label: 'the one prerequisite', camera: [{frame: 'ver', at: 'two point four one or newer'}]},
    {step: 'install', pivot: 'Then the install itself', label: 'one line', camera: [{frame: 'pkg', at: 'that\'s npm'}]},
    {step: 'version', pivot: 'A few seconds later', label: 'it is really there', camera: [{frame: 'v', at: 'one point twelve point four'}]},
  ]);

// 19 · the plugin
setup('fade', 'zoneB',
  "Now the part that makes this genuinely interesting. Open Code Review ships a plugin for Claude " +
  "Code, so it runs inside the very tool it just outscored. The first command points Claude Code at " +
  "Alibaba's plugin list — a marketplace, in their words — and the second installs the plugin itself. " +
  "Successfully added. Successfully installed. That's it, and notice there was no account to make and " +
  "no key to paste. What we've just gained is two new slash commands, which are the shortcuts you type " +
  "inside Claude Code to make it do something specific. And one of those two is about to do all the " +
  "work in this video.",
  LOCAL,
  [
    {step: 'market', at: 0.2, label: 'point Claude Code at their plugin list',
      camera: [{frame: 'added', at: 'Successfully added'}]},
    {step: 'plugin', pivot: 'and the second installs', label: 'install the plugin',
      camera: [{frame: 'ok', at: 'Successfully installed'}]},
  ]);

// 20 · the two modes — and which one is on camera. Honesty beat.
c.add('SPLIT_PATHS', 'slide', 'zoneA',
  "There are two ways to run it, and I need you to know which one you're about to watch, because it " +
  "matters. In the first way, Open Code Review calls an AI model itself, using an account key you give " +
  "it — and that's the way those benchmark numbers were measured. In the second way, called delegation, " +
  "Open Code Review still picks the files and still hands over the checklists, but Claude Code's own " +
  "model does the actual judging. No extra key, no extra bill. That's the one we're using today. So " +
  "please don't take the benchmark figures I showed you as a measurement of what you're about to see. " +
  "Same file-picking, same rules, different engine doing the thinking.",
  (A) => ({
    center: {title: 'two ways to run it', atWord: A(0.08)},
    left: {title: 'Open Code Review judges', sub: 'its own model · needs a key · this is what the benchmark measured', color: 'blue', atWord: A(0.26)},
    right: {title: 'Claude Code judges', sub: 'delegation · no extra key · this is what we filmed', color: 'green', atWord: A(0.48)},
    source: 'alibaba/open-code-review — Default vs Delegation Mode',
  }));

// ═══ V · THE CONTROL RUN ════════════════════════════════════════════════════════

c.add('CHAPTER', 'wipe', 'zoneC',
  "First, a test most reviews of review tools skip. What does it say about code that's already fine?",
  (A) => ({title: 'Test one: good code', subtitle: 'does it stay quiet?', atWord: A(0.4)}));

// 22 · the target
proof('letterbox', 'zoneB',
  "This is gRPC — a library made and maintained by Google that lets programs on different computers " +
  "talk to each other. An enormous amount of the internet leans on it. And the pull request we're " +
  "going to hand over first is a genuinely hard one: it rewrites the locking in a load balancer. " +
  "Locking is how a program stops two things happening at the same time and tripping over each other, " +
  "and it is, without much argument, the hardest thing in programming to review by eye. Google " +
  "engineers read this change, approved it, and merged it. As far as anybody knows, it's correct. " +
  "So the right answer here is silence.",
  GRPC,
  [{step: 'repo', at: 0.06, label: 'the library we are reviewing', camera: [{frame: 'name', at: 'This is gRPC'}]}]);

// 23 · file selection + bundling, on camera
control('fade', 'zoneB',
  "Watch the first command, because this is the deterministic half doing its entire job in one screen. " +
  "Three reviewable, five total. It's looked at the five files that changed and decided only three of " +
  "them are worth a reviewer's time — and look at the two it crossed out. Those are test files, and " +
  "it tells you exactly why it dropped them rather than leaving you to guess. No model was involved in " +
  "that decision at all. Then the second command fetches the checklists, and notice the heading: rule " +
  "group one, with all three files listed under it. It's worked out that those three files need the " +
  "same checklist, so it bundles them into a single job instead of three separate ones.",
  LOCAL,
  [
    {step: 'preview', at: 0.06, label: 'which files, and which are dropped',
      camera: [{frame: 'count', at: 'Three reviewable, five total'}, {frame: 'dropped', at: 'it tells you exactly why'}]},
    {step: 'bundle', pivot: 'Then the second command', label: 'three files, one checklist',
      camera: [{frame: 'group', at: 'rule group one'}]},
  ]);

// 24 · the control review itself
control('letterbox', 'zoneB',
  "And here's the review itself, running inside Claude Code. You can watch it work — reading the diff, " +
  "which is just the list of lines that changed, opening the surrounding code, checking how the locks " +
  "are ordered. It takes it seriously. And then it comes back and tells us there's nothing to report. " +
  "Nothing at high severity, nothing at medium. It even lists what it checked and ruled out: the lock " +
  "ordering, a write it decided was safe, a loop variable it decided was fine. Now, a lot of tools " +
  "would have found something here, because finding something feels like working. This one looked at " +
  "good code and said so.",
  LOCAL,
  [{step: 'review', at: 0.04, label: 'the whole review of a good pull request'}]);

// 25 · what silence proves
c.add('CLAIM_CHECK', 'slide', 'zoneA',
  "And I want to stay on that for a moment, because it's easy to watch nothing happen and feel " +
  "cheated. That silence is the product. Think back to the wall of comments we looked at earlier — " +
  "nearly six thousand of them, where nine in ten were wrong. That's what a reviewer looks like when " +
  "it can't say nothing. Every false alarm costs a real person real minutes, and worse, it teaches " +
  "them to stop reading. A reviewer that cries wolf gets muted, and then it's worth less than nothing, " +
  "because now you think you're covered and you aren't.",
  (A) => ({
    claimCheck: {
      headline: 'Nothing to report — on code that was already right',
      claims: [{text: 'A reviewer that never says "nothing" is a reviewer nobody keeps.', tag: 'the point', color: 'green', atWord: A(0.2)}],
      subject: 'the control run',
      tallyLabel: 'comments produced',
      hitLabel: 'noise added',
      tally: [{label: 'high', hit: false}, {label: 'medium', hit: false}],
      caption: 'zero noise on good code is a result, not a non-result',
      color: 'green',
      atWord: A(0.06),
    },
    source: 'delegated review of grpc/grpc-go #9290, run on this machine',
  }));

// ═══ VI · THE BLIND TEST ════════════════════════════════════════════════════════

c.add('CHAPTER', 'wipe', 'zoneC',
  "Now the real test. A pull request that was already broken when Google merged it.",
  (A) => ({title: 'Test two: the blind test', subtitle: 'a bug that shipped', atWord: A(0.4)}));

// 27 · the PR and the answer key
proof('letterbox', 'zoneB',
  "Here's the second pull request. Somebody at Google wrote it, other engineers reviewed it, and it " +
  "was merged into gRPC. And it did what it said — read the title, it makes the client report a " +
  "particular kind of error properly. Ordinary, careful work. Now here's how I know something was " +
  "wrong with it. Seven days later, this commit landed. A commit is just one saved change, with a note " +
  "attached explaining it. And read that note: fix a bug introduced in seven four six one. Seven four " +
  "six one is the pull request we were just looking at. So the maintainers themselves are telling us, " +
  "in writing, that something got through. That's our answer key.",
  GRPC,
  [
    {step: 'pr', at: 0.06, label: 'approved and merged', camera: [{frame: 'merged', at: 'it was merged into gRPC'}]},
    {step: 'fix', pivot: 'Seven days later', label: 'the answer key, in their own words',
      camera: [{frame: 'msg', at: 'fix a bug introduced in seven four six one'}]},
  ]);

// 28 · sealing the test
blind('fade', 'zoneB',
  "Which creates a problem for me, and I want to show you how I dealt with it. If the reviewer can see " +
  "that fix, it isn't a test — it's a spoiler. So the copy of the project on this machine has been cut " +
  "back to two commits: the broken one, and the one right before it. That's the whole history it can " +
  "see. The fix does not exist in this folder. There's nothing to look up and nothing to peek at. And " +
  "then the same command as before: three files to review out of four, with the test file dropped " +
  "again. The file we care about is that last one, stream dot go, with five lines added and nine taken " +
  "away.",
  LOCAL,
  [
    {step: 'sealed', at: 0.3, label: 'the entire history it can see', camera: [{frame: 'two', at: 'two commits'}]},
    {step: 'preview', pivot: 'And then the same command', label: 'three of four files',
      camera: [{frame: 'count', at: 'three files to review out of four'}, {frame: 'stream', at: 'stream dot go'}]},
  ]);

// 29 · the rule that predicts it
rules('slide', 'zoneB',
  "And before we run it, I want to show you one line from that Go checklist, because it's the reason " +
  "this is a fair test rather than a lucky one. Here's a rule the reviewer is handed for every Go " +
  "file. Errors that get ignored, overwritten, or turned into a success — hiding the fact that " +
  "something failed. Keep that sentence in your head for the next three minutes. We're about to watch " +
  "it catch precisely that.",
  LOCAL,
  [{step: 'errrule', at: 0.3, label: 'the rule that is about to matter',
    camera: [{frame: 'swallow', at: 'Errors that get ignored'}]}]);

// 30 ★ the blind run
blind('letterbox', 'zoneB',
  "So — same command, same tool, no hints. Let's watch. It pulls the file list, collects the " +
  "checklists, opens each changed file and reads around the lines that moved. And then it stops on " +
  "stream dot go. Two findings, both marked high — that's the top severity, the bucket for real bugs " +
  "rather than suggestions. It's found the same mistake in two different places, and it names the " +
  "exact lines. It didn't just catch it, either. It explained what breaks downstream, and it went and " +
  "fixed both of them. Let's slow this right down, because what it found is genuinely beautiful, and " +
  "you don't need to know Go to see it.",
  LOCAL,
  [{step: 'review', at: 0.04, label: 'the blind review, start to finish'}]);

// ═══ VII · THE BUG, TAUGHT ══════════════════════════════════════════════════════

// 31 · the box
c.add('VAR_SCOPE', 'slide', 'zoneA',
  "Let's start with the smallest possible idea and build up. In a program, a variable is just a " +
  "labelled box that you put a value into. The box we care about is called err, which is short for " +
  "error. The deal is simple: if something goes wrong, the error gets put in the box. If nothing goes " +
  "wrong, the box is left empty. And programmers have a word for an empty box like that — they call " +
  "it nil. So a box holding nil means, quite literally, nothing went wrong here.",
  (A) => ({
    varScope: {
      title: 'inside the function that receives a reply',
      outerLabel: 'err',
      outerSub: 'the function has a box called err',
      innerLabel: 'err',
      innerSub: 'a second box, same name',
      emptyLabel: 'nil — empty',
      valueLabel: 'the real error',
      steps: [
        {title: 'outer', label: 'one box', sub: 'a box called err — empty for now', atWord: A(0.3)},
        {title: 'fence', label: 'nothing yet', sub: 'nil is just the word for an empty box', atWord: A(0.78)},
      ],
      caption: 'a variable is a labelled box. nil means it is empty.',
      color: 'blue',
      atWord: A(0.1),
    },
  }));

// 32 · the one character
c.add('CODE_RUN', 'fade', 'zoneA',
  "Now here are the two lines that broke gRPC, and I promise you can follow them. The first line calls " +
  "a function that goes and fetches the next piece of data, and puts whatever happened into err. Two " +
  "lines further down, the code asks a question about err — did this thing finish normally? And then " +
  "it hands err onwards. Simple enough. Except look very carefully at the first line, at the little " +
  "colon just before the equals sign. That colon is the entire bug. Without it, you're putting a value " +
  "into a box that already exists. With it, you are making a brand new box, right there on the spot, " +
  "that happens to have the same name.",
  (A) => ({
    codeRun: {
      filename: 'stream.go',
      language: 'go',
      resultLabel: 'what it means',
      color: 'red',
      atWord: A(0.08),
      lines: [
        {text: 'if err := recv(...); err == nil {', detail: 'go and fetch the next piece of data',
          sub: 'the colon makes a NEW box called err', label: 'new box', atWord: A(0.22)},
        {text: '    return protocolViolation()', detail: 'if nothing came back, complain',
          sub: 'this part is fine', atWord: A(0.35)},
        {text: '}', detail: 'the block ends here', sub: 'and so does the new box', atWord: A(0.42)},
        {text: 'if err == io.EOF {', detail: 'did this finish normally?',
          sub: 'but which err is this?', label: 'which one?', atWord: A(0.5)},
        {text: '    return status()', detail: 'report the real outcome', sub: 'never reached', atWord: A(0.58)},
        {text: '}', detail: '', sub: '', atWord: A(0.62)},
        {text: 'return toRPCErr(err)', detail: 'hand the error onwards',
          sub: 'hands on an empty box', label: 'empty', atWord: A(0.66)},
      ],
    },
    source: 'grpc/grpc-go stream.go at commit 6d0aaaec, lines 1124–1130',
  }));

// 33 ★★ the vanishing box — the centrepiece
c.add('VAR_SCOPE', 'slide', 'zoneA',
  "So follow what actually happens. The function already has its own box called err, and it's empty. " +
  "Then we step inside the if — those curly brackets — and the colon makes a second box, also called " +
  "err. The real answer from that fetch goes into the new box. Good so far. But then the if finishes, " +
  "and here's the thing about a box made inside brackets: when the brackets close, that box is gone. " +
  "Swept away, along with everything in it. Two lines later the code asks for err again. The new box " +
  "doesn't exist any more, so it reads the only box left — the old one, from outside. And the old box " +
  "was never filled. It's still empty. So the code checks whether anything went wrong, looks in an " +
  "empty box, finds nothing, and cheerfully reports success. The error wasn't handled. It was dropped " +
  "on the floor.",
  (A) => ({
    varScope: {
      title: 'the same name, two different boxes',
      outerLabel: 'err',
      outerSub: 'the function\'s own box — never filled',
      innerLabel: 'err',
      innerSub: 'made by the colon',
      fenceLabel: 'if err := recv(...) { }',
      emptyLabel: 'nil — empty',
      valueLabel: 'the real error',
      askLabel: 'if err == io.EOF',
      verdict: 'empty — so it reports success',
      steps: [
        {title: 'outer', label: 'the old box', sub: 'the function already has an err, and it is empty', atWord: A(0.08)},
        {title: 'fence', label: 'step inside', sub: 'now we are inside the if — those curly brackets', atWord: A(0.2)},
        {title: 'inner', label: 'a new box', sub: 'the colon makes a SECOND box, also called err', atWord: A(0.28)},
        {title: 'fill', label: 'filled', sub: 'the real answer goes into the new box', atWord: A(0.36)},
        {title: 'vanish', label: 'gone', sub: 'the brackets close — and the new box is swept away', atWord: A(0.48)},
        {title: 'ask', label: 'err?', sub: 'two lines later the code asks for err again', atWord: A(0.6)},
        {title: 'verdict', label: 'empty', sub: 'it reads the only box left, and nothing was ever put in it', atWord: A(0.72)},
      ],
      caption: 'a failed call now reports success',
      color: 'red',
      atWord: A(0.04),
    },
    source: 'grpc/grpc-go stream.go, the defect fixed by commit 5c4da090',
  }));

// 34 · why nobody caught it
c.add('TYPE_GATE', 'fade', 'zoneA',
  "At this point you might reasonably ask: don't programmers have tools that catch this sort of thing? " +
  "They do, and that's exactly why this one is so nasty. Look at that line again — there's nothing " +
  "illegal about it. Making a new box is a completely ordinary thing to do; programmers do it all day. " +
  "Nothing's misspelled. Nothing's the wrong type. So the compiler, which is the program that turns " +
  "the code into something a machine can run and which refuses obvious mistakes, is perfectly happy. " +
  "Go's built-in checker is happy. The tests pass. Every light is green, and the code is wrong.",
  (A) => ({
    typeGate: {
      title: 'everything that should have caught it',
      gates: [
        {label: 'the compiler', sub: 'it is valid code', verdict: 'pass', atWord: A(0.42)},
        {label: 'go vet', sub: 'not in the default checks', verdict: 'pass', atWord: A(0.56)},
        {label: 'the tests', sub: 'nothing exercised this path', verdict: 'pass', atWord: A(0.66)},
        {label: 'three human reviewers', sub: 'it looks right', verdict: 'pass', atWord: A(0.74)},
      ],
      caption: 'every light green, and the code is still wrong',
      color: 'orange',
      atWord: A(0.08),
    },
  }));

// 35 · the irony
c.add('REVEAL', 'slide', 'zoneC',
  "And now for the part that genuinely made me sit back. Go and read the title of that pull request " +
  "one more time. Its entire purpose — the whole reason a person sat down and wrote it — was to make " +
  "the client report one particular error properly. And the bug we just walked through means that " +
  "exact error is the one that gets thrown away. The change broke the very thing it was written to do. " +
  "The reviewer spotted that too, by the way. It said so in its own words, unprompted.",
  (A) => ({
    headline: 'It broke the thing it was written to do',
    items: [
      {label: 'the pull request', sub: 'make the client report this error properly', atWord: A(0.3)},
      {label: 'the bug', sub: 'that error is the one that gets dropped', atWord: A(0.55)},
    ],
    source: 'grpc/grpc-go #7461, and the delegated review run on this machine',
  }));

// 36 · the decency beat — not optional
c.add('LOWER_THIRD', 'fade', 'zoneA',
  "One more thing, and I mean this. This isn't a story about one engineer having a bad day. Several " +
  "experienced people looked at this change and approved it, because it reads as correct — it reads as " +
  "correct to me, and I've now stared at it for hours. That's the whole point. A mistake like this " +
  "isn't caused by carelessness. It's caused by the fact that a colon is very small and a human eye " +
  "slides right over it. That's what a machine is genuinely good for.",
  (A) => ({
    title: 'This is about how review works',
    subtitle: 'not about who wrote it',
    atWord: A(0.3),
  }));

// ═══ VIII · THE FIX ═════════════════════════════════════════════════════════════

// 37 · it fixed it, and what Google actually shipped
blind('letterbox', 'zoneB',
  "And it didn't stop at telling us. Remember that slash command does two jobs — it reviews, and then " +
  "it repairs what it's confident about. Ask the project what's changed on disk and stream dot go has " +
  "been edited. Here's the repair it wrote: it's put the line back to the older form, where the answer " +
  "goes into the box that already exists instead of making a new one. No colon. So does that match " +
  "what Google actually did? Here's their real fix, seven days later. It's not character for character " +
  "the same — they restructured it slightly differently — but it's the same bug, the same two places, " +
  "and the same outcome. The machine and the maintainers agreed.",
  LOCAL,
  [
    {step: 'changed', at: 0.18, label: 'it edited the file', camera: [{frame: 'mod', at: 'stream dot go has been edited'}]},
    {step: 'patch', pivot: 'Here\'s the repair it wrote', label: 'the repair', camera: [{frame: 'fix', at: 'No colon'}]},
    {take: 'ocr-proof', step: 'realfix', pivot: 'Here\'s their real fix', label: 'what Google shipped',
      source: GRPC, camera: [{frame: 'line', at: 'the same bug'}]},
  ]);

// ═══ IX · WHO IT IS FOR ═════════════════════════════════════════════════════════

c.add('CHAPTER', 'wipe', 'zoneC',
  "So who is this actually for, and where does it fit in a normal week?",
  (A) => ({title: 'Who should use this', subtitle: 'and where it fits', atWord: A(0.4)}));

c.add('ICON_GRID', 'slide', 'zoneA',
  "If you write code, this is a second pair of eyes before you ask a colleague for theirs — and it " +
  "costs you nothing to be told your own mistake in private. If you review other people's code, it " +
  "clears the boring layer so you can spend your attention on whether the design is right, which is " +
  "the thing only you can do. If you test software, it reads paths your tests were never written for. " +
  "And if you run a team, the honest pitch isn't that it replaces review. It's that every change gets " +
  "a consistent first pass at three in the morning on a Friday, when the person who'd normally catch " +
  "it is asleep.",
  (A) => ({
    items: [
      {label: 'Developers', sub: 'told your own mistake in private', icon: 'lucide:code', atWord: A(0.1)},
      {label: 'Reviewers', sub: 'freed up for the design questions', icon: 'lucide:eye', atWord: A(0.3)},
      {label: 'Testers', sub: 'paths no test was written for', icon: 'lucide:flask-conical', atWord: A(0.5)},
      {label: 'Team leads', sub: 'the same first pass, every time', icon: 'lucide:users', atWord: A(0.68)},
    ],
  }));

c.add('LAYERED_STACK', 'fade', 'zoneA',
  "And it isn't only for sitting at your keyboard. It plugs into the robots that run checks " +
  "automatically every time anyone proposes a change — that's GitHub Actions, GitLab, Gerrit. It works " +
  "with other assistants too, not just Claude Code: Codex, Cursor and Kimi are all supported. It can " +
  "scan whole files rather than just changes, which is what you want when you've inherited a codebase " +
  "nobody understands any more. And it'll write its findings out as a structured file, so you can feed " +
  "them into whatever you already use.",
  (A) => ({
    layeredStack: {
      layers: [
        {label: 'Your editor', sub: 'Claude Code, Codex, Cursor, Kimi', atWord: A(0.36)},
        {label: 'Your pipeline', sub: 'GitHub Actions, GitLab, Gerrit', atWord: A(0.2)},
        {label: 'Whole-file scans', sub: 'for code with no recent changes', atWord: A(0.56)},
        {label: 'Structured output', sub: 'JSON you can feed anywhere', atWord: A(0.72)},
      ],
      caption: 'the same reviewer, wherever the code is',
      color: 'blue',
      atWord: A(0.06),
    },
    source: 'alibaba/open-code-review — integrations and CI/CD documentation',
  }));

// 41 · final honesty
c.add('SPEC_COMPARE', 'slide', 'zoneC',
  "Before you go and install it, here's what I'd want a friend to tell me. Two pull requests is a " +
  "demonstration, not a measurement — I picked them, I ran each one once, and I didn't retry anything " +
  "to get a nicer answer for the camera. It still misses most bugs; remember, four out of five. Most " +
  "of what it flags still isn't real. And what you watched was Claude Code's model doing the judging, " +
  "not the setup those benchmark numbers came from. What I'd actually claim is narrower, and I think " +
  "more useful: it stayed quiet on good code, and on a change that fooled several professionals, it " +
  "found the thing they missed and repaired it. That's worth ten minutes of your evening.",
  (A) => ({
    specCompare: {
      leftLabel: 'What this video showed',
      rightLabel: 'What it did not show',
      rows: [
        {left: 'silence on a correct pull request', right: 'a measured success rate', atWord: A(0.5)},
        {left: 'a real shipped bug, found blind', right: 'the benchmark setup', atWord: A(0.6)},
        {left: 'a repair matching the maintainers\'', right: 'that it finds most bugs', atWord: A(0.7)},
      ],
      caption: 'two pull requests, run once each, nothing retried',
      color: 'orange',
      atWord: A(0.08),
    },
  }));

// 42 · outro
c.add('OUTRO_CTA', 'fade', 'zoneA',
  "Everything's linked below — the project, the benchmark data, and both pull requests, so you can go " +
  "and check every number I've said out loud. If you've got a repository you inherited and don't fully " +
  "trust, that's the one to point this at first. Tell me what it finds, because I'd genuinely like to " +
  "know. And if this was useful, subscribe — there's more agent tooling coming.",
  (A) => ({
    headline: 'What will you point it at?',
    subtext: 'github.com/alibaba/open-code-review — Apache-2.0',
    atWord: A(0.5),
  }));

const spec = {
  meta: {
    topic: 'Open Code Review — Alibaba\'s reviewer, tested against a bug Google shipped',
    format: 'long',
    fps: 30,
    subject: 'Open Code Review',
    audioPrefix: 'open-code-review_long',
    onePayoff: 'whether an open-source AI reviewer can catch a real bug that human reviewers at Google approved and shipped',
    openLoop: 'Can a machine catch the bug three professional reviewers missed?',
    topicAxes: ['entity-novelty', 'workflow'],
    screenplay: 'documentary',
    seo: {
      title: 'Alibaba\'s AI Code Reviewer Caught A Bug Google Shipped — Tested Live',
      altTitles: [
        'I Gave Alibaba\'s Code Reviewer A Bug Google Missed',
        'Open Code Review: Beats Claude Code, Then Installs Inside It',
        'The Free AI Code Reviewer That Found What Google\'s Reviewers Missed',
      ],
      hook:
        'Alibaba open-sourced the code reviewer that reads Alibaba\'s own code — 33.9% precision against Claude ' +
        'Code\'s 7.2% on the same model, using about a ninth of the tokens. Then it ships as a Claude Code plugin. ' +
        'We install it, point it at a correct pull request from Google\'s gRPC library (it stays silent), and then ' +
        'at one that was merged with a bug in it and fixed a week later — without letting it see the fix.',
      description:
        'Open Code Review is Alibaba\'s internal AI code review tool, now Apache-2.0 and free. In this video we ' +
        'install it, add the Claude Code plugin, read its built-in rulesets, and run two blind tests on real ' +
        'pull requests from grpc/grpc-go. Includes a full beginner-level explanation of the variable-scope bug ' +
        'it found, and an honest look at what the benchmark numbers do and do not mean.',
      breakdown:
        'what a code review is, where Open Code Review came from, the AACR-Bench numbers and what they honestly ' +
        'mean, the deterministic-plus-agent split, the built-in rulesets on camera, installing the CLI and the ' +
        'Claude Code plugin, a control run on correct code, a blind test on a pull request that shipped a bug, ' +
        'the bug explained from first principles, and the repair compared with the maintainers\' own fix',
      pinned: 'The bug was one character — a colon. Which repository are you pointing this at first?',
      tags: [
        'Open Code Review', 'Alibaba', 'AI code review', 'code review', 'Claude Code', 'Claude Code plugin',
        'static analysis', 'gRPC', 'grpc-go', 'Go programming', 'variable shadowing', 'developer tools',
        'open source', 'code quality', 'pull request review', 'CI CD', 'GitHub Actions', 'software testing',
        'QA automation', 'AI agents', 'agentic coding', 'software engineering', 'code review automation',
      ],
      queries: [
        'AI code review tool open source',
        'Open Code Review Alibaba tutorial',
        'best AI code reviewer 2026',
        'Claude Code plugins',
        'automated pull request review',
      ],
      sources: [
        'github.com/alibaba/open-code-review — Open Code Review by Alibaba (Apache-2.0)',
        'huggingface.co/datasets/Alibaba-Aone/aacr-bench — the benchmark dataset',
        'github.com/grpc/grpc-go/pull/9290 — the correct pull request used as a control',
        'github.com/grpc/grpc-go/pull/7461 — the pull request that shipped the bug',
        'github.com/grpc/grpc-go/commit/5c4da090 — the maintainers\' own fix',
      ],
    },
  },
  brand: c.brand(),
  thumbnail: {
    title: 'IT CAUGHT WHAT GOOGLE MISSED',
    badge: 'Open Code Review',
    note: 'free · Apache-2.0 · tested live',
  },
  scenes: c.S,
};

c.emit('topics/open-code-review/long.json', spec);
