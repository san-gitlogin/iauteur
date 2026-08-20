# -*- coding: utf-8 -*-
# EP02 — Sliding Window. Source: dsa-pattern-dojo, pattern `sliding-window`
# (all 6 steps + its challenge). Markers: | code  ^ cell  > pointer  % var
import json

CODE = [
 "def max_sum_subarray(nums, k):",
 "    window_sum = sum(nums[:k])",
 "    max_sum = window_sum",
 "",
 "    for i in range(k, len(nums)):",
 "        window_sum += nums[i]",
 "        window_sum -= nums[i - k]",
 "        max_sum = max(max_sum, window_sum)",
 "",
 "    return max_sum",
]
def code(teach):
    return [{"text": t, **({"detail": teach[i], "teach": True} if i in teach else {})}
            for i, t in enumerate(CODE)]
NUMS = ["2","1","5","1","3","2"]
def houses(win=None, marks=(), drop=()):
    out=[]
    for i,l in enumerate(NUMS):
        c={"label":l}
        if win and win[0] <= i <= win[1]: c["text"]="win"
        elif i in drop: c["text"]="dropped"
        if i in marks: c["mark"]=True
        out.append(c)
    return out

T = {
 "meta": {"topic":"Sliding Window","format":"long","fps":30,"screenplay":"dojo",
  "onePayoff":"You can recognise a subarray question and repair a running total instead of rebuilding it.",
  "openLoop":"A billion operations, or six thousand. Same houses.",
  "analogy":"THE TRAIN WINDOW - a view that shows exactly three houses, sliding one house at a time.",
  "topicAxes":["economic-pain","entity-novelty"],
  "seo":{"title":"Sliding Window — Stop Rebuilding What You Already Counted",
   "altTitles":["Sliding Window Explained Until It Sticks (DSA Pattern 2)",
                "The Pattern Behind Every Subarray Question"],
   "hook":"A billion operations, or six thousand. Same houses.",
   "breakdown":"the sliding window pattern, traced line by line, with the signal words that give it away",
   "chapters":[{"id":"s01","title":"A billion, or six thousand"},
               {"id":"s03","title":"The words that give it away"},
               {"id":"s04","title":"Why rebuilding hurts"},
               {"id":"s05","title":"The train window"},
               {"id":"s06","title":"The first window"},
               {"id":"s07","title":"One in, one out"},
               {"id":"s10","title":"A new record"},
               {"id":"s12","title":"Fixed window, or variable"},
               {"id":"s13","title":"The four problems to go and do"}],
   "sources":["Pattern set, steps and problem lists: https://github.com/san-gitlogin/dsa-pattern-dojo",
              "Interactive dojo: https://san-gitlogin.github.io/dsa-pattern-dojo/"],
   "queries":["sliding window pattern explained","sliding window technique python","maximum sum subarray of size k",
     "fixed vs variable sliding window","longest substring without repeating characters",
     "sliding window leetcode problems","when to use sliding window","subarray sum problems pattern",
     "o(n) subarray maximum","dsa patterns for interviews","leetcode 3 sliding window",
     "minimum window substring approach","faang interview dsa patterns"],
   "hashtags":["#dsa","#leetcode","#slidingwindow","#codinginterview","#thenbxstudio"],
   "tags":["dsa","data structures and algorithms","sliding window","leetcode","coding interview",
     "faang interview","python","algorithms","subarray","substring","interview preparation",
     "software engineering interview","dsa patterns","two pointers","the nbx studio"]}},
 "brand":{"theme":"moderndark","design":"moderndark","themeLight":"daylight","background":"grid",
  "channel":"THE NBX STUDIO","logo":"img:channel_logo.png"},
 "thumbnail":{"title":"STOP RECOUNTING","badge":"Sliding Window","asset":"si:python"},
 "scenes":[

 dict(id="s01", type="HOOK", background="zoneA", narration=
  "A billion operations, or six thousand. Same houses, same question. So where does the billion go?",
  data={"headline":"A BILLION. OR 6,000.","subtext":"same houses, same question",
        "heroAsset":"si:python","headlineAtWord":1,"heroAtWord":9},
  anchors=["headlineAtWord","heroAtWord"]),

 dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", narration=
  "Welcome back to the Dojo. This is Sliding Window, pattern two of ten, and it's the one that "
  "turns a nested loop into a single pass by refusing to count anything twice.",
  data={"title":"SLIDING WINDOW","subtitle":"pattern two of ten"}, anchors=[]),

 dict(id="s03", type="DSA_SIGNALS", transition="dip", background="zoneA", key="dsaSignals",
  headline="The words that [give it away]", color="green", caption="signals in the question",
  narration=
  "Same drill as last time: the question tells you the pattern if you read it properly. "
  "Watch for ^subarray, or ^substring, both meaning a run of items that sit next to each other. "
  "Watch for ^contiguous, which is the formal way of saying the same thing. "
  "And a ^size or a limit, which means either a fixed k or a rule the window must keep obeying. "
  "^If the items don't have to be adjacent, this is not your pattern, "
  "^and you're probably looking at a hash map or dynamic programming instead. "
  "Contiguous is the word to watch for, because it is doing more work than it looks like.",
  cells=[{"label":"subarray","sub":"a run inside an array","mark":True},
         {"label":"substring","sub":"the same thing, in a string","mark":True},
         {"label":"contiguous","sub":"they must sit next to each other","mark":True},
         {"label":"of size k","sub":"or any rule the window must keep","mark":True},
         {"label":"NOT adjacent","sub":"then the window cannot help","color":"red","mark":True},
         {"label":"try hashmap or DP","sub":"patterns four and eight","color":"red","mark":True}]),

 dict(id="s04", type="DSA_COST", transition="wipe", background="zoneC", key="dsaCost",
  headline="Why [recounting] hurts", color="blue", caption="the same houses, two costs",
  narration=
  "Here's the obvious version. Stop at every position and add up the whole window from scratch. "
  "^With six houses and a window of three that's twelve additions, which is nothing. "
  "^But a million houses with a window of a thousand is a billion additions, and that program "
  "does not finish while anybody is watching. The sliding version does ^twelve for the small "
  "case too, ^and two million for the big one. The difference is what you refuse to redo.",
  cells=[{"label":"recount, n=6 k=3","sub":"12 additions","value":10,"text":"dropped","mark":True},
         {"label":"recount, n=1M k=1K","sub":"1 billion additions","value":100,"text":"dropped","mark":True},
         {"label":"slide, n=6 k=3","sub":"12 additions","value":10,"mark":True},
         {"label":"slide, n=1M k=1K","sub":"2 million additions","value":13,"mark":True}]),

 dict(id="s05", type="DSA_TRACE_WINDOW", transition="push", background="zoneA", key="dsaWindow",
  headline="A window onto [three houses]", color="green", caption="the view from the train",
  codeTitle="max_sum_subarray.py",
  narration=
  "You're on a train, looking out of a window that shows exactly three houses at a time. "
  "Each house has a number painted on the door: how many cookies that house baked today. "
  "^Two, ^one, ^five, ^one, ^three, ^two. You want the three houses in a row that baked the most "
  "between them. The slow way is to stop the train at every position and count all three houses "
  "again from nothing. It works, and on six houses you'd never feel it. "
  "On a million houses with a window of a thousand you would feel it, which is why the pattern exists.",
  lines=code({}), cells=houses(marks=(0,1,2,3,4,5)),
  vars=[{"label":"k=3"}]),

 dict(id="s06", type="DSA_TRACE_WINDOW", transition="fade", background="zoneA", key="dsaWindow",
  headline="Count the first window [once]", color="green", caption="the only full count",
  codeTitle="max_sum_subarray.py",
  narration=
  "|Window sum equals sum of nums up to k. That colon-k slice means the first three houses, "
  "positions zero, one and two, so ^two plus ^one plus ^five is %eight. "
  "|And max sum starts as that same eight, because eight is the best score so far, for the very "
  "good reason that eight is the only score so far. %Max sum is eight. "
  "Hold on to this moment, because it is the only time in the whole algorithm that we add a full "
  "window from scratch. Everything after this is repair work.",
  lines=code({1:"Add up the first three houses. Once.",
              2:"The best score so far is the only score so far."}),
  cells=houses(win=(0,2), marks=(0,1,2)),
  vars=[{"label":"window_sum=8","mark":True},{"label":"max_sum=8","mark":True}]),

 dict(id="s07", type="DSA_TRACE_WINDOW", transition="fade", background="zoneA", key="dsaWindow",
  headline="One in, [one out]", color="green", caption="the train moves one house",
  codeTitle="max_sum_subarray.py",
  narration=
  "|Now the train moves, and the loop starts at k rather than at zero, because the first k houses "
  "are already counted. Two things happen to your view, and only two. "
  "|A new house comes in: >house three, which baked ^one cookie, so we add it. "
  "|And a house leaves: >house zero, which baked ^two, so we subtract it. "
  "Eight plus one minus two is %seven. Notice what we did not do. We never re-added houses one "
  "and two. They never left the window, so their cookies were never in question.",
  lines=code({4:"Start at k: the first window is already counted.",
              5:"The house entering the view gets added.",
              6:"The house leaving the view gets subtracted."}),
  cells=houses(win=(1,3), marks=(3,0)),
  pointers=[{"label":"IN","value":3,"mark":True},{"label":"OUT","value":0,"mark":True}],
  vars=[{"label":"window_sum=7","mark":True}]),

 dict(id="s08", type="QUIZ_CARD", transition="iris", background="zoneC", narration=
  "^Straight from the Dojo. The window total just dropped from eight to seven. "
  "Is seven the new best? "
  "^Yes, seven is the new record. ^Or no, eight was better and we keep eight as the maximum. "
  "Have a think, and pause here if you'd like a moment. "
  "^Ready? No. Seven is now; eight is the best ever seen, and the question asked for the best.",
  data={"quiz":{"question":"Window sum dropped 8 → 7. Is 7 the new best?",
    "options":[{"text":"yes, 7 is the new record"},{"text":"no, 8 was better — keep 8"}],
    "answerIndex":1,"why":"window_sum is now. max_sum is the best ever seen."}},
  anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.revealAtWord"]),

 dict(id="s09", type="DSA_TRACE_WINDOW", transition="fade", background="zoneB", key="dsaWindow",
  headline="Two numbers, [two jobs]", color="green", caption="now versus best",
  codeTitle="max_sum_subarray.py",
  narration=
  "|That's what this line is for, and it's the line people skip. Max sum equals max of max sum "
  "and window sum. %Window sum is ^the total you are looking at right now, and it goes up and "
  "down as the train moves. %Max sum is ^the best total you have ever seen, and it only goes up. "
  "Two variables, two completely different jobs, and confusing them is the most common way to "
  "get this pattern wrong in an interview.",
  lines=code({7:"Keep whichever is bigger: the record, or right now."}),
  cells=houses(win=(1,3), marks=(1,3)),
  vars=[{"label":"window_sum=7","mark":True},{"label":"max_sum=8","mark":True}]),

 dict(id="s10", type="DSA_TRACE_WINDOW", transition="push", background="zoneA", key="dsaWindow",
  headline="A [new record]", color="green", caption="nine beats eight",
  codeTitle="max_sum_subarray.py",
  narration=
  "Off it goes again. >House four comes in with ^three cookies, >house one leaves with ^one. "
  "|Seven plus three minus one is %nine, and nine beats our old record of eight. "
  "|So max of eight and nine is %nine, and the record moves. "
  "Two arithmetic operations for a window of three. And here is the part that matters: that would "
  "still be two operations for a window of a thousand, because the repair work has nothing to do "
  "with how big the window is.",
  lines=code({5:"Add the house that entered: plus three.",
              7:"max(8, 9) is 9. The record moves."}),
  cells=houses(win=(2,4), marks=(4,1)),
  pointers=[{"label":"IN","value":4,"mark":True},{"label":"OUT","value":1,"mark":True}],
  vars=[{"label":"window_sum=9","mark":True},{"label":"max_sum=9","mark":True}]),

 dict(id="s11", type="DSA_TRACE_WINDOW", transition="fade", background="zoneA", key="dsaWindow",
  headline="Last stop, [and done]", color="green", caption="one pass, finished",
  codeTitle="max_sum_subarray.py",
  narration=
  "Last stop. >House five comes in with ^two, >house two leaves with ^five, "
  "so nine plus two minus five is %six, which is not a record, so max sum stays where it is. "
  "|And we return %nine. Every possible window of three has now been checked, "
  "and the winner was houses two, three and four. One pass down the street, "
  "two operations per step, and not one house counted twice.",
  lines=code({9:"Hand back the best window we ever saw."}),
  cells=houses(win=(3,5), marks=(5,2)),
  pointers=[{"label":"IN","value":5,"mark":True},{"label":"OUT","value":2,"mark":True}],
  vars=[{"label":"window_sum=6","mark":True},{"label":"return 9","mark":True}]),

 dict(id="s12", type="DSA_SIGNALS", transition="dip", background="zoneC", key="dsaSignals",
  headline="Fixed window, or [variable]", color="green", caption="the two shapes it comes in",
  narration=
  "One more thing, because sliding window arrives in two shapes and interviewers use both. "
  "^The fixed window is the one we just wrote, where the size never changes and the window "
  "simply slides. "
  "^The variable window is different. It grows from the right until some rule breaks, "
  "^then shrinks from the left until the rule holds again. "
  "^Longest substring without repeating characters is the classic: grow until you hit a repeat, "
  "then pull the left edge past it. ^Same idea, same refusal to recount. "
  "Fixed size, you slide. Stated rule, you grow and shrink.",
  cells=[{"label":"fixed window","sub":"size never changes, it just slides","mark":True},
         {"label":"variable window","sub":"grows from the right","mark":True},
         {"label":"shrink on a break","sub":"pull the left edge in","mark":True},
         {"label":"longest substring","sub":"grow until a repeat, then shrink","mark":True},
         {"label":"same refusal","sub":"never recount what did not change","mark":True}]),

 dict(id="s13", type="LIST_BUILD", transition="wipe", background="zoneB", narration=
  "Four to go and do, and I'd do them in this order. "
  "%Maximum Average Subarray is the fixed window you just wrote, almost line for line. "
  "%Longest Substring Without Repeating is your first variable window. "
  "%Permutation in String adds a frequency count inside the window. "
  "And %Minimum Window Substring is the hard one that ties it all together.",
  data={"heading":"Do these four, in this order","items":[
    {"icon":"lucide:sigma","text":"LeetCode 643","detail":"Maximum Average Subarray"},
    {"icon":"lucide:type","text":"LeetCode 3","detail":"Longest Substring Without Repeating"},
    {"icon":"lucide:shuffle","text":"LeetCode 567","detail":"Permutation in String"},
    {"icon":"lucide:minimize-2","text":"LeetCode 76","detail":"Minimum Window Substring"}]},
  anchors=["items.0.atWord","items.1.atWord","items.2.atWord","items.3.atWord"]),

 dict(id="s14", type="RECAP", transition="fade", background="zoneB", narration=
  "Three things to take with you. The signal is %contiguous, a run of neighbours rather than any "
  "old selection. The move is to %repair the total instead of rebuilding it, one in and one out. "
  "And keep %two variables apart: the window you're in, and the best you've seen.",
  data={"heading":"Sliding Window, in three lines","points":[
    {"text":"Contiguous is the signal"},{"text":"Repair, never rebuild"},{"text":"Now, versus best ever"}]},
  anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

 dict(id="s15", type="OUTRO_CTA", transition="fade", background="zoneA", narration=
  "Next in the Dojo is Binary Search, where instead of sliding a window across the data "
  "we throw half of it away on every single step. Go and do Maximum Average Subarray first.",
  data={"message":"All ten patterns, one per episode","sub":"next: Binary Search"}, anchors=[]),
 ]}
json.dump(T, open('briefs/dsa/ep02.json','w'), indent=1)
print("EP02:", len(T["scenes"]), "scenes")
