# -*- coding: utf-8 -*-
# EP00 — The Six-Step Framework. Source: dsa-pattern-dojo, FRAMEWORK (all 6 steps)
# plus the signal table assembled from all ten patterns.
import json
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _guard import write
def steps(rows):
    return [{"label":l,"sub":s, **({"mark":True} if m else {})} for l,s,m in rows]

T = {
 "meta": {"topic":"The Six-Step Framework","format":"long","fps":30,"screenplay":"dojo",
  "onePayoff":"You can take an unseen problem and reach the right pattern before you write a line.",
  "openLoop":"You know ten patterns. The interview gives you a problem. What happens in between?",
  "analogy":"THE DIAGNOSIS - reading the symptoms before reaching for a treatment.",
  "topicAxes":["economic-pain","tribal-conflict"],
  "seo":{"title":"How To Actually Solve A Coding Interview Problem — 6 Steps",
   "altTitles":["The Six-Step Framework (DSA Pattern Dojo, Episode 0)",
                "Stop Coding First — The Method Interviewers Are Grading"],
   "hook":"You know the patterns. What happens between the question and the code?",
   "breakdown":"the six-step method for turning an unseen problem into the right pattern, plus the signal table for all ten",
   "chapters":[{"id":"s01","title":"Between the question and the code"},
               {"id":"s03","title":"The six steps"},
               {"id":"s04","title":"1 · Read and draw"},
               {"id":"s05","title":"2 · Spot the signals"},
               {"id":"s06","title":"3 · Match the pattern"},
               {"id":"s07","title":"4 · Plan in plain English"},
               {"id":"s09","title":"5 · Code it clean"},
               {"id":"s10","title":"6 · Test and analyse"},
               {"id":"s11","title":"The signal table"}],
   "sources":["Pattern set, steps and problem lists: https://github.com/san-gitlogin/dsa-pattern-dojo",
              "Interactive dojo: https://san-gitlogin.github.io/dsa-pattern-dojo/"],
   "queries":["how to solve coding interview problems","dsa problem solving framework",
     "how to identify the pattern in a problem","coding interview approach step by step",
     "what interviewers actually grade","how to explain your approach in an interview",
     "leetcode study plan patterns","signal words dsa patterns","stuck in coding interview what to do",
     "dsa patterns cheat sheet","faang interview preparation","technical interview method"],
   "hashtags":["#dsa","#leetcode","#codinginterview","#faang","#thenbxstudio"],
   "tags":["dsa","data structures and algorithms","coding interview","interview preparation",
     "faang interview","leetcode","problem solving","algorithms","python","dsa patterns",
     "software engineering interview","technical interview","the nbx studio"]}},
 "brand":{"theme":"moderndark","design":"moderndark","themeLight":"daylight","background":"grid",
  "channel":"THE NBX STUDIO","logo":"img:channel_logo.png"},
 "thumbnail":{"title":"DON'T CODE FIRST","badge":"The 6 Steps","asset":"si:python"},
 "scenes":[

 dict(id="s01", type="HOOK", background="zoneA", narration=
  "You know the patterns. The interview hands you a problem. What happens in between?",
  data={"headline":"DON'T CODE FIRST","subtext":"what happens before line one",
        "heroAsset":"si:python","headlineAtWord":1,"heroAtWord":8},
  anchors=["headlineAtWord","heroAtWord"]),

 dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", narration=
  "Welcome to the Dojo, and to THE NBX STUDIO. Before any of the ten patterns, this is the method "
  "that gets you from a problem you've never seen to the pattern that solves it.",
  data={"title":"THE SIX STEPS","subtitle":"before the patterns"}, anchors=[]),

 dict(id="s03", type="DSA_FRAMEWORK", transition="dip", background="zoneA", key="dsaFramework",
  headline="Six steps, [in order]", color="blue", caption="the whole method",
  narration=
  "Here's the whole thing, and the order genuinely matters. "
  "^Read and draw. ^Spot the signals. ^Match the pattern. ^Plan in plain English. "
  "^Code it clean. ^Test and analyse. "
  "Most candidates start at step five, because writing code feels like progress and staring at a "
  "problem feels like failing. But an interviewer is grading steps one to four at least as hard as "
  "the code, and often harder.",
  cells=steps([("Read and draw","three times, then sketch it",True),
               ("Spot the signals","the words that give it away",True),
               ("Match the pattern","one or two candidates",True),
               ("Plan in plain English","before a line of code",True),
               ("Code it clean","simple, named, unoptimised",True),
               ("Test and analyse","trace it, then state the cost",True)])),

 dict(id="s04", type="DSA_FRAMEWORK", transition="fade", background="zoneA", key="dsaFramework",
  headline="One · [read and draw]", color="blue", caption="before anything else",
  narration=
  "^Read the problem three times. Not twice. People miss a constraint on the first pass and invent "
  "one on the second. ^Then draw the input and the output, physically, on the whiteboard or the paper. "
  "^And write down the edge cases before you forget them: an empty input, a single element, "
  "duplicates, everything negative. "
  "^The question to answer at the end of this step is what exactly is being asked, in your own words. "
  "If you can't say that sentence, you're not ready to pick a pattern yet, and no amount of code will "
  "rescue you.",
  cells=steps([("read it three times","once is how you miss a constraint",True),
               ("draw input and output","on paper, physically",True),
               ("write the edge cases","empty, single, duplicates, negatives",True),
               ("say it in your own words","if you cannot, do not code yet",True)])),

 dict(id="s05", type="DSA_SIGNALS", transition="fade", background="zoneA", key="dsaSignals",
  headline="Two · [spot the signals]", color="yellow", caption="the words are the cheat code",
  narration=
  "Step two is the one this whole series is built around. Problems announce their own pattern, "
  "and the announcement is usually a single word. "
  "^Sorted. ^Contiguous. ^All combinations. ^Shortest. ^Frequency. ^Nested. "
  "Read the question again with a pen and circle the nouns and adjectives that constrain the input, "
  "because those are the ones carrying the pattern. Verbs tell you what to return, but the "
  "constraints tell you how to get there.",
  cells=[{"label":"sorted","sub":"binary search, or two pointers","mark":True},
         {"label":"contiguous","sub":"sliding window","mark":True},
         {"label":"all combinations","sub":"backtracking","mark":True},
         {"label":"shortest","sub":"BFS","mark":True},
         {"label":"frequency","sub":"hash map","mark":True},
         {"label":"nested","sub":"stack","mark":True}]),

 dict(id="s06", type="DSA_FRAMEWORK", transition="fade", background="zoneB", key="dsaFramework",
  headline="Three · [match the pattern]", color="blue", caption="one or two candidates, not ten",
  narration=
  "^From the signals, name one or two candidate patterns. Not ten, and not none. "
  "^Then ask the honest question: does this pattern's core idea actually apply here? "
  "Two pointers only works because sorted means you can eliminate a whole side. "
  "If nothing is sorted, that reasoning collapses and so does the pattern. "
  "^Say your candidate out loud to the interviewer. Genuinely, say it: this looks like a sliding "
  "window because the question says contiguous. "
  "^Being wrong out loud is fine and recoverable. Being silent for four minutes is neither.",
  cells=steps([("name one or two","not ten, and not none",True),
               ("does the core idea apply?","the honest question",True),
               ("say it out loud","name the pattern and the signal",True),
               ("wrong out loud is fine","silent for four minutes is not",True)])),

 dict(id="s07", type="DSA_FRAMEWORK", transition="dip", background="zoneB", key="dsaFramework",
  headline="Four · [plan in plain English]", color="blue", caption="the step people skip",
  narration=
  "This is the step candidates skip, and it's the one that changes the outcome. "
  "^Explain your approach in plain English before writing anything. "
  "^Then walk your own example through it by hand, out loud, with the interviewer watching. "
  "^You'll catch about half your bugs here, before they cost you anything, because tracing an idea "
  "is far faster than debugging code. "
  "^And an interviewer who has heard a clear plan will forgive a syntax error. One who has watched "
  "you type in silence for ten minutes will not.",
  cells=steps([("explain it in plain English","before a single line",True),
               ("walk your example by hand","out loud",True),
               ("catch bugs while they are free","tracing beats debugging",True),
               ("a heard plan buys forgiveness","silence does not",True)])),

 dict(id="s08", type="QUIZ_CARD", transition="iris", background="zoneC", narration=
  "^Quick one. You've read the problem, you've spotted that the array is sorted and it's asking for "
  "a pair. What should you do next? "
  "^Start writing the two-pointer code straight away. ^Say your candidate pattern out loud and walk "
  "through an example. ^Or check whether a hash map might be faster. "
  "Have a think, and pause the video if you'd like a moment. "
  "^Ready? Say it out loud and walk an example. The code will take four minutes whenever you write "
  "it. The plan is what's being graded, and it's what saves you if the pattern turns out to be wrong.",
  data={"quiz":{"question":"Sorted input, asking for a pair. Next move?",
    "options":[{"text":"start writing the code"},{"text":"say the pattern, walk an example"},
               {"text":"check if a hash map is faster"}],
    "answerIndex":1,"why":"The plan is what is being graded, and it is cheap to change."}},
  anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.options.2.atWord","quiz.revealAtWord"]),

 dict(id="s09", type="DSA_FRAMEWORK", transition="fade", background="zoneA", key="dsaFramework",
  headline="Five · [code it clean]", color="blue", caption="now, and not before",
  narration=
  "^Now you write it, and the goal is readable rather than clever. "
  "^Use names a stranger could follow: left and right, not i and j, when left and right is what they "
  "mean. ^Start with the simple version that works. "
  "^Do not optimise while you type, because premature optimisation in an interview reads as "
  "uncertainty, and it's much easier to speed up correct code than to correct fast code.",
  cells=steps([("readable beats clever","a stranger has to follow it",True),
               ("name things properly","left and right, not i and j",True),
               ("simple version first","get it working",True),
               ("do not optimise while typing","speed up correct code, not the reverse",True)])),

 dict(id="s10", type="DSA_FRAMEWORK", transition="fade", background="zoneA", key="dsaFramework",
  headline="Six · [test and analyse]", color="blue", caption="finish properly",
  narration=
  "^Trace your own code with the example, out loud, line by line. Find the bug yourself rather than "
  "letting the interviewer find it, because one of those is a much better look than the other. "
  "^Then run your edge cases, the ones you wrote down back in step one. "
  "^And state your time and space complexity without being asked. "
  "^That last one costs you ten seconds and it's the difference between finished and abandoned.",
  cells=steps([("trace it out loud","find your own bug",True),
               ("run the edge cases","the ones from step one",True),
               ("state time and space","without being asked",True),
               ("ten seconds","finished, versus abandoned",True)])),

 dict(id="s11", type="DSA_SIGNALS", transition="wipe", background="zoneC", key="dsaSignals",
  headline="The whole [signal table]", color="yellow", caption="ten patterns, one page",
  narration=
  "Here's the table this whole series builds, and it's worth writing out by hand once. "
  "^Sorted plus a pair means two pointers. ^Contiguous, or subarray, means sliding window. "
  "^Sorted plus find means binary search. ^Frequency, or have I seen this, means a hash map. "
  "^Nested, or brackets, means a stack. ^Shortest, or fewest steps, means breadth-first search. "
  "^All combinations means backtracking. ^Number of ways, or minimum cost, means dynamic programming. "
  "^Intervals or scheduling means sort, then greedy. ^And cycle, or the middle, means fast and slow "
  "pointers.",
  cells=[{"label":"sorted + pair","sub":"two pointers","mark":True},
         {"label":"contiguous, subarray","sub":"sliding window","mark":True},
         {"label":"sorted + find","sub":"binary search","mark":True},
         {"label":"frequency, seen before","sub":"hash map","mark":True},
         {"label":"nested, brackets","sub":"stack","mark":True},
         {"label":"shortest, fewest steps","sub":"BFS","mark":True},
         {"label":"all combinations","sub":"backtracking","mark":True},
         {"label":"ways, min cost","sub":"dynamic programming","mark":True},
         {"label":"intervals, schedule","sub":"sort, then greedy","mark":True},
         {"label":"cycle, middle","sub":"fast and slow pointers","mark":True}]),

 dict(id="s12", type="RECAP", transition="fade", background="zoneB", narration=
  "Three things to take with you. %Read before you reach, because a pattern chosen from half a "
  "problem is a wrong pattern. %The signals are in the question, and circling them is a real "
  "technique rather than a slogan. And %say the plan out loud, because the plan is what is actually "
  "being graded.",
  data={"heading":"The method, in three lines","points":[
    {"text":"Read before you reach"},{"text":"The signals are in the question"},{"text":"Say the plan out loud"}]},
  anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

 dict(id="s13", type="OUTRO_CTA", transition="fade", background="zoneA", narration=
  "Next up is pattern one, two pointers, where fifteen checks become three. Ten patterns, one per "
  "episode, and then five real problems solved with nothing but this method.",
  data={"message":"Ten patterns, one per episode","sub":"next: Two Pointers"}, anchors=[]),
 ]}
write(T, 'dsa/ep00.json')
print("EP00:", len(T["scenes"]), "scenes")
