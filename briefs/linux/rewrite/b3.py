# -*- coding: utf-8 -*-
# Batch 3 — Act 3: users, permissions and sudo.
B3 = {
"s36": dict(cmd="chmod", exp="change mode", viz="perm-switches",
 vizNote="Nine physical toggle switches in three labelled banks — owner, group, other — each bank showing read, write, execute. The switches actually throw as the number is applied, and the octal digit above each bank counts up from its three lit switches, so 755 is something you watch being assembled.",
 steps=["chmod 755 deploy.sh","chmod u=rwx,go=rx deploy.sh"],
 perms="rwxr-xr-x",
 stage=[("nine switches","in three banks of three"),("owner","the account that owns the file"),("group","everyone in the file's group"),
        ("other","literally everybody else"),("7 = 4 + 2 + 1","read plus write plus execute"),("5 = 4 + 1","read and execute, no write"),("u=rwx,go=rx","the same switches, by name")],
 verdict="7 is all three, 5 drops the write", vsub="that is the whole of what 755 means", n=
 "|Change mod, spelled C H M O D, is short for change mode, and a file's mode is really just @nine switches. They come in ^three banks of three. The first bank is ^the owner, the account the file belongs to. The second is ^the group, meaning everybody in the file's group. The third is ^other, which is literally everyone else. Each bank has read worth four, write worth two, and execute worth one, so ^seven is four plus two plus one, all three switches on, while ^five is four plus one, read and execute with the write left off. If numbers do not suit you, |the letter form sets ^exactly the same nine switches. ~Seven is all three. Five drops the write."),

"s37": dict(cmd="chown", exp="change owner", viz="perm-switches",
 vizNote="The same nine switches, but frozen and greyed to show they never move. What changes is the identity card attached to the owner and group banks — the name on it swaps, and the first bank re-points at the new person.",
 steps=["chown deploy app.py","chown deploy:www app.py"],
 stage=[("the owner","was santhu"),("now it is deploy","the same file, a new owner"),("add a colon","and you set the group too"),
        ("the group","now www"),("the nine switches","did not move at all"),("read, write, execute","set exactly as before"),
        ("the first bank","now applies to deploy"),("chmod and chown","are two separate jobs")],
 verdict="The permissions never changed", vsub="only the people they point at did", n=
 "|Change own, spelled C H O W N, is short for change owner, and it hands a file to somebody else. ^This file belonged to santhu, and after running that one short command ^it belongs to the deploy account instead. Files carry a group as well as an owner, and very often you want to set the two of them together in one go. So |add a colon and a second name, and ^you set both at once, making ^the group W W W. Now look carefully at what did not happen. ^The nine permission switches have not moved a millimetre. ^Read, write and execute are set exactly as they were before. What changed is that ^the first bank now describes a different person. ~Permissions describe a role rather than a person, which is precisely why ^these are two separate commands."),

"s38": dict(cmd="umask", exp="user file creation mask", viz="perm-switches",
 vizNote="A subtraction drawn on the switch banks: the default 666 lights up, the mask's bits are then physically switched OFF one by one, and the remaining lit switches read out as 644. The arithmetic happens on the switches, not as text.",
 steps=["umask","touch fresh.txt"],
 stage=[("666","where every new file starts"),("your mask, 022","the bits you never want"),("subtract it","those switches go off"),
        ("644","what you actually end up with"),("directories start at 777","not 666, because you must enter them"),
        ("the same mask gives 755","which is why folders look different"),("it never adds a bit","not once, ever"),("only removes them","hence the word mask")],
 verdict="It subtracts, it never grants", vsub="a mask can only ever take permissions away", n=
 "Here is a question almost nobody asks. When you make a new file, where do its permissions actually come from? The answer is |U mask, short for user file creation mask. Every new file starts life at ^six six six, read and write for everyone. Your mask, typically ^zero two two, lists the bits you never want handed out, and those switches are ^simply subtracted. What survives is ^six four four, which is exactly what you get when you |create a fresh file. Directories are slightly different: ^they start at seven seven seven, because you need execute permission to enter one at all, so ^the same mask leaves them at seven five five. And note that ^a mask never adds a single bit; ^it can only remove them, which is exactly what the word mask means. ~It can only take away."),

"s39": dict(cmd="sudo", exp="superuser do", viz="auth-gate",
 vizNote="A gate between the shell and the kernel. Without sudo the command hits the gate and bounces back with a denial. With sudo the rule file is visibly consulted, the gate opens, the command runs wearing a root badge, and a log line is written — then the badge is visibly removed.",
 steps=["systemctl restart nginx","sudo systemctl restart nginx"],
 stage=[("permission denied","you are not allowed"),("the sudoers file","is checked first"),("is santhu allowed?","yes, for this command"),
        ("it runs as root","with full privilege"),("the audit log","records that santhu did it"),
        ("the badge is handed back","the moment it finishes"),("the next command","runs as you again")],
 verdict="You are not root afterwards", vsub="the privilege lasts exactly one command", n=
 "|Restarting a service is something only an administrator may do, so run it as yourself and you get ^permission denied, which is the system working as intended. The obvious fix is to log in as root, and it is the wrong one, because then every command carries full power and nothing records who you were. What you want is to borrow that power once. So |put sudo in front, short for superuser do. First ^a rule file called sudoers is consulted to answer ^one question: is this user allowed to run this particular command? If the answer is yes, ^the command runs with full root privilege, and ^a line goes into the audit log naming you. And then ^the privilege is handed straight back, so ^the next thing you type runs as you again. ~It lasted exactly one command, and that is the entire point."),

"s40": dict(cmd="useradd", exp="add a user", viz="fs-writes",
 vizNote="Four system files drawn as real cards. Each one has a line physically written into it as the command runs. The home directory card stays empty and greyed unless -m is present, and the login attempt then visibly lands at / instead.",
 steps=["useradd deploy","useradd -m -s /bin/bash deploy"],
 stage=[("/etc/passwd","the account line is written"),("/etc/shadow","where the password will live"),("a group","created with the same name"),
        ("/home/deploy","not created — no -m was given"),("-m, for make home","now the folder appears"),
        ("-s","and this sets their shell"),("four files touched","by one short command")],
 verdict="Without -m they log in to /", vsub="with no home directory of their own", n=
 "|User add looks like one small command, and it is quietly doing four things at once. It writes ^a line into etc passwd, which is the account itself. It writes ^an entry into etc shadow, where the password hash will eventually live. It creates ^a group with the same name as the user. And then it stops, because ^the home directory is not created unless you ask. That is what |dash M is for, short for make home, and with it ^the folder finally appears. While you are there, ^dash S sets which shell they get. ^One short command, four separate changes. ~Forget dash M and that user logs straight into the root of the disk, owning nothing."),

"s41": dict(cmd="usermod", exp="modify a user", viz="group-sets",
 vizNote="The user's groups drawn as a real set of chips. With -aG a new chip is added and the existing ones stay lit. With -G alone the existing chips visibly fall away and vanish, leaving one — you watch the access disappear.",
 steps=["usermod -aG docker deploy","usermod -G docker deploy"],
 stage=[("sudo, www, dev","the groups they have now"),("-aG, append","adds one, keeps the rest"),("docker is added","and the other three stay"),
        ("-G on its own","replaces the whole list"),("sudo is gone","and so are www and dev"),("locked out of sudo","by one missing letter"),("no warning is given","the command simply succeeds")],
 verdict="The a stands for append", vsub="without it, -G means replace everything", n=
 "This user currently belongs to ^three groups, and you want to add a fourth. The command is |user mod, and the flag combination is dash A capital G. ^The A stands for append, meaning add to what is already there, so ^docker is added and the other three stay exactly where they were. Now watch what happens if you |forget that A. ^Capital G on its own does not mean add. It means replace the entire list with what follows, so ^sudo, W W W and dev are simply gone. And since sudo was one of them, ^that user is now locked out of administering the machine. And ^no warning is printed; the command reports success. ~One missing letter, and you have removed your own access."),

"s42": dict(cmd="userdel", exp="delete a user", viz="fs-writes",
 vizNote="The account line is struck out of /etc/passwd while the home directory card stays fully present on disk, its owner label degrading from a name into a bare numeric UID — the orphaned folder made visible.",
 steps=["userdel deploy","userdel -r deploy"],
 stage=[("the account line","removed from /etc/passwd"),("/home/deploy","still sitting on the disk"),
        ("its owner","is now just a number"),("the name is gone","but the UID remains"),("-r, for remove home","clears it properly"),
        ("orphaned folders","are how servers fill up"),("a new user","can inherit that same number")],
 verdict="The UID outlives the name", vsub="which is why old servers are full of folders owned by 1004", n=
 "|User del removes an account, and it does exactly what you asked and nothing more. ^The account line disappears from etc passwd, so that person can no longer log in. But look at the disk. ^Their home directory is still sitting there, every file intact. And because ^the name that owned it no longer exists, ^the owner is now displayed as a bare number. ^The name is gone, but the numeric user I D it was attached to is still stamped on every one of those files. |Add dash R and ^the home directory goes with the account. ~That is why old servers are littered with folders owned by a number nobody recognises, and worse, ^a new account can be handed that same number later."),

"s43": dict(cmd="passwd", exp="password", viz="hash-oneway",
 vizNote="A one-way funnel. The typed password enters, is visibly mangled through the hash into a fixed-length string, and the arrow back out is drawn as broken — the irreversibility is the picture, not a caption.",
 steps=["passwd"],
 stage=[("what you type","hunter2"),("a one-way hash","sha512-crypt"),("what is stored","$6$rounds$9fa3..."),
        ("the original","is never written anywhere"),("there is no way back","the arrow only runs one way"),
        ("logging in","hashes your attempt and compares"),("it compares hashes","never passwords"),("a leaked file","still hides the passwords"),("that is the whole design","not an implementation detail")],
 verdict="Nobody can hand it back to you", vsub="not the admin, not the system — a reset is the only route", n=
 "Everybody has typed this command at some point in their life, and almost nobody stops to think about where that password actually ends up. The command everyone knows is |pass W D, and what it does next is the interesting part. ^What you type goes in one end. It passes through ^a one-way hash, maths that is easy forwards and effectively impossible backwards. ^The result is what gets written to the shadow file. ^What you typed is never stored anywhere. ^There is no route back along that arrow, by design. So when you log in later the system ^hashes your attempt and ^compares the two results, never the passwords themselves. So ^even a stolen shadow file gives up nobody's password, and ^that is the entire design. ~Nobody can give your password back, not even the administrator, which is why a reset is the only way in."),

"s44": dict(cmd="chpasswd", exp="change passwords, in bulk", viz="pipe-flow",
 vizNote="A stream of user:password pairs flows down a pipe into the command, and each pair is consumed and stamped set as it passes, with a running counter — so bulk is something you watch, not read.",
 steps=["cat users.txt | chpasswd"],
 stage=[("a file of pairs","user, then password"),("fed down a pipe","one line at a time"),("deploy","set"),("ci","set"),
        ("ninety eight more","all set, in one pass"),("passwd cannot do this","it insists on a terminal"),("never in a script","and never in your shell history"),("that is deliberate","not an oversight")],
 verdict="Built to be scripted", vsub="which is deliberately the one thing passwd refuses to be", n=
 "Setting one password is fine. Setting a hundred of them by hand, on the morning a new team arrives and every account needs one, is not. That is why |ch pass W D exists. You give it ^a file of pairs, each line a username and the password it should get, ^fed down a pipe one line at a time. It works through them: ^deploy is set, ^C I is set, and ^ninety eight more follow in one pass. Now, you could not do this with pass W D, because ^pass W D deliberately insists on being run at a real terminal so that a password is never sitting in a script or a shell history. ^A password should never sit in a script or a history file, and ^that restriction is deliberate. ~Ch pass W D is the one built to be automated instead."),

"s45": dict(cmd="w", exp="who (and what they are doing)", viz="session-list",
 vizNote="Each login is drawn as its own terminal card with a TTY label and the command currently running inside it. One person opening a second connection visibly spawns a second card, which is what makes sessions-not-people concrete.",
 steps=["w"],
 stage=[("santhu","on pts/0, in an editor"),("deploy","on pts/1, running a sync"),("santhu again","on pts/2, a second connection"),
        ("two cards, one person","because these are sessions"),("the header line","carries the load average"),
        ("what they are running","not just who they are"),("who tells you names","and stops there"),("w tells you more","which is usually what you wanted"),("idle time too","how long since they typed")],
 verdict="Sessions, not accounts", vsub="one person logged in twice is two rows, every time", n=
 "Somebody else is on this server, and you would like to know who they are and what they are up to, before you restart anything. The command that answers is |W, which is the shortest on this whole list and covers both at once. ^Santhu is on P T S zero, in an editor. ^Deploy is on P T S one, running a sync. And here is ^santhu again on P T S two, because they opened a second connection. That is ^two rows for one person, which trips people up constantly. These are sessions, not accounts. ^The header line across the top carries the load average, so you get a sense of the machine at the same time. It shows ^what each session is running and ^how long it has been idle. ^Who gives names and stops; ^W goes further. ~These are sessions, not accounts."),

"s46": dict(cmd="last", exp="(last logins)", viz="session-list",
 vizNote="A time-ordered ledger scrolling back through days, each row a login with its timestamp. The 03:12 root login is drawn at genuinely odd hours against a day/night band so the anomaly is visual, not annotated.",
 steps=["last -n 5"],
 stage=[("root","logged in at 03:12"),("at three in the morning","which deserves a second look"),("santhu","Monday at 09:01, normal"),
        ("reboot","Sunday at 22:40"),("it reads a log file","wtmp, going back weeks"),
        ("which means it can be edited","by anyone who gets root"),("so it is evidence","but not proof"),("check it early","before anything else is touched")],
 verdict="First place to look after a breach", vsub="and the first thing a competent attacker clears", n=
 "W tells you who is on the machine at this moment. The more useful question, once something has already gone wrong, is who was here earlier today, and |last answers exactly that, going back weeks. ^Root signed in ^at twelve minutes past three in the morning, and whether or not that is fine, it is the row you stop on. ^Santhu logged in on Monday morning, which looks completely ordinary. ^The machine rebooted on Sunday evening. All of this comes from ^a log file called W T M P, which is worth knowing for one uncomfortable reason: ^a file can be edited by anyone who has root. So ^it is evidence rather than proof, and ^you check it early, before anything else gets touched. ~It is the first place to look after a breach, and the first thing a competent attacker clears."),

"s47": dict(cmd="chroot", exp="change root", viz="env-scope",
 vizNote="The tree redraws with a new root boundary: everything above the chosen directory is greyed out and cut away, so the process's entire visible universe shrinks on screen. An attempt to climb out stops dead at the boundary.",
 steps=["chroot /mnt/recovery /bin/bash"],
 stage=[("a directory","is declared the new root"),("everything above it","becomes invisible"),("ls /","shows only the jail"),
        ("cd ..","cannot climb out of it"),("but a root user can","with the right system calls"),
        ("so it is not a sandbox","it was never designed as one"),("containers do this properly","with kernel namespaces"),("rescue work","is what it is genuinely for")],
 verdict="Isolation, not security", vsub="if you mean security, use a container", n=
 "Sometimes you need a process to believe that one folder is the entire filesystem. The usual reason is repair: you have booted from a U S B stick and want to run commands as though you were inside the broken install. |Ch root, short for change root, takes ^a directory and declares it the root for one process. From inside, ^everything above that directory simply stops existing. Run ^L S on slash and you see only the jail. Try to ^climb out with dot dot and you cannot, because there is nothing above you to climb into. But ^a root user inside can break out with the right system calls, ^because it was never built to contain a hostile process. ^Containers do that job properly, using kernel namespaces. ^Rescue work is what ch root is genuinely for. ~Treat it as isolation, never as security."),
}
