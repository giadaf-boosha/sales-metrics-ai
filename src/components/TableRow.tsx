import React from 'react';
import { TableCell, TableRow as UITableRow } from '@/components/ui/table';
import { ChannelKPI } from '../types/sales';
import { cn } from '@/lib/utils';

interface TableRowProps {
  row: ChannelKPI;
  isTotal: boolean;
}

export const TableRowComponent: React.FC<TableRowProps> = ({ row, isTotal }) => {
  return (
    <UITableRow 
      className={cn(
        isTotal ? 'font-semibold bg-gray-50/50' : 'hover:bg-gray-50/30',
        'transition-colors duration-200'
      )}
    >
      <TableCell className="text-xs whitespace-nowrap">{row.source}</TableCell>
      <TableCell className="text-right text-xs whitespace-nowrap">
        {row.totalOppsCreated}
      </TableCell>
      <TableCell className="text-right text-xs whitespace-nowrap">
        {row.totalClosedLostOpps}
      </TableCell>
      <TableCell className="text-right text-xs whitespace-nowrap">
        {row.totalClosedWonOpps}
      </TableCell>
      <TableCell className="text-right text-xs whitespace-nowrap">
        €{row.totalClosedWonRevenue.toLocaleString('it-IT', {
          minimumFractionDigits: 2,
        })}
      </TableCell>
      <TableCell className="text-right text-xs whitespace-nowrap">
        €{row.acv.toLocaleString('it-IT', {
          minimumFractionDigits: 2,
        })}
      </TableCell>
      <TableCell className="text-right text-xs whitespace-nowrap">
        {Math.round(row.closedWonAvgSalesCycle)} giorni
      </TableCell>
      <TableCell className="text-right text-xs whitespace-nowrap">
        {row.winRate.toFixed(2)}%
      </TableCell>
      <TableCell className="text-right text-xs whitespace-nowrap">
        €{row.pipelineVelocity.toLocaleString('it-IT', {
          minimumFractionDigits: 2,
        })}
      </TableCell>
      <TableCell className="text-right text-xs whitespace-nowrap">
        {row.pipelineContribution.toFixed(2)}%
      </TableCell>
    </UITableRow>
  );
};