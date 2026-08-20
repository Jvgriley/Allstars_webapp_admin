import { Venus, MapPin, Quote, Trophy, ChevronRight, Check } from "lucide-react";
import amPortrait from "../../imports/AM.jpg";
import { aliceMilliat as am } from "../data";
import { PageHeader, Panel, Btn, Pill, Avatar, StatCard, InsightCard, ProgressBar } from "../components/primitives";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { AreaTrend } from "../components/Charts";
import type { PageId } from "../nav";

export function AliceMilliat({ navigate }: { navigate: (p: PageId, arg?: string) => void }) {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="European Cultural Route of Sport"
        title="Alice Milliat Foundation"
        subtitle={am.mission}
        actions={<><Btn variant="outline" onClick={() => navigate("teams")}>Women's squads</Btn><Btn onClick={() => navigate("spaces")}>Share a story</Btn></>}
      />

      {/* Hero: portrait + bio */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="overflow-hidden !p-0 lg:col-span-2">
          <div className="grid gap-0 sm:grid-cols-[minmax(0,260px)_1fr]">
            <div className="relative">
              <ImageWithFallback
                src={amPortrait}
                alt="Alice Milliat, pioneer of women's sport, rowing on the water"
                className="h-56 w-full object-cover object-top sm:h-full"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[var(--sa-ink)]/80 to-transparent p-3 sm:hidden">
                <div className="font-display text-xl text-white">Alice Milliat</div>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--sa-magenta)]">
                <Venus className="size-4" /> {am.headline} · {am.bornDied}
              </div>
              <h2 className="mt-1 font-display text-2xl text-[var(--sa-ink)]">Alice Milliat</h2>
              <p className="mt-2 text-sm text-muted-foreground">{am.bio}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Pill tone="violet"><MapPin className="size-3" /> {am.route}</Pill>
                <Pill tone="muted">Founder, FSFI</Pill>
                <Pill tone="muted">Women's World Games</Pill>
              </div>
            </div>
          </div>
        </Panel>

        <div className="flex flex-col justify-between rounded-2xl sa-gradient p-6 text-white shadow-sm">
          <Quote className="size-7 text-white/70" />
          <p className="mt-3 font-display text-2xl leading-tight">
            "Everything remains to be done for women's sport — and it will be done."
          </p>
          <p className="mt-3 text-sm text-white/80">Carrying her legacy forward at Sporting Allstars.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {am.stats.map((s, i) => (
          <StatCard key={s.label} label={s.label} value={s.value} delta={s.delta} up={s.up} accent={i === 0} />
        ))}
      </div>

      {/* Growth + insight */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" eyebrow="Participation" title="Women's & girls' participation growth">
          <AreaTrend data={am.growthTrend} x="season" y="participants" height={260} />
        </Panel>
        <InsightCard
          kind="OPPORTUNITY"
          title="Room to grow the U14 pathway"
          body="Girls U14 attendance is up 16% and near capacity. Adding a second weekly session could welcome ~20 more girls this term."
          cta="Plan a session"
          onAction={() => navigate("calendar")}
        />
      </div>

      {/* Squads */}
      <Panel eyebrow="Women's & girls' squads" title="Squad spotlight" action={<Btn size="sm" variant="ghost" onClick={() => navigate("teams")}>All teams</Btn>}>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {am.squads.map((sq) => (
            <div key={sq.name} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[var(--sa-ink)]">{sq.name}</span>
                <Pill tone="green">{sq.growth}</Pill>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{sq.members} members</div>
              <div className="mt-3 flex items-center justify-between text-sm"><span className="text-muted-foreground">Attendance</span><span className="font-semibold text-[var(--sa-ink)]">{sq.attendance}%</span></div>
              <ProgressBar value={sq.attendance} className="mt-1" />
            </div>
          ))}
        </div>
      </Panel>

      {/* Ambassadors + campaigns */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel eyebrow="Role models" title="Ambassadors">
          <div className="space-y-2">
            {am.ambassadors.map((a) => (
              <div key={a.name} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <Avatar name={a.name} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-[var(--sa-ink)]">{a.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{a.role}</div>
                  <div className="truncate text-xs text-[var(--sa-magenta)]">{a.note}</div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="lg:col-span-2" eyebrow="Initiatives" title="Campaigns & programmes">
          <div className="grid gap-3 sm:grid-cols-3">
            {am.campaigns.map((c) => (
              <div key={c.title} className="flex flex-col rounded-xl border border-border p-4">
                <span className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--sa-magenta)]">{c.tag}</span>
                <div className="font-display text-lg text-[var(--sa-ink)]">{c.title}</div>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{c.body}</p>
                <div className="mt-3">
                  <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">Progress</span><span className="font-semibold text-[var(--sa-ink)]">{c.progress}%</span></div>
                  <ProgressBar value={c.progress} />
                </div>
                <Btn size="sm" variant="outline" className="mt-3">Get involved <ChevronRight className="size-4" /></Btn>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      {/* Pledge */}
      <Panel eyebrow="Our commitment" title="The Alice Milliat pledge" action={<Trophy className="size-5 text-[var(--sa-magenta)]" />}>
        <div className="grid gap-2 sm:grid-cols-2">
          {am.pledges.map((p) => (
            <div key={p} className="flex items-start gap-2 rounded-xl bg-muted p-3">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full sa-gradient text-white"><Check className="size-3" /></span>
              <span className="text-sm text-[var(--sa-ink)]">{p}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn onClick={() => navigate("communications")}>Rally the community</Btn>
          <Btn variant="outline" onClick={() => navigate("sponsorship")}>Find a partner</Btn>
        </div>
      </Panel>
    </div>
  );
}
