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
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

interface SummaryTableProps {
  data?: any[];
}

type SortConfig = {
  key: keyof ChannelKPI;
  direction: 'asc' | 'desc';
} | null;

export function SummaryTable({ data }: SummaryTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

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

  const channelSummary = React.useMemo(() => {
    if (!mappedData.length) return [];

    let summary = calculateChannelKPIs(mappedData);

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

    // Calculate totals
    const totals = summary.reduce((acc, curr) => ({
      source: 'Total',
      totalOppsCreated: acc.totalOppsCreated + curr.totalOppsCreated,
      totalClosedLostOpps: acc.totalClosedLostOpps + curr.totalClosedLostOpps,
      totalClosedWonOpps: acc.totalClosedWonOpps + curr.totalClosedWonOpps,
      totalClosedWonRevenue: acc.totalClosedWonRevenue + curr.totalClosedWonRevenue,
      acv: 0, // Will be calculated below
      closedWonAvgSalesCycle: 0, // Will be calculated below
      winRate: 0, // Will be calculated below
      pipelineVelocity: acc.pipelineVelocity + curr.pipelineVelocity,
      pipelineContribution: 100
    }));

    // Calculate averages for specific metrics
    totals.acv = totals.totalClosedWonOpps > 0 
      ? totals.totalClosedWonRevenue / totals.totalClosedWonOpps 
      : 0;
    
    totals.winRate = totals.totalOppsCreated > 0 
      ? (totals.totalClosedWonOpps / totals.totalOppsCreated) * 100 
      : 0;

    totals.closedWonAvgSalesCycle = summary.reduce((acc, curr) => 
      acc + (curr.closedWonAvgSalesCycle * curr.totalClosedWonOpps), 0
    ) / Math.max(totals.totalClosedWonOpps, 1);

    return [...summary, totals];
  }, [mappedData, sortConfig]);

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

      <ScrollArea className="h-[600px] rounded-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
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
                      className="flex items-center justify-end w-full hover:text-blue-600"
                    >
                      {label}
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {channelSummary.map((row, index) => (
                <TableRow 
                  key={row.source}
                  className={cn(
                    index === channelSummary.length - 1 ? 'font-semibold bg-gray-50/50' : 'hover:bg-gray-50/30',
                    'transition-colors duration-200'
                  )}
                >
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
      </ScrollArea>
    </div>
  );
}

