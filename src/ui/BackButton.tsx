// Standard back button + screen title bar, consistent across every screen
// (mirrors the Tongits convention: a circular back arrow, top-left).

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="back-btn" onClick={onClick} aria-label="Back">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    </button>
  );
}

/** Top-of-screen bar: back button + optional title. Put it first in a screen. */
export function ScreenTop({
  onBack,
  title,
}: {
  onBack: () => void;
  title?: string;
}) {
  return (
    <div className="screen-top">
      <BackButton onClick={onBack} />
      {title && <span className="screen-top__title">{title}</span>}
    </div>
  );
}
