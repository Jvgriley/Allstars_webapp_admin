import { useState } from "react";
import { toast } from "sonner";
import { MapPin, Clock, Trophy, Plus, Pencil, Check } from "lucide-react";
import { PageHeader, Panel, Btn, Pill, Avatar, AvailabilityDot, ProgressBar, StatCard, InsightCard, PageLoading, TextField, SelectField } from "../components/primitives";
import { Modal } from "../components/Modal";
import type { PageId } from "../nav";
import type { AvailabilityState, Fixture } from "../../domain/types";
import { sportService, useFixtures, useChallenges, useChallengeLeaderboard, useFixtureAvailability } from "../../services/sportService";
import { useMembers } from "../../services/membersService";

function FixtureFormModal({ open, onOpenChange, fixture }: { open: boolean; onOpenChange: (o: boolean) => void; fixture?: Fixture }) {
  const isEdit = !!fixture;
  const [home, setHome] = useState(fixture?.home ?? "Riverside FC");
  const [away, setAway] = useState(fixture?.away ?? "");
  const [date, setDate] = useState(fixture?.date ?? "");
  const [time, setTime] = useState(fixture?.time ?? "");
  const [comp, setComp] = useState(fixture?.comp ?? "");
  const [venue, setVenue] = useState(fixture?.venue ?? "Riverside Sports Ground");

  const save = () => {
    if (!away.trim() || !date.trim() || !time.trim()) {
      toast.error("Fill in the opponent, date and time.");
      return;
    }
    if (isEdit && fixture) {
      sportService.updateFixture(fixture.id, { home, away, date, time, comp, venue });
      toast.success("Fixture updated.");
    } else {
      sportService.addFixture({ home, away, date, time, comp, venue });
      toast.success(`Fixture vs ${away} created.`);
    }
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit fixture" : "New fixture"}
      footer={<><Btn variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Btn><Btn onClick={save}>{isEdit ? "Save changes" : "Create fixture"}</Btn></>}
    >
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Home" value={home} onChange={(e) => setHome(e.target.value)} />
        <TextField label="Away" value={away} onChange={(e) => setAway(e.target.value)} placeholder="Opponent" autoFocus />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Date" value={date} onChange={(e) => setDate(e.target.value)} placeholder="Sat 27 Aug" />
        <TextField label="Time" value={time} onChange={(e) => setTime(e.target.value)} placeholder="14:00" />
      </div>
      <TextField label="Competition" value={comp} onChange={(e) => setComp(e.target.value)} placeholder="e.g. U18 Premier" />
      <TextField label="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
    </Modal>
  );
}

export function Fixtures({ navigate }: { navigate: (p: PageId, arg?: string) => void }) {
  const { data: fixtures } = useFixtures();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Fixture | undefined>(undefined);

  if (!fixtures) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Sport" title="Fixtures" subtitle="Every fixture connects to availability, calendar, car pooling and live streaming." actions={<Btn onClick={() => { setEditing(undefined); setFormOpen(true); }}><Plus className="size-4" /> New fixture</Btn>} />
      <div className="grid gap-4 md:grid-cols-3">
        {fixtures.map((f) => (
          <Panel key={f.id} title={`${f.home} vs ${f.away}`} eyebrow={f.comp} action={<button title="Edit fixture" onClick={() => { setEditing(f); setFormOpen(true); }} className="rounded p-1 hover:bg-muted"><Pencil className="size-3.5 text-muted-foreground" /></button>}>
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
      <FixtureFormModal open={formOpen} onOpenChange={setFormOpen} fixture={editing} />
    </div>
  );
}

const availLabel: Record<AvailabilityState, string> = { green: "Available", orange: "Pending", red: "Unavailable" };

export function Availability() {
  const { data: fixtures } = useFixtures();
  const { data: members } = useMembers();
  useFixtureAvailability(); // subscribe so per-member responses re-render live
  const [fixtureId, setFixtureId] = useState<string | undefined>(undefined);

  if (!fixtures || !members) return <PageLoading />;
  if (fixtures.length === 0) return <PageLoading />;

  const f = fixtures.find((x) => x.id === fixtureId) ?? fixtures[0];
  const roster = members.slice(0, 18);
  const responses = roster.map((m) => sportService.getAvailability(f.id, m.id, m.availability));
  const counts = { green: responses.filter((r) => r === "green").length, orange: responses.filter((r) => r === "orange").length, red: responses.filter((r) => r === "red").length };

  const setResponse = (memberId: string, state: AvailabilityState, name: string) => {
    sportService.setAvailability(f.id, memberId, state);
    toast.success(`${name} marked ${availLabel[state].toLowerCase()} for ${f.home} vs ${f.away}.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sport"
        title="Player Availability"
        subtitle={`${f.home} vs ${f.away} · ${f.date} ${f.time}`}
        actions={
          <>
            <SelectField value={f.id} onChange={(e) => setFixtureId(e.target.value)} className="w-auto">
              {fixtures.map((fx) => <option key={fx.id} value={fx.id}>{fx.home} vs {fx.away} · {fx.date}</option>)}
            </SelectField>
            <Btn onClick={() => toast.success("Availability request sent to the squad.")}>Request availability</Btn>
          </>
        }
      />
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Available" value={`${counts.green}`} accent />
        <StatCard label="Pending" value={`${counts.orange}`} />
        <StatCard label="Unavailable" value={`${counts.red}`} />
      </div>
      <InsightCard kind="RISK" title="Recurring unavailability" body="Tom has been unavailable for four of the last six away fixtures — worth a conversation before selection." />
      <Panel eyebrow="Squad" title="Availability responses — click a state to update">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {roster.map((m, i) => {
            const state = responses[i];
            return (
              <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                <Avatar name={m.name} size={32} />
                <div className="flex-1"><div className="text-sm font-semibold text-[var(--sa-ink)]">{m.name}</div><div className="text-xs text-muted-foreground">{m.position}</div></div>
                <div className="flex gap-1">
                  {(["green", "orange", "red"] as AvailabilityState[]).map((s) => (
                    <button
                      key={s}
                      title={availLabel[s]}
                      onClick={() => setResponse(m.id, s, m.name)}
                      className={`grid size-6 place-items-center rounded-full border transition ${state === s ? "border-transparent ring-2 ring-offset-1 ring-[var(--sa-magenta)]/50" : "border-border opacity-40 hover:opacity-100"}`}
                    >
                      <AvailabilityDot state={s} />
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

function ChallengeFormModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("Running");
  const [goal, setGoal] = useState("1000");
  const [unit, setUnit] = useState("km");

  const save = () => {
    if (!name.trim() || !goal.trim()) {
      toast.error("Name the challenge and set a goal.");
      return;
    }
    sportService.addChallenge({ name, type, goal: Number(goal) || 0, unit });
    toast.success(`${name} created.`);
    onOpenChange(false);
    setName("");
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="New challenge" footer={<><Btn variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Btn><Btn onClick={save}>Create challenge</Btn></>}>
      <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. September Steps Challenge" autoFocus />
      <div className="grid grid-cols-3 gap-3">
        <SelectField label="Type" value={type} onChange={(e) => setType(e.target.value)}>
          {["Running", "Cycling", "Rowing", "Steps", "Mindfulness", "Fundraising"].map((t) => <option key={t} value={t}>{t}</option>)}
        </SelectField>
        <TextField label="Goal" type="number" value={goal} onChange={(e) => setGoal(e.target.value)} />
        <TextField label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="km" />
      </div>
    </Modal>
  );
}

export function Challenges({ navigate }: { navigate: (p: PageId, arg?: string) => void }) {
  const { data: challenges } = useChallenges();
  const [active, setActive] = useState<string | undefined>(undefined);
  const c = challenges?.find((x) => x.id === active) ?? challenges?.[0];
  const { data: challengeLeaderboard } = useChallengeLeaderboard(c?.id);
  const [formOpen, setFormOpen] = useState(false);

  if (!challenges || !challengeLeaderboard || !c) return <PageLoading />;

  const pct = Math.round((c.done / c.goal) * 100);
  const joined = sportService.hasJoined(c.id);

  const join = () => {
    sportService.joinChallenge(c.id);
    toast.success(`You joined ${c.name}.`);
  };
  const logProgress = () => {
    const amount = Math.max(1, Math.round(c.goal * 0.02));
    sportService.logProgress(c.id, amount);
    toast.success(`Logged ${amount.toLocaleString()} ${c.unit} for ${c.name}.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Sport" title="Challenges" subtitle="Running, cycling, rowing, steps, mindfulness, fundraising — all feeding participation and rewards." actions={<Btn onClick={() => setFormOpen(true)}><Plus className="size-4" /> New challenge</Btn>} />

      <div className="grid gap-4 md:grid-cols-3">
        {challenges.map((ch) => {
          const p = Math.round((ch.done / ch.goal) * 100);
          return (
            <button key={ch.id} onClick={() => setActive(ch.id)} className={`rounded-2xl border p-4 text-left shadow-sm transition ${c.id === ch.id ? "border-[var(--sa-magenta)] ring-2 ring-[var(--sa-magenta)]/30" : "border-border hover:bg-muted"}`}>
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
              <div key={row.pos} className={`flex items-center gap-3 rounded-xl border p-2.5 ${row.name === "Jack Riley" ? "border-[var(--sa-magenta)] bg-[var(--sa-magenta)]/5" : "border-border"}`}>
                <span className="font-display text-lg text-muted-foreground">{row.pos}</span>
                <Avatar name={row.name} size={30} />
                <span className="flex-1 font-semibold text-[var(--sa-ink)]">{row.name}</span>
                <span className="font-semibold text-[var(--sa-ink)]">{row.value.toLocaleString()} {row.unit}</span>
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
            <div className="mt-3 flex gap-2">
              {joined ? (
                <Btn size="sm" className="flex-1" onClick={logProgress}><Check className="size-4" /> Log progress</Btn>
              ) : (
                <Btn size="sm" className="flex-1" onClick={join}>Join challenge</Btn>
              )}
            </div>
          </Panel>
          <InsightCard kind="OPPORTUNITY" title="Close the gap" body={`Only ${(c.goal - c.done).toLocaleString()} ${c.unit} remains. 14 more participants completing this week's target could move the club into the regional Top 5.`} cta="Post to Spaces" onAction={() => navigate("spaces")} />
        </div>
      </div>

      <ChallengeFormModal open={formOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
