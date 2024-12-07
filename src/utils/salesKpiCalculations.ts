import { SalesData, ChannelKPI } from '../types/sales';

const getDaysDifference = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  
  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('/').map(Number);
    // Assumiamo che gli anni a 2 cifre siano 20xx
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
  // Rimuove il simbolo €, i punti delle migliaia e converte la virgola in punto
  const cleanValue = value.replace(/[€.]/g, '').replace(',', '.').trim();
  return parseFloat(cleanValue) || 0;
};

const normalizeString = (str: string): string => {
  if (!str) return '';
  return str.trim().toUpperCase();
};

const matchesState = (actual: string, expected: string): boolean => {
  return normalizeString(actual) === normalizeString(expected);
};

const isSQL = (value: string): boolean => {
  const normalized = normalizeString(value);
  return normalized === 'SI' || normalized === 'SÌ';
};

export const calculateChannelKPIs = (data: SalesData[], currentMonth: number): ChannelKPI[] => {
  console.log('Starting KPI calculation with currentMonth:', currentMonth);
  
  if (!data?.length || !currentMonth) {
    console.warn('Missing data or currentMonth in calculateChannelKPIs');
    return [];
  }

  const channels = [...new Set(data.map(row => row.Canale))];
  console.log('Found channels:', channels);
  
  const results = channels.map(channel => {
    console.log('Processing channel:', channel);
    const channelData = data.filter(row => row.Canale === channel);

    // Total Opps Created (SQL = Si nel mese corrente)
    const totalOppsCreated = channelData.filter(row => {
      const sqlMatch = isSQL(row.SQL);
      const meetingMonth = getMonthFromDate(row['Meeting Effettuato (SQL)']);
      return sqlMatch && meetingMonth === currentMonth;
    }).length;

    // Total Closed Lost Opps
    const totalClosedLostOpps = channelData.filter(row => {
      const sqlMatch = isSQL(row.SQL);
      const isPerso = matchesState(row.Stato, 'Perso');
      const persiMonth = getMonthFromDate(row.Persi);
      return sqlMatch && isPerso && persiMonth === currentMonth;
    }).length;

    // Total Closed Won Opps
    const closedAsClient = channelData.filter(row => {
      const isClient = matchesState(row.Stato, 'Cliente');
      const closedMonth = getMonthFromDate(row['Contratti Chiusi']);
      return isClient && closedMonth === currentMonth;
    }).length;

    const closedAsAnalysis = channelData.filter(row => {
      const isAnalysis = matchesState(row.Stato, 'Analisi');
      const analysisMonth = getMonthFromDate(row['Analisi Firmate']);
      return isAnalysis && analysisMonth === currentMonth;
    }).length;

    const totalClosedWonOpps = closedAsClient + closedAsAnalysis;

    // Total Closed Won Revenue
    const totalClosedWonRevenue = channelData.reduce((sum, row) => {
      let revenue = sum;
      if (matchesState(row.Stato, 'Cliente') && getMonthFromDate(row['Contratti Chiusi']) === currentMonth) {
        revenue += parseEuroValue(row['Valore Tot €']);
      }
      if (matchesState(row.Stato, 'Analisi') && getMonthFromDate(row['Analisi Firmate']) === currentMonth) {
        revenue += parseEuroValue(row['Valore Tot €']);
      }
      return revenue;
    }, 0);

    // ACV (Average Contract Value)
    const acv = totalClosedWonOpps > 0 ? totalClosedWonRevenue / totalClosedWonOpps : 0;

    // Closed Won Average Sales Cycle
    const wonDeals = channelData.filter(row => {
      const isWon = matchesState(row.Stato, 'Cliente') || matchesState(row.Stato, 'Analisi');
      const hasValidDates = row['Meeting Effettuato (SQL)'] && 
        (matchesState(row.Stato, 'Cliente') ? row['Contratti Chiusi'] : row['Analisi Firmate']);
      return isWon && hasValidDates;
    });

    const avgSalesCycle = wonDeals.length > 0
      ? wonDeals.reduce((sum, row) => {
          const endDate = matchesState(row.Stato, 'Cliente') 
            ? row['Contratti Chiusi'] 
            : row['Analisi Firmate'];
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

    const result = {
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

    console.log('Channel results:', {
      channel,
      totalOppsCreated,
      totalClosedLostOpps,
      totalClosedWonOpps,
      totalClosedWonRevenue,
      acv,
      avgSalesCycle,
      winRate,
      pipelineVelocity
    });

    return result;
  }).filter(result => result.source);

  // Calculate pipeline contribution
  const totalRevenue = results.reduce((sum, channel) => sum + channel.totalClosedWonRevenue, 0);
  
  return results.map(result => ({
    ...result,
    pipelineContribution: totalRevenue > 0 ? (result.totalClosedWonRevenue / totalRevenue) * 100 : 0
  }));
};