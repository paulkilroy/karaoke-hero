import { getClient } from "./client";

export { onlineConfigured } from "./client";

// One Supabase row per sing-off "room", keyed by a short shareable code. The
// whole match state lives in a jsonb `data` column and is pushed to both
// devices via Realtime. We never stream audio — both singers attempt the same
// seeded note sequence locally and only their per-note scores are synced.
// Friendly-game design (random codes, anon access) — same posture as Tongits.

export type RoomStatus = "waiting" | "singing" | "done";

export interface SingOffRoom {
  /** Shared seed → both singers get the identical note sequence. */
  seed: number;
  noteCount: number;
  names: { a: string; b: string };
  /** Per-note scores once a singer finishes; null until then. */
  scores: { a: number[] | null; b: number[] | null };
  status: RoomStatus;
  /** Bumped on every write so clients can ignore stale echoes. */
  version: number;
}

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no easily-confused chars

/** A short, shareable room code derived from a seed. */
export function makeCode(seed: number): string {
  let n = Math.abs(Math.floor(seed));
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += ALPHABET[n % ALPHABET.length];
    n = Math.floor(n / ALPHABET.length) + (i + 1) * 7;
  }
  return code;
}

function randomSeed(): number {
  return Math.floor(Math.random() * 1_000_000_000);
}

async function insertRoom(code: string, data: SingOffRoom): Promise<void> {
  const { error } = await getClient().from("singoffs").insert({ code, data });
  if (error) throw error;
}

export async function fetchRoom(code: string): Promise<SingOffRoom | null> {
  const { data, error } = await getClient()
    .from("singoffs")
    .select("data")
    .eq("code", code)
    .maybeSingle();
  if (error) throw error;
  return (data?.data as SingOffRoom) ?? null;
}

export async function pushRoom(code: string, data: SingOffRoom): Promise<void> {
  const { error } = await getClient()
    .from("singoffs")
    .update({ data })
    .eq("code", code);
  if (error) throw error;
}

/** Subscribe to live updates for a room. Returns an unsubscribe function. */
export function subscribeRoom(
  code: string,
  onData: (data: SingOffRoom) => void,
): () => void {
  const channel = getClient()
    .channel(`singoff:${code}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "singoffs",
        filter: `code=eq.${code}`,
      },
      (payload) => {
        const row = payload.new as { data?: SingOffRoom } | null;
        if (row?.data) onData(row.data);
      },
    )
    .subscribe();
  return () => {
    void getClient().removeChannel(channel);
  };
}

/** Host a new sing-off. Returns the room code to share. */
export async function createSingOff(
  hostName: string,
  noteCount: number,
): Promise<string> {
  const code = makeCode(randomSeed());
  const room: SingOffRoom = {
    seed: randomSeed(),
    noteCount,
    names: { a: hostName || "Player 1", b: "" },
    scores: { a: null, b: null },
    status: "waiting",
    version: 1,
  };
  await insertRoom(code, room);
  return code;
}

/** Join an existing sing-off by code. Returns the room, or null if not found. */
export async function joinSingOff(
  code: string,
  guestName: string,
): Promise<SingOffRoom | null> {
  const latest = await fetchRoom(code);
  if (!latest) return null;
  const merged: SingOffRoom = {
    ...latest,
    names: { ...latest.names, b: guestName || "Player 2" },
    status: "singing",
    version: latest.version + 1,
  };
  await pushRoom(code, merged);
  return merged;
}
