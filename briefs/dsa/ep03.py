# -*- coding: utf-8 -*-
# EP03 — Binary Search. Source: dsa-pattern-dojo, pattern `binary-search` (all 8 steps + challenge).
import json
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _guard import write
CODE = [
 "def binary_search(nums, target):",
 "    left = 0",
 "    right = len(nums) - 1",
 "",
 "    while left <= right:",
 "        mid = (left + right) // 2",
 "",
 "        if nums[mid] == target:",
 "            return mid",
 "        elif nums[mid] < target:",
 "            left = mid + 1",
 "        else:",
 "            right = mid - 1",
 "",
 "    return -1",
]
def code(teach):
    return [{"text": t, **({"detail": teach[i], "teach": True} if i in teach else {})} for i, t in enumerate(CODE)]
NUMS = ["2","5","8","12","16","23","38","56","72","91"]
def row(drop=(), marks=(), done=()):
    out=[]
    for i,l in enumerate(NUMS):
        c={"label":l}
        if i in drop: c["text"]="dropped"
        elif i in done: c["text"]="done"
        if i in marks: c["mark"]=True
        out.append(c)
    return out

T = {
 "meta": {"topic":"Binary Search","format":"long","fps":30,"screenplay":"dojo",
  "onePayoff":"You can halve a sorted search space without ever writing an off-by-one bug.",
  "openLoop":"A million names, and twenty guesses. Where do the rest go?",
  "analogy":"THE GUESSING GAME - higher or lower, where every guess kills half the possibilities.",
  "topicAxes":["economic-pain","entity-novelty"],
  "seo":{"title":"Binary Search — 1,000,000 Items in 20 Guesses",
   "altTitles":["Binary Search Explained Until It Sticks (DSA Pattern 3)",
                "Why mid + 1 And Not mid — Binary Search, Properly"],
   "hook":"A million names, twenty guesses.",
   "breakdown":"binary search traced line by line, including the two off-by-one bugs everybody writes",
   "chapters":[{"id":"s01","title":"A million names, twenty guesses"},
               {"id":"s03","title":"The words that give it away"},
               {"id":"s04","title":"Why scanning hurts"},
               {"id":"s05","title":"Higher or lower"},
               {"id":"s06","title":"The boundaries"},
               {"id":"s07","title":"The first guess"},
               {"id":"s09","title":"Why mid plus one"},
               {"id":"s12","title":"Found, in three guesses"},
               {"id":"s14","title":"The two off-by-one bugs"},
               {"id":"s15","title":"The four problems to go and do"}],
   "sources":["Pattern set, steps and problem lists: https://github.com/san-gitlogin/dsa-pattern-dojo",
              "Interactive dojo: https://san-gitlogin.github.io/dsa-pattern-dojo/"],
   "queries":["binary search explained","binary search python implementation","why mid + 1 binary search",
     "binary search off by one","while left <= right explained","log n explained simply",
     "binary search on answer","search in rotated sorted array","first bad version binary search",
     "dsa patterns for interviews","leetcode binary search problems","faang interview dsa patterns"],
   "hashtags":["#dsa","#leetcode","#binarysearch","#codinginterview","#thenbxstudio"],
   "tags":["dsa","data structures and algorithms","binary search","leetcode","coding interview",
     "faang interview","python","algorithms","logarithmic time","sorted array","interview preparation",
     "software engineering interview","dsa patterns","off by one","the nbx studio"]}},
 "brand":{"theme":"moderndark","design":"moderndark","themeLight":"daylight","background":"grid",
  "channel":"THE NBX STUDIO","logo":"img:channel_logo.png"},
 "thumbnail":{"title":"1,000,000 IN 20","badge":"Binary Search","asset":"si:python"},
 "scenes":[

 dict(id="s01", type="HOOK", background="zoneA", narration=
  "A million names, and twenty guesses. So where do the other nine hundred thousand names go?",
  data={"headline":"1,000,000 IN 20","subtext":"twenty guesses, every time",
        "heroAsset":"si:python","headlineAtWord":1,"heroAtWord":8},
  anchors=["headlineAtWord","heroAtWord"]),

 dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", narration=
  "Welcome back to the Dojo. This is Binary Search, pattern three of ten. Everybody thinks they know it, "
  "and then writes an infinite loop in the interview, so we're going to be careful about two lines.",
  data={"title":"BINARY SEARCH","subtitle":"pattern three of ten"}, anchors=[]),

 dict(id="s03", type="DSA_SIGNALS", transition="dip", background="zoneA", key="dsaSignals",
  headline="The words that [give it away]", color="purple", caption="signals in the question",
  narration=
  "Read the question first, as always. The input is ^sorted, which is the precondition, and without it none of this "
  "works. You're asked to ^find something, a value or a position. Or you want the ^first or last thing that "
  "satisfies a rule, which is the sneaky version. Or the ^kth smallest, which is that shape again. "
  "^If log n appears in the required complexity, the interviewer has told you the answer outright. "
  "^Not sorted? Then sort it first, or pick a different pattern. "
  "Sorted plus find is the pair to watch, because sorted is what makes elimination safe.",
  cells=[{"label":"sorted","sub":"the precondition, not a detail","mark":True},
         {"label":"find / search","sub":"a value, or a position","mark":True},
         {"label":"first or last that...","sub":"the sneaky version","mark":True},
         {"label":"kth smallest","sub":"the same shape again","mark":True},
         {"label":"O(log n) required","sub":"they just told you the answer","color":"green","mark":True},
         {"label":"NOT sorted","sub":"sort it, or pick another pattern","color":"red","mark":True}]),

 dict(id="s04", type="DSA_COST", transition="wipe", background="zoneC", key="dsaCost",
  headline="Why [scanning] hurts", color="blue", caption="the same list, two costs",
  narration=
  "Scanning means checking every item until you hit the one you're after. "
  "^On ten items that's up to ten checks, which is nothing at all. "
  "^On a million it's up to a million, ^and on a billion it's a billion. "
  "Binary search does ^four checks on ten items, ^twenty on a million, ^and thirty on a billion. "
  "Look hard at those last two, because going from a million to a billion, a thousand times the data, "
  "costs you ten extra guesses. That's what logarithmic means in practice.",
  cells=[{"label":"scan, n=10","sub":"up to 10 checks","value":8,"text":"dropped","mark":True},
         {"label":"scan, n=1M","sub":"up to 1,000,000","value":70,"text":"dropped","mark":True},
         {"label":"scan, n=1B","sub":"up to 1,000,000,000","value":100,"text":"dropped","mark":True},
         {"label":"binary, n=10","sub":"4 checks","value":4,"mark":True},
         {"label":"binary, n=1M","sub":"20 checks","value":6,"mark":True},
         {"label":"binary, n=1B","sub":"30 checks","value":8,"mark":True}]),

 dict(id="s05", type="DSA_TRACE_BSEARCH", transition="push", background="zoneA", key="dsaBsearch",
  headline="Higher, or [lower]", color="purple", caption="ten sorted numbers",
  codeTitle="binary_search.py",
  narration=
  "You know this game already. A friend thinks of a number between one and a hundred, and every time "
  "you guess they say higher or lower. Guessing one, then two, then three could take a hundred turns. "
  "So you guess fifty. Higher. Then seventy-five. Lower. Then sixty-two. Every guess throws away half "
  "of what is left, and that's the entire pattern. "
  "Here it is on ^ten sorted numbers: ^two, ^sixteen, ^fifty-six, up to ^ninety-one, "
  "and we're hunting for %twenty-three. "
  "Same game, same rule. Guess in the middle, and let the answer tell you which half to throw away.",
  lines=code({}), cells=[{**c,"mark": i in (0,2,4,7,9)} for i,c in enumerate(row())],
  vars=[{"label":"target=23","mark":True}]),

 dict(id="s06", type="DSA_TRACE_BSEARCH", transition="fade", background="zoneA", key="dsaBsearch",
  headline="Two [boundaries]", color="purple", caption="the range still in play",
  codeTitle="binary_search.py",
  narration=
  "Two variables mark the edges of the range we are still willing to look in. "
  "|Left equals zero puts >the low edge at position %zero. "
  "|Right equals len of nums minus one puts >the high edge at %nine. "
  "Right now the answer could be anywhere in those ten positions, and that's the honest state of our "
  "knowledge. Every guess from here shrinks the range: ten possibilities become five, then two, then one. "
  "Watch the range, not the values.",
  lines=code({1:"The lowest position we are still willing to look at.",
              2:"The highest position we are still willing to look at."}),
  cells=row(),
  pointers=[{"label":"LO","value":0,"mark":True},{"label":"HI","value":9,"color":"yellow","mark":True}],
  vars=[{"label":"left=0","mark":True},{"label":"right=9","mark":True}]),

 dict(id="s07", type="DSA_TRACE_BSEARCH", transition="fade", background="zoneA", key="dsaBsearch",
  headline="Guess the [middle]", color="purple", caption="position four holds sixteen",
  codeTitle="binary_search.py",
  narration=
  "|While left is less than or equal to right, keep guessing. Hold that equals sign; we'll come back to it. "
  "|Mid equals left plus right, integer-divided by two. Zero plus nine is nine, and nine halved rounding "
  "down is %four, because those two slashes mean divide and throw away the remainder. "
  "So >we look at position four, which holds ^sixteen. "
  "|Is sixteen our target? No, twenty-three is bigger. And because the list is sorted, everything left of "
  "sixteen is smaller still, so none of it can possibly be twenty-three.",
  lines=code({4:"Keep guessing while the range still holds something.",
              5:"The middle of what is left. // rounds down.",
              7:"Is the middle our target? Not this time."}),
  cells=[{**c,"mark": i==4} for i,c in enumerate(row())],
  pointers=[{"label":"LO","value":0},{"label":"MID","value":4,"color":"purple","mark":True},{"label":"HI","value":9,"color":"yellow"}],
  vars=[{"label":"mid=4","mark":True}]),

 dict(id="s08", type="QUIZ_CARD", transition="iris", background="zoneC", narration=
  "^Straight from the Dojo. We found sixteen at the middle, and our target is twenty-three. "
  "Sixteen is smaller, so where do we look now? "
  "^The left half, the smaller numbers. ^The right half, the bigger numbers. ^Or start over. "
  "Have a think, and pause the video if you'd like a moment. "
  "^Ready? The right half, because the list is sorted, so everything left of sixteen is smaller than "
  "sixteen, and sixteen was already too small.",
  data={"quiz":{"question":"nums[mid] is 16, target is 23. Where now?",
    "options":[{"text":"left half (smaller numbers)"},{"text":"right half (bigger numbers)"},{"text":"start over"}],
    "answerIndex":1,"why":"Sorted means everything left of 16 is smaller than 16."}},
  anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.options.2.atWord","quiz.revealAtWord"]),

 dict(id="s09", type="DSA_TRACE_BSEARCH", transition="fade", background="zoneB", key="dsaBsearch",
  headline="Why mid [plus one]", color="purple", caption="half the list, gone",
  codeTitle="binary_search.py",
  narration=
  "|So left becomes mid plus one, and that plus one is the first bug people write. "
  "Why not just mid, though? Because we've already checked position four and it wasn't our number, so including "
  "it again buys nothing, and worse, the range would stop shrinking and the loop would spin forever. "
  ">Left moves to %five. "
  "And look what one guess did: ^positions zero to four are gone, ^including the sixteen we tested. "
  "Half the list, and we looked at one of them.",
  lines=code({10:"mid + 1, not mid — we already checked mid."}),
  cells=[{**c,"mark": i in (0,4)} for i,c in enumerate(row(drop=(0,1,2,3,4)))],
  pointers=[{"label":"LO","value":5,"mark":True},{"label":"HI","value":9,"color":"yellow"}],
  vars=[{"label":"left=5","mark":True}]),

 dict(id="s10", type="DSA_TRACE_BSEARCH", transition="fade", background="zoneB", key="dsaBsearch",
  headline="Guess again, [go left]", color="purple", caption="fifty-six is too big",
  codeTitle="binary_search.py",
  narration=
  "|New middle: five plus nine is fourteen, halved and rounded down is %seven. "
  ">Position seven holds ^fifty-six, which is bigger than twenty-three. "
  "Same reasoning as before, mirrored: everything right of fifty-six is bigger than fifty-six, and "
  "fifty-six was already too big, so ^all of that can go too. "
  "|The else branch fires, right becomes mid minus one, and >the top edge drops to %six. "
  "Two guesses in, and eight of the ten are already out of the running.",
  lines=code({5:"The middle of what is left: position seven.",
              12:"Too big, so pull the top edge down to mid - 1."}),
  cells=[{**c,"mark": i in (7,9)} for i,c in enumerate(row(drop=(0,1,2,3,4,7,8,9)))],
  pointers=[{"label":"LO","value":5},{"label":"MID","value":7,"color":"purple","mark":True},{"label":"HI","value":6,"color":"yellow","mark":True}],
  vars=[{"label":"mid=7","mark":True},{"label":"right=6","mark":True}]),

 dict(id="s11", type="DSA_TRACE_BSEARCH", transition="push", background="zoneA", key="dsaBsearch",
  headline="Ten, down to [two]", color="purple", caption="two guesses in",
  codeTitle="binary_search.py",
  narration=
  "Stop and look at the board for a second. The range is now ^position five ^and position six, and nothing else. "
  "Ten candidates down to two, in two guesses. %Eight numbers were never examined, never compared, "
  "never even read. They weren't examined at all; they were eliminated by an argument, and the argument "
  "was simply that the list is sorted.",
  lines=code({}),
  cells=[{**c,"mark": i in (5,6)} for i,c in enumerate(row(drop=(0,1,2,3,4,7,8,9)))],
  pointers=[{"label":"LO","value":5},{"label":"HI","value":6,"color":"yellow"}],
  vars=[{"label":"8 eliminated","mark":True}]),

 dict(id="s12", type="DSA_TRACE_BSEARCH", transition="fade", background="zoneA", key="dsaBsearch",
  headline="Found, in [three guesses]", color="purple", caption="position five",
  codeTitle="binary_search.py",
  narration=
  "|Mid is five plus six halved, rounding down to %five. >Position five holds ^twenty-three. "
  "|That's our number, so we return the index, and %the answer's five. "
  "Three guesses for ten items. For a phone book with a million names that's about twenty, "
  "and for every page Google has indexed, somewhere around thirty-three. "
  "Doubling the data costs you one more guess. Every time, forever.",
  lines=code({5:"The middle of the last two: position five.",
              8:"Found it. Hand back the position."}),
  cells=[{**c,"mark": i==5} for i,c in enumerate(row(drop=(0,1,2,3,4,7,8,9), done=(5,)))],
  pointers=[{"label":"MID","value":5,"color":"purple","mark":True}],
  vars=[{"label":"mid=5","mark":True},{"label":"return 5","mark":True}]),

 dict(id="s13", type="QUIZ_CARD", transition="iris", background="zoneC", narration=
  "^One more, and this line causes infinite loops in real interviews. "
  "Why the equals in while left is less than or equal to right? "
  "^Because a range of one item still needs checking. ^Because it makes the loop faster. "
  "^Or because it wouldn't compile. Have a think, and pause here if you'd like a second. "
  "^Ready? A range of one still needs checking. When left and right meet there is one candidate left, "
  "and dropping the equals walks past it.",
  data={"quiz":{"question":"while left <= right — why the equals?",
    "options":[{"text":"a range of one needs checking"},{"text":"it makes the loop faster"},
               {"text":"it would not compile otherwise"}],
    "answerIndex":0,"why":"left == right is a range of one, and it might be the answer."}},
  anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.options.2.atWord","quiz.revealAtWord"]),

 dict(id="s14", type="DSA_SIGNALS", transition="dip", background="zoneA", key="dsaSignals",
  headline="The two [off-by-one bugs]", color="purple", caption="what actually goes wrong",
  narration=
  "Almost every binary search failure is one of these lines, so learn them together. "
  "^Left equals mid plus one, never mid, because mid is already checked and leaving it in stops the "
  "range shrinking. ^Right equals mid minus one, for the same reason on the other side. "
  "^The loop runs while left is less than or equal to right, with the equals, so a single remaining "
  "candidate still gets looked at. ^On very large arrays left plus right can overflow, so left plus "
  "the half-difference is safer. ^Four lines. ^Write them from memory. ^That's the whole surface. "
  "Get those right and binary search stops being the pattern you dread, because everything else "
  "about it is the guessing game you already knew.",
  cells=[{"label":"left = mid + 1","sub":"never mid — the range must shrink","mark":True},
         {"label":"right = mid - 1","sub":"the same rule, mirrored","mark":True},
         {"label":"while left <= right","sub":"a range of one still needs checking","mark":True},
         {"label":"left + (right-left)//2","sub":"overflow-safe in other languages","mark":True},
         {"label":"four lines","sub":"the whole failure surface","color":"green","mark":True},
         {"label":"write them from memory","sub":"until the dread goes","color":"green","mark":True},
         {"label":"the rest is the game","sub":"higher, or lower","color":"green","mark":True}]),

 dict(id="s15", type="LIST_BUILD", transition="wipe", background="zoneB", narration=
  "Four to go and do. %Binary Search itself, to get the template into your fingers. "
  "%First Bad Version, which is binary search on a yes-or-no answer rather than a value. "
  "%Search in Rotated Sorted Array, which is the one interviewers actually ask. "
  "And %Koko Eating Bananas, where you binary search the answer itself rather than an array.",
  data={"heading":"Do these four, in this order","items":[
    {"icon":"lucide:search","text":"LeetCode 704","detail":"Binary Search"},
    {"icon":"lucide:git-commit","text":"LeetCode 278","detail":"First Bad Version"},
    {"icon":"lucide:rotate-cw","text":"LeetCode 33","detail":"Search in Rotated Sorted Array"},
    {"icon":"lucide:zap","text":"LeetCode 875","detail":"Koko Eating Bananas"}]},
  anchors=["items.0.atWord","items.1.atWord","items.2.atWord","items.3.atWord"]),

 dict(id="s16", type="RECAP", transition="fade", background="zoneB", narration=
  "Three things to take with you. Your signal is %sorted plus find, and sorted is what makes elimination "
  "safe. The move is to %guess the middle and throw away the half that cannot hold the answer. "
  "And the bugs live in %two lines: mid plus one, and mid minus one.",
  data={"heading":"Binary Search, in three lines","points":[
    {"text":"Sorted plus find"},{"text":"Guess the middle, halve the rest"},{"text":"mid + 1, mid - 1"}]},
  anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

 dict(id="s17", type="OUTRO_CTA", transition="fade", background="zoneA", narration=
  "Next in the Dojo is the HashMap, which is what you reach for when the array isn't sorted and sorting "
  "it would cost more than the search saves. Go and do Binary Search first.",
  data={"message":"All ten patterns, one per episode","sub":"next: HashMap"}, anchors=[]),
 ]}
write(T, 'dsa/ep03.json')
print("EP03:", len(T["scenes"]), "scenes")
