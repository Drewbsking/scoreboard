import tkinter as tk

# ====== Config ======
BTN_SIZE = 48   # pixel size for square keys
BTN_GAP  = 4
KEY_ROWS = 4
KEY_COLS = 10

# Colors
COL_PANEL  = "#1d6fd6"   # scoreboard blue
COL_SEG_G  = "#42f57b"   # clock green
COL_SEG_R  = "#ff5a5a"   # score red
COL_SEG_Y  = "#ffd54a"   # team/period yellow
COL_LCD_BG = "#c9f7c3"   # LCD green
COL_LCD_FG = "#000000"
COL_FACE   = "#2c2f33"   # console gray
COL_KEY    = "#d8dde1"   # regular key
COL_ACCENT = "#aeb7bf"   # arrow/menu/gray keys
COL_START  = "#27ae60"
COL_STOP   = "#e74c3c"
COL_HORN   = "#f1c40f"
COL_STACK  = "#b9c3c9"   # AUTO HORN etc.

# ====== Hockey Faceplate Layout ======
# 4 rows × 10 columns
HOCKEY_LAYOUT = [
    ["PENALTY", "PLAYER\nPENALTY", "ENABLE\nPEN CLK", "DISABLE\nPEN CLK", "PERIOD -", "PERIOD +1", "7", "8", "9", "AUTO\nHORN"],
    ["SOG", "SOG", "SCORE -1", "SCORE +1", "MENU", "↑", "4", "5", "6", "HORN"],
    ["PENALTY", "PLAYER\nPENALTY", "SOG", "SOG", "←", "ENTER\nYES", "1", "2", "3", "START"],
    ["SCORE -1", "SCORE +1", "CLEAR\nNO", "0", "→", "↓", "", "", "STOP", "SET MAIN\nCLOCK"],
]

# ====== Colors Map ======
SPECIAL_COLORS = {
    "START": COL_START,
    "STOP": COL_STOP,
    "HORN": COL_HORN,
    "AUTO\nHORN": COL_STACK,
    "SET MAIN\nCLOCK": COL_STACK,
    "PERIOD -": COL_ACCENT,
    "PERIOD +1": COL_ACCENT,
    "MENU": COL_ACCENT,
    "↑": COL_ACCENT,
    "↓": COL_ACCENT,
    "←": COL_ACCENT,
    "→": COL_ACCENT,
    "CLEAR\nNO": COL_ACCENT,
    "ENTER\nYES": COL_ACCENT,
}


class AllSport4000(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("AllSport 4000 Emulator — Hockey Layout")
        self.configure(bg="black")

        # ---------- Scoreboard ----------
        board = tk.Frame(self, bg=COL_PANEL, bd=10, relief="ridge")
        board.pack(padx=10, pady=10, fill="x")

        # Home
        tk.Label(board, text="HOME",  bg=COL_PANEL, fg=COL_SEG_Y, font=("Helvetica", 20, "bold")).grid(row=0, column=0, sticky="w")
        tk.Label(board, text="0",     bg=COL_PANEL, fg=COL_SEG_R, font=("Courier New", 48, "bold")).grid(row=1, column=0, sticky="w")

        # Center
        tk.Label(board, text="20:00", bg="black", fg=COL_SEG_G, font=("Courier New", 48, "bold"),
                 width=6, bd=6, relief="ridge").grid(row=0, column=1, rowspan=2, padx=40)
        tk.Label(board, text="PERIOD", bg=COL_PANEL, fg=COL_SEG_Y, font=("Helvetica", 14, "bold")).grid(row=2, column=1, sticky="s")
        tk.Label(board, text="1", bg=COL_PANEL, fg=COL_SEG_Y, font=("Courier New", 36, "bold")).grid(row=3, column=1, sticky="n")

        # Guest
        tk.Label(board, text="GUEST", bg=COL_PANEL, fg=COL_SEG_Y, font=("Helvetica", 20, "bold")).grid(row=0, column=2, sticky="e")
        tk.Label(board, text="0",     bg=COL_PANEL, fg=COL_SEG_R, font=("Courier New", 48, "bold")).grid(row=1, column=2, sticky="e")

        # ---------- LCD ----------
        tk.Label(self, text="READY  HOCKEY", font=("Courier New", 14, "bold"),
                 bg=COL_LCD_BG, fg=COL_LCD_FG, bd=4, relief="sunken",
                 width=60, anchor="w", padx=10).pack(pady=10)

        # ---------- Console Grid ----------
        console = tk.Frame(self, bg=COL_FACE, bd=10, relief="ridge")
        console.pack(padx=10, pady=10)

        for r in range(KEY_ROWS := 4):
            for c in range(KEY_COLS := 10):
                label = HOCKEY_LAYOUT[r][c]
                color = SPECIAL_COLORS.get(label, COL_KEY) if label else COL_KEY
                cell = tk.Frame(console, width=BTN_SIZE, height=BTN_SIZE, bg=COL_FACE)
                cell.grid(row=r, column=c, padx=BTN_GAP, pady=BTN_GAP)
                cell.grid_propagate(False)
                b = tk.Button(cell, text=label, bg=color, font=("Helvetica", 9, "bold"),
                              wraplength=BTN_SIZE-6, justify="center")
                b.pack(fill="both", expand=True)


if __name__ == "__main__":
    AllSport4000().mainloop()
