import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Car, MapPin, Plus, Shield, ShieldAlert, Send, Trash2 } from "lucide-react";
import { PageHeader, Panel, Btn, Pill, Avatar, StatCard, InsightCard, PageLoading, TextField, TextAreaField, SelectField } from "../components/primitives";
import { Modal, ConfirmDialog } from "../components/Modal";
import { carpoolService, useCarpool } from "../../services/carpoolService";
import { safeguardingService, useSafeguardingRecords, useSafeguardingIncidents } from "../../services/safeguardingService";
import { useFixtures, useTraining } from "../../services/sportService";
import { calendarService, eventTypeColor, useCalendarEvents } from "../../services/calendarService";
import { communicationsService, useSentCommunications } from "../../services/communicationsService";
import type { CalendarEvent, CalendarEventType } from "../../domain/types";

const views = ["Month", "Week", "Day", "Agenda"];
const eventTypes: CalendarEventType[] = ["Fixture", "Training", "Event", "Meeting", "Safeguarding"];

function dayOf(dateStr: string): number {
  const match = dateStr.match(/(\d{1,2})/);
  return match ? Number(match[1]) : 1;
}

function EventFormModal({
  open,
  onOpenChange,
  day,
  event,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  day: number;
  event?: CalendarEvent;
}) {
  const isEdit = !!event;
  const [title, setTitle] = useState(event?.title ?? "");
  const [type, setType] = useState<CalendarEventType>(event?.type ?? "Event");
  const [time, setTime] = useState(event?.time ?? "");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const save = () => {
    if (!title.trim()) {
      toast.error("Give the event a title.");
      return;
    }
    if (isEdit && event) {
      calendarService.updateEvent(event.id, { title, type, time });
      toast.success("Event updated.");
    } else {
      calendarService.addEvent({ day, title, type, time });
      toast.success(`"${title}" added to the calendar.`);
    }
    onOpenChange(false);
  };

  return (
    <>
      <Modal
        open={open}
        onOpenChange={onOpenChange}
        title={isEdit ? "Edit event" : `New event · ${day} Aug`}
        footer={
          <>
            {isEdit && <Btn variant="outline" className="mr-auto text-rose-600" onClick={() => setConfirmOpen(true)}><Trash2 className="size-4" /> Delete</Btn>}
            <Btn variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Btn>
            <Btn onClick={save}>{isEdit ? "Save changes" : "Create event"}</Btn>
          </>
        }
      >
        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Committee meeting" autoFocus />
        <div className="grid grid-cols-2 gap-3">
          <SelectField label="Type" value={type} onChange={(e) => setType(e.target.value as CalendarEventType)}>
            {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </SelectField>
          <TextField label="Time" value={time} onChange={(e) => setTime(e.target.value)} placeholder="18:00" />
        </div>
      </Modal>
      {isEdit && event && (
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Delete event?"
          description={`"${event.title}" will be removed from the calendar.`}
          confirmLabel="Delete"
          destructive
          onConfirm={() => {
            calendarService.removeEvent(event.id);
            toast.success("Event deleted.");
            setConfirmOpen(false);
            onOpenChange(false);
          }}
        />
      )}
    </>
  );
}

export function CalendarPage() {
  const { data: fixtures } = useFixtures();
  const { data: training } = useTraining();
  const { data: events } = useCalendarEvents();
  const [view, setView] = useState("Month");
  const [formOpen, setFormOpen] = useState(false);
  const [formDay, setFormDay] = useState(1);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | undefined>(undefined);
  const days = Array.from({ length: 35 }, (_, i) => i - 4); // start offset

  const monthEvents = useMemo(() => {
    if (!fixtures || !training || !events) return {} as Record<number, { label: string; color: string; event?: CalendarEvent }[]>;
    const map: Record<number, { label: string; color: string; event?: CalendarEvent }[]> = {};
    const push = (day: number, label: string, color: string, event?: CalendarEvent) => {
      map[day] = [...(map[day] ?? []), { label, color, event }];
    };
    fixtures.forEach((f) => push(dayOf(f.date), `${f.home} vs ${f.away}`, eventTypeColor.Fixture));
    training.forEach((t) => push(dayOf(t.date), `${t.team} Training`, eventTypeColor.Training));
    events.forEach((e) => push(e.day, e.title, eventTypeColor[e.type], e));
    return map;
  }, [fixtures, training, events]);

  if (!fixtures || !training || !events) return <PageLoading />;

  const openNew = (day: number) => { setEditingEvent(undefined); setFormDay(day); setFormOpen(true); };
  const openEdit = (day: number, event: CalendarEvent) => { setEditingEvent(event); setFormDay(day); setFormOpen(true); };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Operations" title="Calendar / Diary" subtitle="Fixtures, training, meetings, events, tournaments, fundraisers and safeguarding renewals in one place." actions={<Btn onClick={() => openNew(new Date().getDate())}><Plus className="size-4" /> Create event</Btn>} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">{views.map((v) => <button key={v} onClick={() => setView(v)} className={`rounded-lg px-3 py-1.5 text-sm ${view === v ? "sa-gradient text-white" : "border border-border bg-card hover:bg-muted"}`}>{v}</button>)}</div>
        <div className="flex flex-wrap gap-2">{eventTypes.map((t) => <span key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="size-2.5 rounded-full" style={{ background: eventTypeColor[t] }} />{t}</span>)}</div>
      </div>

      {view === "Agenda" ? (
        <Panel eyebrow="August 2026" title="Agenda">
          <div className="space-y-2">
            {[
              ...fixtures.map((f) => ({ t: f.time, d: f.date, label: `${f.home} vs ${f.away}`, c: eventTypeColor.Fixture })),
              ...training.map((t) => ({ t: t.time, d: t.date, label: `${t.team} — ${t.focus}`, c: eventTypeColor.Training })),
              ...events.map((e) => ({ t: e.time ?? "All day", d: `${e.day} Aug`, label: e.title, c: eventTypeColor[e.type] })),
            ].map((e, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <span className="size-2.5 rounded-full" style={{ background: e.c }} />
                <span className="w-28 text-sm text-muted-foreground">{e.d} · {e.t}</span>
                <span className="font-semibold text-[var(--sa-ink)]">{e.label}</span>
              </div>
            ))}
          </div>
        </Panel>
      ) : (
        <Panel eyebrow="August 2026" title={view + " view"}>
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border bg-border text-center text-xs">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="bg-muted py-2 font-semibold uppercase tracking-wider text-muted-foreground">{d}</div>)}
            {days.map((d) => (
              <button
                key={d}
                onClick={() => d >= 1 && d <= 31 && openNew(d)}
                disabled={d < 1 || d > 31}
                className="min-h-[92px] bg-card p-1.5 text-left disabled:cursor-default hover:enabled:bg-muted/60"
              >
                <div className={`mb-1 text-xs ${d < 1 || d > 31 ? "text-muted-foreground/40" : "text-[var(--sa-ink)]"}`}>{d < 1 ? 31 + d : d > 31 ? d - 31 : d}</div>
                {d >= 1 && d <= 31 && (monthEvents[d] ?? []).map((e, i) => (
                  <div
                    key={i}
                    onClick={(ev) => { if (e.event) { ev.stopPropagation(); openEdit(d, e.event); } }}
                    className={`mb-0.5 truncate rounded px-1 py-0.5 text-[10px] font-medium text-white ${e.event ? "cursor-pointer hover:opacity-80" : ""}`}
                    style={{ background: e.color }}
                  >
                    {e.label}
                  </div>
                ))}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Click an empty day to add an event · click an event you created to edit or delete it. Fixtures and training sessions are managed from their own pages.</p>
        </Panel>
      )}

      <EventFormModal open={formOpen} onOpenChange={setFormOpen} day={formDay} event={editingEvent} />
    </div>
  );
}

function OfferSeatModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [area, setArea] = useState("");
  const [driver, setDriver] = useState("");
  const [seats, setSeats] = useState("2");
  const save = () => {
    if (!area.trim() || !driver.trim()) { toast.error("Add an area and driver name."); return; }
    carpoolService.offerSeat({ area, driver, seats: Number(seats) || 1 });
    toast.success("Seat offer added.");
    onOpenChange(false);
    setArea(""); setDriver("");
  };
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Offer a seat" footer={<><Btn variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Btn><Btn onClick={save}>Add offer</Btn></>}>
      <TextField label="Pickup area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. West End" autoFocus />
      <TextField label="Driver" value={driver} onChange={(e) => setDriver(e.target.value)} placeholder="Parent of…" />
      <TextField label="Spare seats" type="number" min={1} value={seats} onChange={(e) => setSeats(e.target.value)} />
    </Modal>
  );
}

function RequestSeatModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [area, setArea] = useState("");
  const [player, setPlayer] = useState("");
  const save = () => {
    if (!area.trim() || !player.trim()) { toast.error("Add an area and player name."); return; }
    carpoolService.requestSeat({ area, player });
    toast.success("Transport request added.");
    onOpenChange(false);
    setArea(""); setPlayer("");
  };
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Request a seat" footer={<><Btn variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Btn><Btn onClick={save}>Add request</Btn></>}>
      <TextField label="Player" value={player} onChange={(e) => setPlayer(e.target.value)} placeholder="Player name" autoFocus />
      <TextField label="Pickup area" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. North Gate" />
    </Modal>
  );
}

export function CarPool() {
  const { data: carpool } = useCarpool();
  const [offerOpen, setOfferOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  if (!carpool) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Operations" title="Car Pooling" subtitle="Secure community transport for youth & community sport. Approximate pickup areas only — never exact home addresses." />
      <Panel eyebrow={carpool.fixture} title={carpool.when} action={<Pill tone="violet">Safeguarding controls on</Pill>}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Players travelling" value={`${carpool.travelling}`} />
          <StatCard label="Parents driving" value={`${carpool.drivers}`} />
          <StatCard label="Spare seats" value={`${carpool.spareSeats}`} accent />
          <StatCard label="Need transport" value={`${carpool.needsTransport}`} />
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" eyebrow="Coverage" title="Pickup areas (approximate)">
          <div className="relative grid aspect-[16/9] place-items-center overflow-hidden rounded-xl bg-[var(--sa-ink)]">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 30% 40%, #ef3aa3 0, transparent 22%), radial-gradient(circle at 65% 55%, #b6a8d8 0, transparent 20%), radial-gradient(circle at 50% 30%, #d27bbf 0, transparent 18%)" }} />
            <div className="relative flex flex-col items-center text-white/70"><MapPin className="size-8" /><span className="mt-1 text-sm">Approximate pickup heat map</span></div>
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel eyebrow="Seat offers" title="Parents driving">
            <div className="space-y-2">
              {carpool.offers.map((o) => (
                <div key={o.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                  <Car className="size-4 text-[var(--sa-magenta)]" />
                  <div className="flex-1"><div className="text-sm font-semibold text-[var(--sa-ink)]">{o.area}</div><div className="text-xs text-muted-foreground">{o.driver} · {o.seats} seats</div></div>
                  <Pill tone={o.status === "Confirmed" ? "green" : "orange"}>{o.status}</Pill>
                </div>
              ))}
            </div>
            <Btn size="sm" variant="outline" className="mt-3 w-full" onClick={() => setOfferOpen(true)}>Offer a seat</Btn>
          </Panel>
          <Panel eyebrow="Requests" title="Need a lift">
            <div className="space-y-2">
              {carpool.requests.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                  <div className="flex-1"><div className="text-sm font-semibold text-[var(--sa-ink)]">{r.player}</div><div className="text-xs text-muted-foreground">{r.area}</div></div>
                  {r.status === "Unmatched" ? (
                    <Btn size="sm" variant="outline" onClick={() => { carpoolService.matchRequest(r.id); toast.success(`${r.player} matched with a driver.`); }}>Match</Btn>
                  ) : (
                    <Pill tone="green">{r.status}</Pill>
                  )}
                </div>
              ))}
            </div>
            <Btn size="sm" variant="outline" className="mt-3 w-full" onClick={() => setRequestOpen(true)}>Request a seat</Btn>
          </Panel>
        </div>
      </div>

      <OfferSeatModal open={offerOpen} onOpenChange={setOfferOpen} />
      <RequestSeatModal open={requestOpen} onOpenChange={setRequestOpen} />
    </div>
  );
}

const channels = ["Allstars notification", "Spaces post", "Team message", "Club announcement", "Email", "Push notification"];
const audiences = ["Entire Club", "Team", "Age Group", "Coaches", "Parents", "Members", "Challenge Participants", "Custom Group"];

export function Communications() {
  const [channel, setChannel] = useState(channels[0]);
  const [audience, setAudience] = useState(audiences[0]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleWhen, setScheduleWhen] = useState("Tomorrow 09:00");
  const { data: sent = [] } = useSentCommunications();

  const reset = () => { setSubject(""); setBody(""); };

  const sendNow = () => {
    if (!subject.trim() || !body.trim()) { toast.error("Add a subject and message before sending."); return; }
    communicationsService.send({ channel, audience, subject });
    toast.success(`Sent to ${audience} via ${channel}.`);
    reset();
  };

  const confirmSchedule = () => {
    if (!subject.trim() || !body.trim()) { toast.error("Add a subject and message before scheduling."); return; }
    communicationsService.schedule({ channel, audience, subject }, scheduleWhen);
    toast.success(`Scheduled for ${scheduleWhen}.`);
    setScheduleOpen(false);
    reset();
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Operations" title="Communications" subtitle="Reach the right people through the right channel — with scheduling, templates and engagement reporting." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" eyebrow="Compose" title="New message">
          <div className="space-y-4">
            <div>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Channel</div>
              <div className="flex flex-wrap gap-1.5">{channels.map((c) => <button key={c} onClick={() => setChannel(c)} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${channel === c ? "sa-gradient text-white" : "border border-border bg-card hover:bg-muted"}`}>{c}</button>)}</div>
            </div>
            <div>
              <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Audience</div>
              <div className="flex flex-wrap gap-1.5">{audiences.map((a) => <button key={a} onClick={() => setAudience(a)} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${audience === a ? "bg-[var(--sa-violet)] text-white" : "border border-border bg-card hover:bg-muted"}`}>{a}</button>)}</div>
            </div>
            <TextField placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <TextAreaField rows={5} placeholder="Write your message…" value={body} onChange={(e) => setBody(e.target.value)} />
            <div className="flex gap-2">
              <Btn onClick={sendNow}><Send className="size-4" /> Send now</Btn>
              <Btn variant="outline" onClick={() => setScheduleOpen(true)}>Schedule</Btn>
              <Btn variant="ghost" onClick={() => toast.success("Template saved.")}>Save template</Btn>
            </div>
          </div>
        </Panel>
        <div className="space-y-4">
          <StatCard label="Sent this month" value={`${34 + sent.filter((s) => s.status === "Sent").length}`} delta="+12%" up />
          <StatCard label="Open rate" value="72%" delta="+5%" up accent />
          <StatCard label="Response rate" value="61%" delta="+8%" up />
          {sent.length > 0 && (
            <Panel eyebrow="This session" title="Recent activity">
              <div className="space-y-2">
                {sent.slice(0, 5).map((s) => (
                  <div key={s.id} className="rounded-lg border border-border p-2.5 text-sm">
                    <div className="flex items-center justify-between"><span className="font-semibold text-[var(--sa-ink)]">{s.subject}</span><Pill tone={s.status === "Sent" ? "green" : "orange"}>{s.status}</Pill></div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{s.channel} · {s.audience} · {s.when}</div>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>

      <Modal
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        title="Schedule message"
        footer={<><Btn variant="ghost" onClick={() => setScheduleOpen(false)}>Cancel</Btn><Btn onClick={confirmSchedule}>Schedule</Btn></>}
      >
        <TextField label="Send at" value={scheduleWhen} onChange={(e) => setScheduleWhen(e.target.value)} placeholder="Tomorrow 09:00" autoFocus />
      </Modal>
    </div>
  );
}

function LogIncidentModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<"Low" | "Medium" | "High">("Medium");
  const save = () => {
    if (!title.trim()) { toast.error("Describe the incident."); return; }
    safeguardingService.logIncident(title, severity);
    toast.success("Incident logged.");
    onOpenChange(false);
    setTitle("");
  };
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Log incident" footer={<><Btn variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Btn><Btn onClick={save}>Log incident</Btn></>}>
      <TextField label="Summary" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief, factual description" autoFocus />
      <SelectField label="Severity" value={severity} onChange={(e) => setSeverity(e.target.value as "Low" | "Medium" | "High")}>
        {["Low", "Medium", "High"].map((s) => <option key={s} value={s}>{s}</option>)}
      </SelectField>
    </Modal>
  );
}

export function Safeguarding() {
  const { data: safeguarding } = useSafeguardingRecords();
  const { data: incidents = [] } = useSafeguardingIncidents();
  const [incidentOpen, setIncidentOpen] = useState(false);
  if (!safeguarding) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="People" title="Safeguarding & Compliance" subtitle="Role-restricted. DBS status, qualifications, consent, media permissions and incidents." actions={<Btn variant="outline" onClick={() => setIncidentOpen(true)}><ShieldAlert className="size-4" /> Log incident</Btn>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Compliant staff" value="86%" accent />
        <StatCard label="Expiring soon" value="4" />
        <StatCard label="Missing DBS" value="2" />
        <StatCard label="Open incidents" value={`${incidents.length}`} />
      </div>
      <InsightCard kind="RISK" title="4 documents expiring within 30 days" body="Assign a safeguarding officer to chase renewals before they lapse to keep the club fully compliant." cta="Assign officer" onAction={() => toast.success("Safeguarding officer assigned.")} />
      {incidents.length > 0 && (
        <Panel eyebrow="This session" title="Logged incidents">
          <div className="space-y-2">
            {incidents.map((i) => (
              <div key={i.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <ShieldAlert className={`size-4 ${i.severity === "High" ? "text-rose-600" : i.severity === "Medium" ? "text-amber-600" : "text-muted-foreground"}`} />
                <div className="flex-1 text-sm text-[var(--sa-ink)]">{i.title}</div>
                <Pill tone={i.severity === "High" ? "red" : i.severity === "Medium" ? "orange" : "muted"}>{i.severity}</Pill>
                <span className="text-xs text-muted-foreground">{i.loggedAt}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
      <Panel eyebrow="Staff & volunteers" title="Verification status">
        <div className="sa-scroll overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead><tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground"><th className="py-2.5 pr-3">Name</th><th className="px-3">Role</th><th className="px-3">DBS</th><th className="px-3">Expires</th><th className="px-3">Qualifications</th><th className="px-3">Status</th></tr></thead>
            <tbody>
              {safeguarding.map((s) => (
                <tr key={s.id} className="border-b border-border/60">
                  <td className="py-2.5 pr-3"><div className="flex items-center gap-2"><Avatar name={s.name} size={30} /><span className="font-semibold text-[var(--sa-ink)]">{s.name}</span></div></td>
                  <td className="px-3">{s.role}</td>
                  <td className="px-3"><Pill tone={s.dbs === "Valid" ? "green" : s.dbs === "Expiring" ? "orange" : "red"}><Shield className="size-3" /> {s.dbs}</Pill></td>
                  <td className="px-3 text-muted-foreground">{s.expires}</td>
                  <td className="px-3 text-muted-foreground">{s.quals}</td>
                  <td className="px-3"><Pill tone={s.status === "Compliant" ? "green" : "red"}>{s.status}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <LogIncidentModal open={incidentOpen} onOpenChange={setIncidentOpen} />
    </div>
  );
}
