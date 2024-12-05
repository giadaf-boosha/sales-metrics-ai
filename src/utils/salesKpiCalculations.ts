import { SalesData, ChannelKPI } from '../types/sales';

const getMonthFromDate = (dateStr: string): number => {
  if (!dateStr) return 0;
  const parts = dateStr.split('/');
  if (parts.length !== 3) return 0;
  return parseInt(parts[1], 10);
};

const parseValue = (value: string | number): number => {
  if (typeof value === 'number') return value;
  return parseFloat(value.replace(/[€.]/g, '').replace(',', '.')) || 0;
};

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

export const calculateChannelKPIs = (data: SalesData[], selectedMonth: number): ChannelKPI[] => {
  // Raggruppa i dati per canale
  const channels = [...new Set(data.map(row => row.Canale))];
  
  const results = channels.map(channel => {
    const channelData = data.filter(row => row.Canale === channel);

    // Total Opps Created (Meeting effettuato + SQL = Sì)
    const totalOppsCreated = channelData.filter(row => 
      getMonthFromDate(row['Meeting Effettuato (SQL)'] as string) === selectedMonth && 
      row.SQL === 'Si'
    ).length;

    // Total Closed Lost Opps
    const totalClosedLostOpps = channelData.filter(row =>
      getMonthFromDate(row.Persi) === selectedMonth &&
      row.SQL === 'Si' &&
      row.Stato === 'Perso'
    ).length;

    // Total Closed Won Opps (Cliente + Analisi)
    const totalClosedWonOpps = 
      channelData.filter(row =>
        row.Stato === 'Cliente' &&
        getMonthFromDate(row['Contratti Chiusi']) === selectedMonth
      ).length +
      channelData.filter(row =>
        row.Stato === 'Analisi' &&
        getMonthFromDate(row['Analisi Firmate']) === selectedMonth
      ).length;

    // Total Closed Won Revenue
    const totalClosedWonRevenue = channelData.reduce((sum, row) => {
      const isRelevantMonth = 
        getMonthFromDate(row['Analisi Firmate']) === selectedMonth ||
        getMonthFromDate(row['Contratti Chiusi']) === selectedMonth;
      
      if (isRelevantMonth) {
        return sum + parseValue(row['Valore Tot €']);
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