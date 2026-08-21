// Route tree for the app. Every screen gets its own stable, shareable URL.
//
// Most page components are used directly — they don't need anything from
// the router. A handful need the shared `navigate` helper (translated from
// the app's old PageId-based navigate calls, see routing.ts) and/or a URL
// param, so they get a thin wrapper here. This keeps every existing page
// component's internals untouched.
import { Navigate, Route, Routes, useParams } from "react-router";
import { AppLayout } from "./components/AppShell";
import { useAppNavigate } from "./routing";

import { Dashboard } from "./pages/Dashboard";
import { ActionCentre } from "./pages/ActionCentre";
import { Intelligence } from "./pages/Intelligence";
import { Members, MemberProfile, MemberStats, Teams } from "./pages/People";
import { Fixtures, Availability, Challenges } from "./pages/Sport";
import { Analytics, Rankings } from "./pages/Analytics";
import { CalendarPage, CarPool, Communications, Safeguarding } from "./pages/Operations";
import { Biotrack } from "./pages/Biotrack";
import { LiveCentre, Match, StreamManagement, ControlRoom } from "./pages/Live";
import { Spaces, Media } from "./pages/Content";
import { AliceMilliat } from "./pages/AliceMilliat";
import { Finance, Retail, Sponsorship, Rewards } from "./pages/Commercial";
import { Integrations, RoleDashboards } from "./pages/Admin";

function DashboardRoute() {
  return <Dashboard navigate={useAppNavigate()} />;
}

function IntelligenceRoute() {
  return <Intelligence navigate={useAppNavigate()} />;
}

function MembersRoute() {
  return <Members navigate={useAppNavigate()} />;
}

function MemberProfileRoute() {
  const { memberId } = useParams();
  return <MemberProfile memberId={memberId} navigate={useAppNavigate()} />;
}

function MemberStatsRoute() {
  const { memberId } = useParams();
  return <MemberStats memberId={memberId} navigate={useAppNavigate()} />;
}

function TeamsRoute() {
  return <Teams navigate={useAppNavigate()} />;
}

function FixturesRoute() {
  return <Fixtures navigate={useAppNavigate()} />;
}

function ChallengesRoute() {
  return <Challenges navigate={useAppNavigate()} />;
}

function RankingsRoute() {
  return <Rankings navigate={useAppNavigate()} />;
}

function LiveCentreRoute() {
  return <LiveCentre navigate={useAppNavigate()} />;
}

function MatchRoute() {
  return <Match navigate={useAppNavigate()} />;
}

function StreamManagementRoute() {
  return <StreamManagement navigate={useAppNavigate()} />;
}

function ControlRoomRoute() {
  return <ControlRoom navigate={useAppNavigate()} />;
}

function AliceMilliatRoute() {
  return <AliceMilliat navigate={useAppNavigate()} />;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardRoute />} />
        <Route path="action-centre" element={<ActionCentre />} />

        <Route path="members" element={<MembersRoute />} />
        <Route path="members/:memberId" element={<MemberProfileRoute />} />
        <Route path="members/:memberId/stats" element={<MemberStatsRoute />} />
        <Route path="teams" element={<TeamsRoute />} />
        <Route path="safeguarding" element={<Safeguarding />} />

        <Route path="fixtures" element={<FixturesRoute />} />
        <Route path="availability" element={<Availability />} />
        <Route path="challenges" element={<ChallengesRoute />} />

        <Route path="intelligence" element={<IntelligenceRoute />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="rankings" element={<RankingsRoute />} />

        <Route path="calendar" element={<CalendarPage />} />
        <Route path="carpool" element={<CarPool />} />
        <Route path="communications" element={<Communications />} />

        <Route path="biotrack" element={<Biotrack />} />

        <Route path="live" element={<LiveCentreRoute />} />
        <Route path="live/match" element={<MatchRoute />} />
        <Route path="live/stream-management" element={<StreamManagementRoute />} />
        <Route path="live/control-room" element={<ControlRoomRoute />} />

        <Route path="spaces" element={<Spaces />} />
        <Route path="media" element={<Media />} />

        <Route path="alice-milliat" element={<AliceMilliatRoute />} />

        <Route path="finance" element={<Finance />} />
        <Route path="retail" element={<Retail />} />
        <Route path="sponsorship" element={<Sponsorship />} />
        <Route path="rewards" element={<Rewards />} />

        <Route path="integrations" element={<Integrations />} />
        <Route path="roles" element={<RoleDashboards />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
