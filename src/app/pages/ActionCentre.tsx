import { useState } from "react";
import { AlertTriangle, Filter } from "lucide-react";
import { PageHeader, Panel, Btn, Pill, PageLoading } from "../components/primitives";
import { useActionCentreTasks } from "../../services/actionCentreService";

export function ActionCentre() {
  const { data: actionCentre } = useActionCentreTasks();
  const [resolved, setResolved] = useState<string[]>([]);

  if (!actionCentre) return <PageLoading />;

  const open = actionCentre.filter((t) => !resolved.includes(t.id));
  const high = open.filter((t) => t.severity === "high").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operations"
        title="Action Centre"
        subtitle="Instead of searching the system, Allstars tells you what needs attention — ranked by urgency."
        actions={<Btn variant="outline"><Filter className="size-4" /> Filter</Btn>}
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Panel><div className="text-[11px] uppercase tracking-widest text-muted-foreground">Open items</div><div className="font-display text-3xl text-[var(--sa-ink)]">{open.length}</div></Panel>
        <Panel><div className="text-[11px] uppercase tracking-widest text-muted-foreground">High priority</div><div className="font-display text-3xl text-rose-600">{high}</div></Panel>
        <Panel><div className="text-[11px] uppercase tracking-widest text-muted-foreground">Resolved today</div><div className="font-display text-3xl text-emerald-600">{resolved.length}</div></Panel>
        <Panel><div className="text-[11px] uppercase tracking-widest text-muted-foreground">SLA on track</div><div className="font-display text-3xl text-[var(--sa-ink)]">96%</div></Panel>
      </div>

      <Panel eyebrow="Needs attention" title="Ranked by urgency">
        <div className="space-y-2">
          {open.map((t) => (
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
                  <Btn key={a} size="sm" variant={a === "Resolve" || a === "Approve" ? "primary" : "outline"} onClick={() => (a === "Resolve" || a === "Approve") && setResolved((r) => [...r, t.id])}>
                    {a}
                  </Btn>
                ))}
              </div>
            </div>
          ))}
          {open.length === 0 && <div className="py-10 text-center text-sm text-muted-foreground">You're all caught up. Nice work. 🎉</div>}
        </div>
      </Panel>
    </div>
  );
}
