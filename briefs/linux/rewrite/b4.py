# -*- coding: utf-8 -*-
# Batch 4 — Act 4: processes, signals and what is running.
B4 = {
"s51": dict(cmd="ps", exp="process status", viz="proc-table",
 vizNote="A live process table where each row is a real process card carrying its PID, user and command. The PID column physically lifts forward and holds, because that number is the one every later tool will ask you for.",
 steps=["ps aux","ps -ef"],
 stage=[("a snapshot","of this exact instant"),("PID 4821","node, your application"),("PID 1140","nginx, the web server"),
        ("PID 1","systemd, the ancestor of all"),("the PID column","is the one that matters"),
        ("aux and -ef","two syntaxes, same data"),("BSD and System V","a forty year old argument")],
 verdict="Every other tool wants the PID", vsub="which is why you learn to spot it fast", n=
 "|P S is short for process status, and it hands you ^a snapshot of everything running at this exact instant. Not a live view, a still photograph. Each row is a process, so here is ^P I D four eight two one, which is node running your application, ^P I D one one four zero, which is engine X, and right at the top ^P I D one, systemd, the ancestor of every other process on the box. Of everything in that output, ^the P I D column is the one to find. |P S dash E F prints ^the same data in a different syntax, because ^two flavours of Unix disagreed about flags forty years ago and both won. ~Every other tool on this list will ask you for that number."),

"s52": dict(cmd="pstree", exp="process tree", viz="proc-tree",
 vizNote="Processes drawn as a real parent-child graph with connecting lines. When a parent is killed its line snaps and the orphaned children visibly re-attach to PID 1 — the reparenting is animated, not stated.",
 steps=["pstree -p"],
 stage=[("systemd, PID 1","started before everything else"),("nginx","was started by systemd"),("worker","was started by nginx"),
        ("the lines are real","each shows who started whom"),("kill the parent","and the line snaps"),
        ("the children survive","they are not killed with it"),("PID 1 adopts them","instantly and automatically")],
 verdict="Nothing is ever left without a parent", vsub="which is how a process can outlive the shell that started it", n=
 "P S gives you a flat list, which hides the most useful fact about processes: every one of them was started by another one. |P S tree draws that instead. At the top sits ^systemd, process number one, which the kernel started before anything else. ^Engine X was started by systemd. ^A worker was started by engine X. ^Those connecting lines are real relationships, not decoration. Now ^kill a parent in the middle and the line to it snaps, but ^its children are not killed along with it. Instead ^process one adopts them, immediately and automatically. ~Nothing is ever left without a parent, which is exactly how a job can outlive the shell that launched it."),

"s53": dict(cmd="top", exp="(top processes)", viz="proc-live",
 vizNote="The process table is alive: CPU figures move continuously and the rows physically re-sort in front of you, so the busiest process rises to the top as you watch. That reordering is the whole reason top exists.",
 steps=["top"],
 stage=[("the same processes","but not a photograph"),("it refreshes","every few seconds"),("node","climbing fast"),
        ("postgres","steady, and not the problem"),("nginx","almost idle"),("the rows re-sort","busiest first, continuously"),
        ("press q","to leave it")],
 verdict="The first thing you open on a slow box", vsub="because it shows you the shape of a problem, not one number", n=
 "P S shows you an instant. The question you usually have is what is happening now, and that needs something that moves, which is |top. It shows ^the same processes, but ^it refreshes every couple of seconds instead of printing once. So ^node is climbing hard, ^postgres is steady and clearly not your problem, and ^engine X is almost idle. And crucially ^the rows re-sort as it goes, so whatever is busiest keeps rising to the top on its own. You do not read this output so much as watch it. ^Press Q to leave. ~It is the first thing to open on a slow box, because it shows you the shape of a problem rather than a single number."),

"s54": dict(cmd="htop", exp="an interactive top", viz="proc-live",
 vizNote="The same live table, now with a real per-core bar meter across the top, a mouse cursor that selects a row, and an F9 key press that kills the selected process without a PID ever being typed.",
 steps=["htop"],
 stage=[("one bar per core","so you see which cores are loaded"),("a load of 4","spread over eight cores"),
        ("colour in the bars","kernel time versus user time"),("click a process","with the mouse"),
        ("F9 to kill it","no PID to type"),("scroll sideways","for the full command line"),("F5 for a tree","the parent-child view, built in")],
 verdict="Same numbers, far less squinting", vsub="worth installing on every machine you administer", n=
 "Top works, but it makes you do arithmetic in your head, it will not let you touch the mouse, and killing something means typing a number by hand. |H top is that tool with the edges filed off. Across the top you get ^one bar per processor core, so ^a load of four on eight cores looks like what it is. ^The colours in those bars separate kernel work from your own. Below, the process list is the same, except ^you can click a row with the mouse and ^press F nine to kill it, no P I D required. And ^you can scroll sideways for the full command line, or ^press F five for the tree view. ~Same numbers, far less squinting, and worth installing on every machine you look after."),

"s55": dict(cmd="btop", exp="a graphical top", viz="gauge-board",
 vizNote="Real sparkline graphs plotting the last sixty seconds. Memory is drawn as a line climbing steadily upward across the whole window, so a leak is visible as a slope — something a single number physically cannot show.",
 steps=["btop"],
 stage=[("CPU","plotted over the last minute"),("memory","climbing, steadily"),("network","flat and quiet"),
        ("a number tells you now","and nothing else"),("a line tells you the direction","which is what you needed"),
        ("that slope","is a memory leak"),("disk throughput too","on the same timeline")],
 verdict="A spike you can see coming", vsub="an instant reading always hides the trend", n=
 "Top and H top both show this instant, refreshed every couple of seconds. Useful, but a number that keeps changing still only ever describes right now. |B top plots that same information over time, which changes what you can see. ^Processor use is drawn across the last minute, ^memory climbs steadily, and ^the network is flat. Compare that to what top would tell you. ^A number describes this second and nothing more. ^A line tells you where it is heading, which is nearly always what you needed. That steady climb is not a value to worry about yet; ^it is a leak, and it will matter within the hour. ^Disk throughput is plotted on that same timeline. ~A spike you can see coming beats a reading that only describes this second."),

"s56": dict(cmd="atop", exp="advanced top", viz="gauge-board",
 vizNote="A timeline scrubber sitting beneath the gauges. Dragging it moves the entire board back through recorded history to 14:40, so you watch yesterday's spike replay rather than being told it happened.",
 steps=["atop -r /var/log/atop/atop_20260817"],
 stage=[("it has been recording","to disk, all along"),("rewind to 14:00","and everything looks normal"),
        ("14:40","there is your spike"),("what was running then","recorded alongside it"),
        ("15:10","recovered on its own"),("top cannot do this","it only knows about now")],
 verdict="It answers questions after the fact", vsub="which is the only kind you get after an outage", n=
 "Here is the situation every one of these live tools fails at. The server was slow at twenty to three this afternoon. It is fine now. What happened? |A top solves it, because ^it has been quietly writing all these numbers to disk the whole time. Replay yesterday and ^two o'clock looks entirely normal. Move forward and ^twenty to three is your spike, and critically ^it recorded which processes were running at that moment as well. By ^ten past three it had recovered on its own. ^Top cannot answer any of that, because top only ever knows about now. ~These are the only questions you get after an outage, which makes a top the one worth enabling in advance."),

"s57": dict(cmd="glances", exp="(a glance at everything)", viz="gauge-board",
 vizNote="Four subsystem panels on one board, each with a health colour driven by its own thresholds. Three sit calm and one turns red and pulses — the eye is pulled to the failing subsystem without the viewer knowing which tool to open.",
 steps=["glances"],
 stage=[("CPU","fine"),("memory","fine"),("disk I/O","saturated, and it is red"),("network","fine"),
        ("it picks the threshold","so you do not have to"),("the red one finds you","before you go looking")],
 verdict="You do not need to know which tool to open", vsub="which is exactly the problem when you are new", n=
 "Every tool so far assumes you already know what to look at. That is a fair assumption after ten years and a terrible one on your first week. |Glances puts every subsystem on a single screen and colours whichever is in trouble. ^Processor is fine. ^Memory is fine. ^Disk input and output is saturated, and it has gone red. ^Network is fine. You did not have to know that the disk was the suspect, because ^glances applies the threshold for you, and ^the red panel finds you rather than the other way round. ~When you are new, not knowing which tool to open is the actual problem, and this is the honest answer to it."),

"s58": dict(cmd="nmon", exp="Nigel's monitor", viz="gauge-board",
 vizNote="An empty board that the viewer builds: each keypress slides a new panel in and docks it, so the dashboard visibly assembles itself from nothing rather than appearing complete.",
 steps=["nmon"],
 stage=[("it starts empty","you build the view"),("press c","and a CPU panel docks in"),("press m","memory joins it"),
        ("press d","disk as well"),("press n","and network"),("-f writes a file","instead of drawing anything"),
        ("graph it later","in a spreadsheet, if you like"),("only what you need","and no wasted screen")],
 verdict="Built for capture, not just for watching", vsub="which is why it survived from 1997", n=
 "Every tool up to this point decided its own layout, and you either liked it or you did not. That is fine until the layout hides the one panel you need. |N mon works the other way round entirely: ^it starts almost empty and you assemble the view you want by pressing keys. ^Press C and a processor panel docks into place. ^Press M and memory joins it. ^D for disk, ^N for network. You build exactly the dashboard this problem needs, ^wasting nothing on panels you are not reading. But the reason it has survived since the nineteen nineties is the other mode. ^Dash F writes all of it to a file instead of drawing anything at all, so you can leave it overnight and ^graph it later in a spreadsheet. ~It was built for capture rather than watching, which is still unusual."),

"s59": dict(cmd="kill", exp="(send a signal)", viz="signal-path",
 vizNote="A signal drawn as a real packet travelling from the shell, through the kernel, into the process. With SIGTERM the process catches it, a save animation runs, and it exits cleanly. With -9 the packet bypasses the process entirely and goes straight to the kernel, which deletes it mid-write.",
 steps=["kill 4821","kill -9 4821"],
 stage=[("kill does not destroy","it sends a signal"),("SIGTERM","the polite default"),("the process catches it","and it can choose to act"),
        ("it saves, then exits","cleanly, on its own terms"),("-9 is SIGKILL","which cannot be caught"),
        ("the kernel removes it","the process is never told"),("unsaved work","is simply lost")],
 verdict="Send SIGTERM first, always", vsub="-9 is what you try when nothing else worked", n=
 "The name is misleading, so start here: ^kill does not destroy anything. It sends a signal, and a signal is a message. |Run it plainly and it sends ^sig term, which politely asks a process to stop. ^The process receives that message and gets to decide what to do about it, so typically ^it flushes what it was writing, closes its files and exits on its own terms. Now |dash nine is different. ^That is sig kill, and it cannot be caught or ignored, because ^the kernel removes the process without ever delivering the message. It never gets the chance to save, so ^whatever was in memory is gone. ~Send sig term first, every single time."),

"s60": dict(cmd="killall", exp="kill all by name", viz="proc-table",
 vizNote="Every process matching the name lights simultaneously across the table, including one clearly owned by another user, and all of them terminate at the same instant — the blast radius is the picture.",
 steps=["killall node"],
 stage=[("by name, not by number","that is the whole difference"),("node, PID 4821","yours"),("node, PID 4822","also yours"),
        ("node, PID 5310","started by a colleague"),("all three match","so all three are signalled"),
        ("it never asks","which ones you meant"),("pkill -u you","matches only your own")],
 verdict="Fine on your laptop", vsub="genuinely dangerous on a shared server", n=
 "Kill needs a process I D, and when eight copies of the same program are running, hunting down all eight of those numbers by hand gets old fast. |Kill all works ^by name instead, and that is the whole difference. So ^node running as four eight two one goes, ^node as four eight two two goes, and so does ^node as five three one zero, which a colleague started and is two hours into. ^All three matched the name, so all three were signalled, and ^it never asked you which ones you actually meant. On your own laptop this is a convenience. On a shared server it is genuinely dangerous, so ^P kill with a user filter is the habit worth building instead. ~Match on a name, and you match everybody's."),

"s61": dict(cmd="nohup", exp="no hangup", viz="signal-path",
 vizNote="The terminal window is closed on screen and a SIGHUP packet visibly propagates down to its child jobs. The plain job receives it and dies; the nohup job has a shield that the packet bounces off, and it carries on running.",
 steps=["./backup.sh &","nohup ./backup.sh &"],
 stage=[("you close the terminal","or the connection drops"),("SIGHUP is sent","hangup, to every child"),
        ("the plain job","receives it and dies"),("nohup means no hangup","it ignores that signal"),
        ("the job carries on","with the terminal gone"),("output goes to nohup.out","since there is no screen left")],
 verdict="It survives the disconnect", vsub="but check nohup.out, because that is where the output went", n=
 "You start a long backup, close the laptop, come back, and the job died. Here is why. |Run something in the background normally, and when ^you close the terminal or the connection drops, ^a signal called hangup is sent to every job that terminal started. ^Your plain background job receives it and stops. The fix is in the name: |no hup is short for ^no hangup, and a job started under it simply ignores that signal, so ^it carries on running with the terminal long gone. One thing to expect: since there is no screen to print to any more, ^its output is written into a file called nohup dot out. ~That file is where people forget to look."),

"s62": dict(cmd="sleep", exp="(pause)", viz="timeline-run",
 vizNote="A script drawn as a vertical timeline with an execution marker travelling down it. At the sleep the marker stops and a real clock counts, while a CPU meter beside it stays flat at zero — the difference between blocking and busy-waiting made visible.",
 steps=["sleep 5","sleep 2m"],
 stage=[("the script runs","line by line"),("it reaches sleep","and simply stops"),("five seconds pass","nothing else happens"),
        ("the CPU stays at zero","this costs nothing"),("then the next line runs","exactly where it left off"),
        ("2m, 3h, 1d","minutes, hours and days too")],
 verdict="It blocks, it never busy-waits", vsub="which is why a sleep in a loop is not wasteful", n=
 "|Sleep pauses for a fixed time, and it is the least interesting command here until you look at how it does it. ^Your script runs down its lines, ^reaches the sleep and stops. ^Five seconds pass with nothing happening at all, and here is the part worth noticing: ^the processor sits at zero throughout, because sleep asks the kernel to wake it later and then genuinely stops running. It is not counting in a loop. ^Then the next line runs, exactly where it left off. And you are not limited to seconds, since |it takes ^minutes, hours and days as well. ~Because it truly blocks, a sleep inside a retry loop costs you nothing."),

"s63": dict(cmd="wait", exp="(wait for children)", viz="timeline-run",
 vizNote="Three parallel timelines: two background jobs and the script itself. Without wait, the script's marker races to the end and exits while the job bars are still running. With wait, the script's marker parks at a barrier until the longest bar completes.",
 steps=["./a.sh & ./b.sh &","wait"],
 stage=[("job A","takes three seconds"),("job B","takes seven"),("the ampersand","sends them to the background"),
        ("the script runs on","without pausing at all"),("it exits at once","while B is still working"),
        ("wait holds it","until every child has finished"),("now the exit is honest","and the status is real")],
 verdict="Without it, your script reports success early", vsub="on work that had not finished yet", n=
 "Two jobs, and you want them running at the same time. |Start ^job A, which takes three seconds, and ^job B, which takes seven, and put ^an ampersand after each to send them into the background. Now here is the bug, and it is subtle because nothing looks broken. ^The script carries straight on, ^reaches its end and exits, while job B still has four seconds of work left. Your C I run goes green on work that never finished. The fix is one word: |wait ^holds the script until every background child has completed, so ^its exit status finally means something. ~Without it, your script reports success on work that is still running."),

"s64": dict(cmd="lsof", exp="list open files", viz="handle-map",
 vizNote="A resource on one side and the processes holding it on the other, joined by real handle lines. Unmount is refused while any line remains. A network socket is drawn in the same list as a file, which is the point.",
 steps=["umount /mnt/data","lsof /mnt/data","lsof -i :443"],
 stage=[("target is busy","is all the error says"),("tail, PID 4821","is holding a log file open"),
        ("vim, PID 5102","is holding a config open"),("that is why it refused","two handles are still open"),
        ("a socket is a file too","on Linux, genuinely"),("nginx, PID 1140","is holding port 443"),
        ("so -i answers both","files and ports, one tool")],
 verdict="Address already in use, solved", vsub="lsof -i is the fastest answer to that error", n=
 "You try to |unmount a disk and it refuses with ^target is busy, which tells you nothing useful. |L S O F, short for list open files, tells you who is responsible. ^Tail is holding a log file open on that disk. ^Vim is holding a config. ^Those two handles are the entire reason the unmount failed. Now the clever part. On Linux ^a network socket is a kind of file as well, genuinely, not by analogy. So |the same tool with dash I shows you ^engine X holding port four four three, which means ^one command answers both questions. ~The next time something says address already in use, this is the fastest way to find out what."),

"s65": dict(cmd="strace", exp="system call trace", viz="syscall-flow",
 vizNote="The boundary between a program and the kernel drawn as a real line, with each call crossing it as a labelled request and an answer coming back. The failing openat returns ENOENT and that one line lights while the rest scroll past.",
 steps=["strace ./app","strace -e openat ./app"],
 stage=[("the program asks the kernel","for everything it needs"),("open this file","is one such request"),
        ("the kernel answers","no such file or directory"),("the program then prints","a totally unrelated error"),
        ("thousands of calls","scroll past by default"),("-e filters them","to just the ones you care about"),
        ("there it is","a config path that does not exist")],
 verdict="It failed on a missing file", vsub="not on whatever its error message claimed", n=
 "A program fails with an error that makes no sense. |S trace shows you what it is actually doing, because ^every real thing a program does goes through the kernel. Opening a file, reading a socket, all of it. So ^open this file is a request you can watch, and ^the kernel answers no such file or directory. Meanwhile ^the program prints something about a database connection, which is why you were confused. The catch is that ^thousands of these scroll past. So |add dash E to ^filter down to just the calls you care about, and ^there it is, a config path that does not exist. ~It failed on a missing file, not on the thing it told you."),
}
