"""Word budget per beat, derived from the builder's own scene ceiling.

The ceiling is EARNED BY MOTION (LAW 0e rule 6): 180 frames per distinct anchor plus 120,
floor 480, cap 2400. At the measured Ava rate of 3.05 words/s that converts to a word budget,
and authoring against it is how a beat avoids being trimmed later — which the laws forbid.
The remedy for an over-budget beat is ALWAYS more anchored elements or a SPLIT.
"""
FPS, WPS = 30, 3.05

def ceiling_frames(anchors: int) -> int:
    return 480 if anchors < 2 else max(480, min(2400, 180 * anchors + 120))

def word_budget(anchors: int) -> int:
    # the builder adds a 26-frame tail before comparing, so charge that back
    return int(((ceiling_frames(anchors) - 26) / FPS) * WPS)

def check(scene_id: str, narration: str, anchors: int) -> str | None:
    n = len([w for w in narration.split() if w])
    b = word_budget(anchors)
    if n > b:
        need = 0
        while word_budget(need) < n:
            need += 1
        return f"{scene_id}: {n}w over budget {b}w at {anchors} anchor(s) — needs {need}, or SPLIT"
    return None

if __name__ == "__main__":
    for a in range(0, 9):
        print(f"  {a} anchor(s) -> {ceiling_frames(a)/FPS:5.1f}s -> {word_budget(a):4d} words")
