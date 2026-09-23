"""THE SCREEN (AND WHISPER) PRINT A FIGURE; THE SCRIPT SPELLS IT OUT.

The Python twin of `scripts/lib/numwords.mjs`, and it exists for the same reason at the other
end of the pipeline. `audit-voice.py` compares the written narration with what a transcriber
heard — and faster-whisper writes numbers as DIGITS. So a beat reading "Fifty seconds later,
three hundred and twenty-eight lines" transcribes as "50 seconds later 328 lines", which scored
0.80 against its own script and reported the opening word "fifty" as never spoken. The voice was
perfect; the comparison was not, and a voice gate that cries wolf is one nobody listens to.

Folding both sides into digits makes the comparison about the words that carry meaning. Kept
deliberately small, matching the .mjs version: what a presenter says about a benchmark or a
price, not ordinals, fractions or years. Anything it cannot fold is passed through untouched.
"""
import re

SMALL = {'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7,
         'eight': 8, 'nine': 9, 'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13,
         'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18,
         'nineteen': 19}
TENS = {'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70,
        'eighty': 80, 'ninety': 90}


def fold_numbers(text: str) -> str:
    """"sixty-six point four percent" -> "66.4 percent"; "three hundred and twenty-eight" -> "328"."""
    src = re.sub(r'\b([a-z]+)-([a-z]+)\b',
                 lambda mm: f'{mm.group(1)} {mm.group(2)}'
                 if mm.group(1).lower() in TENS and mm.group(2).lower() in SMALL else mm.group(0),
                 str(text or ''), flags=re.I)
    words = [w for w in src.split() if w]
    bare = lambda w: re.sub(r'[^a-z]', '', w.lower())
    tail = lambda w: (re.search(r'[^A-Za-z0-9]+$', w) or [''])[0] if re.search(r'[^A-Za-z0-9]+$', w) else ''
    out, i = [], 0
    while i < len(words):
        total = part = 0
        seen = False
        last = -1
        while i < len(words):
            w = bare(words[i])
            if w in SMALL:
                # "five ninety-eight" is two figures said in a row, not 5 + 98.
                if seen and part % 10 != 0:
                    break
                part += SMALL[w]
            elif w in TENS:
                if seen and part != 0:
                    break
                part += TENS[w]
            elif w == 'hundred' and seen:
                total += (part or 1) * 100
                part = 0
            elif w == 'thousand' and seen:
                total = (total + (part or 1)) * 1000
                part = 0
            elif w == 'and' and seen and part == 0 and total:
                i += 1
                continue                      # "three hundred and twenty-eight"
            else:
                break
            seen = True
            last = i
            i += 1
        if not seen:
            out.append(words[i])
            i += 1
            continue
        total += part
        dec = ''
        if i < len(words) and bare(words[i]) == 'point':
            digits, k = [], i + 1
            while k < len(words):
                w = bare(words[k])
                if w in SMALL and SMALL[w] < 10:
                    digits.append(str(SMALL[w]))
                    last = k
                    k += 1
                else:
                    break
            if digits:
                dec = '.' + ''.join(digits)
                i = k
        out.append(f'{total}{dec}{tail(words[last])}')
    return ' '.join(out)
