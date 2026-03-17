// ====== STATE (ports directly from your Python) ======
const BULLET = "•";

const appState = {
  mode: "DEFAULT",             // DEFAULT | PENALTY_ENTRY | PENALTY_EDIT
  team: null,                  // "HOME" | "GUEST"
  last_team: "HOME",
  buffer: "",
  stage: null,                 // "PLAYER" | "TIME"
  edit_index: 0,               // 0..n ; n=phantom row
  home_score: 0,
  guest_score: 0,
  penalties: { HOME: [], GUEST: [] }, // {player:int, secs:int}[]
  _player: null,               // temp while entering
  time_default: false
};

// ====== GAME CLOCK ======
const gameClock = {
  secs: 20 * 60,           // current value
  defaultSecs: 20 * 60,    // reset target
  running: false,
  direction: "DOWN",       // "DOWN" | "UP"
  timerId: null,
  autoHorn: false
};

// ====== DOM refs ======
const statusEl   = document.getElementById("status");
const frameEl    = document.getElementById("frame");
const overlayEl  = document.getElementById("overlay");
const overlayTgl = document.getElementById("overlayToggle");

// ====== AUDIO (Horn) ======
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
function startHornNode() {
  ensureAudio();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "square";
  osc.frequency.value = 420;
  gain.gain.value = 0.18;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  return { osc, gain };
}
function stopHornNode(node) {
  if (!node) return;
  try { node.osc.stop(); } catch {}
}
function playHorn(ms = 2000) {
  const node = startHornNode();
  setTimeout(() => stopHornNode(node), ms);
  return node;
}
let heldHorn = null; // for press & hold

// ====== LCD helpers (same output as Python) ======
function mask2(digits) {
  const d = (digits ?? "").slice(-2);
  return BULLET.repeat(Math.max(0, 2 - d.length)) + d;
}
function maskTime(digits) {
  let d = (digits ?? "").slice(-4);
  d = BULLET.repeat(Math.max(0, 4 - d.length)) + d;
  return `${d.slice(0, 2)}:${d.slice(2)}`;
}
function fmtMmss(totalSeconds) {
  const secs = Math.max(0, totalSeconds|0);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function fmtMmssSel(secs) {
  const val = Math.max(0, secs|0);
  const m = Math.floor(val / 60);
  const s = val % 60;
  const mStr = (m < 10 ? BULLET + String(m) : String(m));
  return `${mStr}:${s.toString().padStart(2, "0")}`;
}
function parseTimeOnEnter(d) {
  const s = String(d ?? "");
  if (!s) return 120;
  if (s.length === 1) return parseInt(s, 10) * 60;
  if (s.length === 2) return parseInt(s, 10) * 60;
  if (s.length === 3) {
    let mm = parseInt(s[0], 10);
    let ss = Math.min(59, parseInt(s.slice(1), 10));
    return mm * 60 + ss;
  }
  const last4 = s.slice(-4);
  let mm = parseInt(last4.slice(0, 2), 10);
  let ss = Math.min(59, parseInt(last4.slice(2), 10));
  return (mm * 60) + ss;
}
function parseMmSs(str) {
  const s = String(str || "").trim();
  if (!s) return null;
  if (s.includes(":")) {
    const [m, ss] = s.split(":");
    const mm = Math.max(0, parseInt(m || "0", 10) || 0);
    const sec = Math.min(59, Math.max(0, parseInt(ss || "0", 10) || 0));
    return mm * 60 + sec;
  }
  // just minutes
  const mm = Math.max(0, parseInt(s, 10) || 0);
  return mm * 60;
}
function nextSlotNum(team) {
  const len = appState.penalties[team].length;
  return Math.min(3, len + 1);
}

// ====== LCD renderers ======
function lcdScores() {
  // Show clock + scores when in DEFAULT mode
  const clk = fmtMmss(gameClock.secs);
  statusEl.textContent =
    `CLK ${clk}   ` +
    `H. SCORE • • ${appState.home_score}     ` +
    `G. SCORE • • ${appState.guest_score}`;
}

function lcdPenaltyEntryPlayer() {
  const slot = nextSlotNum(appState.team);
  statusEl.textContent = `${slot} PL${mask2(appState.buffer)}  PN ${BULLET.repeat(2)}:${BULLET.repeat(2)}`;
}

function lcdPenaltyEntryTime() {
  const slot = nextSlotNum(appState.team);
  const p = (appState._player != null) ? mask2(String(appState._player)) : mask2("");
  statusEl.textContent = `${slot} PL${p}  PN ${maskTime(appState.buffer)}`;
}

function lcdPenaltyFinal(team, player, secs, slot_index) {
  statusEl.textContent = `${slot_index} PL${player}  PN ${fmtMmss(secs)}`;
}

function lcdPenaltyEditSelect() {
  const team = appState.team;
  const L = appState.penalties[team];
  const n = L.length;
  const i = appState.edit_index;

  if (i === n) {
    statusEl.textContent = `${n+1} PL${BULLET.repeat(2)}  PN ${BULLET.repeat(2)}:${BULLET.repeat(2)}`;
    return;
  }
  if (!L.length) {
    statusEl.textContent = `1 PL${BULLET.repeat(2)}  PN ${BULLET.repeat(2)}:${BULLET.repeat(2)}   (no penalties)`;
    return;
  }
  const { player, secs } = L[i];
  statusEl.textContent = `${i+1} PL${player}  PN ${fmtMmssSel(secs)}`;
}

// ====== Actions ======
function homeScorePlusOne() {
  appState.home_score += 1;
  appState.last_team = "HOME";
  if (appState.mode === "DEFAULT") lcdScores();
}
function guestScorePlusOne() {
  appState.guest_score += 1;
  appState.last_team = "GUEST";
  if (appState.mode === "DEFAULT") lcdScores();
}

// ====== Game clock control ======
let countBtn, startBtn, endBtn, setClockBtn, autoHornBtn, hornBtn;

function tick() {
  if (!gameClock.running) return;
  if (gameClock.direction === "DOWN") {
    gameClock.secs = Math.max(0, gameClock.secs - 1);
    if (gameClock.secs === 0) {
      stopClock();
      if (gameClock.autoHorn) playHorn(2000);
    }
  } else {
    gameClock.secs += 1;
  }
  if (appState.mode === "DEFAULT") lcdScores();
}
function startClock() {
  if (gameClock.running) return;
  gameClock.running = true;
  gameClock.timerId = setInterval(tick, 1000);
  if (startBtn) startBtn.textContent = "STOP";
}
function stopClock() {
  if (!gameClock.running) return;
  clearInterval(gameClock.timerId);
  gameClock.timerId = null;
  gameClock.running = false;
  if (startBtn) startBtn.textContent = "START";
}
function toggleClock() {
  gameClock.running ? stopClock() : startClock();
}
function endClock() {
  // Stop, horn if enabled, and reset to default time
  stopClock();
  if (gameClock.autoHorn) playHorn(2000);
  gameClock.secs = gameClock.defaultSecs;
  if (appState.mode === "DEFAULT") lcdScores();
}
function toggleCountMode() {
  gameClock.direction = (gameClock.direction === "DOWN" ? "UP" : "DOWN");
  if (countBtn) countBtn.textContent = gameClock.direction === "DOWN" ? "COUNT\nDOWN\n*" : "COUNT\nUP\n*";
}
function setMainClockPrompt() {
  const current = fmtMmss(gameClock.secs);
  const input = prompt("Set main clock (mm:ss or minutes):", current);
  if (input == null) return;
  const val = parseMmSs(input);
  if (val == null) return;
  gameClock.secs = val;
  gameClock.defaultSecs = val;
  if (appState.mode === "DEFAULT") lcdScores();
}
function toggleAutoHorn() {
  gameClock.autoHorn = !gameClock.autoHorn;
  if (autoHornBtn) autoHornBtn.textContent = gameClock.autoHorn ? "AUTO\nHORN\nON" : "AUTO\nHORN\nOFF";
}

// ====== PENALTY ENTRY ======
function startPenaltyEntry(team) {
  Object.assign(appState, {
    mode: "PENALTY_ENTRY", team, last_team: team,
    buffer: "", stage: "PLAYER", _player: null, time_default: false
  });
  lcdPenaltyEntryPlayer();
}

function penaltyPressDigit(d) {
  if (appState.mode === "PENALTY_ENTRY") {
    if (appState.stage === "PLAYER") {
      if (appState.buffer.length < 2) appState.buffer += d;
      lcdPenaltyEntryPlayer();
    } else if (appState.stage === "TIME") {
      if (appState.time_default) {
        appState.buffer = d;
        appState.time_default = false;
      } else if (appState.buffer.length < 4) {
        appState.buffer += d;
      }
      lcdPenaltyEntryTime();
    }
  } else if (appState.mode === "PENALTY_EDIT") {
    // typing starts/continues time edit on current selection
    if (appState.stage !== "TIME") {
      appState.stage = "TIME";
      appState.buffer = d;
      appState.time_default = false;
    } else if (appState.buffer.length < 4) {
      appState.buffer += d;
    }
    const idx = appState.edit_index;
    if (idx < appState.penalties[appState.team].length) {
      const p = appState.penalties[appState.team][idx].player;
      statusEl.textContent = `${idx+1} PL${p}  PN ${maskTime(appState.buffer)}`;
    }
  }
}

function penaltyEnter() {
  if (appState.mode === "PENALTY_ENTRY") {
    if (appState.stage === "PLAYER") {
      if (!appState.buffer) { lcdPenaltyEntryPlayer(); return; }
      appState._player = parseInt(appState.buffer, 10);
      appState.buffer = "200";           // default 2:00 preview
      appState.time_default = true;
      appState.stage = "TIME";
      lcdPenaltyEntryTime();
      return;
    } else if (appState.stage === "TIME") {
      const secs = parseTimeOnEnter(appState.buffer);
      const team = appState.team;
      const player = parseInt(appState._player, 10);
      appState.penalties[team].push({ player, secs });
      const slot_index = appState.penalties[team].length;
      lcdPenaltyFinal(team, player, secs, slot_index);
      Object.assign(appState, { mode:"DEFAULT", team:null, buffer:"", stage:null, _player:null, time_default:false });
      return;
    }
  } else if (appState.mode === "PENALTY_EDIT") {
    const team = appState.team;
    const L = appState.penalties[team];
    const n = L.length;
    if (n === 0) {
      Object.assign(appState, { mode:"DEFAULT", team:null, buffer:"", stage:null });
      lcdScores();
      return;
    }
    if (appState.edit_index === n) {
      // ENTER on phantom -> jump to last and open with +2:00 preview
      appState.edit_index = n - 1;
      appState.stage = "TIME";
      appState.buffer = "200";
      appState.time_default = true;
      const p = L[appState.edit_index].player;
      statusEl.textContent = `${appState.edit_index+1} PL${p}  PN ${maskTime(appState.buffer)}`;
      return;
    }
    // on a real row
    if (appState.stage !== "TIME") {
      appState.stage = "TIME";
      appState.buffer = "200";
      appState.time_default = true;
      const idx = appState.edit_index;
      const p = L[idx].player;
      statusEl.textContent = `${idx+1} PL${p}  PN ${maskTime(appState.buffer)}`;
      return;
    } else {
      const idx = appState.edit_index;
      const new_secs = parseTimeOnEnter(appState.buffer);
      L[idx].secs = new_secs;
      lcdPenaltyFinal(team, L[idx].player, new_secs, idx+1);
      Object.assign(appState, { mode:"DEFAULT", team:null, buffer:"", stage:null, time_default:false });
      return;
    }
  }
}

function penaltyClear() {
  if (appState.buffer) {
    if (appState.stage === "TIME" && (appState.mode === "PENALTY_ENTRY" || appState.mode === "PENALTY_EDIT")) {
      appState.buffer = "200";
      appState.time_default = true;
      if (appState.mode === "PENALTY_ENTRY") {
        lcdPenaltyEntryTime();
      } else {
        const idx = appState.edit_index;
        if (idx < appState.penalties[appState.team].length) {
          const p = appState.penalties[appState.team][idx].player;
          statusEl.textContent = `${idx+1} PL${p}  PN ${maskTime(appState.buffer)}`;
        }
      }
      return;
    }
    appState.buffer = "";
    if (appState.mode === "PENALTY_ENTRY") {
      appState.stage === "PLAYER" ? lcdPenaltyEntryPlayer() : lcdPenaltyEntryTime();
    } else if (appState.mode === "PENALTY_EDIT") {
      lcdPenaltyEditSelect();
    }
  } else {
    Object.assign(appState, { mode:"DEFAULT", team:null, buffer:"", stage:null, _player:null, time_default:false });
    lcdScores();
  }
}

// ====== PENALTY EDIT (open & navigate) ======
function startPenaltyEdit(team) {
  Object.assign(appState, {
    mode: "PENALTY_EDIT", team, last_team: team,
    buffer: "", stage: null, time_default: false
  });
  appState.edit_index = appState.penalties[team].length; // start on phantom
  lcdPenaltyEditSelect();
}
function ensureEditMode() {
  if (appState.mode !== "PENALTY_EDIT") startPenaltyEdit(appState.last_team);
}
function moveEditSelection(delta) {
  ensureEditMode();
  if (appState.mode !== "PENALTY_EDIT") return;
  const L = appState.penalties[appState.team];
  const n = L.length;
  appState.edit_index = (appState.edit_index + delta + (n + 1)) % (n + 1);
  appState.stage = null;
  appState.buffer = "";
  appState.time_default = false;
  lcdPenaltyEditSelect();
}

// ====== Overlay (team name keyboard) ======
const OVERLAY_LABELS = [
  "LEFT","RIGHT","DOUBLE","SINGLE","","","DM","ESC","POST","EXT",
  "Q","W","E","R","T","Y","U","I","O","P",
  "A","S","D","F","G","H","J","K","L",".",
  "Z","X","C","V","B","N","M","SPACE","BACK\nSPACE","MESSAGE\nNUMBER",
];
function normalizeId(label, idx) {
  if (!label || !label.trim()) return `BLANK_${idx}`;
  return label
    .replace(/\n/g, "_")
    .replace(/ /g, "_")
    .replace("BACK__", "BACK_")
    .replace("BACK_SPACE","BACKSPACE")
    .replace("MESSAGE__NUMBER","MESSAGE_NUMBER");
}
function onOverlayPress(keyId) {
  // Reserved for future behavior
  if (appState.mode === "DEFAULT") lcdScores();
}

// ====== UI building ======
function btn(text, r, c, options = {}) {
  const { w = 1, h = 1, color = "white", onClick = null, parent = frameEl } = options;
  const b = document.createElement("button");
  b.className = `btn ${color}`;
  b.textContent = text;
  // r,c are 1-based from your sketch; CSS grid is 1-based, our outer grid has a padding row/col, so +1
  b.style.gridColumn = `${c+1} / span ${w}`;
  b.style.gridRow = `${r+1} / span ${h}`;
  if (onClick) b.addEventListener("click", onClick);
  parent.appendChild(b);
  return b;
}
function label(text, r, c, className) {
  const el = document.createElement("div");
  el.className = `label ${className ?? ""}`;
  el.textContent = text;
  el.style.gridColumn = `${c+1} / span 2`;
  el.style.gridRow = `${r+1}`;
  frameEl.appendChild(el);
  return el;
}
function box(r, c) {
  const el = document.createElement("div");
  el.className = "box";
  el.style.gridColumn = `${c+1} / span 2`;
  el.style.gridRow = `${r+1} / span 4`;
  frameEl.appendChild(el);
  return el;
}

let homeLabelEl, guestLabelEl, homeBoxEl, guestBoxEl;

function buildMainGrid(){
  // HOME label & box
  homeLabelEl = label("HOME", 0, 1, "home");
  homeBoxEl   = box(1, 1);

  // HOME buttons inside box
  btn("< PENALTY",              0, 0, { parent: homeBoxEl, color: "green", onClick: () => startPenaltyEdit("HOME") });
  btn("PLAYER\n*\nPENLTY\n*",   0, 1, { parent: homeBoxEl, color: "green", onClick: () => startPenaltyEntry("HOME") });
  btn("SHOTS\nON GOAL",         1, 0, { parent: homeBoxEl, color: "green" });
  btn("SHOTS\nON GOAL +1",      1, 1, { parent: homeBoxEl, color: "green" });
  btn("",                       2, 0, { parent: homeBoxEl });
  btn("",                       2, 1, { parent: homeBoxEl });
  btn("SCORE\n*",               3, 0, { parent: homeBoxEl, color: "green" });
  btn("SCORE\n+1",              3, 1, { parent: homeBoxEl, color: "green", onClick: homeScorePlusOne });

  // GUEST label & box
  guestLabelEl = label("GUEST", 0, 7, "guest");
  guestBoxEl   = box(1, 7);

  btn("PENLTY >",               0, 0, { parent: guestBoxEl, color: "pink", onClick: () => startPenaltyEdit("GUEST") });
  btn("PLAYER\n*\nPENLTY\n*",   0, 1, { parent: guestBoxEl, color: "pink", onClick: () => startPenaltyEntry("GUEST") });
  btn("SHOTS\nON GOAL",         1, 0, { parent: guestBoxEl, color: "pink" });
  btn("SHOTS\nON GOAL +1",      1, 1, { parent: guestBoxEl, color: "pink" });
  btn("",                       2, 0, { parent: guestBoxEl });
  btn("",                       2, 1, { parent: guestBoxEl });
  btn("SCORE\n*",               3, 0, { parent: guestBoxEl, color: "pink" });
  btn("SCORE\n+1",              3, 1, { parent: guestBoxEl, color: "pink", onClick: guestScorePlusOne });

  // ===== Main grid buttons =====
  // Row 1
  btn("", 1, 0);
  btn("", 1, 3);
  btn("ENABLE\nPENLTY CLOCKS", 1, 4);
  btn("DISABLE\nPENLTY CLOCKS",1, 5);
  btn("", 1, 6);
  btn("", 1, 9);
  btn("7", 1, 10, { onClick: () => penaltyPressDigit("7") });
  btn("8", 1, 11, { onClick: () => penaltyPressDigit("8") });
  btn("9", 1, 12, { onClick: () => penaltyPressDigit("9") });
  btn("↑", 1, 14, { color:"gray", onClick: () => moveEditSelection(-1) });

  // Auto horn toggle + Horn button
  autoHornBtn = btn("AUTO\nHORN\nOFF", 1, 16, { onClick: toggleAutoHorn });
  hornBtn = btn("HORN", 1, 17, { color: "yellow" });
  hornBtn.addEventListener("click", () => playHorn(1000));
  // press & hold
  hornBtn.addEventListener("pointerdown", (e) => { e.preventDefault(); if (!heldHorn) heldHorn = startHornNode(); });
  window.addEventListener("pointerup",   () => { if (heldHorn) { stopHornNode(heldHorn); heldHorn = null; } });

  // Row 2
  btn("", 2, 0);
  btn("", 2, 3);
  btn("", 2, 4);
  btn("", 2, 5);
  btn("", 2, 6);
  btn("", 2, 9);
  btn("4", 2, 10, { onClick: () => penaltyPressDigit("4") });
  btn("5", 2, 11, { onClick: () => penaltyPressDigit("5") });
  btn("6", 2, 12, { onClick: () => penaltyPressDigit("6") });
  btn("←", 2, 13, { color:"gray" });
  btn("MENU", 2, 14, { color:"black" });
  btn("→", 2, 15, { color:"gray" });

  // Row 3
  btn("", 3, 0);
  btn("", 3, 3);
  btn("PERIOD\n*", 3, 4);
  btn("PERIOD\n+1", 3, 5);
  btn("", 3, 6);
  btn("", 3, 9);
  btn("1", 3, 10, { onClick: () => penaltyPressDigit("1") });
  btn("2", 3, 11, { onClick: () => penaltyPressDigit("2") });
  btn("3", 3, 12, { onClick: () => penaltyPressDigit("3") });
  btn("↓", 3, 14, { color:"gray", onClick: () => moveEditSelection(+1) });

  // Count mode + Start/Stop
  countBtn = btn("COUNT\nDOWN\n*", 3, 16, { onClick: toggleCountMode });
  startBtn = btn("START",          3, 17, { color: "green", onClick: toggleClock });

  // Row 4
  btn("", 4, 0);
  btn("", 4, 3);
  btn("", 4, 4);
  btn("", 4, 5);
  btn("", 4, 6);
  btn("", 4, 9);
  btn("CLEAR\nNO", 4, 10, { onClick: penaltyClear });
  btn("0", 4, 11, { onClick: () => penaltyPressDigit("0") });
  btn("ENTER\n*\nYES", 4, 12, { onClick: penaltyEnter });

  setClockBtn = btn("SET\nMAIN\nCLOCK\n*", 4, 16, { onClick: setMainClockPrompt });
  endBtn = btn("END", 4, 17, { color: "black", onClick: endClock });
}

function buildOverlay(){
  overlayEl.replaceChildren();
  OVERLAY_LABELS.forEach((label, idx) => {
    const b = document.createElement("button");
    b.className = "btn white";
    b.textContent = label;
    b.addEventListener("click", () => onOverlayPress(normalizeId(label, idx)));
    overlayEl.appendChild(b);
  });
}

function showOverlay(){
  buildOverlay();
  overlayEl.hidden = false;
  homeLabelEl.classList.add("hidden");
  guestLabelEl.classList.add("hidden");
  homeBoxEl.classList.add("hidden");
  guestBoxEl.classList.add("hidden");
}
function hideOverlay(){
  overlayEl.hidden = true;
  homeLabelEl.classList.remove("hidden");
  guestLabelEl.classList.remove("hidden");
  homeBoxEl.classList.remove("hidden");
  guestBoxEl.classList.remove("hidden");
}

// ====== Keyboard bindings (Up/Down, digits, Enter, Esc) ======
window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp")   { e.preventDefault(); moveEditSelection(-1); }
  if (e.key === "ArrowDown") { e.preventDefault(); moveEditSelection(+1); }
  if (/^[0-9]$/.test(e.key)) { penaltyPressDigit(e.key); }
  if (e.key === "Enter")     { penaltyEnter(); }
  if (e.key === "Escape")    { penaltyClear(); }
});

overlayTgl.addEventListener("change", () => {
  overlayTgl.checked ? showOverlay() : hideOverlay();
});

// ====== INIT ======
buildMainGrid();
hideOverlay();
lcdScores();
