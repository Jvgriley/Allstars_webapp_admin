// A real 404, replacing the previous silent redirect-to-dashboard for any
// unmatched route. Sprint 3 production-readiness pass (Section L).
import { Compass } from "lucide-react";
import { useNavigate } from "react-router";
import { Btn } from "../components/primitives";

export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="max-w-sm text-center">
        <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl sa-gradient text-white">
          <Compass className="size-6" />
        </span>
        <div className="font-display text-3xl text-[var(--sa-ink)]">Page not found</div>
        <p className="mt-2 text-sm text-muted-foreground">The page you're looking for doesn't exist or may have moved.</p>
        <Btn className="mt-5" onClick={() => navigate("/")}>Go to Dashboard</Btn>
      </div>
    </div>
  );
}
