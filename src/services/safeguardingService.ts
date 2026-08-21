// Safeguarding & compliance ("People" nav section).
import type { SafeguardingRecord } from "../domain/types";
import { useAsyncData } from "./useAsyncData";
import { createStore, nextId } from "./store";

const safeguarding: SafeguardingRecord[] = [
  { id: "sg1", name: "M. Taylor", role: "Head Coach", dbs: "Valid", expires: "14 Mar 2027", quals: "FA Level 2, First Aid", status: "Compliant" },
  { id: "sg2", name: "A. Smith", role: "Assistant Coach", dbs: "Expiring", expires: "02 Sep 2026", quals: "FA Level 1", status: "Action needed" },
  { id: "sg3", name: "S. Roberts", role: "Academy Coach", dbs: "Valid", expires: "20 Nov 2026", quals: "FA Level 2, Safeguarding", status: "Compliant" },
  { id: "sg4", name: "G. Hall", role: "Volunteer", dbs: "Missing", expires: "—", quals: "Safeguarding", status: "Action needed" },
];

export type Incident = { id: string; title: string; severity: "Low" | "Medium" | "High"; loggedAt: string };

type SafeguardingState = { incidents: Incident[] };
const store = createStore<SafeguardingState>("sa2:safeguarding", () => ({ incidents: [] }));

export const safeguardingService = {
  listRecords: (): Promise<SafeguardingRecord[]> => Promise.resolve(safeguarding),
  listIncidents: (): Promise<Incident[]> => Promise.resolve(store.getState().incidents),

  logIncident(title: string, severity: Incident["severity"]) {
    const incident: Incident = { id: nextId("inc"), title, severity, loggedAt: "Just now" };
    store.setState((s) => ({ incidents: [incident, ...s.incidents] }));
    return incident;
  },
};

export function useSafeguardingRecords() {
  return useAsyncData(safeguardingService.listRecords);
}

export function useSafeguardingIncidents() {
  return useAsyncData(safeguardingService.listIncidents, [store.useStore()]);
}
