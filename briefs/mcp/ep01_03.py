# -*- coding: utf-8 -*-
# EP01-03 of Learn MCP. Narration is written for a mouth: contractions throughout,
# the subject named rather than pronouned, the analogy GIVEN before it is used, and
# a reason carried inside the sentence rather than asserted after it.
import json
import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from _guard import write

BRAND = {"theme":"moderndark","design":"moderndark","themeLight":"daylight","background":"grid",
         "channel":"THE NBX STUDIO","logo":"img:channel_logo.png"}
SRC = ["Course source: https://github.com/san-gitlogin/learn-mcp",
       "Live course: https://san-gitlogin.github.io/learn-mcp/"]
def L(t, det=None):
    d={"text":t}
    if det: d["detail"]=det; d["teach"]=True
    return d
def meta(topic, payoff, loop, analogy, seo):
    return {"topic":topic,"format":"long","fps":30,"screenplay":"explainer",
            "onePayoff":payoff,"openLoop":loop,"analogy":analogy,
            "topicAxes":["entity-novelty","economic-pain"],"seo":seo}

# ─────────────────────────────────────────────────────────── EP01: what MCP is
WIRE_PREM = "Your app is the client. Somebody else's program is the server. Every arrow is one JSON-RPC message crossing between them."

EP01 = {
 "meta": meta("What MCP Actually Is",
   "MCP is a standard socket, so the integration you need has probably already been written by somebody else.",
   "Four services, four integrations, and none of them are your product. What if you didn't write any of them?",
   "THE DELIVERY PLATFORM - you don't sign every restaurant yourself; you plug into the one that already did.",
   {"title":"What MCP Actually Is (And Why It Exists)",
    "altTitles":["MCP Explained With One Analogy That Sticks",
                 "Stop Writing Integrations — What MCP Is Really For"],
    "hook":"Four services. Four integrations. None of them are your product.",
    "breakdown":"what the Model Context Protocol actually is, the problem it removes, and the exact messages a client and server exchange",
    "chapters":[{"id":"s01","title":"Four integrations you didn't want"},
                {"id":"s03","title":"The analogy that sticks"},
                {"id":"s05","title":"Every arrow is one message"},
                {"id":"s07","title":"Who writes the integration?"}],
    "sources":SRC,
    "queries":["what is mcp","model context protocol explained","mcp vs function calling",
      "mcp server client","why use mcp","anthropic mcp tutorial","mcp json rpc"],
    "hashtags":["#mcp","#claude","#anthropic","#ai","#thenbxstudio"],
    "tags":["mcp","model context protocol","claude","anthropic","ai tools","integration",
      "json rpc","python","tutorial","the nbx studio"]}),
 "brand":BRAND,
 "thumbnail":{"title":"STOP WRITING INTEGRATIONS","badge":"What is MCP","asset":"si:anthropic"},
 "scenes":[
  dict(id="s01", type="HOOK", background="zoneA", durationFrames=230, narration=
   "You want Claude to reach GitHub, Slack, and your database. That's three integrations, and none of them are your product.",
   data={"headline":"STOP WRITING INTEGRATIONS","subtext":"what MCP actually is","heroAsset":"si:anthropic",
         "headlineAtWord":1,"heroAtWord":12}, anchors=["headlineAtWord","heroAtWord"]),

  dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", durationFrames=340, narration=
   "Chapter two of Learn MCP, here on THE NBX STUDIO. Last chapter ended on a hole in the API call — "
   "a tools list somebody has to write. This chapter is about who that somebody is.",
   data={"title":"WHAT IS MCP","subtitle":"chapter two of eleven"}, anchors=[]),

  dict(id="s03", type="MCP_CONTROL", transition="wipe", background="zoneC", key="mcpControl",
   headline="The analogy that [sticks]", color="blue", caption="the delivery platform",
   premise="Picture a food delivery app. You can sign every restaurant yourself, or plug into the platform that already signed them.",
   durationFrames=800,
   narration=
   "Forget the jargon for a second and picture a food delivery app. "
   "^You could partner with every restaurant one at a time — negotiate each menu, handle each payment, "
   "arrange each driver. That works, and it's your whole life. "
   "^Or you plug into a platform that already did all of that, and you get every restaurant at once. "
   "^MCP is the second one, for AI tools. Somebody has already written the GitHub connection, the Slack "
   "connection, the Postgres connection, and packaged each as a thing you plug into. "
   "That package is called an MCP server, and the bit of your app that plugs in is called an MCP client. "
   "Those two words are the whole vocabulary.",
   cells=[{"label":"sign every restaurant","sub":"you write GitHub, Slack, Postgres yourself — forever","owner":"code","mark":True},
          {"label":"plug into the platform","sub":"somebody already wrote them, you connect","owner":"code","mark":True},
          {"label":"MCP","sub":"the platform, for AI tools","owner":"ai","mark":True}]),

  dict(id="s04", type="MCP_WIRE", transition="push", background="zoneA", key="mcpWire",
   headline="Server, client, [and a wire]", color="blue", caption="the two words",
   codeTitle="client.py", premise=WIRE_PREM, ends=["YOUR APP","MCP SERVER"], durationFrames=820,
   narration=
   "So concretely, here's the shape. Your app opens a connection to a server, "
   "|and the first thing your app asks is what can you do. "
   "^The server answers with a list of tools, each carrying a name and a description. "
   "|Then when you want one of those tools run, your app calls it by name with arguments, "
   "^and the server runs the function and hands back the result. "
   "That's the entire protocol at this level — a question, a list, a call, a result. "
   "Everything else in this course is detail hanging off those four messages.",
   lines=[L("async with stdio_client(params) as (r, w):"),
          L("    async with ClientSession(r, w) as client:"),
          L("        await client.initialize()"),
          L("        tools = await client.list_tools()","Ask the server what it can do."),
          L("        result = await client.call_tool(","Run one, by name, with arguments."),
          L("            \"read_note\", {\"note_id\": \"todo.md\"})")],
   cells=[{"label":"3 tools","sub":"read_note · edit_note · list_notes","dir":"back","mark":True,
           "out":['{"result":{"tools":[','  {"name":"read_note",','   "description":"Read a note"}]}}']},
          {"label":"the note text","sub":"whatever the function returned","dir":"back","mark":True,
           "out":['{"result":{"content":[','  {"type":"text",','   "text":"Buy groceries..."}]}}']}]),

  dict(id="s05", type="QUIZ_CARD", transition="iris", background="zoneC", durationFrames=800, narration=
   "^Straight from the course. Your app wants to read GitHub repositories. With MCP, who writes the GitHub integration? "
   "^You do, from scratch. ^Or the MCP server author already did. "
   "Have a think, and pause the video if you'd like a moment. "
   "^Ready? The server author already did. That's the entire point — you install their server and connect to it, "
   "the same way you'd install a library rather than rewriting it.",
   data={"quiz":{"question":"Who writes the GitHub integration?",
     "options":[{"text":"you do, from scratch"},{"text":"the MCP server author did"}],
     "answerIndex":1,"why":"You install their server, the way you'd install a library."}},
   anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.revealAtWord"]),

  dict(id="s06", type="RECAP", transition="dip", background="zoneB", durationFrames=400, narration=
   "Three lines to keep. %An MCP server is somebody else's integration, packaged. "
   "%An MCP client is the piece of your app that plugs into a server. "
   "%And the wire between them carries four kinds of message, which we'll meet properly next chapter.",
   data={"heading":"Chapter two, in three lines","points":[
     {"text":"A server is a packaged integration"},{"text":"A client is your end of the wire"},
     {"text":"Four kinds of message cross it"}]},
   anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

  dict(id="s07", type="OUTRO_CTA", transition="fade", background="zoneA", durationFrames=290, narration=
   "Next chapter is the most important idea in MCP, and it fits in one question: who's in control?",
   data={"message":"Next: the three superpowers","sub":"tools, resources and prompts"}, anchors=[]),
 ]}
write(EP01, 'mcp/ep01.json')
print("EP01:", len(EP01["scenes"]), "scenes")
