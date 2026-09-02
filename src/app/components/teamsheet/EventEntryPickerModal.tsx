// Sprint 5 — candidate picker for an "individual" SportEvent's entry list.
// Modelled closely on PlayerPickerModal.tsx (availability-aware, eligible
// candidates first) but genuinely simpler: there's no slot/formation
// concept for an individual entry, just "is there a place left" (see
// SportEvent.entryLimit) and "is this athlete eligible" (see
// eventEntryService.isEligibleForEvent).
import type { Member } from "../../../domain/types";
import type { SportEvent } from "../../../domain/sportConfigs";
import { eventEntryService } from "../../../services/eventEntryService";
import { Modal } from "../Modal";
import { Pill, cx } from "../primitives";
import { PlayerAvatar } from "./PlayerChip";

type Availability = "green" | "orange" | "red";
const availLabel: Record<Availability, string> = { green: "Available", orange: "Pending", red: "Unavailable" };
const availTone: Record<Availability, "green" | "orange" | "red"> = { green: "green", orange: "orange", red: "red" };

export function EventEntryPickerModal({
  open,
  onOpenChange,
  event,
  roster,
  enteredIds,
  getAvailability,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: SportEvent;
  roster: Member[];
  enteredIds: string[];
  getAvailability: (memberId: string) => Availability;
  onPick: (memberId: string) => void;
}) {
  const entered = new Set(enteredIds);
  const candidates = roster.filter((m) => !entered.has(m.id));
  const withEligibility = candidates.map((m) => ({
    member: m,
    eligible: eventEntryService.isEligibleForEvent(m, event.key),
    availability: getAvailability(m.id) as Availability,
  }));

  const rank: Record<Availability, number> = { green: 0, orange: 1, red: 2 };
  const sorter = (a: (typeof withEligibility)[number], b: (typeof withEligibility)[number]) => rank[a.availability] - rank[b.availability];
  const eligible = withEligibility.filter((c) => c.eligible).sort(sorter);
  const others = withEligibility.filter((c) => !c.eligible).sort(sorter);

  const pick = (memberId: string) => {
    onPick(memberId);
    onOpenChange(false);
  };

  const Row = ({ c }: { c: (typeof withEligibility)[number] }) => (
    <button
      key={c.member.id}
      onClick={() => pick(c.member.id)}
      className="flex w-full items-center gap-2.5 rounded-xl border border-border p-2.5 text-left hover:bg-muted"
    >
      <PlayerAvatar member={c.member} size={32} />
      <div className="min-w-0 flex-1">
        <div className={cx("truncate text-sm font-semibold text-[var(--sa-ink)]")}>{c.member.name}</div>
        <div className="text-xs text-muted-foreground">{c.member.team}</div>
      </div>
      <Pill tone={availTone[c.availability]}>{availLabel[c.availability]}</Pill>
    </button>
  );

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={`Enter an athlete — ${event.label}`}
      description="Available athletes are listed first. Pending and unavailable athletes can still be entered."
    >
      <div className="space-y-1.5">
        {eligible.map((c) => <Row key={c.member.id} c={c} />)}
        {eligible.length === 0 && <div className="py-4 text-center text-sm text-muted-foreground">No eligible athletes remain.</div>}
      </div>
      {others.length > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Other athletes</div>
          <div className="space-y-1.5">
            {others.map((c) => <Row key={c.member.id} c={c} />)}
          </div>
        </div>
      )}
    </Modal>
  );
}
