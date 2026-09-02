// Sprint 5 — the relay-leg / running-order builder, generalising Sprint 4's
// CricketXI.tsx: same reuse of <PlayerAvatar/>/<BenchRow/> and the same
// teamSheetService mutations (assign/remove/bench/swap/captain), just
// reading each slot's OWN label from config.positions (see
// sportConfigs.ts's buildEventSelectionConfig, which gives every relay leg
// its own position key/label — "Leg 1", "Backstroke Leg", …) instead of
// CricketXI's hardcoded "Batting position N". CricketXI itself is left
// untouched — this is a new, sibling component, not a refactor of it.
import { ArrowDown, ArrowUp, Crown, Star, X } from "lucide-react";
import type { Member, TeamSelection } from "../../../domain/types";
import type { FormationSlot, SportConfig } from "../../../domain/sportConfigs";
import { PlayerAvatar } from "./PlayerChip";
import { cx } from "../primitives";

function specialtyLabel(config: SportConfig, member?: Member): string | undefined {
  if (!member?.primaryPosition) return undefined;
  return config.positions.find((p) => p.key === member.primaryPosition)?.label;
}

export function OrderedLineup({
  config,
  formation,
  selection,
  memberById,
  readOnly,
  onSlotClick,
  onRemove,
  onMoveUp,
  onMoveDown,
  onToggleCaptain,
  onToggleViceCaptain,
}: {
  config: SportConfig;
  formation: { slots: FormationSlot[] };
  selection: TeamSelection;
  memberById: (id: string) => Member | undefined;
  readOnly?: boolean;
  onSlotClick?: (slotId: string) => void;
  onRemove?: (slotId: string) => void;
  onMoveUp?: (slotId: string) => void;
  onMoveDown?: (slotId: string) => void;
  onToggleCaptain?: (memberId: string) => void;
  onToggleViceCaptain?: (memberId: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      {formation.slots.map((slot, i) => {
        const started = selection.starters.find((st) => st.slotId === slot.slotId);
        const member = started ? memberById(started.memberId) : undefined;
        const legLabel = config.positions.find((p) => p.key === slot.position)?.label ?? `Leg ${i + 1}`;
        const specialty = specialtyLabel(config, member);
        const isCaptain = member && selection.captainId === member.id;
        const isViceCaptain = member && selection.viceCaptainId === member.id;

        if (!member) {
          if (readOnly) return null;
          return (
            <button
              key={slot.slotId}
              onClick={() => onSlotClick?.(slot.slotId)}
              className="flex w-full items-center gap-3 rounded-xl border border-dashed border-border p-2.5 text-left text-sm text-muted-foreground hover:bg-muted"
            >
              <span className="grid size-7 shrink-0 place-items-center rounded-full border-2 border-dashed border-border text-xs font-bold">{i + 1}</span>
              <span>{legLabel} — unfilled</span>
            </button>
          );
        }

        return (
          <div key={slot.slotId} className="flex items-center gap-2.5 rounded-xl border border-border p-2.5 hover:bg-muted">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--sa-ink)] text-xs font-bold text-white">{i + 1}</span>
            <button onClick={() => !readOnly && onSlotClick?.(slot.slotId)} disabled={readOnly} className={cx("flex flex-1 items-center gap-2.5 text-left", readOnly && "cursor-default")}>
              <PlayerAvatar member={member} size={34} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-[var(--sa-ink)]">{member.name}</span>
                  {isCaptain && <span title="Captain" className="inline-flex items-center gap-0.5 rounded-full bg-[var(--sa-magenta)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--sa-magenta)]"><Crown className="size-3" /> C</span>}
                  {isViceCaptain && <span title="Vice-captain" className="inline-flex items-center gap-0.5 rounded-full bg-[var(--sa-violet)]/10 px-1.5 py-0.5 text-[10px] font-bold text-[var(--sa-violet)]"><Star className="size-3" /> VC</span>}
                </div>
                <div className="text-xs text-muted-foreground">{legLabel}{specialty ? ` · ${specialty} specialist` : ""}</div>
              </div>
            </button>
            {!readOnly && (
              <div className="flex shrink-0 items-center gap-0.5">
                {config.supportsCaptain && (
                  <button title={isCaptain ? "Remove captain" : "Make captain"} onClick={() => onToggleCaptain?.(member.id)} className={cx("rounded p-1 hover:bg-white", isCaptain ? "text-[var(--sa-magenta)]" : "text-muted-foreground")}>
                    <Crown className="size-3.5" />
                  </button>
                )}
                {config.supportsViceCaptain && (
                  <button title={isViceCaptain ? "Remove vice-captain" : "Make vice-captain"} onClick={() => onToggleViceCaptain?.(member.id)} className={cx("rounded p-1 hover:bg-white", isViceCaptain ? "text-[var(--sa-violet)]" : "text-muted-foreground")}>
                    <Star className="size-3.5" />
                  </button>
                )}
                <button title="Move earlier" disabled={i === 0} onClick={() => onMoveUp?.(slot.slotId)} className="rounded p-1 text-muted-foreground hover:bg-white disabled:opacity-30">
                  <ArrowUp className="size-3.5" />
                </button>
                <button title="Move later" disabled={i === formation.slots.length - 1} onClick={() => onMoveDown?.(slot.slotId)} className="rounded p-1 text-muted-foreground hover:bg-white disabled:opacity-30">
                  <ArrowDown className="size-3.5" />
                </button>
                <button title="Remove" onClick={() => onRemove?.(slot.slotId)} className="rounded p-1 text-muted-foreground hover:bg-white hover:text-rose-600">
                  <X className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
