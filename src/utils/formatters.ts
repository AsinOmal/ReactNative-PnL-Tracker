/**
 * Format a number as currency
 */
export function formatCurrency(value: number, showSign = false): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
  
  if (showSign && value !== 0) {
    return value > 0 ? `+${formatted}` : `-${formatted}`;
  }
  
  return value < 0 ? `-${formatted}` : formatted;
}

/**
 * Format a number as percentage
 */
export function formatPercentage(value: number, showSign = false): string {
  const formatted = `${Math.abs(value).toFixed(2)}%`;
  
  if (showSign && value !== 0) {
    return value > 0 ? `+${formatted}` : `-${formatted}`;
  }
  
  return value < 0 ? `-${formatted}` : formatted;
}

/**
 * Format a number with +/- sign
 */
export function formatWithSign(value: number): string {
  if (value > 0) return `+${value}`;
  if (value < 0) return `${value}`;
  return '0';
}

/**
 * Parse currency string to number
 */
/**
 * Parse currency string to number (handles commas)
 */
export function parseCurrency(value: string): number {
  if (!value) return 0;
  const cleaned = value.replace(/,/g, '').replace(/[^0-9.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format input for currency field (adds commas as you type)
 */
export function formatCurrencyInput(value: string): string {
  // Remove all non-numeric characters except decimal point
  let cleaned = value.replace(/[^0-9.]/g, '');
  
  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limit to 2 decimal places
  if (parts.length === 2 && parts[1].length > 2) {
    cleaned = parts[0] + '.' + parts[1].substring(0, 2);
  }

  // Add commas to the integer part
  const integerPart = parts[0];
  const decimalPart = parts.length > 1 ? '.' + parts[1].substring(0, 2) : '';
  
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return formattedInteger + decimalPart;
}
