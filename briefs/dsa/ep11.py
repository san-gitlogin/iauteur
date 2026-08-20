# -*- coding: utf-8 -*-
# EP11 — Five Problems, Live. Source: dsa-pattern-dojo, PROBLEMS p1..p5.
# Each problem is solved with its OWN pattern's visualiser: the picture the viewer
# already learned in that pattern's episode.
import json
def sig(rows):
    return [{"label":l,"sub":s, **({"color":c} if c else {}), "mark":True} for l,s,c in rows]

T = {
 "meta": {"topic":"Five Problems, Live","format":"long","fps":30,"screenplay":"dojo",
  "onePayoff":"You can read an unseen problem, name the pattern from its words, and justify the choice.",
  "openLoop":"Five problems you have never seen. The method has to do the work now.",
  "analogy":"THE DIAGNOSIS - symptoms first, treatment second.",
  "topicAxes":["economic-pain","tribal-conflict"],
  "seo":{"title":"5 LeetCode Mediums — Spotting The Pattern From The Words Alone",
   "altTitles":["Five Problems, One Method (DSA Pattern Dojo, Finale)",
                "How To Pick The Right Pattern Under Interview Pressure"],
   "hook":"Five problems. Name the pattern before the code.",
   "breakdown":"five real interview problems, each one solved by reading the signal words first",
   "chapters":[{"id":"s01","title":"Five problems, one method"},
               {"id":"s03","title":"The method, in one screen"},
               {"id":"s04","title":"1 · Container With Most Water"},
               {"id":"s06","title":"2 · Longest Substring"},
               {"id":"s08","title":"3 · Rotated Sorted Array"},
               {"id":"s11","title":"4 · Number of Islands"},
               {"id":"s13","title":"5 · Coin Change"},
               {"id":"s15","title":"Why greedy fails here"},
               {"id":"s16","title":"What to do tomorrow"}],
   "sources":["Pattern set, steps and problem lists: https://github.com/san-gitlogin/dsa-pattern-dojo",
              "Interactive dojo: https://san-gitlogin.github.io/dsa-pattern-dojo/"],
   "queries":["leetcode medium walkthrough","how to identify pattern from problem statement",
     "container with most water explained","longest substring without repeating characters",
     "search in rotated sorted array solution","number of islands bfs","coin change dp explained",
     "why greedy fails coin change","dsa pattern recognition practice",
     "faang interview problems","leetcode blind 75 patterns","technical interview walkthrough"],
   "hashtags":["#dsa","#leetcode","#codinginterview","#faang","#thenbxstudio"],
   "tags":["dsa","data structures and algorithms","leetcode","coding interview","faang interview",
     "container with most water","longest substring","rotated sorted array","number of islands",
     "coin change","python","interview preparation","dsa patterns","the nbx studio"]}},
 "brand":{"theme":"moderndark","design":"moderndark","themeLight":"daylight","background":"grid",
  "channel":"THE NBX STUDIO","logo":"img:channel_logo.png"},
 "thumbnail":{"title":"NAME IT IN 10s","badge":"5 Problems","asset":"si:leetcode"},
 "scenes":[

 dict(id="s01", type="HOOK", background="zoneA", narration=
  "Five problems you've never seen. Ten patterns you have. Which one, and how fast can you tell?",
  data={"headline":"NAME IT IN 10s","subtext":"five problems, one method",
        "heroAsset":"si:python","headlineAtWord":1,"heroAtWord":9},
  anchors=["headlineAtWord","heroAtWord"]),

 dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", narration=
  "Welcome back to the Dojo, and to the last episode. Ten patterns are behind us. "
  "Now five real interview problems, and the only thing that matters is how we choose.",
  data={"title":"FIVE PROBLEMS","subtitle":"the finale"}, anchors=[]),

 dict(id="s03", type="DSA_FRAMEWORK", transition="dip", background="zoneA", key="dsaFramework",
  headline="The method, in [one screen]", color="blue", caption="what we do five times",
  narration=
  "Same routine for every one of these. ^Read the statement. ^Circle the signal words. "
  "^Name the pattern those words point at. ^Then check the core idea really applies, rather than "
  "just sounding right. ^And only then write anything. "
  "Watch how short step three gets once step two is done properly. That's the whole promise of "
  "learning patterns rather than memorising solutions.",
  cells=[{"label":"read the statement","sub":"all of it, twice","mark":True},
         {"label":"circle the signals","sub":"the constraining words","mark":True},
         {"label":"name the pattern","sub":"one or two candidates","mark":True},
         {"label":"check the core idea","sub":"does the reasoning hold?","mark":True},
         {"label":"then code","sub":"and not before","mark":True}]),

 dict(id="s04", type="DSA_SIGNALS", transition="push", background="zoneA", key="dsaSignals",
  headline="One · [Container With Most Water]", color="yellow", caption="reading the statement",
  narration=
  "An array of heights, each one a vertical line. Find the two lines that hold the most water "
  "between them. Circle the words. "
  "^Two. ^Maximum. ^A pair of elements. ^An array. "
  "Two and pair together point straight at two pointers. "
  "^But there's a catch worth noticing: this array isn't sorted, and sorted was our signal last time. "
  "So does the pattern still hold?",
  cells=sig([("two","exactly two lines",None),("maximum","we are optimising",None),
             ("a pair of elements","the two-pointer shape",None),("an array","indexed, positional",None),
             ("NOT sorted","so does it still work?","red")])),

 dict(id="s05", type="DSA_TRACE_PTRS", transition="fade", background="zoneA", key="dsaPtrs",
  headline="Yes, and [here is why]", color="red", caption="the widest container first",
  codeTitle="max_area.py",
  narration=
  "It does hold, and the reasoning is worth having. "
  "|Start at the widest possible container: ^one line at each end. "
  "|The area is the shorter of the two heights, multiplied by the distance between them, "
  "because water spills over the lower side. "
  "|Now move the shorter line inward. Moving the taller one can never help, since the shorter side "
  "is what caps the volume and the width only shrinks. "
  "%Order of n, %constant space, and no sorting needed, because the elimination argument here is "
  "about height rather than order.",
  lines=[{"text":"def max_area(height):"},
         {"text":"    left, right = 0, len(height) - 1","detail":"Start at the widest container.","teach":True},
         {"text":"    best = 0"},
         {"text":""},
         {"text":"    while left < right:"},
         {"text":"        h = min(height[left], height[right])","detail":"Water spills over the lower side.","teach":True},
         {"text":"        best = max(best, h * (right - left))"},
         {"text":""},
         {"text":"        if height[left] < height[right]:","detail":"Move the SHORTER line. The taller one cannot help.","teach":True},
         {"text":"            left += 1"},
         {"text":"        else:"},
         {"text":"            right -= 1"},
         {"text":""},
         {"text":"    return best"}],
  cells=[{"label":"1","mark":True},{"label":"8"},{"label":"6"},{"label":"2"},{"label":"5"},{"label":"7"}],
  pointers=[{"label":"LEFT","value":0},{"label":"RIGHT","value":5,"color":"yellow"}],
  vars=[{"label":"O(n) time","mark":True},{"label":"O(1) space","mark":True}]),

 dict(id="s06", type="DSA_SIGNALS", transition="dip", background="zoneB", key="dsaSignals",
  headline="Two · [Longest Substring]", color="yellow", caption="reading the statement",
  narration=
  "Find the length of the longest substring with no repeating characters. Circle them. "
  "^Longest. ^Substring, not subsequence, and that distinction is the whole question. "
  "^Without repeating, which is a rule the answer has to keep obeying. "
  "^Substring means contiguous, and contiguous plus a rule is a sliding window, "
  "^the variable kind that grows and shrinks rather than the fixed kind that slides.",
  cells=sig([("longest","we are optimising",None),("substring","contiguous, not subsequence",None),
             ("without repeating","a rule to keep obeying",None),("contiguous + rule","sliding window","green"),
             ("variable window","grows and shrinks","green")])),

 dict(id="s07", type="DSA_TRACE_WINDOW", transition="fade", background="zoneB", key="dsaWindow",
  headline="Grow, then [shrink]", color="green", caption="the window repairs itself",
  codeTitle="length_of_longest.py",
  narration=
  "|A set holds the characters currently inside the window. "
  "|The right edge moves forward, adding a character each time and growing the window. "
  "|And when a duplicate turns up, the left edge moves in, dropping characters until the duplicate "
  "is gone and the rule holds again. "
  "^The window never restarts, ^which is why every character is added once and removed at most once. "
  "%Order of n, even though the left edge also moves, because neither pointer ever goes backwards.",
  lines=[{"text":"def length_of_longest(s):"},
         {"text":"    seen = set()","detail":"What is currently inside the window.","teach":True},
         {"text":"    left = best = 0"},
         {"text":""},
         {"text":"    for right, ch in enumerate(s):","detail":"Grow from the right, one character at a time.","teach":True},
         {"text":"        while ch in seen:","detail":"Duplicate: shrink from the left until it is gone.","teach":True},
         {"text":"            seen.remove(s[left])"},
         {"text":"            left += 1"},
         {"text":"        seen.add(ch)"},
         {"text":"        best = max(best, right - left + 1)"},
         {"text":""},
         {"text":"    return best"}],
  cells=[{"label":"a","text":"win"},{"label":"b","text":"win","mark":True},{"label":"c","text":"win","mark":True},
         {"label":"a"},{"label":"b"},{"label":"c"}],
  pointers=[{"label":"OUT","value":0},{"label":"IN","value":2}],
  vars=[{"label":"O(n) time","mark":True}]),

 dict(id="s08", type="DSA_SIGNALS", transition="push", background="zoneA", key="dsaSignals",
  headline="Three · [Rotated Sorted Array]", color="yellow", caption="reading the statement",
  narration=
  "A sorted array was rotated at some pivot. Find a target, and do it in log n time. "
  "^Sorted. ^Rotated. ^Search. ^And order log n, stated outright in the constraints. "
  "^That last one isn't a hint, it's an instruction: log n on an array means binary search and "
  "essentially nothing else. "
  "The interesting part is that rotation appears to break the precondition, so let's look at whether "
  "it really does.",
  cells=sig([("sorted","the precondition",None),("rotated","which seems to break it",None),
             ("search","find a target",None),("O(log n) required","stated outright","green"),
             ("that is an instruction","not a hint","green")])),

 dict(id="s09", type="DSA_TRACE_BSEARCH", transition="fade", background="zoneA", key="dsaBsearch",
  headline="One half is [always sorted]", color="purple", caption="the insight",
  codeTitle="search_rotated.py",
  narration=
  "Here's the insight the whole problem turns on. Cut a rotated array anywhere, "
  "and ^one of the two halves is always still fully sorted. Always. It cannot be otherwise, "
  "because a single rotation puts one break point in, and a break point can only sit in one half. "
  "|So compare mid with left to work out which half is the clean one. "
  "|If the target sits inside that sorted half, search there; |otherwise search the other. "
  "%Still log n, because we're still throwing away half the array every step.",
  lines=[{"text":"def search(nums, target):"},
         {"text":"    left, right = 0, len(nums) - 1"},
         {"text":""},
         {"text":"    while left <= right:"},
         {"text":"        mid = (left + right) // 2"},
         {"text":"        if nums[mid] == target: return mid"},
         {"text":""},
         {"text":"        if nums[left] <= nums[mid]:","detail":"Left half is the sorted one.","teach":True},
         {"text":"            if nums[left] <= target < nums[mid]:","detail":"Target is inside it, so search there.","teach":True},
         {"text":"                right = mid - 1"},
         {"text":"            else:","detail":"Otherwise the answer is in the other half.","teach":True},
         {"text":"                left = mid + 1"},
         {"text":"        else:"},
         {"text":"            ..."},
         {"text":""},
         {"text":"    return -1"}],
  cells=[{"label":"4"},{"label":"5"},{"label":"6","mark":True},{"label":"7"},
         {"label":"0"},{"label":"1"},{"label":"2"}],
  pointers=[{"label":"LO","value":0},{"label":"MID","value":3,"color":"purple"},{"label":"HI","value":6,"color":"yellow"}],
  vars=[{"label":"O(log n)","mark":True}]),

 dict(id="s10", type="QUIZ_CARD", transition="iris", background="zoneC", narration=
  "^Your turn, and this is a real interview moment. A question says: find the minimum number of "
  "coins to make an amount. Which pattern? "
  "^Greedy, take the biggest coin each time. ^Dynamic programming. ^Or backtracking, try everything. "
  "Have a think, and pause the video if you'd like a moment. "
  "^Ready? Dynamic programming, and the reason is that greedy genuinely fails on this one. "
  "We'll see exactly how in a minute.",
  data={"quiz":{"question":"Fewest coins to make an amount. Which pattern?",
    "options":[{"text":"greedy: biggest coin first"},{"text":"dynamic programming"},{"text":"backtracking"}],
    "answerIndex":1,"why":"Greedy fails on coin change. We are about to see it fail."}},
  anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.options.2.atWord","quiz.revealAtWord"]),

 dict(id="s11", type="DSA_SIGNALS", transition="dip", background="zoneB", key="dsaSignals",
  headline="Four · [Number of Islands]", color="yellow", caption="reading the statement",
  narration=
  "A grid of ones and zeroes. Land and water. Count the islands. Circle them. "
  "^Grid. ^Connected, or adjacent. ^Count the components. "
  "^No shortest anywhere, which is interesting, because breadth-first search is still the natural "
  "tool here: we're using it to flood a region rather than to measure a distance. "
  "^Depth-first would work just as well, and saying that out loud is worth marks.",
  cells=sig([("grid","a graph in disguise",None),("connected / adjacent","a traversal question",None),
             ("count components","how many separate regions",None),
             ("no 'shortest'","but BFS still fits","green"),("DFS works too","say so out loud","green")])),

 dict(id="s12", type="DSA_TRACE_GRID", transition="fade", background="zoneB", key="dsaGrid",
  headline="Flood, then [count]", color="blue", caption="one island at a time",
  codeTitle="num_islands.py",
  narration=
  "|Walk the grid cell by cell. |When you hit a piece of land nobody has visited, "
  "that's a new island, so add one to the count. "
  "|Then flood it: breadth-first search out from that cell, marking ^every connected piece of land "
  "as visited so nothing gets counted twice. "
  "^The ring spreads until the island runs out, ^and then the outer scan carries on from where it was. "
  "%Every cell is visited once, so it's rows times columns.",
  lines=[{"text":"def num_islands(grid):"},
         {"text":"    count = 0"},
         {"text":"    for r in range(rows):","detail":"Scan the grid, cell by cell.","teach":True},
         {"text":"        for c in range(cols):"},
         {"text":"            if grid[r][c] == '1' and (r,c) not in seen:","detail":"Unvisited land: a new island.","teach":True},
         {"text":"                count += 1"},
         {"text":"                bfs(r, c)","detail":"Flood it, so it is never counted again.","teach":True},
         {"text":""},
         {"text":"    return count"}],
  cells=[{"label":"1","value":0,"sub":"start"},{"label":"1","value":1,"sub":"1 out","mark":True},
         {"label":"1","value":1,"sub":"1 out","mark":True},{"label":"1","value":2,"sub":"2 out","mark":True},
         {"label":"0","value":3,"sub":"water","text":"dropped"}],
  vars=[{"label":"O(rows × cols)","mark":True}]),

 dict(id="s13", type="DSA_SIGNALS", transition="push", background="zoneA", key="dsaSignals",
  headline="Five · [Coin Change]", color="yellow", caption="reading the statement",
  narration=
  "Coins of different values, and a total to reach. Return the fewest coins, or minus one if it "
  "can't be done. Circle them. "
  "^Fewest, or minimum. ^Number of. ^Choices at every step, since any coin can be next. "
  "^And subproblems that overlap, because the best way to make seven turns up inside the best way "
  "to make eight. ^Minimum, choices and overlap together mean dynamic programming.",
  cells=sig([("fewest / minimum","we are optimising",None),("number of","counting the answer",None),
             ("a choice each step","any coin could be next",None),
             ("overlapping subproblems","seven turns up inside eight",None),
             ("min + choices + overlap","dynamic programming","green")])),

 dict(id="s14", type="DSA_TRACE_DP", transition="fade", background="zoneA", key="dsaDp",
  headline="Build [upward]", color="green", caption="every amount, once",
  codeTitle="coin_change.py",
  narration=
  "|A table where entry i holds the fewest coins needed to make amount i. "
  "|Base case: ^zero coins make zero. "
  "|Then for every amount upward, try each coin and take the best result: "
  "one coin, plus whatever it costs to make the remainder. "
  "^Amount one, ^amount two, ^amount three, each solved once and then only read. "
  "%Amount times coins, which is a loop inside a loop and nothing worse.",
  lines=[{"text":"def coin_change(coins, amount):"},
         {"text":"    dp = [inf] * (amount + 1)","detail":"dp[i] = fewest coins to make amount i.","teach":True},
         {"text":"    dp[0] = 0","detail":"Zero coins make zero. The base case.","teach":True},
         {"text":""},
         {"text":"    for a in range(1, amount + 1):","detail":"Build upward, one amount at a time.","teach":True},
         {"text":"        for c in coins:"},
         {"text":"            if c <= a:"},
         {"text":"                dp[a] = min(dp[a], dp[a - c] + 1)"},
         {"text":""},
         {"text":"    return dp[amount] if dp[amount] != inf else -1"}],
  cells=[{"label":"0","sub":"amt 0","mark":True},{"label":"1","sub":"amt 1","mark":True},
         {"label":"1","sub":"amt 2","mark":True},{"label":"2","sub":"amt 3","mark":True}],
  vars=[{"label":"O(amount × coins)","mark":True}]),

 dict(id="s15", type="DSA_COST", transition="wipe", background="zoneC", key="dsaCost",
  headline="Why [greedy fails] here", color="blue", caption="the counterexample to remember",
  narration=
  "Here's why greedy is wrong, and it's worth memorising because it comes up. "
  "Coins of one, five and eleven, and you need fifteen. "
  "^Greedy takes the biggest first: eleven, then four ones. Five coins. "
  "^The real answer is three: five, five and five. "
  "^Greedy failed because taking eleven stranded it, and greedy never reconsiders. "
  "^Dynamic programming tries every coin at every amount, which is exactly the reconsidering greedy "
  "refuses to do. That single example is the cleanest way to explain the difference in an interview.",
  cells=[{"label":"greedy: 11+1+1+1+1","sub":"5 coins","value":100,"text":"dropped","mark":True},
         {"label":"optimal: 5+5+5","sub":"3 coins","value":60,"mark":True},
         {"label":"greedy stranded itself","sub":"and never reconsiders","value":80,"text":"dropped","mark":True},
         {"label":"DP tries every coin","sub":"at every amount","value":45,"mark":True}]),

 dict(id="s16", type="LIST_BUILD", transition="fade", background="zoneB", narration=
  "Here's what to actually do tomorrow. %Do the four problems listed in each pattern episode, "
  "in the order given. %Before you write anything, say the pattern out loud and why. "
  "%When you're stuck for more than fifteen minutes, read the solution, then close it and write it "
  "from memory. And %redo the ones you got wrong a week later, because recognition fades fast.",
  data={"heading":"What to do tomorrow","items":[
    {"icon":"lucide:list-checks","text":"Four per pattern","detail":"in the order given"},
    {"icon":"lucide:mic","text":"Name the pattern first","detail":"out loud, and why"},
    {"icon":"lucide:book-open","text":"Stuck 15 min? Read, then rewrite","detail":"from memory, closed"},
    {"icon":"lucide:rotate-ccw","text":"Redo the misses","detail":"a week later"}]},
  anchors=["items.0.atWord","items.1.atWord","items.2.atWord","items.3.atWord"]),

 dict(id="s17", type="RECAP", transition="dip", background="zoneB", narration=
  "Three things from the whole series. %The words in the question carry the pattern, "
  "and reading properly beats coding quickly. %Ten patterns cover most of what gets asked, "
  "which is a much smaller job than it looks from the outside. "
  "And %saying your reasoning out loud is the thing being graded.",
  data={"heading":"The Dojo, in three lines","points":[
    {"text":"The words carry the pattern"},{"text":"Ten patterns cover most of it"},{"text":"Say the reasoning out loud"}]},
  anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

 dict(id="s18", type="OUTRO_CTA", transition="fade", background="zoneA", narration=
  "That's the Dojo. Ten patterns, one method, and five problems that used nothing else. "
  "The interactive version is linked below if you want to step through these yourself. Good luck.",
  data={"message":"The whole Dojo, one playlist","sub":"interactive version linked below"}, anchors=[]),
 ]}
json.dump(T, open('/Users/santhu/iauteur/briefs/dsa/ep11.json','w'), indent=1)
print("EP11:", len(T["scenes"]), "scenes")
