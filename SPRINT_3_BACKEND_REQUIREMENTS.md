# Sporting Allstars Web Admin — Backend Requirements

**Status:** Draft, written for the existing Sporting Allstars development team. Describes what the frontend (Sprints 1–3, `sprint-3-team-sheets` branch) needs from a real backend, conceptually. It does not name, assume, or invent any existing Laravel endpoint, route, table, or field — only the data shapes and operations the UI depends on. Matching these to the real API is for the backend team, who know what already exists.

**Not committed to the tracked repository** — delivered as a standalone file per the Sprint 3 brief, pending explicit approval to commit it.

## How to read this

Each section below describes one area of the product: what the frontend needs to display, what a user action needs to persist, and the relationships/validation rules the frontend currently assumes (because they're either enforced client-side today, or implied by the mock data shapes). Every area today is served by a single frontend service module under `src/services/`, backed by an in-memory/`sessionStorage` store — see that module for the exact current shape if a section here is ambiguous. Swapping any one of these services for real API calls should not require any page component to change, by design.

---

## 1. Authentication / User

**Current state:** No real authentication exists. The app assumes a single signed-in user ("Jack Riley") baked into the UI (top-right avatar, sidebar org switcher) and one hard-coded identity used wherever "you" appears (e.g. joining a challenge, voting for Player of the Match).

**What the frontend will need:**
- A signed-in user's identity: display name, initials/avatar, and role/permission set (see §13).
- A way to know which organisation(s)/club(s) the signed-in user has access to, and which one is "current" (the org switcher in the top bar).
- Session/token handling appropriate to the real auth mechanism — out of scope for this document to specify, since Sprint 3 was explicitly told not to implement auth against a fake backend.

**Validation/business rules implied by the UI:** every mutating action in every other section below is implicitly "as the current user" — who gets attributed as the actor (e.g. "you joined this challenge", "you voted") needs a real identity behind it.

---

## 2. Organisation / Club

**Current state:** `organisationService` — a single mock organisation (name, plan, rank, participation score) shown in the top bar and used on the Dashboard.

**Reads required:** the current organisation's name, plan/tier, and any top-line stats shown on the Dashboard (rank, participation score).

**Writes required:** none yet — no organisation-editing UI exists.

**Relationships:** an organisation owns members, teams, fixtures, and everything else in this document. Multi-org support (the org switcher dropdown) is visually present but not functionally wired — worth clarifying with the backend team whether a single admin user can genuinely belong to multiple clubs/orgs, since that shapes whether every other resource below needs an explicit org-scoping parameter.

---

## 3. Members

**Current state:** `membersService` — 32 seeded mock members plus any created via the "Add member" UI.

**Data the frontend requires per member:**
- Identity: name, an internal Allstars ID.
- Team/squad assignment (a member belongs to exactly one team today — see §6 for whether that should become many-to-many).
- Role (Player / Captain / Coach / Volunteer / Parent / Physio), age group, membership status (Active/Pending/Lapsed).
- Availability default, attendance %, participation %, training hours, payment status, last-active timestamp, a computed status (Active/At risk/Inactive).
- **New in Sprint 3:** a broad position label (existing, e.g. "Forward"), a sport-scoped primary position, zero or more sport-scoped secondary positions (see §7 for how positions are scoped), a squad number, and an optional profile photo (see §4).

**Reads required:** list all members (optionally filtered/sorted — the UI currently sorts client-side, but a real backend should support server-side sort/filter for a large club); get one member by ID; get one member's activity/trend data (hours/sessions over time, currently mock).

**Writes required:** create a member; update a member's editable fields (including reassigning their team, and — new this sprint — their primary/secondary positions and squad number); no delete UI exists today.

**Validation/business rules implied:**
- A member's primary/secondary positions should be valid position keys for whatever sport(s) their team plays (see §7) — the frontend currently has no server to validate this against, so it trusts whatever's entered.
- Squad numbers are currently unenforced for uniqueness; worth deciding whether the backend should enforce per-team uniqueness.

---

## 4. Member images

**Current state:** no seeded member has a photo. Every avatar in the app falls back to initials. The `photoUrl` field exists on the Member type as of Sprint 3, but nothing populates it.

**What the frontend needs:** a URL (or equivalent reference) per member returning a photo suitable for a small circular avatar and for the Team Sheet's on-pitch player markers. The frontend already handles a broken/missing image gracefully (falls back to initials), so the backend doesn't need to guarantee an image exists — only to omit or null the field when one doesn't.

**Writes required:** an upload/attach mechanism for a member's photo doesn't exist in the UI yet — worth scoping as a future increment once the backend has a place to store it.

---

## 5. Teams / Squads

**Current state:** `membersService.listTeams()` — teams are computed client-side by grouping members by their `team` string field, plus a small set of "extra" empty teams a manager can create ahead of assigning anyone to them.

**Reads required:** list teams with their roster and a computed attendance average.

**Writes required:** create a new (initially empty) team; reassign a member to a different team; remove a member from a team (currently modelled as reassigning them to "Unassigned" — worth the backend team deciding whether that should be a real state or simply no team).

**Relationships:** a team has many members; a member (today) belongs to exactly one team. A team also implicitly has a "sport" (see §7) — the frontend does not currently store this on the team itself, only inferred per-fixture; that's worth resolving, since realistically a team plays one sport consistently.

---

## 6. Sports

**Current state — new in Sprint 3:** `sportConfigs` — a small, frontend-only, hard-coded registry of two sports (Football, Rugby Union), each describing its positions, one or more formations, bench/reserve size, and terminology (what the surface and substitutes are called). This is intentionally an architecture proof, not a claim that these are the only two sports Allstars supports.

**What the frontend will need from a real backend:**
- A list of sports the organisation actually offers.
- For each sport: its position set (§7), one or more standard formations/layouts (starting positions and their typical arrangement), bench/reserve size, and display terminology (e.g. "Pitch" vs "Court", "Substitutes" vs "Reserves").
- Ideally, which sport each team/fixture is associated with, rather than the frontend defaulting to "football" when unspecified (its current fallback).

**Validation/business rules implied:** every other Team Sheet concept below (positions, formations, eligibility) is scoped to one sport at a time — a rugby position is never compared against a football fixture, and vice versa. Whatever the backend's data model, that scoping needs to hold.

---

## 7. Positions (primary/secondary)

**Current state — new in Sprint 3:** a position is a short code (e.g. `"ST"`, `"CB"`, `"FH"`) plus a human label, scoped to one sport. A member has one primary position and zero or more secondary positions, each a valid key within some sport's position set. Where a member has no sport-specific position recorded for the sport in question (true today for every seeded member with respect to Rugby, which exists purely as an architecture demo), the frontend falls back to a coarse mapping from their general position bucket (Forward/Midfielder/Defender/Goalkeeper/Winger) — this fallback is a frontend-only approximation and should not be treated as real data; a production backend should simply provide real per-sport positions per player and this fallback logic can be retired.

**Reads required:** the position set for each sport (§6); each member's primary and secondary position(s), scoped by sport.

**Writes required:** setting/editing a member's primary and secondary positions (currently done as part of general member editing).

**Validation/business rules implied:** a "secondary position" is real eligibility, not just a label — the Team Builder actively offers a player as a candidate for any slot matching their primary or secondary position. A player should never be restricted to only their primary position when selecting a team, unless product intentionally wants that constraint later.

---

## 8. Fixtures

**Current state:** `sportService` — a small list of mock fixtures (home/away, date, time, competition, venue, and cached available/pending/unavailable counts).

**Reads required:** list fixtures; get one fixture; the available/pending/unavailable counts shown on Fixture cards (currently static seed numbers on the mock fixture, not live-derived from §9 — worth having the backend compute these from real availability records rather than caching a stale count on the fixture itself).

**Writes required:** create a fixture; update a fixture's details.

**Relationships — new in Sprint 3:** a fixture belongs to one sport (§6), which determines which Team Sheet UI/position set applies to it. A fixture has zero or one Team Selection (§10).

---

## 9. Availability

**Current state:** `sportService`'s availability store — per fixture, per member, one of Available/Pending/Unavailable. Distinct from a member's general default availability (§3), since a response can vary fixture to fixture.

**Reads required:** every member's availability response for a given fixture (defaulting to their general availability if they haven't explicitly responded).

**Writes required:** set a member's availability for a specific fixture (currently done by a manager on their behalf via the Availability screen — there's no player-facing "respond to your own availability" flow in this admin app, though presumably one exists elsewhere in the Allstars product).

**Relationships:** availability is keyed by (fixture, member) and is the single source of truth the Team Builder reads from when showing whether a candidate is Available/Pending/Unavailable for a slot.

---

## 10. Team Selections

**Current state — new in Sprint 3:** `teamSheetService` — one Team Selection per fixture, holding: which formation is in use, which member occupies which formation slot, who's on the bench, and a status (Draft/Published).

**Reads required:** get the current Team Selection for a fixture (frontend creates an empty Draft one client-side if none exists yet — a real backend presumably wants an explicit create step instead).

**Writes required:**
- Assign a member to a formation slot. **Important business rule the frontend enforces client-side:** a member can only occupy one slot (or the bench) at a time — assigning them elsewhere automatically vacates their previous slot/bench spot, and if the target slot was already occupied, that displaced player moves to the bench. The backend should enforce this same invariant server-side rather than trusting the client.
- Remove a member from a slot (returns them to the general candidate pool, not the bench).
- Add/remove a member to/from the bench.
- Switch formation (if a sport offers more than one) — the frontend's rule: any starter whose slot doesn't exist in the new formation is moved to the bench rather than dropped, so a formation change never silently loses a selected player. Worth the backend adopting the same rule, or making its own decision and telling the frontend team so the UI can be adjusted.
- Reset a selection (clears starters and bench, reverts to Draft).
- Publish a selection (see §11) / revert a published selection back to Draft for editing.
- **Not implemented, worth deciding:** an explicit "override" flag is recorded when a manager deliberately selects a player who marked themselves unavailable (§9) — the frontend keeps this as a per-selection boolean today (`overrideUnavailable`); a real backend should probably keep an audit trail of who overrode what and when, since this is exactly the kind of decision a club might want to review later.

**Relationships:** a Team Selection belongs to exactly one fixture and references a formation (§6) and a set of members (§3) via their slot/bench placement.

---

## 11. Team Sheets / publish status

**Current state:** "Team Sheet" and "Team Selection" are the same underlying record in the frontend today — `status: "Draft" | "Published"` on the Team Selection is the entire distinction between the management view (Team Builder) and the clean, publicly-presentable view (Published Team Sheet).

**Reads required:** the published status of a selection, and (implied) a `publishedAt` timestamp.

**Writes required:** publish (Draft → Published); unpublish/edit (Published → Draft, preserving the existing selection so a manager can tweak and republish).

**Worth the backend team's input on:** whether "published" should mean anything more than an internal flag — e.g. should a published team sheet become visible to players/parents in a different (non-admin) Allstars surface? The admin frontend has no visibility into whether such a consumer-facing view exists or is planned.

---

## 12. Bench / substitutes

Covered functionally under §10 (Team Selections) — a bench is simply an ordered list of member IDs on the same Team Selection record, not tied to a formation slot. Called out separately here only because the Sprint 3 brief listed it as its own concern: there is no additional data shape beyond "which members, in what order, are on the bench for this fixture's selection."

---

## 13. Spaces posts / Stories

**Current state:** `spacesService` — a single feed of posts, each with a tag (e.g. "TEAM NEWS", "MATCH HIGHLIGHT", "MATCHDAY STORY"), title, body, an `ai` flag (whether it was AI-generated vs manually authored), a status (Published/Awaiting approval/Scheduled), and a like count. "Stories" are not a separate data type in the frontend today — a Story is simply a Spaces post with a distinguishing tag, created from various places in the app (Live Centre's Control Room, and now the Team Sheet's "Create Story" action). Worth the backend team deciding whether Stories deserve to be a genuinely separate resource with different lifecycle/expiry rules (as they typically do on other platforms), since the frontend has been treating them as "just a post" purely for mock-data convenience.

**Reads required:** list posts/stories, optionally filtered by status.

**Writes required:** create a post (from several different flows across the app: manual composition, "Post to Spaces" from Live Centre and Team Sheet, "Create Story"); approve a pending post; edit an existing post.

**Relationships:** a post can reference other entities loosely via its body text today (e.g. a Team Sheet's starting lineup is written into the post body as plain text) — there's no structured reference from a Spaces post back to the fixture/selection/match it came from. A real backend likely wants that as a proper foreign key so a published post can deep-link back to its source.

---

## 14. Permissions / roles

**Current state:** not implemented. The Admin section's "Role Dashboards" page shows example role-based views (Coach, Committee, Safeguarding Officer, etc.) but everything in the app is currently accessible to the single mock signed-in user regardless of role.

**What the frontend will need eventually:** per-user role(s) and whatever permission model the backend uses to gate actions — at minimum, enough to know whether the current user can: edit members, manage fixtures/availability, build and publish team sheets, approve Spaces content, and access commercial/financial screens. None of this is enforced today; every screen assumes full access.

---

## Cross-cutting notes for the backend team

- **Nothing above is a request to build all of this at once.** It's a map of what the current frontend touches, so the team building the real API can compare it against what already exists in the Laravel backend and identify genuine gaps versus places where the frontend can simply be pointed at existing endpoints.
- **Every mock service already has the exact shape being described here** — `src/services/*.ts` and `src/domain/types.ts` (plus, new this sprint, `src/domain/sportConfigs.ts`) are the literal, precise contract the frontend currently assumes. Treat this document as the narrative version of those files, not a replacement for reading them.
- **The frontend's job when a real backend arrives is to swap the inside of these service functions** (e.g. `membersService.listMembers()`) for real network calls returning the same shapes — no page component should need to change. If a real API's shape differs meaningfully from what's described here, that's exactly the kind of mismatch this document is meant to surface early.
