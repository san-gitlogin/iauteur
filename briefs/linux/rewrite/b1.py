# -*- coding: utf-8 -*-
# Batch 1 — Act 1: moving around and handling files.
# Each entry authors the TERMINAL steps, the DEPICTED stage beats and the narration
# together, because the ceiling is earned by motion: a richer picture buys the
# runtime that patient explanation needs.
# Markers: | step   ^ stage beat   @ perms   ~ verdict
B1 = {
"s07": dict(cmd="cd", exp="change directory", viz="fs-tree",
 vizNote="A real directory tree. A YOU ARE HERE puck walks root->home->dev->api, then climbs one level and drops into logs. The folders are pinned in place so it is visibly the puck that moves, never the tree.",
 steps=["cd /home/dev/api","cd ../logs"],
 stage=[("absolute path","begins at the root slash"),("/","the root of the disk"),("home","every user's folder"),
        ("dev","your own account"),("api","you are here now"),
        ("relative path","begins where you stand"),("..","up one level"),("logs","you are here now")],
 verdict="None of the folders moved", vsub="only your position in the tree did", n=
 "Your project lives a few folders deep and you want to work inside it. The command is |C D, short for change directory. One way in is an ^absolute path, which begins at the root slash, and the shell walks down it a level at a time: the ^root of the disk, into ^home, where every user's folder lives, into ^dev, your own account, and finally into ^api. The other way is a ^relative path, which begins wherever you are standing. To reach the logs folder beside you, type |C D dot dot slash logs, where two dots mean ^up one level, and you drop into ^logs. ~None of those folders moved. Only where you are standing changed."),

"s08": dict(cmd="pwd", exp="print working directory", viz="fs-tree",
 vizNote="The same tree, but the branch from root down to the current folder lights as one connected trail, and the trail assembles itself into the absolute path string underneath, segment by segment.",
 steps=["pwd"],
 stage=[("/","the root of the disk"),("home","every user's folder"),("dev","your own account"),
        ("api","the folder you are in"),("/home/dev/api","the whole trail, joined up"),
        ("the same answer","wherever you started from"),("a relative path","never returned"),("a shortcut","never returned either")],
 verdict="It answers from the root, every time", vsub="which is exactly why scripts can trust it", n=
 "Here is something that happens more often than people admit. You have been jumping between folders and you genuinely cannot remember which one you are sitting in. The command that answers is |P W D, which stands for print working directory. It replies with the whole path, read top down: the ^root of the disk, then ^home, which holds every user's folder, then ^dev, your own account, and finally ^api, where you are standing. Joined up, that is ^the full path. And it is ^the same answer no matter where you started from, because P W D will never hand you ^a relative path, and never ^a shortcut either. ~It answers from the root every single time."),

"s09": dict(cmd="ls", exp="list", viz="fs-listing",
 vizNote="A real directory drawn as file rows with type-coloured names. Bare names first; then each metadata column slides in from the left as a labelled column with its meaning written under it; then the raw byte figures visibly count down into 4.0K form.",
 steps=["ls","ls -l","ls -lh"],
 stage=[("names only","what plain ls gives you"),("permissions","who may read, write, run"),("owner","the account that owns it"),
        ("size","in bytes, until you ask otherwise"),("date","when it last changed"),("bytes are hard to read","at a glance"),("4096 becomes 4.0K","the -h flag, for human")],
 verdict="Same directory, three levels of detail", vsub="ls -lh is the one worth putting in muscle memory", n=
 "You want to see what is inside a folder. |L S, short for list, gives you ^the names and nothing else, which is fine until you need detail. Add the dash L flag for long and you get |L S dash L, where every file becomes a full row. That row carries the ^permissions, saying who may read, write and run it, the ^owner, the account it belongs to, the ^size in bytes, and the ^date it last changed. ^Those raw byte counts are hard to read, so add an H for human and you get |L S dash L H, which turns ^four thousand and ninety six into a plain four kilobytes. ~Same directory each time. You are just asking for more of the truth."),

"s10": dict(cmd="mkdir", exp="make directory", viz="fs-tree",
 vizNote="The tree grows. The single-level call pops one folder into place. The deep call first draws a red cross at the missing parent and the branch refuses to extend; with -p each missing level materialises in turn, top down, and the branch completes.",
 steps=["mkdir api","mkdir -p api/src/handlers"],
 stage=[("projects","this one already exists"),("api","created, one level down"),("a three-level path","asked for in one go"),
        ("src is missing","so the whole command fails"),("-p, for parents","build whatever is missing"),
        ("src","created for you"),("handlers","created for you too")],
 verdict="Without -p, the parent must already exist", vsub="which is the entire reason the plain form failed", n=
 "You need a new folder, so you reach for |make dir, short for make directory. Inside ^projects, which already exists, it drops ^api into place without fuss. Now try asking for ^a path three levels deep in a single command, and it refuses outright. Make dir only ever creates the last folder in a path, and here ^the middle level does not exist, so it has nowhere to put the bottom one. The fix is the dash P flag, short for parents, so you type |make dir dash P and it ^builds every level that is missing: ^src appears inside api, and then ^handlers appears inside src. ~Without dash P the parent has to exist first."),

"s11": dict(cmd="touch", exp="(updates timestamps)", viz="file-clocks",
 vizNote="A file card carrying a byte counter and two real clock faces labelled modify and access. The first call materialises the card at zero bytes. The second call leaves the byte counter visibly frozen while both clock hands sweep round to the current time.",
 steps=["touch notes.md","touch notes.md"],
 stage=[("no such file","before you run anything"),("notes.md","created, zero bytes"),("run it again","on the file that now exists"),
        ("the contents","completely unchanged"),("modify time","when the contents last changed"),("access time","when it was last read"),("build tools","watch exactly these clocks")],
 verdict="The contents are never touched", vsub="which is exactly why make and every build tool relies on it", n=
 "Touch looks like a command that does nothing at all, which is exactly why people skip straight past it. Start with ^a name that does not exist yet. Run |touch on it and Linux creates ^an empty file for you, zero bytes, no contents whatsoever. So far, so unremarkable. Now |run touch on that ^same file a second time. ^The contents do not change, because there are none, but two clocks attached to that file do move: the ^modify time, which records when the contents last changed, and the ^access time, which records when it was last read. And ^build tools watch those clocks. ~The content itself is never touched."),

"s12": dict(cmd="cp", exp="copy", viz="file-bytes",
 vizNote="Two file cards side by side. The original's blocks visibly duplicate across the gap into a second card, so you watch a second set of bytes come into existence. Then an edit typed into one card leaves the other card's blocks untouched.",
 steps=["cp notes.md backup.md","cp -r src/ src-old/"],
 stage=[("notes.md","the original file"),("backup.md","a second, real set of bytes"),("-r, for recursive","when it is a whole folder"),
        ("src-old/","every file inside, copied too"),("two separate files","from the moment it runs"),("edit the original","after the copy exists"),("the copy","does not follow")],
 verdict="Two separate files from the moment it runs", vsub="nothing links them together afterwards", n=
 "|C P, which is short for copy, makes a genuine second copy of a file. So ^the original stays exactly where it was, and ^a second file comes into existence holding its own bytes. If what you want is a whole folder and everything inside it, add ^the dash R flag, short for recursive, and |C P dash R walks the directory so that ^every file underneath is copied as well. Here is the part that matters. You now have ^two independent files that merely happen to hold the same contents. ^Edit the original and ^the copy does not follow, because nothing connects them. ~That seems obvious until the afternoon you edit the backup by mistake."),

"s13": dict(cmd="mv", exp="move", viz="fs-inode",
 vizNote="The file's data block is drawn once on the right with its inode number printed on it. The NAME is a separate tag that detaches and reattaches, first to a new name, then at a new location in the tree, while the inode number stays visibly identical and no second block is ever drawn.",
 steps=["mv notes.md todo.md","mv todo.md archive/"],
 stage=[("notes.md","the name you started with"),("inode 4812","the file the disk actually knows"),("todo.md","a new name, same inode"),
        ("archive/todo.md","a new folder, same inode"),("no second copy","was ever created"),("nothing was rewritten","not one byte"),("across two disks","is the one exception"),("then the bytes travel","for real")],
 verdict="No copy is made inside one filesystem", vsub="which is why moving a huge file is instant", n=
 "|M V is short for move, and it is also how you rename things, because renaming really is just moving a file to a new name in the same folder. The trick is to watch the file rather than the name on it. You start with ^notes dot M D, and underneath, the disk knows it by ^a number called an inode. Rename it and you get ^a new name sitting on the very same inode. Now |move it into another folder and ^the path changes while that inode stays exactly as it was. ^No second copy was created, and ^not one byte was rewritten. The one exception is ^moving between two disks, and ^then the bytes really do travel. ~Inside one filesystem, nothing is copied."),

"s14": dict(cmd="rm", exp="remove", viz="delete-gate",
 vizNote="The tree sits behind a delete gate. Plain rm bounces off a folder and the gate stays shut. With -i a confirmation card rises for each file in turn. With -rf the gate swings fully open and the whole subtree evaporates branch by branch while a file counter runs up to 412.",
 steps=["rm projects","rm -i -r projects","rm -rf projects"],
 stage=[("no recycle bin","Linux does not have one"),("plain rm","refuses a directory outright"),("-i, for interactive","asks before every file"),
        ("y or n","once per file, every time"),("-rf","recursive, and force"),("no question asked","not even once"),("412 files","gone, with no confirmation")],
 verdict="There is genuinely no undo", vsub="the only real protection is a backup you made earlier", n=
 "|R M is short for remove, and the first thing to understand is that ^Linux has no recycle bin waiting to catch your mistake. Point plain R M at a folder and it ^refuses, because on its own it only deletes files. Add dash I for interactive and |R M dash I ^asks you to confirm ^every single file before it goes, which is slow but survivable. The combination people actually type, though, is dash R F, meaning recursive and force. Run |R M dash R F and ^it recurses into every folder underneath while force ^suppresses every question it would have asked. ^Four hundred and twelve files, gone, without one confirmation. ~There is no undo here, and no command that brings them back."),

"s15": dict(cmd="ln", exp="link", viz="fs-inode",
 vizNote="One data block on the right with named arrows pointing at it and a live link counter. A hard link draws a second arrow straight to the block and the counter ticks up. A symlink instead draws its arrow to the NAME tag, and when that name is deleted the arrow visibly snaps and dangles.",
 steps=["ln notes.md backup.md","ln -s notes.md latest.md","rm notes.md"],
 stage=[("the data on disk","one block, one inode"),("backup.md","a hard link, straight to the data"),("link count: 2","two names, one file"),
        ("latest.md","a symbolic link, pointing at the name"),("delete notes.md","the original name goes"),
        ("backup.md still works","the data was never tied to that name"),("latest.md dangles","the name it pointed at is gone")],
 verdict="Hard links survive the original", vsub="the data lives until the very last name goes", n=
 "|L N, short for link, gives one file a second name. To see why that matters, look at ^the data itself, sitting in one place on the disk. A plain L N creates ^a hard link, a second name pointing straight at that data, and the ^link count, which counts the names attached, goes up to two. Now add dash S for symbolic and |L N dash S makes something quite different: ^a link that points at the name rather than at the data. The difference stays invisible until you |delete ^the original name. ^The hard link carries on working perfectly, because the data was never tied to that first name. ^The symbolic one is now pointing at nothing. ~The data survives until the last name goes."),

"s16": dict(cmd="clear", exp="(clears the screen)", viz="term-buffer",
 vizNote="The terminal is drawn as two stacked regions: the visible screen at the bottom and the scrollback stacked above it. clear blanks only the lower region and the scrollback stays fully rendered; a scroll-up gesture visibly recovers it. reset then wipes both regions.",
 steps=["clear","reset"],
 stage=[("the visible screen","full of output"),("the scrollback","everything above the screen"),("after clear","the screen looks empty"),
        ("the scrollback","still completely intact"),("scroll up","and it is all still there"),("after reset","the scrollback goes too")],
 verdict="clear is cosmetic, reset is not", vsub="which matters on a machine somebody else can scroll back through", n=
 "Your terminal has turned into an unreadable mess, so you run |clear. ^The screen was full of output, and above it sat ^the scrollback, everything that had already scrolled off the top. ^After clear the screen looks empty, which is genuinely useful. But look at ^the scrollback, because it is entirely intact. ^Scroll up and every line you thought you removed is still there. If you want it properly gone, |reset is the heavier tool, and ^after reset the scrollback goes as well. ~Clear is cosmetic and reset is not, which matters on a machine somebody else can scroll back through."),
}
