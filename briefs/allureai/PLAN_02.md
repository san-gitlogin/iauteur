# Chapter 2 — What's inside a report, and how to open it back up

## Facts, measured on THIS machine (never quote the doc's)

| | doc says | measured here |
|---|---|---|
| raw JSON | 965,820 chars | **965,820 chars** ✓ |
| gzip | 660,296 bytes | **647,981 bytes** |
| base64 | 880,396 chars | **863,976 chars** |
| decode | 10 cases, 7/1/1/1 | **10 cases, 7/1/1/1** ✓ |

Compression measured per kind, and it is the best beat in the chapter:

```
result JSON     15,073 ->   2,874   19% of original   (repetitive text squashes)
.jpg           291,013 -> 234,952   81%               (already compressed)
.png           402,357 -> 383,823   95%               (already compressed)
.zip            10,015 ->   9,960   99%               (already compressed — gzip finds nothing)
```

The folder is 22 files: 10 `*-result.json` + 12 `*-attachment.*`, which is exactly what
chapter 1's take shows on screen. Keep those two numbers consistent across the chapters.

## The take — demos/allure-02.json (26 steps, 14 typing blocks)

Written and asserted: the typed blocks reconstruct both source files byte-for-byte, and no
command wraps the terminal. Prep copies chapter 1's results folder in rather than re-running
behave, because the run was chapter 1's story.

## Arithmetic before writing a word

~20 recorded beats. The over-reliance cap is `ceil(0.35 x scenes)`, so the chapter needs
**at least 58 scenes** — about 38 drawn beats. Decide that first; discovering it after the
script is written costs a full authoring pass (chapter 1 paid that).

## New pictures this chapter needs

The owner's own director notes name four of them, and they are the right four:

1. **`files-merge`** — 22 file tiles slide together into one. The "why squash it" idea,
   before any code. Derived count, so it cannot disagree with the folder.
2. **`size-bar`** — one bar: 965,820 shrinks to 647,981, then grows to 863,976. Three real
   numbers moving. This is the chapter's headline picture.
3. **`nested-boxes`** — TestCase containing Step containing Attachment, built live as the
   three dataclasses are typed. The shape every later chapter stores and serves.
4. **`compression-ratio`** — the table above, drawn: text squashes to a fifth, a zip does
   not move at all. Answers "why is base64 BIGGER than the gzip?" in the same breath.
5. **`summary-gap`** — two counters vs four, the honest aside from the doc. Note this is the
   same lesson as chapter 1's `rpt11` beat, so it must be told differently here: chapter 1
   was about writing the counter, this is about a summary that lies while its data is right.

`round-trip` (five steps forward, the same five backward) is tempting but `nested-boxes` plus
`size-bar` already carry it — do not build a fifth picture for a sentence.

## Beats that must not be dropped

- base64 makes data BIGGER, not smaller (863,976 from 647,981). Everyone assumes it
  compresses. It exists so bytes survive a text-only place.
- gzip on a PNG is 95% of nothing. Compressing compressed data is the classic waste.
- The decoder is boring to write BECAUSE the shape was decided first. That is the lesson.
- The summary bug: the data was right the whole time, the print was not.

## Continuity

Ends by pointing at chapter 3: these exact objects go into a real database.
