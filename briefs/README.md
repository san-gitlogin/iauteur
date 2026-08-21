# briefs/ — the authored source of every video

## The JSON is the truth. The Python is not.

Each chapter exists twice here: a `.py` that first produced it, and the `.json` it
wrote. **They have diverged, and the JSON is the correct copy.** Every correction made
since a chapter was first drafted — the API class renamed from `FastMCP` to
`MCPServer`, beats added, narration rewritten for a mouth — was applied to the JSON.
Most of it was never folded back into the Python.

Nineteen of these builders, if re-run, would silently undo that work. Chapter four's
builder still writes `FastMCP`. `mcp/ep01_03.py` never learned about the two beats
that were added to `mcp/ep01.json`. Nothing downstream would complain: the spec would
build, lint, voice and render, just wrong or short by two beats.

So every builder now writes through `_guard.write()`, which **compares the whole
document against the JSON on disk and refuses if they differ.** It writes what it
wanted to `<name>.candidate.json` for diffing and exits non-zero. You cannot lose work
by running the wrong file any more; the worst case is a loud stop.

If you genuinely mean to regenerate from the Python, fold the JSON's corrections into
the builder first, or pass `allow_drop=True` — deliberately, having read the diff.

## What is safe to run

| script | what it does |
|---|---|
| `mcp/shorts/build.py` | regenerates all 12 MCP short briefs from the chapter JSONs — the intended path, run it whenever a chapter changes |
| `dsa/shorts/build_shorts.py` | the same for the DSA shorts |
| `linux/rewrite/regen.py` | **the dangerous one.** It regenerates `src/scenes/Cmd*.tsx` — 109 component files — from a table, so running it reverts every hand fix made to them since. It was run by accident on 2026-08-21 and silently undid the multi-line command-output fix and the 9:16 stage change across all 109. `git diff` caught it; nothing else would have. Do not run it. |
| `linux/patch*.py`, `linux/defs_*.py`, other `linux/rewrite/*.py` | **historical one-shots.** They mutated the Linux briefs during authoring and were never meant to run twice. Do not. |
| every `ep*.py` | the original drafting scripts. Guarded. Expect them to refuse. |

## Turning a brief into a rendered video

Paths below are POSIX; on Windows use `python` for `python3` and the same forward
slashes (Node and Python both accept them).

```
node scripts/build-mcp-spec.mjs briefs/mcp/ep00.json topics/mcp-00-how-claude-works/long.json
python3 scripts/voiceover.py    topics/mcp-00-how-claude-works/long.json mcp-00-how-claude-works
node scripts/sync.mjs           topics/mcp-00-how-claude-works/long.json out/tts/mcp-00-how-claude-works_timestamps.json mcp-00-how-claude-works
node scripts/lint-spec.mjs      topics/mcp-00-how-claude-works/long.json
node scripts/render-topic.mjs   mcp-00-how-claude-works wide-dark
```

The order is not optional. `build` writes *estimated* timings; `voiceover` records the
real read; `sync` rewrites every anchor against it. Rebuilding a spec after voicing
throws the real timings away, which is why `render-topic.mjs` refuses to render a spec
that has narration and no `timingSource: "tts"`.

### What is in git and what is not

`topics/*/long.json` and `topics/*/shorts.json` **are tracked** — they are the authored
work product, 1.3 MB for the whole channel, and a clone is useless without them.
`topics/*/out/` is not: 3.9 GB of renders, thumbnails and upload kits, all
regenerable. Neither is `public/audio/`.

So a fresh clone has every spec but no audio and no video. Run
`node scripts/gen-index.mjs` first (the `predev` hook and `render-topic` self-heal it
too), then re-voice and re-sync anything you intend to render — the specs carry
timings from audio that is not in the clone.

`topics.map.json` records which brief produced which spec, recovered by matching
narration because neither file ever recorded the other. Forty-six of the fifty-five
specs trace back to a brief; the rest are the course cuts (derived by
`scripts/build-course-cut.mjs`), the proofs, and the Linux masterclass, which came out
of the `linux/` table pipeline rather than a single brief. Those are marked in the
file rather than guessed at.

`public/audio/` is gitignored too. Re-run `voiceover.py` after cloning; it needs
`pip install edge-tts` and an internet connection.
