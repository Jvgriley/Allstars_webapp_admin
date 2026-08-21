// Car pooling / community transport ("Operations" nav section).
import type { Carpool } from "../domain/types";
import { useAsyncData } from "./useAsyncData";

const carpool: Carpool = {
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

export const carpoolService = {
  getCarpool: (): Promise<Carpool> => Promise.resolve(carpool),
};

export function useCarpool() {
  return useAsyncData(carpoolService.getCarpool);
}
