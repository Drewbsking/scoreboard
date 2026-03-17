import tkinter as tk
from tkinter import ttk

# --- Create main window ---
root = tk.Tk()
root.title("Daktronics AllSports 4100 Emulator")
root.configure(bg="lightgray")

# =============== TEAM NAME overlay labels (exact layout) =================
OVERLAY_LABELS = [
    "LEFT","RIGHT","DOUBLE","SINGLE","","","DM","ESC","POST","EXT",
    "Q","W","E","R","T","Y","U","I","O","P",
    "A","S","D","F","G","H","J","K","L",".",
    "Z","X","C","V","B","N","M","SPACE","BACK\nSPACE","MESSAGE\nNUMBER",
]
OVERLAY_ROWS = [1, 2, 3, 4]
OVERLAY_COLS = list(range(0, 10))  # 0..9
overlay_buttons = []
overlay_button_ids = []
overlay_created = False

# ------------------- Simple state & dispatcher --------------------
app_state = {
    "mode": "DEFAULT",     # DEFAULT | SET_SCORE_HOME | SET_SCORE_GUEST
    "buffer": "",          # numeric entry buffer for * modes
    "home_score": 0,       # start values just for demo; change as you like
    "guest_score": 0,
    "last_key": None,
}

def lcd_home():
    status_var.set(f"H. SCORE • • {app_state['home_score']}     "
                   f"G. SCORE • • {app_state['guest_score']}")

def lcd_prompt(team: str):
    # team in {"H","G"}; show buffer while entering
    buf = app_state["buffer"] if app_state["buffer"] else "_"
    if team == "H":
        status_var.set(f"H. SCORE • • {buf}")
    else:
        status_var.set(f"G. SCORE • • {buf}")

def set_mode(new_mode: str):
    app_state["mode"] = new_mode

def start_set_score_home():
    app_state["buffer"] = ""
    set_mode("SET_SCORE_HOME")
    lcd_prompt("H")

def start_set_score_guest():
    app_state["buffer"] = ""
    set_mode("SET_SCORE_GUEST")
    lcd_prompt("G")

def apply_buffer():
    """ENTER key behavior for SET_SCORE_* modes."""
    if app_state["mode"] == "SET_SCORE_HOME" and app_state["buffer"]:
        app_state["home_score"] = int(app_state["buffer"])
    elif app_state["mode"] == "SET_SCORE_GUEST" and app_state["buffer"]:
        app_state["guest_score"] = int(app_state["buffer"])
    app_state["buffer"] = ""
    set_mode("DEFAULT")
    lcd_home()

def clear_buffer():
    app_state["buffer"] = ""
    if app_state["mode"] == "SET_SCORE_HOME":
        lcd_prompt("H")
    elif app_state["mode"] == "SET_SCORE_GUEST":
        lcd_prompt("G")
    else:
        lcd_home()

def press_digit(d: str):
    # allow up to 3 digits; adjust as needed
    if app_state["mode"] in ("SET_SCORE_HOME", "SET_SCORE_GUEST"):
        if len(app_state["buffer"]) < 3:
            app_state["buffer"] += d
        lcd_prompt("H" if app_state["mode"] == "SET_SCORE_HOME" else "G")
    else:
        # not in a numeric-entry mode; ignore or show current
        lcd_home()

def home_score_plus_one():
    app_state["home_score"] += 1
    lcd_home()

def guest_score_plus_one():
    app_state["guest_score"] += 1
    lcd_home()

# Overlay dispatcher (ready for your future rules)
def on_overlay_press(key_id: str):
    app_state["last_key"] = key_id
    # Nothing from this page needs overlay yet; we’ll add rules here as you send them.
    # For now just keep the LCD visible
    lcd_home()

# ------------------- Button factory (layout unchanged) --------------------
def make_btn(frame, text, r, c, w=8, h=3, color="white", col_span=1, padx=2, pady=2, command=None):
    b = tk.Button(frame, text=text, width=w, height=h, bg=color, command=command)
    b.grid(row=r, column=c, columnspan=col_span, padx=padx, pady=pady, sticky="nsew")
    return b

# --- Create grid container ---
frame = tk.Frame(root, bg="gray")
frame.pack(padx=100, pady=100)

# --- STATUS BAR (LCD mimic) ---
status_var = tk.StringVar(value="")
status = tk.Label(root, textvariable=status_var, anchor="w")
status.pack(fill="x", padx=110, pady=(0, 6))

# --- HOME label & box ---
home_label = tk.Label(frame, text="HOME", fg="green", font=("Arial", 10, "bold"), bg="gray")
home_label.grid(row=0, column=1, columnspan=2, sticky="n")

home_frame = tk.Frame(frame, bg="gray", bd=2, relief="groove")
home_frame.grid(row=1, column=1, rowspan=4, columnspan=2, sticky="nsew")

# HOME buttons (commands added)
make_btn(home_frame, "< PENALTY", 0, 0, color="lightgreen")
make_btn(home_frame, "PLAYER\n*\nPENLTY\n*", 0, 1, color="lightgreen")
make_btn(home_frame, "SHOTS\nON GOAL", 1, 0, color="lightgreen")
make_btn(home_frame, "SHOTS\nON GOAL +1", 1, 1, color="lightgreen")
make_btn(home_frame, "", 2, 0)
make_btn(home_frame, "", 2, 1)
make_btn(home_frame, "SCORE\n*", 3, 0, color="lightgreen", command=start_set_score_home)
make_btn(home_frame, "SCORE\n+1", 3, 1, color="lightgreen", command=home_score_plus_one)

# --- GUEST label & box ---
guest_label = tk.Label(frame, text="GUEST", fg="red", font=("Arial", 10, "bold"), bg="gray")
guest_label.grid(row=0, column=7, columnspan=2, sticky="n")

guest_frame = tk.Frame(frame, bg="gray", bd=2, relief="groove")
guest_frame.grid(row=1, column=7, rowspan=4, columnspan=2, sticky="nsew")

# GUEST buttons (commands added)
make_btn(guest_frame, "PENLTY >", 0, 0, color="lightpink")
make_btn(guest_frame, "PLAYER\n*\nPENLTY\n*", 0, 1, color="lightpink")
make_btn(guest_frame, "SHOTS\nON GOAL", 1, 0, color="lightpink")
make_btn(guest_frame, "SHOTS\nON GOAL +1", 1, 1, color="lightpink")
make_btn(guest_frame, "", 2, 0)
make_btn(guest_frame, "", 2, 1)
make_btn(guest_frame, "SCORE\n*", 3, 0, color="lightpink", command=start_set_score_guest)
make_btn(guest_frame, "SCORE\n+1", 3, 1, color="lightpink", command=guest_score_plus_one)

# --- Main grid buttons (with blanks preserved) ---
# Row 1
make_btn(frame, "", 1, 0)  # top-left cell
make_btn(frame, "", 1, 3)
make_btn(frame, "ENABLE\nPENLTY CLOCKS", 1, 4, color="white")
make_btn(frame, "DISABLE\nPENLTY CLOCKS", 1, 5, color="white")
make_btn(frame, "", 1, 6)
make_btn(frame, "", 1, 9)
make_btn(frame, "7", 1, 10, command=lambda: press_digit("7"))
make_btn(frame, "8", 1, 11, command=lambda: press_digit("8"))
make_btn(frame, "9", 1, 12, command=lambda: press_digit("9"))
make_btn(frame, "↑", 1, 14, color="lightgray")
make_btn(frame, "AUTO\nHORN\n*", 1, 16, color="white")
make_btn(frame, "HORN", 1, 17, color="yellow")

# Row 2
make_btn(frame, "", 2, 0)
make_btn(frame, "", 2, 3)
make_btn(frame, "", 2, 4)
make_btn(frame, "", 2, 5)
make_btn(frame, "", 2, 6)
make_btn(frame, "", 2, 9)
make_btn(frame, "4", 2, 10, command=lambda: press_digit("4"))
make_btn(frame, "5", 2, 11, command=lambda: press_digit("5"))
make_btn(frame, "6", 2, 12, command=lambda: press_digit("6"))
make_btn(frame, "←", 2, 13, color="lightgray")
make_btn(frame, "MENU", 2, 14, color="black").config(fg="white")
make_btn(frame, "→", 2, 15, color="lightgray")

# Row 3
make_btn(frame, "", 3, 0)
make_btn(frame, "", 3, 3)
make_btn(frame, "PERIOD\n*", 3, 4, color="white")
make_btn(frame, "PERIOD\n+1", 3, 5, color="white")
make_btn(frame, "", 3, 6)
make_btn(frame, "", 3, 9)
make_btn(frame, "1", 3, 10, command=lambda: press_digit("1"))
make_btn(frame, "2", 3, 11, command=lambda: press_digit("2"))
make_btn(frame, "3", 3, 12, command=lambda: press_digit("3"))
make_btn(frame, "↓", 3, 14, color="lightgray")
make_btn(frame, "COUNT\nUP/DOWN\n*", 3, 16, color="white")
make_btn(frame, "START", 3, 17, color="green")

# Row 4
make_btn(frame, "", 4, 0)
make_btn(frame, "", 4, 3)
make_btn(frame, "", 4, 4)
make_btn(frame, "", 4, 5)
make_btn(frame, "", 4, 6)
make_btn(frame, "", 4, 9)
make_btn(frame, "CLEAR\nNO", 4, 10, command=clear_buffer)
make_btn(frame, "0", 4, 11, command=lambda: press_digit("0"))
make_btn(frame, "ENTER\n*\nYES", 4, 12, command=apply_buffer)
make_btn(frame, "SET\nMAIN\nCLOCK\n*", 4, 16, color="white")
make_btn(frame, "END", 4, 17, color="red")

# ================= Overlay show/hide ====================
def normalize_id(label: str, idx: int) -> str:
    if not label or label.strip() == "":
        return f"BLANK_{idx}"
    s = label.replace("\n", "_").replace(" ", "_")
    s = s.replace("BACK__", "BACK_")
    s = s.replace("BACK_SPACE", "BACKSPACE")
    s = s.replace("MESSAGE__NUMBER", "MESSAGE_NUMBER")
    return s

def create_overlay_if_needed():
    global overlay_created, overlay_buttons, overlay_button_ids
    if overlay_created:
        return
    idx = 0
    for r in OVERLAY_ROWS:
        for c in OVERLAY_COLS:
            text = OVERLAY_LABELS[idx]
            key_id = normalize_id(text, idx)
            b = tk.Button(frame, text=text, width=8, height=3, bg="white",
                          command=lambda k=key_id: on_overlay_press(k))
            b.grid(row=r, column=c, padx=2, pady=2, sticky="nsew")
            overlay_buttons.append(b)
            overlay_button_ids.append(key_id)
            idx += 1
    overlay_created = True

def show_overlay():
    home_label.grid_remove()
    guest_label.grid_remove()
    home_frame.grid_remove()
    guest_frame.grid_remove()
    create_overlay_if_needed()
    for b in overlay_buttons:
        b.grid()

def hide_overlay():
    if overlay_created:
        for b in overlay_buttons:
            b.grid_remove()
    home_label.grid()
    guest_label.grid()
    home_frame.grid()
    guest_frame.grid()

# --- Checkbox toggle ---
overlay_var = tk.BooleanVar(value=True)
def on_toggle():
    if overlay_var.get():
        show_overlay()
    else:
        hide_overlay()

ttk.Checkbutton(root, text="Team Name overlay", variable=overlay_var, command=on_toggle)\
    .pack(anchor="w", padx=110, pady=(10, 0))

# Start with overlay ON so you can verify the exact layout
show_overlay()

# Show initial scores on the LCD-like status line
lcd_home()

root.mainloop()
