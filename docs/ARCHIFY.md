# ARCHIFY IN IAUTEUR — read this before explaining any flow, pipeline or architecture

Owner, 2026-09-25: *"For us to explain any flow it is taking or consuming lot of tokens to design a
component, animate it then sync with voice overs. Some complex architectures are not properly
explained by us in our videos... I want you to go through the repo, understand what all features are
available thoroughly and make sure that from next video onwards, Archify is used to the best."*

**The bargain.** Building a purpose-made Remotion component for one flow costs an authoring pass, an
animation pass and a sync pass, and it only ever draws that one flow. Archify turns a typed JSON file
into a checked, interactive HTML map that we then RECORD like any other surface. The picture is
free; our budget goes back into the explanation.

**What it does not replace.** Archify draws systems: components, calls, states, movement. It does not
draw an idea, a trade-off, a budget or a count. `MCP_REACH`, `green-wall`, `CLAIM_CHECK` and the rest
stay. LAW 0j still applies — the thing being taught must be the thing that moves.

---

## 1. Five diagram types. Pick by the question the beat answers.

| type | answers | reach for it when the voice says |
|---|---|---|
| **architecture** | what the parts are and how they connect | "here's what the system is made of" |
| **workflow** | who does what, in order, with branches | "the CI pipeline", "the approval path", "the agent's loop" |
| **sequence** | one interaction over time, with returns | "the request goes here, then here, and comes back" |
| **dataflow** | where data moves, and across which boundaries | "the pipeline", "what leaves your machine", "PII" |
| **lifecycle** | states, waits, retries, terminal outcomes | "it retries three times, then gives up" |

Not sure: `node archify/bin/archify.mjs guide "<the sentence the beat says>"` answers it, offline.

`architecture` additionally has a **delta** mode — Before / Delta / After with a machine receipt —
which is the honest way to show "what this PR changes" without us asserting impact.

## 2. The production path

```bash
archify validate <type> <source.json>            # fails closed; run BEFORE rendering
archify render   <type> <source.json> out.html   # one standalone HTML file, no deps
archify check    out.html                        # the artifact checks itself
```

Put the source in `briefs/<topic>/archify/<name>.<type>.json` (tracked, reviewable) and the rendered
artifact in `public/assets/archify/<name>.<type>.html`. The artifact is the thing we film.

**LAW 0m applies unchanged.** The map must describe the real system. For a repository, let the agent
read the repo and author the source from what is actually there; do not invent nodes to make a
prettier picture.

## 3. What the viewer can actually do — this is the part worth knowing

The artifact publishes a global `Archify` object. Every one of these is drivable from the recorder,
and every one of them is a thing we currently pay a component to do badly.

| capability | API | what it buys a beat |
|---|---|---|
| **authored chapters** | `guidedViews.activate(id)` · `.play()` · `.pause()` · `.beat()` | the flow, walked one step at a time, in an order the author chose |
| **hold the animation** | `motionGovernor.pause()` / `.resume()` / `.setMode()` | **the single most important one — see §4** |
| **light one thing** | `focus.set(id)` · `focus.setMany([...])` · `focus.clear()` | "this component here" |
| **reachability** | `focus.reach('downstream'\|'upstream')` · `focus.reachabilitySnapshot()` | "everything this can touch" — the blast radius, drawn |
| **a directed path** | `routeProbe` (+ `#route=a~b`) | "the request takes this exact route" |
| **type lens** | `semanticLens` (+ `#lens=backend~database`) | "just the databases", "just the services" |
| **hover preview** | `intentTrace.show(id)` · `.clear()` | what a reader would see pointing at a node, without a mouse |
| **camera** | `view.reveal(id)` · `.centerAt()` · `.zoomIn/Out()` · `.reset()` | move like a reader, then pull back |
| **overview map** | `radar.open()` / `.close()` | orientation on a large system |
| **search** | `finder` | "find the thing called X" |
| **relationships** | `focus.inspectRelationship()` | why two nodes are joined |
| **share cards** | `exportMenu.shareCard()` · `downloadRouteShareCard()` | a still for the thumbnail, from the real map |

Deep links do the same thing declaratively, which is the cheapest way to open on a state:
`?theme=dark&present=1&play=1#view=happy-path` · `#route=web~db` · `#lens=backend~database` ·
`#focus=router&reach=downstream`

`present=1` hides the authoring chrome. Always use it — we are filming the map, not the toolbar.

## 4. THE SYNC RULE — why this is safe to use at all

An Archify story animates on **its own clock**. Dropped in naively that is LAW 0i's defect in a new
costume: the picture completes while the voice is still on beat one.

**So we never let it run free.** The first step of every Archify take is:

```json
{"action": "archify", "call": "motionGovernor.pause", "expectState": {"paused": "true"}}
```

Then each subsequent state change is its own recorded step, and each step becomes a clip anchored to
the word that names it — exactly like a terminal command. The viewer's motion is ours to spend, one
beat per sentence. `guidedViews.beat()` steps an authored chapter without playing it.

Use `.play()` **only** for a short, deliberate "watch it run" moment with narration written to outlast
it, and film it as one clip — never as the backdrop to an explanation.

## 5. Recording it — `surface: "browser"`, `action: "archify"`

An artifact is one HTML file, so the browser surface already carries it. What is new is the action:

```json
{"id": "reach", "action": "archify",
 "call": "focus.set", "args": ["api"],
 "expectState": {"focus": "api"},
 "label": "everything the API touches",
 "settleMs": 900}
```

- **`call` + `args`** — any method on the global, so the recorder does not go stale when Archify adds
  features. `scripts/lib/record/browser.mjs` resolves the dotted path and applies it.
- **`expectState`** — the take FAILS unless the viewer's own state says the thing happened. Pressing a
  control is not evidence; the state afterwards is (owner, 2026-09-12 and again 2026-09-16, both paid
  for with lost takes).
- Every step is read-back verified: the manifest stores `{chapter, beat, playing, focus, route, paused}`
  after each call, so a spec can never claim a state the artifact was not in.

**Drive the API, never the chrome.** Clicking cost two takes on the Archify cut: a control moved, a
text needle matched six times, and the camera framed a summary card instead of the node the product
had actually lit. The API is the product's own contract and it reads back.

`docs/SCREEN_RECORDING.md` still governs resolution: `masterWidth: 3840`, zooms ≤ 2x.

## 6. Casting — Archify or a component?

Ask what the viewer should SEE:

- **a system, a route, a pipeline, a state machine, a blast radius** → Archify. It will be better than
  anything we would build in a day, and it is checked.
- **an idea, a comparison, a count, a budget, a claim, a rule being tested** → build the component.
  Archify has no opinion about arguments.
- **a repository's real structure** → Archify, sourced from the repo, with the source JSON committed
  so the map is reviewable.

An Archify beat still counts as RECORDED_STEP against the over-reliance cap, because it IS footage.
That is correct: it keeps drawn teaching in the cut alongside it.

## 7. Paid-for gotchas

- **`present=1` or the toolbar is in your frame.**
- **A node id is not a label.** `focus.set` takes the id from the source JSON (`api`, `db`), not the
  display name. Probe the artifact for ids before authoring the demo.
- **An ambiguous search focuses the wrong thing.** Use ids and `expectState`, not text.
- **A long chapter needs narration that outlasts it**, same arithmetic as any clip (`anchor-spec`
  enforces it).
- **The artifact is generated.** Commit the SOURCE json; regenerate the HTML. A hand-edited artifact
  is a fact nobody can check.

## 8. Proving the sync — the gate no other check covers

Owner, 2026-09-25: *"we need to be double sure that the voice over syncs perfectly with the archify
chart display."*

**The specific risk, and it is not the obvious one.** A recorded clip plays at capture speed and then
HOLDS ITS LAST FRAME for the rest of the narration. On a terminal that is exactly right — the last
frame is the finished output. On an Archify artifact it is a trap: `focus.set`, `view.reveal` and a
chapter beat each start a transition, and a segment cut while that transition is still moving leaves
the viewer staring at a diagram **caught mid-slide** for ten seconds while the voice explains the
finished state.

Every existing gate stays green through that: the API returned success, `expectState` read back
correctly, `anchor-spec` fitted the clip, `audit-sync` put it on its word. None of them looks at
pixels.

    node scripts/check-archify-settle.mjs <spec.json> [--tail 0.5] [--max 0.35]

It measures the maximum frame-to-frame luma difference over the last half second of every Archify
clip. Measured on real takes: **a settled clip reads 7e-4; the same clip measured across its camera
move reads 9.1** — four orders of magnitude apart, with the threshold sitting between them. It runs
inside `preflight.mjs` (before you pay for a voice) and again in `render-topic.mjs`.

**When it fires, raise the step's `settleMs` and re-record.** Never shorten the narration to fit a
short clip — the hold is where the explanation lives.

### The three layers that together make the sync safe

1. **`motionGovernor.pause()` first** — the story stops running on its own clock, so nothing moves
   that we did not ask for (§4).
2. **One state change per step** — each becomes its own clip with its own anchor, so `anchor-spec`
   and `audit-sync` treat it exactly like a typed command, and the picture changes on the word.
3. **`check-archify-settle`** — the held frame is the settled diagram, measured, not assumed.

### API signatures bite

`view.reveal` takes an **array** of ids, not a single id: `args: [["worker", "users", "db"]]`. The
`archify` action surfaces the real error (`(ids || []).forEach is not a function`) and refuses the
take rather than recording a move that never happened — but check a signature before you script it.
