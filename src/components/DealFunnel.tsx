import { Card } from './ui/card';
import { SalesData } from '@/types/sales';
import { formatPercentage } from '@/utils/formatters';

interface DealFunnelProps {
  salesData: SalesData[];
  currentMonth: number;
}

export const DealFunnel = ({ salesData, currentMonth }: DealFunnelProps) => {
  // Calcola le metriche del funnel
  const getMonthFromDate = (dateStr: string): number => {
    if (!dateStr) return 0;
    const [, month] = dateStr.split('/').map(Number);
    return month || 0;
  };

  const totalMeetings = salesData.filter(row => 
    getMonthFromDate(row['Meeting Fissato']) === currentMonth
  ).length;

  const totalSQL = salesData.filter(row => 
    getMonthFromDate(row['Meeting Effettuato (SQL)']) === currentMonth && 
    row.SQL === 'Si'
  ).length;

  const totalProposals = salesData.filter(row =>
    getMonthFromDate(row['Offerte Inviate']) === currentMonth
  ).length;

  const totalClosedWon = salesData.filter(row =>
    (row.Stato === 'Cliente' && getMonthFromDate(row['Contratti Chiusi']) === currentMonth) ||
    (row.Stato === 'Analisi' && getMonthFromDate(row['Analisi Firmate']) === currentMonth)
  ).length;

  // Calcola le percentuali di conversione
  const sqlConversion = totalMeetings > 0 ? (totalSQL / totalMeetings) * 100 : 0;
  const proposalConversion = totalSQL > 0 ? (totalProposals / totalSQL) * 100 : 0;
  const closedConversion = totalProposals > 0 ? (totalClosedWon / totalProposals) * 100 : 0;

  const stages = [
    { name: 'Meeting Fissati', value: totalMeetings, width: '100%' },
    { name: 'SQL', value: totalSQL, width: '80%', conversion: sqlConversion },
    { name: 'Offerte Inviate', value: totalProposals, width: '60%', conversion: proposalConversion },
    { name: 'Chiusi Vinti', value: totalClosedWon, width: '40%', conversion: closedConversion },
  ];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Deal Conversion Funnel</h3>
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{stage.name}</span>
              <div className="space-x-2">
                <span className="font-medium">{stage.value}</span>
                {index > 0 && (
                  <span className="text-gray-500">
                    ({formatPercentage(stage.conversion!)} conv.)
                  </span>
                )}
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: stage.width }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};