# -*- coding: utf-8 -*-
# Batch 2 — Act 2: reading text, and finding it.
B2 = {
"s20": dict(cmd="cat", exp="concatenate", viz="file-content",
 vizNote="A document panel holding the real file. On the small file all three lines settle and stay. On the big one the lines blur upward at speed and a counter races past 10,241 while the panel stays unreadable — you SEE why it is useless.",
 steps=["cat hosts","cat api.log"],
 stage=[("hosts","three lines long"),("all of it, at once","and it fits on the screen"),("api.log","ten thousand lines long"),
        ("still all at once","cat knows no other way"),("it scrolls past","faster than you can read"),("no way to pause","not even for a moment"),("no way to go back","the top is already gone")],
 verdict="cat has no brakes", vsub="which is precisely what less was written for", n=
 "|Cat is short for concatenate, and its actual job is to print a file straight to your screen. Point it at ^a small config file, three lines long, and you get ^the whole thing at once, which is exactly right. Now take ^a log file with ten thousand lines in it and |run cat on that instead. It does ^exactly the same thing, because printing everything is the only behaviour it has. ^The output scrolls past far faster than you can read, ^there is no way to pause it, and ^no way to scroll back to the top. ~Cat has no brakes, and that is precisely what less was written for."),

"s21": dict(cmd="tac", exp="cat, spelled backwards", viz="file-content",
 vizNote="The same document panel, but the line order visibly inverts: the bottom line lifts to the top and the rest fall in behind it, so the reversal is something you watch happen rather than read about.",
 steps=["cat api.log","tac api.log"],
 stage=[("line 1","09:01 service started"),("line 2","09:30 warning"),("line 3","09:47 crashed"),
        ("now reversed","the file is read bottom up"),("09:47 crashed","the newest line, first"),("09:01 started","the oldest, last"),("the file is unchanged","tac only alters the output")],
 verdict="Newest first, and no flags needed", vsub="in most logs the line you want is the last one", n=
 "|Cat prints a file from the top down, so you get ^line one, then ^line two, then ^line three, oldest first. That is the wrong way round for a log, where the line you care about is nearly always the last one written. Somebody noticed, and named the fix by spelling cat backwards. That tool is |tac, and it reads the file ^from the bottom upwards. So ^the crash at nine forty seven arrives first, and ^the startup message from nine o'clock comes last. ^And the file itself is untouched; only the output order changed. ~No flags, no pipe, no arguments. In most logs the line you want is the final one."),

"s22": dict(cmd="more", exp="(show more of it)", viz="file-viewport",
 vizNote="A long document with a viewport frame over it. Space advances the frame down the page in real jumps. When the viewer tries to go back the frame is pinned by a hard stop and refuses, then the whole document closes at the end.",
 steps=["more api.log"],
 stage=[("the file","far longer than one screen"),("screen one","the first forty lines"),("press space","and it advances"),
        ("screen two","the next forty lines"),("try to go back","and you simply cannot"),("no way back","not even one line"),("reach the end","and more quits on you"),("less replaced it","for exactly this reason")],
 verdict="One direction only, then it exits", vsub="which is the whole reason less exists", n=
 "Before less existed this was the tool everybody used, and it is still on every machine you will ever log into. You point |more at ^a file far longer than your screen, and it hands you ^the first forty lines or so. ^Press the space bar and it moves you ^down to the next forty. That much is genuinely useful. But now try to go back to something you just read, and ^you simply cannot, because more only ever travels forwards. ^Not even one line back. And once you ^reach the bottom it quits on you. ^And that is why less replaced it. ~One direction, then it exits, which is the frustration less was built to fix."),

"s23": dict(cmd="less", exp="(the opposite of more)", viz="file-viewport",
 vizNote="Same viewport, but now it moves freely in both directions, and a search jumps it straight to a match that lights up. A memory gauge beside the file stays low while the file size reads 10GB, showing it never loads the whole thing.",
 steps=["less api.log","/timeout"],
 stage=[("scroll down","a page at a time"),("scroll back up","which more could never do"),("a ten gigabyte file","opens instantly"),
        ("it never loads it all","only the part you are reading"),("search inside the file","press slash, then type"),("jump to the match","wherever it sits")],
 verdict="It reads the file lazily", vsub="which is why file size stops mattering at all", n=
 "|Less does everything more did, and then fixes what more got wrong. You can ^scroll down a page at a time, and crucially you can ^scroll back up, which more could never manage. Then there is the part that genuinely surprises people. Open ^a ten gigabyte log with less and it appears on screen instantly, because ^it never loads the whole file into memory; it reads only the piece you are looking at. And when you know roughly what you are hunting for, |press slash to ^search inside the file and it will ^jump straight to the match. ~That is why file size stops mattering."),

"s24": dict(cmd="tail", exp="(the tail of the file)", viz="file-content",
 vizNote="The document panel is pinned to the bottom of the file. With -f new lines genuinely arrive from below and push the view up, one at a time, with a live pulse on the follow indicator so it reads as a stream rather than a static list.",
 steps=["tail -n 20 api.log","tail -f api.log"],
 stage=[("the last 20 lines","and nothing above them"),("-f, for follow","keeps the file open"),("a request arrives","and appears live"),
        ("another arrives","still watching"),("upstream timeout","the line you were waiting for"),("it never exits","until you stop it"),("Ctrl-C","is how you let it go")],
 verdict="This is the one you leave running", vsub="a bug you can watch happen is a bug you can fix", n=
 "In a log of thousands of lines, the ones you want sit at the bottom. |Tail gives you exactly that: ^the last twenty lines, nothing above them. That alone saves a lot of scrolling, and most of the time it is all you need. But the flag that genuinely matters here is dash F, for follow. Run |tail dash F and ^the file is held open, so new lines appear as the service writes them. ^A request comes in live. ^Then another. And then ^the upstream timeout you were waiting for. ^It never exits on its own; ^control C is how you let it go. ~This is the command you leave running while you reproduce the bug."),

"s25": dict(cmd="vi", exp="visual editor", viz="mode-machine",
 vizNote="A real mode indicator drawn as a two-state machine with the keyboard beneath it. In command mode the keys are labelled with actions; press i and the very same keys visibly relabel as letters. Escape flips them back. The state, not a caption, is what changes.",
 steps=["vi notes.md","i",":wq"],
 stage=[("command mode","where you always start"),("keys are instructions","not letters"),("press i","for insert"),
        ("now keys are text","the same keys, different meaning"),("press Escape","back to command mode"),
        (":w","write the file"),(":q","quit the editor")],
 verdict="Escape, colon, w, q", vsub="the one sequence worth memorising on day one", n=
 "|V I traps more beginners than any other command on this list, and the reason is modes. When it opens you are in ^command mode, which means ^the keys are instructions rather than letters. Press J and you move down; you do not type a J. That is why typing your name appears to do nothing sensible. |Press I, ^which stands for insert, and ^those very same keys now produce text on the page. When you are done, ^press Escape and they turn straight back into commands. To save and leave, type a colon, then |W to ^write the file, then Q to ^quit the editor. ~Escape, colon, W, Q. Memorise that one sequence and V I stops being frightening."),

"s26": dict(cmd="diff", exp="difference", viz="text-compare",
 vizNote="Two file columns aligned line for line. Identical lines dim right down to near-invisible while the changed pair stays lit, one marked as removed and one as added, so the eye is pulled to the two lines that matter.",
 steps=["diff old.conf new.conf"],
 stage=[("two config files","almost identical"),("line by line","diff walks both at once"),("everything matching","is dimmed away"),
        ("listen 80","removed from the old file"),("listen 443 ssl","added in the new one"),("two lines of output","instead of two whole files"),("nothing else is mentioned","because nothing else moved"),("diff -u","the format every patch uses")],
 verdict="It shows you only what moved", vsub="and diff -u is the format every patch is written in", n=
 "You have ^two config files that are almost identical, and something in one of them has broken the service. Rather than read both and trust your eyes, run |diff, which walks ^both files line by line at the same moment. ^Everything that matches is dimmed away, and ^nothing else is mentioned at all. What is left is the pair that genuinely differs: ^the old listen line on port eighty, marked as removed, and ^the new one on four four three, marked as added. Two entire files reduced to ^two lines. ^Add dash U for the unified format. ~That is what every patch you have ever applied is written in."),

"s27": dict(cmd="find", exp="(find files)", viz="fs-walk",
 vizNote="The tree is walked visibly, folder by folder, with a moving probe that tests each file and stamps it kept or rejected. Adding -mtime re-runs the walk and a file that passed the first test is now visibly rejected on age.",
 steps=["find . -name '*.log'","find . -name '*.log' -mtime -2"],
 stage=[("it walks the whole tree","folder by folder"),("api.log","matches the name"),("notes.md","is not a log at all"),
        ("-mtime -2","changed in the last two days"),("web.log","two hours old, kept"),("old.log","ninety days old, rejected"),
        ("no index anywhere","it genuinely checks every file")],
 verdict="Slow, because it really does look", vsub="which is also why the answer is always current", n=
 "|Find does exactly what the name says, and it does it the hard way. ^It walks the entire tree beneath wherever you point it, folder by folder, testing every file against your conditions. Ask it for anything ending in dot log and ^api dot log matches, while ^notes dot M D is rejected because it is not a log. Conditions stack, so add |dash M time minus two and you are now also asking for ^files changed in the last two days. ^Web dot log is two hours old and stays, but ^old dot log is ninety days old and drops out. ^There is no index behind this. ~Find is slow because it genuinely looks."),

"s28": dict(cmd="locate", exp="(locate files, from an index)", viz="index-vs-disk",
 vizNote="Two panels: the live disk on one side and a database snapshot stamped 03:00 on the other. locate visibly queries only the snapshot. A file created at 08:00 appears on the disk panel and is conspicuously absent from the snapshot.",
 steps=["locate notes.md","locate new.md"],
 stage=[("a database","built at three this morning"),("locate never reads the disk","it only reads that database"),
        ("notes.md","made last week, and in the index"),("found instantly","no walking required"),
        ("new.md","created at eight this morning"),("not in the index","so locate cannot see it"),("updatedb","rebuilds it on demand")],
 verdict="Run updatedb to refresh it", vsub="or use find whenever the answer has to be current", n=
 "|Locate answers the same question as find, but in a fraction of a second, and the reason is worth knowing. Somewhere on your machine sits ^a database of filenames, rebuilt in the small hours. ^Locate never touches your disk at all; it only searches that database. So ^a file you made last week is in the index and comes back ^instantly, with no walking at all. But |ask it for ^a file you created at eight this morning and you get nothing, because ^the index has not been rebuilt since three. ^Running updatedb rebuilds it on demand. ~Locate can be fast and wrong at the same time, so use find when it has to be current."),

"s29": dict(cmd="grep", exp="global regular expression print", viz="file-content",
 vizNote="The document panel holds the whole log. Matching lines light and lift clear of the page while non-matching lines dim. With -c the lit lines collapse into a single count. With -v the lighting visibly inverts, which is the point people forget.",
 steps=["grep timeout api.log","grep -c timeout api.log","grep -v timeout api.log"],
 stage=[("every line holding the word","lifted out of the file"),("-i","ignore upper and lower case"),("-r","search whole directories"),
        ("-c, for count","just how many, not which"),("-v, for invert","everything that does NOT match"),
        ("the lines you are hiding","are usually the noise")],
 verdict="-v is the flag people forget they own", vsub="show me everything except this", n=
 "|Grep searches inside files and prints ^every line containing what you asked for, which makes it the single most used tool on this list. The name comes from an old editor command, global regular expression print. A few flags carry most of the weight. ^Dash I ignores case, so timeout and Timeout both match. ^Dash R searches whole directories rather than one file. |Dash C, for count, gives you ^just the number of matching lines instead of the lines themselves. And |dash V, for invert, ^returns everything that does not match. ^That last one hides the noise. ~Dash V is the flag people forget they have."),

"s30": dict(cmd="awk", exp="Aho, Weinberger and Kernighan", viz="field-split",
 vizNote="A single line of output is drawn once, then visibly cut at each run of whitespace into numbered field chips, so $1 $2 $3 are things you watch the line become. Selecting $3 pulls that chip out of every row and stacks them into a column that then sums.",
 steps=["df -h | awk '{print $3}'","awk '{s+=$3} END {print s}'"],
 stage=[("one line of output","before anything is done to it"),("split on whitespace","automatically, for free"),
        ("$1","the filesystem name"),("$2","the total size"),("$3","the amount used"),
        ("print $3","pulls that column out"),("add them up","as they go past")],
 verdict="No parsing code required", vsub="whitespace does the splitting for you", n=
 "Awk is named after the three people who wrote it, and it exists to pull columns out of text. Take ^one line of output. |Awk ^splits it on whitespace automatically, without you writing a single line of parsing code, and numbers the pieces. ^Dollar one is the filesystem, ^dollar two is the total size, ^dollar three is the amount used. So asking for ^dollar three pulls that column out of every row at once. And because awk runs your snippet on each line in turn, you can |keep a running total and ^add the column up as it goes past. ~That is why awk beats writing a parser for a one-off question."),

"s31": dict(cmd="sed", exp="stream editor", viz="text-transform",
 vizNote="Lines flow through a transform box one at a time: the original enters on the left, the matched portion lights inside the box, and the altered line leaves on the right. Adding g visibly changes how many occurrences light on the same line.",
 steps=["sed 's/8080/443/' app.conf","sed -i 's/8080/443/g' app.conf"],
 stage=[("a line goes in","one at a time"),("the pattern matches","8080, inside that line"),("the changed line comes out","with 443 instead"),
        ("only the first match","on each line, by default"),("add g, for global","and every match changes"),
        ("nothing was saved","the file on disk is untouched"),("-i, for in place","now it really is edited")],
 verdict="Without -i, sed only prints", vsub="which is a mercy the first few times you use it", n=
 "|Sed is short for stream editor, and it edits text as that text flows past it. ^A line goes in, ^the pattern you gave it matches somewhere inside, and ^the altered line comes out the other side. There is a catch that bites everybody once: by default it changes ^only the first match on each line. ^Add a G on the end, for global, and it changes every one. And here is the bigger catch. Everything you have just watched printed to the screen, but ^the file on disk was never modified at all. |Add dash I, for in place, and ^now it genuinely is edited. ~Without dash I, sed only ever prints."),

"s32": dict(cmd="xargs", exp="(extended arguments)", viz="pipe-flow",
 vizNote="A pipe drawn as a real channel between two programs. Filenames travel down it and pile up at a wall labelled standard input, because rm has no door on that side. xargs is inserted as an adapter that visibly converts the stream into arguments handed to rm.",
 steps=["find . -name '*.log' | rm","find . -name '*.log' | xargs rm"],
 stage=[("find prints names","down the pipe"),("rm reads arguments","not the pipe"),("nothing is deleted","and no error is shown"),
        ("xargs sits in between","and converts one into the other"),("rm a.log b.log","one call, every name attached"),
        ("now it actually runs","and the files are gone")],
 verdict="Use -print0 with -0 for odd names", vsub="a filename with a space breaks the simple form", n=
 "Here is a pipeline that looks completely reasonable and quietly does nothing at all. |Find ^prints its filenames down the pipe, exactly as you would expect. But ^R M does not read from a pipe. It reads arguments, the words you type after the command. So the names arrive, nothing is listening, and ^not a single file is deleted, with no error to tell you. |Xargs is the adapter that fixes it. ^It sits in the middle, reads the incoming names, and ^hands them to R M as arguments instead, so ^the delete finally runs. ~If your filenames contain spaces, use dash print zero with dash zero."),
}
