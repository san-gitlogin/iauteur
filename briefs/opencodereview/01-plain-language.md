# The plain-language pass — how every hard idea gets said

Owner, 2026-09-17: *"beginners will be watching, you must not gulp out any narrations or
explanations… The ones you mentioned, even I can't get it clearly, so you must be very careful
on narrating to the viewers like they are 5."*

He was reacting to a written summary that used *shadowing*, *named return value*, *delegation
mode*, *precision/recall* and *io.EOF* with none of them defined. If the owner could not follow
it, a viewer with one for-loop of experience has no chance. **Nothing below may appear on the
soundtrack until the sentence that defines it has already been said.**

This file is the contract for every hard word in the cut. The builder quotes from it.

---

## The term ledger — every one of these is defined ON FIRST USE, in the same breath

| Term | It is never said before this is said |
|---|---|
| **code review** | "Before new code reaches real users, another programmer reads it and says yes or no. That reading is the code review." |
| **pull request** | "A folder that says: here is what I changed, please look before you let it in." |
| **merged** | "Approved and folded into the real project." |
| **diff** | "The list of lines that changed — the red ones taken out, the green ones put in." |
| **repository / repo** | "The project's folder, with every file and its whole history." |
| **agent** | "An AI that doesn't just answer — it can run commands and read files on its own." |
| **token** | "Models read text in little chunks called tokens, roughly three-quarters of a word. You pay per token." |
| **false positive / false alarm** | "It tells you something's broken, and it isn't." |
| **precision / recall** | the pond-and-net picture below — never the words alone |
| **variable** | "A labelled box you put a value in." |
| **`err`** | "Short for error. If something goes wrong, the error goes in this box." |
| **nil** | "The box is empty. Nothing went wrong, so nothing was put in it." |
| **scope** | "How long a box lives, and who can see it." |
| **the compiler** | "The program that turns what a programmer types into something a machine can run. It refuses obvious mistakes." |
| **`go vet`** | "A free checker that ships with Go and looks for suspicious code." |
| **unary call** | "The plain kind: you ask one question, you get one answer." |
| **CI / pipeline** | "A robot that runs checks automatically every time anyone proposes a change." |

Rule: if a beat needs two of these at once, **split the beat**. Runtime is free.

---

## Precision and recall — the only analogy in the cut, and it is DRAWN, not named

LAW 0d: an analogy must be depicted, and must not rest on a cultural referent. A pond, fish and a
net read the same everywhere.

> "Picture a pond with a hundred fish in it. You throw in a net and haul it out.
>
> The first question is: of everything in your net, how much is actually fish? If you pull up
> ninety boots and ten fish, that's a bad net — you've got to sort through all that rubbish. That
> question has a name. It's called **precision**.
>
> The second question is different: of all the fish that were in the pond, how many did you
> actually get? Ten out of a hundred isn't much. That one's called **recall**.
>
> And here's the thing — you can win one and lose the other. Throw a big enough net and you'll
> catch every fish in the pond. You'll also catch every boot, every branch and an old bicycle."

Depiction: a pond, a net hauling out a mixed catch, fish lighting up gold and junk staying grey.
Two counters fill as the voice names them. **Never** a card with the words "Precision" and
"Recall" on it.

Then, and only then, the real numbers:

> "Claude Code handed back five thousand nine hundred and eighty comments. Four hundred and
> thirty-five of them were real problems. So you'd be throwing away about nine out of every ten
> things it told you. Open Code Review handed back eight hundred and eighty-nine, and three
> hundred and one were real."

---

## The bug — the centrepiece, told at the pace it needs

**Do not compress this.** It is the payoff of the whole video and it is the single place a
beginner will be lost if a line is skipped. Budget four to five beats.

**Beat 1 — the box.**
> "Let's slow right down, because this is the part that matters. In a program, a variable is just
> a labelled box you put a value in. This box is called `err` — short for error. If something goes
> wrong, the error gets put in the box. If nothing goes wrong, the box stays empty. Programmers
> have a word for an empty box like that. They call it **nil**."

**Beat 2 — the one character.**
> "Now here's the bit that broke it. In Go — that's the language gRPC is written in — *where* you
> make a box decides how long that box lives.
>
> Write `err` equals, and you're putting something into a box that already exists.
>
> Write `err` colon-equals — with a colon in front — and you're making a brand new box, right
> there on the spot.
>
> One character. A colon. That's the entire difference between those two lines."

**Beat 3 — the disappearing box.** (the depiction: two boxes, the inner one inside a bracket
fence that closes and takes the box with it)
> "And if you make that new box *inside* an `if` — inside those curly brackets — the new box only
> lives inside the brackets. The moment the `if` finishes, that box is gone. Swept away."

**Beat 4 — what actually happened.**
> "So follow what the code does now. It asks: did this go wrong? And the answer goes into the new
> box, the temporary one. Then the `if` ends, and that box disappears.
>
> Two lines later the code asks about `err` again. But it can't see the new box any more — it's
> gone. So it reads the old box instead. The one from outside. And the old box was never filled.
> It's still empty.
>
> So the code checks whether anything went wrong, looks in an empty box, finds nothing, and says:
> all good. Carry on.
>
> The error wasn't handled. It was dropped on the floor. A call that failed now reports success."

**Beat 5 — the irony, and it is real.**
> "And now read the title of this pull request one more time. Its whole job — the entire reason
> someone wrote it — was to make the client report one specific error. And this bug means that
> exact error is the one that gets thrown away. The change broke the very thing it was written
> to do."

**Beat 6 — why nobody caught it.**
> "You might reasonably ask: don't programmers have tools for this? They do. Go comes with a
> checker called `go vet`. But look at that line again — there's nothing illegal about it.
> Making a new box is a completely normal thing to do. Nothing's misspelled. Nothing's the wrong
> type. The compiler is perfectly happy, `go vet` is perfectly happy, all the tests pass, and it
> ships.
>
> That's why a human read this and said yes. Actually, more than one human."

**Beat 7 — the decency line. This is not optional.**
> "And I want to be really clear about something. This is not a story about one engineer having a
> bad day. Several experienced people read this change and approved it, because it *looks* right —
> and it looks right to me too. That's the whole point. This is what human review misses, not who."

---

## Honesty beats, written out so they cannot be softened later

**On the mode we filmed:**
> "One thing I have to be straight with you about. There are two ways to run this. The benchmark
> numbers I showed you earlier were measured the first way, where Open Code Review calls a model
> itself, with your own API key. What we just watched is the second way — Claude Code's own model
> did the judging. Same file-picking, same rules, different engine doing the thinking. So don't
> take those benchmark numbers as a measurement of what you just saw."

**On the ceiling:**
> "And let's keep the benchmark honest too. Thirty-four percent precision is a big win over seven
> — but it still means roughly two out of every three things it flags are not real bugs. Twenty
> percent recall means it misses four defects out of five. Neither of these tools is anywhere
> near solved. This is a better reviewer, not a finished one."

**On the sample:**
> "And two pull requests is a demonstration, not a measurement. I picked them, I ran each one
> once, and I didn't retry to get a nicer answer. If you want the real numbers, they're in the
> benchmark on their page — and the dataset's public, so you can go and check it yourself."

**On whose benchmark it is:**
> "This is Alibaba's benchmark, of Alibaba's own tool, and you should always raise an eyebrow at
> that. So here's the thing that made me trust it more: look who's top of their own leaderboard.
> It isn't Alibaba's model. It's Anthropic's. Alibaba's own Qwen is sitting at number two, on a
> chart Alibaba published. That's not nothing."

---

## Voice rules specific to this cut

- Say **Open Code Review** in full, often. Never "OCR" on the soundtrack — it reads as optical
  character recognition to half the audience. (`ocr` is fine when it is the command being typed,
  and it is named as such: *"the command is just three letters, o-c-r"*.)
- Say **Claude Code** by name every time. Never "the other one".
- Numbers are spoken as words the way a person says them: *"five thousand nine hundred and
  eighty"*, *"a ninth of the tokens"*, *"thirty-four percent"*.
- Contractions throughout. One pause-invitation per chapter, at the code, not as a tic.
- Never say "simply", "just", "obviously", or "as you can see".
