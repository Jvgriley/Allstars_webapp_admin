// Competitions — Sprint 5. Three screens mirroring Sprint 3/4's
// Fixtures -> Availability -> Team Sheet flow, but for the Event Sports'
// own Sport -> Competition -> Event -> Entry workflow (see
// domain/sportConfigs.ts's SportEvent module comment):
//   CompetitionsPage      — like Fixtures: list/create competitions.
//   CompetitionDetailPage — status cards for every event a competition
//                           contests (OPEN / PARTIALLY FILLED / COMPLETE /
//                           PUBLISHED), the entry point into each one.
//   EventEntryPage        — like Team Sheet, but branches three ways by
//                           SportEvent.type: "individual" entry lists go
//                           through eventEntryService; "relay"/"crew" reuse
//                           teamSheetService entirely via a synthetic
//                           SportConfig (see buildEventSelectionConfig).
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, ChevronRight, Clock, Download, MapPin, Megaphone, Pencil, Plus, RotateCcw, Send, UserPlus } from "lucide-react";
import { PageHeader, Panel, Btn, Pill, InsightCard, PageLoading, TextField, SelectField } from "../components/primitives";
import { Modal, ConfirmDialog } from "../components/Modal";
import { Pitch, SlotAnchor } from "../components/teamsheet/Pitch";
import { SlotChip, BenchRow } from "../components/teamsheet/PlayerChip";
import { OrderedLineup } from "../components/teamsheet/OrderedLineup";
import { PlayerPickerModal } from "../components/teamsheet/PlayerPickerModal";
import { EventEntryPickerModal } from "../components/teamsheet/EventEntryPickerModal";
import { buildEventEntrySvg, buildTeamSheetSvg, downloadSvg } from "../components/teamsheet/exportSvg";
import type { PageId } from "../nav";
import type { Competition } from "../../domain/types";
import { sportConfigs, buildEventSelectionConfig, type SportEvent, type SportKey } from "../../domain/sportConfigs";
import { competitionService, useCompetition, useCompetitions, type CompetitionInput } from "../../services/competitionService";
import { eventEntryService, useEventEntriesStore } from "../../services/eventEntryService";
import { teamSheetService, useTeamSheetsStore } from "../../services/teamSheetService";
import { sportService } from "../../services/sportService";
import { useMembers } from "../../services/membersService";
import { rosterSportFor } from "../../services/sportContext";
import { spacesService } from "../../services/spacesService";

const eventSports = Object.values(sportConfigs).filter((c) => c.category === "event") as { key: SportKey; label: string }[];

// ---------------------------------------------------------------------------
// CompetitionsPage
// ---------------------------------------------------------------------------

function CompetitionFormModal({ open, onOpenChange, competition, defaultSport }: { open: boolean; onOpenChange: (o: boolean) => void; competition?: Competition; defaultSport?: SportKey }) {
  const isEdit = !!competition;
  const [name, setName] = useState(competition?.name ?? "");
  const [comp, setComp] = useState(competition?.comp ?? "");
  const [date, setDate] = useState(competition?.date ?? "");
  const [time, setTime] = useState(competition?.time ?? "");
  const [venue, setVenue] = useState(competition?.venue ?? "Riverside Sports Ground");
  const [sport, setSport] = useState<SportKey>(competition?.sport ?? defaultSport ?? eventSports[0].key);
  const [eventKeys, setEventKeys] = useState<string[]>(competition?.eventKeys ?? []);

  const availableEvents = sportConfigs[sport].events ?? [];
  const toggleEvent = (key: string) => setEventKeys((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));

  const save = () => {
    if (!name.trim() || !date.trim() || !time.trim()) {
      toast.error("Fill in the name, date and time.");
      return;
    }
    const input: CompetitionInput = { name, comp, date, time, venue, sport, eventKeys };
    if (isEdit && competition) {
      competitionService.updateCompetition(competition.id, input);
      toast.success("Competition updated.");
    } else {
      competitionService.addCompetition(input);
      toast.success(`${name} created.`);
    }
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit competition" : "New competition"}
      footer={<><Btn variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Btn><Btn onClick={save}>{isEdit ? "Save changes" : "Create competition"}</Btn></>}
    >
      <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Regional Athletics Championships" autoFocus />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="Sat 27 Sep" />
        <TextField label="Time" value={time} onChange={(e) => setTime(e.target.value)} placeholder="10:00" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Meet / Series" value={comp} onChange={(e) => setComp(e.target.value)} placeholder="e.g. Regional Championships" />
        <SelectField label="Sport" value={sport} onChange={(e) => { setSport(e.target.value as SportKey); setEventKeys([]); }}>
          {eventSports.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
        </SelectField>
      </div>
      <TextField label="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
      <div>
        <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Events contested</div>
        <div className="flex flex-wrap gap-1.5">
          {availableEvents.map((e) => (
            <button
              key={e.key}
              type="button"
              onClick={() => toggleEvent(e.key)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${eventKeys.includes(e.key) ? "sa-gradient text-white" : "border border-border bg-card hover:bg-muted"}`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export function CompetitionsPage({ navigate }: { navigate: (p: PageId, arg?: string) => void }) {
  const { data: competitions } = useCompetitions();
  const [sportFilter, setSportFilter] = useState<SportKey | "all">("all");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Competition | undefined>(undefined);

  if (!competitions) return <PageLoading />;

  const filtered = sportFilter === "all" ? competitions : competitions.filter((c) => c.sport === sportFilter);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sport"
        title="Competitions"
        subtitle="Athletics, Swimming, Rowing and Cycling meets — entries, relay/crew selection and results all connect here."
        actions={<Btn onClick={() => { setEditing(undefined); setFormOpen(true); }}><Plus className="size-4" /> New competition</Btn>}
      />
      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setSportFilter("all")} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${sportFilter === "all" ? "sa-gradient text-white" : "border border-border bg-card hover:bg-muted"}`}>All sports</button>
        {eventSports.map((s) => (
          <button key={s.key} onClick={() => setSportFilter(s.key)} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${sportFilter === s.key ? "sa-gradient text-white" : "border border-border bg-card hover:bg-muted"}`}>{s.label}</button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {filtered.map((c) => (
          <Panel key={c.id} title={c.name} eyebrow={c.comp} action={<button title="Edit competition" onClick={() => { setEditing(c); setFormOpen(true); }} className="rounded p-1 hover:bg-muted"><Pencil className="size-3.5 text-muted-foreground" /></button>}>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Clock className="size-4" /> {c.date} · {c.time}</div>
              <div className="flex items-center gap-2"><MapPin className="size-4" /> {c.venue}</div>
            </div>
            <div className="mt-3 flex gap-2"><Pill tone="violet">{sportConfigs[c.sport].label}</Pill><Pill>{c.eventKeys.length} event{c.eventKeys.length === 1 ? "" : "s"}</Pill></div>
            <div className="mt-4">
              <Btn size="sm" onClick={() => navigate("competition-detail", c.id)}>Open competition <ChevronRight className="size-3.5" /></Btn>
            </div>
          </Panel>
        ))}
        {filtered.length === 0 && <div className="col-span-full py-8 text-center text-sm text-muted-foreground">No competitions for this sport yet.</div>}
      </div>
      <CompetitionFormModal open={formOpen} onOpenChange={setFormOpen} competition={editing} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// CompetitionDetailPage
// ---------------------------------------------------------------------------

type EventStatus = "Open" | "Partially filled" | "Complete" | "Published";
const statusTone: Record<EventStatus, "muted" | "orange" | "green" | "violet"> = { Open: "muted", "Partially filled": "orange", Complete: "green", Published: "violet" };

function eventFillInfo(sport: SportKey, competitionId: string, event: SportEvent): { status: EventStatus; filled: number; total: number } {
  if (event.type === "individual") {
    const entry = eventEntryService.getEntry(competitionId, event.key);
    const total = event.entryLimit ?? 0;
    const filled = entry.entries.length;
    if (entry.status === "Published") return { status: "Published", filled, total };
    if (total > 0 && filled >= total) return { status: "Complete", filled, total };
    if (filled > 0) return { status: "Partially filled", filled, total };
    return { status: "Open", filled, total };
  }
  const config = buildEventSelectionConfig(sport, competitionId, event);
  const formation = config.formations[0];
  const selection = teamSheetService.getSelection(`${competitionId}:${event.key}`, config);
  const total = formation?.slots.length ?? 0;
  const filled = selection.starters.length;
  if (selection.status === "Published") return { status: "Published", filled, total };
  if (total > 0 && filled >= total) return { status: "Complete", filled, total };
  if (filled > 0) return { status: "Partially filled", filled, total };
  return { status: "Open", filled, total };
}

const typeLabel: Record<SportEvent["type"], string> = { individual: "Individual", relay: "Relay", crew: "Crew" };

export function CompetitionDetailPage({ competitionId, navigate }: { competitionId?: string; navigate: (p: PageId, arg?: string) => void }) {
  const { data: competition } = useCompetition(competitionId);
  useEventEntriesStore(); // re-render on entry mutations
  useTeamSheetsStore(); // re-render on relay/crew selection mutations

  if (competition === undefined) return <PageLoading />;
  if (!competition) {
    return (
      <div className="space-y-4">
        <PageHeader eyebrow="Sport · Competitions" title="Competition" subtitle="This competition couldn't be found." />
        <Btn variant="outline" onClick={() => navigate("competitions")}><ArrowLeft className="size-4" /> Back to Competitions</Btn>
      </div>
    );
  }

  const config = sportConfigs[competition.sport];
  const events = competition.eventKeys.map((k) => config.events?.find((e) => e.key === k)).filter((e): e is SportEvent => !!e);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Sport · ${config.label}`}
        title={competition.name}
        subtitle={`${competition.comp} · ${competition.date} · ${competition.time}${competition.venue ? ` · ${competition.venue}` : ""}`}
        actions={<Btn variant="outline" onClick={() => navigate("competitions")}><ArrowLeft className="size-4" /> Back to Competitions</Btn>}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {events.map((event) => {
          const { status, filled, total } = eventFillInfo(competition.sport, competition.id, event);
          return (
            <Panel key={event.key} title={event.label} eyebrow={typeLabel[event.type]} action={<Pill tone={statusTone[status]}>{status.toUpperCase()}</Pill>}>
              <div className="text-sm text-muted-foreground">{filled} of {total || "—"} {event.type === "individual" ? "entries" : event.type === "relay" ? "legs" : "seats"} filled</div>
              <div className="mt-4">
                <Btn size="sm" onClick={() => navigate("event-entry", `${competition.id}|${event.key}`)}>Open entry <ChevronRight className="size-3.5" /></Btn>
              </div>
            </Panel>
          );
        })}
        {events.length === 0 && <div className="col-span-full py-8 text-center text-sm text-muted-foreground">This competition has no events configured.</div>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// EventEntryPage
// ---------------------------------------------------------------------------

export function EventEntryPage({ competitionId, eventKey, navigate }: { competitionId?: string; eventKey?: string; navigate: (p: PageId, arg?: string) => void }) {
  const { data: competition } = useCompetition(competitionId);
  const { data: members } = useMembers();
  useEventEntriesStore();
  useTeamSheetsStore();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [picker, setPicker] = useState<{ mode: "slot"; slotId: string } | { mode: "bench" } | undefined>(undefined);
  const [resetOpen, setResetOpen] = useState(false);

  if (competition === undefined || !members) return <PageLoading />;
  const event = competition ? sportConfigs[competition.sport].events?.find((e) => e.key === eventKey) : undefined;

  if (!competition || !event) {
    return (
      <div className="space-y-4">
        <PageHeader eyebrow="Sport · Event Entry" title="Event" subtitle="This event couldn't be found." />
        <Btn variant="outline" onClick={() => navigate("competitions")}><ArrowLeft className="size-4" /> Back to Competitions</Btn>
      </div>
    );
  }

  const memberById = (id: string) => members.find((m) => m.id === id);
  const roster = members.filter((m) => (m.sport ?? "football") === rosterSportFor(competition.sport)).slice(0, 18);
  const getAvailability = (memberId: string) => sportService.getAvailability(competition.id, memberId, memberById(memberId)?.availability ?? "green");

  const headerActions = <Btn variant="outline" onClick={() => navigate("competition-detail", competition.id)}><ArrowLeft className="size-4" /> Back to {competition.name}</Btn>;
  const subtitle = `${competition.comp} · ${competition.date} · ${competition.time}${competition.venue ? ` · ${competition.venue}` : ""}`;

  if (event.type === "individual") {
    const entry = eventEntryService.getEntry(competition.id, event.key);
    const isBuilder = entry.status === "Draft";
    const limit = event.entryLimit ?? Infinity;
    const isFull = entry.entries.length >= limit;
    const insights = eventEntryService.getEntryInsights(event, entry, roster, getAvailability);

    const addEntry = (memberId: string) => {
      if (isFull) {
        toast.error(`${event.label}'s entry list is full.`);
        return;
      }
      eventEntryService.addEntry(competition.id, event, memberId);
      toast.success(`${memberById(memberId)?.name} entered into ${event.label}.`);
    };
    const removeEntry = (memberId: string) => {
      eventEntryService.removeEntry(competition.id, event.key, memberId);
      toast.success(`${memberById(memberId)?.name} removed from ${event.label}.`);
    };
    const publish = () => { eventEntryService.publish(competition.id, event.key); toast.success("Entries published."); };
    const editEntries = () => { eventEntryService.unpublish(competition.id, event.key); toast.success("Reopened for editing."); };
    const reset = () => { eventEntryService.resetEntries(competition.id, event.key); setResetOpen(false); toast.success("Entries reset."); };
    const downloadGraphic = () => {
      const svg = buildEventEntrySvg({
        eventLabel: event.label,
        headline: `${competition.name} — ${event.label}`,
        subline: subtitle,
        entries: entry.entries.map((id) => ({ name: memberById(id)?.name ?? "Athlete", squadNumber: memberById(id)?.squadNumber })),
      });
      downloadSvg(svg, `${competition.name}-${event.label}-entries.svg`.replace(/\s+/g, "-").toLowerCase());
      toast.success("Entry list graphic downloaded.");
    };
    const postToSpaces = () => {
      const names = entry.entries.map((id) => memberById(id)?.name).filter(Boolean).join(", ");
      spacesService.addPost({ tag: "ENTRY NEWS", title: `${event.label} entries confirmed`, body: `${competition.name}: ${names || "entries to be confirmed"}. ${competition.date} ${competition.time}.` });
      toast.success("Posted to Spaces — awaiting approval.");
      navigate("spaces");
    };
    const createStory = () => {
      spacesService.addPost({ tag: "MATCHDAY STORY", title: `${event.label} at ${competition.name}`, body: `Riverside enter ${entry.entries.length} athlete${entry.entries.length === 1 ? "" : "s"} into ${event.label} at ${competition.name} on ${competition.date}.`, ai: true });
      toast.success("Story created and posted to Spaces — awaiting approval.");
      navigate("spaces");
    };

    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Sport · Event Entry" title={`${competition.name} — ${event.label}`} subtitle={subtitle} actions={<><Pill tone={isBuilder ? "orange" : "green"}>{entry.status}</Pill>{headerActions}</>} />

        {isBuilder ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              {insights.slice(0, 3).map((i) => <InsightCard key={i.id} kind={i.kind} title={i.title} body={i.body} />)}
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <Panel
                className="lg:col-span-2"
                eyebrow={event.label}
                title="Entered athletes"
                action={<div className="flex items-center gap-2"><Btn size="sm" variant="ghost" onClick={() => setResetOpen(true)}><RotateCcw className="size-3.5" /> Reset</Btn><Btn size="sm" variant="outline" disabled={isFull} onClick={() => setPickerOpen(true)}><UserPlus className="size-3.5" /> Add athlete</Btn></div>}
              >
                {entry.entries.length === 0 && <div className="py-4 text-center text-sm text-muted-foreground">No athletes entered yet.</div>}
                <div className="space-y-1.5">
                  {entry.entries.map((id) => {
                    const m = memberById(id);
                    return m ? <BenchRow key={id} member={m} onRemove={() => removeEntry(id)} /> : null;
                  })}
                </div>
                {event.entryLimit != null && <div className="mt-3 text-xs text-muted-foreground">{entry.entries.length} of {event.entryLimit} entry place{event.entryLimit === 1 ? "" : "s"} used.</div>}
              </Panel>
              <div className="space-y-4">
                {insights.slice(3).length > 0 && (
                  <Panel eyebrow="Allstars Intelligence" title="More insights">
                    <div className="space-y-3">{insights.slice(3).map((i) => <InsightCard key={i.id} kind={i.kind} title={i.title} body={i.body} />)}</div>
                  </Panel>
                )}
                <Btn className="w-full" onClick={publish}><CheckCircle2 className="size-4" /> Publish Entries</Btn>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <Btn variant="outline" onClick={editEntries}><Pencil className="size-4" /> Edit Entries</Btn>
              <Btn variant="outline" onClick={downloadGraphic}><Download className="size-4" /> Download Graphic</Btn>
              <Btn variant="outline" onClick={postToSpaces}><Send className="size-4" /> Post to Spaces</Btn>
              <Btn variant="outline" onClick={createStory}><Megaphone className="size-4" /> Create Story</Btn>
            </div>
            <Panel eyebrow={event.label} title="Published Entries">
              {entry.entries.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">No athletes entered.</div>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {entry.entries.map((id) => {
                    const m = memberById(id);
                    return m ? <BenchRow key={id} member={m} readOnly /> : null;
                  })}
                </div>
              )}
            </Panel>
          </>
        )}

        <EventEntryPickerModal open={pickerOpen} onOpenChange={setPickerOpen} event={event} roster={roster} enteredIds={entry.entries} getAvailability={getAvailability} onPick={addEntry} />
        <ConfirmDialog open={resetOpen} onOpenChange={setResetOpen} title="Reset entries?" description="This clears every entered athlete for this event. This can't be undone." confirmLabel="Reset entries" destructive onConfirm={reset} />
      </div>
    );
  }

  // "relay" / "crew" — reuses teamSheetService entirely via a synthetic
  // per-event SportConfig (see sportConfigs.ts's buildEventSelectionConfig),
  // the exact same pattern TeamSheet.tsx uses for real fixtures.
  const config = buildEventSelectionConfig(competition.sport, competition.id, event);
  const compositeKey = `${competition.id}:${event.key}`;
  const selection = teamSheetService.getSelection(compositeKey, config);
  const formation = config.formations[0];
  const isBuilder = selection.status === "Draft";
  const insights = teamSheetService.getSelectionInsights(config, selection, roster, getAvailability);
  const activeSlot = picker?.mode === "slot" ? formation.slots.find((s) => s.slotId === picker.slotId) : undefined;
  const isRelay = event.type === "relay";

  const moveInOrder = (slotId: string, direction: -1 | 1) => {
    const idx = formation.slots.findIndex((s) => s.slotId === slotId);
    const target = formation.slots[idx + direction];
    if (!target) return;
    teamSheetService.swapSlots(compositeKey, config, slotId, target.slotId);
  };
  const toggleCaptain = (memberId: string) => teamSheetService.setCaptain(compositeKey, config, selection.captainId === memberId ? undefined : memberId);
  const handlePick = (memberId: string, opts?: { override?: boolean }) => {
    const name = memberById(memberId)?.name ?? "Athlete";
    if (picker?.mode === "slot" && activeSlot) {
      const label = config.positions.find((p) => p.key === activeSlot.position)?.label ?? activeSlot.position;
      teamSheetService.assignPlayer(compositeKey, config, picker.slotId, memberId, opts);
      toast.success(`${name} selected for ${label}.`);
    } else if (picker?.mode === "bench") {
      teamSheetService.addToBench(compositeKey, config, memberId);
      toast.success(`${name} added to the ${config.benchLabel.toLowerCase()}.`);
    }
  };
  const removeFromSlot = (slotId: string) => {
    const st = selection.starters.find((s) => s.slotId === slotId);
    teamSheetService.removeFromSlot(compositeKey, config, slotId);
    if (st) toast.success(`${memberById(st.memberId)?.name} removed.`);
  };
  const removeFromBench = (memberId: string) => {
    teamSheetService.removeFromBench(compositeKey, config, memberId);
    toast.success(`${memberById(memberId)?.name} removed from the ${config.benchLabel.toLowerCase()}.`);
  };
  const reset = () => { teamSheetService.resetSelection(compositeKey, config); setResetOpen(false); toast.success("Selection reset."); };
  const publish = () => { teamSheetService.publish(compositeKey, config); toast.success(`${event.label} published.`); };
  const editSelection = () => { teamSheetService.unpublish(compositeKey, config); toast.success("Reopened for editing."); };
  const downloadGraphic = () => {
    const svg = buildTeamSheetSvg({ config, selection, memberById, headline: `${competition.name} — ${event.label}`, subline: subtitle });
    downloadSvg(svg, `${competition.name}-${event.label}.svg`.replace(/\s+/g, "-").toLowerCase());
    toast.success(`${event.label} graphic downloaded.`);
  };
  const postToSpaces = () => {
    const names = selection.starters.map((st) => memberById(st.memberId)?.name).filter(Boolean).join(", ");
    spacesService.addPost({ tag: "TEAM NEWS", title: `${event.label} lineup confirmed`, body: `${isRelay ? "Running order" : "Crew"}: ${names || "to be confirmed"}. ${competition.name}, ${competition.date} ${competition.time}.` });
    toast.success("Posted to Spaces — awaiting approval.");
    navigate("spaces");
  };
  const createStory = () => {
    spacesService.addPost({ tag: "MATCHDAY STORY", title: `Riverside name their ${event.label.toLowerCase()} ${isRelay ? "squad" : "crew"}`, body: `${competition.name}: ${selection.starters.length} of ${formation.slots.length} ${isRelay ? "legs" : "seats"} confirmed for ${event.label} on ${competition.date}.`, ai: true });
    toast.success("Story created and posted to Spaces — awaiting approval.");
    navigate("spaces");
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Sport · Event Entry" title={`${competition.name} — ${event.label}`} subtitle={subtitle} actions={<><Pill tone={isBuilder ? "orange" : "green"}>{selection.status}</Pill>{headerActions}</>} />

      {isBuilder ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {insights.slice(0, 3).map((i) => <InsightCard key={i.id} kind={i.kind} title={i.title} body={i.body} />)}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Panel
                eyebrow={`${event.label} · ${isRelay ? "Running Order" : "Crew Builder"}`}
                title={isRelay ? "Tap a leg to select an athlete" : "Tap a seat to select an athlete"}
                action={<Btn size="sm" variant="ghost" onClick={() => setResetOpen(true)}><RotateCcw className="size-3.5" /> Reset</Btn>}
              >
                {isRelay ? (
                  <OrderedLineup
                    config={config}
                    formation={formation}
                    selection={selection}
                    memberById={memberById}
                    onSlotClick={(slotId) => setPicker({ mode: "slot", slotId })}
                    onRemove={removeFromSlot}
                    onMoveUp={(slotId) => moveInOrder(slotId, -1)}
                    onMoveDown={(slotId) => moveInOrder(slotId, 1)}
                    onToggleCaptain={toggleCaptain}
                  />
                ) : (
                  <Pitch surface={config.surface}>
                    {formation.slots.map((slot) => {
                      const started = selection.starters.find((st) => st.slotId === slot.slotId);
                      const member = started ? memberById(started.memberId) : undefined;
                      return (
                        <SlotAnchor key={slot.slotId} x={slot.x ?? 50} y={slot.y ?? 50}>
                          <SlotChip slot={slot} config={config} member={member} onClick={() => setPicker({ mode: "slot", slotId: slot.slotId })} />
                        </SlotAnchor>
                      );
                    })}
                  </Pitch>
                )}
              </Panel>

              {!isRelay && (
                <Panel eyebrow="Crew" title={`${config.startersLabel} — full list`}>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {formation.slots.map((slot) => {
                      const started = selection.starters.find((st) => st.slotId === slot.slotId);
                      const member = started ? memberById(started.memberId) : undefined;
                      const label = config.positions.find((p) => p.key === slot.position)?.label ?? slot.position;
                      return member ? (
                        <BenchRow key={slot.slotId} member={member} positionLabel={label} onClick={() => setPicker({ mode: "slot", slotId: slot.slotId })} onRemove={() => removeFromSlot(slot.slotId)} isCaptain={selection.captainId === member.id} onToggleCaptain={() => toggleCaptain(member.id)} />
                      ) : (
                        <button key={slot.slotId} onClick={() => setPicker({ mode: "slot", slotId: slot.slotId })} className="flex items-center gap-2.5 rounded-xl border border-dashed border-border p-2 text-left text-sm text-muted-foreground hover:bg-muted">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-dashed border-border text-xs">+</span>
                          {label} — unfilled
                        </button>
                      );
                    })}
                  </div>
                </Panel>
              )}
            </div>

            <div className="space-y-4">
              <Panel eyebrow={config.benchLabel} title={config.benchLabel} action={<Btn size="sm" variant="outline" onClick={() => setPicker({ mode: "bench" })}>Add</Btn>}>
                {selection.bench.length === 0 && <div className="py-4 text-center text-sm text-muted-foreground">No {config.benchLabel.toLowerCase()} named yet.</div>}
                <div className="space-y-1.5">
                  {selection.bench.map((id) => {
                    const m = memberById(id);
                    return m ? <BenchRow key={id} member={m} onRemove={() => removeFromBench(id)} /> : null;
                  })}
                </div>
              </Panel>
              {insights.slice(3).length > 0 && (
                <Panel eyebrow="Allstars Intelligence" title="More insights">
                  <div className="space-y-3">{insights.slice(3).map((i) => <InsightCard key={i.id} kind={i.kind} title={i.title} body={i.body} />)}</div>
                </Panel>
              )}
              <Btn className="w-full" onClick={publish}><CheckCircle2 className="size-4" /> Publish {event.label}</Btn>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <Btn variant="outline" onClick={editSelection}><Pencil className="size-4" /> Edit Selection</Btn>
            <Btn variant="outline" onClick={downloadGraphic}><Download className="size-4" /> Download Graphic</Btn>
            <Btn variant="outline" onClick={postToSpaces}><Send className="size-4" /> Post to Spaces</Btn>
            <Btn variant="outline" onClick={createStory}><Megaphone className="size-4" /> Create Story</Btn>
          </div>
          <Panel eyebrow={`${config.label} · ${event.label}`} title="Published">
            {isRelay ? (
              <OrderedLineup config={config} formation={formation} selection={selection} memberById={memberById} readOnly />
            ) : (
              <>
                <Pitch surface={config.surface}>
                  {formation.slots.map((slot) => {
                    const started = selection.starters.find((st) => st.slotId === slot.slotId);
                    const member = started ? memberById(started.memberId) : undefined;
                    return (
                      <SlotAnchor key={slot.slotId} x={slot.x ?? 50} y={slot.y ?? 50}>
                        <SlotChip slot={slot} config={config} member={member} onClick={() => {}} readOnly />
                      </SlotAnchor>
                    );
                  })}
                </Pitch>
                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                  {formation.slots.map((slot) => {
                    const started = selection.starters.find((st) => st.slotId === slot.slotId);
                    const member = started ? memberById(started.memberId) : undefined;
                    const label = config.positions.find((p) => p.key === slot.position)?.label ?? slot.position;
                    return member ? <BenchRow key={slot.slotId} member={member} positionLabel={label} readOnly isCaptain={selection.captainId === member.id} /> : null;
                  })}
                </div>
              </>
            )}
          </Panel>
          <Panel eyebrow={config.benchLabel} title={config.benchLabel}>
            {selection.bench.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">No {config.benchLabel.toLowerCase()} named.</div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {selection.bench.map((id) => { const m = memberById(id); return m ? <BenchRow key={id} member={m} readOnly /> : null; })}
              </div>
            )}
          </Panel>
        </>
      )}

      <PlayerPickerModal open={!!picker} onOpenChange={(o) => !o && setPicker(undefined)} config={config} slot={activeSlot} roster={roster} getAvailability={getAvailability} selection={selection} onPick={handlePick} />
      <ConfirmDialog open={resetOpen} onOpenChange={setResetOpen} title="Reset selection?" description="This clears every selected athlete for this event. This can't be undone." confirmLabel="Reset selection" destructive onConfirm={reset} />
    </div>
  );
}
