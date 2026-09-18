// PROBE — one call to Jev through Vercel AI Gateway, with the clock running.
//
//   export AI_GATEWAY_API_KEY="..."      (never committed, never printed)
//   node probe.mjs
//
// Prints the three answer shapes the video teaches (choice / score / boolean),
// the token usage, and the wall-clock time. Nothing here is video content yet —
// this exists to prove the route works before we build anything on it.
import { experimental_evaluate as evaluate } from 'ai';

if (!process.env.AI_GATEWAY_API_KEY) {
  console.error('AI_GATEWAY_API_KEY is not set in this shell. See step 1 of briefs/jev/PLAN.md.');
  process.exit(2);
}

const state =
  "Hi, I've been trying to connect my Stripe account for three days and it keeps failing. " +
  "I'm losing sales. Please help ASAP.";

const questions = {
  department: {
    type: 'choice',
    instructions: 'Which team should handle this?',
    criteria: {
      billing: 'payment or subscription problems',
      technical: 'bugs or integration problems',
      sales: 'pricing or account questions',
    },
  },
  frustration: {
    type: 'score',
    instructions: 'How frustrated does the customer sound?',
    criteria: ['calm, just stating facts', 'frustrated but civil', 'very angry, strong language'],
  },
  is_urgent: {
    type: 'boolean',
    instructions: 'The message conveys urgency or time-sensitivity.',
  },
};

const t0 = performance.now();
let result;
try {
  result = await evaluate({ model: 'typesafe-ai/jev', state, questions });
} catch (err) {
  console.error('\nThe call failed. What the gateway said:\n');
  console.error(`  ${err?.name ?? 'Error'}: ${err?.message ?? err}`);
  if (err?.statusCode) console.error(`  HTTP ${err.statusCode}`);
  process.exit(1);
}
const ms = Math.round(performance.now() - t0);

console.log('\n  model      typesafe-ai/jev  (via Vercel AI Gateway)');
console.log(`  wall clock ${ms} ms   — model time plus the round trip from here\n`);
console.log(JSON.stringify(result.answers, null, 2));
console.log('\n  usage:', JSON.stringify(result.usage));
