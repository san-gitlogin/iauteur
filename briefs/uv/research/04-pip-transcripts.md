# pip — real captured transcripts (the "before" world, for chapter 00)

Chapter 00 is set **before uv exists**, so it must show pip. Captured by running pip in a
throwaway venv (system CPython 3.10.4, pip 22.0.4, `NO_COLOR=1`). Nothing invented.
Sandbox paths shortened. LAW 0m, LAW 3.

---

## 1 · `pip install rich` — and the constraints are VISIBLE

```console
$ pip install rich
Collecting rich
  Downloading rich-15.0.0-py3-none-any.whl (310 kB)
Collecting markdown-it-py>=2.2.0
  Downloading markdown_it_py-4.2.0-py3-none-any.whl (91 kB)
Collecting pygments<3.0.0,>=2.13.0
  Downloading pygments-2.21.0-py3-none-any.whl (1.3 MB)
Collecting mdurl~=0.1
  Downloading mdurl-0.1.2-py3-none-any.whl (10.0 kB)
Installing collected packages: pygments, mdurl, markdown-it-py, rich
Successfully installed markdown-it-py-4.2.0 mdurl-0.1.2 pygments-2.21.0 rich-15.0.0
```

**Better teaching material than uv's equivalent, for this chapter.** uv prints a clean list
of five `+` lines; pip prints **the constraint that dragged each extra package in**:

- `markdown-it-py>=2.2.0` — rich asked for this
- `pygments<3.0.0,>=2.13.0` — rich asked for this too
- `mdurl~=0.1` — **markdown-it-py** asked for this, not rich. Two levels deep.

So the *reasons* are on screen, not just the results. Use pip's output for the beat that
teaches what a dependency is.

Second detail worth a beat: `Installing collected packages: pygments, mdurl, markdown-it-py, rich`
installs in **dependency order — leaves first, the thing you asked for last.** It builds
the floor before the thing standing on it.

---

## 2 · `pip list` — the shelf, listed

```console
$ pip list
Package        Version
-------------- -------
markdown-it-py 4.2.0
mdurl          0.1.2
pip            22.0.4
Pygments       2.21.0
rich           15.0.0
setuptools     58.1.0
```

You asked for one package. Six things live here.

---

## 3 · THE COLLISION — pip breaking rich and reporting success

Forced by installing a pygments older than rich's floor:

```console
$ pip install "pygments==2.0.0"
Collecting pygments==2.0.0
  Downloading Pygments-2.0-py3-none-any.whl (672 kB)
Installing collected packages: pygments
  Attempting uninstall: pygments
    Found existing installation: Pygments 2.21.0
    Uninstalling Pygments-2.21.0:
      Successfully uninstalled Pygments-2.21.0
ERROR: pip's dependency resolver does not currently take into account all the packages that are installed. This behaviour is the source of the following dependency conflicts.
rich 15.0.0 requires pygments<3.0.0,>=2.13.0, but you have pygments 2.0 which is incompatible.
Successfully installed pygments-2.0
```

**This single transcript is the spine of chapter 00.** Two things in it, both devastating
and both real:

1. **pip narrates the overwrite itself** — *Attempting uninstall → Found existing →
   Uninstalling → Successfully uninstalled*. That IS the shelf collision, in the tool's own
   words. One slot, one version, and the newcomer evicts the incumbent. Nobody touched
   `rich`; `rich` just quietly lost a dependency it needs.
2. **It says `ERROR`, then says `Successfully installed`.** It broke rich and reported
   success in the same breath. Put those two lines on screen together and say nothing for
   two seconds.

---

## 4 · …and nothing crashes. THIS is the real lesson.

```console
$ python -c "from rich import print; print('[bold]hello[/bold]')"
hello
```

```console
$ python -c "from rich.console import Console; from rich.syntax import Syntax; Console().print(Syntax('print(1+1)','python'))"
print(1+1)
```

**Both still worked.** rich degraded quietly instead of failing.

⚠ **Do not fake a crash here.** The truthful version is stronger: the environment is now
*silently inconsistent*. There is no traceback, no red text, no moment of discovery — it
just sits there being wrong until some other code path, on some other day, trips over it.
That is precisely why this costs beginners an afternoon: there is nothing to trace back to
the thing that caused it, because the thing that caused it said "Successfully installed".

The readout that would have told you, which nobody runs:

```console
$ pip check
rich 15.0.0 has requirement pygments<3.0.0,>=2.13.0, but you have pygments 2.0.
```

---

## 5 · `ModuleNotFoundError` — the beginner's daily error

```console
$ python -c "import requests"
Traceback (most recent call last):
  File "<string>", line 1, in <module>
ModuleNotFoundError: No module named 'requests'
```

The other half of the pain, and the more familiar half: *"but I installed it!"* — installed
into a different environment than the one now running. Chapter 08 pays this off; chapter 00
only needs the viewer to recognise the feeling.

---

## Two failure modes, and chapter 00 needs both

| What the viewer sees | What is actually wrong |
|---|---|
| `ModuleNotFoundError: No module named 'x'` | the package is real, but it is on a **different shelf** than the one running |
| nothing — it just behaves oddly, later | two packages needed **different versions of one thing**, and the last install won |

The first is loud and instantly recognisable. The second is silent and expensive. Open the
chapter on the loud one, because every beginner has felt it; spend the chapter on the
quiet one, because that is the one they cannot diagnose.
