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
import { SalesData } from "@/types/sales";
import { Progress } from "@/components/ui/progress";
import { KPISection } from "@/components/KPISection";

const Index = () => {
  const [timeRange, setTimeRange] = useState("month");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [meetingMonth, setMeetingMonth] = useState<number | undefined>(undefined);
  const [contractMonth, setContractMonth] = useState<number | undefined>(undefined);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");
  const navigate = useNavigate();
  
  const { data: rawData, isLoading, error } = useQuery({
    queryKey: ["sales", timeRange],
    queryFn: () => fetchSalesData(timeRange, (progress, message) => {
      setLoadingProgress(progress);
      setLoadingMessage(message);
    }),
    retry: false,
    meta: {
      onSuccess: () => {
        toast.success("Data loaded successfully!", { duration: 2000 });
      }
    }
  });

  const salesData = rawData?.map((row): SalesData => ({
    ID: row[0] || '',
    'Nome Persona': row[1] || '',
    Canale: row[2] || '',
    'Meeting Fissato': row[3] || '',
    'Meeting Effettuato (SQL)': row[4] || '',
    'Offerte Inviate': row[5] || '',
    'Analisi Firmate': row[6] || '',
    'Contratti Chiusi': row[7] || '',
    Persi: row[8] || '',
    Sales: row[9] || '',
    Azienda: row[10] || '',
    SQL: row[11] || '',
    Stato: row[12] || '',
    Servizio: row[13] || '',
    'Valore Tot €': row[14] || '',
    Settore: row[15] || '',
    'Come mai ha accettato?': row[16] || '',
    Ruolo: row[17] || '',
    Dimensioni: row[18] || '',
    Obiezioni: row[19] || '',
    Note: row[20] || ''
  }));

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleFilterChange = (value: string) => {
    setTimeRange(value);
    toast.info(`Updating dashboard for period: ${value}`, { duration: 2000 });
  };

  const handleMonthChange = (month: number) => {
    setCurrentMonth(month);
  };

  const handleDateFilterChange = (type: string, month: number) => {
    if (type === 'meeting') {
      setMeetingMonth(month);
    } else if (type === 'contract') {
      setContractMonth(month);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="mx-auto max-w-[90rem]">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Sales Analytics
              </h1>
              <p className="mt-2 text-gray-600">
                Monitor your sales performance metrics
              </p>
            </div>
            <div className="flex items-center gap-4">
              <TimeRangeFilter 
                onFilterChange={handleFilterChange}
                onMonthChange={handleMonthChange}
                onDateFilterChange={handleDateFilterChange}
              />
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-md hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <GoogleSheetsConfig />

        {isLoading && loadingProgress > 0 && (
          <div className="mb-8 space-y-2 animate-fade-in">
            <Progress value={loadingProgress} className="w-full h-2" />
            <p className="text-sm text-gray-500 text-center">{loadingMessage}</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-8">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error && error.message === 'No Google Sheet configured'
                ? 'Configure your Google Sheet above to view the dashboard.'
                : 'Error loading data. Please try again later.'}
            </AlertDescription>
          </Alert>
        )}

        {!error && salesData && (
          <>
            <KPISection 
              salesData={salesData} 
              meetingMonth={meetingMonth}
              contractMonth={contractMonth}
            />
            <div className="mt-8">
              <SummaryTable 
                data={rawData} 
                meetingMonth={meetingMonth}
                contractMonth={contractMonth}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Index;