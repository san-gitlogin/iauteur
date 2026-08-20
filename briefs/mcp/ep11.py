# -*- coding: utf-8 -*-
# EP11 — Elicitation. Absent from the source course entirely, and it is now the
# headline client feature. API verified against the live Python SDK source:
# Context.elicit(message, schema) and Context.elicit_url(message, url, elicitation_id).
import json
BRAND = {"theme":"moderndark","design":"moderndark","themeLight":"daylight","background":"grid",
         "channel":"THE NBX STUDIO","logo":"img:channel_logo.png"}
SRC = ["MCP specification 2026-07-28: https://modelcontextprotocol.io/specification/2026-07-28/client/elicitation",
       "Python SDK: https://github.com/modelcontextprotocol/python-sdk",
       "Course source: https://github.com/san-gitlogin/learn-mcp"]
def L(t, det=None):
    d={"text":t}
    if det: d["detail"]=det; d["teach"]=True
    return d
PREM = "The tool is halfway through and needs something only the person can supply. Elicitation is how it asks."

T = {
 "meta":{"topic":"Elicitation","format":"long","fps":30,"screenplay":"explainer",
  "onePayoff":"A tool can stop mid-run and ask the user a question — and for anything sensitive it must hand off to a browser instead.",
  "openLoop":"Your tool needs the user's API key. Asking for it in the chat is forbidden. So how?",
  "analogy":"THE FORM AND THE SIDE DOOR - one asks in the room, one sends you out of it.",
  "topicAxes":["entity-novelty","sovereignty"],
  "seo":{"title":"MCP Elicitation — How A Tool Asks The User Mid-Run",
   "altTitles":["The MCP Feature That Replaced Sampling And Roots",
                "Form Mode vs URL Mode: Never Ask For A Key In Chat"],
   "hook":"Your tool needs an API key. Asking in the chat is forbidden.",
   "breakdown":"elicitation's two modes, why URL mode exists as a security boundary, and the three-action result every server must handle",
   "chapters":[{"id":"s01","title":"Asking mid-run"},
               {"id":"s03","title":"Form mode"},
               {"id":"s04","title":"URL mode, and why"},
               {"id":"s05","title":"Accept, decline, cancel"}],
   "sources":SRC,
   "queries":["mcp elicitation","elicitation/create","ctx.elicit python","mcp url mode elicitation",
     "mcp ask user input","mcp form mode schema","mcp elicitation security"],
   "hashtags":["#mcp","#claude","#anthropic","#python","#thenbxstudio"],
   "tags":["mcp","model context protocol","elicitation","claude","anthropic","python","security",
     "oauth","tutorial","the nbx studio"]}},
 "brand":BRAND,
 "thumbnail":{"title":"NEVER ASK IN CHAT","badge":"Elicitation","asset":"si:anthropic"},
 "scenes":[
  dict(id="s01", type="HOOK", background="zoneA", durationFrames=235, narration=
   "Your tool is halfway through and needs the user's API key. Asking for it in the chat is forbidden. So how?",
   data={"headline":"NEVER ASK IN CHAT","subtext":"elicitation, both modes","heroAsset":"si:anthropic",
         "headlineAtWord":1,"heroAtWord":12}, anchors=["headlineAtWord","heroAtWord"]),

  dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB", durationFrames=340, narration=
   "Sampling let a server borrow the client's model. Elicitation lets a server borrow the client's user — "
   "and unlike sampling, this one is current, not deprecated. Learn MCP, on THE NBX STUDIO.",
   data={"title":"ELICITATION","subtitle":"chapter twelve of thirteen"}, anchors=[]),

  dict(id="s03", type="MCP_ELICIT", transition="wipe", background="zoneC", key="mcpElicit",
   headline="Form mode, [with a schema]", color="green", caption="asking in the room",
   codeTitle="server.py", premise=PREM, durationFrames=960,
   narration=
   "Form mode is the ordinary case. Your tool stops, describes what it needs, and hands over a schema. "
   "|C t x dot elicit takes a message the person will read, and a Pydantic model describing the shape of the "
   "answer, ^so the client can render a real form with a labelled field rather than guessing from prose. "
   "The schema is deliberately restricted to flat, primitive fields — strings, numbers, booleans, enums — "
   "because every client has to be able to draw it, and nobody can draw an arbitrary nested object well. "
   "^A string field with a title and a description becomes a labelled text input. "
   "^An enum becomes a picker. "
   "|And what comes back carries an action, which is the part people forget to handle.",
   lines=[L("class RepoChoice(BaseModel):"),
          L("    repo: str = Field(description=\"Which repository?\")"),
          L(""),
          L("@mcp.tool()"),
          L("async def open_pr(title: str, ctx: Context):"),
          L("    result = await ctx.elicit(","A message for the person, and a schema."),
          L("        message=\"Which repo should this PR open against?\","),
          L("        schema=RepoChoice,"),
          L("    )"),
          L("    if result.action != \"accept\":","Always check the action first."),
          L("        return \"Cancelled.\"")],
   cells=[{"label":"repo","sub":"string · Which repository?","mark":True,"out":["octocat/hello"]},
          {"label":"visibility","sub":"enum · public or private","mark":True,"out":["private"]}]),

  dict(id="s04", type="MCP_ELICIT", transition="push", background="zoneA", key="mcpElicit",
   headline="URL mode is a [boundary]", color="orange", caption="sending them out of the room",
   codeTitle="server.py", premise="Form mode data passes through the client. URL mode data never does. That difference is the whole reason URL mode exists.",
   durationFrames=980,
   narration=
   "Now the important one, and it's a rule rather than a preference. "
   "The specification says servers must not use form mode to ask for passwords, API keys, access tokens or "
   "payment details. Must not — because anything typed into a form travels back through the client, and "
   "through whatever is logging there. "
   "^For those, you use URL mode: your tool returns a link, the person opens it in a real browser, and the "
   "secret goes straight from them to you without ever crossing the client or the model's context. "
   "|C t x dot elicit url takes the message, the U R L, and an id you use to track that particular hand-off. "
   "|When the out-of-band part finishes, you tell the client with send elicit complete. "
   "^And the client's answer only says the person consented to open the link — not that they finished, "
   "which is why the id matters and why your server has to track the state itself. "
   "This is also how third-party OAuth works in MCP: the server acts as an OAuth client, and the tokens it "
   "gets never touch the MCP client at all.",
   lines=[L("@mcp.tool()"),
          L("async def connect_stripe(ctx: Context):"),
          L("    result = await ctx.elicit_url(","Message, URL, and an id to track it."),
          L("        message=\"Connect your Stripe account to continue.\","),
          L("        url=\"https://mcp.example.com/connect/stripe\","),
          L("        elicitation_id=\"stripe-42\","),
          L("    )"),
          L("    # ... user completes it out of band ..."),
          L("    await ctx.session.send_elicit_complete(\"stripe-42\")","Tell the client the hand-off finished.")],
   cells=[{"label":"https://mcp.example.com/connect/stripe","text":"url","mark":True,
           "sub":"opens in a real browser · the secret never reaches the client or the model"}]),

  dict(id="s05", type="MCP_ELICIT", transition="fade", background="zoneC", key="mcpElicit",
   headline="Three answers, [not two]", color="green", caption="the result model",
   codeTitle="server.py", premise=PREM, durationFrames=880,
   narration=
   "Every elicitation can end three ways, and treating it as a boolean is the bug people ship. "
   "^Accept means the person filled it in and submitted, and only then does result dot data hold anything. "
   "^Decline means they explicitly said no — they saw the request and refused it. "
   "^And cancel means they dismissed it: closed the dialog, pressed escape, clicked away. "
   "Those last two are genuinely different, and the difference matters. A decline is an answer, so offering "
   "an alternative is reasonable. A cancel is not an answer, so asking again later is reasonable. "
   "|Handle all three explicitly, ^because a tool that treats a dismissed dialog as a no will quietly stop "
   "offering something the person actually wanted.",
   lines=[L("match result.action:"),
          L("    case \"accept\":"),
          L("        repo = result.data.repo"),
          L("    case \"decline\":"),
          L("        return \"No problem — want me to use the default instead?\""),
          L("    case \"cancel\":","Dismissed is not the same as refused."),
          L("        return \"I'll ask again when you're ready.\"")],
   cells=[{"label":"accept","sub":"submitted — result.data is populated","mark":True},
          {"label":"decline","sub":"explicitly refused — offer an alternative","mark":True},
          {"label":"cancel","sub":"dismissed — ask again later","mark":True},
          {"label":"handled","sub":"accept","mark":True}]),

  dict(id="s06", type="QUIZ_CARD", transition="iris", background="zoneC", durationFrames=840, narration=
   "^One to check you've got the rule. Your tool needs the user's Stripe secret key. Which mode? "
   "^Form mode, with a string field marked secret. ^Or URL mode, sending them to a page you host. "
   "Have a think, and pause if you'd like a moment. "
   "^Ready? URL mode, and it isn't a style choice — the spec says servers must not request credentials "
   "through form mode, because that data passes through the client on its way back to you.",
   data={"quiz":{"question":"A tool needs the user's secret key. Which mode?",
     "options":[{"text":"form mode, marked secret"},{"text":"URL mode"}],
     "answerIndex":1,"why":"The spec forbids credentials in form mode — that data crosses the client."}},
   anchors=["quiz.atWord","quiz.options.0.atWord","quiz.options.1.atWord","quiz.revealAtWord"]),

  dict(id="s07", type="RECAP", transition="dip", background="zoneB", durationFrames=440, narration=
   "Three lines. %Form mode asks in the room, against a flat schema. "
   "%URL mode sends them out of the room, and is mandatory for anything secret. "
   "%And every answer is accept, decline or cancel — three, never two.",
   data={"heading":"Elicitation, in three lines","points":[
     {"text":"Form mode — a flat schema, in the room"},
     {"text":"URL mode — mandatory for secrets"},
     {"text":"accept · decline · cancel"}]},
   anchors=["points.0.atWord","points.1.atWord","points.2.atWord"]),

  dict(id="s08", type="OUTRO_CTA", transition="fade", background="zoneA", durationFrames=300, narration=
   "One chapter left, where we put the whole protocol back together — and sort what's current from what's on its way out.",
   data={"message":"Next: everything, together","sub":"and what changed"}, anchors=[]),
 ]}
json.dump(T, open('/Users/santhu/iauteur/briefs/mcp/ep11.json','w'), indent=1)
print("EP11:", len(T["scenes"]), "scenes")
