// React hook: mirror a sing-off through a Supabase room. Both players run this.
// Realtime is the fast path; a slow poll guarantees both converge even if an
// event is missed (same safety net as Tongits' useOnlineMatch).

import { useCallback, useEffect, useRef, useState } from "react";
import {
  type SingOffRoom,
  fetchRoom,
  pushRoom,
  subscribeRoom,
} from "../online/room";

export type Role = "a" | "b";

function randomSeed(): number {
  return Math.floor(Math.random() * 1_000_000_000);
}

export function useOnlineSingOff(code: string, role: Role) {
  const [room, setRoom] = useState<SingOffRoom | null>(null);
  const [connected, setConnected] = useState(false);
  const versionRef = useRef(0);

  const applyIncoming = useCallback((d: SingOffRoom) => {
    if (d.version < versionRef.current) return; // ignore stale echoes
    versionRef.current = d.version;
    setRoom(d);
  }, []);

  const write = useCallback(
    (base: SingOffRoom, patch: Partial<SingOffRoom>) => {
      const next: SingOffRoom = { ...base, ...patch, version: base.version + 1 };
      versionRef.current = next.version;
      setRoom(next);
      void pushRoom(code, next).catch((e) => console.error("pushRoom failed", e));
    },
    [code],
  );

  useEffect(() => {
    let active = true;
    const unsub = subscribeRoom(code, applyIncoming);
    setConnected(true);
    const pull = () =>
      void fetchRoom(code)
        .then((d) => {
          if (active && d) applyIncoming(d);
        })
        .catch((e) => console.error("fetchRoom failed", e));
    pull();
    const poll = setInterval(pull, 2500);
    return () => {
      active = false;
      unsub();
      clearInterval(poll);
    };
  }, [code, applyIncoming]);

  // Submit my finished scores. Re-fetch first and merge so we don't clobber the
  // opponent's field if they wrote near-simultaneously.
  const submitScores = useCallback(
    async (scores: number[]) => {
      const latest = (await fetchRoom(code)) ?? room;
      if (!latest) return;
      const nextScores = { ...latest.scores, [role]: scores };
      const bothDone = nextScores.a != null && nextScores.b != null;
      write(latest, {
        scores: nextScores,
        status: bothDone ? "done" : latest.status,
      });
    },
    [code, role, room, write],
  );

  // Host starts a fresh round (new seed, scores cleared).
  const rematch = useCallback(async () => {
    const latest = (await fetchRoom(code)) ?? room;
    if (!latest) return;
    write(latest, {
      seed: randomSeed(),
      scores: { a: null, b: null },
      status: "singing",
    });
  }, [code, room, write]);

  return { room, connected, role, submitScores, rematch };
}
