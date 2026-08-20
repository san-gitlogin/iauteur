# -*- coding: utf-8 -*-
# Batch 7 — Act 7: the network from this machine.
B7 = {
"s95": dict(cmd="ip", exp="(internet protocol)", viz="net-stack",
 vizNote="The machine drawn with its real network layers: physical interfaces at the bottom, addresses bound onto them, and a routing table above deciding where traffic exits. Each subcommand lights the layer it actually queries.",
 steps=["ip link","ip addr","ip route"],
 stage=[("ip link","the interfaces themselves"),("is the cable in","and is the device up"),
        ("ip addr","the addresses bound to them"),("10.0.0.5","this machine, on this network"),
        ("ip route","where traffic goes on the way out"),("default via 10.0.0.1","anything not local goes here"),
        ("three layers","one tool for all of them")],
 verdict="ip replaced ifconfig for a reason", vsub="ifconfig cannot describe modern routing or multiple addresses", n=
 "Networking on a single machine is really three questions stacked on top of each other, and |I P answers all three of them. At the bottom, ^the link layer is the interfaces themselves: ^is there a cable in, and is the device up. Above that, |I P ^addr shows the addresses bound to those interfaces, so ^ten dot zero dot zero dot five is what this machine answers to. And above that again, |I P ^route decides where a packet goes when it leaves, which is why you see ^a default route saying anything not on this network goes to the gateway. ^Three layers, one tool. ~It replaced ifconfig because ifconfig could not describe modern routing or multiple addresses on one interface."),

"s96": dict(cmd="ping", exp="(after sonar)", viz="net-path",
 vizNote="A packet is drawn actually travelling out to the destination and back, with the round trip time measured as the length of that journey. A lost packet leaves and simply never returns, and the gap it leaves in the sequence is visible.",
 steps=["ping -c 4 1.1.1.1"],
 stage=[("a packet leaves","your machine"),("crosses the gateway","and heads out"),
        ("the far end replies","in 12 milliseconds"),("packet 3","leaves and never comes back"),
        ("that is loss","not slowness"),("25 percent loss","will break things badly"),
        ("average time","hides that completely")],
 verdict="Loss matters far more than the average", vsub="a fast connection dropping one packet in four is unusable", n=
 "When something will not connect, this is the first thing anyone reaches for, and most people only ever read half of what it tells them. The command is |ping, and what it does is simple: ^a packet leaves your machine, ^crosses the gateway, and ^the far end replies, here in twelve milliseconds. Do it four times and you learn two separate things. The first is how far away it is. The second is more important. ^Watch packet three: it leaves and never comes back. ^That is loss, which is a completely different problem from slowness. ^One packet in four missing will make a connection feel broken even though ^the average time still looks perfectly healthy. ~So read the loss figure first, because the average hides it."),

"s97": dict(cmd="traceroute", exp="trace the route", viz="net-path",
 vizNote="The path is discovered hop by hop: each probe travels one router further before expiring and reporting back, so the map is built outward in front of you. A silent router leaves a gap that the path still passes straight through.",
 steps=["traceroute 1.1.1.1"],
 stage=[("send a packet","allowed one hop only"),("it expires","and that router reports back"),
        ("hop 1","your own router"),("allow two hops","and repeat"),
        ("hop 4","your internet provider"),("hop 7","replies with nothing at all"),
        ("hop 9","the destination, finally")],
 verdict="Stars are not automatically a fault", vsub="plenty of routers are configured never to reply, and traffic passes anyway", n=
 "Ping tells you whether the far end is reachable, but when it is not, it says nothing about where along the way things went wrong. |Trace route tells you the whole path, and the trick behind it is genuinely clever. ^It sends a packet allowed to travel exactly one hop, ^which expires immediately and the router that killed it politely reports back. That gives you ^hop one, your own router. Then ^it allows two hops, then three, walking outward one at a time. So ^hop four is your internet provider, ^hop seven answers with nothing whatsoever, and ^hop nine is the destination. Now, about hop seven. ~Those stars are not automatically a fault, because plenty of routers are configured never to reply, and your traffic passes straight through them regardless."),

"s98": dict(cmd="mtr", exp="my traceroute", viz="net-path",
 vizNote="The traceroute map stays on screen and updates continuously, each hop accumulating a real loss percentage over hundreds of probes. The bad hop's figure climbs and holds while its neighbours stay clean, which isolates it visually.",
 steps=["mtr 1.1.1.1"],
 stage=[("traceroute runs once","and then stops"),("intermittent loss","will not show up in one run"),
        ("mtr keeps probing","hundreds of times"),("hop 4","zero percent loss"),
        ("hop 7","thirty eight percent loss"),("hop 9","clean again, which is the clue"),
        ("loss that recovers","means that hop is not really the problem")],
 verdict="One run can lie, a hundred cannot", vsub="and loss that clears at the next hop is usually just rate limiting", n=
 "Trace route has a real weakness: ^it runs once and then stops. If your problem is ^intermittent, a single pass will very often miss it entirely. |M T R is trace route and ping combined, so ^it keeps probing every hop, hundreds of times, and builds up statistics. Now the picture is much clearer. ^Hop four is dropping nothing. ^Hop seven is dropping thirty eight percent of packets. But look at ^hop nine, which is clean again, and that is the actual clue. ^If loss at one hop clears at the next, that router is almost certainly just rate limiting its own replies rather than dropping your traffic. ~One run can lie. A hundred runs cannot."),

"s99": dict(cmd="netstat", exp="network statistics", viz="net-sockets",
 vizNote="Two paths to the same answer drawn side by side: netstat reading /proc file by file with a visible per-file cost, and ss making one direct kernel call. On a busy box the netstat path stacks up thousands of reads while ss finishes at once.",
 steps=["netstat -tulpn"],
 stage=[("-t","TCP sockets"),("-u","UDP as well"),("-l","only the ones listening"),
        ("-p","and which process owns each"),("it reads /proc","one file per connection"),
        ("on a busy server","that is thousands of reads"),("ss asks the kernel once","and the output matches, flag for flag")],
 verdict="Your muscle memory still works", vsub="but ss is the one that finishes on a loaded machine", n=
 "Almost every sysadmin alive has this exact flag block committed to memory without ever having sat down and decoded it, so let us decode it once. |Net stat, with dash T U L P N. ^Dash T is T C P, ^dash U adds U D P, ^dash L narrows it to listening sockets, and ^dash P shows which process owns each. The output is exactly what you want. The problem is how it gets it: ^net stat reads through the proc filesystem, one file per connection, and ^on a server with thousands of connections that is thousands of reads. ^S S asks the kernel directly, once, and prints output that matches flag for flag. ~The muscle memory still works, but S S is the one that finishes on a loaded machine."),

"s100": dict(cmd="ss", exp="socket statistics", viz="net-sockets",
 vizNote="Sockets drawn in their real states: LISTEN as an open door with nothing behind it, ESTABLISHED as a live pipe with a peer on the far end. Filtering by state visibly removes the doors and leaves only the live pipes.",
 steps=["ss -tulpn","ss -t state established"],
 stage=[("LISTEN on 443","nginx, waiting for anyone"),("LISTEN on 22","sshd, also waiting"),
        ("listening means ready","the service is genuinely up"),("filter by state","and the doors disappear"),
        ("ESTABLISHED","an actual conversation in progress"),("to 10.0.0.9","with a real peer on the far end"),
        ("service up, nobody connecting","points at the firewall, not the app")],
 verdict="LISTEN proves the service is running", vsub="so if nothing reaches it, stop debugging the application", n=
 "|S S is short for socket statistics, and it shows you what this machine is currently prepared to talk to, and to whom. ^Port four four three is engine X listening, ^port twenty two is S S H listening. ^Listening means the service is genuinely up and accepting connections. That is what you check first when a service will not answer. Now |filter by state instead and ^the listeners drop away, leaving ^an established connection, which is a conversation actually in progress ^with a real peer at the other end. Here is the diagnostic that saves you an afternoon. If S S says a service is listening and yet nothing can reach it, ^the problem is not the application; it is a firewall, a security group, or the address it bound to. ~Stop debugging the app."),

"s101": dict(cmd="nmcli", exp="NetworkManager command line", viz="net-stack",
 vizNote="One physical device drawn with several saved profile cards stacked above it. Bringing a profile up visibly snaps that card down onto the device, and switching profiles swaps the card without the device itself changing at all.",
 steps=["nmcli device status","nmcli con up wired-1"],
 stage=[("eth0","the physical device, the actual port"),("wired-1","a saved profile: address, DNS, routes"),
        ("wired-backup","a second profile, same device"),("a device is hardware","and it does not change"),
        ("a profile is settings","and you can have many"),("bring a profile up","and it snaps onto the device"),
        ("switch profiles","without touching a cable")],
 verdict="One device, many profiles", vsub="which is the distinction that trips everybody up the first time", n=
 "|N M C L I manages networking from the command line, and there is one distinction that trips absolutely everybody the first time. ^Eth zero is a device: the physical port on the machine. ^Wired one is a profile, which is a saved bundle of settings, an address, D N S servers and routes. ^Wired backup is a second profile for that very same device. So ^a device is hardware and it does not change, while ^a profile is configuration and you can keep as many as you like. When you |bring a profile up, ^it snaps onto the device, and ^switching between them changes the machine's entire network identity without you touching a cable. ~One device, many profiles."),

"s102": dict(cmd="iftop", exp="interface top", viz="bandwidth-flow",
 vizNote="Bandwidth drawn as flows between address pairs, with the width of each flow proportional to its throughput. One pair dominates the picture, but no process name appears anywhere — which is precisely the limitation being taught.",
 steps=["iftop -i eth0"],
 stage=[("it groups by pair","this host, and the other end"),("to 10.0.0.9","38 megabits, and dominating"),
        ("to 1.1.1.1","DNS, essentially nothing"),("to 10.0.0.2","monitoring, also nothing"),
        ("so you know where","the traffic is going"),("but not what sent it","no process name anywhere"),
        ("that is the next tool","and it is coming up now")],
 verdict="It answers where, never who", vsub="for the process behind the traffic you need nethogs", n=
 "The link is completely saturated, everything on the box feels slow, and you would very much like to know what exactly is filling it up. |If top gives you the first half of that answer, because ^it groups traffic by pair: this machine, and whoever is on the other end. So ^thirty eight megabits is going to ten dot zero dot zero dot nine, which is dominating the link. ^D N S is essentially nothing. ^Monitoring is essentially nothing. Now that is genuinely useful, because ^you now know where the traffic is heading. But notice what is missing: ^there is no process name anywhere on this screen, so you still cannot say which program is responsible. ^That is the next tool. ~If top answers where, and never who."),

"s103": dict(cmd="nethogs", exp="network hogs", viz="bandwidth-flow",
 vizNote="The same bandwidth, but grouped by owning process rather than by address. Each flow carries a real PID and command name, which is the missing half of the previous screen made explicit.",
 steps=["nethogs eth0"],
 stage=[("grouped by process","not by address"),("rsync, PID 4821","eating the entire link"),
        ("nginx, PID 1140","serving normally"),("sshd, PID 980","just your own session"),
        ("now you have a PID","and something you can act on"),("iftop said where","nethogs says who"),("you cannot stop a destination","but you can stop a process")],
 verdict="This is the question you walked in with", vsub="which program is eating the line, and can I stop it", n=
 "If top told you where the traffic was heading and then stopped just short of the genuinely useful part, which is what to do about it. |Net hogs tells you what is sending it, because ^it groups by process rather than by address. And the answer is immediate: ^R sync, process four eight two one, is eating the link. ^Engine X is serving normally. ^S S H D is your own session. ^Now you have a process I D, which means you have something you can actually act on: renice it, throttle it, or wait for it. ^If top answered where; net hogs answers who. ~And who is nearly always the question you walked in with, because ^you cannot stop a destination, but you can certainly stop a process."),

"s104": dict(cmd="nload", exp="network load", viz="bandwidth-flow",
 vizNote="Two live meters, in and out, with a scrolling graph under each. No tables and no addresses at all — the deliberate absence of detail is what makes the shape of the traffic readable at a glance.",
 steps=["nload eth0"],
 stage=[("incoming","41 megabits a second"),("outgoing","88 megabits a second"),
        ("no addresses","and no process names"),("no tables to read","nothing to interpret"),
        ("just the shape","is the pipe full or is it not"),("your link is 100 megabit","so outgoing is nearly maxed")],
 verdict="Sometimes you only need yes or no", vsub="and every extra column is something between you and the answer", n=
 "Sometimes the only question you actually have is this one, and honestly nothing more than this: is the pipe full, yes or no? |N load strips everything else away and hands you two numbers. ^Incoming, forty one megabits a second. ^Outgoing, eighty eight. ^No addresses, ^no tables, nothing to interpret. Just ^the shape of the traffic over the last minute. And that is enough to answer the question, because ^if this link is a hundred megabit then outgoing is very nearly maxed out and you have found your ceiling. ~When you already know what you are asking, every extra column is one more thing standing between you and the answer, which is why a deliberately small tool earns its place."),
}
