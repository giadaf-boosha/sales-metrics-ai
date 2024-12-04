import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { SalesData } from "@/utils/googleSheets";

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
          channel,
          totalOpportunities: 0,
          wonOpportunities: 0,
          lostOpportunities: 0,
          totalRevenue: 0,
          avgContractValue: 0,
          winRate: 0,
          avgClosingTime: 0,
          pipelineVelocity: 0
        };
      }

      acc[channel].totalOpportunities += 1;
      if (curr.contractsClosed === 'true') {
        acc[channel].wonOpportunities += 1;
      } else if (curr.status === 'Lost') {
        acc[channel].lostOpportunities += 1;
      }
      acc[channel].totalRevenue += curr.value || 0;

      return acc;
    }, {} as Record<string, any>);

    // Calculate derived metrics
    return Object.values(summary).map(channel => ({
      ...channel,
      avgContractValue: channel.wonOpportunities ? 
        (channel.totalRevenue / channel.wonOpportunities) : 0,
      winRate: channel.totalOpportunities ? 
        ((channel.wonOpportunities / channel.totalOpportunities) * 100) : 0,
      pipelineVelocity: channel.totalRevenue / (channel.avgClosingTime || 1)
    }));
  }, [data]);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold">Tabella Riepilogativa per Canale</h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>MainChannel</TableHead>
              <TableHead className="text-right">Opportunità Create</TableHead>
              <TableHead className="text-right">Opportunità Vinte</TableHead>
              <TableHead className="text-right">Opportunità Perse</TableHead>
              <TableHead className="text-right">Revenue Totale</TableHead>
              <TableHead className="text-right">Valore Medio Contratto</TableHead>
              <TableHead className="text-right">Win Rate</TableHead>
              <TableHead className="text-right">Tempo Medio di Chiusura (giorni)</TableHead>
              <TableHead className="text-right">Pipeline Velocity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {channelSummary.map((row) => (
              <TableRow key={row.channel}>
                <TableCell>{row.channel}</TableCell>
                <TableCell className="text-right">{row.totalOpportunities}</TableCell>
                <TableCell className="text-right">{row.wonOpportunities}</TableCell>
                <TableCell className="text-right">{row.lostOpportunities}</TableCell>
                <TableCell className="text-right">€{row.totalRevenue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-right">€{row.avgContractValue.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-right">{row.winRate.toFixed(2)}%</TableCell>
                <TableCell className="text-right">{row.avgClosingTime || 'N/A'}</TableCell>
                <TableCell className="text-right">€{row.pipelineVelocity.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}