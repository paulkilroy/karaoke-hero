// Tiny dependency-free SVG charts for the Progress screen.

import { midiToNoteName } from "../engine/music";
import { type RangeEntry } from "../store/progress";

/** Circular progress ring with two lines of centred text. */
export function ProgressRing({
  fraction,
  top,
  bottom,
  color = "#8b5cf6",
}: {
  fraction: number;
  top: string;
  bottom: string;
  color?: string;
}) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.max(0, Math.min(1, fraction));
  return (
    <svg viewBox="0 0 130 130" className="ring" role="img">
      <circle cx="65" cy="65" r={r} fill="none" stroke="#334155" strokeWidth="12" />
      <circle
        cx="65"
        cy="65"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`}
        transform="rotate(-90 65 65)"
      />
      <text x="65" y="60" textAnchor="middle" className="ring__top">
        {top}
      </text>
      <text x="65" y="84" textAnchor="middle" className="ring__bottom">
        {bottom}
      </text>
    </svg>
  );
}

/** Skill radar (spider) chart. Values 0..1. */
export function RadarChart({
  axes,
}: {
  axes: { label: string; value: number }[];
}) {
  const cx = 80;
  const cy = 78;
  const R = 52;
  const n = axes.length;
  const point = (i: number, val: number): [number, number] => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return [cx + Math.cos(a) * R * val, cy + Math.sin(a) * R * val];
  };
  const poly = axes
    .map((ax, i) => point(i, Math.max(0.03, Math.min(1, ax.value))).join(","))
    .join(" ");

  return (
    <svg viewBox="0 0 160 160" className="radar" role="img">
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <polygon
          key={g}
          points={axes.map((_, i) => point(i, g).join(",")).join(" ")}
          fill="none"
          stroke="#334155"
          strokeWidth="1"
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = point(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#334155" />;
      })}
      <polygon
        points={poly}
        fill="rgba(139,92,246,0.35)"
        stroke="#8b5cf6"
        strokeWidth="2"
      />
      {axes.map((ax, i) => {
        const [x, y] = point(i, 1.18);
        return (
          <text
            key={ax.label}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="radar__label"
          >
            {ax.label}
          </text>
        );
      })}
    </svg>
  );
}

/** Range over time: low & high note lines with the span shaded between. */
export function RangeBandChart({ history }: { history: RangeEntry[] }) {
  if (history.length === 0) return null;
  const W = 300;
  const H = 150;
  const pad = 28;
  const notes = history.flatMap((h) => [h.low, h.high]);
  const minN = Math.min(...notes) - 2;
  const maxN = Math.max(...notes) + 2;
  const span = Math.max(1, maxN - minN);
  const x = (i: number) =>
    history.length === 1
      ? W / 2
      : pad + (i / (history.length - 1)) * (W - 2 * pad);
  const y = (n: number) => H - pad - ((n - minN) / span) * (H - 2 * pad);

  const highPts = history.map((h, i) => `${x(i)},${y(h.high)}`);
  const lowPts = history.map((h, i) => `${x(i)},${y(h.low)}`);
  const band = [...highPts, ...[...lowPts].reverse()].join(" ");
  const last = history[history.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img">
      <polygon points={band} fill="rgba(139,92,246,0.18)" />
      <polyline
        points={highPts.join(" ")}
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2.5"
      />
      <polyline
        points={lowPts.join(" ")}
        fill="none"
        stroke="#38bdf8"
        strokeWidth="2.5"
      />
      {history.map((h, i) => (
        <g key={i}>
          <circle cx={x(i)} cy={y(h.high)} r="3" fill="#f59e0b" />
          <circle cx={x(i)} cy={y(h.low)} r="3" fill="#38bdf8" />
        </g>
      ))}
      <text x={x(history.length - 1)} y={y(last.high) - 8} textAnchor="end" className="chart__tag" fill="#f59e0b">
        {midiToNoteName(last.high)}
      </text>
      <text x={x(history.length - 1)} y={y(last.low) + 16} textAnchor="end" className="chart__tag" fill="#38bdf8">
        {midiToNoteName(last.low)}
      </text>
    </svg>
  );
}

/** Accuracy over sessions, 0..100. */
export function AccuracyChart({ values }: { values: number[] }) {
  if (values.length === 0) return null;
  const W = 300;
  const H = 120;
  const pad = 22;
  const x = (i: number) =>
    values.length === 1 ? W / 2 : pad + (i / (values.length - 1)) * (W - 2 * pad);
  const y = (v: number) => H - pad - (v / 100) * (H - 2 * pad);
  const pts = values.map((v, i) => `${x(i)},${y(v)}`);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img">
      {[0, 50, 100].map((g) => (
        <line key={g} x1={pad} y1={y(g)} x2={W - pad} y2={y(g)} stroke="#334155" strokeWidth="1" />
      ))}
      <polyline points={pts.join(" ")} fill="none" stroke="#22c55e" strokeWidth="2.5" />
      {values.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r="3" fill="#22c55e" />
      ))}
    </svg>
  );
}
