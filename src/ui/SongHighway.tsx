// Guitar-Hero-style singing: a horizontal pitch highway scrolls right→left past
// a fixed playhead. Note bars sit at their pitch; sing to keep your dot on the
// bar. Live pitch is sampled against the active note and scored at the end.

import { useEffect, useMemo, useRef, useState } from "react";
import { hzToMidi, midiToHz } from "../engine/music";
import { starsFor } from "../engine/match";
import {
  activeNoteAt,
  buildTimeline,
  centsForNote,
  scoreNote,
  songDurationMs,
  songPitchRange,
  songScore,
  type Song,
} from "../engine/song";
import { playTone } from "../audio/tone";
import { recordSession } from "../store/progress";
import { usePitch } from "./usePitch";

const VIEW_MS = 4000; // time window shown across the highway
const PLAYHEAD = 0.28; // playhead x position (fraction of width)
const ACCENT = "#8b5cf6";
const GREEN = "#22c55e";
const GRAY = "#475569";

type Status = "ready" | "countin" | "playing" | "done";

interface Result {
  total: number;
  stars: number;
}

export function SongHighway({
  song,
  onExit,
}: {
  song: Song;
  onExit: () => void;
}) {
  const { pitch, error, listening } = usePitch(true, { clarityThreshold: 0.88 });
  const pitchRef = useRef(pitch);
  pitchRef.current = pitch;

  const timeline = useMemo(() => buildTimeline(song), [song]);
  const duration = useMemo(() => songDurationMs(timeline), [timeline]);
  const range = useMemo(() => songPitchRange(song), [song]);

  const [status, setStatus] = useState<Status>("ready");
  const [count, setCount] = useState(3);
  const [guide, setGuide] = useState(true);
  const [result, setResult] = useState<Result | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef(0);
  const samplesRef = useRef<number[][]>([]);
  const guideRef = useRef(guide);
  guideRef.current = guide;

  function begin() {
    samplesRef.current = timeline.map(() => []);
    setResult(null);
    setCount(3);
    setStatus("countin");
  }

  // count-in
  useEffect(() => {
    if (status !== "countin") return;
    const beatMs = 60000 / song.bpm;
    let c = 3;
    const id = setInterval(() => {
      c -= 1;
      if (c <= 0) {
        clearInterval(id);
        setStatus("playing");
      } else {
        setCount(c);
      }
    }, beatMs);
    return () => clearInterval(id);
  }, [status, song.bpm]);

  // play loop
  useEffect(() => {
    if (status !== "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.scale(dpr, dpr);

    const lo = range.min - 3;
    const hi = range.max + 3;
    const yFor = (midi: number) =>
      16 + ((hi - midi) / (hi - lo)) * (cssH - 32);
    const pxPerMs = cssW / VIEW_MS;
    const playheadX = cssW * PLAYHEAD;

    const start = performance.now();
    let lastIdx = -1;

    const draw = (t: number) => {
      ctx.clearRect(0, 0, cssW, cssH);

      const active = activeNoteAt(timeline, t);
      const p = pitchRef.current;
      const hitting =
        active && p && Math.abs(centsForNote(p.hz, active.midi)) <= 60;

      // note bars
      for (const note of timeline) {
        const xs = playheadX + (note.start - t) * pxPerMs;
        const xe = playheadX + (note.end - t) * pxPerMs;
        if (xe < -4 || xs > cssW + 4) continue;
        const y = yFor(note.midi);
        const isActive = t >= note.start && t < note.end;
        const passed = note.end <= t;
        ctx.fillStyle = isActive
          ? hitting
            ? GREEN
            : "#a78bfa"
          : passed
            ? GRAY
            : ACCENT;
        roundRect(ctx, xs, y - 7, Math.max(6, xe - xs - 3), 14, 7);
        ctx.fill();
        if (note.lyric && !passed) {
          ctx.fillStyle = "#cbd5e1";
          ctx.font = "12px system-ui, sans-serif";
          ctx.fillText(note.lyric, xs, y + 24);
        }
      }

      // playhead
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadX, 8);
      ctx.lineTo(playheadX, cssH - 8);
      ctx.stroke();

      // live pitch dot
      if (p) {
        const lm = hzToMidi(p.hz);
        if (lm >= lo && lm <= hi) {
          ctx.fillStyle = hitting ? GREEN : "#f8fafc";
          ctx.beginPath();
          ctx.arc(playheadX, yFor(lm), 9, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const finish = () => {
      const scores = timeline.map((n) => scoreNote(samplesRef.current[n.index] ?? []));
      const total = songScore(scores);
      recordSession("song", total, scores.length, Date.now());
      setResult({ total, stars: starsFor(scores) });
      setStatus("done");
    };

    const loop = () => {
      const t = performance.now() - start;

      const active = activeNoteAt(timeline, t);
      if (active && guideRef.current && active.index !== lastIdx) {
        lastIdx = active.index;
        playTone(midiToHz(active.midi), Math.min(900, active.end - active.start));
      }
      const p = pitchRef.current;
      if (p && active) {
        samplesRef.current[active.index]?.push(centsForNote(p.hz, active.midi));
      }

      draw(t);

      if (t > duration + 600) {
        finish();
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [status, timeline, duration, range, song]);

  if (error) {
    return (
      <div className="start">
        <h2>Microphone unavailable</h2>
        <p className="error">{error}</p>
        <button className="btn" onClick={onExit}>
          Back
        </button>
      </div>
    );
  }

  if (status === "ready") {
    return (
      <div className="start">
        <h2>🎵 {song.title}</h2>
        {song.composer && <p className="hint">{song.composer}</p>}
        <p>
          Notes scroll to the line — sing to keep your dot on each bar. 🎧
          Headphones recommended so the mic doesn’t hear the guide.
        </p>
        <label className="toggle">
          <input
            type="checkbox"
            checked={guide}
            onChange={(e) => setGuide(e.target.checked)}
          />{" "}
          Play guide melody
        </label>
        <div className="controls">
          <button className="btn btn--primary" onClick={begin}>
            🎤 Start
          </button>
          <button className="btn" onClick={onExit}>
            Back
          </button>
        </div>
      </div>
    );
  }

  if (status === "done" && result) {
    return (
      <div className="results">
        <h2>🎵 {song.title}</h2>
        <div className="song-stars">
          {"★".repeat(result.stars)}
          <span className="scorecard__stars-dim">
            {"★".repeat(3 - result.stars)}
          </span>
        </div>
        <div className="scorecard__total">{result.total}</div>
        <p className="hint">accuracy</p>
        <div className="controls">
          <button className="btn btn--primary" onClick={begin}>
            🔁 Sing again
          </button>
          <button className="btn" onClick={onExit}>
            Back
          </button>
        </div>
      </div>
    );
  }

  // countin / playing
  return (
    <div className="song">
      <div className="song__head">
        <span>🎵 {song.title}</span>
        {!listening && <span className="hint">starting mic…</span>}
      </div>
      <div className="song__stage">
        <canvas ref={canvasRef} className="song__canvas" />
        {status === "countin" && <div className="song__count">{count}</div>}
      </div>
      <div className="controls">
        <button className="btn" onClick={onExit}>
          ⏹ Stop
        </button>
      </div>
    </div>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
