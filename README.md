# 🎤 Karaoke Hero

A karaoke-based singing trainer for the browser — get better at the songs you
love. Real-time pitch detection scores how accurately you sing; drills build
pitch accuracy, range, stability, and ear; **Sing-Off** mode turns it into a
two-player battle; song mode (coming) turns practice into play.

> Status: **Phase 1** — live pitch engine, a solo Pitch-Match drill, and a
> local two-player Sing-Off.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173 — allow microphone access
npm test           # engine unit tests (Vitest)
npm run typecheck
npm run build
```

Use headphones to stop the reference tone leaking into the mic.

## Modes

- **Practice** — solo pitch-match drill; hold each note in tune to clear it,
  build streaks and XP.
- **Sing-Off → Same device** — local hot-seat versus: two singers take turns on
  the *same* note sequence (deterministic from one seed), highest total wins.
- **Sing-Off → Online** — play a friend on another device via a room code. Both
  sing the same notes simultaneously; only scores sync (no audio streamed).
  Needs a free Supabase project — see [SETUP-ONLINE.md](SETUP-ONLINE.md). Without
  it, the offline modes still work fully.

## Architecture

Mirrors the layered, test-first structure of the sister `Tongits` project:
a pure engine core, an external-IO layer, and React hooks bridging them.

```
src/
├─ engine/      Pure logic — no DOM, no audio. 100% unit-tested.
│  ├─ music.ts        Hz ↔ MIDI ↔ note name ↔ cents
│  ├─ scoring.ts      grading, hold scoring, streak multiplier
│  ├─ exercises.ts    drill/target-sequence generators
│  └─ match.ts        versus model: seeded sequence, totals, winner, stars
├─ audio/       Browser side-effects (Web Audio API).
│  ├─ mic.ts         getUserMedia + pitchy (McLeod/YIN) → live pitch
│  └─ tone.ts        reference-tone playback
├─ online/      Optional Supabase sync (mirrors Tongits' online/ layer).
│  ├─ client.ts      Supabase client + onlineConfigured guard
│  └─ room.ts        sing-off room: create/join/fetch/push/subscribe
├─ ui/          React hooks + components bridging audio ↔ engine.
│  ├─ usePitch.ts        live mic pitch as React state
│  ├─ useNoteTracker.ts  shared hold-detection loop (solo + versus)
│  ├─ usePitchMatch.ts   solo drill: targets, scoring, XP, streaks
│  ├─ useSingTurn.ts     one singer's fixed-length scored run
│  ├─ useOnlineSingOff.ts mirror a match through a Supabase room (host/guest)
│  ├─ PitchMeter.tsx     note-ladder in-tune meter (octave each way)
│  ├─ ScoreCard.tsx      shared results card
│  ├─ PitchMatchGame.tsx solo screen
│  ├─ SingTurn.tsx       a versus turn screen
│  ├─ LocalSingOff.tsx   same-device versus flow
│  ├─ OnlineSingOff.tsx  online lobby + synced match
│  ├─ VersusGame.tsx     sing-off chooser (local / online)
│  └─ Home.tsx           mode picker
└─ App.tsx / main.tsx    shell + screen router
```

**Why this split:** all the musically-meaningful logic lives in `engine/` as
pure functions, so it's trivial to test and reuse. `match.ts` is deliberately
headless — the seam an **online (Supabase) Sing-Off** will later drive, exactly
like Tongits' `online/` layer drives its game engine.

## Stack

Vite · React 18 · TypeScript (strict) · Vitest · [`pitchy`](https://github.com/ianprime0509/pitchy)
for in-browser pitch detection. All client-side — audio never leaves the device.

## Roadmap

1. **Pitch Match warm-up + local & online Sing-Off** ← *you are here*
2. **Song mode (MIDI)** — scrolling note highway, sing-along scoring, stars &
   streaks. MIDI gives melody + harmony + backing without audio analysis.
3. **Range test + stability drills + progress charts** (the gamification spine)
4. **Harmony mode** — sing a harmony line against the melody (MIDI multi-track)
5. **Import your own MP3** — offline preprocess (Demucs source-separation →
   `basic-pitch` melody extraction → `.lrc` lyrics) feeding song mode.
