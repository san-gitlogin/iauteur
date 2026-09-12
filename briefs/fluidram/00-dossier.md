# FluidRAM / AdiOS — the factual dossier

Every sentence the video says about the project is checked against a line below. Each line
names its source: a file and line in the author's repositories, a primary document, or a
measurement we ran ourselves (with how to reproduce it).

**Credit, on screen and in the description:** Aditya Raj — `github.com/adityarajIITj/adios`
(MIT licence) and `github.com/adityarajIITj/fluidram` (GPL-2.0). No other person is named.
Studied at the commits cloned on 2026-09-11 (adios `0a85d38`, fluidram HEAD of 2026-09-09).

---

## 1. What the project IS

- **AdiOS** is an experimental operating-system *environment* written mostly in Python:
  ~65k lines of Python, ~14k of C/headers, ~4k of assembly, 242 `.py` files. It includes a
  RISC-V RV32IM instruction interpreter (`vm/cpu.c`), a desktop compositor, apps, and the
  FluidRAM memory subsystem (`kernel/fluid_ram.py`, 1,317 lines). Runs as a host program:
  `python run_desktop.py`.
- The author's own grounding audit (`adios/docs/architecture/reconstruction_adiOS.md`) is
  explicit and worth crediting: the 1 GB of "physical" memory is a host Python bytearray; the
  Linux comparisons are `[MODELED_VALUE]`; the 2.8:1 compression ratio in the stress test is an
  `[ASSUMPTION]`; bus-traffic savings are modeled. Quote it — the author said this himself.
- **fluidram** (separate repo) holds: a Linux block driver (`driver/fluidram_drv.c`,
  `fluid_slab.c`, `fluid_galois.c`), an in-tree patch adding it to `drivers/block/`, Python
  simulators of "plain Linux" and FluidRAM (`benchmark/*.py`), chart generators, and a QEMU
  harness (`qemu/`).

## 2. What the driver does (fluidram/driver)

- It registers **a block device**, `/dev/fluidramN` (`fluidram_drv.c` 216–247,
  `register_blkdev`, `blk_alloc_disk`, `submit_bio`). Architecturally this is zram's shape: a
  RAM-backed disk you format as swap. Its sysfs names (`disksize`, `orig_data_size`,
  `mem_used_total`, `compression_ratio`) mirror zram's.
- **The "Galois field" encoder does no Galois-field multiplication.** `gf_exp`/`gf_log` tables
  are built and `gf_mul()` is defined (`fluid_galois.c` 40–70) but never called. What runs is:
  1. all-zero / all-same-byte page detection (75–124) — zram already does this
     (`page_same_filled`, `ZRAM_SAME`, zram_drv.c v6.6 line 196/1424);
  2. **sparse mode** (134–161): if a page has fewer than 1,024 non-zero bytes, store each
     non-zero byte as a 3-byte `(16-bit offset, value)` tuple. The "delta" is against ZERO, not
     against any earlier version of the page;
  3. **dense mode** (164–206): XOR each byte with the previous byte (the comment calls this
     "Galois addition in GF(2^8)" — true, XOR is addition in GF(2^8)) then run-length encode;
     accepted only if it saves 25%;
  4. otherwise store the page **uncompressed, plus a 12-byte header**.
- **Every read checksums the whole page**: `crc16()` over 4,096 bytes after decoding (309).
- Kconfig option `FLUIDRAM_GALOIS_ACCEL` promises "SIMD and bit-matrix accelerated Galois
  Field polynomial arithmetic" — no code reads it.
- **No hard capacity limit.** `fluid_pool_write_page` (fluid_slab.c 78–156) tries to borrow
  quota from the peer pool when over quota, and then stores the page **whether or not the
  borrow succeeded**. zram enforces `mem_limit` (zram_drv.c v6.6 line 1491).
- **Allocation cost is not the reported cost.** Each page is `kmalloc(comp_len, GFP_KERNEL)`
  (117). kmalloc rounds up to fixed size classes (… 1k, 2k, 4k, 8k), so a 3,083-byte encoding
  occupies 4,096 bytes and an uncompressed page (4,108 bytes) occupies **8,192** — double the
  page it stores. `compression_ratio` in sysfs divides by `comp_len`, not by what was allocated.
  zram stores through zsmalloc, which packs objects densely (`zs_malloc`, huge_class_size).
- **GFP_KERNEL in the swap-out path.** zram allocates there with `__GFP_KSWAPD_RECLAIM` /
  `GFP_NOIO` (zram_drv.c v6.6 1463, 1471) so writing a page out cannot recurse into reclaim.
- **Lock-order inversion (ABBA).** A write takes `pool->lock`, then `pool->peer_pool->lock`
  (122, 127). With two devices, device 0 does lock0→lock1 while device 1 does lock1→lock0: two
  CPUs writing at once can each hold one lock and wait forever for the other.
- `zero_page_faults` in sysfs is incremented on **every** write (148) and again on every
  borrow (132) — it counts writes, not faults avoided.
- **Does not compile against Linux 6.6 as committed**: `disk->disk_attrs = …` (228) — v6.6
  `struct gendisk` has no `disk_attrs` member (checked against torvalds/linux v6.6
  `include/linux/blkdev.h`). zram passes its attribute groups via `device_add_disk(…,
  zram_disk_groups)` (zram_drv.c v6.6 2248). The userspace build path also needs a `u64`
  typedef it never defines.

## 3. Where each published number comes from

- **The six-panel dashboard** (4.12× vs 1.71×, 24,576 faults / 49,152 ms, 25,100 µs vs 0.28 µs,
  75% vs 100% survival, 248.8 MB): the values are **literals in the plotting script**
  (`benchmark/generate_comparison_visuals.py` 58, 77, 98, 138, 156, 313, 361). The script does
  not read the results file.
- **The committed results file** (`benchmark/results/benchmark_data.json`) reports different
  numbers for the same workload: plain Linux 3.93× vs FluidRAM 9.19×, **0 major faults on
  both, 100% survival on both**.
- **The "plain Linux" side of the simulation** (`benchmark/plain_linux_sim.py`): zram is
  modeled with Python `zlib` level 1, not LZ4 (33); a swap write adds a fixed 1.5 ms (103), a
  swap read a fixed 2.5 ms (136). Constants, not measurements.
- **The FluidRAM side** (`benchmark/fluidram_sim.py`): `major_page_faults = 0  # STRICTLY 0 by
  invariant`, `oom_kills = 0` (181–184) are never incremented; `write_page` always returns True
  (144–160) — it cannot run out. The suite then writes `"major_page_faults": 0  # STRICT ZERO
  INVARIANT` into the results (`benchmark_suite.py` 135–138).
- **The test pages**: "sparse_heap" = a zeroed page with 15–60 random 8-byte values written into
  it (`benchmark_suite.py` 25–33) — roughly 88–97% zero bytes.
- **The author's own saved compression results** (same JSON, workload_2): sparse heap — zlib-1
  **14.00×**, FluidRAM **9.45×**; code-like pages — zlib 3.12×, FluidRAM **1.00×**; JSON pages —
  zlib 20.97×, FluidRAM **1.00×**.
- **"35.07× in bare-metal QEMU"**: the QEMU init script loads `zram.ko` and runs a Python file;
  it never loads `fluidram.ko` (`qemu/run_full_benchmark_suite.py` 41–51). The FluidRAM figure
  is `run_empirical_4x_benchmark(scale_mb=1024)` from AdiOS (`kernel/fluid_ram.py` 1207–1286):
  `declared_workload_mb = 1024` is a number that is **never allocated**; the resident side is
  10% of the physical limit plus a video buffer plus a delta history (29.2 MB); density is
  declared ÷ resident = 35.07. The FluidRAM row's 0 swap writes / 0 faults / 0 OOM are
  literals (`qemu/guest_root/guest_raw_benchmark.py` 158–165). The plain-Linux row IS real
  kernel counters, from a different workload (a 320 MB tmpfs file, not 1,024 MB).
- **0.42 µs decompression** (`docs/TECHNICAL_SPECIFICATION.md` §5) is a derivation for a page
  with 100 non-zero tuples, not a measurement, and it leaves out the checksum the code runs.
- **Saturation** (`TECHNICAL_SPECIFICATION.md` §8): "Return -ENOMEM to requesting syscall".
  A swap device is written during reclaim, not in a syscall the allocating process is making;
  under Linux's default overcommit, `malloc` has already succeeded and the page is touched
  later. When reclaim cannot free memory, the kernel's OOM killer decides — a swap device
  cannot return an error to the process that needed the page.

## 4. What we measured ourselves (reproducible)

Harness: `fr_bench.c` — the author's `fluid_galois.c` compiled **unmodified** (gcc 10.3 -O2,
userspace branch, a 5-year-old Windows laptop) beside LZ4 v1.10.0 (reference C) and zstd level 3
(python-zstandard 0.25), over the same 4 KB pages. Footprints: FluidRAM = kmalloc size class
(zero pages cost 0); LZ4/zstd = zram-style (same-filled 0, zsmalloc 16-byte classes, >3/4 page
stored raw). That zram footprint is a MODEL of its allocator and is labelled as one.

**Calibration on the author's own page generators** (200 pages each):

| page class | FluidRAM reported | FluidRAM real (kmalloc) | LZ4 (zram model) | zstd-3 (zram model) |
|---|---|---|---|---|
| sparse_heap | 9.85× | **6.83×** | 11.92× | 15.43× |
| structured_code | 1.00× | **0.50×** | 1.96× | 5.68× |
| json_dom | 1.00× | **0.50×** | 23.27× | 28.67× |

Harness reproduces the author's own 9.45× sparse-heap ratio (9.85×, different seed). ✓

**Decode time per sparse page** (2,000 passes over 200 pages):

| path | ns / page |
|---|---|
| FluidRAM scatter only, no checksum (the author's latency model) | **159** |
| FluidRAM with the kernel-equivalent table CRC (identical checksum) | **8,330** |
| FluidRAM as shipped in userspace (bit-by-bit CRC) | 26,296 |
| LZ4 | **614** |

The scatter really is fast — faster than LZ4 on a mostly-zero page. The per-read checksum is
what costs.

**Real memory** — anonymous pages (MEM_PRIVATE, committed, read-write) from processes started
for the test: a fresh headless Chromium (no profile) holding three public pages, and a Python
process holding the standard library's parsed source. Raw pages deleted after measurement;
only per-page sizes kept. Windows processes, so say "a real browser and a real Python
program", not "Linux memory" — the codec comparison is on identical pages either way.

| real anonymous memory | pages | FluidRAM reported | FluidRAM real (kmalloc) | LZ4 (zram model) | zstd-3 (zram model) |
|---|---|---|---|---|---|
| headless Chromium, 3 public tabs | 107,654 (420.5 MB) | 1.79× | **0.95×** | **4.33×** | **6.07×** |
| Python holding parsed stdlib (434 ASTs) | 43,680 (170.6 MB) | 1.02× | **0.51×** | **2.93×** | **4.80×** |

FluidRAM page types — browser: zero 24.8%, uniform 0.7%, sparse 20.2%, dense 9.6%,
**uncompressed 44.6%**. Python: zero 1.5%, sparse 0.4%, dense 0.3%, **uncompressed 97.8%**.
Round trip: **0 mismatches across all 151,334 pages** — the bit-exact claim holds. Credit it.

**How sparse is a real page** (non-zero bytes per 4 KB page):

| pages | median | all-zero | 1–255 | 256–1,023 | 1,024–2,047 | 2,048+ |
|---|---|---|---|---|---|---|
| author's synthetic sparse_heap | **127** | 0% | 100% | 0% | 0% | 0% |
| real browser | **1,179** | 24.8% | 6.0% | 14.2% | 19.0% | 36.0% |
| real Python | **1,967** | 1.5% | 0.2% | 0.2% | 66.8% | 31.3% |

Decode on real pages (kernel-equivalent CRC): FluidRAM 8.3–12.3 µs per page vs LZ4 0.7–1.6 µs.

## 5. What already exists (for "is this new?")

- zram: compressed RAM block device for swap, same-filled page detection, `mem_limit`,
  zsmalloc packing (zram_drv.c v6.6). zswap: a compressed cache in front of a swap device.
- MGLRU: "offers thrashing prevention to the majority of laptop and desktop users" and
  `min_ttl_ms` "prevent[s] the working set of N milliseconds from getting evicted"
  (docs.kernel.org, admin-guide/mm/multigen_lru).
- MADV_FREE (Linux 4.5): the app tells the kernel pages may be freed under pressure; afterwards
  it reads zero-filled pages (man7 madvise(2)). This is "reconstructible memory" at page level.
- QEMU XBZRLE: "a XOR between the previous and current content of the page, where zero
  represents an unchanged value"; zero runs by length, non-zero runs as length + data;
  "particularly useful … for any application that uses a sparse memory update pattern"
  (qemu.org, devel/migration/xbzrle).

## 6. Things NOT to say

- Do not call it fraud or dishonest. Say what each number measures. The author's own audit
  document already separates modeled from measured; the video credits that.
- Do not say FluidRAM is slow. The scatter decode measured 159 ns — faster than LZ4.
- Do not name anyone from the discussion around the project. Only the author and his repos.
- Do not claim the driver was never compiled anywhere — only that, as committed, the
  `disk_attrs` line does not match the Linux 6.6 structure, and that the QEMU run shown does
  not load it.
