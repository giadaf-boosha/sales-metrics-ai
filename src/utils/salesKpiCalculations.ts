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

export const calculateChannelKPIs = (data: SalesData[]): ChannelKPI[] => {
  // Raggruppa i dati per canale
  const channels = [...new Set(data.map(row => row.Canale))];
  
  const results = channels.map(channel => {
    const channelData = data.filter(row => row.Canale === channel);

    // Total Opps Created (Meeting effettuato + SQL = Sì)
    const totalOppsCreated = channelData.filter(row => 
      row.SQL === 'Si'
    ).length;

    // Total Closed Lost Opps
    const totalClosedLostOpps = channelData.filter(row =>
      row.SQL === 'Si' &&
      row.Stato === 'Perso'
    ).length;

    // Total Closed Won Opps (Cliente + Analisi)
    const totalClosedWonOpps = 
      channelData.filter(row => row.Stato === 'Cliente').length +
      channelData.filter(row => row.Stato === 'Analisi').length;

    // Total Closed Won Revenue
    const totalClosedWonRevenue = channelData.reduce((sum, row) => {
      if (row.Stato === 'Cliente' || row.Stato === 'Analisi') {
        return sum + parseFloat(String(row['Valore Tot €']).replace(/[€.]/g, '').replace(',', '.')) || 0;
      }
      return sum;
    }, 0);

    // ACV (Average Contract Value)
    const acv = totalClosedWonOpps > 0 ? totalClosedWonRevenue / totalClosedWonOpps : 0;

    // Closed Won Average Sales Cycle
    const wonDeals = channelData.filter(row => 
      (row.Stato === 'Cliente' || row.Stato === 'Analisi') &&
      row['Meeting Effettuato (SQL)'] &&
      (row['Contratti Chiusi'] || row['Analisi Firmate'])
    );

    const avgSalesCycle = wonDeals.length > 0
      ? wonDeals.reduce((sum, row) => {
          const endDate = row.Stato === 'Cliente' ? row['Contratti Chiusi'] : row['Analisi Firmate'];
          return sum + getDaysDifference(row['Meeting Effettuato (SQL)'] as string, endDate);
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
      pipelineContribution: 0, // Sarà calcolato dopo
    };
  });

  // Calcola pipeline contribution
  const totalRevenue = results.reduce((sum, channel) => sum + channel.totalClosedWonRevenue, 0);
  return results.map(result => ({
    ...result,
    pipelineContribution: totalRevenue > 0 ? (result.totalClosedWonRevenue / totalRevenue) * 100 : 0
  }));
};