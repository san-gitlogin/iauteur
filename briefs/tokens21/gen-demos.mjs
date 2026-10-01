// Generates demos/tok-*.json for "21 ways to save Claude Code tokens".
//   node briefs/tokens21/gen-demos.mjs            -> writes every demo
// Then record one take with: bash briefs/tokens21/take.sh <slug>
//
// Every take gets its OWN workspace (<rec-root>/<slug>), wiped by take.sh, so no take inherits a
// session, a file or a setting from another. All Claude runs use Sonnet 5.5 under the CLEAN config home
// (rec.sh). Interactive takes launch Claude, then drive it with `agent` steps whose waitFor is text the
// TOOL prints (never text the step types).
import fs from 'node:fs';

// ── the lab: a tiny Python shop ─────────────────────────────────────────────────────────────
const PRICES = `"""Prices for the tiny shop."""

TAX_RATE = 0.08


def apply_discount(price, percent):
    """Return the price after a percentage discount."""
    return round(price * (1 - percent / 100), 2)


def with_tax(price):
    return round(price * (1 + TAX_RATE), 2)
`;
const CART = `"""A shopping cart."""
from shop.prices import apply_discount, with_tax


class Cart:
    def __init__(self):
        self.items = []

    def add(self, name, price, qty=1):
        self.items.append((name, price, qty))

    def subtotal(self):
        return round(sum(p * q for _, p, q in self.items), 2)

    def total(self, discount=0):
        return with_tax(apply_discount(self.subtotal(), discount))
`;
const TESTS = `import pytest
from shop.prices import apply_discount, with_tax
from shop.cart import Cart


@pytest.mark.parametrize("price,percent,expected", [
    (100, 0, 100), (100, 10, 90), (100, 25, 75), (80, 50, 40), (19.99, 10, 17.99),
    (5, 20, 4), (250, 15, 212.5), (12.5, 40, 7.5), (1000, 5, 950), (3.3, 30, 2.31),
    (60, 100, 0), (45, 12, 39.6), (9.99, 50, 5.0), (72, 25, 54), (200, 1, 198),
])
def test_apply_discount(price, percent, expected):
    assert apply_discount(price, percent) == expected


@pytest.mark.parametrize("price,expected", [
    (100, 108), (0, 0), (10, 10.8), (19.99, 21.59), (50, 54), (1, 1.08),
    (250, 270), (12.5, 13.5), (99.99, 107.99), (5, 5.4), (7.25, 7.83), (30, 32.4),
])
def test_with_tax(price, expected):
    assert with_tax(price) == expected


@pytest.mark.parametrize("items,discount,expected", [
    ([("pen", 2, 3)], 0, 6.48), ([("book", 20, 1)], 10, 19.44), ([("mug", 8, 2), ("tea", 4, 1)], 0, 21.6),
    ([], 0, 0), ([("lamp", 40, 1)], 50, 21.6), ([("cable", 5, 4)], 25, 16.2),
    ([("desk", 150, 1)], 0, 162), ([("chair", 90, 2)], 10, 174.96), ([("ink", 3.5, 2)], 0, 7.56),
    ([("bag", 30, 1), ("tag", 1, 5)], 20, 30.24), ([("note", 1.25, 8)], 0, 10.8), ([("box", 12, 3)], 5, 36.94),
    ([("clip", 0.5, 10)], 0, 5.4),
])
def test_cart_total(items, discount, expected):
    cart = Cart()
    for name, price, qty in items:
        cart.add(name, price, qty)
    assert cart.total(discount) == expected
`;
const CLAUDE_MD_LEAN = `# tiny shop

Python 3, no framework.

## Commands
- Run tests: \`python -m pytest -q\`
- Run one file: \`python -m pytest -q tests/test_prices.py\`

## Compact instructions
When you compact, keep the function names, the test command, and any failing test output.
`;
// A deliberately BLOATED CLAUDE.md: the release, migration and review workflows pasted in full,
// which is exactly what the docs tell you to move into skills. Generated so it is big and plausible.
const WORKFLOW = (name, n) => {
  const lines = [`## ${name} workflow (read every time)`, ''];
  for (let i = 1; i <= n; i++) {
    lines.push(`${i}. ${name} step ${i}: check the branch is clean, confirm the version in pyproject, ` +
      `run the full suite with coverage, compare the changelog entry against the diff, and post the ` +
      `summary in the team channel before moving on to step ${i + 1}.`);
  }
  return lines.join('\n');
};
const CLAUDE_MD_BLOATED = [
  '# tiny shop', '', 'Python 3, no framework.', '',
  WORKFLOW('Release', 60), '', WORKFLOW('Database migration', 60), '', WORKFLOW('Code review', 60), '',
].join('\n');
const SKILL_RELEASE = `---
name: release
description: The step-by-step release checklist for tiny shop. Use only when cutting a release.
---

${WORKFLOW('Release', 60)}
`;
const LOG_DIGGER = `---
name: log-digger
description: Reads large log files and returns only the ERROR lines with a count. Use for any log file.
model: haiku
tools: Read, Grep, Bash
---

You read log files for the main agent. Reply with ONLY: the number of ERROR lines, then each ERROR
line exactly as it appears. No commentary, no other lines.
`;
// A 6,000-line application log with exactly three ERROR lines, generated in prep so the demo stays small.
const MAKE_LOG = `python -c "import random; random.seed(7); L=['2026-09-30 10:%02d:%02d INFO request ok path=/cart id=%d ms=%d' % (i//60%60, i%60, i, random.randint(3,90)) for i in range(6000)]; L[1204]='2026-09-30 10:20:04 ERROR payment gateway timeout order=1204'; L[3377]='2026-09-30 10:56:17 ERROR tax table missing region=EU-7'; L[5810]='2026-09-30 10:36:50 ERROR cart total negative id=5810'; open('logs/app.log','w').write(chr(10).join(L)+chr(10))"`;

const BILL = `import json, sys
j = json.load(sys.stdin)
u = j["usage"]
prompt = sys.argv[1] if len(sys.argv) > 1 else ""
sent = u["input_tokens"] + u["cache_read_input_tokens"] + u["cache_creation_input_tokens"]
words = len(prompt.split())
print()
print(f"  your prompt       {words} words, about {round(words / 0.75)} tokens")
print(f"  request sent      {sent:>7,} tokens")
print(f"    read from cache {u['cache_read_input_tokens']:>7,}")
c = u["cache_creation"]
print(f"    written to cache{u['cache_creation_input_tokens']:>7,}")
print(f"      kept 1 hour     {c['ephemeral_1h_input_tokens']:>7,}")
print(f"      kept 5 minutes  {c['ephemeral_5m_input_tokens']:>7,}")
print(f"    new input       {u['input_tokens']:>7,}")
print(f"  reply             {u['output_tokens']:>7,} tokens")
print()
`;
const TTL = `import json, sys
c = json.load(sys.stdin)["usage"]["cache_creation"]
print()
print(f"  cache writes kept 1 hour     {c['ephemeral_1h_input_tokens']:>7,} tokens")
print(f"  cache writes kept 5 minutes  {c['ephemeral_5m_input_tokens']:>7,} tokens")
print()
`;
const THINK = `import json, sys
j = json.load(sys.stdin)
u = j["usage"]
print()
print(f"  answer           {j['result'].strip()}")
print(f"  thinking tokens  {u['output_tokens_details']['thinking_tokens']:>6,}")
print(f"  output tokens    {u['output_tokens']:>6,}")
print()
`;

const LAB = {
  'shop/__init__.py': '',
  'shop/prices.py': PRICES,
  'shop/cart.py': CART,
  'tests/__init__.py': '',
  'tests/test_prices.py': TESTS,
  'CLAUDE.md': CLAUDE_MD_LEAN,
  'logs/.keep': '',
};

// ── helpers ─────────────────────────────────────────────────────────────────────────────────
const base = (slug, extra = {}) => ({
  slug, surface: 'vscode', theme: 'dark', workspace: slug,
  viewport: {width: 1600, height: 900}, deviceScaleFactor: 4, masterWidth: 3840, fps: 30,
  terminalOnly: true, maxHoldMs: 1600, settings: {'workbench.startupEditor': 'none'},
  ...extra,
});
const TOOLS = '"Read,Grep,Glob,Edit,Write,Bash,Agent"';
const launch = (label = 'start Claude Code on Sonnet 5.5') => ({
  id: 'launch', action: 'run', background: true, waitFor: 'shift+tab to cycle', timeout: 90000, settleMs: 2500,
  cmd: `claude --model sonnet --allowedTools ${TOOLS}`, label, focus: 'terminal', clearFirst: true,
});
const agent = (id, text, waitFor, label, extra = {}) =>
  ({id, action: 'agent', text, waitFor, label, focus: 'terminal', timeout: 240000, settleMs: 2500, ...extra});
const keys = (id, keysAfter, waitFor, label, extra = {}) =>
  ({id, action: 'agent', keysAfter, waitFor, label, focus: 'terminal', timeout: 60000, settleMs: 2000, ...extra});
const ctx = (id = 'ctx', label = 'what is riding along with every message') => [
  // Control+End first: an earlier reveal may have left the viewport scrolled UP, and new output then
  // renders below what the camera (and the read-back) can see.
  agent(id, '/context', '└ init', label, {timeout: 60000, settleMs: 2500, keysBefore: ['Control+End']}),
  {id: `${id}-up`, action: 'reveal', target: 'terminal', text: 'Autocompact buffer', pageUp: 8, settleMs: 1800,
   label: 'scroll back to the categories', focus: 'terminal',
   marks: [{id: 'tools', text: 'System tools:'}, {id: 'memory', text: 'Memory files:'}, {id: 'skills', text: 'Skills:'},
           {id: 'msgs', text: 'Messages:'}, {id: 'free', text: 'Free space:'}, {id: 'window', text: 'Auto-compact window:'}]},
];
const run = (id, cmd, label, extra = {}) =>
  ({id, action: 'run', cmd, label, focus: 'terminal', clearFirst: true, timeout: 240000, ...extra});
const END = 'End your reply with a line of three plus signs.';

const P_HI = 'Reply with just the word hi.';
const P_PUZZLE = 'How many positive integers below 1000 are divisible by 7 but not by 11, and whose digits sum to an even number? Reply with only the number.';

// ── the takes ───────────────────────────────────────────────────────────────────────────────
const demos = [
  // 1. The bill: your prompt vs everything that rides with it. And the TTL half of move 21.
  base('tok-bill', {prep: {files: {...LAB, 'bill.py': BILL, 'ttl.py': TTL}}, steps: [
    run('bill', `claude -p "${P_HI}" --model sonnet --output-format json | python bill.py "${P_HI}"`,
      'one tiny prompt, and the whole request it rode in',
      {expect: {contains: 'request sent', exitCode: 0},
       marks: [{id: 'prompt', text: 'your prompt'}, {id: 'sent', text: 'request sent'}, {id: 'h1', text: 'kept 1 hour'}]}),
  ]}),

  // 2. /context — the teaser and the map.
  base('tok-context', {prep: {files: LAB}, steps: [launch(), ...ctx()]}),

  // 3. Thinking: the environment variable does nothing on Sonnet 5.5; /effort does.
  base('tok-thinking', {prep: {files: {...LAB, 'think.py': THINK}}, steps: [
    run('zero', '$env:MAX_THINKING_TOKENS=0', 'thinking switched off, the way the infographic says',
      {expect: {exitCode: 0}, timeout: 30000}),
    run('high', `claude -p "${P_PUZZLE}" --model sonnet --effort high --output-format json | python think.py`,
      'a hard question, effort high, thinking supposedly off',
      {expect: {contains: 'thinking tokens', exitCode: 0}, marks: [{id: 'think', text: 'thinking tokens'}]}),
    run('low', `claude -p "${P_PUZZLE}" --model sonnet --effort low --output-format json | python think.py`,
      'the same question, effort low',
      {expect: {contains: 'thinking tokens', exitCode: 0}, marks: [{id: 'think', text: 'thinking tokens'}]}),
  ]}),

  // 4. Quiet flags, and the commands you run all day written into CLAUDE.md.
  base('tok-quiet', {prep: {files: LAB}, steps: [
    run('loud', 'python -m pytest -v', 'the noisy version: one line per test',
      {expect: {contains: 'passed', exitCode: 0}}),
    run('quiet', 'python -m pytest -q', 'the quiet version of the same run',
      {expect: {contains: 'passed', exitCode: 0}, marks: [{id: 'sum', text: 'passed'}]}),
    run('count', '(python -m pytest -v | Measure-Object -Line).Lines; (python -m pytest -q | Measure-Object -Line).Lines',
      'how many lines each one hands back', {expect: {exitCode: 0}}),
    run('md', 'Get-Content CLAUDE.md', 'the two commands you run all day, written down once',
      {expect: {contains: 'Compact instructions', exitCode: 0},
       marks: [{id: 'cmds', text: '## Commands', to: 'Run one file'}, {id: 'compact', text: '## Compact instructions', to: 'failing test output'}]}),
  ]}),

  // 5. /mcp — see what is connected.
  base('tok-mcp', {prep: {files: LAB}, steps: [launch(), agent('mcp', '/mcp', 'claude.ai', 'every MCP server this session can see',
    {timeout: 60000, marks: [{id: 'servers', text: '5 servers'}, {id: 'atlassian', text: 'claude.ai Atlassian Rovo'}, {id: 'hidden', text: 'Show unused connectors'}]})]}),

  // 6. /rename, /clear, /resume.
  base('tok-clear', {prep: {files: LAB}, steps: [launch(),
    agent('ask', `In one sentence, what does apply_discount in shop/prices.py do? ${END}`, '+++', 'a small, finished task'),
    agent('rename', '/rename discount-question', 'renamed to', 'name the session before you leave it'),
    agent('clear', '/clear', undefined, 'start fresh for the next task', {timeout: 30000, waitGone: '+++'}),
    agent('resume', '/resume', 'discount-question', 'and it is still there when you want it back', {timeout: 30000}),
  ]}),

  // 7. /compact with instructions.
  base('tok-compact', {prep: {files: LAB}, steps: [launch(),
    agent('work', `Read shop/prices.py and shop/cart.py and list every function with a one-line description. ${END}`, '+++',
      'some real work in the conversation'),
    ...ctx('before', 'how big the conversation is now'),
    agent('compact', '/compact keep the function names and the test command', 'Compacted', 'squeeze it, and say what to keep',
      {timeout: 240000}),
  ]}),

  // 8. /rewind.
  base('tok-rewind', {prep: {files: LAB}, steps: [launch(),
    agent('one', `Add a one-line docstring to with_tax in shop/prices.py. ${END}`, '+++', 'a change you wanted'),
    agent('two', `Now rename TAX_RATE to SALES_TAX in shop/prices.py only. Do not run the tests. ${END}`, '+++', 'a change you did not want', {timeout: 480000}),
    agent('rewind', '/rewind', 'Rewind', 'go back to before the wrong turn', {timeout: 30000}),
  ]}),

  // 9. /autocompact 200k.
  base('tok-autocompact', {prep: {files: LAB}, steps: [launch(),
    agent('set', '/autocompact 200k', 'window set to', 'compact at 200 thousand instead of a million', {timeout: 30000}),
    ...ctx('ctx', 'the window, as the session now sees it'),
  ]}),

  // 10. @-mention vs a vague ask.
  base('tok-mention', {prep: {files: LAB}, steps: [launch(),
    agent('vague', `Where is the tax rate set in this project, and what is it? ${END}`, '+++', 'a vague question: Claude has to go looking'),
    agent('mention', `@shop/prices.py what is the tax rate? ${END}`, '+++', 'the same question, with the file named', {keysBefore: []}),
  ]}),

  // 11. /model and /effort.
  base('tok-model', {prep: {files: LAB}, steps: [launch(),
    agent('model', '/model', 'Haiku', 'the model picker', {timeout: 30000}),
    keys('close', ['Escape'], 'Kept model', 'keep Sonnet', {timeout: 20000}),
    agent('effort', '/effort low', 'Set effort level', 'turn the effort down for a simple job', {timeout: 30000}),
  ]}),

  // 12. /loop.
  base('tok-loop', {prep: {files: LAB}, steps: [launch(),
    agent('loop', '/loop 30m run python -m pytest -q and tell me only if a test fails', 'Scheduled', 'a job that repeats every thirty minutes',
      {timeout: 240000}),
  ]}),

  // 13. CLAUDE.md: bloated, then workflows moved into a skill.
  base('tok-claudemd', {prep: {files: {...LAB, 'CLAUDE.md': CLAUDE_MD_BLOATED}}, steps: [launch(), ...ctx('ctx', 'a CLAUDE.md with three workflows pasted in')]}),
  base('tok-skills', {prep: {files: {...LAB, '.claude/skills/release/SKILL.md': SKILL_RELEASE}}, steps: [launch(), ...ctx('ctx', 'the same workflows, moved into a skill')]}),

  // 14. A subagent on Haiku digs through a big log.
  base('tok-subagent', {prep: {files: {...LAB, '.claude/agents/log-digger.md': LOG_DIGGER}, commands: [MAKE_LOG]}, steps: [
    run('size', '(Get-Content logs/app.log | Measure-Object -Line).Lines; Get-Content .claude/agents/log-digger.md',
      'six thousand lines of log, and a helper that runs on Haiku',
      {expect: {contains: 'model: haiku', exitCode: 0}, marks: [{id: 'haiku', text: 'model: haiku'}]}),
    launch(),
    agent('dig', `Use the log-digger agent to find the errors in logs/app.log, and give me its answer. ${END}`, '+++',
      'the log is read somewhere else; only the answer comes back'),
    ...ctx('ctx', 'what the main conversation actually carries now'),
  ]}),

  // 15. /fast on this plan.
  base('tok-fast', {prep: {files: LAB}, steps: [launch(),
    agent('fast', '/fast', 'usage credits', 'what fast mode says on a Pro plan', {timeout: 30000,
      marks: [{id: 'what', text: 'High-speed mode for Opus 5.5'}, {id: 'credits', text: 'Fast mode requires usage credits'}]}),
  ]}),

  // 16. The source of truth: Anthropic's own docs.
  {slug: 'tok-docs', surface: 'browser', theme: 'dark', viewport: {width: 1600, height: 900}, fps: 30,
   masterWidth: 3840, deviceScaleFactor: 2.4, prep: {url: 'https://code.claude.com/docs/en/costs', settleMs: 5000, dismiss: ['Reject all cookies'], hide: ['*:has(> textarea.chat-assistant-input)', 'textarea.chat-assistant-input']},
   steps: [
     {id: 'top', action: 'pause', ms: 1800, label: 'Anthropic’s own page on what Claude Code costs',
      marks: [{id: 'charges', text: 'Claude Code charges by API token consumption.'}]},
     {id: 'thinking', action: 'scroll', target: 'text=which always use extended thinking', settleMs: 600,
      label: 'down to the thinking section'},
     {id: 'thinking2', action: 'scroll', by: 380, settleMs: 2200, label: 'the line that corrects the infographic',
      marks: [{id: 'cant', text: 'You can’t turn off thinking on Opus 5.5, Sonnet 5.5, or the Fable models'}]},
     {id: 'resend', action: 'scroll', target: 'text=Claude Code sends your full conversation with every request', settleMs: 2200,
      label: 'the sentence the whole video rests on',
      marks: [{id: 'full', text: 'Claude Code sends your full conversation with every request'}]},
   ]},
  {slug: 'tok-cachedocs', surface: 'browser', theme: 'dark', viewport: {width: 1600, height: 900}, fps: 30,
   masterWidth: 3840, deviceScaleFactor: 2.4, prep: {url: 'https://code.claude.com/docs/en/prompt-caching', settleMs: 5000, dismiss: ['Reject all cookies'], hide: ['*:has(> textarea.chat-assistant-input)', 'textarea.chat-assistant-input']},
   steps: [
     {id: 'ttl', action: 'scroll', target: 'text=Claude subscription, within plan usage', settleMs: 2400,
      label: 'which cache lifetime you get, by how you pay',
      marks: [{id: 'table', text: 'Claude subscription, within plan usage'}]},
     {id: 'flag', action: 'scroll', target: 'text=ENABLE_PROMPT_CACHING_1H=1', settleMs: 2400,
      label: 'the flag from the infographic, in the docs',
      marks: [{id: 'flag', text: 'ENABLE_PROMPT_CACHING_1H=1'}]},
   ]},
];

fs.mkdirSync('demos', {recursive: true});
for (const d of demos) fs.writeFileSync(`demos/${d.slug}.json`, JSON.stringify(d, null, 2) + '\n');
console.log(`wrote ${demos.length} demos: ${demos.map((d) => d.slug).join(', ')}`);
