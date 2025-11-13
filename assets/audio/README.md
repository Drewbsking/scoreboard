# Audio Files

## Place Your Audio Files Here

This directory is for audio files used by the scoreboard.

### Required File

- **red-wings-horn.mp3** - Detroit Red Wings goal horn sound

### How to Get the Red Wings Horn

1. **YouTube**
   - Search: "Detroit Red Wings goal horn"
   - Popular video: "Red Wings Goal Horn"
   - Use a YouTube to MP3 converter
   - Download and save as `red-wings-horn.mp3`

2. **Direct Download Options**
   - NHL team sound effects websites
   - Freesound.org (search "hockey horn" or "ship horn")
   - Hockey forum sound libraries

3. **Create Your Own**
   - The Red Wings use a Kahlenberg D-1A ship horn
   - Record from games or videos
   - Edit to 3-5 seconds
   - Save as MP3

### Alternative: Use Online Audio

If you have a URL to the horn sound, you can modify `index.html`:

```html
<audio id="hornAudio" preload="auto">
  <source src="YOUR_URL_HERE.mp3" type="audio/mpeg">
</audio>
```

### File Specifications

- **Format**: MP3 (or OGG for Firefox)
- **Sample Rate**: 44.1kHz recommended
- **Bit Rate**: 128-192 kbps
- **Duration**: 3-5 seconds
- **Size**: < 500KB recommended

### Without Audio

The app works fine without audio files. The HORN button will show visual feedback (🚨 HORN! 🚨) on the display instead.

---

**Note**: Make sure you have rights to use any audio you download. NHL team sounds may be copyrighted. Use for personal/educational purposes only.
