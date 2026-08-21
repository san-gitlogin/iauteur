# -*- coding: utf-8 -*-
"""The one safe way for a brief builder to write its JSON.

Two hazards this closes, both found on 2026-08-21 while making the repo portable to
a second machine.

1. THE BUILDER THAT IS BEHIND ITS OUTPUT.
   Nine of these builders emitted fewer scenes than the JSON beside them carried,
   because later corrections were patched straight into the JSON and never folded
   back into the Python. `briefs/mcp/ep01.json` held two beats — s03b and s04b —
   that `ep01_03.py` had never produced. Re-running the builder would have deleted
   them silently, and nothing downstream would have complained: the spec would build,
   lint, voice and render, just missing two beats nobody would think to look for.
   `write()` refuses in that situation and names the beats at risk, so the choice is
   made deliberately instead of discovered three renders later. See LAW 0p.

2. THE HARDCODED PATH.
   Every builder wrote to an absolute '/Users/santhu/iauteur/...' path, so none of
   them ran anywhere except the machine they were written on. Paths now resolve from
   this file's own location.

Usage, from any builder at any depth under briefs/:
    from _guard import write        # after the sys.path line below
    write(T, 'mcp/ep00.json')       # path is relative to briefs/
"""
import json, os, sys

BRIEFS = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(BRIEFS)


def resolve(rel):
    """A path under briefs/, from anywhere, on any OS."""
    return os.path.join(BRIEFS, *rel.replace('\\', '/').split('/'))


def write(spec, rel, allow_drop=False):
    """Write a brief, refusing to overwrite an authored JSON that has moved on.

    A dropped scene is not the only way these builders destroy work. Re-running them
    on 2026-08-21 also reverted `MCPServer` back to `FastMCP` across chapter four —
    a factual correction that had been made in the JSON and never folded back into
    the Python. Scene ids matched perfectly; the content did not. So the check is on
    the WHOLE document, not the scene list.

    On divergence nothing is overwritten. The output the builder wanted is written
    beside the real brief as `<name>.candidate.json` so it can be diffed, and the
    exit is loud.
    """
    path = resolve(rel)
    if os.path.exists(path) and not allow_drop:
        try:
            old = json.load(open(path, encoding='utf-8'))
        except Exception:
            old = None
        if old is not None and old != spec:
            cand = path[:-5] + '.candidate.json'
            json.dump(spec, open(cand, 'w', encoding='utf-8'), indent=1)
            new_ids = [s['id'] for s in spec.get('scenes', [])]
            lost = [s['id'] for s in old.get('scenes', []) if s['id'] not in new_ids]
            sys.stderr.write(
                "\n✗ REFUSING to write briefs/{}\n"
                "  The JSON on disk is NOT what this builder produces. It has been edited\n"
                "  since the builder last ran, and those edits are the corrections — the\n"
                "  builder is the stale copy, not the JSON.\n"
                .format(rel))
            if lost:
                sys.stderr.write(
                    "  Scenes that would be DELETED: {}\n".format(', '.join(lost)))
            sys.stderr.write(
                "  Wrote what the builder wanted to briefs/{}.candidate.json — diff it,\n"
                "  fold anything genuinely new into this builder, then delete it.\n"
                "  Pass allow_drop=True only if you mean to discard the edits on disk.\n\n"
                .format(rel[:-5]))
            sys.exit(1)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    json.dump(spec, open(path, 'w', encoding='utf-8'), indent=1)
    return path
