# -*- coding: utf-8 -*-
# Batch 5 — Act 5: watching the machine.
B5 = {
"s69": dict(cmd="uptime", exp="(how long it has been up)", viz="load-cores",
 vizNote="Load is drawn against a real row of core slots. A load of 4 fills four of eight slots and looks calm; the same 4 against two slots overflows the row and backs up into a visible queue. The number is identical both times — the picture is not.",
 steps=["uptime"],
 stage=[("three numbers","not one, and that matters"),("the last minute","what is happening now"),
        ("the last five","where it is heading"),("the last fifteen","where it came from"),
        ("a load of 4","on a machine with 8 cores"),("half busy","four slots filled, four free"),
        ("the same 4","on a machine with 2 cores"),("badly overloaded","and a queue is forming")],
 verdict="Always divide by your core count", vsub="the number alone means nothing at all", n=
 "Load average is the most consistently misread number in all of Linux, and it appears in almost every tool here, so let us fix it properly now. |Up time gives you ^three numbers rather than one, and the three are the point. The first is ^the last minute, the second is ^the last five minutes, and the third is ^the last fifteen. Read them together as a direction of travel. Now the part people get wrong. ^A load of four sounds alarming until you ask how many cores this machine has. On ^eight cores that is half busy: four slots working, four sitting free. On ^two cores, the very same figure means ^badly overloaded, with work queuing up behind. ~Always divide by your core count, because the number on its own tells you nothing."),

"s70": dict(cmd="free", exp="(free memory)", viz="memory-bar",
 vizNote="Memory drawn as one physical bar divided into real segments. The cache segment is shaded to show it is borrowed, and when a program demands memory you watch the cache segment shrink and hand its space over instantly.",
 steps=["free -h"],
 stage=[("free memory: 210MB","on a 32GB machine"),("that looks alarming","and it is completely fine"),
        ("used","your programs, genuinely occupied"),("cache","borrowed, and handed back on demand"),
        ("free","truly idle, and therefore wasted"),("available","what you can actually get"),
        ("watch the cache shrink","the instant something asks")],
 verdict="Read available, ignore free", vsub="Linux spends idle memory on purpose, because idle memory helps nobody", n=
 "The first time you run this particular command on a perfectly healthy server, you will be completely convinced the machine is about to fall over. |Free reports ^two hundred megabytes free on a server with thirty two gigabytes. ^That looks alarming, and it is completely fine. Here is why. ^Used is your programs, genuinely occupied. ^Cache is memory Linux borrowed to keep recently read files close by, and it will hand every byte of it back the moment something needs it. ^Free is memory doing nothing whatsoever, which is memory being wasted. And ^available is the figure you actually wanted: what a new program could have right now. ^Ask for memory and the cache simply shrinks. ~Read available and ignore free."),

"s71": dict(cmd="vmstat", exp="virtual memory statistics", viz="gauge-board",
 vizNote="Rows arrive on a ticking interval. The first row is drawn greyed and struck through to mark it as a since-boot average rather than a reading, and the swap columns are the only ones that flare when they leave zero.",
 steps=["vmstat 1"],
 stage=[("the first row","is an average since boot"),("ignore it","it is not a reading of now"),
        ("the second row","is the real one"),("and every row after","one per second"),
        ("si and so","swap in, and swap out"),("zero is healthy","memory is keeping up"),
        ("anything above zero","means real pressure")],
 verdict="Non-zero swap is the red flag", vsub="it means shortage, not merely usage", n=
 "You want to know whether this machine is genuinely short of memory, and you want to watch it change rather than take a single reading. That tool is |V M stat. There is one trap to know about first. ^The very first row is an average since the machine booted, ^so ignore it completely; it is history, not a reading. ^The second row is the first real one, ^and one follows every second. The columns to watch are ^S I and S O, swap in and swap out, which count memory being pushed to disk and pulled back. ^Zero there is healthy. ^Anything above zero means the machine is genuinely short of memory. ~That is pressure, not just usage, and it is the difference between slow and about to fall over."),

"s72": dict(cmd="iostat", exp="input/output statistics", viz="queue-meter",
 vizNote="A disk drawn with a real request queue in front of it. Throughput fills the pipe while await is shown as the length of the waiting line — so a disk at modest throughput with a long queue reads correctly as the bottleneck.",
 steps=["iostat -x 1"],
 stage=[("reads","megabytes per second"),("writes","heavy, but that is expected"),
        ("throughput looks fine","so the disk seems healthy"),("await","the column that matters"),
        ("time spent queuing","before the request is even served"),("a long queue","is what slow actually feels like"),
        ("the disk is the bottleneck","not the processor")],
 verdict="High await, low throughput", vsub="means the disk is saturated even though the numbers look small", n=
 "The processor is sitting almost idle and yet the whole machine feels like it is wading through treacle. Nine times out of ten that is the disk, and |I O stat is how you confirm it. It reports per device, so you get ^reads in megabytes a second and ^writes, which are heavy here but expected for a database. ^On throughput alone this disk looks perfectly healthy, and that is exactly the trap. The column that matters is ^await, which measures ^how long each request sat waiting before the disk even started on it. ^A long queue is what slowness actually feels like from inside a program. So when await climbs while throughput stays modest, ^the disk is your bottleneck. ~Low throughput with high await means saturated, not idle."),

"s73": dict(cmd="iotop", exp="I/O top", viz="proc-live",
 vizNote="The live process table, but the sort column is disk throughput rather than CPU. One process dominates the bar chart while every other row sits at effectively zero, which names the culprit immediately.",
 steps=["iotop -o"],
 stage=[("iostat said busy","but not who made it busy"),("postgres","writing 88 megabytes a second"),
        ("rsync","12 megabytes a second, expected"),("everything else","effectively nothing"),
        ("-o shows only active","instead of every idle process"),("now you have a PID","and a decision to make")],
 verdict="iostat says busy, iotop says who", vsub="which is always the next question you were going to ask", n=
 "I O stat told you the disk is saturated, which is useful and immediately raises the obvious next question: saturated by what, exactly? |I O top answers that, because ^knowing a disk is busy without knowing who made it busy leaves you nowhere. Here ^postgres is writing eighty eight megabytes a second, which is your answer. ^R sync is doing twelve, which is the backup you scheduled and expected. ^Everything else is doing essentially nothing. The ^dash O flag shows only processes actually doing input and output, rather than filling the screen with idle ones. ^Now you have a process I D and a decision. ~Every monitoring tool tells you something is wrong; this one tells you who."),

"s74": dict(cmd="dstat", exp="(a combined stat tool)", viz="gauge-board",
 vizNote="Three subsystem strips share one time axis, sampled on the same tick. A disk spike and the matching CPU wait are drawn in the same vertical column so the correlation is spatial rather than something you have to remember.",
 steps=["dstat -cdn"],
 stage=[("processor","user time and system time"),("disk","reads and writes"),("network","sent and received"),
        ("all on one line","sampled at the same instant"),("a disk spike","here, in this column"),
        ("and the CPU wait","in the very same column"),("that is correlation","which separate tools cannot show")],
 verdict="One time axis for everything", vsub="which is how you stop guessing at cause and effect", n=
 "The problem with running four monitoring tools in four separate windows is that none of them agree on when now actually is. |D stat fixes that by putting several subsystems on ^one line: processor split into user and system time, ^disk reads and writes, and ^network sent and received. Crucially ^they are all sampled at the same instant, on the same tick. Which means when you see ^a disk spike in this column, and ^a processor wait sitting in the very same column, you are looking at ^genuine correlation rather than two readings you are trying to line up by eye. ~One time axis for everything is how you stop guessing at cause and effect."),

"s75": dict(cmd="sar", exp="system activity reporter", viz="gauge-board",
 vizNote="A calendar strip of stored days beneath the graph. Selecting a past day loads its recorded curve, so history is browsable — and the days before sysstat was enabled are drawn as visibly empty slots.",
 steps=["sar -u -f /var/log/sa/sa17"],
 stage=[("it writes to disk","every ten minutes, all day"),("pick a day","from weeks ago if you like"),
        ("14:00","completely normal"),("14:40","and there is your spike"),
        ("15:10","recovered on its own"),("before you enabled it","the days are simply empty"),
        ("you cannot record the past","which is the whole catch")],
 verdict="Enable sysstat before you need it", vsub="the outage always comes before the monitoring does", n=
 "This is the tool that absolutely everybody forgets about, and it is also the one that will save you on the day it genuinely counts. |S A R, which is the system activity reporter, ^writes these numbers to disk every ten minutes of every day whether anyone is watching or not. So after an outage you can ^pick a day, even one from weeks ago, and simply read what happened. ^Two o'clock was normal. ^Twenty to three is your spike. ^By ten past three it had recovered. But here is the catch that catches everyone. ^Look at the days before you switched it on and they are empty, because ^you cannot record the past retrospectively. ~Enable sysstat before you need it, because the outage always arrives before the monitoring does."),

"s76": dict(cmd="watch", exp="(watch it repeatedly)", viz="repeat-loop",
 vizNote="A real loop: the command runs, its output lands, changed characters are highlighted against the previous run, then a countdown ticks down and it runs again. Over several cycles one number creeps upward, which is the leak becoming visible.",
 steps=["watch -n 2 df -h","watch -d free -h"],
 stage=[("it runs the command","exactly as you typed it"),("shows the output","in full"),
        ("waits two seconds","then does it again"),("one reading","tells you almost nothing"),
        ("-d highlights changes","against the previous run"),("that number is creeping up","run after run"),
        ("now the leak is obvious","and it took no tooling at all")],
 verdict="It turns any command into a dashboard", vsub="which means you never need a purpose-built tool for a one-off", n=
 "Sometimes the tool you need does not exist, and |watch is how you build it in about four seconds. It takes any command at all and ^runs it exactly as you typed it, ^shows you the output, then ^waits and runs it again. That is the whole idea. And it matters because ^a single reading of anything tells you almost nothing. |Add dash D and it will ^highlight whatever changed since the previous run, so when ^a number creeps upward run after run, ^the leak becomes obvious without you installing anything. ~It turns any command into a live dashboard, which is why you rarely need a purpose-built tool for a one-off question."),
}
