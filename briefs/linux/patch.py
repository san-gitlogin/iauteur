import json
T='briefs/linux/table.json'
rows=json.load(open(T)); R={r['id']:r for r in rows}

# 1) Quizzes: 2 anchors earn 16s, so each must sit at or under ~37 words while
#    keeping the LAW 0e-q thinking gap (>=9 words + a real pause cue).
Q={
 "s48":"Quick one. You change mod six four four a script, then |run it. What happens? Have a think, and pause here if you need longer. |Ready? It refuses. The execute bit is gone.",
 "s66":"Quick one. A process is |ignoring your kill entirely. Which signal cannot be ignored? Have a think, and pause here if you need longer. |Ready? Sig kill, because the kernel delivers it.",
 "s77":"Quick one. |Load reads four, on eight cores. Problem, or fine? Have a think, and pause here if you need longer. |Ready? Fine, because load counts against cores.",
 "s91":"Quick one. |D F says space is free, but writes fail. What ran out? Have a think, and pause here if you need longer. |Ready? Inodes. Every file consumes one.",
 "s105":"Quick one. Your service is |listening on four four three, unreachable outside. Look where? Have a think, and pause here if you need longer. |Ready? The firewall.",
 "s118":"Quick one. |Resyncing a huge folder, barely anything changed. Which tool? Have a think, and pause here if you need longer. |Ready? R sync, because it sends only differences.",
 "s136":"Quick one. You |started a service, and a reboot killed it. What was missed? Have a think, and pause here if you need longer. |Ready? Enable, not just start.",
 "s145":"Last one. You |know the job, not the command name. What do you reach for? Have a think, and pause here if you need longer. |Ready? Apropos.",
}
for k,v in Q.items(): R[k]['narration']=v

# 2) Scenes over their earned ceiling.
R['s90']['narration']=("And here is the answer to the question I opened with. |D D copies blocks and asks nothing. "
 "|Point it at a spare disk and it is a fine backup tool. |Swap one letter and it is not. |I F equals is the source. "
 "|O F equals is the target. If that target is |slash dev slash S D A, your running system is gone. "
 "|No prompt, no progress bar, no undo.")
R['s146']['narration']=("And that is the bench, all |ten drawers filled. A hundred and nine tools, and you never have "
 "to memorise one, because you only need to know which drawer to open.")
R['s147']['narration']=("If one of these saved you a search, subscribing helps. And if you take one thing away, make it "
 "this: check what D D points at, twice, before you press enter.")

# 3) Verdicts landing in the closing 15% — give each a real closing clause after
#    the payoff so the last words carry meaning instead of the reveal.
TAILS={
 "s07":" That is the whole idea behind every path you will ever type.",
 "s13":" The file itself never gets duplicated at any point.",
 "s14":" There is genuinely no way to get those files back.",
 "s15":" The data itself lives until the very last name goes.",
 "s25":" Everything else about that editor can wait until later.",
 "s32":" That tiny adapter is why the whole pipeline works.",
 "s38":" So the same mask gives directories seven five five.",
 "s51":" You will be typing that number into everything else.",
 "s52":" So nothing is ever left running without a parent.",
 "s59":" Unsaved work is exactly what you lose otherwise.",
 "s70":" Linux is spending that memory on your behalf, deliberately.",
 "s81":" D F tells you it is full, and D U tells you why.",
 "s88":" Everything reappears exactly as it was, completely untouched.",
 "s110":" It simply means the answer arrived from a cache somewhere.",
 "s116":" Curl, which is next, is made for talking instead.",
 "s131":" That detaches you cleanly instead of just dropping out.",
}
for k,v in TAILS.items(): R[k]['narration']=R[k]['narration'].rstrip()+v

json.dump(rows,open(T,'w'),indent=1)
print("patched",len(Q)+3+len(TAILS),"scenes")
