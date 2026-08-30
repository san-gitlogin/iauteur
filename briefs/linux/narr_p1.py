# Narration table part 1 — intro, Act 1, Act 2.
# `|` marks the word an element animates on. Markers are consumed in order:
# steps, then stage items, then perms, then verdict. Text is SPOKEN form so
# edge-tts pronounces it correctly; the screen shows the real command.
P1 = [
# ── OPEN ────────────────────────────────────────────────────────────────
dict(id="s01", type="HOOK", background="zoneA",
 narration="Your server is down. The fix is one command. You just cannot remember which one.",
 data={"headline":"THE FIX IS ONE COMMAND","subtext":"you just can't remember which","heroAsset":"si:linux","headlineAtWord":1,"heroAtWord":6},
 anchors=[]),
dict(id="s02", type="TITLE_CARD", transition="fade", background="zoneB",
 narration=("That is the gap this video closes. Every command a Linux sysadmin actually types, "
            "all hundred and nine of them, each one running on screen with what it does beside it. "
            "Welcome to THE NBX STUDIO, and settle in, because we are doing the whole set in one sitting."),
 data={"title":"109 LINUX COMMANDS","subtitle":"every one, running, explained"}, anchors=[]),
dict(id="s03", type="TOOL_BENCH", transition="dip", background="zoneA",
 narration=("Here is how we will keep a hundred and nine of anything straight. Think of your terminal as a "
            "|workbench, and every command as a tool that lives in one of ten drawers. Learn the drawers and "
            "you will always know roughly where to reach, which beats memorising a list you will forget by Friday."),
 data={"toolBench":{"headline":"One bench, [ten drawers]","color":"orange","atWord":6,
   "caption":"Learn the drawers, not the list.",
   "drawers":[{"label":"files","value":10},{"label":"text","value":13},{"label":"permissions","value":12},
     {"label":"processes","value":15},{"label":"watching","value":8},{"label":"disks","value":11},
     {"label":"network","value":10},{"label":"remote","value":10},{"label":"jobs","value":15},{"label":"help","value":6}]}},
 anchors=["toolBench.atWord"]),
dict(id="s04", type="REVEAL", transition="iris", background="zoneC",
 narration=("One warning before we start, and it is a real one. Among these hundred and nine tools sits a command "
            "that will wipe an |entire disk in four characters. No prompt, no confirmation, nothing in a bin "
            "afterwards. It is on every beginner list, and we will get to it."),
 data={"reveal":{"statement":"One of them wipes a disk in four characters.","sub":"no prompt · no undo","atWord":9}},
 anchors=["reveal.atWord"]),
dict(id="s05", type="LIST_BUILD", transition="wipe", background="zoneB",
 narration=("We will work through the drawers in order. |Files and the text inside them. Then |who is allowed to "
            "touch what. Then the |processes running right now, and how you watch a machine properly. Then |disks "
            "and the network. And finally the |jobs and sessions that outlive you closing the laptop."),
 data={"heading":"Ten drawers, in order","items":[
   {"icon":"lucide:folder","text":"Files and text","detail":"drawers 1 and 2"},
   {"icon":"lucide:shield","text":"Users and permissions","detail":"drawer 3"},
   {"icon":"lucide:activity","text":"Processes and watching","detail":"drawers 4 and 5"},
   {"icon":"lucide:hard-drive","text":"Disks and network","detail":"drawers 6 to 8"},
   {"icon":"lucide:clock","text":"Jobs and sessions","detail":"drawers 9 and 10"}]},
 anchors=["items.0.atWord","items.1.atWord","items.2.atWord","items.3.atWord","items.4.atWord"]),

# ── ACT 1 ───────────────────────────────────────────────────────────────
dict(id="s06", type="CHAPTER", transition="push", background="zoneA",
 narration="Drawer one. Moving around, and handling files.",
 data={"chapter":{"number":"01","title":"Moving around","subtitle":"and handling files","color":"blue"}}, anchors=[]),

dict(id="s07", type="CMD_CD", transition="fade", background="zoneB",
 narration=("Every shell session stands in exactly one directory, and |C D is how you move. An |absolute path "
            "starts at the root slash, so it works from anywhere. A |relative path starts from wherever you are "
            "standing right now. Watch the |root, then |home, then |dev, then |api light up as we go, because "
            "the tree never moves. |Only you do."),
 headline="cd moves [you], not the files"),
dict(id="s08", type="CMD_PWD", transition="dip", background="zoneC",
 narration=("Lost track of where you are? |P W D prints it, and it always answers from the |root, then |home, then "
            "your |account, then the |directory you are standing in. |Never a relative path, which is why scripts "
            "trust it."),
 headline="pwd prints [where you stand]"),
dict(id="s09", type="CMD_LS", transition="push", background="zoneA",
 narration=("|L S gives you names and nothing else. Add |dash L and the same directory becomes one row per file, "
            "carrying |permissions, the |owner, the |size in bytes, and the |date it last changed. |Dash H turns "
            "those byte counts into something a person can read."),
 headline="ls shows names. [ls -l] shows the truth"),
dict(id="s10", type="CMD_MKDIR", transition="wipe", background="zoneB",
 narration=("|Make dir creates a directory, but only one level. Add |dash P and it builds every missing level in "
            "the path at once, so |api, then |src, then |handlers all appear from a single command. |Without dash P "
            "it simply fails, because the parent has to exist first."),
 headline="mkdir -p builds the [whole chain]"),
dict(id="s11", type="CMD_TOUCH", transition="dip", background="zoneC",
 narration=("|Touch looks pointless until you know what it is for. Run it on a name that does not exist and you get "
            "an |empty file. Run it |again on the same file and nothing inside changes, only the |modify clock and "
            "the |access clock move. |That is why build tools lean on it so heavily."),
 headline="touch sets [timestamps], not content"),
dict(id="s12", type="CMD_CP", transition="fade", background="zoneA",
 narration=("|C P copies a file, and |dash R copies a whole directory. Here is the part that matters: from the "
            "moment the copy exists, you have two separate files. Edit the |original and the |copy does not follow. "
            "|Obvious, right up until the day you edit the backup by mistake."),
 headline="cp makes a [second file]"),
dict(id="s13", type="CMD_MV", transition="push", background="zoneB",
 narration=("|M V moves a file, and it also |renames one, because renaming really is just moving something to a new "
            "name in the same folder. The |old name goes, the |new name appears, and it is still the |same file "
            "underneath. |No copy is ever made."),
 headline="mv renames and moves — [same command]"),
dict(id="s14", type="CMD_RM", transition="iris", background="zoneC",
 narration=("|R M deletes, and Linux has no recycle bin. |Dash I makes it ask you first, once per file. But "
            "|R M dash R F asks nothing at all. |Plain R M at least refuses a directory. |Dash I protects you if you "
            "remember it. |Dash R F protects nobody. |Four hundred files, gone, with no confirmation."),
 headline="Every guard on [rm] is opt-in"),
dict(id="s15", type="CMD_LN", transition="wipe", background="zoneA",
 narration=("|L N gives one file a second name. With |dash S you get a symbolic link instead, which points at the "
            "name rather than the data. So when we |delete the original, the |hard link still works perfectly, the "
            "|symbolic one is left dangling, and the |link count drops by one. |Hard links survive deletion."),
 headline="A hard link is a [second name]"),
dict(id="s16", type="CMD_CLEAR", transition="dip", background="zoneB",
 narration=("|Clear wipes the screen, and that is genuinely all it does. |Reset goes further. After clear, your "
            "|screen looks empty but the |scrollback is still sitting there, and after reset that |scrollback is "
            "gone as well. |Scroll up and you will see everything clear pretended to remove."),
 headline="clear hides. [reset] forgets"),
dict(id="s17", type="QUIZ_CARD", transition="fade", background="zoneC",
 narration=("Quick check. You delete the original file. |Which kind of link still works, hard or symbolic? Have a "
            "think, and pause here if you want longer. |Ready? It is the hard link, because that one points at the "
            "data itself rather than at a name."),
 data={"quiz":{"question":"Delete the original — which link still works?","options":[
   {"text":"The symbolic link"},{"text":"The hard link"},{"text":"Both of them"},{"text":"Neither"}],
   "answerIndex":1,"why":"A hard link points at the data, not at the name.","atWord":2,"revealAtWord":20}},
 anchors=["quiz.atWord","quiz.revealAtWord"]),
dict(id="s18", type="RECAP", transition="push", background="zoneA",
 narration=("So drawer one is your hands. |Move with C D and look with L S. |Build with make dir and touch. "
            "|Duplicate with C P and rename with M V. And |delete with R M, which is the one to respect."),
 data={"heading":"Drawer one, on the bench","points":[
   {"text":"cd and ls to move and look"},{"text":"mkdir and touch to build"},
   {"text":"cp and mv to duplicate"},{"text":"rm deletes with no undo"}]},
 anchors=["points.0.atWord","points.1.atWord","points.2.atWord","points.3.atWord"]),

# ── ACT 2 ───────────────────────────────────────────────────────────────
dict(id="s19", type="CHAPTER", transition="dip", background="zoneB",
 narration="Drawer two. Reading text, and finding it.",
 data={"chapter":{"number":"02","title":"Reading text","subtitle":"and finding it","color":"green"}}, anchors=[]),
dict(id="s20", type="CMD_CAT", transition="fade", background="zoneC",
 narration=("|Cat prints a whole file to the screen at once. On a small |config file that is perfect. On a ten "
            "thousand line |log it is useless, because the whole thing scrolls past faster than you can read. "
            "|Cat has no brakes, and that is exactly what less is for."),
 headline="cat prints [everything], instantly"),
dict(id="s21", type="CMD_TAC", transition="push", background="zoneA",
 narration=("|Cat spelled backwards is tac, and |tac prints the file backwards too. The |newest line comes first, "
            "then the |middle, then the |oldest last. |Handy, because in most logs the line you want is at the bottom."),
 headline="tac is cat, [backwards]"),
dict(id="s22", type="CMD_MORE", transition="wipe", background="zoneB",
 narration=("|More shows a long file one screen at a time. Press space and you get the |next screen, and the "
            "|one after that. But try to go |back and you cannot. |More reaches the end and quits, which is why "
            "almost nobody uses it any more."),
 headline="more only goes [forward]"),
dict(id="s23", type="CMD_LESS", transition="dip", background="zoneC",
 narration=("|Less does the same job and then some. You can scroll |down, you can scroll |up, and pressing "
            "|slash searches inside the file. It also |never loads the whole thing into memory, which is how it "
            "opens a ten gigabyte log instantly."),
 headline="less goes [both ways]"),
dict(id="s24", type="CMD_TAIL", transition="fade", background="zoneA",
 narration=("|Tail shows you the end of a file, and |dash F keeps it open so new lines appear as the service "
            "writes them. Watch: a |request lands, then |another, then the |timeout you were waiting for. "
            "|This is the command you leave running while you reproduce a bug."),
 headline="tail -f watches it [happen]"),
dict(id="s25", type="CMD_VI", transition="push", background="zoneB",
 narration=("|V I traps more beginners than any other command, and the reason is modes. You start in |command "
            "mode where keys are instructions. Press |I and you are in insert mode where keys are text. So: "
            "|command mode first, |press I to type, |escape to get back, and |colon W Q to write and quit. "
            "|That sequence is worth memorising once."),
 headline="vi has [two modes]"),
dict(id="s26", type="CMD_DIFF", transition="iris", background="zoneC",
 narration=("|Diff compares two files line by line and prints only what actually changed. The |old line is marked "
            "as removed, the |new line as added, and |everything identical is skipped entirely. |Two lines of "
            "output instead of two whole files."),
 headline="diff shows [only the change]"),
dict(id="s27", type="CMD_FIND", transition="wipe", background="zoneA",
 narration=("|Find walks the tree and tests every single file against your criteria. Add |dash M time and you are "
            "filtering by age as well. So |api dot log survives, |web dot log survives, |old dot log is too old, "
            "and |notes dot M D is not a log at all. |Find is slow because it genuinely looks at everything."),
 headline="find [tests] every single file"),
dict(id="s28", type="CMD_LOCATE", transition="dip", background="zoneB",
 narration=("|Locate answers instantly, and the reason is that it never touches your disk. It reads a |database "
            "built overnight. So a file from |last week is found immediately, but a file you made this |morning is "
            "simply missing. |Locate can be fast and wrong at the same time."),
 headline="locate is fast, and can be [wrong]"),
dict(id="s29", type="CMD_GREP", transition="fade", background="zoneC",
 narration=("|Grep searches inside files and prints every line that matches. |Dash C gives you just the count "
            "instead. And |dash V flips the whole thing around. |Dash I ignores case, |dash R walks directories, "
            "|dash C counts, and |dash V shows you everything that does not match. |That last one is the flag "
            "people forget they have."),
 headline="grep finds the [matching lines]"),
dict(id="s30", type="CMD_AWK", transition="push", background="zoneA",
 narration=("|Awk splits every line into numbered fields, so dollar three means the third column. Chain it and "
            "you can |sum that column too. Here the |first field is the filesystem, the |second is the size, and "
            "the |third is what is used. |Whitespace does the splitting for free, no parsing code required."),
 headline="awk splits a line into [fields]"),
dict(id="s31", type="CMD_SED", transition="dip", background="zoneB",
 narration=("|Sed edits text as it flows past. It |reads a line, |matches your pattern, and |emits the changed "
            "version. Add a |G on the end and it replaces every match on the line rather than just the first. "
            "|Dash I edits the file in place, and without it nothing is actually saved."),
 headline="sed edits the [stream]"),
dict(id="s32", type="CMD_XARGS", transition="wipe", background="zoneC",
 narration=("Here is a pipe that quietly does nothing. |Find prints names, but |R M reads arguments, not input, "
            "so nothing gets deleted. Add |xargs and the names become arguments. |Find prints, |R M expects "
            "arguments, |xargs converts between them, and |now the delete actually runs."),
 headline="xargs turns input into [arguments]"),
dict(id="s33", type="QUIZ_CARD", transition="fade", background="zoneA",
 narration=("Quick one. You want every line that does |not contain the word error. Which grep flag? Have a think, "
            "and pause here if you need longer. |Ready? Dash V, because dash V inverts the match."),
 data={"quiz":{"question":"Every line WITHOUT \"error\" — which flag?","options":[
   {"text":"-i"},{"text":"-r"},{"text":"-v"},{"text":"-c"}],
   "answerIndex":2,"why":"-v inverts the match, printing what does not match.","atWord":2,"revealAtWord":22}},
 anchors=["quiz.atWord","quiz.revealAtWord"]),
dict(id="s34", type="RECAP", transition="push", background="zoneB",
 narration=("Drawer two is your eyes. |Cat and less to read, tail to follow. |Find walks the disk, locate guesses "
            "from an index. |Grep matches, awk splits into columns, sed rewrites. And |xargs joins one command "
            "to the next."),
 data={"heading":"Drawer two, on the bench","points":[
   {"text":"cat, less, tail to read"},{"text":"find walks, locate guesses"},
   {"text":"grep, awk, sed to search and edit"},{"text":"xargs chains them"}]},
 anchors=["points.0.atWord","points.1.atWord","points.2.atWord","points.3.atWord"]),
]
