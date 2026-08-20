# -*- coding: utf-8 -*-
# SHORT — The Six-Step Framework. Owner, 2026-08-20: *"needs some more animation
# when you are explaining the steps. Just staring at texts doesnt help."* So the
# steps are not recited over a static ladder: a REAL problem statement goes up,
# its signal words are circled one at a time, the pattern is named from them, and
# only then do the six rungs light. The method is DEMONSTRATED, then summarised.
import json

PROBLEM = "Given a sorted array of integers and a target, return the indices of the two numbers that add up to it."

T = {
 "meta": {"topic":"The Six-Step Framework","format":"short","fps":30,"screenplay":"explainer",
  "onePayoff":"Read the signals before you write anything, and the pattern names itself.",
  "openLoop":"You know the patterns. So why does the blank editor still win?",
  "analogy":"THE DIAGNOSIS - symptoms first, treatment second.",
  "seo":{"title":"How To Pick The Right DSA Pattern In 30 Seconds",
   "hook":"Stop coding first. Read the signals first.",
   "description":"The six-step method, run on a real interview question.",
   "tags":["dsa","coding interview","leetcode","patterns","faang","algorithms","python"],
   "hashtags":["#dsa","#leetcode","#codinginterview","#thenbxstudio"]}},
 "brand":{"theme":"moderndark","design":"moderndark","themeLight":"daylight","background":"grid",
  "channel":"THE NBX STUDIO","logo":"img:channel_logo.png"},
 "cover":{"title":"READ IT FIRST","badge":"The Method","asset":"si:python","frames":2},
 "scenes":[

 dict(id="s01", type="HOOK", background="zoneA", narration=
  "You know the patterns. The interview hands you a problem, and the blank editor still wins. "
  "The gap is not knowledge. It is method.",
  data={"headline":"READ IT FIRST","subtext":"then reach for a pattern","heroAsset":"si:python",
        "headlineAtWord":1,"heroAtWord":12},
  anchors=["headlineAtWord","heroAtWord"]),

 dict(id="s02", type="DSA_SIGNALS", transition="wipe", background="zoneC", key="dsaSignals",
  headline="Circle the [words]", color="yellow", caption="step one and two",
  problem=PROBLEM,
  premise="A real question, on screen. Every word that constrains the answer is a signal.",
  narration=
  "Here is an actual question. Do not code yet. Read it, and circle the words that constrain you. "
  "^Sorted, which is a precondition somebody chose to give you. "
  "^A pair, so you are looking for two things, not one. "
  "^Adds up to a target, which is the test each pair has to pass. "
  "^And return the indices, so positions are the answer, not the values. "
  "Four words, and none of them are decoration.",
  cells=[{"label":"\"sorted\"","sub":"a gift, not a detail","mark":True},
         {"label":"\"two numbers\"","sub":"a pair, so two ends","mark":True},
         {"label":"\"add up to target\"","sub":"the test to apply","mark":True},
         {"label":"\"return the indices\"","sub":"positions, not values","mark":True}]),

 dict(id="s03", type="DSA_SIGNALS", transition="push", background="zoneA", key="dsaSignals",
  headline="The pattern [names itself]", color="green", caption="step three",
  premise="Sorted plus a pair is a fingerprint. Only one pattern fits it.",
  narration=
  "Now match. ^Sorted plus a pair points at two pointers, one at each end. "
  "^Unsorted plus a pair would have been a hash map instead. "
  "^And a run of items sitting next to each other would have been a sliding window. "
  "Same question shape, three different answers, and the signal decides which.",
  cells=[{"label":"sorted + a pair","sub":"→ TWO POINTERS","color":"green","mark":True},
         {"label":"unsorted + a pair","sub":"→ HASH MAP","mark":True},
         {"label":"a contiguous run","sub":"→ SLIDING WINDOW","mark":True}]),

 dict(id="s04", type="DSA_FRAMEWORK", transition="dip", background="zoneB", key="dsaFramework",
  headline="The six steps, [in order]", color="blue", caption="run them every time",
  premise="What we just did was steps one to three. These are all six, in the order they run.",
  narration=
  "That was the first half of a method you can run on anything. "
  "^Read it and draw one small example. ^Circle the signals. ^Match them to a pattern. "
  "^Say the plan out loud in plain English before you type. ^Then code it. "
  "^And finish by testing the edges and stating the complexity, because that is the part "
  "interviewers actually score.",
  cells=[{"label":"1 · Read and draw","sub":"one tiny example","mark":True},
         {"label":"2 · Circle the signals","sub":"the words that constrain","mark":True},
         {"label":"3 · Match the pattern","sub":"signals point somewhere","mark":True},
         {"label":"4 · Plan in plain English","sub":"before you type","mark":True},
         {"label":"5 · Code it clean","sub":"now you may type","mark":True},
         {"label":"6 · Test and analyse","sub":"edges, then Big-O","mark":True}]),

 dict(id="s05", type="OUTRO_CTA", transition="fade", background="zoneA", narration=
  "Ten patterns run on this exact method, one per chapter, in the Dojo.",
  data={"message":"Ten patterns, one method","sub":"the full course in the Dojo"}, anchors=[]),
 ]}
json.dump(T, open('/Users/santhu/iauteur/briefs/dsa/shorts/sh00.json','w'), indent=1)
print("SH00:", len(T["scenes"]), "scenes")
