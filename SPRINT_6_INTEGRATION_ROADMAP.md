# Sporting Allstars Web Admin — Sprint 5 → Sprint 6: Integration Roadmap

**Purpose of this document:** a clear, honest account of what's actually been built (Sprints 1–5), and a concrete plan for Sprint 6 — moving from a frontend-only prototype to a platform that reads and writes real data through the existing Laravel backend and RDS database. Written to be handed to the team that owns that backend and native app, as well as to plan Sprint 6 itself.

**The one-sentence summary:** everything described below — every screen, every sport, every entry list, every insight card — is still running entirely on mock data held in the browser. Nothing in this app has ever made a network call to a real backend, and there is no login. Sprint 6 is where that changes.

---

## Part 1 — What's done (Sprints 1–5)

### Sprint 1 — Foundation
Turned a static Figma Make export into a real, if still mock-data-only, single-page app: real client-side routing (every screen has a shareable URL, deep links and back/forward work), a domain-types-plus-services layer (one `src/services/*.ts` module per domain area — Members, Fixtures, Finance, and so on — each exposing `Promise`-returning read functions and a React hook, e.g. `useMembers()`), strict TypeScript wired into the build (`tsc --noEmit` fails the build on a type error), removed a large amount of dead/unused dependency weight (a second, entirely unused UI framework), and general repo hygiene. Merged to `main`.

### Sprint 2 — Functional Prototype
Made the app genuinely interactive within the browser: a small generic reactive store (`src/services/store.ts`, built on `useSyncExternalStore` + `sessionStorage`) sits behind most services now, so actions like adding a member, editing a fixture, logging challenge progress, or approving a Spaces post actually change what's on screen and persist for that browser session (not across devices, not across a cleared session — there is still no server). Every domain area gained real add/edit/toggle interactions behind this pattern. Merged to `main`.

### Sprint 3 — Team Selection & Team Sheets
The first genuinely complex feature: a full Availability → Team Builder → Published Team Sheet workflow, built on a config-driven `SportConfig` registry (`src/domain/sportConfigs.ts`) rather than anything sport-specific — football and Rugby Union both run through identical components, proving the architecture before a third sport was ever added. Introduced position eligibility, availability-aware player selection, captaincy-shaped groundwork, deterministic "Allstars Intelligence" insight cards, and a dependency-free SVG export for a downloadable team sheet graphic. Merged to `main`.

### Sprint 4 — Olympic Multi-Sport Framework
Extended the Sprint 3 architecture to Basketball, Rugby Sevens, Field Hockey and Cricket — five team sports total, all sharing one `TeamSheetPage`/`Pitch`/`SlotChip`/`teamSheetService` implementation, with Cricket proving out a second selection shape (`role`-based batting order, no surface coordinates, alongside the original `formation`-based one). Added a global Sport Selector, sport-scoped rosters, generic captain/vice-captain support, and per-sport demo data. Merged to `main`.

### Sprint 5 — Olympic Event Sports, Athlete Entry & Results Engine
Added Athletics, Swimming, Rowing and Cycling — sports that don't fit "place a player in a formation," so this sprint activated a third selection shape (`event`) and a new `Sport → Competition → Event → Entry` workflow, distinct from the Fixture/Team Sheet flow every other sport uses. Individual events (100m, freestyle strokes, Road Race) get a capped entry-list flow; relay legs and rowing crews reuse the Sprint 3/4 Team Selection machinery unchanged via a synthetic per-event configuration, rather than inventing a second selection system. Added a results engine (recorded performances, personal bests, per-event rankings). Complete and verified locally on branch `sprint-5-event-sports` — **not yet pushed or merged**, awaiting your review.

### What this adds up to
Five sprints in, this is a large, coherent, well-architected frontend covering people/teams, nine sports' worth of selection and entry workflows, availability, results, analytics, and every other screen in the original product brief (finance, live streaming, content, commercial, admin — see the Sprint 1 technical audit for the full 29-screen inventory). It is **still, entirely, a frontend prototype.** Every number on every screen comes from seeded mock data held in each browser tab's memory/`sessionStorage`. There is no login, no user, no organisation, no permission boundary that's real — the "JR" avatar in the header is a hardcoded string. Nothing has ever been read from or written to the real Laravel backend or the RDS database. That's the honest starting line for Sprint 6.

---

## Part 2 — What "integration" actually means for this codebase

This matters because the answer isn't uniform across the app — some of it is a near-trivial swap, some of it is real new engineering. Two genuinely different situations exist side by side:

**The read side is already shaped for this, on purpose.** Every "list X" / "get X" call a page uses (`useMembers()`, `useFixtures()`, `useCompetitions()`, `useResults()`, and so on) already returns a `Promise` and is consumed through one shared hook (`useAsyncData`). Today that promise resolves instantly from an in-memory seed; swapping the inside of, say, `membersService.listMembers()` for a real `fetch('/api/members')` call requires **no change anywhere else** — not in the page component, not in the hook, not in any other service. This was deliberately built this way from Sprint 1 onward, specifically so this moment wouldn't require touching every screen.

**The write/mutation side is not a free swap, and there's more of it than the read side by volume.** Everything built across Sprints 2–5 that *changes* something — assigning a player to a slot, publishing a team sheet, toggling availability, entering an athlete, recording a result — is a synchronous, void-returning function call straight into the local `sessionStorage`-backed store, called directly inside render and click handlers, not through the async/Promise pattern the read side uses. That was the right call for a fast, offline-capable prototype, but it means three real pieces of new work land in Sprint 6, not just plumbing:

1. Every one of those mutation functions needs to become a real async request (fire a `POST`/`PUT`/`PATCH`, wait for a response), which the UI currently has no loading/error state built around at all — no spinner on "Publish," no "this failed, try again."
2. Because state currently lives in each browser tab's own `sessionStorage`, there is no existing concept of two people editing the same thing at once. A real backend introduces that question immediately (two team managers open the same Team Sheet — what happens?), and the frontend doesn't have an answer built in yet. This needs an explicit decision (optimistic updates with conflict warnings, real-time sync, simple last-write-wins, etc.) before write-integration starts, not discovered partway through it.
3. There is no auth or permissions layer anywhere in the app. Every screen and every mutation currently assumes it's you, with full access to everything. That has to exist before *any* real write against production data is safe to ship.

---

## Part 3 — What's needed from the backend/native app team before Sprint 6 can really start

None of this blocks starting Sprint 6's *planning* or its auth-scaffolding work — but real data integration (Part 4, Phase C onward) is gated on getting this from whoever owns the Laravel backend and the RDS database:

1. **The actual authentication mechanism.** You mentioned you'll find this out — this is the single most important unknown. Specifically: is it Laravel Sanctum (cookie/session-based, or token-based for the native app), Passport (full OAuth2), or something custom? Same-domain or would this web app call it cross-origin (changes CORS/cookie handling)? Does a token refresh, or does it just expire and force re-login? How does the native app currently log in — that flow is very likely what this web app needs to plug into, not a separate one.

2. **API documentation, or direct read access to the Laravel routes/controllers.** At minimum for: users/auth, members, teams/squads, fixtures, availability — the entities every other domain in this app references. An OpenAPI/Swagger spec is ideal; failing that, the actual route files and Eloquent models are just as useful and probably faster to produce than writing a spec from scratch.

3. **The real database schema — migration files, or a schema dump, from the RDS database.** For a Laravel app this is usually the fastest, most unambiguous way to see the real data model (table names, columns, types, foreign keys) — more concrete than a hand-written API doc, and it directly answers the next question:

4. **Whether the native backend already models anything like Sport / Competition / Event / Entry / Result at all**, or whether it's currently football/team-sport-only. This is the single biggest open question Sprint 5 raises: if Athletics/Swimming/Rowing/Cycling and their competition/entry/results concepts don't exist in the real schema yet, that's new backend schema and migration work on their side, not just "expose an existing endpoint" — worth knowing early so it can be scoped and sequenced realistically, rather than discovered mid-integration.

5. **A staging/sandbox environment and a scoped, non-production API credential** for this app to develop and test against.

6. **The role/permission model** — what roles exist today for admin-side users, and how access is actually scoped (a club admin vs a team manager vs a coach). This app's screens currently show everything to everyone; that needs to map onto whatever the real system already enforces.

7. **How organisation/club/team hierarchy and multi-tenancy work in the real system** — the product brief describes a Governing Body → Region → League → Club → Team → Member rollup; this app needs to map onto whatever structure actually exists rather than assuming its own.

8. **Rate limits, CORS policy, and API versioning conventions**, so the web app respects them from day one.

9. **A named technical point of contact** for questions that come up once integration work starts.

Every `SPRINT_3/4/5_BACKEND_REQUIREMENTS.md` document already sitting (untracked) in this repo's root was written specifically to make handing this list over easier — each one describes, per feature area, what shape of data the frontend needs, classified against what's likely to already exist (EXISTING / EXPOSE / EXTEND / NEW / UNKNOWN in the Sprint 5 doc). Worth sending those three files to the backend team directly rather than re-deriving their contents in conversation.

---

## Part 4 — Proposed Sprint 6 phases

**Phase A — Handover & environment.** Get the answers in Part 3. Stand up whatever local/staging config (`.env`, API base URL) this app needs to talk to a real environment. Zero risk to the current prototype — pure setup.

**Phase B — Real authentication.** Build the login screen, wire it to whatever mechanism Phase A reveals, add token/session storage and attach it to outgoing requests, add route guards that redirect to login when unauthenticated, add logout, add global handling for an expired/401 session. This is genuinely new work (nothing here today), and it's the one piece every subsequent phase depends on.

**Phase C — Read-side integration, domain by domain, highest-value first.** Swap mock implementations for real API calls behind the existing service functions — the "free" seam described in Part 2. Suggested order, each a natural extension of the last: Members/Teams → Fixtures/Availability → Team Selections/Team Sheets → the multi-sport config layer (Sprint 4) → Competitions/Events/Entries (Sprint 5) → Results/Rankings. Everything else in the app (Analytics, Dashboard, Intelligence) is derived from these, so they follow naturally once the underlying entities are real.

**Phase D — Write-side integration.** Domain by domain, following the same order as Phase C: convert each synchronous mutation (assign a player, toggle availability, publish, enter an athlete, record a result) into a real async request with proper loading/error/optimistic-update handling. This is where the concurrency question from Part 2 needs a real, decided answer — worth resolving as a design decision before this phase starts, not per-screen as it's discovered.

**Phase E — Permissions & multi-tenancy.** Wire the role/organisation model from Phase A into route guards and conditional UI, replacing the currently-illustrative "Role Dashboards" page with something real.

**Phase F — Reconciliation pass on Sprint 4/5's invented shapes.** This app's sport/position/formation/event keys (e.g. `"4x100m-relay"`, `"coxless-pair"`, `SelectionMode: "role"`) were designed against the *product brief*, not against the real schema, because the real schema wasn't available. Once Phase A's answers are in, this is a dedicated pass to reconcile the two — likely a thin mapping layer in each service's real implementation, translating between whatever the backend actually returns and the UI-shaped types this app already expects, rather than a rewrite of the frontend types themselves (the whole point of the domain-types layer from Sprint 1 is to make that possible).

Phases C and D can run sport-by-sport rather than strictly domain-by-domain if that's a better fit for how the backend team wants to sequence their own schema work — e.g., ship real Members/Fixtures/Football first end-to-end, then extend outward, rather than "read for everything" before "write for anything."
