# Sprint 5 — Olympic Event Sports, Athlete Entry & Results Engine: Backend Requirements

**Status:** Conceptual data/API requirements only. No Laravel endpoints invented, no backend contacted, no assumptions about the existing schema beyond what Sprints 3 and 4's documents already assumed. This extends those documents rather than replacing them — every entity they described (Members, Teams, Fixtures, Availability, Team Selections, Team Sheets, Sports, sport-scoped positions/roles, captaincy) still applies unchanged. What follows is what Event Sports (Athletics, Swimming, Rowing, Cycling) add on top, plus the net-new concepts (Competitions, Events/Disciplines, Athlete Entries, Results, Personal Bests, Rankings).

This is intentionally still shaped around what the *frontend* needs, not a guessed backend schema — see Sprint 3's document, section 14 of the technical audit, for why. Each section below is classified against the existing backend surface the way the brief asked:
- **EXISTING** — this concept plausibly already exists in some form (e.g. as part of Users/Members/Clubs).
- **EXPOSE** — likely already modelled server-side; the frontend just needs it surfaced via an endpoint.
- **EXTEND** — an existing entity (Sprint 3/4's) needs new fields.
- **NEW** — a genuinely new entity with no Sprint 1–4 equivalent.
- **UNKNOWN** — can't be classified without seeing the real schema; flagged for a real backend conversation.

---

## 1. Competitions — **NEW**

The Event Sports equivalent of a Fixture (see Sprint 3's document, section 5), but not modelled as one: a Fixture is always exactly one game between two named sides; a Competition (a meet, gala, regatta or race day) contests several Events at once. Needs at minimum: name, date, time, venue, which meet/series it belongs to, which sport, and which of that sport's Events it contests. See `src/domain/types.ts`'s `Competition` type and `src/services/competitionService.ts`.

A club running Fixtures and Competitions side by side (a football club that also runs an athletics section, say) needs both to roll up into the same calendar/operations surfaces Sprint 2's Calendar already has — that's a presentation-layer merge the frontend can do once both are exposed, not a reason to force one shape into the other.

## 2. Sport Events / Disciplines — **NEW**, sport-scoped like Sprint 4's positions

Sprint 4's `SportConfig.selectionMode` reserved a third value, `"event"`, specifically for this. An Event ("100m", "Coxless Pair", "4x100m Medley Relay") belongs to a sport and needs:

- Identity: key/slug, label, category (Men/Women/Mixed/Open — modelled but not yet meaningfully used, since this prototype doesn't model athlete gender; see section 10).
- **Type** — the one field that changes everything downstream: `individual` (one athlete, capped entry), `relay` (an ordered running order, no fixed layout), or `crew` (a boat's seats, which DO have a real layout — bow to stroke, cox to the side).
- Result shape: `resultType` (time / distance / points) and `rankingDirection` (lower-is-better for every timed event; higher-is-better for distance/points) — see section 6.
- For `individual` events: an entry limit (how many athletes the club may enter per competition — see section 4).
- For `relay`/`crew` events: how many legs/seats, and what each is called (a relay's legs are interchangeable "Leg 1..N"; a Medley relay's leg order is fixed by rule; a boat's seats run bow→stroke with a distinct cox role) — see `src/domain/sportConfigs.ts`'s `SportEvent` type.

## 3. Relay/Crew Selection — **EXTEND** (reuses Team Selections, section 7 of the Sprint 4 doc), not a new entity

This is the frontend's central Sprint 5 architectural decision, worth the backend team seeing explicitly: a relay's running order and a boat's crew are NOT modelled as anything new. They reuse exactly the same "ordered list of members, some with surface coordinates, some without" shape Sprint 4's Team Selection already covers (see `src/domain/sportConfigs.ts`'s `buildEventSelectionConfig`, which builds a synthetic per-event sport configuration on the fly). A relay leg order is Cricket's role-based batting order under another name; a boat's seats are a formation with seat coordinates instead of pitch coordinates, cox included as a genuinely distinct position rather than another seat.

Practically: the backend doesn't need a new "RelayEntry" or "CrewEntry" table. A Team Selection scoped to `(competitionId, eventKey)` instead of `(fixtureId)` is sufficient, provided the backend's selection entity is keyed generically enough to point at either. If the real schema keys Team Selections strictly by fixture, that's the one genuine schema question worth raising early (see section 11).

## 4. Individual Athlete Entries — **NEW**

For `individual`-type events only (see section 2): which athlete(s) the club has entered into a specific event at a specific competition, capped by that event's entry limit. Not tied to a slot or an order — just a flat, capped list. Needs: competition, event, the entered member(s), a Draft/Published status (the same lifecycle every other selection in this app already has — see section 7). See `src/services/eventEntryService.ts`.

## 5. Athlete Eligibility for Events — **EXTEND** (reuses Sprint 4's primary/secondary positions, section 4 of that doc)

Sprint 4's `Member.primaryPosition`/`secondaryPositions` are reused unchanged in shape for Event Sports — they simply hold Event keys ("100m", "long-jump") instead of formation positions for an athlete registered to an event sport. The same sport-scoping caveat Sprint 4's document raised (one primary/secondary pair per sport a member plays, not one pair total) applies identically here; nothing new to design, just to note that the *values* stored differ by sport category.

## 6. Results — **NEW**

A recorded performance: which competition, which event, which athlete(s) (one for `individual`, several/ordered for `relay`/`crew`), and a value in the event's base unit (seconds for every timed event regardless of distance, metres for distance, raw points for points — see `src/services/resultsService.ts`'s `formatResultValue` for why: ranking and comparison never need to special-case a specific event by name this way, only by its `resultType`/`rankingDirection`). A result belongs to one competition+event; a boat/relay result carries every crew member who earned it, not just the fastest leg.

## 7. Published Entries/Selections — **EXPOSE** (unchanged shape from Sprint 3's document, section 10)

Individual entries and relay/crew selections both get the same Draft/Published lifecycle (a `status` plus `publishedAt`) every other selection in this app already has. No new backend requirement — publishing an entry list vs a relay order vs a boat's crew is a frontend rendering difference only (see `src/app/components/teamsheet/exportSvg.ts`'s branches), not a data-shape difference.

## 8. Personal Bests — **NEW** (derived, not stored)

Not a distinct backend entity — a personal best is simply "this athlete's best recorded Result for this event," computed by comparing values via the event's `rankingDirection` (min for time/lower-better, max for distance/points/higher-better). The frontend computes this from Results on read (`resultsService.getPersonalBests`); a real backend could either do the same on read or maintain a denormalised PB table for performance at scale — either is compatible with what the frontend expects (one best value per athlete per event).

## 9. Event Rankings — **NEW** (derived, not stored)

Per competition+event, every recorded Result ranked best-first by `rankingDirection`. Same "derived from Results, not its own stored entity" note as Personal Bests above. Distinct from the pre-existing club-vs-club league table (`Ranking` type, Sprint 1) — that's a different concept (club standing) this sprint deliberately didn't touch or try to unify with athlete-level event rankings.

## 10. Athlete Gender / Event Categories — **UNKNOWN**

`SportEvent.category` (Men/Women/Mixed/Open) is modelled in the type but every seeded Sprint 5 event is `"Open"` — this prototype doesn't model member gender anywhere (Sprint 1–4 didn't either; "Women's First" exists only as a team *name* string). A real Event Sports deployment will need real gender-category eligibility (most athletics/swimming/rowing/cycling competitions run separate Men's/Women's/Mixed events), which needs a real decision on how member gender is captured before this field can be more than decorative. Flagging rather than guessing.

## 11. Sport-specific Permissions — **EXPOSE** (unchanged from Sprint 4's document, section 11)

No new requirement — the same "a manager scoped to one sport's teams" flag Sprint 4 asked for extends naturally to "one sport's competitions," since Competition already carries a `sport` field the same way Team/Fixture do.

---

## Open questions for a real backend conversation

1. **Are Team Selections keyed generically enough to cover a relay/crew selection scoped to `(competitionId, eventKey)`, not just `(fixtureId)`** (see section 3)? This is the one place a strict existing schema constraint could force a real new entity where the frontend currently gets away with reuse.
2. **Gender/category modelling** (see section 10) — needed before Event categories are more than a placeholder.
3. **Where do Competitions live relative to Fixtures in the real data model** — same club-operations rollup (Calendar, Car Pooling-equivalent, notifications) most likely, but worth confirming rather than assuming.
