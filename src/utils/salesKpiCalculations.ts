import { SalesData, ChannelKPI } from '../types/sales';

const getMonthFromDate = (dateStr: string): number => {
  if (!dateStr || typeof dateStr !== 'string') return 0;
  const cleanDate = dateStr.trim();
  if (!cleanDate) return 0;
  
  try {
    const [day, month] = cleanDate.split('/');
    const monthNum = parseInt(month, 10);
    return monthNum >= 1 && monthNum <= 12 ? monthNum : 0;
  } catch (error) {
    console.error('Error parsing date:', dateStr);
    return 0;
  }
};

const getDaysBetweenDates = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  
  try {
    const [startDay, startMonth, startYear] = startDate.split('/').map(Number);
    const [endDay, endMonth, endYear] = endDate.split('/').map(Number);
    
    const start = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error calculating days between dates:', error);
    return 0;
  }
};

export const calculateTotalKPIs = (data: SalesData[], currentMonth: number): ChannelKPI => {
  // Total Opps Created (SQL = 'Si' per il mese corrente)
  const totalOppsCreated = data.filter(row => 
    getMonthFromDate(row['Meeting Effettuato (SQL)']) === currentMonth && 
    row.SQL === 'Si'
  ).length;
  
  // Total Closed Lost Opps
  const totalClosedLostOpps = data.filter(row => 
    getMonthFromDate(row.Persi) === currentMonth && 
    row.SQL === 'Si' && 
    row.Stato === 'Perso'
  ).length;
  
  // Total Closed Won Opps
  const totalClosedWonOpps = data.filter(row => 
    (row.Stato === 'Cliente' && getMonthFromDate(row['Contratti Chiusi']) === currentMonth) ||
    (row.Stato === 'Analisi' && getMonthFromDate(row['Analisi Firmate']) === currentMonth)
  ).length;
  
  // Total Closed Won Revenue
  const totalClosedWonRevenue = data.reduce((sum, row) => {
    if (
      ((getMonthFromDate(row['Analisi Firmate']) === currentMonth) ||
      (getMonthFromDate(row['Contratti Chiusi']) === currentMonth)) &&
      row['Valore Tot €']
    ) {
      const value = row['Valore Tot €'].replace('€', '').trim();
      return sum + (parseFloat(value) || 0);
    }
    return sum;
  }, 0);
  
  // ACV
  const acv = totalClosedWonOpps > 0 ? totalClosedWonRevenue / totalClosedWonOpps : 0;
  
  // Closed Won Avg Sales Cycle
  const wonDeals = data.filter(row => 
    row.Stato === 'Cliente' || row.Stato === 'Analisi'
  );
  
  const totalCycleDays = wonDeals.reduce((sum, row) => {
    const endDate = row.Stato === 'Cliente' ? row['Contratti Chiusi'] : row['Analisi Firmate'];
    return sum + getDaysBetweenDates(row['Meeting Effettuato (SQL)'], endDate);
  }, 0);
  
  const closedWonAvgSalesCycle = wonDeals.length > 0 ? totalCycleDays / wonDeals.length : 0;
  
  // Win Rate
  const winRate = (totalClosedWonOpps + totalClosedLostOpps) > 0 ? 
    (totalClosedWonOpps / (totalClosedWonOpps + totalClosedLostOpps)) * 100 : 0;
  
  // Pipeline Velocity
  const pipelineVelocity = closedWonAvgSalesCycle > 0 ?
    (totalOppsCreated * (winRate / 100) * acv) / (closedWonAvgSalesCycle / 365) : 0;

  return {
    source: 'Total',
    totalOppsCreated,
    totalClosedLostOpps,
    totalClosedWonOpps,
    totalClosedWonRevenue,
    acv,
    closedWonAvgSalesCycle,
    winRate,
    pipelineVelocity,
    pipelineContribution: 100
  };
};

export const calculateChannelKPIs = (data: SalesData[], currentMonth: number): ChannelKPI[] => {
  const channels = Array.from(new Set(data.map(row => row.Canale))).filter(Boolean);
  const totals = calculateTotalKPIs(data, currentMonth);
  
  const channelKPIs = channels.map(channel => {
    const channelData = data.filter(row => row.Canale === channel);
    
    // Total Opps Created (SQL = 'Si' per il mese corrente)
    const totalOppsCreated = channelData.filter(row => 
      getMonthFromDate(row['Meeting Effettuato (SQL)']) === currentMonth && 
      row.SQL === 'Si'
    ).length;
    
    // Total Closed Lost Opps
    const totalClosedLostOpps = channelData.filter(row => 
      getMonthFromDate(row.Persi) === currentMonth && 
      row.SQL === 'Si' && 
      row.Stato === 'Perso'
    ).length;
    
    // Total Closed Won Opps
    const totalClosedWonOpps = channelData.filter(row => 
      (row.Stato === 'Cliente' && getMonthFromDate(row['Contratti Chiusi']) === currentMonth) ||
      (row.Stato === 'Analisi' && getMonthFromDate(row['Analisi Firmate']) === currentMonth)
    ).length;
    
    // Total Closed Won Revenue
    const totalClosedWonRevenue = channelData.reduce((sum, row) => {
      if (
        ((getMonthFromDate(row['Analisi Firmate']) === currentMonth) ||
        (getMonthFromDate(row['Contratti Chiusi']) === currentMonth)) &&
        row['Valore Tot €']
      ) {
        const value = row['Valore Tot €'].replace('€', '').trim();
        return sum + (parseFloat(value) || 0);
      }
      return sum;
    }, 0);
    
    // ACV
    const acv = totalClosedWonOpps > 0 ? totalClosedWonRevenue / totalClosedWonOpps : 0;
    
    // Closed Won Avg Sales Cycle
    const wonDeals = channelData.filter(row => 
      row.Stato === 'Cliente' || row.Stato === 'Analisi'
    );
    
    const totalCycleDays = wonDeals.reduce((sum, row) => {
      const endDate = row.Stato === 'Cliente' ? row['Contratti Chiusi'] : row['Analisi Firmate'];
      return sum + getDaysBetweenDates(row['Meeting Effettuato (SQL)'], endDate);
    }, 0);
    
    const closedWonAvgSalesCycle = wonDeals.length > 0 ? totalCycleDays / wonDeals.length : 0;
    
    // Win Rate
    const winRate = (totalClosedWonOpps + totalClosedLostOpps) > 0 ? 
      (totalClosedWonOpps / (totalClosedWonOpps + totalClosedLostOpps)) * 100 : 0;
    
    // Pipeline Velocity
    const pipelineVelocity = closedWonAvgSalesCycle > 0 ?
      (totalOppsCreated * (winRate / 100) * acv) / (closedWonAvgSalesCycle / 365) : 0;
    
    // Pipeline Contribution
    const pipelineContribution = totals.totalClosedWonRevenue > 0 ? 
      (totalClosedWonRevenue / totals.totalClosedWonRevenue) * 100 : 0;
    
    return {
      source: channel,
      totalOppsCreated,
      totalClosedLostOpps,
      totalClosedWonOpps,
      totalClosedWonRevenue,
      acv,
      closedWonAvgSalesCycle,
      winRate,
      pipelineVelocity,
      pipelineContribution
    };
  });

  return [...channelKPIs, totals];
};