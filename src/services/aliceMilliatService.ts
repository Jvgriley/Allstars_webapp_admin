// Alice Milliat Foundation / women's sport hub ("Alice Milliat" nav section).
import type { AliceMilliatProfile } from "../domain/types";
import { useAsyncData } from "./useAsyncData";

const aliceMilliat: AliceMilliatProfile = {
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

export const aliceMilliatService = {
  getProfile: (): Promise<AliceMilliatProfile> => Promise.resolve(aliceMilliat),
};

export function useAliceMilliatProfile() {
  return useAsyncData(aliceMilliatService.getProfile);
}
