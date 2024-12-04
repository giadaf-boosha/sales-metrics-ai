import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SalesData } from "@/utils/googleSheets";

interface TrendChartProps {
  data?: SalesData[];
  isLoading?: boolean;
}

export function TrendChart({ data, isLoading }: TrendChartProps) {
  if (isLoading) {
    return (
      <div className="h-[400px] w-full rounded-xl bg-white p-6 shadow-sm animate-pulse">
        <div className="h-full w-full bg-gray-100 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full rounded-xl bg-white p-6 shadow-sm animate-fade-in">
      <h3 className="mb-6 text-lg font-semibold">Revenue & Opportunities Trend</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="opportunitiesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "none",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          <Area
            yAxisId="revenue"
            type="monotone"
            dataKey="revenue"
            stroke="#6366f1"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#revenueGradient)"
          />
          <Area
            yAxisId="opportunities"
            type="monotone"
            dataKey="opportunities"
            stroke="#22c55e"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#opportunitiesGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}