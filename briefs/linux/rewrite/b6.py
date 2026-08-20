# -*- coding: utf-8 -*-
# Batch 6 — Act 6: disks, filesystems and dd.
B6 = {
"s80": dict(cmd="df", exp="disk free", viz="disk-map",
 vizNote="The filesystem drawn twice as two separate physical capacity bars: one for space in gigabytes, one for inodes. The space bar sits at 62% while the inode bar is completely full, so the contradiction is visible side by side.",
 steps=["df -h","df -i"],
 stage=[("space used","62 percent, plenty spare"),("so writes should work","and yet they are failing"),
        ("every file needs an inode","one each, no exceptions"),("inodes are a fixed number","set when the filesystem was made"),
        ("inodes used","100 percent"),("millions of tiny files","each one took an inode"),
        ("the disk is full of names","not of data")],
 verdict="Space free, and still out of room", vsub="df -h is the habit; df -i is the one that finds this", n=
 "|D F is short for disk free, and dash H shows you ^how full each filesystem is. Sixty two percent, so there is plenty of room, ^which makes it very strange that writes are failing. Here is what is happening. ^Every single file on the disk needs an inode, a small record holding its permissions, owner and location. ^The number of inodes is fixed when the filesystem is created and it never grows. So run |D F dash I and ^inodes are at a hundred percent. ^Millions of tiny files, a session cache perhaps, consumed one inode each. ^The disk is full of names rather than of data. ~You have free space and nowhere to put anything."),

"s81": dict(cmd="du", exp="disk usage", viz="disk-map",
 vizNote="A treemap where each folder's rectangle is genuinely proportional to its size. Descending a level re-renders the treemap for that folder, so the hunt narrows visually and the culprit file ends up filling the frame.",
 steps=["du -sh /var/*","du -h -d 1 /var/log"],
 stage=[("/var/log","by far the biggest"),("/home","26 gigabytes"),("/usr","18 gigabytes"),
        ("df said full","du says which folder"),("go one level deeper","into /var/log itself"),
        ("/var/log/nginx","and there is the culprit"),("walk down, never guess","one level at a time")],
 verdict="df tells you it is full", vsub="du tells you what filled it", n=
 "D F told you the disk is full. |D U, short for disk usage, tells you what filled it, because it measures by directory rather than by filesystem. So at the top level ^var log is by far the biggest, ^home is twenty six gigabytes, ^user is eighteen. ^That is the difference between the two commands in one line. Now, do not guess from here. |Run it again one level deeper, pointed at ^var log itself, and ^var log engine X is the actual culprit, holding forty one gigabytes of access logs nobody rotated. ^Walk down one level at a time and the answer falls out. ~D F says it is full; D U says what filled it."),

"s82": dict(cmd="ncdu", exp="NCurses disk usage", viz="disk-map",
 vizNote="The same treemap, but navigable: pressing enter zooms into a folder and redraws, with a breadcrumb trail building along the top so the descent is one continuous movement rather than three separate commands.",
 steps=["ncdu /var"],
 stage=[("it sorts as it scans","biggest first, automatically"),("press enter on /var/log","and it descends"),
        ("press enter again","into nginx"),("access.log.1","41 gigabytes, one file"),
        ("three keystrokes","to reach the answer"),("du needed three commands","and you typing each path")],
 verdict="Same walk, but you can browse it", vsub="which is why it is the one people actually install", n=
 "D U works, but in practice you end up typing the same command three times over, with a longer path on each attempt. |N C D U does that same walk and lets you move around inside the result. ^It sorts as it scans, biggest first. ^Press enter on var log and it descends into it. ^Press enter again on engine X. And there is ^access dot log dot one, forty one gigabytes in a single file. That took ^three keystrokes, where ^D U needed three separate commands and you retyping the path each time. ~It is the same walk underneath, but you can browse it, which is exactly why it is the one people actually end up installing."),

"s83": dict(cmd="fdisk", exp="fixed disk", viz="partition-map",
 vizNote="The disk drawn as a single continuous bar carved into partitions. Edits are shown against an in-memory copy that hovers above the real disk; only pressing w drops the copy onto it. Quitting with q visibly discards the copy.",
 steps=["fdisk -l /dev/sda","fdisk /dev/sda"],
 stage=[("sda1","the boot partition"),("sda2","the root filesystem"),("sda3","swap"),
        ("-l only looks","it changes nothing"),("without -l it edits","but only in memory"),
        ("press w","and it is written for real"),("press q","and nothing happened at all")],
 verdict="Nothing is written until you press w", vsub="which makes it far safer to explore than it looks", n=
 "|F disk dash L reads the partition table and prints it, so you can see that this disk carries ^S D A one, the boot partition, ^S D A two, the root filesystem, and ^S D A three, which is swap. ^With dash L it only looks; it changes nothing at all. That makes it completely safe to run on anything. Now |run it without dash L and you are in the editor proper, and this is the part that makes it approachable. ^Every change you make happens to a copy held in memory, not to the disk. Add partitions, delete them, change types. Nothing is real until ^you press W to write. And if you have made a mess, ^press Q and absolutely nothing happened. ~That is why F disk is safer to explore than its reputation suggests."),

"s84": dict(cmd="parted", exp="partition editor", viz="partition-map",
 vizNote="The address field is drawn as a physical row of bits with a hard wall at the 2TB mark. MBR's row runs out of bits at the wall; GPT's row extends far past it, so the limit is a shape rather than a claim.",
 steps=["parted /dev/sdb mklabel gpt"],
 stage=[("MBR","the old partition table"),("32 bits to address blocks","which is the whole problem"),
        ("it stops at 2 terabytes","and cannot go further"),("GPT","the modern replacement"),
        ("64 bits instead","which is an enormous difference"),("your 4TB disk","simply needs GPT"),
        ("parted handles both","fdisk struggles with GPT")],
 verdict="Over 2TB, MBR physically cannot", vsub="the address field is not wide enough to describe the disk", n=
 "You plug in a four terabyte disk and F disk gets awkward about it. Here is why. ^M B R, the old partition table format, uses ^thirty two bits to address blocks on the disk. That sounds like a lot, and with five hundred and twelve byte blocks ^it runs out at two terabytes. Not a policy, not a bug; the field is simply not wide enough to describe a larger disk. ^G P T is the replacement, and it uses ^sixty four bits instead, which is a difference so large it stops being worth discussing. So ^your four terabyte disk needs G P T, and |parted is the tool that writes one, since ^F disk was built for the older format. ~Over two terabytes, M B R physically cannot."),

"s85": dict(cmd="blkid", exp="block device ID", viz="device-ids",
 vizNote="Two panels: device names on the left and UUIDs on the right, joined by lines. On reboot the left-hand names visibly shuffle between disks while the right-hand UUIDs stay welded to their partitions, so the instability is watched rather than described.",
 steps=["blkid"],
 stage=[("/dev/sdb1","the name it has today"),("a name is a position","not an identity"),
        ("plug in a USB stick","and reboot"),("the names shuffle","sdb becomes sdc"),
        ("the UUID","never changes at all"),("it is written into the filesystem","when it was created"),
        ("so put UUIDs in fstab","and never device names")],
 verdict="Device names are not promises", vsub="which is how a server boots into emergency mode after a reboot", n=
 "Here is a failure that ruins somebody's morning roughly once a year, and it is entirely avoidable once you know that this one small command exists. |Blk I D prints every block device with its filesystem type and its U U I D. Today this partition is ^slash dev slash S D B one. The trouble is that ^a name like that describes a position, not an identity. ^Plug a U S B stick in and ^reboot, and ^the names shuffle: what was S D B is now S D C. Anything in fstab pointing at the old name now points at the wrong disk. But ^the U U I D never changes, because ^it is written into the filesystem itself. ~So put U U I Ds in fstab, never device names."),

"s86": dict(cmd="mkfs", exp="make filesystem", viz="disk-map",
 vizNote="The partition's block grid is shown holding real data. As mkfs runs, the grid is overwritten with empty filesystem structure sweeping across it, and the old blocks are visibly abandoned rather than erased — which is exactly what recovery tools rely on.",
 steps=["mkfs.ext4 /dev/sdb1"],
 stage=[("the partition","currently holds your data"),("mkfs writes structure","inode tables and superblocks"),
        ("it does not erase","it simply stops referencing"),("the old blocks","are now unreachable"),
        ("an empty filesystem","ready to mount"),("no confirmation prompt","none at all"),
        ("check the device name","twice, out loud")],
 verdict="It formats whatever you pointed at", vsub="and it will not ask whether you meant it", n=
 "A partition is just a region of a disk; on its own it cannot hold files at all. Something has to write the structure that turns it into a filesystem, and that something is |make F S. Before you run it ^the partition holds your data. As it runs ^it writes structure: inode tables, superblocks, the bookkeeping a filesystem needs to exist. Note what it does not do. ^It does not erase your files. It simply stops referring to them, which is why ^the old blocks become unreachable rather than destroyed, and why recovery tools sometimes work. What you are left with is ^an empty filesystem, ready to mount. And like most of this drawer, ^there is no confirmation prompt whatsoever. ~So ^read the device name twice before you press return."),

"s87": dict(cmd="fsck", exp="filesystem check", viz="disk-map",
 vizNote="The filesystem's structures are swept in sequence with a moving scan head — inode table, block map, directory tree — and an orphaned inode is found and visibly reattached. Running against a mounted disk shows the kernel writing behind the scan head, corrupting what it just verified.",
 steps=["fsck /dev/sdb1","umount /dev/sdb1 && fsck -y /dev/sdb1"],
 stage=[("it warns you","the device is mounted"),("that warning is serious","and people ignore it"),
        ("the kernel is writing","while fsck is reading"),("so it repairs stale information","and corrupts the disk"),
        ("unmount first","every time, without exception"),("then it sweeps the inodes","and the block map"),
        ("an orphan is found","and reattached to lost+found")],
 verdict="On a mounted disk it causes damage", vsub="it is fixing a picture of the filesystem that is already out of date", n=
 "|F S C K, short for filesystem check, looks for damage and repairs it. Run it on a live disk and ^it warns you that the device is mounted. ^That warning is not boilerplate, and people ignore it constantly. The reason it matters is this: ^the kernel is still writing to that filesystem while F S C K is reading it, so ^F S C K makes decisions from a picture that is already out of date, and ^repairs things that were never broken. That corrupts the disk you were trying to fix. So |unmount it first, always. ^Then it sweeps the inode table and the block map properly, and ^an orphaned inode gets reattached into lost plus found. ~Never run it on something mounted."),

"s88": dict(cmd="mount", exp="(mount a filesystem)", viz="mount-tree",
 vizNote="The main tree is drawn, then a second disk's tree is grafted onto a chosen folder. Whatever was already in that folder is pushed underneath and greyed out, still present but unreachable, and unmounting visibly restores it.",
 steps=["mount /dev/sdb1 /mnt/data"],
 stage=[("one tree","not one tree per disk"),("/mnt/data","an ordinary empty folder"),
        ("the new disk","is grafted onto it"),("its contents appear there","as if they always had"),
        ("anything already in that folder","is hidden underneath"),("hidden, not deleted","it is completely untouched"),
        ("unmount","and it reappears exactly as it was")],
 verdict="Linux has one tree, not one per disk", vsub="which is why there are no drive letters to remember", n=
 "Windows gives every disk its own letter. Linux does something quite different: there is ^only ever one tree, and other disks are attached into it wherever you like. |Mount is how. You pick ^a folder, here M N T data, which is just an ordinary directory. ^The new disk is grafted onto that point, and ^its contents now appear there as though they always had. Now the part that confuses people. ^If that folder already had files in it, they are hidden underneath the mount. ^Hidden, not deleted, and completely untouched. ^Unmount the disk and they reappear exactly as they were. ~One tree, not one per disk, which is why Linux has no drive letters to remember."),

"s89": dict(cmd="umount", exp="unmount", viz="handle-map",
 vizNote="The mount point is drawn with real handle lines running to the processes holding it. Unmount is physically blocked while any line remains; killing the process snaps its line and the unmount then completes.",
 steps=["umount /mnt/data","lsof /mnt/data","kill 4821 && umount /mnt/data"],
 stage=[("target is busy","and it will not budge"),("something has a file open","that is the only reason"),
        ("tail, PID 4821","holding a log on that disk"),("kill it","and the handle closes"),
        ("now unmount works","cleanly, first time"),("-f forces it","and can lose buffered writes"),
        ("-l is the gentler one","it detaches when the last handle closes")],
 verdict="Never reach for -f first", vsub="the refusal is protecting data that has not reached the disk yet", n=
 "|Unmount refuses with ^target is busy, which sounds like an obstruction and is actually doing you a favour. ^It only ever happens because something still holds a file open on that disk. So |L S O F names the culprit: ^tail is holding a log file open on that disk, and until that process lets go, nothing else is going to happen here. |Kill it and ^the handle closes, so ^the unmount works first time. What you should not do is reach straight for ^dash F to force it, because there may be writes sitting in memory that have not reached the disk yet, and forcing throws them away. If you genuinely cannot stop the process, ^dash L is the gentler option; it detaches the filesystem and finishes the job once the last handle closes. ~The refusal is protecting data."),

"s90": dict(cmd="dd", exp="(copy blocks)", viz="disk-map",
 vizNote="Two disks drawn as block grids with an arrow between them. if= and of= are physically bound to the source and target, and the arrow direction flips when they swap. Aimed at the running system, the target grid is the OS itself, overwritten block by block with no prompt anywhere.",
 steps=["dd if=/dev/sda of=backup.img","dd if=backup.img of=/dev/sdb","dd if=backup.img of=/dev/sda"],
 stage=[("if= is the input","the disk you read from"),("of= is the output","the disk you write over"),
        ("read sda, write a file","a perfectly good backup"),("read the file, write sdb","restoring onto a spare disk"),
        ("now swap one letter","of=/dev/sda instead"),("that is your running system","being overwritten right now"),
        ("no prompt","no progress, no undo")],
 verdict="Four characters, and the disk is gone", vsub="add status=progress so it at least tells you what it is doing", n=
 "And here is the answer to the question I opened with. |D D copies blocks and asks nothing of anybody. Two arguments do all the work: ^I F equals is the input, the thing you read from, and ^O F equals is the output, the thing you write over. Used properly it is excellent. ^Read your disk, write a file, and that is a genuine full backup. |Read ^the file back onto a spare disk and you have restored it. Now |swap ^one letter so the output is slash dev slash S D A, and ^that is your running system being overwritten while you watch. ^No prompt, no progress bar, no undo. ~Four characters. Add status equals progress so it at least tells you what it is doing."),
}
