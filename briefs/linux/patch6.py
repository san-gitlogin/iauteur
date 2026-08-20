import json,re
T='briefs/linux/table.json'
rows=json.load(open(T))
# Spoken forms — the same words the narration already uses, so nothing changes
# in how edge-tts says them.
SPOKEN={"CMD_CD":"C D","CMD_PWD":"P W D","CMD_LS":"L S","CMD_MKDIR":"make dir","CMD_TOUCH":"touch",
"CMD_CP":"C P","CMD_MV":"M V","CMD_RM":"R M","CMD_LN":"L N","CMD_CLEAR":"clear","CMD_CAT":"cat",
"CMD_TAC":"tac","CMD_MORE":"more","CMD_LESS":"less","CMD_TAIL":"tail","CMD_VI":"V I","CMD_DIFF":"diff",
"CMD_FIND":"find","CMD_LOCATE":"locate","CMD_GREP":"grep","CMD_AWK":"awk","CMD_SED":"sed","CMD_XARGS":"xargs",
"CMD_CHMOD":"change mod","CMD_CHOWN":"change own","CMD_UMASK":"U mask","CMD_SUDO":"sudo","CMD_USERADD":"user add",
"CMD_USERMOD":"user mod","CMD_USERDEL":"user del","CMD_PASSWD":"pass W D","CMD_CHPASSWD":"ch pass W D",
"CMD_W":"W","CMD_LAST":"last","CMD_CHROOT":"ch root","CMD_PS":"P S","CMD_PSTREE":"P S tree","CMD_TOP":"top",
"CMD_HTOP":"H top","CMD_BTOP":"B top","CMD_ATOP":"A top","CMD_GLANCES":"glances","CMD_NMON":"N mon",
"CMD_KILL":"kill","CMD_KILLALL":"kill all","CMD_NOHUP":"no hup","CMD_SLEEP":"sleep","CMD_WAIT":"wait",
"CMD_LSOF":"L S O F","CMD_STRACE":"S trace","CMD_UPTIME":"up time","CMD_FREE":"free","CMD_VMSTAT":"V M stat",
"CMD_IOSTAT":"I O stat","CMD_IOTOP":"I O top","CMD_DSTAT":"D stat","CMD_SAR":"S A R","CMD_WATCH":"watch",
"CMD_DF":"D F","CMD_DU":"D U","CMD_NCDU":"N C D U","CMD_FDISK":"F disk","CMD_PARTED":"parted","CMD_BLKID":"blk id",
"CMD_MKFS":"make F S","CMD_FSCK":"F S C K","CMD_MOUNT":"mount","CMD_UMOUNT":"unmount","CMD_DD":"D D",
"CMD_IP":"I P","CMD_PING":"ping","CMD_TRACEROUTE":"trace route","CMD_MTR":"M T R","CMD_NETSTAT":"net stat",
"CMD_SS":"S S","CMD_NMCLI":"N M C L I","CMD_IFTOP":"if top","CMD_NETHOGS":"net hogs","CMD_NLOAD":"N load",
"CMD_DIG":"dig","CMD_HOST":"host","CMD_NSLOOKUP":"N S lookup","CMD_WHOIS":"who is","CMD_SSH":"S S H",
"CMD_SCP":"S C P","CMD_RSYNC":"R sync","CMD_NC":"N C","CMD_WGET":"W get","CMD_CURL":"curl","CMD_TAR":"tar",
"CMD_GZIP":"gzip","CMD_BZIP2":"B zip two","CMD_ZIP":"zip","CMD_CRON":"cron","CMD_CRONTAB":"crontab",
"CMD_BASHSCRIPT":"the script","CMD_ALIAS":"alias","CMD_ENV":"env","CMD_HISTORY":"history","CMD_SCREEN":"screen",
"CMD_TMUX":"T mux","CMD_SYSTEMCTL":"system C T L","CMD_JOURNALCTL":"journal C T L","CMD_DMESG":"D mesg",
"CMD_MAN":"man","CMD_APROPOS":"apropos","CMD_TLDR":"T L D R","CMD_CHEAT":"cheat","CMD_LSPCI":"L S P C I",
"CMD_LSUSB":"L S U S B"}
n=0
for r in rows:
    name=SPOKEN.get(r['type'])
    if not name: continue
    s=r['narration']
    # Name the subject at the start of a sentence instead of pointing at it.
    # Marker-safe: `(?<!\|)` keeps an anchored word from being rewritten.
    for pat,rep in ((r'(?<![|\w])It\'s\b', name+" is"), (r'(?<![|\w])It\b', name)):
        s2=re.sub(pat, rep, s, count=1)
        if s2!=s: n+=1; s=s2
    r['narration']=s
json.dump(rows,open(T,'w'),indent=1); print("named subjects in",n,"places")
