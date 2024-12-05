export interface SalesData {
  ID: string;
  Sales: string;
  Canale: string;
  'Meeting Fissato': string;
  'Meeting Effettuato (SQL)': string;
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
  meetingScheduled?: string;
  meetingCompleted?: string;
  proposalSent?: string;
  contractsClosed?: string;
  status?: string;
  service?: string;
  company?: string;
  personName?: string;
  role?: string;
  size?: string;
  sector?: string;
  acceptanceReason?: string;
  objections?: string;
  notes?: string;
}

export interface TableColumn {
  key: keyof ChannelKPI;
  label: string;
}