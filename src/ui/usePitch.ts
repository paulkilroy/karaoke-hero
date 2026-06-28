// React hook: stream the live detected pitch from the microphone.

import { useEffect, useState } from "react";
import { startMic, type LivePitch, type MicOptions } from "../audio/mic";

export interface UsePitchResult {
  pitch: LivePitch | null;
  error: string | null;
  /** True once the mic stream is running. */
  listening: boolean;
}

/** Start/stop the mic with `active`. Cleans up on unmount or toggle. */
export function usePitch(active: boolean, opts?: MicOptions): UsePitchResult {
  const [pitch, setPitch] = useState<LivePitch | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    if (!active) return;

    let stop: (() => void) | undefined;
    let cancelled = false;

    startMic((p) => setPitch(p), opts)
      .then((s) => {
        if (cancelled) s();
        else {
          stop = s;
          setListening(true);
        }
      })
      .catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));

    return () => {
      cancelled = true;
      setListening(false);
      setPitch(null);
      stop?.();
    };
    // opts is intentionally not a dep — pass a stable object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return { pitch, error, listening };
}
