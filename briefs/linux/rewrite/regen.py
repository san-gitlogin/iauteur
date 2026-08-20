# -*- coding: utf-8 -*-
"""Regenerate the 110 command components against the rewritten script.

The components are already WIRED (types, registry, manifest entry, linter, showcase),
so this touches only the two things that actually changed: the TSX body, which now
draws through linuxViz instead of the six generic archetypes, and the manifest
example, which carries the new terminal steps and depicted beats.
"""
import sys, json, re, importlib, io
sys.path.insert(0, 'briefs/linux/rewrite')

spec = json.load(open('topics/linux-commands-masterclass/long.json'))
OLD = {}
for s in spec['scenes']:
    d = s.get('data') or {}
    if not d: continue
    k = next(iter(d)); v = d[k]
    if isinstance(v, dict) and 'steps' in v:
        OLD[s['id']] = (s['type'], k, v)

NEW = {}
for m in ['b1','b2','b3','b4','b5','b6','b7','b8','b9']:
    M = importlib.import_module(m)
    NEW.update([kv for kk, vv in vars(M).items() if kk.startswith('B') and isinstance(vv, dict) for kv in vv.items()])

# depth for the genuinely hierarchical pictures — a tree without depths is a list
DEPTHS = {
 's07': [None,0,1,2,3,None,None,3],
 's08': [0,1,2,3,None,None,None,None],
 's10': [0,1,None,None,None,2,3],
 's52': [0,1,2,None,None,None,None],
 's88': [0,1,2,2,3,3,1],
 's144':[0,1,2,2,None,None,None,None],
}
# terminal output for the five steps that did not exist before
OUT = {
 "sed -i 's/8080/443/g' app.conf": {"text":"listen 443;","detail":"-i: the file itself is changed"},
 "ip link": {"text":"1: lo  2: eth0 <UP>","detail":"the interfaces themselves"},
 "curl -X POST -d '{}' api.ex.com/jobs": {"text":"HTTP/1.1 201 Created","detail":"method, headers and body"},
 "sudo !!": {"text":"[sudo] password for santhu:","detail":"reruns the last command, elevated"},
}

def steps_for(sid, r, ov):
    old = ov.get('steps') or []
    by_label = {s.get('label'): s for s in old}
    out = []
    for i, cmd in enumerate(r['steps']):
        src = by_label.get(cmd) or OUT.get(cmd) or (old[i] if i < len(old) else {})
        st = {"label": cmd}
        for f in ('text', 'sub', 'detail'):
            if src.get(f): st[f] = src[f]
        out.append(st)
    return out

def stage_for(sid, r):
    ds = DEPTHS.get(sid)
    out = []
    for i, (lab, sub) in enumerate(r.get('stage') or []):
        it = {"label": lab}
        if sub: it["sub"] = sub
        if ds and i < len(ds) and ds[i] is not None: it["value"] = ds[i]
        out.append(it)
    return out

examples, tsx_files = {}, {}
for sid, r in NEW.items():
    ty, key, ov = OLD[sid]
    ex = {}
    for f in ('headline', 'color', 'promptLabel', 'cwd', 'highlight', 'stageTitle'):
        if ov.get(f): ex[f] = ov[f]
    ex['atWord'] = 1
    ex['steps'] = steps_for(sid, r, ov)
    st = stage_for(sid, r)
    if st: ex['stage'] = st
    if r.get('perms'): ex['perms'] = r['perms']; ex['permsAtWord'] = 1
    if r.get('verdict'): ex['verdict'] = r['verdict']
    if r.get('vsub'): ex['verdictSub'] = r['vsub']
    if r.get('verdict'): ex['verdictAtWord'] = 1
    examples[key] = (ty, ex, r)
json.dump({k: [v[0], v[1], v[2]['viz']] for k, v in examples.items()},
          open('/private/tmp/claude-501/-Users-santhu/385c0a2e-17f5-419c-a84b-e5aaee440ea3/scratchpad/examples.json','w'), indent=1)
print(f"built {len(examples)} examples")

# ── write the manifest examples ──────────────────────────────────────────────
MAN = 'scripts/lib/manifest.mjs'
src = open(MAN).read()
def replace_example(src, key, obj):
    anchor = f'example: {{{key}: '
    i = src.find(anchor)
    if i < 0: return src, False
    j = i + len(anchor)
    assert src[j] == '{'
    depth, k, instr, esc = 0, j, False, False
    while k < len(src):
        c = src[k]
        if instr:
            if esc: esc = False
            elif c == '\\': esc = True
            elif c == '"': instr = False
        else:
            if c == '"': instr = True
            elif c == '{': depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0: break
        k += 1
    return src[:j] + json.dumps(obj, separators=(',', ':')) + src[k+1:], True

miss = []
for key, (ty, ex, r) in examples.items():
    src, ok = replace_example(src, key, ex)
    if not ok: miss.append(key)
open(MAN, 'w').write(src)
print(f"manifest: {len(examples)-len(miss)} examples written, {len(miss)} missing {miss[:5]}")

# ── rewrite the component bodies ─────────────────────────────────────────────
def comp_name(key):  # cmdCd -> CmdCd
    return key[0].upper() + key[1:]

TPL = '''import React from 'react';
import {{AbsoluteFill}} from 'remotion';
import {{Scene}} from '../types';
import {{Headline, SourceFooter, useScale}} from '../ui';
import {{CommandStage, CmdStep, useStageState}} from '../CommandStage';
import {{Depiction, VizVerdict}} from '../linuxViz';

// {ty} — `{cmd}` on the two-up command stage.
// LEFT: a live terminal types each step on the word it is spoken.
// RIGHT: {viz} — {note}
//
// Timing: every element resolves from its own atWord via wordToFrame. Nothing in
// this file or in linuxViz runs on a fixed interval, so the picture moves with the
// voice rather than beside it.
export const {name}: React.FC<{{scene: Scene}}> = ({{scene}}) => {{
  const {{scale, vertical}} = useScale();
  const d = scene.data.{key};
  if (!d) return <AbsoluteFill />;

  const raw = (d.steps ?? []).slice(0, 4);
  if (!raw.length) return <AbsoluteFill />;
  const steps: CmdStep[] = raw.map((s) => ({{
    cmd: s.label ?? '',
    output: [s.text, s.sub].filter(Boolean) as string[],
    note: s.detail,
    atWord: s.atWord,
  }}));
  const state = useStageState(steps);
  const accent = (d.color ?? {color}) as any;

  return (
    <AbsoluteFill>
      {{d.headline ? <Headline text={{d.headline}} color={{accent}} /> : null}}
      {{/* Placed BELOW the headline band explicitly: the headline is absolutely
          positioned, so a margin on a flex child would not clear it. */}}
      <div
        style={{{{
          position: 'absolute',
          top: (d.headline ? (vertical ? 340 : 212) : 90) * scale,
          left: (vertical ? 52 : 72) * scale,
          right: (vertical ? 52 : 72) * scale,
          height: (vertical ? 1180 : 620) * scale,
          display: 'flex',
          minHeight: 0,
        }}}}
      >
        <CommandStage
          steps={{steps}}
          state={{state}}
          promptLabel={{d.promptLabel}}
          cwd={{d.cwd}}
          color={{accent}}
          highlight={{d.highlight}}
          stageTitle={{d.stageTitle ?? {stageTitle}}}
        >
          <Depiction
            kind={{{viz_lit}}}
            items={{(d.stage ?? []).slice(0, 10)}}
            accent={{accent}}
            perms={{d.perms}}
            permsAtWord={{d.permsAtWord}}
            token={{d.token}}
          />
          <VizVerdict text={{d.verdict}} sub={{d.verdictSub}} color={{accent}} atWord={{d.verdictAtWord}} />
        </CommandStage>
      </div>
      {{scene.data.source ? <SourceFooter text={{scene.data.source}} /> : null}}
    </AbsoluteFill>
  );
}};
'''

written = 0
for key, (ty, ex, r) in examples.items():
    name = comp_name(key)
    body = TPL.format(
        ty=ty, cmd=r['cmd'], viz=r['viz'],
        note=str(r['vizNote']).replace('`', "'").split('.')[0] + '.',
        name=name, key=key,
        color=json.dumps(ex.get('color', 'blue')),
        stageTitle=json.dumps(ex.get('stageTitle', 'what happens')),
        viz_lit=json.dumps(r['viz']),
    )
    open(f'src/scenes/{name}.tsx', 'w').write(body)
    written += 1
print(f"components: {written} rewritten")
