// Live match centre + broadcast management ("Live" nav section).
import type { Broadcasts, LiveMatch } from "../domain/types";
import { useAsyncData } from "./useAsyncData";

const liveMatch: LiveMatch = {
  home: "Riverside FC",
  away: "United Athletic",
  homeScore: 2,
  awayScore: 1,
  comp: "U18 Premier League",
  clock: "67:42",
  venue: "Riverside Sports Ground",
  viewers: 1284,
  peak: 1542,
  timeline: [
    { min: "67'", type: "GOAL", team: "Riverside FC", detail: "J. Williams" },
    { min: "61'", type: "SUBSTITUTION", team: "Riverside FC", detail: "M. Taylor → A. Smith" },
    { min: "54'", type: "YELLOW CARD", team: "United Athletic", detail: "D. Cooper" },
    { min: "HT", type: "HALF TIME", team: "", detail: "Riverside 1 – 1 United" },
    { min: "33'", type: "GOAL", team: "United Athletic", detail: "R. Foster" },
    { min: "12'", type: "GOAL", team: "Riverside FC", detail: "O. Bailey" },
  ],
  potm: [
    { name: "J. Williams", pct: 48 },
    { name: "A. Smith", pct: 31 },
    { name: "M. Taylor", pct: 21 },
  ],
  aiInsights: [
    { title: "AI MATCH INSIGHT", body: "Riverside have generated 63% of their attacking activity during the last 15 minutes." },
    { title: "PLAYER MOMENT", body: "J. Williams has now contributed to four goals in his last three fixtures." },
    { title: "CLUB STORY", body: "A win today could move Riverside into the regional Allstars Top 5." },
  ],
};

const broadcasts: Broadcasts = {
  live: [{ id: "b1", title: "Riverside U18 vs United Athletic", comp: "U18 Premier", viewers: 1284, source: "Veo" }],
  upcoming: [
    { id: "b2", title: "Women's First vs Falcons", comp: "Regional Cup", when: "Sun 21 Aug · 13:00", source: "Veo" },
    { id: "b3", title: "Riverside U14 vs City FC", comp: "Youth League", when: "Sat 27 Aug · 10:30", source: "Pixellot" },
  ],
  completed: [
    { id: "b4", title: "Riverside FC vs Harbour Town", comp: "Senior League", when: "13 Aug", views: 2481, highlights: 14 },
  ],
};

export const liveService = {
  getLiveMatch: (): Promise<LiveMatch> => Promise.resolve(liveMatch),
  getBroadcasts: (): Promise<Broadcasts> => Promise.resolve(broadcasts),
};

export function useLiveMatch() {
  return useAsyncData(liveService.getLiveMatch);
}

export function useBroadcasts() {
  return useAsyncData(liveService.getBroadcasts);
}
