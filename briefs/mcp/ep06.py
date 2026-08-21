# -*- coding: utf-8 -*-
# EP06 — Sampling. The hardest idea in the course: a reversal of direction AND a
# billing argument at once. Both halves land in one picture (MCP_SAMPLING), and the
# cost is a running meter rather than an assertion.
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
PREM = "Your server is public. Anyone can install it. Whoever holds the API key pays for every call it makes."

T = {
 "meta":{"topic":"Sampling","format":"long","fps":30,"screenplay":"explainer",
  "onePayoff":"Sampling reverses the protocol so the client's API key pays, which is what makes a public server affordable to run.",
  "openLoop":"Your free server goes viral. Who gets the bill?",
  "analogy":"THE BORROWED KITCHEN - we prepped the ingredients, but you cook it at your house, on your gas.",
  "topicAxes":["economic-pain","entity-novelty"],
  "seo":{"title":"MCP Sampling — Your Server Goes Viral. Who Pays?",
   "altTitles":["The MCP Feature That Stops Your Server Bankrupting You",
                "Sampling Explained: When The Server Calls You Back"],
   "hook":"Your free server goes viral. Congratulations — here's the bill.",
   "breakdown":"why sampling exists, how the server asks the client to call an LLM, and who ends up paying",
   "chapters":[{"id":"s01","title":"Who gets the bill"},
               {"id":"s03","title":"The problem, in money"},
               {"id":"s04","title":"The arrow turns around"},
               {"id":"s05","title":"The server side"},
               {"id":"s06","title":"The client side"}],
   "sources":SRC,
   "queries":["mcp sampling explained","ctx.session.create_message","mcp sampling callback",
     "who pays for mcp sampling","mcp server llm call","sampling_callback python","reverse mcp request"],
   "hashtags":["#mcp","#claude","#anthropic","#python","#thenbxstudio"],
   "tags":["mcp","model context protocol","sampling","claude","anthropic","python","api costs",
     "createmessage","tutorial","the nbx studio"]}},
 "brand":BRAND,
 "thumbnail":{"title":"WHO PAYS THE BILL?","badge":"Sampling","asset":"si:anthropic"},
 "scenes":[
  dict(id="s01", type="HOOK", background="zoneA", durationFrames=230, narration=
   "You publish a free MCP server. It goes viral. Now — who's paying for every Claude call it makes?",
   data={"headline":"WHO PAYS THE BILL?","subtext":"sampling, explained","heroAsset":"si:anthropic",
         "headlineAtWord":1,"heroAtWord":11}, anchors=["headlineAtWord","heroAtWord"]),

  dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", durationFrames=340, narration=
   "This is the feature people find genuinely mind-bending the first time, and it exists for a very ordinary "
   "reason: money. Learn MCP, on THE NBX STUDIO.",
   data={"title":"SAMPLING","subtitle":"chapter seven of eleven"}, anchors=[]),

  dict(id="s03", type="MCP_SAMPLING", transition="wipe", background="zoneC", key="mcpSampling",
   headline="The problem, [in money]", color="red", caption="a server that summarises",
   codeTitle="research_server.py", premise=PREM, ends=["CLIENT","SERVER"], durationFrames=900,
   narration=
   "Picture a public MCP server for research. Somebody asks it to research quantum computing, and the tool "
   "scrapes a pile of Wikipedia articles and gathers the raw material. "
   "|Now the tool needs to turn that pile into a readable report, and summarising needs a language model. "
   "^So the obvious move is to put your own Anthropic key on the server and call Claude right there. "
   "That works perfectly on day one, when the only user is you. "
   "^The trouble is that every user's request flows through your code, which means every summarisation is "
   "billed to your key. Your server gets popular, and the bill arrives with it. "
   "%That's the corner sampling exists to get you out of.",
   lines=[L("@mcp.tool()"),
          L("async def research(topic: str):"),
          L("    data = await scrape_wikipedia(topic)","The easy part. No model needed."),
          L("    # now summarise it — needs an LLM"),
          L("    client = Anthropic()        # YOUR key","Every user's request, billed to you."),
          L("    return client.messages.create(...)")],
   cells=[{"label":"your key on the server","sub":"works fine when you're the only user","dir":"out","mark":True},
          {"label":"every request, your bill","sub":"popularity is now a liability","dir":"back","value":50000,
           "mark":True}],
   vars=[{"label":"cost scales with users","mark":True}]),

  dict(id="s04", type="MCP_SAMPLING", transition="push", background="zoneA", key="mcpSampling",
   headline="The arrow [turns around]", color="purple", caption="reverse uno",
   codeTitle="research_server.py", premise=PREM, ends=["CLIENT","SERVER"], durationFrames=940,
   narration=
   "Sampling flips the direction. Normally the client asks the server to do things, and every arrow points "
   "one way. "
   "^Here the server turns round mid-tool and asks the client: you call the model for me, and send me back "
   "what it says. "
   "|The call that does that is c t x dot session dot create message, ^and the key detail is that the client "
   "is the one holding an API key, so the client is the one who pays. "
   "The course calls it reverse uno, and the restaurant version is nicer: we prepped your ingredients, but "
   "would you cook the last step at your house — you've got a kitchen, and your own gas bill. "
   "%Your server stays cheap to run no matter how popular it gets, because the expensive part never happens "
   "on your machine.",
   lines=[L("@mcp.tool()"),
          L("async def summarize(text: str, ctx: Context):","ctx is the server's line back to the client."),
          L("    result = await ctx.session.create_message(","\"Client — please call an LLM with this.\""),
          L("        messages=[SamplingMessage("),
          L("            role=\"user\","),
          L("            content=TextContent(type=\"text\", text=text))],"),
          L("        max_tokens=4000,"),
          L("    )"),
          L("    return result.content.text","The generated text comes back here.")],
   cells=[{"label":"sampling/createMessage","sub":"server asks the client to call Claude","dir":"back","mark":True},
          {"label":"the client's key pays","sub":"whoever calls the model holds the bill","dir":"out","mark":True}],
   vars=[{"label":"server cost: unchanged","mark":True}]),

  dict(id="s05", type="MCP_SAMPLING", transition="fade", background="zoneC", key="mcpSampling",
   headline="The client's half [of the deal]", color="purple", caption="one callback",
   codeTitle="client.py", premise=PREM, ends=["CLIENT","SERVER"], durationFrames=900,
   narration=
   "For that to work the client has to agree in advance, and agreeing is one function. "
   "|You write a sampling callback, and the S D K calls that function automatically whenever a server asks "
   "for a generation. "
   "^Inside it, the messages the server sent arrive as params dot messages, in MCP's own format, so you may "
   "need to convert them into whatever shape your model expects. "
   "|Then you call Anthropic yourself — this is your code, your key, your bill — and wrap the answer in a "
   "create message result. "
   "|And you register the callback when you open the session, which is the moment you're consenting to the "
   "whole arrangement. "
   "^Nothing happens without that callback, so a client that doesn't pass one simply can't be asked.",
   lines=[L("async def sampling_callback(context, params):","The SDK calls this when a server asks."),
          L("    text = await chat(params.messages)","YOUR function. Your key. Your bill."),
          L("    return CreateMessageResult("),
          L("        role=\"assistant\", model=model,"),
          L("        content=TextContent(type=\"text\", text=text),"),
          L("    )"),
          L(""),
          L("ClientSession(read, write,","Registering it is how you consent."),
          L("              sampling_callback=sampling_callback)")],
   cells=[{"label":"params.messages","sub":"MCP format — convert to your model's shape","dir":"back","mark":True},
          {"label":"no callback, no sampling","sub":"a client that never registers one can't be asked","dir":"out","mark":True}]),

  dict(id="s06", type="QUIZ_CARD", transition="iris", background="zoneC", durationFrames=820, narration=
   "^The course asks it directly. In sampling, who pays for the Claude API call? "
   "^The MCP server author. ^Or the client — whoever connected to the server. "
   "Have a think, and pause if you'd like a moment. "
   "^Ready? The client pays, because the client is the one that actually makes the call with its own key. "
   "That's the entire reason sampling exists rather than being a curiosity.",
   data={"quiz":{"question":"In sampling, who pays for the Claude call?",
     "options":[{"text":"the MCP server author"},{"text":"the client that connected"}],
     "answerIndex":1,"why":"The client makes the call, with its own key."}},
   anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.revealAtWord"]),

  dict(id="s07", type="RECAP", transition="dip", background="zoneB", durationFrames=440, narration=
   "Three lines. %Sampling reverses the protocol: the server asks the client. "
   "%The client holds the key, so the client pays. "
   "%And it takes one callback on the client and one c t x call on the server.",
   data={"heading":"Sampling, in three lines","points":[
     {"text":"The server asks the client"},{"text":"The client's key pays"},
     {"text":"One callback, one ctx call"}]},
   anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

  dict(id="s08", type="OUTRO_CTA", transition="fade", background="zoneA", durationFrames=300, narration=
   "Next chapter: how you stop a server reading files it was never meant to touch.",
   data={"message":"Next: roots","sub":"file access control"}, anchors=[]),
 ]}
write(T, 'mcp/ep06.json')
print("EP06:", len(T["scenes"]), "scenes")
