// Generic reactive store used by services that need to hold mutable,
// session-scoped state (Sprint 2 — Functional Prototype).
//
// This is intentionally tiny: subscribe/notify plus sessionStorage
// persistence, exposed through React's built-in useSyncExternalStore so any
// number of components can read the same state and re-render when it
// changes. It is NOT a database — nothing here survives a closed tab/new
// session, and it holds only what already lives in mock data today, shaped
// the same way. Swapping a service's storage for a real API later means
// changing that service's functions, not any page component.
import { useSyncExternalStore } from "react";

export type Store<T> = {
  getState: () => T;
  setState: (updater: T | ((prev: T) => T)) => void;
  subscribe: (listener: () => void) => () => void;
  useStore: () => T;
};

export function createStore<T>(key: string, seed: () => T): Store<T> {
  let state: T = load();
  const listeners = new Set<() => void>();

  function load(): T {
    if (typeof window === "undefined") return seed();
    try {
      const raw = window.sessionStorage.getItem(key);
      if (raw) return JSON.parse(raw) as T;
    } catch {
      // Malformed or unavailable sessionStorage (e.g. private browsing) —
      // fall back to the seed and continue in-memory only.
    }
    return seed();
  }

  function persist() {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(state));
    } catch {
      // Ignore — state still works in-memory for the rest of the session.
    }
  }

  function getState(): T {
    return state;
  }

  function setState(updater: T | ((prev: T) => T)) {
    const next = typeof updater === "function" ? (updater as (prev: T) => T)(state) : updater;
    state = next;
    persist();
    listeners.forEach((l) => l());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  function useStore(): T {
    return useSyncExternalStore(subscribe, getState, seed);
  }

  return { getState, setState, subscribe, useStore };
}

let counter = 0;
/** Small helper for generating stable-enough mock ids without a backend. */
export function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}
