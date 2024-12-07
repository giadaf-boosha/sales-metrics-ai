import React from 'react';
import { KpiCard } from "@/components/KpiCard";
import { SalesData } from "@/types/sales";
import { calculateChannelKPIs } from "@/utils/salesKpiCalculations";

interface KPISectionProps {
  salesData: SalesData[] | undefined;
}

export function KPISection({ salesData }: KPISectionProps) {
  const kpiData = salesData ? (() => {
    const allChannelsKPIs = calculateChannelKPIs(salesData);
    const totals = allChannelsKPIs.reduce((acc, channel) => ({
      totalOppsCreated: acc.totalOppsCreated + channel.totalOppsCreated,
      totalClosedLostOpps: acc.totalClosedLostOpps + channel.totalClosedLostOpps,
      totalClosedWonOpps: acc.totalClosedWonOpps + channel.totalClosedWonOpps,
      totalClosedWonRevenue: acc.totalClosedWonRevenue + channel.totalClosedWonRevenue,
    }), {
      totalOppsCreated: 0,
      totalClosedLostOpps: 0,
      totalClosedWonOpps: 0,
      totalClosedWonRevenue: 0,
    });

    const avgSalesCycle = allChannelsKPIs.reduce((acc, channel) => 
      acc + (channel.closedWonAvgSalesCycle * channel.totalClosedWonOpps), 0
    ) / Math.max(totals.totalClosedWonOpps, 1);

    const winRate = totals.totalOppsCreated > 0 
      ? (totals.totalClosedWonOpps / totals.totalOppsCreated) * 100 
      : 0;

    const acv = totals.totalClosedWonOpps > 0 
      ? totals.totalClosedWonRevenue / totals.totalClosedWonOpps 
      : 0;

    const pipelineVelocity = avgSalesCycle > 0
      ? (totals.totalOppsCreated * (winRate / 100) * acv) / (avgSalesCycle / 365)
      : 0;

    return {
      totalOppsCreated: {
        value: totals.totalOppsCreated,
        title: "Total Opps. Created",
      },
      totalClosedLostOpps: {
        value: totals.totalClosedLostOpps,
        title: "Total Closed Lost Opps.",
      },
      totalClosedWonOpps: {
        value: totals.totalClosedWonOpps,
        title: "Total Closed Won Opps.",
      },
      totalClosedWonRevenue: {
        value: `€${totals.totalClosedWonRevenue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
        title: "Total Closed Won Revenue",
      },
      acv: {
        value: `€${acv.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
        title: "ACV",
      },
      avgSalesCycle: {
        value: `${Math.round(avgSalesCycle)} giorni`,
        title: "Closed Won Avg. Sales Cycle",
      },
      winRate: {
        value: `${winRate.toFixed(2)}%`,
        title: "Win Rate",
      },
      pipelineVelocity: {
        value: `€${pipelineVelocity.toLocaleString('it-IT', { minimumFractionDigits: 2 })}`,
        title: "Pipeline Velocity",
      },
      pipelineContribution: {
        value: "100%",
        title: "% of Pipeline Contribution",
      },
    };
  })() : null;

  if (!kpiData) return null;

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Object.entries(kpiData).map(([key, kpi], index) => (
        <KpiCard
          key={key}
          title={kpi.title}
          value={kpi.value}
          className={`animate-fade-in [animation-delay:${index * 100}ms]`}
        />
      ))}
    </div>
  );
}