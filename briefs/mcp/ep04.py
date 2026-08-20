# -*- coding: utf-8 -*-
# EP04 — The client, and the agentic loop. The loop is drawn as a ring that
# genuinely cycles, with the exit condition on the node that ends it, because a
# four-bullet list is not a loop (LAW 0j).
import json
BRAND = {"theme":"moderndark","design":"moderndark","themeLight":"daylight","background":"grid",
         "channel":"THE NBX STUDIO","logo":"img:channel_logo.png"}
SRC = ["Course source: https://github.com/san-gitlogin/learn-mcp",
       "Live course: https://san-gitlogin.github.io/learn-mcp/"]
def L(t, det=None):
    d={"text":t}
    if det: d["detail"]=det; d["teach"]=True
    return d
WIRE = "Your app sits in the middle. Claude is on one side, the MCP server on the other, and your code relays between them."

T = {
 "meta":{"topic":"The Client and the Agentic Loop","format":"long","fps":30,"screenplay":"explainer",
  "onePayoff":"Your app relays between Claude and the server until Claude stops asking for tools — that loop is every MCP application.",
  "openLoop":"Claude can't call a tool. So how does a tool ever get called?",
  "analogy":"THE PHONE CALL - dial, ask what they can do, ask them to do one, hang up.",
  "topicAxes":["entity-novelty","economic-pain"],
  "seo":{"title":"The MCP Client and the Agentic Loop, Explained Properly",
   "altTitles":["Claude Can't Call Tools. Here's What Actually Happens.",
                "The 5 Client Methods And The Loop That Uses Them"],
   "hook":"Claude never runs your tool. Your code does.",
   "breakdown":"the five client methods you actually need, and the relay loop that turns a tool request into an answer",
   "chapters":[{"id":"s01","title":"Claude can't call anything"},
               {"id":"s03","title":"Five methods, that's all"},
               {"id":"s04","title":"The loop, going round"},
               {"id":"s06","title":"Where it stops"}],
   "sources":SRC,
   "queries":["mcp client python","agentic loop explained","how does claude call tools",
     "mcp list_tools call_tool","tool use loop anthropic","mcp client session example"],
   "hashtags":["#mcp","#claude","#anthropic","#python","#thenbxstudio"],
   "tags":["mcp","model context protocol","agentic loop","tool use","claude","anthropic",
     "python","mcp client","tutorial","the nbx studio"]}},
 "brand":BRAND,
 "thumbnail":{"title":"CLAUDE NEVER RUNS YOUR TOOL","badge":"The Loop","asset":"si:python"},
 "scenes":[
  dict(id="s01", type="HOOK", background="zoneA", durationFrames=230, narration=
   "Here's something that surprises people. Claude can't run your tool. So how does a tool ever get called?",
   data={"headline":"CLAUDE NEVER RUNS IT","subtext":"your code does","heroAsset":"si:python",
         "headlineAtWord":1,"heroAtWord":11}, anchors=["headlineAtWord","heroAtWord"]),

  dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", durationFrames=330, narration=
   "Chapter five of Learn MCP on THE NBX STUDIO. Claude has no network access to your server and no way "
   "to execute anything. Your app is the one doing every bit of the work.",
   data={"title":"THE CLIENT","subtitle":"chapter five of eleven"}, anchors=[]),

  dict(id="s03", type="MCP_WIRE", transition="wipe", background="zoneC", key="mcpWire",
   headline="Five methods, [and that's all]", color="blue", caption="the phone call",
   codeTitle="client.py", premise="Connecting is dialling. list_tools is asking what they can do. call_tool is asking them to do one.",
   ends=["YOUR APP","MCP SERVER"], durationFrames=920,
   narration=
   "The connection boilerplate is always the same, so you write it once and copy it forever. "
   "What matters is that there are only five methods you ever need. "
   "|List tools asks what can you do, ^and back comes every tool with its description. "
   "|Call tool runs one by name, ^and back comes whatever the function returned. "
   "|Read resource fetches data your app wants, "
   "|list prompts and get prompt handle the user-triggered workflows we met in chapter three. "
   "Five methods. That's the entire client surface, and you don't need to memorise the connection code "
   "around them.",
   lines=[L("tools = await client.list_tools()","What can you do?"),
          L("result = await client.call_tool(","Run this one, with these inputs."),
          L("    \"read_note\", {\"note_id\": \"todo.md\"})"),
          L("data = await client.read_resource(\"notes://all\")","Fetch data for my own UI."),
          L("prompts = await client.list_prompts()","The user-triggered workflows."),
          L("msgs = await client.get_prompt(\"format\", {...})")],
   cells=[{"label":"3 tools","sub":"each with a name and a description","dir":"back","mark":True,
           "out":['read_note   — Read a note','edit_note   — Edit a note','list_notes  — List them all']},
          {"label":"the note text","sub":"whatever the Python function returned","dir":"back","mark":True,
           "out":['"Buy groceries, call mom, fix the bug"']}]),

  dict(id="s04", type="MCP_LOOP", transition="push", background="zoneA", key="mcpLoop",
   headline="The loop, [going round]", color="orange", caption="the heartbeat",
   codeTitle="loop.py", premise=WIRE, durationFrames=980,
   narration=
   "Now the part that makes it feel alive. Your app runs a loop, and here's one lap of it. "
   "|Your app loops, and ^you send Claude the user's question together with the tools from the server. "
   "^Claude replies asking for read note with an argument — asking, not doing, and that distinction is the "
   "whole reason your app exists. "
   "|Then comes the check that ends everything, and we'll come back to that line in a moment. "
   "|Your code calls the tool through the client, ^which is the only place in this entire system where "
   "anything actually executes. "
   "|Then you append the result to the messages list and ^send the whole conversation back to Claude, "
   "and round you go again. "
   "^The loop ends when a reply carries no tool request at all, because at that point Claude is answering "
   "the person rather than asking your code for something.",
   lines=[L("while True:","One lap of the relay."),
          L("    reply = claude(messages, tools=tools)"),
          L("    if not reply.tool_use:","The only exit. Not a counter."),
          L("        break"),
          L("    out = await client.call_tool(...)","Your code executes. Claude never does."),
          L("    messages.append(tool_result(out))","Hand the result back and go round.")],
   cells=[{"label":"send tools","sub":"+ the question","mark":True},
          {"label":"tool_use","sub":"Claude asks","mark":True},
          {"label":"call_tool","sub":"your code runs it","mark":True},
          {"label":"send result","sub":"back to Claude","mark":True},
          {"label":"no tool_use","sub":"done","text":"exit","mark":True}]),

  dict(id="s05", type="QUIZ_CARD", transition="iris", background="zoneC", durationFrames=820, narration=
   "^The course asks this one, and it's worth getting right. When does the agentic loop stop? "
   "^After exactly three tool calls. ^Or when Claude's reply has no more tool requests in it. "
   "Have a think, and pause if you'd like a moment. "
   "^Ready? When there are no more tool requests. There's no counter and no timer — Claude simply stops "
   "asking, and a reply with no tool use is Claude talking to the user instead of to your code.",
   data={"quiz":{"question":"When does the agentic loop stop?",
     "options":[{"text":"after exactly 3 tool calls"},{"text":"when there's no more tool_use"}],
     "answerIndex":1,"why":"No counter, no timer. Claude just stops asking."}},
   anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.revealAtWord"]),

  dict(id="s06", type="RECAP", transition="dip", background="zoneB", durationFrames=430, narration=
   "Three lines to carry. %There are five client methods, and the connection code around them never changes. "
   "%Claude asks, and your code is what executes. "
   "%And the loop runs until Claude stops asking.",
   data={"heading":"The client, in three lines","points":[
     {"text":"Five methods, fixed boilerplate"},{"text":"Claude asks — your code executes"},
     {"text":"Loop until no more tool_use"}]},
   anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

  dict(id="s07", type="OUTRO_CTA", transition="fade", background="zoneA", durationFrames=290, narration=
   "Next chapter: resources and prompts, and a trick that gets data to Claude before Claude even asks for it.",
   data={"message":"Next: resources and prompts","sub":"and the @ mention trick"}, anchors=[]),
 ]}
json.dump(T, open('/Users/santhu/iauteur/briefs/mcp/ep04.json','w'), indent=1)
print("EP04:", len(T["scenes"]), "scenes")
