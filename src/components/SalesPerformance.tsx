import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SalesData } from '../types/sales';
import { calculateSalesKPIs } from '../utils/salesKpiCalculations';

interface SalesPerformanceProps {
  salesData: SalesData[];
  currentMonth: number;
}

export function SalesPerformance({ salesData, currentMonth }: SalesPerformanceProps) {
  const salesKPIs = calculateSalesKPIs(salesData, currentMonth)
    .sort((a, b) => b.totalClosedWonRevenue - a.totalClosedWonRevenue);

  const formattedData = salesKPIs.map(item => ({
    name: item.salesPerson,
    revenue: item.totalClosedWonRevenue / 1000, // Convert to thousands for better display
    winRate: item.winRate
  }));

  return (
    <div className="rounded-xl bg-white/80 backdrop-blur-lg p-6 shadow-lg border border-gray-100">
      <h3 className="mb-6 text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
        Sales Performance
      </h3>
      
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
                if (name === 'winRate') return [`${value.toFixed(1)}%`, 'Win Rate'];
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
    </div>
  );
}