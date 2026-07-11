#!/usr/bin/env python3
"""Voiceover generation with word-level timestamps via edge-tts (free).
Setup once:  pip install edge-tts
Usage:       python scripts/voiceover.py specs/long.json long [voice]
Voices:      en-US-ChristopherNeural (default) · en-IN-PrabhatNeural · en-US-AriaNeural
             list all: edge-tts --list-voices
Outputs:     public/audio/<prefix>_<sceneId>.mp3  +  out/tts/<prefix>_timestamps.json
NOTE: needs internet (Microsoft Edge TTS endpoint). Run on your machine.
"""
import asyncio, json, os, sys
import edge_tts

async def main():
    spec_path, prefix = sys.argv[1], sys.argv[2]
    voice = sys.argv[3] if len(sys.argv) > 3 else "en-US-ChristopherNeural"
    spec = json.load(open(spec_path, encoding="utf-8"))
    os.makedirs("public/audio", exist_ok=True)
    os.makedirs("out/tts", exist_ok=True)
    result = {}
    for scene in spec["scenes"]:
        sid, text = scene["id"], scene["narration"]
        mp3 = f"public/audio/{prefix}_{sid}.mp3"
        words = []
        last_end = 0.0
        comm = edge_tts.Communicate(text, voice, rate="+8%")
        with open(mp3, "wb") as f:
            async for chunk in comm.stream():
                if chunk["type"] == "audio":
                    f.write(chunk["data"])
                elif chunk["type"] == "WordBoundary":
                    t_sec = chunk["offset"] / 10_000_000  # 100ns units → seconds
                    words.append(round(t_sec, 3))
                    last_end = t_sec + chunk["duration"] / 10_000_000
        result[sid] = {"duration": round(last_end + 0.35, 3), "words": words}
        print(f"  {sid}: {len(words)} words, {result[sid]['duration']}s → {mp3}")
    out = f"out/tts/{prefix}_timestamps.json"
    json.dump(result, open(out, "w"), indent=2)
    print(f"✓ Timestamps → {out}. Next: node scripts/sync.mjs {spec_path} {out} {prefix}")

asyncio.run(main())
