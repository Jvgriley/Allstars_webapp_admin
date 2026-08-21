import { useState } from "react";
import { toast } from "sonner";
import { Building2, ChevronRight } from "lucide-react";
import { PageHeader, Panel, Btn, Pill, PageLoading } from "../components/primitives";
import type { IntegrationStatus } from "../../domain/types";
import { integrationsService, useIntegrations } from "../../services/integrationsService";
import { useRoleDashboards } from "../../services/adminService";

const statusTone = (s: IntegrationStatus) => (s === "Connected" ? "green" : s === "Available" ? "violet" : "muted");

export function Integrations() {
  const { data: integrations } = useIntegrations();
  const [cat, setCat] = useState("All");

  if (!integrations) return <PageLoading />;

  const cats = ["All", ...Array.from(new Set(integrations.map((i) => i.cat)))];
  const filtered = cat === "All" ? integrations : integrations.filter((i) => i.cat === cat);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Integrations Marketplace" subtitle="Connect activity, finance, calendar, streaming and communication tools. Nothing is implied as connected unless confirmed." />
      <div className="flex flex-wrap gap-1.5">
        {cats.map((c) => <button key={c} onClick={() => setCat(c)} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${cat === c ? "sa-gradient text-white" : "border border-border bg-card hover:bg-muted"}`}>{c}</button>)}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((i) => (
          <div key={i.name} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
            <span className="grid size-11 place-items-center rounded-xl bg-[var(--sa-ink)] font-display text-white">{i.name[0]}</span>
            <div className="flex-1"><div className="font-semibold text-[var(--sa-ink)]">{i.name}</div><div className="text-xs text-muted-foreground">{i.cat}</div></div>
            <div className="flex flex-col items-end gap-1.5">
              <Pill tone={statusTone(i.status)}>{i.status}</Pill>
              <Btn
                size="sm"
                variant={i.status === "Connected" ? "ghost" : "outline"}
                onClick={() => {
                  if (i.status === "Connected") {
                    toast(`${i.name} — connection settings would appear here.`);
                  } else {
                    integrationsService.toggleIntegration(i.name);
                    toast.success(`${i.name} connected.`);
                  }
                }}
              >
                {i.status === "Connected" ? "Manage" : "Connect"}
              </Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const hierarchy = ["Governing Body", "Region", "League", "Club", "Team", "Member"];

export function RoleDashboards() {
  const { data: roleDashboards } = useRoleDashboards();
  if (!roleDashboards) return <PageLoading />;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Admin" title="Role-Based Dashboards" subtitle="The same ecosystem, scoped to each role. Analytics and permissions roll upward through the organisation hierarchy." />

      <Panel eyebrow="Organisation hierarchy" title="Permissions roll up appropriately">
        <div className="flex flex-wrap items-center gap-2">
          {hierarchy.map((h, i) => (
            <div key={h} className="flex items-center gap-2">
              <span className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-[var(--sa-ink)]"><Building2 className="size-4 text-[var(--sa-magenta)]" /> {h}</span>
              {i < hierarchy.length - 1 && <ChevronRight className="size-4 text-muted-foreground" />}
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">A governing body sees national & regional participation. A team manager sees only their own team.</p>
      </Panel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {roleDashboards.map((r) => (
          <Panel key={r.role} title={r.role} eyebrow="Dashboard">
            <p className="text-sm text-muted-foreground">{r.focus}</p>
            <div className="mt-3 rounded-xl bg-muted p-3">
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">Key metric</div>
              <div className="font-display text-lg text-[var(--sa-ink)]">{r.metric}</div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
