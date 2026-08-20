import json,re
T='briefs/linux/table.json'
rows=json.load(open(T)); R={r['id']:r for r in rows}

R['s04']['narration']=("One warning first. Somewhere in these hundred and nine sits a command that wipes an |entire disk "
 "in four characters. No prompt, nothing in a bin. So which one is it? We'll get there.")
R['s90']['narration']=("And here's the answer to my opening question. |D D copies blocks and asks nothing. |Point it at a "
 "spare disk and it's a fine backup tool. |Swap one letter and it isn't. |I F equals is the source. |O F equals is "
 "the target. Aim that at |slash dev slash S D A and your system is gone. |No prompt, no undo, no way back.")
R['s51']['narration']=("|P S aux snapshots everything running. |P S dash E F is the same data in a different syntax. The "
 "column you want is the |process id, then the |next one, then |P I D one, which is the ancestor of everything. "
 "|Every other tool asks you for that number, so it's worth spotting fast.")
R['s110']['narration']=("|N S lookup is the older tool, and its output misleads people daily. It names the |server you "
 "asked, then says |non authoritative, which only means a cache answered. |People read that as a fault. |It isn't "
 "one, and nothing is actually wrong with the reply.")
R['s112']['narration']=("|S S H keygen makes a key pair. |S S H copy I D sends one half over. Then |S S H logs you in with "
 "no password. The |private half stays on your laptop, always. The |public half, ending in dot pub, is the one that "
 "travels. It lands in |authorized keys on the server. |Send the private one and you've handed over your identity, "
 "so keep that half where it is.")
R['s143']['narration']=("|L S P C I dash K lists hardware on the bus plus the driver bound to each piece. The |device is "
 "present, the |driver is loaded, and if that |driver line is missing the hardware is there but unusable. "
 "|Present and working aren't the same thing, which is where an evening disappears.")

# FEW REASONS: carry the WHY inside the sentence on the structural beats, where
# the recaps were stating true things without ever saying why they matter.
WHY={
 "s18":" Respect it, because there's no undo anywhere in this drawer.",
 "s34":" Together they're why you rarely need to open a file at all.",
 "s49":" That's the whole permission model, and everything else builds on it.",
 "s67":" Which means a stuck process is almost always findable.",
 "s78":" Otherwise you're guessing at a machine that's already telling you.",
 "s92":" That's why disk work rewards slowing down for ten seconds.",
 "s106":" So a network problem is nearly always one of those four.",
 "s119":" Which means you can work on a box you'll never physically see.",
 "s137":" That's why a server keeps working while you're asleep.",
}
for k,v in WHY.items(): R[k]['narration']=R[k]['narration'].rstrip()+v
json.dump(rows,open(T,'w'),indent=1); print("ok")
