// Allstars Rewards / performance rebate ("Commercial" nav section).
import type { Rewards } from "../domain/types";
import { useAsyncData } from "./useAsyncData";

const rewards: Rewards = {
  score: 87,
  annual: 5000,
  earned: 3850,
  next: 500,
  pointsRequired: 420,
  metrics: [
    { label: "Participation", value: 92 },
    { label: "Training", value: 84 },
    { label: "Challenges", value: 61 },
    { label: "Community", value: 78 },
    { label: "Member activity", value: 81 },
    { label: "Wellbeing", value: 69 },
  ],
  history: [
    { period: "Q1 2026", amount: 1200, status: "Paid" },
    { period: "Q4 2025", amount: 950, status: "Paid" },
    { period: "Q3 2025", amount: 1700, status: "Paid" },
  ],
};

export const rewardsService = {
  getRewards: (): Promise<Rewards> => Promise.resolve(rewards),
};

export function useRewards() {
  return useAsyncData(rewardsService.getRewards);
}
