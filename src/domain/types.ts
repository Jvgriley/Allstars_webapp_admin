// Domain types for the Sporting Allstars Web Admin platform.
//
// These describe the shape of data the UI consumes, independent of where
// that data actually comes from. Today every service in `src/services/`
// resolves these types from local mock data (see `src/data.ts`); later,
// a service can be swapped to fetch the same shapes from the real
// Sporting Allstars API without any page component needing to change.
import type { PositionKey, SportKey } from "./sportConfigs";

export type Organisation = {
  name: string;
  plan: string;
  rank: number;
  participationScore: number;
};

export type Kpi = {
  id: string;
  label: string;
  value: string;
  delta: string;
  up: boolean;
};

export type RevenueTrendPoint = { month: string; revenue: number; attendance: number };
export type ParticipationTrendPoint = { week: string; u16: number; u18: number; seniors: number };
export type MemberStatTrendPoint = { m: string; hours: number; sessions: number };

export type InsightKind = "OPPORTUNITY" | "TREND" | "COMMERCIAL" | "PERFORMANCE" | "RISK";

export type Insight = {
  id: string;
  kind: InsightKind;
  title: string;
  body: string;
  cta?: string;
};

export type TaskSeverity = "high" | "medium" | "low";

export type ActionTask = {
  id: string;
  category: string;
  title: string;
  count?: number;
  severity: TaskSeverity;
  actions: string[];
};

export type Member = {
  id: string;
  name: string;
  team: string;
  role: string;
  ageGroup: string;
  membership: "Active" | "Pending" | "Lapsed";
  availability: "green" | "orange" | "red";
  attendance: number;
  trainingHours: number;
  participation: number;
  payments: "Paid" | "Overdue" | "Due";
  lastActive: string;
  status: "Active" | "At risk" | "Inactive";
  allstarsId: string;
  /** Broad, sport-agnostic position bucket (existing since Sprint 1/2) — still used for the People/Members screens. */
  position?: string;
  /** Sport-scoped primary position key (see domain/sportConfigs.ts) — used by Team Sheet selection. */
  primaryPosition?: PositionKey;
  /** Additional sport-scoped positions this player can be selected in. */
  secondaryPositions?: PositionKey[];
  squadNumber?: number;
  /** Mock-only; no seeded member currently has one, so the UI always has to handle the initials-avatar fallback. */
  photoUrl?: string;
};

export type Team = {
  name: string;
  count: number;
  attendance: number;
  roster: Member[];
};

export type Ranking = {
  pos: number;
  club: string;
  points: number;
  move: number;
  region: string;
  self?: boolean;
};

export type Fixture = {
  id: string;
  home: string;
  away: string;
  date: string;
  time: string;
  comp: string;
  venue: string;
  available: number;
  pending: number;
  unavailable: number;
  /** Which SportConfig (see domain/sportConfigs.ts) this fixture's team sheet uses. Defaults to "football" for fixtures created before Sprint 3. */
  sport?: SportKey;
};

export type TrainingSession = {
  id: string;
  team: string;
  date: string;
  time: string;
  focus: string;
  coach: string;
};

export type Challenge = {
  id: string;
  name: string;
  type: string;
  goal: number;
  unit: string;
  done: number;
  participants: number;
  teams: number;
  daysLeft: number;
  sponsor: string | null;
};

export type ChallengeLeaderboardRow = { pos: number; name: string; value: number; unit: string };

export type SpacePostStatus = "Published" | "Awaiting approval" | "Scheduled";

export type SpacePost = {
  id: string;
  tag: string;
  title: string;
  body: string;
  ai: boolean;
  status: SpacePostStatus;
  time: string;
  likes: number;
};

export type RevenueStream = { label: string; value: number };

export type Finance = {
  streams: RevenueStream[];
  outstanding: number;
  refunds: number;
  allstarsFees: number;
  net: number;
  sync: { last: string; synced: number; unmatched: number };
};

export type RewardMetric = { label: string; value: number };
export type RewardHistoryEntry = { period: string; amount: number; status: string };

export type Rewards = {
  score: number;
  annual: number;
  earned: number;
  next: number;
  pointsRequired: number;
  metrics: RewardMetric[];
  history: RewardHistoryEntry[];
};

export type Sponsor = {
  id: string;
  name: string;
  package: string;
  contract: string;
  impressions: string;
  engagement: string;
  renews: string;
  status: string;
};

export type RetailProduct = {
  id: string;
  name: string;
  price: string;
  stock: number;
  sold: number;
  cat: string;
};

export type Retail = {
  revenue: string;
  orders: number;
  avg: string;
  top: string;
  products: RetailProduct[];
};

export type MatchEvent = { min: string; type: string; team: string; detail: string };
export type PlayerOfTheMatchVote = { name: string; pct: number };
export type MatchAiInsight = { title: string; body: string };

export type LiveMatch = {
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  comp: string;
  clock: string;
  venue: string;
  viewers: number;
  peak: number;
  timeline: MatchEvent[];
  potm: PlayerOfTheMatchVote[];
  aiInsights: MatchAiInsight[];
};

export type LiveBroadcast = { id: string; title: string; comp: string; viewers: number; source: string };
export type UpcomingBroadcast = { id: string; title: string; comp: string; when: string; source: string };
export type CompletedBroadcast = { id: string; title: string; comp: string; when: string; views: number; highlights: number };

export type Broadcasts = {
  live: LiveBroadcast[];
  upcoming: UpcomingBroadcast[];
  completed: CompletedBroadcast[];
};

export type IntegrationStatus = "Connected" | "Available" | "Coming soon";

export type Integration = {
  name: string;
  cat: string;
  status: IntegrationStatus;
};

export type DataSource = {
  name: string;
  connected: number;
  quality: number;
  lastSync: string;
  status: "Connected" | "Potential integration";
};

export type CarpoolOffer = { id: string; area: string; driver: string; seats: number; status: string };
export type CarpoolRequest = { id: string; area: string; player: string; status: string };

export type Carpool = {
  fixture: string;
  when: string;
  travelling: number;
  drivers: number;
  spareSeats: number;
  needsTransport: number;
  offers: CarpoolOffer[];
  requests: CarpoolRequest[];
};

export type SafeguardingRecord = {
  id: string;
  name: string;
  role: string;
  dbs: "Valid" | "Expiring" | "Missing";
  expires: string;
  quals: string;
  status: "Compliant" | "Action needed";
};

export type AliceMilliatStat = { label: string; value: string; delta: string; up: boolean };
export type ParticipationGrowthPoint = { season: string; participants: number };
export type WomensSquad = { name: string; members: number; attendance: number; growth: string };
export type Ambassador = { name: string; role: string; note: string };
export type Campaign = { title: string; body: string; tag: string; progress: number };

export type AliceMilliatProfile = {
  bornDied: string;
  headline: string;
  bio: string;
  route: string;
  mission: string;
  stats: AliceMilliatStat[];
  growthTrend: ParticipationGrowthPoint[];
  squads: WomensSquad[];
  ambassadors: Ambassador[];
  campaigns: Campaign[];
  pledges: string[];
};

export type RoleDashboardEntry = { role: string; focus: string; metric: string };

// --- Sprint 2 — Functional Prototype additions -----------------------------
// These describe state that becomes genuinely interactive/mutable this
// sprint (still frontend-only, still mock data — see the relevant
// `src/services/*.ts` module for how each is stored).

export type AvailabilityState = "green" | "orange" | "red";

/** Per-fixture, per-member availability response — distinct from a member's
 * general `availability` default, since a player's response can differ
 * fixture to fixture. */
export type FixtureAvailabilityMap = Record<string, Record<string, AvailabilityState>>;

export type CalendarEventType = "Fixture" | "Training" | "Event" | "Meeting" | "Safeguarding";

export type CalendarEvent = {
  id: string;
  day: number; // day of month, 1-31, for the single demo month shown
  title: string;
  type: CalendarEventType;
  time?: string;
};

export type RetailOrder = {
  id: string;
  product: string;
  buyer: string;
  qty: number;
  total: string;
  status: "Pending" | "Fulfilled";
  time: string;
};

export type FinanceTransaction = {
  id: string;
  stream: string;
  member: string;
  amount: number;
  status: "Paid" | "Pending" | "Refunded";
  date: string;
};

export type CommunicationRecord = {
  id: string;
  channel: string;
  audience: string;
  subject: string;
  status: "Sent" | "Scheduled";
  when: string;
};

// --- Sprint 3 — Team Selection / Team Sheets --------------------------------
// See src/domain/sportConfigs.ts for the sport/formation/position config
// these types are built around, and src/services/teamSheetService.ts for
// the store-backed mutations and eligibility/insight logic.

export type SelectionStatus = "Draft" | "Published";

/** A player placed into a specific formation slot for a given fixture's team selection. */
export type SelectedPlayer = {
  memberId: string;
  slotId: string;
  /** True when the manager deliberately selected a player who had marked themselves unavailable. */
  overrideUnavailable?: boolean;
};

export type TeamSelection = {
  fixtureId: string;
  sport: SportKey;
  formationId: string;
  starters: SelectedPlayer[];
  /** memberIds, ordered — substitutes/reserves, not tied to a formation slot. */
  bench: string[];
  status: SelectionStatus;
  publishedAt?: string;
  updatedAt?: string;
};

/** A candidate's eligibility for the position(s) being filled — distinct from being finally selected. See sportConfigs.ts's fallbackEligibility for how this is computed when a member has no sport-specific position set. */
export type PositionEligibility = {
  memberId: string;
  eligiblePositions: PositionKey[];
};

/** Deterministic mock intelligence about a team selection in progress — reuses the existing Allstars Intelligence InsightKind taxonomy/visual language rather than inventing a parallel one. Structured so a real backend/AI service can replace `teamSheetService.getSelectionInsights` later without the UI changing. */
export type SelectionInsight = {
  id: string;
  kind: InsightKind;
  title: string;
  body: string;
};
