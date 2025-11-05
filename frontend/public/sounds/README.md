# Sound Files for BrainBytes

This directory should contain the following audio files for the sound effects system:

## Required Sound Files

1. **correct.mp3** - Plays when user selects correct answer
   - Suggested: Pleasant "ding" or success chime
   - Duration: ~0.5-1 second
   - Format: MP3, 128kbps

2. **incorrect.mp3** - Plays when user selects wrong answer
   - Suggested: Soft "buzzer" or error tone
   - Duration: ~0.5-1 second
   - Format: MP3, 128kbps

3. **complete.mp3** - Plays when user completes a lesson
   - Suggested: Victory fanfare or achievement sound
   - Duration: ~1-2 seconds
   - Format: MP3, 128kbps

4. **click.mp3** - Plays on UI interactions
   - Suggested: Soft click or tap sound
   - Duration: ~0.2-0.5 seconds
   - Format: MP3, 128kbps

5. **levelup.mp3** - Plays when user levels up or completes milestone
   - Suggested: Epic achievement sound
   - Duration: ~2-3 seconds
   - Format: MP3, 128kbps

## Sources for Free Sound Effects

- **Freesound.org** - https://freesound.org/
- **Zapsplat** - https://www.zapsplat.com/
- **Mixkit** - https://mixkit.co/free-sound-effects/
- **Pixabay** - https://pixabay.com/sound-effects/

## Current Status

⚠️ **Note**: The sound system is implemented but will gracefully fail if sound files are not present. Users won't see errors, sounds just won't play.

To enable sounds:
1. Download or create the sound files listed above
2. Place them in this directory (`/public/sounds/`)
3. Ensure they are named exactly as listed
4. Refresh the application

## Testing Sounds

After adding sound files, test them by:
1. Go to `/lesson` page
2. Answer a question correctly (should play `correct.mp3`)
3. Answer a question incorrectly (should play `incorrect.mp3`)
4. Complete a lesson (should play `complete.mp3`)

The sound system can be toggled on/off by implementing a settings button in the UI that calls `soundManager.toggle()`.
