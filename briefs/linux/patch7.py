import json
T='briefs/linux/table.json'
rows=json.load(open(T)); R={r['id']:r for r in rows}
# Carry the WHY inside the sentence (LAW 0f rule 8) on beats with runtime slack.
TAILS={
 "s08":" That matters because scripts break the moment a relative path moves.",
 "s10":" Which is why every tutorial tells you to add dash P.",
 "s11":" That's why make and every build tool leans on it.",
 "s20":" So reach for less instead, because it pages rather than floods.",
 "s21":" Useful, because in most logs the line you want sits at the bottom.",
 "s22":" That's why almost nobody reaches for more any more.",
 "s24":" Because a bug you can watch happen is a bug you can fix.",
 "s26":" Which means a review of two lines instead of two files.",
 "s28":" So use find when the answer has to be current.",
 "s30":" That's why awk beats writing a parser for a one-off.",
 "s37":" Because permissions describe a role, not a person.",
 "s41":" Which is why that missing A locks people out of sudo.",
 "s45":" Because one person logged in twice shows up as two rows.",
 "s53":" Which means you see the shape of a problem, not a single number.",
 "s57":" Because the red one finds you before you know where to look.",
 "s62":" That costs no processor time at all, because it truly blocks.",
 "s72":" Because a queue is what slowness actually feels like.",
 "s82":" Which is why N C D U beats D U for hunting.",
 "s96":" Because loss tells you far more than an average ever will.",
 "s103":" Which is usually the question you actually walked in with.",
 "s113":" Because that colon is the only thing marking a remote path.",
 "s122":" Which is why gzip is the default almost everywhere.",
 "s129":" Because a leaked variable in a shared shell is a real problem.",
 "s135":" Because hardware failures never wait for a log file to open.",
 "s140":" Which is why man dash K exists as the same command.",
}
for k,v in TAILS.items():
    if k in R: R[k]['narration']=R[k]['narration'].rstrip()+v
json.dump(rows,open(T,'w'),indent=1); print("added",len(TAILS),"reason clauses")
