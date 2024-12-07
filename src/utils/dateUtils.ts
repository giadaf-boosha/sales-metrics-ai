/**
 * Extracts the month number from a date string in format DD/MM/YYYY
 */
export const getMonthFromDate = (dateStr: string): number => {
  if (!dateStr) return 0;
  const [, month] = dateStr.split('/').map(Number);
  return month || 0;
};

/**
 * Parses a monetary value from string format (e.g. "€1.234,56") to number
 */
export const parseMonetaryValue = (value: string): number => {
  if (!value) return 0;
  return parseFloat(value.replace('€', '').replace('.', '').replace(',', '.')) || 0;
};