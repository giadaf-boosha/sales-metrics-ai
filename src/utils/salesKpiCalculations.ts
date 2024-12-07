import { SalesData, ChannelKPI } from '../types/sales';

const getDaysDifference = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  
  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year < 100 ? 2000 + year : year, month - 1, day);
  };

  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

const getMonthFromDate = (dateStr: string): number => {
  if (!dateStr || typeof dateStr !== 'string') return 0;
  const cleanDate = dateStr.trim();
  if (!cleanDate) return 0;
  
  try {
    const [_, month] = cleanDate.split('/').map(Number);
    return month >= 1 && month <= 12 ? month : 0;
  } catch (error) {
    console.error('Error parsing date:', dateStr);
    return 0;
  }
};

const parseEuroValue = (value: string): number => {
  if (!value) return 0;
  // Remove € symbol, dots for thousands and replace comma with dot for decimal
  const cleanValue = value.replace(/[€.]/g, '').replace(',', '.').trim();
  return parseFloat(cleanValue) || 0;
};

export const calculateChannelKPIs = (data: SalesData[], currentMonth: number): ChannelKPI[] => {
  if (!data || !currentMonth) {
    console.warn('Missing data or currentMonth in calculateChannelKPIs');
    return [];
  }

  const channels = [...new Set(data.map(row => row.Canale))];
  
  const results = channels.map(channel => {
    const channelData = data.filter(row => row.Canale === channel);

    // Total Opps Created (SQL = Si nel mese corrente)
    const totalOppsCreated = channelData.filter(row => 
      row.SQL === 'Si' && 
      getMonthFromDate(row['Meeting Effettuato (SQL)']) === currentMonth
    ).length;

    // Total Closed Lost Opps
    const totalClosedLostOpps = channelData.filter(row =>
      row.SQL === 'Si' &&
      row.Stato === 'Perso' &&
      getMonthFromDate(row.Persi) === currentMonth
    ).length;

    // Total Closed Won Opps
    const closedAsClient = channelData.filter(row =>
      row.Stato === 'Cliente' && 
      getMonthFromDate(row['Contratti Chiusi']) === currentMonth
    ).length;

    const closedAsAnalysis = channelData.filter(row =>
      row.Stato === 'Analisi' && 
      getMonthFromDate(row['Analisi Firmate']) === currentMonth
    ).length;

    const totalClosedWonOpps = closedAsClient + closedAsAnalysis;

    // Total Closed Won Revenue
    const totalClosedWonRevenue = channelData.reduce((sum, row) => {
      if (row.Stato === 'Cliente' && getMonthFromDate(row['Contratti Chiusi']) === currentMonth) {
        return sum + parseEuroValue(row['Valore Tot €']);
      }
      if (row.Stato === 'Analisi' && getMonthFromDate(row['Analisi Firmate']) === currentMonth) {
        return sum + parseEuroValue(row['Valore Tot €']);
      }
      return sum;
    }, 0);

    // ACV (Average Contract Value)
    const acv = totalClosedWonOpps > 0 ? totalClosedWonRevenue / totalClosedWonOpps : 0;

    // Closed Won Average Sales Cycle
    const wonDeals = channelData.filter(row => {
      if (row.Stato === 'Cliente' && getMonthFromDate(row['Contratti Chiusi']) === currentMonth) {
        return true;
      }
      if (row.Stato === 'Analisi' && getMonthFromDate(row['Analisi Firmate']) === currentMonth) {
        return true;
      }
      return false;
    });

    const avgSalesCycle = wonDeals.length > 0
      ? wonDeals.reduce((sum, row) => {
          const endDate = row.Stato === 'Cliente' ? row['Contratti Chiusi'] : row['Analisi Firmate'];
          return sum + getDaysDifference(row['Meeting Effettuato (SQL)'], endDate);
        }, 0) / wonDeals.length
      : 0;

    // Win Rate
    const totalOpps = totalClosedWonOpps + totalClosedLostOpps;
    const winRate = totalOpps > 0 ? (totalClosedWonOpps / totalOpps) * 100 : 0;

    // Pipeline Velocity
    const pipelineVelocity = avgSalesCycle > 0
      ? (totalOppsCreated * (winRate / 100) * acv) / (avgSalesCycle / 365)
      : 0;

    return {
      source: channel,
      totalOppsCreated,
      totalClosedLostOpps,
      totalClosedWonOpps,
      totalClosedWonRevenue,
      acv,
      closedWonAvgSalesCycle: avgSalesCycle,
      winRate,
      pipelineVelocity,
      pipelineContribution: 0,
    };
  }).filter(result => result.source); // Remove empty channels

  // Calculate pipeline contribution
  const totalRevenue = results.reduce((sum, channel) => sum + channel.totalClosedWonRevenue, 0);
  
  return results.map(result => ({
    ...result,
    pipelineContribution: totalRevenue > 0 ? (result.totalClosedWonRevenue / totalRevenue) * 100 : 0
  }));
};