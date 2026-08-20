# -*- coding: utf-8 -*-
# EP01 — Two Pointers. Source: san-gitlogin/dsa-pattern-dojo, pattern `two-pointers`
# (all 8 steps, both built-in challenges). Markers: | code  ^ cell  > pointer  % var
import json

CODE = [
 "def two_sum_sorted(nums, target):",
 "    left = 0",
 "    right = len(nums) - 1",
 "",
 "    while left < right:",
 "        current = nums[left] + nums[right]",
 "",
 "        if current == target:",
 "            return [left, right]",
 "        elif current < target:",
 "            left += 1",
 "        else:",
 "            right -= 1",
 "",
 "    return []",
]
def code(teach):
    return [{"text": t, **({"detail": teach[i], "teach": True} if i in teach else {})}
            for i, t in enumerate(CODE)]
def shelf(marks=(), state=None):
    st = state or {}
    return [{"label": l, **({"text": st[i]} if i in st else {}), **({"mark": True} if i in marks else {})}
            for i, l in enumerate(["1","3","5","7","9","11"])]

T = {
 "meta": {"topic":"Two Pointers","format":"long","fps":30,"screenplay":"dojo",
  "onePayoff":"You can read a problem statement and know, from the words alone, that two pointers is the tool.",
  "openLoop":"Fifteen pairs to check, or three. Same array, same answer.",
  "analogy":"THE SHELF - two friends walking a price-sorted shelf of books from opposite ends.",
  "topicAxes":["economic-pain","entity-novelty"],
  "seo":{"title":"Two Pointers \u2014 The Pattern That Turns 15 Checks Into 3",
   "altTitles":["Two Pointers Explained Until It Sticks (DSA Pattern 1)",
                "Stop Writing Nested Loops \u2014 Learn Two Pointers"],
   "hook":"Fifteen pairs, or three. Same array, same answer.",
   "breakdown":"the two-pointer pattern, traced line by line, with the signal words that give it away in an interview",
   "sources":["Pattern set, steps and problem lists: https://github.com/san-gitlogin/dsa-pattern-dojo",
              "Interactive dojo: https://san-gitlogin.github.io/dsa-pattern-dojo/"],
   "queries":["two pointers pattern explained","two sum sorted array python","two pointer technique leetcode",
     "when to use two pointers","valid palindrome two pointers","3sum two pointers explained",
     "container with most water approach","dsa patterns for interviews","leetcode 167 two sum ii",
     "two pointers vs hashmap","o(n) instead of o(n^2) pair sum","faang interview dsa patterns",
     "how to spot the pattern in a coding question","two pointer template python"],
   "chapters":[{"id":"s01","title":"Fifteen checks, or three"},
               {"id":"s03","title":"The words that give it away"},
               {"id":"s04","title":"Why the obvious way hurts"},
               {"id":"s05","title":"The shelf, and the slow way"},
               {"id":"s06","title":"Standing at both ends"},
               {"id":"s10","title":"When the first guess is wrong"},
               {"id":"s13","title":"Three checks, not fifteen"},
               {"id":"s14","title":"The rule, in two lines"},
               {"id":"s15","title":"The four problems to go and do"}],
   "hashtags":["#dsa","#leetcode","#twopointers","#codinginterview","#thenbxstudio"],
   "tags":["dsa","data structures and algorithms","two pointers","leetcode","coding interview",
     "faang interview","python","algorithms","two sum","sorted array","interview preparation",
     "software engineering interview","dsa patterns","two pointer technique","the nbx studio"]}},
 "brand":{"theme":"moderndark","design":"moderndark","themeLight":"daylight","background":"grid",
  "channel":"THE NBX STUDIO","logo":"img:channel_logo.png"},
 "thumbnail":{"title":"15 CHECKS, OR 3","badge":"Two Pointers","asset":"si:python"},

 "scenes":[

 dict(id="s01", type="HOOK", background="zoneA", narration=
  "Fifteen pairs to check, or three. Same array, same answer. So what actually changes?",
  data={"headline":"15 CHECKS. OR 3.","subtext":"same array, same answer",
        "heroAsset":"si:python","headlineAtWord":1,"heroAtWord":9},
  anchors=["headlineAtWord","heroAtWord"]),

 dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", narration=
  "Welcome to THE NBX STUDIO, and welcome to the Dojo. This is Two Pointers, the first of ten patterns, "
  "and it's the one interviewers reach for most, because it looks trivial and quietly isn't.",
  data={"title":"TWO POINTERS","subtitle":"pattern one of ten"}, anchors=[]),

 dict(id="s03", type="DSA_SIGNALS", transition="dip", background="zoneA", key="dsaSignals",
  headline="The words that [give it away]", color="yellow", caption="signals in the question",
  narration=
  "Before any code, learn to read the question, because problems announce their own pattern "
  "if you know the words. When the input is already ^sorted, somebody put that ordering there "
  "deliberately. When you're asked for a ^pair, exactly two things. When those two must ^add to "
  "a target. And when it says ^palindrome, which is the same idea wearing a different coat. "
  "^But if the array is not sorted none of this holds, and ^that's a hash map problem instead. "
  "Two of those signals in one sentence and you can stop reading. "
  "Read the question before you read the array, and half the work is already done.",
  cells=[{"label":"sorted","sub":"the order is a gift, not decoration","mark":True},
         {"label":"a pair","sub":"exactly two, not any number","mark":True},
         {"label":"sum to a target","sub":"a budget the two must hit","mark":True},
         {"label":"palindrome","sub":"the same idea, from both ends","mark":True},
         {"label":"NOT sorted","sub":"then this pattern does not apply","color":"red","mark":True},
         {"label":"use a hash map","sub":"pattern four, later in the Dojo","color":"red","mark":True}]),

 dict(id="s04", type="DSA_COST", transition="wipe", background="zoneC", key="dsaCost",
  headline="Why the [obvious way] hurts", color="blue", caption="the same input, two costs",
  narration=
  "Here's the version everybody writes first, and there's nothing shameful about it: pair every "
  "number with every other number and check the total. ^For six items that's fifteen pairs, fine. "
  "^For a thousand items it's half a million. ^For a million it's five hundred billion, and your "
  "interview is over before the program is. The two-pointer version checks ^three pairs on that "
  "same six-item list, ^a thousand on the thousand, ^and a million on the million. "
  "That gap isn't a micro-optimisation, which is why interviewers keep asking it.",
  cells=[{"label":"every pair, n=6","sub":"15 checks","value":20,"text":"dropped","mark":True},
         {"label":"every pair, n=1K","sub":"500,000 checks","value":60,"text":"dropped","mark":True},
         {"label":"every pair, n=1M","sub":"500 billion checks","value":100,"text":"dropped","mark":True},
         {"label":"two pointers, n=6","sub":"3 checks","value":4,"mark":True},
         {"label":"two pointers, n=1K","sub":"1,000 checks","value":8,"mark":True},
         {"label":"two pointers, n=1M","sub":"1 million checks","value":14,"mark":True}]),

 dict(id="s05", type="DSA_TRACE_PTRS", transition="push", background="zoneA", key="dsaPtrs",
  headline="The shelf, and [the slow way]", color="red", caption="six books, sorted by price",
  codeTitle="two_sum_sorted.py",
  narration=
  "Picture a shelf in a bookshop, already sorted by price: ^one pound, ^three, ^five, ^seven, "
  "^nine and ^eleven. You've got a gift card for exactly twelve and you need two books that "
  "total it, no change given. The obvious move is to check every pair. One and three. One and "
  "five. One and seven, and so on, all the way round: fifteen combinations for six books. "
  "It works, and on a shelf this size you'd never notice the cost. "
  "But hold on to that number, fifteen, because we're about to make it three.",
  lines=code({}), cells=shelf(marks=(0,1,2,3,4,5)),
  vars=[{"label":"target=12"}]),

 dict(id="s06", type="DSA_TRACE_PTRS", transition="fade", background="zoneA", key="dsaPtrs",
  headline="Stand at [both ends]", color="red", caption="choosing where to stand",
  codeTitle="two_sum_sorted.py",
  narration=
  "Here's the smarter move, and it starts before any comparison at all. You stand at the cheap "
  "end of the shelf and a friend stands at the expensive end. |Left equals zero puts >you at the "
  "first position, holding the one-pound book, so %left is zero. Then |right equals len of nums "
  "minus one puts >your friend at the far end on the eleven, so %right is five. "
  "That minus one catches people out constantly. Len of nums tells you how many books there are, "
  "which is %six, but positions start counting at zero, so the last one is five, not six. "
  "Nothing has been compared yet. All we've done is decide where to stand.",
  lines=code({1:"You stand at the cheapest book on the shelf.",
              2:"Your friend stands at the most expensive one."}),
  cells=shelf(),
  pointers=[{"label":"LEFT","value":0,"mark":True},{"label":"RIGHT","value":5,"color":"yellow","mark":True}],
  vars=[{"label":"left=0","mark":True},{"label":"right=5","mark":True},{"label":"len(nums)=6","mark":True}]),

 dict(id="s07", type="DSA_TRACE_PTRS", transition="fade", background="zoneA", key="dsaPtrs",
  headline="Add what you're [holding]", color="red", caption="one plus eleven",
  codeTitle="two_sum_sorted.py",
  narration=
  "|While left is less than right just means carry on until the two of you bump into each other, "
  "because once you've met there's nothing left that you haven't already considered. "
  "|Then current equals nums of left plus nums of right, which is a formal way of saying add up "
  "the two books you're each holding. That's ^one pound plus ^eleven pounds, so %current is "
  "twelve. |And the first thing we check is whether current equals %target. "
  "It does, first comparison, and that wasn't luck. The shelf being sorted is what let us start "
  "at the two extremes, and the extremes are where the biggest and smallest totals live.",
  lines=code({4:"Carry on until the two of you meet in the middle.",
              5:"Add up the two books you are each holding.",
              7:"Is that the number we wanted?"}),
  cells=shelf(marks=(0,5)),
  pointers=[{"label":"LEFT","value":0},{"label":"RIGHT","value":5,"color":"yellow"}],
  vars=[{"label":"current=12","mark":True},{"label":"target=12","mark":True}]),

 dict(id="s08", type="QUIZ_CARD", transition="iris", background="zoneC", narration=
  "^Quick one, and it's from the Dojo itself. We're holding one pound and eleven pounds. "
  "That totals twelve, and twelve is exactly the gift card. So what happens now? "
  "^Do we keep looking for more pairs? ^Do we tell the friend to pick something cheaper? "
  "^Are we done, and we hand back the answer? ^Or do we start again from the beginning? "
  "Have a think, and pause the video here if you'd like a moment longer. "
  "^Ready? We're done. The question asked for a pair, we have one, and carrying on gains nothing.",
  data={"quiz":{"question":"1 + 11 = 12, and the target is 12. What now?",
    "options":[{"text":"keep looking for more pairs"},{"text":"friend picks something cheaper"},
               {"text":"done \u2014 return the answer"},{"text":"start again from the beginning"}],
    "answerIndex":2,"why":"The question asked for a pair. We have one."}},
  anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.options.2.atWord",
           "quiz.options.3.atWord","quiz.revealAtWord"]),

 dict(id="s09", type="DSA_TRACE_PTRS", transition="fade", background="zoneB", key="dsaPtrs",
  headline="One pair checked, [not fifteen]", color="red", caption="hand back the positions",
  codeTitle="two_sum_sorted.py",
  narration=
  "|Return left comma right hands back the two ^positions, ^zero and five, rather than the prices "
  "themselves, because that's what the question asked for and it's what an interviewer expects. "
  "%One pair, out of fifteen. That was a friendly example though, with the answer sitting "
  "at the two ends. So let's make it hard, because what matters is how a pattern behaves when the "
  "guess is wrong.",
  lines=code({8:"Hand back the two positions, not the prices."}),
  cells=shelf(marks=(0,5), state={0:"done",5:"done"}),
  pointers=[{"label":"LEFT","value":0},{"label":"RIGHT","value":5,"color":"yellow"}],
  vars=[{"label":"return [0, 5]","mark":True}]),

 dict(id="s10", type="DSA_TRACE_PTRS", transition="dip", background="zoneB", key="dsaPtrs",
  headline="Too big. So [who moves?]", color="red", caption="a tighter budget",
  codeTitle="two_sum_sorted.py",
  narration=
  "Same shelf, but the gift card is only %eight pounds now. You're still holding ^one, your friend "
  "is still holding ^eleven, so %current is twelve and we're four pounds over. Somebody has to "
  "change book, and this is the question the entire pattern turns on. Think it through with me. "
  "If you, on the cheap end, reach for something pricier, the total can only go up, and we're "
  "already too high. |So elif current is less than target is the branch we did not take this time. "
  "|We fall through to else, which is the too-big case, and the only person who can bring the "
  "total down is your friend.",
  lines=code({9:"Too small? Then YOU trade up. Not this time.",
              11:"Too big, so your friend has to come down."}),
  cells=shelf(marks=(0,5)),
  pointers=[{"label":"LEFT","value":0},{"label":"RIGHT","value":5,"color":"yellow"}],
  vars=[{"label":"target=8","mark":True},{"label":"current=12","mark":True}]),

 dict(id="s11", type="DSA_TRACE_PTRS", transition="fade", background="zoneB", key="dsaPtrs",
  headline="One step, [five pairs gone]", color="red", caption="right moves down",
  codeTitle="two_sum_sorted.py",
  narration=
  "|Right minus equals one moves >your friend one place to the left, so they put the eleven back "
  "and pick up %nine. New total: one plus nine is %ten. Still over budget, so nothing is solved "
  "yet. But look what that single step quietly bought us. ^Every pair involving the eleven-pound "
  "book has just gone, all five of them, and we never looked at one. We didn't need "
  "to: the shelf is sorted, so if eleven was too dear beside ^the cheapest book, it's too dear "
  "beside every book. That is the trick; the rest is bookkeeping.",
  lines=code({12:"Your friend moves one place down the shelf."}),
  cells=shelf(marks=(0,5), state={5:"dropped"}),
  pointers=[{"label":"LEFT","value":0},{"label":"RIGHT","value":4,"color":"yellow","mark":True}],
  vars=[{"label":"right=4","mark":True},{"label":"current=10","mark":True}]),

 dict(id="s12", type="QUIZ_CARD", transition="iris", background="zoneC", narration=
  "^Your turn again, and this one separates memorising from understanding. "
  "One plus nine is ten, and the budget is still eight. So what happens next? "
  "^Do you pick a pricier book, moving the left pointer right? "
  "^Does your friend go cheaper again, moving the right pointer left? "
  "^Do you both move at once? ^Or is there simply no answer? "
  "Have a think, and pause here if you want longer. "
  "^Ready? Your friend goes cheaper again, because the total is still too big. "
  "Same rule as last time, and it will be the same rule every time.",
  data={"quiz":{"question":"1 + 9 = 10, target is 8. What happens?",
    "options":[{"text":"you pick pricier: left moves"},{"text":"friend goes cheaper: right moves"},
               {"text":"both move at once"},{"text":"there is no answer"}],
    "answerIndex":1,"why":"Still too big, so the expensive side keeps coming down."}},
  anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.options.2.atWord",
           "quiz.options.3.atWord","quiz.revealAtWord"]),

 dict(id="s13", type="DSA_TRACE_PTRS", transition="push", background="zoneA", key="dsaPtrs",
  headline="Three checks, [not fifteen]", color="red", caption="one plus seven",
  codeTitle="two_sum_sorted.py",
  narration=
  "So >your friend steps down once more, putting back the nine and picking up %seven. "
  "|One plus seven is ^eight, the budget exactly, and |we return ^the two positions again. "
  "Count what we actually did: %three comparisons, on a shelf where checking every pair would "
  "have been fifteen. And the number that matters isn't three, it's the shape of it. "
  "Every single turn of that loop threw away a book for good, which means the work grows in step "
  "with the shelf instead of exploding. Double the books and you roughly double the checks. "
  "That is what big O of n means, and it's why this survives a million books when the obvious "
  "version doesn't.",
  lines=code({5:"One plus seven is eight. That is the budget.",
              8:"Hand back the two positions and stop."}),
  cells=shelf(marks=(0,3), state={0:"done",3:"done",4:"dropped",5:"dropped"}),
  pointers=[{"label":"LEFT","value":0},{"label":"RIGHT","value":3,"color":"yellow","mark":True}],
  vars=[{"label":"current=8","mark":True},{"label":"3 checks","mark":True}]),

 dict(id="s14", type="DSA_TRACE_PTRS", transition="dip", background="zoneA", key="dsaPtrs",
  headline="The rule, in [two lines]", color="red", caption="the whole pattern",
  codeTitle="two_sum_sorted.py",
  narration=
  "Here's the entire pattern on one card, and it costs %big O of n in time and %big O of one in "
  "space, because two integers is the whole of the extra memory it ever needs. "
  "|Total too small? You move up, because you're the only one who can add value. "
  "|Total too big? Your friend moves down, because they're the only one who can take it away. "
  "^And if they meet without ever hitting the target, no such pair exists, and an empty list "
  "is the right answer rather than a failure.",
  lines=code({10:"Too small: you trade up, and the total rises.",
              12:"Too big: your friend trades down, and it falls."}),
  cells=shelf(marks=(2,)),
  pointers=[{"label":"LEFT","value":0},{"label":"RIGHT","value":5,"color":"yellow"}],
  vars=[{"label":"O(n) time","mark":True},{"label":"O(1) space","mark":True}]),

 dict(id="s15", type="LIST_BUILD", transition="wipe", background="zoneC", narration=
  "This pattern is worth real effort because it isn't one problem, it's four. "
  "%Two Sum Two is what we just wrote. %Valid Palindrome compares the two letters and walks in. "
  "%Three Sum fixes one number and two-pointers the rest. And %Container With Most Water moves "
  "whichever wall is shorter. Do all four this week.",
  data={"heading":"Do these four, in this order","items":[
    {"icon":"lucide:target","text":"LeetCode 167","detail":"Two Sum II"},
    {"icon":"lucide:align-center","text":"LeetCode 125","detail":"Valid Palindrome"},
    {"icon":"lucide:layers","text":"LeetCode 15","detail":"3Sum"},
    {"icon":"lucide:droplet","text":"LeetCode 11","detail":"Container With Most Water"}]},
  anchors=["items.0.atWord","items.1.atWord","items.2.atWord","items.3.atWord"]),

 dict(id="s16", type="RECAP", transition="fade", background="zoneB", narration=
  "Three things to take with you. The signal is a %sorted input and a question about a pair. "
  "The move is to %start at both ends and let the total tell you which side steps. "
  "And every step %throws away work you never have to do.",
  data={"heading":"Two Pointers, in three lines","points":[
    {"text":"Sorted input, and a pair"},{"text":"Start at both ends"},{"text":"Every step deletes work"}]},
  anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

 dict(id="s17", type="OUTRO_CTA", transition="fade", background="zoneA", narration=
  "Next in the Dojo is Sliding Window, for when the question stops asking about a pair and starts "
  "asking about a stretch. Go and do Two Sum Two now, while the shelf is still in your head.",
  data={"message":"All ten patterns, one per episode","sub":"next: Sliding Window"}, anchors=[]),
 ]}
json.dump(T, open('briefs/dsa/ep01.json','w'), indent=1)
print("EP01:", len(T["scenes"]), "scenes")
