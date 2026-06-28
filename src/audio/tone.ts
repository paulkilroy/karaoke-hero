// Reference-tone playback. A tiny Web Audio sine player so the drill can
// demonstrate the target pitch. (Tone.js arrives in Phase 2 for MIDI songs.)

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function nowMs(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

// Without echo-cancellation (which would warp pitch) the mic can hear the
// reference tone from the speakers. We mark a guard window while any tone is
// sounding (+ a short tail for room/speaker decay) so pitch tracking can ignore
// input that's really the speaker, not the singer.
let guardUntil = 0;
const GUARD_TAIL_MS = 180;

function extendGuard(durationMs: number): void {
  guardUntil = Math.max(guardUntil, nowMs() + durationMs + GUARD_TAIL_MS);
}

/** True while a reference tone is (or was just) sounding. */
export function toneGuardActive(): boolean {
  return nowMs() < guardUntil;
}

/** Play a short, gently-enveloped sine at `hz` for `durationMs`. */
export function playTone(hz: number, durationMs = 1000): void {
  const audio = getCtx();
  void audio.resume();
  extendGuard(durationMs);

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

/** Play a smooth pitch glide from one frequency to another (for siren drills). */
export function playGlide(fromHz: number, toHz: number, durationMs = 2400): void {
  const audio = getCtx();
  void audio.resume();

  const now = audio.currentTime;
  const end = now + durationMs / 1000;

  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(fromHz, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, toHz), end);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
  gain.gain.setValueAtTime(0.18, end - 0.1);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(gain).connect(audio.destination);
  osc.start(now);
  osc.stop(end + 0.02);
}
