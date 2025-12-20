import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { MonthRecord, Trade } from '../types';

/**
 * Convert trades to CSV format
 */
export const tradesToCSV = (trades: Trade[]): string => {
  const headers = [
    'ID',
    'Symbol',
    'Trade Type',
    'Entry Date',
    'Exit Date',
    'Entry Price',
    'Exit Price',
    'Quantity',
    'P&L',
    'Return %',
    'Tags',
    'Notes',
    'Month',
    'Created At',
  ];
  
  const rows = trades.map(trade => [
    trade.id,
    trade.symbol,
    trade.tradeType,
    trade.entryDate,
    trade.exitDate,
    trade.entryPrice.toFixed(2),
    trade.exitPrice.toFixed(2),
    trade.quantity.toString(),
    trade.pnl.toFixed(2),
    trade.returnPercentage.toFixed(2),
    trade.tags.join('; '),
    `"${(trade.notes || '').replace(/"/g, '""')}"`, // Escape quotes in notes
    trade.monthKey,
    new Date(trade.createdAt).toISOString(),
  ]);
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};

/**
 * Convert months to CSV format
 */
export const monthsToCSV = (months: MonthRecord[]): string => {
  const headers = [
    'ID',
    'Month',
    'Starting Capital',
    'Ending Capital',
    'Deposits',
    'Withdrawals',
    'Net P&L',
    'Gross Change',
    'Return %',
    'Status',
    'Notes',
    'Created At',
  ];
  
  const rows = months.map(month => [
    month.id,
    month.month,
    month.startingCapital.toFixed(2),
    month.endingCapital.toFixed(2),
    month.deposits.toFixed(2),
    month.withdrawals.toFixed(2),
    month.netProfitLoss.toFixed(2),
    month.grossChange.toFixed(2),
    month.returnPercentage.toFixed(2),
    month.status,
    `"${(month.notes || '').replace(/"/g, '""')}"`,
    new Date(month.createdAt).toISOString(),
  ]);
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
};

/**
 * Export trades to CSV file and share
 */
export const exportTradesToCSV = async (trades: Trade[]): Promise<void> => {
  if (trades.length === 0) {
    throw new Error('No trades to export');
  }
  
  const csv = tradesToCSV(trades);
  const fileName = `trades_export_${new Date().toISOString().split('T')[0]}.csv`;
  const filePath = `${FileSystem.cacheDirectory}${fileName}`;
  
  await FileSystem.writeAsStringAsync(filePath, csv, {
    encoding: 'utf8',
  });
  
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device');
  }
  
  await Sharing.shareAsync(filePath, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Trades',
    UTI: 'public.comma-separated-values-text',
  });
};

/**
 * Export months to CSV file and share
 */
export const exportMonthsToCSV = async (months: MonthRecord[]): Promise<void> => {
  if (months.length === 0) {
    throw new Error('No months to export');
  }
  
  const csv = monthsToCSV(months);
  const fileName = `months_export_${new Date().toISOString().split('T')[0]}.csv`;
  const filePath = `${FileSystem.cacheDirectory}${fileName}`;
  
  await FileSystem.writeAsStringAsync(filePath, csv, {
    encoding: 'utf8',
  });
  
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device');
  }
  
  await Sharing.shareAsync(filePath, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Monthly Data',
    UTI: 'public.comma-separated-values-text',
  });
};
