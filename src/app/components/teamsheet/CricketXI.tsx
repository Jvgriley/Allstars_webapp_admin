// Sprint 4 — Cricket's Team Builder / Published Team Sheet surface.
//
// This is the architectural proof point the brief calls out explicitly:
// cricket is role-based, not formation-based, so it does NOT reuse
// <Pitch/>/<SlotAnchor/>/<SlotChip/> — there is no surface coordinate for
// a batter to stand on. What it reuses instead is everything that isn't
// coordinate-shaped: <PlayerAvatar/> and <BenchRow/> from PlayerChip.tsx,
// and every mutation (assign/remove/bench/swap/captain) still goes through
// the same teamSheetService every other sport uses — only the presentation
// is new.
//
// Batting order is literally the order of `formation.slots` (bat-1..bat-11
// — see sportConfigs.ts's cricketPlayingXI); reordering two adjacent
// batters calls teamSheetService.swapSlots, the same generic slot-swap
// every sport could use.
import { ArrowDown, ArrowUp, Crown, Star, X } from "lucide-react";
import type { Member, TeamSelection } from "../../../domain/types";
import type { FormationSlot, SportConfig } from "../../../domain/sportConfigs";
import { PlayerAvatar } from "./PlayerChip";
import { cx } from "../primitives";

function roleLabel(config: SportConfig, member?: Member): string | undefined {
  if (!member?.primaryPosition) return undefined;
  return config.positions.find((p) => p.key === member.primaryPosition)?.shortLabel;
}

export function CricketXI({
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
        const role = roleLabel(config, member);
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
              <span>Batting position {i + 1} — unfilled</span>
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
                {role && <div className="text-xs text-muted-foreground">{config.positions.find((p) => p.key === member.primaryPosition)?.label ?? role}</div>}
              </div>
              {member.squadNumber != null && <span className="text-xs font-semibold text-muted-foreground">#{member.squadNumber}</span>}
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
                <button title="Move up the order" disabled={i === 0} onClick={() => onMoveUp?.(slot.slotId)} className="rounded p-1 text-muted-foreground hover:bg-white disabled:opacity-30">
                  <ArrowUp className="size-3.5" />
                </button>
                <button title="Move down the order" disabled={i === formation.slots.length - 1} onClick={() => onMoveDown?.(slot.slotId)} className="rounded p-1 text-muted-foreground hover:bg-white disabled:opacity-30">
                  <ArrowDown className="size-3.5" />
                </button>
                <button title="Remove from XI" onClick={() => onRemove?.(slot.slotId)} className="rounded p-1 text-muted-foreground hover:bg-white hover:text-rose-600">
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
