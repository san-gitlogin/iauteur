# VS Code shortcuts — the course

## The one thing that makes this different

Every "top 20 VS Code shortcuts" video is a person reading a list off the same printed card. This
one is built from `VERIFIED.md`: **103 chords that were pressed, on this machine, against a real
workbench, and observed to do the specific thing they claim to do.** Six of the card's chords are
not bound in this build at all, and the video says so — with the reason.

That is the promise in the title, and LAW 0g says the first five seconds have to pay it.

## The spine

| Act | Promise | Ends on |
|---|---|---|
| I | The five you'll use every hour, and why the palette is not one of them | the terminal answering |
| II | Editing at the speed of thinking | a line duplicated, deleted and moved without the mouse |
| III | Moving through a project you didn't write | zen mode, then the shortcut list itself |
| IV | The ones the browser steals | the four that cannot work in VS Code for the Web |

## LAW 0g — the first thirty seconds

1. **Confirm the click (0–5s).** The title says shortcuts that actually work. The first sentence is
   about a shortcut that does not. No welcome, no channel name.
2. **Promise the payoff (5–15s).** "A hundred and three of them, pressed one at a time on this
   machine, and I'll show you the six that lie to you."
3. **Open the loop (15–30s).** Which six? Named in Act IV, not before.

## What each act shows

### ACT I — every hour
`demos/vscode-keys-act1.json` · Ctrl+Shift+P, Ctrl+P, Ctrl+B, Ctrl+F, Ctrl+Shift+F, Ctrl+`, then a
real `node app.js`. The teaching point is not the list, it is that **Quick Open beats the palette**
for anything you can name — the palette is the fallback for the thing you cannot.

### ACT II — editing
`demos/vscode-keys-act2.json` · Ctrl+/, Shift+Alt+Down, Ctrl+Shift+K, Alt+Down, Ctrl+Alt+Down,
Ctrl+U, Ctrl+L, and folding. The point: **every one of these replaces a mouse round-trip**, and the
line-editing four are the ones that pay for themselves within a day.

### ACT III — navigating
`demos/vscode-keys-act3.json` · Ctrl+Shift+O, Ctrl+G, Ctrl+\, Ctrl+1, Ctrl+W, Ctrl+Shift+T,
Ctrl+K Z, Ctrl+K Ctrl+S. The point: **Ctrl+Shift+T is the one nobody knows** — closing an editor is
not destructive if you can undo it.

### ACT IV — what the browser steals
No recording; a component. Ctrl+Shift+W closes the browser window. Ctrl+= and Ctrl+- are browser
zoom. Ctrl+K R wants an OS file manager a web page cannot reach. This is the act that makes the
video honest, and it is the one no other video has, because it needs the measurement to exist.

## The rule this course is bound by

**Nothing may be taught that was not verified.** `briefs/vscode-shortcuts/VERIFIED.md` is generated
from `verified.json`, which is written by a run that pressed every chord. If a beat wants to show a
shortcut, the shortcut has to be in there with a `yes`. The nine unverified rows each carry a
measured reason and may be MENTIONED — F5 needs a debug extension, F8 needs a diagnostic in the
file, F11 is refused a synthetic keypress by the browser — but never demonstrated.

That is LAW 0m and LAW 3 doing the same job from two directions: capture the artefact by running the
tool, and never state a fact you have not sourced.

## Runtime budget

LAW 0e rule 6a — budget SCENES, not words per scene. A long cut lands ≥5:00. Four acts, each with
two or three recorded beats plus a component and a quiz, comes to roughly 30 scenes and 8–10
minutes. The recorded scenes earn their runtime from marks; the components earn theirs from
anchors.

## Component budget

LAW 0n corollary — plan PICTURES, not scene types. Two new pictures, both of which the course
genuinely cannot teach without:

1. **`KEY_CHORD`** — a chord as an OBJECT: the keys pressed in order, held, released, and the
   command that fired. A two-key chord like Ctrl+K Ctrl+S is a sequence, not a label, and every
   existing component would render it as text.
2. **`BROWSER_STEALS`** — the browser and the editor reaching for the same key, and the browser
   getting there first. This is the Act IV payoff and there is nothing in the library that depicts
   a contest over one input.

Everything else is `RECORDED_STEP` over real footage, which is the whole point.
