# Sporting Allstars Web Admin — Backend & Database Integration Roadmap

**Purpose:** a single document for the team that owns the existing native app, its Laravel backend, and the RDS database — covering where the web admin platform stands today, where it needs to end up, and everything required to connect and launch it against the real system. This supersedes the separate `SPRINT_3/4/5_BACKEND_REQUIREMENTS.md` files and the earlier Sprint 6 roadmap draft — their content is folded in here so there's one place to work from.

**The one-sentence version:** the web app is a complete, well-architected frontend covering people, nine sports' worth of team and event selection, results, analytics, and every other screen in the product brief — and every byte of it is still mock data in the browser. There is no login, no API call, and no shared data with the native app yet. This document is the path from that to a real, integrated, launched product.

---

## 1. Where we are today

Five sprints in, all merged (or, for Sprint 5, in final review) to `main`:

- **Sprint 1 — Foundation.** Real client-side routing, a domain-types-plus-services layer (one `src/services/*.ts` module per domain, each exposing `Promise`-returning reads and a hook like `useMembers()`), strict TypeScript wired into the build, repo hygiene.
- **Sprint 2 — Functional Prototype.** A reactive store (`sessionStorage`-backed) behind most services, so actions like adding a member or logging challenge progress genuinely change the screen and persist for that browser session — but only that session, on that device.
- **Sprint 3 — Team Selection & Team Sheets.** A full Availability → Team Builder → Published Team Sheet workflow, built on a config-driven `SportConfig` registry rather than anything sport-specific.
- **Sprint 4 — Olympic Multi-Sport Framework.** Extended to five team sports total (football, rugby union, basketball, rugby sevens, hockey, cricket), with cricket proving a second selection shape (role-based batting order, no coordinates) alongside the original formation-based one. Added captaincy.
- **Sprint 5 — Olympic Event Sports.** Added athletics, swimming, rowing and cycling — sports that don't fit "place a player in a formation" — via a third selection shape and a new Competition → Event → Entry → Result workflow. Relay legs and crew boats reuse the Sprint 3/4 selection machinery rather than inventing something new.

**What that adds up to, honestly:** a large, coherent frontend — 29 screens, nine sports, people/teams/fixtures/availability/selection/entries/results/analytics — that has never made a single network call. Every number on every screen comes from a hand-seeded mock file held in browser memory. There is no login (the "JR" avatar in the header is a hardcoded string), no organisation switching that does anything, no permission boundary that's real, and nothing typed into this app has ever reached the native app's database. That's the honest starting line.

The one thing worth stressing to a backend engineer meeting this codebase for the first time: **it was deliberately built this way.** Every read in the app already goes through a service function returning a `Promise` (`membersService.listMembers()`, `competitionService.listCompetitions()`, and so on), consumed through one shared data-fetching hook. That seam exists specifically so that connecting a real backend is, for reads, a change inside those service functions only — not a rewrite of 13 page files. See section 3.

---

## 2. Where we're taking this

The destination is not "a second product with its own data." It's a second interface onto the *same* Sporting Allstars ecosystem the native app already runs on:

- The web app and the native app read and write through the **same** Laravel backend and the **same** RDS database — no parallel data store, no second user table, no second auth system.
- A club admin managing a team sheet in the web app and a coach checking availability in the native app are looking at the same live data, not two copies of it.
- Login on the web app is the same identity and (as far as practical) the same authentication mechanism the native app already uses — not a bolted-on second login system.
- Everything currently faked in this prototype (members, teams, fixtures, availability, selections, competitions, entries, results, permissions) becomes real, sourced from the backend you already run.

Getting there is a joint job: your team knows the real schema and auth mechanism; ours has already shaped the entire frontend around a seam designed to make slotting a real API in additive rather than a rewrite. Section 4 is where those two things meet.

---

## 3. The technical integration model — read side vs. write side

This distinction matters because the two halves of the app are not equally far from "done," and it changes how Sprint 6 should be sequenced.

**Reads are close to free.** `useMembers()`, `useFixtures()`, `useCompetitions()`, `useResults()` — every list/get call in the app already returns a `Promise` and flows through one hook. Today that promise resolves instantly from an in-memory seed. Pointing `membersService.listMembers()` at a real `fetch('/api/members')` call requires no change anywhere else — not the page, not the hook, not any other service. This was built this way from Sprint 1 specifically for this moment.

**Writes are real, new engineering — and there's more of them by volume than reads.** Everything that *changes* something (assigning a player to a slot, publishing a team sheet, toggling availability, entering an athlete, recording a result) is currently a synchronous function writing straight into `sessionStorage`, called directly from a click handler — not the async pattern the read side uses. Converting this is three genuinely new pieces of work, not plumbing:

1. Every mutation becomes a real async request (`POST`/`PUT`/`PATCH`) that can be slow or fail — and the UI currently has zero loading/error affordance built for that (no spinner on "Publish," no "this failed, try again").
2. There's currently no concept of two people editing the same thing at once, because state lives in one browser tab's `sessionStorage`. A real backend surfaces that immediately — two team managers open the same Team Sheet, what happens? — and needs a decided answer (optimistic updates with conflict warnings, real-time sync, or simple last-write-wins) before write integration starts, not discovered mid-build.
3. There is no auth or permissions layer anywhere yet. Every screen and every mutation currently assumes full access. That has to exist before any real write against production data is safe to ship — see section 5.

---

## 4. What we need from the backend and RDS, by domain

Each area below is classified the way we've been flagging it internally, so you can tell at a glance what's likely trivial versus what might be genuinely new work on your side:

- **EXISTING** — plausibly already modelled, in some form, in the native app's backend.
- **EXPOSE** — likely already there server-side; we just need it surfaced via an endpoint we can call.
- **EXTEND** — an existing entity needs new fields to carry what the web app needs.
- **NEW** — no native-app equivalent that we're aware of; this is new schema/work.
- **UNKNOWN** — can't classify without seeing the real schema; needs a conversation.

None of this is a request to build it all before Sprint 6 starts — it's a map of what the frontend touches, for you to compare against what already exists and tell us where the real gaps are.

### 4.1 Auth / User — see section 5 in full
A signed-in user's identity (name, avatar, role/permission set), which organisation(s) they can access and which is "current," and session/token handling matching whatever the native app already does.

### 4.2 Organisation / Club — **UNKNOWN** (multi-tenancy)
Current org name/plan/rank/participation score, shown in the top bar. The product brief describes a Governing Body → Region → League → Club → Team → Member rollup; we need to know how (or whether) that hierarchy is real in the existing system, and whether one admin user can genuinely belong to more than one club — that shapes whether every resource below needs an explicit org-scoping parameter.

### 4.3 Members — **EXISTING**, likely **EXTEND**
Identity, team/squad assignment, role (Player/Captain/Coach/Volunteer/Parent/Physio), age group, membership status, availability default, attendance/participation %, training hours, payment status, a profile photo reference. New from Sprint 3 onward: sport-scoped primary/secondary positions (see 4.6) and a squad number. Almost certainly exists in some form already; the sport-scoping of positions is the likely extension.

### 4.4 Teams / Squads — **EXISTING**, likely **EXTEND**
A team's roster, plus (new) an explicit `sport` field on the team itself rather than inferred per-fixture. Whether a member can belong to more than one team/sport is worth confirming — our mock data assumes one, but a real multi-sport athlete shouldn't be forced into that.

### 4.5 Sports — **NEW** as a first-class entity (the concepts underneath are probably not new)
Not a hardcoded enum on our side — we need: identity (key, name, category: team vs. event), selection mode (formation / role / event — see 4.9–4.11), terminology (starting-lineup label, bench label, surface label), captaincy flags, and which club sections currently run each sport.

### 4.6 Positions & Roles — **NEW** structure, **EXISTING** underlying data
Two shapes we need supported without forcing one into the other: **formation positions** (a coordinate on the sport's surface, for football/basketball/rugby/hockey) and **roles** (no coordinate, just an ordered list — cricket's batting order, and any future role-based sport). Both need a `sport`, a key, a label, a short label.

### 4.7 Fixtures — **EXISTING**, **EXTEND** (`sport` becomes load-bearing, not nullable)
Home/away, date, time, competition, venue. Every fixture must resolve to exactly one sport, since selection mode and eligibility key off it.

### 4.8 Availability — **EXPOSE**
Per-fixture, per-member, tri-state (Available/Pending/Unavailable), distinct from a member's general default. No shape change from what team-sport apps typically already track.

### 4.9 Team Selections / Team Sheets — **EXTEND**
One record per fixture: formation, who's in which slot, who's on the bench, a `status: Draft | Published` plus `publishedAt`, and (new) an optional `captainId`/`viceCaptainId` gated by whether the sport supports each. Business rules the frontend currently enforces client-side and would want the backend to also enforce: a member occupies only one slot/bench spot at a time; switching formation moves an orphaned starter to the bench rather than dropping them; an "override unavailable" flag is recorded when a manager deliberately selects an unavailable player (worth an audit trail).

### 4.10 Competitions — **NEW**
The event-sport equivalent of a Fixture, but not the same shape: a Fixture is always one game between two named sides; a Competition (a meet, gala, regatta, race day) contests several Events at once. Needs name, date, time, venue, series, sport, and which Events it contests.

### 4.11 Events / Disciplines — **NEW**, sport-scoped
"100m," "Coxless Pair," "4x100m Medley Relay." Needs identity, category (Men/Women/Mixed/Open — see 4.15), a **type** (`individual` / `relay` / `crew` — this is the field everything downstream depends on), result shape (time/distance/points, and which direction is "better"), and — for individual events — an entry cap.

### 4.12 Relay / Crew Selection — **EXTEND**, not a new entity
The single most important architectural point for your team to see: a relay's running order and a boat's crew are **not** a new backend concept. They reuse exactly the same "ordered list of members, with or without coordinates" shape the Team Selection (4.9) already covers, scoped to `(competitionId, eventKey)` instead of `(fixtureId)`. The one real question this raises: **is your Team Selection equivalent keyed generically enough to point at either a fixture or a competition+event, or is it strictly fixture-keyed today?** If the latter, that's the one place our reuse assumption might force genuinely new schema on your side — worth confirming early.

### 4.13 Individual Athlete Entries — **NEW**
Which athlete(s) are entered into a specific event at a specific competition, capped by that event's entry limit — a flat list, not a slot or an order. Needs competition, event, entered member(s), and the same Draft/Published lifecycle as everything else.

### 4.14 Results, Personal Bests, Rankings — **NEW** (Results), **derived, not stored** (PBs and rankings)
A Result is a recorded performance: competition, event, athlete(s), and a value in the event's base unit (seconds for any timed event, metres for distance, raw points otherwise). Personal bests and per-event rankings are both just computed comparisons over Results, keyed by whichever direction is "better" for that event — no separate entity required, though a denormalised PB table is a reasonable backend-side optimisation if useful at scale.

### 4.15 Athlete gender / event categories — **UNKNOWN**
The frontend models a `category` field (Men/Women/Mixed/Open) but doesn't model member gender anywhere yet — every seeded event is currently "Open." A real deployment needs genuine gender-category eligibility (most athletics/swimming/rowing/cycling competitions run separate events), which needs a decision on how member gender is captured before this is more than a placeholder.

### 4.16 Spaces posts / Stories — **EXPOSE**
A feed of posts (tag, title, body, an AI-generated flag, a status, a like count). "Stories" aren't a separate type today — just a post with a particular tag. Worth deciding whether Stories deserve their own lifecycle server-side; also worth a structured foreign key back to whatever fixture/selection/match a post references, rather than the plain-text mention the frontend currently writes into the body.

### 4.17 Permissions / roles — **UNKNOWN**, needed before any real write ships
Not built anywhere in the app yet. We need: what roles exist today for admin-side users, and how access is actually scoped (club admin vs. team manager vs. coach) — ideally scoped by sport too, since a Cricket captain shouldn't be able to edit the Basketball team sheet. This maps onto the currently-illustrative "Role Dashboards" page, which needs to become real.

---

## 5. Authentication — what we need to integrate, specifically

This is the single most important unknown blocking everything past read-only demo data, so it's worth its own section rather than folding into 4.1:

1. **Mechanism.** Laravel Sanctum (cookie/session, or token-based for the native app), Passport (full OAuth2), or something custom?
2. **Same flow as the native app, or a separate web flow?** How does the native app log in today — that's very likely what this web app should plug into rather than a parallel login system.
3. **Domain relationship.** Will the web app call the API same-origin, or cross-origin (which changes CORS and cookie-handling requirements — see section 6.3)?
4. **Token lifecycle.** Does a token/session refresh, or does it just expire and force re-login? What's the expected lifetime?
5. **What a 401 should do.** Whatever the mechanism, the web app needs a defined behaviour for an expired/invalid session (redirect to login, clear local state, etc.) — happy to align this with whatever the native app already does.

Once this is answered, Sprint 6's first real engineering phase (Phase B, section 8) is building the login screen and session handling against it — genuinely new work, and the one piece every other phase depends on.

---

## 6. Launching this web app — environment, deployment & operational requirements

This section is specifically the "while we're launching" half of the ask — what needs to be true for this web app to go live against your real systems, distinct from the data-shape questions above.

### 6.1 Hosting & build — already in place
The web app is a static Vite/React SPA, currently deployed on Vercel (`vercel.json` has the SPA rewrite rule in place for client-side routing). We recently resolved a pnpm/Vercel build-config issue (a lockfile/config mismatch from a pnpm version upgrade) — the build is currently green: `pnpm install`, `pnpm typecheck`, and `pnpm build` all pass cleanly, including a frozen-lockfile install matching Vercel's CI exactly. No server-side rendering, no Node server needed for this app itself — it's a static build served in front of your API.

### 6.2 Environment strategy — not yet built, needed for Sprint 6
Today there are no `.env` files and no `import.meta.env` references anywhere in the codebase — literally nothing is configurable yet, because there's nothing to configure. Before real integration starts we need:
- An **API base URL** the app targets, switchable between at least a staging and a production value (`VITE_API_BASE_URL` or equivalent), set per Vercel environment (Preview vs. Production).
- A **staging/sandbox backend environment** to develop and test against, entirely separate from production data.
- A **scoped, non-production API credential/user** for that staging environment — explicitly not production credentials.

### 6.3 CORS & cookies
Directly dependent on section 5's answers: if auth is cookie/session-based, the web app's domain needs to be covered by the backend's CORS and cookie (`SameSite`/domain) configuration; if token-based, this is simpler but the token storage/attachment strategy needs deciding (and should avoid `localStorage` for anything sensitive, given XSS exposure — worth a short conversation on this specifically).

### 6.4 Domain / DNS
Where does this web app live in production — a subdomain of the existing product domain, or its own? If it needs to feel like "one product" with the native app (shared cookies, shared perceived domain), that likely means a subdomain of the same root domain rather than a fully separate one; worth deciding early since it affects the CORS/cookie question above.

### 6.5 Rate limits, CORS policy, API versioning
Whatever conventions the existing backend already enforces, so the web app is built to respect them from day one rather than discovering them once it's already making requests at volume.

### 6.6 Secrets management
No secrets exist in this repo today (there's nothing to leak yet). Once real credentials are involved, they belong in Vercel's environment-variable store (scoped per environment), never committed — worth agreeing this convention explicitly before the first real API key is issued to this project.

### 6.7 Observability — a genuine gap, worth deciding before go-live
There is currently no error tracking, no request logging, and no monitoring of any kind on the frontend (nothing to monitor yet, since nothing talks to a network). Before this app is handling real writes against production data, it's worth deciding whether it should report into whatever error-tracking/monitoring the native app or backend already uses, rather than standing up something separate.

---

## 7. What we need from you — the handover checklist

Everything below gates real data integration (section 8's Phase C onward), not Sprint 6's planning or auth-scaffolding work, which can start immediately:

1. The authentication mechanism (section 5, in full).
2. API documentation or direct read access to the Laravel routes/controllers — at minimum for auth, members, teams/squads, fixtures, availability. An OpenAPI/Swagger spec is ideal; the actual route files and Eloquent models are just as useful and probably faster to produce.
3. The real database schema — migration files or a schema dump from RDS. This is usually the fastest, most unambiguous way to see the real data model, and directly answers point 4.
4. Whether the backend already models anything like Sport / Competition / Event / Entry / Result, or is currently team-sport-only — the single biggest open question Sprint 5 raises (see section 4.10–4.14).
5. A staging/sandbox environment and a scoped, non-production API credential (section 6.2).
6. The role/permission model — what roles exist today and how access is scoped (section 4.17).
7. How organisation/club/team hierarchy and multi-tenancy actually work (section 4.2).
8. Rate limits, CORS policy, API versioning conventions (section 6.5).
9. Domain/hosting intentions for this web app relative to the native app's existing domain (section 6.4).
10. A named technical point of contact for integration questions as they come up.

---

## 8. Proposed Sprint 6 phases

- **Phase A — Handover & environment.** Get the answers above; stand up `.env`/API-base-URL config. Zero risk to the current prototype.
- **Phase B — Real authentication.** Login screen, session/token handling, route guards, logout, expired-session handling — against whatever section 5 reveals.
- **Phase C — Read-side integration, domain by domain.** The "free" seam from section 3. Suggested order: Members/Teams → Fixtures/Availability → Team Selections/Team Sheets → the multi-sport config layer → Competitions/Events/Entries → Results/Rankings. Everything else (Analytics, Dashboard, Intelligence) is derived from these and follows naturally.
- **Phase D — Write-side integration.** Same order as Phase C, converting each mutation to a real async request with loading/error/optimistic-update handling — with the concurrency question from section 3 resolved as a design decision before this phase starts, not discovered per-screen.
- **Phase E — Permissions & multi-tenancy.** Wire the real role/organisation model into route guards and conditional UI; replace the illustrative "Role Dashboards" page with something real.
- **Phase F — Reconciliation pass.** This app's sport/position/formation/event keys were designed against the product brief, not the real schema, because the real schema wasn't available yet. Once section 4's answers are in, this is a dedicated pass reconciling the two — a thin mapping layer per service, not a rewrite of the frontend's types.

Phases C and D can run sport-by-sport rather than strictly domain-by-domain if that better fits how you want to sequence your own schema work — e.g. ship Members/Fixtures/Football real end-to-end first, then extend outward, rather than "every read" before "any write."

---

## 9. Open questions worth resolving together, early

1. Is your Team Selection (or equivalent) keyed generically enough to cover a relay/crew selection scoped to a competition+event, not just a fixture (section 4.12)?
2. How is member gender/category captured, if at all (section 4.15)?
3. Do Competitions live alongside Fixtures in the same operational surfaces (calendar, notifications) in the real data model?
4. Cookie/session vs. token auth, and same-domain vs. cross-origin (sections 5, 6.3, 6.4) — this one shapes several other decisions, worth settling first.
5. Where should frontend errors/monitoring report to (section 6.7)?
