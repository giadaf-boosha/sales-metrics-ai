import React from 'react';
import { SalesData } from '@/types/sales';
import { Card } from '@/components/ui/card';
import { KpiCard } from './KpiCard';
import { calculateAdvancedKPIs } from '@/utils/advancedKpiCalculations';
import { DealFunnel } from './DealFunnel';
import { ChannelPerformance } from './ChannelPerformance';
import { ProductPerformance } from './ProductPerformance';
import { TrendChart } from './TrendChart';

interface AdvancedKPISectionProps {
  salesData: SalesData[];
  currentMonth: number;
}

export function AdvancedKPISection({ salesData, currentMonth }: AdvancedKPISectionProps) {
  const kpis = React.useMemo(() => calculateAdvancedKPIs(salesData, currentMonth), [salesData, currentMonth]);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
        KPI Principali
      </h2>
      
      {/* Top KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KpiCard
          title="Total Closed Won Revenue"
          value={`€${kpis.totalClosedWonRevenue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
          trend={kpis.revenueTrend}
        />
        <KpiCard
          title="Win Rate"
          value={`${kpis.winRate.toFixed(2)}%`}
          trend={kpis.winRateTrend}
        />
        <KpiCard
          title="Pipeline Velocity"
          value={`€${kpis.pipelineVelocity.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
          trend={kpis.velocityTrend}
        />
        <KpiCard
          title="Average Contract Value"
          value={`€${kpis.acv.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`}
          trend={kpis.acvTrend}
        />
      </div>

      {/* Opportunities and Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Total Opportunities Created & Trend</h3>
          <TrendChart data={kpis.opportunitiesTrend} />
        </Card>
        <DealFunnel 
          salesData={salesData}
          currentMonth={currentMonth}
        />
      </div>

      {/* Channel and Product Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Channel Performance</h3>
          <ChannelPerformance data={kpis.channelPerformance} />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Product Performance</h3>
          <ProductPerformance data={kpis.productPerformance} />
        </Card>
      </div>
    </div>
  );
}