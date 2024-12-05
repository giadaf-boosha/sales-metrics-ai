import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SalesData } from '@/utils/googleSheets';

interface SalesData {
  [key: string]: any;
  ID: string;
  Sales: string;
  Canale: string;
  'Meeting Fissato': string | Date;
  'Meeting Effettuato (SQL)': string | Date;
  'Offerte Inviate': string | Date;
  'Contratti Chiusi': string | Date;
  Persi: string | Date;
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

interface SummaryTableProps {
  data?: any[]; // Dati grezzi dal Google Sheet
}

export function SummaryTable({ data }: SummaryTableProps) {
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const parts = dateString.split('/');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // I mesi in JavaScript vanno da 0 a 11
    const year = parseInt(parts[2], 10);
    const fullYear = year < 100 ? 2000 + year : year; // Gestione anni a due cifre
    return new Date(fullYear, month, day);
  };

  const parseCurrency = (value: string): number => {
    if (!value) return 0;
    // Rimuove simboli e separatori di migliaia
    const numberString = value.replace(/[€\s.]/g, '').replace(',', '.');
    return parseFloat(numberString) || 0;
  };

  // Mappare i dati utilizzando i nomi delle colonne
  const mappedData = React.useMemo(() => {
    if (!data || data.length === 0) return [];

    // Verifica se data è un array di oggetti (già mappato)
    if (typeof data[0] === 'object' && !Array.isArray(data[0])) {
      return data as SalesData[];
    }

    // Altrimenti, mappiamo i dati utilizzando la prima riga come header
    const [headerRow, ...dataRows] = data;

    // Verifica che headerRow sia un array
    if (!Array.isArray(headerRow)) {
      console.error('La prima riga dei dati non contiene i nomi delle colonne.');
      return [];
    }

    const headers = headerRow as string[];

    // Mappa ogni riga di dati a un oggetto con chiavi basate sui nomi delle colonne
    const mapped = dataRows.map((row) => {
      const rowData: { [key: string]: any } = {};
      headers.forEach((header, index) => {
        rowData[header.trim()] = row[index];
      });
      return rowData as SalesData;
    });

    // Converti date e valori monetari nei tipi appropriati
    const convertedData = mapped.map((row) => {
      return {
        ...row,
        'Meeting Fissato': parseDate(row['Meeting Fissato']),
        'Meeting Effettuato (SQL)': parseDate(row['Meeting Effettuato (SQL)']),
        'Offerte Inviate': parseDate(row['Offerte Inviate']),
        'Contratti Chiusi': parseDate(row['Contratti Chiusi']),
        Persi: parseDate(row['Persi']),
        'Valore Tot €': parseCurrency(row['Valore Tot €']),
      };
    });

    return convertedData;
  }, [data]);

  const channelSummary = React.useMemo(() => {
    if (!mappedData || mappedData.length === 0) return [];

    const summary = mappedData.reduce((acc, curr) => {
      const channel = curr['Canale'] || 'Other';
      if (!acc[channel]) {
        acc[channel] = {
          source: channel,
          totalOppsCreated: 0,
          totalClosedLostOpps: 0,
          totalClosedWonOpps: 0,
          totalClosedWonRevenue: 0,
          acv: 0,
          closedWonAvgSalesCycle: 0,
          winRate: 0,
          pipelineVelocity: 0,
          pipelineContribution: 0,
          totalSalesCycleDays: 0,
        };
      }

      const meetingDate = curr['Meeting Effettuato (SQL)'];
      const lostDate = curr['Persi'];
      const closingDate = curr['Contratti Chiusi'];

      // Total Opps Created
      if (meetingDate && curr['SQL'] === 'Sì') {
        acc[channel].totalOppsCreated += 1;
      }

      // Total Closed Lost Opps
      if (lostDate && curr['Stato'] === 'Perso') {
        acc[channel].totalClosedLostOpps += 1;
      }

      // Total Closed Won Opps & Revenue
      if (closingDate && curr['Stato'] === 'Cliente') {
        acc[channel].totalClosedWonOpps += 1;
        acc[channel].totalClosedWonRevenue += curr['Valore Tot €'] || 0;

        // Calcolo del ciclo di vendita per le opportunità vinte
        if (meetingDate) {
          const salesCycleDays = Math.floor(
            (closingDate.getTime() - meetingDate.getTime()) /
              (1000 * 60 * 60 * 24)
          );
          acc[channel].totalSalesCycleDays += salesCycleDays;
        }
      }

      return acc;
    }, {} as Record<string, any>);

    // Calcolo delle metriche derivate per ogni canale
    const totalPipelineValue = Object.values(summary).reduce(
      (total: number, channel: any) => total + channel.totalClosedWonRevenue,
      0
    );

    return Object.values(summary).map((channel) => {
      const totalOpps =
        channel.totalClosedWonOpps + channel.totalClosedLostOpps;
      const winRate =
        totalOpps > 0 ? channel.totalClosedWonOpps / totalOpps : 0;
      const avgSalesCycle =
        channel.totalClosedWonOpps > 0
          ? channel.totalSalesCycleDays / channel.totalClosedWonOpps
          : 0;
      const acv =
        channel.totalClosedWonOpps > 0
          ? channel.totalClosedWonRevenue / channel.totalClosedWonOpps
          : 0;

      // Calcolo della Pipeline Velocity
      const pipelineVelocity =
        avgSalesCycle > 0
          ? (channel.totalOppsCreated * winRate * acv) / (avgSalesCycle / 365)
          : 0;

      return {
        ...channel,
        acv,
        closedWonAvgSalesCycle: avgSalesCycle,
        winRate: winRate * 100,
        pipelineVelocity,
        pipelineContribution:
          totalPipelineValue > 0
            ? (channel.totalClosedWonRevenue / totalPipelineValue) * 100
            : 0,
      };
    });
  }, [mappedData]);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h3 className="mb-6 text-lg font-semibold">
        Tabella Riepilogativa per Canale
      </h3>

      {/* Visualizzazione delle prime due righe e dell'ultima riga dei dati */}
      {mappedData && mappedData.length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-semibold">
            Dati letti dal Google Sheet:
          </h4>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(
              [
                mappedData[0],
                mappedData[1],
                mappedData[mappedData.length - 1],
              ],
              null,
              2
            )}
          </pre>
        </div>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source</TableHead>
              <TableHead className="text-right">Total Opps. created</TableHead>
              <TableHead className="text-right">
                Total Closed Lost Opps.
              </TableHead>
              <TableHead className="text-right">
                Total Closed Won Opps.
              </TableHead>
              <TableHead className="text-right">
                Total Closed Won Revenue
              </TableHead>
              <TableHead className="text-right">ACV</TableHead>
              <TableHead className="text-right">
                Closed Won Avg. Sales Cycle
              </TableHead>
              <TableHead className="text-right">Win-Rate</TableHead>
              <TableHead className="text-right">Pipeline Velocity</TableHead>
              <TableHead className="text-right">
                % of pipeline contribution
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {channelSummary.map((row) => (
              <TableRow key={row.source}>
                <TableCell>{row.source}</TableCell>
                <TableCell className="text-right">
                  {row.totalOppsCreated}
                </TableCell>
                <TableCell className="text-right">
                  {row.totalClosedLostOpps}
                </TableCell>
                <TableCell className="text-right">
                  {row.totalClosedWonOpps}
                </TableCell>
                <TableCell className="text-right">
                  €
                  {row.totalClosedWonRevenue.toLocaleString('it-IT', {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  €
                  {row.acv.toLocaleString('it-IT', {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {Math.round(row.closedWonAvgSalesCycle)} giorni
                </TableCell>
                <TableCell className="text-right">
                  {row.winRate.toFixed(2)}%
                </TableCell>
                <TableCell className="text-right">
                  €
                  {row.pipelineVelocity.toLocaleString('it-IT', {
                    minimumFractionDigits: 2,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  {row.pipelineContribution.toFixed(2)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
