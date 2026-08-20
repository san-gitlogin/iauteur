# -*- coding: utf-8 -*-
# Batch 9 — Act 9: archives, cron, systemd, tmux. Act 10: getting unstuck.
B9 = {
"s121": dict(cmd="tar", exp="tape archive", viz="archive-box",
 vizNote="Each letter of czvf is drawn as a separate mechanical action on the pipeline: files gather into one container, the container is squeezed by gzip, names scroll past as they go in, and the output filename is attached at the end. Swapping c for x runs the whole pipeline backwards.",
 steps=["tar -czvf logs.tar.gz /var/log"],
 stage=[("tar means tape archive","from when that was literal"),("c","create a new archive"),
        ("z","compress it, with gzip"),("v","verbose, print each name"),
        ("f logs.tar.gz","the output file, and f must come last"),
        ("swap c for x","and it extracts instead"),("the other three","never change at all")],
 verdict="x replaces c to extract", vsub="which is genuinely the whole of what you need to remember", n=
 "This is the most googled command on the entire list, and it does not have to be. The name is short for ^tape archive, from back when that was literal. Those four letters after the dash are four separate instructions wearing one coat, so let us take them apart. |C ^creates a new archive, gathering many files into one. ^Z compresses that archive using gzip. ^V is verbose, printing each name as it goes in. And ^F names the output file, which is why F always comes last: whatever follows it is the filename. Now the part that saves you. ^Swap the C for an X and the whole thing runs backwards and extracts, while ^the other three letters stay exactly as they were. ~X to extract, C to create."),

"s122": dict(cmd="gzip", exp="GNU zip", viz="archive-box",
 vizNote="The original file is drawn being consumed as the compressed one grows, so the replacement is something you watch happen. With -k a duplicate is retained beside it and the original visibly survives.",
 steps=["gzip api.log","gzip -k api.log"],
 stage=[("41 megabytes","before"),("6 megabytes","after"),
        ("the original is gone","gzip replaced it"),("that surprises people","every single time"),
        ("-k keeps it","for when you need both"),("about a second","to compress that file")],
 verdict="It replaces the file by default", vsub="so -k is the flag to remember before you need it", n=
 "|Gzip, which is short for G N U zip, shrinks a single file, and it is very good at it: ^forty one megabytes of log goes in and ^six megabytes comes out. But there is a behaviour here that catches everybody exactly once. ^The original file is gone. Gzip did not make a copy alongside it; it replaced it, and you now have only the compressed version. ^That surprises people every single time, particularly inside a script that expected to read the original afterwards. So |add ^dash K, for keep, and both files survive. And it is quick: ^that took about a second. ~It replaces by default, so learn dash K before you need it rather than after."),

"s123": dict(cmd="bzip2", exp="block-sorting compressor", viz="archive-box",
 vizNote="Two compressors run side by side against a real clock and a real output size, so the trade is a race you watch rather than two numbers you compare.",
 steps=["bzip2 api.log"],
 stage=[("gzip","1.2 seconds, 6 megabytes"),("bzip2","8.4 seconds, 4.5 megabytes"),
        ("seven times slower","for a megabyte and a half"),("a log you rotate nightly","is not worth that"),
        ("an archive you keep for years","absolutely is"),("write once, read never","is where it pays"),("xz goes further still","slower again, smaller again"),("gzip stays the default","because it is fast enough"),("check it is installed","bzip2 is not always there")],
 verdict="Worth it for archives, not for logs", vsub="the question is how often you will pay the cost back", n=
 "Gzip is fast, and for almost anything you compress it is good enough. Every so often you want the file as small as it will go. That is when you reach for |B zip two. Run both against the same log. ^Gzip finishes in a second, giving six megabytes. ^B zip two takes eight and a half, giving four and a half. You are paying ^seven times the processor time for a megabyte and a half. Whether that is worth it depends on what happens next. ^For a log you rotate nightly, it is a waste. ^For an archive you keep for seven years, it is obviously right. ^Write once, read almost never, is where it pays. ^X Z goes further still. ^But gzip stays the default, because it is fast enough and ^always installed. ~Match the compressor to how often you pay the cost back."),

"s124": dict(cmd="zip", exp="(the zip format)", viz="archive-box",
 vizNote="A tar.gz is drawn as one continuous compressed stream that must be read from the start, while a zip is drawn with a real index at its end and a single file pulled straight out of the middle.",
 steps=["zip -r report.zip report/"],
 stage=[("tar.gz","one compressed stream"),("to reach a file inside","you decompress from the start"),
        ("zip","compresses each file separately"),("and keeps an index","at the end of the archive"),
        ("so pull one file out","without touching the rest"),("and it opens by double click","on any machine, anywhere")],
 verdict="Send zip to people, tar.gz to servers", vsub="the format you choose is really about who opens it", n=
 "You have an archive that needs to go to somebody who has quite honestly never opened a terminal window in their entire life. |Zip is what they can open, and the difference from tar dot gz is structural. ^A tar dot gz is a single compressed stream, so ^to reach one file in the middle you have to decompress everything before it. ^Zip compresses each file separately ^and keeps an index at the end of the archive. That means you can ^pull one file straight out without touching the rest. ^And it opens with a double click on any operating system. ~So the rule is really about who opens it. Send zip to people and tar dot gz to servers."),

"s125": dict(cmd="cron", exp="from chronos, time", viz="sched-clock",
 vizNote="The five fields are drawn above a real clock and calendar. Each field lights the part of time it governs, and the resulting firing moments are marked on a week strip — so five stars visibly lighting every minute is the point made without words.",
 steps=["30 2 * * 1 /opt/backup.sh"],
 stage=[("field 1","the minute, 0 to 59"),("field 2","the hour, 0 to 23"),
        ("field 3","day of the month"),("field 4","the month"),
        ("field 5","day of the week, 0 is Sunday"),("a star means every one","of whatever that field counts"),
        ("so this runs","at 2:30 on Mondays")],
 verdict="Five stars is every single minute", vsub="which is the classic way to accidentally take a server down", n=
 "Scheduling on Linux comes down to one line of five numbers, and almost everybody copies that line from somewhere else without ever reading it properly. |Cron is five fields in a fixed order, and that order is the whole trick. ^The first field is the minute, zero to fifty nine. ^The second is the hour, zero to twenty three. ^The third is the day of the month. ^The fourth is the month. ^The fifth is the day of the week, where zero is Sunday. Then ^a star simply means every one of whatever that field counts. So this line means ^half past two in the morning, on Mondays only. ~Five stars means every single minute of every day, which is how people take servers down by accident."),

"s126": dict(cmd="crontab", exp="cron table", viz="fs-writes",
 vizNote="Two routes to the same file drawn side by side: crontab -e passes through a validator that rejects a bad line before installing, while editing the file directly bypasses the validator entirely and the bad line lands unchecked.",
 steps=["crontab -e","crontab -l"],
 stage=[("crontab -e","opens your table in an editor"),("it validates on save","before installing anything"),
        ("a bad line is rejected","and you are told about it"),("editing the file directly","skips that check completely"),
        ("cron then skips the job","silently, forever"),("crontab -l","shows what is actually loaded"),
        ("which is the only proof","that your job exists")],
 verdict="A bad line fails silently", vsub="nothing emails you, nothing logs it, the job simply never runs", n=
 "Cron is the schedule; |crontab is how you edit it. ^Dash E opens your table in an editor, and the important bit is that ^it validates the file when you save. ^A syntax error is rejected there and then, with a message telling you. Now compare that with editing the crontab file directly on disk, which people do all the time. ^That skips the check completely, and ^cron will simply skip the broken job, silently, forever. No email, no log entry, nothing. Which is why |dash ^L matters: it prints what is actually loaded right now, and ^that is the only real proof your job exists. ~A schedule you never verified is not a schedule."),

"s127": dict(cmd="bash script", exp="(a file of commands)", viz="fs-writes",
 vizNote="The file is drawn with its permission bits visible. The execute bit is off and the run attempt is refused; chmod +x physically flips that one bit and the same command then succeeds. PATH is drawn as a list of folders with the current directory conspicuously absent.",
 steps=["./backup.sh","chmod +x backup.sh","./backup.sh"],
 stage=[("permission denied","on a file you just wrote"),("the execute bit","is not set on new files"),
        ("chmod +x","flips exactly that one bit"),("now it runs","the same command as before"),
        ("the first line","names the interpreter"),("#!/usr/bin/env bash","is called the shebang"),
        ("./ is required","because . is not in your PATH")],
 verdict="The current folder is deliberately not in PATH", vsub="so a file named ls in a shared folder cannot hijack your commands", n=
 "A script is just a file with commands in it, and yet |the first time you run one you get ^permission denied. Here is why. ^New files are not created executable, because that would be a terrible default. So |change mod plus X ^flips exactly that one bit, and ^the very same command now works. Two more details. ^The first line of the script names the interpreter that should run it, and ^that line is called the shebang. And |you ^have to write dot slash in front of the name, because the current folder is deliberately not in your search path. ~That is a security decision: if it were, dropping a file called L S into a shared directory would hijack everyone's commands."),

"s128": dict(cmd="alias", exp="(another name for it)", viz="env-scope",
 vizNote="Two nested scopes drawn as real boundaries: the running shell, and the config file that seeds every future shell. An alias typed at the prompt lives only in the inner box and disappears when it closes; written to bashrc it appears in each new box.",
 steps=["alias ll='ls -lah'","echo \"alias ll='ls -lah'\" >> ~/.bashrc"],
 stage=[("typed at the prompt","it works immediately"),("but only in this shell","and only until you close it"),
        ("open a new terminal","and it is gone"),("append it to ~/.bashrc","which every new shell reads"),
        ("now it survives","every session, forever"),("scripts still cannot see it","which catches people out"),
        ("because a script","runs a non-interactive shell")],
 verdict="Your scripts do not inherit your aliases", vsub="which is exactly why a command works for you and fails in cron", n=
 "|Alias binds a long command to a short name, and the trap is about where that binding lives. ^Type it at the prompt and it works straight away, ^but only inside this one shell, and only until you close it. ^Open a new terminal and it has gone. If you want it to outlive the session, |append it to ^your bashrc, which every new shell reads on startup, and ^now it survives forever. But here is the one that catches people. ^A script still cannot see your aliases, ^because a script runs a non-interactive shell and bashrc is not read at all. ~Which is exactly why a command that works perfectly when you type it fails the moment cron runs the same line."),

"s129": dict(cmd="env", exp="environment", viz="env-scope",
 vizNote="The variable is drawn inside a boundary that belongs to one process only. Child processes inherit a copy, and the sibling process alongside is drawn visibly without it, so scope is spatial.",
 steps=["env","env DEBUG=1 ./app"],
 stage=[("PATH","where commands are looked for"),("HOME","your home directory"),
        ("every process inherits","a copy of this set"),("DEBUG=1 in front","sets one, for one command"),
        ("only inside that process","and its children"),("the next command","has no DEBUG at all"),
        ("nothing else on the box","ever saw it")],
 verdict="It never leaks past that one command", vsub="which is why it is safe to use on a machine other people share", n=
 "|Env shows the variables a command inherits when it starts. ^Path tells the shell where to look for commands. ^Home is your home directory. And ^every process you start inherits a copy of this whole set, which is how configuration reaches a program without a config file. Now the genuinely useful trick here. |Put ^debug equals one in front of a command and you have set that variable ^for that process alone, and for anything it starts. ^The very next command you type has no debug at all. ^Nothing else on the machine ever saw it. ~That matters on a shared box, because exporting a secret into your shell leaves it sitting in the environment of everything you run afterwards."),

"s130": dict(cmd="history", exp="(command history)", viz="term-buffer",
 vizNote="The history list is drawn as a numbered stack the shell keeps, with each recall form pulling a specific entry back down into the prompt so the substitution is watched rather than described.",
 steps=["history | tail -3","!9410","sudo !!"],
 stage=[("everything you have typed","numbered, and kept"),("!9410","runs line 9410 again"),
        ("!!","runs the previous command"),("sudo !!","the one you will actually use"),
        ("Ctrl-R","searches backwards as you type"),("it is written to a file","~/.bash_history"),
        ("so passwords typed inline","end up on disk")],
 verdict="sudo !! is the one worth learning", vsub="run that again, but with privilege, without retyping a word", n=
 "|History keeps ^everything you have typed, numbered, and there are three ways to reach back into it. ^Bang followed by a number runs that exact line again. |Bang ^bang runs the previous command. And the one you will genuinely use every day is this: you run something, it fails because it needed privilege, and rather than retype any of it you just run |sudo ^bang bang. Better still, ^control R searches backwards through your history as you type. One warning, though. ^All of this is written to a file in your home directory, ^so any password you ever typed as part of a command is sitting on disk in plain text. ~Which is a good reason never to put one on a command line."),

"s131": dict(cmd="screen", exp="(a detachable screen)", viz="session-box",
 vizNote="The session is drawn as a box that belongs to the server rather than to your connection. The connection line is cut and the box carries on running visibly; reattaching draws a new line to the same box, still working.",
 steps=["screen -S backup","screen -r backup"],
 stage=[("your session","belongs to the connection"),("close the connection","and everything in it dies"),
        ("screen -S","creates a session on the server"),("the job runs inside it","not inside your connection"),
        ("your connection drops","and the session carries on"),("screen -r","reattaches you to it"),
        ("Ctrl-A then d","detaches on purpose")],
 verdict="The session belongs to the server", vsub="which is why the job survives your laptop going to sleep", n=
 "Start a long job over S S H and it dies when the connection drops, because ^your session belongs to that connection and ^when it closes, everything inside goes with it. |Screen fixes that properly. ^Dash capital S creates a session that lives on the server itself, and ^the job runs inside that session rather than inside your connection. So now ^your connection can drop, your laptop can sleep, and the work carries straight on. When you come back, |screen ^dash R reattaches you and everything is exactly where you left it. And ^control A then D detaches deliberately. ~The session belongs to the server, not to you, which is the whole point."),

"s132": dict(cmd="tmux", exp="terminal multiplexer", viz="session-box",
 vizNote="The same surviving session, now split into real panes that are visibly separate terminals inside one box, so multiplexing is shown as division of a persistent thing rather than as extra windows.",
 steps=["tmux new -s work","tmux attach -t work"],
 stage=[("the same survival","as screen"),("but it splits","into panes"),
        ("pane one","your editor"),("pane two","the logs, live"),
        ("one session","holding both"),("attach by name","from anywhere"),
        ("Ctrl-B is the prefix","where screen uses Ctrl-A")],
 verdict="Learn one of the two, properly", vsub="the muscle memory does not transfer, so pick and commit", n=
 "|T mux does everything screen does, so you get ^the same survival across a dropped connection, ^and then it splits the terminal into panes. That sounds cosmetic until you use it. ^One pane holds your editor. ^Another holds the logs, live, as you work. ^It is one session holding both, so you are watching your change and its effect at the same time without switching windows. |Attach ^by name from any machine and the whole layout comes back. One practical note: ^control B is the prefix key for everything in T mux, where screen uses control A. ~The muscle memory does not transfer between them, so pick one and commit to it."),

"s133": dict(cmd="systemctl", exp="system control", viz="service-state",
 vizNote="Two independent switches drawn for one service: running now, and enabled at boot. A reboot is then run and only the enabled switch survives it, which makes the distinction impossible to misread.",
 steps=["systemctl start nginx","systemctl enable nginx","systemctl status nginx"],
 stage=[("two separate switches","not one"),("stopped","nothing running"),
        ("start","running, right now"),("but not at boot","that is a different switch"),
        ("enable","comes back after a reboot"),("reboot the machine","and watch which survives"),
        ("only the enabled one","returns on its own")],
 verdict="enable --now does both at once", vsub="which is almost always what you actually meant", n=
 "This is the distinction that catches people, and it costs them an outage. A service has ^two separate switches, not one. Here it is stopped. |Start it and ^it is running right now, serving traffic, completely fine. ^But it will not come back after a reboot, because that is the other switch. |Enable is the one that ^makes it start at boot, and it does not start it now. So ^reboot this machine and ^only the service you enabled comes back on its own. |Status ^shows you both states at once, which is why it is the command to run when something is not behaving. ~You almost always want both, and enable dash dash now does the pair in one go."),

"s134": dict(cmd="journalctl", exp="journal control", viz="log-filter",
 vizNote="The journal is drawn as a queryable store rather than a file, with each flag physically narrowing the visible set — by unit, by boot, by priority — so composition is a shrinking result set you watch.",
 steps=["journalctl -u nginx","journalctl -u nginx -b -p err","journalctl -u nginx -f"],
 stage=[("the journal","is a database, not a text file"),("-u nginx","narrows it to one service"),
        ("-b","only since this boot"),("-p err","errors and worse"),
        ("three filters","and the noise is gone"),("-f follows it live","like tail -f"),
        ("compose them","rather than scrolling")],
 verdict="Stop scrolling and start querying", vsub="every flag narrows the set, and they stack", n=
 "The mistake with |journal C T L is treating it like a file and scrolling. ^It is a database, and you query it. ^Dash U narrows to one service, which is usually the first thing you want. |Add ^dash B and you only see this boot, so yesterday's noise disappears. Add ^dash P err and you only see errors and worse. ^Three filters, and what is left is the thing you were looking for. And when you want to watch it happen, |dash ^F follows the journal live, exactly like tail dash F on a log file. ~The habit worth building is ^composing filters rather than scrolling, because every flag narrows the set and they stack."),

"s135": dict(cmd="dmesg", exp="display message", viz="term-buffer",
 vizNote="The kernel ring buffer is drawn as a genuinely circular, fixed-size store: new messages enter at one end and the oldest are pushed out the far side and lost, which is why the buffer can silently forget the message you needed.",
 steps=["dmesg -T | tail"],
 stage=[("the kernel's own buffer","not a log file"),("it is a fixed size","and it is a ring"),
        ("new messages arrive","at one end"),("the oldest fall off","and are gone"),
        ("-T makes timestamps readable","seconds since boot, otherwise"),
        ("a failing disk appears here","before any log file"),("so check it early","before the buffer wraps")],
 verdict="Hardware trouble lands here first", vsub="because the kernel notices long before anything writes a log", n=
 "When a piece of hardware starts to fail, the kernel notices it long before anything gets written down in a log file anywhere. The command is |D mesg, and it prints ^that buffer, which is not a log file at all. ^It is fixed in size and it is a ring, which means ^new messages come in one end and ^the oldest are pushed off the other and lost. ^Dash T makes timestamps readable; by default they are seconds since boot. Now why you care: ^a disk starting to fail, a cable going bad, memory throwing errors, all of it appears here first, ^long before anything writes it to a log file. ~So check it early. On a busy machine that buffer wraps, and the message that explained everything is simply gone."),

"s139": dict(cmd="man", exp="manual", viz="manual-sections",
 vizNote="The manual is drawn as numbered shelves rather than one book. The same word is shown existing on two different shelves with genuinely different content, which is why the section number matters.",
 steps=["man passwd","man 5 passwd"],
 stage=[("section 1","user commands"),("section 5","file formats"),
        ("section 8","administration commands"),("the same name","can live on several shelves"),
        ("man passwd","gives you the command"),("man 5 passwd","gives you the file format"),
        ("the number in brackets","tells you which you are reading")],
 verdict="Same word, different shelf", vsub="which is why man passwd sometimes seems to answer the wrong question", n=
 "The manual is not one book, it is ^numbered sections, and knowing that changes how useful it is. ^Section one is user commands. ^Section five is file formats. ^Section eight is administration. ^The same word can appear on several of those shelves. So |man passwd gives you the command that changes a password. But |man five passwd gives you ^the format of the etc passwd file, a completely different page answering a completely different question. ^The number in brackets at the top of any page tells you which one you are reading. ~If a manual page seems to be answering the wrong question, you are almost certainly on the wrong shelf."),

"s140": dict(cmd="apropos", exp="from the French, à propos", viz="manual-sections",
 vizNote="The search runs across the one-line descriptions of every page rather than the names, so the matched pages are drawn being pulled from several different shelves at once.",
 steps=['apropos "disk usage"'],
 stage=[("you know the job","not the command"),("man needs a name","which you do not have"),
        ("apropos searches descriptions","not names"),("du","estimate file space usage"),
        ("df","report filesystem disk space"),("ncdu","disk usage analyzer with an interface"),
        ("man -k","is exactly the same command")],
 verdict="It is the answer to what was that called", vsub="which is the question you actually have most of the time", n=
 "Here is the situation the manual normally fails at. ^You know exactly what you want to do, but you do not know what the command is called, ^and man needs a name you do not have. |Apropos solves it, because ^it searches the one-line descriptions of every manual page rather than their names. So ask it about disk usage and back come ^D U, which estimates file space usage, ^D F, which reports filesystem space, and ^N C D U, the interactive one. Three tools, from three different sections, found by describing the job. ^Man dash K is the identical command with a shorter name. ~It answers the question you actually have, which is usually what was that thing called."),

"s141": dict(cmd="tldr", exp="too long, didn't read", viz="manual-sections",
 vizNote="The full manual page is drawn at true relative length beside the tldr page, so the 1,241 lines against 8 is a proportion you see rather than a figure you are told.",
 steps=["tldr tar"],
 stage=[("man tar","1,241 lines"),("complete","and genuinely correct"),
        ("tldr tar","eight lines"),("the common cases","with real examples"),
        ("what you wanted","was almost certainly one of them"),
        ("man for truth","when the detail matters"),("tldr for speed","when it does not")],
 verdict="You need both, at different moments", vsub="one is a reference, the other is a reminder", n=
 "The manual is complete, and completeness is not always what you need at four in the afternoon. ^The page for tar runs to twelve hundred and forty one lines. ^It is thorough and entirely correct. |T L D R, which stands for too long, didn't read, gives you ^eight lines instead: ^the handful of things people actually do with the command, written as examples you can copy. ^And what you wanted was almost certainly one of them. These are not competitors. ^The manual is the reference you go to when the detail genuinely matters and you need to be sure. ^T L D R is the reminder you want when you have done this before and simply cannot recall the flag order. ~Keep both."),

"s142": dict(cmd="cheat", exp="(your own cheat sheet)", viz="manual-sections",
 vizNote="A third shelf appears beside the manual and tldr: one you write yourself. The note you add is shown being recalled later verbatim, which is the difference from community examples.",
 steps=["cheat -e rsync","cheat rsync"],
 stage=[("man","written by the authors"),("tldr","written by the community"),
        ("cheat","written by you"),("-e opens your own sheet","for that command"),
        ("the flag you keep forgetting","written down once"),("recalled later","exactly as you left it"),
        ("your notes","for your setup, with your paths")],
 verdict="Write it down the second time", vsub="because there is always a third time, and you will not remember then either", n=
 "There are three kinds of documentation and this is the third. ^The manual is written by the people who wrote the tool. ^T L D R is written by the community. |Cheat ^is written by you. ^Dash E opens your own sheet for a command, and ^whatever flag you keep forgetting gets written down once, ^then |recalled later exactly as you left it. That matters more than it sounds, because ^your notes can hold the details no general documentation ever will: your server names, your paths, the exact R sync incantation your deployment needs. ~Write it down the second time you look something up, because there is always a third time and you will not remember then either."),

"s143": dict(cmd="lspci", exp="list PCI devices", viz="device-ids",
 vizNote="Each device is drawn with two independent indicators: present on the bus, and bound to a driver. A card with the second indicator dark is present and completely unusable, which is the failure being taught.",
 steps=["lspci -k"],
 stage=[("the device is present","the bus can see it"),("the kernel driver in use","i915, here"),
        ("both of those","have to be true"),("no driver line at all","and it is present but useless"),
        ("nothing will use it","no error, no warning"),("that is a missing driver","not broken hardware"),
        ("which is where an evening goes","looking at the wrong thing")],
 verdict="Present is not the same as working", vsub="and it is the second line, not the first, that tells you which", n=
 "A graphics card is installed, the machine boots perfectly well, and yet absolutely nothing on the system appears to be using the thing at all. |L S P C I dash K is where you find out why, because it lists hardware on the bus with the driver bound to each piece. ^The device is present, so the bus can see it. ^A kernel driver is in use, here i nine one five. ^Both of those need to be true. When ^that driver line is missing entirely, the hardware is present and completely unusable, and ^nothing will tell you: no error, no warning, it simply is not used. ^That is a missing driver, not broken hardware, ^which is where an evening disappears. ~Present is not working."),

"s144": dict(cmd="lsusb", exp="list USB devices", viz="fs-tree",
 vizNote="USB is drawn as the physical tree it genuinely is, with a shared bandwidth budget on the hub link that both children visibly draw from — so contention is a picture rather than an explanation.",
 steps=["lsusb -t"],
 stage=[("Bus 001","the root hub, on the motherboard"),("an external hub","plugged into one port"),
        ("a keyboard","hanging off that hub"),("a drive","on the same hub"),
        ("they share one link","back to the machine"),("the keyboard takes almost nothing","but the drive wants everything"),
        ("so the drive slowed down","when nothing about it changed"),("a port on the machine","has a link of its own")],
 verdict="A shared hub shares bandwidth", vsub="which is why the answer is often to move one device, not to replace it", n=
 "Everything you plug in over U S B forms a physical tree, whether or not you ever picture it that way, and that shape explains a problem that otherwise makes no sense. |L S U S B dash T draws the tree. At the top sits ^bus one, the root hub on the motherboard. Into one port you have plugged ^an external hub, and hanging off it are ^a keyboard and ^an external drive. Here is what that tells you. ^Those two share one link back to the machine. ^The keyboard needs almost none of it; the drive would use all of it. So when ^that drive runs slowly and nothing about the drive changed, the answer is in this tree. Move it to ^a port on the machine, which has a link of its own. ~Nothing was broken; it was sharing."),
}
