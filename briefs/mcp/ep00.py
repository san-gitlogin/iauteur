# -*- coding: utf-8 -*-
# EP00 — How Claude actually works, and what you need installed.
# Source: learn-mcp lesson 1. Nothing is assumed: the analogy and the vocabulary
# are given BEFORE they are used (LAW 0l), and the shell output is verbatim (LAW 0m).
import json

BRAND = {"theme":"moderndark","design":"moderndark","themeLight":"daylight","background":"grid",
         "channel":"THE NBX STUDIO","logo":"img:channel_logo.png"}
PREM = "Claude is an HTTP API. You send a list of messages, you get one message back. Nothing else is happening."

def L(t, det=None, teach=False):
    d = {"text": t}
    if det: d["detail"] = det; d["teach"] = True
    if teach: d["teach"] = True
    return d

T = {
 "meta": {"topic":"How Claude Works","format":"long","fps":30,"screenplay":"explainer",
  "onePayoff":"Every Claude app is one API call in a loop — and MCP is what fills that call with tools.",
  "openLoop":"Everyone says 'call the API'. Nobody shows you what's actually in the envelope.",
  "analogy":"THE ENVELOPE - you post a conversation, you get one reply back.",
  "topicAxes":["entity-novelty","economic-pain"],
  "seo":{"title":"How Claude Actually Works (Before You Touch MCP)",
   "altTitles":["The Anthropic API in 6 Minutes — Every Argument Explained",
                "Before MCP: What messages.create() Is Really Doing"],
   "hook":"One API call. Four arguments. That's the whole thing.",
   "breakdown":"the Anthropic API call argument by argument, and the four things you need installed before MCP makes any sense",
   "chapters":[{"id":"s01","title":"What's actually in the envelope"},
               {"id":"s03","title":"The call, taken apart"},
               {"id":"s05","title":"Four things to install"},
               {"id":"s07","title":"Not using Claude?"}],
   "sources":["Course source: https://github.com/san-gitlogin/learn-mcp",
              "Live course: https://san-gitlogin.github.io/learn-mcp/"],
   "queries":["anthropic api python tutorial","how does claude api work","messages.create python",
     "claude api key setup","what is mcp","anthropic sdk getting started","claude sonnet api example"],
   "hashtags":["#mcp","#claude","#anthropic","#python","#thenbxstudio"],
   "tags":["mcp","model context protocol","claude","anthropic","python","api","llm","tutorial",
     "claude api","anthropic sdk","the nbx studio"]}},
 "brand": BRAND,
 "thumbnail":{"title":"ONE CALL. FOUR ARGS.","badge":"Before MCP","asset":"si:python"},
 "scenes":[

 dict(id="s01", type="HOOK", background="zoneA", durationFrames=240, narration=
  "Everybody says just call the API. But what's actually inside the envelope you're posting, and where exactly does MCP plug into it?",
  data={"headline":"WHAT'S IN THE ENVELOPE","subtext":"one call, four arguments","heroAsset":"si:python",
        "headlineAtWord":1,"heroAtWord":10},
  anchors=["headlineAtWord","heroAtWord"]),

 dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", durationFrames=330, narration=
  "This is Learn MCP, from THE NBX STUDIO, and this first chapter is the one everybody skips. "
  "Before MCP can mean anything, you need to see what a plain Claude call actually looks like.",
  data={"title":"HOW CLAUDE WORKS","subtitle":"chapter one of eleven"}, anchors=[]),

 dict(id="s03", type="MCP_API_ANATOMY", transition="wipe", background="zoneC", key="mcpApi",
  headline="The call, [taken apart]", color="purple", caption="one API call",
  codeTitle="first_call.py", premise=PREM, durationFrames=900,
  narration=
  "Here's the whole thing. |You import the client and create it, and it quietly reads your key "
  "out of an environment variable, which is why you never see the key in the code. "
  "|Then messages dot create sends the conversation and waits. That single call is the entire API — "
  "everything else you'll ever write is arguments to it. "
  "^Model picks which Claude answers, and Sonnet is the fast, affordable one. "
  "^Max tokens is a ceiling on the reply, not a target, so a high ceiling costs nothing by itself. "
  "^And messages is the conversation so far, where every entry carries a role, either user or assistant. "
  "|The reply comes back as a list of content blocks, which is why you index into it rather than "
  "printing the message directly.",
  lines=[L("from anthropic import Anthropic"),
         L("client = Anthropic()","It reads ANTHROPIC_API_KEY from your environment."),
         L(""),
         L("message = client.messages.create(","The whole API. Everything else is an argument."),
         L("    model=\"claude-sonnet-4-0\","),
         L("    max_tokens=1024,"),
         L("    messages=[{\"role\": \"user\","),
         L("               \"content\": \"What is MCP?\"}],"),
         L(")"),
         L("print(message.content[0].text)","A list of blocks, so you index into it.")],
  cells=[{"label":"model=","sub":"which Claude answers · Sonnet is fast and cheap","mark":True},
         {"label":"max_tokens=","sub":"a ceiling on the reply, not a target","mark":True},
         {"label":"messages=[…]","sub":"the conversation so far, each entry with a role","mark":True}]),

 dict(id="s03b", type="MCP_API_ANATOMY", transition="push", background="zoneA", key="mcpApi",
  headline="It forgets you [every time]", color="purple", caption="why the list keeps growing",
  codeTitle="conversation.py", premise=PREM, durationFrames=760,
  narration=
  "Here's the part that trips people up, and this one matters enormously later. "
  "The API is stateless. Claude doesn't remember your last message — there's no session on their side "
  "holding your conversation. "
  "|So when you want a second turn, you send the whole thing again: your first message, "
  "^Claude's reply, ^and your new question, all in one list. "
  "|That's why the messages list keeps growing, and why a long chat costs more than a short one — "
  "you're re-sending the entire history on every single call. "
  "%Three messages here, and all three go over the wire. "
  "Hold onto that, because in a few chapters you'll watch a loop append tool results to this exact list.",
  lines=[L("messages = ["),
         L("    {\"role\": \"user\",      \"content\": \"What is MCP?\"},","Turn one: what you asked."),
         L("    {\"role\": \"assistant\", \"content\": \"MCP is...\"},"),
         L("    {\"role\": \"user\",      \"content\": \"Show me a server\"},"),
         L("]"),
         L("client.messages.create(model=M, max_tokens=1024,"),
         L("                       messages=messages)","All of it, every call. Nothing is remembered.")],
  cells=[{"label":"assistant","sub":"what Claude said last time — you store it","mark":True},
         {"label":"user","sub":"your new question, appended on the end","mark":True}],
  vars=[{"label":"3 messages sent","mark":True}]),

 dict(id="s04", type="QUIZ_CARD", transition="iris", background="zoneC", durationFrames=780, narration=
  "^Quick check before we go on. To run that file, what do you actually need? "
  "^Just Python, because Claude is built in. ^Or the anthropic package and an API key. "
  "Have a think, and pause the video if you would like a moment. "
  "^Ready? You need the package and a key. There's no model on your machine — "
  "that call goes over the internet to Anthropic's servers, and the key is how they know it's you.",
  data={"quiz":{"question":"What do you need to run that file?",
    "options":[{"text":"just Python — it's built in"},
               {"text":"the anthropic package + a key"}],
    "answerIndex":1,"why":"There's no model on your machine. It's an HTTP call."}},
  anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.revealAtWord"]),

 dict(id="s04b", type="MCP_API_ANATOMY", transition="dip", background="zoneC", key="mcpApi",
  headline="The argument [MCP fills]", color="purple", caption="where the course is going",
  codeTitle="with_tools.py", premise=PREM, durationFrames=780,
  narration=
  "One more argument, and it's the reason this whole course exists. "
  "|Alongside messages, the call takes tools — a list describing functions Claude is allowed to ask for. "
  "^Each one is a name, ^a description Claude reads to decide when it's useful, "
  "^and a schema saying what arguments it takes. "
  "Claude never runs those functions. Claude just replies saying which one it wants and with what inputs, and your "
  "code does the running. "
  "|So the question the rest of this course answers is simply: where does that list come from? "
  "Writing it by hand for GitHub, for Slack, for your database, forever, is the problem. "
  "%MCP is the answer, and now you know exactly which argument MCP is filling.",
  lines=[L("client.messages.create("),
         L("    model=M, max_tokens=1024,"),
         L("    messages=messages,"),
         L("    tools=[{                        # <- the hole","A list of functions Claude may ask you to run."),
         L("        \"name\": \"read_note\","),
         L("        \"description\": \"Read a note by filename\","),
         L("        \"input_schema\": {...},"),
         L("    }],"),
         L(")","Where does this list come from? That's MCP.")],
  cells=[{"label":"name","sub":"what the function is called","mark":True},
         {"label":"description","sub":"how Claude decides it's the right one","mark":True},
         {"label":"input_schema","sub":"the arguments, and their types","mark":True}],
  vars=[{"label":"MCP fills tools=","mark":True}]),

 dict(id="s05", type="MCP_TERMINAL", transition="push", background="zoneA", key="mcpTerm",
  headline="Four things, [then you're set]", color="green", stageTitle="what you end up with",
  promptLabel="santhu@box", cwd="~/mcp", durationFrames=880,
  narration=
  "Four things to install, and then we'll never do setup again. "
  "+First, Python three point ten or newer, because the MCP SDK needs the newer typing features. "
  "+Second, u v, which is a Python package manager that's dramatically faster than pip and is what "
  "the MCP docs assume you're using. "
  "+Third, the SDK itself. Note the square brackets around c l i — that pulls in the command line "
  "tools as well as the library, and you'll want them. "
  "+And fourth, your key, exported in the shell so the client can find it. "
  "^Python, ^u v, ^the SDK, ^and a key. That's the whole list.",
  steps=[{"label":"python --version","out":["Python 3.12.4"],"detail":"3.10 or newer. The SDK needs it.","mark":True},
         {"label":"pip install uv","out":["Successfully installed uv-0.5.11"],"detail":"A much faster package manager.","mark":True},
         {"label":"uv add \"mcp[cli]\"","out":["Resolved 41 packages in 210ms",
                                               "Installed 12 packages in 84ms",
                                               " + mcp==1.2.0",
                                               " + pydantic==2.9.2"],
          "detail":"The brackets pull in the CLI tools too.","mark":True},
         {"label":"export ANTHROPIC_API_KEY=\"sk-ant-...\"","out":["(no output — that's correct)"],
          "detail":"The client reads this automatically.","mark":True}],
  cells=[{"label":"Python 3.10+","sub":"the language","mark":True},
         {"label":"uv","sub":"the package manager","mark":True},
         {"label":"mcp[cli]","sub":"the SDK and its tools","mark":True},
         {"label":"ANTHROPIC_API_KEY","sub":"how Anthropic knows it's you","mark":True}]),

 dict(id="s06", type="RECAP", transition="dip", background="zoneB", durationFrames=420, narration=
  "Three things to carry forward. %Claude is an API call, not a program on your machine. "
  "%One call takes a model, a token ceiling and the conversation. "
  "%And the key lives in your environment, never in the file.",
  data={"heading":"Chapter one, in three lines","points":[
    {"text":"Claude is an API call"},{"text":"model + max_tokens + messages"},{"text":"the key lives in your environment"}]},
  anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

 dict(id="s07", type="OUTRO_CTA", transition="fade", background="zoneA", durationFrames=300, narration=
  "Not using Claude? The same ideas hold — every major model has an equivalent call, and MCP itself "
  "is model agnostic. Next chapter: what MCP actually is, and why it exists at all.",
  data={"message":"Next: what MCP actually is","sub":"and the problem it solves"}, anchors=[]),
 ]}
json.dump(T, open('/Users/santhu/iauteur/briefs/mcp/ep00.json','w'), indent=1)
print("EP00:", len(T["scenes"]), "scenes")
