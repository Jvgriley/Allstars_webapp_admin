// Retail / club store ("Commercial" nav section).
import type { Retail, RetailOrder, RetailProduct } from "../domain/types";
import { useAsyncData } from "./useAsyncData";
import { createStore, nextId } from "./store";

const seedRetail: Retail = {
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

const seedOrders: RetailOrder[] = [
  { id: "ro1", product: "Club Training Shirt", buyer: "A. Smith", qty: 1, total: "£24.99", status: "Pending", time: "10 min ago" },
  { id: "ro2", product: "Home Shirt 25/26", buyer: "O. Bailey", qty: 2, total: "£79.98", status: "Pending", time: "42 min ago" },
  { id: "ro3", product: "Match Scarf", buyer: "T. Taylor", qty: 1, total: "£14.99", status: "Fulfilled", time: "2h ago" },
];

type RetailState = { retail: Retail; orders: RetailOrder[] };
const store = createStore<RetailState>("sa2:retail", () => ({ retail: seedRetail, orders: seedOrders }));

export type ProductInput = Pick<RetailProduct, "name" | "price" | "cat"> & Partial<RetailProduct>;

export const retailService = {
  getRetail: (): Promise<Retail> => Promise.resolve(store.getState().retail),
  listOrders: (): Promise<RetailOrder[]> => Promise.resolve(store.getState().orders),

  addProduct(input: ProductInput) {
    const product: RetailProduct = { id: nextId("p"), stock: 0, sold: 0, ...input };
    store.setState((s) => ({ ...s, retail: { ...s.retail, products: [product, ...s.retail.products] } }));
  },

  adjustStock(id: string, delta: number) {
    store.setState((s) => ({
      ...s,
      retail: { ...s.retail, products: s.retail.products.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)) },
    }));
  },

  discontinue(id: string) {
    store.setState((s) => ({
      ...s,
      retail: { ...s.retail, products: s.retail.products.map((p) => (p.id === id ? { ...p, stock: 0 } : p)) },
    }));
  },

  fulfilOrder(id: string) {
    store.setState((s) => ({ ...s, orders: s.orders.map((o) => (o.id === id ? { ...o, status: "Fulfilled" } : o)) }));
  },
};

export function useRetail() {
  return useAsyncData(retailService.getRetail, [store.useStore()]);
}

export function useRetailOrders() {
  return useAsyncData(retailService.listOrders, [store.useStore()]);
}
