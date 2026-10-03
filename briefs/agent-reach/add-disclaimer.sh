#!/bin/bash
# Put the disclaimer board in FRONT of an already-rendered wide cut, with no re-render of the cut.
#   bash briefs/agent-reach/add-disclaimer.sh <slug>
# Renders the `disclaimer-wide` composition (src/Disclaimer.tsx), gives it a silent AAC track that matches
# the cut (48 kHz stereo), and joins the two through MPEG-TS so each part carries its own H.264 headers.
# Writes <out>/wide-dark-disclaimer.mp4 and leaves wide-dark.mp4 untouched. Then shift the chapter stamps
# in upload.md by the board's length (node briefs/agent-reach/shift-chapters.mjs <slug> <seconds>).
set -eo pipefail
cd "$(dirname "$0")/../.."
O=topics/$1/out; W=out/disclaimer; mkdir -p $W
node node_modules/@remotion/cli/remotion-cli.js render disclaimer-wide $W/board.mp4 --muted --concurrency=2 --log=error
ffmpeg -v error -y -i $W/board.mp4 -f lavfi -i anullsrc=r=48000:cl=stereo -c:v copy -c:a aac -b:a 192k -shortest -bsf:v h264_mp4toannexb -f mpegts $W/a.ts
ffmpeg -v error -y -i $O/wide-dark.mp4 -c copy -bsf:v h264_mp4toannexb -f mpegts $W/b.ts
ffmpeg -v error -y -i "concat:$W/a.ts|$W/b.ts" -c copy -bsf:a aac_adtstoasc -movflags +faststart $O/wide-dark-disclaimer.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 $W/board.mp4
