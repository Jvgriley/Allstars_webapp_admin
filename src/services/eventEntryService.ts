// Individual event entries — Sprint 5. Covers "individual"-type SportEvents
// only (see sportConfigs.ts's SportEvent module comment); "relay"/"crew"
// events reuse teamSheetService via a synthetic SportConfig instead (see
// buildEventSelectionConfig), since a running/seat order is exactly what
// TeamSelection.starters already models. This module is the individual-
// entry equivalent: capped by SportEvent.entryLimit, no order, no slots.
import type { EventEntry, Member } from "../domain/types";
import type { PositionKey, SportEvent } from "../domain/sportConfigs";
import { createStore } from "./store";
import type { AvailabilityLookup } from "./teamSheetService";
import type { SelectionInsight } from "../domain/types";

type EventEntriesState = Record<string, EventEntry>;
const store = createStore<EventEntriesState>("sa5:event-entries", () => ({}));

function entryKey(competitionId: string, eventKey: string): string {
  return `${competitionId}:${eventKey}`;
}

function freshEntry(competitionId: string, eventKey: string): EventEntry {
  return { competitionId, eventKey, entries: [], status: "Draft" };
}

export const eventEntryService = {
  getEntry(competitionId: string, eventKey: string): EventEntry {
    return store.getState()[entryKey(competitionId, eventKey)] ?? freshEntry(competitionId, eventKey);
  },

  /**
   * Eligibility for an individual event — reuses the same
   * primaryPosition/secondaryPositions fields formation sports use, except
   * here they hold event keys (see sportConfigs.ts's SportEvent module
   * comment) rather than positions. A member with no event specialty
   * recorded at all is treated as open to any event, the same permissive
   * fallback teamSheetService.getEligiblePositions applies when a member
   * has no sport-specific positions set.
   */
  isEligibleForEvent(member: Member, eventKey: PositionKey): boolean {
    const own = [member.primaryPosition, ...(member.secondaryPositions ?? [])].filter((k): k is PositionKey => !!k);
    if (own.length === 0) return true;
    return own.includes(eventKey);
  },

  /** Adds a member to this event's entry list. Silently no-ops past SportEvent.entryLimit or on a duplicate entry — callers (see Competitions.tsx) check capacity first so they can toast a clear "entry list is full" message rather than relying on this as the only signal. */
  addEntry(competitionId: string, event: SportEvent, memberId: string) {
    store.setState((s) => {
      const k = entryKey(competitionId, event.key);
      const current = s[k] ?? freshEntry(competitionId, event.key);
      if (current.entries.includes(memberId)) return s;
      if (event.entryLimit != null && current.entries.length >= event.entryLimit) return s;
      return { ...s, [k]: { ...current, entries: [...current.entries, memberId], updatedAt: new Date().toISOString() } };
    });
  },

  removeEntry(competitionId: string, eventKey: string, memberId: string) {
    store.setState((s) => {
      const k = entryKey(competitionId, eventKey);
      const current = s[k] ?? freshEntry(competitionId, eventKey);
      return { ...s, [k]: { ...current, entries: current.entries.filter((id) => id !== memberId), updatedAt: new Date().toISOString() } };
    });
  },

  resetEntries(competitionId: string, eventKey: string) {
    store.setState((s) => ({ ...s, [entryKey(competitionId, eventKey)]: freshEntry(competitionId, eventKey) }));
  },

  publish(competitionId: string, eventKey: string) {
    store.setState((s) => {
      const k = entryKey(competitionId, eventKey);
      const current = s[k] ?? freshEntry(competitionId, eventKey);
      return { ...s, [k]: { ...current, status: "Published", publishedAt: new Date().toISOString() } };
    });
  },

  unpublish(competitionId: string, eventKey: string) {
    store.setState((s) => {
      const k = entryKey(competitionId, eventKey);
      const current = s[k] ?? freshEntry(competitionId, eventKey);
      return { ...s, [k]: { ...current, status: "Draft" } };
    });
  },

  /**
   * Deterministic mock Allstars Intelligence for an entry list in
   * progress — same spirit and shape as teamSheetService.getSelectionInsights,
   * kept separate rather than merged into it since the underlying data
   * shape (a flat entry list, no slots) genuinely differs.
   */
  getEntryInsights(event: SportEvent, entry: EventEntry, roster: Member[], getAvailability: AvailabilityLookup): SelectionInsight[] {
    const insights: SelectionInsight[] = [];
    const limit = event.entryLimit ?? roster.length;
    insights.push({
      id: "entry-status",
      kind: "PERFORMANCE",
      title: "Entry status",
      body: `${entry.entries.length} of ${limit} entry place${limit === 1 ? "" : "s"} filled for ${event.label}.`,
    });

    const enteredIds = new Set(entry.entries);
    const eligiblePending = roster.filter((m) => !enteredIds.has(m.id) && getAvailability(m.id) === "orange" && eventEntryService.isEligibleForEvent(m, event.key));
    if (eligiblePending.length > 0 && entry.entries.length < limit) {
      insights.push({
        id: "entry-opportunity",
        kind: "OPPORTUNITY",
        title: "Entry opportunity",
        body: `${eligiblePending.length} pending athlete${eligiblePending.length === 1 ? " is" : "s are"} eligible for ${event.label} with ${limit - entry.entries.length} place${limit - entry.entries.length === 1 ? "" : "s"} still open.`,
      });
    }

    if (entry.entries.length >= limit && limit > 0) {
      insights.push({ id: "entry-full", kind: "TREND", title: "Entry list full", body: `${event.label} has reached its entry limit of ${limit}.` });
    } else if (entry.entries.length === 0) {
      insights.push({ id: "entry-empty", kind: "RISK", title: "No entries yet", body: `No athlete has been entered into ${event.label} yet.` });
    }

    return insights;
  },
};

export function useEventEntriesStore() {
  return store.useStore();
}
