import React from 'react';
import { SalesData } from '../types/sales';

interface SalesDataPreviewProps {
  data: SalesData[];
}

export const SalesDataPreview: React.FC<SalesDataPreviewProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="text-md font-semibold">Dati letti dal Google Sheet:</h4>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(
          [data[0], data[1], data[data.length - 1]],
          null,
          2
        )}
      </pre>
    </div>
  );
};