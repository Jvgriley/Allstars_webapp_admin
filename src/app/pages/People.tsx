import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Search, Download, Tag, ChevronRight, Sparkles, ArrowLeft, Plus, Pencil, ArrowUpDown, Users } from "lucide-react";
import { PageHeader, Panel, Btn, Pill, Avatar, AvailabilityDot, ProgressBar, StatCard, InsightCard, PageLoading, TextField } from "../components/primitives";
import { Modal } from "../components/Modal";
import { MemberFormModal } from "../components/MemberFormModal";
import { AreaTrend, Bars } from "../components/Charts";
import type { PageId } from "../nav";
import type { Member } from "../../domain/types";
import { membersService, useMembers, useMember, useMemberStatTrend, useTeams } from "../../services/membersService";

const membershipTone = (m: Member["membership"]) => (m === "Active" ? "green" : m === "Pending" ? "orange" : "red");
const payTone = (p: Member["payments"]) => (p === "Paid" ? "green" : p === "Due" ? "orange" : "red");
const statusTone = (s: Member["status"]) => (s === "Active" ? "green" : s === "At risk" ? "orange" : "red");

type SortKey = "name" | "attendance" | "participation";

export function Members({ navigate }: { navigate: (p: PageId, arg?: string) => void }) {
  const { data: members } = useMembers();
  const [q, setQ] = useState("");
  const [team, setTeam] = useState("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<1 | -1>(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Member | undefined>(undefined);

  const teamNames = useMemo(() => ["All", ...Array.from(new Set((members ?? []).map((m) => m.team)))], [members]);
  const filtered = useMemo(() => {
    const base = (members ?? []).filter((m) => (team === "All" || m.team === team) && m.name.toLowerCase().includes(q.toLowerCase()));
    const sorted = [...base].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name) * sortDir;
      return (a[sort] - b[sort]) * sortDir;
    });
    return sorted;
  }, [members, q, team, sort, sortDir]);

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleSort = (key: SortKey) => {
    if (sort === key) setSortDir((d) => (d === 1 ? -1 : 1));
    else { setSort(key); setSortDir(1); }
  };

  if (!members) return <PageLoading />;

  const selectedNames = members.filter((m) => selected.includes(m.id)).map((m) => m.name);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="Members"
        subtitle={`${members.length} members across ${teamNames.length - 1} squads. Search, filter, sort, tag, and act in bulk.`}
        actions={
          <>
            <Btn variant="outline" onClick={() => toast.success(`Tagged ${selected.length || members.length} member(s).`)}><Tag className="size-4" /> Tag</Btn>
            <Btn variant="outline" onClick={() => toast.success(`Exported ${filtered.length} member(s) to CSV.`)}><Download className="size-4" /> Export</Btn>
            <Btn onClick={() => { setEditing(undefined); setFormOpen(true); }}><Plus className="size-4" /> Add member</Btn>
          </>
        }
      />

      <Panel>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search members…" className="w-full rounded-lg border border-border bg-input-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[var(--sa-magenta)]/40" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {teamNames.map((t) => (
              <button key={t} onClick={() => setTeam(t)} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${team === t ? "sa-gradient text-white" : "border border-border bg-card hover:bg-muted"}`}>{t}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {([["name", "Name"], ["attendance", "Attendance"], ["participation", "Participation"]] as [SortKey, string][]).map(([key, label]) => (
              <button key={key} onClick={() => toggleSort(key)} className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium ${sort === key ? "bg-[var(--sa-violet)] text-white" : "border border-border bg-card hover:bg-muted"}`}>
                <ArrowUpDown className="size-3" /> {label}{sort === key ? (sortDir === 1 ? " ↑" : " ↓") : ""}
              </button>
            ))}
          </div>
        </div>

        {selected.length > 0 && (
          <div className="mb-3 flex items-center gap-2 rounded-lg bg-[var(--sa-violet)]/10 px-3 py-2 text-sm text-[var(--sa-violet)]">
            {selected.length} selected
            <Btn size="sm" variant="outline" onClick={() => toast.success(`Message queued for ${selectedNames.slice(0, 3).join(", ")}${selected.length > 3 ? "…" : ""}.`)}>Message</Btn>
            <Btn size="sm" variant="outline" onClick={() => toast.success(`Availability requested from ${selected.length} member(s).`)}>Request availability</Btn>
            <Btn size="sm" variant="outline" onClick={() => toast.success(`Tag added to ${selected.length} member(s).`)}>Add tag</Btn>
            <Btn size="sm" variant="ghost" onClick={() => setSelected([])}>Clear</Btn>
          </div>
        )}

        <div className="sa-scroll overflow-x-auto">
          <table className="w-full min-w-[940px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="w-8 py-2.5"></th>
                <th className="py-2.5 pr-3">Member</th>
                <th className="px-3">Team</th>
                <th className="px-3">Role</th>
                <th className="px-3">Membership</th>
                <th className="px-3">Avail</th>
                <th className="px-3">Attendance</th>
                <th className="px-3">Participation</th>
                <th className="px-3">Payments</th>
                <th className="px-3">Status</th>
                <th className="px-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-border/60 hover:bg-muted/50">
                  <td className="py-2.5 pl-1"><input type="checkbox" checked={selected.includes(m.id)} onChange={() => toggle(m.id)} className="accent-[var(--sa-magenta)]" /></td>
                  <td className="py-2.5 pr-3">
                    <button onClick={() => navigate("member-profile", m.id)} className="flex items-center gap-2.5 text-left">
                      <Avatar name={m.name} size={32} />
                      <div>
                        <div className="font-semibold text-[var(--sa-ink)]">{m.name}</div>
                        <div className="text-xs text-muted-foreground">{m.allstarsId}</div>
                      </div>
                    </button>
                  </td>
                  <td className="px-3">{m.team}</td>
                  <td className="px-3">{m.role}</td>
                  <td className="px-3"><Pill tone={membershipTone(m.membership)}>{m.membership}</Pill></td>
                  <td className="px-3"><AvailabilityDot state={m.availability} /></td>
                  <td className="px-3">
                    <div className="flex items-center gap-2"><span className="w-8">{m.attendance}%</span><ProgressBar value={m.attendance} className="w-16" /></div>
                  </td>
                  <td className="px-3">{m.participation}</td>
                  <td className="px-3"><Pill tone={payTone(m.payments)}>{m.payments}</Pill></td>
                  <td className="px-3"><Pill tone={statusTone(m.status)}>{m.status}</Pill></td>
                  <td className="px-3">
                    <div className="flex items-center gap-1">
                      <button title="Edit" onClick={() => { setEditing(m); setFormOpen(true); }} className="rounded p-1 hover:bg-muted"><Pencil className="size-3.5 text-muted-foreground" /></button>
                      <button onClick={() => navigate("member-profile", m.id)}><ChevronRight className="size-4 text-muted-foreground" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={11} className="py-8 text-center text-sm text-muted-foreground">No members match this search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <MemberFormModal open={formOpen} onOpenChange={setFormOpen} member={editing} teams={teamNames.filter((t) => t !== "All")} />
    </div>
  );
}

const tabs = ["Overview", "Participation", "Performance", "Activity", "Wellbeing", "Media", "Payments", "Achievements", "Documents"];

export function MemberProfile({ memberId, navigate }: { memberId?: string; navigate: (p: PageId, arg?: string) => void }) {
  const { data: m } = useMember(memberId);
  const { data: memberStatTrend } = useMemberStatTrend();
  const { data: teams = [] } = useTeams();
  const [tab, setTab] = useState("Overview");
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  if (!m || !memberStatTrend) return <PageLoading />;

  const sendMessage = () => {
    if (!messageText.trim()) {
      toast.error("Write a message before sending.");
      return;
    }
    toast.success(`Message sent to ${m.name}.`);
    setMessageText("");
    setMessageOpen(false);
  };

  return (
    <div className="space-y-6">
      <button onClick={() => navigate("members")} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-[var(--sa-ink)]"><ArrowLeft className="size-4" /> Back to members</button>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="h-24 sa-gradient" />
        <div className="flex flex-wrap items-end gap-4 p-5 pt-0">
          <div className="-mt-10"><Avatar name={m.name} size={88} /></div>
          <div className="flex-1">
            <h1 className="font-display text-3xl text-[var(--sa-ink)]">{m.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>Riverside FC</span>·<span>{m.team}</span>·<span>Football · {m.position}</span>·<span>{m.role}</span>
              <Pill tone={membershipTone(m.membership)}>{m.membership}</Pill>
              <Pill tone="muted">{m.allstarsId}</Pill>
            </div>
          </div>
          <div className="flex gap-2">
            <Btn variant="outline" onClick={() => setFormOpen(true)}><Pencil className="size-4" /> Edit</Btn>
            <Btn variant="outline" onClick={() => setMessageOpen(true)}>Message</Btn>
            <Btn onClick={() => navigate("member-stats", m.id)}><Sparkles className="size-4" /> Member Stats</Btn>
          </div>
        </div>
        <div className="sa-scroll flex gap-1 overflow-x-auto border-t border-border px-3">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm ${tab === t ? "border-[var(--sa-magenta)] font-semibold text-[var(--sa-ink)]" : "border-transparent text-muted-foreground hover:text-[var(--sa-ink)]"}`}>{t}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Attendance" value={`${m.attendance}%`} delta="+4%" up />
        <StatCard label="Training hours" value={`${m.trainingHours}`} delta="+18%" up accent />
        <StatCard label="Participation" value={`${m.participation}`} delta="score" up />
        <StatCard label="Last active" value={m.lastActive} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" eyebrow="Participation" title="Training hours over time">
          <AreaTrend data={memberStatTrend} x="m" y="hours" height={240} />
        </Panel>
        <InsightCard kind="TREND" title="Most consistent run this season" body={`${m.name.split(" ")[0]} has recorded their most consistent six-week participation period this season. Training volume is 18% above the three-month average.`} cta="Open member stats" onAction={() => navigate("member-stats", m.id)} />
      </div>

      <Panel eyebrow="Live → Player profile" title="Recent match media">
        <div className="grid gap-3 sm:grid-cols-3">
          {[{ t: "GOAL", v: "vs United Athletic" }, { t: "ASSIST", v: "vs City Sports" }, { t: "SAVE", v: "vs Falcons" }].map((clip) => (
            <div key={clip.t} className="rounded-xl border border-border p-3">
              <div className="mb-2 grid aspect-video place-items-center rounded-lg bg-[var(--sa-ink)] text-white/70">▶</div>
              <div className="text-xs font-bold uppercase tracking-wider text-[var(--sa-magenta)]">{clip.t}</div>
              <div className="text-sm text-muted-foreground">{clip.v}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 flex gap-2"><Btn size="sm" variant="outline">Highlight reel</Btn><Btn size="sm" variant="ghost" onClick={() => navigate("live-centre")}>View all →</Btn></div>
      </Panel>

      <Modal
        open={messageOpen}
        onOpenChange={setMessageOpen}
        title={`Message ${m.name}`}
        footer={<><Btn variant="ghost" onClick={() => setMessageOpen(false)}>Cancel</Btn><Btn onClick={sendMessage}>Send</Btn></>}
      >
        <TextField label="Message" value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder={`Write a message to ${m.name.split(" ")[0]}…`} autoFocus />
      </Modal>

      <MemberFormModal open={formOpen} onOpenChange={setFormOpen} member={m} teams={teams.map((t) => t.name)} />
    </div>
  );
}

export function MemberStats({ memberId, navigate }: { memberId?: string; navigate: (p: PageId, arg?: string) => void }) {
  const { data: m } = useMember(memberId);
  const { data: memberStatTrend } = useMemberStatTrend();

  if (!m || !memberStatTrend) return <PageLoading />;

  const activity = [
    { k: "Running", v: 42 }, { k: "Cycling", v: 88 }, { k: "Walking", v: 61 }, { k: "Gym", v: 30 }, { k: "Independent", v: 24 },
  ];
  const stats = [
    ["Matches Played", "28"], ["Training Sessions", "64"], ["Training Hours", `${m.trainingHours}`], ["Attendance", `${m.attendance}%`],
    ["Availability", "91%"], ["Challenges Completed", "12"], ["Community Engagement", "High"], ["Goals", "9"],
  ];
  return (
    <div className="space-y-6">
      <button onClick={() => navigate("member-profile", m.id)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-[var(--sa-ink)]"><ArrowLeft className="size-4" /> Back to profile</button>
      <PageHeader eyebrow="Member stats" title={`${m.name} · Stats`} subtitle="Participation, performance and activity over time." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(([l, v]) => <StatCard key={l} label={l} value={v} />)}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel eyebrow="Activity mix" title="This month by activity type"><Bars data={activity} x="k" y="v" height={240} /></Panel>
        <Panel eyebrow="Trend" title="Training hours & sessions"><AreaTrend data={memberStatTrend} x="m" y="hours" height={240} /></Panel>
      </div>
      <InsightCard kind="PERFORMANCE" title="Above three-month average" body={`${m.name.split(" ")[0]} has recorded their most consistent six-week participation period this season. Training volume is 18% above the three-month average.`} />
      <Panel eyebrow="Achievements" title="Badges & milestones">
        <div className="flex flex-wrap gap-2">
          {["100 Sessions", "Perfect Month", "Challenge Champ", "FA Level 1", "Top Scorer", "6-Week Streak"].map((b) => (
            <span key={b} className="rounded-full border border-[var(--sa-magenta)]/30 bg-[var(--sa-magenta)]/5 px-3 py-1.5 text-sm font-medium text-[var(--sa-ink)]">🏅 {b}</span>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function Teams({ navigate }: { navigate: (p: PageId, arg?: string) => void }) {
  const { data: teams } = useTeams();
  const [drawerTeam, setDrawerTeam] = useState<string | null>(null);
  const [newTeamOpen, setNewTeamOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  if (!teams) return <PageLoading />;

  const active = teams.find((t) => t.name === drawerTeam);

  const createTeam = () => {
    if (!newTeamName.trim()) {
      toast.error("Enter a team name.");
      return;
    }
    membersService.createTeam(newTeamName.trim());
    toast.success(`${newTeamName.trim()} created.`);
    setNewTeamName("");
    setNewTeamOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="Teams & Squads"
        subtitle="Every squad rolls up into club analytics and rankings."
        actions={<Btn onClick={() => setNewTeamOpen(true)}><Plus className="size-4" /> New team</Btn>}
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {teams.map((t) => (
          <Panel key={t.name} title={t.name} eyebrow={`${t.count} members`}>
            <div className="mb-3 flex items-center justify-between text-sm"><span className="text-muted-foreground">Avg attendance</span><span className="font-display text-2xl text-[var(--sa-ink)]">{t.attendance}%</span></div>
            <ProgressBar value={t.attendance} />
            <div className="mt-3 flex -space-x-2">
              {t.roster.slice(0, 6).map((m) => <Avatar key={m.id} name={m.name} size={30} />)}
              {t.count > 6 && <span className="grid size-[30px] place-items-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">+{t.count - 6}</span>}
            </div>
            <div className="mt-3 flex gap-2">
              <Btn size="sm" variant="outline" onClick={() => setDrawerTeam(t.name)}><Users className="size-3.5" /> Manage roster</Btn>
              <Btn size="sm" variant="ghost" onClick={() => navigate("members")}>View roster →</Btn>
            </div>
          </Panel>
        ))}
      </div>

      <Modal
        open={!!active}
        onOpenChange={(open) => !open && setDrawerTeam(null)}
        title={active ? `Manage ${active.name}` : ""}
        description="Reassign or remove members from this squad. Changes apply immediately across the app."
      >
        {active && (
          <div className="sa-scroll max-h-[50vh] space-y-2 overflow-y-auto">
            {active.roster.length === 0 && <div className="py-6 text-center text-sm text-muted-foreground">No members on this squad yet.</div>}
            {active.roster.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5">
                <Avatar name={m.name} size={32} />
                <div className="flex-1 text-sm font-semibold text-[var(--sa-ink)]">{m.name}</div>
                <select
                  value={m.team}
                  onChange={(e) => {
                    membersService.reassignTeam(m.id, e.target.value);
                    toast.success(`${m.name} moved to ${e.target.value}.`);
                  }}
                  className="rounded-lg border border-border bg-input-background px-2 py-1.5 text-xs outline-none"
                >
                  {teams.map((t) => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        open={newTeamOpen}
        onOpenChange={setNewTeamOpen}
        title="New team"
        description="Creates an empty squad — assign members to it from Manage roster or the member editor."
        footer={<><Btn variant="ghost" onClick={() => setNewTeamOpen(false)}>Cancel</Btn><Btn onClick={createTeam}>Create team</Btn></>}
      >
        <TextField label="Team name" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} placeholder="e.g. U12 Development" autoFocus />
      </Modal>
    </div>
  );
}
