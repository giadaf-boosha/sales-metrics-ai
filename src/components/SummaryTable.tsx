import React, { useState } from 'react';
import {
  Table,
  TableBody,
} from '@/components/ui/table';
import { calculateChannelKPIs } from '../utils/salesKpiCalculations';
import { SalesData, ChannelKPI } from '../types/sales';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { TableHeaderComponent } from './TableHeader';
import { TableRowComponent } from './TableRow';

interface SummaryTableProps {
  data?: any[];
  meetingMonth?: number;
  contractMonth?: number;
}

type SortConfig = {
  key: keyof ChannelKPI;
  direction: 'asc' | 'desc';
} | null;

const getMonthFromDate = (dateStr: string): number => {
  if (!dateStr) return 0;
  const [day, month] = dateStr.split('/').map(Number);
  return month;
};

export function SummaryTable({ data, meetingMonth, contractMonth }: SummaryTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const mappedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data
      .map((row): SalesData => ({
        ID: row[0] || '',
        Sales: row[1] || '',
        Canale: row[2] || '',
        'Meeting Fissato': row[3] || '',
        'Meeting Effettuato (SQL)': row[4] || '',
        'Offerte Inviate': row[5] || '',
        'Analisi Firmate': row[6] || '',
        'Contratti Chiusi': row[7] || '',
        Persi: row[8] || '',
        'Nome Persona': row[9] || '',
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
      }))
      .filter(row => {
        const meetingDateMonth = getMonthFromDate(row['Meeting Fissato']);
        const contractDateMonth = getMonthFromDate(row['Contratti Chiusi']);
        
        const meetingMatch = !meetingMonth || meetingDateMonth === meetingMonth;
        const contractMatch = !contractMonth || contractDateMonth === contractMonth;
        
        return meetingMatch && contractMatch;
      });
  }, [data, meetingMonth, contractMonth]);

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
      acv: 0,
      closedWonAvgSalesCycle: 0,
      winRate: 0,
      pipelineVelocity: acc.pipelineVelocity + curr.pipelineVelocity,
      pipelineContribution: 100
    }), {
      source: 'Total',
      totalOppsCreated: 0,
      totalClosedLostOpps: 0,
      totalClosedWonOpps: 0,
      totalClosedWonRevenue: 0,
      acv: 0,
      closedWonAvgSalesCycle: 0,
      winRate: 0,
      pipelineVelocity: 0,
      pipelineContribution: 0
    });

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