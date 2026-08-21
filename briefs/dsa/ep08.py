# -*- coding: utf-8 -*-
# EP08 — Dynamic Programming. Source: dsa-pattern-dojo, pattern `dp` (all 7 steps + challenge).
import json
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _guard import write
CODE = [
 "def climb_stairs(n):",
 "    if n <= 2: return n",
 "",
 "    prev2, prev1 = 1, 2",
 "",
 "    for i in range(3, n + 1):",
 "        current = prev1 + prev2",
 "        prev2 = prev1",
 "        prev1 = current",
 "",
 "    return prev1",
]
def code(teach):
    return [{"text": t, **({"detail": teach[i], "teach": True} if i in teach else {})} for i, t in enumerate(CODE)]
def stairs(vals, marks=()):   # vals: list of (stair, value or None)
    return [{"label": (str(v) if v is not None else "·"), "sub": f"stair {n}", **({"mark":True} if n in marks else {})}
            for n,v in vals]

T = {
 "meta": {"topic":"Dynamic Programming","format":"long","fps":30,"screenplay":"dojo",
  "onePayoff":"You can turn an exponential recursion into a loop by refusing to solve the same subproblem twice.",
  "openLoop":"Stair forty: a hundred million recalculations, or forty additions.",
  "analogy":"THE STAIRCASE - counting the ways up, where each stair is built from the two below it.",
  "topicAxes":["economic-pain","entity-novelty"],
  "seo":{"title":"Dynamic Programming — Never Solve The Same Thing Twice",
   "altTitles":["Dynamic Programming Explained Until It Sticks (DSA Pattern 8)",
                "Climbing Stairs, And Why It Is Secretly Fibonacci"],
   "hook":"A hundred million recalculations, or forty additions.",
   "breakdown":"dynamic programming traced line by line, from the recurrence to the two-variable trick",
   "chapters":[{"id":"s01","title":"A hundred million, or forty"},
               {"id":"s03","title":"The words that give it away"},
               {"id":"s04","title":"The staircase"},
               {"id":"s05","title":"The two things you always need"},
               {"id":"s06","title":"Two sticky notes"},
               {"id":"s07","title":"Building stair three"},
               {"id":"s10","title":"It was Fibonacci all along"},
               {"id":"s11","title":"Why the recursion is so slow"},
               {"id":"s13","title":"The four problems to go and do"}],
   "sources":["Pattern set, steps and problem lists: https://github.com/san-gitlogin/dsa-pattern-dojo",
              "Interactive dojo: https://san-gitlogin.github.io/dsa-pattern-dojo/"],
   "queries":["dynamic programming explained simply","climbing stairs leetcode","dp base case and recurrence",
     "memoization vs tabulation","why is recursion slow fibonacci","bottom up dp explained",
     "house robber explained","coin change dp","longest increasing subsequence",
     "dsa patterns for interviews","leetcode 70 climbing stairs","faang interview dsa patterns"],
   "hashtags":["#dsa","#leetcode","#dynamicprogramming","#codinginterview","#thenbxstudio"],
   "tags":["dsa","data structures and algorithms","dynamic programming","dp","memoization","leetcode",
     "coding interview","faang interview","python","algorithms","fibonacci","climbing stairs",
     "interview preparation","dsa patterns","the nbx studio"]}},
 "brand":{"theme":"moderndark","design":"moderndark","themeLight":"daylight","background":"grid",
  "channel":"THE NBX STUDIO","logo":"img:channel_logo.png"},
 "thumbnail":{"title":"100M vs 40 STEPS","badge":"Dynamic Programming","asset":"si:python"},
 "scenes":[

 dict(id="s01", type="HOOK", background="zoneA", narration=
  "A hundred million recalculations, or forty additions. Same staircase, same answer.",
  data={"headline":"100M vs 40 STEPS","subtext":"same staircase, same answer",
        "heroAsset":"si:python","headlineAtWord":1,"heroAtWord":7},
  anchors=["headlineAtWord","heroAtWord"]),

 dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", narration=
  "Welcome back to the Dojo. This is dynamic programming, pattern eight of ten, and it's the one "
  "with the frightening name and a genuinely simple idea underneath: never solve the same thing twice.",
  data={"title":"DYNAMIC PROGRAMMING","subtitle":"pattern eight of ten"}, anchors=[]),

 dict(id="s03", type="DSA_SIGNALS", transition="dip", background="zoneA", key="dsaSignals",
  headline="The words that [give it away]", color="green", caption="signals in the question",
  narration=
  "Three phrasings cover most of it. ^Number of ways, which is counting rather than listing. "
  "^Minimum or maximum cost, where you're optimising. ^Longest or shortest something. "
  "^And the real test: can the answer for n be built from answers to smaller versions of n? "
  "^If the question wants the actual list rather than a count, that's backtracking from last episode. "
  "^And if a locally best choice is always globally right, greedy is cheaper. "
  "Counting, optimising, and built from smaller answers. Those three together mean dynamic programming.",
  cells=[{"label":"number of ways","sub":"counting, not listing","mark":True},
         {"label":"min or max cost","sub":"you are optimising","mark":True},
         {"label":"longest / shortest","sub":"same family","mark":True},
         {"label":"built from smaller n","sub":"the real test","mark":True},
         {"label":"wants the actual list","sub":"that is backtracking","color":"red","mark":True},
         {"label":"local choice always right","sub":"then greedy is cheaper","color":"red","mark":True}]),

 dict(id="s04", type="DSA_TRACE_DP", transition="wipe", background="zoneC", key="dsaDp",
  headline="Five stairs, [how many ways?]", color="green", caption="the question",
  codeTitle="climb_stairs.py",
  narration=
  "You're climbing a staircase of five steps, and each move can be one step or two steps. "
  "How many different ways are there to reach the top? "
  "Your first instinct is probably to try every possibility, and for five stairs that's fine: "
  "^stair one, ^stair two, ^stair three, ^stair four, ^stair five, and the answer turns out to be eight. "
  "But try that instinct on forty stairs and your laptop will still be thinking about it tomorrow.",
  lines=code({}), cells=stairs([(1,None),(2,None),(3,None),(4,None),(5,None)], marks=(1,2,3,4,5)),
  vars=[{"label":"n = 5"}]),

 dict(id="s05", type="DSA_TRACE_DP", transition="push", background="zoneA", key="dsaDp",
  headline="Two things, [every time]", color="green", caption="base cases and a recurrence",
  codeTitle="climb_stairs.py",
  narration=
  "Every dynamic programming problem needs exactly two things, and finding them is the whole job. "
  "First, the base cases: the smallest problems you know without thinking. "
  "|One stair has ^one way, just step up. Two stairs has ^two ways: two single steps, or one double. "
  "%Those two are given, not derived. "
  "Second, the recurrence: how a bigger answer is built from smaller ones. "
  "To land on stair n you either came from stair n minus one or from stair n minus two, "
  "so %the ways to reach n are the ways to reach those two, added together.",
  lines=code({1:"The two smallest staircases you know by heart."}),
  cells=stairs([(1,1),(2,2),(3,None),(4,None),(5,None)], marks=(1,2)),
  vars=[{"label":"base: 1 and 2","mark":True},{"label":"f(n)=f(n-1)+f(n-2)","mark":True}]),

 dict(id="s06", type="DSA_TRACE_DP", transition="fade", background="zoneA", key="dsaDp",
  headline="Two [sticky notes]", color="green", caption="all the memory you need",
  codeTitle="climb_stairs.py",
  narration=
  "|Prev2 equals one and prev1 equals two. Think of those as two sticky notes. "
  "%Prev2 remembers the stair two below, %and prev1 remembers the stair one below. "
  "Why only two notes rather than a whole table? Because the recurrence only ever looks back two "
  "places, so anything older than that can be thrown away. "
  "Most people write this with a full array first, and that's completely fine, "
  "but noticing you only need two variables is what takes the space from order n down to constant.",
  lines=code({3:"Two sticky notes: one stair back, and two stairs back."}),
  cells=stairs([(1,1),(2,2),(3,None),(4,None),(5,None)], marks=(1,2)),
  vars=[{"label":"prev2 = 1","mark":True},{"label":"prev1 = 2","mark":True}]),

 dict(id="s07", type="DSA_TRACE_DP", transition="fade", background="zoneA", key="dsaDp",
  headline="Building stair [three]", color="green", caption="the first derived answer",
  codeTitle="climb_stairs.py",
  narration=
  "|The loop starts at stair three, because one and two are already known. "
  "|Current equals prev1 plus prev2, so two plus one is ^three ways to reach stair three. "
  "|Then the notes slide forward: prev2 takes prev1's old value, |and prev1 takes the answer we just "
  "computed. %Prev2 is two now, %and prev1 is three. "
  "That sliding is the part people get wrong, because the order matters: overwrite prev1 first and "
  "you've destroyed the number prev2 was about to take.",
  lines=code({5:"Start at three: one and two are already known.",
              6:"The new answer is the two below it, added.",
              7:"Slide the notes forward...",
              8:"...in this order, or you lose a value."}),
  cells=stairs([(1,1),(2,2),(3,3),(4,None),(5,None)], marks=(3,)),
  vars=[{"label":"prev2 = 2","mark":True},{"label":"prev1 = 3","mark":True}]),

 dict(id="s08", type="QUIZ_CARD", transition="iris", background="zoneC", narration=
  "^Straight from the Dojo. Stair three takes three ways and stair two takes two ways. "
  "So how many ways to reach stair four? "
  "^Four ways. ^Five ways. ^Six ways. ^Or three ways. "
  "Have a think, and pause the video if you'd like a moment. "
  "^Ready? Five, because three plus two is five, and every route to stair four arrived from one of "
  "those two stairs below it.",
  data={"quiz":{"question":"Stair 3 = 3 ways, stair 2 = 2 ways. Stair 4?",
    "options":[{"text":"4 ways"},{"text":"5 ways"},{"text":"6 ways"},{"text":"3 ways"}],
    "answerIndex":1,"why":"Every route to stair 4 came from stair 3 or stair 2."}},
  anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.options.2.atWord",
           "quiz.options.3.atWord","quiz.revealAtWord"]),

 dict(id="s09", type="DSA_TRACE_DP", transition="fade", background="zoneB", key="dsaDp",
  headline="Four, then [five]", color="green", caption="the table fills once",
  codeTitle="climb_stairs.py",
  narration=
  "|Stair four is three plus two, which is ^five ways, and the notes slide again. "
  "|Stair five is five plus three, which is ^eight ways. %That's our answer. "
  "Five stairs, and we did five additions. Every stair was computed exactly once and then never "
  "touched again, which is the entire point of the pattern and the reason for the name.",
  lines=code({6:"Stair four: three plus two.",
              6:"Stair five: five plus three."}),
  cells=stairs([(1,1),(2,2),(3,3),(4,5),(5,8)], marks=(4,5)),
  vars=[{"label":"return 8","mark":True}]),

 dict(id="s10", type="DSA_TRACE_DP", transition="push", background="zoneA", key="dsaDp",
  headline="It was [Fibonacci] all along", color="green", caption="one, two, three, five, eight",
  codeTitle="climb_stairs.py",
  narration=
  "Look at the numbers we produced: ^one, ^two, ^three, ^five, ^eight. "
  "That's the Fibonacci sequence, and climbing stairs is Fibonacci wearing a hat. "
  "A surprising number of dynamic programming problems turn out to be a famous sequence in disguise, "
  "and spotting that is often faster than deriving anything. "
  "If you write out the first few answers by hand and the pattern looks familiar, trust it and check it.",
  lines=code({}),
  cells=stairs([(1,1),(2,2),(3,3),(4,5),(5,8)], marks=(1,2,3,4,5))),

 dict(id="s11", type="DSA_COST", transition="dip", background="zoneC", key="dsaCost",
  headline="Why the [recursion] hurts", color="blue", caption="the same work, over and over",
  narration=
  "Here's what dynamic programming is actually saving you from. "
  "Written as plain recursion, stair five asks for stair four and stair three. Stair four asks for "
  "three and two. Stair three gets computed twice already, and it gets worse fast. "
  "^For stair ten that's about a hundred and eighty calls. "
  "^For stair forty it's over three hundred million, nearly all of them recomputing answers the "
  "program already had. ^The loop does forty additions. "
  "^Same recurrence, same answer: the only difference is whether you write down what you worked out.",
  cells=[{"label":"recursion, n=10","sub":"~180 calls","value":25,"text":"dropped","mark":True},
         {"label":"recursion, n=40","sub":"~331,000,000 calls","value":100,"text":"dropped","mark":True},
         {"label":"loop, n=40","sub":"40 additions","value":5,"mark":True},
         {"label":"same recurrence","sub":"the difference is remembering","value":45,"mark":True}]),

 dict(id="s12", type="DSA_SIGNALS", transition="fade", background="zoneB", key="dsaSignals",
  headline="How to actually [find it]", color="green", caption="the recipe, in order",
  narration=
  "When a dynamic programming question lands and your mind goes blank, do these in order. "
  "^Write out the answers for n equals one, two, three and four by hand. Just brute force them. "
  "^Then ask how each one relates to the ones before it, and that relationship is your recurrence. "
  "^Pin down the base cases, the smallest inputs you can answer without thinking. "
  "^Write the loop from the base cases upward. ^And only then ask whether you can drop the array "
  "for a couple of variables. "
  "That order matters, because optimising space before you have a correct recurrence is how people "
  "waste twenty minutes and end up with neither.",
  cells=[{"label":"1 · brute force small n","sub":"by hand, on paper","mark":True},
         {"label":"2 · find the relationship","sub":"that is the recurrence","mark":True},
         {"label":"3 · pin the base cases","sub":"the smallest you just know","mark":True},
         {"label":"4 · loop upward","sub":"from the base cases","mark":True},
         {"label":"5 · shrink the memory","sub":"only once it is correct","mark":True}]),

 dict(id="s13", type="LIST_BUILD", transition="wipe", background="zoneB", narration=
  "Four to go and do. %Climbing Stairs is the one we just wrote. "
  "%House Robber is the same shape with a decision at each step. "
  "%Coin Change moves you from counting to optimising. "
  "And %Longest Increasing Subsequence is where the recurrence stops being obvious.",
  data={"heading":"Do these four, in this order","items":[
    {"icon":"lucide:trending-up","text":"LeetCode 70","detail":"Climbing Stairs"},
    {"icon":"lucide:home","text":"LeetCode 198","detail":"House Robber"},
    {"icon":"lucide:coins","text":"LeetCode 322","detail":"Coin Change"},
    {"icon":"lucide:bar-chart","text":"LeetCode 300","detail":"Longest Increasing Subsequence"}]},
  anchors=["items.0.atWord","items.1.atWord","items.2.atWord","items.3.atWord"]),

 dict(id="s14", type="RECAP", transition="fade", background="zoneB", narration=
  "Three things to take with you. The signal is %counting or optimising, built from smaller answers. "
  "You always need %a recurrence and base cases, and neither one alone is enough. "
  "And the saving comes from %solving each subproblem once, then only reading it.",
  data={"heading":"Dynamic Programming, in three lines","points":[
    {"text":"Counting, from smaller answers"},{"text":"Recurrence plus base cases"},{"text":"Solve once, then read"}]},
  anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

 dict(id="s15", type="OUTRO_CTA", transition="fade", background="zoneA", narration=
  "Next in the Dojo is greedy, which is what you get when the locally best choice happens to be the "
  "globally right one, and no table is needed at all. Go and do Climbing Stairs first.",
  data={"message":"All ten patterns, one per episode","sub":"next: Greedy"}, anchors=[]),
 ]}
write(T, 'dsa/ep08.json')
print("EP08:", len(T["scenes"]), "scenes")
