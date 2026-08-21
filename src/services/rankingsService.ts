// Allstars club rankings ("Intelligence" nav section).
import type { Ranking } from "../domain/types";
import { useAsyncData } from "./useAsyncData";

const rankings: Ranking[] = [
  { pos: 1, club: "Riverside FC", points: 9420, move: 2, region: "North West", self: true },
  { pos: 2, club: "United", points: 9180, move: 0, region: "North West" },
  { pos: 3, club: "Athletic Club", points: 8970, move: 4, region: "Yorkshire" },
  { pos: 4, club: "City Sports", points: 8810, move: -3, region: "Midlands" },
  { pos: 5, club: "Falcons", points: 8650, move: 1, region: "London" },
  { pos: 6, club: "Harbour Town", points: 8430, move: -1, region: "South West" },
  { pos: 7, club: "Greenfield", points: 8210, move: 2, region: "North East" },
  { pos: 8, club: "Kingsway", points: 7990, move: -2, region: "Scotland" },
];

export const rankingsService = {
  listRankings: (): Promise<Ranking[]> => Promise.resolve(rankings),
};

export function useRankings() {
  return useAsyncData(rankingsService.listRankings);
}
