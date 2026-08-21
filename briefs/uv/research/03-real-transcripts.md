# uv — real captured transcripts

**Every line below was produced by actually running uv**, not copied from the docs and not
written from memory. CLAUDE.md LAW 0m: real artefacts, real data. LAW 3: no invention.

- Binary: **uv 0.12.5 (210d1f678 2026-08-14 x86_64-pc-windows-msvc)**, installed isolated
  into the session scratchpad via `UV_INSTALL_DIR`. The machine's own uv (0.10.9) was left
  untouched — 0.10.9 predates the v0.12 `uv init` change and would have produced a
  misleading transcript.
- Captured 2026-08-21 on Windows 11, system CPython 3.10.4.
- `NO_COLOR=1`. Sandbox paths shortened to `/…/sandbox/` for legibility.
- **Scrubbed:** `uv init` writes an `authors` entry from your local git config. The real
  capture contained the owner's GitHub name and noreply email; it is replaced everywhere
  below with `Ada Lovelace <ada@example.com>` and **must never appear on screen.**

---

## 1 · `uv init hello-world`

```console
$ uv init hello-world
Initialized project `hello-world` at `/…/sandbox/hello-world`
```

Files created — note there is **no `.git/`** here, though /guides/projects/ shows one:

```
hello-world/
├── .python-version
├── README.md
├── pyproject.toml
└── src/
    └── hello_world/
        └── __init__.py
```

`pyproject.toml`:

```toml
[project]
name = "hello-world"
version = "0.1.0"
description = "Add your description here"
readme = "README.md"
authors = [
    { name = "Ada Lovelace", email = "ada@example.com" }
]
requires-python = ">=3.10"
dependencies = []

[project.scripts]
hello-world = "hello_world:main"

[build-system]
requires = ["uv_build>=0.12.5,<0.13.0"]
build-backend = "uv_build"
```

⚠ The docs page renders the constraint as `uv_build>=0.12.5,<0.13`; the real file writes
**`<0.13.0`**. Show the real one.

`.python-version` → `3.10`   (it picked up the *system* Python, not the newest available)

`src/hello_world/__init__.py`:

```python
def main() -> None:
    print("Hello from hello-world!")
```

---

## 2 · `uv add rich` — the first install, and the friends it brings

```console
$ uv add rich
Using CPython 3.10.4 interpreter at: C:\…\Python310\python.exe
Creating virtual environment at: .venv
Resolved 5 packages in 377ms
   Building hello-world @ file:///…/sandbox/hello-world
      Built hello-world @ file:///…/sandbox/hello-world
Downloading pygments (1.2MiB)
 Downloaded pygments
Prepared 5 packages in 1.43s
Installed 5 packages in 980ms
 + hello-world==0.1.0 (from file:///…/sandbox/hello-world)
 + markdown-it-py==4.2.0
 + mdurl==0.1.2
 + pygments==2.21.0
 + rich==15.0.0
```

**Teaching gold:** the viewer asked for ONE package and got FIVE lines. `markdown-it-py`,
`mdurl` and `pygments` were never mentioned — that is transitive dependency, shown rather
than defined. Also note uv created the `.venv` **without being asked**.

---

## 3 · `uv add --dev pytest` — a second group, and a shared dependency

```console
$ uv add --dev pytest
Resolved 13 packages in 450ms
   Building hello-world @ file:///…/sandbox/hello-world
      Built hello-world @ file:///…/sandbox/hello-world
Prepared 9 packages in 602ms
Uninstalled 1 package in 15ms
Installed 9 packages in 424ms
 + colorama==0.4.6
 + exceptiongroup==1.3.1
 ~ hello-world==0.1.0 (from file:///…/sandbox/hello-world)
 + iniconfig==2.3.0
 + packaging==26.3
 + pluggy==1.6.0
 + pytest==9.1.1
 + tomli==2.4.1
 + typing-extensions==4.16.0
```

Note the marker vocabulary: `+` added, `~` changed/rebuilt. Worth teaching explicitly.

`pyproject.toml` gained:

```toml
dependencies = [
    "rich>=15.0.0",
]

[dependency-groups]
dev = [
    "pytest>=9.1.1",
]
```

⚠ `uv add rich` wrote `rich>=15.0.0` — a **lower bound derived from the installed version**,
not a pin. Beginners assume `uv add` pins. It does not. Teach this.

---

## 4 · `uv tree` — the dependency graph, drawn by uv itself

```console
$ uv tree
Resolved 13 packages in 1ms
hello-world v0.1.0
├── rich v15.0.0
│   ├── markdown-it-py v4.2.0
│   │   └── mdurl v0.1.2
│   └── pygments v2.21.0
└── pytest v9.1.1 (group: dev)
    ├── colorama v0.4.6
    ├── exceptiongroup v1.3.1
    │   └── typing-extensions v4.16.0
    ├── iniconfig v2.3.0
    ├── packaging v26.3
    ├── pluggy v1.6.0
    ├── pygments v2.21.0
    └── tomli v2.4.1
```

**The single best real datum in this whole capture: `pygments` appears TWICE** — once under
`rich`, once under `pytest`. Two packages independently need it; the environment holds
exactly one copy at one version. That is the shared-dependency idea, and it is drawn for
free by a real command on real data. Build the graph component around this exact tree.

---

## 5 · `uv run` — and the lockfile arriving on its own

```console
$ uv run hello-world
Hello from hello-world!
```

After the adds, the directory holds:

```
.python-version   README.md   pyproject.toml   src/   uv.lock   .venv/
```

Neither `uv.lock` nor `.venv/` was ever asked for.

---

## 6 · `uv.lock` — the real thing (head)

```toml
version = 1
revision = 3
requires-python = ">=3.10"

[[package]]
name = "colorama"
version = "0.4.6"
source = { registry = "https://pypi.org/simple" }
sdist = { url = "https://files.pythonhosted.org/packages/d8/53/…/colorama-0.4.6.tar.gz", hash = "sha256:08695f5cb7ed6e0531a20572697297273c47b8cae5a63ffc6d6ed5c201be6e44", size = 27697, upload-time = "2022-10-25T02:36:22.414Z" }
wheels = [
    { url = "https://files.pythonhosted.org/packages/d1/d6/…/colorama-0.4.6-py2.py3-none-any.whl", hash = "sha256:4f1d9991f5acc0ca119f9d443620b77f9d6b33703e51011c16baf57afb285fc6", size = 25335, upload-time = "2022-10-25T02:36:20.889Z" },
]

[[package]]
name = "hello-world"
version = "0.1.0"
source = { editable = "." }
dependencies = [
    { name = "rich" },
]

[package.dev-dependencies]
dev = [
    { name = "pytest" },
]

[package.metadata]
requires-dist = [{ name = "rich", specifier = ">=15.0.0" }]
```

The `hash = "sha256:…"` is the reproducibility argument in one field: not just *which*
version, but *which exact bytes*. `upload-time` and `size` are there too. Show the real hash.

---

## 7 · `uv lock --check` and `uv sync` on an up-to-date project

```console
$ uv lock --check
Resolved 13 packages in 1ms

$ uv sync
Resolved 13 packages in 1ms
Checked 13 packages in 3ms
```

"Checked" (not "Installed") is what a no-op sync looks like. Useful: it shows sync is
idempotent, which is the whole point of it.

---

## 8 · What a `.venv` ACTUALLY is — real anatomy

```
.venv/
├── .gitignore        ← uv writes this itself, so git ignores the venv automatically
├── .lock
├── CACHEDIR.TAG
├── Lib/              ← "lib/" on macOS + Linux
├── Scripts/          ← "bin/" on macOS + Linux
└── pyvenv.cfg
```

`pyvenv.cfg` — the entire configuration of a virtual environment, six lines:

```ini
home = C:\Users\…\Programs\Python\Python310
implementation = CPython
uv = 0.12.5
version_info = 3.10.4
include-system-site-packages = false
prompt = hello-world
```

**`include-system-site-packages = false` IS the isolation.** One line. That is the answer to
"what is a virtual environment" and it should be on screen when the question is asked.

`.venv/Lib/site-packages/` (first entries):

```
colorama/            colorama-0.4.6.dist-info/
exceptiongroup/      exceptiongroup-1.3.1.dist-info/
hello_world-0.1.0.dist-info/   hello_world.pth
iniconfig/           iniconfig-2.3.0.dist-info/
markdown_it/         markdown_it_py-4.2.0.dist-info/
mdurl/               _virtualenv.pth   _virtualenv.py   __pycache__/
```

Every installed package is just a folder here. Nothing magic.

---

## 9 · `uvx` — ephemeral, and the cache proved with a stopwatch

```console
$ uvx ruff --version          # cold — nothing cached
Downloading ruff (10.1MiB)
 Downloaded ruff
Installed 1 package in 637ms
ruff 0.16.4

real    0m5.792s

$ uvx ruff --version          # again, seconds later
ruff 0.16.4

real    0m0.294s
```

**5.792s → 0.294s. Measured on the machine this course was made on.** This is the honest
speed story and it is far better than quoting "10-100x" from a landing page, because the
viewer watches the same command run twice. Cite it as measured, name the machine, and show
both timings on screen.

Note ruff was never "installed" in any project — no venv was touched, nothing was added to
`pyproject.toml`. The environment lived in the cache and is disposable.

---

## 10 · `uv python list` — the rack of interpreters (real, abridged)

```console
$ uv python list
cpython-3.15.0rc1-windows-x86_64-none                 <download available>
cpython-3.15.0rc1+freethreaded-windows-x86_64-none    <download available>
cpython-3.14.7-windows-x86_64-none                    <download available>
cpython-3.13.15-windows-x86_64-none                   <download available>
cpython-3.12.14-windows-x86_64-none                   <download available>
cpython-3.11.16-windows-x86_64-none                   <download available>
cpython-3.10.21-windows-x86_64-none                   <download available>
cpython-3.10.4-windows-x86_64-none                    C:\…\Python310\python.exe
cpython-3.9.9-windows-x86_64-none                     C:\…\Python39\python.exe
cpython-3.9.7-windows-x86_64-none                     D:\<another-python>\python.exe
cpython-3.8.20-windows-x86_64-none                    <download available>
pypy-3.11.15-windows-x86_64-none                      <download available>
graalpy-3.12.0-windows-x86_64-none                    <download available>
```

Two column-kinds: `<download available>` versus a real path to a Python already on the
machine. Three different Pythons were already installed here (two from python.org, one from a science distribution)
— which is itself the mess the chapter is about. **Scrub any real install path before it
goes on screen**, or replace with a generic one.

## 11 · uv's directories (Windows — differ from the docs' Unix paths)

```console
$ uv cache dir     C:\Users\…\AppData\Local\uv\cache
$ uv tool dir      C:\Users\…\AppData\Roaming\uv\tools
$ uv python dir    C:\Users\…\AppData\Roaming\uv\python
```

Docs give the Unix equivalents (`~/.local/share/uv/tools`, `~/.local/share/uv/python`).
Show both — the audience is on both platforms.

---

## 12 · A lone script that carries its own dependencies (PEP 723)

```console
$ uv init --script demo.py --python 3.12
Downloading cpython-3.12.14-windows-x86_64-none (download) (21.0MiB)
 Downloaded cpython-3.12.14-windows-x86_64-none (download)
Initialized script at `demo.py`
```

**It downloaded an entire Python** because 3.12 was not on this machine. That is the
"Python does not need to be explicitly installed" claim, demonstrated rather than asserted.

`demo.py` as created:

```python
# /// script
# requires-python = ">=3.12"
# dependencies = []
# ///


def main() -> None:
    print("Hello from demo.py!")


if __name__ == "__main__":
    main()
```

```console
$ uv add --script demo.py rich
Resolved 4 packages in 9ms
```

…which rewrites the header in place:

```python
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "rich>=15.0.0",
# ]
# ///
```

Then running a script that imports `rich`, on a machine where `rich` is installed in no
environment at all:

```console
$ uv run demo.py
Installed 4 packages in 798ms
hello from a lone script

real    0m1.824s
```

One file. No project, no venv, no install step. **1.8 seconds from nothing to output.**
This is the strongest single demo in the course and it should not be buried.

---

## 13 · A REAL resolver conflict — uv explaining itself

Forced with `uv add "pytest==9.1.1" "pluggy<1.0"` in a bare project:

```console
  × No solution found when resolving dependencies:
  ╰─▶ Because pytest>=9.1.1 depends on pluggy>=1.5,<2 and your project depends
      on pluggy<1.0, we can conclude that your project and pytest>=9.1.1 are
      incompatible.
      And because your project depends on pytest==9.1.1, we can conclude that
      your project's requirements are unsatisfiable.

hint: If you want to add the package regardless of the failed resolution, provide the `--frozen` flag to skip locking and syncing
```

Exit code 1.

**This is the resolver chapter, handed to us.** uv narrates its own reasoning in ordinary
English — "because … and because … we can conclude". The animation writes itself: two
constraint ranges on one version line that fail to overlap. Use this transcript verbatim;
do not paraphrase it, and do not invent a prettier one.

---

## 14 · `uv build`

```console
$ uv build
Building source distribution...
Building wheel from source distribution...
Successfully built dist\hello_world-0.1.0.tar.gz
Successfully built dist\hello_world-0.1.0-py3-none-any.whl
```

```
dist/
├── .gitignore
├── hello_world-0.1.0-py3-none-any.whl    1614 bytes
└── hello_world-0.1.0.tar.gz               722 bytes
```

Real filenames, real sizes. Note the sdist is built first and the wheel is built **from**
the sdist — the output says so, and that ordering is worth a beat.

---

## Still to capture before those chapters are written

- `uv pip install` / `freeze` / `list` / `tree` output inside a plain `uv venv`
- `uv venv` output itself, and an activation on Windows vs POSIX
- `uv tool install` + `uv tool list` + where the shim lands, and `uv tool update-shell`
- `uv sync --exact` actually REMOVING a package (the destructive-looking one)
- `uv lock --upgrade-package` diffing a version
- `uv publish` — **do not run against real PyPI.** Use `--dry-run` equivalents or TestPyPI,
  and never with a live token (LAW 11).
