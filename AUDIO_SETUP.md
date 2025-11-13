# Audio Setup Guide

## Detroit Red Wings Horn

The horn button is configured to play the classic Detroit Red Wings goal horn sound.

### Option 1: Download Official Sound

You can find the Detroit Red Wings goal horn sound from these sources:

1. **YouTube to MP3**
   - Search YouTube for "Detroit Red Wings goal horn"
   - Use a YouTube to MP3 converter
   - Save as `red-wings-horn.mp3`

2. **NHL Game Audio**
   - Search for "Red Wings goal horn sound effect"
   - Download from royalty-free sound libraries

3. **Sound Effect Websites**
   - Freesound.org
   - SoundBible.com
   - Zapsplat.com

### Option 2: Use a Web URL

Alternatively, you can modify the HTML to use a URL directly:

```html
<audio id="hornAudio" preload="auto">
  <source src="https://your-cdn.com/red-wings-horn.mp3" type="audio/mpeg">
</audio>
```

### Setup Instructions

1. Download or locate your Red Wings horn audio file
2. Save it to: `assets/audio/red-wings-horn.mp3`
3. (Optional) Convert to OGG for better browser compatibility:
   ```bash
   ffmpeg -i assets/audio/red-wings-horn.mp3 assets/audio/red-wings-horn.ogg
   ```

### File Placement

```
scoreboard/
├── assets/
│   └── audio/
│       ├── red-wings-horn.mp3  (required)
│       └── red-wings-horn.ogg  (optional, for Firefox)
```

### Testing

1. Open `index.html` in your browser
2. Click the yellow "HORN" button
3. You should hear the Detroit Red Wings goal horn!

### Fallback Behavior

If no audio file is found, the horn button will:
- Display "🚨 HORN! 🚨" on the status display
- Show the message for 1.5 seconds
- This ensures the button always provides feedback

### Troubleshooting

**No sound playing?**
- Check browser console for errors (F12)
- Verify the audio file path is correct
- Try clicking the button twice (first click may enable audio permissions)
- Check browser audio permissions
- Ensure the file format is supported by your browser

**Audio cuts off?**
- The horn resets to the beginning each press
- This is intentional for rapid horn presses

**Browser blocks autoplay?**
- Modern browsers require user interaction first
- The button click counts as user interaction
- If still blocked, check browser autoplay settings

### Audio File Recommendations

- **Format**: MP3 (widely supported)
- **Sample Rate**: 44.1kHz or 48kHz
- **Bit Rate**: 128-192 kbps
- **Duration**: 3-5 seconds recommended
- **File Size**: Keep under 500KB for fast loading

### Classic Red Wings Horn Sound

The iconic Detroit Red Wings goal horn is actually a **Kahlenberg D-1A ship horn**. The sound is:
- Deep and resonant
- Approximately 4 seconds long
- Followed by crowd cheering (optional)
- Often paired with "Hey Hey Hockeytown" song

Enjoy the authentic arena experience! 🏒🚨
