import sys,importlib
sys.path.insert(0,'briefs/linux/rewrite')
SIG={'|':'step','^':'stage','@':'perms','~':'verdict'}
def analyse(row):
    n=row['n']; c={'step':0,'stage':0,'perms':0,'verdict':0}; steps=[]; wi=0
    for tok in n.split():
        wi+=1
        if tok[0] in SIG:
            c[SIG[tok[0]]]+=1
            if tok[0]=='|': steps.append(wi)
    w=wi
    need={'step':len(row.get('steps') or []),'stage':len(row.get('stage') or []),
          'perms':1 if row.get('perms') else 0,'verdict':1 if row.get('verdict') else 0}
    anchors=sum(need.values())+1
    ceil=max(480,min(1800,150*anchors+120))
    return c,need,w,w*12+30,ceil,steps,anchors
ok=bad=0;seen=set();tot=0
for mod in sys.argv[1:]:
    M=importlib.import_module(mod)
    D=[v for k,v in vars(M).items() if k.startswith('B') and isinstance(v,dict)][0]
    for sid,row in D.items():
        seen.add(sid); c,need,w,fr,ceil,steps,anchors=analyse(row); tot+=fr
        e=[]
        for r in ('step','stage','perms','verdict'):
            if c[r]!=need[r]: e.append(f"{r} markers {c[r]}!={need[r]}")
        if fr>ceil: e.append(f"{w}w={fr}f > earned {ceil}f (max {(ceil-30)//12}w @ {anchors} anchors)")
        if steps:
            pct=100*steps[-1]/w; req=45 if need['step']>=2 else 20
            if pct<req: e.append(f"terminal done {pct:.0f}% (need {req}%)")
        if e: print(f"  !! {sid} {row['cmd']}: "+" | ".join(e)); bad+=1
        else: ok+=1
print(f"\n{ok} ok, {bad} bad · {len(seen)} written · est {tot/30/60:.1f} min for these")
