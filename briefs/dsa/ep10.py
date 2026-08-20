# -*- coding: utf-8 -*-
# EP10 — Fast and Slow Pointers. Source: dsa-pattern-dojo, pattern `fast-slow` (all 6 steps + challenge).
import json
CODE = [
 "def has_cycle(head):",
 "    slow = fast = head",
 "",
 "    while fast and fast.next:",
 "        slow = slow.next",
 "        fast = fast.next.next",
 "",
 "        if slow == fast:",
 "            return True",
 "",
 "    return False",
]
def code(teach):
    return [{"text": t, **({"detail": teach[i], "teach": True} if i in teach else {})} for i, t in enumerate(CODE)]
def nodes(marks=()):
    return [{"label":l, **({"mark":True} if i in marks else {})} for i,l in enumerate(["1","2","3","4"])]

CODE2 = [
 "def middle_node(head):",
 "    slow = fast = head",
 "",
 "    while fast and fast.next:",
 "        slow = slow.next",
 "        fast = fast.next.next",
 "",
 "    return slow",
]
def code2(teach):
    return [{"text": t, **({"detail": teach[i], "teach": True} if i in teach else {})} for i, t in enumerate(CODE2)]
CODE3 = [
 "def cycle_start(head):",
 "    slow = fast = head",
 "",
 "    while fast and fast.next:",
 "        slow, fast = slow.next, fast.next.next",
 "        if slow == fast:",
 "            slow = head",
 "            while slow != fast:",
 "                slow, fast = slow.next, fast.next",
 "            return slow",
 "",
 "    return None",
]
def code3(teach):
    return [{"text": t, **({"detail": teach[i], "teach": True} if i in teach else {})} for i, t in enumerate(CODE3)]
def nodes5(labels, marks=()):
    return [{"label":l, **({"mark":True} if i in marks else {})} for i,l in enumerate(labels)]

T = {
 "meta": {"topic":"Fast and Slow Pointers","format":"long","fps":30,"screenplay":"dojo",
  "onePayoff":"You can detect a loop, or find a midpoint, in one pass and with no extra memory at all.",
  "openLoop":"Two runners on a track. If there's a loop, they must collide. Why must?",
  "analogy":"THE RUNNING TRACK - a tortoise and a hare, and a bend you cannot see.",
  "topicAxes":["entity-novelty","tribal-conflict"],
  "seo":{"title":"Fast and Slow Pointers — Why The Hare Always Catches The Tortoise",
   "altTitles":["Floyd's Cycle Detection Explained Until It Sticks (DSA Pattern 10)",
                "Detect a Linked List Cycle With Zero Extra Memory"],
   "hook":"Two runners. If there is a loop, they must collide.",
   "breakdown":"Floyd's tortoise and hare, traced node by node, plus the proof that it always terminates",
   "chapters":[{"id":"s01","title":"Two runners, one track"},
               {"id":"s03","title":"The words that give it away"},
               {"id":"s04","title":"The track"},
               {"id":"s05","title":"Both start together"},
               {"id":"s06","title":"One step, two steps"},
               {"id":"s08","title":"Why they must meet"},
               {"id":"s10","title":"They meet"},
               {"id":"s10a","title":"Same runners, find the middle"},
               {"id":"s10d","title":"Where does the loop begin"},
               {"id":"s11","title":"All four jobs, one loop"},
               {"id":"s12","title":"The four problems to go and do"}],
   "sources":["Pattern set, steps and problem lists: https://github.com/san-gitlogin/dsa-pattern-dojo",
              "Interactive dojo: https://san-gitlogin.github.io/dsa-pattern-dojo/"],
   "queries":["fast and slow pointers explained","floyd cycle detection python","detect linked list cycle",
     "tortoise and hare algorithm","find middle of linked list one pass","why do fast and slow meet",
     "linked list cycle 2 explained","happy number solution","palindrome linked list",
     "dsa patterns for interviews","leetcode 141 linked list cycle","faang interview dsa patterns"],
   "hashtags":["#dsa","#leetcode","#linkedlist","#codinginterview","#thenbxstudio"],
   "tags":["dsa","data structures and algorithms","fast and slow pointers","floyd cycle detection",
     "linked list","leetcode","coding interview","faang interview","python","algorithms",
     "tortoise and hare","interview preparation","dsa patterns","the nbx studio"]}},
 "brand":{"theme":"moderndark","design":"moderndark","themeLight":"daylight","background":"grid",
  "channel":"THE NBX STUDIO","logo":"img:channel_logo.png"},
 "thumbnail":{"title":"THEY MUST COLLIDE","badge":"Fast & Slow","asset":"si:python"},
 "scenes":[

 dict(id="s01", type="HOOK", background="zoneA", narration=
  "Two runners on a track. If there's a loop, they must collide. But why must?",
  data={"headline":"THEY MUST COLLIDE","subtext":"two runners, one loop",
        "heroAsset":"si:python","headlineAtWord":1,"heroAtWord":7},
  anchors=["headlineAtWord","heroAtWord"]),

 dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", narration=
  "Welcome back to the Dojo. This is fast and slow pointers, the tenth and last pattern, "
  "and it's the one where a single line of reasoning does what a whole hash set would otherwise cost you.",
  data={"title":"FAST AND SLOW","subtitle":"pattern ten of ten"}, anchors=[]),

 dict(id="s03", type="DSA_SIGNALS", transition="dip", background="zoneA", key="dsaSignals",
  headline="The words that [give it away]", color="red", caption="signals in the question",
  narration=
  "^Cycle, or loop, is the obvious one. ^Linked list, almost any question about one. "
  "^Find the middle, in a single pass. ^Circular, or does it repeat. "
  "^And a constraint you'll see written explicitly: order one space, no extra memory allowed. "
  "^If extra memory is fine, a visited set is simpler and you should say so. "
  "That memory constraint is usually the real signal, because it's the interviewer quietly ruling out "
  "the easy answer.",
  cells=[{"label":"cycle / loop","sub":"the obvious one","mark":True},
         {"label":"linked list","sub":"almost any question about one","mark":True},
         {"label":"find the middle","sub":"in a single pass","mark":True},
         {"label":"circular / repeats","sub":"same family","mark":True},
         {"label":"O(1) space required","sub":"the real signal","color":"green","mark":True},
         {"label":"memory is fine?","sub":"then a visited set is simpler","color":"red","mark":True}]),

 dict(id="s04", type="DSA_TRACE_LIST", transition="wipe", background="zoneC", key="dsaList",
  headline="A track with a [bend]", color="red", caption="four nodes, one loop",
  codeTitle="has_cycle.py",
  narration=
  "Picture a running track where you can't see the whole shape. "
  "Four nodes: ^one, ^two, ^three, ^four, and four quietly points back to two, "
  "so the last stretch is a loop rather than a finish line. "
  "Two runners set off from the same place. The tortoise takes one step at a time. "
  "The hare takes two. If the track ends, the hare falls off the end first and we know there's no loop. "
  "If it doesn't end, something else happens, and that something is the whole pattern.",
  lines=code({}), cells=nodes(marks=(0,1,2,3))),

 dict(id="s05", type="DSA_TRACE_LIST", transition="push", background="zoneA", key="dsaList",
  headline="Both start [together]", color="red", caption="node one",
  codeTitle="has_cycle.py",
  narration=
  "|Slow equals fast equals head puts >both runners on ^node one. "
  "Python lets you assign two names at once like that, and both now point at the same first node. "
  "%No extra memory has been allocated at all. Not a set, not a list, just two references, "
  "which is the entire reason this pattern exists.",
  lines=code({1:"Both runners start on the first node."}),
  cells=nodes(marks=(0,)),
  pointers=[{"label":"slow","value":0,"color":"blue","mark":True},{"label":"fast","value":0,"color":"red","mark":True}],
  vars=[{"label":"O(1) space","mark":True}]),

 dict(id="s06", type="DSA_TRACE_LIST", transition="fade", background="zoneA", key="dsaList",
  headline="One step, [two steps]", color="red", caption="round one",
  codeTitle="has_cycle.py",
  narration=
  "|While fast exists and fast dot next exists, keep running. That double check is the guard: "
  "if either is missing we've reached the end of the track, so there was no loop. "
  "|Slow moves to >^node two. |Fast moves twice, to >^node three. "
  "%The gap between them is one node now, where a moment ago it was zero.",
  lines=code({3:"Stop if the hare runs out of track.",
              4:"Tortoise: one step.",
              5:"Hare: two steps."}),
  cells=nodes(marks=(1,2)),
  pointers=[{"label":"slow","value":1,"color":"blue","mark":True},{"label":"fast","value":2,"color":"red","mark":True}],
  vars=[{"label":"gap = 1","mark":True}]),

 dict(id="s07", type="DSA_TRACE_LIST", transition="fade", background="zoneA", key="dsaList",
  headline="Round two, [into the bend]", color="red", caption="the hare comes round",
  codeTitle="has_cycle.py",
  narration=
  "|Slow moves to >^node three. |Fast moves two again: node three to node four, "
  "and then four points back to two, so >the hare lands on ^node two. "
  "It has been round the bend, and it's now sitting behind the tortoise. "
  "%The gap is two. On a track with no loop the hare would have fallen off by now, "
  "and instead it's lapping.",
  lines=code({4:"Tortoise: one more step.",
              5:"Hare: two more, and round the loop."}),
  cells=nodes(marks=(2,1)),
  pointers=[{"label":"slow","value":2,"color":"blue","mark":True},{"label":"fast","value":1,"color":"red","mark":True}],
  vars=[{"label":"gap = 2","mark":True}]),

 dict(id="s08", type="QUIZ_CARD", transition="iris", background="zoneC", narration=
  "^Straight from the Dojo, and this is the good one. The hare is inside the cycle, behind the "
  "tortoise. Will they ever land on the same node? "
  "^No, the hare is simply too fast. ^Yes, because the hare gains one position per round, so they "
  "must meet. ^Or only if the loop happens to be an even length. "
  "Have a think, and pause the video if you'd like a moment. "
  "^Ready? Yes, and it isn't luck. Each round the hare moves two and the tortoise moves one, "
  "so the distance between them closes by exactly one, every single round.",
  data={"quiz":{"question":"Hare is behind the tortoise in the cycle. Do they meet?",
    "options":[{"text":"no, the hare is too fast"},{"text":"yes — the gap closes by one each round"},
               {"text":"only if the loop is even"}],
    "answerIndex":1,"why":"Two minus one is one. The gap shrinks by one per round."}},
  anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.options.2.atWord","quiz.revealAtWord"]),

 dict(id="s09", type="DSA_COST", transition="dip", background="zoneB", key="dsaCost",
  headline="Why they [must] meet", color="blue", caption="the argument, not the vibe",
  narration=
  "This is worth being able to say out loud, because interviewers ask for it. "
  "Once both runners are inside the loop, think about the distance from the hare to the tortoise, "
  "measured forwards around the loop. "
  "^Each round the hare covers two and the tortoise covers one, ^so that distance shrinks by exactly "
  "one every round. ^A quantity that decreases by one and can't go below zero has to reach zero. "
  "^When it does, both runners are on the same node. "
  "It can never jump past, because closing by one at a time cannot skip a value.",
  cells=[{"label":"hare +2, tortoise +1","sub":"every round","value":80,"mark":True},
         {"label":"gap shrinks by 1","sub":"exactly one, every round","value":60,"mark":True},
         {"label":"cannot go below zero","sub":"so it must reach zero","value":40,"mark":True},
         {"label":"gap 0 = same node","sub":"and it cannot skip past","value":20,"mark":True}]),

 dict(id="s10", type="DSA_TRACE_LIST", transition="push", background="zoneA", key="dsaList",
  headline="And they [meet]", color="red", caption="both on node four",
  codeTitle="has_cycle.py",
  narration=
  "|Slow steps to >node four. |Fast goes two: node two to node three, then three to four, "
  "so >it lands on ^node four as well. "
  "|Slow equals fast, so |we return True. There's a cycle. "
  "%One pass, %no extra memory, and no list of visited nodes anywhere.",
  lines=code({4:"Tortoise: one step, to node four.",
              5:"Hare: two steps, also to node four.",
              7:"Same node.",
              8:"So there is a cycle."}),
  cells=nodes(marks=(3,)),
  pointers=[{"label":"slow","value":3,"color":"blue","mark":True},{"label":"fast","value":3,"color":"red","mark":True}],
  vars=[{"label":"return True","mark":True},{"label":"O(1) space","mark":True}]),


 dict(id="s10a", type="DSA_TRACE_LIST", transition="wipe", background="zoneC", key="dsaList",
  headline="Same runners, [find the middle]", color="red", caption="a track with no loop",
  codeTitle="middle_node.py",
  narration=
  "Now take the loop away and run exactly the same race. "
  "Five nodes in a straight line: ^one, ^two, ^three, ^four, ^five, and a proper ending this time. "
  "The question changes completely. Find the middle node in a single pass, "
  "without counting the list first and without storing it anywhere. "
  "|Look at the code and notice what is different. Almost nothing is.",
  lines=code2({0:"A different question, and very nearly the same code."}),
  cells=nodes5(["1","2","3","4","5"], marks=(0,1,2,3,4))),

 dict(id="s10b", type="DSA_TRACE_LIST", transition="push", background="zoneA", key="dsaList",
  headline="The hare runs [twice as far]", color="red", caption="so the tortoise is halfway",
  codeTitle="middle_node.py",
  narration=
  "|Both start on node one. |Tortoise to >^node two, |hare to >^node three. "
  "Round again: tortoise to node three, and the hare to node five. "
  "|Fast dot next is now empty, so the loop stops, and >the tortoise is standing on ^node three. "
  "%That is the middle of five. "
  "And it falls out for free: the hare covered twice the ground in the same number of rounds, "
  "so wherever the hare finishes, the tortoise is exactly halfway there. "
  "You never counted anything.",
  lines=code2({1:"Same start as before.",
               4:"One step.",
               5:"Two steps, so double the distance.",
               7:"Hare is out of track. Tortoise is at the midpoint."}),
  cells=nodes5(["1","2","3","4","5"], marks=(2,4)),
  pointers=[{"label":"slow","value":2,"color":"blue","mark":True},{"label":"fast","value":4,"color":"red","mark":True}],
  vars=[{"label":"middle = node 3","mark":True}]),

 dict(id="s10c", type="QUIZ_CARD", transition="iris", background="zoneC", narration=
  "^One more from the Dojo, and this one catches people out. "
  "That list had five nodes, an odd number, so the middle was obvious. "
  "Run the very same loop on a list of six. Where does the tortoise stop? "
  "^On node three, the first of the two middles. ^Or on node four, the second one. "
  "Have a think, and pause the video if you would like a moment. "
  "^Ready? Node four, the second middle. With an even length the hare runs off the end one round "
  "later than you expect, and the tortoise takes one more step with it. "
  "If a problem wants the first middle instead, you start the hare one node ahead.",
  data={"quiz":{"question":"Six nodes — where does slow stop?",
    "options":[{"text":"node 3, the first middle"},{"text":"node 4, the second middle"}],
    "answerIndex":1,"why":"Even length gives the hare one more round, so slow takes one more step."}},
  anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.revealAtWord"]),

 dict(id="s10d", type="DSA_TRACE_LIST", transition="fade", background="zoneB", key="dsaList",
  headline="Where does the loop [begin]", color="red", caption="the trick that looks like magic",
  codeTitle="cycle_start.py",
  narration=
  "Last one, and it is the question interviewers actually ask. "
  "You know there is a loop. Now find the node where it starts. "
  "Here is a track where ^one and ^two are the straight part, and ^three, ^four and ^five are the loop, "
  "so ^node three is the entrance we are looking for. "
  "|Run the usual race until they meet. "
  "|Then do something that looks like nonsense: send the tortoise back to the start.",
  lines=code3({3:"The usual race, until they collide.",
               6:"Now put the tortoise back on node one."}),
  cells=nodes5(["1","2","3","4","5"], marks=(0,1,2,3,4)),
  pointers=[{"label":"entrance?","value":2,"color":"yellow","mark":True}]),

 dict(id="s10e", type="DSA_TRACE_LIST", transition="push", background="zoneA", key="dsaList",
  headline="Same speed, and they [land on it]", color="red", caption="both walk one step now",
  codeTitle="cycle_start.py",
  narration=
  "|Now walk them both at one step each, the hare included. "
  ">The tortoise leaves node one, >and the hare moves one along inside the loop. "
  "|Step again, and they land together on ^node three, which is exactly the entrance. "
  "|Return slow. "
  "%The loop starts at node three. "
  "The reason is a short piece of arithmetic: the distance from the head to the entrance turns out "
  "to equal the distance from the meeting point back round to the entrance. "
  "Equal distances, equal speeds, so they arrive at the same moment. "
  "You do not need to derive that in the room, but you should be able to say that sentence.",
  lines=code3({7:"Both at one step each now.",
               8:"They meet at the entrance.",
               9:"That node is the answer."}),
  cells=nodes5(["1","2","3","4","5"], marks=(2,)),
  pointers=[{"label":"slow","value":2,"color":"blue","mark":True},{"label":"fast","value":2,"color":"red","mark":True}],
  vars=[{"label":"loop starts at node 3","mark":True}]),

 dict(id="s11", type="DSA_SIGNALS", transition="fade", background="zoneC", key="dsaSignals",
  headline="One loop, [four jobs]", color="red", caption="everything those two runners can do",
  narration=
  "Step back and look at what one loop just did for you. "
  "^With a cycle, they collide, and that tells you the loop exists. "
  "^With no cycle, the hare runs out of track and the tortoise is left on the middle. "
  "^Restart the tortoise at the head after they meet, walk both at one speed, "
  "and they land on the entrance to the loop. "
  "^And if you start the hare k nodes ahead instead of together, the gap stays k forever, "
  "which hands you the kth node from the end. "
  "Four different interview questions. The same two pointers, and the same eight lines.",
  cells=[{"label":"they collide","sub":"a cycle exists","mark":True},
         {"label":"hare hits the end","sub":"tortoise is on the middle","mark":True},
         {"label":"restart at the head","sub":"they meet at the loop entrance","mark":True},
         {"label":"start k ahead","sub":"kth node from the end","color":"green","mark":True}]),

 dict(id="s12", type="LIST_BUILD", transition="wipe", background="zoneB", narration=
  "Four to go and do. %Linked List Cycle is the one we just wrote. "
  "%Middle of the Linked List is the same loop with a different ending. "
  "%Linked List Cycle Two asks where the loop begins. "
  "And %Happy Number is the same algorithm on numbers instead of nodes, which is the one that "
  "proves you actually understood it.",
  data={"heading":"Do these four, in this order","items":[
    {"icon":"lucide:repeat","text":"LeetCode 141","detail":"Linked List Cycle"},
    {"icon":"lucide:git-commit","text":"LeetCode 876","detail":"Middle of the Linked List"},
    {"icon":"lucide:corner-down-right","text":"LeetCode 142","detail":"Linked List Cycle II"},
    {"icon":"lucide:smile","text":"LeetCode 202","detail":"Happy Number"}]},
  anchors=["items.0.atWord","items.1.atWord","items.2.atWord","items.3.atWord"]),

 dict(id="s13", type="RECAP", transition="fade", background="zoneB", narration=
  "Three things to take with you. The signal is %a cycle, a middle, or a demand for constant space. "
  "The move is %two pointers at different speeds from the same start. "
  "And the reason it works is that %the gap closes by one per round, so a meeting is forced.",
  data={"heading":"Fast and Slow, in three lines","points":[
    {"text":"Cycle, middle, or O(1) space"},{"text":"Two speeds, one start"},{"text":"The gap closes by one"}]},
  anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

 dict(id="s14", type="OUTRO_CTA", transition="fade", background="zoneA", narration=
  "That's all ten patterns. Next comes the part that actually matters in an interview: taking an "
  "unseen problem and deciding which of these to reach for. Go and do Linked List Cycle first.",
  data={"message":"Ten patterns down","sub":"next: the six-step framework"}, anchors=[]),
 ]}
json.dump(T, open('/Users/santhu/iauteur/briefs/dsa/ep10.json','w'), indent=1)
print("EP10:", len(T["scenes"]), "scenes")
