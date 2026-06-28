// Reference-tone playback. A tiny Web Audio sine player so the drill can
// demonstrate the target pitch. (Tone.js arrives in Phase 2 for MIDI songs.)

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

/** Play a short, gently-enveloped sine at `hz` for `durationMs`. */
export function playTone(hz: number, durationMs = 1000): void {
  const audio = getCtx();
  void audio.resume();

  const now = audio.currentTime;
  const end = now + durationMs / 1000;

  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.value = hz;

  // attack / release to avoid clicks
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
  gain.gain.setValueAtTime(0.2, end - 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(end + 0.02);
}
