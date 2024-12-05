import { SalesData } from '../types/sales';

export const calculateChannelKPIs = (data: SalesData[]) => {
  // Raggruppa i dati per canale
  const channelGroups = data.reduce((acc, curr) => {
    const channel = curr.Canale || 'Other';
    if (!acc[channel]) {
      acc[channel] = [];
    }
    acc[channel].push(curr);
    return acc;
  }, {} as Record<string, SalesData[]>);

  return Object.entries(channelGroups).map(([channel, channelData]) => {
    // Total Opps Created (Meeting effettuato + SQL = Sì)
    const totalOppsCreated = channelData.filter(
      row => row['Meeting Effettuato (SQL)'] && row.SQL === 'Sì'
    ).length;

    // Total Closed Lost Opps (Persi + Stato = Perso)
    const totalClosedLostOpps = channelData.filter(
      row => row.Persi && row.Stato === 'Perso'
    ).length;

    // Total Closed Won Opps (Contratti Chiusi + Stato = Cliente)
    const totalClosedWonOpps = channelData.filter(
      row => row['Contratti Chiusi'] && row.Stato === 'Cliente'
    ).length;

    // Total Closed Won Revenue
    const totalClosedWonRevenue = channelData.reduce((sum, row) => {
      if (row['Contratti Chiusi'] && row.Stato === 'Cliente') {
        const value = typeof row['Valore Tot €'] === 'string' 
          ? parseFloat(row['Valore Tot €'].replace(/[€.]/g, '').replace(',', '.'))
          : row['Valore Tot €'];
        return sum + (value || 0);
      }
      return sum;
    }, 0);

    // ACV (Average Contract Value)
    const acv = totalClosedWonOpps > 0 ? totalClosedWonRevenue / totalClosedWonOpps : 0;

    // Closed Won Average Sales Cycle
    const salesCycles = channelData
      .filter(row => row['Contratti Chiusi'] && row.Stato === 'Cliente' && row['Meeting Effettuato (SQL)'])
      .map(row => {
        const meetingDate = parseDate(row['Meeting Effettuato (SQL)'] as string);
        const closingDate = parseDate(row['Contratti Chiusi']);
        if (meetingDate && closingDate) {
          return Math.floor((closingDate.getTime() - meetingDate.getTime()) / (1000 * 60 * 60 * 24));
        }
        return 0;
      });
    
    const avgSalesCycle = salesCycles.length > 0 
      ? salesCycles.reduce((sum, days) => sum + days, 0) / salesCycles.length 
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
};

// Funzione helper per il parsing delle date
const parseDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  const parts = dateString.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  const fullYear = year < 100 ? 2000 + year : year;
  return new Date(fullYear, month, day);
};