import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from './ui/button';
import { ArrowUpDown } from 'lucide-react';
import { ChannelKPI, TableColumn } from '../types/sales';

interface TableHeaderProps {
  onSort: (key: keyof ChannelKPI) => void;
}

export const TableHeaderComponent: React.FC<TableHeaderProps> = ({ onSort }) => {
  const columns: TableColumn[] = [
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
  ];

  return (
    <TableHeader>
      <TableRow className="bg-gray-50/50">
        {columns.map(({ key, label }) => (
          <TableHead key={key} className="text-right">
            <Button
              variant="ghost"
              onClick={() => onSort(key)}
              className="flex items-center justify-end w-full hover:text-blue-600 text-xs whitespace-nowrap"
            >
              {label}
              <ArrowUpDown className="ml-2 h-3 w-3" />
            </Button>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};