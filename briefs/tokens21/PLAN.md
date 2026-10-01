# `claude-code-21-token-savers` — the plan (2026-09-30)

Interview (owner, 2026-09-29 night): **both** long + shorts · no runtime cap ("crisp, no dragging") ·
**moderndark** · **en-US-AvaMultilingualNeural** · thumbnail = **drawn iceberg** (free SVG, no tile) ·
infographic = **show + credit** Charlie Hills · move #21 = owner said "key is in .env" but **no .env
exists on this Windows machine** -> explain + show the subscription side on camera; say plainly the
API half was not run. Demos with **Sonnet 5.5**. New component per concept. Human narration.

## Machine notes (Windows, owner's hometown machine)
- npm bundled with Node is CORRUPT (minimatch file is garbage bytes). Clean npm at ~/.local/npm-clean
  with npm/npx shims in ~/.local/bin (ahead of Node on PATH). node_modules reinstalled (win32
  compositor); the Mac copy is at a backup folder beside the repo.
- AirLLM topic specs (topics/airllm-on-my-mac/*.json) did NOT survive the copy (folder held a corrupt
  .DS_Store entry; they were never committed). Recover from the Mac. Index regenerated without it.
- Takes run via `briefs/tokens21/rec.sh` (strips the authoring session's CLAUDE_* env, sets
  CLAUDE_CONFIG_DIR=<rec-root>/_claude-home: a CLEAN config with only the login copied, so the
  owner's private user skills never reach the video). Trust workspaces first:
  `node briefs/tokens21/seed-home.mjs <ws...>`.
- Recorder additions (this cut): `agent` step (type into a live Claude session, verified by a needle
  the TOOL prints, anti-echo) and `reveal.pageUp` (Shift+PageUp through TUI scrollback). Steps after
  an interactive claude may only be agent / reveal / pause.
- Workspace root on Windows: <rec-root>/<ws>. Terminal = PowerShell. Ready needle for the Claude
  TUI: "shift+tab to cycle". In Git Bash, `claude -p "/context"` needs MSYS_NO_PATHCONV=1.
- The interactive clean home still loads the ACCOUNT's claude.ai connectors (Atlassian, Gmail, Drive,
  Docs...) as deferred MCP tools. Useful for the /mcp beat; not identity.

## The angle
Anthropic's docs say Claude Code sends the WHOLE conversation with every request. So the bill is
context x turns, and your prompt is a rounding error. Every one of the 21 moves either shrinks the
context, stops it being re-sent, keeps it cached, or makes each token cheaper. We test each one on
camera, and correct the infographic where the docs disagree:
- "Turn thinking off" / MAX_THINKING_TOKENS=0 does NOTHING on Sonnet 5.5, Opus 5.5 or Fable (docs).
  The lever there is /effort (Sonnet 5.5 and Opus 5.5 default to medium).
- Fast mode is not a saving: Opus only, 2x price, usage credits only. The rule is about not paying the
  one-time full reprice deep into a session.
- ENABLE_PROMPT_CACHING_1H: a subscription ALREADY gets 1h on the main conversation; on an API key it
  raises the write price (2x vs 1.25x) and only pays off if you idle past 5 minutes and come back.

**subject:** Claude Code · **subjectKind:** an AI coding agent that runs in your terminal, made by Anthropic
**The carried picture (LAW 0l):** a request is a STACK (system prompt, tools, CLAUDE.md, every earlier
message) and your new message is the thin slice on top. Every turn the whole stack is sent again.
Drawn early, and in the premise, before any move uses it.

## Structure: follow the iceberg (the infographic's own three levels)
Act 0 open · Act 1 SURFACE (4) · Act 2 COMMANDS (12) · Act 3 DEEPER (9 setup) · Act 4 verdict.
Every move gets footage of it working in Claude Code where a camera can show it, and/or a
purpose-built TOK_STAGE depiction of the MECHANISM. No kind used 3 times.

## Takes (all Sonnet 5.5; all cheap)
| slug | shows | status |
|---|---|---|
| tok-docs (browser) | costs page: "charges by API token consumption", "sends your full conversation with every request", "can't turn off thinking" | |
| tok-cachedocs (browser) | prompt-caching page: TTL table + ENABLE_PROMPT_CACHING_1H | |
| tok-bill | `claude -p ... --output-format json` through a formatter: YOUR PROMPT vs EVERYTHING ELSE | |
| tok-context | interactive: /context grid, then scroll to categories | smoke OK |
| tok-mcp | /mcp list; disable a server; /context again | |
| tok-clear | small task, /rename, /clear, /resume list | |
| tok-compact | /compact with instructions; CLAUDE.md "# Compact instructions" | |
| tok-rewind | Esc Esc / /rewind picker | |
| tok-autocompact | /autocompact 200k -> confirmation | |
| tok-mention | @-mention a file vs vague ask (tool-call count) | |
| tok-model | /model picker + /effort | |
| tok-loop | /loop 30m ...; confirmation; cancel | |
| tok-claudemd | bloated CLAUDE.md in /context (Memory files) -> slimmed + skill -> /context | |
| tok-quiet | pytest vs pytest -q (line counts), and the CLAUDE.md commands block | |
| tok-subagent | .claude/agents/log-digger.md with model: haiku; Claude delegates; summary returns | |
| tok-fast | /fast on a Pro plan -> what it says | |
| tok-thinking | MAX_THINKING_TOKENS=0 on sonnet: thinking still happens (json thinking_tokens) | |
| tok-cache | claude -p json: cache_creation.ephemeral_1h on a subscription | |

## Components: ONE scene type TOK_STAGE, pictures in src/tokViz*.tsx (LAW 0n)
- [ ] infographic: the source image as a sheet, camera travelling level by level, credit strip
- [ ] resend: request stack re-sent every turn, bars growing, "your message" a thin slice
- [ ] prefix: cached prefix (dim) + new slice; a change near the top turns everything after it red
- [ ] grain: 28,000 tokens as a field of dots, your prompt = 2 dots lit
- [ ] price-ladder: Haiku/Sonnet/Opus/Fable price tags on a rail
- [ ] dead-switch: thinking switch thrown, wire cut on Sonnet 5.5; /effort dial is the live control
- [ ] context-map: the /context categories as a 1M jar with labelled layers
- [ ] deferred: tool shelf, names only; full manual fetched only when used
- [ ] backpack: stale context carried to every new task; /clear empties it
- [ ] press: history pressed into a summary card; the keep-list survives
- [ ] rewind: timeline truncated back to a cached point vs compact building a new one
- [ ] window: context gauge, auto-compact line ~967k vs 200k
- [ ] search-fan: vague ask fans out to many file reads; @-mention is one arrow
- [ ] duplicate: the same file pasted twice rides along twice on every later turn
- [ ] dial: effort dial, cache seal kept on Sonnet 5.5; model swap breaks the seal
- [ ] loop-meter: a clock that fires N times, each fire carrying the full stack
- [ ] always-vs-demand: CLAUDE.md on every trip vs skills fetched when called
- [ ] noise: a noisy test log squeezed through -q
- [ ] cheat-card: Claude hunting for how to run tests vs reading one line
- [ ] side-room: subagent works in its own room; only the answer slides back
- [ ] toll: fast mode's one-time full reprice, cheap at turn 1, expensive at turn 40
- [ ] ttl: two cache clocks, 5m vs 1h, against a break; write price 1.25x vs 2x
- [ ] scoreboard: the 21 moves sorted by what each actually changes

## RESUME HERE (2026-09-30 ~03:30 IST, usage limit hit)
Done: all takes recorded, long + short voiced & synced, lint + preflight passed, thumb.png + cover.png rendered
(topics/claude-code-21-token-savers/out/). Render was REFUSED by the camera gate (correctly), not run.
Next, in order:
1. tok-docs was re-recorded (old seg-03 was corrupt) -> long s05 anchor-spec fails: "clip 2 has 1 callout but 0 words
   after its footage". Fix: drop the zoom on the tok-docs#resend clip (last clip = stretched), rebuild -> bake ->
   anchor -> sync (audio exists; no re-voice needed).
2. Short s02: zoom 'sent' lands during the /context sentence. Move the ctx-up clip later (at 0.75) or drop that zoom,
   then bake -> anchor -> sync -> node scripts/check-camera.mjs topics/claude-code-21-token-savers/shorts.json.
3. VISUAL AUDIT not done for the wide cut: proof stills of every TOK_STAGE beat (scripts/proof.mjs ... --frames)
   and fix what they show. Also audit-sync flagged 42/205 elements off their words.
4. Then: node scripts/render-long.mjs claude-code-21-token-savers wide-dark 10 --fresh ; render-topic short-dark ;
   gen-upload-kit. Verify frames EXACT, drift 0, audio ~-22 dB.
