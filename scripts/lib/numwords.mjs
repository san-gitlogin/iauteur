// numwords.mjs — THE SCREEN PRINTS A FIGURE; THE VOICE SPELLS IT OUT.
//
// Paid for on the Claude Opus 5.5 cut (2026-09-23): a camera move framed the mark `66.4%` on
// the exact word the narration says it — "Sixty-six point four" — and check-camera reported
// *"nothing the camera frames is being said"*, because its tokeniser split `66.4%` into `66`
// and `4`, dropped both for being shorter than three characters, and had no way to reach
// "sixty-six point four" from either end. The move was right and the gate was wrong, which is
// the worst kind: it teaches an author to stop believing the gate.
//
// Both gates already normalise the other half of this problem — `UNIT` maps `gb` to
// "gigabyte" so the screen's abbreviation meets the voice's word. A figure is the same case,
// so it gets the same treatment rather than a special case at one call site: this collapses
// runs of spoken number words into the digits the screen shows, and the callers stop
// discarding short NUMERIC tokens.
//
// Deliberately small. It covers what a presenter actually says about a benchmark or a price —
// "sixty-six point four", "forty-one point four", "twenty-eight", "five ninety-eight" — and
// does not attempt ordinals, fractions or years. Anything it cannot fold is left untouched,
// so a sentence it does not understand is no worse off than before.

const SMALL = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19,
};
const TENS = {twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90};

/**
 * Fold spoken number words into digits.
 *   "sixty-six point four percent" -> "66.4 percent"
 *   "three hundred and twenty-eight lines" -> "328 lines"
 *   "five ninety-eight" -> "5 98"   (two figures, which is how it is said)
 */
export const foldNumbers = (text) => {
  // A hyphen inside a spoken number is a join, not a separator: "sixty-six" is one figure.
  const src = String(text ?? '').replace(/\b([a-z]+)-([a-z]+)\b/gi, (m, a, b) =>
    (TENS[a.toLowerCase()] != null && SMALL[b.toLowerCase()] != null) ? `${a} ${b}` : m);
  // Matching is done on tokens, so original spacing is not preserved — only the words are.
  const words = src.split(/\s+/).filter(Boolean);
  const bare = (w) => w.toLowerCase().replace(/[^a-z]/g, '');
  const tail = (w) => w.match(/[^A-Za-z0-9]+$/)?.[0] ?? '';
  const out = [];
  let i = 0;
  while (i < words.length) {
    let total = 0, part = 0, seen = false, last = -1;
    for (; i < words.length; i++) {
      const w = bare(words[i]);
      if (SMALL[w] != null) {
        // "five ninety-eight" is two figures said in a row, not 5 + 98 — a second unit landing
        // on a part that already has units ends the run instead of adding to it.
        if (seen && part % 10 !== 0) break;
        part += SMALL[w];
      } else if (TENS[w] != null) {
        if (seen && part !== 0) break;
        part += TENS[w];
      } else if (w === 'hundred' && seen) {
        total += (part || 1) * 100; part = 0;
      } else if (w === 'thousand' && seen) {
        total = (total + (part || 1)) * 1000; part = 0;
      } else if (w === 'and' && seen && part === 0 && total) {
        continue;                       // "three hundred and twenty-eight"
      } else break;
      seen = true; last = i;
    }
    if (!seen) { out.push(words[i]); i += 1; continue; }
    total += part;
    // an optional decimal tail: "point four", "point six five"
    let dec = '';
    if (i < words.length && bare(words[i]) === 'point') {
      const digits = [];
      let k = i + 1;
      for (; k < words.length; k++) {
        const w = bare(words[k]);
        if (SMALL[w] != null && SMALL[w] < 10) { digits.push(SMALL[w]); last = k; } else break;
      }
      if (digits.length) { dec = '.' + digits.join(''); i = k; }
    }
    out.push(`${total}${dec}${tail(words[last])}`);
  }
  return out.join(' ');
};
