# -*- coding: utf-8 -*-
# Assembles the pattern SHORTS. Each short is a new HOOK, two or three of the
# episode's real traced beats (copied whole, so the animation and the
# marker/element pairing are already correct), and a new OUTRO. Owner, 2026-08-20:
# *"animation and components are some critical things of the video which you have
# to master"* — so a short is never a card being read aloud; the data moves.
import json, copy, os

SRC = os.path.dirname(__file__)
EP  = os.path.join(SRC, '..')

# episode -> (beats to lift, hook, cover, outro, seo)
PLAN = {
 '01': dict(slug='dsa-dojo-01-two-pointers', beats=['s10','s11','s13'],
   cover=("BOTH ENDS AT ONCE","Two Pointers"),
   hook="Fifteen pairs to check, or three. The array is sorted, and that one word changes everything.",
   outro="Sorted, and you need a pair. That is your signal. The full pattern is in the Dojo.",
   msg=("Two Pointers, traced line by line","full pattern in the Dojo"),
   title="The Two Pointer Trick That Kills Nested Loops",
   tags=["two pointers","dsa","leetcode","coding interview","algorithms","python","faang"]),
 '03': dict(slug='dsa-dojo-03-binary-search', beats=['s07','s10','s12'],
   cover=("HALF, EVERY TIME","Binary Search"),
   hook="A million names, and twenty guesses is enough. Every guess throws away half of what is left.",
   outro="Sorted, and told to find something in log n. That is your signal. The full pattern is in the Dojo.",
   msg=("Binary Search, traced line by line","full pattern in the Dojo"),
   title="Why Binary Search Finds Anything In 20 Guesses",
   tags=["binary search","dsa","leetcode","coding interview","algorithms","python","faang"]),
 '04': dict(slug='dsa-dojo-04-hashmap', beats=['s07','s09b','s11'],
   cover=("ONE PASS, ONE NOTEBOOK","HashMap"),
   hook="Everyone against everyone is a million comparisons. One notebook makes it a single walk.",
   outro="Unsorted, and you need a pair or a count. That is your signal. The full pattern is in the Dojo.",
   msg=("HashMap, traced line by line","full pattern in the Dojo"),
   title="The HashMap Trick Behind Half Of LeetCode",
   tags=["hashmap","hash table","dsa","leetcode","two sum","coding interview","python"]),
 '05': dict(slug='dsa-dojo-05-stack', beats=['s06','s09','s12'],
   cover=("LAST ON, FIRST OFF","Stack"),
   hook="Shirt, then jacket, then scarf. Now take them off. You do not get to choose the order.",
   outro="Nesting, matching, or an undo. That is your signal. The full pattern is in the Dojo.",
   msg=("Stack, traced line by line","full pattern in the Dojo"),
   title="Stacks Explained With Getting Dressed",
   tags=["stack","dsa","leetcode","valid parentheses","coding interview","python"]),
 '06': dict(slug='dsa-dojo-06-bfs', beats=['s07','s10','s12'],
   cover=("FIRST ARRIVAL WINS","BFS"),
   hook="The first time breadth-first search reaches a station, that is already the fastest way there. Always.",
   outro="Shortest, fewest steps, or level by level. That is your signal. The full pattern is in the Dojo.",
   msg=("BFS, traced line by line","full pattern in the Dojo"),
   title="Why BFS Always Finds The Shortest Path",
   tags=["bfs","breadth first search","graphs","dsa","leetcode","coding interview","python"]),
 '07': dict(slug='dsa-dojo-07-dfs', beats=['s06','s07','s09'],
   cover=("CHOOSE. EXPLORE. UNDO.","Backtracking"),
   hook="Three toppings make eight different pizzas. Three lines of code generate every one of them.",
   outro="Every combination, every subset, every permutation. That is your signal. The full pattern is in the Dojo.",
   msg=("DFS and Backtracking, traced line by line","full pattern in the Dojo"),
   title="Backtracking In Three Lines: Choose, Explore, Undo",
   tags=["backtracking","dfs","recursion","subsets","dsa","leetcode","coding interview","python"]),
 '08': dict(slug='dsa-dojo-08-dp', beats=['s06','s07','s10'],
   cover=("BUILT FROM BELOW","Dynamic Programming"),
   hook="A hundred million recalculations, or forty additions. Same staircase, same answer.",
   outro="Counting ways, or a best cost built from smaller inputs. That is your signal. The full pattern is in the Dojo.",
   msg=("Dynamic Programming, traced line by line","full pattern in the Dojo"),
   title="Dynamic Programming Is Just Refusing To Repeat Yourself",
   tags=["dynamic programming","dp","climbing stairs","dsa","leetcode","coding interview","python"]),
 '09': dict(slug='dsa-dojo-09-greedy', beats=['s06','s08','s09'],
   cover=("SORT. THEN DECIDE.","Greedy"),
   hook="Four meetings, three blocks of time. The sort does most of the work. But which sort?",
   outro="Intervals, scheduling, or a minimum count. That is your signal, and the sort key is the trap. The full pattern is in the Dojo.",
   msg=("Greedy, traced line by line","full pattern in the Dojo"),
   title="Greedy Algorithms: The Sort Key Is The Whole Puzzle",
   tags=["greedy","merge intervals","scheduling","dsa","leetcode","coding interview","python"]),
 '10': dict(slug='dsa-dojo-10-fast-slow', beats=['s06','s07','s10'],
   cover=("THEY MUST COLLIDE","Fast & Slow"),
   hook="Two runners on a track, one twice as fast. If there is a loop, they must collide. But why must?",
   outro="A cycle, a middle, or constant space demanded. That is your signal. The full pattern is in the Dojo.",
   msg=("Fast and Slow Pointers, traced line by line","full pattern in the Dojo"),
   title="Floyd's Cycle Detection, Explained Properly",
   tags=["fast and slow pointers","floyd","linked list","cycle detection","dsa","leetcode","python"]),
}

def build(ep, cfg):
    src = json.load(open(os.path.join(EP, f'ep{ep}.json')))
    by  = {s['id']: s for s in src['scenes']}
    m   = src['meta']
    title, badge = cfg['cover']
    scenes = [dict(id="s01", type="HOOK", background="zoneA", narration=cfg['hook'],
                   data={"headline":title,"subtext":badge.lower(),"heroAsset":"si:python",
                         "headlineAtWord":1,"heroAtWord":8},
                   anchors=["headlineAtWord","heroAtWord"])]
    for i, bid in enumerate(cfg['beats']):
        beat = copy.deepcopy(by[bid])
        beat['id'] = f"s{i+2:02d}"
        beat['transition'] = ["wipe","push","fade"][i % 3]
        scenes.append(beat)
    msg, sub = cfg['msg']
    scenes.append(dict(id="s%02d" % (len(scenes)+1), type="OUTRO_CTA", transition="fade",
                       background="zoneA", narration=cfg['outro'],
                       data={"message":msg,"sub":sub}, anchors=[]))
    return {
      "meta": {"topic":m['topic'],"format":"short","fps":30,"screenplay":"explainer",
        "onePayoff":m['onePayoff'],"openLoop":m['openLoop'],"analogy":m.get('analogy',''),
        "seo":{"title":cfg['title'],"hook":cfg['hook'][:90],
               "description":m['onePayoff'],"tags":cfg['tags'],
               "hashtags":["#dsa","#leetcode","#codinginterview","#thenbxstudio"]}},
      "brand": src['brand'],
      "cover": {"title":title,"badge":badge,"asset":"si:python","frames":2},
      "scenes": scenes,
    }

if __name__ == '__main__':
    for ep, cfg in PLAN.items():
        spec = build(ep, cfg)
        out = os.path.join(SRC, f'sh{ep}.json')
        json.dump(spec, open(out,'w'), indent=1)
        print(f"sh{ep}: {len(spec['scenes'])} scenes -> {cfg['slug']}")
