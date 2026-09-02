// Competitions — the Event Sports (Athletics/Swimming/Rowing/Cycling)
// equivalent of Fixtures. Deliberately its own service/store rather than
// extending sportService's fixturesStore: a Competition contests several
// SportEvents at once (see Competition.eventKeys in domain/types.ts) where
// a Fixture is always exactly one game, so the shapes genuinely differ —
// same reasoning sportConfigs.ts's module comment gives for not forcing
// Rowing's boats into Cricket's role-based shape. Every other Sprint 2/3
// convention (store-backed session state, useAsyncData-wrapped hooks) is
// unchanged — see services/store.ts and services/sportService.ts for the
// pattern this mirrors.
import type { Competition } from "../domain/types";
import { useAsyncData } from "./useAsyncData";
import { createStore, nextId } from "./store";

// Two competitions per Sprint 5 event sport, matching Sprint 4's "two
// fixtures per sport" seed-data convention (see sportService.ts's f5-f12).
const seedCompetitions: Competition[] = [
  { id: "comp1", name: "Regional Athletics Championships", comp: "Regional Championships", date: "Sat 5 Sep", time: "10:00", venue: "Riverside Athletics Stadium", sport: "athletics", eventKeys: ["100m", "200m", "400m", "800m", "1500m", "100m-hurdles", "long-jump", "4x100m-relay"] },
  { id: "comp2", name: "County Athletics Open Meet", comp: "County Open Meet", date: "Sun 20 Sep", time: "11:00", venue: "Meridian Track & Field Centre", sport: "athletics", eventKeys: ["100m", "200m", "400m", "long-jump"] },
  { id: "comp3", name: "Riverside Autumn Swim Gala", comp: "Autumn Swim Gala", date: "Sat 5 Sep", time: "09:00", venue: "Riverside Aquatics Centre", sport: "swimming", eventKeys: ["50m-freestyle", "100m-freestyle", "200m-freestyle", "100m-backstroke", "100m-breaststroke", "100m-butterfly", "4x100m-freestyle-relay", "4x100m-medley-relay"] },
  { id: "comp4", name: "Regional Swimming League Round 2", comp: "Regional League", date: "Sat 26 Sep", time: "09:30", venue: "Northgate Aquatics Centre", sport: "swimming", eventKeys: ["50m-freestyle", "100m-freestyle", "100m-backstroke", "4x100m-medley-relay"] },
  { id: "comp5", name: "Head of the River Regatta", comp: "Head of the River", date: "Sun 6 Sep", time: "08:00", venue: "Riverside Boat Club", sport: "rowing", eventKeys: ["coxless-pair", "coxed-four", "quad-sculls", "eight"] },
  { id: "comp6", name: "Autumn Regional Regatta", comp: "Autumn Regatta", date: "Sat 19 Sep", time: "08:30", venue: "Meridian Rowing Course", sport: "rowing", eventKeys: ["coxed-four", "eight"] },
  { id: "comp7", name: "Riverside Autumn Classic", comp: "Autumn Classic", date: "Sun 13 Sep", time: "09:00", venue: "Riverside Cycling Circuit", sport: "cycling", eventKeys: ["road-race", "time-trial", "criterium", "team-pursuit"] },
  { id: "comp8", name: "Regional Track Championships", comp: "Regional Track Championships", date: "Sat 26 Sep", time: "13:00", venue: "Northgate Velodrome", sport: "cycling", eventKeys: ["time-trial", "team-pursuit"] },
];

type CompetitionsState = { competitions: Competition[] };
const store = createStore<CompetitionsState>("sa5:competitions", () => ({ competitions: seedCompetitions }));

export type CompetitionInput = Pick<Competition, "name" | "comp" | "date" | "time" | "venue" | "sport"> & { eventKeys?: string[] };

export const competitionService = {
  listCompetitions: (): Promise<Competition[]> => Promise.resolve(store.getState().competitions),
  getCompetition: (id: string | undefined): Promise<Competition | undefined> =>
    Promise.resolve(store.getState().competitions.find((c) => c.id === id)),

  addCompetition(input: CompetitionInput): Competition {
    const competition: Competition = { id: nextId("comp"), eventKeys: [], ...input };
    store.setState((s) => ({ competitions: [competition, ...s.competitions] }));
    return competition;
  },

  updateCompetition(id: string, patch: Partial<Competition>) {
    store.setState((s) => ({ competitions: s.competitions.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  },
};

export function useCompetitions() {
  return useAsyncData(competitionService.listCompetitions, [store.useStore()]);
}

export function useCompetition(id: string | undefined) {
  return useAsyncData(() => competitionService.getCompetition(id), [id, store.useStore()]);
}
