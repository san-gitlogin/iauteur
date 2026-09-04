#!/usr/bin/env node
// GEN — demos/mcp-official.json
//
// THE MAINTAINERS' OWN PAGES, ON SCREEN.
//
// Owner: *"you must also credit the library. If they have official git make sure to address
// in our video and ask users to look into documentation or the github page etc."*
//
// LAW 0f: recording our own terminal is a demonstration; recording somebody else's page is a
// QUOTATION, and a quotation carries its attribution on screen for the whole beat. So the
// protocol's own site and the SDK's own repository both appear, each with a sourceNote, and
// the outro sends people to them by name.
//
// The MCP Inspector beat is here too rather than in the VS Code take: `mcp dev` opens a web
// UI on 127.0.0.1:6274, which is a browser surface. Its URL carries a local auth token —
// the capture records the VIEWPORT only, never the address bar, so the token is never on
// screen (LAW 0m.3: no token-shaped string, ever).
import fs from 'node:fs';

const COOKIES = ['Reject all', 'Reject all cookies', 'Accept all cookies', 'Accept all',
                 'Accept', 'Got it', 'I accept', 'Decline', 'Close', 'Dismiss'];

const demo = {
  slug: 'mcp-official',
  surface: 'browser',
  theme: 'dark',
  viewport: {width: 1600, height: 900},
  // Lay out at the width these sites design for, render at 3200x1800, downscale with
  // lanczos — a supersample rather than the 1.2x upscale that reads as a soft window.
  deviceScaleFactor: 2,
  fps: 30,
  prep: {url: 'https://modelcontextprotocol.io', dismiss: COOKIES},
  steps: [
    {id: 'site', action: 'expect', text: 'Model Context Protocol',
     label: 'the protocol’s own site', holdMs: 3000,
     marks: [{id: 'name', text: 'Model Context Protocol'}]},
    {id: 'intro', action: 'goto',
     url: 'https://modelcontextprotocol.io/docs/getting-started/intro',
     dismiss: COOKIES, settleMs: 3000, holdMs: 3200,
     label: 'what it is, in their words'},

    {id: 'repo', action: 'goto', url: 'https://github.com/modelcontextprotocol/python-sdk',
     dismiss: COOKIES, settleMs: 3500, holdMs: 3200,
     label: 'the official Python SDK',
     marks: [{id: 'repo', text: 'python-sdk'}]},
    {id: 'about', action: 'scroll', target: 'text=The official Python SDK', by: 300,
     label: 'their own description of it', holdMs: 3200, settleMs: 1200,
     marks: [{id: 'official', text: 'The official Python SDK'}]},
  ],
};

fs.writeFileSync('demos/mcp-official.json', JSON.stringify(demo, null, 2) + '\n');
console.log(`wrote demos/mcp-official.json — ${demo.steps.length} steps`);
