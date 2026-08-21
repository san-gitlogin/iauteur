# -*- coding: utf-8 -*-
# The twelve MCP shorts. Each is a fresh hook, two of the chapter's REAL beats
# (lifted whole, so the depiction and the marker/element pairing are already
# correct), and a fresh outro. Hooks follow LAW 0g as rewritten on 2026-08-21: name
# the situation the viewer is in, then the outcome — no riddles, nothing clever.
import json, copy, os

SRC = os.path.dirname(__file__)
EP  = os.path.join(SRC, '..')

PLAN = {
 # Re-pointed 2026-08-21 at the reach beats. The short used to carry the API anatomy,
 # which is the mechanism; the limitation is what a scrolling viewer actually feels.
 '00': dict(slug='mcp-00-how-claude-works', beats=['s02b','s02c'],
   cover=("IT CAN'T READ YOUR FILES","How Claude works"),
   hook="Claude will answer almost anything you ask it. Ask it to open one file on your laptop, and it can't.",
   outro="Claude asks, your code does it. That line is the whole reason MCP exists. Full course on the channel.",
   msg=("What Claude actually is","chapter one of twelve"),
   title="Why Claude Can't Read Your Files (And What Does)",
   tags=["claude","anthropic","mcp","ai tools","llm","beginner"]),
 '01': dict(slug='mcp-01-what-is-mcp', beats=['s03b','s04'],
   cover=("STOP WRITING GLUE","What is MCP"),
   hook="You want Claude to reach your GitHub, your Slack, your database. That plumbing is weeks of work.",
   outro="A server is somebody else's integration, packaged. That's MCP. Full course on the channel.",
   msg=("What MCP actually is","and the problem it removes"),
   title="What MCP Actually Is — In One Minute",
   tags=["mcp","model context protocol","claude","anthropic","ai tools","integration"]),
 '02': dict(slug='mcp-02-three-primitives', beats=['s03','s04b'],
   cover=("WHO PULLS THE TRIGGER","3 Primitives"),
   hook="Tools, resources, prompts. People mix them up constantly, and one question tells them apart.",
   outro="Ask who is in control, and the primitive names itself. Full course on the channel.",
   msg=("Tools vs Resources vs Prompts","one question settles it"),
   title="Tools vs Resources vs Prompts — The Only Question That Matters",
   tags=["mcp","tools","resources","prompts","model context protocol","claude"]),
 '03': dict(slug='mcp-03-build-a-server', beats=['s03','s04'],
   cover=("A SERVER IS 20 LINES","Build It"),
   hook="Building an MCP server sounds like a weekend project. It's about twenty lines.",
   outro="A decorator on an ordinary function. That's the whole pattern. Full course on the channel.",
   msg=("Build an MCP server","every line explained"),
   title="An MCP Server Is 20 Lines Of Python",
   tags=["mcp","mcp server","python","mcpserver","fastmcp","anthropic","tutorial"]),
 '04': dict(slug='mcp-04-client-and-loop', beats=['s04','s04b'],
   cover=("CLAUDE NEVER RUNS IT","The Loop"),
   hook="Here's what confuses everyone at first: Claude can't run your tool. Your own code does.",
   outro="The loop runs until Claude stops asking. That's every MCP app. Full course on the channel.",
   msg=("The client and the agentic loop","who actually executes"),
   title="Claude Can't Run Your Tool. Here's What Actually Happens.",
   tags=["mcp","agentic loop","tool use","claude","anthropic","python","mcp client"]),
 '05': dict(slug='mcp-05-resources-prompts', beats=['s03','s05'],
   cover=("FETCHED BEFORE ASKED","Resources"),
   hook="Sometimes your app already knows what Claude is about to need.",
   outro="Inject when your code already knows. It's one hop instead of three. Full course on the channel.",
   msg=("Resources and prompts","and the @ mention trick"),
   title="Why MCP Resources Beat A Tool Call",
   tags=["mcp","resources","prompts","model context protocol","claude","python"]),
 '06': dict(slug='mcp-06-sampling', beats=['s04','s05d'],
   cover=("WHO PAYS THE BILL?","Sampling"),
   hook="Publish an MCP server that needs a language model, and someone pays for every call.",
   outro="Sampling flips the direction so the client's key pays — and the spec has now deprecated it. Full course on the channel.",
   msg=("Sampling, and its status","the client pays"),
   title="MCP Sampling — Who Pays, And Why It's Now Deprecated",
   tags=["mcp","sampling","deprecated","claude","anthropic","api costs","python"]),
 '07': dict(slug='mcp-07-roots', beats=['s04','s04d'],
   cover=("MCP WON'T STOP IT","Roots"),
   hook="You're about to let a server touch your file system.",
   outro="Roots is guidance, not enforcement — and it's deprecated. You write the check. Full course on the channel.",
   msg=("Roots, honestly","what MCP does not do"),
   title="MCP Roots Is Not Access Control (And It's Deprecated)",
   tags=["mcp","roots","security","file access","deprecated","python","claude"]),
 '08': dict(slug='mcp-08-notifications', beats=['s03','s04b'],
   cover=("WORKING, OR DEAD?","Progress"),
   hook="A tool that runs for thirty seconds and says nothing looks broken.",
   outro="Report progress, and let them cancel. Full course on the channel.",
   msg=("Notifications and cancellation","proving a tool is alive"),
   title="Stop Your MCP Tool Looking Frozen",
   tags=["mcp","progress","notifications","cancellation","python","claude","anthropic"]),
 '09': dict(slug='mcp-09-transport', beats=['s03b','s04'],
   cover=("STDOUT IS THE WIRE","Transport"),
   hook="On stdio, a stray print statement will break your MCP server. Here's why.",
   outro="stdout is the protocol. Log to stderr. And know what those two flags switch off. Full course on the channel.",
   msg=("Transport, and the two flags","what they silently disable"),
   title="Why print() Breaks Your MCP Server",
   tags=["mcp","stdio","transport","streamable http","debugging","python","stderr"]),
 '11': dict(slug='mcp-10-elicitation', beats=['s03','s04'],
   cover=("NEVER ASK IN CHAT","Elicitation"),
   hook="Halfway through a tool, you need something only the person can give you.",
   outro="Form mode for choices, URL mode for anything secret — that one's a rule. Full course on the channel.",
   msg=("Elicitation, both modes","and the security boundary"),
   title="MCP Elicitation — Never Ask For A Key In Chat",
   tags=["mcp","elicitation","security","oauth","python","claude","anthropic"]),
 '10': dict(slug='mcp-11-everything', beats=['s03','s03b'],
   cover=("CURRENT, OR ON A CLOCK","MCP 2026"),
   hook="A lot of MCP writing online predates the current spec. Here's what actually changed.",
   outro="Three of those are deprecated as of the 2026 spec. Don't start anything new on them. Full course on the channel.",
   msg=("All of MCP, and what changed","checked against spec 2026-07-28"),
   title="Three MCP Features You Should Stop Building On",
   tags=["mcp","deprecated","model context protocol","2026","spec","claude","anthropic"]),
}

for ep, cfg in PLAN.items():
    src = json.load(open(os.path.join(EP, f'ep{ep}.json')))
    by  = {s['id']: s for s in src['scenes']}
    m   = src['meta']
    title, badge = cfg['cover']
    scenes = [dict(id="s01", type="HOOK", background="zoneA", durationFrames=230,
                   narration=cfg['hook'],
                   data={"headline":title,"subtext":badge.lower(),"heroAsset":"si:anthropic",
                         "headlineAtWord":1,"heroAtWord":8},
                   anchors=["headlineAtWord","heroAtWord"])]
    for i, bid in enumerate(cfg['beats']):
        beat = copy.deepcopy(by[bid])
        beat['id'] = f"s{i+2:02d}"
        beat['transition'] = ["wipe","push"][i % 2]
        scenes.append(beat)
    msg, sub = cfg['msg']
    scenes.append(dict(id=f"s{len(scenes)+1:02d}", type="OUTRO_CTA", transition="fade",
                       background="zoneA", durationFrames=280, narration=cfg['outro'],
                       data={"message":msg,"sub":sub}, anchors=[]))
    spec = {
      "meta": {"topic":m['topic'],"format":"short","fps":30,"screenplay":"explainer",
        "onePayoff":m['onePayoff'],"openLoop":m['openLoop'],"analogy":m.get('analogy',''),
        "seo":{"title":cfg['title'],"hook":cfg['hook'][:90],"description":m['onePayoff'],
               "tags":cfg['tags'],
               "hashtags":["#mcp","#claude","#anthropic","#python","#thenbxstudio"]}},
      "brand": src['brand'],
      "cover": {"title":title,"badge":badge,"asset":"si:anthropic","frames":2},
      "scenes": scenes,
    }
    json.dump(spec, open(os.path.join(SRC, f'sh{ep}.json'),'w'), indent=1)
    print(f"sh{ep}: {len(scenes)} scenes -> {cfg['slug']}")
