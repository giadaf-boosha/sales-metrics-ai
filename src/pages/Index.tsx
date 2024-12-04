import { KpiCard } from "@/components/KpiCard";
import { TrendChart } from "@/components/TrendChart";
import { ChannelChart } from "@/components/ChannelChart";
import { PipelineFunnel } from "@/components/PipelineFunnel";

const Index = () => {
  // Temporary mock data - will be replaced with real data integration later
  const kpiData = {
    totalOpportunities: {
      value: "1,234",
      trend: 15.8,
      title: "Total Opportunities",
    },
    totalRevenue: {
      value: "$845,000",
      trend: 12.5,
      title: "Total Revenue",
    },
    avgContractValue: {
      value: "$28,500",
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold">Sales Analytics</h1>
          <p className="mt-2 text-muted-foreground">
            Track your sales performance and metrics
          </p>
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
          <TrendChart />
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