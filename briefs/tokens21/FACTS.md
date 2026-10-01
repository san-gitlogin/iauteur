# 21 ways to save Claude tokens — FACTS (fetched 2026-09-30, Claude Code 2.1.284 on this machine)

Source infographic: Charlie Hills, charliehills.substack.com — "21 ways to save Claude tokens".
Subtitle: "Anthropic published how Claude Code bills you. Almost none of it is your prompt."
Three levels: SURFACE (4 things everyone reaches for: cheaper model, shorter prompts, clear the chat
sometimes, turn thinking off) · WHAT IT ACTUALLY IS: 12 commands (/clear /compact /rewind /rename /loop
/autocompact 200k /context /mcp @-mention a file · Mention it once · /model /effort) · DEEPER: 9 need
setting up (CLAUDE.md specific-only/workflows into skills · Compact instructions section · Quiet flags ·
Put the 2-3 all-day commands in CLAUDE.md · Run it in a subagent · model: haiku in subagent file ·
Fast mode on at start never midway · MAX_THINKING_TOKENS=0 launch prefix · ENABLE_PROMPT_CACHING_1H=1 API key only)
Footer: CHARLIE HILLS · charliehills.substack.com · 21 MOVES · 3 LEVELS

## Anthropic docs — code.claude.com/docs/en/costs ("Manage costs effectively")
- "Claude Code charges by API token consumption."
- Enterprise avg ~$13 per developer per active day, $150-250/month; <$30/active day for 90% of users.
- /usage Session block: tokens + dollar estimate at list price; resets on /clear (v2.1.211+).
  Prompt cache (main) line: "% of input tokens from cache", misses, warm/cold (v2.1.251+).
  Plan usage breakdown: attribution to skills/subagents/plugins/MCP; Loops rows for /loop tasks (v2.1.242+).
- Clear between tasks: "/clear to start fresh... Stale context wastes tokens on every subsequent message.
  Use /rename before clearing so you can easily find the session later, then /resume to return to it."
- "/compact Focus on code samples and API usage" — custom compaction instructions. In CLAUDE.md:
  "# Compact instructions\n\nWhen you are using compact, please focus on test output and code changes"
- Choose model: "Sonnet handles most coding tasks well and costs less than Opus." /model to switch.
  "For simple subagent tasks, specify model: haiku in your subagent configuration."
- MCP: tool definitions deferred by default; "Run /context to see what's consuming space." CLI tools
  (gh, aws...) more context-efficient. "Disable unused servers: Run /mcp".
- Hooks can preprocess (grep ERROR from 10,000-line log: tens of thousands of tokens -> hundreds).
- "Move instructions from CLAUDE.md to skills... Skills load on-demand... Aim to keep CLAUDE.md under 200 lines"
- Thinking: billed as OUTPUT tokens; default budget "can be tens of thousands of tokens per request".
  Lower via /effort. **"You can't turn off thinking on Opus 5.5, Sonnet 5.5, or the Fable models, which
  always use extended thinking."** MAX_THINKING_TOKENS only on fixed-budget models.
- Subagents: "verbose output stays in the subagent's context while only a summary returns".
  "The subagent's own requests still draw on your usage."
- Write specific prompts: "improve this codebase" -> broad scanning; specific -> minimal file reads.
- Course-correct: Escape; "/rewind or double-tap Escape to restore conversation and code".
- Background: under $0.04/session.
- Why usage climbs: "Claude Code sends your full conversation with every request" ... "a one-line question
  in a session that has been open all day still draws usage for the whole conversation."
  Cache lifetime "an hour on a subscription and drops to five minutes once you're drawing on usage
  credits; on an API key or cloud provider, it's five minutes by default."
  Scheduled tasks (/loop) "fire on its interval even while the session is idle, sending your full context each time".
  "/compact reads the conversation it summarizes... When you want a fresh start... /clear costs nothing"

## code.claude.com/docs/en/prompt-caching
- Each message = new request re-sending full context. Cache matches the PREFIX exactly; change anywhere
  recomputes everything after it. Layers: System prompt (tools) -> Project context (CLAUDE.md, memory)
  -> Conversation.
- Invalidate: switching models; changing effort (EXCEPT Opus 5.5/Sonnet 5.5/Fable 5.1 on API key or
  subscription — cache kept); turning on fast mode (header in cache key; "first request... reads the
  entire conversation history with no cache hits" billed at fast rates; once per conversation);
  MCP server connect/remove (only when tools loaded upfront); plugin; deny whole tool; compaction;
  many images; upgrading.
- Keep: editing files; editing CLAUDE.md mid-session (doesn't apply until /clear, /compact, restart);
  permission mode; output style; skills/commands; /recap; /rewind ("truncates back to a prefix that is
  already cached, rather than building a new one as compaction does"); spawning a subagent.
- Tip: "Pick your model and effort level at the top of a session, then save /compact for natural breaks."
- TTL table: subscription within plan: main conversation 1h, everything else 5m. Usage credits / API
  key / cloud: 5m. Order: FORCE_PROMPT_CACHING_5M=1 > bucket env (CLAUDE_CODE_PROMPT_CACHE_TTL,
  CLAUDE_CODE_SUBAGENT_PROMPT_CACHE_TTL) > setting (promptCacheTtl, subagentPromptCacheTtl) > subagent
  experimental cacheTtl > **ENABLE_PROMPT_CACHING_1H=1 "requests one hour for both buckets"** > default.
  1h TTL "bills cache writes at a higher rate"; "helps when you leave a session idle and come back";
  "costs more on short bursts of work that never idle past five minutes".
- Verify: `claude -p "hello" --output-format json` -> usage.cache_creation: ephemeral_1h_input_tokens
  vs ephemeral_5m_input_tokens.
- Subagent: own system prompt, own cache, 5m TTL even on subscription.

## code.claude.com/docs/en/model-config
- /autocompact <size>: 100K-1M; "200k", "500k", "1M", bare 100-1000 = thousands. Saved as
  autoCompactWindow. `/autocompact auto` reverts. --autocompact flag; CLAUDE_CODE_AUTO_COMPACT_WINDOW env.
  Default on native-1M models (Sonnet 5, Fable, Opus 4.7+ on API): compact "at about 967K tokens".
- Effort: Opus 5.5 / Sonnet 5.5: low medium high xhigh max; **default medium** on Opus 5.5 & Sonnet 5.5.
  max = current session only. `s` in slider = this session only.
- Thinking cannot be turned off on Opus 5.5 / Sonnet 5.5 / Fable: "The session toggle,
  alwaysThinkingEnabled, and MAX_THINKING_TOKENS=0 have no effect there". MAX_THINKING_TOKENS=0 turns
  thinking off on the Anthropic API for OTHER models (e.g. Opus 4.6 / Sonnet 4.6, Haiku).
- Aliases: sonnet -> Sonnet 5.5, opus -> Opus 5.5 (Anthropic API), haiku, fable, best, opusplan.

## code.claude.com/docs/en/fast-mode
- Opus only (5.5, 5, 4.8), "up to 2.5x faster at a higher cost per token". Opus 5.5 fast: $8/$40 per MTok.
- Subscriptions: "available via usage credits only and not included in the subscription rate limits".
- "The first time you enable fast mode in a conversation, you pay the full fast mode uncached input
  token price for the entire conversation context. The deeper into a conversation you are, the more
  this costs, so enabling fast mode from the start is cheaper." Once per conversation.

## platform.claude.com/docs/en/about-claude/pricing (per MTok: input / 5m write / 1h write / cache hit / output)
- Fable 5.1   $10 / $12.50 / $20 / $0.25 / $50
- Opus 5.5    $4  / $5     / $8  / $0.20 / $20   (cache hit 0.05x)
- Sonnet 5.5  $2  / $2.50  / $4  / $0.20 / $10
- Haiku 4.5   $1  / $1.25  / $2  / $0.10 / $5
- Multipliers: 5m write 1.25x, 1h write 2x, read 0.1x. "caching pays off after one cache read for the
  5-minute duration (1.25x write), or after two cache reads for the 1-hour duration (2x write)".
- Opus 5.5 fast mode: $8 / $40 (2x standard).
- 1 token ~ 4 characters or 0.75 words in English.

## code.claude.com/docs/en/scheduled-tasks (/loop)
- `/loop 5m check the deploy` fixed interval; `/loop check the deploy` = Claude picks 1 min..1 hour
  ("longer waits when nothing is pending"). Session-scoped; recurring tasks expire after 7 days.
- Monitor tool "is often more token-efficient and responsive than re-running a prompt on an interval".
- costs page: a scheduled task "fires on its interval even while the session is idle, sending your
  full context each time". /usage shows a Loops row per heavy loop (tokens per run).
- Esc stops a self-paced loop.

## VERIFICATION RUNS on this machine (NOT for the script: the take's numbers are what ships)
- 2026-09-30 `claude -p "Reply with just the word hi." --model sonnet --output-format json` in an empty
  dir: input_tokens 2, cache_read 13,576, cache_creation 14,438 (all ephemeral_1h, subscription),
  output 4, thinking_tokens 0, total_cost_usd 0.0605 (list-price estimate).
- `/context` (clean config home, interactive): Sonnet 5.5, 31.1k/1m tokens (3%) before any message;
  System prompt 2.4k, System tools 21.4k, MCP tools 663, MCP server instructions 717, Skills 5.8k,
  Messages 10, Free space 935.9k, Autocompact buffer 33k. Auto-compact window: 1m tokens.
- Account on this machine: Claude PRO subscription (tight usage limits: keep takes small).
