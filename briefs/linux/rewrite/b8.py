# -*- coding: utf-8 -*-
# Batch 8 — Act 8: SSH, rsync and reaching other machines.
B8 = {
"s108": dict(cmd="dig", exp="domain information groper", viz="dns-resolve",
 vizNote="The query is drawn travelling to a named resolver and the answer coming back as a real record card with its TTL running down as a visible countdown, so caching becomes a timer rather than a word.",
 steps=["dig example.com","dig +short example.com"],
 stage=[("you ask a resolver","1.1.1.1, in this case"),("it answers","with an A record"),
        ("the A record","maps a name to an address"),("TTL 300","cache this for five minutes"),
        ("which is why a change","takes time to appear everywhere"),("+short","strips it to just the value"),
        ("dig shows its working","who answered, and for how long")],
 verdict="The tool that shows you its working", vsub="which is why it is the one to reach for when DNS is the suspect", n=
 "D N S turns a name into an address, and when it goes wrong you need to see the whole exchange. |Dig is short for domain information groper. ^You ask a resolver, here one dot one dot one dot one, and ^it answers. What comes back is ^an A record, which maps the name to an address. Alongside it sits ^a T T L of three hundred, meaning cache this answer for five minutes, ^which is exactly why a D N S change does not appear everywhere at once. If you only want the value, |plus short ^strips all of it away. ^But the full output is the point: it tells you who answered and how long that answer stays true. ~That is why dig is the one to reach for."),

"s109": dict(cmd="host", exp="(host lookup)", viz="dns-resolve",
 vizNote="The same resolution drawn three ways at increasing verbosity, so the viewer sees one question answered at three different depths rather than three unrelated tools.",
 steps=["host example.com"],
 stage=[("host","one readable sentence"),("dig","the full record, with TTL and authority"),
        ("dig +short","just the bare value"),("same question","asked three ways"),
        ("host for a sanity check","does this name resolve at all"),("dig when it is broken","and you need the detail")],
 verdict="Reach for host when you just need yes or no", vsub="and dig the moment the answer surprises you", n=
 "Dig is thorough, and at half past two in the morning, thorough is sometimes considerably more than you actually want from a command. |Host answers that same question in ^one readable sentence. Put all three side by side and the choice is obvious. ^Dig gives you the full record with its T T L and which server was authoritative. ^Dig plus short gives you nothing but the bare value, which is what you want inside a script. ^Host sits in the middle, in plain English. ^It is the right tool for a sanity check: does this name resolve, and roughly where? ^And the moment the answer surprises you, you switch to dig. ~Use the smallest tool that answers the question."),

"s110": dict(cmd="nslookup", exp="name server lookup", viz="dns-resolve",
 vizNote="The resolver's cache is drawn explicitly between you and the authoritative server. The answer visibly comes from the cache, and the phrase non-authoritative is attached to that hop rather than presented as a warning.",
 steps=["nslookup example.com"],
 stage=[("Server: 1.1.1.1","the resolver you actually asked"),("Non-authoritative answer","and here is the confusion"),
        ("people read that as","something is wrong"),("it only means","this came from a cache"),
        ("the authoritative server","is the one that owns the domain"),
        ("your resolver asked it earlier","and kept the answer"),("that is D N S working","exactly as designed")],
 verdict="Non-authoritative is not an error", vsub="it means the answer came from a cache, which is the normal case", n=
 "This next one is older than dig and host, and it misleads people every single day because of two words in its output. The command is |N S lookup. It prints ^the server you asked, then the phrase ^non authoritative answer. ^Almost everybody reads that as a warning that something has gone wrong. ^It means nothing of the sort. It means this answer came out of a cache. ^The authoritative server is the one that actually owns the domain and holds the original record. ^Your resolver asked it at some point earlier, kept the answer for the length of its T T L, and handed you the copy. ^That is D N S working exactly as designed. ~Non authoritative is the normal case, not a fault."),

"s111": dict(cmd="whois", exp="who is (the owner)", viz="record-card",
 vizNote="The registry record drawn as a card with the expiry date on a real countdown against today's date, so twenty-eight days away reads as urgency rather than a string.",
 steps=["whois example.com"],
 stage=[("the registrar","who the domain was bought through"),("the expiry date","twenty eight days from today"),
        ("the nameservers","which servers answer for it"),("an expired domain","breaks everything at once"),
        ("mail stops","because MX records vanish"),("certificates outlive domains","which is the cruel part"),
        ("your monitoring will not catch it","it only checks the site is up"),("set your own reminder","the renewal email will be missed")],
 verdict="Check expiry before you debug anything else", vsub="an expired domain looks exactly like a hundred other faults", n=
 "This last one is not really about your own machine at all, and it is very easy to skip straight past, but it will save you an entire afternoon eventually. |Who is asks the registry who owns a domain. You get ^the registrar it was bought through, ^the expiry date, which here is twenty eight days away, and ^the nameservers that answer for it. That expiry date is the line that matters, because ^an expired domain does not fail gently; everything stops at once. ^Mail stops, because the M X records go with it. And here is the cruel part: ^your certificate can still be valid for another year, so nothing warns you. ^Monitoring that checks the site is up will not catch it either. So ^put that date in your own calendar; the renewal email lands in a mailbox nobody reads. ~Check expiry first."),

"s112": dict(cmd="ssh", exp="secure shell", viz="key-exchange",
 vizNote="Two machines with the key pair drawn as two genuinely different halves. The public half travels across and docks into authorized_keys on the server; the private half is anchored to the laptop and physically cannot be dragged across.",
 steps=["ssh-keygen -t ed25519","ssh-copy-id deploy@prod","ssh deploy@prod"],
 stage=[("a key pair","two halves, made together"),("id_ed25519","the private half"),
        ("it never leaves your laptop","not once, not ever"),("id_ed25519.pub","the public half"),
        ("this one is meant to travel","that is its entire job"),("authorized_keys","on the server, holding your public half"),
        ("now you log in","with no password at all")],
 verdict="The .pub suffix is the one that travels", vsub="send the other half and you have handed over your identity", n=
 "|S S H keygen makes ^a key pair, and the two halves are not interchangeable. ^The private half, with no extension, ^never leaves your laptop under any circumstances. ^The public half, ending dot pub, ^is the one designed to travel; that is its entire purpose. So |S S H copy I D takes that public half and appends it to ^a file called authorized keys on the server. After that, |logging ^in needs no password, because the server sends a challenge only something holding the private half can answer. ~The dot pub suffix is the one that travels. Send the other and you have handed somebody your identity, which no password change will undo."),

"s113": dict(cmd="scp", exp="secure copy", viz="key-exchange",
 vizNote="A file drawn moving through the same encrypted channel SSH established. The colon in the destination is highlighted as the single character that makes the path remote, and without it the file is shown landing in the local folder instead.",
 steps=["scp dist.tar.gz prod:/srv/"],
 stage=[("the local file","sitting in your current folder"),("the same encrypted channel","that ssh already built"),
        ("the same keys","no new setup at all"),("prod colon slash srv","the remote path"),
        ("that colon","is doing all the work"),("leave it out","and it is just a local copy"),
        ("a file named prod","appears in your folder")],
 verdict="The colon is what makes it remote", vsub="without it, scp quietly copies the file next to itself", n=
 "You have keys working, and now you actually need to get a build artefact from your own laptop onto that server without messing about. The tool is |S C P, short for secure copy, and there is nothing new to set up. ^Your local file rides ^the channel S S H already built, using ^the same keys, and lands at ^the remote path. Now, the detail that catches people. ^That colon is doing all of the work. It is the one character telling S C P that what follows is on another machine. ^Leave it out and the command still succeeds, except it was a local copy and ^you now have a file called prod sitting next to the original. ~No error, no warning. Just a deployment that never happened."),

"s114": dict(cmd="rsync", exp="remote sync", viz="sync-diff",
 vizNote="Both file sets are drawn side by side and compared before anything moves. Unchanged files dim out, and only the three modified and one new file actually travel, with a wire-bytes counter that stays tiny against the total size.",
 steps=["rsync -av --dry-run ./src/ prod:/srv/","rsync -av ./src/ prod:/srv/"],
 stage=[("it compares first","before sending anything"),("14,208 files","identical, and skipped entirely"),
        ("3 files","modified, so they go"),("1 file","new, so it goes too"),
        ("2 megabytes on the wire","instead of four gigabytes"),
        ("--dry-run","shows the plan and changes nothing"),
        ("the trailing slash","decides folder or contents")],
 verdict="Always dry-run it first", vsub="because a missing trailing slash quietly nests the folder inside itself", n=
 "S C P sends everything, every time. |R sync is cleverer, because ^it compares the two sides before it sends anything at all. Here ^fourteen thousand files are identical and get skipped, ^three have changed so those go, and ^one is new so that goes too. The result is ^two megabytes on the wire instead of four gigabytes, which turns a twenty minute transfer into a two second one. Two habits worth building. ^Dash dash dry run shows you exactly what it would do and changes nothing, and |the ^trailing slash matters enormously: source slash copies the contents, source without copies the folder itself. ~Dry run it first, every time."),

"s115": dict(cmd="nc", exp="netcat", viz="port-probe",
 vizNote="Three probe outcomes drawn as genuinely different events: an open port completes a handshake, a closed port sends an active refusal back, and a filtered port produces silence with a timeout bar running out. The distinction is the diagnosis.",
 steps=["nc -zv prod 5432","nc -zv prod 6379"],
 stage=[("port 5432","postgres answers, so it is open"),
        ("port 6379","refused, immediately"),("refused means reached","the machine replied to say no"),
        ("nothing at all","no answer, just a timeout"),("that is a firewall","dropping it silently"),
        ("refused and timeout","are completely different answers")],
 verdict="Refused means you reached the machine", vsub="timeout means something in between silently dropped you", n=
 "Before you debug an application, it is worth proving you can even reach it. |N C, short for netcat, hands you a raw socket with no protocol in the way, which answers exactly that. ^Five four three two answers, so postgres is open and listening there, and that rules out one whole class of problem. Now |try ^six three seven nine instead, and ^it is refused straight away. That refusal is good news, because ^refused means you reached the machine and it told you nothing is listening. Compare that with ^nothing at all, just silence until it times out. ^That is a firewall dropping your packet without a word. ~Refused and timeout mean opposite things. One is an application problem, the other is a network problem."),

"s116": dict(cmd="wget", exp="web get", viz="transfer-bar",
 vizNote="A download progress bar that genuinely breaks at 61%, then resumes from exactly that point rather than restarting, with the already-downloaded portion visibly retained on disk.",
 steps=["wget https://ex.com/big.iso","wget -c https://ex.com/big.iso"],
 stage=[("a four gigabyte download","on a shaky connection"),("it drops at 61 percent","which is infuriating"),
        ("the partial file","is still on your disk"),("-c, for continue","picks up where it stopped"),
        ("it resumes at 61 percent","not from zero"),("-r follows links","and mirrors a whole site"),
        ("it retries by itself","without you watching")],
 verdict="wget is for downloading things", vsub="curl, which is next, is for talking to things", n=
 "|W get is short for web get, and it is built around one assumption: you want this file, and you want it even if the network is unreliable. So take ^a four gigabyte download on a shaky connection. ^It drops at sixty one percent, which is infuriating. But ^the partial file is still sitting on your disk, so |add ^dash C, for continue, and ^it resumes from sixty one percent rather than starting again. It goes further than that: ^dash R follows links and will mirror an entire site, and ^it retries on its own without you sitting there watching. ~W get is for downloading things. Curl, which is next, is for talking to them, and that distinction is worth keeping."),

"s117": dict(cmd="curl", exp="client URL", viz="http-exchange",
 vizNote="An HTTP request assembled visibly piece by piece — method, headers, body — then sent, with the response drawn as a real status line and headers coming back rather than just a body blob.",
 steps=["curl https://api.ex.com/health","curl -X POST -d '{}' api.ex.com/jobs"],
 stage=[("a plain GET","which is the default"),("-X POST","sets the method"),
        ("-H","adds a header, like content type"),("-d","carries the body"),
        ("201 Created","comes back as the status"),("-i shows the headers","which is where the real clues live"),
        ("you are building a request","piece by piece"),("no library in between","nothing to misreport it")],
 verdict="The fastest way to see what a server actually said", vsub="no client library, no framework, no guessing in between", n=
 "Where W get fetches a file and finishes, curl holds a conversation with a server. Start with |curl and ^a plain get, the default. For a quick health check that is genuinely all you need, and it is all most people ever use it for. The real value comes when you need to send something rather than just fetch it, and that means controlling three parts yourself: method, headers and body. |Build it up piece by piece. ^Dash X sets the method: post, not get. ^Dash H adds a header. ^Dash D carries the body. Send it and ^two hundred and one created comes back. Add ^dash I for the response headers, which is often where the clue hides. ^You are assembling it by hand, with ^no library to misreport the answer. ~It is the fastest way to see what a server really said."),
}
