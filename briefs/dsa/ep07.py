# -*- coding: utf-8 -*-
# EP07 — DFS / Backtracking. Source: dsa-pattern-dojo, pattern `dfs` (all 8 steps + challenge).
import json
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _guard import write
CODE = [
 "def subsets(nums):",
 "    result = []",
 "",
 "    def backtrack(start, current):",
 "        result.append(current[:])",
 "",
 "        for i in range(start, len(nums)):",
 "            current.append(nums[i])",
 "            backtrack(i + 1, current)",
 "            current.pop()",
 "",
 "    backtrack(0, [])",
 "    return result",
]
def code(teach):
    return [{"text": t, **({"detail": teach[i], "teach": True} if i in teach else {})} for i, t in enumerate(CODE)]
def tree(rows):   # rows = [(label, depth, state)]
    return [{"label":l,"value":d, **({"text":st} if st else {}), **({"mark":True} if m else {})}
            for l,d,st,m in rows]
def saved(items, marks=()):
    return [{"label":l, **({"mark":True} if l in marks else {})} for l in items]

T = {
 "meta": {"topic":"DFS and Backtracking","format":"long","fps":30,"screenplay":"dojo",
  "onePayoff":"You can generate every combination without duplicates, using one three-line recipe.",
  "openLoop":"Three toppings. Eight pizzas. Where does the eighth come from?",
  "analogy":"THE PIZZA - toppings you put on, explore, and take back off again.",
  "topicAxes":["entity-novelty","tribal-conflict"],
  "seo":{"title":"Backtracking — Choose, Explore, Undo",
   "altTitles":["DFS and Backtracking Explained Until It Sticks (DSA Pattern 7)",
                "Every Subset, Every Permutation — One Recipe"],
   "hook":"Three toppings, eight pizzas.",
   "breakdown":"depth-first search and backtracking, traced line by line, including the copy bug everybody hits",
   "chapters":[{"id":"s01","title":"Three toppings, eight pizzas"},
               {"id":"s03","title":"The words that give it away"},
               {"id":"s04","title":"The pizza"},
               {"id":"s05","title":"Take a photograph"},
               {"id":"s06","title":"Choose, explore, undo"},
               {"id":"s09","title":"The undo that makes it work"},
               {"id":"s11","title":"All eight, in order"},
               {"id":"s12","title":"Why current[:] and not current"},
               {"id":"s14","title":"The four problems to go and do"}],
   "sources":["Pattern set, steps and problem lists: https://github.com/san-gitlogin/dsa-pattern-dojo",
              "Interactive dojo: https://san-gitlogin.github.io/dsa-pattern-dojo/"],
   "queries":["backtracking explained simply","dfs backtracking python","subsets leetcode solution",
     "choose explore undo pattern","why current[:] backtracking","permutations vs subsets",
     "n queens backtracking","combination sum explained","recursion tree drawing",
     "dsa patterns for interviews","leetcode 78 subsets","faang interview dsa patterns"],
   "hashtags":["#dsa","#leetcode","#backtracking","#codinginterview","#thenbxstudio"],
   "tags":["dsa","data structures and algorithms","backtracking","dfs","depth first search","recursion",
     "leetcode","coding interview","faang interview","python","subsets","permutations",
     "interview preparation","dsa patterns","the nbx studio"]}},
 "brand":{"theme":"moderndark","design":"moderndark","themeLight":"daylight","background":"grid",
  "channel":"THE NBX STUDIO","logo":"img:channel_logo.png"},
 "thumbnail":{"title":"CHOOSE. EXPLORE. UNDO.","badge":"Backtracking","asset":"si:python"},
 "scenes":[

 dict(id="s01", type="HOOK", background="zoneA", narration=
  "Three toppings. Eight different pizzas. Where does the eighth one come from?",
  data={"headline":"CHOOSE. EXPLORE. UNDO.","subtext":"three toppings, eight pizzas",
        "heroAsset":"si:python","headlineAtWord":1,"heroAtWord":6},
  anchors=["headlineAtWord","heroAtWord"]),

 dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", narration=
  "Welcome back to the Dojo. This is depth-first search and backtracking, pattern seven of ten, "
  "and it's the one that generates every possibility without ever repeating itself.",
  data={"title":"BACKTRACKING","subtitle":"pattern seven of ten"}, anchors=[]),

 dict(id="s03", type="DSA_SIGNALS", transition="dip", background="zoneA", key="dsaSignals",
  headline="The words that [give it away]", color="purple", caption="signals in the question",
  narration=
  "These signals are the loudest in the whole Dojo, because the question usually says them outright. "
  "^All combinations. ^Every possible arrangement. ^Subsets, or the power set. "
  "^Permutations, where the order matters. ^Generate, or find all, rather than find one. "
  "^But if the question asks for a count instead of the actual list, dynamic programming is usually "
  "cheaper, because you don't need to build what you're only counting. "
  "The word all is the tell. If they want all of them, somebody has to walk the tree.",
  cells=[{"label":"all combinations","sub":"the loudest signal there is","mark":True},
         {"label":"every possible","sub":"same thing, plainer","mark":True},
         {"label":"subsets","sub":"the power set","mark":True},
         {"label":"permutations","sub":"where order matters","mark":True},
         {"label":"generate / find all","sub":"not find one","mark":True},
         {"label":"just the count?","sub":"then DP is cheaper","color":"red","mark":True}]),

 dict(id="s04", type="DSA_TRACE_TREE", transition="wipe", background="zoneC", key="dsaTree",
  headline="Three toppings, [eight pizzas]", color="purple", caption="what we have to produce",
  codeTitle="subsets.py",
  narration=
  "You're building every pizza you can from three toppings: pepperoni, mushroom and olive, "
  "which we'll call ^one, ^two and ^three. "
  "How many pizzas is that? Each topping is independently on or off, so it's two times two times two, "
  "which is eight, and that count includes ^the plain pizza with nothing on it at all. "
  "People forget the empty one constantly, and interviewers notice.",
  lines=code({}),
  cells=tree([("1",0,None,True),("2",0,None,True),("3",0,None,True),("[] plain",0,"done",True)]),
  vars=[{"label":"2 × 2 × 2 = 8"}]),

 dict(id="s05", type="DSA_TRACE_TREE", transition="push", background="zoneA", key="dsaTree",
  headline="Take a [photograph]", color="purple", caption="every state is an answer",
  codeTitle="subsets.py",
  narration=
  "|Result is the list of finished pizzas. |Backtrack is the function that does the walking, "
  "and it takes where to start from and what's currently on the pizza. "
  "|Then the first line inside it: result dot append of current, colon, in brackets. "
  "%Save a photograph of the pizza exactly as it is right now. "
  "And notice this happens immediately, before any topping is added, which is how ^the empty pizza "
  "gets into the answer without us doing anything special for it.",
  lines=code({1:"The finished pizzas go here.",
              3:"Where to start from, and what is on the pizza now.",
              4:"Photograph the pizza as it stands."}),
  cells=tree([("[]",0,"done",True)]), aux=saved(["[]"]),
  vars=[{"label":"result = [[]]","mark":True}]),

 dict(id="s06", type="DSA_TRACE_TREE", transition="fade", background="zoneA", key="dsaTree",
  headline="Choose, explore, [undo]", color="purple", caption="the three-line recipe",
  codeTitle="subsets.py",
  narration=
  "Here's the whole recipe, and it really is three lines. "
  "|Current dot append puts a topping on. That's choose. "
  "|Backtrack calls itself, which goes off and builds every pizza that starts this way. That's explore. "
  "|And current dot pop takes the topping back off. That's undo. "
  "^Choose, ^explore, ^undo. Say that out loud a few times, because every backtracking problem you "
  "will ever meet is those three lines wrapped around a different rule.",
  lines=code({7:"CHOOSE: put a topping on.",
              8:"EXPLORE: build everything that starts this way.",
              9:"UNDO: take it back off."}),
  cells=tree([("choose",0,None,True),("explore",1,None,True),("undo",2,"dropped",True)])),

 dict(id="s07", type="DSA_TRACE_TREE", transition="fade", background="zoneA", key="dsaTree",
  headline="Down the [first branch]", color="purple", caption="pepperoni, then mushroom",
  codeTitle="subsets.py",
  narration=
  "|We put pepperoni on, so the pizza is ^one, and we photograph it. "
  "|Then backtrack calls itself, starting from the next topping along, and we put mushroom on too. "
  "Now the pizza is ^one and two, +another photograph taken. "
  "The call is diving, not spreading. It isn't looking at the other toppings yet at all: "
  "it's going as deep as this branch will let it before it considers anything else.",
  lines=code({7:"Pepperoni goes on.",
              8:"Dive: what else can sit on a pepperoni pizza?"}),
  cells=tree([("[]",0,None,False),("[1]",1,None,True),("[1,2]",2,None,True)]),
  aux=saved(["[]","[1]","[1,2]"], marks=("[1,2]",))),

 dict(id="s08", type="QUIZ_CARD", transition="iris", background="zoneC", narration=
  "^Straight from the Dojo. The pizza is currently pepperoni and mushroom. After we try adding olive, "
  "what happens next? "
  "^We're finished. ^We take olive off, then mushroom off, and try pepperoni with olive instead. "
  "^Or we start a completely new pizza from scratch. "
  "Have a think, and pause the video if you'd like a moment. "
  "^Ready? We take the toppings back off, one at a time, and try a different combination. "
  "That taking-off is the backtracking, and it's the only reason we ever reach the other branches.",
  data={"quiz":{"question":"Pizza is [1,2]. After trying [1,2,3], what next?",
    "options":[{"text":"we are finished"},{"text":"undo, then try [1,3]"},{"text":"start a new pizza"}],
    "answerIndex":1,"why":"Undo is what reaches the other branches."}},
  anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.options.2.atWord","quiz.revealAtWord"]),

 dict(id="s09", type="DSA_TRACE_TREE", transition="fade", background="zoneB", key="dsaTree",
  headline="The bottom, and the [way back]", color="purple", caption="undo, one topping at a time",
  codeTitle="subsets.py",
  narration=
  "Olive goes on, the pizza is ^one two three, the supreme, +photographed. "
  "There are no toppings left to try, so the loop ends and the call returns. "
  "|Current dot pop takes olive back off, and we're at ^one two again. "
  "The loop there has also finished, so |that call returns too, and pop takes mushroom off, "
  "leaving ^just pepperoni. "
  "We have climbed back up two levels, and now the loop at that level can carry on to the topping "
  "it never got to.",
  lines=code({9:"Olive comes off. Back to [1, 2].",
              9:"And again. Back to [1]."}),
  cells=tree([("[1]",1,None,True),("[1,2]",2,"dropped",True),("[1,2,3]",3,"dropped",True)]),
  aux=saved(["[]","[1]","[1,2]","[1,2,3]"], marks=("[1,2,3]",))),

 dict(id="s10", type="DSA_TRACE_TREE", transition="fade", background="zoneB", key="dsaTree",
  headline="The branch we [unlocked]", color="purple", caption="pepperoni and olive",
  codeTitle="subsets.py",
  narration=
  "|Back at the pepperoni level, the loop moves on to olive, and we get ^pepperoni and olive. "
  "+That's a combination we could never have reached without undoing first. "
  "This is the bit worth sitting with. The undo isn't tidying up after ourselves. "
  "%The undo is what creates the other branches. "
  "Without that single pop, the pizza would just keep growing until it had everything on it, "
  "and we'd finish with three pizzas instead of eight.",
  lines=code({6:"The loop moves on to the next topping."}),
  cells=tree([("[1]",1,None,False),("[1,3]",2,None,True)]),
  aux=saved(["[]","[1]","[1,2]","[1,2,3]","[1,3]"], marks=("[1,3]",)),
  vars=[{"label":"undo = new branches","mark":True}]),

 dict(id="s11", type="DSA_TRACE_TREE", transition="push", background="zoneA", key="dsaTree",
  headline="All eight, [in order]", color="purple", caption="the full menu",
  codeTitle="subsets.py",
  narration=
  "The same thing happens from the top. Everything unwinds back to the plain pizza, the loop moves "
  "on to ^mushroom, which gives mushroom, then mushroom and olive, and finally ^olive on its own. "
  "+Eight photographs: plain, pepperoni, pepperoni and mushroom, the supreme, pepperoni and olive, "
  "mushroom, mushroom and olive, and olive. "
  "|Return result. Every combination, each one exactly once, and not a duplicate anywhere.",
  lines=code({12:"Hand back all eight."}),
  cells=tree([("[2]",1,None,True),("[3]",1,None,True)]),
  aux=saved(["[]","[1]","[1,2]","[1,2,3]","[1,3]","[2]","[2,3]","[3]"], marks=("[3]",))),

 dict(id="s12", type="DSA_TRACE_TREE", transition="dip", background="zoneC", key="dsaTree",
  headline="Why [current colon] matters", color="purple", caption="the bug everybody ships",
  codeTitle="subsets.py",
  narration=
  "One line to be careful about, and this is the bug people actually ship. "
  "|We save current colon in brackets, not current. "
  "In Python a list is a reference, like a whiteboard rather than a photograph. "
  "^If we saved current itself, every entry in the result would point at the same whiteboard, "
  "^and since we keep wiping it as we backtrack, ^you'd finish with eight identical empty lists. "
  "%The colon makes a copy. Four characters, and without them the whole thing silently produces nonsense.",
  lines=code({4:"The [:] is a COPY. Without it, every entry is the same list."}),
  cells=tree([("save current",0,None,True),("all point at one list",1,"dropped",True),("8 × []",2,"dropped",True)]),
  vars=[{"label":"current[:] = a copy","mark":True}]),

 dict(id="s13", type="DSA_COST", transition="wipe", background="zoneB", key="dsaCost",
  headline="What this [costs]", color="blue", caption="the honest numbers",
  narration=
  "Be honest about the cost, because an interviewer will push on it. "
  "^Subsets of three toppings is eight, which is nothing. "
  "^Subsets of twenty is a million. ^Subsets of thirty is a billion, and your program stops being "
  "usable somewhere around there. "
  "^That's two to the n, and it is not a bug in your solution, it's the size of the answer itself: "
  "you can't list a billion things quickly however clever you are. "
  "Which is exactly why a question asking only for a count is a different pattern.",
  cells=[{"label":"n = 3","sub":"8 subsets","value":5,"mark":True},
         {"label":"n = 20","sub":"1,048,576","value":45,"mark":True},
         {"label":"n = 30","sub":"1,073,741,824","value":100,"text":"dropped","mark":True},
         {"label":"O(2ⁿ) is the answer size","sub":"not a flaw in your code","value":70,"mark":True}]),

 dict(id="s14", type="LIST_BUILD", transition="fade", background="zoneB", narration=
  "Four to go and do. %Subsets is the one we just wrote. "
  "%Permutations swaps the start index for a used-set, and that difference is worth feeling. "
  "%Combination Sum lets you reuse a number, so the recursion goes to i rather than i plus one. "
  "And %N-Queens is the famous one, where the undo is undoing a whole board.",
  data={"heading":"Do these four, in this order","items":[
    {"icon":"lucide:list","text":"LeetCode 78","detail":"Subsets"},
    {"icon":"lucide:shuffle","text":"LeetCode 46","detail":"Permutations"},
    {"icon":"lucide:plus","text":"LeetCode 39","detail":"Combination Sum"},
    {"icon":"lucide:crown","text":"LeetCode 51","detail":"N-Queens"}]},
  anchors=["items.0.atWord","items.1.atWord","items.2.atWord","items.3.atWord"]),

 dict(id="s15", type="RECAP", transition="fade", background="zoneB", narration=
  "Three things to take with you. The signal is the word %all: every combination, every arrangement. "
  "The recipe is %choose, explore, undo, in that order, always. "
  "And %save a copy, because saving the list itself gives you eight pointers to the same wreckage.",
  data={"heading":"Backtracking, in three lines","points":[
    {"text":"The word is ALL"},{"text":"Choose, explore, undo"},{"text":"Save a copy, not the list"}]},
  anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

 dict(id="s16", type="OUTRO_CTA", transition="fade", background="zoneA", narration=
  "Next in the Dojo is dynamic programming, which is what you reach for when this tree has the same "
  "branch in it over and over. Go and do Subsets first, then Permutations.",
  data={"message":"All ten patterns, one per episode","sub":"next: Dynamic Programming"}, anchors=[]),
 ]}
write(T, 'dsa/ep07.json')
print("EP07:", len(T["scenes"]), "scenes")
