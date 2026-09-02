// Sprint 4 — the Sport Selector. Lives in AppShell's top bar next to the
// org selector: switching the organisation's sport is presented as a
// peer-level context switch (which sport is this club section working in
// right now), not a page-level filter control buried in one screen.
//
// AppShell renders eagerly (it's the persistent shell, not a lazy route —
// see routes.tsx), so this deliberately does NOT reach for the Radix
// dropdown-menu/dialog primitives Sprint 2/3 modals use elsewhere (those
// only ever load inside lazy page chunks). Instead it reuses the exact
// lightweight "fixed overlay + conditional render" pattern AppShell's own
// "Ask Allstars" slide-over and mobile nav drawer already use a few lines
// above/below this component's call site — plain state, no new dependency,
// no eager bundle growth. Desktop gets an anchored dropdown panel; mobile
// gets a full-width bottom sheet with large tap targets, its own layout
// rather than the desktop menu just shrunk.
import { useState } from "react";
import { Bike, ChevronDown, Dribbble, Droplets, Sailboat, Shield, Timer, Trophy, Waves, X, Zap } from "lucide-react";
import type { ComponentType } from "react";
import { sportConfigs, type SportKey } from "../../domain/sportConfigs";
import { selectableSports, sportContextService, useCurrentSport } from "../../services/sportContext";
import { cx } from "./primitives";

// Icons are a presentation concern kept out of the (UI-agnostic) domain
// config — see sportConfigs.ts's module comment. lucide-react doesn't ship
// bespoke rugby/hockey/cricket glyphs, so these are the closest sensible
// stand-ins rather than a claim of literal accuracy.
const sportIcon: Record<SportKey, ComponentType<{ className?: string }>> = {
  football: Zap,
  rugby: Shield,
  basketball: Dribbble,
  rugbySevens: Shield,
  hockey: Waves,
  cricket: Trophy,
  // Sprint 5 — Olympic Event Sports.
  athletics: Timer,
  swimming: Droplets,
  rowing: Sailboat,
  cycling: Bike,
};

function SportRow({ sport, active, onClick }: { sport: SportKey; active: boolean; onClick: () => void }) {
  const config = sportConfigs[sport];
  const Icon = sportIcon[sport];
  return (
    <button
      onClick={onClick}
      className={cx(
        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors",
        active ? "sa-gradient text-white shadow" : "hover:bg-muted",
      )}
    >
      <span className={cx("grid size-9 shrink-0 place-items-center rounded-lg", active ? "bg-white/20" : "bg-muted")}>
        <Icon className="size-4.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className={cx("font-semibold", active ? "text-white" : "text-[var(--sa-ink)]")}>{config.label}</div>
        <div className={cx("text-xs", active ? "text-white/80" : "text-muted-foreground")}>{config.startersLabel} · {config.surfaceLabel}</div>
      </div>
    </button>
  );
}

// Sprint 5 — group the (now nine) selectable sports into "Team Sports"/
// "Event Sports" sections using each SportConfig's own `category`, rather
// than selectableSports itself needing to become two arrays.
const teamSports = selectableSports.filter((s) => sportConfigs[s].category === "team");
const eventSports = selectableSports.filter((s) => sportConfigs[s].category === "event");

function SportGroup({ title, sports, currentSport, onChoose }: { title: string; sports: SportKey[]; currentSport: SportKey; onChoose: (s: SportKey) => void }) {
  if (sports.length === 0) return null;
  return (
    <div>
      <div className="mb-1 px-1 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">{title}</div>
      <div className="space-y-1">
        {sports.map((sport) => (
          <SportRow key={sport} sport={sport} active={sport === currentSport} onClick={() => onChoose(sport)} />
        ))}
      </div>
    </div>
  );
}

export function SportSelector() {
  const currentSport = useCurrentSport();
  const config = sportConfigs[currentSport];
  const Icon = sportIcon[currentSport];
  const [open, setOpen] = useState(false);

  const choose = (sport: SportKey) => {
    sportContextService.setCurrentSport(sport);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm hover:bg-muted sm:px-3"
      >
        <span className="grid size-6 place-items-center rounded-md sa-gradient text-white">
          <Icon className="size-3.5" />
        </span>
        <span className="hidden font-semibold sm:inline">{config.label}</span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>

      {open && (
        <>
          {/* Backdrop — same click-outside-to-close pattern as the mobile nav drawer above. Full-screen on mobile so the panel below reads as a bottom sheet; desktop just needs an invisible click-catcher. */}
          <div className="fixed inset-0 z-40 bg-black/40 sm:bg-transparent" onClick={() => setOpen(false)} />

          {/* Mobile: bottom sheet, large tap targets, its own layout. */}
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-border bg-card p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:hidden">
            <div className="mb-3 flex items-center justify-between">
              <span className="font-display text-lg text-[var(--sa-ink)]">Switch sport</span>
              <button onClick={() => setOpen(false)} className="rounded p-1 hover:bg-muted"><X className="size-5" /></button>
            </div>
            <div className="space-y-3">
              <SportGroup title="Team Sports" sports={teamSports} currentSport={currentSport} onChoose={choose} />
              <SportGroup title="Event Sports" sports={eventSports} currentSport={currentSport} onChoose={choose} />
            </div>
          </div>

          {/* Desktop / tablet: anchored dropdown panel. */}
          <div className="absolute left-0 top-full z-50 mt-2 hidden w-72 rounded-2xl border border-border bg-card p-2 shadow-xl sm:block">
            <div className="space-y-3">
              <SportGroup title="Team Sports" sports={teamSports} currentSport={currentSport} onChoose={choose} />
              <SportGroup title="Event Sports" sports={eventSports} currentSport={currentSport} onChoose={choose} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
