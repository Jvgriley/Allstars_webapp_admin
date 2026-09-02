// Recorded results, personal bests and event rankings — Sprint 5's Results
// Engine. Deliberately sport-agnostic across time/distance/points (see
// Result.value's module comment in domain/types.ts): every SportEvent
// carries its own resultType/resultUnit/rankingDirection (see
// sportConfigs.ts), so this module never special-cases a sport by name,
// the same "everything sport-shaped is data, not code" discipline
// sportConfigs.ts/teamSheetService.ts already follow.
import type { Result } from "../domain/types";
import type { RankingDirection, ResultType, SportEvent, SportKey } from "../domain/sportConfigs";
import { sportConfigs } from "../domain/sportConfigs";
import { useAsyncData } from "./useAsyncData";
import { createStore, nextId } from "./store";

// A handful of seeded results so Rankings/Member Profile have something
// real to show without requiring a user to record results first — same
// "demo data quality" bar Sprint 4's fixtures/members seeds set. Values
// are in each event's base unit (seconds for time, metres for distance,
// raw points) — see Result's module comment in domain/types.ts.
const seedResults: Result[] = [
  { id: "res1", competitionId: "comp2", eventKey: "100m", sport: "athletics", resultType: "time", memberIds: ["ath1"], value: 11.42, recordedAt: "2026-08-20T10:00:00.000Z" },
  { id: "res2", competitionId: "comp2", eventKey: "100m", sport: "athletics", resultType: "time", memberIds: ["ath8"], value: 11.61, recordedAt: "2026-08-20T10:00:00.000Z" },
  { id: "res3", competitionId: "comp2", eventKey: "200m", sport: "athletics", resultType: "time", memberIds: ["ath2"], value: 23.18, recordedAt: "2026-08-20T10:30:00.000Z" },
  { id: "res4", competitionId: "comp2", eventKey: "long-jump", sport: "athletics", resultType: "distance", memberIds: ["ath7"], value: 6.85, recordedAt: "2026-08-20T11:00:00.000Z" },
  { id: "res5", competitionId: "comp4", eventKey: "50m-freestyle", sport: "swimming", resultType: "time", memberIds: ["sw1"], value: 24.87, recordedAt: "2026-08-21T09:00:00.000Z" },
  { id: "res6", competitionId: "comp4", eventKey: "100m-freestyle", sport: "swimming", resultType: "time", memberIds: ["sw2"], value: 54.32, recordedAt: "2026-08-21T09:20:00.000Z" },
  { id: "res7", competitionId: "comp4", eventKey: "100m-backstroke", sport: "swimming", resultType: "time", memberIds: ["sw4"], value: 59.71, recordedAt: "2026-08-21T09:40:00.000Z" },
  { id: "res8", competitionId: "comp6", eventKey: "eight", sport: "rowing", resultType: "time", memberIds: ["rw1", "rw2", "rw3", "rw4", "rw5", "rw6", "rw7", "rw8", "rw9"], value: 342.6, recordedAt: "2026-08-19T08:30:00.000Z" },
  { id: "res9", competitionId: "comp8", eventKey: "time-trial", sport: "cycling", resultType: "time", memberIds: ["cy2"], value: 1284.4, recordedAt: "2026-08-26T13:30:00.000Z" },
  { id: "res10", competitionId: "comp8", eventKey: "team-pursuit", sport: "cycling", resultType: "time", memberIds: ["cy1", "cy4", "cy7", "cy10"], value: 248.9, recordedAt: "2026-08-26T14:00:00.000Z" },
];

type ResultsState = { results: Result[] };
const store = createStore<ResultsState>("sa5:results", () => ({ results: seedResults }));

export type RankedResult = Result & { position: number };
export type PersonalBest = { eventKey: string; eventLabel: string; resultType: ResultType; resultUnit: string; value: number; competitionId: string };

/** Formats a raw base-unit value for display — seconds as m:ss.xx once over a minute, metres/points otherwise. */
export function formatResultValue(resultType: ResultType, value: number, unit: string): string {
  if (resultType === "time") {
    if (value < 60) return `${value.toFixed(2)}${unit}`;
    const minutes = Math.floor(value / 60);
    const seconds = value - minutes * 60;
    return `${minutes}:${seconds.toFixed(2).padStart(5, "0")}`;
  }
  if (resultType === "distance") return `${value.toFixed(2)}${unit}`;
  return `${value.toFixed(0)} ${unit}`;
}

function betterOf(a: number, b: number, direction: RankingDirection): number {
  return direction === "asc" ? Math.min(a, b) : Math.max(a, b);
}

export const resultsService = {
  listResults: (): Promise<Result[]> => Promise.resolve(store.getState().results),

  listForEvent(competitionId: string, eventKey: string): Result[] {
    return store.getState().results.filter((r) => r.competitionId === competitionId && r.eventKey === eventKey);
  },

  listForMember(memberId: string): Result[] {
    return store.getState().results.filter((r) => r.memberIds.includes(memberId));
  },

  recordResult(input: { competitionId: string; eventKey: string; sport: SportKey; resultType: ResultType; memberIds: string[]; value: number }): Result {
    const result: Result = { id: nextId("res"), recordedAt: new Date().toISOString(), ...input };
    store.setState((s) => ({ results: [result, ...s.results] }));
    return result;
  },

  removeResult(id: string) {
    store.setState((s) => ({ results: s.results.filter((r) => r.id !== id) }));
  },

  /** Ranks every recorded result for one competition+event, best first (direction-aware — see SportEvent.rankingDirection). */
  getRankings(competitionId: string, eventKey: string, event: SportEvent): RankedResult[] {
    const results = resultsService.listForEvent(competitionId, eventKey);
    const sorted = [...results].sort((a, b) => (event.rankingDirection === "asc" ? a.value - b.value : b.value - a.value));
    return sorted.map((r, i) => ({ ...r, position: i + 1 }));
  },

  /** A member's best recorded value per event they've competed in for one sport — the athlete-profile equivalent of a club league table row. */
  getPersonalBests(memberId: string, sport: SportKey): PersonalBest[] {
    const events = sportConfigs[sport]?.events ?? [];
    const mine = resultsService.listForMember(memberId).filter((r) => r.sport === sport);
    const bestByEvent = new Map<string, Result>();
    for (const r of mine) {
      const existing = bestByEvent.get(r.eventKey);
      const event = events.find((e) => e.key === r.eventKey);
      if (!event) continue;
      if (!existing || betterOf(existing.value, r.value, event.rankingDirection) === r.value) {
        bestByEvent.set(r.eventKey, r);
      }
    }
    return [...bestByEvent.values()].map((r) => {
      const event = events.find((e) => e.key === r.eventKey)!;
      return { eventKey: r.eventKey, eventLabel: event.label, resultType: event.resultType, resultUnit: event.resultUnit, value: r.value, competitionId: r.competitionId };
    });
  },
};

export function useResults() {
  return useAsyncData(resultsService.listResults, [store.useStore()]);
}
