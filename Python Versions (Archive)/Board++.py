import tkinter as tk
from tkinter import ttk

# --- Create main window ---
root = tk.Tk()
root.title("Daktronics AllSports 4100 Emulator")
root.configure(bg="lightgray")

# --- STATUS BAR (LCD mimic) ---
status_var = tk.StringVar(value="")
status = tk.Label(root, textvariable=status_var, anchor="w")
status.pack(fill="x", padx=110, pady=(10, 6))

# =============== TEAM NAME overlay labels (exact layout) =================
OVERLAY_LABELS = [
    "LEFT","RIGHT","DOUBLE","SINGLE","","","DM","ESC","POST","EXT",
    "Q","W","E","R","T","Y","U","I","O","P",
    "A","S","D","F","G","H","J","K","L",".",
    "Z","X","C","V","B","N","M","SPACE","BACK\nSPACE","MESSAGE\nNUMBER",
]
OVERLAY_ROWS = [1, 2, 3, 4]
OVERLAY_COLS = list(range(0, 10))
overlay_buttons, overlay_button_ids = [], []
overlay_created = False

# ------------------- State --------------------
app_state = {
    "mode": "DEFAULT",            # DEFAULT | PENALTY_ENTRY | PENALTY_EDIT
    "team": None,                 # "HOME" | "GUEST"
    "last_team": "HOME",          # for auto-entering edit via arrows
    "buffer": "",                 # numeric buffer (player or time)
    "stage": None,                # "PLAYER" | "TIME"
    "edit_index": 0,              # 0..n ; n is phantom "next" row
    "home_score": 0,
    "guest_score": 0,
    "penalties": {"HOME": [], "GUEST": []},  # list of {"player": int, "secs": int}
    "_player": None,              # temp while entering
    "time_default": False,        # showing default +2:00
}

# ------------------- Helpers for EXACT LCD text --------------------
BULLET = "•"

def mask2(digits: str) -> str:
    d = digits[-2:]
    return (BULLET * (2 - len(d))) + d

def mask_time(digits: str) -> str:
    d = digits[-4:]
    d = (BULLET * (4 - len(d))) + d
    return f"{d[:2]}:{d[2:]}"

def fmt_mmss(total_seconds: int) -> str:
    m = max(0, total_seconds) // 60
    s = max(0, total_seconds) % 60
    return f"{m}:{s:02d}"

def fmt_mmss_sel(secs: int) -> str:
    # browsing view shows bullet for leading 0 minutes
    m = max(0, secs) // 60
    s = max(0, secs) % 60
    return (f"{BULLET}{m}" if m < 10 else f"{m}") + f":{s:02d}"

def parse_time_on_enter(d: str) -> int:
    if not d:         return 120      # 2:00
    if len(d) == 1:   return int(d) * 60
    if len(d) == 2:   return int(d) * 60
    if len(d) == 3:   return int(d[0]) * 60 + min(int(d[1:]), 59)
    d = d[-4:]
    return int(d[:2]) * 60 + min(int(d[2:]), 59)

def next_slot_num(team: str) -> int:
    return min(3, len(app_state["penalties"][team]) + 1)

# ------------------- LCD --------------------
def lcd_scores():
    status_var.set(
        f"H. SCORE • • {app_state['home_score']}     G. SCORE • • {app_state['guest_score']}"
    )

def lcd_penalty_entry_player():
    slot = next_slot_num(app_state["team"])
    status_var.set(f"{slot} PL{mask2(app_state['buffer'])}  PN {BULLET*2}:{BULLET*2}")

def lcd_penalty_entry_time():
    slot = next_slot_num(app_state["team"])
    p = mask2(str(app_state["_player"])) if app_state["_player"] is not None else mask2("")
    status_var.set(f"{slot} PL{p}  PN {mask_time(app_state['buffer'])}")

def lcd_penalty_final(team: str, player: int, secs: int, slot_index: int):
    status_var.set(f"{slot_index} PL{player}  PN {fmt_mmss(secs)}")

def lcd_penalty_edit_select():
    team = app_state["team"]
    L = app_state["penalties"][team]
    n = len(L); i = app_state["edit_index"]

    if i == n:  # phantom row
        status_var.set(f"{n+1} PL{BULLET*2}  PN {BULLET*2}:{BULLET*2}")
        return
    if not L:
        status_var.set(f"1 PL{BULLET*2}  PN {BULLET*2}:{BULLET*2}   (no penalties)")
        return

    p, secs = L[i]["player"], L[i]["secs"]
    status_var.set(f"{i+1} PL{p}  PN {fmt_mmss_sel(secs)}")

# ------------------- Score buttons --------------------
def home_score_plus_one():
    app_state["home_score"] += 1
    app_state["last_team"] = "HOME"
    lcd_scores()

def guest_score_plus_one():
    app_state["guest_score"] += 1
    app_state["last_team"] = "GUEST"
    lcd_scores()

# ------------------- PENALTY ENTRY --------------------
def start_penalty_entry(team: str):
    app_state.update({
        "mode": "PENALTY_ENTRY", "team": team, "last_team": team,
        "buffer": "", "stage": "PLAYER", "_player": None, "time_default": False
    })
    lcd_penalty_entry_player()

def penalty_press_digit(d: str):
    if app_state["mode"] == "PENALTY_ENTRY":
        if app_state["stage"] == "PLAYER":
            if len(app_state["buffer"]) < 2:
                app_state["buffer"] += d
            lcd_penalty_entry_player()
        elif app_state["stage"] == "TIME":
            if app_state.get("time_default", False):
                app_state["buffer"] = d
                app_state["time_default"] = False
            elif len(app_state["buffer"]) < 4:
                app_state["buffer"] += d
            lcd_penalty_entry_time()
    elif app_state["mode"] == "PENALTY_EDIT":
        # typing starts/continues time edit on current selection
        if app_state["stage"] != "TIME":
            app_state["stage"] = "TIME"
            app_state["buffer"] = d
            app_state["time_default"] = False
        elif len(app_state["buffer"]) < 4:
            app_state["buffer"] += d
        idx = app_state["edit_index"]
        if idx < len(app_state["penalties"][app_state['team']]):
            p = app_state["penalties"][app_state["team"]][idx]["player"]
            status_var.set(f"{idx+1} PL{p}  PN {mask_time(app_state['buffer'])}")

def penalty_enter():
    if app_state["mode"] == "PENALTY_ENTRY":
        if app_state["stage"] == "PLAYER":
            if not app_state["buffer"]:
                lcd_penalty_entry_player(); return
            app_state["_player"] = int(app_state["buffer"])
            app_state["buffer"] = "200"          # default 2:00 preview
            app_state["time_default"] = True
            app_state["stage"] = "TIME"
            lcd_penalty_entry_time()
            return

        elif app_state["stage"] == "TIME":
            secs = parse_time_on_enter(app_state["buffer"])
            team = app_state["team"]
            player = int(app_state["_player"])
            app_state["penalties"][team].append({"player": player, "secs": secs})
            slot_index = len(app_state["penalties"][team])
            lcd_penalty_final(team, player, secs, slot_index)
            app_state.update({"mode":"DEFAULT","team":None,"buffer":"","stage":None,"_player":None,"time_default":False})
            return

    elif app_state["mode"] == "PENALTY_EDIT":
        team = app_state["team"]; L = app_state["penalties"][team]; n = len(L)
        if n == 0:
            app_state.update({"mode":"DEFAULT","team":None,"buffer":"","stage":None}); lcd_scores(); return

        if app_state["edit_index"] == n:
            # ENTER on phantom -> jump to last real and open with +2:00 preview
            app_state["edit_index"] = n - 1
            app_state["stage"] = "TIME"; app_state["buffer"] = "200"; app_state["time_default"] = True
            p = L[app_state["edit_index"]]["player"]
            status_var.set(f"{app_state['edit_index']+1} PL{p}  PN {mask_time(app_state['buffer'])}")
            return

        # on a real row
        if app_state["stage"] != "TIME":
            app_state["stage"] = "TIME"; app_state["buffer"] = "200"; app_state["time_default"] = True
            idx = app_state["edit_index"]; p = L[idx]["player"]
            status_var.set(f"{idx+1} PL{p}  PN {mask_time(app_state['buffer'])}")
            return
        else:
            idx = app_state["edit_index"]
            new_secs = parse_time_on_enter(app_state["buffer"])
            L[idx]["secs"] = new_secs
            lcd_penalty_final(team, L[idx]["player"], new_secs, idx+1)
            app_state.update({"mode":"DEFAULT","team":None,"buffer":"","stage":None,"time_default":False})
            return

def penalty_clear():
    if app_state["buffer"]:
        if app_state["stage"] == "TIME" and app_state["mode"] in ("PENALTY_ENTRY","PENALTY_EDIT"):
            app_state["buffer"] = "200"; app_state["time_default"] = True
            if app_state["mode"] == "PENALTY_ENTRY":
                lcd_penalty_entry_time()
            else:
                idx = app_state["edit_index"]
                if idx < len(app_state["penalties"][app_state['team']]):
                    p = app_state["penalties"][app_state["team"]][idx]["player"]
                    status_var.set(f"{idx+1} PL{p}  PN {mask_time(app_state['buffer'])}")
            return
        app_state["buffer"] = ""
        if app_state["mode"] == "PENALTY_ENTRY":
            lcd_penalty_entry_player() if app_state["stage"] == "PLAYER" else lcd_penalty_entry_time()
        elif app_state["mode"] == "PENALTY_EDIT":
            lcd_penalty_edit_select()
    else:
        app_state.update({"mode":"DEFAULT","team":None,"buffer":"","stage":None,"_player":None,"time_default":False})
        lcd_scores()

# ------------------- PENALTY EDIT (open & navigate) --------------------
def start_penalty_edit(team: str):
    app_state.update({"mode":"PENALTY_EDIT","team":team,"last_team":team,
                      "buffer":"","stage":None,"time_default":False})
    app_state["edit_index"] = len(app_state["penalties"][team])  # start on phantom
    lcd_penalty_edit_select()

def ensure_edit_mode():
    """If not in PENALTY_EDIT, enter it for last_team and open at phantom row."""
    if app_state["mode"] != "PENALTY_EDIT":
        start_penalty_edit(app_state["last_team"])

def move_edit_selection(delta: int):
    ensure_edit_mode()
    if app_state["mode"] != "PENALTY_EDIT":
        return
    L = app_state["penalties"][app_state["team"]]
    n = len(L)
    app_state["edit_index"] = (app_state["edit_index"] + delta) % (n + 1)
    app_state["stage"] = None
    app_state["buffer"] = ""
    app_state["time_default"] = False
    lcd_penalty_edit_select()

# ------------------- Overlay dispatcher (reserved for later rules) ------
def on_overlay_press(key_id: str):
    lcd_scores()

# ------------------- Button factory (layout unchanged) -------------------
def make_btn(frame, text, r, c, w=8, h=3, color="white", col_span=1, padx=2, pady=2, command=None):
    b = tk.Button(frame, text=text, width=w, height=h, bg=color, command=command)
    b.grid(row=r, column=c, columnspan=col_span, padx=padx, pady=pady, sticky="nsew")
    return b

# --- Create grid container ---
frame = tk.Frame(root, bg="gray")
frame.pack(padx=100, pady=100)

# --- HOME label & box ---
home_label = tk.Label(frame, text="HOME", fg="green", font=("Arial", 10, "bold"), bg="gray")
home_label.grid(row=0, column=1, columnspan=2, sticky="n")

home_frame = tk.Frame(frame, bg="gray", bd=2, relief="groove")
home_frame.grid(row=1, column=1, rowspan=4, columnspan=2, sticky="nsew")

make_btn(home_frame, "< PENALTY", 0, 0, color="lightgreen",
         command=lambda: start_penalty_edit("HOME"))
make_btn(home_frame, "PLAYER\n*\nPENLTY\n*", 0, 1, color="lightgreen",
         command=lambda: start_penalty_entry("HOME"))
make_btn(home_frame, "SHOTS\nON GOAL", 1, 0, color="lightgreen")
make_btn(home_frame, "SHOTS\nON GOAL +1", 1, 1, color="lightgreen")
make_btn(home_frame, "", 2, 0)
make_btn(home_frame, "", 2, 1)
make_btn(home_frame, "SCORE\n*", 3, 0, color="lightgreen")
make_btn(home_frame, "SCORE\n+1", 3, 1, color="lightgreen",
         command=home_score_plus_one)

# --- GUEST label & box ---
guest_label = tk.Label(frame, text="GUEST", fg="red", font=("Arial", 10, "bold"), bg="gray")
guest_label.grid(row=0, column=7, columnspan=2, sticky="n")

guest_frame = tk.Frame(frame, bg="gray", bd=2, relief="groove")
guest_frame.grid(row=1, column=7, rowspan=4, columnspan=2, sticky="nsew")

make_btn(guest_frame, "PENLTY >", 0, 0, color="lightpink",
         command=lambda: start_penalty_edit("GUEST"))
make_btn(guest_frame, "PLAYER\n*\nPENLTY\n*", 0, 1, color="lightpink",
         command=lambda: start_penalty_entry("GUEST"))
make_btn(guest_frame, "SHOTS\nON GOAL", 1, 0, color="lightpink")
make_btn(guest_frame, "SHOTS\nON GOAL +1", 1, 1, color="lightpink")
make_btn(guest_frame, "", 2, 0)
make_btn(guest_frame, "", 2, 1)
make_btn(guest_frame, "SCORE\n*", 3, 0, color="lightpink")
make_btn(guest_frame, "SCORE\n+1", 3, 1, color="lightpink",
         command=guest_score_plus_one)

# --- Main grid buttons (with blanks preserved) ---
# Row 1
make_btn(frame, "", 1, 0)
make_btn(frame, "", 1, 3)
make_btn(frame, "ENABLE\nPENLTY CLOCKS", 1, 4, color="white")
make_btn(frame, "DISABLE\nPENLTY CLOCKS", 1, 5, color="white")
make_btn(frame, "", 1, 6)
make_btn(frame, "", 1, 9)
make_btn(frame, "7", 1, 10, command=lambda: penalty_press_digit("7"))
make_btn(frame, "8", 1, 11, command=lambda: penalty_press_digit("8"))
make_btn(frame, "9", 1, 12, command=lambda: penalty_press_digit("9"))
make_btn(frame, "↑", 1, 14, color="lightgray", command=lambda: move_edit_selection(-1))
make_btn(frame, "AUTO\nHORN\n*", 1, 16, color="white")
make_btn(frame, "HORN", 1, 17, color="yellow")  # <- fixed stray parenthesis

# Row 2
make_btn(frame, "", 2, 0)
make_btn(frame, "", 2, 3)
make_btn(frame, "", 2, 4)
make_btn(frame, "", 2, 5)
make_btn(frame, "", 2, 6)
make_btn(frame, "", 2, 9)
make_btn(frame, "4", 2, 10, command=lambda: penalty_press_digit("4"))
make_btn(frame, "5", 2, 11, command=lambda: penalty_press_digit("5"))
make_btn(frame, "6", 2, 12, command=lambda: penalty_press_digit("6"))
make_btn(frame, "←", 2, 13, color="lightgray")
m = make_btn(frame, "MENU", 2, 14, color="black"); m.config(fg="white")
make_btn(frame, "→", 2, 15, color="lightgray")

# Row 3
make_btn(frame, "", 3, 0)
make_btn(frame, "", 3, 3)
make_btn(frame, "PERIOD\n*", 3, 4, color="white")
make_btn(frame, "PERIOD\n+1", 3, 5, color="white")
make_btn(frame, "", 3, 6)
make_btn(frame, "", 3, 9)
make_btn(frame, "1", 3, 10, command=lambda: penalty_press_digit("1"))
make_btn(frame, "2", 3, 11, command=lambda: penalty_press_digit("2"))
make_btn(frame, "3", 3, 12, command=lambda: penalty_press_digit("3"))
make_btn(frame, "↓", 3, 14, color="lightgray", command=lambda: move_edit_selection(+1))
make_btn(frame, "COUNT\nUP/DOWN\n*", 3, 16, color="white")
make_btn(frame, "START", 3, 17, color="green")

# Row 4
make_btn(frame, "", 4, 0)
make_btn(frame, "", 4, 3)
make_btn(frame, "", 4, 4)
make_btn(frame, "", 4, 5)
make_btn(frame, "", 4, 6)
make_btn(frame, "", 4, 9)
make_btn(frame, "CLEAR\nNO", 4, 10, command=penalty_clear)
make_btn(frame, "0", 4, 11, command=lambda: penalty_press_digit("0"))
make_btn(frame, "ENTER\n*\nYES", 4, 12, command=penalty_enter)
make_btn(frame, "SET\nMAIN\nCLOCK\n*", 4, 16, color="white")
make_btn(frame, "END", 4, 17, color="red")

# ================= Overlay show/hide ====================
def normalize_id(label: str, idx: int) -> str:
    if not label or label.strip() == "":
        return f"BLANK_{idx}"
    s = label.replace("\n", "_").replace(" ", "_").replace("BACK__", "BACK_")
    s = s.replace("BACK_SPACE", "BACKSPACE").replace("MESSAGE__NUMBER", "MESSAGE_NUMBER")
    return s

def create_overlay_if_needed():
    global overlay_created, overlay_buttons, overlay_button_ids
    if overlay_created: return
    idx = 0
    for r in OVERLAY_ROWS:
        for c in OVERLAY_COLS:
            text = OVERLAY_LABELS[idx]
            key_id = normalize_id(text, idx)
            b = tk.Button(frame, text=text, width=8, height=3, bg="white",
                          command=lambda k=key_id: on_overlay_press(k))
            b.grid(row=r, column=c, padx=2, pady=2, sticky="nsew")
            overlay_buttons.append(b); overlay_button_ids.append(key_id)
            idx += 1
    overlay_created = True

def show_overlay():
    home_label.grid_remove(); guest_label.grid_remove()
    home_frame.grid_remove(); guest_frame.grid_remove()
    create_overlay_if_needed()
    for b in overlay_buttons: b.grid()

def hide_overlay():
    if overlay_created:
        for b in overlay_buttons: b.grid_remove()
    home_label.grid(); guest_label.grid()
    home_frame.grid(); guest_frame.grid()

overlay_var = tk.BooleanVar(value=False)
def on_toggle():
    show_overlay() if overlay_var.get() else hide_overlay()

ttk.Checkbutton(root, text="Team Name overlay", variable=overlay_var, command=on_toggle)\
    .pack(anchor="w", padx=110, pady=(0, 0))

# --- Keyboard arrow bindings (Up/Down work like the buttons) ---
root.bind("<Up>",   lambda e: move_edit_selection(-1))
root.bind("<Down>", lambda e: move_edit_selection(+1))

# Init
hide_overlay()
lcd_scores()
root.mainloop()
