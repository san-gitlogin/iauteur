# -*- coding: utf-8 -*-
# EP02 — The three primitives. The whole lesson is WHO IS IN CONTROL, so control is
# the visual variable (MCP_CONTROL stamps every lane with who pulls the trigger).
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
PREM = "One server, three kinds of thing it can expose. The only question that separates them is who decides when it runs."

T = {
 "meta":{"topic":"The Three Primitives","format":"long","fps":30,"screenplay":"explainer",
  "onePayoff":"Tools, resources and prompts differ by one thing only — who pulls the trigger.",
  "openLoop":"Three words that look interchangeable. Pick the wrong one and your feature fights you forever.",
  "analogy":"THE RESTAURANT - the kitchen, the menu board, and the chef's special button.",
  "topicAxes":["entity-novelty","tribal-conflict"],
  "seo":{"title":"Tools vs Resources vs Prompts — The Only Question That Matters",
   "altTitles":["MCP's 3 Primitives, Settled With One Question",
                "Stop Guessing: Tool, Resource, or Prompt?"],
   "hook":"Three words that look interchangeable. One question separates them.",
   "breakdown":"the three things an MCP server can expose, and the single question that tells you which one you need",
   "chapters":[{"id":"s01","title":"Three words, one question"},
               {"id":"s03","title":"Who pulls the trigger"},
               {"id":"s04","title":"The restaurant"},
               {"id":"s06","title":"Two scenarios to try"}],
   "sources":SRC,
   "queries":["mcp tools vs resources","mcp prompts explained","what is an mcp resource",
     "mcp primitives","when to use mcp tool or resource","model context protocol tools"],
   "hashtags":["#mcp","#claude","#anthropic","#ai","#thenbxstudio"],
   "tags":["mcp","model context protocol","tools","resources","prompts","claude","anthropic",
     "ai","python","tutorial","the nbx studio"]}},
 "brand":BRAND,
 "thumbnail":{"title":"WHO PULLS THE TRIGGER?","badge":"3 Primitives","asset":"si:anthropic"},
 "scenes":[
  dict(id="s01", type="HOOK", background="zoneA", durationFrames=230, narration=
   "Tools, resources, prompts. Three words that look interchangeable, and one question tells them apart.",
   data={"headline":"WHO PULLS THE TRIGGER?","subtext":"the three primitives","heroAsset":"si:anthropic",
         "headlineAtWord":1,"heroAtWord":9}, anchors=["headlineAtWord","heroAtWord"]),

  dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", durationFrames=330, narration=
   "Chapter three of Learn MCP on THE NBX STUDIO. Get this one right and the rest of the course is downhill, "
   "because every server you ever build is some mix of these three.",
   data={"title":"THE 3 SUPERPOWERS","subtitle":"chapter three of eleven"}, anchors=[]),

  dict(id="s03", type="MCP_CONTROL", transition="wipe", background="zoneC", key="mcpControl",
   headline="Who pulls [the trigger]", color="blue", caption="the three primitives",
   premise=PREM, durationFrames=880,
   narration=
   "Every MCP server can expose exactly three kinds of thing, and they're told apart by who decides when each one runs. "
   "^A tool is a function Claude chooses to call. Claude reads the description, decides the tool is relevant, and asks for it. "
   "The model is in charge. "
   "^A resource is data your own code fetches, because your app decided it needed context — "
   "a dropdown that needs filling, a file the user just opened. Your code is in charge. "
   "^And a prompt is a workflow the person triggers, typically by typing a slash command. The user is in charge. "
   "Same server, same decorator style, three different owners.",
   cells=[{"label":"Tools","sub":"functions the model chooses to call","owner":"ai","mark":True},
          {"label":"Resources","sub":"data your code fetches for context","owner":"code","mark":True},
          {"label":"Prompts","sub":"workflows the person triggers","owner":"user","mark":True}]),

  dict(id="s04", type="MCP_CONTROL", transition="push", background="zoneA", key="mcpControl",
   headline="The same three, [as a restaurant]", color="green", caption="if the words won't stick",
   premise="A restaurant. The kitchen, the menu board on the wall, and the chef's special button on the counter.",
   durationFrames=760,
   narration=
   "If the abstract version won't stick, here's the same three as a restaurant. "
   "^The kitchen is your tools. An order arrives and the chef decides what to cook — you don't stand there "
   "instructing them, and that's exactly how Claude uses a tool. "
   "^The menu board is your resources. Your app reads the board to show the customer what's available, "
   "and the board doesn't decide anything on its own. "
   "^And the chef's special button is your prompts. Nothing happens until a customer presses it, "
   "and then a carefully designed sequence kicks off. "
   "The golden rule underneath all of that is one sentence: ask yourself who is in control.",
   cells=[{"label":"the kitchen","sub":"the chef decides what to cook → TOOL","owner":"ai","mark":True},
          {"label":"the menu board","sub":"your app reads it to show options → RESOURCE","owner":"code","mark":True},
          {"label":"the chef's special","sub":"the customer presses it → PROMPT","owner":"user","mark":True}]),

  dict(id="s05", type="QUIZ_CARD", transition="iris", background="zoneC", durationFrames=820, narration=
   "^Scenario one, straight from the course. You're building a document editor, and you want a dropdown "
   "listing the available documents so the user can pick one. Which primitive? "
   "^A tool, so Claude fetches the list. ^Or a resource, so your app fetches it. "
   "Have a think, and pause if you'd like a moment. "
   "^Ready? A resource. Your app needs that list to draw its own dropdown, and Claude isn't involved in "
   "drawing a dropdown — so your code is the one deciding, which makes it a resource.",
   data={"quiz":{"question":"A dropdown listing documents. Which primitive?",
     "options":[{"text":"tool — Claude fetches it"},{"text":"resource — your app fetches it"}],
     "answerIndex":1,"why":"Your code needs the list to draw its own UI."}},
   anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.revealAtWord"]),

  dict(id="s06", type="QUIZ_CARD", transition="fade", background="zoneC", durationFrames=800, narration=
   "^Scenario two. A user types slash format, report dot p d f, and a pre-written instruction tells Claude "
   "exactly how to reformat that document. Which primitive? "
   "^A tool. ^Or a prompt. "
   "Have a think, and pause if you'd like. "
   "^Ready? A prompt. The giveaway is the user typed a command — nothing ran until a person triggered it, "
   "and the instruction was written in advance rather than decided by the model.",
   data={"quiz":{"question":"A user types /format report.pdf. Which one?",
     "options":[{"text":"tool"},{"text":"prompt — the user triggered it"}],
     "answerIndex":1,"why":"A person triggered it, and the instruction was pre-written."}},
   anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.revealAtWord"]),

  dict(id="s07", type="RECAP", transition="dip", background="zoneB", durationFrames=420, narration=
   "Three lines. %If Claude decides when it runs, it's a tool. "
   "%If your code decides, it's a resource. "
   "%And if the user decides, it's a prompt. One question, asked every time.",
   data={"heading":"Ask who is in control","points":[
     {"text":"Claude decides → tool"},{"text":"Your code decides → resource"},{"text":"The user decides → prompt"}]},
   anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

  dict(id="s08", type="OUTRO_CTA", transition="fade", background="zoneA", durationFrames=290, narration=
   "Next chapter we stop talking and build a server, and you'll see it's shorter than you expect.",
   data={"message":"Next: build your first server","sub":"it's decorators on functions"}, anchors=[]),
 ]}
write(T, 'mcp/ep02.json')
print("EP02:", len(T["scenes"]), "scenes")
