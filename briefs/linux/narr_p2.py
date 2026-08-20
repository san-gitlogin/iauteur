P2 = [
# ── ACT 3 · permissions & users ─────────────────────────────────────────
dict(id="s35", type="CHAPTER", transition="dip", background="zoneC",
 narration="Drawer three. Who you are, and what you are allowed to touch.",
 data={"chapter":{"number":"03","title":"Who you are","subtitle":"and what you may touch","color":"orange"}}, anchors=[]),
dict(id="s36", type="CMD_CHMOD", transition="fade", background="zoneA",
 narration=("Linux permissions are nine switches. |Change mod seven five five sets them by number, and "
            "|change mod U equals R W X sets exactly the same switches by name. Watch the |nine light up: read, "
            "write and execute, three times over, for the owner, the group and everyone else. |Seven is read plus "
            "write plus execute. Five drops the write. That is all seven five five has ever meant."),
 headline="chmod flips [nine switches]"),
dict(id="s37", type="CMD_CHOWN", transition="push", background="zoneB",
 narration=("|Change own hands a file to somebody else, and with a |colon you set the group at the same time. "
            "The |owner changes, the |group changes, and now that |first triple of switches applies to a different "
            "person. |The permissions never moved. Who they apply to did."),
 headline="chown hands the file [to someone]"),
dict(id="s38", type="CMD_UMASK", transition="dip", background="zoneC",
 narration=("Where do a new file's permissions come from? |U mask. Every new file starts from |six six six, your "
            "|mask subtracts the bits you never want, and what is |left is what you actually get. So |touch a fresh "
            "file and it lands on six four four. |Directories start from seven seven seven instead."),
 headline="umask decides what [new files] get"),
dict(id="s39", type="CMD_SUDO", transition="iris", background="zoneA",
 narration=("Run a privileged command as yourself and it is |denied. Put |sudo in front and the |rule file is "
            "checked, the |command runs as root, and a |line is written to the audit log naming you. |Your power "
            "ends the moment that command finishes."),
 headline="sudo lends power for [one command]"),
dict(id="s40", type="CMD_USERADD", transition="wipe", background="zoneB",
 narration=("|User add looks like one small command and it is not. Add |dash M and you get a home directory too. "
            "Behind that single line it writes the |account, writes the |password entry, creates a |group, and only "
            "with dash M creates the |home folder. |Forget dash M and the new user logs in to the root of the disk."),
 headline="useradd writes to [four places]"),
dict(id="s41", type="CMD_USERMOD", transition="dip", background="zoneC",
 narration=("|User mod dash A capital G appends a group. |Capital G on its own replaces every group they had. "
            "|Before, this user is in three groups. |After the append, four. |After the replace, one. |Forgetting "
            "that A is how people lock themselves out of sudo entirely."),
 headline="-aG appends. [-G replaces]"),
dict(id="s42", type="CMD_USERDEL", transition="fade", background="zoneA",
 narration=("|User del removes the account, and |dash R removes the home directory with it. Without dash R the "
            "|account entry disappears but the |home folder stays on disk, and only |with dash R does it go too. "
            "|That is how servers collect folders owned by a number nobody recognises."),
 headline="userdel leaves the [home directory]"),
dict(id="s43", type="CMD_PASSWD", transition="push", background="zoneB",
 narration=("|Pass W D never stores what you typed. |What you type goes through a |one way hash, and only the "
            "|result is written to the shadow file. |Nobody can hand your password back to you, which is why a "
            "reset is the only way in."),
 headline="passwd stores a [hash], never the word"),
dict(id="s44", type="CMD_CHPASSWD", transition="dip", background="zoneC",
 narration=("|Ch pass W D does the same job in bulk, reading pairs off standard input. |One line, |another, "
            "|ninety eight more, all set in a single pass. |It is scriptable, which pass W D deliberately is not."),
 headline="chpasswd sets them [in bulk]"),
dict(id="s45", type="CMD_W", transition="wipe", background="zoneA",
 narration=("|W tells you who is on this box right now and what they are running. |Santhu is in an editor, "
            "|deploy is running a sync, and the |header line carries the load average. |These are sessions, not "
            "people, so one person logged in twice shows up twice."),
 headline="w shows who is on [right now]"),
dict(id="s46", type="CMD_LAST", transition="fade", background="zoneB",
 narration=("|Last reads the login history instead, going back weeks. |Root logged in at three in the morning, "
            "which deserves a second look. |Santhu logged in on Monday, normally. |The machine rebooted on Sunday. "
            "|It is the first place to check after a breach, and the first thing an attacker clears."),
 headline="last reads the [login history]"),
dict(id="s47", type="CMD_CHROOT", transition="push", background="zoneC",
 narration=("|Ch root runs a process with a different directory pretending to be the root. |Listing slash shows only "
            "the jail, |climbing out with dot dot fails, but a |root user can escape it with the right calls. "
            "|So treat it as isolation, never as security."),
 headline="chroot is a fence, [not a wall]"),
dict(id="s48", type="QUIZ_CARD", transition="dip", background="zoneA",
 narration=("Quick one. You run change mod six four four on a script, then try to |run it. What happens? Have a "
            "think, and pause here if you need longer. |Ready? It refuses, because six is read plus write, and the "
            "execute bit is gone."),
 data={"quiz":{"question":"chmod 644 on a script, then run it?","options":[
   {"text":"Runs normally"},{"text":"Permission denied"},{"text":"Runs as root"},{"text":"Deletes it"}],
   "answerIndex":1,"why":"6 is read plus write. No execute bit, so it will not run.","atWord":2,"revealAtWord":22}},
 anchors=["quiz.atWord","quiz.revealAtWord"]),
dict(id="s49", type="RECAP", transition="fade", background="zoneB",
 narration=("Drawer three is the lock. |Change mod and change own decide who may touch a file. |U mask decides what "
            "new files are born with. |Sudo lends power for exactly one command. And the |user tools manage the "
            "accounts behind all of it."),
 data={"heading":"Drawer three, on the bench","points":[
   {"text":"chmod and chown set access"},{"text":"umask shapes new files"},
   {"text":"sudo lends power, and logs it"},{"text":"useradd, usermod, passwd"}]},
 anchors=["points.0.atWord","points.1.atWord","points.2.atWord","points.3.atWord"]),

# ── ACT 4 · processes ───────────────────────────────────────────────────
dict(id="s50", type="CHAPTER", transition="push", background="zoneC",
 narration="Drawer four. What is running, and how you stop it.",
 data={"chapter":{"number":"04","title":"What's running","subtitle":"and how you stop it","color":"purple"}}, anchors=[]),
dict(id="s51", type="CMD_PS", transition="fade", background="zoneA",
 narration=("|P S aux takes a snapshot of everything running. |P S dash E F shows the same data in a different "
            "syntax, and both survive from different flavours of Unix. The column you want first is the "
            "|process id, then the |next one, then |P I D one, which is the ancestor of everything. |Every other "
            "tool asks for that number."),
 headline="ps is a [snapshot], not a feed"),
dict(id="s52", type="CMD_PSTREE", transition="dip", background="zoneB",
 narration=("|P S tree draws the same processes as a family. |Systemd sits at the top as process one, |engine X "
            "was started by it, a |worker was started by engine X, and if a parent dies its children get "
            "|adopted. |Nothing is ever left without a parent."),
 headline="pstree shows [who started whom]"),
dict(id="s53", type="CMD_TOP", transition="push", background="zoneC",
 narration=("|Top is that same list, alive. |Node is climbing, |postgres is steady, |engine X is idle, and the rows "
            "physically reorder as the load moves. |It is the first thing you open when a box feels slow."),
 headline="top re-sorts [as you watch]"),
dict(id="s54", type="CMD_HTOP", transition="wipe", background="zoneA",
 narration=("|H top is the same numbers with a lot less squinting. You get |per core bars, |mouse support so you "
            "can click a process, and |F nine to kill it without typing a P I D. |Install it on every box you own."),
 headline="htop is top with [colour and a mouse]"),
dict(id="s55", type="CMD_BTOP", transition="dip", background="zoneB",
 narration=("|B top draws it over time instead of as an instant. |C P U across the last minute, |memory climbing "
            "steadily, |network quiet. |A spike you can see coming beats a number that only tells you about now."),
 headline="btop draws it [over time]"),
dict(id="s56", type="CMD_ATOP", transition="fade", background="zoneC",
 narration=("|A top has been quietly recording to disk all along. Replay it and |two o'clock looks normal, "
            "|twenty to three is your spike, and by |ten past three it recovered. |Top can only ever show you now."),
 headline="atop already [recorded it]"),
dict(id="s57", type="CMD_GLANCES", transition="push", background="zoneA",
 narration=("|Glances puts every subsystem on one screen and colours the one in trouble. |C P U is fine, |memory "
            "is fine, |disk is saturated, |network is fine. |The red one finds you, so you do not need to know "
            "which tool to open."),
 headline="glances shows [everything] at once"),
dict(id="s58", type="CMD_NMON", transition="dip", background="zoneB",
 narration=("|N mon builds the view you want by keypress. Press |C for processor, |M for memory, |D for disk, "
            "|N for network. |It was built for capture too, so dash F writes a file you can graph later."),
 headline="nmon builds the view [you want]"),
dict(id="s59", type="CMD_KILL", transition="iris", background="zoneC",
 narration=("|Kill does not mean destroy. Kill means send a signal, and the default is sig term. |Dash nine sends "
            "sig kill instead. The signal leaves |your terminal, passes through the |kernel, and the |process "
            "catches it, saves its work and exits cleanly. |With dash nine it never gets that chance. |So reach for "
            "sig term first, every time."),
 headline="kill sends a [signal], not a bullet"),
dict(id="s60", type="CMD_KILLALL", transition="wipe", background="zoneA",
 narration=("|Kill all works by name rather than by number, so one command hits |every match at once, |including "
            "the second one, |including a colleague's. |Fine on your laptop, genuinely dangerous on a shared server."),
 headline="killall hits [all of them]"),
dict(id="s61", type="CMD_NOHUP", transition="dip", background="zoneB",
 narration=("Start a long job, close the terminal, and it dies. |That is a hangup signal reaching it. Start it "
            "under |no hup instead and that same signal is ignored. |Closing the terminal sends it, a |plain "
            "background job takes it and dies, and a job |under no hup simply keeps going. |Its output lands in a "
            "file called nohup dot out."),
 headline="nohup ignores the [hangup]"),
dict(id="s62", type="CMD_SLEEP", transition="fade", background="zoneC",
 narration=("|Sleep pauses a script for a fixed time, and it takes |minutes and hours as well as seconds. The "
            "script |starts, it |waits, and then it |resumes. |It blocks rather than busy-waits, so it costs no "
            "processor time at all."),
 headline="sleep pauses [the script]"),
dict(id="s63", type="CMD_WAIT", transition="push", background="zoneA",
 narration=("Start two jobs in the background and your script races past them. |Add wait and it holds until they "
            "are done. |Job A takes three seconds, |job B takes seven, and |without wait the script exits while B "
            "is still running. |With wait it holds for B. |Without it, your script reports success on work that "
            "never finished."),
 headline="wait holds until [they finish]"),
dict(id="s64", type="CMD_LSOF", transition="dip", background="zoneB",
 narration=("Unmount refuses and says the target is busy. |L S O F tells you who is holding it. |Dash I does the "
            "same for ports. Here |tail is holding a log file, |vim is holding a config, and |engine X is holding "
            "port four four three. |On Linux a socket counts as a file, which is why one tool answers both questions."),
 headline="lsof names the [holder]"),
dict(id="s65", type="CMD_STRACE", transition="wipe", background="zoneC",
 narration=("When something fails for no visible reason, |S trace shows every system call it makes. |Dash E filters "
            "to the ones you care about. Your |program asks the kernel to open a path, the |kernel goes looking, and "
            "the |answer comes back as no such file. |It failed on a missing file, not on the thing the error "
            "message claimed."),
 headline="strace shows what it [really tried]"),
dict(id="s66", type="QUIZ_CARD", transition="fade", background="zoneA",
 narration=("Quick one. A process is |ignoring your kill command completely. Which signal can it not ignore? Have "
            "a think, and pause here if you need longer. |Ready? Sig kill, dash nine, because the kernel delivers "
            "that one and the program never gets a say."),
 data={"quiz":{"question":"Which signal can a process NOT ignore?","options":[
   {"text":"SIGTERM (15)"},{"text":"SIGHUP (1)"},{"text":"SIGKILL (9)"},{"text":"SIGINT (2)"}],
   "answerIndex":2,"why":"The kernel delivers SIGKILL. The program never gets a say.","atWord":2,"revealAtWord":24}},
 anchors=["quiz.atWord","quiz.revealAtWord"]),
dict(id="s67", type="RECAP", transition="push", background="zoneB",
 narration=("Drawer four is control. |P S and P S tree show what exists. |Top and its friends show it moving. "
            "|Kill sends a signal, politely first. And |L S O F and S trace tell you what a stuck process is "
            "actually touching."),
 data={"heading":"Drawer four, on the bench","points":[
   {"text":"ps and pstree list them"},{"text":"top and htop show it live"},
   {"text":"kill sends a signal"},{"text":"lsof and strace find the cause"}]},
 anchors=["points.0.atWord","points.1.atWord","points.2.atWord","points.3.atWord"]),

# ── ACT 5 · watching ────────────────────────────────────────────────────
dict(id="s68", type="CHAPTER", transition="dip", background="zoneC",
 narration="Drawer five. Watching the machine, properly.",
 data={"chapter":{"number":"05","title":"Watching","subtitle":"the machine, properly","color":"yellow"}}, anchors=[]),
dict(id="s69", type="CMD_UPTIME", transition="fade", background="zoneA",
 narration=("|Up time gives you three load numbers, and people misread them constantly. The |first is the last "
            "minute, the |second is five minutes, the |third is fifteen. Read them as a trend. |Four on eight cores "
            "is half busy. The same four on two cores is on fire."),
 headline="Load is [three numbers], not one"),
dict(id="s70", type="CMD_FREE", transition="push", background="zoneB",
 narration=("|Free looks alarming the first time you run it, because free memory is almost always tiny. But look: "
            "|used is your real programs, |cache is memory Linux borrowed and will hand back instantly, |free is "
            "the genuinely idle scrap, and |available is what you can actually have. |Read available and ignore free."),
 headline="Low free memory is [normal]"),
dict(id="s71", type="CMD_VMSTAT", transition="dip", background="zoneC",
 narration=("|V M stat samples memory, paging and processor on an interval you pick. |Ignore the first row, because "
            "that one is an average since boot rather than a reading of now. The |second row is real. And the "
            "|swap columns are the ones to watch. |Anything above zero there means pressure, not just usage."),
 headline="vmstat's first row is [since boot]"),
dict(id="s72", type="CMD_IOSTAT", transition="wipe", background="zoneA",
 narration=("|I O stat reports throughput per device. |Reads look fine, |writes are heavy, but the number that "
            "actually matters is |await, the time each request spends queuing. |High await means the disk is the "
            "bottleneck, not the processor."),
 headline="await is the number [that matters]"),
dict(id="s73", type="CMD_IOTOP", transition="fade", background="zoneB",
 narration=("|I O top answers the obvious follow up question. |Postgres is writing eighty eight megabytes a second, "
            "|R sync is doing what you expected, and |everything else is idle. |I O stat says the disk is busy. "
            "I O top says who made it busy."),
 headline="iotop names the [writer]"),
dict(id="s74", type="CMD_DSTAT", transition="push", background="zoneC",
 narration=("|D stat puts several subsystems on one live line. |Processor, |disk and |network together, sampled "
            "at the same instant. |That is what lets you see a disk spike and a processor wait line up."),
 headline="dstat puts it [on one line]"),
dict(id="s75", type="CMD_SAR", transition="dip", background="zoneA",
 narration=("|S A R is the one everybody forgets and the one that saves you, because it writes these numbers to "
            "disk all day. |Two o'clock was normal, |twenty to three was the spike, |ten past three recovered. "
            "|Enable sysstat before you need it, because you cannot record the past afterwards."),
 headline="sar already [wrote it down]"),
dict(id="s76", type="CMD_WATCH", transition="fade", background="zoneB",
 narration=("|Watch turns any command at all into a live dashboard by rerunning it on a timer. |Dash D highlights "
            "whatever changed since last time. It |runs the command, |shows the output, |marks the difference, "
            "|waits two seconds and goes again. |A slow leak becomes obvious, where a single reading shows nothing."),
 headline="watch turns anything [into a dashboard]"),
dict(id="s77", type="QUIZ_CARD", transition="push", background="zoneC",
 narration=("Quick one. |Load average reads four, on a box with eight cores. Problem, or fine? Have a think, and "
            "pause here if you need longer. |Ready? Fine, because load is counted against cores, and four of "
            "eight is about half."),
 data={"quiz":{"question":"Load 4.0 on an 8-core box?","options":[
   {"text":"Overloaded"},{"text":"Roughly half busy"},{"text":"Out of memory"},{"text":"Disk is full"}],
   "answerIndex":1,"why":"Load is measured against core count. Four of eight is about half.","atWord":2,"revealAtWord":22}},
 anchors=["quiz.atWord","quiz.revealAtWord"]),
dict(id="s78", type="RECAP", transition="dip", background="zoneA",
 narration=("Drawer five is your eyes on the machine. |Up time and free give the headline. |V M stat and I O stat "
            "give the detail. |S A R remembers yesterday. And |watch turns anything at all into a live view."),
 data={"heading":"Drawer five, on the bench","points":[
   {"text":"uptime and free: the headline"},{"text":"vmstat and iostat: the detail"},
   {"text":"sar remembers yesterday"},{"text":"watch makes anything live"}]},
 anchors=["points.0.atWord","points.1.atWord","points.2.atWord","points.3.atWord"]),

# ── ACT 6 · disks ───────────────────────────────────────────────────────
dict(id="s79", type="CHAPTER", transition="push", background="zoneB",
 narration="Drawer six. Disks, filesystems, and one command to fear.",
 data={"chapter":{"number":"06","title":"Disks","subtitle":"and one command to fear","color":"red"}}, anchors=[]),
dict(id="s80", type="CMD_DF", transition="fade", background="zoneC",
 narration=("|D F dash H shows how full each filesystem is, and there is plenty of room here. But |D F dash I "
            "tells a different story. |Space is at sixty two percent, while |inodes are at a hundred. |Millions of "
            "tiny files exhausted the inodes, so writes fail with gigabytes still free."),
 headline="df -i is the [trap] nobody checks"),
dict(id="s81", type="CMD_DU", transition="dip", background="zoneA",
 narration=("|D U measures by directory rather than by filesystem, which is what you run when D F says full. Go "
            "|one level deeper and it narrows. |Var log is the biggest, |home is second, |user is third, and one "
            "level in, |engine X logs is the real culprit. |Walk down, never guess."),
 headline="du finds [which directory] ate it"),
dict(id="s82", type="CMD_NCDU", transition="wipe", background="zoneB",
 narration=("|N C D U does that same walk but lets you browse it. |Press enter on var log, |press enter again on "
            "engine X, and there is the |actual file eating forty one gigabytes. |Three keystrokes, where D U "
            "needed three separate commands."),
 headline="ncdu lets you [walk down] into it"),
dict(id="s83", type="CMD_FDISK", transition="fade", background="zoneC",
 narration=("|F disk dash L just looks at the partition table. |F disk on its own opens it for editing. You have "
            "a |boot partition, a |root partition, a |swap partition, and nothing is written until you |press W. "
            "|Quit with Q and absolutely nothing changed."),
 headline="fdisk writes [nothing] until you say w"),
dict(id="s84", type="CMD_PARTED", transition="push", background="zoneA",
 narration=("|Parted handles the disks F disk cannot. The |old table format tops out around two terabytes, "
            "|G P T goes vastly further, so your |four terabyte disk needs it. |Over two terabytes the old format "
            "simply has no room in the address field."),
 headline="parted handles [large disks]"),
dict(id="s85", type="CMD_BLKID", transition="dip", background="zoneB",
 narration=("|Blk id prints each device with its U U I D and filesystem type. |Slash dev slash S D B one is a "
            "position, and after a |reboot that position can move. The |U U I D never does. |Device names are not "
            "promises, so put the U U I D in fstab."),
 headline="Use the [UUID] in fstab"),
dict(id="s86", type="CMD_MKFS", transition="iris", background="zoneC",
 narration=("|Make F S writes an empty filesystem onto a partition. |Before, your old data is there. |As it runs, "
            "the structure is written. |After, it is an empty filesystem and the data is gone. |There is no "
            "confirmation prompt here either, so check the device name twice."),
 headline="mkfs [erases] whatever was there"),
dict(id="s87", type="CMD_FSCK", transition="wipe", background="zoneA",
 narration=("|F S C K checks a filesystem for damage, and it will warn you that the disk is mounted. |Unmount it "
            "first, then run it. It sweeps the |inodes, the |block map, and the |directory tree, where it finds an "
            "orphan and repairs it. |Run it on a mounted disk and you can corrupt the thing you were fixing."),
 headline="fsck needs it [unmounted]"),
dict(id="s88", type="CMD_MOUNT", transition="dip", background="zoneB",
 narration=("|Mount grafts another filesystem into your existing tree. Here is the |root filesystem, here is the "
            "|M N T folder, and |data is now the other disk. Whatever was |already sitting there is hidden, not "
            "deleted. |Unmount and it reappears untouched."),
 headline="mount [grafts] a second tree in"),
dict(id="s89", type="CMD_UMOUNT", transition="fade", background="zoneC",
 narration=("|Unmount refuses whenever something still holds a file open. |L S O F names it. |Kill that process and "
            "the unmount works. |Tail was holding a file, |killing it releases the handle, and now |unmount "
            "succeeds. |Never reach for dash F first, because a forced unmount can lose writes."),
 headline="umount refuses while [something holds it]"),
dict(id="s90", type="CMD_DD", transition="iris", background="zoneA",
 narration=("And here is the answer to the question I opened with. |D D copies blocks and asks nothing at all. "
            "|Point it at a spare disk and it is a perfectly good backup tool. |Swap one letter and it is not. "
            "|I F equals is the source, read from. |O F equals is the target, written over. And if that target is "
            "|slash dev slash S D A, your running system is gone. |No prompt. No progress bar. No undo."),
 headline="dd is the [four characters]"),
dict(id="s91", type="QUIZ_CARD", transition="push", background="zoneB",
 narration=("Quick one. |D F says there is space free, but writes keep failing. What ran out? Have a think, and "
            "pause here if you need longer. |Ready? Inodes, because every file consumes one and you can exhaust "
            "them with space to spare."),
 data={"quiz":{"question":"Space free, but writes fail. What ran out?","options":[
   {"text":"Swap"},{"text":"Inodes"},{"text":"RAM"},{"text":"File handles"}],
   "answerIndex":1,"why":"Every file consumes an inode. Run out and writes fail with space left.","atWord":2,"revealAtWord":22}},
 anchors=["quiz.atWord","quiz.revealAtWord"]),
dict(id="s92", type="RECAP", transition="dip", background="zoneC",
 narration=("Drawer six is the disk itself. |D F and D U find the space. |Mount and blk id attach it. |F disk and "
            "make F S prepare it, F S C K repairs it. And |D D will destroy it if you type one letter wrong."),
 data={"heading":"Drawer six, on the bench","points":[
   {"text":"df and du find the space"},{"text":"mount and blkid attach it"},
   {"text":"fdisk and mkfs prepare it"},{"text":"dd deserves your attention"}]},
 anchors=["points.0.atWord","points.1.atWord","points.2.atWord","points.3.atWord"]),
]
