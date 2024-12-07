import { Card } from './ui/card';
import { SalesData } from '@/types/sales';
import { calculateTotalKPIs } from '@/utils/salesKpiCalculations';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { TrendingUp, TrendingDown, Target, DollarSign, Users, Timer, PieChart } from 'lucide-react';

interface MainKPISectionProps {
  salesData: SalesData[];
  currentMonth: number;
}

export const MainKPISection = ({ salesData, currentMonth }: MainKPISectionProps) => {
  const kpis = calculateTotalKPIs(salesData, currentMonth);

  const kpiCards = [
    {
      title: 'Total Closed Won Revenue',
      value: formatCurrency(kpis.totalClosedWonRevenue),
      icon: <DollarSign className="h-6 w-6 text-green-500" />,
      trend: kpis.totalClosedWonRevenue > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Win Rate',
      value: formatPercentage(kpis.winRate),
      icon: <Target className="h-6 w-6 text-blue-500" />,
      trend: kpis.winRate > 50 ? 'up' : 'down'
    },
    {
      title: 'Pipeline Velocity',
      value: formatCurrency(kpis.pipelineVelocity) + '/year',
      icon: <Timer className="h-6 w-6 text-purple-500" />,
      trend: kpis.pipelineVelocity > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Average Contract Value',
      value: formatCurrency(kpis.acv),
      icon: <PieChart className="h-6 w-6 text-orange-500" />,
      trend: kpis.acv > 0 ? 'up' : 'neutral'
    },
    {
      title: 'Total Opportunities Created',
      value: kpis.totalOppsCreated.toString(),
      icon: <Users className="h-6 w-6 text-indigo-500" />,
      trend: kpis.totalOppsCreated > 0 ? 'up' : 'neutral'
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">KPI Principali</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm text-gray-500">{kpi.title}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
              </div>
              <div className="flex items-center space-x-2">
                {kpi.icon}
                {kpi.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                {kpi.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};