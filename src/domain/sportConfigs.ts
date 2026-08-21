// Sport configuration registry — Sprint 3 (Team Selection / Team Sheets).
//
// This is the whole point of the multi-sport architecture: nothing in the
// Team Sheet UI or service layer knows anything specific to football or
// rugby. Every sport-shaped detail — what positions exist, where they sit
// on the surface, how many starters/substitutes, what the surface and bench
// are called — lives here as data. Adding a new sport is adding a new
// SportConfig entry, not writing a new component.
//
// Coordinates are percentages of the surface (0–100 on both axes), with
// y=0 at a team's own goal/try-line and y=100 at the attacking end — the
// same convention regardless of sport, so <Pitch/> can render any of them
// with one layout algorithm.

export type SportKey = "football" | "rugby";

/** Scoped to a single SportConfig — never compared across sports. */
export type PositionKey = string;

export type SportPosition = {
  key: PositionKey;
  label: string;
  shortLabel: string;
};

export type FormationSlot = {
  slotId: string;
  position: PositionKey;
  x: number;
  y: number;
};

export type SportFormation = {
  id: string;
  label: string;
  slots: FormationSlot[];
  benchSize: number;
};

export type SportConfig = {
  key: SportKey;
  label: string;
  surfaceLabel: string;
  benchLabel: string;
  positions: SportPosition[];
  formations: SportFormation[];
  /**
   * Fallback eligibility for members who don't have sport-specific
   * primary/secondary positions set (every member seeded this sprint has
   * football positions; the rugby demo fixture leans entirely on this
   * fallback, mapping each member's general position bucket onto a
   * plausible rugby role). Real backend data would replace this with
   * actual per-sport player positions.
   */
  fallbackEligibility: Record<string, PositionKey[]>;
};

const footballPositions: SportPosition[] = [
  { key: "GK", label: "Goalkeeper", shortLabel: "GK" },
  { key: "LB", label: "Left Back", shortLabel: "LB" },
  { key: "CB", label: "Centre Back", shortLabel: "CB" },
  { key: "RB", label: "Right Back", shortLabel: "RB" },
  { key: "CDM", label: "Defensive Midfielder", shortLabel: "CDM" },
  { key: "CM", label: "Central Midfielder", shortLabel: "CM" },
  { key: "LM", label: "Left Midfielder", shortLabel: "LM" },
  { key: "RM", label: "Right Midfielder", shortLabel: "RM" },
  { key: "LW", label: "Left Winger", shortLabel: "LW" },
  { key: "RW", label: "Right Winger", shortLabel: "RW" },
  { key: "ST", label: "Striker", shortLabel: "ST" },
];

const football433: SportFormation = {
  id: "4-3-3",
  label: "4-3-3",
  benchSize: 7,
  slots: [
    { slotId: "gk", position: "GK", x: 50, y: 6 },
    { slotId: "lb", position: "LB", x: 15, y: 22 },
    { slotId: "cb-l", position: "CB", x: 37, y: 18 },
    { slotId: "cb-r", position: "CB", x: 63, y: 18 },
    { slotId: "rb", position: "RB", x: 85, y: 22 },
    { slotId: "cdm", position: "CDM", x: 50, y: 40 },
    { slotId: "cm-l", position: "CM", x: 28, y: 52 },
    { slotId: "cm-r", position: "CM", x: 72, y: 52 },
    { slotId: "lw", position: "LW", x: 18, y: 75 },
    { slotId: "st", position: "ST", x: 50, y: 82 },
    { slotId: "rw", position: "RW", x: 82, y: 75 },
  ],
};

const football442: SportFormation = {
  id: "4-4-2",
  label: "4-4-2",
  benchSize: 7,
  slots: [
    { slotId: "gk", position: "GK", x: 50, y: 6 },
    { slotId: "lb", position: "LB", x: 15, y: 22 },
    { slotId: "cb-l", position: "CB", x: 37, y: 18 },
    { slotId: "cb-r", position: "CB", x: 63, y: 18 },
    { slotId: "rb", position: "RB", x: 85, y: 22 },
    { slotId: "lm", position: "LM", x: 15, y: 50 },
    { slotId: "cm-l", position: "CM", x: 38, y: 48 },
    { slotId: "cm-r", position: "CM", x: 62, y: 48 },
    { slotId: "rm", position: "RM", x: 85, y: 50 },
    { slotId: "st-l", position: "ST", x: 38, y: 80 },
    { slotId: "st-r", position: "ST", x: 62, y: 80 },
  ],
};

const rugbyPositions: SportPosition[] = [
  { key: "LHP", label: "Loosehead Prop", shortLabel: "1" },
  { key: "HK", label: "Hooker", shortLabel: "2" },
  { key: "THP", label: "Tighthead Prop", shortLabel: "3" },
  { key: "LK", label: "Lock", shortLabel: "4/5" },
  { key: "BF", label: "Blindside Flanker", shortLabel: "6" },
  { key: "OF", label: "Openside Flanker", shortLabel: "7" },
  { key: "N8", label: "Number 8", shortLabel: "8" },
  { key: "SH", label: "Scrum-half", shortLabel: "9" },
  { key: "FH", label: "Fly-half", shortLabel: "10" },
  { key: "LW", label: "Left Wing", shortLabel: "11" },
  { key: "IC", label: "Inside Centre", shortLabel: "12" },
  { key: "OC", label: "Outside Centre", shortLabel: "13" },
  { key: "RW", label: "Right Wing", shortLabel: "14" },
  { key: "FB", label: "Fullback", shortLabel: "15" },
];

const rugbyUnion15: SportFormation = {
  id: "union-15",
  label: "15-a-side Standard",
  benchSize: 8,
  slots: [
    { slotId: "lhp", position: "LHP", x: 35, y: 10 },
    { slotId: "hk", position: "HK", x: 50, y: 8 },
    { slotId: "thp", position: "THP", x: 65, y: 10 },
    { slotId: "lk-l", position: "LK", x: 42, y: 20 },
    { slotId: "lk-r", position: "LK", x: 58, y: 20 },
    { slotId: "bf", position: "BF", x: 25, y: 30 },
    { slotId: "of", position: "OF", x: 75, y: 30 },
    { slotId: "n8", position: "N8", x: 50, y: 32 },
    { slotId: "sh", position: "SH", x: 50, y: 48 },
    { slotId: "fh", position: "FH", x: 35, y: 58 },
    { slotId: "ic", position: "IC", x: 45, y: 72 },
    { slotId: "oc", position: "OC", x: 60, y: 72 },
    { slotId: "lw", position: "LW", x: 12, y: 78 },
    { slotId: "rw", position: "RW", x: 88, y: 78 },
    { slotId: "fb", position: "FB", x: 50, y: 90 },
  ],
};

export const sportConfigs: Record<SportKey, SportConfig> = {
  football: {
    key: "football",
    label: "Football",
    surfaceLabel: "Pitch",
    benchLabel: "Substitutes",
    positions: footballPositions,
    formations: [football433, football442],
    fallbackEligibility: {
      Forward: ["ST"],
      Midfielder: ["CM", "CDM"],
      Defender: ["CB", "LB", "RB"],
      Goalkeeper: ["GK"],
      Winger: ["LW", "RW", "LM", "RM"],
    },
  },
  rugby: {
    key: "rugby",
    label: "Rugby Union",
    surfaceLabel: "Pitch",
    benchLabel: "Reserves",
    positions: rugbyPositions,
    formations: [rugbyUnion15],
    fallbackEligibility: {
      // Members are seeded with football position buckets only — the rugby
      // demo fixture proves the architecture entirely through this mapping.
      Forward: ["N8", "BF", "OF", "LK"],
      Midfielder: ["SH", "FH"],
      Defender: ["LHP", "HK", "THP", "LK"],
      Goalkeeper: ["FB"],
      Winger: ["LW", "RW"],
    },
  },
};

export function positionLabel(sport: SportKey, key: PositionKey): SportPosition | undefined {
  return sportConfigs[sport].positions.find((p) => p.key === key);
}
