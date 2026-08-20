# -*- coding: utf-8 -*-
# EP07 roots, EP08 notifications. Roots gets its own chapter because the SDK does
# NOT enforce it — that misconception is the whole lesson, and the refusal has to be
# something you watch happen (MCP_ROOTS) rather than a sentence you're told.
import json
BRAND = {"theme":"moderndark","design":"moderndark","themeLight":"daylight","background":"grid",
         "channel":"THE NBX STUDIO","logo":"img:channel_logo.png"}
SRC = ["Course source: https://github.com/san-gitlogin/learn-mcp",
       "Live course: https://san-gitlogin.github.io/learn-mcp/"]
def L(t, det=None):
    d={"text":t}
    if det: d["detail"]=det; d["teach"]=True
    return d

ROOTS_PREM = "The client hands the server a list of allowed folders. Nothing stops the server looking elsewhere unless you write the check."

EP07 = {
 "meta":{"topic":"Roots","format":"long","fps":30,"screenplay":"explainer",
  "onePayoff":"Roots tell a server which folders it may touch — but the SDK never enforces it, so you write the check.",
  "openLoop":"You handed the server two folders. What stops it reading a third?",
  "analogy":"THE HOTEL KEYCARD - it opens your room and the gym, and nothing else.",
  "topicAxes":["sovereignty","entity-novelty"],
  "seo":{"title":"MCP Roots — The Security Check Nobody Writes",
   "altTitles":["MCP Doesn't Stop A Server Reading /etc/passwd. You Do.",
                "Roots In MCP: The Part The SDK Leaves To You"],
   "hook":"You handed the server two folders. What stops it reading a third?",
   "breakdown":"how roots are declared by the client, why the SDK does not enforce them, and the check you have to write yourself",
   "chapters":[{"id":"s01","title":"What stops it?"},
               {"id":"s03","title":"The client hands over keys"},
               {"id":"s04","title":"The check you write"},
               {"id":"s05","title":"Watching a refusal"}],
   "sources":SRC,
   "queries":["mcp roots explained","list_roots callback","is_path_allowed mcp",
     "mcp file access control","mcp security","mcp root uri file://","mcp server sandbox"],
   "hashtags":["#mcp","#security","#python","#claude","#thenbxstudio"],
   "tags":["mcp","model context protocol","roots","security","file access","python","claude",
     "anthropic","tutorial","the nbx studio"]}},
 "brand":BRAND,
 "thumbnail":{"title":"MCP WON'T STOP IT","badge":"Roots","asset":"si:python"},
 "scenes":[
  dict(id="s01", type="HOOK", background="zoneA", durationFrames=230, narration=
   "You tell an MCP server it can use two folders. What actually stops it reading a third one?",
   data={"headline":"MCP WON'T STOP IT","subtext":"roots, and who enforces them","heroAsset":"si:python",
         "headlineAtWord":1,"heroAtWord":10}, anchors=["headlineAtWord","heroAtWord"]),

  dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", durationFrames=330, narration=
   "Roots are how a client says you may look here, but not there. Think of a hotel keycard: it opens your "
   "room and the gym, and nothing else. Learn MCP, on THE NBX STUDIO.",
   data={"title":"ROOTS","subtitle":"chapter eight of eleven"}, anchors=[]),

  dict(id="s03", type="MCP_ROOTS", transition="wipe", background="zoneC", key="mcpRoots",
   headline="The client hands [over the keys]", color="red", caption="declaring roots",
   codeTitle="client.py", premise=ROOTS_PREM, durationFrames=920,
   narration=
   "The client decides which folders are allowed, and usually those paths come straight from the user — "
   "as command line arguments when the app launches, for instance. "
   "|Each path gets wrapped in a Root object with a file colon slash slash U R I, because the MCP spec "
   "requires that exact format rather than a bare path. "
   "^So Movies is allowed, ^and Desktop is allowed. "
   "|Then you write a callback that returns the list, |and you register that callback when you open the session. "
   "The subtle part is that the server never receives the roots up front. The server asks for them, on demand, "
   "and your callback answers — which means the client stays in control of the list the whole time.",
   lines=[L("root_paths = [\"/Users/me/Movies\", \"/Users/me/Desktop\"]"),
          L("roots = [Root(uri=FileUrl(f\"file://{Path(p).resolve()}\"),","MCP requires file:// URIs, not bare paths."),
          L("              name=Path(p).name) for p in root_paths]"),
          L(""),
          L("async def handle_list_roots(context):","The server asks; this answers."),
          L("    return ListRootsResult(roots=roots)"),
          L(""),
          L("ClientSession(read, write,","Registered when the session opens."),
          L("              list_roots_callback=handle_list_roots)")],
   cells=[{"label":"/Users/me/Movies","sub":"granted by the client","mark":True},
          {"label":"/Users/me/Desktop","sub":"granted by the client","mark":True}]),

  dict(id="s04", type="MCP_ROOTS", transition="push", background="zoneA", key="mcpRoots",
   headline="The check [you write yourself]", color="red", caption="not in the SDK",
   codeTitle="server.py", premise=ROOTS_PREM, durationFrames=980,
   narration=
   "Here's the part that surprises people, and it's the most important sentence in this chapter. "
   "Is path allowed is not part of the MCP library. You write it. "
   "|The S D K gives you c t x dot session dot list roots, which fires the client's callback and returns "
   "the allowed folders — that much is genuinely MCP's. "
   "|Comparing a requested path against that list is entirely your responsibility. "
   "|The trick is relative to, which raises a ValueError when the path isn't inside the folder, so a successful "
   "call means it's a child and an exception means it isn't. "
   "^Movies slash clip dot m o v sits inside a granted root, so that one's allowed. "
   "|And if nothing matched by the end, you return False, ^which is how slash e t c slash passwd gets refused. "
   "Leave this function out and every tool you write can read anything the process can read.",
   lines=[L("async def is_path_allowed(requested: Path, ctx: Context) -> bool:"),
          L("    roots = await ctx.session.list_roots()","This part IS from MCP."),
          L("    if not requested.exists():","And this part is entirely yours."),
          L("        return False"),
          L("    for root in roots.roots:"),
          L("        try:"),
          L("            requested.relative_to(file_url_to_path(root.uri))","Raises unless it's inside."),
          L("            return True"),
          L("        except ValueError:"),
          L("            continue"),
          L("    return False","Nothing matched. Refuse.")],
   cells=[{"label":"/Users/me/Movies/clip.mov","sub":"inside a granted root","text":"ask","mark":True},
          {"label":"/etc/passwd","sub":"outside every root","text":"ask","color":"red","mark":True}]),

  dict(id="s05", type="QUIZ_CARD", transition="iris", background="zoneC", durationFrames=830, narration=
   "^True or false, straight from the course. The MCP S D K automatically stops tools reading files outside "
   "the roots. "
   "^True, MCP enforces it. ^Or false, you write is path allowed yourself. "
   "Have a think, and pause if you'd like a moment. "
   "^Ready? False. MCP hands you the list and nothing more — the enforcement is code you write, and if you "
   "skip it there is no error and no warning, just a server that reads whatever it likes.",
   data={"quiz":{"question":"Does the SDK enforce roots for you?",
     "options":[{"text":"true — MCP enforces it"},{"text":"false — you write the check"}],
     "answerIndex":1,"why":"MCP gives you the list. Enforcement is your code."}},
   anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.revealAtWord"]),

  dict(id="s06", type="RECAP", transition="dip", background="zoneB", durationFrames=430, narration=
   "Three lines. %The client declares the roots, as file U R Is. "
   "%The server asks for them on demand, through list roots. "
   "%And the check against them is yours to write, every time.",
   data={"heading":"Roots, in three lines","points":[
     {"text":"The client declares them"},{"text":"The server asks on demand"},
     {"text":"You write the check"}]},
   anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

  dict(id="s07", type="OUTRO_CTA", transition="fade", background="zoneA", durationFrames=290, narration=
   "Next: how a long-running tool tells the user it hasn't frozen.",
   data={"message":"Next: notifications","sub":"logs and progress"}, anchors=[]),
 ]}
json.dump(EP07, open('/Users/santhu/iauteur/briefs/mcp/ep07.json','w'), indent=1)
print("EP07:", len(EP07["scenes"]), "scenes")

NOTIF_PREM = "A tool that takes thirty seconds is silent by default. These two calls are the only way the user learns anything is happening."
EP08 = {
 "meta":{"topic":"Notifications","format":"long","fps":30,"screenplay":"explainer",
  "onePayoff":"Two server calls and two client callbacks turn a frozen-looking tool into one that reports itself.",
  "openLoop":"Thirty seconds of nothing. Is it working, or has it died?",
  "analogy":"THE KITCHEN CALL-BACK - the chef shouting 'two minutes' so you know the order isn't lost.",
  "topicAxes":["entity-novelty","economic-pain"],
  "seo":{"title":"MCP Notifications — Stop Your Tool Looking Frozen",
   "altTitles":["ctx.info and report_progress, Explained","MCP Progress And Logging In One Chapter"],
   "hook":"Thirty seconds of silence. Working, or dead?",
   "breakdown":"the two server calls that report progress, the two client callbacks that catch them, and why they go in different places",
   "chapters":[{"id":"s01","title":"Working, or dead?"},
               {"id":"s03","title":"The server speaks up"},
               {"id":"s04","title":"The client listens"}],
   "sources":SRC,
   "queries":["mcp notifications","ctx.report_progress","mcp logging_callback",
     "mcp progress_callback","mcp ctx.info","long running mcp tool","mcp streaming progress"],
   "hashtags":["#mcp","#python","#claude","#anthropic","#thenbxstudio"],
   "tags":["mcp","model context protocol","notifications","progress","logging","python","claude",
     "anthropic","tutorial","the nbx studio"]}},
 "brand":BRAND,
 "thumbnail":{"title":"WORKING, OR DEAD?","badge":"Notifications","asset":"si:python"},
 "scenes":[
  dict(id="s01", type="HOOK", background="zoneA", durationFrames=225, narration=
   "Your tool has been running for thirty seconds and printed nothing. Is it working, or has it died?",
   data={"headline":"WORKING, OR DEAD?","subtext":"logs and progress","heroAsset":"si:python",
         "headlineAtWord":1,"heroAtWord":10}, anchors=["headlineAtWord","heroAtWord"]),

  dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", durationFrames=320, narration=
   "A tool call is silent by default, and silence is indistinguishable from a crash. Two calls fix that. "
   "Learn MCP, on THE NBX STUDIO.",
   data={"title":"NOTIFICATIONS","subtitle":"chapter nine of eleven"}, anchors=[]),

  dict(id="s03", type="MCP_PROGRESS", transition="wipe", background="zoneC", key="mcpProgress",
   headline="The server [speaks up]", color="blue", caption="two calls",
   codeTitle="server.py", premise=NOTIF_PREM, durationFrames=920,
   narration=
   "On the server side there are exactly two calls worth knowing. "
   "|C t x dot info sends a log line — a human sentence about what's happening right now. "
   "^Searching Wikipedia, for instance. "
   "|C t x dot report progress sends a number instead: how far through, out of how much. "
   "^Thirty out of a hundred. "
   "|As the work moves on you send more of both, ^writing report, ^and eighty percent. "
   "Neither call changes what the tool returns — they're side channels that travel while the tool is still "
   "running, which is precisely why they're useful.",
   lines=[L("@mcp.tool()"),
          L("async def research(topic: str, ctx: Context):"),
          L("    await ctx.info(\"Searching Wikipedia...\")","A human sentence about right now."),
          L("    await ctx.report_progress(30, 100)","A number: how far, out of how much."),
          L("    data = await scrape(topic)"),
          L("    await ctx.info(\"Writing report...\")","More of both, as the work moves."),
          L("    await ctx.report_progress(80, 100)"),
          L("    return summarize(data)")],
   cells=[{"label":"Searching Wikipedia…","mark":True},
          {"label":"30% done","value":30,"mark":True},
          {"label":"Writing report…","mark":True},
          {"label":"80% done","value":80,"mark":True}]),

  dict(id="s04", type="MCP_PROGRESS", transition="push", background="zoneA", key="mcpProgress",
   headline="Two callbacks, [two places]", color="blue", caption="and this trips people",
   codeTitle="client.py", premise=NOTIF_PREM, durationFrames=900,
   narration=
   "On the client side you write two callbacks, and where each one is registered is the detail people get wrong. "
   "|The logging callback goes on the session, ^because log messages can arrive from anything the server is "
   "doing, not just the tool you happen to be waiting on. "
   "|The progress callback goes on the individual call tool, ^because progress belongs to one specific piece "
   "of work — thirty percent of what, otherwise? "
   "|Register them and your interface can show a spinner with real text and a bar with a real number, "
   "%instead of a frozen window and a user reaching for the close button.",
   lines=[L("async def logging_callback(params):"),
          L("    print(params.data)          # \"Searching Wikipedia...\""),
          L(""),
          L("async def progress_callback(progress, total, message):"),
          L("    print(f\"{progress / total:.0%}\")"),
          L(""),
          L("ClientSession(read, write,","Session-wide: catches every log message."),
          L("              logging_callback=logging_callback)"),
          L("await session.call_tool(\"research\", {...},","Per-call: progress belongs to THIS work."),
          L("                        progress_callback=progress_callback)")],
   cells=[{"label":"logging_callback → the session","sub":"any log, from anything the server does","mark":True},
          {"label":"progress_callback → the call","sub":"progress belongs to one piece of work","mark":True}],
   vars=[{"label":"no more frozen window","mark":True}]),

  dict(id="s05", type="RECAP", transition="dip", background="zoneB", durationFrames=420, narration=
   "Three lines. %The server sends c t x dot info for words and report progress for numbers. "
   "%The logging callback is registered on the session. "
   "%And the progress callback is registered on the individual call.",
   data={"heading":"Notifications, in three lines","points":[
     {"text":"ctx.info for words, report_progress for numbers"},
     {"text":"logging_callback → the session"},{"text":"progress_callback → the call"}]},
   anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

  dict(id="s06", type="OUTRO_CTA", transition="fade", background="zoneA", durationFrames=290, narration=
   "Next chapter has a trap in it: two flags that quietly switch this entire feature off.",
   data={"message":"Next: transport","sub":"and two dangerous flags"}, anchors=[]),
 ]}
json.dump(EP08, open('/Users/santhu/iauteur/briefs/mcp/ep08.json','w'), indent=1)
print("EP08:", len(EP08["scenes"]), "scenes")
