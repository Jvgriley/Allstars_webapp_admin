// Shared mock data for the Sporting Allstars web platform.
// Everything in the app reads from here so the product feels like one connected ecosystem.

export const org = {
  name: "Riverside FC",
  plan: "Allstars Club",
  rank: 7,
  participationScore: 87,
};

export const kpis = [
  { id: "members", label: "Active Members", value: "1,284", delta: "+6.4%", up: true },
  { id: "active", label: "Active This Month", value: "1,042", delta: "81%", up: true },
  { id: "revenue", label: "Monthly Revenue", value: "£18,420", delta: "+12%", up: true },
  { id: "attendance", label: "Training Attendance", value: "84%", delta: "+4%", up: true },
  { id: "rank", label: "Allstars Club Rank", value: "#7", delta: "+3", up: true },
  { id: "score", label: "Participation Score", value: "87/100", delta: "Top 10%", up: true },
];

export const revenueTrend = [
  { month: "Feb", revenue: 12400, attendance: 74 },
  { month: "Mar", revenue: 13900, attendance: 77 },
  { month: "Apr", revenue: 14600, attendance: 79 },
  { month: "May", revenue: 15800, attendance: 80 },
  { month: "Jun", revenue: 16200, attendance: 82 },
  { month: "Jul", revenue: 17100, attendance: 83 },
  { month: "Aug", revenue: 18420, attendance: 84 },
];

export const participationTrend = [
  { week: "W1", u16: 68, u18: 72, seniors: 61 },
  { week: "W2", u16: 71, u18: 74, seniors: 63 },
  { week: "W3", u16: 76, u18: 73, seniors: 66 },
  { week: "W4", u16: 82, u18: 78, seniors: 69 },
  { week: "W5", u16: 88, u18: 80, seniors: 71 },
  { week: "W6", u16: 94, u18: 83, seniors: 74 },
];

export type Insight = {
  id: string;
  kind: "OPPORTUNITY" | "TREND" | "COMMERCIAL" | "PERFORMANCE" | "RISK";
  title: string;
  body: string;
  cta?: string;
};

export const insights: Insight[] = [
  { id: "i1", kind: "OPPORTUNITY", title: "23 members are drifting", body: "23 members haven't participated in an activity for 14+ days. A nudge could re-engage them.", cta: "View members" },
  { id: "i2", kind: "TREND", title: "U16 on a six-week climb", body: "U16 training attendance has increased for six consecutive weeks — the strongest run this season.", cta: "See squad" },
  { id: "i3", kind: "COMMERCIAL", title: "Renewals tracking ahead", body: "Membership renewals are tracking 11% ahead of the same period last season.", cta: "Open finance" },
  { id: "i4", kind: "PERFORMANCE", title: "67% fixture win rate", body: "Your win rate across all squads is up 9 points on last season.", cta: "View results" },
];

export type Task = {
  id: string;
  category: string;
  title: string;
  count?: number;
  severity: "high" | "medium" | "low";
  actions: string[];
};

export const actionCentre: Task[] = [
  { id: "t1", category: "Finance", title: "membership payments overdue", count: 12, severity: "high", actions: ["View", "Remind"] },
  { id: "t2", category: "Safeguarding", title: "safeguarding documents expiring", count: 4, severity: "high", actions: ["View", "Assign"] },
  { id: "t3", category: "Availability", title: "players haven't responded for Saturday", count: 17, severity: "medium", actions: ["View", "Remind"] },
  { id: "t4", category: "Transport", title: "car-share requests unresolved", count: 3, severity: "medium", actions: ["View", "Resolve"] },
  { id: "t5", category: "Engagement", title: "members showing declining engagement", count: 23, severity: "medium", actions: ["View", "Assign"] },
  { id: "t6", category: "Spaces", title: "AI stories awaiting approval", count: 2, severity: "low", actions: ["View", "Approve"] },
  { id: "t7", category: "Commercial", title: "sponsor contract approaching renewal", count: 1, severity: "medium", actions: ["View", "Assign"] },
  { id: "t8", category: "Live", title: "match highlights awaiting review", count: 3, severity: "low", actions: ["View", "Approve"] },
  { id: "t9", category: "Live", title: "Saturday's stream source is ready", severity: "low", actions: ["View"] },
];

export type Member = {
  id: string;
  name: string;
  team: string;
  role: string;
  ageGroup: string;
  membership: "Active" | "Pending" | "Lapsed";
  availability: "green" | "orange" | "red";
  attendance: number;
  trainingHours: number;
  participation: number;
  payments: "Paid" | "Overdue" | "Due";
  lastActive: string;
  status: "Active" | "At risk" | "Inactive";
  allstarsId: string;
  position?: string;
};

const firstNames = ["Jack","Tom","Amelia","Sophie","Liam","Noah","Olivia","Emma","Harry","Ava","George","Isla","Leo","Mia","Freddie","Grace","Oscar","Ruby","Arthur","Ella"];
const lastNames = ["Williams","Taylor","Smith","Brown","Jones","Evans","Roberts","Walker","Wright","Green","Hall","Clarke","Patel","Khan","Murphy","Cooper","Bailey","Reed","Hughes","Foster"];
const teams = ["Seniors","U18 Premier","U16 Squad","U14 Reds","Women's First","Academy"];
const roles = ["Player","Captain","Coach","Volunteer","Parent","Physio"];
const positions = ["Forward","Midfielder","Defender","Goalkeeper","Winger"];

function seeded(i: number) {
  const name = `${firstNames[i % firstNames.length]} ${lastNames[(i * 3) % lastNames.length]}`;
  const attendance = 55 + ((i * 7) % 45);
  const participation = 40 + ((i * 11) % 60);
  const avail = i % 6 === 0 ? "red" : i % 3 === 0 ? "orange" : "green";
  const pay = i % 9 === 0 ? "Overdue" : i % 5 === 0 ? "Due" : "Paid";
  const status = participation < 55 ? "At risk" : attendance < 60 ? "At risk" : "Active";
  return {
    id: `m${i + 1}`,
    name,
    team: teams[i % teams.length],
    role: roles[i % roles.length],
    ageGroup: ["Senior","U18","U16","U14"][i % 4],
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

export const members: Member[] = Array.from({ length: 32 }, (_, i) => seeded(i));

export const memberStatTrend = [
  { m: "Mar", hours: 14, sessions: 6 },
  { m: "Apr", hours: 18, sessions: 8 },
  { m: "May", hours: 22, sessions: 9 },
  { m: "Jun", hours: 19, sessions: 8 },
  { m: "Jul", hours: 26, sessions: 11 },
  { m: "Aug", hours: 31, sessions: 13 },
];

export type Ranking = {
  pos: number;
  club: string;
  points: number;
  move: number;
  region: string;
  self?: boolean;
};

export const rankings: Ranking[] = [
  { pos: 1, club: "Riverside FC", points: 9420, move: 2, region: "North West", self: true },
  { pos: 2, club: "United", points: 9180, move: 0, region: "North West" },
  { pos: 3, club: "Athletic Club", points: 8970, move: 4, region: "Yorkshire" },
  { pos: 4, club: "City Sports", points: 8810, move: -3, region: "Midlands" },
  { pos: 5, club: "Falcons", points: 8650, move: 1, region: "London" },
  { pos: 6, club: "Harbour Town", points: 8430, move: -1, region: "South West" },
  { pos: 7, club: "Greenfield", points: 8210, move: 2, region: "North East" },
  { pos: 8, club: "Kingsway", points: 7990, move: -2, region: "Scotland" },
];

export const fixtures = [
  { id: "f1", home: "Riverside U18", away: "United Athletic", date: "Sat 20 Aug", time: "14:00", comp: "U18 Premier", venue: "Riverside Sports Ground", available: 17, pending: 4, unavailable: 5 },
  { id: "f2", home: "Riverside U14", away: "City FC", date: "Sat 20 Aug", time: "10:30", comp: "Youth League", venue: "City Park", available: 12, pending: 6, unavailable: 3 },
  { id: "f3", home: "Women's First", away: "Falcons", date: "Sun 21 Aug", time: "13:00", comp: "Regional Cup", venue: "Riverside Sports Ground", available: 15, pending: 2, unavailable: 4 },
];

export const training = [
  { id: "tr1", team: "U16 Squad", date: "Thu 18 Aug", time: "18:00", focus: "Pressing & transitions", coach: "M. Taylor" },
  { id: "tr2", team: "Seniors", date: "Fri 19 Aug", time: "19:30", focus: "Set pieces", coach: "A. Smith" },
  { id: "tr3", team: "Academy", date: "Sat 20 Aug", time: "09:00", focus: "Ball mastery", coach: "S. Roberts" },
];

export const challenges = [
  { id: "c1", name: "Row The Atlantic", type: "Rowing", goal: 5500, unit: "km", done: 4127, participants: 482, teams: 28, daysLeft: 8, sponsor: "AquaFit" },
  { id: "c2", name: "August Cycling Streak", type: "Cycling", goal: 3000, unit: "km", done: 2873, participants: 214, teams: 12, daysLeft: 6, sponsor: null },
  { id: "c3", name: "Mindful March-athon", type: "Mindfulness", goal: 1000, unit: "sessions", done: 640, participants: 356, teams: 20, daysLeft: 14, sponsor: "CalmCo" },
];

export const challengeLeaderboard = [
  { pos: 1, name: "U16 Squad", value: 842, unit: "km" },
  { pos: 2, name: "Seniors", value: 731, unit: "km" },
  { pos: 3, name: "Women's First", value: 688, unit: "km" },
  { pos: 4, name: "Academy", value: 512, unit: "km" },
  { pos: 5, name: "U14 Reds", value: 421, unit: "km" },
];

export type SpacePost = {
  id: string;
  tag: string;
  title: string;
  body: string;
  ai: boolean;
  status: "Published" | "Awaiting approval" | "Scheduled";
  time: string;
  likes: number;
};

export const spaces: SpacePost[] = [
  { id: "s1", tag: "BIGGEST MOVERS", title: "Riverside climb four places", body: "Riverside have climbed four places following their strongest participation week of the season.", ai: true, status: "Published", time: "2h ago", likes: 184 },
  { id: "s2", tag: "THE GAP IS CLOSING", title: "Only 240 points separate the top two", body: "Only 240 points separate Riverside and United at the top of the regional table.", ai: true, status: "Awaiting approval", time: "4h ago", likes: 0 },
  { id: "s3", tag: "PERFECT WEEK", title: "U16 record 100% attendance", body: "The U16 squad recorded 100% training attendance across every session this week.", ai: true, status: "Published", time: "1d ago", likes: 321 },
  { id: "s4", tag: "CHALLENGE UPDATE", title: "127km left in the cycling challenge", body: "Only 127km remains in this month's cycling challenge — the finish line is in sight.", ai: false, status: "Scheduled", time: "Tomorrow 09:00", likes: 0 },
];

export const finance = {
  streams: [
    { label: "Membership", value: 11200 },
    { label: "Subscriptions", value: 3100 },
    { label: "Match Fees", value: 980 },
    { label: "Events", value: 1420 },
    { label: "Retail", value: 8420 },
    { label: "Fundraising", value: 2100 },
    { label: "Sponsorship", value: 4500 },
    { label: "Advertising", value: 640 },
  ],
  outstanding: 2480,
  refunds: 320,
  allstarsFees: 540,
  net: 27510,
  sync: { last: "8 minutes ago", synced: 1284, unmatched: 4 },
};

export const rewards = {
  score: 87,
  annual: 5000,
  earned: 3850,
  next: 500,
  pointsRequired: 420,
  metrics: [
    { label: "Participation", value: 92 },
    { label: "Training", value: 84 },
    { label: "Challenges", value: 61 },
    { label: "Community", value: 78 },
    { label: "Member activity", value: 81 },
    { label: "Wellbeing", value: 69 },
  ],
  history: [
    { period: "Q1 2026", amount: 1200, status: "Paid" },
    { period: "Q4 2025", amount: 950, status: "Paid" },
    { period: "Q3 2025", amount: 1700, status: "Paid" },
  ],
};

export const sponsors = [
  { id: "sp1", name: "AquaFit", package: "Shirt Sponsor", contract: "£24,000 / yr", impressions: "1.2M", engagement: "8,420", renews: "12 Oct 2026", status: "Active" },
  { id: "sp2", name: "CalmCo", package: "Challenge Sponsor", contract: "£8,500 / yr", impressions: "480K", engagement: "3,110", renews: "01 Sep 2026", status: "Renewal due" },
  { id: "sp3", name: "NorthBank", package: "Live Match Sponsor", contract: "£15,000 / yr", impressions: "920K", engagement: "6,050", renews: "20 Jan 2027", status: "Active" },
  { id: "sp4", name: "PeakGear", package: "Player of the Match", contract: "£4,200 / yr", impressions: "210K", engagement: "1,540", renews: "14 Mar 2027", status: "Active" },
];

export const retail = {
  revenue: "£8,420",
  orders: 286,
  avg: "£29.44",
  top: "Club Training Shirt",
  products: [
    { id: "p1", name: "Home Shirt 25/26", price: "£39.99", stock: 42, sold: 118, cat: "Kit" },
    { id: "p2", name: "Club Training Shirt", price: "£24.99", stock: 87, sold: 204, cat: "Training" },
    { id: "p3", name: "Match Scarf", price: "£14.99", stock: 130, sold: 96, cat: "Merch" },
    { id: "p4", name: "Away Shirt 25/26", price: "£39.99", stock: 18, sold: 63, cat: "Kit" },
    { id: "p5", name: "Club Membership", price: "£12 / mo", stock: 999, sold: 412, cat: "Membership" },
  ],
};

export const liveMatch = {
  home: "Riverside FC",
  away: "United Athletic",
  homeScore: 2,
  awayScore: 1,
  comp: "U18 Premier League",
  clock: "67:42",
  venue: "Riverside Sports Ground",
  viewers: 1284,
  peak: 1542,
  timeline: [
    { min: "67'", type: "GOAL", team: "Riverside FC", detail: "J. Williams" },
    { min: "61'", type: "SUBSTITUTION", team: "Riverside FC", detail: "M. Taylor → A. Smith" },
    { min: "54'", type: "YELLOW CARD", team: "United Athletic", detail: "D. Cooper" },
    { min: "HT", type: "HALF TIME", team: "", detail: "Riverside 1 – 1 United" },
    { min: "33'", type: "GOAL", team: "United Athletic", detail: "R. Foster" },
    { min: "12'", type: "GOAL", team: "Riverside FC", detail: "O. Bailey" },
  ],
  potm: [
    { name: "J. Williams", pct: 48 },
    { name: "A. Smith", pct: 31 },
    { name: "M. Taylor", pct: 21 },
  ],
  aiInsights: [
    { title: "AI MATCH INSIGHT", body: "Riverside have generated 63% of their attacking activity during the last 15 minutes." },
    { title: "PLAYER MOMENT", body: "J. Williams has now contributed to four goals in his last three fixtures." },
    { title: "CLUB STORY", body: "A win today could move Riverside into the regional Allstars Top 5." },
  ],
};

export const broadcasts = {
  live: [{ id: "b1", title: "Riverside U18 vs United Athletic", comp: "U18 Premier", viewers: 1284, source: "Veo" }],
  upcoming: [
    { id: "b2", title: "Women's First vs Falcons", comp: "Regional Cup", when: "Sun 21 Aug · 13:00", source: "Veo" },
    { id: "b3", title: "Riverside U14 vs City FC", comp: "Youth League", when: "Sat 27 Aug · 10:30", source: "Pixellot" },
  ],
  completed: [
    { id: "b4", title: "Riverside FC vs Harbour Town", comp: "Senior League", when: "13 Aug", views: 2481, highlights: 14 },
  ],
};

export const integrations = [
  { name: "Apple Health", cat: "Activity", status: "Available" },
  { name: "Google Health Connect", cat: "Activity", status: "Available" },
  { name: "Garmin", cat: "Activity", status: "Connected" },
  { name: "Fitbit", cat: "Activity", status: "Available" },
  { name: "Strava", cat: "Activity", status: "Connected" },
  { name: "QuickBooks", cat: "Finance", status: "Available" },
  { name: "Xero", cat: "Finance", status: "Connected" },
  { name: "Stripe", cat: "Finance", status: "Connected" },
  { name: "biotrackOS", cat: "Technology", status: "Connected" },
  { name: "Google Calendar", cat: "Calendar", status: "Connected" },
  { name: "Microsoft 365", cat: "Calendar", status: "Available" },
  { name: "Veo", cat: "Streaming", status: "Connected" },
  { name: "Hudl", cat: "Streaming", status: "Available" },
  { name: "Pixellot", cat: "Streaming", status: "Available" },
  { name: "YouTube Live", cat: "Streaming", status: "Available" },
  { name: "Custom RTMP", cat: "Streaming", status: "Available" },
  { name: "Email", cat: "Communication", status: "Connected" },
  { name: "SMS", cat: "Communication", status: "Available" },
  { name: "Push", cat: "Communication", status: "Connected" },
];

export const dataSources = [
  { name: "biotrackOS", connected: 842, quality: 96, lastSync: "2 min ago", status: "Connected" },
  { name: "Garmin", connected: 214, quality: 91, lastSync: "12 min ago", status: "Connected" },
  { name: "Strava", connected: 388, quality: 88, lastSync: "5 min ago", status: "Connected" },
  { name: "Apple Health", connected: 0, quality: 0, lastSync: "—", status: "Potential integration" },
  { name: "Manual club data", connected: 1284, quality: 74, lastSync: "1 hr ago", status: "Connected" },
];

export const carpool = {
  fixture: "Riverside U14 vs City FC",
  when: "Saturday 10:30 · City Park",
  travelling: 12,
  drivers: 8,
  spareSeats: 14,
  needsTransport: 3,
  offers: [
    { id: "o1", area: "Riverside / West End", driver: "Parent of A. Smith", seats: 3, status: "Confirmed" },
    { id: "o2", area: "Harbour / Docks", driver: "Parent of O. Bailey", seats: 2, status: "Confirmed" },
    { id: "o3", area: "Greenfield", driver: "Parent of E. Foster", seats: 4, status: "Pending" },
  ],
  requests: [
    { id: "r1", area: "North Gate", player: "T. Taylor", status: "Unmatched" },
    { id: "r2", area: "Kingsway", player: "R. Patel", status: "Unmatched" },
    { id: "r3", area: "West End", player: "M. Khan", status: "Matched" },
  ],
};

export const safeguarding = [
  { id: "sg1", name: "M. Taylor", role: "Head Coach", dbs: "Valid", expires: "14 Mar 2027", quals: "FA Level 2, First Aid", status: "Compliant" },
  { id: "sg2", name: "A. Smith", role: "Assistant Coach", dbs: "Expiring", expires: "02 Sep 2026", quals: "FA Level 1", status: "Action needed" },
  { id: "sg3", name: "S. Roberts", role: "Academy Coach", dbs: "Valid", expires: "20 Nov 2026", quals: "FA Level 2, Safeguarding", status: "Compliant" },
  { id: "sg4", name: "G. Hall", role: "Volunteer", dbs: "Missing", expires: "—", quals: "Safeguarding", status: "Action needed" },
];

export const aliceMilliat = {
  bornDied: "1884 – 1957",
  headline: "Pioneer of women's sport",
  bio: "Alice Milliat was a French rower and sports administrator who campaigned for women's inclusion in international competition. When women were excluded from Olympic events, she founded the Fédération Sportive Féminine Internationale and organised the Women's World Games, opening the door for generations of female athletes.",
  route: "European Cultural Route of Sport",
  mission: "Grow and empower women's and girls' sport across every community, in the spirit of Alice Milliat.",
  stats: [
    { label: "Women & girls active", value: "512", delta: "+18%", up: true },
    { label: "Women's & girls' teams", value: "9", delta: "+2", up: true },
    { label: "Participation growth", value: "+18%", delta: "YoY", up: true },
    { label: "Ambassadors", value: "14", delta: "+4", up: true },
  ],
  growthTrend: [
    { season: "21/22", participants: 288 },
    { season: "22/23", participants: 336 },
    { season: "23/24", participants: 402 },
    { season: "24/25", participants: 448 },
    { season: "25/26", participants: 512 },
  ],
  squads: [
    { name: "Women's First", members: 24, attendance: 88, growth: "+12%" },
    { name: "Girls U16", members: 19, attendance: 91, growth: "+21%" },
    { name: "Girls U14", members: 22, attendance: 84, growth: "+16%" },
    { name: "Walking Netball", members: 17, attendance: 79, growth: "+9%" },
  ],
  ambassadors: [
    { name: "Amelia Roberts", role: "Captain, Women's First", note: "Regional player of the season" },
    { name: "Sophie Evans", role: "Girls U16 Coach", note: "FA Level 2 · Safeguarding lead" },
    { name: "Grace Walker", role: "Community Ambassador", note: "Founder of the girls' academy" },
  ],
  campaigns: [
    { title: "This Girl Plays", body: "A term-long drive to bring 100 new girls into grassroots sessions.", tag: "CAMPAIGN", progress: 64 },
    { title: "Milliat Cup", body: "An inter-club women's tournament along the European Cultural Route of Sport.", tag: "EVENT", progress: 40 },
    { title: "Coach Her", body: "Fund and qualify 10 new female coaches this season.", tag: "PROGRAMME", progress: 30 },
  ],
  pledges: [
    "Equal access to facilities and prime training slots",
    "Visible role models across Spaces and Live",
    "Female coaching and leadership pathways",
    "Safe, inclusive environments for women and girls",
  ],
};

export const roleDashboards = [
  { role: "Club Admin", focus: "Members, finance, operations", metric: "1,284 members · £18.4k / mo" },
  { role: "Coach", focus: "Squad, training, availability", metric: "84% attendance this month" },
  { role: "Team Manager", focus: "Fixtures & availability", metric: "17 available for Saturday" },
  { role: "Finance Admin", focus: "Revenue, payments, sync", metric: "£2,480 outstanding" },
  { role: "Safeguarding Officer", focus: "DBS, consent, incidents", metric: "4 documents expiring" },
  { role: "Content Manager", focus: "Spaces, media, stories", metric: "2 stories to approve" },
  { role: "Governing Body", focus: "National participation", metric: "Region up 14%" },
  { role: "Corporate Admin", focus: "Employee sport & wellbeing", metric: "1,284 active participants" },
  { role: "Commercial Manager", focus: "Sponsors & advertising", metric: "£52.7k committed" },
];
