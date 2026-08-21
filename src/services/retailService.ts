// Retail / club store ("Commercial" nav section).
import type { Retail } from "../domain/types";
import { useAsyncData } from "./useAsyncData";

const retail: Retail = {
  revenue: "£8,420",
  orders: 286,
  avg: "£29.44",
  top: "Club Training Shirt",
  products: [
    { id: "p1", name: "Home Shirt 25/26", price: "£39.99", stock: 42, sold: 118, cat: "Kit" },
    { id: "p2", name: "Club Training Shirt", price: "£24.99", stock: 87, sold: 204, cat: "Training" },
    { id: "p3", name: "Match Scarf", price: "£14.99", stock: 130, sold: 96, cat: "Merch" },
    { id: "p4", name: "Away Shirt 25/26", price: "£39.99", stock: 18, sold: 63, cat: "Kit" },
    { id: "p5", name: "Club Membership", price: "£12 / mo", stock: 999, sold: 412, cat: "Membership" },
  ],
};

export const retailService = {
  getRetail: (): Promise<Retail> => Promise.resolve(retail),
};

export function useRetail() {
  return useAsyncData(retailService.getRetail);
}
