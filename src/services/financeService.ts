// Finance dashboard ("Commercial" nav section).
import type { Finance, FinanceTransaction } from "../domain/types";
import { useAsyncData } from "./useAsyncData";
import { createStore } from "./store";

const seedFinance: Finance = {
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

const buyers = ["A. Smith", "O. Bailey", "T. Taylor", "R. Patel", "M. Khan", "E. Foster", "S. Williams", "G. Hughes"];

function transactionsFor(stream: string): FinanceTransaction[] {
  return Array.from({ length: 5 }, (_, i) => ({
    id: `${stream}-${i}`,
    stream,
    member: buyers[(stream.length + i) % buyers.length],
    amount: Math.round(20 + ((stream.length * 13 + i * 37) % 180)),
    status: i % 7 === 0 ? "Refunded" : i % 4 === 0 ? "Pending" : "Paid",
    date: `${(i % 27) + 1} Aug`,
  }));
}

const store = createStore<Finance>("sa2:finance", () => seedFinance);

export const financeService = {
  getFinance: (): Promise<Finance> => Promise.resolve(store.getState()),

  getTransactions(stream: string): Promise<FinanceTransaction[]> {
    // Derived deterministically from the stream name — a reasonable stand-in
    // for a drill-down until a real transactions API exists.
    return Promise.resolve(transactionsFor(stream));
  },

  syncNow() {
    store.setState((s) => ({ ...s, sync: { ...s.sync, last: "Just now", synced: s.sync.synced + s.sync.unmatched } }));
  },
};

export function useFinance() {
  return useAsyncData(financeService.getFinance, [store.useStore()]);
}

export function useFinanceTransactions(stream: string | undefined) {
  return useAsyncData(() => (stream ? financeService.getTransactions(stream) : Promise.resolve([])), [stream]);
}
