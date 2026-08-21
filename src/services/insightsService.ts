// Allstars Intelligence insight cards, surfaced on Dashboard + Intelligence.
import type { Insight } from "../domain/types";
import { useAsyncData } from "./useAsyncData";

const insights: Insight[] = [
  { id: "i1", kind: "OPPORTUNITY", title: "23 members are drifting", body: "23 members haven't participated in an activity for 14+ days. A nudge could re-engage them.", cta: "View members" },
  { id: "i2", kind: "TREND", title: "U16 on a six-week climb", body: "U16 training attendance has increased for six consecutive weeks — the strongest run this season.", cta: "See squad" },
  { id: "i3", kind: "COMMERCIAL", title: "Renewals tracking ahead", body: "Membership renewals are tracking 11% ahead of the same period last season.", cta: "Open finance" },
  { id: "i4", kind: "PERFORMANCE", title: "67% fixture win rate", body: "Your win rate across all squads is up 9 points on last season.", cta: "View results" },
];

export const insightsService = {
  listInsights: (): Promise<Insight[]> => Promise.resolve(insights),
};

export function useInsights() {
  return useAsyncData(insightsService.listInsights);
}
