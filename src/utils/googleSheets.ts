import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SalesData } from "@/types/sales";

export type { SalesData };

const PROGRESS_EVENTS = {
  FETCH_CONFIG: { step: 1, message: "Fetching configuration..." },
  CONFIG_FOUND: { step: 2, message: "Configuration found" },
  FETCH_DATA: { step: 3, message: "Fetching data from Google Sheets..." },
  DATA_RECEIVED: { step: 4, message: "Processing data..." },
  COMPLETE: { step: 5, message: "Data loaded successfully" }
};

export type ProgressCallback = (progress: number, message: string) => void;

export async function fetchSalesData(range: string, onProgress?: ProgressCallback): Promise<any[]> {
  try {
    onProgress?.(PROGRESS_EVENTS.FETCH_CONFIG.step * 20, PROGRESS_EVENTS.FETCH_CONFIG.message);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      toast.error('Please log in to access the dashboard', { duration: 2000 });
      throw new Error('User not authenticated');
    }

    console.log("Fetching sheet config for user:", user.id);
    const { data: sheetConfig, error: configError } = await supabase
      .from('google_sheets_config')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (configError) {
      console.error('Error fetching sheet config:', configError);
      toast.error('Error fetching Google Sheet configuration', { duration: 2000 });
      throw new Error('Failed to fetch sheet configuration');
    }

    if (!sheetConfig) {
      console.error('No Google Sheet configuration found');
      toast.error('Please configure your Google Sheet first', { duration: 2000 });
      throw new Error('No Google Sheet configured');
    }

    onProgress?.(PROGRESS_EVENTS.CONFIG_FOUND.step * 20, PROGRESS_EVENTS.CONFIG_FOUND.message);
    
    console.log("Sheet config found:", {
      sheet_id: sheetConfig.sheet_id,
      sheet_name: sheetConfig.sheet_name
    });

    if (!sheetConfig.sheet_id || !sheetConfig.sheet_name) {
      console.error('Invalid sheet configuration:', sheetConfig);
      toast.error('Invalid Google Sheet configuration', { duration: 2000 });
      throw new Error('Invalid sheet configuration');
    }

    onProgress?.(PROGRESS_EVENTS.FETCH_DATA.step * 20, PROGRESS_EVENTS.FETCH_DATA.message);

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetConfig.sheet_id}/values/${sheetConfig.sheet_name}!A2:V?key=AIzaSyBu09MH4xCpr6hCmGK6Y28AVKvAY-K8haA`
    );
    
    if (!response.ok) {
      console.error('Google Sheets API error:', {
        status: response.status,
        statusText: response.statusText
      });
      const responseText = await response.text();
      console.error('Response text:', responseText);
      toast.error('Failed to fetch data from Google Sheets', { duration: 2000 });
      throw new Error(`Failed to fetch data from Google Sheets: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Received raw data from Google Sheets:", data);
    
    onProgress?.(PROGRESS_EVENTS.DATA_RECEIVED.step * 20, PROGRESS_EVENTS.DATA_RECEIVED.message);

    if (!data.values || !Array.isArray(data.values)) {
      console.error('Invalid data format received:', data);
      toast.error('Invalid data format received from Google Sheets', { duration: 2000 });
      throw new Error('Invalid data format');
    }

    onProgress?.(PROGRESS_EVENTS.COMPLETE.step * 20, PROGRESS_EVENTS.COMPLETE.message);
    return data.values;
  } catch (error) {
    console.error('Error fetching sales data:', error);
    throw error;
  }
}