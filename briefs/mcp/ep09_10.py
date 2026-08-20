# -*- coding: utf-8 -*-
# EP09 transport + the two flags. EP10 the finale. The flag matrix is the reason
# these two share a chapter: the flags only make sense once HTTP is on the table.
import json
BRAND = {"theme":"moderndark","design":"moderndark","themeLight":"daylight","background":"grid",
         "channel":"THE NBX STUDIO","logo":"img:channel_logo.png"}
SRC = ["Course source: https://github.com/san-gitlogin/learn-mcp",
       "Live course: https://san-gitlogin.github.io/learn-mcp/"]
def L(t, det=None):
    d={"text":t}
    if det: d["detail"]=det; d["teach"]=True
    return d

EP09 = {
 "meta":{"topic":"Transport and the Two Flags","format":"long","fps":30,"screenplay":"explainer",
  "onePayoff":"stdio for development, HTTP for production — and two flags that trade features for scale without warning you.",
  "openLoop":"Two settings that look like performance tuning. One of them silently kills sampling.",
  "analogy":"THE SAME ROOM - passing notes across a desk, versus a phone call across the world.",
  "topicAxes":["entity-novelty","sovereignty"],
  "seo":{"title":"MCP Transport — And The Two Flags That Break Everything",
   "altTitles":["stateless_http Silently Kills Sampling. Here's Why.",
                "stdio vs streamable-http, And The Trap In Between"],
   "hook":"Two settings that look like tuning. One kills sampling.",
   "breakdown":"stdio against streamable HTTP, and exactly which features stateless_http and json_response switch off",
   "chapters":[{"id":"s01","title":"Two settings, one trap"},
               {"id":"s03","title":"Same room, or a phone call"},
               {"id":"s04","title":"What the flags turn off"}],
   "sources":SRC,
   "queries":["mcp stdio vs http","streamable http mcp","stateless_http mcp",
     "json_response mcp","mcp transport explained","mcp production deployment","mcp scaling"],
   "hashtags":["#mcp","#python","#devops","#claude","#thenbxstudio"],
   "tags":["mcp","model context protocol","transport","stdio","http","stateless","scaling",
     "python","claude","anthropic","the nbx studio"]}},
 "brand":BRAND,
 "thumbnail":{"title":"ONE FLAG KILLS IT","badge":"Transport","asset":"si:python"},
 "scenes":[
  dict(id="s01", type="HOOK", background="zoneA", durationFrames=230, narration=
   "Two settings in your server look like performance tuning. One of them silently switches off sampling.",
   data={"headline":"ONE FLAG KILLS IT","subtext":"transport, and the trap","heroAsset":"si:python",
         "headlineAtWord":1,"heroAtWord":10}, anchors=["headlineAtWord","heroAtWord"]),

  dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", durationFrames=320, narration=
   "MCP messages are just JSON. How they travel is a separate decision, and it's a decision with "
   "consequences. Learn MCP, on THE NBX STUDIO.",
   data={"title":"TRANSPORT","subtitle":"chapter ten of eleven"}, anchors=[]),

  dict(id="s03", type="MCP_TRANSPORT", transition="wipe", background="zoneC", key="mcpTransport",
   headline="Same room, or [a phone call]", color="green", caption="two transports",
   premise="Both move identical JSON. The only difference is whether the two programs share a machine.",
   durationFrames=860,
   narration=
   "There are two transports worth knowing, and they carry exactly the same JSON. "
   "^Stdio means the client launches the server as a child process on the same machine and they talk over "
   "standard input and standard output — like two people at one desk passing notes. Every feature works, "
   "setup is nothing, and it only ever works locally. "
   "^Streamable H T T P means the server runs somewhere else entirely and you reach it over the network, "
   "which is what you need the moment the server isn't on the user's laptop. "
   "That's the whole choice: stdio while you're developing, H T T P when you ship.",
   cells=[{"label":"stdio","sub":"development","mark":True,
           "out":["full features","trivial setup","same machine only"]},
          {"label":"streamable-http","sub":"production","text":"remote","mark":True,
           "out":["remote servers","scales horizontally","some features limited"]}]),

  dict(id="s04", type="MCP_FLAGS", transition="push", background="zoneA", key="mcpFlags",
   headline="What the flags [turn off]", color="red", caption="read this twice",
   codeTitle="server.py",
   premise="Both flags are set when you CREATE the server, and both trade features for scale. Nothing warns you.",
   durationFrames=1000,
   narration=
   "Now the trap, and it's worth reading twice. Both flags are set when you create the server, not when you run it. "
   "|Stateless h t t p true means the server forgets each client between requests, "
   "^which is exactly what you need behind a load balancer, because any instance can then answer any request. "
   "The cost is severe: sampling stops working, progress stops working, roots stop working, and subscriptions "
   "stop working — because every one of those needs the server to remember who you are. "
   "|Json response true means replies come back as plain JSON instead of a stream, "
   "^which kills live progress and log messages, since streaming is the mechanism those arrive on. "
   "^Notice what survives both: ordinary tool calls. "
   "So the rule of thumb is to start with both false, which is the default, and only reach for either one "
   "when you genuinely need horizontal scaling and can say out loud what you're giving up.",
   lines=[L("from mcp.server.fastmcp import FastMCP"),
          L(""),
          L("mcp = FastMCP("),
          L("    \"my-server\","),
          L("    stateless_http=True,","Scales. Kills sampling, progress, roots, subscriptions."),
          L("    json_response=True,","Simpler. Kills streaming progress and log messages."),
          L(")"),
          L("mcp.run(transport=\"streamable-http\")")],
   cells=[{"label":"stateless_http=True","sub":"forgets clients between requests","text":"flag","mark":True,
           "out":["sampling","progress","roots","subscriptions"]},
          {"label":"json_response=True","sub":"plain JSON instead of SSE streams","text":"flag","mark":True,
           "out":["progress","log messages"]},
          {"label":"sampling"},{"label":"progress"},{"label":"roots"},
          {"label":"subscriptions"},{"label":"log messages"},{"label":"tools","mark":True}]),

  dict(id="s05", type="RECAP", transition="dip", background="zoneB", durationFrames=430, narration=
   "Three lines. %Stdio is for development, on one machine. "
   "%Streamable H T T P is for production, across the network. "
   "%And both flags default to false for a reason — turning either on trades features for scale.",
   data={"heading":"Transport, in three lines","points":[
     {"text":"stdio — one machine, every feature"},{"text":"streamable-http — across the network"},
     {"text":"Both flags default false for a reason"}]},
   anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

  dict(id="s06", type="OUTRO_CTA", transition="fade", background="zoneA", durationFrames=290, narration=
   "One chapter left, and it's the one where we put the whole protocol back together.",
   data={"message":"Next: everything, together","sub":"and the final question"}, anchors=[]),
 ]}
json.dump(EP09, open('/Users/santhu/iauteur/briefs/mcp/ep09.json','w'), indent=1)
print("EP09:", len(EP09["scenes"]), "scenes")

EP10 = {
 "meta":{"topic":"Everything, Together","format":"long","fps":30,"screenplay":"explainer",
  "onePayoff":"Eleven chapters reduce to one mental model: who is in control, and who is paying.",
  "openLoop":"You're building a public weather server that needs an LLM. One decision decides whether it bankrupts you.",
  "analogy":"THE ASSEMBLED MACHINE - every part you met, running at once.",
  "topicAxes":["entity-novelty","economic-pain"],
  "seo":{"title":"MCP, All Of It — The Final Checkpoint",
   "altTitles":["Everything You Now Know About MCP, In One Chapter",
                "The MCP Mental Model That Survives The Syntax"],
   "hook":"Eleven chapters. One mental model.",
   "breakdown":"the whole protocol reassembled, and the one question that decides how you build a public server",
   "chapters":[{"id":"s01","title":"One decision left"},
               {"id":"s03","title":"The whole machine"},
               {"id":"s04","title":"The final question"}],
   "sources":SRC,
   "queries":["mcp summary","model context protocol recap","mcp cheat sheet",
     "learn mcp course","mcp interview questions","mcp best practices"],
   "hashtags":["#mcp","#claude","#anthropic","#python","#thenbxstudio"],
   "tags":["mcp","model context protocol","claude","anthropic","python","summary","recap",
     "tutorial","the nbx studio"]}},
 "brand":BRAND,
 "thumbnail":{"title":"ALL OF MCP, IN ONE","badge":"Finale","asset":"si:anthropic"},
 "scenes":[
  dict(id="s01", type="HOOK", background="zoneA", durationFrames=235, narration=
   "You're shipping a public weather server that needs a language model. One decision decides whether it bankrupts you.",
   data={"headline":"ALL OF MCP, IN ONE","subtext":"the final checkpoint","heroAsset":"si:anthropic",
         "headlineAtWord":1,"heroAtWord":12}, anchors=["headlineAtWord","heroAtWord"]),

  dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", durationFrames=320, narration=
   "Everything from here is assembly. You've met every part already, so this is about seeing them run "
   "together. Learn MCP, on THE NBX STUDIO.",
   data={"title":"EVERYTHING, TOGETHER","subtitle":"chapter eleven of eleven"}, anchors=[]),

  dict(id="s03", type="MCP_CONTROL", transition="wipe", background="zoneC", key="mcpControl",
   headline="The whole [machine]", color="blue", caption="every part, at once",
   premise="Every piece of the protocol you've met, and the one question that tells them apart.",
   durationFrames=940,
   narration=
   "Here's the whole thing on one screen. "
   "^Tools are functions the model chooses, and Claude never runs them — your code does, in the loop. "
   "^Resources are data your code fetches, and injecting one beats a tool call whenever you already know "
   "what's needed. "
   "^Prompts are workflows a person triggers, which is how you ship your own expertise as a button. "
   "^Sampling reverses the protocol so the client's key pays, which is what makes a public server affordable. "
   "^Roots are file access control that the S D K hands you but never enforces. "
   "^And notifications are how a slow tool proves it's alive. "
   "Underneath all six, one question keeps working: who is in control — and for sampling, who is paying.",
   cells=[{"label":"Tools","sub":"the model chooses · your code runs","owner":"ai","mark":True},
          {"label":"Resources","sub":"your code fetches · inject to skip a round trip","owner":"code","mark":True},
          {"label":"Prompts","sub":"a person triggers · your expertise, as a button","owner":"user","mark":True},
          {"label":"Sampling","sub":"the server asks · the client's key pays","owner":"code","mark":True},
          {"label":"Roots","sub":"handed to you · enforced by you","owner":"code","mark":True},
          {"label":"Notifications","sub":"ctx.info and report_progress","owner":"code","mark":True}]),

  dict(id="s04", type="QUIZ_CARD", transition="iris", background="zoneC", durationFrames=860, narration=
   "^The final question, straight from the course. You're building a public MCP server for a weather service, "
   "users connect from their own apps, and the server needs a language model to write the forecast in plain "
   "English. What's the smartest approach? "
   "^Put your Anthropic key on the server and call Claude directly. ^Or use sampling, so each client calls "
   "Claude with its own key. "
   "Have a think, and pause if you'd like a moment. "
   "^Ready? Sampling. Option one works beautifully until the day somebody shares your server, and then every "
   "forecast in the world is billed to you — which is precisely the corner sampling was invented to avoid.",
   data={"quiz":{"question":"Public weather server, needs an LLM. Best?",
     "options":[{"text":"your key on the server"},{"text":"sampling — the client pays"}],
     "answerIndex":1,"why":"Otherwise every user's forecast is billed to you."}},
   anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.revealAtWord"]),

  dict(id="s05", type="LIST_BUILD", transition="fade", background="zoneB", durationFrames=560, narration=
   "Four things to go and do, in this order. %Build the notes server from chapter four. "
   "%Add a resource and read it from a client. "
   "%Add a tool that reports progress, and watch the callback fire. "
   "And %make the server ask you to call Claude, which is sampling, and the moment it clicks.",
   data={"heading":"Do these four, in this order","items":[
     {"icon":"lucide:server","text":"The notes server","detail":"chapter four, from scratch"},
     {"icon":"lucide:folder-open","text":"A resource","detail":"and read it from a client"},
     {"icon":"lucide:activity","text":"report_progress","detail":"watch the callback fire"},
     {"icon":"lucide:repeat","text":"Sampling","detail":"the moment it clicks"}]},
   anchors=["items.0.atWord","items.1.atWord","items.2.atWord","items.3.atWord"]),

  dict(id="s06", type="RECAP", transition="dip", background="zoneB", durationFrames=440, narration=
   "Three lines for the whole protocol. %Ask who is in control, and the primitive names itself. "
   "%Claude asks, and your code executes — always. "
   "%And whoever holds the key pays, which is the whole argument for sampling.",
   data={"heading":"MCP, in three lines","points":[
     {"text":"Who is in control?"},{"text":"Claude asks — your code executes"},
     {"text":"Whoever holds the key pays"}]},
   anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

  dict(id="s07", type="OUTRO_CTA", transition="fade", background="zoneA", durationFrames=310, narration=
   "That's the course. You've got the mental model now, and the syntax is a search away. The interactive "
   "version is linked below if you'd like to step through it yourself. Go and build something.",
   data={"message":"Learn MCP — the whole course","sub":"interactive version linked below"}, anchors=[]),
 ]}
json.dump(EP10, open('/Users/santhu/iauteur/briefs/mcp/ep10.json','w'), indent=1)
print("EP10:", len(EP10["scenes"]), "scenes")
