import { KpiCard } from "@/components/KpiCard";
import { SalesChart } from "@/components/SalesChart";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold">Sales Analytics</h1>
          <p className="mt-2 text-muted-foreground">
            Track your sales performance and metrics
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Total Revenue"
            value="$54,234"
            trend={12.5}
            className="[animation-delay:100ms]"
          />
          <KpiCard
            title="Total Orders"
            value="1,234"
            trend={-4.2}
            className="[animation-delay:200ms]"
          />
          <KpiCard
            title="Average Order Value"
            value="$234"
            trend={2.4}
            className="[animation-delay:300ms]"
          />
          <KpiCard
            title="Conversion Rate"
            value="3.2%"
            trend={0}
            className="[animation-delay:400ms]"
          />
        </div>

        <div className="mt-8">
          <SalesChart />
        </div>
      </div>
    </div>
  );
};

export default Index;