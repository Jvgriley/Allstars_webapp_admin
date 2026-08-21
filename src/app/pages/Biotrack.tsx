import { useState } from "react";
import { toast } from "sonner";
import { Lock, Watch } from "lucide-react";
import { PageHeader, Panel, Btn, Pill, StatCard, PageLoading } from "../components/primitives";
import { Modal } from "../components/Modal";
import { Switch } from "../components/ui/switch";
import { AreaTrend } from "../components/Charts";
import { integrationsService, useDataSources, usePrivacy } from "../../services/integrationsService";

const load = [
  { d: "Mon", v: 42 }, { d: "Tue", v: 55 }, { d: "Wed", v: 38 }, { d: "Thu", v: 61 }, { d: "Fri", v: 48 }, { d: "Sat", v: 72 }, { d: "Sun", v: 30 },
];

const privacyMeta: { label: string; tone: "green" | "violet" | "orange" | "red"; note: string }[] = [
  { label: "Public sporting stats", tone: "green", note: "Visible in profiles & rankings" },
  { label: "Private coach information", tone: "violet", note: "Coaches & staff only" },
  { label: "Private personal information", tone: "orange", note: "Member only" },
  { label: "Sensitive health information", tone: "red", note: "Never shown publicly" },
];

export function Biotrack() {
  const { data: dataSources } = useDataSources();
  const { data: privacy } = usePrivacy();
  const [permOpen, setPermOpen] = useState(false);
  if (!dataSources || !privacy) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="biotrackOS" title="Data Ingestion Layer" subtitle="Connect wearables, activity platforms and equipment. Health data never appears publicly by default." actions={<Btn variant="outline" onClick={() => setPermOpen(true)}>Manage permissions</Btn>} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Connected members" value="842" accent />
        <StatCard label="Data quality" value="94%" delta="+2%" up />
        <StatCard label="Sources online" value={`${dataSources.filter((d) => d.status === "Connected").length} / ${dataSources.length}`} />
        <StatCard label="Last sync" value="2 min" />
      </div>

      <Panel eyebrow="Connected data sources" title="Ingestion status">
        <div className="grid gap-3 md:grid-cols-2">
          {dataSources.map((s) => (
            <div key={s.name} className="flex items-center gap-3 rounded-xl border border-border p-3.5">
              <span className="grid size-10 place-items-center rounded-lg bg-[var(--sa-ink)] text-white"><Watch className="size-5" /></span>
              <div className="flex-1">
                <div className="flex items-center gap-2"><span className="font-semibold text-[var(--sa-ink)]">{s.name}</span>{s.status === "Potential integration" ? <Pill tone="muted">Potential integration</Pill> : <Pill tone="green">Connected</Pill>}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{s.status === "Potential integration" ? "Not yet enabled" : `${s.connected.toLocaleString()} members · quality ${s.quality}% · synced ${s.lastSync}`}</div>
              </div>
              <Btn
                size="sm"
                variant={s.status === "Potential integration" ? "outline" : "ghost"}
                onClick={() => {
                  integrationsService.toggleDataSource(s.name);
                  toast.success(s.status === "Potential integration" ? `${s.name} connected.` : `${s.name} disconnected.`);
                }}
              >
                {s.status === "Potential integration" ? "Connect" : "Manage"}
              </Btn>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel className="lg:col-span-2" eyebrow="Private performance view" title="Weekly training load">
          <AreaTrend data={load} x="d" y="v" height={240} />
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-xl border border-border p-3"><div className="text-xs text-muted-foreground">Training load</div><div className="font-display text-xl text-emerald-600">Optimal</div></div>
            <div className="rounded-xl border border-border p-3"><div className="text-xs text-muted-foreground">Recovery</div><div className="font-display text-xl text-[var(--sa-ink)]">82%</div></div>
            <div className="rounded-xl border border-border p-3"><div className="text-xs text-muted-foreground">Weekly activity</div><div className="font-display text-xl text-[var(--sa-ink)]">↑ 12%</div></div>
            <div className="rounded-xl border border-border p-3"><div className="text-xs text-muted-foreground">Development</div><div className="font-display text-xl text-[var(--sa-ink)]">Improving</div></div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Indicative wellbeing metrics only — not medical advice.</p>
        </Panel>

        <Panel eyebrow="Permissions" title="Data visibility">
          <div className="space-y-2">
            {privacyMeta.map((p) => (
              <div key={p.label} className="flex items-center gap-2 rounded-xl border border-border p-3">
                <Lock className="size-4 text-muted-foreground" />
                <div className="flex-1"><div className="text-sm font-semibold text-[var(--sa-ink)]">{p.label}</div><div className="text-xs text-muted-foreground">{p.note}</div></div>
                <Pill tone={p.tone}>{privacy[p.label] ?? (p.tone === "green" ? "Public" : "Private")}</Pill>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Modal open={permOpen} onOpenChange={setPermOpen} title="Manage permissions" description="Control who can see each category of data across the platform.">
        <div className="space-y-3">
          {privacyMeta.map((p) => {
            const value = privacy[p.label] ?? (p.tone === "green" ? "Public" : "Private");
            return (
              <div key={p.label} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                <div>
                  <div className="text-sm font-semibold text-[var(--sa-ink)]">{p.label}</div>
                  <div className="text-xs text-muted-foreground">{p.note}</div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  Private
                  <Switch
                    checked={value === "Public"}
                    onCheckedChange={(checked) => {
                      const next = checked ? "Public" : "Private";
                      integrationsService.setPrivacy(p.label, next);
                      toast.success(`${p.label} set to ${next}.`);
                    }}
                  />
                  Public
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
