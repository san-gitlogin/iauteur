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
  "onePayoff":"Claude cannot reach anything on your machine. Your code can — and MCP is the agreed way to describe what your code is offering.",
  "openLoop":"Claude will answer anything you ask, and then fail at 'check my calendar'. Why?",
  "analogy":"THE HARD LINE - the model on one side, your machine on the other, your code the only crossing.",
  "topicAxes":["entity-novelty","economic-pain"],
  "seo":{"title":"How Claude Actually Works — And What It Cannot Do",
   "altTitles":["Why Claude Can't Read Your Files (And What To Do About It)",
                "Before MCP: What Claude Is, In Plain English"],
   "hook":"It can answer anything. It cannot open one file on your laptop.",
   "breakdown":"what Claude actually is, what it genuinely cannot reach, the one call that talks to it, and the four things to install",
   "chapters":[{"id":"s01","title":"The thing nobody says out loud"},
               {"id":"s02b","title":"What Claude cannot do"},
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
 "thumbnail":{"title":"IT CAN'T READ YOUR FILES","badge":"Chapter 1 · Learn MCP","asset":"si:python"},
 "scenes":[

 dict(id="s01", type="HOOK", background="zoneA", durationFrames=230, narration=
  "Ask Claude anything and it answers. Ask it to open one file on your laptop, and it simply can't.",
  # HOOK is capped at 8s by the linter — the shorter read is also the better one.
  data={"headline":"IT CAN'T REACH YOUR STUFF","subtext":"and that is not a bug","heroAsset":"lucide:lock",
        "headlineAtWord":1,"heroAtWord":14},
  anchors=["headlineAtWord","heroAtWord"]),

 dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", durationFrames=330, narration=
  "This is Learn MCP, from THE NBX STUDIO. By the end of this chapter you'll know what Claude actually is, "
  "what it genuinely cannot touch on its own, and which single part of a Claude call MCP goes on to fill. "
  "No MCP code yet — just the shape of the thing, so that nothing later feels like magic.",
  data={"title":"HOW CLAUDE WORKS","subtitle":"chapter one of twelve"}, anchors=[]),

 # The beginner on-ramp. The chapter used to open straight onto messages.create(),
 # which answers a question a first-time viewer has not asked yet. Owner, 2026-08-21:
 # *"The title says whats claude and how claude works, and inside I see you start
 # explaining about using anthropics claude as an API. Dude WTF. Is it even beginner
 # friendly?"* This beat establishes the thing and its limits FIRST; every argument
 # after it now has something to attach to.
 dict(id="s02b", type="MCP_REACH", transition="wipe", background="zoneC", key="mcpReach",
  headline="What Claude [cannot do]", color="purple", caption="the hard line",
  premise="Claude runs on Anthropic's machines. Everything on the right is on yours. The dashed line is real.",
  ends=["CLAUDE","YOUR MACHINE"], durationFrames=900,
  narration=
  "Let's start with the thing nobody says out loud. Claude is not a program sitting on your computer. "
  "It runs on Anthropic's machines, and you talk to it over the internet — you send text, it sends text back, "
  "and that is the entire relationship. "
  "Which means that on its own, ^it cannot open your files. "
  "^It cannot read your database. "
  "^It cannot see your calendar or post a message in your Slack. "
  "And none of that is a permission you forgot to switch on. "
  "There is simply no way for it to reach across that line.",
  cells=[{"label":"your files","sub":"notes, code, that todo.md on the desktop","icon":"lucide:folder","text":"out","mark":True},
         {"label":"your database","sub":"every row behind your app","icon":"lucide:database","text":"out","mark":True},
         {"label":"your calendar, your Slack","sub":"everything your team actually lives in","icon":"lucide:calendar","text":"out","mark":True}]),

 # Second movement of the SAME picture: the limitation landed, now the crossing.
 # Split out of s02b because 54s on one still picture earns a scene ceiling of 34s —
 # and because the payoff reads better when the viewer has sat with the problem first.
 dict(id="s02c", type="MCP_REACH", transition="push", background="zoneA", key="mcpReach",
  headline="The one thing [that crosses]", color="green", caption="your code, in the middle",
  premise="Same line, same three things. The only difference is that your code is now standing in the gap.",
  ends=["CLAUDE","YOUR MACHINE"], durationFrames=880,
  narration=
  "So how does any AI app you have ever used actually do anything? "
  "^Your code does it. Claude replies in ordinary text saying what it wants, and your code — which lives on your "
  "side of the line — goes and does the work, then hands the result back. "
  "^Your files, ^your database, ^your calendar: all reachable now, but only ever through you. "
  "That is the whole trick, and every tool, every integration, every agent you have used works exactly this way. "
  "And MCP, the entire subject of this course, is nothing more than an agreed way of describing what sits on your "
  "side of that line, so that Claude can ask for it by name.",
  cells=[{"label":"your code","sub":"the one thing standing on both sides","icon":"lucide:terminal","text":"bridge","mark":True},
         {"label":"your files","sub":"read and written by you, on request","icon":"lucide:folder","text":"out","mark":True},
         {"label":"your database","sub":"queried by you, never by Claude","icon":"lucide:database","text":"out","mark":True},
         {"label":"your calendar, your Slack","sub":"and every check you decide to run first","icon":"lucide:calendar","text":"out","mark":True}]),

 dict(id="s03", type="MCP_API_ANATOMY", transition="wipe", background="zoneC", key="mcpApi",
  headline="The call, [taken apart]", color="purple", caption="one API call",
  codeTitle="first_call.py", premise=PREM, durationFrames=900,
  narration=
  "So here is how you send that text. It is one function call, and this is all of it. |You import the client and create it, and it quietly reads your key "
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
  "Three things to carry forward. %Claude runs on Anthropic's machines and cannot reach anything on yours. "
  "%Your code is the only thing standing on both sides of that line. "
  "%And the call that talks to it takes a model, a ceiling, the conversation — and a list of tools, "
  "which is the argument MCP exists to fill.",
  data={"heading":"Chapter one, in three lines","points":[
    {"text":"Claude cannot reach your machine"},{"text":"your code is the only crossing"},{"text":"tools= is the hole MCP fills"}]},
  anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

 dict(id="s07", type="OUTRO_CTA", transition="fade", background="zoneA", durationFrames=300, narration=
  "Not using Claude? The same ideas hold — every major model has an equivalent call, and MCP itself "
  "is model agnostic. Next chapter: what MCP actually is, and why it exists at all.",
  data={"message":"Next: what MCP actually is","sub":"and the problem it solves"}, anchors=[]),
 ]}
json.dump(T, open('/Users/santhu/iauteur/briefs/mcp/ep00.json','w'), indent=1)
print("EP00:", len(T["scenes"]), "scenes")
