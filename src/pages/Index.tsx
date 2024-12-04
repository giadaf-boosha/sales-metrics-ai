import { KpiCard } from "@/components/KpiCard";
import { TrendChart } from "@/components/TrendChart";
import { ChannelChart } from "@/components/ChannelChart";
import { PipelineFunnel } from "@/components/PipelineFunnel";
import { TimeRangeFilter } from "@/components/TimeRangeFilter";
import { GoogleSheetsConfig } from "@/components/GoogleSheetsConfig";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { fetchSalesData } from "@/utils/googleSheets";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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

  // Calculate KPI data from the fetched sales data
  const kpiData = {
    totalOpportunities: {
      value: salesData ? salesData.length.toLocaleString() : "0",
      trend: 15.8,
      title: "Total Opportunities",
    },
    totalValue: {
      value: salesData 
        ? `€${(salesData.reduce((sum, d) => sum + d.value, 0) / 1000).toLocaleString()}k`
        : "€0",
      trend: 12.5,
      title: "Total Pipeline Value",
    },
    avgDealValue: {
      value: salesData && salesData.length > 0
        ? `€${Math.round(
            salesData.reduce((sum, d) => sum + d.value, 0) / salesData.length
          ).toLocaleString()}`
        : "€0",
      trend: -4.2,
      title: "Average Deal Value",
    },
    proposalRate: {
      value: salesData && salesData.length > 0
        ? `${Math.round((salesData.filter(d => d.proposalSent).length / salesData.length) * 100)}%`
        : "0%",
      trend: 8.4,
      title: "Proposal Rate",
    },
    closedDeals: {
      value: salesData 
        ? salesData.filter(d => d.contractsClosed).length.toString()
        : "0",
      trend: 5.7,
      title: "Closed Deals",
    }
  };

  const handleFilterChange = (value: string) => {
    setTimeRange(value);
    toast.info(`Updating dashboard for ${value} view`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Sales Analytics</h1>
              <p className="mt-2 text-muted-foreground">
                Track your sales performance and metrics
              </p>
            </div>
            <div className="flex items-center gap-4">
              <TimeRangeFilter onFilterChange={handleFilterChange} />
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
                ? 'Please configure your Google Sheet above to view the dashboard.'
                : 'Failed to load dashboard data. Please try again later.'}
            </AlertDescription>
          </Alert>
        )}

        {!error && (
          <>
            <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.values(kpiData).map((kpi, index) => (
                <KpiCard
                  key={kpi.title}
                  title={kpi.title}
                  value={kpi.value}
                  trend={kpi.trend}
                  className={`[animation-delay:${index * 100}ms]`}
                />
              ))}
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <TrendChart data={salesData} isLoading={isLoading} />
              <ChannelChart data={salesData} />
            </div>

            <div className="mt-8">
              <PipelineFunnel data={salesData} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;