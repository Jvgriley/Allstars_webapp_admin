# Sprint 4 — Olympic Multi-Sport Framework: Backend Requirements

**Status:** Conceptual data/API requirements only. No Laravel endpoints invented, no backend contacted, no assumptions about the existing schema beyond what Sprint 3's document already assumed. This extends that document rather than replacing it — every entity Sprint 3 described (Members, Teams, Fixtures, Availability, Team Selections, Team Sheets) still applies; what follows is what multi-sport support adds on top of each one, plus the net-new concepts (Sports, Disciplines, sport-scoped positions/roles, captaincy, batting order).

This is intentionally still shaped around what the *frontend* needs, not a guessed backend schema — see Sprint 3's document, section 14 in the technical audit, for why. When the real API's shape is known, these are the concepts a mapping layer needs to be able to produce; they are not a proposal for table names or endpoint paths.

---

## 1. Sport

A first-class entity, not a hardcoded enum. The frontend's `SportConfig` (see `src/domain/sportConfigs.ts`) currently hardcodes six sports as static config; the backend equivalent needs at minimum:

- Identity: a stable key/slug, display name, category (`team` today; `event` reserved for Sprint 5+).
- Selection mode: `formation` (players placed into fixed positions) vs `role` (players hold a role and an order, no fixed position) vs the reserved `event` mode (see section 10).
- Terminology: starting-lineup label ("Starting XI" / "Starting Five" / "Starting Seven"), bench label ("Substitutes" / "Bench" / "Replacements" / "Reserves"), surface label ("Pitch" / "Court" / "Ground").
- Captaincy flags: whether this sport supports a captain, and separately a vice-captain.
- Which organisation/club sections (see section 2) currently run this sport — a sport isn't necessarily active for every club.

## 2. Sport-scoped Teams/Squads

Every team already belongs conceptually to one sport (the frontend derives this from its roster today, purely as a mock-data convenience — the real model should make it explicit). A club fielding six sports has six independent sets of squads (e.g. "1st XI" means something different in cricket vs football), so:

- `Team.sport` is required, not inferred.
- A member can plausibly belong to more than one sport's teams (a genuine multi-sport athlete) — the frontend's mock data keeps this 1:1 per member for simplicity, but the real model should not assume it.

## 3. Sport-specific Positions / Player Roles

This is the crux of the multi-sport architecture. Two genuinely different shapes exist and the backend needs to support both without forcing one into the other:

**Formation positions** (football, basketball, rugby union, rugby sevens, hockey): a position has a key, a full label, a short label, and — for team-sheet display — a coordinate on that sport's surface. A formation is an ordered set of position slots (e.g. football's 4-3-3 is 11 slots, each tied to a position and a surface coordinate).

**Roles** (cricket, and any future role-based sport): a role has a key and a label but *no coordinate* — Wicketkeeper / Batter / Bowler / All-rounder describe what a player does, not where they stand. A role-based "formation" is just an ordered list (batting order) with no coordinates at all.

Both shapes need: a `sport` they belong to, a stable key, a label, a short label. Formation positions additionally need `x`/`y` (or equivalent) per slot in each formation the sport supports.

## 4. Member Primary/Secondary Positions or Roles

- `Member.primaryPosition` / `Member.secondaryPositions`: currently one flat field pair, sport-scoped only by convention (the frontend trusts that whatever key is stored is valid for whatever sport the member is currently being selected for). For a member genuinely registered across multiple sports, this needs to become sport-scoped explicitly — e.g. one primary/secondary pair *per sport* the member plays, not one pair total.
- Eligibility (which positions/roles a member could plausibly fill) is currently computed client-side as "primary + secondary, or a fallback bucket mapping if neither is set." The backend doesn't need to compute this — it's presentation logic — but it does need to expose primary/secondary reliably per sport so the frontend can keep doing so.

## 5. Fixtures — sport field required

Already true in Sprint 3 (`Fixture.sport`), now load-bearing rather than a nullable extra: every fixture must resolve to exactly one `SportConfig`, since selection mode, terminology, and eligibility all key off it.

## 6. Availability — unchanged in shape, scoped by fixture as before

No new requirement here — availability is already per-fixture, per-member, tri-state. Multi-sport doesn't change this; it just means more fixtures exist across more sports, each with its own availability set.

## 7. Team Selections / Formation Configurations / Starting Players / Bench

Sprint 3's `TeamSelection` shape (fixture, sport, formation, starters, bench, status, published timestamp) extends cleanly:

- `formationId` for role-based sports still resolves to something (a "Playing XI" pseudo-formation, in the frontend's implementation) — the backend equivalent can either model role-based sports the same way (a formation-like object whose slots have no coordinates) or introduce a distinct `RoleLineup` entity. The frontend's choice was to reuse one shape rather than fork the whole selection model — a real backend team should weigh that same tradeoff, but either way the two must be reconcilable into what the frontend's `TeamSelection` type expects.
- Starters are `{ member, slot/order, overrideUnavailable }` — unchanged.
- Bench/substitutes/replacements/reserves are an ordered list of members not tied to a slot — unchanged in shape; only the label differs per sport.

## 8. Captaincy

New this sprint, generic (not cricket-specific): a `TeamSelection` can optionally carry a `captainId` and, separately, a `viceCaptainId`, gated by whether the sport supports each (`SportConfig.supportsCaptain` / `supportsViceCaptain`). Today that's Rugby Sevens (captain only) and Cricket (both). The backend should model captain/vice-captain as optional references to a selected starter, validated server-side against "is this member actually in the starting lineup" the same way the frontend does client-side.

## 9. Cricket Batting Order

Represented in the frontend purely as slot order within the role-based "formation" — no separate field. If the backend models role-based lineups as their own entity (see section 7), batting order is simply the persisted order of that entity's slots; no new concept is needed beyond "this list is ordered and the order is meaningful," which batting order, running order, and relay legs (see section 10) all share.

## 10. Published Team Sheets

No new backend requirement beyond what Sprint 3 already described (a `status: Draft | Published` plus `publishedAt`) — publishing a role-based sheet vs a formation-based one is a frontend rendering difference only (see `exportSvg.ts`'s two branches), not a data-shape difference.

## 11. Sport-specific Permissions

Not built this sprint (no auth/permissions exist anywhere in this prototype yet — see Sprint 1's technical audit, section 7). Flagging for when permissions are eventually designed: a club running six sports plausibly wants a team manager scoped to *one* sport's teams, not every sport's — e.g. the Cricket 1st XI captain shouldn't be able to edit the Basketball Seniors' team sheet. Whatever role/permission model gets built (Sprint 1's audit, section E) should be able to scope by sport, not just by team, since "which sport" is now a first-class dimension of the data.

---

## 12. What Sprint 5+ Event Sports will additionally need

Not built this sprint, and deliberately not started — but documented here because the frontend's `SelectionMode` type already reserves a third value, `"event"`, for it (see `src/domain/sportConfigs.ts`'s closing comment), so it's worth the backend team seeing the shape now rather than being surprised by it later.

Athletics, Swimming, Cycling and Rowing don't fit "place a player in a formation slot" or "order a lineup" — the real workflow is:

```
Sport -> Event/Competition -> Discipline/Event -> Availability/Eligibility -> Athlete Entry -> Relay/Crew selection (where relevant) -> Publish Entry
```

That implies, conceptually:

- **Discipline/Event**: e.g. "100m", "4x100m Relay", "K1 200m" — belongs to a sport, has its own eligibility rules (age category, qualifying time, etc.) distinct from a team formation.
- **Athlete Entry**: an individual athlete entered into a specific discipline at a specific competition — closer to a fixture-scoped registration than a formation slot.
- **Relay/Crew selection**: reuses the same "ordered list of members" pattern batting order and formation slots already both use (a relay leg order, a boat's seat order) — the frontend's existing slot-order mechanism is deliberately generic enough to cover this without a redesign, which is exactly why it was built that way this sprint.
- **Publish Entry**: the same Draft/Published lifecycle every other selection already has.

None of this needs to exist yet. It's here so a future Sprint 5 backend conversation starts from "here's the shape the frontend is already built to accommodate," rather than from nothing.
