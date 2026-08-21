# -*- coding: utf-8 -*-
# EP05 — Stack. Source: dsa-pattern-dojo, pattern `stack` (all 8 steps + challenge).
import json
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _guard import write
CODE = [
 "def valid_parentheses(s):",
 "    stack = []",
 "    pairs = {')':'(', '}':'{', ']':'['}",
 "",
 "    for char in s:",
 "        if char in '({[':",
 "            stack.append(char)",
 "        elif char in ')}]':",
 "            if not stack:",
 "                return False",
 "            if stack[-1] != pairs[char]:",
 "                return False",
 "            stack.pop()",
 "",
 "    return len(stack) == 0",
]
def code(teach):
    return [{"text": t, **({"detail": teach[i], "teach": True} if i in teach else {})} for i, t in enumerate(CODE)]
IN=["{","[","(",")","]","}"]
def inp(marks=(), done=()):
    return [{"label":l, **({"text":"done"} if i in done else {}), **({"mark":True} if i in marks else {})}
            for i,l in enumerate(IN)]
def pile(items, popped=(), marks=()):
    return [{"label":l, **({"text":"dropped"} if i in popped else {}), **({"mark":True} if i in marks else {})}
            for i,l in enumerate(items)]

T = {
 "meta": {"topic":"Stack","format":"long","fps":30,"screenplay":"dojo",
  "onePayoff":"You can recognise a nesting problem and answer it with the last thing you put down.",
  "openLoop":"Shirt, jacket, scarf. Now take them off. Why is the order forced?",
  "analogy":"GETTING DRESSED - the last thing you put on is the first thing you take off.",
  "topicAxes":["entity-novelty","tribal-conflict"],
  "seo":{"title":"Stack — The Pattern Behind Every Bracket Question",
   "altTitles":["Stack Explained Until It Sticks (DSA Pattern 5)",
                "Valid Parentheses, Properly — The Stack Pattern"],
   "hook":"Shirt, jacket, scarf. Now take them off.",
   "breakdown":"the stack pattern traced line by line, and the two guards everybody forgets",
   "chapters":[{"id":"s01","title":"Shirt, jacket, scarf"},
               {"id":"s03","title":"The words that give it away"},
               {"id":"s04","title":"Getting dressed"},
               {"id":"s05","title":"The pile, and the pairs"},
               {"id":"s06","title":"Three openers go on"},
               {"id":"s09","title":"The first closer"},
               {"id":"s11","title":"Empty means valid"},
               {"id":"s13","title":"The two guards everybody forgets"},
               {"id":"s14","title":"The four problems to go and do"}],
   "sources":["Pattern set, steps and problem lists: https://github.com/san-gitlogin/dsa-pattern-dojo",
              "Interactive dojo: https://san-gitlogin.github.io/dsa-pattern-dojo/"],
   "queries":["stack pattern explained","valid parentheses python","balanced brackets algorithm",
     "when to use a stack dsa","stack vs queue difference","next greater element stack",
     "monotonic stack explained","min stack problem","undo redo stack","dsa patterns for interviews",
     "leetcode 20 valid parentheses","faang interview dsa patterns"],
   "hashtags":["#dsa","#leetcode","#stack","#codinginterview","#thenbxstudio"],
   "tags":["dsa","data structures and algorithms","stack","leetcode","coding interview",
     "faang interview","python","algorithms","valid parentheses","brackets","interview preparation",
     "software engineering interview","dsa patterns","lifo","the nbx studio"]}},
 "brand":{"theme":"moderndark","design":"moderndark","themeLight":"daylight","background":"grid",
  "channel":"THE NBX STUDIO","logo":"img:channel_logo.png"},
 "thumbnail":{"title":"LAST ON, FIRST OFF","badge":"Stack","asset":"si:python"},
 "scenes":[

 dict(id="s01", type="HOOK", background="zoneA", narration=
  "Shirt, then jacket, then scarf. Now take them off. Why can't you choose the order?",
  data={"headline":"LAST ON, FIRST OFF","subtext":"the order is not a choice",
        "heroAsset":"si:python","headlineAtWord":1,"heroAtWord":8},
  anchors=["headlineAtWord","heroAtWord"]),

 dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", narration=
  "Welcome back to the Dojo. This is the Stack, pattern five of ten, and it's the answer to every "
  "question where the order things were opened in is the thing that decides the answer.",
  data={"title":"STACK","subtitle":"pattern five of ten"}, anchors=[]),

 dict(id="s03", type="DSA_SIGNALS", transition="dip", background="zoneA", key="dsaSignals",
  headline="The words that [give it away]", color="red", caption="signals in the question",
  narration=
  "Everything here is about nesting. ^Parentheses, or ^brackets, which is the classic. "
  "^Nested anything: tags, folders, function calls. "
  "^Next greater element, which sounds unrelated and absolutely is not. "
  "^Undo, or back button, because both are a pile of things you did. "
  "^And if the order does not matter at all, you want a set or a map instead, not a stack. "
  "Ask whether the most recent thing is the one you have to deal with first, because that's what a pile gives you.",
  cells=[{"label":"parentheses","sub":"the classic","mark":True},
         {"label":"brackets, tags","sub":"anything that closes","mark":True},
         {"label":"nested","sub":"folders, calls, scopes","mark":True},
         {"label":"next greater element","sub":"sounds unrelated. is not.","mark":True},
         {"label":"undo, back button","sub":"a pile of things you did","mark":True},
         {"label":"order does not matter","sub":"then use a set or a map","color":"red","mark":True}]),

 dict(id="s04", type="DSA_TRACE_STACK", transition="wipe", background="zoneC", key="dsaStack",
  headline="Getting [dressed]", color="red", caption="the input we have to check",
  codeTitle="valid_parentheses.py",
  narration=
  "You pull on a shirt, then a jacket, then a scarf. Coming home, the scarf comes off first, "
  "then the jacket, then the shirt. You can't get the shirt off without dealing with the jacket, "
  "and nobody had to teach you that one. The last thing on is the first thing off, and that rule is "
  "the entire data structure. "
  "Here's the string we have to check: ^open brace, ^open square, ^open round, "
  "^close round, ^close square, ^close brace. Is it balanced? "
  "Read it once yourself before we start, because your eye already knows the answer.",
  lines=code({}), cells=inp(marks=(0,1,2,3,4,5))),

 dict(id="s05", type="DSA_TRACE_STACK", transition="push", background="zoneA", key="dsaStack",
  headline="A pile, and a [lookup]", color="red", caption="two variables, two jobs",
  codeTitle="valid_parentheses.py",
  narration=
  "|Stack equals empty brackets. That's the pile, and %it starts empty. "
  "|Pairs is a small dictionary mapping each closer back to the opener it belongs with: "
  "a close round needs an open round, a close brace needs an open brace, and so on. "
  "%Three pairs, written once, so we never reason about which closer matches which opener "
  "mid-loop. "
  "|Then we walk the string one character at a time, and every character is either an opener "
  "or a closer.",
  lines=code({1:"The pile. It starts empty.",
              2:"Each closer, and the opener it belongs with.",
              4:"One character at a time, start to finish."}),
  cells=inp(), vars=[{"label":"stack = []","mark":True},{"label":"3 pairs","mark":True}]),

 dict(id="s06", type="DSA_TRACE_STACK", transition="fade", background="zoneA", key="dsaStack",
  headline="An opener goes [on top]", color="red", caption="one layer deep",
  codeTitle="valid_parentheses.py",
  narration=
  "First %character: ^an open brace. |Is that an opener? It is. "
  "Nothing gets checked here, because openers never need checking, and an opener is really just a "
  "promise that something will have to close further along. "
  "|Stack dot append puts it on top. In Python append adds to the end of a list, and because we "
  "always look at the end, the end behaves like the top of a pile. "
  "+One layer deep, and the promise is recorded. "
  "That is all an opener ever does in this algorithm.",
  lines=code({5:"Is this an opener?",
              6:"Then put it on top of the pile."}),
  cells=inp(marks=(0,)), aux=pile(["{"], marks=(0,)),
  vars=[{"label":"char = {","mark":True}]),

 dict(id="s07", type="DSA_TRACE_STACK", transition="fade", background="zoneA", key="dsaStack",
  headline="And [another]", color="red", caption="two layers deep",
  codeTitle="valid_parentheses.py",
  narration=
  "Next character: ^an open square bracket. |Another opener, so up it goes. "
  "+The pile now has the brace on the bottom and the square on top. "
  "Shirt, then jacket. And here's the thing the pile is quietly doing for us: "
  "it's recording the exact order we opened things in, which is the only information we'll need "
  "when the closers start arriving.",
  lines=code({6:"Another opener. On top it goes."}),
  cells=inp(marks=(1,)), aux=pile(["{","["], marks=(1,))),

 dict(id="s08", type="DSA_TRACE_STACK", transition="fade", background="zoneA", key="dsaStack",
  headline="Three [layers deep]", color="red", caption="the top is what matters",
  codeTitle="valid_parentheses.py",
  narration=
  "^An open round bracket, and |on the pile it goes as well. Three layers now. "
  "+Brace, square, round, bottom to top. "
  "%The top of that pile is always whatever we opened most recently, which means the top is always "
  "the thing that has to close next. That sentence is the whole reason a stack fits here, so say it out loud in an interview.",
  lines=code({6:"Three deep. The top is the most recent."}),
  cells=inp(marks=(2,)), aux=pile(["{","[","("], marks=(2,)),
  vars=[{"label":"top = (","mark":True}]),

 dict(id="s09", type="DSA_TRACE_STACK", transition="dip", background="zoneB", key="dsaStack",
  headline="The first [closer]", color="red", caption="does the top match?",
  codeTitle="valid_parentheses.py",
  narration=
  "Now ^a close round bracket. Closers are where the work happens. "
  "|Stack minus one means look at the top of the pile, because in Python minus one is the last item. "
  "%The top is an open round bracket. "
  "|Does it match? Our pairs dictionary says a close round belongs with an open round, so yes. "
  "|Stack dot pop takes it off. +Down to two layers. "
  "One matched pair has cancelled itself out, and the scarf is off.",
  lines=code({10:"Look at the top of the pile.",
              11:"If it does not match, the string is broken.",
              12:"It matches, so take it off."}),
  cells=inp(marks=(3,)), aux=pile(["{","[","("], popped=(2,), marks=(2,)),
  vars=[{"label":"top = (","mark":True}]),

 dict(id="s10", type="QUIZ_CARD", transition="iris", background="zoneC", narration=
  "^Straight from the Dojo. We see a close round bracket, and the top of the pile is an open round. "
  "What do we do? "
  "^Put the closer on the pile as well. ^Take the opener off, because it matches. "
  "^Or decide something is wrong and return False. "
  "Have a think, and pause the video if you'd like a moment. "
  "^Ready? Take it off, because it matches. A matched pair cancels, and cancelling is exactly "
  "what popping the pile means.",
  data={"quiz":{"question":"Closer is ')' and the top is '('. What now?",
    "options":[{"text":"put ')' on the pile too"},{"text":"pop '(' — it matches"},{"text":"return False"}],
    "answerIndex":1,"why":"A matched pair cancels. Popping is how you cancel it."}},
  anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.options.2.atWord","quiz.revealAtWord"]),

 dict(id="s11", type="DSA_TRACE_STACK", transition="fade", background="zoneB", key="dsaStack",
  headline="Undressing, in [reverse]", color="red", caption="the pile empties",
  codeTitle="valid_parentheses.py",
  narration=
  "^A close square arrives. |Top of the pile is an open square, they match, so off it comes. "
  "+One layer left. "
  "Then ^a close brace. |Top is the open brace, they match, and +the pile is empty. "
  "Look at the shape of the whole run: we put on brace, square, round, and we took off "
  "round, square, brace. The exact reverse, and we never chose it, because the pile chose for us.",
  lines=code({12:"Matched, so pop it.",
              10:"Check the top again for the last one."}),
  cells=inp(marks=(4,5)), aux=pile(["{","[","("], popped=(1,2), marks=(1,0)),
  vars=[{"label":"stack = []"}]),

 dict(id="s12", type="DSA_TRACE_STACK", transition="push", background="zoneA", key="dsaStack",
  headline="Empty means [valid]", color="red", caption="the final answer",
  codeTitle="valid_parentheses.py",
  narration=
  "|Return len of stack equals zero. %An empty pile means ^every opener that went on ^came back off, "
  "which is precisely what balanced means. "
  "And if the pile still had something on it, that would be an opener nobody ever closed, "
  "so the answer would be False. "
  "%True. One pass through the string, and every character was looked at exactly once.",
  lines=code({14:"Empty pile means every opener was closed."}),
  cells=inp(done=(0,1,2,3,4,5), marks=(0,5)), aux=[],
  vars=[{"label":"stack = []","mark":True},{"label":"return True","mark":True}]),

 dict(id="s13", type="DSA_SIGNALS", transition="dip", background="zoneC", key="dsaSignals",
  headline="The two guards [everybody forgets]", color="red", caption="where this actually breaks",
  narration=
  "Two lines separate working code from a crash. "
  "^If not stack, return False. That's a closer arriving when the pile is already empty, "
  "like a close bracket with nothing open. Without that guard, looking at the top of an empty pile "
  "throws an error. "
  "^And at the end the pile must be empty. Open-open-close leaves an opener stranded, and the loop "
  "finishes happily without noticing. "
  "^Closer with nothing open. ^Opener never closed. ^Say both out loud, because an interviewer is "
  "listening for exactly those two. Getting the happy path right is the easy half of the question.",
  cells=[{"label":"if not stack","sub":"a closer with nothing open","mark":True},
         {"label":"len(stack) == 0","sub":"an opener nobody closed","mark":True},
         {"label":"'())'","sub":"fails the first guard","color":"red","mark":True},
         {"label":"'(()'","sub":"fails the second","color":"red","mark":True},
         {"label":"say both out loud","sub":"the interviewer is listening","color":"green","mark":True}]),

 dict(id="s14", type="LIST_BUILD", transition="wipe", background="zoneB", narration=
  "Four to go and do. %Valid Parentheses is the one we just wrote. "
  "%Min Stack teaches you to keep two piles at once. "
  "%Daily Temperatures is your first monotonic stack, and it's the one that unlocks a whole family. "
  "And %Largest Rectangle in Histogram is the hard one that people remember you for.",
  data={"heading":"Do these four, in this order","items":[
    {"icon":"lucide:brackets","text":"LeetCode 20","detail":"Valid Parentheses"},
    {"icon":"lucide:arrow-down","text":"LeetCode 155","detail":"Min Stack"},
    {"icon":"lucide:thermometer","text":"LeetCode 739","detail":"Daily Temperatures"},
    {"icon":"lucide:bar-chart","text":"LeetCode 84","detail":"Largest Rectangle"}]},
  anchors=["items.0.atWord","items.1.atWord","items.2.atWord","items.3.atWord"]),

 dict(id="s15", type="RECAP", transition="fade", background="zoneB", narration=
  "Three things to take with you. The signal is %nesting, anything that opens and has to close. "
  "The move is %openers on, closers check the top and pop. "
  "And the bugs live in the %two guards: a closer with nothing open, and an opener never closed.",
  data={"heading":"Stack, in three lines","points":[
    {"text":"Nesting is the signal"},{"text":"Push openers, pop on a match"},{"text":"Guard both ends"}]},
  anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

 dict(id="s16", type="OUTRO_CTA", transition="fade", background="zoneA", narration=
  "Next in the Dojo is breadth-first search, where instead of a pile we use a queue, and that one "
  "swap changes the answer from any path into the shortest path. Go and do Valid Parentheses first.",
  data={"message":"All ten patterns, one per episode","sub":"next: BFS"}, anchors=[]),
 ]}
write(T, 'dsa/ep05.json')
print("EP05:", len(T["scenes"]), "scenes")
