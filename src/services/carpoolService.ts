// Car pooling / community transport ("Operations" nav section).
import type { Carpool, CarpoolOffer, CarpoolRequest } from "../domain/types";
import { useAsyncData } from "./useAsyncData";
import { createStore, nextId } from "./store";

const seedCarpool: Carpool = {
  fixture: "Riverside U14 vs City FC",
  when: "Saturday 10:30 · City Park",
  travelling: 12,
  drivers: 8,
  spareSeats: 14,
  needsTransport: 3,
  offers: [
    { id: "o1", area: "Riverside / West End", driver: "Parent of A. Smith", seats: 3, status: "Confirmed" },
    { id: "o2", area: "Harbour / Docks", driver: "Parent of O. Bailey", seats: 2, status: "Confirmed" },
    { id: "o3", area: "Greenfield", driver: "Parent of E. Foster", seats: 4, status: "Pending" },
  ],
  requests: [
    { id: "r1", area: "North Gate", player: "T. Taylor", status: "Unmatched" },
    { id: "r2", area: "Kingsway", player: "R. Patel", status: "Unmatched" },
    { id: "r3", area: "West End", player: "M. Khan", status: "Matched" },
  ],
};

const store = createStore<Carpool>("sa2:carpool", () => seedCarpool);

export type OfferInput = Pick<CarpoolOffer, "area" | "driver" | "seats">;
export type RequestInput = Pick<CarpoolRequest, "area" | "player">;

export const carpoolService = {
  getCarpool: (): Promise<Carpool> => Promise.resolve(store.getState()),

  offerSeat(input: OfferInput) {
    const offer: CarpoolOffer = { id: nextId("o"), status: "Pending", ...input };
    store.setState((s) => ({ ...s, offers: [offer, ...s.offers], spareSeats: s.spareSeats + input.seats, drivers: s.drivers + 1 }));
  },

  requestSeat(input: RequestInput) {
    const request: CarpoolRequest = { id: nextId("r"), status: "Unmatched", ...input };
    store.setState((s) => ({ ...s, requests: [request, ...s.requests], needsTransport: s.needsTransport + 1 }));
  },

  matchRequest(id: string) {
    store.setState((s) => ({
      ...s,
      requests: s.requests.map((r) => (r.id === id ? { ...r, status: "Matched" } : r)),
      needsTransport: Math.max(0, s.needsTransport - 1),
      spareSeats: Math.max(0, s.spareSeats - 1),
    }));
  },
};

export function useCarpool() {
  return useAsyncData(carpoolService.getCarpool, [store.useStore()]);
}
