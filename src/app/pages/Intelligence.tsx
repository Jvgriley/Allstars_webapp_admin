import { ArrowRight, Sparkles } from "lucide-react";
import { PageHeader, Panel, InsightCard, StatCard, Btn, PageLoading } from "../components/primitives";
import { MultiLine } from "../components/Charts";
import type { PageId } from "../nav";
import type { InsightKind } from "../../domain/types";
import { useInsights } from "../../services/insightsService";
import { useParticipationTrend } from "../../services/metricsService";

// Route each insight to the page its underlying data actually lives on,
// rather than always "members" — closes the loop from card to data.
const insightTarget: Record<InsightKind, PageId> = {
  OPPORTUNITY: "members",
  TREND: "teams",
  COMMERCIAL: "finance",
  PERFORMANCE: "analytics",
  RISK: "action-centre",
};

const loop = ["Activity", "Data", "Intelligence", "Story", "Action"];

const audiences = [
  { role: "Club Member", story: "\"We're closing the gap on United.\"" },
  { role: "Rival Member", story: "\"Riverside are catching us.\"" },
  { role: "Player", story: "\"Your activity contributed 386 points this month.\"" },
  { role: "Coach", story: "\"Training attendance is at its highest level this season.\"" },
  { role: "Administrator", story: "\"14 more members completing this week's challenge could move you into the Top 2.\"" },
  { role: "Sponsor", story: "\"Your campaign reached 8,420 engaged participants this month.\"" },
];

export function Intelligence({ navigate }: { navigate: (p: PageId) => void }) {
  const { data: insights } = useInsights();
  const { data: participationTrend } = useParticipationTrend();

  if (!insights || !participationTrend) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Allstars Intelligence" title="Today's Intelligence" subtitle="Not a chatbot — intelligence embedded throughout the platform. Activity becomes data, data becomes story, story becomes action." />

      <div className="overflow-hidden rounded-2xl sa-gradient p-6 text-white shadow-sm">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80"><Sparkles className="size-4" /> Headline</div>
        <div className="mt-2 font-display text-3xl md:text-4xl">Participation is up 14% this month</div>
        <p className="mt-2 max-w-2xl text-white/85">Training participation has increased across four teams, with the U16 squad showing the strongest improvement of any squad this season.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn variant="dark" onClick={() => navigate("analytics")}>Open analytics</Btn>
          <Btn variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20" onClick={() => navigate("members")}>View members</Btn>
        </div>
      </div>

      {/* The loop */}
      <Panel eyebrow="The Intelligence loop" title="Every action feeds the next">
        <div className="flex flex-wrap items-center gap-2">
          {loop.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span className="rounded-full border border-[var(--sa-magenta)]/30 bg-[var(--sa-magenta)]/5 px-4 py-1.5 font-display text-sm text-[var(--sa-ink)]">{s}</span>
              {i < loop.length - 1 && <ArrowRight className="size-4 text-[var(--sa-magenta)]" />}
            </div>
          ))}
          <ArrowRight className="size-4 text-[var(--sa-magenta)]" />
          <span className="text-xs italic text-muted-foreground">…back to more activity</span>
        </div>
      </Panel>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Member Engagement" value="84%" delta="active" up />
        <StatCard label="Training Hours" value="1,842" delta="combined" up />
        <StatCard label="Community" value="+21%" delta="Spaces" up />
        <StatCard label="Performance" value="67%" delta="win rate" up />
        <StatCard label="Revenue" value="+8%" delta="memberships" up />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" eyebrow="Participation" title="Team participation over 6 weeks">
          <MultiLine data={participationTrend} x="week" lines={[{ key: "u16", label: "U16" }, { key: "u18", label: "U18" }, { key: "seniors", label: "Seniors" }]} height={260} />
        </Panel>
        <div className="space-y-4">
          {insights.map((i) => <InsightCard key={i.id} {...i} onAction={() => navigate(insightTarget[i.kind])} />)}
        </div>
      </div>

      <Panel eyebrow="One data layer — different story" title="The same data, told for each audience">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {audiences.map((a) => (
            <div key={a.role} className="rounded-xl border border-border p-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--sa-magenta)]">{a.role}</div>
              <p className="mt-1.5 text-[var(--sa-ink)]" style={{ fontWeight: 500 }}>{a.story}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
