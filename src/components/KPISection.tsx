import React from 'react';
import { KpiCard } from "@/components/KpiCard";
import { SalesData } from "@/types/sales";
import { calculateTotalKPIs } from "@/utils/salesKpiCalculations";

interface KPISectionProps {
  salesData: SalesData[] | undefined;
  currentMonth: number;
}

const formatCurrency = (value: number): string => {
  return `€${value.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export function KPISection({ salesData, currentMonth }: KPISectionProps) {
  const filteredData = React.useMemo(() => {
    if (!salesData) return undefined;
    return salesData;
  }, [salesData]);

  const kpiData = filteredData ? (() => {
    const totals = calculateTotalKPIs(filteredData, currentMonth);
    
    return {
      totalOppsCreated: {
        value: totals.totalOppsCreated.toString(),
        title: "Total Opps. Created",
      },
      totalClosedLostOpps: {
        value: totals.totalClosedLostOpps.toString(),
        title: "Total Closed Lost Opps.",
      },
      totalClosedWonOpps: {
        value: totals.totalClosedWonOpps.toString(),
        title: "Total Closed Won Opps.",
      },
      totalClosedWonRevenue: {
        value: formatCurrency(totals.totalClosedWonRevenue),
        title: "Total Closed Won Revenue",
      },
      acv: {
        value: formatCurrency(totals.acv),
        title: "ACV",
      },
      closedWonAvgSalesCycle: {
        value: `${Math.round(totals.closedWonAvgSalesCycle)} giorni`,
        title: "Closed Won Avg. Sales Cycle",
      },
      winRate: {
        value: formatPercentage(totals.winRate),
        title: "Win Rate",
      },
      pipelineVelocity: {
        value: formatCurrency(totals.pipelineVelocity),
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