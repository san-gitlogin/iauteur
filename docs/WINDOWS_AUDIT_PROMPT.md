# Windows audit — paste-ready prompt

Open Claude Code **in the iauteur folder on the Windows laptop** and paste everything
inside the fenced block. It is read-only apart from the two files and one zip it writes.

Why this exists: the Mac and the Windows laptop are **both sitting on commit `e062e43`
with nothing pushed on either side**, so every difference between them is either (a)
uncommitted/unpushed work on Windows or (b) something git never carried — renders,
recordings and audio are all gitignored by design. This prompt finds both.

---

```
You are auditing the iAuteur repo on this WINDOWS machine. Your job is FORENSIC AND
READ-ONLY: find everything here that does not exist on the other machine, explain it, and
package it. You are NOT fixing, merging, rendering or pushing anything.

=== HARD RULES — violating any of these destroys a week of work ===
1. DO NOT push, pull, merge, rebase, reset, checkout another branch, or stash. If a
   command would change tracked files, don't run it.
2. DO NOT run any brief builder (briefs/**/build*.py, briefs/**/*.py that writes JSON).
   Read briefs/README.md: the .json briefs are the source of truth and re-running a
   builder REVERTS hand-made corrections. This has happened twice.
3. NEVER run briefs/linux/rewrite/regen.py. It regenerates all 109 src/scenes/Cmd*.tsx
   and has silently reverted shipped fixes.
4. DO NOT delete anything, including anything under topics/*/out/ or public/rec/.
5. Python on Windows: prefix with PYTHONIOENCODING=utf-8 or the repo's seals crash on
   the "->" character in cp1252.
6. If git complains about the skip-worktree channel logo, STOP and report it. Do not
   commit it and do not discard it. The safe procedure is in docs/STATE.md.

=== WHAT THE OTHER MACHINE (macOS) ALREADY HAS — compare against this ===
Baseline commit on BOTH machines: e062e43
  "The card ran 381px off the frame: an authored width and the dock disagreed"
origin/main is also at e062e43. Neither machine has pushed since.

The Mac has these 29 files changed ON TOP of e062e43, still UNCOMMITTED. If this Windows
machine has also modified any of them, that is a MERGE CONFLICT RISK and must be called
out loudly, file by file:
  A briefs/uv-tour/build_long.mjs        A briefs/uv-tour/build_shorts.mjs
  A briefs/uv-tour/research.md           A demos/uv-tour.json
  A scripts/lib/record/framepaint.mjs    A topics/uv-getting-started/long.json
  A topics/uv-getting-started/shorts.json
  M briefs/examples/fix-input-long.json  M briefs/examples/lean-reply.json
  M briefs/examples/pw-cfg.json          M CHANGELOG.md
  M docs/CONTINUE_HERE.md                M docs/SCREEN_RECORDING.md
  M docs/STATE.md                        M README.md
  M scripts/check-recordings.mjs         M scripts/gen-rec-fixture.mjs
  M scripts/gen-schema.mjs               M scripts/lib/assemble.mjs
  M scripts/lib/constants.mjs            M scripts/lib/normalize-spec.mjs
  M scripts/lib/record/runner.mjs        M scripts/lib/record/terminal.mjs
  M scripts/lib/record/vscode.mjs        M scripts/probe-keys-diag.mjs
  M scripts/probe-keys.mjs               M scripts/render-topic.mjs
  M scripts/test-rec-surface.mjs         M specs/video.schema.json

What the Mac changed, in one line each, so you can judge overlap:
  - record/{runner,terminal,vscode}.mjs + framepaint.mjs: the macOS port of the screen-
    recording runner (12 fixes; 3 of them made recordings silently WRONG on any platform:
    every exit code read 1, every command lost its first character after a step, and the
    VS Code CLI was not verified to be VS Code).
  - normalize-spec.mjs + constants.mjs + gen-schema.mjs + assemble.mjs: npm run gate was
    RED on BOTH machines. normalize deleted the now-required meta.subject and four
    thumbnail fields (logos/note/titleStruck/replaces).
  - check-recordings.mjs + render-topic.mjs: absent local footage is now a notice
    repo-wide and fatal only for the slug being rendered.
  - briefs/examples/*: fixtures updated to the amended LAW 0g.
  - uv-tour/uv-getting-started: a NEW topic (not a change to any existing one).

Local-only artefacts on the Mac (measured — compare directly against this):
  public/rec/  : ONLY _fixture and uv-tour. The Mac is MISSING all six recordings this
                 machine made: sqlite-act1, sqlite-act2, sqlite-act3, vscode-keys-act1,
                 vscode-keys-act2, vscode-keys-act3.
  renders      : 29 topics have an .mp4, and every one of them is dated 21 Aug 2026.
                 The Mac has ZERO renders for the entire past week of work — it holds the
                 SPEC and no video for: all 14 uv chapters, uv-course, both SQLite cuts,
                 and vscode-shortcuts-that-actually-work.
  public/audio : 659 mp3
  tools/       : uv (0.12.9, pinned, isolated)

So the expected headline is: the CODE arrived, the VIDEO did not. Confirm or refute that
with evidence rather than assuming it.

=== PHASE 1 — GIT FORENSICS (read-only) ===
Run these and keep the raw output; do not summarise away detail:
  git --version ; git rev-parse --abbrev-ref HEAD ; git rev-parse HEAD
  git remote -v
  git fetch --all --prune          (fetch is safe; it changes no working file)
  git log --oneline --all --decorate --graph -40
  git rev-list --left-right --count HEAD...origin/main
  git log --oneline origin/main..HEAD          <- UNPUSHED COMMITS. The important one.
  git status --porcelain=v1 --untracked-files=all
  git stash list
  git branch -avv
  git diff --stat ; git diff --cached --stat
  git log -20 --pretty="%h %ad %s" --date=short
For every unpushed commit: git show --stat <sha>. List which files each touched.
Also record: git config core.autocrlf, and whether .githooks is wired
(git config core.hooksPath) — a wrong line-ending setting makes whole files look changed.

=== PHASE 2 — WHAT GIT NEVER CARRIED (this is probably the real answer) ===
Renders, recordings and audio are gitignored BY DESIGN, so they never travelled. This is
the most likely reason the videos differ between machines. Inventory them WITHOUT copying
the bytes yet:
  - topics/*/out/**: for every file record path, size, and modified time. For each .mp4
    also record duration, frame count, width x height and audio codec via ffprobe. If
    ffprobe is missing, say so rather than guessing.
  - public/rec/*/manifest.json: for each recording record the slug, step count, recordedAt,
    the VS Code version in env, and the id + segmentFrames of every step. Also total size
    of each recording folder.
  - public/audio/: count and total size only.
  - tools/: what binaries are pinned here and their --version.
  - out/tts/*.json: which topics have timestamps.
Then answer explicitly: WHICH TOPICS HAVE A RENDER HERE THAT THE MAC DOES NOT, and which
have a render on BOTH but with a different frame count or a newer mtime.

=== PHASE 3 — SILENT DIVERGENCE AT THE SAME COMMIT ===
Both machines claim e062e43. Prove the working trees actually agree:
  git diff --stat e062e43 -- .        (should be only your own edits)
For every tracked spec, emit slug + scene count + total durationFrames + whether every
scene has timingSource:"tts". Write that table into the inventory JSON below — the Mac can
diff it directly. Note any file where only line endings differ.

=== PHASE 4 — WRITE THE ANALYSIS ===
Write "HANDOFF-WINDOWS.md" at the repo root. Structure it exactly like this, and lead with
the answer, not the method:

  1. VERDICT — in five lines: what exists here that is not on the Mac, and what it would
     cost to lose it. Be blunt about anything irreplaceable.
  2. UNPUSHED COMMITS — table: sha, date, subject, files touched. If none, say NONE and
     move on; that changes the whole picture.
  3. UNCOMMITTED / UNTRACKED WORK — table: path, status, size, why it looks important or
     disposable. Judge each one; do not just list.
  4. CONFLICT RISK — for each of the Mac's 29 files listed above, state UNTOUCHED HERE or
     ALSO MODIFIED HERE, and for the latter show the local diff.
  5. RENDERS AND RECORDINGS — the tables from Phase 2, plus a clear statement of which
     videos exist ONLY here. Flag anything whose spec is tracked but whose render is newer
     than the spec (that render contains work the spec cannot reproduce, or vice versa).
  6. WHAT THE MAC HAS THAT THIS MACHINE DOES NOT — from the list above, so the picture is
     symmetric.
  7. RECOMMENDED MERGE ORDER — numbered, specific, with the exact commands, and say which
     steps are safe versus which need the owner to decide. Do not perform them.
  8. OPEN QUESTIONS — anything you could not determine, stated as a question.

Also write "windows-inventory.json" at the repo root: a machine-readable version of Phases
1-3 (commits, file statuses with sizes and sha256, spec table, render table, recording
manifests summary). The next Mac session will diff this programmatically, so prefer flat
arrays of objects over prose.

=== PHASE 5 — THE ZIP ===
Create "handoff-windows.zip" at the repo root containing:
  - HANDOFF-WINDOWS.md and windows-inventory.json
  - a full patch of everything not on origin: git format-patch for each unpushed commit,
    PLUS "uncommitted.patch" from `git diff` and `git diff --cached`
  - every UNTRACKED source file that is not ignored (briefs/, demos/, docs/, scripts/,
    src/, specs/, topics/*/long.json, topics/*/shorts.json)
  - every public/rec/*/manifest.json (the manifests only, not the .mp4 segments)
  - every topics/*/out/*.md (upload kits) and *.png (thumbnails/covers)
  - out/tts/*.json
EXCLUDE all .mp4, node_modules, .git, public/audio, tools binaries. State the final zip
size. If it exceeds ~100 MB, say so and list what pushed it over instead of silently
trimming.

Do NOT zip the renders. Report their total size and wait — moving those is a separate
decision and they may be better copied to an external drive directly.

=== FINISH ===
Print: the verdict paragraph, the unpushed-commit count, the conflict-risk list, the zip
path and size, and the single most important thing that would be lost if this machine died
tonight. If the honest answer to Phase 1 is "nothing is unpushed", say that plainly and
make Phase 2 the headline instead.
```

---

## After it runs

Bring back **`handoff-windows.zip`** (or just `HANDOFF-WINDOWS.md` + `windows-inventory.json`
if the zip is awkward to move). With the inventory JSON I can diff the two machines
programmatically here rather than by eye, and produce the actual merge.

**What I expect it to find**, based on what the two machines look like from here:

- **Probably no unpushed commits.** Both machines are on `e062e43` and origin agrees, so
  the 102 commits of Windows work from the past week *did* arrive — the code is safe.
- **The video difference is gitignored artefacts, and I can already show it.** Measured on
  the Mac just now: **29 topics have an .mp4 and every single one is dated 21 August.**
  The Mac holds the spec and *no video at all* for all 14 uv chapters, `uv-course`, both
  SQLite cuts and the VS Code cut. You have been comparing three-week-old Mac renders
  against a week of newer Windows ones. Nothing is lost — but nothing came across either.
- **Six recordings exist only on Windows** (`sqlite-act1/2/3`, `vscode-keys-act1/2/3`).
  Without them the SQLite and VS Code cuts *cannot be re-rendered on the Mac at all* —
  `check-recordings` refuses, correctly. They are re-recordable from `demos/`, but only on
  a machine set up to run the recorder.
- **Real conflict risk on the recording runner.** If Windows also edited
  `scripts/lib/record/*.mjs` this week, those files changed substantially on the Mac and
  will need a hand merge, not a fast-forward.
