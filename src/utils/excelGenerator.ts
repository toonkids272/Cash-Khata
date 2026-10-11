import * as XLSX from 'xlsx';
import { Transaction, BusinessSettings } from '../types';
import { formatTableDate } from './formatters';

export interface ExcelExportOptions {
  accountName: string;
  transactions: Transaction[];
  dateRangeLabel: string;
  settings: BusinessSettings;
  totalCashIn: number;
  totalCashOut: number;
  netBalance: number;
  openingBalance?: number;
}

export function generateCashBookExcel(options: ExcelExportOptions): { blob: Blob; fileName: string } {
  const {
    accountName,
    transactions,
    dateRangeLabel,
    settings,
    totalCashIn,
    totalCashOut,
    netBalance,
    openingBalance = 0,
  } = options;

  const wb = XLSX.utils.book_new();

  // 1. Prepare Main Ledger Sheet
  // Title & Metadata rows
  const ledgerData: (string | number)[][] = [
    [settings.businessName || 'Cash Khata', '', '', '', '', '', '', '', '', ''],
    [`Account: ${accountName}`, `Period: ${dateRangeLabel}`, '', '', '', '', '', '', '', ''],
    [`Generated: ${new Date().toLocaleString('en-IN')}`, '', '', '', '', '', '', '', '', ''],
    [
      `Opening Balance: ${openingBalance}`,
      `Total Cash In: ${totalCashIn}`,
      `Total Cash Out: ${totalCashOut}`,
      `Closing Balance: ${netBalance}`,
      '', '', '', '', '', ''
    ],
    [], // Blank line
    // Table Headers
    [
      'S.No',
      'Date',
      'Time',
      'Particulars / Party',
      'Category',
      'Payment Mode',
      'Cash In (₹)',
      'Cash Out (₹)',
      'Balance (₹)',
      'Remarks',
    ],
  ];

  // Sort chronological for ledger
  const sorted = [...transactions].sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    return (a.time || '').localeCompare(b.time || '');
  });

  let running = openingBalance;
  sorted.forEach((t, idx) => {
    if (t.type === 'in') {
      running += t.amount;
    } else {
      running -= t.amount;
    }

    ledgerData.push([
      idx + 1,
      formatTableDate(t.date),
      t.time || '',
      t.partyName || t.remarks || 'Transaction',
      t.category || '-',
      t.paymentMode || 'Cash',
      t.type === 'in' ? t.amount : 0,
      t.type === 'out' ? t.amount : 0,
      running,
      t.remarks || '',
    ]);
  });

  // Footer Total Row
  ledgerData.push([
    'TOTAL',
    '',
    '',
    `${transactions.length} Transactions`,
    '',
    '',
    totalCashIn,
    totalCashOut,
    netBalance,
    '',
  ]);

  const wsLedger = XLSX.utils.aoa_to_sheet(ledgerData);

  // Set column widths
  wsLedger['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 12 }, // Date
    { wch: 10 }, // Time
    { wch: 26 }, // Party
    { wch: 16 }, // Category
    { wch: 14 }, // Payment Mode
    { wch: 15 }, // Cash In
    { wch: 15 }, // Cash Out
    { wch: 16 }, // Balance
    { wch: 25 }, // Remarks
  ];

  // Auto-filter on the header row (index 5, 6th row)
  const lastRowIdx = ledgerData.length;
  wsLedger['!autofilter'] = {
    ref: `A6:J${lastRowIdx - 1}`,
  };

  XLSX.utils.book_append_sheet(wb, wsLedger, 'Cash Khata Ledger');

  // 2. Prepare Category Summary Sheet
  const categoryMap: { [cat: string]: { inAmount: number; outAmount: number; count: number } } = {};
  transactions.forEach((t) => {
    const cat = t.category || 'General';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { inAmount: 0, outAmount: 0, count: 0 };
    }
    categoryMap[cat].count += 1;
    if (t.type === 'in') {
      categoryMap[cat].inAmount += t.amount;
    } else {
      categoryMap[cat].outAmount += t.amount;
    }
  });

  const categoryRows: (string | number)[][] = [
    ['Category Analysis Summary', '', '', '', ''],
    [`Account: ${accountName}`, `Period: ${dateRangeLabel}`, '', '', ''],
    [],
    ['Category', 'Tx Count', 'Cash In (₹)', 'Cash Out (₹)', 'Net Difference (₹)'],
  ];

  Object.entries(categoryMap).forEach(([cat, stats]) => {
    categoryRows.push([
      cat,
      stats.count,
      stats.inAmount,
      stats.outAmount,
      stats.inAmount - stats.outAmount,
    ]);
  });

  categoryRows.push([
    'TOTAL',
    transactions.length,
    totalCashIn,
    totalCashOut,
    totalCashIn - totalCashOut,
  ]);

  const wsCategory = XLSX.utils.aoa_to_sheet(categoryRows);
  wsCategory['!cols'] = [
    { wch: 20 },
    { wch: 12 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(wb, wsCategory, 'Category Breakdown');

  // Generate binary XLSX buffer
  const excelBuffer = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array',
  });

  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const cleanAcc = accountName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const safeDate = new Date().toISOString().split('T')[0];
  const fileName = `CashKhata_${cleanAcc}_${safeDate}.xlsx`;

  return { blob, fileName };
}
