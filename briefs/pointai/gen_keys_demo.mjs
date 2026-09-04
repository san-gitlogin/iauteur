#!/usr/bin/env node
// GEN — demos/where-keys-come-from.json
//
// WHERE THE THREE SETTINGS COME FROM, ON EACH PROVIDER'S OWN PAGE.
//
// Owner, on the first cut: *"I see you did not show azure openai website, and you also
// forgot the main where you didnt show claude or openai. You were not beginner friendly
// in showing how to get the api key and the url and the model."* And: *"when you are
// showing the webpages, you need to make sure that what you are speaking about is visible
// to the user and not blocked by the component overlay. you speak about gemini where what
// you speak about is at the bottom."*
//
// So every provider gets TWO steps: the page, then a SCROLL that puts the paragraph the
// narration is about at 28% from the top — high enough to read, clear of the caption strip
// along the bottom, and clear of the card parked on the right. The scroll targets are the
// pages' own headings, so a re-record lands on the same words rather than the same pixels.
import fs from 'node:fs';

const COOKIES = ['Reject all', 'Reject all cookies', 'Accept all cookies', 'Accept all',
                 'Accept', 'Got it', 'I accept', 'Decline', 'Close'];

const demo = {
  slug: 'where-keys-come-from',
  surface: 'browser',
  theme: 'dark',
  viewport: {width: 1600, height: 900},
  // Lay out at the width these sites design for, render at 3200x1800, downscale to 1920
  // with lanczos — a supersample rather than the 1.2x upscale that read as soft before.
  deviceScaleFactor: 2,
  fps: 30,
  prep: {url: 'https://ollama.com', dismiss: COOKIES},
  steps: [
    // MORE MARKS THAN CALLOUTS NEED. A mark is a measured rectangle, and the camera
    // moves to marks — so a page the narration reads DOWN needs somewhere to look at
    // each paragraph, or the beat is a static screenshot held for a minute.
    {id: 'ollama', action: 'expect', text: 'Ollama',
     label: 'runs on your own machine', holdMs: 2600,
     marks: [{id: 'run', text: 'Run open models'}, {id: 'dl', text: 'Download'}]},
    {id: 'ollamawho', action: 'scroll', target: 'text=Trusted by', by: 620,
     label: 'who runs models locally', holdMs: 3000,
     marks: [{id: 'trusted', text: 'Trusted by'}]},

    // ── OPENAI ────────────────────────────────────────────────────────────────
    {id: 'openai', action: 'goto', url: 'https://platform.openai.com/docs/quickstart',
     dismiss: COOKIES, settleMs: 3500, holdMs: 2600,
     label: "OpenAI's own quickstart",
     marks: [{id: 'title', text: 'Developer quickstart'}]},
    {id: 'openaikey', action: 'scroll', target: 'text=OPENAI_API_KEY', by: 900,
     label: 'the key, and the name it goes under', holdMs: 3400, settleMs: 1200,
     marks: [{id: 'envname', text: 'OPENAI_API_KEY'},
             {id: 'heading', text: 'Create and export an API key'},
             {id: 'button', text: 'Create an API Key'}]},

    // ── ANTHROPIC ─────────────────────────────────────────────────────────────
    {id: 'claude', action: 'goto', url: 'https://docs.claude.com/en/docs/get-started',
     dismiss: COOKIES, settleMs: 3500, holdMs: 2600,
     label: "Anthropic's own get-started",
     marks: [{id: 'title', text: 'Get started with Claude'}]},
    {id: 'claudekey', action: 'scroll', target: 'text=Set your API key', by: 900,
     label: 'same three settings, different names', holdMs: 3400, settleMs: 1200,
     marks: [{id: 'setkey', text: 'Set your API key'},
             {id: 'envname', text: 'ANTHROPIC_API_KEY'},
             {id: 'getkey', text: 'Get your API key'}]},

    // ── AZURE OPENAI ──────────────────────────────────────────────────────────
    {id: 'azure', action: 'goto',
     url: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/quickstart',
     dismiss: COOKIES, settleMs: 3500, holdMs: 2600,
     label: "Microsoft's own Azure OpenAI quickstart",
     marks: [{id: 'title', text: 'Azure OpenAI'}]},
    {id: 'azurekey', action: 'scroll', target: 'text=AZURE_OPENAI_API_KEY', by: 1400,
     label: 'endpoint, key, and deployment name', holdMs: 3800, settleMs: 1200,
     marks: [{id: 'envname', text: 'AZURE_OPENAI_API_KEY'},
             {id: 'deployed', text: 'A deployed Azure OpenAI model'},
             {id: 'authmethod', text: 'An authentication method'}]},

    // ── GOOGLE ────────────────────────────────────────────────────────────────
    {id: 'gemini', action: 'goto', url: 'https://ai.google.dev/gemini-api/docs/pricing',
     dismiss: COOKIES, settleMs: 3000, holdMs: 2600,
     label: "Google's own pricing page",
     marks: [{id: 'title', text: 'Gemini Developer API pricing'}]},
    // THE LINE THE BEAT IS ABOUT, PUT WHERE IT CAN BE READ. Last time this scrolled a
    // flat 700px and the sentence about what happens to your content ended up along the
    // bottom edge, under the caption.
    {id: 'geminidata', action: 'scroll', target: 'text=improve our products', by: 900,
     label: 'what the free tier does with your content', holdMs: 3800, settleMs: 1200,
     marks: [{id: 'improve', text: 'Content used to improve our products'},
             {id: 'free', text: 'Free'}, {id: 'paid', text: 'Paid'}]},

    // ── GROQ ──────────────────────────────────────────────────────────────────
    {id: 'groq', action: 'goto', url: 'https://console.groq.com/docs/rate-limits',
     dismiss: COOKIES, settleMs: 3000, holdMs: 3000,
     label: 'limits instead of a bill',
     marks: [{id: 'limits', text: 'Rate Limits'}]},
  ],
};

fs.writeFileSync('demos/where-keys-come-from.json', JSON.stringify(demo, null, 2) + '\n');
console.log(`wrote demos/where-keys-come-from.json — ${demo.steps.length} steps`);
