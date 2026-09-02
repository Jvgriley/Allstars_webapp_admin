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

export type SportKey =
  | "football" | "rugby" | "basketball" | "rugbySevens" | "hockey" | "cricket"
  // Sprint 5 — Olympic Event Sports.
  | "athletics" | "swimming" | "rowing" | "cycling";

export type SelectionMode = "formation" | "role" | "event";
export type SurfaceKind = "football-pitch" | "rugby-pitch" | "basketball-court" | "hockey-pitch" | "none"
  // Sprint 5 — the one genuinely new surface: a rowing boat's seats,
  // rendered as a narrow lane rather than a rectangular pitch/court (see
  // Pitch.tsx). Athletics/Swimming/Cycling individual events don't place
  // a marker on a surface at all (see the Event Entry page), so they use
  // "none" like Cricket does.
  | "rowing-boat";
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

// ---------------------------------------------------------------------------
// Sprint 5 — Olympic Event Sports. Athletics/Swimming/Rowing/Cycling don't
// fit "place a player in a formation" or "order a lineup" at the *sport*
// level — the real workflow is Sport -> Competition -> Event -> Entry (see
// domain/types.ts's Competition type and services/competitionService.ts).
// `SportEvent` is the thing a competition actually contests ("100m",
// "Coxless Pair", "4x100m Medley Relay"): three shapes share one type
// rather than three parallel ones —
//  - "individual": one athlete per entry, capped by `entryLimit` (handled
//    by services/eventEntryService.ts — no formation/role machinery needed).
//  - "relay": an ordered running order with no surface coordinate — this
//    reuses the exact "role" selectionMode + teamSheetService.swapSlots
//    machinery Cricket's batting order already proved out, via a synthetic
//    per-event SportConfig (see buildEventSelectionConfig below).
//  - "crew": a boat's seats, which DO have a meaningful layout (bow to
//    stroke, cox off to the side) — this reuses "formation" selectionMode
//    + <Pitch surface="rowing-boat"/> the same way, seat coordinates instead
//    of pitch coordinates.
// -------------------------------------------------------------------------
export type EventCategory = "Men" | "Women" | "Mixed" | "Open";
export type SportEventType = "individual" | "relay" | "crew";
export type ResultType = "time" | "distance" | "points";
/** "asc" — lower is better (every timed event). "desc" — higher is better (distance, points). */
export type RankingDirection = "asc" | "desc";

export type SportEvent = {
  key: string;
  label: string;
  type: SportEventType;
  category: EventCategory;
  resultType: ResultType;
  resultUnit: string;
  rankingDirection: RankingDirection;
  /** "individual" events only — max athletes the club may enter per competition (see eventEntryService.addEntry). */
  entryLimit?: number;
  /** "relay"/"crew" events only — how many legs/seats, and what each is called (relay leg order, or boat seat from bow to stroke, cox last). */
  crewSize?: number;
  legLabels?: string[];
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
  /** Sprint 5 — the events this sport's competitions can contest (see Competition.eventKeys). Undefined/empty for every Sprint 3/4 team sport. */
  events?: SportEvent[];
  /**
   * Sprint 5 — when true, every roster member is eligible for every slot in
   * this config, bypassing getEligiblePositions entirely. Used by the
   * synthetic per-event configs buildEventSelectionConfig() generates for
   * relay legs and crew seats, where the app doesn't model which specific
   * leg/seat an athlete specialises in (the same simplification Cricket's
   * shared "XI" position key already makes for batting order — see
   * teamSheetService.isEligibleForSlot). Undefined/false for every existing
   * sport, so Sprint 3/4 eligibility behaviour is unchanged.
   */
  openEligibility?: boolean;
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
// Sprint 5 - Athletics. "Individual" events (track/field, capped entries)
// plus one "relay" event (4x100m) proving the ordered-running-order reuse
// of Cricket's batting-order mechanism. selectionMode "event" at the sport
// level — there is no single squad formation, only Competition -> Event ->
// Entry (see competitionService.ts / eventEntryService.ts). `positions`
// mirrors `events` 1:1 so every existing generic lookup
// (config.positions.find(p => p.key === member.primaryPosition)) keeps
// working unchanged — a member's primaryPosition/secondaryPositions for an
// event sport are event keys ("100m", "long-jump"), not formation
// positions. See membersService.ts's athleticsSeed.
// ---------------------------------------------------------------------------

const athleticsEvents: SportEvent[] = [
  { key: "100m", label: "100m", type: "individual", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", entryLimit: 3 },
  { key: "200m", label: "200m", type: "individual", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", entryLimit: 3 },
  { key: "400m", label: "400m", type: "individual", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", entryLimit: 3 },
  { key: "800m", label: "800m", type: "individual", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", entryLimit: 2 },
  { key: "1500m", label: "1500m", type: "individual", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", entryLimit: 2 },
  { key: "100m-hurdles", label: "100m Hurdles", type: "individual", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", entryLimit: 2 },
  { key: "long-jump", label: "Long Jump", type: "individual", category: "Open", resultType: "distance", resultUnit: "m", rankingDirection: "desc", entryLimit: 2 },
  { key: "4x100m-relay", label: "4x100m Relay", type: "relay", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", crewSize: 4, legLabels: ["Leg 1", "Leg 2", "Leg 3", "Leg 4"] },
];

const athleticsPositions: SportPosition[] = athleticsEvents.map((e) => ({ key: e.key, label: e.label, shortLabel: e.label }));

// ---------------------------------------------------------------------------
// Sprint 5 - Swimming. Six individual strokes/distances plus two relay
// types (Freestyle and Medley) — the Medley's leg order is fixed by rule
// (Backstroke, Breaststroke, Butterfly, Freestyle), unlike Athletics'
// interchangeable relay legs, which is exactly why `legLabels` is
// per-event data rather than a generic "Leg N" default.
// ---------------------------------------------------------------------------

const swimmingEvents: SportEvent[] = [
  { key: "50m-freestyle", label: "50m Freestyle", type: "individual", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", entryLimit: 3 },
  { key: "100m-freestyle", label: "100m Freestyle", type: "individual", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", entryLimit: 3 },
  { key: "200m-freestyle", label: "200m Freestyle", type: "individual", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", entryLimit: 2 },
  { key: "100m-backstroke", label: "100m Backstroke", type: "individual", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", entryLimit: 2 },
  { key: "100m-breaststroke", label: "100m Breaststroke", type: "individual", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", entryLimit: 2 },
  { key: "100m-butterfly", label: "100m Butterfly", type: "individual", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", entryLimit: 2 },
  { key: "4x100m-freestyle-relay", label: "4x100m Freestyle Relay", type: "relay", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", crewSize: 4, legLabels: ["Leg 1", "Leg 2", "Leg 3", "Leg 4"] },
  { key: "4x100m-medley-relay", label: "4x100m Medley Relay", type: "relay", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", crewSize: 4, legLabels: ["Backstroke Leg", "Breaststroke Leg", "Butterfly Leg", "Freestyle Leg"] },
];

const swimmingPositions: SportPosition[] = swimmingEvents.map((e) => ({ key: e.key, label: e.label, shortLabel: e.label }));

// ---------------------------------------------------------------------------
// Sprint 5 - Rowing. THE second architectural proof point this sprint
// makes, alongside Cricket's Sprint 4 one: every boat class is a "crew"
// event, which needs almost no new mechanism at all — a boat class is just
// a formation with seat coordinates down a narrow lane instead of a pitch,
// so it reuses <Pitch surface="rowing-boat"/>, <SlotChip/> and
// teamSheetService completely unchanged (see buildEventSelectionConfig
// below). A cox is modelled as its own genuinely distinct position (not
// just another seat), matching the real sport.
// ---------------------------------------------------------------------------

const rowingEvents: SportEvent[] = [
  { key: "coxless-pair", label: "Coxless Pair", type: "crew", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", crewSize: 2, legLabels: ["Bow", "Stroke"] },
  { key: "coxed-four", label: "Coxed Four", type: "crew", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", crewSize: 5, legLabels: ["Bow", "2", "3", "Stroke", "Cox"] },
  { key: "quad-sculls", label: "Quad Sculls", type: "crew", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", crewSize: 4, legLabels: ["Bow", "2", "3", "Stroke"] },
  { key: "eight", label: "Eight", type: "crew", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", crewSize: 9, legLabels: ["Bow", "2", "3", "4", "5", "6", "7", "Stroke", "Cox"] },
];

const rowingPositions: SportPosition[] = rowingEvents.map((e) => ({ key: e.key, label: e.label, shortLabel: e.label }));

// ---------------------------------------------------------------------------
// Sprint 5 - Cycling. Three individual disciplines plus Team Pursuit — a
// "relay-like" event in the brief's own words, so it's modelled exactly
// like Athletics/Swimming's relays (ordered running order, no coordinate),
// not like Rowing's crew boats.
// ---------------------------------------------------------------------------

const cyclingEvents: SportEvent[] = [
  { key: "road-race", label: "Road Race", type: "individual", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", entryLimit: 3 },
  { key: "time-trial", label: "Time Trial", type: "individual", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", entryLimit: 2 },
  { key: "criterium", label: "Criterium", type: "individual", category: "Open", resultType: "points", resultUnit: "pts", rankingDirection: "desc", entryLimit: 2 },
  { key: "team-pursuit", label: "Team Pursuit", type: "relay", category: "Open", resultType: "time", resultUnit: "s", rankingDirection: "asc", crewSize: 4, legLabels: ["Rider 1", "Rider 2", "Rider 3", "Rider 4"] },
];

const cyclingPositions: SportPosition[] = cyclingEvents.map((e) => ({ key: e.key, label: e.label, shortLabel: e.label }));

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
  // -------------------------------------------------------------------
  // Sprint 5 - Olympic Event Sports. selectionMode "event" — no single
  // squad formation at the sport level (see the SportEvent module comment
  // above); `formations` is deliberately empty because nothing calls
  // teamSheetService with this top-level config directly — every actual
  // selection (a relay leg order, a boat's crew) goes through a synthetic
  // per-event config from buildEventSelectionConfig() instead, keyed by
  // competition+event, never by sport.
  // -------------------------------------------------------------------
  athletics: {
    key: "athletics",
    label: "Athletics",
    category: "event",
    selectionMode: "event",
    surface: "none",
    surfaceLabel: "Track & Field",
    benchLabel: "Reserves",
    startersLabel: "Squad Entries",
    positions: athleticsPositions,
    formations: [],
    fallbackEligibility: {},
    events: athleticsEvents,
  },
  swimming: {
    key: "swimming",
    label: "Swimming",
    category: "event",
    selectionMode: "event",
    surface: "none",
    surfaceLabel: "Pool",
    benchLabel: "Reserves",
    startersLabel: "Squad Entries",
    positions: swimmingPositions,
    formations: [],
    fallbackEligibility: {},
    events: swimmingEvents,
  },
  rowing: {
    key: "rowing",
    label: "Rowing",
    category: "event",
    selectionMode: "event",
    surface: "none",
    surfaceLabel: "Water",
    benchLabel: "Reserves",
    startersLabel: "Crew Entries",
    positions: rowingPositions,
    formations: [],
    fallbackEligibility: {},
    events: rowingEvents,
  },
  cycling: {
    key: "cycling",
    label: "Cycling",
    category: "event",
    selectionMode: "event",
    surface: "none",
    surfaceLabel: "Road & Track",
    benchLabel: "Reserves",
    startersLabel: "Squad Entries",
    positions: cyclingPositions,
    formations: [],
    fallbackEligibility: {},
    events: cyclingEvents,
  },
};

export function positionLabel(sport: SportKey, key: PositionKey): SportPosition | undefined {
  return sportConfigs[sport].positions.find((p) => p.key === key);
}

/**
 * Sprint 5 — builds the synthetic, per-event SportConfig a relay leg order
 * or a boat's crew is actually selected through. This is the whole reuse
 * trick the module comment above describes: nothing new is added to
 * teamSheetService, <Pitch/>, <SlotChip/>, PlayerPickerModal or
 * exportSvg.ts — they already work on any SportConfig/SportFormation, so a
 * config shaped like this is all a relay/crew event needs. Callers pass the
 * resulting config's own formation id (== `${competitionId}:${event.key}`)
 * as the "fixtureId" argument to every teamSheetService function, reusing
 * its existing session store rather than inventing a parallel one.
 */
export function buildEventSelectionConfig(sport: SportKey, competitionId: string, event: SportEvent): SportConfig {
  const base = sportConfigs[sport];
  const formationId = `${competitionId}:${event.key}`;

  if (event.type === "crew") {
    // Seats are laid down a narrow lane from bow (y small) to stroke (y
    // large); a cox — a genuinely distinct role, not just another seat —
    // sits off to the side near the stroke end, matching a real boat.
    const seatLabels = (event.legLabels ?? []).filter((l) => l !== "Cox");
    const hasCox = (event.legLabels ?? []).includes("Cox");
    const n = seatLabels.length;
    const slots: FormationSlot[] = seatLabels.map((_, i) => ({
      slotId: `seat-${i + 1}`,
      position: `SEAT-${i}`,
      x: 50 + (i % 2 === 0 ? -9 : 9),
      y: n > 1 ? 10 + (i * (76 / (n - 1))) : 46,
    }));
    if (hasCox) slots.push({ slotId: "seat-cox", position: "COX", x: 50, y: 92 });
    const positions: SportPosition[] = [
      ...seatLabels.map((label, i) => ({ key: `SEAT-${i}`, label: `${label} Seat`, shortLabel: label })),
      ...(hasCox ? [{ key: "COX", label: "Cox", shortLabel: "Cox" }] : []),
    ];
    return {
      ...base,
      selectionMode: "formation",
      surface: "rowing-boat",
      startersLabel: event.label,
      benchLabel: "Reserves",
      supportsCaptain: true,
      supportsViceCaptain: false,
      openEligibility: true,
      positions,
      formations: [{ id: formationId, label: event.label, benchSize: 2, slots }],
    };
  }

  // "relay" — an ordered running order with no surface coordinate, reusing
  // the exact selectionMode "role" mechanism Cricket's batting order proves
  // out (see teamSheetService.swapSlots and OrderedLineup.tsx).
  const legLabels = event.legLabels ?? [];
  const slots: FormationSlot[] = legLabels.map((_, i) => ({ slotId: `leg-${i + 1}`, position: `LEG-${i}` }));
  const positions: SportPosition[] = legLabels.map((label, i) => ({ key: `LEG-${i}`, label, shortLabel: label }));
  return {
    ...base,
    selectionMode: "role",
    surface: "none",
    startersLabel: event.label,
    benchLabel: "Reserves",
    supportsCaptain: true,
    supportsViceCaptain: false,
    openEligibility: true,
    positions,
    formations: [{ id: formationId, label: event.label, benchSize: 2, slots }],
  };
}

// ---------------------------------------------------------------------------
// Event Sports (Sprint 5) - built. This is what the Sprint 4 note above
// this comment used to describe as future work; keeping the history since
// it's still the accurate description of *why* the shapes below look the
// way they do.
//
// `selectionMode: "event"` (Athletics, Swimming, Cycling, Rowing above)
// means the workflow isn't "place a player in a formation slot" or "order
// a batting lineup" at the sport level, but:
//   Sport -> Competition -> Event -> Availability/Eligibility -> Athlete
//   Entry -> Relay/Crew selection (where relevant) -> Publish Entry
// See domain/types.ts's Competition type, services/competitionService.ts,
// services/eventEntryService.ts (individual/capped entries) and
// services/resultsService.ts (recorded results, PBs, rankings). Relay legs
// and boat crews don't get a new selection mechanism at all — they reuse
// `teamSheetService`/`<Pitch/>`/`<SlotChip/>` exactly as Sprint 3/4 built
// them, via a synthetic per-event SportConfig from
// buildEventSelectionConfig() above, keyed by competition+event rather
// than by sport. That reuse — not a parallel EventEntry-selection system —
// is the actual Sprint 5 architectural point, the same way Cricket's
// role-based batting order was Sprint 4's.
