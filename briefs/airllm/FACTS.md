# AirLLM — sourced facts for `topics/airllm-on-my-mac`

Every figure here has a source. Anything the video SAYS about a number must either appear in a
frame that ships or be traceable to a line in this file. Nothing is filled from memory.

## The subject

| field | value | source |
|---|---|---|
| repo | `lyogavin/airllm` | github.com/lyogavin/airllm |
| GitHub one-line description | "AirLLM 70B inference with single 4GB GPU" | GitHub API, 2026-09-26 |
| stars | 34,936 at 2026-09-26 | GitHub API — **read off the frame that ships, never from here** |
| forks | 3,673 | GitHub API, 2026-09-26 |
| licence | Apache-2.0 (`LICENSE` is the Apache 2.0 text) | repo `LICENSE` |
| author | Gavin Li (`lyogavin`) | repo, README citation block |
| created | 2023-06-12 | GitHub API |
| last push | 2026-09-25 | GitHub API |
| PyPI latest | `airllm` 4.0.0, released 2026-09-05 | pypi.org/pypi/airllm/json |

**`meta.subjectKind`** (LAW: name the thing in its own category): *an open-source Python library
that runs a large language model by streaming its layers off disk one at a time.* The README's own
words: "AirLLM dramatically reduces inference memory usage, letting 70B large language models run on
a single 4GB GPU card — without quantization, distillation, or pruning."

## The claim, in the README's own table

| Model | Size | GPU VRAM |
|---|---|---|
| Llama 3.x 70B (full precision) | 70B | ~4 GB |
| DeepSeek-V3 | 671B | ~12 GB |
| Qwen3-235B (MoE) | 235B | ~3 GB |

README's stated mechanism, verbatim: *"AirLLM only ever keeps **one layer on the GPU at a time**, so
the VRAM you need depends on the model's layer size — not its total size."*

## What the code does — read in `airllm` 4.0.0 as installed, byte-identical to git HEAD

Verified with `diff` against `github.com/lyogavin/airllm@4678fff` for `auto_model.py`, `utils.py`,
`airllm_llama_mlx.py`, `persist/mlx_model_persister.py`.

1. **On macOS there is a second code path, and it is the only one.** `auto_model.py` sets
   `is_on_mac_os` from `sys.platform == "darwin"` and then `from_pretrained` returns
   `AirLLMLlamaMlx(...)` **before** any architecture check. So on a Mac the `ARCH_OVERRIDES` table
   and the generic `AirLLMBaseModel` are never reached, whatever model you name.
2. **That path is MLX, hand-written.** `airllm_llama_mlx.py` implements `Attention` (`wq/wk/wv/wo`),
   `FeedForward` (`w1/w2/w3`), `RMSNorm` and a `TransformerBlock` in `mlx.nn`, and
   `persist/mlx_model_persister.py` renames Hugging Face weight keys onto them
   (`q_proj`→`wq`, `gate_proj`→`w1`, `input_layernorm`→`attention_norm`, …). It is the Llama shape.
3. **Weights are re-read from disk for every token.** In `model_generate`, each loop iteration
   builds a fresh `TransformerBlock`, calls `ModelPersister…load_model(...)` for that layer, runs it,
   then `del l; gc.collect()`. The KV cache persists across tokens; the weights do not.
   Consequence: bytes read per token ≈ the whole model.
4. **The per-layer files are `.mlx.npz`.** `persist_model` casts to float16, `np.savez`, and touches a
   `.done` marker. Layer names come from `utils.split_and_save_layers`, which appends `"."` to each
   module name — so `model.layers.0.` + `mlx` → `model.layers.0.mlx.npz`, which is what `load_model`
   reads. (Checked: the names agree. They look mismatched until you find the `l + "."` line.)
5. **`rope_theta` is not read from the model's config on this path.** `get_model_args_from_config`
   copies `hidden_size`, `intermediate_size`, `num_attention_heads`, `num_key_value_heads`,
   `num_hidden_layers`, `vocab_size`, `rms_norm_eps` — and nothing else. `sanitize_config` then fills
   the gap: `if "rope_theta" not in config: config["rope_theta"] = 10000`. Llama 3's own
   `config.json` says `500000.0`. **Verify empirically before saying anything about it.**
6. **The README's quickstart does not run on a Mac.** It passes
   `input_tokens['input_ids'].cuda()`; the MLX path needs `mx.array(...)` and
   `return_tensors="np"`, which is what `air_llm/examples/run_on_macos.ipynb` actually does. The
   README's MacOS section says "run the code the same as on linux".
7. **`generate` returns a decoded string**, not a `GenerationOutput` — `use_cache` and
   `return_dict_in_generate` are swallowed by `**kwargs` on this path.
8. **KV cache is stored after GQA expansion.** `keys, values = map(repeat, (keys, values))` runs
   before the cache append, so 8 key/value heads are materialised as 64.

## The machine (measured on this Mac, 2026-09-26)

| thing | value | how measured |
|---|---|---|
| model | MacBook Pro, `Mac15,6`, Apple M3 Pro | `system_profiler SPHardwareDataType` |
| CPU | 11 cores — 5 performance, 6 efficiency | same |
| GPU | 14 cores, Metal 3 | `system_profiler SPDisplaysDataType` |
| unified memory | 18 GB | same / `sysctl hw.memsize` = 19,327,352,832 |
| macOS | 15.6.1 (24G90) | `sw_vers` |
| internal free | ~37 GB of 460 GB (Data volume 92% full) | `df -h` |
| external SSD | SanDisk Extreme 1 TB, USB 10 Gb/s, ExFAT | `system_profiler SPUSBDataType` |
| SSD free | 741 GB | same |
| SSD sequential write | **866 MB/s** | `dd bs=1m count=2048` |
| SSD sequential read | **984 MB/s** | `dd bs=1m` after `purge` |

Note for the terminal takes: the SSD is **ExFAT**, so it stores no POSIX permissions and supports no
symlinks. Hugging Face's cache normally symlinks blobs into snapshots; downloading with
`local_dir=` writes plain files instead, which is why the demo does that.

## The model under test

`NousResearch/Meta-Llama-3-8B-Instruct` — an ungated mirror of Meta's Llama-3-8B-Instruct, chosen so
nothing gated appears on camera and no token is handled. 16.1 GB of safetensors in 4 shards
(`model-0000{1..4}-of-00004.safetensors`), listed via `HfApi.model_info(files_metadata=True)`.
Credit BOTH Meta (the model, Llama 3 Community Licence) and NousResearch (the mirror) in
`meta.seo.sources`.

`config.json`: 32 layers, hidden 4096, 32 heads, 8 KV heads, vocab 128,256,
`rope_theta` 500000.0, `tie_word_embeddings` false.

## Download, measured

The hub client's Xet backend ran at **~1 MB/s** on this connection and then stalled at 0 KB/s;
`HF_HUB_DISABLE_XET=1` with `hf_transfer` gave **~6 MB/s** on the same files, and a plain ranged
`curl` to the CDN gave 8.7 MB/s. Four parallel range requests did not beat one, so ~7-9 MB/s is the
line, not the client.

## Measured on this Mac, 2026-09-26 (research pass, `~/airllm-lab`)

These numbers sized the beats. **The figures the narration SAYS come off the recorded frames**,
not off this table (LAW: a verification run is not the take). Re-check each against its take.

### The split — `AutoModel.from_pretrained(local_path, layer_shards_saving_path=...)`

| thing | value |
|---|---|
| wall time | **71 s** |
| files written | **35** `.mlx.npz` (+ 35 `.done` markers) |
| bytes on disk | **15.53 GB** (the originals stay, so 31.6 GB in total) |
| `model.embed_tokens.mlx.npz` | **1.051 GB** |
| `model.layers.0.mlx.npz` | **0.436 GB** |
| `lm_head.mlx.npz` | **1.051 GB** |
| `model.norm.mlx.npz` | 33 KB |

Those match the arithmetic from `config.json` exactly (0.436 GB per decoder layer, 1.051 GB for a
128,256 x 4096 table at two bytes a weight), which is the check that the split is doing what the
README says it is doing. 35 files = 32 decoder layers + embed + norm + lm_head.

A second call returns in **0.4 s** and prints `saved layers already found in ...` — the split is
done once, not per run.

### The class actually in use

`type(model).__name__` is **`AirLLMLlamaMlx`** — confirmed, not inferred. On macOS that is the
only possibility (see point 1 under "What the code does").

### The RoPE base — CONFIRMED EMPIRICALLY, not just read

    config.json rope_theta       : 500000.0
    AirLLM model_args.rope_theta : 10000

Printed from the live object in the same run. Llama 3 was trained with a base of 500,000; the
macOS MLX path applies 10,000. Whether that changes the ANSWER is the next measurement, and the
video says nothing about it until the reference run answers.

### Speed

`running layers` steadies at **1.88 layers/s**, i.e. ~17 s for one pass of all 32 decoder layers,
before the word table and the output table on either end.

## THE NUMBERS THAT SHIP — read off the recorded frames, 2026-09-26

Every figure the narration speaks must come from this section. The research numbers above sized the
beats; these are what the viewer will see (LAW: a verification run is not the take).

### `rec:airllm-gh` — the project's own page
34.9k stars · 295 watching · 3.7k forks · Apache-2.0 license · lyogavin, Gavin Li ·
"AirLLM 70B inference with single 4GB GPU" · README: "The trick: AirLLM only ever keeps one layer
on the GPU at a time" · table row "Llama 3.x 70B (full precision) | 70B | ~4 GB" · the MacOS
section: "Just install airllm and run the code the same as on linux", "make sure you installed mlx
and torch", "only Apple silicon is supported".

### `rec:airllm-mac` — the machine
    Model Name: MacBook Pro          Chipset Model: Apple M3 Pro
    Chip: Apple M3 Pro               Total Number of Cores: 14   (GPU)
    Total Number of Cores: 11 (5 performance and 6 efficiency)
    Memory: 18 GB
       460Gi total      49Gi free   inside the laptop
       931Gi total     659Gi free   the external SSD
    1168138808 bytes transferred in 1.187513 secs (983685070 bytes/sec)

**984 MB/s** is the number to speak, and it is on screen as `983685070 bytes/sec`.

### `rec:airllm-install`
`airllm 4.0.0` · `mlx 0.32.2` · one `pip install airllm mlx`.

### `rec:airllm-split`
Downloaded: `4.6G / 4.7G / 4.6G / 1.1G` across `model-0000{1..4}-of-00004.safetensors`.
On camera: **split finished in 54s** · `class in use: AirLLMLlamaMlx` · `layers: 32` ·
**35** `.npz` files · `lm_head.mlx.npz 1.0G` · `model.embed_tokens.mlx.npz 1.0G` ·
`model.layers.0.mlx.npz 416M`.

### `rec:airllm-chat` — the payoff
    running layers: 100%|...| 32/32 [00:17<00:00,  1.87it/s]     (twice, once per word)
    ANSWER: Paris<|eot_id|>
    TIME:   41s for 2 words
    MEMORY: 3.19 GB peak

**3.19 GB peak for a 16 GB model**, and **41 seconds for two words**. `<|eot_id|>` is the model's
end-of-turn marker — name it in the same breath (LAW 0e.1), do not skip past it.

### `rec:airllm-paths` — which code runs
    class that ran      : AirLLMLlamaMlx
    config.json asks for: rope_theta = 500000.0
    this code uses      : rope_theta = 10000

**What may be said about this, and nothing more.** The macOS path never reads `rope_theta` from the
model's config; it falls back to 10,000 where Llama 3's own config asks for 500,000. On the
22-token prompt filmed here the answer was still correct (`Paris`). Whether it costs anything on a
long prompt was NOT measured, so the video does not say it does. This is a fact about the code
path, not a verdict on the project.

## Research-only — MEASURED, BUT NOT ON CAMERA

- **Loading the same model the ordinary way fails on this machine.** `mlx-lm` 0.31.3, same
  checkpoint, same prompt: loads in 18 s, then dies in `generate_step` with
  `[METAL] Command buffer execution failed: Insufficient Memory`. A second attempt through the
  `mlx_lm generate` CLI **panicked the kernel** (`userspace watchdog timeout: no successful
  checkins from WindowServer`) and rebooted the machine. That is a real and important result and it
  is NOT worth re-filming: see the memory `never-load-a-model-that-fills-ram`. If the cut shows it
  at all, it is a DRAWN beat citing this measurement, never a claim that a camera watched it.
- AirLLM research run, 8 tokens: 170.7 s (21.3 s/token), peak RSS 3.73 GB, MLX peak 4.23 GB,
  answer `The capital of France is Paris.`


## Production record — the cut as shipped (2026-09-26)

| | |
|---|---|
| long | 32 scenes, **15:27** (27,8xx frames), moderndark, background `noise` |
| footage beats | 12 of 32 (38%, cap 12) |
| takes | `airllm-gh`, `airllm-map`, `airllm-mac`, `airllm-install`, `airllm-split`, `airllm-chat`, `airllm-paths` — 26 clips, 209 s |
| new component | `AIRLLM_STAGE` + six pictures in `src/airllmViz.tsx` (wall, floors, ceiling, pipe, crossover, road) |
| Archify | `airllm-token.lifecycle` — 5 filmed states, motion paused first, settle check 0 to 3.7e-5 against a 0.35 threshold |
| shorts | 6 scenes, **63 s** |
| voice | `en-US-AvaMultilingualNeural` at the house `+8%` |

**Two camera moves were dropped, deliberately.** `check-camera` refused the render because the
push onto `Successfully installed` (s18) and onto `Total Number of Cores: 14` (s16) could not be
placed: a zoom is CLAMPED to land after its own clip's footage, and on both clips the legal
landing word was already past the sentence that names what the camera frames. The alternatives
were a narration rewrite plus a re-voice, or pulling back — and the gate exists precisely because
the owner rejected a cut for "zooming in at a specific place while speaking about something which
is not in focus". Both clips still fill the frame through `focus`.

**Gotcha worth keeping:** `present=1` does NOT remove the Archify authoring toolbar on this
artifact — `embed=1` does. Probed on 2026-09-26; `docs/ARCHIFY.md` says `present=1` and that is
incomplete.

## The product name — settled by ear, 2026-09-26

`meta.pronounce["AirLLM"] = "Air·LLM"` (U+00B7 MIDDLE DOT). Owner listened to
`out/NAME-CHECK.mp3` and approved the occurrence at 0:15 (scene 11, mid-sentence): *"you say the
word right. That sounds perfect."*

**How it got there, and why the transcript could not have.**

| respelling | name duration | internal pause | verdict |
|---|---|---|---|
| `Air-L-L-M` | — | — | spoken "Aralem". Caught by the voice audit, 17 scenes. |
| `Air–LLM` (en-dash) | 1030 ms | 220 ms | correct words, but the owner heard the pause: *"purely AIish, you are giving a long pause between Air and LLM"* |
| `Air’LLM` (apostrophe) | 590 ms | 0 ms | too far — blends to "Errolum" |
| **`Air·LLM` (middle dot)** | **521 ms** | **67 ms** | approved |

**The lesson, and it is about the gate, not the name.** `audit-voice.py` compares WORDS. A 220 ms
pause inside a product name transcribes identically to no pause, so the audit was green on the
prosody defect and red on scenes whose audio was correct — the exact inverse of useful. Three
voice cycles were spent treating a real defect as a transcription artefact.

**So: the voice audit filters WRONG WORDS (it caught "Aralem" and an inverted "isn't"), and it is
not evidence that a cut SOUNDS right.** Before shipping, the owner hears it. Do not report a green
audit as though it settled the question.

Residual audit failures on this cut are the transcriber failing to spell "Air" before an acronym
mid-sentence; `initial_prompt` fixes them and was REJECTED because the break-test showed it also
passes the "Aralem" audio the gate exists to catch.
