// ============= Type Definitions =============
type Mode = "DEFAULT" | "PENALTY_ENTRY" | "PENALTY_EDIT";
type Team = "HOME" | "GUEST";
type Stage = "PLAYER" | "TIME" | null;
type UIMode = "DEFAULT" | "MENU" | "TEAM_NAME";
type TeamNameStage = "OFF" | "WAIT_POST" | "SELECT_SIDE" | "TYPING";

interface PenaltyEntry {
  player: number;
  secs: number;
}

interface State {
  mode: Mode;
  team: Team | null;
  last_team: Team;
  buffer: string;
  stage: Stage;
  edit_index: number;
  home_score: number;
  guest_score: number;
  home_name: string;
  guest_name: string;
  clock_secs: number;
  period: number;
  penalties: {
    HOME: PenaltyEntry[];
    GUEST: PenaltyEntry[];
  };
  _player: number | null;
  time_default: boolean;
  ui_mode: UIMode;
  menu_index: number;
  team_name_stage: TeamNameStage;
  team_name_target: Team | null;
  team_name_buffer: string;
  team_name_original: string;
  team_name_overlay_prev: boolean;
}

interface ScoreboardElements {
  homeName: HTMLElement | null;
  guestName: HTMLElement | null;
  homeScore: HTMLElement | null;
  guestScore: HTMLElement | null;
  clock: HTMLElement | null;
  period: HTMLElement | null;
  homePenalties: HTMLElement | null;
  guestPenalties: HTMLElement | null;
  centerHome: HTMLElement | null;
  centerGuest: HTMLElement | null;
}

// ============= State & helpers (ported from Python) =============
const BULLET = "•";
const state: State = {
  mode: "DEFAULT",
  team: null,
  last_team: "HOME",
  buffer: "",
  stage: null,
  edit_index: 0,
  home_score: 0,
  guest_score: 0,
  home_name: "HOME",
  guest_name: "GUEST",
  clock_secs: 0,
  period: 1,
  penalties: { HOME: [], GUEST: [] },
  _player: null,
  time_default: false,
  ui_mode: "DEFAULT",
  menu_index: 0,
  team_name_stage: "OFF",
  team_name_target: null,
  team_name_buffer: "",
  team_name_original: "",
  team_name_overlay_prev: false,
};

const statusEl = document.getElementById('status') as HTMLElement | null;
const scoreboardEl = document.getElementById('scoreboard') as HTMLElement | null;
const overlayToggleEl = document.getElementById('overlayToggle') as HTMLInputElement | null;
const sbElements: ScoreboardElements = {
  homeName: document.getElementById('sbHomeName'),
  guestName: document.getElementById('sbGuestName'),
  homeScore: document.getElementById('sbHomeScore'),
  guestScore: document.getElementById('sbGuestScore'),
  clock: document.getElementById('sbClock'),
  period: document.getElementById('sbPeriod'),
  homePenalties: document.getElementById('sbHomePenalties'),
  guestPenalties: document.getElementById('sbGuestPenalties'),
  centerHome: document.getElementById('sbCenterHomePenalty'),
  centerGuest: document.getElementById('sbCenterGuestPenalty'),
};
const MENU_ITEMS = ['Resume Game', 'Team Name Mode'] as const;
const MAX_TEAM_NAME_LENGTH = 12;

function setStatus(text: string): void {
  if (statusEl) statusEl.textContent = text;
}

function mask2(digits: string): string {
  const d = digits.slice(-2);
  return BULLET.repeat(2 - d.length) + d;
}

function mask_time(digits: string): string {
  let d = digits.slice(-4);
  d = BULLET.repeat(4 - d.length) + d;
  return `${d.slice(0, 2)}:${d.slice(2)}`;
}

function fmt_mmss(total: number): string {
  const secs = Math.max(0, total);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function fmt_mmss_sel(secs: number): string {
  secs = Math.max(0, secs);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m < 10 ? BULLET + String(m) : m}:${s.toString().padStart(2, '0')}`;
}

function parse_time_on_enter(d: string): number {
  if (!d) return 120;
  if (d.length === 1) return parseInt(d) * 60;
  if (d.length === 2) return parseInt(d) * 60;
  if (d.length === 3) return parseInt(d[0]) * 60 + Math.min(parseInt(d.slice(1)), 59);
  d = d.slice(-4);
  return parseInt(d.slice(0, 2)) * 60 + Math.min(parseInt(d.slice(2)), 59);
}

function next_slot_num(team: Team): number {
  return Math.min(3, state.penalties[team].length + 1);
}

function fmt_clock_display(total: number): string {
  const secs = Math.max(0, total | 0);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function fmt_score(value: number): string {
  return String(Math.max(0, value | 0)).padStart(2, '0');
}

function renderPenaltyGrid(team: Team): void {
  const container = team === 'HOME' ? sbElements.homePenalties : sbElements.guestPenalties;
  if (!container) return;
  container.innerHTML = '';
  const entries = state.penalties[team].slice(0, 2);
  for (let i = 0; i < 2; i++) {
    const row = document.createElement('div');
    row.className = 'scoreboard__penalty-row';
    const player = document.createElement('span');
    player.className = 'scoreboard__digits scoreboard__digits--mini';
    const time = document.createElement('span');
    time.className = 'scoreboard__digits scoreboard__digits--mini';
    const entry = entries[i];
    if (entry) {
      player.textContent = String(entry.player).padStart(2, '0');
      time.textContent = fmt_clock_display(entry.secs);
    } else {
      row.classList.add('scoreboard__penalty-row--empty');
      player.textContent = '--';
      time.textContent = '--:--';
    }
    row.append(player, time);
    container.appendChild(row);
  }
}

function renderCenterPenalties(): void {
  if (!sbElements.centerHome || !sbElements.centerGuest) return;
  const home = state.penalties.HOME[0];
  const guest = state.penalties.GUEST[0];
  sbElements.centerHome.textContent = home ? fmt_clock_display(home.secs) : '--:--';
  sbElements.centerGuest.textContent = guest ? fmt_clock_display(guest.secs) : '--:--';
}

function renderScoreboard(): void {
  if (!sbElements.homeScore) return;
  if (sbElements.homeName) sbElements.homeName.textContent = state.home_name;
  if (sbElements.guestName) sbElements.guestName.textContent = state.guest_name;
  if (sbElements.homeScore) sbElements.homeScore.textContent = fmt_score(state.home_score);
  if (sbElements.guestScore) sbElements.guestScore.textContent = fmt_score(state.guest_score);
  if (sbElements.clock) sbElements.clock.textContent = fmt_clock_display(state.clock_secs);
  if (sbElements.period) sbElements.period.textContent = String(state.period);
  renderPenaltyGrid('HOME');
  renderPenaltyGrid('GUEST');
  renderCenterPenalties();
}

function setStatusTeamName(message: string): void {
  if (state.ui_mode === 'TEAM_NAME') {
    setStatus(message);
  }
}

function updateMenuStatus(): void {
  if (state.ui_mode !== 'MENU') return;
  const lines = MENU_ITEMS.map((item, idx) => `${idx === state.menu_index ? '>' : ' '} ${item}`);
  setStatus(`MENU\n${lines.join('\n')}`);
}

function enterMenu(): void {
  state.ui_mode = 'MENU';
  state.menu_index = 0;
  state.mode = 'DEFAULT';
  state.team = null;
  state.buffer = '';
  state.stage = null;
  updateMenuStatus();
}

function exitMenu(): void {
  state.ui_mode = 'DEFAULT';
  state.menu_index = 0;
  lcd_scores();
}

function menuSelect(): void {
  if (state.ui_mode !== 'MENU') return;
  const item = MENU_ITEMS[state.menu_index];
  if (item === 'Resume Game') {
    exitMenu();
  } else if (item === 'Team Name Mode') {
    startTeamNameMode();
  }
}

function startTeamNameMode(): void {
  state.ui_mode = 'TEAM_NAME';
  state.menu_index = 0;
  state.mode = 'DEFAULT';
  state.team = null;
  state.buffer = '';
  state.stage = null;
  state.team_name_stage = 'WAIT_POST';
  state.team_name_target = null;
  state.team_name_buffer = '';
  state.team_name_original = '';
  state.team_name_overlay_prev = overlayToggleEl ? !!overlayToggleEl.checked : false;
  setOverlayVisibility(true);
  setTeamNameStage('WAIT_POST');
}

function exitTeamNameMode(): void {
  if (state.team_name_stage === 'TYPING' && state.team_name_target) {
    const key = state.team_name_target === 'HOME' ? 'home_name' : 'guest_name';
    state[key] = state.team_name_original || state[key];
    renderScoreboard();
  }
  state.team_name_stage = 'OFF';
  state.team_name_target = null;
  state.team_name_buffer = '';
  state.team_name_original = '';
  const restore = state.team_name_overlay_prev;
  setOverlayVisibility(!!restore);
  state.ui_mode = 'DEFAULT';
  lcd_scores();
}

function setTeamNameStage(stage: TeamNameStage, message?: string): void {
  state.team_name_stage = stage;
  if (message) {
    setStatusTeamName(message);
    return;
  }
  if (stage === 'WAIT_POST') {
    setStatusTeamName('TEAM NAME MODE: Press POST, then LEFT/RIGHT to choose team. Press ESC/EXT to exit.');
  } else if (stage === 'SELECT_SIDE') {
    setStatusTeamName('Select team: LEFT for HOME, RIGHT for GUEST.');
  } else if (stage === 'TYPING') {
    const label = state.team_name_target || '';
    setStatusTeamName(`Editing ${label}: type name, BACKSPACE deletes, CLEAR resets, ENTER saves.`);
  }
}

function overlayIdToChar(id: string): string | null {
  if (!id) return null;
  if (id.length === 1 && /[A-Z0-9.]/.test(id)) return id === '.' ? '.' : id;
  if (id === 'SPACE') return ' ';
  if (id === 'MESSAGE_NUMBER') return '#';
  return null;
}

function applyTeamNameBuffer(nextValue: string): void {
  if (!state.team_name_target) return;
  const cleaned = (nextValue || '').toUpperCase().replace(/[^A-Z0-9 .#]/g, '');
  const clipped = cleaned.slice(0, MAX_TEAM_NAME_LENGTH);
  state.team_name_buffer = clipped;
  const key = state.team_name_target === 'HOME' ? 'home_name' : 'guest_name';
  state[key] = clipped;
  renderScoreboard();
  setTeamNameStage('TYPING');
}

function handleTeamNameOverlay(id: string): void {
  if (id === 'ESC' || id === 'EXT') {
    exitTeamNameMode();
    return;
  }
  if (id === 'POST') {
    if (state.team_name_stage === 'TYPING') {
      if (state.team_name_target) {
        const revertKey = state.team_name_target === 'HOME' ? 'home_name' : 'guest_name';
        state[revertKey] = state.team_name_original;
        renderScoreboard();
      }
      state.team_name_target = null;
      state.team_name_buffer = '';
      state.team_name_original = '';
      setTeamNameStage('SELECT_SIDE', 'Select team: LEFT for HOME, RIGHT for GUEST.');
    } else {
      setTeamNameStage('SELECT_SIDE');
    }
    return;
  }
  if (state.team_name_stage === 'WAIT_POST') {
    return;
  }
  if (state.team_name_stage === 'SELECT_SIDE') {
    if (id === 'LEFT' || id === 'RIGHT') {
      state.team_name_target = id === 'LEFT' ? 'HOME' : 'GUEST';
      const key = state.team_name_target === 'HOME' ? 'home_name' : 'guest_name';
      state.team_name_original = (state[key] || '').toUpperCase();
      state.team_name_buffer = state.team_name_original;
      applyTeamNameBuffer(state.team_name_buffer);
      setTeamNameStage('TYPING');
    }
    return;
  }
  if (state.team_name_stage === 'TYPING') {
    if (id === 'BACKSPACE') {
      applyTeamNameBuffer(state.team_name_buffer.slice(0, -1));
      return;
    }
    if (id === 'SPACE') {
      applyTeamNameBuffer(state.team_name_buffer + ' ');
      return;
    }
    if (id === 'LEFT' || id === 'RIGHT') {
      if (state.team_name_target) {
        const revertKey = state.team_name_target === 'HOME' ? 'home_name' : 'guest_name';
        state[revertKey] = state.team_name_original;
        renderScoreboard();
      }
      state.team_name_target = id === 'LEFT' ? 'HOME' : 'GUEST';
      const key = state.team_name_target === 'HOME' ? 'home_name' : 'guest_name';
      state.team_name_original = (state[key] || '').toUpperCase();
      state.team_name_buffer = state.team_name_original;
      applyTeamNameBuffer(state.team_name_buffer);
      setTeamNameStage('TYPING');
      return;
    }
    const ch = overlayIdToChar(id);
    if (ch) {
      applyTeamNameBuffer(state.team_name_buffer + ch);
    }
  }
}

function handleTeamNameEnter(): boolean {
  if (state.ui_mode !== 'TEAM_NAME') return false;
  if (state.team_name_stage === 'SELECT_SIDE') {
    setTeamNameStage('WAIT_POST', 'Select LEFT or RIGHT before typing. Press POST to choose team.');
    return true;
  }
  if (state.team_name_stage === 'TYPING') {
    state.team_name_original = state.team_name_buffer;
    state.team_name_target = null;
    state.team_name_buffer = '';
    setTeamNameStage('WAIT_POST', 'Team name saved. Press POST to edit another or ESC/EXT to exit.');
    return true;
  }
  if (state.team_name_stage === 'WAIT_POST') {
    setTeamNameStage('WAIT_POST');
    return true;
  }
  return false;
}

function handleTeamNameClear(): boolean {
  if (state.ui_mode !== 'TEAM_NAME') return false;
  if (state.team_name_stage === 'TYPING') {
    applyTeamNameBuffer('');
    setTeamNameStage('TYPING', 'Name cleared. Type new name, ENTER saves, POST selects other team.');
    return true;
  }
  return false;
}

// ============= LCD screens =============
function lcd_scores(): void {
  if (state.ui_mode === 'DEFAULT') {
    setStatus(`H. SCORE • • ${state.home_score}     G. SCORE • • ${state.guest_score}`);
  }
  renderScoreboard();
}

function lcd_penalty_entry_player(): void {
  const slot = next_slot_num(state.team!);
  setStatus(`${slot} PL${mask2(state.buffer)}  PN ${BULLET.repeat(2)}:${BULLET.repeat(2)}`);
}

function lcd_penalty_entry_time(): void {
  const slot = next_slot_num(state.team!);
  const p = state._player != null ? mask2(String(state._player)) : mask2("");
  setStatus(`${slot} PL${p}  PN ${mask_time(state.buffer)}`);
}

function lcd_penalty_final(_team: Team, player: number, secs: number, slotIndex: number): void {
  setStatus(`${slotIndex} PL${player}  PN ${fmt_mmss(secs)}`);
}

function lcd_penalty_edit_select(): void {
  const team = state.team!;
  const L = state.penalties[team];
  const n = L.length, i = state.edit_index;
  if (i === n) {
    setStatus(`${n + 1} PL${BULLET.repeat(2)}  PN ${BULLET.repeat(2)}:${BULLET.repeat(2)}`);
    return;
  }
  if (!L.length) {
    setStatus(`1 PL${BULLET.repeat(2)}  PN ${BULLET.repeat(2)}:${BULLET.repeat(2)}   (no penalties)`);
    return;
  }
  const { player, secs } = L[i];
  setStatus(`${i + 1} PL${player}  PN ${fmt_mmss_sel(secs)}`);
}

// ============= Actions (ported) =============
function home_score_plus_one(): void {
  if (state.ui_mode !== 'DEFAULT') return;
  state.home_score += 1;
  state.last_team = 'HOME';
  lcd_scores();
}

function guest_score_plus_one(): void {
  if (state.ui_mode !== 'DEFAULT') return;
  state.guest_score += 1;
  state.last_team = 'GUEST';
  lcd_scores();
}

function menu_press(): void {
  if (state.ui_mode === 'TEAM_NAME') {
    exitTeamNameMode();
    return;
  }
  if (state.ui_mode === 'MENU') {
    exitMenu();
    return;
  }
  enterMenu();
}

function end_press(): void {
  if (state.ui_mode === 'TEAM_NAME') {
    exitTeamNameMode();
    return;
  }
  if (state.ui_mode === 'MENU') {
    exitMenu();
    return;
  }
}

function start_penalty_entry(team: Team): void {
  if (state.ui_mode !== 'DEFAULT') return;
  Object.assign(state, { mode: 'PENALTY_ENTRY', team, last_team: team, buffer: '', stage: 'PLAYER', _player: null, time_default: false });
  lcd_penalty_entry_player();
}

function penalty_press_digit(d: string): void {
  if (state.ui_mode !== 'DEFAULT') return;
  if (state.mode === 'PENALTY_ENTRY') {
    if (state.stage === 'PLAYER') {
      if (state.buffer.length < 2) state.buffer += d;
      lcd_penalty_entry_player();
    } else if (state.stage === 'TIME') {
      if (state.time_default) {
        state.buffer = d;
        state.time_default = false;
      } else if (state.buffer.length < 4) state.buffer += d;
      lcd_penalty_entry_time();
    }
  } else if (state.mode === 'PENALTY_EDIT') {
    if (state.stage !== 'TIME') {
      state.stage = 'TIME';
      state.buffer = d;
      state.time_default = false;
    } else if (state.buffer.length < 4) {
      state.buffer += d;
    }
    const idx = state.edit_index;
    if (idx < state.penalties[state.team!].length) {
      const p = state.penalties[state.team!][idx].player;
      setStatus(`${idx + 1} PL${p}  PN ${mask_time(state.buffer)}`);
    }
  }
}

function penalty_enter(): void {
  if (state.ui_mode === 'MENU') {
    menuSelect();
    return;
  }
  if (handleTeamNameEnter()) return;
  if (state.ui_mode !== 'DEFAULT') {
    return;
  }
  if (state.mode === 'PENALTY_ENTRY') {
    if (state.stage === 'PLAYER') {
      if (!state.buffer) {
        lcd_penalty_entry_player();
        return;
      }
      state._player = parseInt(state.buffer, 10);
      state.buffer = '200';
      state.time_default = true;
      state.stage = 'TIME';
      lcd_penalty_entry_time();
      return;
    } else if (state.stage === 'TIME') {
      const secs = parse_time_on_enter(state.buffer);
      const team = state.team!;
      const player = parseInt(String(state._player), 10);
      state.penalties[team].push({ player, secs });
      renderScoreboard();
      const slotIndex = state.penalties[team].length;
      lcd_penalty_final(team, player, secs, slotIndex);
      Object.assign(state, { mode: 'DEFAULT', team: null, buffer: '', stage: null, _player: null, time_default: false });
      return;
    }
  } else if (state.mode === 'PENALTY_EDIT') {
    const team = state.team!;
    const L = state.penalties[team];
    const n = L.length;
    if (n === 0) {
      Object.assign(state, { mode: 'DEFAULT', team: null, buffer: '', stage: null });
      lcd_scores();
      return;
    }
    if (state.edit_index === n) {
      state.edit_index = n - 1;
      state.stage = 'TIME';
      state.buffer = '200';
      state.time_default = true;
      const p = L[state.edit_index].player;
      setStatus(`${state.edit_index + 1} PL${p}  PN ${mask_time(state.buffer)}`);
      return;
    }
    if (state.stage !== 'TIME') {
      state.stage = 'TIME';
      state.buffer = '200';
      state.time_default = true;
      const idx = state.edit_index;
      const p = L[idx].player;
      setStatus(`${idx + 1} PL${p}  PN ${mask_time(state.buffer)}`);
      return;
    } else {
      const idx = state.edit_index;
      const new_secs = parse_time_on_enter(state.buffer);
      L[idx].secs = new_secs;
      renderScoreboard();
      lcd_penalty_final(team, L[idx].player, new_secs, idx + 1);
      Object.assign(state, { mode: 'DEFAULT', team: null, buffer: '', stage: null, time_default: false });
      return;
    }
  }
}

function penalty_clear(): void {
  if (handleTeamNameClear()) return;
  if (state.ui_mode !== 'DEFAULT') {
    return;
  }
  if (state.buffer) {
    if (state.stage === 'TIME' && (state.mode === 'PENALTY_ENTRY' || state.mode === 'PENALTY_EDIT')) {
      state.buffer = '200';
      state.time_default = true;
      if (state.mode === 'PENALTY_ENTRY') {
        lcd_penalty_entry_time();
      } else {
        const idx = state.edit_index;
        if (idx < state.penalties[state.team!].length) {
          const p = state.penalties[state.team!][idx].player;
          setStatus(`${idx + 1} PL${p}  PN ${mask_time(state.buffer)}`);
        }
      }
      return;
    }
    state.buffer = '';
    if (state.mode === 'PENALTY_ENTRY') {
      (state.stage === 'PLAYER') ? lcd_penalty_entry_player() : lcd_penalty_entry_time();
    } else if (state.mode === 'PENALTY_EDIT') {
      lcd_penalty_edit_select();
    }
  } else {
    Object.assign(state, { mode: 'DEFAULT', team: null, buffer: '', stage: null, _player: null, time_default: false });
    lcd_scores();
  }
}

function start_penalty_edit(team: Team): void {
  if (state.ui_mode !== 'DEFAULT') return;
  Object.assign(state, { mode: 'PENALTY_EDIT', team, last_team: team, buffer: '', stage: null, time_default: false });
  state.edit_index = state.penalties[team].length;
  lcd_penalty_edit_select();
}

function ensure_edit_mode(): void {
  if (state.mode !== 'PENALTY_EDIT') start_penalty_edit(state.last_team);
}

function move_edit_selection(delta: number): void {
  if (state.ui_mode === 'MENU') {
    const total = MENU_ITEMS.length;
    if (total) {
      state.menu_index = (state.menu_index + delta + total) % total;
      updateMenuStatus();
    }
    return;
  }
  if (state.ui_mode !== 'DEFAULT') {
    return;
  }
  ensure_edit_mode();
  if (state.mode !== 'PENALTY_EDIT') return;
  const L = state.penalties[state.team!];
  const n = L.length;
  state.edit_index = (state.edit_index + delta + (n + 1)) % (n + 1);
  state.stage = null;
  state.buffer = '';
  state.time_default = false;
  lcd_penalty_edit_select();
}

function on_overlay_press(id: string): void {
  if (state.ui_mode === 'TEAM_NAME') {
    handleTeamNameOverlay(id);
    return;
  }
  lcd_scores();
}

// ============= UI construction =============
const grid = document.getElementById('grid') as HTMLElement | null;
const wrapEl = document.querySelector('.wrap') as HTMLElement | null;
const titleEl = document.querySelector('.title') as HTMLElement | null;
const toolbarEl = document.querySelector('.toolbar') as HTMLElement | null;
const GRID_COLS = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--grid-cols'), 10) || 18;
const BUTTON_ROWS = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--button-rows'), 10) || 4;
const MIN_CELL = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--btn-min-px')) || 56;

function computeCellSize(): void {
  if (!wrapEl || !grid) return;
  const wrapStyles = getComputedStyle(wrapEl);
  const padX = parseFloat(wrapStyles.paddingLeft) + parseFloat(wrapStyles.paddingRight);
  const padY = parseFloat(wrapStyles.paddingTop) + parseFloat(wrapStyles.paddingBottom);
  const gapY = parseFloat(wrapStyles.rowGap) || 0;

  const statusEl = document.getElementById('status');
  const headerElems = [titleEl, scoreboardEl, statusEl, toolbarEl].filter(Boolean) as HTMLElement[];
  const headerHeight = headerElems.reduce((sum, el) => sum + el.getBoundingClientRect().height, 0);
  const gapsAboveGrid = headerElems.length;
  const availableHeight = window.innerHeight - padY - headerHeight - gapY * gapsAboveGrid;

  const gridStyles = getComputedStyle(grid);
  const gridPadX = parseFloat(gridStyles.paddingLeft) + parseFloat(gridStyles.paddingRight);
  const gridPadY = parseFloat(gridStyles.paddingTop) + parseFloat(gridStyles.paddingBottom);
  const cellGap = parseFloat(gridStyles.gap) || parseFloat(gridStyles.rowGap) || 0;

  const availableWidth = wrapEl.clientWidth - padX;
  const widthForCells = availableWidth - gridPadX - cellGap * (GRID_COLS - 1);
  const heightForCells = availableHeight - gridPadY - cellGap * (BUTTON_ROWS - 1);

  let cellFromWidth = widthForCells / GRID_COLS;
  let cellFromHeight = heightForCells / BUTTON_ROWS;

  if (!Number.isFinite(cellFromWidth)) cellFromWidth = MIN_CELL;
  if (!Number.isFinite(cellFromHeight)) cellFromHeight = MIN_CELL;

  let nextSize = Math.min(cellFromWidth, cellFromHeight);
  if (!Number.isFinite(nextSize) || nextSize <= 0) {
    nextSize = Math.max(cellFromWidth, cellFromHeight, MIN_CELL);
  }
  nextSize = Math.max(nextSize, MIN_CELL);

  document.documentElement.style.setProperty('--cell-size', `${nextSize}px`);
}

window.addEventListener('resize', computeCellSize);
window.addEventListener('load', computeCellSize);
if ('ResizeObserver' in window && wrapEl) {
  const ro = new ResizeObserver(() => computeCellSize());
  ro.observe(wrapEl);
}

function place(el: HTMLElement, r: number, c: number, colSpan: number = 1): HTMLElement {
  el.style.gridRowStart = String(r);
  el.style.gridColumn = `${c} / span ${colSpan}`;
  return el;
}

function mkBtn(text: string, cls: string, onClick: (() => void) | null): HTMLButtonElement {
  const b = document.createElement('button');
  b.className = `btn ${cls || ''}`.trim();
  b.style.whiteSpace = 'pre-line';
  b.textContent = text;
  if (onClick) b.addEventListener('click', onClick);
  return b;
}

function mkLabel(text: string, moreCls: string): HTMLDivElement {
  const d = document.createElement('div');
  d.className = `label ${moreCls || ''}`.trim();
  d.textContent = text;
  return d;
}

// HOME label & frame
const homeLabel = place(mkLabel('HOME', 'home'), 1, 2, 2);
const homeFrame = document.createElement('div');
homeFrame.className = 'frame';
place(homeFrame, 2, 2, 2);
homeFrame.style.gridRowEnd = 'span 4';

// HOME frame buttons (2 cols x 4 rows inside)
homeFrame.append(
  mkBtn('< PENALTY', 'green', () => start_penalty_edit('HOME')),
  mkBtn('PLAYER\n*\nPENLTY\n*', 'green', () => start_penalty_entry('HOME')),
  mkBtn('SHOTS\nON GOAL', 'green', null),
  mkBtn('SHOTS\nON GOAL +1', 'green', null),
  mkBtn('', '', null), mkBtn('', '', null),
  mkBtn('SCORE\n*', 'green', null),
  mkBtn('SCORE\n+1', 'green', home_score_plus_one),
);

// GUEST label & frame
const guestLabel = place(mkLabel('GUEST', 'guest'), 1, 8, 2);
const guestFrame = document.createElement('div');
guestFrame.className = 'frame';
place(guestFrame, 2, 8, 2);
guestFrame.style.gridRowEnd = 'span 4';

guestFrame.append(
  mkBtn('PENLTY >', 'pink', () => start_penalty_edit('GUEST')),
  mkBtn('PLAYER\n*\nPENLTY\n*', 'pink', () => start_penalty_entry('GUEST')),
  mkBtn('SHOTS\nON GOAL', 'pink', null),
  mkBtn('SHOTS\nON GOAL +1', 'pink', null),
  mkBtn('', '', null), mkBtn('', '', null),
  mkBtn('SCORE\n*', 'pink', null),
  mkBtn('SCORE\n+1', 'pink', guest_score_plus_one),
);

// Add shared blanks & main keypad/buttons according to Tk layout
function blank(r: number, c: number): void {
  if (grid) grid.appendChild(place(mkBtn('', 'lgray', null), r, c));
}

// Row 1
blank(2, 1);
blank(2, 4);
if (grid) {
  grid.appendChild(place(mkBtn('ENABLE\nPENLTY CLOCKS', '', null), 2, 5));
  grid.appendChild(place(mkBtn('DISABLE\nPENLTY CLOCKS', '', null), 2, 6));
}
blank(2, 7);
blank(2, 10);
if (grid) {
  grid.appendChild(place(mkBtn('7', '', () => penalty_press_digit('7')), 2, 11));
  grid.appendChild(place(mkBtn('8', '', () => penalty_press_digit('8')), 2, 12));
  grid.appendChild(place(mkBtn('9', '', () => penalty_press_digit('9')), 2, 13));
  grid.appendChild(place(mkBtn('↑', 'gray', () => move_edit_selection(-1)), 2, 15));
  grid.appendChild(place(mkBtn('AUTO\nHORN\n*', '', null), 2, 17));
  grid.appendChild(place(mkBtn('HORN', 'yellow', null), 2, 18));
}

// Row 2
blank(3, 1);
blank(3, 4);
blank(3, 5);
blank(3, 6);
blank(3, 7);
blank(3, 10);
if (grid) {
  grid.appendChild(place(mkBtn('4', '', () => penalty_press_digit('4')), 3, 11));
  grid.appendChild(place(mkBtn('5', '', () => penalty_press_digit('5')), 3, 12));
  grid.appendChild(place(mkBtn('6', '', () => penalty_press_digit('6')), 3, 13));
  grid.appendChild(place(mkBtn('←', 'gray', null), 3, 14));
  grid.appendChild(place(mkBtn('MENU', 'black', menu_press), 3, 15));
  grid.appendChild(place(mkBtn('→', 'gray', null), 3, 16));
}

// Row 3
blank(4, 1);
blank(4, 4);
if (grid) {
  grid.appendChild(place(mkBtn('PERIOD\n*', '', null), 4, 5));
  grid.appendChild(place(mkBtn('PERIOD\n+1', '', null), 4, 6));
}
blank(4, 7);
blank(4, 10);
if (grid) {
  grid.appendChild(place(mkBtn('1', '', () => penalty_press_digit('1')), 4, 11));
  grid.appendChild(place(mkBtn('2', '', () => penalty_press_digit('2')), 4, 12));
  grid.appendChild(place(mkBtn('3', '', () => penalty_press_digit('3')), 4, 13));
  grid.appendChild(place(mkBtn('↓', 'gray', () => move_edit_selection(+1)), 4, 15));
  grid.appendChild(place(mkBtn('COUNT\nUP/DOWN\n*', '', null), 4, 17));
  grid.appendChild(place(mkBtn('START', 'success', null), 4, 18));
}

// Row 4
blank(5, 1);
blank(5, 4);
blank(5, 5);
blank(5, 6);
blank(5, 7);
blank(5, 10);
if (grid) {
  grid.appendChild(place(mkBtn('CLEAR\nNO', '', penalty_clear), 5, 11));
  grid.appendChild(place(mkBtn('0', '', () => penalty_press_digit('0')), 5, 12));
  grid.appendChild(place(mkBtn('ENTER\n*\nYES', '', penalty_enter), 5, 13));
  grid.appendChild(place(mkBtn('SET\nMAIN\nCLOCK\n*', '', null), 5, 17));
  grid.appendChild(place(mkBtn('END', 'red', end_press), 5, 18));
}

// Inject labels & frames into grid
if (grid) {
  grid.appendChild(homeLabel);
  grid.appendChild(homeFrame);
  grid.appendChild(guestLabel);
  grid.appendChild(guestFrame);
}

// ============= Overlay (team name overlay) =============
const OVERLAY_LABELS = [
  'LEFT', 'RIGHT', 'DOUBLE', 'SINGLE', '', '', 'DM', 'ESC', 'POST', 'EXT',
  'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P',
  'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '.',
  'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'SPACE', 'BACK\nSPACE', 'MESSAGE\nNUMBER'
];
const OVERLAY_ROWS = [2, 3, 4, 5];

function normalizeId(label: string, idx: number): string {
  if (!label || !label.trim()) return `BLANK_${idx}`;
  let s = label.replace(/\n/g, '_').replace(/ /g, '_').replace('BACK__', 'BACK_');
  s = s.replace('BACK_SPACE', 'BACKSPACE').replace('MESSAGE__NUMBER', 'MESSAGE_NUMBER');
  return s;
}

const overlayButtons: HTMLButtonElement[] = [];
let overlayCreated = false;
const overlayContainer = document.createElement('div');
overlayContainer.className = 'overlay';
place(overlayContainer, 2, 1, 10);
overlayContainer.style.gridRowEnd = 'span 4';

function setOverlayVisibility(show: boolean, fromToggle: boolean = false): void {
  if (overlayToggleEl && !fromToggle) {
    overlayToggleEl.checked = show;
  }
  if (show) {
    showOverlay();
  } else {
    hideOverlay();
  }
}

function createOverlayIfNeeded(): void {
  if (overlayCreated) return;
  let idx = 0;
  for (const _r of OVERLAY_ROWS) {
    for (let c = 0; c < 10; c++) {
      const text = OVERLAY_LABELS[idx];
      const id = normalizeId(text, idx);
      const b = mkBtn(text, '', () => on_overlay_press(id));
      overlayContainer.appendChild(b);
      overlayButtons.push(b);
      idx++;
    }
  }
  overlayCreated = true;
}

function showOverlay(): void {
  homeLabel.classList.add('hidden');
  guestLabel.classList.add('hidden');
  homeFrame.classList.add('hidden');
  guestFrame.classList.add('hidden');
  createOverlayIfNeeded();
  if (grid) grid.appendChild(overlayContainer);
  overlayContainer.classList.remove('hidden');
  computeCellSize();
}

function hideOverlay(): void {
  overlayContainer.classList.add('hidden');
  homeLabel.classList.remove('hidden');
  guestLabel.classList.remove('hidden');
  homeFrame.classList.remove('hidden');
  guestFrame.classList.remove('hidden');
  computeCellSize();
}

if (overlayToggleEl) {
  overlayToggleEl.addEventListener('change', (e) => {
    setOverlayVisibility(!!(e.target as HTMLInputElement).checked, true);
  });
}

// ============= Keyboard bindings (Up/Down) =============
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    move_edit_selection(-1);
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    move_edit_selection(+1);
  }
});

// Init
hideOverlay();
computeCellSize();
lcd_scores();
