import { KpiCard } from "@/components/KpiCard";
import { TimeRangeFilter } from "@/components/TimeRangeFilter";
import { GoogleSheetsConfig } from "@/components/GoogleSheetsConfig";
import { SummaryTable } from "@/components/SummaryTable";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { fetchSalesData } from "@/utils/googleSheets";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { calculateChannelKPIs } from "@/utils/salesKpiCalculations";

const Index = () => {
  const [timeRange, setTimeRange] = useState("month");
  const navigate = useNavigate();
  
  const { data: salesData, isLoading, error } = useQuery({
    queryKey: ["sales", timeRange],
    queryFn: () => fetchSalesData(timeRange),
    retry: false
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  // Calcola i KPI dai dati
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

  const handleFilterChange = (value: string) => {
    setTimeRange(value);
    toast.info(`Aggiornamento dashboard per il periodo: ${value}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Sales Analytics</h1>
              <p className="mt-2 text-muted-foreground">
                Monitora le tue performance di vendita
              </p>
            </div>
            <div className="flex items-center gap-4">
              <TimeRangeFilter 
                onFilterChange={handleFilterChange}
              />
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <GoogleSheetsConfig />

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error && error.message === 'No Google Sheet configured'
                ? 'Configura il tuo Google Sheet sopra per visualizzare la dashboard.'
                : 'Errore nel caricamento dei dati. Riprova più tardi.'}
            </AlertDescription>
          </Alert>
        )}

        {!error && kpiData && (
          <>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.values(kpiData).map((kpi, index) => (
                <KpiCard
                  key={kpi.title}
                  title={kpi.title}
                  value={kpi.value}
                  className={`[animation-delay:${index * 100}ms]`}
                />
              ))}
            </div>

            <div className="mt-8">
              <SummaryTable data={salesData} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;