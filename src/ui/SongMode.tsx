// Song picker → Guitar-Hero-style singing.

import { useState } from "react";
import { SONGS } from "../engine/songs";
import { SongHighway } from "./SongHighway";

export function SongMode({ onExit }: { onExit: () => void }) {
  const [songId, setSongId] = useState<string | null>(null);
  const song = SONGS.find((s) => s.id === songId);

  if (song) return <SongHighway song={song} onExit={() => setSongId(null)} />;

  return (
    <div className="home">
      <p className="home__lead">Songs</p>
      <div className="modes modes--grid">
        {SONGS.map((s) => (
          <button
            key={s.id}
            className="mode-card"
            onClick={() => setSongId(s.id)}
          >
            <div className="mode-card__icon">🎵</div>
            <div className="mode-card__title">{s.title}</div>
            <div className="mode-card__desc">{s.composer ?? ""}</div>
          </button>
        ))}
      </div>
      <p className="hint">
        More songs coming — and you’ll be able to import your own.
      </p>
      <div className="controls">
        <button className="btn" onClick={onExit}>
          Back
        </button>
      </div>
    </div>
  );
}
