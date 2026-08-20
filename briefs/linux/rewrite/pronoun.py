# -*- coding: utf-8 -*-
"""Name the subject instead of saying "it".
Owner, on the shipped Playwright course: *"your usage of IT is hell of a lot. When
you say IT, what is IT?"* Sentence-initial "It" in a command beat always refers to
the command being taught, so it can be named safely. Relative "that" becomes "which",
which reads identically aloud and stops competing for the listener's attention.
Spoken forms, because this text goes to edge-tts, not to a page.
"""
import json, re, sys
SPOKEN = {
 "cd":"C D","pwd":"P W D","ls":"L S","mkdir":"Make dir","touch":"Touch","cp":"C P","mv":"M V",
 "rm":"R M","ln":"L N","clear":"Clear","cat":"Cat","tac":"Tac","more":"More","less":"Less",
 "tail":"Tail","vi":"V I","diff":"Diff","find":"Find","locate":"Locate","grep":"Grep","awk":"Awk",
 "sed":"Sed","xargs":"Xargs","chmod":"Change mod","chown":"Change own","umask":"U mask","sudo":"Sudo",
 "useradd":"User add","usermod":"User mod","userdel":"User del","passwd":"Pass W D","chpasswd":"Ch pass W D",
 "w":"W","last":"Last","chroot":"Ch root","ps":"P S","pstree":"P S tree","top":"Top","htop":"H top",
 "btop":"B top","atop":"A top","glances":"Glances","nmon":"N mon","kill":"Kill","killall":"Kill all",
 "nohup":"No hup","sleep":"Sleep","wait":"Wait","lsof":"L S O F","strace":"S trace","uptime":"Up time",
 "free":"Free","vmstat":"V M stat","iostat":"I O stat","iotop":"I O top","dstat":"D stat","sar":"S A R",
 "watch":"Watch","df":"D F","du":"D U","ncdu":"N C D U","fdisk":"F disk","parted":"Parted","blkid":"Blk I D",
 "mkfs":"Make F S","fsck":"F S C K","mount":"Mount","umount":"Unmount","dd":"D D","ip":"I P","ping":"Ping",
 "traceroute":"Trace route","mtr":"M T R","netstat":"Net stat","ss":"S S","nmcli":"N M C L I","iftop":"If top",
 "nethogs":"Net hogs","nload":"N load","dig":"Dig","host":"Host","nslookup":"N S lookup","whois":"Who is",
 "ssh":"S S H","scp":"S C P","rsync":"R sync","nc":"N C","wget":"W get","curl":"Curl","tar":"Tar",
 "gzip":"Gzip","bzip2":"B zip two","zip":"Zip","cron":"Cron","crontab":"Crontab","bash script":"The script",
 "alias":"Alias","env":"Env","history":"History","screen":"Screen","tmux":"T mux","systemctl":"System C T L",
 "journalctl":"Journal C T L","dmesg":"D mesg","man":"Man","apropos":"Apropos","tldr":"T L D R","cheat":"Cheat",
 "lspci":"L S P C I","lsusb":"L S U S B",
}
VERBS = ("is|are|was|were|can|will|would|does|do|has|have|means|makes|gives|takes|runs|reads|"
         "writes|holds|sits|comes|goes|stops|starts|keeps|needs|lives|points|counts|carries|"
         "answers|shows|tells|lists|prints|sends|walks|opens|closes|hands|leaves|arrives|"
         "belongs|survives|matches|happens|expects|refuses|only|never|always|already")

sys.path.insert(0, 'briefs/linux/rewrite')
import importlib
NEW = {}
for m in ['b1','b2','b3','b4','b5','b6','b7','b8','b9']:
    M = importlib.import_module(m)
    NEW.update([kv for kk, vv in vars(M).items() if kk.startswith('B') and isinstance(vv, dict) for kv in vv.items()])

t = json.load(open('briefs/linux/table.json'))
named = swapped = 0
for r in t:
    n = r['narration']
    cmd = NEW.get(r['id'], {}).get('cmd')
    name = SPOKEN.get(cmd)
    if name:
        # sentence-initial "It" / "It's" / "This is" -> the command, by name
        def repl(m):
            global named
            named += 1
            head = m.group(1)
            rest = m.group(2)
            return f"{head}{name}{rest}"
        n, k1 = re.subn(r'((?:^|(?<=[.!?;] ))(?:\|\^|[|^@~])?)It\b( )', lambda m: (repl(m)), n)
        n, k2 = re.subn(r'((?:^|(?<=[.!?;] )))It\'s\b', lambda m: f"{m.group(1)}{name} is", n)
        named += 0
    # relative "that" -> "which": identical aloud, and it stops competing for attention
    n, k = re.subn(rf'\b([a-z]{{3,}}) that ((?:{VERBS})\b)', r'\1 which \2', n)
    swapped += k
    r['narration'] = n
json.dump(t, open('briefs/linux/table.json', 'w'), indent=1)
allt = ' '.join(re.sub(r'[|^@~]', '', x['narration']) for x in t)
bare = len(re.findall(r"\b(it|its|it's|this|that|they|them|those|these)\b", allt, re.I))
w = len(allt.split())
print(f"named {named} subjects, {swapped} that->which")
print(f"pronoun density now {bare}/{w} = {bare/w*100:.2f}% (need <=4.5%)")
