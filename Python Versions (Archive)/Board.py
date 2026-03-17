import tkinter as tk
from tkinter import ttk

# --- Create main window ---
root = tk.Tk()
root.title("Daktronics AllSports 4100 Emulator")
root.configure(bg="lightgray")

# =============== TEAM NAME overlay labels (exact layout) =================
# Row-major: rows 1..4, cols 0..9
OVERLAY_LABELS = [
    # Row 1 (four keys, two blanks, four keys)
    "LEFT", "RIGHT", "DOUBLE", "SINGLE", "", "", "DM", "ESC", "POST", "EXT",
    # Row 2
    "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P",
    # Row 3
    "A", "S", "D", "F", "G", "H", "J", "K", "L", ".",
    # Row 4
    "Z", "X", "C", "V", "B", "N", "M", "SPACE", "BACK\nSPACE", "MESSAGE\nNUMBER",
]

# Where the overlay lives (row/col on main frame)
OVERLAY_ROWS = [1, 2, 3, 4]
OVERLAY_COLS = list(range(0, 10))  # 0..9

# Storage for overlay buttons (created lazily)
overlay_buttons = []          # list[tk.Button]
overlay_created = False

# ------------------- Button factory (your style kept) --------------------
def make_btn(frame, text, r, c, w=8, h=3, color="white", col_span=1, padx=2, pady=2):
    b = tk.Button(frame, text=text, width=w, height=h, bg=color)
    b.grid(row=r, column=c, columnspan=col_span, padx=padx, pady=pady, sticky="nsew")
    return b

# --- Create grid container ---
frame = tk.Frame(root, bg="gray")
frame.pack(padx=100, pady=100)

# --- HOME label above buttons ---
home_label = tk.Label(frame, text="HOME", fg="green", font=("Arial", 10, "bold"), bg="gray")
home_label.grid(row=0, column=1, columnspan=2, sticky="n")

# --- HOME box ---
home_frame = tk.Frame(frame, bg="gray", bd=2, relief="groove")
home_frame.grid(row=1, column=1, rowspan=4, columnspan=2, sticky="nsew")

# HOME buttons
make_btn(home_frame, "< PENALTY", 0, 0, color="lightgreen")
make_btn(home_frame, "PLAYER\n*\nPENLTY\n*", 0, 1, color="lightgreen")
make_btn(home_frame, "SHOTS\nON GOAL", 1, 0, color="lightgreen")
make_btn(home_frame, "SHOTS\nON GOAL +1", 1, 1, color="lightgreen")
make_btn(home_frame, "", 2, 0)
make_btn(home_frame, "", 2, 1)
make_btn(home_frame, "SCORE\n*", 3, 0, color="lightgreen")
make_btn(home_frame, "SCORE\n+1", 3, 1, color="lightgreen")

# --- GUEST label above buttons ---
guest_label = tk.Label(frame, text="GUEST", fg="red", font=("Arial", 10, "bold"), bg="gray")
guest_label.grid(row=0, column=7, columnspan=2, sticky="n")

# --- GUEST box ---
guest_frame = tk.Frame(frame, bg="gray", bd=2, relief="groove")
guest_frame.grid(row=1, column=7, rowspan=4, columnspan=2, sticky="nsew")

# GUEST buttons
make_btn(guest_frame, "PENLTY >", 0, 0, color="lightpink")
make_btn(guest_frame, "PLAYER\n*\nPENLTY\n*", 0, 1, color="lightpink")
make_btn(guest_frame, "SHOTS\nON GOAL", 1, 0, color="lightpink")
make_btn(guest_frame, "SHOTS\nON GOAL +1", 1, 1, color="lightpink")
make_btn(guest_frame, "", 2, 0)
make_btn(guest_frame, "", 2, 1)
make_btn(guest_frame, "SCORE\n*", 3, 0, color="lightpink")
make_btn(guest_frame, "SCORE\n+1", 3, 1, color="lightpink")

# --- Main grid buttons (with blanks preserved) ---
# Row 1
make_btn(frame, "", 1, 0)  # top-left cell
make_btn(frame, "", 1, 3)
make_btn(frame, "ENABLE\nPENLTY CLOCKS", 1, 4, color="white")
make_btn(frame, "DISABLE\nPENLTY CLOCKS", 1, 5, color="white")
make_btn(frame, "", 1, 6)
make_btn(frame, "", 1, 9)  # spacer
make_btn(frame, "7", 1, 10)
make_btn(frame, "8", 1, 11)
make_btn(frame, "9", 1, 12)
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
make_btn(frame, "4", 2, 10)
make_btn(frame, "5", 2, 11)
make_btn(frame, "6", 2, 12)
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
make_btn(frame, "1", 3, 10)
make_btn(frame, "2", 3, 11)
make_btn(frame, "3", 3, 12)
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
make_btn(frame, "CLEAR\nNO", 4, 10)
make_btn(frame, "0", 4, 11)
make_btn(frame, "ENTER\n*\nYES", 4, 12)
make_btn(frame, "SET\nMAIN\nCLOCK\n*", 4, 16, color="white")
make_btn(frame, "END", 4, 17, color="red")

# ================= Overlay show/hide ====================
def create_overlay_if_needed():
    global overlay_created, overlay_buttons
    if overlay_created:
        return

    # Build a full 10x4 grid strictly by row/col so labels match the picture.
    idx = 0
    for r in OVERLAY_ROWS:
        for c in OVERLAY_COLS:
            text = OVERLAY_LABELS[idx]
            idx += 1
            b = tk.Button(frame, text=text, width=8, height=3, bg="white")
            # place them where the keyboard lives
            b.grid(row=r, column=c, padx=2, pady=2, sticky="nsew")
            overlay_buttons.append(b)

    overlay_created = True

def show_overlay():
    # Hide HOME/GUEST labels & boxes to free columns 1–2 and 7–8
    home_label.grid_remove()
    guest_label.grid_remove()
    home_frame.grid_remove()
    guest_frame.grid_remove()

    # Create once, then just re-show
    create_overlay_if_needed()
    for b in overlay_buttons:
        b.grid()   # re-show with previous grid options

def hide_overlay():
    # Hide overlay keys
    if overlay_created:
        for b in overlay_buttons:
            b.grid_remove()

    # Restore HOME/GUEST
    home_label.grid()
    guest_label.grid()
    home_frame.grid()
    guest_frame.grid()

# --- Checkbox toggle ---
overlay_var = tk.BooleanVar(value=False)
def on_toggle():
    if overlay_var.get():
        show_overlay()
    else:
        hide_overlay()

ttk.Checkbutton(root, text="Team Name overlay", variable=overlay_var, command=on_toggle)\
    .pack(anchor="w", padx=110, pady=(10, 0))

# Start with overlay ON so you can verify LEFT/Q/A/Z immediately
show_overlay()

root.mainloop()
