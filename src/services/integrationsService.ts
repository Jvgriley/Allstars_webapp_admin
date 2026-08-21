// Integrations marketplace + biotrackOS data-ingestion sources ("Admin" / "biotrackOS" sections).
import type { DataSource, Integration } from "../domain/types";
import { useAsyncData } from "./useAsyncData";

const integrations: Integration[] = [
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

const dataSources: DataSource[] = [
  { name: "biotrackOS", connected: 842, quality: 96, lastSync: "2 min ago", status: "Connected" },
  { name: "Garmin", connected: 214, quality: 91, lastSync: "12 min ago", status: "Connected" },
  { name: "Strava", connected: 388, quality: 88, lastSync: "5 min ago", status: "Connected" },
  { name: "Apple Health", connected: 0, quality: 0, lastSync: "—", status: "Potential integration" },
  { name: "Manual club data", connected: 1284, quality: 74, lastSync: "1 hr ago", status: "Connected" },
];

export const integrationsService = {
  listIntegrations: (): Promise<Integration[]> => Promise.resolve(integrations),
  listDataSources: (): Promise<DataSource[]> => Promise.resolve(dataSources),
};

export function useIntegrations() {
  return useAsyncData(integrationsService.listIntegrations);
}

export function useDataSources() {
  return useAsyncData(integrationsService.listDataSources);
}
