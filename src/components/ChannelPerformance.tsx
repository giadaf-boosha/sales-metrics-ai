import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceData {
  name: string;
  revenue: number;
  opportunities: number;
  winRate: number;
}

interface ChannelPerformanceProps {
  data: PerformanceData[];
}

export function ChannelPerformance({ data }: ChannelPerformanceProps) {
  const formattedData = data.map(item => ({
    ...item,
    revenue: item.revenue / 1000, // Convert to thousands for better display
  }));

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formattedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Revenue (k€)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
            formatter={(value: number) => [`€${value.toLocaleString('it-IT')}k`, 'Revenue']}
          />
          <Bar
            dataKey="revenue"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}