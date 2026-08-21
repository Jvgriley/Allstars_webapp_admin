// Role-based dashboard summaries ("Admin" nav section).
import type { RoleDashboardEntry } from "../domain/types";
import { useAsyncData } from "./useAsyncData";

const roleDashboards: RoleDashboardEntry[] = [
  { role: "Club Admin", focus: "Members, finance, operations", metric: "1,284 members · £18.4k / mo" },
  { role: "Coach", focus: "Squad, training, availability", metric: "84% attendance this month" },
  { role: "Team Manager", focus: "Fixtures & availability", metric: "17 available for Saturday" },
  { role: "Finance Admin", focus: "Revenue, payments, sync", metric: "£2,480 outstanding" },
  { role: "Safeguarding Officer", focus: "DBS, consent, incidents", metric: "4 documents expiring" },
  { role: "Content Manager", focus: "Spaces, media, stories", metric: "2 stories to approve" },
  { role: "Governing Body", focus: "National participation", metric: "Region up 14%" },
  { role: "Corporate Admin", focus: "Employee sport & wellbeing", metric: "1,284 active participants" },
  { role: "Commercial Manager", focus: "Sponsors & advertising", metric: "£52.7k committed" },
];

export const adminService = {
  listRoleDashboards: (): Promise<RoleDashboardEntry[]> => Promise.resolve(roleDashboards),
};

export function useRoleDashboards() {
  return useAsyncData(adminService.listRoleDashboards);
}
