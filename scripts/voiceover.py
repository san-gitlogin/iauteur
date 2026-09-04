#!/usr/bin/env python3
"""Voiceover generation with word-level timestamps via edge-tts (free).
Setup once:  pip install edge-tts
Usage:       python scripts/voiceover.py specs/long.json long [voice]
Voices:      en-US-AvaMultilingualNeural (default) · en-US-ChristopherNeural · en-IN-PrabhatNeural
             list all: edge-tts --list-voices
Outputs:     public/audio/<prefix>_<sceneId>.mp3  +  out/tts/<prefix>_timestamps.json
NOTE: needs internet (Microsoft Edge TTS endpoint). Run on your machine.
"""
import asyncio, json, os, sys
import edge_tts

# Windows consoles default to cp1252, which cannot encode the arrows/bullets we
# print (\u2192 etc.) -> force UTF-8 so the script never dies on a status line.
for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except Exception:
        pass

RATE = "-10%"

async def main():
    spec_path, prefix = sys.argv[1], sys.argv[2]
    voice = sys.argv[3] if len(sys.argv) > 3 else "en-US-AvaMultilingualNeural"
    global RATE
    RATE = sys.argv[4] if len(sys.argv) > 4 else "-10%"
    spec = json.load(open(spec_path, encoding="utf-8"))
    os.makedirs("public/audio", exist_ok=True)
    os.makedirs("out/tts", exist_ok=True)
    result = {}
    for scene in spec["scenes"]:
        sid, text = scene["id"], scene["narration"]
        mp3 = f"public/audio/{prefix}_{sid}.mp3"
        words = []
        speech_end = 0.0
        audio_bytes = 0
        # ASK FOR WORD BOUNDARIES. edge-tts defaults `boundary` to "SentenceBoundary",
        # and with that default NO WordBoundary event is ever sent — so the fallback below
        # fired on every scene of every video this repo has produced, spreading word starts
        # EVENLY across the whole scene. Anchors then landed on an estimate rather than on
        # the word, which is exactly the "sync is lacking, I can't follow" the owner
        # reported. Measured on one scene: 14 word starts at a uniform 0.432s apart, versus
        # real gaps of 0.243 / 0.336 / 0.694 / 0.347 / 0.081 once this is set.
        # SPEED IS NOT ENERGY (owner, 2026-09-04, on a 13-minute beginner tutorial:
        # *"the voiceover is shooting very fast while the on screen typing and
        # highlighting just flashes only for a few seconds which is not processable by
        # a human eye"*). The rate had been pinned at +8% — actively SPED UP — which
        # measured 3.11 words/sec, i.e. 187 wpm. A presenter delivers at that rate; a
        # tutorial someone is trying to type along with does not.
        #
        # It also silently starves every piece of footage. A typing block plays at
        # CAPTURE speed no matter what the voice does, so the only thing that decides
        # how long finished code stays on screen is how long the sentence over it
        # lasts. At +8% one block held for 0.3 SECONDS after the last character landed.
        #
        # -10% measures ~2.6 words/sec (155 wpm), which is the range the production
        # bible asks for, and it hands roughly a fifth more dwell to every frame.
        # Override per run with a 4th argument when a cut genuinely wants a different
        # pace; do not raise the default back without measuring a hold time.
        comm = edge_tts.Communicate(text, voice, rate=RATE, boundary="WordBoundary")
        with open(mp3, "wb") as f:
            async for chunk in comm.stream():
                ctype = chunk["type"]
                if ctype == "audio":
                    f.write(chunk["data"])
                    audio_bytes += len(chunk["data"])
                # edge-tts 7.x often sends only SentenceBoundary (no WordBoundary);
                # both carry offset+duration (100ns units) — take the latest end as
                # the real speech length so a missing word stream can't collapse it.
                elif ctype in ("WordBoundary", "SentenceBoundary"):
                    t_sec = chunk["offset"] / 10_000_000
                    end = t_sec + chunk["duration"] / 10_000_000
                    if end > speech_end:
                        speech_end = end
                    if ctype == "WordBoundary":
                        words.append(round(t_sec, 3))
        # Hard floor: edge-tts default output is 48 kbit/s mono MP3, so the audio's
        # own length is recoverable from its byte size even if NO boundary events
        # arrive — this is what stops scenes from collapsing to ~0.35s.
        mp3_est = (audio_bytes * 8) / 48000 if audio_bytes else 0.0
        speech_end = max(speech_end, mp3_est)
        # No per-word boundaries → synthesize evenly-spaced word starts across the
        # measured speech so `atWord` anchors still land on the voice, not frame 0.
        if not words and speech_end > 0:
            # LOUD, not silent. This fallback is a last resort and it degrades every anchor
            # in the scene to an estimate; it ran unnoticed for the entire back catalogue
            # because it printed nothing. If it fires again, the run says so.
            print(f"  !! {sid}: NO WordBoundary events — falling back to EVEN spacing. "
                  f"Anchors in this scene will be estimates, not real word times.")
            n = max(1, len(text.split()))
            words = [round(i / n * speech_end, 3) for i in range(n)]
        result[sid] = {"duration": round(speech_end + 0.35, 3), "words": words}
        print(f"  {sid}: {len(words)} words, {result[sid]['duration']}s → {mp3}")
    out = f"out/tts/{prefix}_timestamps.json"
    json.dump(result, open(out, "w"), indent=2)
    print(f"✓ Timestamps → {out}. Next: node scripts/sync.mjs {spec_path} {out} {prefix}")

asyncio.run(main())
