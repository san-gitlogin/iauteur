# FluidRAM — beat map (wide cut)

The shape: a fair expert review. Credit what is genuinely built and genuinely clever; say
plainly what each headline number measures; then run the author's own code on real memory;
then show how the idea could be made real. Every term is named, drawn and explained the first
time it is spoken. No person but the author is named.

Title: **FluidRAM Claims 4× More RAM on Linux — I Tested the Code**
Subject (spoken in scene 1): **FluidRAM**
Loop opened in the intro: *does a 4× RAM multiplier survive contact with real memory?*

| # | beat | picture (NEW unless furniture/footage) |
|---|---|---|
| 1 | HOOK — the claim, and that we ran the code | HOOK |
| 2 | Welcome; what we'll do; the loop | TITLE_CARD |
| **I** | **What the project is** | |
| 3 | The AdiOS repo, in the browser: the thesis, credit, licence | footage — adios README |
| 4 | What AdiOS actually is: an OS environment running as a program on your real OS | `host-guest` nested machines |
| 5 | The fluidram repo: the claims table (4.12×, 35.07×, zero swap, zero faults) | footage — fluidram README |
| **II** | **Memory, from zero** | |
| 6 | RAM is cut into 4 KB pages; programs ask for more than exists (overcommit) | `page-wall` |
| 7 | When RAM fills: evict to swap on disk, or compress in RAM (zram) — the cost ladder | `evict-paths` |
| 8 | Page faults, thrashing, and the OOM killer — the real problem FluidRAM targets | `oom-kill` |
| **III** | **What FluidRAM proposes** | |
| 9 | Pools that lend each other space; four memory classes | `pool-borrow` |
| 10 | "Galois field" in plain English: bytes where adding is XOR — and the multiply that's never called | `gf-xor` |
| 11 | The encoder that actually runs: zeros vanish, every other byte becomes a 3-byte tuple | `sparse-encode` |
| 12 | The code, on GitHub: sparse mode highlighted | footage — fluid_galois.c |
| 13 | Dense mode and the raw fallback — and a page with real content | `dense-fallback` |
| **IV** | **Where the numbers come from** | |
| 14 | The six-panel chart's bars are literals in the plotting script | `chart-literals` |
| 15 | The plotting script on GitHub | footage — generate_comparison_visuals.py |
| 16 | The simulator: Linux charged a fixed 2.5 ms; FluidRAM's faults are a constant zero | `sim-constants` |
| 17 | fluidram_sim.py on GitHub | footage |
| 18 | 35× "bare metal": a declared 1,024 MB that is never allocated ÷ 29.2 MB | `declared-vs-real` |
| 19 | The QEMU script loads zram, never fluidram.ko | footage — run_full_benchmark_suite.py |
| 20 | Credit: the author's own audit labels these modeled | footage — reconstruction_adiOS.md |
| **V** | **We ran it ourselves** | |
| 21 | The rig: his encoder unmodified, LZ4, zstd, real anonymous memory | `test-rig` |
| 22 | Calibration: reproduces his 9.45× — and on his own pages LZ4 and zstd win | `codec-bars` |
| 23 | Real memory: what a page actually looks like, and the ratios | `page-mix` + `codec-bars` |
| 24 | Reported vs real: kmalloc size classes; a raw page costs 8 KB | `slab-buckets` |
| 25 | Speed: the scatter really is fast (159 ns) — the per-read checksum is the cost | `decode-race` |
| **VI** | **What the kernel side doesn't handle yet** | |
| 26 | No hard cap: the pool keeps allocating; zram has mem_limit | `no-cap` |
| 27 | Two pools, two locks, opposite order: a deadlock | `abba-lock` |
| 28 | Where would -ENOMEM even go? The page-fault path | `fault-path` |
| 29 | The locks, on GitHub | footage — fluid_slab.c |
| **VII** | **What could genuinely work** | |
| 30 | Make it truly differential: XOR against the previous page (QEMU's XBZRLE) | `xbzrle-delta` |
| 31 | Memory that can be rebuilt: MADV_FREE today, a richer contract tomorrow | `memory-contract` |
| 32 | A zero-page fast path in front of LZ4 — where the 159 ns scatter earns its place | `fast-path` |
| 33 | Five things that would make the next benchmark convincing | `roadmap` |
| 34 | Verdict and impact | `verdict` |
| 35 | Out | OUTRO_CTA |

Distinct new pictures: ~26 kinds in one registry (`MEM_STAGE` + `src/memViz.tsx`).
Footage beats: 8 (well under the 35% cap for 35 scenes).
