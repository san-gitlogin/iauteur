const $ = (id) => document.getElementById(id);
let CONFIG = null;
let selectedDesign = null;

function opt(sel, values, current) {
  sel.innerHTML = "";
  for (const v of values) {
    const o = document.createElement("option");
    o.value = v; o.textContent = v;
    if (v === current) o.selected = true;
    sel.appendChild(o);
  }
}

async function boot() {
  CONFIG = await (await fetch("/api/config")).json();
  opt($("format"), CONFIG.formats, "both");
  opt($("preset"), CONFIG.presets, "explainer");
  opt($("audience"), CONFIG.audiences, "general");
  opt($("themeLight"), CONFIG.themeLights, "daylight");
  opt($("background"), CONFIG.backgrounds, "(theme default)");
  $("channel").value = CONFIG.channelDefault;

  // design gallery
  const grid = $("designGrid");
  grid.innerHTML = "";
  for (const d of CONFIG.designs) {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.key = d.key;
    const thumb = d.preview
      ? `<span class="thumb" style="background-image:url('${d.preview}')"></span>`
      : `<span class="noimg">no preview</span>`;
    card.innerHTML = `${thumb}<div class="name">${d.label}<small>${d.theme}</small></div>`;
    card.onclick = () => selectDesign(d.key);
    grid.appendChild(card);
  }
  selectDesign("moderndark");

  // existing topics dropdown for actions
  const tp = $("topicPick");
  tp.innerHTML = `<option value="">— existing —</option>`;
  for (const t of CONFIG.topics) {
    const o = document.createElement("option");
    o.value = t.slug;
    o.textContent = `${t.slug}${t.theme ? " · " + t.theme : ""}`;
    tp.appendChild(o);
  }
  tp.onchange = () => { if (tp.value) $("actionSlug").value = tp.value; refreshOutputs(); };
}

function selectDesign(key) {
  selectedDesign = key;
  document.querySelectorAll(".card").forEach(c => c.classList.toggle("sel", c.dataset.key === key));
  const d = CONFIG.designs.find(x => x.key === key);
  $("picked").textContent = d ? `→ ${d.label}` : "";
}

$("genBtn").onclick = async () => {
  const topic = $("topic").value.trim();
  if (!topic) { alert("Topic is required."); return; }
  const body = {
    topic, source: $("source").value, format: $("format").value,
    preset: $("preset").value, audience: $("audience").value,
    minutes: $("minutes").value, themeLight: $("themeLight").value,
    background: $("background").value, channel: $("channel").value,
    notes: $("notes").value, design: selectedDesign, theme: selectedDesign,
    scaffold: $("scaffold").checked,
  };
  $("genBtn").textContent = "Generating…";
  const res = await (await fetch("/api/brief", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })).json();
  $("genBtn").textContent = "Generate brief →";
  if (res.error) { alert(res.error); return; }

  $("briefBox").classList.remove("hidden");
  $("chatMsg").textContent = res.chat;
  $("briefPath").textContent = res.briefPath;
  $("briefText").textContent = res.brief;
  $("actionSlug").value = res.slug;
  if (res.scaffold) log(res.scaffold, true);
  window.scrollTo({ top: 0, behavior: "smooth" });
};

document.querySelectorAll("[data-copy]").forEach(b => {
  b.onclick = () => {
    const t = $(b.dataset.copy).textContent;
    navigator.clipboard.writeText(t);
    b.textContent = "copied ✓"; setTimeout(() => b.textContent = b.dataset.copy === "chatMsg" ? "copy" : "copy full brief", 1200);
  };
});

document.querySelectorAll(".btnrow button[data-action]").forEach(b => {
  b.onclick = () => runAction(b.dataset.action);
});
$("refreshOut").onclick = refreshOutputs;

async function runAction(action) {
  const slug = $("actionSlug").value.trim();
  if (action !== "studio" && !slug) { alert("Enter a topic slug first."); return; }
  log(`▶ ${action} ${slug} …`);
  const res = await (await fetch("/api/run", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, slug }),
  })).json();
  log(res.output || "(no output)", res.ok);
  if (res.url) log(`↗ ${res.url}`, true);
  if (action.startsWith("render")) refreshOutputs();
}

async function refreshOutputs() {
  const slug = $("actionSlug").value.trim();
  if (!slug) return;
  const res = await (await fetch(`/api/outputs/${slug}`)).json();
  const box = $("outputs");
  box.innerHTML = "";
  for (const f of res.files) {
    if (f.name.endsWith(".mp4")) {
      const v = document.createElement("video");
      v.src = f.url; v.controls = true; box.appendChild(v);
    } else {
      const a = document.createElement("a");
      a.href = f.url; a.textContent = f.name; a.target = "_blank"; box.appendChild(a);
    }
  }
  if (!res.files.length) box.innerHTML = `<span class="muted small">no outputs yet for ${slug}</span>`;
}

function log(text, ok) {
  const c = $("console");
  const cls = ok === true ? "ok" : ok === false ? "err" : "";
  c.innerHTML = `<span class="${cls}">${escapeHtml(text)}</span>`;
}
function escapeHtml(s) {
  return (s || "").replace(/[&<>]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[m]));
}

boot();
