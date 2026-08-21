// Fixtures, training sessions, and challenges — the "Sport" nav section.
import type { Challenge, ChallengeLeaderboardRow, Fixture, TrainingSession } from "../domain/types";
import { useAsyncData } from "./useAsyncData";

const fixtures: Fixture[] = [
  { id: "f1", home: "Riverside U18", away: "United Athletic", date: "Sat 20 Aug", time: "14:00", comp: "U18 Premier", venue: "Riverside Sports Ground", available: 17, pending: 4, unavailable: 5 },
  { id: "f2", home: "Riverside U14", away: "City FC", date: "Sat 20 Aug", time: "10:30", comp: "Youth League", venue: "City Park", available: 12, pending: 6, unavailable: 3 },
  { id: "f3", home: "Women's First", away: "Falcons", date: "Sun 21 Aug", time: "13:00", comp: "Regional Cup", venue: "Riverside Sports Ground", available: 15, pending: 2, unavailable: 4 },
];

const training: TrainingSession[] = [
  { id: "tr1", team: "U16 Squad", date: "Thu 18 Aug", time: "18:00", focus: "Pressing & transitions", coach: "M. Taylor" },
  { id: "tr2", team: "Seniors", date: "Fri 19 Aug", time: "19:30", focus: "Set pieces", coach: "A. Smith" },
  { id: "tr3", team: "Academy", date: "Sat 20 Aug", time: "09:00", focus: "Ball mastery", coach: "S. Roberts" },
];

const challenges: Challenge[] = [
  { id: "c1", name: "Row The Atlantic", type: "Rowing", goal: 5500, unit: "km", done: 4127, participants: 482, teams: 28, daysLeft: 8, sponsor: "AquaFit" },
  { id: "c2", name: "August Cycling Streak", type: "Cycling", goal: 3000, unit: "km", done: 2873, participants: 214, teams: 12, daysLeft: 6, sponsor: null },
  { id: "c3", name: "Mindful March-athon", type: "Mindfulness", goal: 1000, unit: "sessions", done: 640, participants: 356, teams: 20, daysLeft: 14, sponsor: "CalmCo" },
];

const challengeLeaderboard: ChallengeLeaderboardRow[] = [
  { pos: 1, name: "U16 Squad", value: 842, unit: "km" },
  { pos: 2, name: "Seniors", value: 731, unit: "km" },
  { pos: 3, name: "Women's First", value: 688, unit: "km" },
  { pos: 4, name: "Academy", value: 512, unit: "km" },
  { pos: 5, name: "U14 Reds", value: 421, unit: "km" },
];

export const sportService = {
  listFixtures: (): Promise<Fixture[]> => Promise.resolve(fixtures),
  listTraining: (): Promise<TrainingSession[]> => Promise.resolve(training),
  listChallenges: (): Promise<Challenge[]> => Promise.resolve(challenges),
  getChallengeLeaderboard: (): Promise<ChallengeLeaderboardRow[]> => Promise.resolve(challengeLeaderboard),
};

export function useFixtures() {
  return useAsyncData(sportService.listFixtures);
}

export function useTraining() {
  return useAsyncData(sportService.listTraining);
}

export function useChallenges() {
  return useAsyncData(sportService.listChallenges);
}

export function useChallengeLeaderboard() {
  return useAsyncData(sportService.getChallengeLeaderboard);
}
