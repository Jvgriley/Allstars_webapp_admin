// Members, the roster they roll up into as teams/squads, and member-level trend data.
import type { Member, MemberStatTrendPoint, Team } from "../domain/types";
import { useAsyncData } from "./useAsyncData";

const firstNames = ["Jack", "Tom", "Amelia", "Sophie", "Liam", "Noah", "Olivia", "Emma", "Harry", "Ava", "George", "Isla", "Leo", "Mia", "Freddie", "Grace", "Oscar", "Ruby", "Arthur", "Ella"];
const lastNames = ["Williams", "Taylor", "Smith", "Brown", "Jones", "Evans", "Roberts", "Walker", "Wright", "Green", "Hall", "Clarke", "Patel", "Khan", "Murphy", "Cooper", "Bailey", "Reed", "Hughes", "Foster"];
const teamNames = ["Seniors", "U18 Premier", "U16 Squad", "U14 Reds", "Women's First", "Academy"];
const roles = ["Player", "Captain", "Coach", "Volunteer", "Parent", "Physio"];
const positions = ["Forward", "Midfielder", "Defender", "Goalkeeper", "Winger"];

function seeded(i: number): Member {
  const name = `${firstNames[i % firstNames.length]} ${lastNames[(i * 3) % lastNames.length]}`;
  const attendance = 55 + ((i * 7) % 45);
  const participation = 40 + ((i * 11) % 60);
  const avail = i % 6 === 0 ? "red" : i % 3 === 0 ? "orange" : "green";
  const pay = i % 9 === 0 ? "Overdue" : i % 5 === 0 ? "Due" : "Paid";
  const status = participation < 55 ? "At risk" : attendance < 60 ? "At risk" : "Active";
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
    position: positions[i % positions.length],
  };
}

const members: Member[] = Array.from({ length: 32 }, (_, i) => seeded(i));

const memberStatTrend: MemberStatTrendPoint[] = [
  { m: "Mar", hours: 14, sessions: 6 },
  { m: "Apr", hours: 18, sessions: 8 },
  { m: "May", hours: 22, sessions: 9 },
  { m: "Jun", hours: 19, sessions: 8 },
  { m: "Jul", hours: 26, sessions: 11 },
  { m: "Aug", hours: 31, sessions: 13 },
];

function computeTeams(): Team[] {
  return Array.from(new Set(members.map((m) => m.team))).map((name) => {
    const roster = members.filter((m) => m.team === name);
    const attendance = Math.round(roster.reduce((a, m) => a + m.attendance, 0) / roster.length);
    return { name, count: roster.length, attendance, roster };
  });
}

export const membersService = {
  listMembers: (): Promise<Member[]> => Promise.resolve(members),
  getMember: (id: string | undefined): Promise<Member | undefined> =>
    Promise.resolve(members.find((m) => m.id === id) ?? members[0]),
  getMemberStatTrend: (): Promise<MemberStatTrendPoint[]> => Promise.resolve(memberStatTrend),
  listTeams: (): Promise<Team[]> => Promise.resolve(computeTeams()),
};

export function useMembers() {
  return useAsyncData(membersService.listMembers);
}

export function useMember(id: string | undefined) {
  return useAsyncData(() => membersService.getMember(id), [id]);
}

export function useMemberStatTrend() {
  return useAsyncData(membersService.getMemberStatTrend);
}

export function useTeams() {
  return useAsyncData(membersService.listTeams);
}
