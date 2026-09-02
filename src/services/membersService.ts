// Members, the roster they roll up into as teams/squads, and member-level trend data.
import type { Member, MemberStatTrendPoint, Team } from "../domain/types";
import type { PositionKey, SportKey } from "../domain/sportConfigs";
import { useAsyncData } from "./useAsyncData";
import { createStore, nextId } from "./store";

const firstNames = ["Jack", "Tom", "Amelia", "Sophie", "Liam", "Noah", "Olivia", "Emma", "Harry", "Ava", "George", "Isla", "Leo", "Mia", "Freddie", "Grace", "Oscar", "Ruby", "Arthur", "Ella"];
const lastNames = ["Williams", "Taylor", "Smith", "Brown", "Jones", "Evans", "Roberts", "Walker", "Wright", "Green", "Hall", "Clarke", "Patel", "Khan", "Murphy", "Cooper", "Bailey", "Reed", "Hughes", "Foster"];
const teamNames = ["Seniors", "U18 Premier", "U16 Squad", "U14 Reds", "Women's First", "Academy"];
const roles = ["Player", "Captain", "Coach", "Volunteer", "Parent", "Physio"];
const positions = ["Forward", "Midfielder", "Defender", "Goalkeeper", "Winger"];

// Sprint 3 — Team Selection: each broad position bucket maps to specific
// football position keys (see domain/sportConfigs.ts) so seeded members have
// real, sport-scoped primary/secondary positions to select from. Goalkeepers
// don't get a secondary outfield position, matching how squads actually work.
const primaryByBucket: Record<string, PositionKey[]> = {
  Forward: ["ST"],
  Midfielder: ["CM", "CDM", "LM", "RM"],
  Defender: ["CB", "LB", "RB"],
  Goalkeeper: ["GK"],
  Winger: ["LW", "RW"],
};
const secondaryPoolByBucket: Record<string, PositionKey[]> = {
  Forward: ["LW", "RW"],
  Midfielder: ["CDM", "CM", "LW", "RW"],
  Defender: ["LB", "RB", "CDM"],
  Winger: ["ST", "RM", "LM"],
};

function seeded(i: number): Member {
  const name = `${firstNames[i % firstNames.length]} ${lastNames[(i * 3) % lastNames.length]}`;
  const attendance = 55 + ((i * 7) % 45);
  const participation = 40 + ((i * 11) % 60);
  const avail = i % 6 === 0 ? "red" : i % 3 === 0 ? "orange" : "green";
  const pay = i % 9 === 0 ? "Overdue" : i % 5 === 0 ? "Due" : "Paid";
  const status = participation < 55 ? "At risk" : attendance < 60 ? "At risk" : "Active";
  const bucket = positions[i % positions.length];
  const primaryOptions = primaryByBucket[bucket];
  const primaryPosition = primaryOptions[i % primaryOptions.length];
  // Roughly every 4th outfield player is also eligible for a second
  // position — enough to make multi-position selection genuinely visible
  // without every player being a wildcard.
  const secondaryOptions = secondaryPoolByBucket[bucket];
  const secondaryPositions = bucket !== "Goalkeeper" && i % 4 === 0 ? [secondaryOptions[i % secondaryOptions.length]] : undefined;
  return {
    id: `m${i + 1}`,
    name,
    team: teamNames[i % teamNames.length],
    role: roles[i % roles.length],
    ageGroup: ["Senior", "U18", "U16", "U14"][i % 4],
    membership: (i % 8 === 0 ? "Pending" : i % 13 === 0 ? "Lapsed" : "Active") as Member["membership"],
    availability: avail as Member["availability"],
    attendance,
    trainingHours: 20 + ((i * 5) % 90),
    participation,
    payments: pay as Member["payments"],
    lastActive: i % 4 === 0 ? "Today" : i % 3 === 0 ? "2d ago" : `${(i % 12) + 1}d ago`,
    status: status as Member["status"],
    allstarsId: `AS-${(10480 + i).toString()}`,
    position: bucket,
    primaryPosition,
    secondaryPositions,
    squadNumber: i + 1,
  };
}

// --- Sprint 4 — Olympic Multi-Sport Framework: real, believable seed data
// for the four new demonstration sports (football's existing 32-member
// seed above is untouched). Each sport gets its own club section, real
// fictional names (not "Player 1"), a spread of availability states, and
// real sport-scoped primary/secondary positions or roles so eligibility,
// selection conflicts and bench/replacement behaviour are all genuinely
// demonstrable — see Sprint 3's teamSheetService for how those are used.

const sportFirstNames = ["Charlie", "Maya", "Ethan", "Priya", "Finn", "Zara", "Kai", "Lucy", "Marcus", "Nina", "Theo", "Aisha", "Josh", "Bella", "Ravi", "Chloe", "Dan", "Sana", "Ben", "Poppy"];
const sportLastNames = ["Osei", "Carter", "Nguyen", "Fitzgerald", "Adeyemi", "Marsh", "Lindqvist", "Doyle", "Okafor", "Bianchi", "Sharma", "Whitfield", "Kowalski", "Devine", "Mensah", "Turner", "Farrell", "Iqbal", "Novak", "Gallagher"];

function personName(seed: number, offset: number): string {
  return `${sportFirstNames[(seed + offset) % sportFirstNames.length]} ${sportLastNames[(seed * 5 + offset) % sportLastNames.length]}`;
}

/** Same shape of variance as the football seeded() above — availability/attendance/participation/payments/status all vary by index so every sport has a genuine spread, not uniform mock rows. */
function sportMember(i: number, opts: {
  idPrefix: string;
  sport: SportKey;
  team: string;
  ageGroup: string;
  bucket: Member["position"];
  primaryPosition: PositionKey;
  secondaryPositions?: PositionKey[];
}): Member {
  const name = personName(i, opts.idPrefix.charCodeAt(0));
  const attendance = 58 + ((i * 6) % 42);
  const participation = 42 + ((i * 9) % 58);
  const avail = i % 5 === 0 ? "red" : i % 3 === 0 ? "orange" : "green";
  const pay = i % 7 === 0 ? "Overdue" : i % 4 === 0 ? "Due" : "Paid";
  const status = participation < 55 ? "At risk" : attendance < 62 ? "At risk" : "Active";
  return {
    id: `${opts.idPrefix}${i + 1}`,
    name,
    team: opts.team,
    role: i % 11 === 0 ? "Captain" : "Player",
    ageGroup: opts.ageGroup,
    membership: (i % 9 === 0 ? "Pending" : "Active") as Member["membership"],
    availability: avail as Member["availability"],
    attendance,
    trainingHours: 18 + ((i * 4) % 80),
    participation,
    payments: pay as Member["payments"],
    lastActive: i % 3 === 0 ? "Today" : `${(i % 9) + 1}d ago`,
    status: status as Member["status"],
    allstarsId: `AS-${(20000 + i).toString()}`,
    position: opts.bucket,
    sport: opts.sport,
    primaryPosition: opts.primaryPosition,
    secondaryPositions: opts.secondaryPositions,
    squadNumber: i + 1,
  };
}

// Basketball — Riverside Hawks. Two teams so Teams & Squads/Fixtures
// filtering has more than one squad to show per sport, same as football.
const basketballPrimaries: PositionKey[] = ["PG", "SG", "SF", "PF", "C"];
const basketballSeed: Member[] = Array.from({ length: 14 }, (_, i) => {
  const primary = basketballPrimaries[i % basketballPrimaries.length];
  const secondary = i % 3 === 0 ? [basketballPrimaries[(i + 1) % basketballPrimaries.length]] : undefined;
  return sportMember(i, {
    idPrefix: "bb",
    sport: "basketball",
    team: i % 2 === 0 ? "Basketball Seniors" : "Basketball U18",
    ageGroup: i % 2 === 0 ? "Senior" : "U18",
    bucket: primary === "C" ? "Goalkeeper" : primary === "PG" || primary === "SG" ? "Midfielder" : "Forward",
    primaryPosition: primary,
    secondaryPositions: secondary,
  });
});

// Rugby Sevens — Riverside Sevens. Squads of 12 in real Sevens, seeded a
// little deeper here (16) so both the Starting Seven and 5 Replacements
// have real depth/conflicts to choose from.
const sevensPrimaries: PositionKey[] = ["P1", "HK7", "P2", "SH7", "FH7", "CE7", "WG7"];
const rugbySevensSeed: Member[] = Array.from({ length: 16 }, (_, i) => {
  const primary = sevensPrimaries[i % sevensPrimaries.length];
  const secondary = i % 4 === 0 ? [sevensPrimaries[(i + 2) % sevensPrimaries.length]] : undefined;
  return sportMember(i, {
    idPrefix: "r7",
    sport: "rugbySevens",
    team: i % 2 === 0 ? "Sevens Firsts" : "Sevens Development",
    ageGroup: i % 2 === 0 ? "Senior" : "U18",
    bucket: primary === "P1" || primary === "HK7" || primary === "P2" ? "Defender" : primary === "SH7" || primary === "FH7" ? "Midfielder" : "Winger",
    primaryPosition: primary,
    secondaryPositions: secondary,
  });
});

// Field Hockey — Riverside Hockey Club.
const hockeyPrimaries: PositionKey[] = ["GK-H", "RB-H", "LB-H", "RH-H", "CH-H", "LH-H", "RW-H", "IR-H", "CF-H", "IL-H", "LW-H"];
const hockeySeed: Member[] = Array.from({ length: 16 }, (_, i) => {
  const primary = hockeyPrimaries[(i === 0 ? 0 : i) % hockeyPrimaries.length];
  const secondary = i % 4 === 1 ? [hockeyPrimaries[(i + 3) % hockeyPrimaries.length]] : undefined;
  return sportMember(i, {
    idPrefix: "hk",
    sport: "hockey",
    team: i % 2 === 0 ? "Hockey 1st XI" : "Hockey Ladies 1s",
    ageGroup: "Senior",
    bucket: primary === "GK-H" ? "Goalkeeper" : primary === "RB-H" || primary === "LB-H" ? "Defender" : primary === "RW-H" || primary === "LW-H" ? "Winger" : primary === "CF-H" || primary === "IR-H" || primary === "IL-H" ? "Forward" : "Midfielder",
    primaryPosition: primary,
    secondaryPositions: secondary,
  });
});

// Cricket — Riverside CC. Role-based, not position-based: primaryPosition
// here is a role (WK/BAT/BOWL/AR), the architectural point Sprint 4 proves
// out end to end. Roughly a realistic XI's worth of role distribution —
// mostly batters and bowlers, a couple of keepers, several all-rounders —
// across two squads.
const cricketRoleCycle: PositionKey[] = ["BAT", "BAT", "BAT", "BOWL", "BOWL", "BOWL", "AR", "AR", "WK", "BAT", "BOWL"];
const cricketSeed: Member[] = Array.from({ length: 16 }, (_, i) => {
  const primary = cricketRoleCycle[i % cricketRoleCycle.length];
  const secondary = i % 5 === 0 ? (["AR"] as PositionKey[]) : undefined;
  return sportMember(i, {
    idPrefix: "cr",
    sport: "cricket",
    team: i % 2 === 0 ? "Cricket 1st XI" : "Cricket 2nd XI",
    ageGroup: "Senior",
    bucket: primary === "WK" ? "Goalkeeper" : primary === "BOWL" ? "Forward" : primary === "AR" ? "Midfielder" : "Defender",
    primaryPosition: primary,
    secondaryPositions: secondary,
  });
});

// --- Sprint 5 — Olympic Event Sports: real, believable seed data for the
// four new demonstration event sports. Every seeded member's
// primaryPosition/secondaryPositions are event keys (see
// domain/sportConfigs.ts's SportEvent module comment) rather than
// formation positions or roles — e.g. an athlete's primaryPosition is
// "100m", not a slot key — and every seeded relay/crew specialist also
// gets that event's key as a secondaryPosition, so eventEntryService's
// eligibility check and the Team Sheet/Event Entry candidate lists have
// real, demonstrable eligible-vs-not-eligible variety, the same as every
// Sprint 4 sport.

// Athletics — Riverside Athletics Club.
const athleticsPrimaries: { key: PositionKey; bucket: string }[] = [
  { key: "100m", bucket: "Sprinter" },
  { key: "200m", bucket: "Sprinter" },
  { key: "400m", bucket: "Sprinter" },
  { key: "800m", bucket: "Middle Distance" },
  { key: "1500m", bucket: "Distance" },
  { key: "100m-hurdles", bucket: "Hurdler" },
  { key: "long-jump", bucket: "Field" },
];
const athleticsSeed: Member[] = Array.from({ length: 16 }, (_, i) => {
  const p = athleticsPrimaries[i % athleticsPrimaries.length];
  // Roughly every 3rd sprinter/hurdler also runs the relay — the same
  // "not every wildcard" spread Sprint 4's secondary positions use.
  const relayEligible = ["100m", "200m", "400m", "100m-hurdles"].includes(p.key) && i % 3 === 0;
  return sportMember(i, {
    idPrefix: "ath",
    sport: "athletics",
    team: i % 2 === 0 ? "Athletics Seniors" : "Athletics U18",
    ageGroup: i % 2 === 0 ? "Senior" : "U18",
    bucket: p.bucket as Member["position"],
    primaryPosition: p.key,
    secondaryPositions: relayEligible ? (["4x100m-relay"] as PositionKey[]) : undefined,
  });
});

// Swimming — Riverside Swim Squad.
const swimmingPrimaries: { key: PositionKey; bucket: string }[] = [
  { key: "50m-freestyle", bucket: "Freestyle" },
  { key: "100m-freestyle", bucket: "Freestyle" },
  { key: "200m-freestyle", bucket: "Freestyle" },
  { key: "100m-backstroke", bucket: "Backstroke" },
  { key: "100m-breaststroke", bucket: "Breaststroke" },
  { key: "100m-butterfly", bucket: "Butterfly" },
];
const swimmingSeed: Member[] = Array.from({ length: 16 }, (_, i) => {
  const p = swimmingPrimaries[i % swimmingPrimaries.length];
  const relayKey: PositionKey | undefined =
    p.bucket === "Freestyle" && i % 3 === 0 ? "4x100m-freestyle-relay" : i % 4 === 1 ? "4x100m-medley-relay" : undefined;
  return sportMember(i, {
    idPrefix: "sw",
    sport: "swimming",
    team: i % 2 === 0 ? "Swimming Seniors" : "Swimming U18",
    ageGroup: i % 2 === 0 ? "Senior" : "U18",
    bucket: p.bucket as Member["position"],
    primaryPosition: p.key,
    secondaryPositions: relayKey ? [relayKey] : undefined,
  });
});

// Rowing — Riverside Boat Club. Every crew event has openEligibility (see
// sportConfigs.ts's buildEventSelectionConfig), so primaryPosition here
// records a rower's specialist boat class for display/roster purposes
// rather than gating seat selection the way formation positions do.
const rowingPrimaries: { key: PositionKey; bucket: string }[] = [
  { key: "coxless-pair", bucket: "Sweep" },
  { key: "coxed-four", bucket: "Sweep" },
  { key: "quad-sculls", bucket: "Sculling" },
  { key: "eight", bucket: "Sweep" },
];
const rowingSeed: Member[] = Array.from({ length: 16 }, (_, i) => {
  const p = rowingPrimaries[i % rowingPrimaries.length];
  // One in five rowers doubles as a coxswain — a real, distinct skill.
  const coxSecondary = i % 5 === 0;
  return sportMember(i, {
    idPrefix: "rw",
    sport: "rowing",
    team: i % 2 === 0 ? "Boat Club 1st Squad" : "Boat Club Development",
    ageGroup: "Senior",
    bucket: coxSecondary ? "Cox" : (p.bucket as Member["position"]),
    primaryPosition: p.key,
    secondaryPositions: coxSecondary ? (["eight"] as PositionKey[]) : undefined,
  });
});

// Cycling — Riverside Cycling Club.
const cyclingPrimaries: { key: PositionKey; bucket: string }[] = [
  { key: "road-race", bucket: "Road" },
  { key: "time-trial", bucket: "Time Trial" },
  { key: "criterium", bucket: "Criterium" },
];
const cyclingSeed: Member[] = Array.from({ length: 14 }, (_, i) => {
  const p = cyclingPrimaries[i % cyclingPrimaries.length];
  const pursuitEligible = i % 3 === 0;
  return sportMember(i, {
    idPrefix: "cy",
    sport: "cycling",
    team: i % 2 === 0 ? "Cycling Seniors" : "Cycling Development",
    ageGroup: i % 2 === 0 ? "Senior" : "U18",
    bucket: p.bucket as Member["position"],
    primaryPosition: p.key,
    secondaryPositions: pursuitEligible ? (["team-pursuit"] as PositionKey[]) : undefined,
  });
});

const seedMembers: Member[] = [
  ...Array.from({ length: 32 }, (_, i) => seeded(i)),
  ...basketballSeed, ...rugbySevensSeed, ...hockeySeed, ...cricketSeed,
  ...athleticsSeed, ...swimmingSeed, ...rowingSeed, ...cyclingSeed,
];

type MembersState = { members: Member[]; extraTeams: string[] };

const store = createStore<MembersState>("sa2:members", () => ({ members: seedMembers, extraTeams: [] }));

const memberStatTrend: MemberStatTrendPoint[] = [
  { m: "Mar", hours: 14, sessions: 6 },
  { m: "Apr", hours: 18, sessions: 8 },
  { m: "May", hours: 22, sessions: 9 },
  { m: "Jun", hours: 19, sessions: 8 },
  { m: "Jul", hours: 26, sessions: 11 },
  { m: "Aug", hours: 31, sessions: 13 },
];

function computeTeams(): Team[] {
  const { members, extraTeams } = store.getState();
  const names = new Set([...members.map((m) => m.team), ...extraTeams]);
  return Array.from(names).map((name) => {
    const roster = members.filter((m) => m.team === name);
    const attendance = roster.length ? Math.round(roster.reduce((a, m) => a + m.attendance, 0) / roster.length) : 0;
    // Sprint 4 — every member on a real squad shares one sport in this mock
    // data, so the roster's own members.sport is authoritative; a brand
    // new empty team (just created via createTeam()) defaults to football.
    const sport = roster[0]?.sport ?? "football";
    return { name, count: roster.length, attendance, roster, sport };
  });
}

export type MemberInput = Pick<Member, "name" | "team" | "role" | "ageGroup" | "position"> & Partial<Member>;

function makeMember(input: MemberInput): Member {
  return {
    id: nextId("m"),
    membership: "Active",
    availability: "green",
    attendance: 100,
    trainingHours: 0,
    participation: 50,
    payments: "Paid",
    lastActive: "Today",
    status: "Active",
    allstarsId: `AS-${(10480 + Math.floor(Math.random() * 8000)).toString()}`,
    ...input,
  };
}

export const membersService = {
  listMembers: (): Promise<Member[]> => Promise.resolve(store.getState().members),
  getMember: (id: string | undefined): Promise<Member | undefined> =>
    Promise.resolve(store.getState().members.find((m) => m.id === id) ?? store.getState().members[0]),
  getMemberStatTrend: (): Promise<MemberStatTrendPoint[]> => Promise.resolve(memberStatTrend),
  listTeams: (): Promise<Team[]> => Promise.resolve(computeTeams()),

  addMember(input: MemberInput): Member {
    const member = makeMember(input);
    store.setState((s) => ({ ...s, members: [member, ...s.members] }));
    return member;
  },

  updateMember(id: string, patch: Partial<Member>) {
    store.setState((s) => ({ ...s, members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));
  },

  reassignTeam(memberId: string, team: string) {
    membersService.updateMember(memberId, { team });
  },

  removeFromTeam(memberId: string, fallbackTeam = "Unassigned") {
    membersService.updateMember(memberId, { team: fallbackTeam });
  },

  createTeam(name: string) {
    store.setState((s) => (s.extraTeams.includes(name) ? s : { ...s, extraTeams: [...s.extraTeams, name] }));
  },
};

export function useMembers() {
  return useAsyncData(membersService.listMembers, [store.useStore()]);
}

export function useMember(id: string | undefined) {
  return useAsyncData(() => membersService.getMember(id), [id, store.useStore()]);
}

export function useMemberStatTrend() {
  return useAsyncData(membersService.getMemberStatTrend);
}

export function useTeams() {
  return useAsyncData(membersService.listTeams, [store.useStore()]);
}
