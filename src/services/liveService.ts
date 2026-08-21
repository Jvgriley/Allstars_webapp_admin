// Live match centre + broadcast management ("Live" nav section).
import type { Broadcasts, LiveMatch, MatchEvent, UpcomingBroadcast } from "../domain/types";
import { useAsyncData } from "./useAsyncData";
import { createStore, nextId } from "./store";

const seedLiveMatch: LiveMatch = {
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

const seedBroadcasts: Broadcasts = {
  live: [{ id: "b1", title: "Riverside U18 vs United Athletic", comp: "U18 Premier", viewers: 1284, source: "Veo" }],
  upcoming: [
    { id: "b2", title: "Women's First vs Falcons", comp: "Regional Cup", when: "Sun 21 Aug · 13:00", source: "Veo" },
    { id: "b3", title: "Riverside U14 vs City FC", comp: "Youth League", when: "Sat 27 Aug · 10:30", source: "Pixellot" },
  ],
  completed: [
    { id: "b4", title: "Riverside FC vs Harbour Town", comp: "Senior League", when: "13 Aug", views: 2481, highlights: 14 },
  ],
};

type LiveState = { match: LiveMatch; ended: boolean; votedFor: string | null };
const liveStore = createStore<LiveState>("sa2:live-match", () => ({ match: seedLiveMatch, ended: false, votedFor: null }));

const broadcastsStore = createStore<Broadcasts>("sa2:broadcasts", () => seedBroadcasts);

export type BroadcastInput = Pick<UpcomingBroadcast, "title" | "comp" | "when" | "source">;

export const liveService = {
  getLiveMatch: (): Promise<LiveMatch> => Promise.resolve(liveStore.getState().match),
  isEnded: () => liveStore.getState().ended,
  votedFor: () => liveStore.getState().votedFor,
  getBroadcasts: (): Promise<Broadcasts> => Promise.resolve(broadcastsStore.getState()),

  setScore(homeScore: number, awayScore: number) {
    liveStore.setState((s) => ({ ...s, match: { ...s.match, homeScore, awayScore } }));
  },

  addGoal(team: "home" | "away", scorer: string) {
    liveStore.setState((s) => {
      const match = { ...s.match };
      if (team === "home") match.homeScore += 1;
      else match.awayScore += 1;
      const event: MatchEvent = { min: match.clock, type: "GOAL", team: team === "home" ? match.home : match.away, detail: scorer };
      match.timeline = [event, ...match.timeline];
      return { ...s, match };
    });
  },

  addTimelineEvent(event: MatchEvent) {
    liveStore.setState((s) => ({ ...s, match: { ...s.match, timeline: [event, ...s.match.timeline] } }));
  },

  vote(name: string) {
    liveStore.setState((s) => {
      if (s.votedFor) return s;
      const total = s.match.potm.reduce((a, p) => a + p.pct, 0) || 100;
      const potm = s.match.potm.map((p) => (p.name === name ? { ...p, pct: p.pct + 1 } : p));
      const newTotal = potm.reduce((a, p) => a + p.pct, 0);
      const normalised = potm.map((p) => ({ ...p, pct: Math.round((p.pct / newTotal) * total) }));
      return { ...s, votedFor: name, match: { ...s.match, potm: normalised } };
    });
  },

  endStream() {
    liveStore.setState((s) => ({ ...s, ended: true }));
  },

  publishBroadcast(input: BroadcastInput) {
    const broadcast: UpcomingBroadcast = { id: nextId("b"), ...input };
    broadcastsStore.setState((s) => ({ ...s, upcoming: [broadcast, ...s.upcoming] }));
    return broadcast;
  },
};

export function useLiveMatch() {
  return useAsyncData(liveService.getLiveMatch, [liveStore.useStore()]);
}

export function useBroadcasts() {
  return useAsyncData(liveService.getBroadcasts, [broadcastsStore.useStore()]);
}

export function useLiveMeta() {
  return liveStore.useStore();
}
