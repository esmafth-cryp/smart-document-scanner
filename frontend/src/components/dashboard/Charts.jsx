import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// === Area Chart : scans par jour ===
export function ScansAreaChart({ data = [] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="scansGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          tick={{ fill: "#64748B", fontSize: 10 }}
          tickFormatter={(v) => v.slice(5)}
          axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#64748B", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            background: "#131826",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 8,
            fontSize: 12,
            color: "#F8FAFC",
          }}
          cursor={{ stroke: "rgba(139,92,246,0.3)" }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#8B5CF6"
          strokeWidth={2}
          fill="url(#scansGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// === Donut Chart : répartition par type ===
const DONUT_COLORS = ["#8B5CF6", "#06B6D4", "#EC4899", "#F59E0B", "#10B981"];

export function TypesDonutChart({ data = [] }) {
  const chartData = data.map((d) => ({
    name: d.label || d.code,
    value: d.count,
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center text-xs text-text-muted">
        Aucune donnée
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "#131826",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 8,
            fontSize: 12,
            color: "#F8FAFC",
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          formatter={(value) => (
            <span style={{ color: "#94A3B8", fontSize: 11 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}