# Six standalone videos — "use AI from Python, on your own files"

The correction that produced this file, in the owner's words:

> *"I want a video that would help python users utilize AI with API calling for any sort of
> generic tasks, and I wanna build videos (not chapters that dont sync with other ones,
> individual videos which stand on their own)."*

An earlier plan built a serialised course — "part three of…", "part four is pictures". That
is the wrong shape. **Nobody arrives at video four.** They arrive at whichever one YouTube
put in front of them, and if it opens on "welcome back" they have already lost.

---

## THE LAW OF THIS SET — read before authoring any of them

**Every video is somebody's first.** That single sentence decides everything below.

1. **No numbering, anywhere.** Not in the title, not in the alternates, not in the hook, not
   in the outro, not in the short. A viewer cannot tell what order these were made in and
   must never need to.
2. **No "welcome back", no "in the last video", no "next time".** Cross-references are the
   defect. If a video needs something another video taught, it teaches the two-minute version
   of it itself.
3. **Every video carries THE STARTING LINE.** Ninety seconds, near the front, covering:
   the nine lines that make an API call, and the three doors to a key with what each costs.
   It is short, it is the same shape every time, and it is not optional — it is what makes
   a video standalone rather than an episode with the serial numbers filed off.
4. **Every video ends on the viewer's own file.** "Point this at your own export — a test
   run, a sprint, a supplier list." Never at another video.
5. **One complete, useful thing per video.** A viewer who watches only this one still owns
   something that runs on their machine.

### The three doors, stated the same way every time

| | what it is | card? | data leaves your PC? | cost for this workload |
|---|---|---|---|---|
| **Ollama** | a model on your own laptop | no | **no** | £0 (+ electricity) |
| **Groq / Google AI Studio** | a cloud key, rate-limited not billed | no | yes | £0 inside the limits |
| **OpenAI / Gemini paid** | pay per token | yes | yes | **~£1/month** at 3,000 runs |
| **Azure OpenAI** | the company route, if your employer has it | company pays | stays in the tenancy | — |

Sourced from `docs/03-PROVIDERS-AND-COSTS.md`, checked 2026-09-03. **Put the date on screen
whenever a price is.** The owner films on Azure; a beginner films on Groq or Ollama, and the
video must make that path feel first-class rather than like the discount version.

### The audience, and the thing that keeps it wide

Someone in IT — testing, development, an agile team, business analysis, supply chain,
support. They can open a terminal. They have never called an API. They assume this needs
maths it does not need.

**Nothing in any of these videos may be specific to one job.** The worked files are a made-up
online shop because everyone has ordered something online, and every video says out loud what
the shape maps onto: *words, numbers, pictures — whatever you work on is one of those three.*

---

## THE SIX

Each is complete on its own. The order below is production order, not viewing order.

### 1 · Never paste a spreadsheet into an AI *(built — 50 scenes, 14m50s)*

**Promise** — compute the numbers in Python, let the model do the reading.
**Slug** `point-ai-03-data` · **short** "It blamed the wrong courier. Confidently."

Twenty lines describe a file without a model; the model then reads the description. Carries
three failures that really happened, in order of how much they teach: it wrote "19.4 days"
in its findings and did not list it as unusual; a check caught a sorting bug that hid the
three values that mattered; and it blamed a courier that lost nothing, twice, in the same
even tone it used for the thing it got right.

Ends on: *if a number matters, compute it.*

### 2 · Call an AI from Python in nine lines

**Promise** — an empty folder to a real answer, for free, in twelve minutes.

The one video that is ALL starting line. `uv` (which brings Python with it), a key from one
of the three doors filmed end to end at real speed, the nine lines typed a line at a time,
then three deliberate breaks — 401, 404, no network — because reading those three errors is
what stops people giving up. Closes on `response.usage`: 15 tokens in, 10 out, and what that
costs.

### 3 · Make an AI read a document that's too long for it

**Promise** — cut it up, then ask for a shape instead of a paragraph.

Six support cases you can read; six hundred you cannot. The context window as a desk, not as
maths, with a real too-long error. Splitting, and the question nobody asks — what about a
sentence that falls across the cut? Then the turn: get a beautiful paragraph back, try to use
it in code, fail, and ask for JSON instead. `json.loads` it and index into it.

Ends on a command you can run on your own folder.

### 4 · Make an AI read your screenshots

**Promise** — a picture is just a very long string.

The screenshot nobody can copy-paste out of. Base64 shown as literal characters scrolling
past, because the mystery evaporates when you watch a PNG become text. Twelve extra lines,
and it transcribes an error code off pixels. What a picture costs, and the `detail: "low"`
lever. Then where eyes fail: downscale until it breaks, and watch it be confidently wrong.
Closes on doing it offline, and the one gotcha — local models take base64 only, never a URL.

### 5 · Give an AI memory, and let it run your code

**Promise** — memory is a list, tools are a loop, neither is magic.

Prove it has no memory, then append the turns and resend the list: fifteen lines, and the
deflation IS the lesson. Watch the transcript grow and then window it. Then: it has no hands
either — ask how many rows are in a CSV and it guesses, confidently, wrong. The tool schema
beside the Python function it describes. The loop, drawn once. Then live: it asks for the
call, you run it, it answers with the true number. Ends on never giving it a knife —
read-only tools, an allow-list, said plainly and without fear-mongering.

### 6 · Put a web page on it, and never get locked in

**Promise** — swap providers in three lines.

Forty lines of Streamlit, and the realisation that nothing new happened: every button calls a
function that already existed. Then the switch — three lines in `.env`, a different company's
model, no code touched. Then the one that matters to anyone who cannot send work data to a
cloud: point it at a model on the laptop, turn off the network, watch it still work.

Closes on a public dated fact: the OpenAI Assistants API was switched off on 26 August 2026
and the 404 is reproducible by anyone watching. *Build on the thing that has the most exits.*

---

## Production notes

- **Design** moderndark throughout · **voice** `en-US-AvaMultilingualNeural` · both formats.
- **Footage** is recorded on the operator's own machine via `demos/*.json` and read-back
  verified. Cast a clip by watching its last frame, never by its label — `check-recordings
  --slug` prints `your label -> the screen's own words` before anything renders.
- **Truth** — every figure comes from `ai-analyst-tutorial/docs/01…04`. If a beat needs a
  number those files do not have, the beat is flagged and asked about. Two such cases are
  already recorded in `briefs/pointai/build_ep03.mjs`; read them before authoring the rest.
- **Never narrate that the footage is genuine** (LAW 0f). The terminal is on screen; that is
  the argument.
- **The operator's key** lives in `ai-analyst-tutorial/.env`, gitignored, pointing at an Azure
  `gpt-4o` deployment that was verified working on 2026-09-03. It never appears on screen, in
  a spec, in a brief, or in a commit.
