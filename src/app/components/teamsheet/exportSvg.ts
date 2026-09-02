// "Download Graphic" — a genuine, dependency-free implementation. Rather
// than pulling in an html-to-canvas library just to rasterise the DOM, this
// builds the team sheet as a standalone SVG (a real image format the
// browser can open, and any image tool can convert further) from the same
// slot/member data the on-screen Pitch renders. No new dependency.
import type { Member, TeamSelection } from "../../../domain/types";
import type { SportConfig } from "../../../domain/sportConfigs";

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function buildTeamSheetSvg(opts: {
  config: SportConfig;
  selection: TeamSelection;
  memberById: (id: string) => Member | undefined;
  headline: string;
  subline: string;
}): string {
  const { config, selection, memberById, headline, subline } = opts;
  const formation = config.formations.find((f) => f.id === selection.formationId) ?? config.formations[0];
  const W = 800;
  const H = 1120;
  const pitchTop = 160;
  const pitchH = 800;

  // Sprint 4 — role-based sports (cricket) have no surface coordinates to
  // place a marker at, so they get a scorecard-style list export instead
  // of pitch markers. Same header/branding chrome either way.
  if (config.selectionMode === "role") {
    return buildRoleSheetSvg({ config, selection, memberById, headline, subline, W, H, bodyTop: pitchTop });
  }

  const markers = formation.slots
    .map((slot) => {
      const started = selection.starters.find((st) => st.slotId === slot.slotId);
      const member = started ? memberById(started.memberId) : undefined;
      const label = config.positions.find((p) => p.key === slot.position)?.shortLabel ?? slot.position;
      // Formation-mode only (role-mode sports return earlier via buildRoleSheetSvg) — every slot here has real coordinates, but they're typed optional to accommodate role-based sports, hence the fallback.
      const cx = ((slot.x ?? 50) / 100) * W;
      const cy = pitchTop + (1 - (slot.y ?? 50) / 100) * pitchH;
      const initials = member ? member.name.split(" ").map((n) => n[0]).slice(0, 2).join("") : "";
      const name = member ? member.name : `(${label} unfilled)`;
      return `
        <g>
          <circle cx="${cx}" cy="${cy}" r="26" fill="${member ? "#ffffff" : "rgba(255,255,255,0.25)"}" stroke="#1f2937" stroke-width="2" />
          <text x="${cx}" y="${cy + 6}" text-anchor="middle" font-size="18" font-weight="700" fill="#1f2937">${escapeXml(initials)}</text>
          <text x="${cx}" y="${cy + 46}" text-anchor="middle" font-size="15" font-weight="700" fill="#ffffff">${escapeXml(name)}</text>
        </g>`;
    })
    .join("");

  const bench = selection.bench.map((id) => memberById(id)?.name).filter(Boolean);
  const benchText = bench.length ? bench.join("  ·  ") : "—";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#0e0b2e" />
  <text x="40" y="60" font-size="14" font-weight="700" letter-spacing="3" fill="#c9a7ff">SPORTING ALLSTARS</text>
  <text x="40" y="100" font-size="34" font-weight="800" fill="#ffffff">${escapeXml(headline)}</text>
  <text x="40" y="130" font-size="16" fill="#c9c3e0">${escapeXml(subline)}</text>
  <rect x="0" y="${pitchTop}" width="${W}" height="${pitchH}" fill="#1f7a3d" />
  <rect x="10" y="${pitchTop + 10}" width="${W - 20}" height="${pitchH - 20}" fill="none" stroke="rgba(255,255,255,0.5)" stroke-width="2" />
  ${markers}
  <text x="40" y="${pitchTop + pitchH + 40}" font-size="13" font-weight="700" letter-spacing="2" fill="#c9a7ff">${escapeXml(config.benchLabel.toUpperCase())}</text>
  <text x="40" y="${pitchTop + pitchH + 66}" font-size="15" fill="#ffffff">${escapeXml(benchText)}</text>
</svg>`;
}

function buildRoleSheetSvg(opts: {
  config: SportConfig;
  selection: TeamSelection;
  memberById: (id: string) => Member | undefined;
  headline: string;
  subline: string;
  W: number;
  H: number;
  bodyTop: number;
}): string {
  const { config, selection, memberById, headline, subline, W, H, bodyTop } = opts;
  const formation = config.formations.find((f) => f.id === selection.formationId) ?? config.formations[0];
  const rowH = 54;

  const rows = formation.slots
    .map((slot, i) => {
      const started = selection.starters.find((st) => st.slotId === slot.slotId);
      const member = started ? memberById(started.memberId) : undefined;
      const y = bodyTop + 20 + i * rowH;
      const name = member ? member.name : `(position ${i + 1} unfilled)`;
      const role = member?.primaryPosition ? config.positions.find((p) => p.key === member.primaryPosition)?.shortLabel ?? "" : "";
      const captainTag = member && selection.captainId === member.id ? " (C)" : member && selection.viceCaptainId === member.id ? " (VC)" : "";
      return `
        <g>
          <circle cx="40" cy="${y}" r="16" fill="${member ? "#ffffff" : "rgba(255,255,255,0.2)"}" stroke="#1f2937" stroke-width="1.5" />
          <text x="40" y="${y + 5}" text-anchor="middle" font-size="14" font-weight="700" fill="#1f2937">${escapeXml(String(i + 1))}</text>
          <text x="70" y="${y + 5}" font-size="20" font-weight="700" fill="#ffffff">${escapeXml(name)}${escapeXml(captainTag)}</text>
          ${role ? `<text x="${W - 40}" y="${y + 5}" text-anchor="end" font-size="14" font-weight="700" fill="#c9a7ff">${escapeXml(role)}</text>` : ""}
        </g>`;
    })
    .join("");

  const bench = selection.bench.map((id) => memberById(id)?.name).filter(Boolean);
  const benchText = bench.length ? bench.join("  ·  ") : "—";
  const bodyH = formation.slots.length * rowH + 40;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#0e0b2e" />
  <text x="40" y="60" font-size="14" font-weight="700" letter-spacing="3" fill="#c9a7ff">SPORTING ALLSTARS</text>
  <text x="40" y="100" font-size="34" font-weight="800" fill="#ffffff">${escapeXml(headline)}</text>
  <text x="40" y="130" font-size="16" fill="#c9c3e0">${escapeXml(subline)}</text>
  <rect x="0" y="${bodyTop}" width="${W}" height="${bodyH}" fill="rgba(255,255,255,0.04)" />
  ${rows}
  <text x="40" y="${bodyTop + bodyH + 40}" font-size="13" font-weight="700" letter-spacing="2" fill="#c9a7ff">${escapeXml(config.benchLabel.toUpperCase())}</text>
  <text x="40" y="${bodyTop + bodyH + 66}" font-size="15" fill="#ffffff">${escapeXml(benchText)}</text>
</svg>`;
}

export function downloadSvg(svg: string, filename: string) {
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
