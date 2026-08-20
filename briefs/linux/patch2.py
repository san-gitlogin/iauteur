import json,re
T='briefs/linux/table.json'
rows=json.load(open(T)); R={r['id']:r for r in rows}

# ── contractions, marker-safe ────────────────────────────────────────────
# Contracting merges two words into one, which shifts every later word index.
# That is fine ONLY because markers live in the text and the builder recomputes
# indices after this runs. A pair is skipped if either half carries a marker, so
# a contraction can never swallow an anchor.
PAIRS=[("it is","it's"),("that is","that's"),("there is","there's"),("here is","here's"),
 ("you are","you're"),("we are","we're"),("they are","they're"),("what is","what's"),
 ("do not","don't"),("does not","doesn't"),("did not","didn't"),("is not","isn't"),
 ("are not","aren't"),("was not","wasn't"),("will not","won't"),("would not","wouldn't"),
 ("have not","haven't"),("has not","hasn't"),("you will","you'll"),("we will","we'll"),
 ("you have","you've"),("let us","let's"),("could not","couldn't"),("should not","shouldn't")]
def contract(s):
    for a,b in PAIRS:
        w1,w2=a.split()
        # neither half may carry a marker, and preserve sentence-initial casing
        s=re.sub(r'(?<![|\w])'+w1+r' '+w2+r'\b', b, s)
        s=re.sub(r'(?<![|\w])'+w1.capitalize()+r' '+w2+r'\b', b.capitalize(), s)
    s=re.sub(r'(?<![|\w])cannot\b','can\'t',s)
    s=re.sub(r'(?<![|\w])Cannot\b','Can\'t',s)
    return s
for r in rows: r['narration']=contract(r['narration'])

# ── open loop: the first four beats must ASK something (LAW 0g) ─────────
R['s04']['narration']=("One warning before we start. Somewhere in these hundred and nine sits a command that wipes an "
 "|entire disk in four characters. No prompt, nothing in a bin afterwards. So which one is it? "
 "It's on every beginner list, and we'll get there.")

# ── ceiling trims ───────────────────────────────────────────────────────
R['s02']['narration']=("That's the gap this video closes. Every command a Linux sysadmin actually types, all hundred "
 "and nine, each one running on screen. Welcome to THE NBX STUDIO.")
R['s03']['narration']=("Here's how we'll keep a hundred and nine of anything straight. Your terminal is a |workbench, "
 "every command is a tool, and the tools live in ten drawers.")
R['s07']['narration']=("Every shell session stands in one directory, and |C D is how you move. An |absolute path starts "
 "at the root slash. A |relative one starts where you're standing. Watch |root, then |home, then |santhu, then "
 "|api light up. |The tree never moves. |Only your position does, which is the whole idea behind paths.")
R['s17']['narration']=("Quick check. You delete the original file. |Which link still works? Have a think, and pause here "
 "if you want longer. |Ready? The hard link, because it points at the data.")
R['s36']['narration']=("Permissions are nine switches. |Seven five five sets them by number, and |U equals R W X sets the "
 "same ones by name. Watch the |nine light up: read, write, execute, three times over. |Seven is all three. "
 "Five drops the write.")
R['s51']['narration']=("|P S aux snapshots everything running. |P S dash E F is the same data, different syntax. The "
 "column you want is the |process id, then the |next, then |P I D one, the ancestor of everything. |Every other "
 "tool wants that number.")
R['s110']['narration']=("|N S lookup is the older tool, and its output misleads daily. It names the |server you asked, "
 "then says |non authoritative, which only means a cache answered. |People read that as a fault. |It isn't one.")

# ── late anchors ────────────────────────────────────────────────────────
R['s90']['narration']=("And here's the answer to the question I opened with. |D D copies blocks and asks nothing. "
 "|Point it at a spare disk and it's a fine backup tool. |Swap one letter and it isn't. |I F equals is the source. "
 "|O F equals is the target. Aim that at |slash dev slash S D A and your running system is gone. "
 "|No prompt, no progress, no undo, and no way back from it.")
R['s105']['narration']=("Quick one. Your service is |listening on four four three, unreachable outside. Look where? Have "
 "a think, and pause here if you need longer. |Ready? The firewall, because the service already proved it's up.")
R['s145']['narration']=("Last one. You |know the job, not the command name. What do you reach for? Have a think, and "
 "pause here if you need longer. |Ready? Apropos, because it searches the descriptions.")

json.dump(rows,open(T,'w'),indent=1)
n=sum(len(re.findall(r"\w'\w", r['narration'])) for r in rows)
print("contraction-like tokens now:",n)
