P3 = [
# ── ACT 7 · the network here ────────────────────────────────────────────
dict(id="s93", type="CHANNEL_CARD", transition="fade", background="zoneA",
 narration="Halfway. If this is landing, subscribing genuinely helps, and there is a lot more of it below.",
 data={"handle":"@thenbxstudio","tagline":"One idea, clearly, every week","atWord":3}, anchors=[]),
dict(id="s94", type="CHAPTER", transition="push", background="zoneB",
 narration="Drawer seven. The network, from this machine.",
 data={"chapter":{"number":"07","title":"The network","subtitle":"from this machine","color":"blue"}}, anchors=[]),
dict(id="s95", type="CMD_IP", transition="fade", background="zoneC",
 narration=("|I P addr shows the addresses this machine holds. |I P route shows where traffic goes when it leaves. "
            "Those are really |three questions: which |addresses you have, which |interfaces exist, and which "
            "|route packets take. |One tool answers all three, which is why it replaced ifconfig."),
 headline="ip replaced [ifconfig]"),
dict(id="s96", type="CMD_PING", transition="dip", background="zoneA",
 narration=("|Ping sends a small packet and waits for it to come back. It leaves |your box, crosses the |gateway, "
            "and the |far end replies in twelve milliseconds. When a |packet never returns, that is loss. "
            "|Loss matters more than the average time does."),
 headline="ping answers [two questions]"),
dict(id="s97", type="CMD_TRACEROUTE", transition="wipe", background="zoneB",
 narration=("|Trace route finds every hop by sending packets that expire a little further along each time. "
            "|Hop one is your router, |hop four is your provider, |hop seven answers with nothing at all, and "
            "|hop nine is the destination. |Stars are not always a fault, because plenty of routers simply refuse "
            "to reply."),
 headline="traceroute makes each hop [answer]"),
dict(id="s98", type="CMD_MTR", transition="fade", background="zoneC",
 narration=("|M T R runs that same probe over and over. |Hop four is stable, |hop seven is dropping thirty eight "
            "percent, |hop nine is clean again. |One run can lie about intermittent loss. A hundred runs cannot."),
 headline="mtr keeps [probing]"),
dict(id="s99", type="CMD_NETSTAT", transition="push", background="zoneA",
 narration=("|Net stat is the tool your muscle memory already knows. |It reads through the proc filesystem line by "
            "line, whereas |S S asks the kernel directly. |The output even matches flag for flag. |On a busy box, "
            "only one of them finishes quickly."),
 headline="netstat still works, [ss is faster]"),
dict(id="s100", type="CMD_SS", transition="dip", background="zoneB",
 narration=("|S S dash T U L P N lists every listening socket. |Filter by state and you get the live connections "
            "instead. Here |four four three is engine X waiting, |twenty two is S S H waiting, and this one is an "
            "|established connection doing real work. |If it says listening and nobody can reach it, the problem is "
            "not the service."),
 headline="ss shows [what is listening]"),
dict(id="s101", type="CMD_NMCLI", transition="fade", background="zoneC",
 narration=("|N M C L I manages connections from the command line, and the distinction that trips people is this. "
            "|Bringing a profile up is not the same as touching hardware. |Eth zero is the physical device. "
            "|Wired one is a saved profile. |Wired backup is another profile for the same device. |One device can "
            "hold many profiles, so you switch networks without unplugging anything."),
 headline="A profile is not the [device]"),
dict(id="s102", type="CMD_IFTOP", transition="push", background="zoneA",
 narration=("|If top breaks bandwidth down by connection pair. This |backup target is pulling thirty eight megabits, "
            "|D N S is nothing, |monitoring is nothing. |It tells you where the traffic goes, not who is sending it."),
 headline="iftop sorts by [connection]"),
dict(id="s103", type="CMD_NETHOGS", transition="dip", background="zoneB",
 narration=("|Net hogs answers the who. |R sync is the program eating the line, |engine X is serving normally, "
            "|S S H D is just your session. |That is usually the question you actually had."),
 headline="nethogs blames a [process]"),
dict(id="s104", type="CMD_NLOAD", transition="wipe", background="zoneC",
 narration=("|N load strips it back to two numbers. |Incoming, and |outgoing. |Sometimes all you need to know is "
            "whether the pipe is full."),
 headline="nload is [two numbers]"),
dict(id="s105", type="QUIZ_CARD", transition="fade", background="zoneA",
 narration=("Quick one. Your service is |listening on four four three, but nobody outside can reach it. Where do "
            "you look first? Have a think, and pause here if you need longer. |Ready? The firewall, because S S "
            "already proved the service itself is up."),
 data={"quiz":{"question":"Listening on 443, unreachable outside. Look where?","options":[
   {"text":"The firewall"},{"text":"Restart the service"},{"text":"Reinstall nginx"},{"text":"Reboot"}],
   "answerIndex":0,"why":"ss already proved it is listening, so the block is in between.","atWord":2,"revealAtWord":26}},
 anchors=["quiz.atWord","quiz.revealAtWord"]),
dict(id="s106", type="RECAP", transition="push", background="zoneB",
 narration=("Drawer seven is the wire. |I P tells you who you are on the network. |Ping and trace route tell you "
            "what you can reach. |S S tells you what is open. And the |bandwidth tools tell you who is being loud."),
 data={"heading":"Drawer seven, on the bench","points":[
   {"text":"ip: addresses, links, routes"},{"text":"ping and traceroute: reachability"},
   {"text":"ss: what is listening"},{"text":"iftop and nethogs: who is loud"}]},
 anchors=["points.0.atWord","points.1.atWord","points.2.atWord","points.3.atWord"]),

# ── ACT 8 · other machines ──────────────────────────────────────────────
dict(id="s107", type="CHAPTER", transition="dip", background="zoneC",
 narration="Drawer eight. Reaching other machines.",
 data={"chapter":{"number":"08","title":"Other machines","subtitle":"names, keys and copies","color":"green"}}, anchors=[]),
dict(id="s108", type="CMD_DIG", transition="fade", background="zoneA",
 narration=("|Dig turns a name into an address and shows its working. |Plus short strips it back to just the value. "
            "You asked a |resolver, it returned an |A record pointing at that address, and the |T T L says cache it "
            "for five minutes. |Dig is the one that tells you who answered and how long it stays true."),
 headline="dig gives you the [whole answer]"),
dict(id="s109", type="CMD_HOST", transition="push", background="zoneB",
 narration=("|Host answers the same question in one readable line. |Host is brief, |dig is detailed, and "
            "|dig plus short sits in between. |Use host when you just want a sanity check."),
 headline="host is the [one-line] answer"),
dict(id="s110", type="CMD_NSLOOKUP", transition="dip", background="zoneC",
 narration=("|N S lookup is the older tool, and its output misleads people daily. It tells you the |server you "
            "asked, then says |non authoritative answer, which only means the reply came from a cache. |People read "
            "that as something being wrong. |It is not an error at all."),
 headline="nslookup can [mislead] you"),
dict(id="s111", type="CMD_WHOIS", transition="wipe", background="zoneA",
 narration=("|Who is asks the registry who owns a domain. You get the |registrar, the |expiry date, and the "
            "|nameservers that answer for it. |Certificates outlive domains, so an expired domain breaks everything "
            "at once."),
 headline="whois tells you when it [expires]"),
dict(id="s112", type="CMD_SSH", transition="fade", background="zoneB",
 narration=("|S S H keygen makes a key pair. |S S H copy I D sends one half to the server. Then |S S H logs you in "
            "with no password. The |private half stays on your laptop and never travels. The |public half, the one "
            "ending in dot pub, is what goes across. It lands in |authorized keys on the server. |Send the private "
            "one and you have handed over your identity."),
 headline="The [public] half goes on the server"),
dict(id="s113", type="CMD_SCP", transition="push", background="zoneC",
 narration=("|S C P copies files over that same encrypted connection. Your |local file rides the |channel S S H "
            "already built and lands at the |remote path. |Forget the colon and you will quietly copy the file into "
            "the current folder under the name of the host."),
 headline="scp rides the [ssh channel]"),
dict(id="s114", type="CMD_RSYNC", transition="dip", background="zoneA",
 narration=("|R sync compares first, then sends only what changed, and |dash dash dry run shows you the plan before "
            "anything moves. Here |fourteen thousand files are skipped, |three are modified, |one is new, and the "
            "|total on the wire is two megabytes instead of four gigabytes. |Mind the trailing slash, because it "
            "decides whether you copy the folder or its contents."),
 headline="rsync sends only the [difference]"),
dict(id="s115", type="CMD_NC", transition="wipe", background="zoneB",
 narration=("|N C hands you a raw socket with no protocol in the way. |Port five four three two answers, so it is "
            "open. |Port six three seven nine refuses. And a |silent timeout means something dropped it. |Refused "
            "and timeout are different answers: refused means you reached the machine."),
 headline="nc asks one [blunt question]"),
dict(id="s116", type="CMD_WGET", transition="fade", background="zoneC",
 narration=("|W get is built to finish. |Dash C resumes an interrupted download. So when the |connection drops at "
            "sixty one percent, |dash C picks up from sixty one percent, and |dash R will follow links and mirror a "
            "whole site. |It is made for downloading things."),
 headline="wget is built to [finish]"),
dict(id="s117", type="CMD_CURL", transition="push", background="zoneA",
 narration=("|Curl is made for talking to things instead. |Dash X sets the method, dash D carries a body. Assemble "
            "it flag by flag: |dash X for the method, |dash H for a header, |dash D for the body, and back comes "
            "|two hundred and one created. |Add dash I and you see the response headers too."),
 headline="curl is for [talking], not downloading"),
dict(id="s118", type="QUIZ_CARD", transition="dip", background="zoneB",
 narration=("Quick one. You are |resyncing a huge folder where barely anything changed. Which tool? Have a think, "
            "and pause here if you need longer. |Ready? R sync, because it sends only the differences and the total "
            "size stops mattering."),
 data={"quiz":{"question":"Huge folder, tiny change. Which tool?","options":[
   {"text":"scp"},{"text":"rsync"},{"text":"wget"},{"text":"nc"}],
   "answerIndex":1,"why":"rsync transfers only the differences.","atWord":2,"revealAtWord":22}},
 anchors=["quiz.atWord","quiz.revealAtWord"]),
dict(id="s119", type="RECAP", transition="fade", background="zoneC",
 narration=("Drawer eight is everything beyond this box. |Dig resolves the name. |S S H gets you a shell. "
            "|S C P and R sync move the files. And |N C and curl test whatever is answering at the far end."),
 data={"heading":"Drawer eight, on the bench","points":[
   {"text":"dig and whois resolve names"},{"text":"ssh gets you a shell"},
   {"text":"scp and rsync move files"},{"text":"nc and curl test the far end"}]},
 anchors=["points.0.atWord","points.1.atWord","points.2.atWord","points.3.atWord"]),

# ── ACT 9 · jobs & sessions ─────────────────────────────────────────────
dict(id="s120", type="CHAPTER", transition="push", background="zoneA",
 narration="Drawer nine. Archives, scheduled jobs, and sessions that survive.",
 data={"chapter":{"number":"09","title":"Jobs and sessions","subtitle":"and archives","color":"purple"}}, anchors=[]),
dict(id="s121", type="CMD_TAR", transition="fade", background="zoneB",
 narration=("|Tar dash C Z V F is four instructions wearing one coat, and this is the most googled confusion in "
            "the whole list. |C creates the archive. |Z compresses it with gzip. |V prints each name as it goes. "
            "|F names the output file. |Swap the C for an X and you extract instead. The other three letters never "
            "change."),
 headline="czvf is [four instructions]"),
dict(id="s122", type="CMD_GZIP", transition="dip", background="zoneC",
 narration=("|Gzip shrinks a file, and here is the surprise: it replaces the original. |Dash K keeps a copy. "
            "|Forty one megabytes goes in, |six megabytes comes out. |It is fast and it is everywhere, which makes "
            "it the default choice."),
 headline="gzip [replaces] the original"),
dict(id="s123", type="CMD_BZIP2", transition="wipe", background="zoneA",
 narration=("|B zip two squeezes the same file harder and takes noticeably longer doing it. |Gzip finishes in about "
            "a second, |B zip two takes eight and saves you a megabyte and a half. |Worth it for archives, not for "
            "logs you rotate nightly."),
 headline="bzip2 trades [time] for size"),
dict(id="s124", type="CMD_ZIP", transition="fade", background="zoneB",
 narration=("|Zip is the one everybody else can open. A |tar dot gz needs tar to unpack, a |zip opens with a double "
            "click on any machine, and it carries |its own index so you can pull one file out without scanning the "
            "lot. |Send zip to people, tar dot gz to servers."),
 headline="zip is the [portable] one"),
dict(id="s125", type="CMD_CRON", transition="push", background="zoneC",
 narration=("|Cron is five fields, in a fixed order, and that order is the whole trick. The |first is the minute. "
            "The |second is the hour. The |third is day of month. The |fourth is month. The |fifth is day of week. "
            "|A star means every one of them, so five stars runs every single minute."),
 headline="cron is [five fields]"),
dict(id="s126", type="CMD_CRONTAB", transition="dip", background="zoneA",
 narration=("|Crontab dash E opens your table for editing. |Dash L lists what is actually installed. |Dash E "
            "validates the file before installing it, whereas |editing the file by hand validates nothing, and "
            "|dash L is the only real proof of what is loaded. |A single bad line makes cron skip the job silently."),
 headline="crontab -e, never [edit the file]"),
dict(id="s127", type="CMD_BASHSCRIPT", transition="fade", background="zoneB",
 narration=("A script is just a file of commands, and it |will not run at first. |Change mod plus X fixes that, "
            "and then |you run it by path. The |first line names the interpreter, |change mod plus X sets the "
            "execute bit, and the |dot slash matters. |The current folder is deliberately not in your path."),
 headline="Three lines and a [permission bit]"),
dict(id="s128", type="CMD_ALIAS", transition="push", background="zoneC",
 narration=("|Alias binds a long command to a short name. |Echo it into your bash R C and it survives a new shell. "
            "|Typed at the prompt it lasts one session, |written into the file it lasts forever. |Scripts never see "
            "your aliases, because they run a non interactive shell."),
 headline="An alias dies unless you [save it]"),
dict(id="s129", type="CMD_ENV", transition="dip", background="zoneA",
 narration=("|Env shows the variables a command inherits, and |env can also set one for a single run. |Path says "
            "where commands are found, |home is your home directory, and |debug equals one exists only inside that "
            "one process. |Nothing else on the box ever sees it."),
 headline="env changes it for [one command]"),
dict(id="s130", type="CMD_HISTORY", transition="wipe", background="zoneB",
 narration=("|History keeps everything you have typed, numbered. |Bang nine four one zero runs that line again. "
            "|Bang bang runs the last one. So: |by number, |the previous command, or |control R to search backwards "
            "interactively. |Sudo bang bang is the one you will use most, rerunning the last command with privilege."),
 headline="history plus [Ctrl-R]"),
dict(id="s131", type="CMD_SCREEN", transition="fade", background="zoneC",
 narration=("|Screen starts a session that does not belong to your connection. |Reattach later and it is all still "
            "there. The |job starts inside the session, your |connection drops but the session keeps going, and "
            "|screen dash R puts you back. |Control A then D detaches deliberately."),
 headline="screen survives your [dropped wifi]"),
dict(id="s132", type="CMD_TMUX", transition="push", background="zoneA",
 narration=("|T mux does the same and adds panes. |Attach by name to come back. You can have the |editor in one "
            "pane, the |logs in another, and the |session itself survives a disconnect. |Control B is the prefix "
            "for everything, where screen uses control A."),
 headline="tmux adds [panes] to the same idea"),
dict(id="s133", type="CMD_SYSTEMCTL", transition="dip", background="zoneB",
 narration=("|System C T L start runs a service now. |System C T L enable makes it come back after a reboot. "
            "|Status shows you both. These are genuinely two different things: |stopped, then |start makes it "
            "active, then |enable makes it persistent, and after a |reboot only the enabled one returns. "
            "|You almost always want both, which is what enable dash dash now does."),
 headline="start is now. [enable] is after reboot"),
dict(id="s134", type="CMD_JOURNALCTL", transition="fade", background="zoneC",
 narration=("|Journal C T L dash U picks one service. |Add dash B and dash P and you have this boot, errors only. "
            "|Dash F follows it live. So |dash U filters by unit, |dash B by boot, |dash P by priority, and "
            "|dash F tails it. |Compose the filters instead of scrolling, because a journal is a database, not a "
            "text file."),
 headline="journalctl is [filters], not scrolling"),
dict(id="s135", type="CMD_DMESG", transition="push", background="zoneA",
 narration=("|D mesg prints the kernel's own ring buffer, and dash T makes the timestamps readable. It is a fixed "
            "size, so the |newest message arrives, |older ones stay a while, and the |oldest falls off the end and "
            "is gone. |Hardware trouble lands here before any log file gets written."),
 headline="dmesg is a [ring buffer]"),
dict(id="s136", type="QUIZ_CARD", transition="dip", background="zoneB",
 narration=("Quick one. You |started a service, it worked, and after a reboot it is gone. What did you miss? Have a "
            "think, and pause here if you need longer. |Ready? Enable, because start only runs it right now."),
 data={"quiz":{"question":"Service works, dies after reboot. Missed what?","options":[
   {"text":"systemctl enable"},{"text":"systemctl reload"},{"text":"systemctl mask"},{"text":"systemctl status"}],
   "answerIndex":0,"why":"start runs it now. enable is what survives a reboot.","atWord":2,"revealAtWord":24}},
 anchors=["quiz.atWord","quiz.revealAtWord"]),
dict(id="s137", type="RECAP", transition="fade", background="zoneC",
 narration=("Drawer nine keeps things running without you. |Tar and gzip package it up. |Cron schedules it. "
            "|System C T L and journal C T L run and explain your services. And |T mux keeps the whole lot alive "
            "when your laptop sleeps."),
 data={"heading":"Drawer nine, on the bench","points":[
   {"text":"tar and gzip package"},{"text":"cron and crontab schedule"},
   {"text":"systemctl and journalctl run it"},{"text":"screen and tmux survive"}]},
 anchors=["points.0.atWord","points.1.atWord","points.2.atWord","points.3.atWord"]),

# ── ACT 10 · getting unstuck ────────────────────────────────────────────
dict(id="s138", type="CHAPTER", transition="push", background="zoneA",
 narration="Drawer ten. What to do when you are stuck.",
 data={"chapter":{"number":"10","title":"When you're stuck","subtitle":"the tools about tools","color":"blue"}}, anchors=[]),
dict(id="s139", type="CMD_MAN", transition="fade", background="zoneB",
 narration=("|Man passwd shows you the command. |Man five passwd shows you the file format. Same name, two "
            "completely different pages, because the manual is split into numbered sections. |Section one is user "
            "commands, |section five is file formats, |section eight is the admin tools. |The number in brackets "
            "at the top tells you which one you are reading."),
 headline="man passwd and man [5] passwd differ"),
dict(id="s140", type="CMD_APROPOS", transition="dip", background="zoneC",
 narration=("|Apropos searches the manual by description rather than by name. So when you |know the job but "
            "|not the command, apropos |finds it for you. |Man dash K is exactly the same tool, just shorter to type."),
 headline="apropos searches [descriptions]"),
dict(id="s141", type="CMD_TLDR", transition="wipe", background="zoneA",
 narration=("|T L D R gives you the normal usage in about eight lines. |The manual for tar runs to twelve hundred "
            "lines and is complete. |T L D R is eight lines and practical. |Usually what you wanted was the common "
            "case. |Man for truth, T L D R for speed."),
 headline="tldr gives you the [normal] usage"),
dict(id="s142", type="CMD_CHEAT", transition="fade", background="zoneB",
 narration=("|Cheat dash E lets you write your own sheet, and |cheat recalls it later. |T L D R is community "
            "examples, |cheat is your own notes, and the |flag you keep forgetting only has to be written down "
            "once. |Write it down the second time you look it up, because there will be a third."),
 headline="cheat stores [your own] notes"),
dict(id="s143", type="CMD_LSPCI", transition="push", background="zoneC",
 narration=("|L S P C I dash K lists the hardware on the bus and the driver bound to each piece. The |device is "
            "present, the |driver is loaded, and if that |driver line is missing the hardware is there but unusable. "
            "|Present and working are not the same thing."),
 headline="lspci shows the [driver] too"),
dict(id="s144", type="CMD_LSUSB", transition="dip", background="zoneA",
 narration=("|L S U S B dash T draws the U S B devices as the tree they physically form. The |root hub, then an "
            "|external hub, and hanging off it a |keyboard and a |drive. |Both share that hub's bandwidth, which is "
            "why the drive slowed down when you plugged the keyboard in."),
 headline="lsusb shows the [tree]"),
dict(id="s145", type="QUIZ_CARD", transition="fade", background="zoneB",
 narration=("Last one. You |know the job but not the command name. What do you reach for? Have a think, and pause "
            "here if you need longer. |Ready? Apropos, because it searches descriptions rather than names."),
 data={"quiz":{"question":"Know the job, not the name. Reach for?","options":[
   {"text":"man"},{"text":"apropos"},{"text":"which"},{"text":"whereis"}],
   "answerIndex":1,"why":"apropos searches descriptions, so the name is what it returns.","atWord":2,"revealAtWord":22}},
 anchors=["quiz.atWord","quiz.revealAtWord"]),

# ── CLOSE ───────────────────────────────────────────────────────────────
dict(id="s146", type="TOOL_BENCH", transition="iris", background="zoneC",
 narration=("And that is the bench, all |ten drawers filled. A hundred and nine tools, and you do not have to "
            "memorise a single one of them, because you only ever need to know which drawer to open. That is the "
            "part that actually makes somebody fast at this."),
 data={"toolBench":{"headline":"Ten drawers, [all filled]","color":"orange","atWord":6,
   "caption":"You don't memorise tools. You learn the drawers.",
   "drawers":[{"label":"files","value":10},{"label":"text","value":13},{"label":"permissions","value":12},
     {"label":"processes","value":15},{"label":"watching","value":8},{"label":"disks","value":11},
     {"label":"network","value":10},{"label":"remote","value":10},{"label":"jobs","value":15},{"label":"help","value":6}]}},
 anchors=["toolBench.atWord"]),
dict(id="s147", type="OUTRO_CTA", transition="fade", background="zoneA",
 narration=("If one of these saved you a search today, subscribing helps more than you would think. And if you take "
            "one thing away, make it this: check what D D is pointed at, twice, before you press enter."),
 data={"message":"Subscribe for more Linux, clearly","sub":"THE NBX STUDIO"}, anchors=[]),
]
