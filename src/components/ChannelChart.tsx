import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SalesData } from "@/utils/googleSheets";

interface ChannelChartProps {
  data?: SalesData[];
}

export function ChannelChart({ data }: ChannelChartProps) {
  const channelData = React.useMemo(() => {
    if (!data) return [];

    const channelStats = data.reduce((acc, curr) => {
      const channel = curr.channel || 'Other';
      if (!acc[channel]) {
        acc[channel] = { channel, value: 0, count: 0 };
      }
      acc[channel].value += curr.value;
      acc[channel].count += 1;
      return acc;
    }, {} as Record<string, { channel: string; value: number; count: number }>);

    return Object.values(channelStats);
  }, [data]);

  return (
    <div className="h-[400px] w-full rounded-xl bg-white p-6 shadow-sm animate-fade-in">
      <h3 className="mb-6 text-lg font-semibold">Channel Performance</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={channelData}
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
            yAxisId="value"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `€${value/1000}k`}
          />
          <YAxis
            yAxisId="count"
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
            yAxisId="value"
            dataKey="value"
            fill="#6366f1"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="count"
            dataKey="count"
            fill="#22c55e"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}