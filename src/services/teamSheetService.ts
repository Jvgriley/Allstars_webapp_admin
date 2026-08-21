// Team Selection / Team Sheets — Sprint 3.
//
// Store-backed like every other Sprint 2/3 service (see store.ts): a
// TeamSelection persists per fixture for the browser session. This module
// owns two distinct concerns the brief calls out explicitly:
//
//  1. Eligibility — which positions a member could plausibly play. This is
//     just information; it never changes who is actually selected.
//  2. Selection — the manager's actual, confirmed placement of players into
//     slots and onto the bench. A member can be eligible for several slots
//     at once, but assignPlayer() guarantees they only ever occupy one.
//
// Nothing here is football- or rugby-specific — every sport-shaped detail
// comes from the SportConfig/SportFormation passed in (see sportConfigs.ts).
import type { Member, SelectedPlayer, SelectionInsight, TeamSelection } from "../domain/types";
import type { PositionKey, SportConfig, SportFormation } from "../domain/sportConfigs";
import { createStore } from "./store";

export type AvailabilityLookup = (memberId: string) => "green" | "orange" | "red";

type TeamSheetsState = Record<string, TeamSelection>;
const store = createStore<TeamSheetsState>("sa3:team-sheets", () => ({}));

function freshSelection(fixtureId: string, config: SportConfig, formationId?: string): TeamSelection {
  const formation = config.formations.find((f) => f.id === formationId) ?? config.formations[0];
  return {
    fixtureId,
    sport: config.key,
    formationId: formation.id,
    starters: [],
    bench: [],
    status: "Draft",
  };
}

function formationOf(config: SportConfig, selection: TeamSelection): SportFormation {
  return config.formations.find((f) => f.id === selection.formationId) ?? config.formations[0];
}

export const teamSheetService = {
  getSelection(fixtureId: string, config: SportConfig): TeamSelection {
    const existing = store.getState()[fixtureId];
    if (existing && existing.sport === config.key) return existing;
    return freshSelection(fixtureId, config);
  },

  /** Which position keys a member could plausibly fill in this sport — a candidate list, not a selection. */
  getEligiblePositions(member: Member, config: SportConfig): PositionKey[] {
    const validKeys = new Set(config.positions.map((p) => p.key));
    const own = new Set<PositionKey>();
    if (member.primaryPosition && validKeys.has(member.primaryPosition)) own.add(member.primaryPosition);
    for (const p of member.secondaryPositions ?? []) {
      if (validKeys.has(p)) own.add(p);
    }
    if (own.size > 0) return [...own];
    // No sport-specific positions recorded for this member in this sport
    // (this is how every seeded member becomes eligible for the rugby demo
    // fixture, purely through their general position bucket) — fall back to
    // the sport's configured mapping.
    return config.fallbackEligibility[member.position ?? ""] ?? [];
  },

  isEligibleForSlot(member: Member, config: SportConfig, positionKey: PositionKey): boolean {
    return teamSheetService.getEligiblePositions(member, config).includes(positionKey);
  },

  setFormation(fixtureId: string, config: SportConfig, formationId: string) {
    store.setState((s) => {
      const current = s[fixtureId] ?? freshSelection(fixtureId, config);
      const next = config.formations.find((f) => f.id === formationId);
      if (!next) return s;
      const validSlotIds = new Set(next.slots.map((sl) => sl.slotId));
      // A slot that doesn't exist in the new formation loses its starter —
      // that player moves to the bench rather than disappearing, since
      // switching formation is a deliberate action, not something that
      // should silently drop a selected player.
      const kept = current.starters.filter((st) => validSlotIds.has(st.slotId));
      const displaced = current.starters.filter((st) => !validSlotIds.has(st.slotId)).map((st) => st.memberId);
      const bench = [...new Set([...current.bench, ...displaced])];
      return { ...s, [fixtureId]: { ...current, formationId, starters: kept, bench, updatedAt: new Date().toISOString() } };
    });
  },

  /** Place a member into a slot. If they're already selected elsewhere (another slot or the bench), they're moved — this is how "swap" works, and structurally prevents the same player occupying two positions. Whoever previously held the target slot is displaced to the bench. */
  assignPlayer(fixtureId: string, config: SportConfig, slotId: string, memberId: string, opts?: { override?: boolean }) {
    store.setState((s) => {
      const current = s[fixtureId] ?? freshSelection(fixtureId, config);
      const displaced = current.starters.find((st) => st.slotId === slotId && st.memberId !== memberId);
      const withoutMember = current.starters.filter((st) => st.memberId !== memberId && st.slotId !== slotId);
      const nextStarters: SelectedPlayer[] = [...withoutMember, { memberId, slotId, overrideUnavailable: opts?.override }];
      const benchWithoutMember = current.bench.filter((id) => id !== memberId);
      const bench = displaced ? [...new Set([...benchWithoutMember, displaced.memberId])] : benchWithoutMember;
      return { ...s, [fixtureId]: { ...current, starters: nextStarters, bench, updatedAt: new Date().toISOString() } };
    });
  },

  /** Fully deselects — the player returns to the general candidate pool, not the bench (see addToBench for that). */
  removeFromSlot(fixtureId: string, config: SportConfig, slotId: string) {
    store.setState((s) => {
      const current = s[fixtureId] ?? freshSelection(fixtureId, config);
      return { ...s, [fixtureId]: { ...current, starters: current.starters.filter((st) => st.slotId !== slotId), updatedAt: new Date().toISOString() } };
    });
  },

  addToBench(fixtureId: string, config: SportConfig, memberId: string) {
    store.setState((s) => {
      const current = s[fixtureId] ?? freshSelection(fixtureId, config);
      const starters = current.starters.filter((st) => st.memberId !== memberId);
      const bench = [...new Set([...current.bench.filter((id) => id !== memberId), memberId])];
      return { ...s, [fixtureId]: { ...current, starters, bench, updatedAt: new Date().toISOString() } };
    });
  },

  removeFromBench(fixtureId: string, config: SportConfig, memberId: string) {
    store.setState((s) => {
      const current = s[fixtureId] ?? freshSelection(fixtureId, config);
      return { ...s, [fixtureId]: { ...current, bench: current.bench.filter((id) => id !== memberId), updatedAt: new Date().toISOString() } };
    });
  },

  resetSelection(fixtureId: string, config: SportConfig) {
    store.setState((s) => ({ ...s, [fixtureId]: freshSelection(fixtureId, config) }));
  },

  publish(fixtureId: string, config: SportConfig) {
    store.setState((s) => {
      const current = s[fixtureId] ?? freshSelection(fixtureId, config);
      return { ...s, [fixtureId]: { ...current, status: "Published", publishedAt: new Date().toISOString() } };
    });
  },

  /** Drops back to Draft without touching starters/bench, so "Edit Selection" reopens the builder with everything intact. */
  unpublish(fixtureId: string, config: SportConfig) {
    store.setState((s) => {
      const current = s[fixtureId] ?? freshSelection(fixtureId, config);
      return { ...s, [fixtureId]: { ...current, status: "Draft" } };
    });
  },

  /**
   * Deterministic mock "Allstars Intelligence" for the selection in
   * progress. Not real analytics — see the module comment in sportConfigs.ts
   * for the same caveat applied to eligibility. Kept small and legible so a
   * real backend/AI service can replace this one function later.
   */
  getSelectionInsights(config: SportConfig, selection: TeamSelection, roster: Member[], getAvailability: AvailabilityLookup): SelectionInsight[] {
    const formation = formationOf(config, selection);
    const insights: SelectionInsight[] = [];
    const filledSlotIds = new Set(selection.starters.map((st) => st.slotId));
    const unfilled = formation.slots.filter((sl) => !filledSlotIds.has(sl.slotId));

    insights.push({
      id: "squad-status",
      kind: "PERFORMANCE",
      title: "Squad status",
      body: `${formation.slots.length - unfilled.length} of ${formation.slots.length} starting positions filled.`,
    });

    for (const slot of unfilled.slice(0, 3)) {
      const label = config.positions.find((p) => p.key === slot.position)?.label ?? slot.position;
      insights.push({ id: `unfilled-${slot.slotId}`, kind: "RISK", title: "Selection risk", body: `${label} remains unfilled.` });
    }
    if (unfilled.length > 3) {
      insights.push({ id: "unfilled-more", kind: "RISK", title: "Selection risk", body: `${unfilled.length - 3} more position(s) also remain unfilled.` });
    }

    const unfilledPositions = new Set(unfilled.map((sl) => sl.position));
    const selectedIds = new Set(selection.starters.map((st) => st.memberId));
    let pendingEligible = 0;
    for (const m of roster) {
      if (selectedIds.has(m.id)) continue;
      if (getAvailability(m.id) !== "orange") continue;
      const eligible = teamSheetService.getEligiblePositions(m, config);
      if (eligible.some((p) => unfilledPositions.has(p))) pendingEligible++;
    }
    if (pendingEligible > 0) {
      insights.push({
        id: "pending-eligible",
        kind: "OPPORTUNITY",
        title: "Availability",
        body: `${pendingEligible} pending player${pendingEligible === 1 ? " is" : "s are"} eligible for a currently unfilled position — worth a follow-up before kickoff.`,
      });
    }

    const coverageSeen = new Set<string>();
    for (const m of roster) {
      const positions = m.primaryPosition ? [m.primaryPosition, ...(m.secondaryPositions ?? [])] : [];
      const inFormation = positions.filter((p) => formation.slots.some((sl) => sl.position === p));
      if (inFormation.length >= 2 && !coverageSeen.has(m.id)) {
        coverageSeen.add(m.id);
        const labels = inFormation.slice(0, 2).map((p) => config.positions.find((pos) => pos.key === p)?.shortLabel ?? p);
        insights.push({ id: `coverage-${m.id}`, kind: "TREND", title: "Coverage", body: `${m.name} can cover both ${labels[0]} and ${labels[1]}.` });
      }
      if (coverageSeen.size >= 2) break;
    }

    return insights;
  },
};

export function useTeamSheetsStore() {
  return store.useStore();
}
