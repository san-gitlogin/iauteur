# -*- coding: utf-8 -*-
# EP09 — Greedy. Source: dsa-pattern-dojo, pattern `greedy` (all 6 steps + challenge).
import json
CODE = [
 "def merge_intervals(intervals):",
 "    intervals.sort(key=lambda x: x[0])",
 "    merged = [intervals[0]]",
 "",
 "    for start, end in intervals[1:]:",
 "        if start <= merged[-1][1]:",
 "            merged[-1][1] = max(merged[-1][1], end)",
 "        else:",
 "            merged.append([start, end])",
 "",
 "    return merged",
]
def code(teach):
    return [{"text": t, **({"detail": teach[i], "teach": True} if i in teach else {})} for i, t in enumerate(CODE)]
def ivals(rows):   # rows = [(label, sub, state, mark)]
    return [{"label":l,"sub":s,"value":18, **({"text":st} if st else {}), **({"mark":True} if m else {})}
            for l,s,st,m in rows]

CODE2 = [
 "def max_meetings(intervals):",
 "    intervals.sort(key=lambda x: x[1])",
 "    count, last_end = 0, float('-inf')",
 "",
 "    for start, end in intervals:",
 "        if start >= last_end:",
 "            count += 1",
 "            last_end = end",
 "",
 "    return count",
]
def code2(teach):
    return [{"text": t, **({"detail": teach[i], "teach": True} if i in teach else {})} for i, t in enumerate(CODE2)]

T = {
 "meta": {"topic":"Greedy","format":"long","fps":30,"screenplay":"dojo",
  "onePayoff":"You can merge or schedule intervals in one pass, once you know what to sort by.",
  "openLoop":"Four meetings, three rooms. The sort does most of the work — but which sort?",
  "analogy":"THE MEETING ROOM - overlapping bookings collapsed into blocks.",
  "topicAxes":["entity-novelty","economic-pain"],
  "seo":{"title":"Greedy — Sort First, Then Never Look Back",
   "altTitles":["Greedy Explained Until It Sticks (DSA Pattern 9)",
                "Merge Intervals, And Why Sorting Is Half The Answer"],
   "hook":"Four meetings, three blocks. The sort does the work.",
   "breakdown":"the greedy interval pattern traced line by line, and how to know greedy is even safe",
   "chapters":[{"id":"s01","title":"Four meetings, three blocks"},
               {"id":"s03","title":"The words that give it away"},
               {"id":"s04","title":"The meeting room"},
               {"id":"s05","title":"Sort first, always"},
               {"id":"s06","title":"Overlap, so merge"},
               {"id":"s09","title":"A gap, so start again"},
               {"id":"s09a","title":"Same pattern, new question"},
               {"id":"s09d","title":"Sort by end, and win"},
               {"id":"s11","title":"When greedy is actually safe"},
               {"id":"s12","title":"The four problems to go and do"}],
   "sources":["Pattern set, steps and problem lists: https://github.com/san-gitlogin/dsa-pattern-dojo",
              "Interactive dojo: https://san-gitlogin.github.io/dsa-pattern-dojo/"],
   "queries":["greedy algorithm explained","merge intervals python","interval scheduling problem",
     "when is greedy correct","greedy vs dynamic programming","sort by start or end time",
     "non overlapping intervals","meeting rooms 2 solution","insert interval leetcode",
     "dsa patterns for interviews","leetcode 56 merge intervals","faang interview dsa patterns"],
   "hashtags":["#dsa","#leetcode","#greedy","#codinginterview","#thenbxstudio"],
   "tags":["dsa","data structures and algorithms","greedy","intervals","merge intervals","leetcode",
     "coding interview","faang interview","python","algorithms","scheduling","sorting",
     "interview preparation","dsa patterns","the nbx studio"]}},
 "brand":{"theme":"moderndark","design":"moderndark","themeLight":"daylight","background":"grid",
  "channel":"THE NBX STUDIO","logo":"img:channel_logo.png"},
 "thumbnail":{"title":"SORT. THEN DECIDE.","badge":"Greedy","asset":"si:python"},
 "scenes":[

 dict(id="s01", type="HOOK", background="zoneA", narration=
  "Four meetings, three blocks of time. The sort does most of the work. But which sort?",
  data={"headline":"SORT. THEN DECIDE.","subtext":"four meetings, three blocks",
        "heroAsset":"si:python","headlineAtWord":1,"heroAtWord":8},
  anchors=["headlineAtWord","heroAtWord"]),

 dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", narration=
  "Welcome back to the Dojo. This is greedy, pattern nine of ten. It's the shortest code in the "
  "whole series, and the one you're most likely to get wrong for a reason you can't see.",
  data={"title":"GREEDY","subtitle":"pattern nine of ten"}, anchors=[]),

 dict(id="s03", type="DSA_SIGNALS", transition="dip", background="zoneA", key="dsaSignals",
  headline="The words that [give it away]", color="orange", caption="signals in the question",
  narration=
  "^Intervals is the loudest one, and it usually means meetings, bookings or ranges. "
  "^Schedule, or rooms, or how many at once. ^Merge, or overlap. "
  "^Minimum number of something, where you want the fewest. "
  "^But if a choice now can ruin a choice later, greedy is unsafe and you want dynamic programming. "
  "^And if you can't prove the local choice is always right, don't reach for greedy in an interview. "
  "Intervals plus a sort is the combination. The hard part is knowing what to sort by.",
  cells=[{"label":"intervals","sub":"meetings, bookings, ranges","mark":True},
         {"label":"schedule / rooms","sub":"how many at once","mark":True},
         {"label":"merge, overlap","sub":"collapse them together","mark":True},
         {"label":"minimum number of","sub":"you want the fewest","mark":True},
         {"label":"a choice now hurts later","sub":"then greedy is unsafe","color":"red","mark":True},
         {"label":"cannot prove it","sub":"then do not claim it","color":"red","mark":True}]),

 dict(id="s04", type="DSA_TRACE_INTERVALS", transition="wipe", background="zoneC", key="dsaIntervals",
  headline="Four bookings, [some clash]", color="orange", caption="the room diary",
  codeTitle="merge_intervals.py",
  narration=
  "You're coordinating a meeting room. Four bookings came in: "
  "^one to three, ^two to six, ^eight to ten, and ^fifteen to eighteen. "
  "Some of those clash. The one that runs from two until six begins while the first meeting is still "
  "going, so those two are really one long block of time. "
  "Your job is to collapse the diary into the smallest set of blocks that covers everything.",
  lines=code({}),
  cells=ivals([("1-3","meeting A",None,True),("2-6","meeting B",None,True),
               ("8-10","meeting C",None,True),("15-18","meeting D",None,True)])),

 dict(id="s05", type="DSA_TRACE_INTERVALS", transition="push", background="zoneA", key="dsaIntervals",
  headline="Sort [first]", color="orange", caption="by start time",
  codeTitle="merge_intervals.py",
  narration=
  "|Intervals dot sort, keyed on x zero, sorts every booking by its start time. "
  "The lambda is Python's way of writing a throwaway function, and here it just grabs the first "
  "number out of each pair. "
  "%Sorted by start. Now here's why that matters so much: once bookings are in start order, "
  "anything that overlaps the current block must be the very next one along. "
  "Sorting turns a question about every possible pair into a question about neighbours, "
  "and that's the whole reason this runs in one pass. "
  "|Then merged starts holding ^just the first booking.",
  lines=code({1:"Sort by start time. Everything depends on this.",
              2:"The first block is simply the earliest booking."}),
  cells=ivals([("1-3","first block",None,True),("2-6","meeting B",None,False),
               ("8-10","meeting C",None,False),("15-18","meeting D",None,False)]),
  vars=[{"label":"sorted by start","mark":True}]),

 dict(id="s06", type="DSA_TRACE_INTERVALS", transition="fade", background="zoneA", key="dsaIntervals",
  headline="Overlap, so [merge]", color="orange", caption="two into one",
  codeTitle="merge_intervals.py",
  narration=
  "|Next booking is ^two to six. |Does its start come before the current block ends? "
  "Two is less than or equal to three, so yes, they overlap. "
  "|So we stretch the block's end to whichever end is later, which is six. "
  "^One to three and two to six have become ^one to six. "
  "%One block now covers both meetings, and notice we never created anything new, we only widened "
  "what was already there.",
  lines=code({4:"Walk the rest, in sorted order.",
              5:"Does this one start before the block ends?",
              6:"Then stretch the block to the later end."}),
  cells=ivals([("1-6","merged block","done",True),("2-6","absorbed","dropped",True),
               ("8-10","meeting C",None,False),("15-18","meeting D",None,False)]),
  vars=[{"label":"merged = [[1,6]]","mark":True}]),

 dict(id="s07", type="QUIZ_CARD", transition="iris", background="zoneC", narration=
  "^Straight from the Dojo. One to three and two to six overlapped, because B started before A "
  "finished. So what about the block one to six, and the booking eight to ten? "
  "^They overlap. ^Or they do not overlap, because eight starts after six ends. "
  "Have a think, and pause the video if you'd like a moment. "
  "^Ready? They don't overlap. Eight comes after six, so there's a genuine gap between them, "
  "and a gap means a new block rather than a wider one.",
  data={"quiz":{"question":"Block [1,6] and booking [8,10] — overlap?",
    "options":[{"text":"yes, they overlap"},{"text":"no — 8 starts after 6 ends"}],
    "answerIndex":1,"why":"A gap means a new block, not a wider one."}},
  anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.revealAtWord"]),

 dict(id="s08", type="DSA_TRACE_INTERVALS", transition="fade", background="zoneB", key="dsaIntervals",
  headline="A gap, so [start again]", color="orange", caption="a second block",
  codeTitle="merge_intervals.py",
  narration=
  "|Next is ^eight to ten. Does eight come before six? It doesn't, so there's a gap. "
  "|The else branch runs and we append it as ^a separate block. "
  "%Two blocks now. "
  "That's the entire decision the algorithm ever makes: overlap means widen, gap means append. "
  "One comparison per booking, and it never revisits a decision it has already taken. "
  "That refusal to look back is exactly what the word greedy means.",
  lines=code({5:"Eight does not start before six. No overlap.",
              8:"So this becomes a block of its own."}),
  cells=ivals([("1-6","block one","done",False),("8-10","block two",None,True),
               ("15-18","meeting D",None,False)]),
  vars=[{"label":"merged = [[1,6],[8,10]]","mark":True}]),

 dict(id="s09", type="DSA_TRACE_INTERVALS", transition="fade", background="zoneB", key="dsaIntervals",
  headline="And the [last one]", color="orange", caption="three blocks, done",
  codeTitle="merge_intervals.py",
  narration=
  "|Last booking, ^fifteen to eighteen. Fifteen is well past ten, so another gap, "
  "and it becomes ^a third block. "
  "|Return merged, and %the diary is three blocks instead of four bookings. "
  "The whole thing cost one sort plus one walk, which is n log n for the sort and n for the walk. "
  "The sort dominates, so the honest complexity to quote is n log n.",
  lines=code({8:"Another gap, another block.",
              10:"Hand back the collapsed diary."}),
  cells=ivals([("1-6","block one","done",False),("8-10","block two","done",False),
               ("15-18","block three",None,True)]),
  vars=[{"label":"return 3 blocks","mark":True}]),


 dict(id="s09a", type="DSA_TRACE_INTERVALS", transition="wipe", background="zoneC", key="dsaIntervals",
  headline="Same pattern, [new question]", color="orange", caption="attend the most meetings",
  codeTitle="max_meetings.py",
  narration=
  "Now change the question, and keep everything else. Three bookings this time: "
  "^one to ten, ^two to three, and ^four to five. "
  "You can only be in one room at a time, and you want to attend as many meetings as you possibly can. "
  "Not merge them, not count the blocks. Attend the most. "
  "|Same function shape as before, and watch what happens if you reach for the sort you already know.",
  lines=code2({0:"Same shape as before. Different question."}),
  cells=ivals([("1-10","meeting A",None,True),("2-3","meeting B",None,True),
               ("4-5","meeting C",None,True)])),

 dict(id="s09b", type="DSA_TRACE_INTERVALS", transition="fade", background="zoneA", key="dsaIntervals",
  headline="Sort by start, and [lose]", color="orange", caption="the greedy that goes wrong",
  codeTitle="max_meetings.py",
  narration=
  "|Sorted by start time, the earliest booking is ^one to ten, |so greedy takes it and counts it. "
  "It began first, and taking it felt obviously right. "
  "But it runs all the way until ten, so ^two to three is gone, and ^four to five is gone with it. "
  "|We return, and %one meeting attended. "
  "And the painful part is that you could have attended two. The code ran, it returned a number, "
  "and the number is simply wrong. Nothing crashed to tell you.",
  lines=code2({1:"Sorted by x[0] — the start time. This is the mistake.",
               5:"It starts earliest, so greedy takes it.",
               9:"One meeting. And two were possible."}),
  cells=ivals([("1-10","taken first",None,True),("2-3","blocked","dropped",True),
               ("4-5","blocked","dropped",True)]),
  vars=[{"label":"count = 1  (should be 2)","mark":True}]),

 dict(id="s09c", type="QUIZ_CARD", transition="iris", background="zoneC", narration=
  "^So here is the question the whole pattern turns on. Sorting by start time just cost us a meeting. "
  "What should we sort by instead, to attend as many as possible? "
  "^By how long each meeting lasts, shortest first. ^Or by end time, earliest finisher first. "
  "Have a think, and pause the video if you would like a moment. "
  "^Ready? Sort by end time. Shortest-first sounds clever and it also fails, "
  "because a short meeting sat awkwardly in the middle can still block two others. "
  "What actually matters is who frees the room soonest.",
  data={"quiz":{"question":"To attend the MOST meetings, sort by what?",
    "options":[{"text":"duration, shortest first"},{"text":"end time, earliest finisher"}],
    "answerIndex":1,"why":"Finishing earliest leaves the most room for everything after it."}},
  anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.revealAtWord"]),

 dict(id="s09d", type="DSA_TRACE_INTERVALS", transition="push", background="zoneA", key="dsaIntervals",
  headline="Sort by end, and [win]", color="orange", caption="earliest finisher first",
  codeTitle="max_meetings.py",
  narration=
  "|One character changes. X one instead of x zero, so we sort on the end time. "
  "|Now the earliest finisher is ^two to three, and we take it. "
  "|Start is at least last end, so %count goes to one and last end becomes three. "
  "|Next is ^four to five. Four is not before three, so it fits, and %count goes to two. "
  "^One to ten finishes last of all, so it is considered last, and by then the room is busy. "
  "Two meetings attended instead of one, from changing a single character.",
  lines=code2({1:"x[1] is the END time. That one character is the fix.",
               5:"Free room? Then take it and remember when we finish.",
               6:"Another one attended."}),
  cells=ivals([("2-3","attended","done",True),("4-5","attended","done",True),
               ("1-10","no room left","dropped",True)]),
  vars=[{"label":"count = 2","mark":True}]),

 dict(id="s09e", type="DSA_COST", transition="dip", background="zoneB", key="dsaCost",
  headline="Why finishing [early wins]", color="blue", caption="the argument behind the key",
  narration=
  "It is worth knowing why that works, because an interviewer will ask. "
  "^Whenever you take the meeting that finishes earliest, you leave the largest possible amount of "
  "time free for everything that comes after it. "
  "^Any other first choice ends at the same time or later, so it can never leave you more room. "
  "^Which means swapping in the earliest finisher never makes your answer worse, and that is the "
  "exchange argument, said in plain English. "
  "^Say that sentence out loud in an interview and you have proved your greedy choice is safe.",
  cells=[{"label":"take the earliest finisher","sub":"leaves the most time free","value":95,"mark":True},
         {"label":"any other choice","sub":"ends the same or later","value":45,"mark":True},
         {"label":"so swapping never hurts","sub":"the exchange argument","value":80,"mark":True},
         {"label":"say it out loud","sub":"that is the proof they want","value":70,"mark":True}]),

 dict(id="s10", type="DSA_SIGNALS", transition="dip", background="zoneA", key="dsaSignals",
  headline="What to [sort by]", color="orange", caption="the decision that decides everything",
  narration=
  "Here's the part that actually separates people, and it isn't the loop. "
  "^Merging intervals? Sort by start time, because you want neighbours to be adjacent. "
  "^Picking the most non-overlapping meetings? Sort by end time, because finishing early leaves the "
  "most room for everything after it. "
  "^Minimum rooms needed? Sort the starts and ends separately and sweep through them. "
  "^Same loop shape every time, and the sort key is what changes. "
  "Get the key wrong and the code still runs, still returns something, and is quietly incorrect. "
  "That's the failure mode to be afraid of here.",
  cells=[{"label":"merge → sort by START","sub":"neighbours become adjacent","mark":True},
         {"label":"max meetings → sort by END","sub":"finishing early leaves room","mark":True},
         {"label":"min rooms → sweep both","sub":"starts and ends separately","mark":True},
         {"label":"same loop, different key","sub":"the key is the puzzle","mark":True}]),

 dict(id="s11", type="DSA_COST", transition="wipe", background="zoneC", key="dsaCost",
  headline="When greedy is [actually safe]", color="blue", caption="the question to ask yourself",
  narration=
  "Greedy is the easiest pattern to write and the easiest to be wrong about, so hold on to one test. "
  "^Greedy is safe when a locally best choice can never block a better global outcome. "
  "^Merging intervals passes that test, because widening a block never costs you anything later. "
  "^Coin change with arbitrary coin values fails it, because grabbing the biggest coin first can "
  "strand you, which is precisely why that one is dynamic programming. "
  "^So if you can't argue why the local choice is always safe, say so out loud and reach for DP instead.",
  cells=[{"label":"local best never blocks global","sub":"then greedy is safe","value":90,"mark":True},
         {"label":"merge intervals","sub":"widening costs nothing later","value":70,"mark":True},
         {"label":"coin change, odd coins","sub":"biggest first can strand you","value":30,"text":"dropped","mark":True},
         {"label":"cannot argue it?","sub":"say so, and use DP","value":50,"mark":True}]),

 dict(id="s12", type="LIST_BUILD", transition="fade", background="zoneB", narration=
  "Four to go and do. %Merge Intervals is the one we just wrote. "
  "%Insert Interval is the same idea with one booking arriving late. "
  "%Non-overlapping Intervals is where you must sort by end time instead. "
  "And %Meeting Rooms Two is the sweep, and the one that gets asked most.",
  data={"heading":"Do these four, in this order","items":[
    {"icon":"lucide:merge","text":"LeetCode 56","detail":"Merge Intervals"},
    {"icon":"lucide:plus-square","text":"LeetCode 57","detail":"Insert Interval"},
    {"icon":"lucide:scissors","text":"LeetCode 435","detail":"Non-overlapping Intervals"},
    {"icon":"lucide:users","text":"LeetCode 253","detail":"Meeting Rooms II"}]},
  anchors=["items.0.atWord","items.1.atWord","items.2.atWord","items.3.atWord"]),

 dict(id="s13", type="RECAP", transition="fade", background="zoneB", narration=
  "Three things to take with you. The signal is %intervals or scheduling. "
  "The move is %sort first, then one pass with a single comparison. "
  "And the danger is %the sort key, because the wrong one still runs and quietly lies to you.",
  data={"heading":"Greedy, in three lines","points":[
    {"text":"Intervals and scheduling"},{"text":"Sort, then one pass"},{"text":"The sort key is the trap"}]},
  anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

 dict(id="s14", type="OUTRO_CTA", transition="fade", background="zoneA", narration=
  "Last pattern next: fast and slow pointers, where two runners at different speeds tell you "
  "something no single pass ever could. Go and do Merge Intervals first.",
  data={"message":"All ten patterns, one per episode","sub":"next: Fast and Slow Pointers"}, anchors=[]),
 ]}
json.dump(T, open('/Users/santhu/iauteur/briefs/dsa/ep09.json','w'), indent=1)
print("EP09:", len(T["scenes"]), "scenes")
