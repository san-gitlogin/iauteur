#!/usr/bin/env python3
"""Build topics/airllm-on-my-mac/long.json.

PHRASE ANCHORS, NOT NUMBERS. Every `atWord` is written as the exact phrase from that scene's
narration that the element lands on, and resolved here. Rewrite a sentence and the anchor moves
with it; a numeric index would silently point at a different word (paid for on the HID-Fi cut).

EVERY FIGURE COMES FROM briefs/airllm/FACTS.md, section "THE NUMBERS THAT SHIP", which was read
off the recorded frames. Nothing here is estimated.
"""
import json, re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "topics" / "airllm-on-my-mac" / "long.json"

_WORD = re.compile(r"\S+")


def w(narration: str, phrase: str) -> int:
    """1-based index of the word that begins `phrase` inside `narration`."""
    hay = narration.lower()
    needle = phrase.lower()
    at = hay.find(needle)
    if at < 0:
        raise SystemExit(f"ANCHOR NOT FOUND: {phrase!r}\n  in: {narration[:160]!r}")
    return len(_WORD.findall(narration[:at])) + 1


# A RENDER OWNS THE WHOLE TOPIC, INCLUDING THE SPEC YOU ARE NOT RENDERING (2026-09-26).
# bake-rec / anchor-spec / sync all refuse while `topics/<slug>/.rendering` exists, but a BUILDER
# writes the spec directly and bypassed that. Re-running this script mid-render left shorts.json
# unsynced, and Remotion evaluates EVERY composition in the bundle — so a NaN durationInFrames on
# the shorts composition killed the LONG render three segments in. Builders refuse too, now.
_lock = ROOT / "topics" / "airllm-on-my-mac" / ".rendering"
_busy = subprocess.run(["pgrep", "-f", "remotion-cli.js render|render-long.mjs"],
                       capture_output=True, text=True).stdout.strip()
if _lock.exists() or _busy:
    raise SystemExit(
        "REFUSING: a render is in flight"
        + (f" (lock {_lock})" if _lock.exists() else f" (pid {_busy.splitlines()[0]})") + ".\n"
        "  Rewriting a spec mid-render breaks the bundle for EVERY composition in it, not just\n"
        "  this one, and resets timingSource to estimated so the finished cut desyncs.\n"
        "  Wait for the render, or stop it, then run this again."
    )

SCENES = []


def scene(id_, type_, narration, data, transition="fade", background="zoneA"):
    SCENES.append({
        "id": id_, "type": type_, "transition": transition, "background": background,
        "narration": " ".join(narration.split()), "data": data,
    })


def clips(*specs):
    """specs: (ref, label, anchor_word, zooms).

    THE LAST CLIP OF A BEAT TAKES NO CAMERA MOVES. `anchor-spec` counts every zoom as a callout
    that must land after its clip's footage and before 80% of the read, so a move on the final
    clip is paid for with words AFTER the footage ends. On the 57-second split take that bill is
    ~295 words, which is past the scene ceiling. Zooms live on clips that have another clip after
    them; the final clip is framed by `focus` alone.
    """
    out = []
    for i, (ref, label, anchor, zooms) in enumerate(specs):
        c = {"ref": ref, "label": label, "focus": True, "wantAtWord": anchor}
        if zooms and i < len(specs) - 1:
            c["zooms"] = zooms
        out.append(c)
    return {"recordedStep": {"clips": out}}


def stage(kind, items, headline=None, stage_title=None, color="blue"):
    d = {"kind": kind, "stage": items, "color": color}
    if headline:
        d["headline"] = headline
    if stage_title:
        d["stageTitle"] = stage_title
    return {"airllmStage": d}


# ─────────────────────────────────────────────────────────────── ACT 1 — what this is

# HOOK is hard-capped at 8s, which is ~17 words. Keep it there or normalize truncates the beat.
n = ("I ran a model twice the size of my laptop's memory, using AirLLM. Here's what that cost.")
scene("s01", "HOOK", n, {
    "headline": "[Too big for my laptop]",
    "subtext": "AirLLM, on an 18 GB MacBook",
    "heroAsset": "img:airllm_logo.png",
    "hookVariant": "reveal",
    "atWord": w(n, "twice the size"),
})

n = ("Welcome to THE NBX STUDIO. Today we're going to install AirLLM on a Mac, hand AirLLM a chat model far too big for the memory in this machine, and watch the model answer anyway. "
     "Then I'll show you the bill, because there absolutely is one, and almost nobody mentions it.")
scene("s02", "TITLE_CARD", n, {
    "title": "A model bigger than your memory",
    "subtitle": "AirLLM, installed and measured on an 18 GB Mac",
    "atWord": w(n, "install AirLLM"),
})

n = ("So what is AirLLM? This is its page on GitHub, and the one-line description does not mess "
     "about: AirLLM, seventy billion parameter inference, with a single four gigabyte GPU. "
     "The library is written by Gavin Li, AirLLM has been going since twenty twenty-three, and the "
     "numbers down the side tell you people actually use the library — nearly thirty-five thousand stars, two hundred "
     "and ninety-five people watching it, three and a half thousand forks. The licence is "
     "Apache two point zero, which in plain English means you can use the code, change the code and ship it commercially, as long as you keep the notice.")
scene("s03", "RECORDED_STEP", n, clips(
    ("rec:airllm-gh#about", "its page on GitHub", w(n, "This is its page"),
     [{"marks": ["what"], "band": True, "wantAtWord": w(n, "seventy billion parameter")}]),
    ("rec:airllm-gh#trust", "who made it, who uses it", w(n, "written by Gavin Li"),
     [{"marks": ["counts"], "wantAtWord": w(n, "nearly thirty-five thousand")},
      {"at": "full", "wantAtWord": w(n, "The licence is")}]),
), transition="letterbox", background="zoneB")
SCENES[-1]["data"]["recordedStep"]["sourceNote"] = "github.com/lyogavin/airllm · Apache-2.0"

n = ("Here's where we end up, so you know whether the next ten minutes are worth it. The model "
     "on disk is sixteen gigabytes. While it was answering, the most memory this Mac ever gave "
     "it was three point one nine gigabytes. That gap is the whole trick, and we're going to "
     "take it apart.")
scene("s04", "AIRLLM_STAGE", n, stage(
    "ceiling",
    [{"group": "file", "label": "the model on disk", "sub": "16.06 GB", "value": 16.06,
      "atWord": w(n, "sixteen gigabytes")},
     {"group": "file", "label": "what it actually held", "sub": "3.19 GB", "value": 3.19,
      "atWord": w(n, "three point one nine")},
     {"group": "peak", "label": "measured while it answered",
      "atWord": w(n, "That gap")}],
    stage_title="what we end up with"), transition="iris")

n = ("The README makes the claim in one sentence. Quote: AirLLM dramatically reduces inference memory usage, letting seventy billion parameter models run on a single four gigabyte card — "
     "without quantisation, distillation or pruning. Those three words matter, so let me "
     "translate them. Quantisation means storing each weight in fewer bits, which shrinks the "
     "model and costs you a little accuracy. Distillation means training a smaller model to "
     "imitate a big one. Pruning means deleting the parts that matter least. And AirLLM says the library is doing none of those, which means the model stays exactly as Meta shipped the weights. And scroll down and they'll show "
     "you the table everybody screenshots — a seventy billion parameter Llama in full precision, "
     "running in about four gigabytes.")
scene("s05", "RECORDED_STEP", n, clips(
    ("rec:airllm-gh#claim", "the claim, their words", w(n, "The README makes"),
     [{"marks": ["lead"], "band": True, "wantAtWord": w(n, "dramatically reduces")}]),
    ("rec:airllm-gh#trick", "how they say it works", w(n, "AirLLM says the library"), []),
    ("rec:airllm-gh#table", "the table everyone saves", w(n, "the table everybody"),
     [{"marks": ["row"], "band": True, "wantAtWord": w(n, "in full precision")}]),
), transition="letterbox", background="zoneB")
SCENES[-1]["data"]["recordedStep"]["sourceNote"] = "github.com/lyogavin/airllm · README"

n = ("To see why that's surprising, you need to know what normally stops you. A model is a pile "
     "of numbers called weights, and to run it, the usual approach loads all of them into memory "
     "at once. So the wall isn't how clever your laptop is — the wall is a width, and nothing else. Seventy billion "
     "weights at two bytes each is a hundred and forty one gigabytes, and if your machine holds "
     "eighteen, the thing simply never starts. No error you can fix, no setting to turn down. "
     "It just will not go.")
scene("s06", "AIRLLM_STAGE", n, stage(
    "wall",
    [{"group": "door", "label": "the memory you have", "sub": "18 GB", "value": 18,
      "atWord": w(n, "if your machine holds")},
     {"group": "slab", "label": "Llama 3, 70 billion weights", "sub": "141 GB", "value": 141,
      "atWord": w(n, "a hundred and forty one")},
     {"group": "verdict", "label": "it never even starts",
      "atWord": w(n, "the thing simply never starts")}],
    stage_title="the wall everybody hits", color="red"), transition="push")

# ─────────────────────────────────────────────────────────── ACT 2 — how it can work

scene("s07", "CHAPTER",
      "Right. So how can a sixteen gigabyte model possibly run in three? Let's look at the shape "
      "of a model, because the answer is hiding in it.",
      {"chapter": {"number": "01", "title": "Where the trick lives",
                   "subtitle": "a model is not one lump"}}, transition="wipe")

n = ("Here's the thing that makes it possible. A large language model isn't one enormous block. "
     "A model is a stack of layers, and those layers are near enough identical — same shape, same size, "
     "one after another. The model we're using has thirty-two of them. Each one is about four "
     "hundred and thirty-six megabytes. And crucially, a layer only ever needs the output of the "
     "layer below it, which means you never actually need two of them in memory at the same time. "
     "One in, one out. That is the entire idea.")
scene("s08", "AIRLLM_STAGE", n, stage(
    "floors",
    [{"group": "tower", "label": "32 layers", "sub": "near enough identical",
      "value": 32, "atWord": w(n, "stack of layers")},
     {"group": "note", "label": "0.44 GB each", "atWord": w(n, "four hundred and thirty-six")},
     {"group": "lift", "label": "read it, run it, drop it", "sub": "one at a time",
      "atWord": w(n, "never actually need two")},
     {"group": "peak", "label": "one layer resident", "atWord": w(n, "never actually need two")}],
    stage_title="a model is a stack"), transition="slide")

n = ("A layer is not mysterious either, because each one only does two jobs. Attention, which means every word gets to look at the other words and decide which ones matter. Then a feed-forward network, meaning a small dense calculation applied to each position on its own. Attention, then "
     "arithmetic, thirty-two times over. That's the model.")
scene("s09", "TRANSFORMER_BLOCK", n, {"transformer": {
    "headline": "What one layer does",
    "blocks": [{"label": "From the layer below", "kind": "io"},
               {"label": "Attention", "kind": "attn"},
               {"label": "Feed-forward", "kind": "ffn"},
               {"label": "On to the next layer", "kind": "io"}],
    "repeatFrom": 1, "repeatTo": 2, "repeatLabel": "× 32",
    "atWord": w(n, "Attention, which means")}}, transition="iris")

n = ("Rather than describe the loop, here it is drawn. I've held the animation still so nothing "
     "moves unless I ask it to. Read it left to right: the word table gets read off the drive, "
     "then layer N, then the layer runs, then it's deleted, and eventually one word comes out "
     "the far end. Underneath is the bit that matters — what's in memory while all that is "
     "happening.")
scene("s10", "RECORDED_STEP", n, clips(
    ("rec:airllm-map#hold", "the map, held still", w(n, "held the animation still"), []),
    ("rec:airllm-map#frame", "the whole loop", w(n, "Read it left to right"), []),
    ("rec:airllm-map#layer", "read, run, delete", w(n, "then the layer runs"), []),
), transition="letterbox", background="zoneB")
SCENES[-1]["data"]["recordedStep"]["sourceNote"] = "diagram generated with Archify - tt-a1i/archify"

n = ("Now look at what sets the memory ceiling, because this surprised me. The ceiling isn't a layer. The biggest "
     "single file AirLLM ever opens is the word table — the lookup that turns token numbers into "
     "vectors — and on this model that's one and five hundredths of a gigabyte, more than twice "
     "the size of a layer. So the memory you need isn't the total — the memory you need is the largest single piece. "
     "And then the sting: nothing is kept between words. For the next word, the whole sixteen "
     "gigabytes gets read again.")
scene("s11", "RECORDED_STEP", n, clips(
    ("rec:airllm-map#ceiling", "what sets the ceiling", w(n, "The ceiling isn't a layer"), []),
    ("rec:airllm-map#cost", "again for the next word", w(n, "nothing is kept between"), []),
), transition="letterbox", background="zoneB")
SCENES[-1]["data"]["recordedStep"]["sourceNote"] = "diagram generated with Archify - tt-a1i/archify"

n = ("One thing I should pin down, because every number from here on hangs off it. A model doesn't "
     "deal in words, it deals in tokens - short chunks of text, roughly three quarters of a word "
     "on average. Paris is one token. A longer or rarer word might be two or three. So when I say "
     "the model reads the whole thing again for every word, what I really mean is for every "
     "token, and a sentence is more tokens than it looks.")
scene("s12", "TOKENIZER", n, {"tokenizer": {
    "headline": "A model counts in tokens",
    "text": "The capital of France is Paris.",
    "tokens": [{"text": "The", "id": 791}, {"text": " capital", "id": 6864, "color": "blue"},
               {"text": " of", "id": 315}, {"text": " France", "id": 9822},
               {"text": " is", "id": 374}, {"text": " Paris", "id": 12366, "color": "green"},
               {"text": ".", "id": 13}],
    "atWord": w(n, "it deals in tokens")}}, transition="slide")

n = ("Which gives us an arithmetic problem, and it's the one the whole video turns on. Sixteen "
     "gigabytes has to cross the cable for every single word the model says. Divide that by how "
     "fast the drive reads, and you get the floor — the fastest this can possibly go, before any "
     "actual computing happens. Hold that thought. We'll put a real number on it in a few minutes.")
scene("s13", "AIRLLM_STAGE", n, stage(
    "pipe",
    [{"group": "from", "label": "the drive", "sub": "where the layers live",
      "atWord": w(n, "cross the cable")},
     {"group": "to", "label": "the GPU", "sub": "one layer at a time",
      "atWord": w(n, "cross the cable")},
     {"group": "bytes", "label": "16.06 GB per word", "atWord": w(n, "Sixteen gigabytes has to")},
     {"group": "rate", "label": "how fast the drive reads",
      "atWord": w(n, "Divide that by")},
     {"group": "result", "label": "= the floor", "atWord": w(n, "you get the floor")}],
    stage_title="the bill, per word", color="orange"), transition="push")

n = ("One more thing does carry over, and it's worth naming so you're not confused later. "
     "Attention keeps a cache — the keys and values it worked out for the words so far — and "
     "that does stay in memory between words. It's small compared to the weights, but it grows "
     "as the answer gets longer.")
scene("s14", "CACHE_PYRAMID", n, {"pyramid": {
    "headline": "What stays, and what doesn't",
    "tiers": [{"label": "Attention cache", "speed": "stays", "size": "small, grows", "color": "green"},
              {"label": "One layer's weights", "speed": "dropped", "size": "0.44 GB"},
              {"label": "The word table", "speed": "re-read", "size": "1.05 GB"},
              {"label": "Everything else", "speed": "on disk", "size": "16.06 GB"}],
    "axisTop": "kept between words", "axisBottom": "read again, every word",
    "atWord": w(n, "Attention keeps a cache")}}, transition="slide")

# ───────────────────────────────────────────────────────── ACT 3 — doing it on this Mac

scene("s15", "CHAPTER",
      "Enough theory. Let's put it on an actual machine and find out whether any of this survives "
      "contact with reality.",
      {"chapter": {"number": "02", "title": "On a real Mac",
                   "subtitle": "the machine, the drive, the install"}}, transition="wipe")

n = ("This is the machine. A MacBook Pro, Apple M three Pro, eleven CPU cores, fourteen graphics "
     "cores, and eighteen gigabytes of memory. On a Mac the memory is shared — the processor and "
     "the graphics chip draw from the same pool, so there's no separate card with its own "
     "gigabytes to fall back on. Shared memory matters more than it sounds, and we'll come back to why. "
     "Now the drives. Inside the laptop there are forty-nine gigabytes free, which is not enough, because the model needs storing twice, "
     "and I'll show you why in a second. Plugged into the side is an external SSD with six hundred "
     "and fifty-nine free. And this is the number the rest of the video depends on: that drive "
     "reads at about nine hundred and eighty-four megabytes a second. Hold onto that figure, because every second of waiting later in this video comes straight out of it, which is why a slower drive changes the whole answer. A slower "
     "drive — a spinning hard disk, or a cheap USB stick — would make everything you're about to "
     "see three or four times worse, and that's not AirLLM's fault, it's just arithmetic.")
scene("s16", "RECORDED_STEP", n, clips(
    ("rec:airllm-mac#chip", "the chip and the memory", w(n, "A MacBook Pro"),
     [{"marks": ["mem"], "band": True, "wantAtWord": w(n, "eighteen gigabytes of memory")}]),
    ("rec:airllm-mac#gpu", "its graphics cores", w(n, "fourteen graphics"),
     []),
    ("rec:airllm-mac#disk", "what's free, in and out", w(n, "Now the drives"),
     [{"marks": ["free"], "wantAtWord": w(n, "external SSD")}]),
    ("rec:airllm-mac#speed", "how fast it reads", w(n, "that drive reads"),
     [{"marks": ["rate"], "band": True, "wantAtWord": w(n, "nine hundred and eighty-four")}]),
), transition="letterbox", background="zoneB")

n = ("Here's why the laptop's own disk won't do. You download sixteen gigabytes of model. Then "
     "AirLLM writes its own split copy, which is another fifteen. That's thirty-one gigabytes of "
     "the forty-nine you had, on a disk that also has to be your computer. The external drive "
     "isn't a luxury here — it's the difference between this working and your Mac filling up. "
     "So everything from here on lives on that SSD.")
scene("s17", "AIRLLM_STAGE", n, stage(
    "wall",
    [{"group": "door", "label": "free inside the laptop", "sub": "49 GB", "value": 49,
      "atWord": w(n, "forty-nine you had")},
     {"group": "slab", "label": "the model, twice over", "sub": "16 GB + 15 GB", "value": 31,
      "atWord": w(n, "another fifteen")},
     {"group": "verdict", "label": "that's most of your disk",
      "atWord": w(n, "thirty-one gigabytes")}],
    stage_title="why it lives on the SSD", color="orange"), transition="push")

n = ("Installing it takes two commands. First a virtual environment, meaning a private folder for this project's packages, so that they can't collide with anything else on your Mac. "
     "Then pip install airllm mlx. Airllm is the library itself. MLX is Apple's own array "
     "framework — think of it as the thing that lets ordinary Python reach the graphics chip on "
     "Apple silicon, the way CUDA does on an Nvidia card. And that's the setup. No service to "
     "sign up for, no daemon running in the background. Version four point zero of AirLLM, and "
     "MLX zero point thirty-two. Worth writing those down, because what I show you next is "
     "specific to these versions, and this project moves quickly.")
scene("s18", "RECORDED_STEP", n, clips(
    ("rec:airllm-install#venv", "a private folder", w(n, "First a virtual"), []),
    ("rec:airllm-install#pip", "the two packages", w(n, "pip install airllm mlx"),
     []),
    ("rec:airllm-install#versions", "what we ended up with", w(n, "Version four point zero"),
     [{"marks": ["ver"], "wantAtWord": w(n, "MLX zero point thirty-two")}]),
), transition="letterbox", background="zoneB")

n = ("Now, something worth knowing before you trust any benchmark you read about this project. "
     "On a Mac, AirLLM does not run the code most of its documentation describes. Ask it for a "
     "model, print the class you actually got back, and it's AirLLMLlamaMlx — a separate "
     "implementation written for Apple silicon. And a detail falls out of that. The model's own "
     "config file asks for a rope theta of five hundred thousand, and this code path uses ten "
     "thousand. Rope theta is the setting that tells the model how to encode where each word sits in the sentence, which is why a different number means a different encoding. I want to be careful about what I'm "
     "claiming here: the answer I got back was correct, and I did not test a long prompt, so I "
     "can't tell you it costs you anything. What I can tell you is that the Mac road is a "
     "different road, and it's worth knowing which one you're on.")
scene("s19", "RECORDED_STEP", n, clips(
    ("rec:airllm-paths#which", "which code actually runs", w(n, "print the class"),
     [{"marks": ["cls"], "band": True, "wantAtWord": w(n, "AirLLMLlamaMlx")},
      {"marks": ["rope"], "band": True, "wantAtWord": w(n, "uses ten thousand")}]),
), transition="letterbox", background="zoneB")

n = ("So one call quietly forks into two very different roads. On a machine with an Nvidia card "
     "you get the well-travelled path — the one with the compression options and the prefetching. "
     "On a Mac you get the MLX path, chosen before the library has even looked at which model you "
     "asked for. I want to be careful here: the answer I got was correct, and I did not test a "
     "long prompt. But it's worth knowing that the Mac road is a different road.")
scene("s20", "AIRLLM_STAGE", n, stage(
    "road",
    [{"group": "call", "label": "AutoModel.from_pretrained(...)",
      "sub": "the one line every example shows", "atWord": w(n, "one call quietly")},
     {"group": "road", "text": "cuda", "label": "the CUDA path",
      "sub": "compression, prefetching, every architecture",
      "atWord": w(n, "Nvidia card")},
     {"group": "road", "text": "mlx", "label": "the MLX path",
      "sub": "a hand-written Llama block for Apple silicon",
      "atWord": w(n, "On a Mac you get")},
     {"group": "taken", "text": "mlx", "label": "chosen before any check",
      "atWord": w(n, "before the library")}],
    stage_title="one call, two code paths", color="purple"), transition="slide")

n = ("Right — the split. When you download a model you get a handful of big files, four of them "
     "here, about four and a half gigabytes each. That packaging is the problem, because to read one "
     "layer you'd have to open a file holding dozens of layers. So the tool re-packages the model once, into one file per layer. And the program that does it is this short. Point AutoModel "
     "at the folder, tell it where to save the pieces, and that's the whole thing — the same one "
     "line you'd write to load a model normally, with one extra argument. Everything else in "
     "there is me printing timings so we can see what happened.")
scene("s21", "RECORDED_STEP", n, clips(
    ("rec:airllm-split#downloaded", "what you download", w(n, "a handful of big files"),
     []),
    ("rec:airllm-split#code", "the whole program", w(n, "the program that does it"),
     [{"marks": ["call"], "band": True, "wantAtWord": w(n, "tell it where to save")}]),
), transition="letterbox", background="zoneB")

n = ("And this is it running. Watch the counter climb — thirty-five pieces, written one at a "
     "time, straight onto the SSD. What's happening underneath is that AirLLM opens each of those "
     "big downloaded files, pulls out the tensors belonging to one layer, converts them to "
     "sixteen-bit floating point, and writes them out as their own little file. A tensor is just "
     "a block of numbers — the weights we talked about. The split is a one-off, and that's the "
     "important part, because you pay the cost the first time you use a model and never again, because next "
     "time AirLLM finds the pieces already sitting there and skips straight past. Pause here if "
     "you want to read the output properly, because two lines are worth catching. The class AirLLM reports is the Apple silicon path we just talked about. And the layer count: "
     "thirty-two. Thirty-two layers, plus the word table, the normalisation step and the output head, which is why the count lands on thirty-five. That is where thirty-five comes from, so the file count is not arbitrary. Fifty-four seconds, and the model is in the "
     "shape AirLLM wants it in. And notice what did not happen: nothing was compressed and "
     "nothing was rounded off, which is why the README can say no quantisation and mean it. "
     "The same weights went in and came out, just filed differently. If you have ever waited "
     "twenty minutes for a model to convert on a slower disk, this is that step, and it only "
     "happens once.")
scene("s22", "RECORDED_STEP", n, clips(
    ("rec:airllm-split#run", "one file per layer", w(n, "this is it running"),
     [{"marks": ["done"], "band": True, "wantAtWord": w(n, "Fifty-four seconds")}]),
), transition="letterbox", background="zoneB")

n = ("And here's what the split left on the drive. Thirty-five files. The word table, a gigabyte. The "
     "output head, another gigabyte. And a layer — four hundred and sixteen megabytes. Look at "
     "those three numbers next to each other, because they're the whole argument: the biggest "
     "thing AirLLM will ever have to hold is a gigabyte, not sixteen.")
scene("s23", "RECORDED_STEP", n, clips(
    ("rec:airllm-split#files", "35 files, one per layer", w(n, "what the split left"),
     [{"marks": ["layer"], "band": True, "wantAtWord": w(n, "four hundred and sixteen")}]),
), transition="letterbox", background="zoneB")

# ─────────────────────────────────────────────────────────────── ACT 4 — the answer

scene("s24", "CHAPTER",
      "So it's installed and the model is in pieces. Let's ask the model something, with a stopwatch running.",
      {"chapter": {"number": "03", "title": "Ask it a question",
                   "subtitle": "with a stopwatch running"}}, transition="wipe")

n = ("This is the whole program, and I'll take the file line by line, because not one line here "
     "should be mysterious. We import MLX, which is how anything reaches the graphics chip here. We point "
     "AutoModel at the model folder and at the split we just made. Apply chat template wraps your "
     "question in the special markers Llama was trained to expect — without it you're not talking "
     "to a chat model, you're just continuing text. The tokenizer turns that into numbers. Then "
     "generate, with max new tokens set to two, because at the speed we're about to measure, two "
     "is plenty. And we print the answer, the clock and the peak memory.")
scene("s25", "RECORDED_STEP", n, clips(
    ("rec:airllm-chat#code", "twenty lines, in full", w(n, "This is the whole program"),
     [{"marks": ["gen"], "band": True, "wantAtWord": w(n, "max new tokens set to two")}]),
), transition="letterbox", background="zoneB")

n = ("And here it goes. That bar is the model working through its thirty-two layers — reading each layer off the SSD, running that layer, deleting that layer, then reaching for the next. Seventeen "
     "seconds for one complete pass. Now watch what happens next, because this is the bit that "
     "surprises people: it does the whole thing again. Every layer, read a second time, because "
     "the second word needs the whole model just as much as the first one did. Nothing was kept. "
     "And there's the answer. Paris. The tag straight after Paris is the model's end-of-turn marker, the token Llama emits to say I've finished talking, and AirLLM prints that marker rather than hiding it. Forty-one seconds for two words. And the number I care about most: the most "
     "memory this process ever touched was three point one nine gigabytes. For a model that is "
     "sixteen gigabytes on disk. So the claim is not marketing — you can watch the counter and "
     "watch the memory at the same time, and they do not match up the way you would expect "
     "them to.")
scene("s26", "RECORDED_STEP", n, clips(
    ("rec:airllm-chat#ask", "one question, 32 layers",
     w(n, "And here it goes"),
     [{"marks": ["answer"], "band": True, "wantAtWord": w(n, "And there's the answer")},
      {"marks": ["mem"], "band": True, "wantAtWord": w(n, "three point one nine")}]),
), transition="letterbox", background="zoneB")

n = ("So the claim holds. A sixteen gigabyte model answered a question on a machine that never "
     "gave it more than three point one nine gigabytes. Nothing was quantised, nothing was "
     "thrown away, and the weights are the same ones Meta shipped. On that count, AirLLM does "
     "exactly what it says on the tin. Credit where credit is due: streaming layers off disk is a clever piece of "
     "engineering, and the measurement backs the claim.")
scene("s27", "AIRLLM_STAGE", n, stage(
    "ceiling",
    [{"group": "file", "label": "the model", "sub": "16.06 GB", "value": 16.06,
      "atWord": w(n, "A sixteen gigabyte model")},
     {"group": "file", "label": "the biggest single file", "sub": "1.05 GB", "value": 1.05,
      "atWord": w(n, "Nothing was quantised")},
     {"group": "file", "label": "peak, measured", "sub": "3.19 GB", "value": 3.19,
      "atWord": w(n, "three point one nine")},
     {"group": "peak", "label": "the claim holds", "atWord": w(n, "Nothing was quantised")}],
    stage_title="memory: claim versus measured", color="green"), transition="iris")

n = ("Now the bill. Sixteen gigabytes read for every word, off a drive that does nine hundred and "
     "eighty-four megabytes a second, is about sixteen seconds of pure reading before anything is "
     "computed. We measured twenty seconds, which is the floor plus a little overhead. "
     "So the library is not being slow here; your disk is the limit, and no amount of clever code gets "
     "under the read speed. Put another way, because this is the number that will actually bite you: a "
     "hundred word reply is a little over half an hour of waiting. That is the trade, stated "
     "plainly.")
scene("s28", "AIRLLM_STAGE", n, stage(
    "pipe",
    [{"group": "from", "label": "the SSD", "sub": "984 MB/s, measured",
      "atWord": w(n, "off a drive")},
     {"group": "to", "label": "the GPU", "sub": "one layer at a time",
      "atWord": w(n, "off a drive")},
     {"group": "bytes", "label": "16.06 GB per word", "atWord": w(n, "Sixteen gigabytes read")},
     {"group": "rate", "label": "984 MB/s", "atWord": w(n, "nine hundred and")},
     {"group": "result", "label": "about 20 s per word", "atWord": w(n, "about sixteen seconds")}],
    stage_title="speed: where the time goes", color="orange"), transition="push")

n = ("Which brings us to the honest question: is this useful to you? I tried loading the same "
     "model the ordinary way on this Mac, with the standard MLX library, and it didn't finish — "
     "sixteen gigabytes of weights on an eighteen gigabyte machine ran out of memory. So for "
     "this model, on this laptop, AirLLM isn't slower than the alternative — it is the difference "
     "between an answer and no answer. And I want to be exact about the scope of that: one model, "
     "one machine, one question. Your mileage genuinely varies.")
scene("s29", "CLAIM_CHECK", n, {"claimCheck": {
    "headline": "The claim, checked on one machine",
    "subject": "AirLLM",
    "claims": [{"text": "Runs a model far bigger than your memory, at full precision.",
                "tag": "the claim", "color": "blue", "atWord": w(n, "is this useful")}],
    "tallyLabel": "same Mac, same question",
    "hitLabel": "answered",
    "tally": [{"label": "The usual way", "value": 0, "threshold": 1, "color": "red",
               "atWord": w(n, "it didn't finish")},
              {"label": "AirLLM", "value": 1, "threshold": 1, "color": "green",
               "atWord": w(n, "AirLLM isn't slower")}],
    "verdict": "It ran. Slowly. But it ran.",
    "verdictAtWord": w(n, "the difference"),
    "source": "measured on an 18 GB M3 Pro, 2026-09-26",
    "atWord": w(n, "the honest question")}}, transition="slide")

n = ("So here's how I'd decide. If the model already fits in your memory, just load it normally — "
     "you'll get an answer in under a second instead of twenty. If the model doesn't fit, you have two options: shrink the model with quantisation and accept a small accuracy cost, or stream the model with AirLLM and keep every bit of precision. And AirLLM is for the second case, meaning the model you cannot otherwise run at all, when you care more about getting the exact answer than about "
     "getting it quickly. Batch work overnight, not a chat window. Pick the wrong side of that "
     "line and you will be very annoyed with me in about forty seconds.")
scene("s30", "AIRLLM_STAGE", n, stage(
    "crossover",
    [{"group": "line", "label": "this Mac", "sub": "18 GB of memory", "value": 18,
      "atWord": w(n, "fits in your memory")},
     {"group": "point", "label": "an 8B model, 4-bit", "sub": "~4.5 GB", "value": 4.5,
      "atWord": w(n, "shrink the model with quantisation")},
     {"group": "point", "label": "the one we ran", "sub": "16 GB, full precision", "value": 16,
      "atWord": w(n, "stream the model with AirLLM")},
     {"group": "point", "label": "Llama 3, 70 billion", "sub": "141 GB", "value": 141,
      "atWord": w(n, "cannot otherwise run")},
     {"group": "left", "label": "just load it", "sub": "under a second per word",
      "atWord": w(n, "just load it normally")},
     {"group": "right", "label": "stream it", "sub": "seconds to minutes per word",
      "atWord": w(n, "stream the model with AirLLM")}],
    stage_title="where streaming starts to pay", color="blue"), transition="iris")

n = ("So: the honest verdict is that AirLLM does exactly what it says. The wall it removes is memory. "
     "The wall AirLLM hands you instead is your disk, because nothing is kept between words, — sixteen gigabytes read for every word you get "
     "back. Know which of those two walls you are actually standing in front of, and you will "
     "know whether this is for you. For most people it is a no. For a few, it is the only way "
     "the thing runs at all.")
scene("s31", "RECAP", n, {
    "heading": "What we actually learned",
    "points": [{"text": "One layer at a time, never the whole model", "atWord": w(n, "The wall it removes")},
               {"text": "3.19 GB held, for a 16 GB model", "atWord": w(n, "The wall AirLLM hands you")},
               {"text": "But 16 GB read per word — about 20 seconds", "atWord": w(n, "sixteen gigabytes read")},
               {"text": "Worth it when the model otherwise won't run", "atWord": w(n, "two walls")}]},
    transition="wipe")

n = ("Everything here is AirLLM, by Gavin Li, and the link's in the description — read the issues, because that's "
     "where the sharp edges live. If this saved you a search, subscribe. And tell me what you'd "
     "run overnight.")
scene("s32", "OUTRO_CTA", n, {
    "message": "AirLLM — github.com/lyogavin/airllm",
    "sub": "Apache-2.0 · by Gavin Li"}, transition="fade")

# ─────────────────────────────────────────────────────────────────────────── envelope

spec = {
    "meta": {
        "topic": "AirLLM — a model bigger than your memory, on a Mac",
        "format": "long",
        "fps": 30,
        "subject": "AirLLM",
        "subjectKind": "an open-source Python library that runs a large language model by "
                       "reading it off your disk one layer at a time",
        "audioPrefix": "airllm-on-my-mac_long",
        "onePayoff": "whether streaming a model off disk one layer at a time is worth what it "
                     "costs, measured on an 18 GB MacBook",
        "openLoop": "If the whole model never fits in memory, where is it while it answers?",
        "screenplay": "documentary",
        "topicAxes": ["entity-novelty", "economic-pain", "sovereignty"],
        "pronounce": {"AirLLM": "Air\u00b7LLM", "MLX": "M-L-X", "rope": "rope"},
        # THE OWNER LISTENED, AND HIS EAR OUTRANKS THE TRANSCRIBER.
        # `audit-voice.py` compares WORDS, and faster-whisper cannot spell "Air" before an
        # acronym: the same phonemes come back as "air llm", "error llm" and "air jell o m"
        # depending only on where in the sentence they fall. It therefore fails scenes whose
        # audio is correct. Feeding the transcriber the vocabulary (`initial_prompt`) fixes
        # every one of them and was REJECTED, because the break-test showed it also passes the
        # "Aralem" audio the gate exists to catch.
        # So the override is a HUMAN one, recorded per video: who listened, when, and to what.
        # It is voided automatically if the audio changes (the gate re-checks the hash), it
        # prints a loud notice naming every scene it waves through, and it can only ever
        # forgive the SUBJECT-HEARD check — a swallowed opening or a drifted script still fails.
        "voiceApproved": {
            "by": "owner",
            "on": "2026-09-26",
            "sample": "topics/airllm-on-my-mac/out/NAME-CHECK.mp3",
            "note": "Approved the name at 0:15 (mid-sentence). Rejected the sentence-initial "
                    "rendering as 'Air ch LLM', so no sentence opens on the name any more.",
            "only": "subject",
        },
        "seo": {
            "title": "If An AI Model Won't Fit Your Laptop, Watch This — AirLLM In Under 20 Minutes",
            "altTitles": [
                "I Ran A 16 GB AI Model Using 3 GB Of Memory — AirLLM, Measured",
                "AirLLM On A Mac: The Trick That Runs Huge Models, And What It Costs",
                "Your Laptop Is Big Enough For That AI Model — Here Is The Catch",
            ],
            "hook": "Your laptop's memory is the wall that stops you running the big open AI "
                    "models. AirLLM removes that wall by reading the model off your disk one "
                    "layer at a time — so I put it on an 18 GB MacBook with a 16 GB model and "
                    "measured everything: the memory it actually held, the seconds per word, "
                    "and whether the ordinary way could do it at all.",
            "description":
                "AirLLM is an open-source Python library by Gavin Li that runs a large language "
                "model by streaming its layers off disk one at a time, so the memory you need is "
                "the size of the biggest single layer rather than the whole model — no "
                "quantisation, no distillation, no pruning. In this video we install it on an "
                "Apple silicon Mac, split Llama 3 8B Instruct into one file per layer on an "
                "external SSD, ask it a question, and measure the peak memory and the speed.",
            "breakdown":
                "what AirLLM actually is and who wrote it, why memory is normally the wall, how "
                "streaming one layer at a time gets around it, what really sets the memory "
                "ceiling, the install on a Mac, the code path Apple silicon actually takes, the "
                "split into per-layer files, a live question with the clock running, and an "
                "honest verdict on when this is worth its price",
            "queries": [
                "how to run a large language model with little RAM",
                "AirLLM tutorial mac",
                "run 70B model on 4GB GPU",
                "run llama 3 on macbook 18gb",
                "what is layer by layer inference",
                "AirLLM vs quantization",
                "how much memory do you need to run an llm locally",
                "run llm from external ssd",
                "airllm mlx apple silicon",
                "is AirLLM slow",
                "llama 3 8b memory requirements",
                "run big ai models on a small laptop",
            ],
            "hashtags": ["#AirLLM", "#LocalLLM", "#AppleSilicon", "#Llama3", "#MachineLearning"],
            "pinned": "What would you actually run overnight if memory stopped being the limit?",
            "tags": "airllm, local llm, llama 3, apple silicon, mlx, macbook, run llm locally, "
                    "layer by layer inference, low vram, external ssd, gavin li, open source ai, "
                    "llm memory, quantization, m3 pro",
            "sources": [
                "AirLLM — github.com/lyogavin/airllm (Apache-2.0, by Gavin Li)",
                "airllm on PyPI — pypi.org/project/airllm",
                "mlx — github.com/ml-explore/mlx (Apple's array framework for Apple silicon)",
                "Meta Llama 3 8B Instruct — the model used, under the Llama 3 Community Licence",
                "NousResearch/Meta-Llama-3-8B-Instruct — the ungated mirror the weights came from",
            ],
        },
    },
    "brand": {
        "theme": "moderndark", "themeLight": "daylight", "design": "moderndark",
        "background": "noise", "channel": "THE NBX STUDIO", "logo": "img:channel_logo.png",
    },
    "thumbnail": {
        # STACK layout, not the house split: the copy needs a whole sentence a stranger can act
        # on, and the cap follows the layout (64 chars on stack, 40 on split) — LAW 0q corollary.
        # The last two cuts shipped 'hero' and a split; varying the layout is the point.
        "layout": "stack",
        "title": "If An AI Model Won't Fit Your Laptop, [AirLLM Runs It]",
        "badge": "AirLLM · tested on an 18 GB MacBook",
        "note": "16 GB MODEL · 3.19 GB OF MEMORY · 41s PER 2 WORDS",
        # Drawn FREE — `art` is full size with no rounded tile. `asset` would crop it into one.
        "art": "img:airllm_logo.png",
        "logos": ["si:apple", "si:python", "si:github"],
        "artFade": 1,
    },
    "scenes": SCENES,
}

OUT.write_text(json.dumps(spec, indent=2) + "\n")
words = sum(len(s["narration"].split()) for s in SCENES)
rec = sum(1 for s in SCENES if s["type"] == "RECORDED_STEP")
print(f"wrote {OUT.relative_to(ROOT)}")
print(f"  {len(SCENES)} scenes · {rec} RECORDED_STEP ({rec/len(SCENES):.0%}, cap "
      f"{-(-len(SCENES)*35//100)}) · {words} words")
print(f"  estimated finished runtime: {words*0.363/60:.1f} min  (0.363 s/word, measured)")
