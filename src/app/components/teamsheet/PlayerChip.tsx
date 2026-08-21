import { X } from "lucide-react";
import type { Member } from "../../../domain/types";
import type { FormationSlot, SportConfig } from "../../../domain/sportConfigs";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { cx } from "../primitives";

/** Photo where one exists (no seeded member has one yet, so this always exercises the initials fallback in practice — the seam is real for when real profile photos arrive), otherwise initials. */
export function PlayerAvatar({ member, size = 36 }: { member: Pick<Member, "name" | "photoUrl">; size?: number }) {
  const initials = member.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  if (member.photoUrl) {
    return (
      <ImageWithFallback
        src={member.photoUrl}
        alt={member.name}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full sa-gradient font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials}
    </span>
  );
}

/** On-pitch marker for a filled or empty formation slot. Deliberately touch-sized (44px minimum tap target) and keeps the name short — the full roster list underneath the pitch is the readable fallback on small screens. */
export function SlotChip({
  slot,
  config,
  member,
  onClick,
  warn,
  readOnly,
}: {
  slot: FormationSlot;
  config: SportConfig;
  member?: Member;
  onClick: () => void;
  /** "out-of-position": selected but this isn't one of their eligible positions. "unavailable": selected via a deliberate availability override. */
  warn?: "out-of-position" | "unavailable";
  readOnly?: boolean;
}) {
  const label = config.positions.find((p) => p.key === slot.position)?.shortLabel ?? slot.position;
  const ring = warn === "unavailable" ? "ring-rose-400" : warn === "out-of-position" ? "ring-amber-300" : "";

  if (!member) {
    if (readOnly) return <span className="min-w-[64px]" />;
    return (
      <button
        onClick={onClick}
        title={`Fill ${label}`}
        className="flex min-w-[64px] flex-col items-center gap-1 rounded-lg p-1 text-white/90 transition hover:text-white"
      >
        <span className="grid size-9 place-items-center rounded-full border-2 border-dashed border-white/70 text-sm font-bold sm:size-11">+</span>
        <span className="rounded bg-black/35 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={readOnly ? undefined : onClick}
      title={readOnly ? `${member.name} — ${label}` : `${member.name} — ${label}. Tap to change.`}
      className={cx("flex min-w-[64px] flex-col items-center gap-1 rounded-lg p-1", readOnly && "cursor-default")}
    >
      <span className="relative">
        <span className={cx("block rounded-full", ring && `ring-4 ${ring}`)}>
          <PlayerAvatar member={member} size={40} />
        </span>
        {member.squadNumber != null && (
          <span className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-[var(--sa-ink)] text-[9px] font-bold text-white ring-2 ring-white">
            {member.squadNumber}
          </span>
        )}
      </span>
      <span className="max-w-[72px] truncate rounded bg-black/45 px-1.5 py-0.5 text-[10px] font-semibold text-white">{member.name.split(" ")[0]}</span>
      <span className="rounded bg-black/30 px-1 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/80">{label}</span>
    </button>
  );
}

/** Bench/reserves row — used both in the Builder (removable) and read-only in the Published view. */
export function BenchRow({
  member,
  positionLabel,
  onRemove,
  onClick,
  readOnly,
}: {
  member: Member;
  positionLabel?: string;
  onRemove?: () => void;
  onClick?: () => void;
  readOnly?: boolean;
}) {
  return (
    <div className={cx("flex items-center gap-2.5 rounded-xl border border-border p-2", !readOnly && "hover:bg-muted")}>
      <button onClick={onClick} disabled={readOnly} className={cx("flex flex-1 items-center gap-2.5 text-left", readOnly && "cursor-default")}>
        <PlayerAvatar member={member} size={32} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-[var(--sa-ink)]">{member.name}</div>
          {positionLabel && <div className="text-xs text-muted-foreground">{positionLabel}</div>}
        </div>
        {member.squadNumber != null && <span className="text-xs font-semibold text-muted-foreground">#{member.squadNumber}</span>}
      </button>
      {!readOnly && onRemove && (
        <button onClick={onRemove} title="Remove from bench" className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-rose-600">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}
