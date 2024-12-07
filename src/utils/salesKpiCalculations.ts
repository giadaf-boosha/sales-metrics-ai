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

const isInCurrentMonth = (dateStr: string, currentMonth: number): boolean => {
  if (!dateStr) return false;
  const [_, month] = dateStr.split('/').map(Number);
  return month === currentMonth;
};

export const calculateChannelKPIs = (data: SalesData[], currentMonth: number): ChannelKPI[] => {
  const channels = [...new Set(data.map(row => row.Canale))];
  
  const results = channels.map(channel => {
    const channelData = data.filter(row => row.Canale === channel);

    // Total Opps Created
    const totalOppsCreated = channelData.filter(row => 
      row.SQL === 'Si' && 
      isInCurrentMonth(row['Meeting Effettuato (SQL)'], currentMonth)
    ).length;

    // Total Closed Lost Opps
    const totalClosedLostOpps = channelData.filter(row =>
      row.SQL === 'Si' &&
      row.Stato === 'Perso' &&
      isInCurrentMonth(row.Persi, currentMonth)
    ).length;

    // Total Closed Won Opps
    const totalClosedWonOpps = channelData.filter(row =>
      (row.Stato === 'Cliente' && isInCurrentMonth(row['Contratti Chiusi'], currentMonth)) || 
      (row.Stato === 'Analisi' && isInCurrentMonth(row['Analisi Firmate'], currentMonth))
    ).length;

    // Total Closed Won Revenue
    const totalClosedWonRevenue = channelData.reduce((sum, row) => {
      if ((row.Stato === 'Cliente' && isInCurrentMonth(row['Contratti Chiusi'], currentMonth)) || 
          (row.Stato === 'Analisi' && isInCurrentMonth(row['Analisi Firmate'], currentMonth))) {
        const value = row['Valore Tot €'].replace(/[€.]/g, '').replace(',', '.');
        return sum + (parseFloat(value) || 0);
      }
      return sum;
    }, 0);

    // ACV
    const acv = totalClosedWonOpps > 0 ? totalClosedWonRevenue / totalClosedWonOpps : 0;

    // Closed Won Average Sales Cycle
    const wonDeals = channelData.filter(row => 
      (row.Stato === 'Cliente' && isInCurrentMonth(row['Contratti Chiusi'], currentMonth)) || 
      (row.Stato === 'Analisi' && isInCurrentMonth(row['Analisi Firmate'], currentMonth))
    );

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
  });

  // Calculate pipeline contribution
  const totalRevenue = results.reduce((sum, channel) => sum + channel.totalClosedWonRevenue, 0);
  
  return results.map(result => ({
    ...result,
    pipelineContribution: totalRevenue > 0 ? (result.totalClosedWonRevenue / totalRevenue) * 100 : 0
  }));
};