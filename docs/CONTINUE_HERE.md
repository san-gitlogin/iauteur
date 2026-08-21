# Continuation prompt — starting a NEW topic on another machine

Paste everything in the fenced block below into a fresh Claude Code session, then add
your topic on the last line. It is written to be pasted as-is; it assumes nothing
about what the assistant remembers, because on a new machine it remembers nothing.

---

```
You are picking up iAuteur, a Remotion JSON→video factory for the YouTube channel
THE NBX STUDIO. I want to author a NEW topic end to end: long-form 16:9 chapters,
matching 9:16 shorts, thumbnails and upload kits.

BEFORE YOU WRITE ANYTHING, READ THESE, IN THIS ORDER:
  1. CLAUDE.md              — 17 repo LAWS. Non-negotiable. 0i/0j/0k/0l/0m/0n/0o/0p
                              are the ones that were paid for in re-renders.
  2. docs/STATE.md          — current state, gotchas, and how to prove the repo healthy.
  3. briefs/README.md       — how a brief becomes a video, and which scripts will
                              destroy your work if you run them.
  4. .claude/skills/tech-video-director/SKILL.md and its references/ — the creative
     contract: scene_library.md, component_authoring.md, content_rules.md, longform.md.

PROVE THE REPO IS HEALTHY BEFORE CHANGING ANYTHING:
  npm install
  npm run gate            # 10 seals, must exit 0
  npm run typecheck
  node scripts/gen-index.mjs

THE PIPELINE. The order is not optional — build writes ESTIMATED timings, voiceover
records the real read, sync rewrites every word anchor against it. Rebuilding a spec
after voicing throws the real timings away; render-topic.mjs refuses to render a
voiced spec that lost its sync, and that guard exists because it happened twice.

  # STEP 1 — get a spec into topics/<slug>/long.json. Three ways, pick one:
  #   (a) an existing course's marker builder, if you are extending that course:
  #       node scripts/build-mcp-spec.mjs briefs/mcp/ep00.json topics/<slug>/long.json
  #       (also build-dsa-spec.mjs, build-linux-spec.mjs — these are the ONLY three)
  #   (b) a NEW course: copy scripts/build-mcp-spec.mjs as the model. It is the
  #       best of the three — typed narration markers (| code line, ^ picture
  #       element, % var, + shell step), dotted anchor paths, and it goes FATAL on
  #       combined sigils, marker shortfall, or code that finishes before 50% of the
  #       taught portion. Each sigil must own its own word: "|^word" parses as one.
  #   (c) author the spec JSON directly, or via scripts/flow.mjs.
  python scripts/voiceover.py            topics/<slug>/long.json <slug>
  node scripts/sync.mjs                  topics/<slug>/long.json out/tts/<slug>_timestamps.json <slug>
  node scripts/lint-spec.mjs             topics/<slug>/long.json      # must PASS
  node scripts/render-topic.mjs <slug> wide-dark|short-dark|thumb|cover
  node scripts/gen-upload-kit.mjs <slug>

For a brand-new course, `node scripts/new-topic.mjs <kebab-slug> "Title"` scaffolds
the folders. Voiceover needs `pip install edge-tts` and internet; the voice is
en-US-AvaMultilingualNeural. Use scripts/voiceover.py (the Python one) — `npm run
voiceover` points at a different, older script.

THE STANDING QUALITY BAR. Every line below is a correction the owner already made
once. Do not make me make it again:

  * A registered scene type is NOT a picture. If the answer to "what object does the
    viewer see" is "a row that says X", that is a caption. Name the OBJECT and draw
    it. Fifteen MCP types once rendered the same bordered-box-of-text archetype.
  * Explanatory means components CONNECTED. Show the parts, draw the wires between
    them, move something along the wire, and show what changed at the other end.
    Colouring a box on a beat is not animation.
  * Draw the structure and put the data ON it. A tree has visible edges. A distance
    goes on the node, never in a tiny legend at the bottom.
  * Give the picture before you use it. If narration says "the same houses", the
    houses must already be on screen, and the premise line above the animation says
    what the viewer is looking at, in plain words, for the whole beat.
  * Real artefacts, real data. Real command output with every column, a real declared
    series on a chart with real axes and numbers. Never a placeholder, never sin().
  * The picture moves with the voice. Every element resolves from its own atWord.
    No fixed intervals.
  * Panes MEASURE themselves — see LAW 0o. Never size a depiction to a constant.
    Fit both axes. `safe center`, never bare `center`. Travel a pill by its own
    width (`translateX(-pct%)`), never by half of it.
  * Breathing room is not smaller type. In 9:16, carry LESS on the beat and grow the
    type. If a viewer cannot read it on a phone it does not exist.
  * Icons: lucide:/si: glyphs via AssetIcon, thin strokes, a DIFFERENT recognisable
    object per item. When everything falls back to a generic box, that is the smell.
  * Narration is written for a mouth. Contractions, varied sentence length, the
    reason carried inside the sentence. No "it" without a named subject.
  * The first 30 seconds are a contract: hook = the situation the viewer is in;
    title card = the outcome they get + the greeting. No riddles, nothing clever.
  * Answer the title, and answer it for a beginner (LAW 0p). Establish what the thing
    IS and what it cannot do before you explain the mechanism. Ask out loud: would a
    newcomer follow beat one?
  * Chapter timestamps are HH:MM:SS (00:01:02), never M:SS.

VERIFY BEFORE YOU RENDER, NOT AFTER. A full render is hours; a still is two seconds.
  npx remotion bundle --out-dir=<tmp>/bundle
  npx remotion still <tmp>/bundle <slug>-wide-dark out.png --frame=N
Render 2-3 frames per scene at BOTH aspects, montage them into a contact sheet, and
scan them PROGRAMMATICALLY for faults (content in the outer 12px band, content past
the 9:16 stage floor at y=1686) — eyeballing a contact sheet found 2 of 6 defects
that a script found all of. Read full-size stills, not thumbnails: a dark panel on a
dark ground looks like empty space when scaled down.

LANDMINES — these will silently destroy work:
  * briefs/linux/rewrite/regen.py regenerates all 109 src/scenes/Cmd*.tsx from a
    table. Running it reverts every hand fix in them. Do not run it.
  * The briefs' .py builders have drifted from the .json beside them; the JSON is the
    truth. They are guarded now and will refuse, but read briefs/README.md first.
  * Adding a field to an item type: every scene component maps cells explicitly, so
    grep every `.map((c) =>` in src/scenes/ or the field silently never arrives.
    That bug has shipped three times (parent/links, out/series, icon).
  * Never pipe a builder's stderr to /dev/null — a refusal was missed that way and a
    stale spec rendered.

WHAT ALREADY EXISTS — do not rebuild it: 341 scene types, 30 design packs, 42 themes;
shipped courses are DSA Dojo (12 chapters + course cut + 12 shorts), Linux (87-min
masterclass + 2 shorts), Learn MCP (12 chapters + course cut + 12 shorts). Reuse a
component when it fits ~90%; otherwise build a new one via
`node scripts/component-flow.mjs assemble <cfg> <config> <tsx>`, which wires all 8
touchpoints and rolls back if tsc or the gates fail.

WINDOWS NOTES: use `python` for `python3`. Forward slashes work in both Node and
Python. Everything else is identical.

WORKING AGREEMENT: no approval gates — I do not have time to review intermediate
steps. Do the full job, verify it yourself with stills before rendering, tell me
plainly what you did and anything you could not do. Commit properly as you go and
write every new lesson into CLAUDE.md, docs/STATE.md and CHANGELOG.md in the same
commit — I do not want to lose any of the corrections that matured this repo.

THE TOPIC I WANT NEXT IS:
```

---

## If you are continuing an EXISTING course instead

Same prompt, but replace the last line with the slug and what you want changed, and
add: *"topics/<slug>/long.json and shorts.json are already voiced and synced —
timingSource is "tts". If you change narration you must re-voice and re-sync that
scene; if you change only components, render directly."*
