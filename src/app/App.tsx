import { useState } from "react";
import { AppShell } from "./components/AppShell";
import type { PageId } from "./nav";
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

export default function App() {
  const [page, setPage] = useState<PageId>("dashboard");
  const [memberId, setMemberId] = useState<string | undefined>(undefined);

  const navigate = (p: PageId, arg?: string) => {
    if (arg) setMemberId(arg);
    setPage(p);
    requestAnimationFrame(() => {
      document.querySelector("main")?.scrollTo({ top: 0 });
    });
  };

  const render = () => {
    switch (page) {
      case "dashboard": return <Dashboard navigate={navigate} />;
      case "action-centre": return <ActionCentre />;
      case "intelligence": return <Intelligence navigate={navigate} />;
      case "members": return <Members navigate={navigate} />;
      case "member-profile": return <MemberProfile memberId={memberId} navigate={navigate} />;
      case "member-stats": return <MemberStats memberId={memberId} navigate={navigate} />;
      case "teams": return <Teams navigate={navigate} />;
      case "fixtures": return <Fixtures navigate={navigate} />;
      case "availability": return <Availability />;
      case "challenges": return <Challenges navigate={navigate} />;
      case "analytics": return <Analytics />;
      case "rankings": return <Rankings navigate={navigate} />;
      case "calendar": return <CalendarPage />;
      case "carpool": return <CarPool />;
      case "communications": return <Communications />;
      case "safeguarding": return <Safeguarding />;
      case "biotrack": return <Biotrack />;
      case "live-centre": return <LiveCentre navigate={navigate} />;
      case "match": return <Match navigate={navigate} />;
      case "stream-management": return <StreamManagement navigate={navigate} />;
      case "control-room": return <ControlRoom navigate={navigate} />;
      case "spaces": return <Spaces />;
      case "media": return <Media />;
      case "alice-milliat": return <AliceMilliat navigate={navigate} />;
      case "finance": return <Finance />;
      case "retail": return <Retail />;
      case "sponsorship": return <Sponsorship />;
      case "rewards": return <Rewards />;
      case "integrations": return <Integrations />;
      case "roles": return <RoleDashboards />;
      default: return <Dashboard navigate={navigate} />;
    }
  };

  return (
    <AppShell page={page} navigate={navigate}>
      {render()}
    </AppShell>
  );
}
