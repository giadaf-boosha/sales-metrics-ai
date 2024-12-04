import { KpiCard } from "@/components/KpiCard";
import { TrendChart } from "@/components/TrendChart";
import { ChannelChart } from "@/components/ChannelChart";
import { PipelineFunnel } from "@/components/PipelineFunnel";
import { TimeRangeFilter } from "@/components/TimeRangeFilter";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { fetchSalesData } from "@/utils/googleSheets";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [timeRange, setTimeRange] = useState("month");
  const navigate = useNavigate();
  
  const { data: salesData, isLoading, error } = useQuery({
    queryKey: ["sales", timeRange],
    queryFn: () => fetchSalesData(getSheetRange(timeRange)),
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const getSheetRange = (range: string) => {
    switch (range) {
      case "month":
        return "Sales!A1:D31"; // Current month data
      case "quarter":
        return "Sales!A1:D91"; // Current quarter data
      case "year":
        return "Sales!A1:D366"; // Current year data
      default:
        return "Sales!A1:D31";
    }
  };

  // Calculate KPI data from the fetched sales data
  const kpiData = {
    totalOpportunities: {
      value: salesData ? salesData.reduce((sum, d) => sum + d.opportunities, 0).toLocaleString() : "0",
      trend: 15.8,
      title: "Total Opportunities",
    },
    totalRevenue: {
      value: salesData 
        ? `$${(salesData.reduce((sum, d) => sum + d.revenue, 0) / 1000).toLocaleString()}k`
        : "$0",
      trend: 12.5,
      title: "Total Revenue",
    },
    avgContractValue: {
      value: salesData
        ? `$${Math.round(
            salesData.reduce((sum, d) => sum + d.revenue, 0) /
            salesData.reduce((sum, d) => sum + d.opportunities, 0)
          ).toLocaleString()}`
        : "$0",
      trend: -4.2,
      title: "Average Contract Value",
    },
    winRate: {
      value: "68%",
      trend: 8.4,
      title: "Win Rate",
    },
    pipelineVelocity: {
      value: "25.4",
      trend: 5.7,
      title: "Pipeline Velocity",
    }
  };

  const handleFilterChange = (value: string) => {
    setTimeRange(value);
    toast.info(`Updating dashboard for ${value} view`);
  };

  if (error) {
    toast.error("Failed to load dashboard data");
  }

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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          <ChannelChart />
        </div>

        <div className="mt-8">
          <PipelineFunnel />
        </div>
      </div>
    </div>
  );
};

export default Index;