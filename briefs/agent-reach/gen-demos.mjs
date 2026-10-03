// Generates demos/ar-*.json for the Agent Reach hands-on.
//   node briefs/agent-reach/gen-demos.mjs
// Record one take with: powershell -File briefs/agent-reach/take.ps1 <slug> [-Fresh]
//
// The terminal is Windows PowerShell, so `curl` is typed as `curl.exe` (the bare word is an alias for
// Invoke-WebRequest there). Agent Reach itself prints Chinese; marks are placed on its own Chinese
// text and translated by the spec's callouts.
//
// NEVER FILMED: `twitter whoami` / `twitter status` (print the account), raw `rdt` JSON (prints the
// session's modhash), and any X write command (post, like, follow, delete).
import fs from 'node:fs';

const base = (slug, extra = {}) => ({
  slug, surface: 'vscode', theme: 'dark', workspace: slug,
  viewport: {width: 1600, height: 900}, deviceScaleFactor: 4, masterWidth: 3840, fps: 30,
  terminalOnly: true, maxHoldMs: 1600, settings: {'workbench.startupEditor': 'none'},
  ...extra,
});
const run = (id, cmd, label, extra = {}) =>
  ({id, action: 'run', cmd, label, focus: 'terminal', clearFirst: true, timeout: 240000, ...extra});
const web = (slug, url, steps) => ({
  slug, surface: 'browser', theme: 'dark', viewport: {width: 1600, height: 900}, fps: 30,
  masterWidth: 3840, deviceScaleFactor: 2.4, prep: {url, settleMs: 5000, hide: SPONSORS}, steps,
});

// REMOVED FROM THE PAGE, NOT BLURRED (owner, 2026-10-03): the README's sponsor block is third-party
// advertising with referral links. These selectors delete its heading, its 'appear here' line and the table.
const SPONSORS = ['article.markdown-body details:has(table)', 'article.markdown-body blockquote:has(a[href^="mailto:"])',
  'article.markdown-body .markdown-heading:has(+ blockquote:has(a[href^="mailto:"]))'];
const REPO = 'https://github.com/Panniantong/Agent-Reach';
const ZIP = 'https://github.com/Panniantong/agent-reach/archive/main.zip';
const VIDEO = 'https://www.youtube.com/watch?v=AJpK3YTTKZ4'; // "Introducing Claude Code", Anthropic, 3:55. (fl1DSmwQKKY answered its subtitle request with HTTP 429.)

const demos = [
  // 0. Smoke: proves the recorder, the venv on PATH and the recording home on this machine.
  base('ar-smoke', {prep: {files: {'README.txt': 'Agent Reach hands-on\n'}}, steps: [
    run('doctor', 'agent-reach doctor', 'the health check',
      {expect: {contains: 'Agent Reach', exitCode: 0}, marks: [{id: 'yt', text: 'YouTube'}]}),
  ]}),

  // 1. The source of truth: the project's own page, then the maintainer's own English README.
  web('ar-repo', REPO, [
    {id: 'top', action: 'pause', ms: 2000, label: 'Agent Reach on GitHub',
     marks: [{id: 'desc', text: 'Give your AI agent eyes to see the entire internet.'},
             {id: 'license', text: 'MIT license'}, {id: 'stars', text: 'k stars'}]},
    {id: 'zh', action: 'scroll', target: 'text=给你的 AI Agent 一键装上互联网能力', settleMs: 2200,
     label: 'the README is written in Chinese',
     marks: [{id: 'tagline', text: '给你的 AI Agent 一键装上互联网能力'}, {id: 'english', text: 'English'}]},
  ]),
  web('ar-readme', `${REPO}/blob/main/docs/README_en.md`, [
    {id: 'top', action: 'scroll', target: 'text=Give your AI Agent one-click access to the entire internet', settleMs: 2200,
     label: 'the maintainer’s own English version',
     marks: [{id: 'tagline', text: 'Give your AI Agent one-click access to the entire internet'},
             {id: 'promise', text: 'The most reliable access path for each platform'}]},
    {id: 'pain', action: 'scroll', target: 'text=Why Agent Reach?', settleMs: 2200,
     label: 'why reading these platforms is hard',
     marks: [{id: 'x', text: 'Pay-per-use, moderate usage ~$215/month'}, {id: 'reddit', text: 'Server IPs get 403'},
             {id: 'xhs', text: 'Login required to browse'}, {id: 'one', text: 'Agent Reach turns this into one command'}]},
    {id: 'platforms', action: 'scroll', target: 'text=Supported Platforms', settleMs: 2200,
     label: 'what it says it can reach',
     marks: [{id: 'web', text: 'Any URL → clean Markdown'},
             {id: 'x', text: 'Cookie unlocks search, timeline, tweet reading, articles'}]},
    // The table is taller than the window: its lower half is a step of its own.
    {id: 'platforms2', action: 'scroll', target: 'text=Subtitles + search across 1800+ video sites', settleMs: 2200,
     label: 'further down the same table',
     marks: [{id: 'yt', text: 'Subtitles + search across 1800+ video sites'},
             {id: 'reddit', text: 'No zero-config path (anonymous endpoints blocked)'}]},
    {id: 'layer', action: 'scroll', target: 'text=Design Philosophy', settleMs: 2200,
     label: 'what it is, in the author’s words',
     marks: [{id: 'layer', text: 'Agent Reach is a capability layer, not yet another tool.'},
             {id: 'does', text: 'selection, installation, health checks, and routing'}]},
    {id: 'backends', action: 'scroll', target: 'text=Every platform = an ordered backend list', settleMs: 2200,
     label: 'one ordered list of tools per platform',
     marks: [{id: 'x', text: 'twitter-cli ▸ OpenCLI ▸ bird'}, {id: 'reddit', text: 'OpenCLI ▸ rdt-cli'},
             {id: 'yt', text: 'yt-dlp'}]},
  ]),

  // 2. Install, the read-only check, and the health check. Recorded with -Fresh (an empty venv).
  base('ar-install', {prep: {files: {'README.txt': 'Agent Reach hands-on\n'}}, steps: [
    run('pip', `pip install ${ZIP}`, 'install the package from GitHub',
      {expect: {contains: 'Successfully installed', exitCode: 0}, timeout: 600000,
       marks: [{id: 'ok', text: 'Successfully installed'}]}),
    run('check', 'agent-reach install --env=auto', 'the read-only check: nothing on the machine is changed',
      {expect: {contains: 'No changes were made', exitCode: 0},
       marks: [{id: 'safe', text: 'SAFE MODE'}, {id: 'mcp', text: 'mcporter not installed'},
               {id: 'done', text: 'No changes were made'}]}),
    run('doctor', 'agent-reach doctor', 'the health check, in Chinese',
      {expect: {contains: 'Agent Reach', exitCode: 0},
       marks: [{id: 'legend', text: '图例'}, {id: 'ready', text: '装好即用'}, {id: 'gh', text: 'GitHub 仓库和代码'},
               {id: 'yt', text: 'YouTube 视频和字幕'}, {id: 'rss', text: 'RSS/Atom 订阅源'},
               {id: 'exa', text: '全网语义搜索'}, {id: 'web', text: '任意网页'}, {id: 'status', text: '状态：'}]}),
  ]}),

  // 3. The channels that need no login.
  base('ar-read', {prep: {files: {'README.txt': 'Agent Reach hands-on\n'}}, steps: [
    // Parenthesised so curl finishes before Select-Object closes the pipe (otherwise it exits -1).
    run('web', '(curl.exe -s https://r.jina.ai/https://en.wikipedia.org/wiki/Model_Context_Protocol) | Select-Object -First 14',
      'any web page, handed back as clean text',
      {expect: {contains: 'Title:', exitCode: 0}, marks: [{id: 'title', text: 'Title:'}, {id: 'src', text: 'URL Source:'}]}),
    run('ytsearch', 'yt-dlp --flat-playlist --print "%(channel)s  |  %(title)s" "ytsearch5:what is claude code"',
      'search YouTube from the terminal', {expect: {exitCode: 0}}),
    run('subs', `yt-dlp --write-auto-sub --sub-lang en --skip-download -o "subs/%(id)s" ${VIDEO}`,
      'download a video’s subtitles, not the video',
      {expect: {contains: 'subs', exitCode: 0}, marks: [{id: 'wrote', text: 'Writing video subtitles'}]}),
    run('read', "Get-Content subs\\*.vtt | Where-Object { $_.Trim() -and $_ -notmatch '-->|<' } | Select-Object -Unique | Select-Object -First 12",
      'the words of the video, as text', {expect: {contains: 'captions', exitCode: 0}, marks: [{id: 'kind', text: 'Kind: captions'}]}),
    run('rss', `python -c "import feedparser; [print('-', e.title) for e in feedparser.parse('https://github.blog/feed/').entries[:6]]"`,
      'any RSS feed', {expect: {exitCode: 0}}),
    run('gh', 'gh search repos "agent skills" --sort stars --limit 5', 'search GitHub', {expect: {contains: 'repositories', exitCode: 0}, marks: [{id: 'count', text: 'repositories'}, {id: 'head', text: 'DESCRIPTION'}]}),
    run('bili', 'bili search "Claude Code" --type video -n 3', 'and Bilibili, the Chinese video site', {expect: {exitCode: 0}}),
  ]}),

  // 4. X. Recorded with -Fresh: the PyPI release, the failure, the fix from source, the search.
  base('ar-x', {prep: {files: {'README.txt': 'Agent Reach hands-on\n'}}, steps: [
    run('pip', 'pip install -q twitter-cli', 'the X backend, from PyPI', {expect: {exitCode: 0}, timeout: 600000}),
    run('fail', 'twitter search "Claude Code" --from claudeai -n 3', 'the first search', {expect: {contains: '404'},
      marks: [{id: 'err', text: '404'}]}),
    run('fix', 'pip install -q -U git+https://github.com/public-clis/twitter-cli.git', 'the newest source instead',
      {expect: {exitCode: 0}, timeout: 600000}),
    run('search', 'twitter search "Claude Code" --from claudeai -n 3', 'the same search again', {expect: {contains: 'Fetched 3', exitCode: 0},
      marks: [{id: 'ok', text: 'Fetched 3'}, {id: 'head', text: 'Author'}, {id: 'stats', text: 'Stats'}]}),
    run('posts', 'twitter user-posts AnthropicAI -n 3', 'one account’s recent posts', {expect: {contains: 'Fetched 3', exitCode: 0},
      marks: [{id: 'ok', text: 'Fetched 3'}, {id: 'who', text: '@AnthropicAI tweets'}]}),
  ]}),

  // 5. Reddit.
  base('ar-reddit', {prep: {files: {'README.txt': 'Agent Reach hands-on\n'}}, steps: [
    run('search', 'rdt search "claude code" -t week -n 5', 'search Reddit, this week only', {expect: {contains: '5 results', exitCode: 0},
      marks: [{id: 'count', text: '5 results'}, {id: 'head', text: 'Subreddit'}, {id: 'more', text: 'to read a result'}]}),
    run('sub', 'rdt search "agent" -r ClaudeAI -s top -t month -n 5', 'one subreddit, top of the month', {expect: {exitCode: 0}, marks: [{id: 'head', text: 'Subreddit'}]}),
  ]}),

  // 6. Exa web search, and the health check afterwards.
  base('ar-exa', {prep: {files: {'README.txt': 'Agent Reach hands-on\n'}}, steps: [
    run('npm', 'npm install -g mcporter', 'the one missing piece for web search', {expect: {exitCode: 0}, timeout: 600000}),
    // Its confirmation prints the config file's full path, which the recorder refuses to film.
    run('config', 'mcporter config add exa https://mcp.exa.ai/mcp --scope home | Out-Null', 'point it at Exa', {expect: {exitCode: 0}}),
    run('search', '(mcporter call exa.web_search_exa query="Agent Reach github Panniantong" numResults=3) | Select-Object -First 16',
      'a web search with no API key', {expect: {exitCode: 0}}),
    run('doctor', 'agent-reach doctor', 'the health check again',
      {expect: {contains: 'Agent Reach', exitCode: 0}, marks: [{id: 'exa', text: '全网语义搜索'}, {id: 'status', text: '状态：'}]}),
  ]}),

  // 7. The headline: paste one line into an AI agent. Live Claude Code (Sonnet), clean config home.
  //    Every waitFor is text the TOOL prints; the marker is described in words so the prompt cannot match it.
  //
  //    WHAT THE FIRST TAKE SHOWED (2026-10-03): Claude Code runs PowerShell on Windows, the session was in
  //    auto mode, and its permission classifier DENIED the install as "Unauthorized Persistence". That is
  //    the product behaving as designed, so it is filmed as it is (ar-agent). The question is then asked in
  //    a second session where PowerShell has been allowed, which is the route the agent itself offers.
  //
  //    openOnInstall: the Claude Code editor extension opened its Welcome walkthrough mid-take, which
  //    un-maximised the terminal and swallowed the keys of the next prompt.
  ...[['ar-agent', 'Read,Grep,Glob,Edit,Write,Bash,WebFetch'], ['ar-agent2', 'Read,Grep,Glob,Edit,Write,Bash,PowerShell,WebFetch']].map(([slug, tools]) =>
    base(slug, {settings: {'workbench.startupEditor': 'none', 'workbench.welcomePage.walkthroughs.openOnInstall': false},
      prep: {files: {'README.txt': 'Agent Reach hands-on\n'}}, steps: [
        {id: 'launch', action: 'run', background: true, waitFor: 'shift+tab to cycle', timeout: 90000, settleMs: 2500,
         cmd: 'claude --model sonnet --allowedTools "' + tools + '"', label: 'start Claude Code', focus: 'terminal', clearFirst: true},
        slug === 'ar-agent'
          ? {id: 'install', action: 'agent', focus: 'terminal', timeout: 900000, settleMs: 3000, waitFor: '+++',
             label: 'the one line from the README, pasted into the agent',
             text: 'Install Agent Reach: https://raw.githubusercontent.com/Panniantong/agent-reach/main/docs/install.md ' +
               'Use the read-only check only, never the system flag. Reply in English, and end your reply with a line of three plus signs.',
             marks: [{id: 'guide', text: 'Installation Guide'}, {id: 'denied', text: 'Denied by auto mode classifier'},
                     {id: 'why', text: 'Unauthorized Persistence'}]}
          : {id: 'ask', action: 'agent', focus: 'terminal', timeout: 900000, settleMs: 3000, waitFor: '$$$',   // NOT '===': agent-reach doctor prints a rule of equals signs, which ended the first take at 52s
             label: 'one real question, three platforms',
             text: 'Agent Reach is installed and agent-reach is on the PATH. Using it, what are people saying about Claude Code ' +
               'this week on X, on Reddit and on YouTube? Two short points from each, with a link. Keep it clean and in English, ' +
               'and end your reply with a line containing only three dollar signs.'},
      ]})),
];

fs.mkdirSync('demos', {recursive: true});
for (const d of demos) fs.writeFileSync(`demos/${d.slug}.json`, JSON.stringify(d, null, 2) + '\n');
console.log(`wrote ${demos.length} demos: ${demos.map((d) => d.slug).join(', ')}`);
