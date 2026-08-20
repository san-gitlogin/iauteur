import json
T='briefs/linux/table.json'
rows=json.load(open(T)); R={r['id']:r for r in rows}
# A RECAP with 4 anchors earns 20s ≈ 47 words. Keep the reason, lose the padding.
FIX={
 "s78":"Drawer five is your eyes on the machine. |Up time and free give the headline. |V M stat and I O stat give the detail. |S A R remembers yesterday. |Watch makes anything live, so you're never guessing.",
 "s92":"Drawer six is the disk. |D F and D U find the space. |Mount and blk id attach it. |F disk and make F S prepare it. |D D destroys it if you mistype, so slow down here.",
 "s106":"Drawer seven is the wire. |I P says who you are. |Ping and trace route say what you reach. |S S says what's open. |The bandwidth tools say who's loud.",
 "s119":"Drawer eight is everything past this box. |Dig resolves names. |S S H gets a shell. |S C P and R sync move files. |N C and curl test the far end.",
 "s137":"Drawer nine runs without you. |Tar and gzip package it. |Cron schedules it. |System C T L and journal C T L supervise it. |T mux keeps it alive while you sleep.",
 "s112":("|S S H keygen makes a key pair. |S S H copy I D sends one half. Then |S S H logs you in with no password. "
         "The |private half never leaves your laptop. The |public half, ending dot pub, travels. It lands in "
         "|authorized keys. |Send the private one and you've given away your identity."),
 "s90":("And here's the answer to my opening question. |D D copies blocks and asks nothing. |Point it at a spare disk "
        "and it's a fine backup tool. |Swap one letter and it isn't. |I F equals is the source. |O F equals is the "
        "target. Aim that at |slash dev slash S D A and it's gone. |No prompt and no undo, which is why you check twice."),
}
for k,v in FIX.items(): R[k]['narration']=v
json.dump(rows,open(T,'w'),indent=1); print("ok")
