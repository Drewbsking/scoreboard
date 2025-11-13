# Daktronics AllSports 4100 Emulator (Web)

A web-based emulator for the Daktronics AllSports 4100 scoreboard controller, built with TypeScript.

## Project Structure

```
scoreboard/
├── src/
│   └── app.ts              # TypeScript source code
├── dist/                   # Compiled JavaScript (generated)
│   ├── app.js
│   ├── app.js.map
│   ├── app.d.ts
│   └── app.d.ts.map
├── index.html              # Main HTML file
├── styles.css              # Stylesheet
├── tsconfig.json           # TypeScript configuration
├── package.json            # Project dependencies
└── .gitignore              # Git ignore rules
```

## Features

- **Scoreboard Display**: Visual representation of the game scoreboard
- **Score Management**: Track scores for both HOME and GUEST teams
- **Penalty Tracking**: Add, edit, and display player penalties with timers
  - Automatic countdown when game clock runs
  - Auto-remove when penalty time expires
  - Manual penalty removal with CLEAR button
- **Team Name Editor**: Customize team names using an on-screen keyboard
- **Period Control**: Manage game periods
- **Clock Display**: Show game clock in MM:SS format
- **Goal Horn**: Detroit Red Wings horn sound effect (audio file required)
- **Game Clock**: Running clock with count down/count up modes
  - Auto-plays horn when countdown reaches 0:00
  - Default 20:00 period time
  - Manual clock setting with SET MAIN CLOCK button
- **Responsive Design**: Adapts to different screen sizes
- **Menu System**: Access different modes and settings

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the TypeScript code:
   ```bash
   npm run build
   ```

3. Open `index.html` in a web browser

### Audio Setup (Optional)

To enable the Detroit Red Wings goal horn:

1. Download a Red Wings horn audio file (MP3 format)
2. Save it to `assets/audio/red-wings-horn.mp3`
3. See [AUDIO_SETUP.md](AUDIO_SETUP.md) for detailed instructions

**Note**: The horn button will still work without audio (shows visual feedback).

### Development

To watch for changes and automatically recompile:
```bash
npm run watch
```

## Usage

### Basic Controls

- **Score Buttons**: Use "SCORE +1" buttons to increment team scores
- **Penalty Management**: Full penalty tracking system matching Daktronics manual
  - **Add**: Click "PLAYER * PENLTY *", enter player #, enter time
  - **Edit**: Use ↑/↓ arrows, press ENTER, modify time
  - **Remove**: Navigate to penalty, CLEAR → ENTER → CLEAR → ENTER (two-step process)
  - **Auto**: Penalties count down with game clock and auto-remove at 0:00
  - See [PENALTY_GUIDE.md](PENALTY_GUIDE.md) for complete instructions
- **Horn**: Click the yellow "HORN" button to play the Detroit Red Wings goal horn 🚨
- **Game Clock**:
  - **START** (green button): Start the game clock
    - If clock is at 0:00, automatically sets to 20:00
  - **END** (red button): Stop the game clock
  - **COUNT UP/DOWN**: Toggle between countdown and count-up modes
  - **SET MAIN CLOCK**: Manually set the game clock time
    - Press button, enter time (e.g., `1530` for 15:30), press ENTER
    - Press CLEAR to cancel or clear buffer
  - Clock automatically plays horn when reaching 0:00 in countdown mode
- **Menu**: Press the MENU button to access additional features
- **Team Names**: Select "Team Name Mode" from the menu to customize team names

### Keyboard Shortcuts

- **↑ (Up Arrow)**: Move selection up in penalty edit mode
- **↓ (Down Arrow)**: Move selection down in penalty edit mode

## Technology Stack

- **TypeScript**: For type-safe application logic
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **Vanilla JavaScript**: No frameworks, just pure TypeScript/JavaScript

## TypeScript Configuration

The project uses strict TypeScript settings for maximum type safety:
- Strict mode enabled
- No unused locals or parameters allowed
- No implicit returns
- Source maps enabled for debugging
- Declaration files generated

## Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm run watch`: Watch mode for development
- `npm run dev`: Alias for watch mode

## License

MIT
