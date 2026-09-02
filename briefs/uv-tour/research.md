# uv, measured — the capture behind `topics/uv-getting-started/`

Source article: <https://medium.com/@ammar_naich/getting-started-with-uv-a-fast-modern-python-package-manager-69714fa50065>
(published 2025-11-16, read 2026-09-02).

Everything below was produced by **running uv 0.12.9** on macOS on 2026-09-02, installed
isolated into `tools/uv` via `UV_INSTALL_DIR` (LAW 0m corollary rule 1 — never upgrade the
operator's own tooling to do research). `tools/` is gitignored.

---

## 1. Where the article and the binary disagree

The article is a good survey and four of its commands do not exist. Each was typed at a
real shell; the error text is copied from the terminal, not paraphrased.

| The article says | uv 0.12.9 actually does |
|---|---|
| `python.version` records the project's Python | the file is **`.python-version`** |
| `uv completion zsh` | `error: unrecognized subcommand 'completion'` — real: `uv generate-shell-completion zsh` |
| `uv lock upgrade numba` | `error: unexpected argument 'upgrade' found` — real: `uv lock --upgrade-package numba` |
| `uv tool update shell` | `error: Failed to upgrade shell / Caused by: `shell` is not installed` — real: `uv tool update-shell` |
| `--app` creates `hello.py` | creates **`src/<name>/__init__.py`** plus a `[project.scripts]` entry |
| "much faster", no numbers | measured below |

Three of these are ON SCREEN in the video (scene 18), because a command that is *rejected*
is the most direct possible argument for LAW 0m.

## 2. A correction to this repo's own notes

`docs/STATE.md` and CHANGELOG record, from the 2026-08-21 uv-course research:

> the projects guide shows a `.git/` directory that `init` did not create

**That is no longer true, and the article was right.** On uv 0.12.9, `uv init --app` in an
empty directory creates `.git/` **and** `.gitignore`. Measured twice.

There is a wrinkle worth keeping: uv only writes `.gitignore` when it initialises the
repository itself. Run `git init` first and `uv init` writes no `.gitignore`.

The general lesson is the one LAW 0m already makes — a measurement is true of a version,
not forever. Our own note had gone stale in eleven days.

## 3. Speed, measured here

Same package (`rich`), same machine, same afternoon, into a freshly created empty venv.
`/usr/bin/time -p`, wall clock.

| | pip | uv | ratio |
|---|---|---|---|
| cold cache (`--no-cache` / `--no-cache-dir`) | 1.69s | 0.44s | 3.8× |
| warm cache, fresh env each time | 1.33s | **0.03s** | 44× |

The warm number is the interesting one and it is not a faster download — uv hard-links out
of its own cache, so there is nothing to fetch or unpack. It is stated on screen as
"measured here, 2026-09-02" rather than as a general claim about the tool.

## 4. Identity: two hazards a scaffolding tool creates

**`uv init` stamps the git identity into `pyproject.toml`.** The first capture wrote the
operator's real name and email into an `authors = [...]` block. `briefs/` is tracked and
this repo is public.

The fix is preventive rather than a post-hoc grep: point `GIT_CONFIG_GLOBAL` at a scratch
gitconfig for the duration of the capture.

```sh
printf '[user]\n\tname = dev\n\temail = dev@example.com\n' > /tmp/iauteur-gitconfig
export GIT_CONFIG_GLOBAL=/tmp/iauteur-gitconfig
```

uv then writes `dev / dev@example.com` — a real value from a real config, so the DEFAULT
behaviour is still what gets taught. `--author-from none` also exists, but it changes what
the viewer sees and teaches a flag nobody would type.

**uv prints absolute paths constantly.** `uv add` and `uv run` both emit
`Building myapp @ file:///<abs path>`. That is why recording workspaces moved out of the
repo — see `docs/SCREEN_RECORDING.md` and `recWsRoot()`.

## 5. Workspaces

Verified rather than quoted, because the article's section is conceptual:

```
root/                 pyproject.toml with [tool.uv.workspace] members = ["packages/*"]
  packages/shared/    pyproject.toml
```

`uv init --lib packages/shared` answers **"Project `shared` is already a member of
workspace `…/root`"**, and after `uv add --package root ./packages/shared` the tree holds
**exactly one `uv.lock` and one `.venv`, both at the root**. Members declare their own
dependencies; the resolution is shared. That is the whole idea, and it is drawn rather than
recorded (no workspace transcript was captured, and LAW 0m forbids inventing one).

## 6. The captured transcripts

`demos/uv-tour.json` produces `public/rec/uv-tour/` — 13 steps, every one verified by
read-back, exit codes from the shell's own prompt hook. The demo is repeatable: it clears
the workspace in prep, pins `UV_TOOL_DIR` to a scratch path so `uv tool install` really
installs each run, and copies the pinned uv binary to `/tmp/iauteur-bin` so no machine path
can reach the screen.

Re-record with:

```sh
npm run record -- demos/uv-tour.json
node scripts/bake-rec.mjs   topics/uv-getting-started/long.json
node scripts/anchor-spec.mjs topics/uv-getting-started/long.json
python3 scripts/voiceover.py topics/uv-getting-started/long.json uv-getting-started_long
node scripts/sync.mjs topics/uv-getting-started/long.json \
     out/tts/uv-getting-started_long_timestamps.json uv-getting-started_long
npm run lint
```

**Do not hand-edit `topics/uv-getting-started/*.json`.** `briefs/uv-tour/build_long.mjs`
and `build_shorts.mjs` are the source; the JSON is derived, and a rebuild wipes the bake
(gotcha 56 — after any rebuild: bake → anchor → voice → sync → lint).
