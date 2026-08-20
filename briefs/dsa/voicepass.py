# -*- coding: utf-8 -*-
"""Marker-safe contraction pass for a DSA episode table.

Same guard as the Linux pass (LAW 0f rule 9): a token carrying clause punctuation is
never eligible as the second half of a pair, because contracting a verb that ENDS its
clause is how "Lost track of where you're?" shipped. Sigils live ON the token, so the
first word keeps its marker and the builder recomputes every index afterwards.

Usage: python3 briefs/dsa/voicepass.py briefs/dsa/ep05.json
"""
import json, re, sys

PAIRS = {
 ('it','is'):"it's", ('that','is'):"that's", ('there','is'):"there's", ('here','is'):"here's",
 ('what','is'):"what's", ('who','is'):"who's", ('you','are'):"you're", ('they','are'):"they're",
 ('we','are'):"we're", ('you','will'):"you'll", ('it','will'):"it'll", ('we','will'):"we'll",
 ('you','have'):"you've", ('we','have'):"we've", ('they','have'):"they've",
 ('you','would'):"you'd", ('it','would'):"it'd", ('that','would'):"that'd",
 ('do','not'):"don't", ('does','not'):"doesn't", ('did','not'):"didn't",
 ('is','not'):"isn't", ('are','not'):"aren't", ('was','not'):"wasn't", ('were','not'):"weren't",
 ('will','not'):"won't", ('would','not'):"wouldn't", ('could','not'):"couldn't",
 ('should','not'):"shouldn't", ('have','not'):"haven't", ('has','not'):"hasn't",
 ('had','not'):"hadn't", ('can','not'):"can't", ('let','us'):"let's",
}
SIG = '|^+>%'
PUNCT = re.compile(r'[.,;:?!]')

def contract(text):
    toks = text.split(' ')
    out, i, n = [], 0, 0
    while i < len(toks):
        a = toks[i]
        b = toks[i+1] if i+1 < len(toks) else None
        sig = a[0] if a and a[0] in SIG else ''
        aw = a[len(sig):] if sig else a
        if b is not None and not PUNCT.search(aw) and b and b[0] not in SIG and not PUNCT.search(b):
            key = (aw.lower(), b.lower())
            if key in PAIRS:
                rep = PAIRS[key]
                if aw[:1].isupper():
                    rep = rep[0].upper() + rep[1:]
                out.append(sig + rep); i += 2; n += 1
                continue
        if aw.lower() == 'cannot':
            rep = "Can't" if aw[:1].isupper() else "can't"
            out.append(sig + rep); i += 1; n += 1
            continue
        out.append(a); i += 1
    return ' '.join(out), n

path = sys.argv[1]
T = json.load(open(path))
total = 0
for sc in T['scenes']:
    sc['narration'], k = contract(sc['narration'])
    total += k
json.dump(T, open(path, 'w'), indent=1)

plain = ' '.join(re.sub(r'[|^+>%]', '', s['narration']) for s in T['scenes'])
w = len(plain.split())
c = len(re.findall(r"\b\w+['’](t|s|re|ll|ve|d|m)\b", plain))
bare = len(re.findall(r"\b(it|its|it's|this|that|they|them|those|these)\b", plain, re.I))
why = len(re.findall(r"\b(because|which means|so that|otherwise|that's why|the reason|which is why|meaning)\b", plain, re.I))
stranded = re.findall(r"\b\w+'(re|s|ve|ll|m)\s*(?=[.?!,;:]|$)", plain)
print(f"{total} contractions applied")
print(f"  contractions {c}/{w} = {c/w*100:.2f}% (need >=1.2%)")
print(f"  pronouns     {bare}/{w} = {bare/w*100:.2f}% (need <=4.5%)")
print(f"  reasons      {why}/{w} = {why/w*100:.2f}% (need >=0.8%)")
if stranded: print(f"  !! {len(stranded)} possible stranded contraction(s) — CHECK BY HAND")
