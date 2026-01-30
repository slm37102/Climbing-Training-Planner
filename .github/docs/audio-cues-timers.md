# Audio Cues for Timers

## Status: 🔲 Not Started
## Clarification: ✅ CLARIFIED

## Decisions Made
| Question | Answer |
|----------|--------|
| Sound Types | Beeps only (simple tones, minimal) |
| When to Play | Phase transitions + Rep/Set completion |
| Default Setting | On by default |
| Volume Control | System volume only |
| Rest Timer Audio | Yes, beep when done |

## Overview
Add audio feedback to timers in addition to vibration. Essential for when phone is not in hand (e.g., during hangboard training).

## Requirements

### Audio Events
| Event | Sound Type | Notes |
|-------|------------|-------|
| Work phase start | Beep / "Go" | Clear, motivating |
| Rest phase start | Different tone | Distinguishable from work |
| Set complete | Success chime | Celebrate completion |
| Countdown (3-2-1) | Short beeps | Prepare for next phase |
| Session complete | Longer celebration | All sets done |

### User Preferences
- [ ] Global mute toggle in settings
- [ ] Volume control (or use device volume)
- [ ] Option to use vibration only, audio only, or both

## Technical Approach

### Option A: Web Audio API (Recommended)
```typescript
// Generate tones programmatically
const audioContext = new AudioContext();
const playBeep = (frequency: number, duration: number) => {
  const oscillator = audioContext.createOscillator();
  oscillator.frequency.value = frequency;
  oscillator.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
};
```
**Pros:** No audio files needed, small bundle size, customizable
**Cons:** Requires user interaction to unlock AudioContext on mobile

### Option B: Audio Files
- Store small MP3/WAV files in `/public/sounds/`
- Use `<audio>` element or `new Audio()` API

**Pros:** More control over exact sounds
**Cons:** Larger bundle, need to source/create sounds

## Implementation Steps

1. [ ] Create `useAudio` hook or audio utility
2. [ ] Add audio settings to `UserSettings` type
3. [ ] Integrate with SessionTracker interval timer
4. [ ] Integrate with rest timer
5. [ ] Add settings UI toggle
6. [ ] Test on mobile (AudioContext unlock)

## Files to Modify
- `types.ts` - Add `audioEnabled`, `audioVolume` to UserSettings
- `pages/SessionTracker.tsx` - Trigger audio on timer events
- `context/StoreContext.tsx` - Persist audio settings
- New: `hooks/useAudio.ts` or `utils/audio.ts`

## Edge Cases
- Mobile browser AudioContext restrictions (need user gesture)
- Background tab audio (may be throttled)
- Silent mode on device
