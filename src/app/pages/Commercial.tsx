import { RefreshCw, Gift, Plus, Handshake } from "lucide-react";
import { finance, retail, sponsors, rewards, revenueTrend } from "../data";
import { PageHeader, Panel, Btn, Pill, Avatar, StatCard, InsightCard, ProgressBar } from "../components/primitives";
import { AreaTrend, Bars, Donut } from "../components/Charts";

export function Finance() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Commercial" title="Finance" subtitle="Every revenue stream, outstanding payments and accounting sync — connected to memberships, retail and sponsorship." actions={<Btn variant="outline"><RefreshCw className="size-4" /> Sync now</Btn>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Net revenue" value={`£${finance.net.toLocaleString()}`} delta="+12%" up accent />
        <StatCard label="Outstanding" value={`£${finance.outstanding.toLocaleString()}`} delta="-8%" up />
        <StatCard label="Refunds" value={`£${finance.refunds}`} />
        <StatCard label="Allstars fees" value={`£${finance.allstarsFees}`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" eyebrow="Revenue by stream" title="This month"><Bars data={finance.streams.map((s) => ({ k: s.label, v: s.value }))} x="k" y="v" height={280} /></Panel>
        <div className="space-y-4">
          <Panel eyebrow="Accounting sync" title="Xero connected">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Last sync</span><span className="font-semibold">{finance.sync.last}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Transactions synced</span><span className="font-semibold">{finance.sync.synced.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Unmatched</span><Pill tone="orange">{finance.sync.unmatched}</Pill></div>
            </div>
            <div className="mt-3 flex gap-2"><Pill tone="muted">QuickBooks (potential)</Pill><Pill tone="green">Xero connected</Pill></div>
          </Panel>
          <InsightCard kind="COMMERCIAL" title="Revenue tracking ahead" body="Revenue is tracking 12% ahead of last season, driven by membership renewals and retail." />
        </div>
      </div>
      <Panel eyebrow="Revenue trend" title="Last 7 months"><AreaTrend data={revenueTrend} x="month" y="revenue" height={240} /></Panel>
    </div>
  );
}

export function Retail() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Commercial" title="Retail / Club Store" subtitle="Kits, merch, tickets, courses and memberships — connected to live commerce and member profiles." actions={<Btn><Plus className="size-4" /> Add product</Btn>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Retail revenue" value={retail.revenue} delta="+9%" up accent />
        <StatCard label="Orders" value={`${retail.orders}`} delta="+14%" up />
        <StatCard label="Average order" value={retail.avg} />
        <StatCard label="Top product" value="Training Shirt" />
      </div>
      <Panel eyebrow="Products" title="Catalogue & inventory">
        <div className="sa-scroll overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead><tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground"><th className="py-2.5 pr-3">Product</th><th className="px-3">Category</th><th className="px-3">Price</th><th className="px-3">Stock</th><th className="px-3">Sold</th></tr></thead>
            <tbody>
              {retail.products.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="py-2.5 pr-3 font-semibold text-[var(--sa-ink)]">{p.name}</td>
                  <td className="px-3"><Pill tone="violet">{p.cat}</Pill></td>
                  <td className="px-3">{p.price}</td>
                  <td className="px-3">{p.stock > 900 ? "∞" : p.stock}</td>
                  <td className="px-3 font-semibold">{p.sold}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

export function Sponsorship() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Commercial" title="Sponsorship" subtitle="Manage sponsors, packages, contracts, campaigns and exposure across the whole ecosystem." actions={<Btn><Handshake className="size-4" /> Add sponsor</Btn>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Committed" value="£51.7k" delta="+18%" up accent />
        <StatCard label="Active sponsors" value="4" />
        <StatCard label="Total impressions" value="2.8M" delta="+22%" up />
        <StatCard label="Renewals due" value="1" />
      </div>
      <Panel eyebrow="Sponsors" title="Portfolio">
        <div className="sa-scroll overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead><tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground"><th className="py-2.5 pr-3">Sponsor</th><th className="px-3">Package</th><th className="px-3">Contract</th><th className="px-3">Impressions</th><th className="px-3">Engagement</th><th className="px-3">Renews</th><th className="px-3">Status</th></tr></thead>
            <tbody>
              {sponsors.map((s) => (
                <tr key={s.id} className="border-b border-border/60">
                  <td className="py-2.5 pr-3"><div className="flex items-center gap-2"><Avatar name={s.name} size={30} /><span className="font-semibold text-[var(--sa-ink)]">{s.name}</span></div></td>
                  <td className="px-3">{s.package}</td>
                  <td className="px-3">{s.contract}</td>
                  <td className="px-3">{s.impressions}</td>
                  <td className="px-3">{s.engagement}</td>
                  <td className="px-3 text-muted-foreground">{s.renews}</td>
                  <td className="px-3"><Pill tone={s.status === "Active" ? "green" : "orange"}>{s.status}</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <InsightCard kind="COMMERCIAL" title="CalmCo renewal approaching" body="The CalmCo challenge sponsorship renews on 01 Sep 2026. Engagement is up 14% — a strong position to propose an uplift." cta="Prepare renewal" />
    </div>
  );
}

export function Rewards() {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Commercial" title="Allstars Rewards" subtitle="Earn rewards & rebates based on verified participation and engagement — funded by Allstars and sponsors." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="overflow-hidden rounded-2xl sa-gradient p-6 text-white shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/80"><Gift className="size-4" /> Allstars participation score</div>
          <div className="mt-2 flex items-end gap-3"><span className="font-display text-6xl">{rewards.score}</span><span className="mb-2 text-xl text-white/80">/ 100</span></div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div><div className="text-xs text-white/70">Annual available</div><div className="font-display text-2xl">£{rewards.annual.toLocaleString()}</div></div>
            <div><div className="text-xs text-white/70">Earned</div><div className="font-display text-2xl">£{rewards.earned.toLocaleString()}</div></div>
            <div><div className="text-xs text-white/70">Next reward</div><div className="font-display text-2xl">£{rewards.next}</div></div>
            <div><div className="text-xs text-white/70">Points required</div><div className="font-display text-2xl">{rewards.pointsRequired}</div></div>
          </div>
        </div>
        <InsightCard kind="OPPORTUNITY" title={`${rewards.pointsRequired} points to your next £${rewards.next}`} body="Increasing challenge participation from 61% to approximately 70% would significantly reduce the gap to your next reward." cta="Boost participation" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel eyebrow="Metrics" title="What drives your score">
          {rewards.metrics.map((m) => (
            <div key={m.label} className="mb-3">
              <div className="mb-1 flex justify-between text-sm"><span className="text-muted-foreground">{m.label}</span><span className="font-semibold text-[var(--sa-ink)]">{m.value}</span></div>
              <ProgressBar value={m.value} />
            </div>
          ))}
        </Panel>
        <Panel eyebrow="History" title="Reward history">
          <div className="space-y-2">
            {rewards.history.map((h) => (
              <div key={h.period} className="flex items-center justify-between rounded-xl border border-border p-3">
                <span className="font-semibold text-[var(--sa-ink)]">{h.period}</span>
                <span className="font-display text-lg text-[var(--sa-ink)]">£{h.amount.toLocaleString()}</span>
                <Pill tone="green">{h.status}</Pill>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-[var(--sa-violet)]/10 p-3 text-sm text-[var(--sa-violet)]">Rewards can be club-funded or sponsor-funded, with full impact reporting.</div>
        </Panel>
      </div>
    </div>
  );
}
