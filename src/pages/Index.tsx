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
  const kpiData = {
    totalOpportunities: {
      value: salesData ? salesData.length : 0,
      title: "Opportunità Totali",
    },
    wonOpportunities: {
      value: salesData ? salesData.filter(d => d.contractsClosed === 'true').length : 0,
      title: "Opportunità Vinte",
    },
    totalRevenue: {
      value: salesData 
        ? `€${salesData.reduce((sum, d) => sum + (d.value || 0), 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
        : "€0,00",
      title: "Revenue Totale",
    },
    winRate: {
      value: salesData && salesData.length > 0
        ? `${((salesData.filter(d => d.contractsClosed === 'true').length / salesData.length) * 100).toFixed(2)}%`
        : "0,00%",
      title: "Win Rate",
    },
    lostRate: {
      value: salesData && salesData.length > 0
        ? `${((salesData.filter(d => d.status === 'Lost').length / salesData.length) * 100).toFixed(2)}%`
        : "0,00%",
      title: "Lost Rate",
    },
    pipelineVelocity: {
      value: salesData
        ? `€${(salesData.reduce((sum, d) => sum + (d.value || 0), 0) / Math.max(1, salesData.length)).toLocaleString('it-IT', { minimumFractionDigits: 2 })}`
        : "€0,00",
      title: "Pipeline Velocity",
    }
  };

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
                ? 'Configura il tuo Google Sheet sopra per visualizzare la dashboard.'
                : 'Errore nel caricamento dei dati. Riprova più tardi.'}
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