import json,re
T='briefs/linux/table.json'
rows=json.load(open(T)); R={r['id']:r for r in rows}
FIX={
 "s18":"Drawer one is your hands. |Move with C D, look with L S. |Build with make dir and touch. |Duplicate with C P, rename with M V. |Delete with R M, because there's no undo.",
 "s34":"Drawer two is your eyes. |Cat and less read, tail follows. |Find walks the disk, locate guesses. |Grep, awk and sed search and rewrite. |Xargs joins them, which is why pipes work.",
 "s49":"Drawer three is the lock. |Change mod and change own set access. |U mask shapes new files. |Sudo lends power and logs it. |The user tools manage the accounts behind it.",
 "s67":"Drawer four is control. |P S and P S tree list them. |Top shows them moving. |Kill signals them politely. |L S O F and S trace find the cause, so nothing stays mysterious.",
}
for k,v in FIX.items(): R[k]['narration']=v
# a few more reasons woven into chapter dividers, where they cost no runtime
CH={
 "s19":"Drawer two. Reading text, and finding it, because most of the job is reading.",
 "s35":"Drawer three. Who you are, and what you're allowed to touch.",
 "s50":"Drawer four. What's running, and how you stop it without losing work.",
 "s68":"Drawer five. Watching the machine properly, so you're not guessing.",
 "s79":"Drawer six. Disks, filesystems, and the one command that deserves fear.",
 "s94":"Drawer seven. The network, starting from this machine because that's where you debug.",
 "s107":"Drawer eight. Reaching other machines, which is most of the job that matters.",
 "s120":"Drawer nine. Archives, scheduled jobs, and sessions that survive because you won't.",
 "s138":"Drawer ten. What to do when you're stuck, which is why these exist.",
}
for k,v in CH.items():
    if k in R: R[k]['narration']=v
json.dump(rows,open(T,'w'),indent=1); print("ok")
