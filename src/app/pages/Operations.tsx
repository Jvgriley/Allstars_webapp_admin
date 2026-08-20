import { useState } from "react";
import { Car, MapPin, Plus, Shield, ShieldAlert, Send } from "lucide-react";
import { carpool, safeguarding, fixtures, training } from "../data";
import { PageHeader, Panel, Btn, Pill, Avatar, StatCard, InsightCard } from "../components/primitives";

const views = ["Month", "Week", "Day", "Agenda"];
const eventTypes = [
  { label: "Fixture", color: "#ef3aa3" },
  { label: "Training", color: "#2a1b6b" },
  { label: "Event", color: "#d27bbf" },
  { label: "Meeting", color: "#b6a8d8" },
  { label: "Safeguarding", color: "#e11d48" },
];

// Build a simple month grid
const monthEvents: Record<number, { label: string; color: string }[]> = {
  4: [{ label: "Team meeting", color: "#b6a8d8" }],
  8: [{ label: "U16 Training", color: "#2a1b6b" }],
  12: [{ label: "Fundraiser", color: "#d27bbf" }],
  18: [{ label: "U16 Training", color: "#2a1b6b" }],
  20: [{ label: "U18 vs United", color: "#ef3aa3" }, { label: "U14 vs City", color: "#ef3aa3" }],
  21: [{ label: "Women's vs Falcons", color: "#ef3aa3" }],
  24: [{ label: "DBS renewal", color: "#e11d48" }],
  27: [{ label: "U14 vs City", color: "#ef3aa3" }],
};

export function CalendarPage() {
  const [view, setView] = useState("Month");
  const days = Array.from({ length: 35 }, (_, i) => i - 4); // start offset
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Operations" title="Calendar / Diary" subtitle="Fixtures, training, meetings, events, tournaments, fundraisers and safeguarding renewals in one place." actions={<Btn><Plus className="size-4" /> Create event</Btn>} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">{views.map((v) => <button key={v} onClick={() => setView(v)} className={`rounded-lg px-3 py-1.5 text-sm ${view === v ? "sa-gradient text-white" : "border border-border bg-card hover:bg-muted"}`}>{v}</button>)}</div>
        <div className="flex flex-wrap gap-2">{eventTypes.map((e) => <span key={e.label} className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="size-2.5 rounded-full" style={{ background: e.color }} />{e.label}</span>)}</div>
      </div>

      {view === "Agenda" ? (
        <Panel eyebrow="August 2026" title="Agenda">
          <div className="space-y-2">
            {[...fixtures.map((f) => ({ t: f.time, d: f.date, label: `${f.home} vs ${f.away}`, c: "#ef3aa3" })), ...training.map((t) => ({ t: t.time, d: t.date, label: `${t.team} — ${t.focus}`, c: "#2a1b6b" }))].map((e, i) => (
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
              <div key={d} className="min-h-[92px] bg-card p-1.5 text-left">
                <div className={`mb-1 text-xs ${d < 1 || d > 31 ? "text-muted-foreground/40" : "text-[var(--sa-ink)]"}`}>{d < 1 ? 31 + d : d > 31 ? d - 31 : d}</div>
                {d >= 1 && d <= 31 && (monthEvents[d] ?? []).map((e, i) => (
                  <div key={i} className="mb-0.5 truncate rounded px-1 py-0.5 text-[10px] font-medium text-white" style={{ background: e.color }}>{e.label}</div>
                ))}
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

export function CarPool() {
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
            <Btn size="sm" variant="outline" className="mt-3 w-full">Offer a seat</Btn>
          </Panel>
          <Panel eyebrow="Requests" title="Need a lift">
            <div className="space-y-2">
              {carpool.requests.map((r) => (
                <div key={r.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                  <div className="flex-1"><div className="text-sm font-semibold text-[var(--sa-ink)]">{r.player}</div><div className="text-xs text-muted-foreground">{r.area}</div></div>
                  <Pill tone={r.status === "Matched" ? "green" : "red"}>{r.status}</Pill>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

const channels = ["Allstars notification", "Spaces post", "Team message", "Club announcement", "Email", "Push notification"];
const audiences = ["Entire Club", "Team", "Age Group", "Coaches", "Parents", "Members", "Challenge Participants", "Custom Group"];

export function Communications() {
  const [channel, setChannel] = useState(channels[0]);
  const [audience, setAudience] = useState(audiences[0]);
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
            <input placeholder="Subject" className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--sa-magenta)]/40" />
            <textarea rows={5} placeholder="Write your message…" className="w-full rounded-lg border border-border bg-input-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--sa-magenta)]/40" />
            <div className="flex gap-2"><Btn><Send className="size-4" /> Send now</Btn><Btn variant="outline">Schedule</Btn><Btn variant="ghost">Save template</Btn></div>
          </div>
        </Panel>
        <div className="space-y-4">
          <StatCard label="Sent this month" value="34" delta="+12%" up />
          <StatCard label="Open rate" value="72%" delta="+5%" up accent />
          <StatCard label="Response rate" value="61%" delta="+8%" up />
        </div>
      </div>
    </div>
  );
}

export function Safeguarding() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="People" title="Safeguarding & Compliance" subtitle="Role-restricted. DBS status, qualifications, consent, media permissions and incidents." actions={<Btn variant="outline"><ShieldAlert className="size-4" /> Log incident</Btn>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Compliant staff" value="86%" accent />
        <StatCard label="Expiring soon" value="4" />
        <StatCard label="Missing DBS" value="2" />
        <StatCard label="Open incidents" value="0" />
      </div>
      <InsightCard kind="RISK" title="4 documents expiring within 30 days" body="Assign a safeguarding officer to chase renewals before they lapse to keep the club fully compliant." cta="Assign officer" />
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
    </div>
  );
}
