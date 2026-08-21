// Candidate picker for a formation slot (or, with no slot, for adding
// someone straight to the bench). Availability-aware per the Sprint 3 brief:
// Available players lead, Pending players are shown but clearly marked, and
// Unavailable players require an explicit "select anyway" confirmation
// rather than being silently selectable.
import { useState } from "react";
import type { Member, TeamSelection } from "../../../domain/types";
import type { FormationSlot, SportConfig } from "../../../domain/sportConfigs";
import { teamSheetService } from "../../../services/teamSheetService";
import { Modal } from "../Modal";
import { Pill, cx } from "../primitives";
import { PlayerAvatar } from "./PlayerChip";

type Availability = "green" | "orange" | "red";
const availLabel: Record<Availability, string> = { green: "Available", orange: "Pending", red: "Unavailable" };
const availTone: Record<Availability, "green" | "orange" | "red"> = { green: "green", orange: "orange", red: "red" };

export function PlayerPickerModal({
  open,
  onOpenChange,
  config,
  slot,
  roster,
  getAvailability,
  selection,
  onPick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: SportConfig;
  /** Omit for "add to bench" mode — every roster member is a candidate, eligibility isn't shown. */
  slot?: FormationSlot;
  roster: Member[];
  getAvailability: (memberId: string) => Availability;
  selection: TeamSelection;
  onPick: (memberId: string, opts?: { override?: boolean }) => void;
}) {
  const [confirmingId, setConfirmingId] = useState<string | undefined>(undefined);

  const slotLabel = slot ? config.positions.find((p) => p.key === slot.position)?.label ?? slot.position : undefined;
  const currentSlotFor = (memberId: string) => selection.starters.find((st) => st.memberId === memberId)?.slotId;
  const currentOnBench = (memberId: string) => selection.bench.includes(memberId);

  const withEligibility = roster.map((m) => ({
    member: m,
    eligible: slot ? teamSheetService.isEligibleForSlot(m, config, slot.position) : true,
    availability: getAvailability(m.id) as Availability,
  }));

  const rank: Record<Availability, number> = { green: 0, orange: 1, red: 2 };
  const sorter = (a: (typeof withEligibility)[number], b: (typeof withEligibility)[number]) => rank[a.availability] - rank[b.availability];

  const eligible = withEligibility.filter((c) => c.eligible).sort(sorter);
  const others = withEligibility.filter((c) => !c.eligible).sort(sorter);

  const pick = (memberId: string, availability: Availability) => {
    if (availability === "red" && confirmingId !== memberId) {
      setConfirmingId(memberId);
      return;
    }
    onPick(memberId, availability === "red" ? { override: true } : undefined);
    setConfirmingId(undefined);
    onOpenChange(false);
  };

  const Row = ({ c }: { c: (typeof withEligibility)[number] }) => {
    const { member, availability } = c;
    const occupiedSlotId = currentSlotFor(member.id);
    const occupiedLabel = occupiedSlotId ? config.formations.find((f) => f.id === selection.formationId)?.slots.find((s) => s.slotId === occupiedSlotId) : undefined;
    const confirming = confirmingId === member.id;
    return (
      <div key={member.id} className={cx("rounded-xl border p-2.5", confirming ? "border-rose-300 bg-rose-50" : "border-border hover:bg-muted")}>
        <button onClick={() => pick(member.id, availability)} className="flex w-full items-center gap-2.5 text-left">
          <PlayerAvatar member={member} size={32} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-[var(--sa-ink)]">{member.name}</div>
            <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              {member.position}
              {occupiedSlotId && occupiedLabel && <span className="text-[var(--sa-magenta)]"> · currently {config.positions.find((p) => p.key === occupiedLabel.position)?.shortLabel}</span>}
              {!occupiedSlotId && currentOnBench(member.id) && <span className="text-[var(--sa-violet)]"> · currently on bench</span>}
            </div>
          </div>
          <Pill tone={availTone[availability]}>{availLabel[availability]}</Pill>
        </button>
        {confirming && (
          <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-white p-2 text-xs">
            <span className="text-rose-700">{member.name} marked themselves unavailable for this fixture. Select anyway?</span>
            <div className="flex shrink-0 gap-1.5">
              <button onClick={() => setConfirmingId(undefined)} className="rounded px-2 py-1 font-semibold hover:bg-muted">Cancel</button>
              <button onClick={() => pick(member.id, availability)} className="rounded bg-rose-600 px-2 py-1 font-semibold text-white hover:bg-rose-700">Select anyway</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      open={open}
      onOpenChange={(o) => { setConfirmingId(undefined); onOpenChange(o); }}
      title={slot ? `Select ${slotLabel}` : "Add to bench"}
      description={slot ? "Available players are listed first. Pending and unavailable players can still be selected." : undefined}
    >
      <div className="space-y-1.5">
        {eligible.map((c) => <Row key={c.member.id} c={c} />)}
      </div>
      {slot && others.length > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Other players</div>
          <div className="space-y-1.5">
            {others.map((c) => <Row key={c.member.id} c={c} />)}
          </div>
        </div>
      )}
    </Modal>
  );
}
