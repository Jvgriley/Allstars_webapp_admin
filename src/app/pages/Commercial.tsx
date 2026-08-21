import { useState } from "react";
import { toast } from "sonner";
import { RefreshCw, Plus, Handshake, Gift, MoreHorizontal, Package } from "lucide-react";
import { PageHeader, Panel, Btn, Pill, Avatar, StatCard, InsightCard, ProgressBar, PageLoading, TextField, SelectField } from "../components/primitives";
import { Modal } from "../components/Modal";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { AreaTrend, Bars } from "../components/Charts";
import type { PageId } from "../nav";
import { financeService, useFinance, useFinanceTransactions } from "../../services/financeService";
import { retailService, useRetail, useRetailOrders } from "../../services/retailService";
import { sponsorshipService, useSponsors } from "../../services/sponsorshipService";
import { useRewards } from "../../services/rewardsService";
import { useRevenueTrend } from "../../services/metricsService";

export function Finance() {
  const { data: finance } = useFinance();
  const { data: revenueTrend } = useRevenueTrend();
  const [openStream, setOpenStream] = useState<string | null>(null);
  const { data: transactions = [] } = useFinanceTransactions(openStream ?? undefined);

  if (!finance || !revenueTrend) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Commercial"
        title="Finance"
        subtitle="Every revenue stream, outstanding payments and accounting sync — connected to memberships, retail and sponsorship."
        actions={<Btn variant="outline" onClick={() => { financeService.syncNow(); toast.success("Synced with Xero."); }}><RefreshCw className="size-4" /> Sync now</Btn>}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Net revenue" value={`£${finance.net.toLocaleString()}`} delta="+12%" up accent />
        <StatCard label="Outstanding" value={`£${finance.outstanding.toLocaleString()}`} delta="-8%" up />
        <StatCard label="Refunds" value={`£${finance.refunds}`} />
        <StatCard label="Allstars fees" value={`£${finance.allstarsFees}`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" eyebrow="Revenue by stream" title="This month — click a stream for transaction detail">
          <Bars data={finance.streams.map((s) => ({ k: s.label, v: s.value }))} x="k" y="v" height={280} />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {finance.streams.map((s) => (
              <button key={s.label} onClick={() => setOpenStream(s.label)} className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted">{s.label} · £{s.value.toLocaleString()}</button>
            ))}
          </div>
        </Panel>
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

      <Modal open={!!openStream} onOpenChange={(o) => !o && setOpenStream(null)} title={`${openStream ?? ""} · transactions`} description="Recent activity for this revenue stream.">
        <div className="sa-scroll max-h-[50vh] space-y-2 overflow-y-auto">
          {transactions.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5 text-sm">
              <div className="flex-1"><div className="font-semibold text-[var(--sa-ink)]">{t.member}</div><div className="text-xs text-muted-foreground">{t.date}</div></div>
              <span className="font-semibold">£{t.amount}</span>
              <Pill tone={t.status === "Paid" ? "green" : t.status === "Pending" ? "orange" : "red"}>{t.status}</Pill>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

function AddProductModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("£19.99");
  const [cat, setCat] = useState("Merch");
  const save = () => {
    if (!name.trim()) { toast.error("Name the product."); return; }
    retailService.addProduct({ name, price, cat });
    toast.success(`${name} added to the store.`);
    onOpenChange(false);
    setName("");
  };
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Add product" footer={<><Btn variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Btn><Btn onClick={save}>Add product</Btn></>}>
      <TextField label="Product name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <SelectField label="Category" value={cat} onChange={(e) => setCat(e.target.value)}>
          {["Kit", "Training", "Merch", "Membership"].map((c) => <option key={c} value={c}>{c}</option>)}
        </SelectField>
      </div>
    </Modal>
  );
}

export function Retail() {
  const { data: retail } = useRetail();
  const { data: orders = [] } = useRetailOrders();
  const [addOpen, setAddOpen] = useState(false);
  if (!retail) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Commercial" title="Retail / Club Store" subtitle="Kits, merch, tickets, courses and memberships — connected to live commerce and member profiles." actions={<Btn onClick={() => setAddOpen(true)}><Plus className="size-4" /> Add product</Btn>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Retail revenue" value={retail.revenue} delta="+9%" up accent />
        <StatCard label="Orders" value={`${retail.orders}`} delta="+14%" up />
        <StatCard label="Average order" value={retail.avg} />
        <StatCard label="Top product" value="Training Shirt" />
      </div>
      <Panel eyebrow="Products" title="Catalogue & inventory">
        <div className="sa-scroll overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead><tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground"><th className="py-2.5 pr-3">Product</th><th className="px-3">Category</th><th className="px-3">Price</th><th className="px-3">Stock</th><th className="px-3">Sold</th><th className="px-3"></th></tr></thead>
            <tbody>
              {retail.products.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="py-2.5 pr-3 font-semibold text-[var(--sa-ink)]">{p.name}</td>
                  <td className="px-3"><Pill tone="violet">{p.cat}</Pill></td>
                  <td className="px-3">{p.price}</td>
                  <td className="px-3">{p.stock > 900 ? "∞" : p.stock}</td>
                  <td className="px-3 font-semibold">{p.sold}</td>
                  <td className="px-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="rounded p-1 hover:bg-muted"><MoreHorizontal className="size-4 text-muted-foreground" /></button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { retailService.adjustStock(p.id, 10); toast.success(`+10 stock for ${p.name}.`); }}>Restock +10</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { retailService.discontinue(p.id); toast.success(`${p.name} marked out of stock.`); }}>Mark out of stock</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      {orders.length > 0 && (
        <Panel eyebrow="Recent orders" title="Mock order queue">
          <div className="space-y-2">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center gap-3 rounded-xl border border-border p-2.5 text-sm">
                <Package className="size-4 text-[var(--sa-magenta)]" />
                <div className="flex-1"><div className="font-semibold text-[var(--sa-ink)]">{o.product} × {o.qty}</div><div className="text-xs text-muted-foreground">{o.buyer} · {o.time}</div></div>
                <span className="font-semibold">{o.total}</span>
                {o.status === "Pending" ? (
                  <Btn size="sm" variant="outline" onClick={() => { retailService.fulfilOrder(o.id); toast.success(`Order for ${o.buyer} fulfilled.`); }}>Fulfil</Btn>
                ) : (
                  <Pill tone="green">Fulfilled</Pill>
                )}
              </div>
            ))}
          </div>
        </Panel>
      )}
      <AddProductModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

function AddSponsorModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [name, setName] = useState("");
  const [pkg, setPkg] = useState("");
  const [contract, setContract] = useState("");
  const save = () => {
    if (!name.trim()) { toast.error("Name the sponsor."); return; }
    sponsorshipService.addSponsor({ name, package: pkg || "General Sponsor", contract: contract || "TBC" });
    toast.success(`${name} added.`);
    onOpenChange(false);
    setName("");
  };
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Add sponsor" footer={<><Btn variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Btn><Btn onClick={save}>Add sponsor</Btn></>}>
      <TextField label="Sponsor name" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      <TextField label="Package" value={pkg} onChange={(e) => setPkg(e.target.value)} placeholder="e.g. Kit Sponsor" />
      <TextField label="Contract value" value={contract} onChange={(e) => setContract(e.target.value)} placeholder="£10,000 / yr" />
    </Modal>
  );
}

export function Sponsorship() {
  const { data: sponsors } = useSponsors();
  const [addOpen, setAddOpen] = useState(false);
  if (!sponsors) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Commercial" title="Sponsorship" subtitle="Manage sponsors, packages, contracts, campaigns and exposure across the whole ecosystem." actions={<Btn onClick={() => setAddOpen(true)}><Handshake className="size-4" /> Add sponsor</Btn>} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Committed" value="£51.7k" delta="+18%" up accent />
        <StatCard label="Active sponsors" value={`${sponsors.filter((s) => s.status === "Active").length}`} />
        <StatCard label="Total impressions" value="2.8M" delta="+22%" up />
        <StatCard label="Renewals due" value={`${sponsors.filter((s) => s.status === "Renewal due").length}`} />
      </div>
      <Panel eyebrow="Sponsors" title="Portfolio">
        <div className="sa-scroll overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead><tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground"><th className="py-2.5 pr-3">Sponsor</th><th className="px-3">Package</th><th className="px-3">Contract</th><th className="px-3">Impressions</th><th className="px-3">Engagement</th><th className="px-3">Renews</th><th className="px-3">Status</th><th className="px-3"></th></tr></thead>
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
                  <td className="px-3">
                    {s.status === "Renewal due" && (
                      <Btn size="sm" variant="outline" onClick={() => { sponsorshipService.renew(s.id, "01 Sep 2027"); toast.success(`${s.name} renewed.`); }}>Renew</Btn>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <InsightCard
        kind="COMMERCIAL"
        title="CalmCo renewal approaching"
        body="The CalmCo challenge sponsorship renews on 01 Sep 2026. Engagement is up 14% — a strong position to propose an uplift."
        cta="Prepare renewal"
        onAction={() => {
          const calmCo = sponsors.find((s) => s.name === "CalmCo");
          if (calmCo) sponsorshipService.renew(calmCo.id, "01 Sep 2027");
          toast.success("CalmCo renewal prepared and confirmed.");
        }}
      />
      <AddSponsorModal open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}

export function Rewards({ navigate }: { navigate?: (p: PageId) => void }) {
  const { data: rewards } = useRewards();
  if (!rewards) return <PageLoading />;

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
        <InsightCard kind="OPPORTUNITY" title={`${rewards.pointsRequired} points to your next £${rewards.next}`} body="Increasing challenge participation from 61% to approximately 70% would significantly reduce the gap to your next reward." cta="Boost participation" onAction={() => navigate?.("challenges")} />
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
