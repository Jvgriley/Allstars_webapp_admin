// Finance dashboard ("Commercial" nav section).
import type { Finance } from "../domain/types";
import { useAsyncData } from "./useAsyncData";

const finance: Finance = {
  streams: [
    { label: "Membership", value: 11200 },
    { label: "Subscriptions", value: 3100 },
    { label: "Match Fees", value: 980 },
    { label: "Events", value: 1420 },
    { label: "Retail", value: 8420 },
    { label: "Fundraising", value: 2100 },
    { label: "Sponsorship", value: 4500 },
    { label: "Advertising", value: 640 },
  ],
  outstanding: 2480,
  refunds: 320,
  allstarsFees: 540,
  net: 27510,
  sync: { last: "8 minutes ago", synced: 1284, unmatched: 4 },
};

export const financeService = {
  getFinance: (): Promise<Finance> => Promise.resolve(finance),
};

export function useFinance() {
  return useAsyncData(financeService.getFinance);
}
