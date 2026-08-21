# uv — verified facts, with sources

CLAUDE.md LAW 3: every fact in the course traces to a line here, and every line here
traces to a URL. Nothing from memory. Crawled 2026-08-21.

## Version, as of this crawl

| Fact | Value | Source |
|---|---|---|
| Latest released uv | **0.12.5** | pypi.org/pypi/uv/json → `info.version` |
| Official one-liner | "An extremely fast Python package and project manager, written in Rust." | PyPI `info.summary` + docs home |
| uv itself requires | Python `>=3.8` (to install *via pip*; the standalone installer needs no Python) | PyPI `info.requires_python` |
| Tools it replaces | "pip, pip-tools, pipx, poetry, pyenv, twine, virtualenv, and more" | docs.astral.sh/uv/ |
| Speed claim | "10-100x faster" than pip | docs.astral.sh/uv/ |

⚠ **SPEED NUMBERS ARE A TRAP.** `/reference/benchmarks/` carries **no figures at all** —
only the sentence that uv "is continually benchmarked … and regularly compared to other
tools" plus a pointer to `github.com/astral-sh/uv/blob/main/BENCHMARKS.md`. The ONLY
speed figure available on the docs site is the homepage's "10-100x". Do not state a
seconds-vs-seconds comparison unless it is pulled from BENCHMARKS.md and cited on screen.

⚠ **VERSION TRAP, and it is recent.** `/concepts/projects/init/`:
> "Prior to v0.12, uv did not define a build system for applications by default."

uv 0.12.0 landed **2026-07-28**. Every `uv init` tutorial, blog post and video older than
that shows a *different file tree* than the viewer will get. Worth saying out loud in the
projects chapter — it is exactly the kind of mismatch that makes a beginner think they
broke something.

## Installation — verbatim

| Route | Command |
|---|---|
| macOS/Linux | `curl -LsSf https://astral.sh/uv/install.sh | sh` |
| macOS/Linux (wget) | `wget -qO- https://astral.sh/uv/install.sh | sh` |
| Pinned version | `curl -LsSf https://astral.sh/uv/0.12.5/install.sh | sh` |
| Windows | `powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"` |
| pip | `pip install uv` |
| pipx | `pipx install uv` |
| Homebrew | `brew install uv` |
| MacPorts | `sudo port install uv` |
| WinGet | `winget install --id=astral-sh.uv -e` |
| Scoop | `scoop install main/uv` |
| Cargo | `cargo install --locked uv` |
| Self-update (standalone installs only) | `uv self update` |
| Upgrade if pip-installed | `pip install --upgrade uv` |

Full uninstall of uv's data: `uv cache clean` · `rm -r "$(uv python dir)"` · `rm -r "$(uv tool dir)"`

Source: /getting-started/installation/

## The complete command census

Source: /getting-started/features/ — this is the authoritative grouping.

- **Python versions** — `uv python install` · `list` · `find` · `pin` · `uninstall`
- **Scripts** — `uv run` · `uv add --script` · `uv remove --script`
- **Projects** — `uv init` · `add` · `remove` · `sync` · `lock` · `run` · `tree` · `build` · `publish`
- **Tools** — `uvx` / `uv tool run` · `uv tool install` · `uninstall` · `list` · `update-shell`
- **pip interface** — `uv venv` · `uv pip install|show|freeze|check|list|uninstall|tree` · `uv pip compile|sync`
- **Utility** — `uv cache clean|prune|dir` · `uv tool dir` · `uv python dir` · `uv self update`

## Tools — the ephemeral/persistent split

Source: /concepts/tools/ + /guides/tools/

- A tool is "a Python package that provide[s] command-line interfaces."
- `uvx` is **"exactly equivalent to"** `uv tool run`.
- **Ephemeral** (`uvx ruff`): a temporary venv in the **uv cache directory**, "treated as
  disposable", deleted by `uv cache clean`.
- **Persistent** (`uv tool install ruff`): a venv in the **uv tools directory**,
  `~/.local/share/uv/tools/` on Unix, until explicitly uninstalled.
- Executables are "symlinked into the executable directory on Unix and copied on Windows."
  That directory must be on `PATH` (`uv tool update-shell` fixes it).
- **"installing a tool does not make its modules available in the current environment."**
- **"Tool environments are _not_ intended to be mutated directly."**
- Version syntax differs by command: `uvx ruff@0.3.0`, `uvx ruff@latest`
  vs `uv tool install 'ruff==0.3.0'`, `uv tool install 'ruff>0.2.0,<0.3.0'`
- `--from` when the command name is not the package name: `uvx --from httpie http`
- `--with` for extras: `uvx --with mkdocs-material mkdocs --help`
- Git: `uvx --from git+https://github.com/httpie/cli httpie`
- Upgrade: `uv tool upgrade ruff` · `uv tool upgrade --all`

## Scripts — PEP 723 inline metadata

Source: /guides/scripts/

- Bare run: `uv run example.py` · args pass through · stdin via `uv run -`
- Per-invocation deps: `uv run --with rich example.py` · `uv run --with 'rich>12,<13' example.py`
- Create a script with metadata: `uv init --script example.py --python 3.12`
- Add deps to a script: `uv add --script example.py 'requests<3' 'rich'`
- The block it writes:

```python
# /// script
# dependencies = [
#   "requests<3",
#   "rich",
# ]
# ///
```

- **"the project's dependencies will be ignored"** when inline metadata is present.
- Shebang for a self-running file: `#!/usr/bin/env -S uv run --script`
- Lock a script: `uv lock --script example.py` → an adjacent `.lock` file
- Python pin: `uv run --python 3.10 example.py` or `# requires-python = ">=3.12"`
- Windows `.pyw` runs under `pythonw` automatically.

## Python versions

Source: /concepts/python-versions/ + /guides/install-python/

- "A Python version is composed of a Python interpreter (i.e. the `python` executable),
  the standard library, and other supporting files."
- **Managed** = installed by uv. **System** = everything else, including pyenv and the OS.
- **"Python does not need to be explicitly installed to use uv. By default, uv will
  automatically download Python versions when they are required."**
- Install: `uv python install` · `uv python install 3.12` · `uv python install 3.11 3.12`
  · `uv python install pypy@3.11` · `uv python install --reinstall`
- `--default` (experimental) also puts bare `python`/`python3` on PATH; without it you get
  only versioned executables like `python3.13`.
- Request syntax: `3.12.3`, `3.12`, `>=3.12,<3.13`, `3.13t` (free-threaded),
  `3.12.0d` (debug), `3.13+freethreaded`, `cpython`, `pypy`, `cp`, `pp`,
  `cpython@3.12.3`, `cpython-3.12.3-macos-aarch64-none`, or a path.
- Pin: `uv python pin` writes `.python-version`; `--global` for the user default.
  uv "searches for a `.python-version` file in the working directory and each of its parents."
- Discovery order: managed installs in `UV_PYTHON_INSTALL_DIR` → `PATH` → Windows
  registry / Microsoft Store.
- **"When searching for a system Python version, uv will use the first compatible
  version — not the newest version."**
- `python-preference`: `managed` (default) · `only-managed` · `system` · `only-system`
- Stored at `~/.local/share/uv/python/`; executables to `~/.local/bin`.
  Minor-version dirs are symlinks: `cpython-3.12-macos-aarch64-none` → `cpython-3.12.11-…`
- Builds come from Astral's **`python-build-standalone`**, not python.org.
- Upgrade (preview): `uv python upgrade 3.12` · `uv python upgrade`

## Projects — what `uv init` actually creates

Source: /concepts/projects/init/ + /guides/projects/

**Application** (default, `uv init example-app` or `--app`):

```
example-app/
├── .python-version
├── README.md
├── pyproject.toml
└── src
    └── example_app
        └── __init__.py
```

with, in pyproject.toml:

```toml
[project.scripts]
example-app = "example_app:main"

[build-system]
requires = ["uv_build>=0.12.5,<0.13"]
build-backend = "uv_build"
```

Run it: `uv run example-app`

**Library** (`uv init --lib example-lib`): same, plus `src/example_lib/py.typed`, and NO
`[project.scripts]`. "A library provides functions and objects for other projects to
consume." Libraries always require packaging.

**No build system** (`uv init --no-package example-app`): flat `main.py` at the root, no
`[build-system]`. Run it: `uv run main.py`

**Bare** (`uv init example-bare --bare`): `pyproject.toml` and nothing else — no version
pin, no README, no src dir, no git init.

Other flags: `--build-backend` (hatchling, maturin, scikit-build-core, …), `--python`, `--script`.

Note `uv init hello-world` in /guides/projects/ also shows `.git/` and `.gitignore` — init
initialises version control unless `--bare`.

## Project files

Source: /concepts/projects/layout/

- `pyproject.toml` — "uv requires this file to identify the root directory of a project."
  Minimal form is just `[project] name = "example" version = "0.1.0"`.
- `uv.lock` — "a universal or cross-platform lockfile that captures the packages that
  would be installed across all possible Python markers." Human-readable TOML, **managed
  by uv, not hand-edited**, and **committed to version control**.
- `.venv` — "It is not recommended to include the `.venv` directory in version control;
  it is automatically excluded from `git`" via an internal `.gitignore`.
- `.python-version` — the project's default interpreter request.

## Locking vs syncing

Source: /concepts/projects/sync/

- **Locking** resolves dependencies into the lockfile. **Syncing** installs from it.
- Both happen automatically: `uv run` locks and syncs before executing.
- `--locked` — refuse to update; error if stale.
- `--frozen` — use the lockfile as-is, do not even check.
- `--no-sync` — do not touch the environment.
- Lockfile goes stale when deps are added to pyproject.toml, or constraints exclude the
  locked version. **Loosening a constraint that still admits the locked version does NOT
  invalidate it**, and **uv ignores new releases until you explicitly upgrade.**
- `uv lock` · `uv lock --check` · `uv lock --upgrade` · `uv lock --upgrade-package requests`
- `uv sync` is `--exact` **by default — it REMOVES packages not in the lockfile.**
  `--inexact` keeps them. Also `--no-editable`, `--extra <name>`, `--no-dev`.

## Dependencies

Source: /concepts/projects/dependencies/

Four kinds: `project.dependencies` (published), `project.optional-dependencies` (extras),
`[dependency-groups]` (local dev, PEP 735), `build-system.requires` (build-time).

- `uv add httpx` · `uv add "httpx>=0.20"` · `uv remove httpx`
- `uv add --dev pytest` (shorthand for `--group dev`) → writes `[dependency-groups] dev = [...]`
- `uv add --group lint ruff` · `uv add --optional network httpx`
- `uv add -r requirements.txt`
- Git: `uv add git+https://github.com/encode/httpx --tag 0.27.0` (also `--branch`)
- Path: `uv add ~/projects/bar/` · `uv add --editable ../projects/bar/`
- Index pinning: `uv add torch --index pytorch=https://download.pytorch.org/whl/cpu`
- Markers: `uv add "jax; sys_platform == 'linux'"` · `uv add "numpy; python_version >= '3.11'"`
- Editable installs "add `.pth` files rather than copying source files".
- Specifier forms: `pandas[excel,plot]==2.2`, `foo==2.1.*`, `foo~=1.2` (equivalent to `>=1.2,<2`)

## Resolution

Source: /concepts/resolution/

- "Resolution is the process of taking a list of requirements and converting them to a
  list of package versions that fulfill the requirements."
- Strategies: default **highest**; `--resolution lowest`; `--resolution lowest-direct`.
- **Universal** resolution is the default for *projects* — one lockfile for all platforms,
  "a package may be listed multiple times with different versions or URLs if different
  versions are needed for different platforms — the markers determine which version
  will be used." **Platform-specific** is the default for the *pip interface*.
- Markers: `bar ; python_version < "3.9"`
- **The worked conflict example, straight from the docs** — use this verbatim:
  a project depends on `foo 1.0.0` (needs `lib>=1.0.0`) and `bar 1.0.0` (needs
  `lib>=2.0.0`); the resolver must select **`lib 2.0.0`**.
- Genuine conflicts can be declared via `tool.uv.conflicts`.

## Cache

Source: /concepts/cache/

- Cached by kind: registry deps honour "HTTP caching headers"; direct URLs cache by URL;
  **git deps pin to a specific commit hash**; local deps key off source mtime /
  pyproject.toml; flat indexes are assumed immutable and cached by filename.
- It stores "wheels that it builds from source and the pre-built wheels that it downloads
  directly" — so it skips recompiling C extensions and re-downloading.
- `tool.uv.cache-keys` controls invalidation (file paths, git commit, env vars, dirs).
- `uv cache clean` (everything) · `uv cache clean <pkg>` · `uv cache prune` (unused only)
  · `uv cache prune --ci` (keeps built wheels, drops downloaded ones) · `uv cache dir`
- Location: `--cache-dir` > `UV_CACHE_DIR` > `tool.uv.cache-dir` > `$XDG_CACHE_HOME/uv`
- Buckets are versioned so several uv versions share one cache safely.

## Virtual environments (the pip interface)

Source: /pip/environments/

- "A virtual environment is a lightweight way to isolate packages from a Python
  installation's environment." **uv requires virtual environments by default** (pip does not).
- `uv venv` → `.venv` here. `uv venv my-name` → custom path. `uv venv --python 3.11`, and
  "if unavailable, uv will download Python for you."
- Activation: `source .venv/bin/activate` (bash/zsh/sh) · `.venv\Scripts\activate` (PowerShell)
  · `source .venv/bin/activate.fish` · `source .venv/bin/activate.csh` · `use .venv\Scripts\activate.nu`
  · `deactivate` to leave.
- **Discovery order:** `VIRTUAL_ENV` → `CONDA_PREFIX` → `.venv` in this dir or nearest parent.
  "If no virtual environment is found, uv will prompt the user to create one."

## `uv run`

Source: /concepts/projects/run/

- Runs inside `.venv`, "isolated from your current shell by default", and
  **"uv will ensure that the project environment is up-to-date before running the given command."**
- `uv run python -c "import example"` · `uv run example-cli foo`
- `uv run --with httpx==0.26.0 python -c "..."` — "the requested version will be respected
  regardless of the project's requirements."
- **"Scripts that declare inline metadata are automatically executed in environments
  isolated from the project."**
- Unix: forwards signals except SIGKILL/SIGCHLD/SIGIO/SIGPOLL. Windows: ignores Ctrl-C so
  the child exits cleanly. Finds `.ps1`/`.cmd`/`.bat` scripts without the extension.

## The pip-tools replacement

Source: /pip/compile/ + /pip/packages/

- `uv pip compile pyproject.toml -o requirements.txt` · `uv pip compile requirements.in -o requirements.txt`
- **"by default the `uv pip compile` output is just displayed"** — `-o` is required to write.
- `uv pip sync requirements.txt` — "exactly matches the lockfile", removing extras.
  Also accepts `pylock.toml` (PEP 751).
- vs `uv pip install`: existing packages survive unless they conflict, so undeclared
  dependencies linger. That is the whole difference.
- `--upgrade` / `--upgrade-package ruff` · `--constraint` · `--override` · `--build-constraint`
  · `--extra foo` / `--all-extras` · `--group foo`
- `uv pip install flask` · `"flask[dotenv]"` · `'ruff>=0.2.0'` · `-e .`
  · `-r requirements.txt` · `-r pyproject.toml --all-extras` · `"git+https://github.com/astral-sh/ruff@v0.1.0"`

## Where uv pip is NOT pip — all 18, documented

Source: /pip/compatibility/ — the single richest page for a pip user.

1. Ignores `pip.conf` and `PIP_INDEX_URL` and every other pip-specific config/env var.
2. Pre-releases: default `if-necessary` — stable preferred, pre-release only if every
   stable candidate is rejected.
3. Multiple indexes: iterates **in order and stops at the first match** (pip does not).
4. PEP 517 build isolation is **on by default**.
5. Requires a virtual environment by default; always installs into the active one.
6. **No `--user` flag.**
7. **Enforces `--only-binary` for direct URL dependencies** where pip does not.
8. With `--no-binary`, still reads metadata from pre-built wheels.
9. **Does not compile `.py` into `.pyc` at install time by default.**
10. "uv tends to be stricter than `pip`, and will often reject packages that `pip` would install."
11. No `auto`/`import` for `--keyring-provider`; keyring auth off by default.
12. **No `.egg` distributions.**
13. Constraints are not applied to build deps — use `--build-constraint`.
14. `uv pip compile` prints instead of writing, and strips extras from output.
15. **`requires-python`: lower bounds only — upper bounds ignored entirely.**
16. Different resolver package priorities; more sensitive to user-supplied order.
17. Rejects wheels whose filename disagrees with the metadata inside.
18. Normalises package names to PEP 503 form; pip preserves what you typed.

## Migrating off pip

Source: /guides/migration/pip-to-project/

- `uv init` then `uv add -r requirements.in`
- Preserve pinned versions: `uv add -r requirements.in -c requirements.txt`
- Dev: `uv add --dev -r requirements-dev.in -c requirements-dev.txt`
- If the dev file `-r`-includes the base: `sed '/^-r /d' requirements-dev.in | uv add --dev -r - -c requirements-dev.txt`
- A named group: `uv add -r requirements-docs.in -c requirements-docs.txt --group docs`
- Platform-specific inputs: `uv pip compile requirements.in -o requirements-win.txt --python-platform windows --no-strip-markers`
  then `uv add -r requirements.in -c requirements-win.txt -c requirements-linux.txt`
- The mapping: `requirements.in` → `[project.dependencies]`; `requirements.txt` → `uv.lock`
  (one universal file replacing per-platform ones); manual `source .venv/bin/activate` → `uv run`.

## Config files

Source: /concepts/configuration-files/

- `[tool.uv]` in `pyproject.toml`, or the same keys unprefixed in `uv.toml`.
- **"`uv.toml` files take precedence over `pyproject.toml` files"** in the same directory.
- Searched in the current dir or nearest parent; workspaces start at the workspace root.
- Precedence: CLI args > env vars > project config > user config > system config.
- User: `~/.config/uv/uv.toml` (Unix) · `%APPDATA%\uv\uv.toml` (Windows)
- System: `/etc/uv/uv.toml` · `%PROGRAMDATA%\uv\uv.toml`
- **User- and system-level files cannot use the pyproject.toml format.**

## Build and publish

Source: /guides/package/

- `uv build` → `dist/` with a wheel and an sdist. `uv build --no-sources` is recommended
  before publishing, to prove the package builds without `tool.uv.sources`.
- `uv version 1.0.0` · `uv version 2.0.0 --dry-run` · `uv version --bump minor`
  (major, minor, patch, stable, alpha, beta, rc, post, dev)
- `uv publish` with `--token` / `UV_PUBLISH_TOKEN`, or `--username`/`--password`
  (**PyPI no longer supports password auth**), or Trusted Publishers on GitHub Actions
  with no credentials at all.
- Custom registry via `[[tool.uv.index]]` with `publish-url` and `explicit = true`,
  then `uv publish --index <name>`.
- Verify: `uv run --with <PACKAGE> --no-project -- python -c "import <PACKAGE>"`
  (add `--refresh-package <PACKAGE>` to dodge the cache).

## Open gaps — things I have NOT verified and must not assert

- Any concrete seconds/×-faster figure beyond the homepage's "10-100x". Needs BENCHMARKS.md.
- Whether uv uses hard links or copy-on-write to populate a venv from the cache. The cache
  page does not say it; do not claim it.
- Exact terminal output of `uv add` / `uv sync` (the "Resolved N packages in Xms" lines).
  The docs pages fetched did not reproduce them verbatim. **Capture these by RUNNING uv**
  before any scene shows them — LAW 0m says real data, and inventing a plausible-looking
  terminal transcript is precisely the failure that law exists for.
