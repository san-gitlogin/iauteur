# Security

## Reporting a vulnerability

Use GitHub's private reporting: **[Security → Report a vulnerability](https://github.com/san-gitlogin/iauteur/security/advisories/new)**.
That keeps the report private until there is a fix.

Please don't open a public issue for anything exploitable. For everything else — a crash, a bad
default, a script that writes somewhere it shouldn't — a normal issue is fine and preferred.

This is a solo, spare-time project, so there is no response-time guarantee. It will be read.

## What is actually sensitive here

iAuteur renders video locally. It has no server, no accounts, no user data, no telemetry, and it
phones nothing home. The realistic risks are these three.

### 1. Your AI provider key

The console can drive an LLM to write specs for you, which means you may hand it an API key.

- Keys live **only** in `.env`, which is gitignored. `.env.example` is the tracked template.
- Never put a key in a spec, a brief, a screenshot, an issue, or a commit.
- **If you leak one, rotate it immediately.** This repository is public; assume anything committed is
  permanently visible, even after a force-push.
- Keys are never printed or logged. If you find a code path that echoes one, that is a
  vulnerability — report it.

### 2. Prompt injection via source material

If you paste an article, a URL's contents, or any untrusted text in as source material, an LLM reads
it. Text in that material can try to instruct the model. The blast radius is limited — the output is
a video spec, and the linter validates its structure before anything renders — but do not paste
untrusted content while an agent has write access to things you care about.

### 3. Rendering runs a browser

Remotion renders through headless Chromium, and a spec is code-adjacent: it names components and
supplies their data. **Treat a spec file from a stranger like any other untrusted input** — read it
before you render it, exactly as you would with a `package.json` full of scripts.

## What is *not* a vulnerability

- A component looking wrong, clipping text, or overflowing. That's a bug — open a normal issue, and
  see [CONTRIBUTING.md](CONTRIBUTING.md#reporting-a-visual-bug) for what to include.
- The linter rejecting your spec. That is the linter working.
- Remotion's own licence terms. See [NOTICE.md](NOTICE.md).
