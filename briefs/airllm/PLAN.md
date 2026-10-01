# `airllm-on-my-mac` — the plan

Interview answers (2026-09-26): **both** long + shorts · **9-12 min** wide · **moderndark** ·
**en-US-AvaMultilingualNeural** · thumbnail art = **AirLLM's own logo beside a drawn Mac** ·
demo model = **Llama-3-8B-Instruct only**, from the **ungated NousResearch mirror**.

## The angle

The repo's headline is "70B on a single 4GB GPU". This video does not test 70B — it tests the
**mechanism** on the machine the viewer probably owns, with a chat model, and then says plainly
what the technique costs and who it is actually for.

**One-sentence payoff:** AirLLM really does run a model far larger than the memory it holds — and
the wall it removes (memory) is replaced by one nobody mentions (how fast your disk reads).

**The open loop:** if the whole model never fits in memory, where does it live while it answers?

**The carried analogy — established before it is used (LAW 0l):** a model is a stack of identical
floors, and AirLLM is a lift that only ever carries one floor at a time. It is DRAWN, by Archify,
not merely named.

**subjectKind:** an open-source Python library that runs a large language model by reading it off
your disk one layer at a time.

## What must not be claimed

- Not "I ran 70B" — a 70B model was never downloaded. The 70B row is quoted as the README's claim,
  on screen, read off the page.
- Not "the CUDA path is broken" — everything measured here is the **macOS MLX path**, which
  `auto_model.py` selects before any architecture check. Say which path, every time.
- No "real terminal" / "measured here" narration (LAW 0f). The footage argues; the presenter does not.
- The star count is read off the frame that ships, never from `FACTS.md`.

## Beat map (target ~35 scenes, ~1,900 written words, ~11-12 min at 0.363 s/word)

Over-reliance arithmetic done FIRST (VIDEO_METHOD): 12 footage beats need `12 / 0.35` = **35 scenes
minimum**. The drawn beats below are planned in, not bolted on afterwards.

### Act 1 — what this is (scenes 1-8)
1. HOOK - the thing that sounds wrong, in one sentence, carrying a person
2. TITLE_CARD - greet, name AirLLM, say what we will do today
3. **FOOTAGE** - result teaser: the answer arriving, and the memory line beside it
4. **FOOTAGE** - its GitHub page: description, author, stars, licence (`sourceNote` all beat)
5. **FOOTAGE** - the README's own claim, and the table everyone screenshots
6. DRAWN - why memory is the usual wall
7. DRAWN - what "without quantization" means, and why that matters
8. DRAWN - the claim restated as an object: a 16 GB stack against an 18 GB machine

### Act 2 — how it can possibly work (scenes 9-17)
9.  CHAPTER
10. DRAWN - a model is a stack of identical floors (establish the analogy)
11. **ARCHIFY** - the map, motion paused: one layer at a time
12. DRAWN - what one floor actually contains (attention, then MLP)
13. **ARCHIFY** - what sets the ceiling: the word table, not a layer
14. DRAWN - the ceiling arithmetic: 0.44 x 32 + 1.05 + 1.05 = 16.06, peak 1.05
15. **ARCHIFY** - and again for the next word
16. DRAWN - the one thing that is kept between words (the attention cache)
17. DRAWN - so the bill is bytes-read-per-word, not memory

### Act 3 — doing it on this Mac (scenes 18-28)
18. CHAPTER
19. **FOOTAGE** - the machine: chip, cores, 18 GB
20. **FOOTAGE** - the disks: what is left inside, the external drive, its measured read speed
21. DRAWN - why the model cannot live on the internal disk
22. **FOOTAGE** - install: a virtual environment, then two packages
23. DRAWN - on a Mac it takes a different road (AutoModel -> AirLLMLlamaMlx), from the source
24. DRAWN - and that road converts the weights to half precision on the way in
25. **FOOTAGE** - the split, and the per-layer files it leaves behind
26. DRAWN - what 35 files on a disk have to do with 32 floors
27. **FOOTAGE** - the script, line by line
28. **FOOTAGE** - the run: the answer, the clock, the peak memory

### Act 4 — what it is worth (scenes 29-35)
29. CHAPTER
30. DRAWN - memory: claim vs measured
31. DRAWN - speed: measured, and the one division that explains it
32. DRAWN - the honest comparison on THIS machine (an 8B already fits)
33. DRAWN - so where the line is: the size at which streaming starts to pay
34. RECAP - closes the hook's loop
35. OUTRO_CTA - the repo, the docs, the issue tracker; credit Gavin Li, Meta, NousResearch

## Components to BUILD (LAW 0e.8 wants 2-4; these are the distinct PICTURES, one scene type)

One new scene type `AIRLLM_STAGE`, growing `src/airllmViz.tsx` (LAW 0n corollary: plan PICTURES,
register ONE type):

| kind | the object the viewer sees | beat |
|---|---|---|
| `wall` | a model block that will not fit through a memory doorway | 6 |
| `floors` | a tower of 32 identical floors with a lift carrying exactly one | 10, 12 |
| `ceiling` | a memory gauge whose needle is set by the LARGEST single file, not the total | 14, 30 |
| `pipe` | bytes crossing a cable per word, with the clock it implies | 17, 31 |
| `crossover` | model size against this machine's memory, and where streaming starts to pay | 32, 33 |
| `road` | the two code paths out of one function call, and which one a Mac takes | 23 |

Everything that is a FLOW goes to Archify (LAW 0r), already authored and rendered:
`briefs/airllm/archify/airllm-token.lifecycle.json` -> `public/assets/archify/airllm-token.lifecycle.html`
(validates, `archify check` passes with 0 errors / 0 warnings; film with `embed=1`, which is the
only mode that actually removes the toolbar — `present=1` alone leaves it in frame).

## Takes

| slug | surface | what it films |
|---|---|---|
| `airllm-gh` | browser | the repo page, read like a reader |
| `airllm-map` | browser | the Archify lifecycle, motion paused, one state change per step |
| `airllm-mac` | vscode, terminalOnly | chip, cores, memory, disks, measured SSD read |
| `airllm-install` | vscode, terminalOnly | venv + `pip install airllm mlx` |
| `airllm-split` | vscode, terminalOnly | the split, and the per-layer files |
| `airllm-chat` | vscode, terminalOnly | the script, then the run |

The workspace is `/tmp/iauteur-rec/airllm-lab` for every terminal take, so `assertNoIdentity`
never sees a home path. The model and the splits live on the SSD, which carries no identity either.
