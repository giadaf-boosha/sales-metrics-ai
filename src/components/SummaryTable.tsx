import React, { useState } from 'react';
import {
  Table,
  TableBody,
} from '@/components/ui/table';
import { calculateChannelKPIs, calculateTotalKPIs } from '../utils/salesKpiCalculations';
import { SalesData, ChannelKPI } from '../types/sales';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { TableHeaderComponent } from './TableHeader';
import { TableRowComponent } from './TableRow';

interface SummaryTableProps {
  data?: any[];
  currentMonth: number;
}

type SortConfig = {
  key: keyof ChannelKPI;
  direction: 'asc' | 'desc';
} | null;

export function SummaryTable({ data, currentMonth }: SummaryTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const mappedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map((row): SalesData => ({
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
  }, [data]);

  const channelSummary = React.useMemo(() => {
    if (!mappedData.length) return [];

    let summary = calculateChannelKPIs(mappedData, currentMonth);

    if (sortConfig) {
      summary.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        const direction = sortConfig.direction === 'asc' ? 1 : -1;
        
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return (aValue - bValue) * direction;
        }
        return String(aValue).localeCompare(String(bValue)) * direction;
      });
    }

    // Usa calculateTotalKPIs invece di calcolare i totali dalla somma
    const totals = calculateTotalKPIs(mappedData, currentMonth);
    return [...summary.filter(item => item.source !== 'Total'), totals];
  }, [mappedData, sortConfig, currentMonth]);

  const handleSort = (key: keyof ChannelKPI) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="rounded-xl bg-white/80 backdrop-blur-lg p-6 shadow-lg border border-gray-100">
      <h3 className="mb-6 text-xl font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
        Channel Performance Summary
      </h3>

      <div className="relative overflow-hidden">
        <ScrollArea className="h-[calc(100vh-24rem)]">
          <div className="min-w-[1500px]">
            <Table>
              <TableHeaderComponent onSort={handleSort} />
              <TableBody>
                {channelSummary.map((row, index) => (
                  <TableRowComponent 
                    key={row.source}
                    row={row}
                    isTotal={index === channelSummary.length - 1}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
}