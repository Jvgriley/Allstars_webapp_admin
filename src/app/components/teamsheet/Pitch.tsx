// The playing surface — genuinely sport-driven. Nothing football- or
// rugby-specific lives here; the caller decides what markings to draw via
// `sport`, and every player marker is positioned by percentage coordinates
// (see FormationSlot in domain/sportConfigs.ts), so any future sport with a
// rectangular surface (hockey, lacrosse, netball…) reuses this unchanged.
import type { ReactNode } from "react";
import type { SportKey } from "../../../domain/sportConfigs";
import { cx } from "../primitives";

export function Pitch({ sport, children, className }: { sport: SportKey; children: ReactNode; className?: string }) {
  return (
    <div
      className={cx("relative w-full overflow-hidden rounded-2xl border border-border shadow-inner", className)}
      style={{ aspectRatio: sport === "rugby" ? "5 / 7" : "68 / 100", background: "linear-gradient(180deg, #1f7a3d 0%, #24893f 55%, #1f7a3d 100%)" }}
    >
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "repeating-linear-gradient(180deg, #fff 0, #fff 1px, transparent 1px, transparent 12%)" }}
      />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <rect x="2" y="2" width="96" height="96" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.5" />
        {sport === "football" ? (
          <>
            <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" />
            <circle cx="50" cy="50" r="9" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" />
            <rect x="26" y="2" width="48" height="14" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" />
            <rect x="26" y="84" width="48" height="14" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.4" />
          </>
        ) : (
          <>
            <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.4)" strokeWidth="0.4" />
            <line x1="2" y1="22" x2="98" y2="22" stroke="rgba(255,255,255,0.35)" strokeWidth="0.35" strokeDasharray="1.5,1.5" />
            <line x1="2" y1="78" x2="98" y2="78" stroke="rgba(255,255,255,0.35)" strokeWidth="0.35" strokeDasharray="1.5,1.5" />
            <line x1="2" y1="6" x2="98" y2="6" stroke="rgba(255,255,255,0.6)" strokeWidth="0.6" />
            <line x1="2" y1="94" x2="98" y2="94" stroke="rgba(255,255,255,0.6)" strokeWidth="0.6" />
          </>
        )}
      </svg>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}

/**
 * Positions a player marker at formation-slot coordinates. Domain
 * convention: y=0 is a team's own goal/try-line, y=100 is the attacking
 * end — this is the one place that gets flipped for display, so the team
 * reads bottom-to-top (own goal near the viewer) like a broadcast graphic.
 */
export function SlotAnchor({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${100 - y}%` }}>
      {children}
    </div>
  );
}
