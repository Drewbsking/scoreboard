# Penalty System Guide

Complete guide to using the penalty tracking system, matching the Daktronics AllSports 4100 manual.

## Overview

The scoreboard tracks player penalties with automatic countdown timers. Penalties are displayed in two locations:
- **Team Penalty Boxes**: Shows player number and time (top 2 penalties per team)
- **Center Display**: Shows first penalty time for each team

## Adding Penalties

### Step-by-Step (From Manual)

1. **Click the PLAYER/PENALTY Button**
   - HOME side: Green "PLAYER * PENLTY *" button
   - GUEST side: Pink "PLAYER * PENLTY *" button

2. **Enter Player Number**
   - Type player number (1-99)
   - Status shows: `1 PL•14  PN ••:••`
   - Press ENTER

3. **Enter Penalty Time**
   - Default is 2:00 (shown as `200`)
   - Type custom time if needed:
     - `2` = 2:00
     - `45` = 45:00
     - `130` = 1:30
     - `245` = 2:45
   - Status shows: `1 PL14  PN •2:00`
   - Press ENTER

4. **Penalty Added!**
   - Shows on scoreboard
   - Starts counting when clock runs

## Automatic Countdown

**When Game Clock Runs:**
- All penalties count down automatically
- Updates every second
- Works in both countdown and count-up clock modes

**When Game Clock Stops:**
- Penalty timers pause
- Resume when clock restarts

**When Penalty Reaches 0:00:**
- Penalty automatically removed from board
- No manual action needed

## Editing Penalties

### Change Penalty Time

1. **Enter Edit Mode**
   - Click "< PENALTY" or "PENLTY >" button
   - Shows current penalty or phantom (empty) slot

2. **Navigate to Penalty**
   - Use ↑ (up arrow) to move up
   - Use ↓ (down arrow) to move down
   - Status shows: `1 PL14  PN 2:00` (selected penalty)

3. **Edit Time**
   - Press ENTER
   - Type new time digits
   - Press ENTER to save

4. **Exit**
   - Press CLEAR (no buffer) to exit

## Removing Penalties (Take Off Board)

### Manual Removal

**From Manual: "To Take Penalties Off Board"**

1. **Enter Edit Mode**
   - Click "< PENALTY" or "PENLTY >" button

2. **Select Penalty to Remove**
   - Use ↑/↓ arrows to navigate
   - Status shows the selected penalty (e.g., `1 PL14  PN 2:00`)

3. **Clear Player Number**
   - Press CLEAR (with no buffer/digits entered)
   - Status shows: `PL--  PN 2:00` (player number cleared)

4. **Confirm Player Clear**
   - Press ENTER
   - Status shows: `Press CLEAR to remove time`

5. **Clear Penalty Time**
   - Press CLEAR again
   - Status shows: `PL--  PN --:--` (time cleared)

6. **Confirm Removal**
   - Press ENTER
   - Status shows: `Removed: PL14 PN 2:00`
   - Penalty removed from board
   - Returns to edit mode for more removals

### Automatic Removal

Penalties are automatically removed when:
- Timer counts down to 0:00
- Happens while game clock is running
- No manual action needed

## Display Format

### Main Penalty Boxes (Top 2 per Team)

```
PLYR  PENALTY
14    2:00
 7    1:30
```

- Shows player number (left)
- Shows penalty time (right)
- Updates in real-time
- Empty slots show `--  --:--`

### Center Display (First Penalty Each Team)

```
PENALTY
2:00    1:30
```

- LEFT time = HOME team first penalty
- RIGHT time = GUEST team first penalty
- Shows `--:--` if no penalty

## Examples

### Example 1: Add Home Penalty

```
1. Click HOME "PLAYER * PENLTY *"
2. Type: 14
3. Press ENTER
   LCD: "1 PL•14  PN ••:••"
4. Type: 200 (or press ENTER for default 2:00)
5. Press ENTER
   LCD: "1 PL14  PN 2:00"
6. Penalty appears on scoreboard
```

### Example 2: Remove Penalty Early

```
Player 14 has 1:30 remaining, but penalty is over
1. Click HOME "< PENALTY"
2. Use ↑/↓ to find Player 14
   LCD: "1 PL14  PN 1:30"
3. Press CLEAR (first time)
   LCD: "PL--  PN 1:30"
4. Press ENTER
   LCD: "Press CLEAR to remove time"
5. Press CLEAR (second time)
   LCD: "PL--  PN --:--"
6. Press ENTER
   LCD: "Removed: PL14 PN 1:30"
7. Penalty removed from board
```

### Example 3: Edit Penalty Time

```
Player 7 has 2:00, but should have 5:00
1. Click HOME "< PENALTY"
2. Use ↑/↓ to find Player 7
   LCD: "2 PL7  PN 2:00"
3. Press ENTER
4. Type: 500
   LCD: "2 PL7  PN •5:00"
5. Press ENTER
   LCD: "2 PL7  PN 5:00"
6. Time updated to 5:00
```

### Example 4: Multiple Penalties

```
HOME has 3 penalties:
• Player 14: 2:00
• Player 7:  1:30
• Player 21: 0:45

When clock runs:
• All count down together
• 2:00 → 1:59 → 1:58...
• 1:30 → 1:29 → 1:28...
• 0:45 → 0:44 → 0:43...

When Player 21 reaches 0:00:
• Auto-removed
• Player 14 and 7 continue
```

## Navigation Reference

**Keyboard Shortcuts:**
- `↑` (Up Arrow) - Move penalty selection up
- `↓` (Down Arrow) - Move penalty selection down

**Button Functions:**
- `PLAYER * PENLTY *` - Add new penalty
- `< PENALTY` or `PENLTY >` - Edit/remove penalties
- `ENTER` - Confirm entry, start editing
- `CLEAR` - Clear buffer OR remove penalty
- `↑` button - Navigate up
- `↓` button - Navigate down

## Tips

1. **Default Time**: Pressing ENTER without typing uses 2:00 (standard minor penalty)

2. **Time Format**:
   - 1-2 digits = minutes (e.g., `2` = 2:00)
   - 3 digits = M:SS (e.g., `130` = 1:30)
   - 4 digits = MM:SS (e.g., `0245` = 2:45)

3. **Multiple Penalties**: Can have many penalties per team, but only top 2 show in main boxes

4. **Phantom Row**: In edit mode, one slot past the last penalty lets you add new ones

5. **Clock Dependency**: Penalties only count down when the game clock is running

6. **Safe Removal**: Can remove penalties at any time, won't affect game clock

## Troubleshooting

**Penalty not counting down?**
- Make sure game clock is running (green START button)

**Can't remove penalty?**
- Make sure you're in edit mode (click "< PENALTY")
- Navigate to the penalty you want to remove
- Follow the two-step process:
  1. CLEAR (clears player #) → ENTER
  2. CLEAR (clears time) → ENTER

**Penalty disappeared unexpectedly?**
- Probably reached 0:00 and auto-removed
- Check if it expired naturally

**Status shows wrong penalty?**
- Use ↑/↓ arrows to navigate
- The status LCD shows which penalty is selected

---

This penalty system matches the behavior documented in the Daktronics AllSports 4100 manual! 🏒
