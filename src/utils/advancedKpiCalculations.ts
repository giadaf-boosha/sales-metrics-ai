import { SalesData } from '@/types/sales';
import { getMonthFromDate, parseMonetaryValue } from './dateUtils';

interface TrendData {
  value: number;
  isPositive: boolean;
}

interface FunnelStep {
  label: string;
  value: number;
  percentage: number;
}

interface PerformanceData {
  name: string;
  revenue: number;
  opportunities: number;
  winRate: number;
}

export interface AdvancedKPIs {
  totalClosedWonRevenue: number;
  revenueTrend: TrendData;
  winRate: number;
  winRateTrend: TrendData;
  pipelineVelocity: number;
  velocityTrend: TrendData;
  acv: number;
  acvTrend: TrendData;
  opportunitiesTrend: Array<{ month: string; value: number }>;
  funnelData: FunnelStep[];
  channelPerformance: PerformanceData[];
  productPerformance: PerformanceData[];
}

export function calculateAdvancedKPIs(data: SalesData[], currentMonth: number): AdvancedKPIs {
  // Filtra i dati per il mese corrente e quello precedente
  const currentMonthData = data.filter(row => getMonthFromDate(row['Meeting Effettuato (SQL)']) === currentMonth);
  const previousMonthData = data.filter(row => getMonthFromDate(row['Meeting Effettuato (SQL)']) === (currentMonth - 1 || 12));

  // Calcola Total Closed Won Revenue
  const calculateRevenue = (monthData: SalesData[]) => {
    return monthData.reduce((sum, row) => {
      if ((row.Stato === 'Cliente' || row.Stato === 'Analisi') && row['Valore Tot €']) {
        return sum + parseMonetaryValue(row['Valore Tot €']);
      }
      return sum;
    }, 0);
  };

  const currentRevenue = calculateRevenue(currentMonthData);
  const previousRevenue = calculateRevenue(previousMonthData);
  const revenueTrend = {
    value: previousRevenue ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0,
    isPositive: currentRevenue >= previousRevenue
  };

  // Calcola Win Rate
  const calculateWinRate = (monthData: SalesData[]) => {
    const wonDeals = monthData.filter(row => row.Stato === 'Cliente' || row.Stato === 'Analisi').length;
    const totalDeals = monthData.filter(row => row.SQL === 'Si').length;
    return totalDeals ? (wonDeals / totalDeals) * 100 : 0;
  };

  const currentWinRate = calculateWinRate(currentMonthData);
  const previousWinRate = calculateWinRate(previousMonthData);
  const winRateTrend = {
    value: previousWinRate ? ((currentWinRate - previousWinRate) / previousWinRate) * 100 : 0,
    isPositive: currentWinRate >= previousWinRate
  };

  // Calcola Pipeline Velocity
  const calculateVelocity = (monthData: SalesData[]) => {
    const avgDealSize = calculateRevenue(monthData) / monthData.filter(row => row.Stato === 'Cliente' || row.Stato === 'Analisi').length || 0;
    const winRate = calculateWinRate(monthData) / 100;
    const opportunities = monthData.filter(row => row.SQL === 'Si').length;
    return avgDealSize * winRate * opportunities;
  };

  const currentVelocity = calculateVelocity(currentMonthData);
  const previousVelocity = calculateVelocity(previousMonthData);
  const velocityTrend = {
    value: previousVelocity ? ((currentVelocity - previousVelocity) / previousVelocity) * 100 : 0,
    isPositive: currentVelocity >= previousVelocity
  };

  // Calcola ACV
  const calculateACV = (monthData: SalesData[]) => {
    const revenue = calculateRevenue(monthData);
    const wonDeals = monthData.filter(row => row.Stato === 'Cliente' || row.Stato === 'Analisi').length;
    return wonDeals ? revenue / wonDeals : 0;
  };

  const currentACV = calculateACV(currentMonthData);
  const previousACV = calculateACV(previousMonthData);
  const acvTrend = {
    value: previousACV ? ((currentACV - previousACV) / previousACV) * 100 : 0,
    isPositive: currentACV >= previousACV
  };

  // Calcola Opportunities Trend
  const opportunitiesTrend = Array.from({ length: 6 }, (_, i) => {
    const month = ((currentMonth - i + 11) % 12) + 1;
    const monthData = data.filter(row => getMonthFromDate(row['Meeting Effettuato (SQL)']) === month);
    return {
      month: new Date(2024, month - 1).toLocaleString('it-IT', { month: 'short' }),
      value: monthData.filter(row => row.SQL === 'Si').length
    };
  }).reverse();

  // Calcola Deal Conversion Funnel
  const funnelData = [
    {
      label: 'Meeting Fissati',
      value: currentMonthData.filter(row => row['Meeting Fissato']).length,
      percentage: 100
    },
    {
      label: 'SQL',
      value: currentMonthData.filter(row => row.SQL === 'Si').length,
      percentage: 0
    },
    {
      label: 'Offerte Inviate',
      value: currentMonthData.filter(row => row['Offerte Inviate']).length,
      percentage: 0
    },
    {
      label: 'Chiusi',
      value: currentMonthData.filter(row => row.Stato === 'Cliente' || row.Stato === 'Analisi').length,
      percentage: 0
    }
  ];

  // Calcola le percentuali del funnel
  funnelData.forEach((step, i) => {
    if (i > 0) {
      step.percentage = (step.value / funnelData[0].value) * 100;
    }
  });

  // Calcola Channel Performance
  const channels = Array.from(new Set(data.map(row => row.Canale)));
  const channelPerformance = channels.map(channel => {
    const channelData = currentMonthData.filter(row => row.Canale === channel);
    return {
      name: channel,
      revenue: calculateRevenue(channelData),
      opportunities: channelData.filter(row => row.SQL === 'Si').length,
      winRate: calculateWinRate(channelData)
    };
  });

  // Calcola Product Performance
  const products = Array.from(new Set(data.map(row => row.Servizio)));
  const productPerformance = products.map(product => {
    const productData = currentMonthData.filter(row => row.Servizio === product);
    return {
      name: product,
      revenue: calculateRevenue(productData),
      opportunities: productData.filter(row => row.SQL === 'Si').length,
      winRate: calculateWinRate(productData)
    };
  });

  return {
    totalClosedWonRevenue: currentRevenue,
    revenueTrend,
    winRate: currentWinRate,
    winRateTrend,
    pipelineVelocity: currentVelocity,
    velocityTrend,
    acv: currentACV,
    acvTrend,
    opportunitiesTrend,
    funnelData,
    channelPerformance,
    productPerformance
  };
}