// Sprint 4 — global "which sport is the organisation currently working in"
// context. Same tiny session-store pattern as every other Sprint 2/3
// service (see store.ts) — nothing new architecturally, just a new piece
// of session state that the Sport Selector (AppShell) writes to and that
// Fixtures/Availability/Members/Teams read from to filter their content.
//
// Deliberately NOT a React Context provider: every other piece of
// cross-cutting session state in this app (fixtures, members, team
// selections…) already goes through this same store/useSyncExternalStore
// pattern rather than Context, so this stays consistent with that rather
// than introducing a second state-management approach for one value.
import type { SportKey } from "../domain/sportConfigs";
import { sportConfigs } from "../domain/sportConfigs";
import { createStore } from "./store";

// The five Sprint 4 demonstration sports, in the order the brief lists
// them. Rugby Union (the Sprint 3 demo sport) deliberately isn't offered
// here — its existing fixture/team-sheet flow keeps working untouched if
// visited directly, but the brief is specific that the Sport Selector
// switches between these five.
export const selectableSports: SportKey[] = ["football", "basketball", "rugbySevens", "hockey", "cricket"];

type SportContextState = { currentSport: SportKey };
const store = createStore<SportContextState>("sa4:sport-context", () => ({ currentSport: "football" }));

// Sprint 4 seeded dedicated per-sport members only for the four brand-new
// sports (see membersService.ts). Football's existing 32-member seed is
// also what the Sprint 3 Rugby Union demo fixture draws its roster from
// (via SportConfig.fallbackEligibility — no member has sport-specific
// rugby-union positions, by design, see sportConfigs.ts's module comment
// on that config). So: a fixture whose sport has a dedicated member pool
// scopes the roster to it; anything else (football, rugby union) keeps
// drawing from the original football-seeded pool, exactly as Sprint 1–3
// behaved, with no regression.
const dedicatedRosterSports = new Set<SportKey>(["basketball", "rugbySevens", "hockey", "cricket"]);

/** Which `Member.sport` value a fixture/team-sheet roster for `sport` should be filtered to. */
export function rosterSportFor(sport: SportKey): SportKey {
  return dedicatedRosterSports.has(sport) ? sport : "football";
}

export const sportContextService = {
  getCurrentSport: (): SportKey => store.getState().currentSport,
  setCurrentSport(sport: SportKey) {
    if (!sportConfigs[sport]) return;
    store.setState({ currentSport: sport });
  },
};

/** Re-renders on any sport switch, same convention as useFixtureAvailability()/useTeamSheetsStore(). */
export function useCurrentSport(): SportKey {
  return store.useStore().currentSport;
}
