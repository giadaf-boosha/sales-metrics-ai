import React from 'react';
import { SalesData } from '../types/sales';

interface SalesDataPreviewProps {
  data: SalesData[];
}

export const SalesDataPreview: React.FC<SalesDataPreviewProps> = ({ data }) => {
  if (!data || data.length === 0) return null;

  console.log("Data from Google Sheet:", {
    firstRow: data[0],
    secondRow: data[1],
    lastRow: data[data.length - 1],
    totalRows: data.length
  });

  return null;
};