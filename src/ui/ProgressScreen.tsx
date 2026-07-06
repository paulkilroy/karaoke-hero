// Progress & proficiency: CEFR-style level ring, skill radar, range-over-time
// and accuracy trends — all from locally-stored history.

import { useState } from "react";
import { midiToNoteName } from "../engine/music";
import { classifyVoice } from "../engine/range";
import { levelProgress } from "../engine/level";
import {
  loadProgress,
  summarize,
  resetProgress,
  type ProgressStats,
} from "../store/progress";
import {
  ProgressRing,
  RadarChart,
  RangeBandChart,
  AccuracyChart,
} from "./charts";
import { RangeTest } from "./RangeTest";

export function ProgressScreen({ onExit }: { onExit: () => void }) {
  const [progress, setProgress] = useState(() => loadProgress());
  const [testing, setTesting] = useState(false);
  const stats: ProgressStats = summarize(progress);

  const lp = levelProgress({
    rangeSemitones: stats.rangeSemitones,
    accuracy: stats.bestAccuracy,
  });

  // Range Test lives under Progress (it's an assessment, not a daily drill).
  if (testing) {
    return (
      <RangeTest
        onExit={() => {
          setProgress(loadProgress());
          setTesting(false);
        }}
      />
    );
  }

  const hasData = stats.totalSessions > 0 || stats.range != null;

  if (!hasData) {
    return (
      <div className="start">
        <h2>📈 Your Progress</h2>
        <p>
          Nothing tracked yet. Take a <strong>Range Test</strong> and do a few{" "}
          <strong>Daily Drills</strong> — your level, range growth and accuracy
          will chart here.
        </p>
        <div className="controls">
          <button className="btn btn--primary" onClick={() => setTesting(true)}>
            🎚 Take Range Test
          </button>
          <button className="btn" onClick={onExit}>
            Back
          </button>
        </div>
      </div>
    );
  }

  const accuracyHistory = progress.sessions
    .filter((s) => ["practice", "creeping-scale", "edge-stretch"].includes(s.type))
    .map((s) => s.avgScore);

  const radar = [
    { label: "Pitch", value: stats.bestAccuracy / 100 },
    { label: "Range", value: Math.min(1, stats.rangeSemitones / 30) },
    { label: "Reps", value: Math.min(1, stats.totalSessions / 20) },
    { label: "Volume", value: Math.min(1, stats.totalNotes / 200) },
  ];

  function reset() {
    if (confirm("Reset all saved progress? This can't be undone.")) {
      resetProgress();
      setProgress(loadProgress());
    }
  }

  return (
    <div className="progress">
      <h2 className="progress__h">📈 Your Progress</h2>

      <div className="controls">
        <button className="btn btn--primary" onClick={() => setTesting(true)}>
          🎚 {stats.range ? "Re-test range" : "Take range test"}
        </button>
      </div>

      {/* Level */}
      <div className="panel level-panel">
        <ProgressRing
          fraction={lp.fraction}
          top={lp.current.cefr}
          bottom={lp.next ? `${Math.round(lp.fraction * 100)}%` : "MAX"}
        />
        <div className="level-info">
          <div className="level-name">{lp.current.name}</div>
          <div className="level-blurb">{lp.current.blurb}</div>
          <div className="level-grade">≈ {lp.current.grade}</div>
          {lp.next ? (
            <div className="level-next">
              <strong>Next: {lp.next.name} ({lp.next.cefr})</strong>
              <Gate
                label="Range"
                ok={stats.rangeSemitones >= lp.next.gate.rangeSemitones}
                now={`${(stats.rangeSemitones / 12).toFixed(1)} oct`}
                need={`${(lp.next.gate.rangeSemitones / 12).toFixed(1)} oct`}
              />
              <Gate
                label="Accuracy"
                ok={stats.bestAccuracy >= lp.next.gate.accuracy}
                now={`${Math.round(stats.bestAccuracy)}`}
                need={`${lp.next.gate.accuracy}`}
              />
            </div>
          ) : (
            <div className="level-next">🏆 Top band reached!</div>
          )}
        </div>
      </div>

      {/* Skill radar */}
      <div className="panel">
        <div className="panel__title">Skill profile</div>
        <RadarChart axes={radar} />
      </div>

      {/* Range over time */}
      {progress.rangeHistory.length > 0 && (
        <div className="panel">
          <div className="panel__title">
            Range over time
            {stats.range && (
              <span className="panel__sub">
                {" "}
                {midiToNoteName(stats.range.low)}–{midiToNoteName(stats.range.high)}
                {(() => {
                  const v = classifyVoice(stats.range!);
                  return v !== "Unknown" ? ` · ${v}` : "";
                })()}
              </span>
            )}
          </div>
          <RangeBandChart history={progress.rangeHistory} />
          <div className="legend">
            <span className="legend__dot legend__dot--high" /> top
            <span className="legend__dot legend__dot--low" /> bottom
          </div>
        </div>
      )}

      {/* Accuracy trend */}
      {accuracyHistory.length > 0 && (
        <div className="panel">
          <div className="panel__title">
            Accuracy trend
            <span className="panel__sub"> best {Math.round(stats.bestAccuracy)}</span>
          </div>
          <AccuracyChart values={accuracyHistory} />
        </div>
      )}

      <div className="statline">
        {stats.totalSessions} sessions · {stats.totalNotes} notes sung
      </div>

      <div className="controls">
        <button className="btn" onClick={onExit}>
          Back
        </button>
        <button className="btn" onClick={reset}>
          Reset progress
        </button>
      </div>
    </div>
  );
}

function Gate({
  label,
  ok,
  now,
  need,
}: {
  label: string;
  ok: boolean;
  now: string;
  need: string;
}) {
  return (
    <div className={`gate${ok ? " gate--ok" : ""}`}>
      <span className="gate__icon">{ok ? "✓" : "○"}</span>
      <span className="gate__label">{label}</span>
      <span className="gate__vals">
        {now} / {need}
      </span>
    </div>
  );
}
