import { useState } from "react";
import { MapPin, Clock, Trophy, Users, Plus } from "lucide-react";
import { fixtures, challenges, challengeLeaderboard, members } from "../data";
import { PageHeader, Panel, Btn, Pill, Avatar, AvailabilityDot, ProgressBar, StatCard, InsightCard } from "../components/primitives";
import { Bars } from "../components/Charts";
import type { PageId } from "../nav";

export function Fixtures({ navigate }: { navigate: (p: PageId, arg?: string) => void }) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Sport" title="Fixtures" subtitle="Every fixture connects to availability, calendar, car pooling and live streaming." actions={<Btn><Plus className="size-4" /> New fixture</Btn>} />
      <div className="grid gap-4 md:grid-cols-3">
        {fixtures.map((f) => (
          <Panel key={f.id} title={`${f.home} vs ${f.away}`} eyebrow={f.comp}>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><Clock className="size-4" /> {f.date} · {f.time}</div>
              <div className="flex items-center gap-2"><MapPin className="size-4" /> {f.venue}</div>
            </div>
            <div className="mt-3 flex gap-2"><Pill tone="green">{f.available} avail</Pill><Pill tone="orange">{f.pending} pending</Pill><Pill tone="red">{f.unavailable} out</Pill></div>
            <div className="mt-4 flex gap-2">
              <Btn size="sm" variant="outline" onClick={() => navigate("availability")}>Availability</Btn>
              <Btn size="sm" variant="outline" onClick={() => navigate("carpool")}>Car pool</Btn>
              <Btn size="sm" onClick={() => navigate("control-room")}>Stream</Btn>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

export function Availability() {
  const f = fixtures[0];
  const roster = members.slice(0, 18);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Sport" title="Player Availability" subtitle={`${f.home} vs ${f.away} · ${f.date} ${f.time}`} actions={<Btn>Request availability</Btn>} />
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Available" value={`${f.available}`} accent />
        <StatCard label="Pending" value={`${f.pending}`} />
        <StatCard label="Unavailable" value={`${f.unavailable}`} />
      </div>
      <InsightCard kind="RISK" title="Recurring unavailability" body="Tom has been unavailable for four of the last six away fixtures — worth a conversation before selection." />
      <Panel eyebrow="Squad" title="Availability responses">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {roster.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
              <Avatar name={m.name} size={32} />
              <div className="flex-1"><div className="text-sm font-semibold text-[var(--sa-ink)]">{m.name}</div><div className="text-xs text-muted-foreground">{m.position}</div></div>
              <AvailabilityDot state={m.availability} />
              <span className="text-xs capitalize text-muted-foreground">{m.availability === "green" ? "Available" : m.availability === "orange" ? "Pending" : "Out"}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function Challenges({ navigate }: { navigate: (p: PageId, arg?: string) => void }) {
  const [active, setActive] = useState(challenges[0].id);
  const c = challenges.find((x) => x.id === active)!;
  const pct = Math.round((c.done / c.goal) * 100);
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Sport" title="Challenges" subtitle="Running, cycling, rowing, steps, mindfulness, fundraising — all feeding participation and rewards." actions={<Btn><Plus className="size-4" /> New challenge</Btn>} />

      <div className="grid gap-4 md:grid-cols-3">
        {challenges.map((ch) => {
          const p = Math.round((ch.done / ch.goal) * 100);
          return (
            <button key={ch.id} onClick={() => setActive(ch.id)} className={`rounded-2xl border p-4 text-left shadow-sm transition ${active === ch.id ? "border-[var(--sa-magenta)] ring-2 ring-[var(--sa-magenta)]/30" : "border-border hover:bg-muted"}`}>
              <div className="flex items-center justify-between"><span className="font-display text-xl text-[var(--sa-ink)]">{ch.name}</span><Trophy className="size-4 text-[var(--sa-magenta)]" /></div>
              <div className="mt-1 text-xs text-muted-foreground">{ch.type} · {ch.participants} participants · {ch.daysLeft} days left</div>
              <div className="mt-3"><ProgressBar value={p} /></div>
              <div className="mt-1.5 flex justify-between text-xs"><span className="text-muted-foreground">{ch.done.toLocaleString()} / {ch.goal.toLocaleString()} {ch.unit}</span><span className="font-semibold text-[var(--sa-ink)]">{p}%</span></div>
              {ch.sponsor && <div className="mt-2"><Pill tone="violet">Sponsored by {ch.sponsor}</Pill></div>}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" eyebrow={c.type} title={`${c.name} — team leaderboard`}>
          <div className="space-y-2">
            {challengeLeaderboard.map((row) => (
              <div key={row.pos} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                <span className="font-display text-lg text-muted-foreground">{row.pos}</span>
                <Avatar name={row.name} size={30} />
                <span className="flex-1 font-semibold text-[var(--sa-ink)]">{row.name}</span>
                <span className="font-semibold text-[var(--sa-ink)]">{row.value} {row.unit}</span>
              </div>
            ))}
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel eyebrow="Progress" title={`${pct}% complete`}>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div><div className="font-display text-2xl text-[var(--sa-ink)]">{c.done.toLocaleString()}</div><div className="text-xs text-muted-foreground">{c.unit} done</div></div>
              <div><div className="font-display text-2xl text-[var(--sa-ink)]">{c.teams}</div><div className="text-xs text-muted-foreground">teams</div></div>
              <div><div className="font-display text-2xl text-[var(--sa-ink)]">{c.participants}</div><div className="text-xs text-muted-foreground">participants</div></div>
              <div><div className="font-display text-2xl text-[var(--sa-ink)]">{c.daysLeft}</div><div className="text-xs text-muted-foreground">days left</div></div>
            </div>
          </Panel>
          <InsightCard kind="OPPORTUNITY" title="Close the gap" body={`Only ${(c.goal - c.done).toLocaleString()} ${c.unit} remains. 14 more participants completing this week's target could move the club into the regional Top 5.`} cta="Post to Spaces" onAction={() => navigate("spaces")} />
        </div>
      </div>
    </div>
  );
}
