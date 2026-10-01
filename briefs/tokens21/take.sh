#!/bin/bash
# Record one take from demos/<slug>.json in a freshly wiped workspace, under the clean config home.
#   bash briefs/tokens21/take.sh tok-context
set -u
slug="$1"
cd /d/iauteur/iauteur
rm -rf "/d/iauteur-rec/$slug"
node briefs/tokens21/seed-home.mjs "$slug" >/dev/null
timeout 1500 bash briefs/tokens21/rec.sh "demos/$slug.json" 2>&1 | grep -v -e DEP0190 -e trace-deprecation
