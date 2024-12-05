import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SalesData {
  channel: string;
  meetingScheduled: string;
  meetingCompleted: string;
  proposalSent: string;
  contractsClosed: string;
  status: string;
  service: string;
  value: number;
  company: string;
  personName: string;
  role: string;
  sector: string;
  closingTime?: number;
  sql: string;
  lostDate: string;
}

export async function fetchSalesData(range: string): Promise<SalesData[]> {
  try {
    // First get the user's sheet configuration
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('No authenticated user found');
      toast.error('Please log in to access the dashboard');
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
      toast.error('Error fetching Google Sheet configuration');
      throw new Error('Failed to fetch sheet configuration');
    }

    if (!sheetConfig) {
      console.error('No Google Sheet configuration found');
      toast.error('Please configure your Google Sheet first');
      throw new Error('No Google Sheet configured');
    }

    console.log("Sheet config found:", {
      sheet_id: sheetConfig.sheet_id,
      sheet_name: sheetConfig.sheet_name
    });

    if (!sheetConfig.sheet_id || !sheetConfig.sheet_name) {
      console.error('Invalid sheet configuration:', sheetConfig);
      toast.error('Invalid Google Sheet configuration');
      throw new Error('Invalid sheet configuration');
    }

    // For now, use the API key directly since we're having issues with the vault
    const API_KEY = 'AIzaSyBu09MH4xCpr6hCmGK6Y28AVKvAY-K8haA';

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetConfig.sheet_id}/values/${sheetConfig.sheet_name}!A2:N?key=${API_KEY}`
    );
    
    if (!response.ok) {
      console.error('Google Sheets API error:', {
        status: response.status,
        statusText: response.statusText
      });
      const responseText = await response.text();
      console.error('Response text:', responseText);
      toast.error('Failed to fetch data from Google Sheets');
      throw new Error(`Failed to fetch data from Google Sheets: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Received data from Google Sheets:", data);
    
    if (!data.values || !Array.isArray(data.values)) {
      console.error('Invalid data format received:', data);
      toast.error('Invalid data format received from Google Sheets');
      throw new Error('Invalid data format');
    }

    const transformedData = transformSheetData(data.values);
    console.log("Transformed data:", transformedData);

    return transformedData;
  } catch (error) {
    console.error('Error fetching sales data:', error);
    throw error;
  }
}

function transformSheetData(values: any[][]): SalesData[] {
  if (!values) return [];
  
  return values.map(row => ({
    channel: row[1] || '',  // This maps to the "Canale" column
    meetingScheduled: row[2] || '',
    meetingCompleted: row[3] || '',
    proposalSent: row[4] || '',
    contractsClosed: row[5] || '',
    status: row[8] || '',
    service: row[9] || '',
    value: parseFloat(row[10]?.replace('€', '').replace(',', '')) || 0,
    company: row[11] || '',
    personName: row[12] || '',
    role: row[13] || '',
    sector: row[14] || '',
    closingTime: parseFloat(row[15] || '0'),
    sql: row[16] || '',
    lostDate: row[17] || ''
  }));
}