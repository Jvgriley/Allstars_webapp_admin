// Organisation identity + top-level KPIs shown on the dashboard header/stat strip.
import type { Kpi, Organisation } from "../domain/types";
import { useAsyncData } from "./useAsyncData";

const org: Organisation = {
  name: "Riverside FC",
  plan: "Allstars Club",
  rank: 7,
  participationScore: 87,
};

const kpis: Kpi[] = [
  { id: "members", label: "Active Members", value: "1,284", delta: "+6.4%", up: true },
  { id: "active", label: "Active This Month", value: "1,042", delta: "81%", up: true },
  { id: "revenue", label: "Monthly Revenue", value: "£18,420", delta: "+12%", up: true },
  { id: "attendance", label: "Training Attendance", value: "84%", delta: "+4%", up: true },
  { id: "rank", label: "Allstars Club Rank", value: "#7", delta: "+3", up: true },
  { id: "score", label: "Participation Score", value: "87/100", delta: "Top 10%", up: true },
];

export const organisationService = {
  getOrganisation: (): Promise<Organisation> => Promise.resolve(org),
  getKpis: (): Promise<Kpi[]> => Promise.resolve(kpis),
};

export function useOrganisation() {
  return useAsyncData(organisationService.getOrganisation);
}

export function useKpis() {
  return useAsyncData(organisationService.getKpis);
}
