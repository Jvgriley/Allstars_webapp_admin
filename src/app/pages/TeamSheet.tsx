// Team Selection / Team Sheets — Sprint 3.
//
// One page, two conceptual states, both driven by the same TeamSelection:
// "Draft" renders the Team Builder (management controls, insights,
// unfilled/conflict indicators); "Published" renders a clean, branded
// sheet with share/export actions and no management chrome. Nothing here
// is football-specific — every sport-shaped detail comes from the
// SportConfig looked up via the fixture's `sport`.
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Download, Megaphone, Pencil, RotateCcw, Send, Share2 } from "lucide-react";
import { PageHeader, Panel, Btn, Pill, InsightCard, PageLoading, SelectField } from "../components/primitives";
import { ConfirmDialog } from "../components/Modal";
import { Pitch, SlotAnchor } from "../components/teamsheet/Pitch";
import { SlotChip, BenchRow } from "../components/teamsheet/PlayerChip";
import { PlayerPickerModal } from "../components/teamsheet/PlayerPickerModal";
import { buildTeamSheetSvg, downloadSvg } from "../components/teamsheet/exportSvg";
import type { PageId } from "../nav";
import { sportConfigs } from "../../domain/sportConfigs";
import { sportService, useFixtures } from "../../services/sportService";
import { useMembers } from "../../services/membersService";
import { teamSheetService, useTeamSheetsStore } from "../../services/teamSheetService";
import { spacesService } from "../../services/spacesService";

type PickerState = { mode: "slot"; slotId: string } | { mode: "bench" } | undefined;

export function TeamSheetPage({ fixtureId, navigate }: { fixtureId?: string; navigate: (p: PageId, arg?: string) => void }) {
  const { data: fixtures } = useFixtures();
  const { data: members } = useMembers();
  useTeamSheetsStore(); // re-render on any selection mutation, same pattern as useFixtureAvailability()

  const [picker, setPicker] = useState<PickerState>(undefined);
  const [resetOpen, setResetOpen] = useState(false);

  if (!fixtures || !members) return <PageLoading />;

  const fixture = fixtures.find((f) => f.id === fixtureId);
  if (!fixture) {
    return (
      <div className="space-y-4">
        <PageHeader eyebrow="Sport" title="Team Sheet" subtitle="This fixture couldn't be found." />
        <Btn variant="outline" onClick={() => navigate("fixtures")}><ArrowLeft className="size-4" /> Back to Fixtures</Btn>
      </div>
    );
  }

  const sport = fixture.sport ?? "football";
  const config = sportConfigs[sport];
  const selection = teamSheetService.getSelection(fixture.id, config);
  const formation = config.formations.find((f) => f.id === selection.formationId) ?? config.formations[0];
  const roster = members.slice(0, 18); // same convention as the Availability screen
  const memberById = (id: string) => members.find((m) => m.id === id);
  const getAvailability = (memberId: string) => sportService.getAvailability(fixture.id, memberId, memberById(memberId)?.availability ?? "green");

  const isBuilder = selection.status === "Draft";
  const insights = teamSheetService.getSelectionInsights(config, selection, roster, getAvailability);
  const activeSlot = picker?.mode === "slot" ? formation.slots.find((s) => s.slotId === picker.slotId) : undefined;

  const handlePick = (memberId: string, opts?: { override?: boolean }) => {
    const name = memberById(memberId)?.name ?? "Player";
    if (picker?.mode === "slot" && activeSlot) {
      const label = config.positions.find((p) => p.key === activeSlot.position)?.label ?? activeSlot.position;
      teamSheetService.assignPlayer(fixture.id, config, picker.slotId, memberId, opts);
      toast.success(`${name} selected at ${label}.`);
    } else if (picker?.mode === "bench") {
      teamSheetService.addToBench(fixture.id, config, memberId);
      toast.success(`${name} added to the ${config.benchLabel.toLowerCase()}.`);
    }
  };

  const removeFromSlot = (slotId: string) => {
    const st = selection.starters.find((s) => s.slotId === slotId);
    teamSheetService.removeFromSlot(fixture.id, config, slotId);
    if (st) toast.success(`${memberById(st.memberId)?.name} removed from the starting lineup.`);
  };

  const removeFromBench = (memberId: string) => {
    const name = memberById(memberId)?.name;
    teamSheetService.removeFromBench(fixture.id, config, memberId);
    toast.success(`${name} removed from the ${config.benchLabel.toLowerCase()}.`);
  };

  const reset = () => {
    teamSheetService.resetSelection(fixture.id, config);
    setResetOpen(false);
    toast.success("Selection reset.");
  };

  const publish = () => {
    teamSheetService.publish(fixture.id, config);
    toast.success("Team sheet published.");
  };

  const editSelection = () => {
    teamSheetService.unpublish(fixture.id, config);
    toast.success("Reopened for editing.");
  };

  const share = async () => {
    const text = `${fixture.home} vs ${fixture.away} — team sheet, ${fixture.date} ${fixture.time}.`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${fixture.home} vs ${fixture.away}`, text });
      } catch {
        // User cancelled the share sheet — not an error.
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      toast.success("Team sheet summary copied to clipboard.");
    } else {
      toast.error("Sharing isn't available in this browser.");
    }
  };

  const downloadGraphic = () => {
    const svg = buildTeamSheetSvg({
      config,
      selection,
      memberById,
      headline: `${fixture.home} vs ${fixture.away}`,
      subline: `${fixture.comp} · ${fixture.date} ${fixture.time}${fixture.venue ? ` · ${fixture.venue}` : ""}`,
    });
    downloadSvg(svg, `${fixture.home}-vs-${fixture.away}-team-sheet.svg`.replace(/\s+/g, "-").toLowerCase());
    toast.success("Team sheet graphic downloaded.");
  };

  const postToSpaces = () => {
    const startersText = selection.starters.map((st) => memberById(st.memberId)?.name).filter(Boolean).join(", ");
    spacesService.addPost({
      tag: "TEAM NEWS",
      title: `Team news: ${fixture.home} vs ${fixture.away}`,
      body: `Starting lineup: ${startersText || "to be confirmed"}. ${fixture.date} ${fixture.time}${fixture.venue ? ` · ${fixture.venue}` : ""}.`,
    });
    toast.success("Posted to Spaces — awaiting approval.");
    navigate("spaces");
  };

  const createStory = () => {
    spacesService.addPost({
      tag: "MATCHDAY STORY",
      title: `${fixture.home} name their team to face ${fixture.away}`,
      body: `${fixture.home} go into ${fixture.date}'s ${fixture.comp} fixture against ${fixture.away} with ${selection.starters.length} of ${formation.slots.length} starting positions confirmed.`,
      ai: true,
    });
    toast.success("Story created and posted to Spaces — awaiting approval.");
    navigate("spaces");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Sport · Team Sheet"
        title={`${fixture.home} vs ${fixture.away}`}
        subtitle={`${fixture.comp} · ${fixture.date} · ${fixture.time}${fixture.venue ? ` · ${fixture.venue}` : ""}`}
        actions={
          <>
            <Pill tone={isBuilder ? "orange" : "green"}>{selection.status}</Pill>
            <Btn variant="outline" onClick={() => navigate("availability")}><ArrowLeft className="size-4" /> Back to Availability</Btn>
          </>
        }
      />

      {isBuilder ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            {insights.slice(0, 3).map((i) => <InsightCard key={i.id} kind={i.kind} title={i.title} body={i.body} />)}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Panel
                eyebrow={`${config.label} · Team Builder`}
                title="Tap a position to select a player"
                action={
                  <div className="flex flex-wrap items-center gap-2">
                    {config.formations.length > 1 && (
                      <SelectField value={formation.id} onChange={(e) => teamSheetService.setFormation(fixture.id, config, e.target.value)} className="w-auto">
                        {config.formations.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                      </SelectField>
                    )}
                    <Btn size="sm" variant="ghost" onClick={() => setResetOpen(true)}><RotateCcw className="size-3.5" /> Reset</Btn>
                  </div>
                }
              >
                <Pitch sport={sport}>
                  {formation.slots.map((slot) => {
                    const started = selection.starters.find((st) => st.slotId === slot.slotId);
                    const member = started ? memberById(started.memberId) : undefined;
                    const warn = !started
                      ? undefined
                      : started.overrideUnavailable
                        ? "unavailable"
                        : member && !teamSheetService.isEligibleForSlot(member, config, slot.position)
                          ? "out-of-position"
                          : undefined;
                    return (
                      <SlotAnchor key={slot.slotId} x={slot.x} y={slot.y}>
                        <SlotChip slot={slot} config={config} member={member} warn={warn} onClick={() => setPicker({ mode: "slot", slotId: slot.slotId })} />
                      </SlotAnchor>
                    );
                  })}
                </Pitch>
              </Panel>

              <Panel eyebrow="Squad" title={`Starting ${formation.slots.length} — full list`}>
                <div className="grid gap-2 sm:grid-cols-2">
                  {formation.slots.map((slot) => {
                    const started = selection.starters.find((st) => st.slotId === slot.slotId);
                    const member = started ? memberById(started.memberId) : undefined;
                    const label = config.positions.find((p) => p.key === slot.position)?.label ?? slot.position;
                    return member ? (
                      <BenchRow key={slot.slotId} member={member} positionLabel={label} onClick={() => setPicker({ mode: "slot", slotId: slot.slotId })} onRemove={() => removeFromSlot(slot.slotId)} />
                    ) : (
                      <button key={slot.slotId} onClick={() => setPicker({ mode: "slot", slotId: slot.slotId })} className="flex items-center gap-2.5 rounded-xl border border-dashed border-border p-2 text-left text-sm text-muted-foreground hover:bg-muted">
                        <span className="grid size-8 shrink-0 place-items-center rounded-full border-2 border-dashed border-border text-xs">+</span>
                        {label} — unfilled
                      </button>
                    );
                  })}
                </div>
              </Panel>
            </div>

            <div className="space-y-4">
              <Panel eyebrow={config.benchLabel} title={config.benchLabel} action={<Btn size="sm" variant="outline" onClick={() => setPicker({ mode: "bench" })}>Add</Btn>}>
                {selection.bench.length === 0 && <div className="py-4 text-center text-sm text-muted-foreground">No {config.benchLabel.toLowerCase()} named yet.</div>}
                <div className="space-y-1.5">
                  {selection.bench.map((id) => {
                    const m = memberById(id);
                    return m ? <BenchRow key={id} member={m} onRemove={() => removeFromBench(id)} /> : null;
                  })}
                </div>
              </Panel>

              {insights.slice(3).length > 0 && (
                <Panel eyebrow="Allstars Intelligence" title="More insights">
                  <div className="space-y-3">
                    {insights.slice(3).map((i) => <InsightCard key={i.id} kind={i.kind} title={i.title} body={i.body} />)}
                  </div>
                </Panel>
              )}

              <Btn className="w-full" onClick={publish}><CheckCircle2 className="size-4" /> Publish Team</Btn>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            <Btn variant="outline" onClick={editSelection}><Pencil className="size-4" /> Edit Selection</Btn>
            <Btn variant="outline" onClick={share}><Share2 className="size-4" /> Share</Btn>
            <Btn variant="outline" onClick={downloadGraphic}><Download className="size-4" /> Download Graphic</Btn>
            <Btn variant="outline" onClick={postToSpaces}><Send className="size-4" /> Post to Spaces</Btn>
            <Btn variant="outline" onClick={createStory}><Megaphone className="size-4" /> Create Story</Btn>
          </div>

          <Panel eyebrow={`${config.label} · ${formation.label}`} title="Published Team Sheet">
            <Pitch sport={sport}>
              {formation.slots.map((slot) => {
                const started = selection.starters.find((st) => st.slotId === slot.slotId);
                const member = started ? memberById(started.memberId) : undefined;
                return (
                  <SlotAnchor key={slot.slotId} x={slot.x} y={slot.y}>
                    <SlotChip slot={slot} config={config} member={member} onClick={() => {}} readOnly />
                  </SlotAnchor>
                );
              })}
            </Pitch>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {formation.slots.map((slot) => {
                const started = selection.starters.find((st) => st.slotId === slot.slotId);
                const member = started ? memberById(started.memberId) : undefined;
                const label = config.positions.find((p) => p.key === slot.position)?.label ?? slot.position;
                return member ? <BenchRow key={slot.slotId} member={member} positionLabel={label} readOnly /> : null;
              })}
            </div>
          </Panel>

          <Panel eyebrow={config.benchLabel} title={config.benchLabel}>
            {selection.bench.length === 0 ? (
              <div className="py-4 text-center text-sm text-muted-foreground">No {config.benchLabel.toLowerCase()} named.</div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {selection.bench.map((id) => {
                  const m = memberById(id);
                  return m ? <BenchRow key={id} member={m} readOnly /> : null;
                })}
              </div>
            )}
          </Panel>
        </>
      )}

      <PlayerPickerModal
        open={!!picker}
        onOpenChange={(o) => !o && setPicker(undefined)}
        config={config}
        slot={activeSlot}
        roster={roster}
        getAvailability={getAvailability}
        selection={selection}
        onPick={handlePick}
      />

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset selection?"
        description="This clears every selected starter and bench player for this fixture. This can't be undone."
        confirmLabel="Reset selection"
        destructive
        onConfirm={reset}
      />
    </div>
  );
}
