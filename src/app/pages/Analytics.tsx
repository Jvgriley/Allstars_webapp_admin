import { useState } from "react";
import { Filter } from "lucide-react";
import { PageHeader, Panel, Btn, StatCard, Avatar, PageLoading } from "../components/primitives";
import { AreaTrend, MultiLine, Bars, Donut } from "../components/Charts";
import type { PageId } from "../nav";
import { useRevenueTrend, useParticipationTrend } from "../../services/metricsService";
import { useFinance } from "../../services/financeService";
import { useRankings } from "../../services/rankingsService";

const tabs = ["Overview", "Participation", "Performance", "Members", "Finance", "Community", "Challenges", "Retention", "Content", "Live", "Sponsors"];
const filters = ["Date", "Team", "Sport", "Age", "Gender", "Membership", "Region"];

const ageDemographics = [
  { name: "U12", value: 220 }, { name: "U14", value: 310 }, { name: "U16", value: 280 }, { name: "U18", value: 240 }, { name: "Senior", value: 234 },
];

export function Analytics() {
  const { data: revenueTrend } = useRevenueTrend();
  const { data: participationTrend } = useParticipationTrend();
  const { data: finance } = useFinance();
  const [tab, setTab] = useState("Overview");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  if (!revenueTrend || !participationTrend || !finance) return <PageLoading />;

  const toggleFilter = (f: string) => setActiveFilters((s) => (s.includes(f) ? s.filter((x) => x !== f) : [...s, f]));

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Intelligence" title="Club Analytics" subtitle="Everything the club generates, visualised — filterable by date, team, sport, age and region." actions={<Btn variant="outline" onClick={() => setFiltersOpen((v) => !v)}><Filter className="size-4" /> Filters{activeFilters.length > 0 ? ` (${activeFilters.length})` : ""}</Btn>} />

      {filtersOpen && (
        <div className="flex flex-wrap gap-1.5">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => toggleFilter(f)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium ${activeFilters.includes(f) ? "sa-gradient text-white" : "border border-border bg-card hover:bg-muted"}`}
            >
              {f} {activeFilters.includes(f) ? "✓" : "▾"}
            </button>
          ))}
        </div>
      )}
      {activeFilters.length > 0 && (
        <p className="text-xs text-muted-foreground">Filtering by {activeFilters.join(", ")} — charts below reflect the club's full dataset in this prototype; a connected backend would scope them to your selection.</p>
      )}

      <div className="sa-scroll flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-sm ${tab === t ? "border-[var(--sa-magenta)] font-semibold text-[var(--sa-ink)]" : "border-transparent text-muted-foreground hover:text-[var(--sa-ink)]"}`}>{t}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Membership growth" value="+6.4%" delta="MoM" up accent />
        <StatCard label="Retention" value="94%" delta="+2%" up />
        <StatCard label="Training attendance" value="84%" delta="+4%" up />
        <StatCard label="Outstanding" value="£2,480" delta="-8%" up />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" eyebrow="Participation" title="Team participation">
          <MultiLine data={participationTrend} x="week" lines={[{ key: "u16", label: "U16" }, { key: "u18", label: "U18" }, { key: "seniors", label: "Seniors" }]} height={260} />
        </Panel>
        <Panel eyebrow="Members" title="Age demographics"><Donut data={ageDemographics} height={240} /></Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel eyebrow="Finance" title="Revenue by stream"><Bars data={finance.streams.map((s) => ({ k: s.label, v: s.value }))} x="k" y="v" height={260} /></Panel>
        <Panel eyebrow="Finance" title="Revenue trend"><AreaTrend data={revenueTrend} x="month" y="revenue" height={260} /></Panel>
      </div>

      <Panel eyebrow="Team comparison" title="Attendance vs participation by squad">
        <Bars data={participationTrend.map((p) => ({ k: p.week, v: p.u16 }))} x="k" y="v" height={220} color="#2a1b6b" />
      </Panel>
    </div>
  );
}

const rankFilters = ["National", "Region", "County", "Sport", "League", "Age Group"];
const rankBy = ["Overall", "Performance", "Training", "Participation", "Community", "Challenges"];

export function Rankings({ navigate }: { navigate: (p: PageId, arg?: string) => void }) {
  const { data: rankings } = useRankings();
  const [by, setBy] = useState("Overall");
  const [scope, setScope] = useState("National");

  if (!rankings) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Intelligence" title="Allstars Rankings" subtitle="Public community rankings — and the intelligence behind why a club sits where it does." />

      <div className="flex flex-wrap gap-2">
        <div className="flex flex-wrap gap-1.5">{rankBy.map((r) => <button key={r} onClick={() => setBy(r)} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${by === r ? "sa-gradient text-white" : "border border-border bg-card hover:bg-muted"}`}>{r}</button>)}</div>
      </div>
      <div className="flex flex-wrap gap-1.5">{rankFilters.map((r) => <button key={r} onClick={() => setScope(r)} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${scope === r ? "bg-[var(--sa-violet)] text-white" : "border border-border bg-card hover:bg-muted"}`}>{r}</button>)}</div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" eyebrow={`${by} · ${scope}`} title="Club rankings">
          <div className="space-y-2">
            {rankings.map((r) => (
              <div key={r.pos} className={`flex items-center gap-3 rounded-xl p-3 ${r.self ? "sa-gradient text-white" : "border border-border"}`}>
                <span className="w-6 font-display text-xl">{r.pos}</span>
                <Avatar name={r.club} size={36} />
                <div className="flex-1"><div className="font-semibold">{r.club}</div><div className={`text-xs ${r.self ? "text-white/80" : "text-muted-foreground"}`}>{r.region}</div></div>
                <span className="font-display text-lg">{r.points.toLocaleString()}</span>
                <span className={`w-10 text-right text-sm font-semibold ${r.self ? "text-white" : r.move > 0 ? "text-emerald-600" : r.move < 0 ? "text-rose-500" : "text-muted-foreground"}`}>{r.move > 0 ? `↑${r.move}` : r.move < 0 ? `↓${Math.abs(r.move)}` : "—"}</span>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          <div className="rounded-2xl sa-gradient p-5 text-white shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-widest text-white/80">You are</div>
            <div className="font-display text-4xl">240 points from #2</div>
            <p className="mt-2 text-sm text-white/85">Maintaining current participation and reaching 70% completion of this week's challenge could significantly reduce the gap.</p>
            <Btn variant="dark" className="mt-3" onClick={() => navigate("challenges")}>Open challenge</Btn>
          </div>
          <Panel eyebrow="Why you rank here" title="Points breakdown">
            {[["Performance", 82], ["Training", 88], ["Participation", 91], ["Community", 76], ["Challenges", 61]].map(([k, v]) => (
              <div key={k as string} className="mb-2 flex items-center gap-3">
                <span className="w-28 text-sm text-muted-foreground">{k}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full sa-gradient" style={{ width: `${v}%` }} /></div>
                <span className="w-8 text-right text-sm font-semibold">{v as number}</span>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}
