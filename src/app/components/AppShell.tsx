import { useState } from "react";
import {
  Bell, Search, ChevronDown, Menu, X, Plus, Sparkles, ChevronRight,
} from "lucide-react";
import { Outlet, NavLink } from "react-router";
import { navSections } from "../nav";
import { pagePath } from "../routing";
import { useOrganisation } from "../../services/organisationService";
import { cx, Btn } from "./primitives";
import { Toaster } from "./ui/sonner";

/**
 * The single application shell: sidebar, top bar, and the "Ask Allstars"
 * slide-over. Renders the active route via <Outlet/>, so this mounts once
 * and every page swaps inside it — no shared chrome is re-rendered per page.
 */
export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [askOpen, setAskOpen] = useState(false);
  const { data: organisation } = useOrganisation();

  return (
    <div className="flex h-full w-full overflow-hidden bg-background text-foreground">
      <Toaster position="top-right" richColors closeButton />
      {/* Sidebar */}
      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[var(--sa-ink)] text-[var(--sidebar-foreground)] transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-2 px-5 py-4">
          <span className="grid size-9 place-items-center rounded-xl sa-gradient font-display text-lg text-white">SA</span>
          <div className="leading-tight">
            <div className="font-display text-lg tracking-wide text-white">SPORTING</div>
            <div className="-mt-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-[var(--sa-lavender)]">Allstars</div>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setMobileOpen(false)}>
            <X className="size-5" />
          </button>
        </div>

        <nav className="sa-scroll flex-1 overflow-y-auto px-3 pb-6">
          {navSections.map((section) => (
            <div key={section.title} className="mb-4">
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.id}
                    to={pagePath(item.id)}
                    end={item.id === "dashboard"}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cx(
                        "group mb-0.5 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                        isActive ? "sa-gradient text-white shadow" : "text-white/70 hover:bg-white/10 hover:text-white",
                      )
                    }
                  >
                    {Icon && <Icon className="size-4 shrink-0" />}
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur">
          <button className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="size-5" />
          </button>

          {/* Org selector */}
          <button className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted">
            <span className="grid size-6 place-items-center rounded-md sa-gradient text-[11px] font-bold text-white">
              {organisation?.name?.[0] ?? "?"}
            </span>
            <span className="hidden font-semibold sm:inline">{organisation?.name ?? "Loading…"}</span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </button>

          {/* Search */}
          <div className="relative ml-1 hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search members, teams, fixtures…"
              className="w-full rounded-lg border border-border bg-input-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[var(--sa-magenta)]/40"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Btn size="sm" variant="outline" onClick={() => setAskOpen((v) => !v)}>
              <Sparkles className="size-4 text-[var(--sa-magenta)]" /> Ask Allstars
            </Btn>
            <Btn size="sm">
              <Plus className="size-4" /> <span className="hidden sm:inline">Quick action</span>
            </Btn>
            <button className="relative grid size-9 place-items-center rounded-lg border border-border bg-card hover:bg-muted">
              <Bell className="size-4" />
              <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[var(--sa-magenta)]" />
            </button>
            <button className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-muted">
              <span className="grid size-8 place-items-center rounded-full sa-gradient text-xs font-bold text-white">JR</span>
              <ChevronDown className="hidden size-4 text-muted-foreground sm:block" />
            </button>
          </div>
        </header>

        <main className="sa-scroll flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1440px] p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Ask Allstars slide-over */}
      {askOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAskOpen(false)} />
          <div className="relative flex h-full w-full max-w-md flex-col bg-card shadow-2xl">
            <div className="flex items-center gap-2 border-b border-border p-4">
              <span className="grid size-8 place-items-center rounded-lg sa-gradient text-white">
                <Sparkles className="size-4" />
              </span>
              <div>
                <div className="font-semibold text-[var(--sa-ink)]">Ask Allstars</div>
                <div className="text-xs text-muted-foreground">Intelligence, on demand</div>
              </div>
              <button className="ml-auto" onClick={() => setAskOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <div className="sa-scroll flex-1 space-y-3 overflow-y-auto p-4">
              <div className="rounded-2xl bg-muted p-3 text-sm">
                Hi Jack — I sit across every part of your club. Ask me anything, or try a suggestion below.
              </div>
              {[
                "Which members are at risk of lapsing?",
                "How do we close the gap on United?",
                "Summarise this week's participation.",
                "What's driving our revenue growth?",
              ].map((q) => (
                <button
                  key={q}
                  className="flex w-full items-center justify-between gap-2 rounded-xl border border-border p-3 text-left text-sm hover:bg-muted"
                >
                  {q}
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              ))}
            </div>
            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2">
                <input placeholder="Ask a question…" className="flex-1 bg-transparent text-sm outline-none" />
                <Btn size="sm">Send</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
