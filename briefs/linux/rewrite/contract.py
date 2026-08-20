# -*- coding: utf-8 -*-
"""Marker-safe contraction pass over the narration table.

Safe because the `|^@~` markers live ON the token, so contracting a pair only ever
merges the SECOND token away; the first keeps its sigil and every index is recomputed
by the builder afterwards.

Guarded because the last pass shipped three ungrammatical lines — "Lost track of
where you're?" — by contracting a verb that ENDS its clause. A token carrying
punctuation is therefore never eligible as the second half of a pair.
"""
import json, re, sys

PAIRS = {
    ('it','is'):"it's", ('that','is'):"that's", ('there','is'):"there's", ('here','is'):"here's",
    ('what','is'):"what's", ('who','is'):"who's", ('he','is'):"he's", ('she','is'):"she's",
    ('you','are'):"you're", ('they','are'):"they're", ('we','are'):"we're",
    ('you','will'):"you'll", ('it','will'):"it'll", ('we','will'):"we'll", ('they','will'):"they'll",
    ('you','have'):"you've", ('we','have'):"we've", ('they','have'):"they've", ('i','have'):"I've",
    ('you','would'):"you'd", ('it','would'):"it'd",
    ('do','not'):"don't", ('does','not'):"doesn't", ('did','not'):"didn't",
    ('is','not'):"isn't", ('are','not'):"aren't", ('was','not'):"wasn't", ('were','not'):"weren't",
    ('will','not'):"won't", ('would','not'):"wouldn't", ('could','not'):"couldn't",
    ('should','not'):"shouldn't", ('have','not'):"haven't", ('has','not'):"hasn't",
    ('had','not'):"hadn't", ('can','not'):"can't", ('let','us'):"let's",
}
SIG = '|^@~'
PUNCT = re.compile(r'[.,;:?!]')

def contract(text):
    toks = text.split(' ')
    out, i, n = [], 0, 0
    while i < len(toks):
        a = toks[i]
        b = toks[i+1] if i+1 < len(toks) else None
        sig = a[0] if a and a[0] in SIG else ''
        aw = (a[len(sig):] if sig else a)
        if b is not None and not PUNCT.search(aw) and b[0] not in SIG and not PUNCT.search(b):
            key = (aw.lower(), b.lower())
            if key in PAIRS:
                rep = PAIRS[key]
                if aw[0].isupper() and not rep.startswith('I'):
                    rep = rep[0].upper() + rep[1:]
                out.append(sig + rep); i += 2; n += 1
                continue
        # "cannot" is one word already
        if aw.lower() == 'cannot':
            rep = "can't"
            if aw[0].isupper(): rep = "Can't"
            out.append(sig + rep); i += 1; n += 1
            continue
        out.append(a); i += 1
    return ' '.join(out), n

t = json.load(open('briefs/linux/table.json'))
total = 0
for row in t:
    row['narration'], k = contract(row['narration'])
    total += k
json.dump(t, open('briefs/linux/table.json','w'), indent=1)
print(f"{total} contractions applied")
