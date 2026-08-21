# -*- coding: utf-8 -*-
# SHORT — Sliding Window. A vertical cut of the ONE mechanic: repair the total,
# never rebuild it. Written for ~55s, not trimmed from the long script: a short
# has to land a single idea and send the viewer to the full pattern.
import json
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from _guard import write
CODE = [
 "window_sum = sum(nums[:k])",
 "",
 "for i in range(k, len(nums)):",
 "    window_sum += nums[i]",
 "    window_sum -= nums[i - k]",
]
def code(teach):
    return [{"text": t, **({"detail": teach[i], "teach": True} if i in teach else {})} for i, t in enumerate(CODE)]
def cells(rows):   # (label, state, mark)
    return [{"label": l, **({"text": s} if s else {}), **({"mark": True} if m else {})} for l, s, m in rows]

PREMISE = "You are on a train. Each box is a house you pass, and the window shows exactly 3 at a time."

T = {
 "meta": {"topic":"Sliding Window","format":"short","fps":30,"screenplay":"explainer",
  "onePayoff":"Repair the running total instead of rebuilding it, and a nested loop becomes one pass.",
  "openLoop":"Six houses, or a million. Why does one of them take a billion steps?",
  "analogy":"THE TRAIN WINDOW - a view of exactly three houses, sliding one at a time.",
  "seo":{"title":"The Sliding Window Trick Every Interview Wants",
   "hook":"Stop recounting. Repair the total instead.",
   "description":"One in, one out — the whole sliding window pattern in under a minute.",
   "tags":["dsa","sliding window","leetcode","coding interview","algorithms","python","faang"],
   "hashtags":["#dsa","#leetcode","#codinginterview","#thenbxstudio"]}},
 "brand":{"theme":"moderndark","design":"moderndark","themeLight":"daylight","background":"grid",
  "channel":"THE NBX STUDIO","logo":"img:channel_logo.png"},
 "cover":{"title":"ONE IN, ONE OUT","badge":"Sliding Window","asset":"si:python","frames":2},
 "scenes":[

 dict(id="s01", type="HOOK", background="zoneA", narration=
  "Six houses, and you want the best three in a row. Recount every window and a million houses costs a billion steps.",
  data={"headline":"ONE IN, ONE OUT","subtext":"the sliding window","heroAsset":"si:python",
        "headlineAtWord":1,"heroAtWord":9},
  anchors=["headlineAtWord","heroAtWord"]),

 dict(id="s02", type="DSA_TRACE_WINDOW", transition="wipe", background="zoneC", key="dsaWindow",
  headline="Count it [once]", color="green", caption="the only full count",
  codeTitle="sliding_window.py", premise=PREMISE,
  narration=
  "|Add the first three houses. ^Two, ^one and ^five make %eight. "
  "That is the only time you ever add a whole window up.",
  lines=code({0:"The first window. Counted the slow way, once."}),
  cells=cells([("2","win",True),("1","win",True),("5","win",True),("1",None,False),("3",None,False),("2",None,False)]),
  vars=[{"label":"window_sum=8","mark":True}]),

 dict(id="s03", type="DSA_TRACE_WINDOW", transition="push", background="zoneA", key="dsaWindow",
  headline="Then [repair it]", color="green", caption="the train moves one house",
  codeTitle="sliding_window.py", premise=PREMISE,
  narration=
  "Now slide. |The house >entering the window gets ^added, "
  "|and the house >leaving gets ^subtracted. "
  "%Seven, from two operations instead of three. "
  "The window moved, and you never recounted the middle.",
  lines=code({3:"One house enters: add it.", 4:"One house leaves: subtract it."}),
  cells=cells([("2",None,True),("1","win",False),("5","win",False),("1","win",True),("3",None,False),("2",None,False)]),
  pointers=[{"label":"IN","value":3,"mark":True},{"label":"OUT","value":0,"mark":True}],
  vars=[{"label":"window_sum=7","mark":True}]),

 dict(id="s04", type="DSA_COST", transition="dip", background="zoneB", key="dsaCost",
  headline="Why that [matters]", color="blue", caption="the same job, two prices",
  premise="The same job priced two ways as the input grows. Longer bar means more work.",
  narration=
  "^Recounting a million houses costs a billion additions. "
  "^Sliding costs two million. Same answer, and one of them finishes.",
  cells=[{"label":"recount, n=1M","sub":"1 billion additions","value":100,"text":"dropped","mark":True},
         {"label":"slide, n=1M","sub":"2 million additions","value":8,"mark":True}]),

 dict(id="s05", type="OUTRO_CTA", transition="fade", background="zoneA", narration=
  "Subarray, substring, or a window of size k — that is your signal. The full pattern is in the Dojo.",
  data={"message":"Sliding Window, traced line by line","sub":"full pattern in the Dojo"}, anchors=[]),
 ]}
write(T, 'dsa/shorts/sh02.json')
print("SH02:", len(T["scenes"]), "scenes")
