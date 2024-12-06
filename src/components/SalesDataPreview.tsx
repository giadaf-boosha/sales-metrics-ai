import React from 'react';
import { SalesData } from '../types/sales';

interface SalesDataPreviewProps {
  data: any[];
}

export const SalesDataPreview: React.FC<SalesDataPreviewProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  // Map the raw data to our expected format
  const mappedData: SalesData[] = data.map(row => ({
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

  console.log("Mapped Data Preview:", {
    firstRow: mappedData[0],
    totalRows: mappedData.length,
    rawFirstRow: data[0],
    columns: Object.keys(mappedData[0])
  });

  return null;
};