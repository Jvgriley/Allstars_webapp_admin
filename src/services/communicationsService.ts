// Communications compose/send/schedule log ("Operations" nav section).
import type { CommunicationRecord } from "../domain/types";
import { useAsyncData } from "./useAsyncData";
import { createStore, nextId } from "./store";

type CommunicationsState = { sent: CommunicationRecord[] };
const store = createStore<CommunicationsState>("sa2:communications", () => ({ sent: [] }));

export type SendInput = Pick<CommunicationRecord, "channel" | "audience" | "subject">;

export const communicationsService = {
  listSent: (): Promise<CommunicationRecord[]> => Promise.resolve(store.getState().sent),

  send(input: SendInput) {
    const record: CommunicationRecord = { id: nextId("comm"), status: "Sent", when: "Just now", ...input };
    store.setState((s) => ({ sent: [record, ...s.sent] }));
    return record;
  },

  schedule(input: SendInput, when: string) {
    const record: CommunicationRecord = { id: nextId("comm"), status: "Scheduled", when, ...input };
    store.setState((s) => ({ sent: [record, ...s.sent] }));
    return record;
  },
};

export function useSentCommunications() {
  return useAsyncData(communicationsService.listSent, [store.useStore()]);
}
