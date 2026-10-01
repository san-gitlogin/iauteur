#!/bin/bash
# Everything that follows the long render, in one pass.
set -u
cd "$(dirname "$0")/.."
echo "=== 1. VERIFY THE LONG CUT ==="
MP4=topics/airllm-on-my-mac/out/wide-dark.mp4
if [ ! -f "$MP4" ]; then echo "NO MP4 — render did not finish"; exit 1; fi
FR=$(ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -of csv=p=0 "$MP4")
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$MP4")
VOL=$(ffmpeg -v error -i "$MP4" -af volumedetect -f null - 2>&1 | grep mean_volume | sed 's/.*mean_volume: //')
SPEC=$(python3 -c "import json;d=json.load(open('topics/airllm-on-my-mac/long.json'));print(sum(s['durationFrames'] for s in d['scenes']))")
echo "  frames  : $FR   (spec says $SPEC)"
echo "  duration: ${DUR}s"
echo "  audio   : $VOL   (silence measures -91 dB)"
echo "  size    : $(ls -la "$MP4" | awk '{print $5}') bytes"
echo
echo "=== 2. SHORT ==="
node scripts/render-topic.mjs airllm-on-my-mac short-dark 2>&1 | tail -3
echo
echo "=== 3. COVER ==="
node scripts/render-topic.mjs airllm-on-my-mac cover 2>&1 | tail -2
echo
echo "=== 4. UPLOAD KITS ==="
node scripts/gen-upload-kit.mjs airllm-on-my-mac 2>&1 | tail -3
ls -la topics/airllm-on-my-mac/out/ | awk '{print $5, $9}'
