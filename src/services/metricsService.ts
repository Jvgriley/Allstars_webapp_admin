// Shared trend series used across Dashboard, Analytics, Intelligence and Finance.
import type { ParticipationTrendPoint, RevenueTrendPoint } from "../domain/types";
import { useAsyncData } from "./useAsyncData";

const revenueTrend: RevenueTrendPoint[] = [
  { month: "Feb", revenue: 12400, attendance: 74 },
  { month: "Mar", revenue: 13900, attendance: 77 },
  { month: "Apr", revenue: 14600, attendance: 79 },
  { month: "May", revenue: 15800, attendance: 80 },
  { month: "Jun", revenue: 16200, attendance: 82 },
  { month: "Jul", revenue: 17100, attendance: 83 },
  { month: "Aug", revenue: 18420, attendance: 84 },
];

const participationTrend: ParticipationTrendPoint[] = [
  { week: "W1", u16: 68, u18: 72, seniors: 61 },
  { week: "W2", u16: 71, u18: 74, seniors: 63 },
  { week: "W3", u16: 76, u18: 73, seniors: 66 },
  { week: "W4", u16: 82, u18: 78, seniors: 69 },
  { week: "W5", u16: 88, u18: 80, seniors: 71 },
  { week: "W6", u16: 94, u18: 83, seniors: 74 },
];

export const metricsService = {
  getRevenueTrend: (): Promise<RevenueTrendPoint[]> => Promise.resolve(revenueTrend),
  getParticipationTrend: (): Promise<ParticipationTrendPoint[]> => Promise.resolve(participationTrend),
};

export function useRevenueTrend() {
  return useAsyncData(metricsService.getRevenueTrend);
}

export function useParticipationTrend() {
  return useAsyncData(metricsService.getParticipationTrend);
}
