#!/usr/bin/env python3
"""AUDIT-VOICE — listen to the voiceover the only way a script can: transcribe it.

WHY THIS EXISTS. Every other gate reads the SPEC. None of them reads the AUDIO, so a voice
that mangled the words passed everything. PAID FOR on HID-Fi (2026-09-19), twice in one day:
  - the name, written "H I D Fi" to stop Ava saying "hid", came out as "HID5" and, in one
    opening, "My attack using Centenna Phi". Owner: "why does the voice over sound chinese?"
  - after the fix, a scene opening "Introducing HID-Fi." had those two words swallowed —
    the first second transcribed as "I didn't make it" — on the exact beat that names the
    product. Nothing in the spec could show it.

WHAT IT CHECKS, per voiced scene (faster-whisper `medium`; `small` hears "HIDFI" as "HID5"):
  1. OPENING HEARD  — the scene's first two content words appear in the first ~4 words heard.
  2. SCRIPT MATCH   — the transcript matches the narration (word ratio >= 0.85).
  3. SUBJECT HEARD  — wherever the narration says meta.subject, the transcript says it too
                      (compared with spaces, hyphens and case removed: "HIDFI" == "HID-Fi").
A fail exits 1 and names the scene; re-voice just those with ONLY=sNN.

Usage: python3 scripts/audit-voice.py topics/<slug>/long.json <prefix> [--model small]
"""
import sys, json, re, difflib, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lib'))
from numwords import fold_numbers  # noqa: E402

spec_path, prefix = sys.argv[1], sys.argv[2]
model_name = sys.argv[sys.argv.index('--model') + 1] if '--model' in sys.argv else 'medium'
from faster_whisper import WhisperModel  # noqa: E402

spec = json.load(open(spec_path))
subject = re.sub(r'[^a-z0-9]', '', str(spec.get('meta', {}).get('subject', '')).lower())
STOP = {'the', 'a', 'an', 'and', 'so', 'now', 'well', 'or', 'but', 'then', 'this', 'that', 'its', "it's", 'to', 'of'}
# A FIGURE IS SPOKEN AS WORDS AND TRANSCRIBED AS DIGITS, and comparing the two as strings
# scores a perfect read at 0.80 and reports its opening word as never spoken. Both sides fold
# through the same table before anything is compared (see scripts/lib/numwords.py).
toks = lambda t: [w for w in re.sub(r"[^a-z0-9' ]", ' ', fold_numbers(t).lower().replace('-', ' ')).split() if w]
# `y` AND `i` SPELL THE SAME VOWEL, and a transcriber picks between them freely on a proper
# noun it has never seen: "Laya" comes back as "Laia" in one sentence and "Laya" in the next,
# from the SAME audio pronunciation. This check exists to catch a name that is SAID wrong
# (HID-Fi heard as "HID5"), not one that is spelled two ways — folding y->i on both sides
# keeps the first and forgives the second. Break-tested both directions.
squash = lambda t: re.sub(r'[^a-z0-9]', '', t.lower()).replace('y', 'i')

m = WhisperModel(model_name, device='cpu', compute_type='int8')
only = {x for x in os.environ.get('ONLY', '').split(',') if x}
fails = []
detail = {}
for sc in spec['scenes']:
    if only and sc['id'] not in only:
        continue
    mp3 = f"public/audio/{prefix}_{sc['id']}.mp3"
    if not os.path.exists(mp3) or not sc.get('narration'):
        continue
    segs, _ = m.transcribe(mp3, language='en')
    heard = ' '.join(s.text for s in segs).strip()
    a, b = toks(sc['narration']), toks(heard)
    ratio = difflib.SequenceMatcher(None, a, b).ratio()
    probs = []
    opening = [w for w in a[:6] if w not in STOP][:2]
    head = ' '.join(b[:len(a[:6]) + 2])
    missing = [w for w in opening if w not in head]
    if missing:
        probs.append(f'opening not heard: {missing} (heard "{" ".join(b[:6])}")')
    if ratio < 0.85:
        probs.append(f'script match {ratio:.2f} < 0.85')
    if subject:
        said = squash(sc['narration']).count(subject)
        got = squash(heard).count(subject)
        if said and got < said:
            probs.append(f'subject "{subject}" said {said}x, heard {got}x')
    detail[sc['id']] = probs
    mark = '✗' if probs else '✓'
    print(f"{mark} {sc['id']}  match {ratio:.2f}" + (f"  — {'; '.join(probs)}" if probs else ''))
    if probs:
        fails.append(sc['id'])

# THE STAMP render-topic reads: the text hash (from the timestamps file) of every scene this
# run HEARD correctly. A later re-voice changes the hash and voids its stamp.
ts_file = f"out/tts/{prefix}_timestamps.json"
stamp_file = f"out/tts/{prefix}_voiceaudit.json"
# WHY each scene failed, so `meta.voiceApproved` can forgive a subject-only miss (which the
# transcriber genuinely cannot resolve on an acronym) while a swallowed opening or a drifted
# script still refuses the render.
detail_file = f"out/tts/{prefix}_voiceaudit_detail.json"
json.dump(detail, open(detail_file, "w"), indent=1)
if os.path.exists(ts_file):
    ts = json.load(open(ts_file))
    stamp = json.load(open(stamp_file)) if os.path.exists(stamp_file) else {}
    for sc in spec['scenes']:
        sid = sc['id']
        if (only and sid not in only) or sid not in ts:
            continue
        if sid in fails:
            stamp.pop(sid, None)
        elif ts[sid].get('sha'):
            stamp[sid] = ts[sid]['sha']
    json.dump(stamp, open(stamp_file, 'w'), indent=1)

if fails:
    print(f"\n✗ VOICE AUDIT FAILED: {', '.join(fails)}. Rewrite those lines (or add a meta.pronounce "
          f"respelling, tested by transcribing it), then: ONLY={','.join(fails)} python3 scripts/voiceover.py ...")
    sys.exit(1)
print('\n✓ VOICE AUDIT PASSED — every scene is heard as written.')
