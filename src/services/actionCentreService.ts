// Action Centre task queue ("Home" nav section).
import type { ActionTask } from "../domain/types";
import { useAsyncData } from "./useAsyncData";
import { createStore } from "./store";

const seedTasks: ActionTask[] = [
  { id: "t1", category: "Finance", title: "membership payments overdue", count: 12, severity: "high", actions: ["View", "Remind"] },
  { id: "t2", category: "Safeguarding", title: "safeguarding documents expiring", count: 4, severity: "high", actions: ["View", "Assign"] },
  { id: "t3", category: "Availability", title: "players haven't responded for Saturday", count: 17, severity: "medium", actions: ["View", "Remind"] },
  { id: "t4", category: "Transport", title: "car-share requests unresolved", count: 3, severity: "medium", actions: ["View", "Resolve"] },
  { id: "t5", category: "Engagement", title: "members showing declining engagement", count: 23, severity: "medium", actions: ["View", "Assign"] },
  { id: "t6", category: "Spaces", title: "AI stories awaiting approval", count: 2, severity: "low", actions: ["View", "Approve"] },
  { id: "t7", category: "Commercial", title: "sponsor contract approaching renewal", count: 1, severity: "medium", actions: ["View", "Assign"] },
  { id: "t8", category: "Live", title: "match highlights awaiting review", count: 3, severity: "low", actions: ["View", "Approve"] },
  { id: "t9", category: "Live", title: "Saturday's stream source is ready", severity: "low", actions: ["View"] },
];

type ActionCentreState = { open: ActionTask[]; resolved: ActionTask[]; dismissed: ActionTask[] };

const store = createStore<ActionCentreState>("sa2:action-centre", () => ({ open: seedTasks, resolved: [], dismissed: [] }));

function move(id: string, to: "resolved" | "dismissed") {
  store.setState((s) => {
    const task = s.open.find((t) => t.id === id);
    if (!task) return s;
    return { ...s, open: s.open.filter((t) => t.id !== id), [to]: [...s[to], task] };
  });
}

export const actionCentreService = {
  listTasks: (): Promise<ActionTask[]> => Promise.resolve(store.getState().open),
  getTask: (id: string): ActionTask | undefined => store.getState().open.find((t) => t.id === id),
  countResolvedToday: () => store.getState().resolved.length,
  resolveTask(id: string) {
    move(id, "resolved");
  },
  dismissTask(id: string) {
    move(id, "dismissed");
  },
};

export function useActionCentreTasks() {
  return useAsyncData(actionCentreService.listTasks, [store.useStore()]);
}

export function useActionCentreState() {
  return store.useStore();
}
