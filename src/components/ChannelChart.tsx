import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { channel: "Direct", revenue: 540000, opportunities: 120 },
  { channel: "Partners", revenue: 420000, opportunities: 95 },
  { channel: "Online", revenue: 380000, opportunities: 85 },
  { channel: "Referral", revenue: 280000, opportunities: 65 },
];

export function ChannelChart() {
  return (
    <div className="h-[400px] w-full rounded-xl bg-white p-6 shadow-sm animate-fade-in">
      <h3 className="mb-6 text-lg font-semibold">Channel Performance</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="channel"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            yAxisId="revenue"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value/1000}k`}
          />
          <YAxis
            yAxisId="opportunities"
            orientation="right"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "none",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Bar
            yAxisId="revenue"
            dataKey="revenue"
            fill="#6366f1"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="opportunities"
            dataKey="opportunities"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}