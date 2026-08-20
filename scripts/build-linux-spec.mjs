#!/usr/bin/env node
// BUILD-LINUX-SPEC — assembles topics/linux-commands-masterclass/long.json from a
// narration table, wiring every anchor to the WORD IT IS SPOKEN ON.
//
// Narration is authored with TYPED markers. Each marker marks the word an element
// animates on, and the marker's SIGIL says which element it drives:
//     |word  → the next terminal step types here
//     ^word  → the next right-hand stage item lands here
//     @word  → the permission cells start flipping here
//     ~word  → the verdict chip lands here
// The marker is stripped before the text ever reaches edge-tts, so the spoken
// line is clean while the anchors are exact.
//
// WHY TYPED, not positional (owner, 2026-08-18): *"on the left you show a bunch of
// commands, your left side command animation just completes quicker, and you are
// still explaining the first command."* The old rule consumed markers strictly in
// order — every step first, then every stage item — which FORCED the author to put
// all the terminal anchors at the front of the sentence. Measured across the first
// cut: the terminal finished typing at a median of 11% into the narration and then
// sat frozen for the remaining 89% while only the right pane moved. Typed markers
// let a scene interleave properly: type a command, draw what it did, type the next
// one — so both panes stay alive for the whole scene.
//
// Narration is also written in SPOKEN form ("L S dash L", "change mod seven five
// five") because the owner's rule is that pronunciation gets fixed in the text we
// hand the TTS, not excused afterwards. The on-screen command text stays real —
// it lives in the component's data, not in the narration.
import fs from 'node:fs';
import path from 'node:path';
import {MANIFEST} from './lib/manifest.mjs';

const [tablePath, outPath] = process.argv.slice(2);
if (!tablePath || !outPath) { console.error('usage: build-linux-spec <table.json> <out.json>'); process.exit(2); }
const table = JSON.parse(fs.readFileSync(tablePath, 'utf8'));

const clean = (s) => s.replace(/[|^@~]/g, '').replace(/\s+/g, ' ').trim();
const frames = (s) => clean(s).split(' ').length * 12 + 30;

const SIGILS = {'|': 'step', '^': 'stage', '@': 'perms', '~': 'verdict'};

/** Typed markers in narration order: [{role, word}]. */
const markers = (s) => {
  const out = [];
  let w = 0;
  for (const tok of s.split(/\s+/)) {
    if (!tok) continue;
    w += 1;
    const role = SIGILS[tok[0]];
    if (role) out.push({role, word: w});
  }
  return out;
};
/** Just the word indices, for structural scenes that list explicit anchor paths. */
const markerWords = (s) => markers(s).map((m) => m.word);

const scenes = [];
let missing = 0;

for (const row of table) {
  const {id, type, narration, transition, background} = row;
  const sc = {
    id,
    type,
    narration: clean(narration),
    durationFrames: frames(narration),
    timingSource: 'estimated',
    background: background ?? 'zoneA',
    data: {},
  };
  if (transition) sc.transition = transition;

  if (row.data) {
    // structural scenes carry their data inline
    sc.data = JSON.parse(JSON.stringify(row.data));
    const ms = markerWords(narration);
    // structural scenes list their own anchor paths in `anchors`
    (row.anchors ?? []).forEach((p, i) => {
      if (ms[i] == null) return;
      const parts = p.split('.');
      let o = sc.data;
      for (let k = 0; k < parts.length - 1; k++) o = o?.[parts[k].match(/^\d+$/) ? Number(parts[k]) : parts[k]];
      if (o) o[parts.at(-1)] = ms[i];
    });
  } else {
    // a command scene: take the component's own verified example as the base
    const man = MANIFEST[type];
    if (!man || !man.example) { console.error(`! ${type} has no manifest example`); missing++; continue; }
    const key = man.data_key;
    const d = JSON.parse(JSON.stringify(man.example[key] ?? man.example));
    if (row.headline) d.headline = row.headline;

    // Each queue drains from the markers that name it, so the author is free to
    // interleave them in whatever order the sentence actually teaches in.
    const q = {step: [], stage: [], perms: [], verdict: []};
    for (const m of markers(narration)) q[m.role].push(m.word);

    // CMD_LS is the one hand-built component with a bespoke anchored array; its
    // `columns` land on the stage queue like any other right-hand element.
    const stageItems = [...(d.stage ?? []), ...(d.columns ?? [])];
    const need = {
      step: (d.steps ?? []).length,
      stage: stageItems.length,
      perms: d.perms != null ? 1 : 0,
      verdict: d.verdict ? 1 : 0,
    };
    for (const role of ['step', 'stage', 'perms', 'verdict']) {
      if (q[role].length < need[role]) {
        // A component element with no sigil to fire it never animates: the pane sits
        // still while the voice talks (LAW 0i). Fatal — see build-dsa-spec.mjs, where
        // this exact fault reached a render because the count was merely printed.
        console.error(`✗ ${id} ${type}: needs ${need[role]} ${role} marker(s), narration has ${q[role].length} — that element never fires`);
        missing++;
      }
    }

    (d.steps ?? []).forEach((s, k) => { if (q.step[k] != null) s.atWord = q.step[k]; });
    stageItems.forEach((s, k) => { if (q.stage[k] != null) s.atWord = q.stage[k]; });
    if (d.perms != null && q.perms[0] != null) d.permsAtWord = q.perms[0];
    if (d.verdict && q.verdict[0] != null) d.verdictAtWord = q.verdict[0];
    d.atWord = 1;

    // The defect this guards: a terminal that has typed its last command 11% into
    // the narration is a dead pane for the rest of the scene.
    // A MULTI-command beat must keep typing into the second half, or the left pane
    // is finished while the voice is still on the first command — the defect the
    // owner reported. A SINGLE-command beat only ever types once, so the bar there
    // is just that the setup comes first rather than the command opening cold.
    // Measured against the TAUGHT portion — the words up to the last anchor — not the
    // whole narration. Every beat closes with an anchor-free landing line (LAW 8 +
    // LAW 0f rule 8), and counting that coda in the denominator would penalise a beat
    // for having a proper ending.
    const lastStep = q.step[need.step - 1];
    const lastAnchor = Math.max(...[...q.step, ...q.stage, ...q.perms, ...q.verdict], 1);
    const floor = need.step >= 2 ? 0.5 : 0.22;
    if (need.step > 0 && lastStep != null && lastStep / lastAnchor < floor) {
      console.error(
        `✗ ${id} ${type}: terminal finishes at ${Math.round((lastStep / lastAnchor) * 100)}% of the taught portion (want >=${floor * 100}%)`
      );
      missing++;
    }
    sc.data[key] = d;
  }
  scenes.push(sc);
}

const spec = {
  meta: {
    topic: '109 Linux Commands, One Video',
    format: 'long',
    fps: 30,
    screenplay: 'masterclass',
    onePayoff: 'You can sit at any Linux box and know which tool to reach for, and why.',
    openLoop: 'One command on every beginner list wipes a disk in four characters. Which one?',
    analogy: 'THE BENCH - the terminal is a workbench and each command is a tool in a drawer.',
    topicAxes: ['tribal-conflict', 'sovereignty'],
    seo: {
      title: 'All 109 Linux Commands — And The 4 That Wipe Your Disk',
      altTitles: [
        '109 Linux Commands in One Video (Sysadmin Course 2026)',
        'Stop Googling Linux Commands — All 109, Sorted By Job',
        'Every Linux Command A Sysadmin Types, In One Sitting',
      ],
      hook: "One command on every beginner's list wipes an entire disk in four characters. Do you know which one?",
      breakdown:
        'all 109 commands a Linux sysadmin actually types, each one running in a live terminal with the effect drawn beside it — grouped into ten drawers by the job they do, from moving around the filesystem to reading logs, managing users, chasing processes, carving disks and keeping jobs alive after you log out.',
      // Explicit, because this cut closes on the bench rather than a RECAP and the
      // derived chapter would otherwise land mid-video.
      chapters: [
        {id: 's01', title: 'The command you cannot remember'},
        {id: 's03', title: 'The bench: 109 tools, ten drawers'},
        {id: 's06', title: '1 · Moving around and handling files'},
        {id: 's19', title: '2 · Reading text and finding it'},
        {id: 's35', title: '3 · Users, permissions and sudo'},
        {id: 's50', title: "4 · Processes, signals and what's running"},
        {id: 's68', title: '5 · Watching the machine'},
        {id: 's79', title: '6 · Disks, filesystems and dd'},
        {id: 's94', title: '7 · The network from this machine'},
        {id: 's107', title: '8 · SSH, rsync and reaching other machines'},
        {id: 's120', title: '9 · Archives, cron, systemd and tmux'},
        {id: 's138', title: '10 · man, tldr and getting unstuck'},
        {id: 's146', title: 'The bench, all ten drawers filled'},
      ],
      queries: [
        "linux commands list for sysadmins",
        "all linux commands explained in one video",
        "linux commands cheat sheet 2026",
        "complete linux command line course",
        "linux commands every developer should know",
        "what does dd command do linux",
        "dd if of explained",
        "chmod 755 meaning explained",
        "chmod vs chown difference",
        "umask explained linux",
        "hard link vs symbolic link linux",
        "what is an inode linux",
        "sigterm vs sigkill difference",
        "kill -9 when to use",
        "linux load average explained cores",
        "why is free memory low linux",
        "available vs free memory linux",
        "vmstat swap si so meaning",
        "iostat await column meaning",
        "systemctl start vs enable difference",
        "journalctl filter by service",
        "tar czvf flags explained",
        "tar extract command",
        "cron five fields explained",
        "crontab -e vs editing file",
        "lsof port already in use",
        "address already in use linux fix",
        "df -i inodes full but space free",
        "du find large directories linux",
        "rsync trailing slash explained",
        "scp remote copy colon",
        "ssh key pub vs private",
        "nslookup non-authoritative answer meaning",
        "dig ttl explained",
        "refused vs timeout port",
        "grep -v invert match",
        "awk print column",
        "sed -i in place edit",
        "xargs why needed",
        "nohup vs screen vs tmux",
        "screen reattach session",
        "man section numbers explained",
        "tldr command install",
        "the nbx studio linux commands"
      ],
      hashtags: ["#linux", "#linuxcommands", "#sysadmin", "#devops", "#terminal", "#thenbxstudio"],
      // YouTube tags box, comma-joined and hard-capped at 500 chars by the upload
      // kit. Absent in the first cut, which is why the tag block shipped empty.
      tags: [
        "linux",
        "linux commands",
        "linux tutorial",
        "linux for beginners",
        "linux command line",
        "linux terminal",
        "bash",
        "shell scripting",
        "sysadmin",
        "devops",
        "linux server",
        "ubuntu commands",
        "linux cheat sheet",
        "grep",
        "awk",
        "sed",
        "chmod",
        "chown",
        "systemctl",
        "journalctl",
        "rsync",
        "ssh",
        "tar",
        "cron",
        "dd command",
        "lsof",
        "strace",
        "netstat",
        "ss command",
        "df du",
        "ps aux",
        "htop",
        "kill signal",
        "mount",
        "fdisk",
        "linux permissions",
        "linux processes",
        "linux networking",
        "rhcsa",
        "linux interview questions",
        "the nbx studio"
      ],
      pinned:
        'Every drawer is its own chapter in the description, so you can jump straight to the one you need. Which command surprised you most?',
    },
  },
  brand: {
    theme: 'moderndark', design: 'moderndark', themeLight: 'daylight', background: 'grid',
    channel: 'THE NBX STUDIO', logo: 'img:channel_logo.png',
  },
  // The hook is the challenge, not the count: someone who already knows Linux is
  // the viewer being addressed, and "you know maybe 20" is what makes them click.
  thumbnail: {title: "YOU KNOW MAYBE 20", badge: "109 Linux Commands", asset: 'si:linux'},
  scenes,
};
if (missing) {
  console.error(`\n✗ REFUSED — ${missing} anchor fault(s). Nothing written to ${outPath}.`);
  console.error(`  Every stepped element needs its own typed marker in the narration.`);
  process.exit(1);
}
fs.writeFileSync(outPath, JSON.stringify(spec, null, 2));
const total = scenes.reduce((a, s) => a + s.durationFrames, 0);
console.log(`${scenes.length} scenes · est ${Math.floor(total / 30 / 60)}:${String(Math.round(total / 30) % 60).padStart(2, '0')} · ${missing} missing`);
