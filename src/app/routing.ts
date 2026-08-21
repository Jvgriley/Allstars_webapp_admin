// Maps the app's logical page identifiers (see nav.tsx) onto real, shareable
// URLs, and provides a drop-in replacement for the old in-memory
// `navigate(pageId, arg)` function so every existing page component can
// keep calling `navigate("member-profile", memberId)` unchanged while it
// now performs a real react-router navigation under the hood.
import { useNavigate } from "react-router";
import type { PageId } from "./nav";

export function pagePath(id: PageId, arg?: string): string {
  switch (id) {
    case "dashboard":
      return "/";
    case "action-centre":
      return "/action-centre";
    case "members":
      return "/members";
    case "member-profile":
      return `/members/${arg ?? ""}`;
    case "member-stats":
      return `/members/${arg ?? ""}/stats`;
    case "teams":
      return "/teams";
    case "fixtures":
      return "/fixtures";
    case "availability":
      return "/availability";
    case "challenges":
      return "/challenges";
    case "team-sheet":
      return `/fixtures/${arg ?? ""}/team-sheet`;
    case "intelligence":
      return "/intelligence";
    case "analytics":
      return "/analytics";
    case "rankings":
      return "/rankings";
    case "calendar":
      return "/calendar";
    case "carpool":
      return "/carpool";
    case "communications":
      return "/communications";
    case "safeguarding":
      return "/safeguarding";
    case "biotrack":
      return "/biotrack";
    case "live-centre":
      return "/live";
    case "match":
      return "/live/match";
    case "stream-management":
      return "/live/stream-management";
    case "control-room":
      return "/live/control-room";
    case "spaces":
      return "/spaces";
    case "media":
      return "/media";
    case "alice-milliat":
      return "/alice-milliat";
    case "finance":
      return "/finance";
    case "retail":
      return "/retail";
    case "sponsorship":
      return "/sponsorship";
    case "rewards":
      return "/rewards";
    case "integrations":
      return "/integrations";
    case "roles":
      return "/roles";
    default:
      return "/";
  }
}

/**
 * Same call signature every page already used with the old prototype's
 * in-memory navigate() — `navigate("member-profile", memberId)` — but now
 * backed by real react-router history, so URLs, deep links and
 * back/forward all work.
 */
export function useAppNavigate() {
  const navigate = useNavigate();
  return (p: PageId, arg?: string) => {
    navigate(pagePath(p, arg));
    requestAnimationFrame(() => {
      document.querySelector("main")?.scrollTo({ top: 0 });
    });
  };
}
