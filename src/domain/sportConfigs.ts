// Sport configuration registry — Sprint 3 (football, rugby union), extended
// Sprint 4 (Olympic multi-sport framework).
//
// This is the whole point of the multi-sport architecture: nothing in the
// Team Sheet UI or service layer knows anything specific to any one sport.
// Every sport-shaped detail — what positions/roles exist, where they sit on
// a surface (or whether there even is one), how many starters/substitutes,
// what the surface/bench/starting-XI are called, whether captaincy applies
// — lives here as data. Adding a new sport is adding a new SportConfig
// entry, not writing a new component.
//
// Coordinates are percentages of the surface (0-100 on both axes), with
// y=0 at a team's own goal/try-line/baseline and y=100 at the attacking
// end - the same convention regardless of sport, so <Pitch/> can render any
// of them with one layout algorithm.
//
// Sprint 4 - Olympic Multi-Sport Framework - adds:
//  - `selectionMode`: "formation" (players placed at surface coordinates,
//    Sprint 3's model, unchanged) vs "role" (players hold a role and a
//    batting/running order but no fixed coordinate - cricket's proof
//    point that Allstars doesn't assume every sport is formation-based).
//    A third mode, "event", is reserved and intentionally unused - see the
//    module-level note at the bottom of this file for how a future
//    Athletics/Swimming/Cycling/Rowing Event Entry system would slot in
//    without changing this type again.
//  - `surface`: replaces a hardcoded sport check in <Pitch/> so each
//    formation sport gets a genuinely distinct playing surface rather than
//    reusing a green rectangle for everything.
//  - `startersLabel`: sport-correct name for the starting lineup ("Starting
//    XI" / "Starting Five" / "Starting Seven") instead of assuming XI.
//  - `supportsCaptain` / `supportsViceCaptain`: generic captaincy support,
//    not cricket-specific - Rugby Sevens uses only the first.
//  - `category`: "team" for every sport configured today; reserved so a
//    future "event" category (Athletics, Swimming, Cycling, Rowing) can be
//    filtered/grouped differently without a breaking change.

export type SportKey = "football" | "rugby" | "basketball" | "rugbySevens" | "hockey" | "cricket";

export type SelectionMode = "formation" | "role" | "event";
export type SurfaceKind = "football-pitch" | "rugby-pitch" | "basketball-court" | "hockey-pitch" | "none";
export type SportCategory = "team" | "event";

/** Scoped to a single SportConfig - never compared across sports. */
export type PositionKey = string;

export type SportPosition = {
  key: PositionKey;
  label: string;
  shortLabel: string;
};

export type FormationSlot = {
  slotId: string;
  position: PositionKey;
  /** Omitted for role-based sports (see SelectionMode) - there is no fixed
   * surface coordinate, only an order (batting order, running order, ...). */
  x?: number;
  y?: number;
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
  category: SportCategory;
  selectionMode: SelectionMode;
  surface: SurfaceKind;
  surfaceLabel: string;
  benchLabel: string;
  /** e.g. "Starting XI" / "Starting Five" / "Starting Seven" - used anywhere the UI would otherwise hardcode "XI". */
  startersLabel: string;
  supportsCaptain?: boolean;
  supportsViceCaptain?: boolean;
  positions: SportPosition[];
  formations: SportFormation[];
  /**
   * Fallback eligibility for members who don't have sport-specific
   * primary/secondary positions set. Real backend data would replace this
   * with actual per-sport player positions; every Sprint 4 sport is seeded
   * with real sport-scoped positions, so this exists mainly for
   * cross-sport/legacy members (see membersService.ts).
   */
  fallbackEligibility: Record<string, PositionKey[]>;
};

// ---------------------------------------------------------------------------
// Football - Sprint 3 reference implementation. Unchanged.
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Rugby Union (15-a-side) - Sprint 3. Unchanged. Kept alongside Sprint 4's
// Rugby Sevens rather than replaced by it - different squad shape, different
// number of players, genuinely a different sport config, not a duplicate.
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Sprint 4 - Basketball. Formation-based, 5 starters, court surface.
// ---------------------------------------------------------------------------

const basketballPositions: SportPosition[] = [
  { key: "PG", label: "Point Guard", shortLabel: "PG" },
  { key: "SG", label: "Shooting Guard", shortLabel: "SG" },
  { key: "SF", label: "Small Forward", shortLabel: "SF" },
  { key: "PF", label: "Power Forward", shortLabel: "PF" },
  { key: "C", label: "Centre", shortLabel: "C" },
];

const basketballFive: SportFormation = {
  id: "starting-five",
  label: "Starting Five",
  benchSize: 7,
  slots: [
    { slotId: "pg", position: "PG", x: 50, y: 82 },
    { slotId: "sg", position: "SG", x: 80, y: 58 },
    { slotId: "sf", position: "SF", x: 20, y: 58 },
    { slotId: "pf", position: "PF", x: 68, y: 28 },
    { slotId: "c", position: "C", x: 50, y: 14 },
  ],
};

// ---------------------------------------------------------------------------
// Sprint 4 - Rugby Sevens. Formation-based, 7 starters + 5 replacements
// (real Sevens squads run 12), Sevens-numbered positions and their own
// pitch layout - deliberately not the Union 15s coordinates reused smaller.
// ---------------------------------------------------------------------------

const rugbySevensPositions: SportPosition[] = [
  { key: "P1", label: "Prop", shortLabel: "1" },
  { key: "HK7", label: "Hooker", shortLabel: "2" },
  { key: "P2", label: "Prop", shortLabel: "3" },
  { key: "SH7", label: "Scrum-half", shortLabel: "4" },
  { key: "FH7", label: "Fly-half", shortLabel: "5" },
  { key: "CE7", label: "Centre", shortLabel: "6" },
  { key: "WG7", label: "Wing", shortLabel: "7" },
];

const rugbySevensFormation: SportFormation = {
  id: "sevens-7",
  label: "Sevens Standard",
  benchSize: 5,
  slots: [
    { slotId: "p1", position: "P1", x: 34, y: 14 },
    { slotId: "hk7", position: "HK7", x: 50, y: 11 },
    { slotId: "p2", position: "P2", x: 66, y: 14 },
    { slotId: "sh7", position: "SH7", x: 50, y: 33 },
    { slotId: "fh7", position: "FH7", x: 28, y: 50 },
    { slotId: "ce7", position: "CE7", x: 58, y: 62 },
    { slotId: "wg7", position: "WG7", x: 86, y: 78 },
  ],
};

// ---------------------------------------------------------------------------
// Sprint 4 - Field Hockey. Formation-based, 11 starters, classic hockey
// shape (GK / 2 backs / 3 halves / 5 forwards) on a hockey-specific surface.
// ---------------------------------------------------------------------------

const hockeyPositions: SportPosition[] = [
  { key: "GK-H", label: "Goalkeeper", shortLabel: "GK" },
  { key: "RB-H", label: "Right Back", shortLabel: "RB" },
  { key: "LB-H", label: "Left Back", shortLabel: "LB" },
  { key: "RH-H", label: "Right Half", shortLabel: "RH" },
  { key: "CH-H", label: "Centre Half", shortLabel: "CH" },
  { key: "LH-H", label: "Left Half", shortLabel: "LH" },
  { key: "RW-H", label: "Right Wing", shortLabel: "RW" },
  { key: "IR-H", label: "Inside Right", shortLabel: "IR" },
  { key: "CF-H", label: "Centre Forward", shortLabel: "CF" },
  { key: "IL-H", label: "Inside Left", shortLabel: "IL" },
  { key: "LW-H", label: "Left Wing", shortLabel: "LW" },
];

const hockeyFormation: SportFormation = {
  id: "hockey-11",
  label: "Classic 11",
  benchSize: 5,
  slots: [
    { slotId: "gk-h", position: "GK-H", x: 50, y: 6 },
    { slotId: "rb-h", position: "RB-H", x: 75, y: 20 },
    { slotId: "lb-h", position: "LB-H", x: 25, y: 20 },
    { slotId: "rh-h", position: "RH-H", x: 85, y: 40 },
    { slotId: "ch-h", position: "CH-H", x: 50, y: 38 },
    { slotId: "lh-h", position: "LH-H", x: 15, y: 40 },
    { slotId: "rw-h", position: "RW-H", x: 85, y: 68 },
    { slotId: "ir-h", position: "IR-H", x: 62, y: 72 },
    { slotId: "cf-h", position: "CF-H", x: 50, y: 86 },
    { slotId: "il-h", position: "IL-H", x: 38, y: 72 },
    { slotId: "lw-h", position: "LW-H", x: 15, y: 68 },
  ],
};

// ---------------------------------------------------------------------------
// Sprint 4 - Cricket. THE architectural proof point: role-based, not
// formation-based. Slots carry no x/y - slot order *is* batting order
// (see teamSheetService.swapSlots), and every slot shares one generic "XI"
// position so eligibility is trivial (any of the XI can bat anywhere in the
// order); the player's *own* primary/secondary role (Wicketkeeper / Batter /
// Bowler / All-rounder) is what the cricket-specific builder actually
// displays and reasons about - see CricketXI.tsx and the "bowling options"
// insight in teamSheetService.getSelectionInsights.
// ---------------------------------------------------------------------------

const cricketPositions: SportPosition[] = [
  { key: "XI", label: "Playing XI", shortLabel: "XI" },
  { key: "WK", label: "Wicketkeeper", shortLabel: "WK" },
  { key: "BAT", label: "Batter", shortLabel: "BAT" },
  { key: "BOWL", label: "Bowler", shortLabel: "BOWL" },
  { key: "AR", label: "All-rounder", shortLabel: "AR" },
];

const cricketPlayingXI: SportFormation = {
  id: "playing-xi",
  label: "Playing XI",
  benchSize: 4,
  slots: Array.from({ length: 11 }, (_, i) => ({ slotId: `bat-${i + 1}`, position: "XI" })),
};

// ---------------------------------------------------------------------------

export const sportConfigs: Record<SportKey, SportConfig> = {
  football: {
    key: "football",
    label: "Football",
    category: "team",
    selectionMode: "formation",
    surface: "football-pitch",
    surfaceLabel: "Pitch",
    benchLabel: "Substitutes",
    startersLabel: "Starting XI",
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
    category: "team",
    selectionMode: "formation",
    surface: "rugby-pitch",
    surfaceLabel: "Pitch",
    benchLabel: "Reserves",
    startersLabel: "Starting XV",
    positions: rugbyPositions,
    formations: [rugbyUnion15],
    fallbackEligibility: {
      Forward: ["N8", "BF", "OF", "LK"],
      Midfielder: ["SH", "FH"],
      Defender: ["LHP", "HK", "THP", "LK"],
      Goalkeeper: ["FB"],
      Winger: ["LW", "RW"],
    },
  },
  basketball: {
    key: "basketball",
    label: "Basketball",
    category: "team",
    selectionMode: "formation",
    surface: "basketball-court",
    surfaceLabel: "Court",
    benchLabel: "Bench",
    startersLabel: "Starting Five",
    positions: basketballPositions,
    formations: [basketballFive],
    fallbackEligibility: {
      Forward: ["SF", "PF"],
      Midfielder: ["SG"],
      Defender: ["PF", "C"],
      Goalkeeper: ["C"],
      Winger: ["SG", "SF"],
    },
  },
  rugbySevens: {
    key: "rugbySevens",
    label: "Rugby Sevens",
    category: "team",
    selectionMode: "formation",
    surface: "rugby-pitch",
    surfaceLabel: "Pitch",
    benchLabel: "Replacements",
    startersLabel: "Starting Seven",
    supportsCaptain: true,
    positions: rugbySevensPositions,
    formations: [rugbySevensFormation],
    fallbackEligibility: {
      Forward: ["P1", "HK7", "P2"],
      Midfielder: ["SH7", "FH7"],
      Defender: ["P1", "P2"],
      Goalkeeper: ["CE7"],
      Winger: ["WG7", "CE7"],
    },
  },
  hockey: {
    key: "hockey",
    label: "Field Hockey",
    category: "team",
    selectionMode: "formation",
    surface: "hockey-pitch",
    surfaceLabel: "Pitch",
    benchLabel: "Substitutes",
    startersLabel: "Starting XI",
    positions: hockeyPositions,
    formations: [hockeyFormation],
    fallbackEligibility: {
      Forward: ["CF-H", "IR-H", "IL-H"],
      Midfielder: ["CH-H", "RH-H", "LH-H"],
      Defender: ["RB-H", "LB-H"],
      Goalkeeper: ["GK-H"],
      Winger: ["RW-H", "LW-H"],
    },
  },
  cricket: {
    key: "cricket",
    label: "Cricket",
    category: "team",
    selectionMode: "role",
    surface: "none",
    surfaceLabel: "Ground",
    benchLabel: "Reserves",
    startersLabel: "Starting XI",
    supportsCaptain: true,
    supportsViceCaptain: true,
    positions: cricketPositions,
    formations: [cricketPlayingXI],
    fallbackEligibility: {
      Forward: ["BOWL"],
      Midfielder: ["AR"],
      Defender: ["BAT"],
      Goalkeeper: ["WK"],
      Winger: ["BAT"],
    },
  },
};

export function positionLabel(sport: SportKey, key: PositionKey): SportPosition | undefined {
  return sportConfigs[sport].positions.find((p) => p.key === key);
}

// ---------------------------------------------------------------------------
// Future Event Sports (Sprint 5+) - NOT built this sprint. Documented here
// so the architectural seam is visible where the rest of this file lives.
//
// `selectionMode: "event"` is reserved above for sports like Athletics,
// Swimming, Cycling and Rowing, where the workflow isn't "place a player in
// a formation slot" or "order a batting lineup" but:
//   Sport -> Event/Competition -> Discipline/Event -> Availability/Eligibility
//   -> Athlete Entry -> Relay/Crew selection (where relevant) -> Publish Entry
// The shape that would need adding - not built now - is roughly an
// `EventDiscipline` (e.g. "100m", "4x100m Relay", "K1 200m") replacing
// `SportFormation.slots` with entries, each either a single athlete slot or
// a relay/crew slot with an internal running/seat order (reusing the same
// slot-order-as-sequence trick cricket's batting order already proves out).
// `teamSheetService` would gain an `EventEntry` alongside `TeamSelection`
// rather than replacing it, since a club will run formation/role sports and
// event sports side by side, not one or the other.
