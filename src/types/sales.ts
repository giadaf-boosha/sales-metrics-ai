export interface SalesData {
  ID: string;
  Sales: string;
  Canale: string;
  'Meeting Fissato': string;
  'Meeting Effettuato (SQL)': string | Date | null;
  'Offerte Inviate': string;
  'Analisi Firmate': string;
  'Contratti Chiusi': string;
  Persi: string;
  SQL: string;
  Stato: string;
  Servizio: string;
  'Valore Tot €': string | number;
  Azienda: string;
  'Nome Persona': string;
  Ruolo: string;
  Dimensioni: string;
  Settore: string;
  'Come mai ha accettato?': string;
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