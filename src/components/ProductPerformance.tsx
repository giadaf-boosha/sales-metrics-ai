import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PerformanceData {
  name: string;
  revenue: number;
  opportunities: number;
  winRate: number;
}

interface ProductPerformanceProps {
  data: PerformanceData[];
}

export function ProductPerformance({ data }: ProductPerformanceProps) {
  const formattedData = data.map(item => ({
    ...item,
    revenue: item.revenue / 1000, // Convert to thousands for better display
    winRate: Number(item.winRate.toFixed(1))
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
            yAxisId="left"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Revenue (k€)', angle: -90, position: 'insideLeft' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#6b7280"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            label={{ value: 'Win Rate (%)', angle: 90, position: 'insideRight' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
            formatter={(value: number, name: string) => {
              if (name === 'revenue') return [`€${value.toLocaleString('it-IT')}k`, 'Revenue'];
              if (name === 'winRate') return [`${value}%`, 'Win Rate'];
              return [value, name];
            }}
          />
          <Bar
            yAxisId="left"
            dataKey="revenue"
            fill="#3b82f6"
            radius={[4, 4, 0, 0]}
          />
          <Bar
            yAxisId="right"
            dataKey="winRate"
            fill="#10b981"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}