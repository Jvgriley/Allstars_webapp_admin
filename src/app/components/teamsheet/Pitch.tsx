// The playing surface — genuinely sport-driven. Nothing sport-specific
// lives here; the caller decides what markings to draw via `surface` (from
// SportConfig.surface, see domain/sportConfigs.ts), and every player
// marker is positioned by percentage coordinates (see FormationSlot), so
// any future formation-based sport with a rectangular surface reuses this
// unchanged by adding one more `surface` case.
//
// Sprint 4 — generalised from a `sport: SportKey` prop (which only ever
// distinguished "football" vs "everything else, drawn like rugby") to a
// `surface: SurfaceKind` prop so Basketball gets a genuine court rather
// than a green pitch, and Rugby/Hockey get their own markings rather than
// sharing football's. Football's and Rugby Union's existing markings and
// aspect ratios are pixel-identical to Sprint 3 — only new `surface` cases
// were added.
import type { ReactNode } from "react";
import type { SurfaceKind } from "../../../domain/sportConfigs";
import { cx } from "../primitives";

const aspectRatio: Record<SurfaceKind, string> = {
  "football-pitch": "68 / 100",
  "rugby-pitch": "5 / 7",
  "basketball-court": "5 / 8",
  "hockey-pitch": "60 / 100",
  none: "68 / 100",
  // Sprint 5 — a rowing boat is a narrow lane, not a rectangular
  // pitch/court, so it gets a genuinely different (tall, thin) aspect
  // ratio rather than reusing one of the above.
  "rowing-boat": "28 / 100",
};

const background: Record<SurfaceKind, string> = {
  "football-pitch": "linear-gradient(180deg, #1f7a3d 0%, #24893f 55%, #1f7a3d 100%)",
  "rugby-pitch": "linear-gradient(180deg, #1f7a3d 0%, #24893f 55%, #1f7a3d 100%)",
  "basketball-court": "linear-gradient(180deg, #c9873f 0%, #dc9a52 55%, #c9873f 100%)",
  "hockey-pitch": "linear-gradient(180deg, #1c6e8c 0%, #22809f 55%, #1c6e8c 100%)",
  none: "linear-gradient(180deg, #1f7a3d 0%, #24893f 55%, #1f7a3d 100%)",
  "rowing-boat": "linear-gradient(180deg, #0d4f73 0%, #12628e 55%, #0d4f73 100%)",
};

export function Pitch({ surface, children, className }: { surface: SurfaceKind; children: ReactNode; className?: string }) {
  return (
    <div
      className={cx("relative w-full overflow-hidden rounded-2xl border border-border shadow-inner", className)}
      style={{ aspectRatio: aspectRatio[surface], background: background[surface] }}
    >
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "repeating-linear-gradient(180deg, #fff 0, #fff 1px, transparent 1px, transparent 12%)" }}
      />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <rect x="2" y="2" width="96" height="96" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.5" />
        {surface === "football-pitch" && (
          <>
            <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" />
            <circle cx="50" cy="50" r="9" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" />
            <rect x="26" y="2" width="48" height="14" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" />
            <rect x="26" y="84" width="48" height="14" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" />
          </>
        )}
        {surface === "rugby-pitch" && (
          <>
            <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
            <line x1="2" y1="22" x2="98" y2="22" stroke="rgba(255,255,255,0.35)" strokeWidth="0.35" strokeDasharray="1.5,1.5" />
            <line x1="2" y1="78" x2="98" y2="78" stroke="rgba(255,255,255,0.35)" strokeWidth="0.35" strokeDasharray="1.5,1.5" />
            <line x1="2" y1="6" x2="98" y2="6" stroke="rgba(255,255,255,0.6)" strokeWidth="0.6" />
            <line x1="2" y1="94" x2="98" y2="94" stroke="rgba(255,255,255,0.6)" strokeWidth="0.6" />
          </>
        )}
        {surface === "basketball-court" && (
          <>
            <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.45)" strokeWidth="0.4" />
            <circle cx="50" cy="50" r="7" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.4" />
            {/* Paint / key, one basket at each end */}
            <rect x="34" y="2" width="32" height="19" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" />
            <rect x="34" y="79" width="32" height="19" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" />
            <circle cx="50" cy="21" r="6" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.35" />
            <circle cx="50" cy="79" r="6" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.35" />
            {/* Three-point arcs */}
            <path d="M 12 2 A 38 38 0 0 0 88 2" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.35" />
            <path d="M 12 98 A 38 38 0 0 1 88 98" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.35" />
          </>
        )}
        {surface === "hockey-pitch" && (
          <>
            <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.45)" strokeWidth="0.4" />
            <line x1="2" y1="25" x2="98" y2="25" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" strokeDasharray="1.2,1.2" />
            <line x1="2" y1="75" x2="98" y2="75" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" strokeDasharray="1.2,1.2" />
            {/* Shooting circles ("the D") at each end */}
            <path d="M 27 2 A 23 16 0 0 0 73 2" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.4" />
            <path d="M 27 98 A 23 16 0 0 1 73 98" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.4" />
          </>
        )}
        {surface === "rowing-boat" && (
          <>
            {/* The boat's hull as a narrow lane, bow at the top, stroke/cox at the bottom (matches SlotAnchor's y-flip convention). */}
            <line x1="50" y1="2" x2="50" y2="98" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" strokeDasharray="1.2,1.2" />
            <path d="M 38 2 Q 50 -4 62 2 L 62 90 Q 62 97 50 99 Q 38 97 38 90 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />
          </>
        )}
      </svg>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}

/**
 * Positions a player marker at formation-slot coordinates. Domain
 * convention: y=0 is a team's own goal/try-line/baseline, y=100 is the
 * attacking end — this is the one place that gets flipped for display, so
 * the team reads bottom-to-top (own goal near the viewer) like a broadcast
 * graphic.
 */
export function SlotAnchor({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${100 - y}%` }}>
      {children}
    </div>
  );
}
