// Microphone capture + real-time pitch detection (McLeod/YIN via `pitchy`).
// Browser-only. Emits a live pitch estimate each animation frame.

import { PitchDetector } from "pitchy";

export interface LivePitch {
  hz: number;
  /** 0..1 confidence from the detector. */
  clarity: number;
}

export interface MicOptions {
  /** Reject estimates below this confidence (default 0.9). */
  clarityThreshold?: number;
  /** Plausible vocal range gate in Hz (default 70–1100). */
  minHz?: number;
  maxHz?: number;
}

/** A function that tears down the mic + audio graph. */
export type StopMic = () => void;

/**
 * Start listening. Calls `onPitch` with a LivePitch when a confident voiced
 * frame is detected, or `null` when silent/unvoiced. Returns a stop function.
 */
export async function startMic(
  onPitch: (pitch: LivePitch | null) => void,
  opts: MicOptions = {},
): Promise<StopMic> {
  const clarityThreshold = opts.clarityThreshold ?? 0.9;
  const minHz = opts.minHz ?? 70;
  const maxHz = opts.maxHz ?? 1100;

  const ctx = new AudioContext();
  // Disable processing that mangles pitch.
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
    },
  });

  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  source.connect(analyser);

  const detector = PitchDetector.forFloat32Array(analyser.fftSize);
  const buffer = new Float32Array(detector.inputLength);

  let raf = 0;
  let stopped = false;

  const loop = () => {
    if (stopped) return;
    analyser.getFloatTimeDomainData(buffer);
    const [hz, clarity] = detector.findPitch(buffer, ctx.sampleRate);
    if (clarity >= clarityThreshold && hz >= minHz && hz <= maxHz) {
      onPitch({ hz, clarity });
    } else {
      onPitch(null);
    }
    raf = requestAnimationFrame(loop);
  };

  // Resume in case the context starts suspended (autoplay policies).
  await ctx.resume();
  loop();

  return () => {
    stopped = true;
    cancelAnimationFrame(raf);
    stream.getTracks().forEach((t) => t.stop());
    void ctx.close();
  };
}
