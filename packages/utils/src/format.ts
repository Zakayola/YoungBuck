/**
 * Format a number with compact notation (e.g. 1_200_000 → "1.2M")
 */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Format a number as a USD currency string.
 */
export function formatUSD(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format an XLM amount — trims trailing zeros.
 * formatXlm("1.50000") → "1.5 XLM"
 */
export function formatXlm(value: string | number, symbol = 'XLM'): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return `0 ${symbol}`;
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 7,
  });
  return `${formatted} ${symbol}`;
}

/**
 * Format a relative timestamp ("2 hours ago", "just now", etc.)
 */
export function formatRelativeTime(dateOrIso: Date | string): string {
  const date = typeof dateOrIso === 'string' ? new Date(dateOrIso) : dateOrIso;
  const delta = (Date.now() - date.getTime()) / 1000;

  if (delta < 60) return 'just now';
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  if (delta < 604800) return `${Math.floor(delta / 86400)}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Pad a number with leading zeros to a given length.
 */
export function zeroPad(n: number, length = 2): string {
  return String(n).padStart(length, '0');
}
