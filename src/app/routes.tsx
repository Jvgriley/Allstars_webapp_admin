// Route tree for the app. Every screen gets its own stable, shareable URL.
//
// Most page components are used directly — they don't need anything from
// the router. A handful need the shared `navigate` helper (translated from
// the app's old PageId-based navigate calls, see routing.ts) and/or a URL
// param, so they get a thin wrapper here. This keeps every existing page
// component's internals untouched.
//
// Every page is loaded via React.lazy — Sprint 3 route-based code
// splitting (Section M). Each page (and whatever it imports, e.g. recharts
// for Analytics/Dashboard) becomes its own chunk, fetched only when that
// route is visited, instead of one ~960KB bundle shipped up front. A
// single Suspense boundary below covers every route, so switching pages
// briefly shows the same PageLoading placeholder every page already uses
// while its data resolves.
import { lazy, Suspense } from "react";
import { Route, Routes, useParams } from "react-router";
import { AppLayout } from "./components/AppShell";
import { useAppNavigate } from "./routing";
import { PageLoading } from "./components/primitives";
import { NotFound } from "./pages/NotFound";

const Dashboard = lazy(() => import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const ActionCentre = lazy(() => import("./pages/ActionCentre").then((m) => ({ default: m.ActionCentre })));
const Intelligence = lazy(() => import("./pages/Intelligence").then((m) => ({ default: m.Intelligence })));
const Members = lazy(() => import("./pages/People").then((m) => ({ default: m.Members })));
const MemberProfile = lazy(() => import("./pages/People").then((m) => ({ default: m.MemberProfile })));
const MemberStats = lazy(() => import("./pages/People").then((m) => ({ default: m.MemberStats })));
const Teams = lazy(() => import("./pages/People").then((m) => ({ default: m.Teams })));
const Fixtures = lazy(() => import("./pages/Sport").then((m) => ({ default: m.Fixtures })));
const Availability = lazy(() => import("./pages/Sport").then((m) => ({ default: m.Availability })));
const Challenges = lazy(() => import("./pages/Sport").then((m) => ({ default: m.Challenges })));
const TeamSheetPage = lazy(() => import("./pages/TeamSheet").then((m) => ({ default: m.TeamSheetPage })));
const Analytics = lazy(() => import("./pages/Analytics").then((m) => ({ default: m.Analytics })));
const Rankings = lazy(() => import("./pages/Analytics").then((m) => ({ default: m.Rankings })));
const CalendarPage = lazy(() => import("./pages/Operations").then((m) => ({ default: m.CalendarPage })));
const CarPool = lazy(() => import("./pages/Operations").then((m) => ({ default: m.CarPool })));
const Communications = lazy(() => import("./pages/Operations").then((m) => ({ default: m.Communications })));
const Safeguarding = lazy(() => import("./pages/Operations").then((m) => ({ default: m.Safeguarding })));
const Biotrack = lazy(() => import("./pages/Biotrack").then((m) => ({ default: m.Biotrack })));
const LiveCentre = lazy(() => import("./pages/Live").then((m) => ({ default: m.LiveCentre })));
const Match = lazy(() => import("./pages/Live").then((m) => ({ default: m.Match })));
const StreamManagement = lazy(() => import("./pages/Live").then((m) => ({ default: m.StreamManagement })));
const ControlRoom = lazy(() => import("./pages/Live").then((m) => ({ default: m.ControlRoom })));
const Spaces = lazy(() => import("./pages/Content").then((m) => ({ default: m.Spaces })));
const Media = lazy(() => import("./pages/Content").then((m) => ({ default: m.Media })));
const AliceMilliat = lazy(() => import("./pages/AliceMilliat").then((m) => ({ default: m.AliceMilliat })));
const Finance = lazy(() => import("./pages/Commercial").then((m) => ({ default: m.Finance })));
const Retail = lazy(() => import("./pages/Commercial").then((m) => ({ default: m.Retail })));
const Sponsorship = lazy(() => import("./pages/Commercial").then((m) => ({ default: m.Sponsorship })));
const Rewards = lazy(() => import("./pages/Commercial").then((m) => ({ default: m.Rewards })));
const Integrations = lazy(() => import("./pages/Admin").then((m) => ({ default: m.Integrations })));
const RoleDashboards = lazy(() => import("./pages/Admin").then((m) => ({ default: m.RoleDashboards })));

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

function AvailabilityRoute() {
  return <Availability navigate={useAppNavigate()} />;
}

function ChallengesRoute() {
  return <Challenges navigate={useAppNavigate()} />;
}

function TeamSheetRoute() {
  const { fixtureId } = useParams();
  return <TeamSheetPage fixtureId={fixtureId} navigate={useAppNavigate()} />;
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
    <Suspense fallback={<PageLoading />}>
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
          <Route path="fixtures/:fixtureId/team-sheet" element={<TeamSheetRoute />} />
          <Route path="availability" element={<AvailabilityRoute />} />
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

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
