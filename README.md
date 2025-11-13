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
- **Team Name Editor**: Customize team names using an on-screen keyboard
- **Period Control**: Manage game periods
- **Clock Display**: Show game clock in MM:SS format
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

### Development

To watch for changes and automatically recompile:
```bash
npm run watch
```

## Usage

### Basic Controls

- **Score Buttons**: Use "SCORE +1" buttons to increment team scores
- **Penalty Entry**: Click "PLAYER * PENLTY *" to enter penalty information
  - Enter player number, press ENTER
  - Enter penalty time (default 2:00), press ENTER
- **Penalty Edit**: Click "< PENALTY" or "PENLTY >" to edit existing penalties
  - Use ↑/↓ arrow keys to navigate through penalties
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
