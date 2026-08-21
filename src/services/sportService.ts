// Fixtures, training sessions, and challenges — the "Sport" nav section.
import type { AvailabilityState, Challenge, ChallengeLeaderboardRow, Fixture, FixtureAvailabilityMap, TrainingSession } from "../domain/types";
import { useAsyncData } from "./useAsyncData";
import { createStore, nextId } from "./store";

const seedFixtures: Fixture[] = [
  { id: "f1", home: "Riverside U18", away: "United Athletic", date: "Sat 20 Aug", time: "14:00", comp: "U18 Premier", venue: "Riverside Sports Ground", available: 17, pending: 4, unavailable: 5, sport: "football" },
  { id: "f2", home: "Riverside U14", away: "City FC", date: "Sat 20 Aug", time: "10:30", comp: "Youth League", venue: "City Park", available: 12, pending: 6, unavailable: 3, sport: "football" },
  { id: "f3", home: "Women's First", away: "Falcons", date: "Sun 21 Aug", time: "13:00", comp: "Regional Cup", venue: "Riverside Sports Ground", available: 15, pending: 2, unavailable: 4, sport: "football" },
  { id: "f4", home: "Riverside RFC", away: "Ironbridge Vale", date: "Sun 21 Aug", time: "15:00", comp: "Regional Merit League", venue: "Riverside Sports Ground", available: 19, pending: 5, unavailable: 3, sport: "rugby" },
];

const training: TrainingSession[] = [
  { id: "tr1", team: "U16 Squad", date: "Thu 18 Aug", time: "18:00", focus: "Pressing & transitions", coach: "M. Taylor" },
  { id: "tr2", team: "Seniors", date: "Fri 19 Aug", time: "19:30", focus: "Set pieces", coach: "A. Smith" },
  { id: "tr3", team: "Academy", date: "Sat 20 Aug", time: "09:00", focus: "Ball mastery", coach: "S. Roberts" },
];

const seedChallenges: Challenge[] = [
  { id: "c1", name: "Row The Atlantic", type: "Rowing", goal: 5500, unit: "km", done: 4127, participants: 482, teams: 28, daysLeft: 8, sponsor: "AquaFit" },
  { id: "c2", name: "August Cycling Streak", type: "Cycling", goal: 3000, unit: "km", done: 2873, participants: 214, teams: 12, daysLeft: 6, sponsor: null },
  { id: "c3", name: "Mindful March-athon", type: "Mindfulness", goal: 1000, unit: "sessions", done: 640, participants: 356, teams: 20, daysLeft: 14, sponsor: "CalmCo" },
];

const seedLeaderboard: Record<string, ChallengeLeaderboardRow[]> = {
  c1: [
    { pos: 1, name: "U16 Squad", value: 842, unit: "km" },
    { pos: 2, name: "Seniors", value: 731, unit: "km" },
    { pos: 3, name: "Women's First", value: 688, unit: "km" },
    { pos: 4, name: "Academy", value: 512, unit: "km" },
    { pos: 5, name: "U14 Reds", value: 421, unit: "km" },
  ],
};

const YOU = "Jack Riley";

type FixturesState = { fixtures: Fixture[] };
const fixturesStore = createStore<FixturesState>("sa2:sport-fixtures", () => ({ fixtures: seedFixtures }));

type ChallengesState = { challenges: Challenge[]; leaderboards: Record<string, ChallengeLeaderboardRow[]>; joined: Record<string, boolean> };
const challengesStore = createStore<ChallengesState>("sa2:sport-challenges", () => ({
  challenges: seedChallenges,
  leaderboards: seedLeaderboard,
  joined: {},
}));

const availabilityStore = createStore<FixtureAvailabilityMap>("sa2:sport-availability", () => ({}));

export type FixtureInput = Pick<Fixture, "home" | "away" | "date" | "time" | "comp" | "venue"> & { sport?: Fixture["sport"] };
export type ChallengeInput = Pick<Challenge, "name" | "type" | "goal" | "unit"> & { sponsor?: string | null };

export const sportService = {
  listFixtures: (): Promise<Fixture[]> => Promise.resolve(fixturesStore.getState().fixtures),
  listTraining: (): Promise<TrainingSession[]> => Promise.resolve(training),
  listChallenges: (): Promise<Challenge[]> => Promise.resolve(challengesStore.getState().challenges),
  getChallengeLeaderboard: (challengeId?: string): Promise<ChallengeLeaderboardRow[]> => {
    const id = challengeId ?? challengesStore.getState().challenges[0]?.id;
    return Promise.resolve(id ? (challengesStore.getState().leaderboards[id] ?? []) : []);
  },
  hasJoined: (challengeId: string) => !!challengesStore.getState().joined[challengeId],

  addFixture(input: FixtureInput): Fixture {
    const fixture: Fixture = { id: nextId("f"), available: 0, pending: 0, unavailable: 0, sport: "football", ...input };
    fixturesStore.setState((s) => ({ fixtures: [fixture, ...s.fixtures] }));
    return fixture;
  },

  updateFixture(id: string, patch: Partial<Fixture>) {
    fixturesStore.setState((s) => ({ fixtures: s.fixtures.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
  },

  addChallenge(input: ChallengeInput): Challenge {
    const challenge: Challenge = {
      id: nextId("c"),
      done: 0,
      participants: 0,
      teams: 0,
      daysLeft: 30,
      sponsor: input.sponsor ?? null,
      ...input,
    };
    challengesStore.setState((s) => ({ ...s, challenges: [challenge, ...s.challenges] }));
    return challenge;
  },

  joinChallenge(challengeId: string) {
    challengesStore.setState((s) => {
      if (s.joined[challengeId]) return s;
      const challenges = s.challenges.map((c) => (c.id === challengeId ? { ...c, participants: c.participants + 1 } : c));
      const existing = s.leaderboards[challengeId] ?? [];
      const unit = challenges.find((c) => c.id === challengeId)?.unit ?? "";
      const row: ChallengeLeaderboardRow = { pos: existing.length + 1, name: YOU, value: 0, unit };
      return { ...s, challenges, leaderboards: { ...s.leaderboards, [challengeId]: [...existing, row] }, joined: { ...s.joined, [challengeId]: true } };
    });
  },

  logProgress(challengeId: string, amount: number) {
    challengesStore.setState((s) => {
      const challenges = s.challenges.map((c) => (c.id === challengeId ? { ...c, done: Math.min(c.goal, c.done + amount) } : c));
      const board = (s.leaderboards[challengeId] ?? []).map((r) => (r.name === YOU ? { ...r, value: r.value + amount } : r));
      const sorted = [...board].sort((a, b) => b.value - a.value).map((r, i) => ({ ...r, pos: i + 1 }));
      return { ...s, challenges, leaderboards: { ...s.leaderboards, [challengeId]: sorted } };
    });
  },

  getAvailability(fixtureId: string, memberId: string, fallback: AvailabilityState): AvailabilityState {
    return availabilityStore.getState()[fixtureId]?.[memberId] ?? fallback;
  },

  setAvailability(fixtureId: string, memberId: string, state: AvailabilityState) {
    availabilityStore.setState((s) => ({
      ...s,
      [fixtureId]: { ...(s[fixtureId] ?? {}), [memberId]: state },
    }));
  },
};

export function useFixtures() {
  return useAsyncData(sportService.listFixtures, [fixturesStore.useStore()]);
}

export function useTraining() {
  return useAsyncData(sportService.listTraining);
}

export function useChallenges() {
  return useAsyncData(sportService.listChallenges, [challengesStore.useStore()]);
}

export function useChallengeLeaderboard(challengeId?: string) {
  return useAsyncData(() => sportService.getChallengeLeaderboard(challengeId), [challengeId, challengesStore.useStore()]);
}

export function useFixtureAvailability() {
  // Re-render on any availability change; callers read per-member state via sportService.getAvailability.
  return availabilityStore.useStore();
}
