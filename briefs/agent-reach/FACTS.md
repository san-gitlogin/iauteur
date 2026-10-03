# Agent Reach — facts and probe results (2026-10-03)

Source of truth: https://github.com/Panniantong/Agent-Reach (README is Chinese; `docs/README_en.md` is the
maintainer's own English version — quote that, do not re-translate what the author already translated).

## Interview answers (LAW 0)
- Format: both (wide + short) · Length: as long as it needs · Design: moderndark · Voice: Ava
- Demo scope: **everything the repo promises**, at least the well-known ones — Reddit, X, YouTube.
  Owner's warning: Reddit and X block Chromium sessions ("confirm you're not a robot", temporary blocks).
- One short LIVE Claude Code take (paste the install line, then one real question).
- Thumbnail: `layout: "hero"`, the repo's own header image as the art, bracketed payoff phrase
  (12 chars or fewer gets the top type tier). Must not read top-to-bottom like an essay, and the image
  must sit in the design, not look pasted on.

## What the project is (from its own page, read 2026-10-03)
- Description: "Give your AI agent eyes to see the entire internet. Read & search Twitter, Reddit, YouTube,
  GitHub, Bilibili, XiaoHongShu — one CLI, zero API fees."
- `meta.subjectKind`: a Python command-line installer and health-checker that picks, installs and checks
  the access tool for each platform. The README: "a capability layer, not yet another tool ... it handles
  selection, installation, health checks, and routing, not the reading itself."
- 88,962 stars via the API on 2026-10-03 (badge shows 89K) · MIT · Python 3.10+ · v1.5.0 · author "Neo Reid"
  · last push 2026-09-15. Star count is read off the FRAME that ships, not from here.
- README pain-point table: Twitter API ~$215/month; Reddit 403s server IPs; XiaoHongShu needs login;
  Bilibili blocks overseas/server IPs. These are the AUTHOR's claims — attribute them.
- Install line for an agent: `Install Agent Reach: https://raw.githubusercontent.com/Panniantong/agent-reach/main/docs/install.md`
- Manual: `pip install https://github.com/Panniantong/agent-reach/archive/main.zip` then
  `agent-reach install --env=auto` (read-only check; `--system` is the opt-in that changes the machine).
- Sub-commands: setup, install, configure, doctor, uninstall, skill, format, transcribe, check-update, watch.
- Backends it routes to: Jina Reader (web), twitter-cli, rdt-cli / OpenCLI (Reddit), yt-dlp (YouTube),
  bili-cli, gh, feedparser, Exa via mcporter, xiaohongshu-mcp, linkedin-mcp. Each one gets credited
  (`meta.seo.sources`) — the linter requires it for anything installed on camera.

## Probe on the Windows machine — a VERIFICATION run, not the take
Isolated venv outside the repo, with the home directory redirected so nothing lands in the real profile.
Nothing here may be quoted as a number in the script; numbers come from the frames that ship.

| channel | result |
|---|---|
| `agent-reach doctor` | runs; **prints Chinese only** — "5/16 channels available" |
| Web page (`curl r.jina.ai/URL`) | works, clean Markdown |
| YouTube subtitles (`yt-dlp --write-auto-sub`) | works; a `.en.vtt` file was written |
| YouTube search (`yt-dlp ytsearch3:`) | works |
| V2EX hot topics | works (JSON) |
| RSS (`feedparser`) | works, 20 entries |
| Bilibili search (`bili search`) | works without login; titles are Chinese |
| GitHub (`gh search repos`) | **fails logged out**: "please run: gh auth login". The README says public repos work immediately — on a logged-out `gh` they do not. |
| Exa web search | not installed (`npm install -g mcporter` + one config line) |
| X / Twitter (`twitter-cli`) | installed; needs the owner's `auth_token` + `ct0` cookies |
| Reddit (`rdt-cli`) | installed; needs `rdt login` |

Findings worth a beat each:
1. **The CLI speaks Chinese.** `AGENT_REACH_LANG=en` only switches the installed SKILL file to
   `SKILL_en.md`; `doctor`, `install` and every channel message are hard-coded Chinese (1,101 lines with
   Chinese text across 41 files). An English viewer needs the on-screen translation — that is the video.
2. twitter-cli and rdt-cli are plain HTTP clients carrying the owner's own cookies. They do not drive a
   Chromium window, which is the answer to the "confirm you're not a robot" worry — to be PROVEN on camera.
3. yt-dlp prints "Support for Python version 3.10 has been deprecated" on every call under 3.10. Record
   on 3.11+ or it is on screen in every YouTube clip.
4. The skill's reference docs are Chinese ("commands are universal").

## Still owed before recording
- Owner: X cookies and a Reddit login, kept in a file outside the repo. Never on screen, never committed.
- Python 3.11+ for the recording venv · the clean Claude recording home (`briefs/tokens21/seed-home.mjs`).
- Decide the one real question the live agent take answers.
