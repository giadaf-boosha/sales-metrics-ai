import { sheets_v4 } from '@googleapis/sheets';
import { supabase } from "@/integrations/supabase/client";

const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

export interface SalesData {
  sales: string;
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
}

export async function fetchSalesData(range: string): Promise<SalesData[]> {
  try {
    // First get the user's sheet configuration
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: sheetConfig, error: configError } = await supabase
      .from('google_sheets_config')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (configError || !sheetConfig) {
      throw new Error('No Google Sheet configured');
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetConfig.sheet_id}/values/${sheetConfig.sheet_name}!A2:N?key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch data from Google Sheets');
    }

    const data = await response.json();
    const transformedData = transformSheetData(data.values);

    // Log the second and last rows if they exist
    if (transformedData.length >= 2) {
      console.log('Second row of data:', transformedData[1]);
    }
    if (transformedData.length > 0) {
      console.log('Last row of data:', transformedData[transformedData.length - 1]);
    }

    return transformedData;
  } catch (error) {
    console.error('Error fetching sales data:', error);
    throw error;
  }
}

function transformSheetData(values: any[][]): SalesData[] {
  if (!values) return [];
  
  return values.map(row => ({
    sales: row[0] || '',
    channel: row[1] || '',
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
    sector: row[14] || ''
  }));
}