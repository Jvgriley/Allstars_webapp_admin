import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Filter, X } from "lucide-react";
import { PageHeader, Panel, Btn, Pill, PageLoading } from "../components/primitives";
import { Modal } from "../components/Modal";
import type { ActionTask } from "../../domain/types";
import { actionCentreService, useActionCentreTasks, useActionCentreState } from "../../services/actionCentreService";

export function ActionCentre() {
  const { data: open } = useActionCentreTasks();
  const state = useActionCentreState();
  const [filterOpen, setFilterOpen] = useState(false);
  const [category, setCategory] = useState("All");
  const [detail, setDetail] = useState<ActionTask | null>(null);

  if (!open) return <PageLoading />;

  const categories = ["All", ...Array.from(new Set(open.map((t) => t.category)))];
  const visible = category === "All" ? open : open.filter((t) => t.category === category);
  const high = open.filter((t) => t.severity === "high").length;

  const act = (t: ActionTask, action: string) => {
    if (action === "View") {
      setDetail(t);
      return;
    }
    actionCentreService.resolveTask(t.id);
    toast.success(`${t.title} — ${action.toLowerCase()}d.`);
  };

  const dismiss = (t: ActionTask) => {
    actionCentreService.dismissTask(t.id);
    toast(`Dismissed: ${t.title}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Action Centre"
        subtitle="Instead of searching the system, Allstars tells you what needs attention — ranked by urgency."
        actions={<Btn variant="outline" onClick={() => setFilterOpen((v) => !v)}><Filter className="size-4" /> Filter</Btn>}
      />

      {filterOpen && (
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button key={c} onClick={() => setCategory(c)} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${category === c ? "sa-gradient text-white" : "border border-border bg-card hover:bg-muted"}`}>{c}</button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Panel><div className="text-[11px] uppercase tracking-widest text-muted-foreground">Open items</div><div className="font-display text-3xl text-[var(--sa-ink)]">{open.length}</div></Panel>
        <Panel><div className="text-[11px] uppercase tracking-widest text-muted-foreground">High priority</div><div className="font-display text-3xl text-rose-600">{high}</div></Panel>
        <Panel><div className="text-[11px] uppercase tracking-widest text-muted-foreground">Resolved today</div><div className="font-display text-3xl text-emerald-600">{state.resolved.length}</div></Panel>
        <Panel><div className="text-[11px] uppercase tracking-widest text-muted-foreground">SLA on track</div><div className="font-display text-3xl text-[var(--sa-ink)]">96%</div></Panel>
      </div>

      <Panel eyebrow="Needs attention" title="Ranked by urgency">
        <div className="space-y-2">
          {visible.map((t) => (
            <div key={t.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border p-3.5">
              <span className={`grid size-9 shrink-0 place-items-center rounded-lg ${t.severity === "high" ? "bg-rose-50 text-rose-600" : t.severity === "medium" ? "bg-amber-50 text-amber-600" : "bg-muted text-muted-foreground"}`}>
                <AlertTriangle className="size-4" />
              </span>
              <div className="min-w-[200px] flex-1">
                <div className="text-sm text-[var(--sa-ink)]">
                  {t.count && <b className="font-display text-lg">{t.count} </b>}
                  {t.title}
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <Pill tone="violet">{t.category}</Pill>
                  <Pill tone={t.severity === "high" ? "red" : t.severity === "medium" ? "orange" : "muted"}>{t.severity}</Pill>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {t.actions.map((a) => (
                  <Btn key={a} size="sm" variant={a === "Resolve" || a === "Approve" ? "primary" : "outline"} onClick={() => act(t, a)}>
                    {a}
                  </Btn>
                ))}
                <button title="Dismiss" onClick={() => dismiss(t)} className="rounded p-1.5 hover:bg-muted"><X className="size-4 text-muted-foreground" /></button>
              </div>
            </div>
          ))}
          {visible.length === 0 && <div className="py-10 text-center text-sm text-muted-foreground">You're all caught up. Nice work. 🎉</div>}
        </div>
      </Panel>

      <Modal open={!!detail} onOpenChange={(o) => !o && setDetail(null)} title={detail?.title ?? ""} description={detail ? `${detail.category} · ${detail.severity} priority` : undefined}>
        {detail && (
          <>
            <p className="text-sm text-muted-foreground">
              {detail.count ? `${detail.count} items are affected. ` : ""}
              This is a mock detail view — a real integration would show the underlying records (overdue payments, expiring documents, unmatched requests, etc.) here.
            </p>
            <div className="flex gap-2 pt-2">
              {detail.actions.filter((a) => a !== "View").map((a) => (
                <Btn key={a} onClick={() => { act(detail, a); setDetail(null); }}>{a}</Btn>
              ))}
              <Btn variant="outline" onClick={() => { dismiss(detail); setDetail(null); }}>Dismiss</Btn>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
