import { Card } from './ui/card';
import { SalesData } from '@/types/sales';
import { calculateChannelKPIs } from '@/utils/salesKpiCalculations';
import { formatCurrency, formatPercentage } from '@/utils/formatters';

interface ChannelProductPerformanceProps {
  salesData: SalesData[];
  currentMonth: number;
}

export const ChannelProductPerformance = ({ salesData, currentMonth }: ChannelProductPerformanceProps) => {
  const channelKPIs = calculateChannelKPIs(salesData, currentMonth);

  // Raggruppa i dati per servizio
  const productPerformance = salesData.reduce((acc, row) => {
    if (!row.Servizio) return acc;
    
    const isWon = (row.Stato === 'Cliente' && row['Contratti Chiusi']) || 
                 (row.Stato === 'Analisi' && row['Analisi Firmate']);
    
    if (!acc[row.Servizio]) {
      acc[row.Servizio] = {
        totalRevenue: 0,
        totalDeals: 0,
        avgDealSize: 0
      };
    }

    if (isWon) {
      const revenue = parseFloat(row['Valore Tot €'].replace('€', '').replace('.', '').replace(',', '.'));
      acc[row.Servizio].totalRevenue += revenue;
      acc[row.Servizio].totalDeals += 1;
    }

    return acc;
  }, {} as Record<string, { totalRevenue: number; totalDeals: number; avgDealSize: number }>);

  // Calcola l'average deal size per ogni prodotto
  Object.keys(productPerformance).forEach(product => {
    const { totalRevenue, totalDeals } = productPerformance[product];
    productPerformance[product].avgDealSize = totalDeals > 0 ? totalRevenue / totalDeals : 0;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Channel Performance</h3>
        <div className="space-y-4">
          {channelKPIs.map((kpi, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{kpi.source}</span>
                <span>{formatCurrency(kpi.totalClosedWonRevenue)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Win Rate: {formatPercentage(kpi.winRate)}</span>
                <span>Deals: {kpi.totalClosedWonOpps}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${kpi.pipelineContribution}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Product Performance</h3>
        <div className="space-y-4">
          {Object.entries(productPerformance)
            .sort(([, a], [, b]) => b.totalRevenue - a.totalRevenue)
            .map(([product, metrics], index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{product}</span>
                  <span>{formatCurrency(metrics.totalRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Avg Deal: {formatCurrency(metrics.avgDealSize)}</span>
                  <span>Deals: {metrics.totalDeals}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ 
                      width: `${(metrics.totalRevenue / Math.max(...Object.values(productPerformance)
                        .map(p => p.totalRevenue))) * 100}%` 
                    }}
                  />
                </div>
              </div>
          ))}
        </div>
      </Card>
    </div>
  );
};