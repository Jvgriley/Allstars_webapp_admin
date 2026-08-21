import { useState } from "react";
import {
  Play, Volume2, Maximize, Share2, Radio, Plus, Scissors, Send, Megaphone,
  Sparkles, Wifi, Users, ShoppingBag, Heart,
} from "lucide-react";
import { PageHeader, Panel, Btn, Pill, Avatar, StatCard, InsightCard, ProgressBar, PageLoading } from "../components/primitives";
import type { PageId } from "../nav";
import type { LiveMatch } from "../../domain/types";
import { useLiveMatch, useBroadcasts } from "../../services/liveService";

function Scoreboard({ liveMatch, compact }: { liveMatch: LiveMatch; compact?: boolean }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-[var(--sa-ink)] p-4 text-white">
      <div className="text-center"><Avatar name={liveMatch.home} size={compact ? 32 : 44} /><div className="mt-1 text-sm font-semibold">{liveMatch.home}</div></div>
      <div className="text-center">
        <div className="font-display text-4xl md:text-5xl">{liveMatch.homeScore} – {liveMatch.awayScore}</div>
        <div className="mt-1 flex items-center justify-center gap-1 text-xs text-rose-400"><span className="size-2 animate-pulse rounded-full bg-rose-500" /> LIVE · {liveMatch.clock}</div>
      </div>
      <div className="text-center"><Avatar name={liveMatch.away} size={compact ? 32 : 44} /><div className="mt-1 text-sm font-semibold">{liveMatch.away}</div></div>
    </div>
  );
}

function Player({ liveMatch }: { liveMatch: LiveMatch }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-black">
      <div className="relative grid aspect-video place-items-center bg-gradient-to-br from-[var(--sa-violet)] to-[var(--sa-ink)]">
        <button className="grid size-16 place-items-center rounded-full bg-white/90 text-[var(--sa-ink)] shadow-lg transition hover:scale-105"><Play className="size-7 translate-x-0.5" /></button>
        <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-rose-600 px-2 py-1 text-xs font-bold text-white"><span className="size-2 animate-pulse rounded-full bg-white" /> LIVE</div>
        <div className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-1 text-xs text-white">{liveMatch.viewers.toLocaleString()} watching</div>
      </div>
      <div className="flex items-center gap-3 bg-[var(--sa-ink)] px-4 py-2.5 text-white">
        <Play className="size-4" /><Volume2 className="size-4" />
        <div className="h-1 flex-1 rounded-full bg-white/20"><div className="h-full w-2/3 rounded-full bg-[var(--sa-magenta)]" /></div>
        <span className="text-xs">1080p</span><Share2 className="size-4" /><Maximize className="size-4" />
      </div>
    </div>
  );
}

export function LiveCentre({ navigate }: { navigate: (p: PageId, arg?: string) => void }) {
  const { data: liveMatch } = useLiveMatch();
  const { data: broadcasts } = useBroadcasts();
  if (!liveMatch || !broadcasts) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Allstars Live" title="Live Centre" subtitle="Not just a video player — a data & content generation engine. Every match feeds intelligence, stories, profiles and rankings." actions={<Btn onClick={() => navigate("stream-management")}><Plus className="size-4" /> Create broadcast</Btn>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-rose-600"><span className="size-2 animate-pulse rounded-full bg-rose-600" /> Live now · {liveMatch.comp}</div>
          <Player liveMatch={liveMatch} />
          <Scoreboard liveMatch={liveMatch} />
          <Btn className="w-full" onClick={() => navigate("match")}><Radio className="size-4" /> Open full match centre</Btn>
        </div>
        <div className="space-y-4">
          <Panel eyebrow="Coming up" title="Next broadcasts">
            <div className="space-y-2">
              {broadcasts.upcoming.map((b) => (
                <div key={b.id} className="rounded-xl border border-border p-3">
                  <div className="text-sm font-semibold text-[var(--sa-ink)]">{b.title}</div>
                  <div className="text-xs text-muted-foreground">{b.when} · {b.comp}</div>
                  <div className="mt-1.5 flex items-center gap-2"><Pill tone="green"><Wifi className="size-3" /> {b.source} ready</Pill></div>
                </div>
              ))}
            </div>
          </Panel>
          {liveMatch.aiInsights.map((a) => <InsightCard key={a.title} kind="PERFORMANCE" title={a.title} body={a.body} />)}
        </div>
      </div>
    </div>
  );
}

export function Match({ navigate }: { navigate: (p: PageId, arg?: string) => void }) {
  const { data: liveMatch } = useLiveMatch();
  if (!liveMatch) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Live match centre" title={`${liveMatch.home} vs ${liveMatch.away}`} subtitle={`${liveMatch.comp} · ${liveMatch.venue}`} actions={<Btn variant="outline" onClick={() => navigate("control-room")}>Control room</Btn>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Player liveMatch={liveMatch} />
          <Scoreboard liveMatch={liveMatch} />
          <Panel eyebrow="Live event timeline" title="Key moments">
            <div className="space-y-2">
              {liveMatch.timeline.map((e, i) => (
                <button key={i} className="flex w-full items-center gap-3 rounded-xl border border-border p-2.5 text-left hover:bg-muted">
                  <span className="w-10 font-display text-lg text-[var(--sa-magenta)]">{e.min}</span>
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${e.type === "GOAL" ? "bg-emerald-50 text-emerald-700" : e.type.includes("CARD") ? "bg-amber-50 text-amber-700" : "bg-muted text-muted-foreground"}`}>{e.type}</span>
                  <span className="flex-1 text-sm text-[var(--sa-ink)]">{e.team && <b>{e.team} · </b>}{e.detail}</span>
                  <span className="text-xs text-muted-foreground">Jump ▸</span>
                </button>
              ))}
            </div>
          </Panel>
        </div>
        <div className="space-y-4">
          {liveMatch.aiInsights.map((a) => <InsightCard key={a.title} kind="PERFORMANCE" title={a.title} body={a.body} />)}
          <Panel eyebrow="Live community" title="Player of the match">
            <div className="space-y-2">
              {liveMatch.potm.map((p) => (
                <div key={p.name}>
                  <div className="mb-1 flex justify-between text-sm"><span className="font-semibold text-[var(--sa-ink)]">{p.name}</span><span className="text-muted-foreground">{p.pct}%</span></div>
                  <ProgressBar value={p.pct} />
                </div>
              ))}
            </div>
            <Btn size="sm" className="mt-3 w-full">Cast your vote</Btn>
          </Panel>
          <Panel eyebrow="Live commerce" title="Support Riverside">
            {[["Home Shirt", "£39.99"], ["Match Scarf", "£14.99"], ["Membership", "£12 / mo"]].map(([n, p]) => (
              <div key={n} className="flex items-center justify-between border-b border-border/60 py-2 text-sm last:border-0"><span className="text-[var(--sa-ink)]">{n}</span><span className="font-semibold">{p}</span></div>
            ))}
            <Btn size="sm" variant="outline" className="mt-3 w-full" onClick={() => navigate("retail")}><ShoppingBag className="size-4" /> View club store</Btn>
          </Panel>
          <Panel eyebrow="Live fundraising" title="New training facility">
            <div className="flex justify-between text-sm"><span className="font-semibold text-[var(--sa-ink)]">£8,420</span><span className="text-muted-foreground">of £12,000</span></div>
            <ProgressBar value={70} className="my-2" />
            <Btn size="sm" className="w-full"><Heart className="size-4" /> Donate</Btn>
          </Panel>
        </div>
      </div>
    </div>
  );
}

const smTabs = ["Live", "Upcoming", "Completed", "Draft"];

export function StreamManagement({ navigate }: { navigate: (p: PageId, arg?: string) => void }) {
  const { data: broadcasts } = useBroadcasts();
  const [tab, setTab] = useState("Live");
  const [wizard, setWizard] = useState(false);

  if (!broadcasts) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Live" title="Stream Management" subtitle="Plan, connect and publish broadcasts across Veo, Hudl, Pixellot, YouTube and custom RTMP." actions={<Btn onClick={() => setWizard((v) => !v)}><Plus className="size-4" /> Create broadcast</Btn>} />

      {wizard && <CreateBroadcast onClose={() => setWizard(false)} />}

      <div className="sa-scroll flex gap-1 overflow-x-auto border-b border-border">
        {smTabs.map((t) => <button key={t} onClick={() => setTab(t)} className={`border-b-2 px-4 py-2.5 text-sm ${tab === t ? "border-[var(--sa-magenta)] font-semibold text-[var(--sa-ink)]" : "border-transparent text-muted-foreground hover:text-[var(--sa-ink)]"}`}>{t}</button>)}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tab === "Live" && broadcasts.live.map((b) => (
          <Panel key={b.id} eyebrow={b.comp} title={b.title} action={<Pill tone="red">LIVE</Pill>}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Users className="size-4" /> {b.viewers.toLocaleString()} watching · {b.source}</div>
            <Btn size="sm" className="mt-3 w-full" onClick={() => navigate("control-room")}>Open control room</Btn>
          </Panel>
        ))}
        {tab === "Upcoming" && broadcasts.upcoming.map((b) => (
          <Panel key={b.id} eyebrow={b.comp} title={b.title}>
            <div className="text-sm text-muted-foreground">{b.when}</div>
            <div className="mt-2"><Pill tone="green"><Wifi className="size-3" /> {b.source} connected</Pill></div>
          </Panel>
        ))}
        {tab === "Completed" && broadcasts.completed.map((b) => (
          <Panel key={b.id} eyebrow={b.comp} title={b.title}>
            <div className="text-sm text-muted-foreground">{b.when} · {b.views.toLocaleString()} views · {b.highlights} highlights</div>
          </Panel>
        ))}
        {tab === "Draft" && <div className="text-sm text-muted-foreground">No drafts yet.</div>}
      </div>
    </div>
  );
}

const steps = [
  { t: "Select Event", opts: ["Fixture", "Training", "Competition", "Tournament", "Custom Event"] },
  { t: "Stream Source", opts: ["Veo", "Hudl", "Pixellot", "YouTube", "Custom RTMP", "Manual Upload"] },
  { t: "Audience", opts: ["Public", "Allstars Members", "Club Members", "Team Only", "Invite Only", "Paid Access"] },
  { t: "Broadcast Settings", opts: ["Live Chat", "Scoreboard", "Timeline", "Statistics", "AI Intelligence", "Sponsor Overlay", "Recording", "Highlights"] },
];

function CreateBroadcast({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Record<number, string[]>>({});
  const toggle = (i: number, opt: string) => setSel((s) => {
    const cur = s[i] ?? [];
    if (i === 3) return { ...s, [i]: cur.includes(opt) ? cur.filter((o) => o !== opt) : [...cur, opt] };
    return { ...s, [i]: [opt] };
  });
  return (
    <Panel eyebrow={`Step ${step + 1} of 5`} title={step < 4 ? steps[step].t : "Publish / Schedule"}>
      {step < 4 ? (
        <div className="flex flex-wrap gap-2">
          {steps[step].opts.map((o) => {
            const active = (sel[step] ?? []).includes(o);
            return <button key={o} onClick={() => toggle(step, o)} className={`rounded-lg px-3.5 py-2 text-sm font-medium ${active ? "sa-gradient text-white" : "border border-border bg-card hover:bg-muted"}`}>{o}</button>;
          })}
        </div>
      ) : (
        <div className="rounded-xl bg-muted p-4 text-sm text-[var(--sa-ink)]">
          <div className="font-display text-lg">Ready to go live</div>
          <p className="mt-1 text-muted-foreground">Riverside U18 vs United Athletic · {(sel[1] ?? ["Veo"])[0]} · {(sel[2] ?? ["Public"])[0]}</p>
        </div>
      )}
      <div className="mt-4 flex justify-between">
        <Btn variant="ghost" onClick={() => (step === 0 ? onClose() : setStep((s) => s - 1))}>{step === 0 ? "Cancel" : "Back"}</Btn>
        {step < 4 ? <Btn onClick={() => setStep((s) => s + 1)}>Continue</Btn> : <Btn onClick={onClose}>Publish</Btn>}
      </div>
    </Panel>
  );
}

const controlActions = ["Update Score", "Add Goal", "Add Card", "Add Substitution", "Create Highlight", "Launch Poll", "Manage Chat", "Insert Sponsor", "Trigger Ad", "Pin AI Story"];

export function ControlRoom({ navigate }: { navigate: (p: PageId, arg?: string) => void }) {
  const { data: liveMatch } = useLiveMatch();
  if (!liveMatch) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Live" title="Control Room" subtitle="Drive the broadcast: score, events, highlights, polls, sponsors and AI stories." actions={<Btn variant="dark">End stream</Btn>} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Player liveMatch={liveMatch} />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <StatCard label="Stream health" value="Excellent" accent />
            <StatCard label="Resolution" value="1080p" />
            <StatCard label="Connection" value="Stable" />
            <StatCard label="Viewers" value={liveMatch.viewers.toLocaleString()} />
            <StatCard label="Peak viewers" value={liveMatch.peak.toLocaleString()} />
            <StatCard label="Status" value="LIVE" />
          </div>
        </div>
        <div className="space-y-4">
          <Panel eyebrow="Broadcast controls" title="Actions">
            <div className="grid grid-cols-2 gap-2">
              {controlActions.map((a) => <Btn key={a} size="sm" variant="outline">{a}</Btn>)}
            </div>
          </Panel>
          <div className="rounded-2xl border border-[var(--sa-magenta)]/30 bg-[var(--sa-magenta)]/5 p-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--sa-magenta)]"><Sparkles className="size-4" /> Potential highlight · 67'</div>
            <div className="mt-1 font-display text-lg text-[var(--sa-ink)]">GOAL — J. Williams</div>
            <div className="mt-3 flex gap-2"><Btn size="sm"><Scissors className="size-4" /> Create clip</Btn><Btn size="sm" variant="outline" onClick={() => navigate("spaces")}><Send className="size-4" /> Post to Spaces</Btn></div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-[var(--sa-violet)]"><Megaphone className="size-4" /> Story opportunity</div>
            <p className="mt-1 text-sm text-[var(--sa-ink)]">"Riverside have scored three unanswered goals."</p>
            <Btn size="sm" className="mt-3" onClick={() => navigate("spaces")}>Create story</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
