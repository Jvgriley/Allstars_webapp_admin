import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

const PINK = "#ef3aa3";
const VIOLET = "#2a1b6b";
const LAV = "#b6a8d8";
const PL = "#d27bbf";
export const SA_COLORS = [PINK, VIOLET, PL, LAV, "#7c5cff", "#10b981"];

const axis = { stroke: "#9a8fb8", fontSize: 11 };
const tip = {
  contentStyle: {
    borderRadius: 12,
    border: "1px solid rgba(15,6,48,0.1)",
    fontSize: 12,
    boxShadow: "0 8px 24px rgba(15,6,48,0.12)",
  },
};

let gradSeq = 0;
const nextGradId = () => `saArea-${gradSeq++}`;

export function AreaTrend({ data, x, y, height = 220 }: { data: any[]; x: string; y: string; height?: number }) {
  const gid = nextGradId();
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <defs key="defs">
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PINK} stopOpacity={0.4} />
            <stop offset="100%" stopColor={PINK} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid key="grid" strokeDasharray="3 3" stroke="rgba(15,6,48,0.06)" vertical={false} />
        <XAxis key="x" dataKey={x} tickLine={false} axisLine={false} {...axis} />
        <YAxis key="y" tickLine={false} axisLine={false} {...axis} width={44} />
        <Tooltip key="tip" {...tip} />
        <Area key="area" type="monotone" dataKey={y} stroke={PINK} strokeWidth={2.5} fill={`url(#${gid})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MultiLine({ data, x, lines, height = 220 }: { data: any[]; x: string; lines: { key: string; label: string }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid key="grid" strokeDasharray="3 3" stroke="rgba(15,6,48,0.06)" vertical={false} />
        <XAxis key="x" dataKey={x} tickLine={false} axisLine={false} {...axis} />
        <YAxis key="y" tickLine={false} axisLine={false} {...axis} width={36} />
        <Tooltip key="tip" {...tip} />
        {lines.map((l, i) => (
          <Line key={l.key} type="monotone" dataKey={l.key} name={l.label} stroke={SA_COLORS[i % SA_COLORS.length]} strokeWidth={2.5} dot={false} />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function Bars({ data, x, y, height = 220, color = PINK }: { data: any[]; x: string; y: string; height?: number; color?: string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid key="grid" strokeDasharray="3 3" stroke="rgba(15,6,48,0.06)" vertical={false} />
        <XAxis key="x" dataKey={x} tickLine={false} axisLine={false} {...axis} />
        <YAxis key="y" tickLine={false} axisLine={false} {...axis} width={44} />
        <Tooltip key="tip" {...tip} cursor={{ fill: "rgba(239,58,163,0.06)" }} />
        <Bar key="bar" dataKey={y} radius={[6, 6, 0, 0]} fill={color} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data, height = 220 }: { data: { name: string; value: number }[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie key="pie" data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
          {data.map((d, i) => (
            <Cell key={d.name} fill={SA_COLORS[i % SA_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip key="tip" {...tip} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export { PINK, VIOLET, LAV, PL };
