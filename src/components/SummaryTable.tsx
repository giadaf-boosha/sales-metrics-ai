import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SalesData } from '@/utils/googleSheets';

interface SummaryTableProps {
  data?: SalesData[];
}

export function SummaryTable({ data }: SummaryTableProps) {
  const channelSummary = React.useMemo(() => {
    if (!data) return [];

    const summary = data.reduce((acc, curr) => {
      const channel = curr.channel || 'Other';
      if (!acc[channel]) {
        acc[channel] = {
          source: channel,
          totalOppsCreated: 0,
          totalClosedLostOpps: 0,
          totalClosedWonOpps: 0,
          totalClosedWonRevenue: 0,
          acv: 0,
          closedWonAvgSalesCycle: 0,
          winRate: 0,
          pipelineVelocity: 0,
          pipelineContribution: 0,
          totalSalesCycleDays: 0,
        };
      }

      // Total Opps Created
      if (
        curr.channel === channel &&
        curr.meetingCompleted &&
        curr.sql === 'Sì'
      ) {
        acc[channel].totalOppsCreated += 1;
      }

      // Total Closed Lost Opps
      if (
        curr.channel === channel &&
        curr.lostDate &&
        curr.status === 'Perso'
      ) {
        acc[channel].totalClosedLostOpps += 1;
      }

      // Total Closed Won Opps & Revenue
      if (
        curr.channel === channel &&
        curr.contractsClosed &&
        curr.status === 'Cliente'
      ) {
        acc[channel].totalClosedWonOpps += 1;
        acc[channel].totalClosedWonRevenue += curr.value || 0;

        // Calculate sales cycle for won opportunities
        if (curr.meetingCompleted) {
          const closingDate = new Date(curr.contractsClosed);
          const meetingDate = new Date(curr.meetingCompleted);
          const salesCycleDays = Math.floor(
            (closingDate.getTime() - meetingDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          acc[channel].totalSalesCycleDays += salesCycleDays;
        }
      }

      return acc;
    }, {} as Record<string, any>);

    // Calculate derived metrics for each channel
    const totalPipelineValue = Object.values(summary).reduce(
      (total: number, channel: any) => total + channel.totalClosedWonRevenue,
      0
    );

    return Object.values(summary).map((channel) => {
      const totalOpps =
        channel.totalClosedWonOpps + channel.totalClosedLostOpps;
      const winRate =
        totalOpps > 0 ? channel.totalClosedWonOpps / totalOpps : 0;
      const avgSalesCycle =
        channel.totalClosedWonOpps > 0
          ? channel.totalSalesCycleDays / channel.totalClosedWonOpps
          : 0;
      const acv =
        channel.totalClosedWonOpps > 0
          ? channel.totalClosedWonRevenue / channel.totalClosedWonOpps
          : 0;

      // Pipeline Velocity calculation
      const pipelineVelocity =
        avgSalesCycle > 0
          ? (channel.totalOppsCreated * winRate * acv) /
            (avgSalesCycle / 365)
          : 0;

      return {
        ...channel,
        acv,
        closedWonAvgSalesCycle: avgSalesCycle,
        winRate: winRate * 100,
        pipelineVelocity,
        pipelineContribution:
          totalPipelineValue > 0
            ? (channel.totalClosedWonRevenue / totalPipelineValue) * 100
            : 0,
      };
    });
  }, [data]);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold">
        Tabella Riepilogativa per Canale
      </h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Total Opps. created</TableHead>
              <TableHead className="text-right">
                Total Closed Lost Opps.
              </TableHead>
              <TableHead className="text-right">
                Total Closed Won Opps.
              </TableHead>
              <TableHead className="text-right">
                Total Closed Won Revenue
              </TableHead>
              <TableHead className="text-right">ACV</TableHead>
              <TableHead className="text-right">
                Closed Won Avg. Sales Cycle
              </TableHead>
              <TableHead className="text-right">Win-Rate</TableHead>
              <TableHead className="text-right">Pipeline Velocity</TableHead>
              <TableHead className="text-right">
                % of pipeline contribution
              </TableHead>
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
                  €
                  {row.totalClosedWonRevenue.toLocaleString('it-IT', {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  €
                  {row.acv.toLocaleString('it-IT', {
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
                  €
                  {row.pipelineVelocity.toLocaleString('it-IT', {
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
