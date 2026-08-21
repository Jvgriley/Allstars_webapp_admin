import { Radio, Calendar, AlertTriangle, ChevronRight, TrendingUp } from "lucide-react";
import { PageHeader, Panel, StatCard, InsightCard, Btn, Pill, Avatar, PageLoading } from "../components/primitives";
import { AreaTrend } from "../components/Charts";
import type { PageId } from "../nav";
import type { InsightKind } from "../../domain/types";
import { useKpis } from "../../services/organisationService";
import { useRevenueTrend } from "../../services/metricsService";
import { useInsights } from "../../services/insightsService";
import { useActionCentreTasks } from "../../services/actionCentreService";
import { useFixtures, useTraining } from "../../services/sportService";
import { useLiveMatch } from "../../services/liveService";
import { useRankings } from "../../services/rankingsService";

const insightTarget: Record<InsightKind, PageId> = {
  OPPORTUNITY: "members",
  TREND: "teams",
  COMMERCIAL: "finance",
  PERFORMANCE: "analytics",
  RISK: "action-centre",
};

export function Dashboard({ navigate }: { navigate: (p: PageId) => void }) {
  const { data: kpis = [] } = useKpis();
  const { data: revenueTrend = [] } = useRevenueTrend();
  const { data: insights = [] } = useInsights();
  const { data: actionCentre = [] } = useActionCentreTasks();
  const { data: fixtures = [] } = useFixtures();
  const { data: training = [] } = useTraining();
  const { data: liveMatch } = useLiveMatch();
  const { data: rankings = [] } = useRankings();

  if (!liveMatch) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Good morning, Jack"
        title="Here's what's happening across your club"
        subtitle="One connected view of participation, performance, operations and commercial health."
        actions={<><Btn variant="outline" onClick={() => navigate("action-centre")}>Action Centre</Btn><Btn onClick={() => navigate("intelligence")}>Today's Intelligence</Btn></>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k, i) => (
          <StatCard key={k.id} label={k.label} value={k.value} delta={k.delta} up={k.up} accent={i === 4} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Revenue & attendance trend" eyebrow="Last 7 months" action={<Pill tone="green"><TrendingUp className="size-3" /> +12%</Pill>}>
          <AreaTrend data={revenueTrend} x="month" y="revenue" height={260} />
        </Panel>

        {/* Live widget */}
        <Panel eyebrow="Live" title="Live now" action={<span className="flex items-center gap-1 text-xs font-semibold text-rose-600"><span className="size-2 animate-pulse rounded-full bg-rose-600" />LIVE</span>}>
          <div className="rounded-xl bg-[var(--sa-ink)] p-4 text-white">
            <div className="text-[11px] uppercase tracking-widest text-white/60">{liveMatch.comp}</div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-center">
                <div className="font-semibold">{liveMatch.home}</div>
              </div>
              <div className="font-display text-4xl">{liveMatch.homeScore}–{liveMatch.awayScore}</div>
              <div className="text-center">
                <div className="font-semibold">{liveMatch.away}</div>
              </div>
            </div>
            <div className="mt-2 text-center text-sm text-[var(--sa-lavender)]">{liveMatch.clock} · {liveMatch.viewers.toLocaleString()} watching</div>
            <Btn className="mt-4 w-full" onClick={() => navigate("match")}><Radio className="size-4" /> Watch live</Btn>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Needs attention" eyebrow="Action Centre" action={<Btn size="sm" variant="ghost" onClick={() => navigate("action-centre")}>View all</Btn>}>
          <div className="space-y-2">
            {actionCentre.slice(0, 5).map((t) => (
              <button key={t.id} onClick={() => navigate("action-centre")} className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left hover:bg-muted">
                <span className={`grid size-8 shrink-0 place-items-center rounded-lg ${t.severity === "high" ? "bg-rose-50 text-rose-600" : t.severity === "medium" ? "bg-amber-50 text-amber-600" : "bg-muted text-muted-foreground"}`}>
                  <AlertTriangle className="size-4" />
                </span>
                <span className="flex-1 text-sm"><b>{t.count ?? ""}</b> {t.title}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Upcoming fixtures" eyebrow="This weekend" action={<Btn size="sm" variant="ghost" onClick={() => navigate("fixtures")}>Fixtures</Btn>}>
          <div className="space-y-3">
            {fixtures.map((f) => (
              <div key={f.id} className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between text-sm font-semibold text-[var(--sa-ink)]">
                  <span>{f.home} vs {f.away}</span>
                  <Pill tone="violet">{f.time}</Pill>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{f.date} · {f.comp}</div>
                <div className="mt-2 flex gap-2 text-xs">
                  <Pill tone="green">{f.available} avail</Pill>
                  <Pill tone="orange">{f.pending} pending</Pill>
                  <Pill tone="red">{f.unavailable} out</Pill>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Upcoming training" eyebrow="Sessions" action={<Calendar className="size-4 text-muted-foreground" />}>
          <div className="space-y-3">
            {training.map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-lg sa-gradient text-white">
                  <div className="text-center leading-none">
                    <div className="text-[9px] uppercase">{t.date.split(" ")[0]}</div>
                    <div className="font-display text-lg">{t.date.split(" ")[1]}</div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-[var(--sa-ink)]">{t.team}</div>
                  <div className="truncate text-xs text-muted-foreground">{t.time} · {t.focus}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl text-[var(--sa-ink)]">AI insights</h3>
            <Btn size="sm" variant="ghost" onClick={() => navigate("intelligence")}>Open Intelligence</Btn>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {insights.map((i) => (
              <InsightCard key={i.id} {...i} onAction={() => navigate(insightTarget[i.kind])} />
            ))}
          </div>
        </div>

        <Panel title="Club ranking movement" eyebrow="Allstars rankings" action={<Btn size="sm" variant="ghost" onClick={() => navigate("rankings")}>View</Btn>}>
          <div className="space-y-2">
            {rankings.slice(0, 5).map((r) => (
              <div key={r.pos} className={`flex items-center gap-3 rounded-xl p-2.5 ${r.self ? "sa-gradient text-white" : ""}`}>
                <span className={`font-display text-lg ${r.self ? "" : "text-muted-foreground"}`}>{r.pos}</span>
                <Avatar name={r.club} size={30} />
                <span className="flex-1 truncate text-sm font-semibold">{r.club}</span>
                <span className="text-sm font-semibold">{r.points.toLocaleString()}</span>
                <span className={`text-xs font-semibold ${r.move > 0 ? (r.self ? "text-white" : "text-emerald-600") : r.move < 0 ? "text-rose-500" : "text-muted-foreground"}`}>
                  {r.move > 0 ? `↑${r.move}` : r.move < 0 ? `↓${Math.abs(r.move)}` : "—"}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-[var(--sa-violet)]/10 p-3 text-sm text-[var(--sa-violet)]">
            You're <b>240 points</b> from #2. Maintaining participation and hitting 70% of this week's challenge could close the gap.
          </div>
        </Panel>
      </div>
    </div>
  );
}
