// Calendar / Diary events ("Operations" nav section). Fixtures and training
// sessions still come from sportService — this holds the extra event types
// (meetings, tournaments, fundraisers, safeguarding renewals, etc.) that a
// club admin creates directly on the calendar.
import type { CalendarEvent, CalendarEventType } from "../domain/types";
import { useAsyncData } from "./useAsyncData";
import { createStore, nextId } from "./store";

export const eventTypeColor: Record<CalendarEventType, string> = {
  Fixture: "#ef3aa3",
  Training: "#2a1b6b",
  Event: "#d27bbf",
  Meeting: "#b6a8d8",
  Safeguarding: "#e11d48",
};

const seedEvents: CalendarEvent[] = [
  { id: "ce1", day: 4, title: "Team meeting", type: "Meeting" },
  { id: "ce2", day: 12, title: "Fundraiser", type: "Event" },
  { id: "ce3", day: 24, title: "DBS renewal", type: "Safeguarding" },
];

type CalendarState = { events: CalendarEvent[] };
const store = createStore<CalendarState>("sa2:calendar", () => ({ events: seedEvents }));

export type EventInput = Pick<CalendarEvent, "day" | "title" | "type" | "time">;

export const calendarService = {
  listEvents: (): Promise<CalendarEvent[]> => Promise.resolve(store.getState().events),

  addEvent(input: EventInput): CalendarEvent {
    const event: CalendarEvent = { id: nextId("ce"), ...input };
    store.setState((s) => ({ events: [...s.events, event] }));
    return event;
  },

  updateEvent(id: string, patch: Partial<CalendarEvent>) {
    store.setState((s) => ({ events: s.events.map((e) => (e.id === id ? { ...e, ...patch } : e)) }));
  },

  removeEvent(id: string) {
    store.setState((s) => ({ events: s.events.filter((e) => e.id !== id) }));
  },
};

export function useCalendarEvents() {
  return useAsyncData(calendarService.listEvents, [store.useStore()]);
}
