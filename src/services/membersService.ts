// Members, the roster they roll up into as teams/squads, and member-level trend data.
import type { Member, MemberStatTrendPoint, Team } from "../domain/types";
import type { PositionKey } from "../domain/sportConfigs";
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

const seedMembers: Member[] = Array.from({ length: 32 }, (_, i) => seeded(i));

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
    return { name, count: roster.length, attendance, roster };
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
