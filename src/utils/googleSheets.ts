import { sheets_v4 } from '@googleapis/sheets';

const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

export interface SalesData {
  month: string;
  revenue: number;
  opportunities: number;
  sales: number;
}

export async function fetchSalesData(range: string): Promise<SalesData[]> {
  try {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}?key=${API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch data from Google Sheets');
    }

    const data = await response.json();
    return transformSheetData(data.values);
  } catch (error) {
    console.error('Error fetching sales data:', error);
    throw error;
  }
}

function transformSheetData(values: any[][]): SalesData[] {
  // Skip header row
  const dataRows = values.slice(1);
  
  return dataRows.map(row => ({
    month: row[0],
    revenue: Number(row[1]),
    opportunities: Number(row[2]),
    sales: Number(row[3])
  }));
}