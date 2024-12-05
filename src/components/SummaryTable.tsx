import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SalesDataPreview } from './SalesDataPreview';
import { calculateChannelKPIs } from '../utils/salesKpiCalculations';
import { SalesData, ChannelKPI } from '../types/sales';
import { ArrowUpDown } from 'lucide-react';
import { Button } from './ui/button';

interface SummaryTableProps {
  data?: any[];
  selectedMonth: number;
}

type SortConfig = {
  key: keyof ChannelKPI;
  direction: 'asc' | 'desc';
} | null;

export function SummaryTable({ data, selectedMonth }: SummaryTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Mappatura dei dati
  const mappedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((row): SalesData => ({
      ID: row[0] || '',
      Sales: row[1] || '',
      Canale: row[2] || '',
      'Meeting Fissato': row[3] || '',
      'Meeting Effettuato (SQL)': row[4] || '',
      'Offerte Inviate': row[5] || '',
      'Analisi Firmate': row[6] || '',
      'Contratti Chiusi': row[7] || '',
      Persi: row[8] || '',
      SQL: row[9] || '',
      Stato: row[10] || '',
      Servizio: row[11] || '',
      'Valore Tot €': row[12] || '',
      Azienda: row[13] || '',
      'Nome Persona': row[14] || '',
      Ruolo: row[15] || '',
      Dimensioni: row[16] || '',
      Settore: row[17] || '',
      'Come mai ha accettato?': row[18] || '',
      Obiezioni: row[19] || '',
      Note: row[20] || ''
    }));
  }, [data]);

  // Calcolo KPI e ordinamento
  const channelSummary = React.useMemo(() => {
    if (!mappedData.length) return [];

    let summary = calculateChannelKPIs(mappedData, selectedMonth);

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

    return summary;
  }, [mappedData, selectedMonth, sortConfig]);

  const handleSort = (key: keyof ChannelKPI) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold">
        Tabella Riepilogativa per Canale
      </h3>

      <SalesDataPreview data={mappedData} />

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {[
                { key: 'source', label: 'Source' },
                { key: 'totalOppsCreated', label: 'Total Opps. created' },
                { key: 'totalClosedLostOpps', label: 'Total Closed Lost Opps.' },
                { key: 'totalClosedWonOpps', label: 'Total Closed Won Opps.' },
                { key: 'totalClosedWonRevenue', label: 'Total Closed Won Revenue' },
                { key: 'acv', label: 'ACV' },
                { key: 'closedWonAvgSalesCycle', label: 'Closed Won Avg. Sales Cycle' },
                { key: 'winRate', label: 'Win-Rate' },
                { key: 'pipelineVelocity', label: 'Pipeline Velocity' },
                { key: 'pipelineContribution', label: '% of pipeline contribution' }
              ].map(({ key, label }) => (
                <TableHead key={key} className="text-right">
                  <Button
                    variant="ghost"
                    onClick={() => handleSort(key as keyof ChannelKPI)}
                    className="flex items-center justify-end w-full"
                  >
                    {label}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {channelSummary.map((row) => (
              <TableRow key={row.source}>
                <TableCell>{row.source}</TableCell>
                <TableCell className="text-right">
                  {row.totalOppsCreated}
                </TableCell>
                <TableCell className="text-right">
                  {row.totalClosedLostOpps}
                </TableCell>
                <TableCell className="text-right">
                  {row.totalClosedWonOpps}
                </TableCell>
                <TableCell className="text-right">
                  €{row.totalClosedWonRevenue.toLocaleString('it-IT', {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  €{row.acv.toLocaleString('it-IT', {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {Math.round(row.closedWonAvgSalesCycle)} giorni
                </TableCell>
                <TableCell className="text-right">
                  {row.winRate.toFixed(2)}%
                </TableCell>
                <TableCell className="text-right">
                  €{row.pipelineVelocity.toLocaleString('it-IT', {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {row.pipelineContribution.toFixed(2)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}