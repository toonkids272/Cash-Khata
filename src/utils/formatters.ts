/**
 * Format amounts according to the Indian numbering system (Lakhs & Crores).
 * Example: 238420 -> ₹2,38,420
 */
export function formatINR(amount: number, options?: { showSymbol?: boolean; decimals?: boolean }): string {
  const showSymbol = options?.showSymbol ?? true;
  const decimals = options?.decimals ?? false;
  
  if (isNaN(amount) || amount === null || amount === undefined) {
    return showSymbol ? '₹0' : '0';
  }

  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  const formatted = absAmount.toLocaleString('en-IN', {
    maximumFractionDigits: decimals ? 2 : 2,
    minimumFractionDigits: decimals && absAmount % 1 !== 0 ? 2 : 0,
  });

  const prefix = isNegative ? '-' : '';
  const symbol = showSymbol ? '₹' : '';

  return `${prefix}${symbol}${formatted}`;
}

/**
 * Format a date string (YYYY-MM-DD) into display header matching the app screenshot:
 * e.g., 'Mon, 07 Sep 2026'
 */
export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format a short date for tables, e.g. '07/09/2026'
 */
export function formatTableDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = String(day).padStart(2, '0');
    const m = String(month).padStart(2, '0');
    return `${d}/${m}/${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Returns today's ISO date string 'YYYY-MM-DD'
 */
export function getTodayDateStr(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns current formatted time in 12-hour AM/PM format (e.g., '08:48 AM')
 */
export function getCurrentTimeStr(): string {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const formattedHours = String(hours).padStart(2, '0');
  return `${formattedHours}:${minutes} ${ampm}`;
}

/**
 * Convert number to Indian currency words
 * e.g., 45376 -> "Rupees Forty-Five Thousand Three Hundred Seventy-Six Only"
 */
export function numberToIndianWords(num: number): string {
  if (num === 0) return 'Zero Rupees';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Math.abs(num));

  function inWords(val: number): string {
    if (val < 20) return a[val];
    if (val < 100) return b[Math.floor(val / 10)] + (val % 10 !== 0 ? ' ' + a[val % 10] : '');
    if (val < 1000) return a[Math.floor(val / 100)] + ' Hundred' + (val % 100 !== 0 ? ' and ' + inWords(val % 100) : '');
    if (val < 100000) return inWords(Math.floor(val / 1000)) + ' Thousand' + (val % 1000 !== 0 ? ' ' + inWords(val % 1000) : '');
    if (val < 10000000) return inWords(Math.floor(val / 100000)) + ' Lakh' + (val % 100000 !== 0 ? ' ' + inWords(val % 100000) : '');
    return inWords(Math.floor(val / 10000000)) + ' Crore' + (val % 10000000 !== 0 ? ' ' + inWords(val % 10000000) : '');
  }

  const words = inWords(n);
  return `INR ${words} Only`;
}
