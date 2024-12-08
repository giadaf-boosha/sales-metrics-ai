import React from 'react';
import { SalesData } from '../types/sales';
import { calculateChannelKPIs } from '../utils/salesKpiCalculations';

interface ChannelPerformanceProps {
  salesData: SalesData[];
  currentMonth: number;
}

export function ChannelPerformance({ salesData, currentMonth }: ChannelPerformanceProps) {
  const channelKPIs = calculateChannelKPIs(salesData, currentMonth)
    .sort((a, b) => b.totalClosedWonRevenue - a.totalClosedWonRevenue);

  return (
    <div className="rounded-xl bg-white/80 backdrop-blur-lg p-6 shadow-lg border border-gray-100">
      <h3 className="mb-6 text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
        Channel Performance
      </h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Channel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Revenue
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Win Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Closed Deals
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pipeline Contribution
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {channelKPIs.map((kpi, index) => (
              <tr key={kpi.source} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {kpi.source}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  €{kpi.totalClosedWonRevenue.toLocaleString('it-IT', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {kpi.winRate.toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {kpi.totalClosedWonOpps}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${kpi.pipelineContribution}%` }}
                      />
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      {kpi.pipelineContribution.toFixed(1)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}