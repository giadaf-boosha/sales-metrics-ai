export interface SalesData {
  ID: string;
  'Nome Persona': string;
  Canale: string;
  'Meeting Fissato': string;
  'Meeting Effettuato (SQL)': string;
  'Offerte Inviate': string;
  'Analisi Firmate': string;
  'Contratti Chiusi': string;
  Persi: string;
  Sales: string;
  Azienda: string;
  SQL: string;
  Stato: string;
  Servizio: string;
  'Valore Tot €': string;
  Settore: string;
  'Come mai ha accettato?': string;
  Ruolo: string;
  Dimensioni: string;
  Obiezioni: string;
  Note: string;
}

export interface ChannelKPI {
  source: string;
  totalOppsCreated: number;
  totalClosedLostOpps: number;
  totalClosedWonOpps: number;
  totalClosedWonRevenue: number;
  acv: number;
  closedWonAvgSalesCycle: number;
  winRate: number;
  pipelineVelocity: number;
  pipelineContribution: number;
}

export interface TableColumn {
  key: keyof ChannelKPI;
  label: string;
}

export interface FormattedChannelKPI extends ChannelKPI {
  formattedTotalClosedWonRevenue: string;
  formattedACV: string;
  formattedWinRate: string;
  formattedPipelineVelocity: string;
  formattedPipelineContribution: string;
}