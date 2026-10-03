#!/bin/bash
# Rebuild the long cut from its builder and bring it back to a rendered-ready state WITHOUT re-voicing:
# build -> attach footage -> solve clip/camera timing -> re-time from the existing audio -> lint.
# Run it after any change that is not narration. A narration change needs voiceover.py first (ONLY=sNN).
set -e
cd "$(dirname "$0")/../.."
SPEC=topics/agent-reach-hands-on/${1:-long}.json
PRE=agent-reach-hands-on_${1:-long}; [ "${1:-long}" = shorts ] && PRE=agent-reach-hands-on_short
node briefs/agent-reach/build_${1:-long}.mjs | tail -2 | head -1
node scripts/bake-rec.mjs "$SPEC" | tail -1
# The repo is public: the screen text the recorder bakes in carries this machine's drive paths (the agent
# takes print where Agent Reach is installed). The footage shows what it shows; the tracked spec does not
# need the drive letter, so it is rewritten to <root> before anything is committed.
node briefs/agent-reach/scrub-paths.mjs "$SPEC"
node scripts/anchor-spec.mjs "$SPEC" | tail -1
node scripts/sync.mjs "$SPEC" out/tts/${PRE}_timestamps.json "$PRE" | tail -1
node scripts/lint-spec.mjs "$SPEC" | head -12 | cut -c1-300
