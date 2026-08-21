// Sponsorship portfolio ("Commercial" nav section).
import type { Sponsor } from "../domain/types";
import { useAsyncData } from "./useAsyncData";

const sponsors: Sponsor[] = [
  { id: "sp1", name: "AquaFit", package: "Shirt Sponsor", contract: "£24,000 / yr", impressions: "1.2M", engagement: "8,420", renews: "12 Oct 2026", status: "Active" },
  { id: "sp2", name: "CalmCo", package: "Challenge Sponsor", contract: "£8,500 / yr", impressions: "480K", engagement: "3,110", renews: "01 Sep 2026", status: "Renewal due" },
  { id: "sp3", name: "NorthBank", package: "Live Match Sponsor", contract: "£15,000 / yr", impressions: "920K", engagement: "6,050", renews: "20 Jan 2027", status: "Active" },
  { id: "sp4", name: "PeakGear", package: "Player of the Match", contract: "£4,200 / yr", impressions: "210K", engagement: "1,540", renews: "14 Mar 2027", status: "Active" },
];

export const sponsorshipService = {
  listSponsors: (): Promise<Sponsor[]> => Promise.resolve(sponsors),
};

export function useSponsors() {
  return useAsyncData(sponsorshipService.listSponsors);
}
