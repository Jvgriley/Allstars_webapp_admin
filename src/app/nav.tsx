import {
  LayoutDashboard, ListChecks, Sparkles, Users, Trophy, CalendarDays, Car,
  Activity, Flag, MessageSquareText, Radio, Wallet, ShoppingBag, Handshake,
  Gift, HeartPulse, Shield, Plug, BarChart3, Video, LibraryBig, Venus,
} from "lucide-react";
import type { ComponentType } from "react";

export type PageId =
  | "dashboard" | "action-centre"
  | "members" | "member-profile" | "teams"
  | "fixtures" | "availability" | "challenges" | "team-sheet"
  | "intelligence" | "member-stats" | "analytics" | "rankings"
  | "calendar" | "carpool" | "communications" | "safeguarding"
  | "biotrack"
  | "live-centre" | "match" | "stream-management" | "control-room"
  | "spaces" | "media"
  | "alice-milliat"
  | "finance" | "retail" | "sponsorship" | "rewards"
  | "integrations" | "roles";

export type NavItem = { id: PageId; label: string; icon?: ComponentType<{ className?: string }> };
export type NavSection = { title: string; items: NavItem[] };

export const navSections: NavSection[] = [
  {
    title: "Home",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "action-centre", label: "Action Centre", icon: ListChecks },
    ],
  },
  {
    title: "People",
    items: [
      { id: "members", label: "Members", icon: Users },
      { id: "teams", label: "Teams & Squads", icon: Users },
      { id: "safeguarding", label: "Safeguarding", icon: Shield },
    ],
  },
  {
    title: "Sport",
    items: [
      { id: "fixtures", label: "Fixtures", icon: Flag },
      { id: "availability", label: "Availability", icon: ListChecks },
      { id: "challenges", label: "Challenges", icon: Trophy },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { id: "intelligence", label: "Allstars Intelligence", icon: Sparkles },
      { id: "analytics", label: "Club Analytics", icon: BarChart3 },
      { id: "rankings", label: "Rankings", icon: Trophy },
    ],
  },
  {
    title: "Operations",
    items: [
      { id: "calendar", label: "Calendar", icon: CalendarDays },
      { id: "carpool", label: "Car Pooling", icon: Car },
      { id: "communications", label: "Communications", icon: MessageSquareText },
    ],
  },
  {
    title: "biotrackOS",
    items: [{ id: "biotrack", label: "biotrackOS", icon: Activity }],
  },
  {
    title: "Live",
    items: [
      { id: "live-centre", label: "Live Centre", icon: Radio },
      { id: "stream-management", label: "Stream Management", icon: Video },
      { id: "control-room", label: "Control Room", icon: Video },
    ],
  },
  {
    title: "Content",
    items: [
      { id: "spaces", label: "Spaces", icon: MessageSquareText },
      { id: "media", label: "Training & Media", icon: LibraryBig },
    ],
  },
  {
    title: "Alice Milliat",
    items: [{ id: "alice-milliat", label: "Women's Sport", icon: Venus }],
  },
  {
    title: "Commercial",
    items: [
      { id: "finance", label: "Finance", icon: Wallet },
      { id: "retail", label: "Retail", icon: ShoppingBag },
      { id: "sponsorship", label: "Sponsorship", icon: Handshake },
      { id: "rewards", label: "Allstars Rewards", icon: Gift },
    ],
  },
  {
    title: "Admin",
    items: [
      { id: "roles", label: "Role Dashboards", icon: HeartPulse },
      { id: "integrations", label: "Integrations", icon: Plug },
    ],
  },
];
