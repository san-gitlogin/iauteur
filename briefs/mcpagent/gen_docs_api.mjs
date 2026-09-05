#!/usr/bin/env node
// THE SERVICE, PROVEN IN A BROWSER — demos/mcp-docs.json
//
// Owner, 2026-09-05: *"I need you to show if the api server is running, how it is run, how
// it is served. Open the /docs of the server and show example api calls actually being made
// and how response comes back."*
//
// FastAPI ships Swagger UI at /docs for free, which is the perfect beat for this: the
// viewer sees the routes they just typed, presses Execute, and watches a real response come
// back with a real status code. It also pays off the "slash checkout is deliberately awful"
// setup — Execute it and a 500 arrives, on camera, from their own code.
//
// The server must already be listening on 127.0.0.1:8000 when this records. It is started
// from /tmp/mcp-build (the same project the VS Code take builds) and stopped afterwards.
import fs from 'node:fs';

const API = 'http://127.0.0.1:8000';
// Swagger UI ids are derived from method + path, with non-alphanumerics turned into dashes.
const op = (id) => `#operations-default-${id}`;

// SELECTORS, PROBED AGAINST THE LIVE PAGE RATHER THAN GUESSED.
//   · `.response-col_status` matches the TABLE HEADER first ("Code"), so an expect on it
//     records the word "Code" and proves nothing.
//   · `.live-responses-table .microlight` is the body Swagger actually received — probed
//     and confirmed to read {"id": "SO-1003", … "status": "lost_in_transit"}.
// And every Execute is followed by a SCROLL: the response renders below the fold, so
// without one the camera sits on the request form while the answer is off screen.
const body = (id) => `${op(id)} .live-responses-table .microlight`;
const table = (id) => `${op(id)} .live-responses-table`;

const demo = {
  slug: 'mcp-docs',
  surface: 'browser',
  theme: 'dark',
  viewport: {width: 1600, height: 900},
  deviceScaleFactor: 2,
  fps: 30,
  prep: {url: `${API}/docs`, settleMs: 2500},
  steps: [
    {id: 'docs', action: 'expect', text: 'FastAPI', label: 'the docs page FastAPI built',
     holdMs: 3000, marks: [{id: 'title', text: 'FastAPI'}]},
    {id: 'routes', action: 'expect', target: '#operations-default-list_orders_orders_get',
     label: 'the three routes we typed', holdMs: 3000},

    // ── LIST THE ORDERS ────────────────────────────────────────────────────────
    {id: 'openlist', action: 'click', target: `${op('list_orders_orders_get')} .opblock-summary`,
     label: 'open GET /orders', holdMs: 1800, settleMs: 1100},
    {id: 'tryit', action: 'click', target: `${op('list_orders_orders_get')} button.try-out__btn`,
     label: 'try it out', holdMs: 1600, settleMs: 900},
    {id: 'exec', action: 'click', target: `${op('list_orders_orders_get')} button.execute`,
     label: 'send a real request', holdMs: 1800, settleMs: 2200},
    {id: 'scrollresp', action: 'scroll', target: table('list_orders_orders_get'),
     label: 'down to the answer', holdMs: 900},
    {id: 'resp', action: 'expect', target: body('list_orders_orders_get'),
     label: 'three orders, straight from your code', holdMs: 4200,
     marks: [{id: 'json', text: 'SO-1001'}]},
    {id: 'closelist', action: 'click', target: `${op('list_orders_orders_get')} .opblock-summary`,
     label: 'close it again', holdMs: 900, settleMs: 800},

    // ── ONE ORDER, THE ONE THAT IS LOST ────────────────────────────────────────
    {id: 'openone', action: 'click',
     target: `${op('get_order_orders__order_id__get')} .opblock-summary`,
     label: 'open GET /orders/{order_id}', holdMs: 1700, settleMs: 1100},
    {id: 'tryone', action: 'click',
     target: `${op('get_order_orders__order_id__get')} button.try-out__btn`,
     label: 'try it out', holdMs: 1400, settleMs: 800},
    {id: 'fillid', action: 'fill',
     target: `${op('get_order_orders__order_id__get')} tr[data-param-name="order_id"] input`,
     value: 'SO-1003', label: 'the order id goes in', holdMs: 2000, typeDelay: 95},
    {id: 'execone', action: 'click',
     target: `${op('get_order_orders__order_id__get')} button.execute`,
     label: 'ask for that one order', holdMs: 1800, settleMs: 2000},
    {id: 'scrollone', action: 'scroll', target: table('get_order_orders__order_id__get'),
     label: 'down to the answer', holdMs: 900},
    {id: 'lost', action: 'expect', target: body('get_order_orders__order_id__get'),
     label: 'lost in transit — the row from api.py', holdMs: 4600,
     marks: [{id: 'status', text: 'lost_in_transit'}]},
    {id: 'closeone', action: 'click',
     target: `${op('get_order_orders__order_id__get')} .opblock-summary`,
     label: 'close it again', holdMs: 900, settleMs: 800},

    // ── THE ROUTE THAT FAILS ON PURPOSE ────────────────────────────────────────
    {id: 'opencheckout', action: 'click', target: `${op('checkout_checkout_post')} .opblock-summary`,
     label: 'open POST /checkout', holdMs: 1700, settleMs: 1100},
    {id: 'trycheckout', action: 'click', target: `${op('checkout_checkout_post')} button.try-out__btn`,
     label: 'try it out', holdMs: 1400, settleMs: 800},
    {id: 'execcheckout', action: 'click', target: `${op('checkout_checkout_post')} button.execute`,
     label: 'the slow one, live', holdMs: 3600, settleMs: 3400},
    {id: 'scrollcheckout', action: 'scroll', target: table('checkout_checkout_post'),
     label: 'down to the answer', holdMs: 900},
    {id: 'checkoutresp', action: 'expect', target: table('checkout_checkout_post'),
     label: 'whatever it gave us this time', holdMs: 4600},
  ],
};

fs.writeFileSync('demos/mcp-docs.json', JSON.stringify(demo, null, 2) + '\n');
console.log(`wrote demos/mcp-docs.json — ${demo.steps.length} steps`);
