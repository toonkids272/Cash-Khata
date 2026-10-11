import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction, BusinessSettings } from '../types';
import { formatINR, formatTableDate } from './formatters';

export interface PDFExportOptions {
  accountName: string;
  transactions: Transaction[];
  dateRangeLabel: string;
  settings: BusinessSettings;
  totalCashIn: number;
  totalCashOut: number;
  netBalance: number;
  openingBalance?: number;
}

export function generateCashBookPDF(options: PDFExportOptions): { blob: Blob; fileName: string; doc: jsPDF } {
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

  // Create A4 PDF in portrait
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header Background bar
  doc.setFillColor(25, 118, 210); // #1976D2 Brand Cerulean Blue
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Business Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(settings.businessName || 'Cash Khata', margin, 12);

  // Subtitle / Account Info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Ledger Statement: ${accountName} | Period: ${dateRangeLabel}`, margin, 19);

  // Right-aligned header info
  doc.setFontSize(8);
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  doc.text(`Generated: ${dateStr} ${timeStr}`, pageWidth - margin, 12, { align: 'right' });
  if (settings.phone) {
    doc.text(`Contact: ${settings.phone}`, pageWidth - margin, 19, { align: 'right' });
  }

  // Financial Summary Cards Box
  let startY = 32;
  const boxWidth = (pageWidth - margin * 2 - 9) / 4;
  const boxHeight = 16;

  const summaryCards = [
    { title: 'Opening Balance', value: formatINR(openingBalance), color: [100, 116, 139] },
    { title: 'Total Cash In', value: formatINR(totalCashIn), color: [22, 163, 74] },
    { title: 'Total Cash Out', value: formatINR(totalCashOut), color: [220, 38, 38] },
    { title: 'Net Closing Balance', value: formatINR(netBalance), color: netBalance >= 0 ? [22, 163, 74] : [220, 38, 38] },
  ];

  summaryCards.forEach((card, index) => {
    const x = margin + index * (boxWidth + 3);
    // Background
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(x, startY, boxWidth, boxHeight, 2, 2, 'FD');

    // Title
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(card.title, x + 3, startY + 5);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(card.color[0], card.color[1], card.color[2]);
    doc.text(card.value, x + 3, startY + 12);
  });

  // Prepare table data with running balance
  // Sort chronological for ledger
  const sorted = [...transactions].sort((a, b) => {
    const dateComp = a.date.localeCompare(b.date);
    if (dateComp !== 0) return dateComp;
    return (a.time || '').localeCompare(b.time || '');
  });

  let running = openingBalance;
  const tableRows = sorted.map((t, idx) => {
    if (t.type === 'in') {
      running += t.amount;
    } else {
      running -= t.amount;
    }

    const particulars = t.partyName || t.remarks || 'Transaction';
    const catSubtitle = t.category ? ` (${t.category})` : '';

    return [
      (idx + 1).toString(),
      `${formatTableDate(t.date)}\n${t.time || ''}`,
      `${particulars}${catSubtitle}${t.remarks && t.remarks !== t.partyName ? `\nNote: ${t.remarks}` : ''}`,
      t.paymentMode || 'Cash',
      t.type === 'in' ? formatINR(t.amount, { showSymbol: false, decimals: true }) : '-',
      t.type === 'out' ? formatINR(t.amount, { showSymbol: false, decimals: true }) : '-',
      formatINR(running, { showSymbol: false, decimals: true }),
    ];
  });

  // AutoTable
  autoTable(doc, {
    startY: startY + boxHeight + 6,
    margin: { left: margin, right: margin, bottom: 24 },
    head: [['#', 'Date & Time', 'Particulars / Description', 'Mode', 'Cash In', 'Cash Out', 'Balance']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      cellPadding: 2.5,
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 'auto', halign: 'left' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 24, halign: 'right', textColor: [22, 163, 74], fontStyle: 'bold' },
      5: { cellWidth: 24, halign: 'right', textColor: [220, 38, 38], fontStyle: 'bold' },
      6: { cellWidth: 26, halign: 'right', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    foot: [
      [
        'Total',
        '',
        `${transactions.length} Transactions Recorded`,
        '',
        formatINR(totalCashIn, { showSymbol: false, decimals: true }),
        formatINR(totalCashOut, { showSymbol: false, decimals: true }),
        formatINR(netBalance, { showSymbol: false, decimals: true }),
      ],
    ],
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8.5,
      lineWidth: 0.3,
      lineColor: [148, 163, 184],
    },
    didDrawPage: (data) => {
      // Running Page Footer
      const totalPagesExp = '{total_pages_count_string}';
      const pageNum = doc.getNumberOfPages();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);

      // Left footer
      doc.text(
        `Cash Khata · Verified Ledger Statement · ${settings.businessName || 'Cash Khata'}`,
        margin,
        pageHeight - 10
      );

      // Right footer
      doc.text(`Page ${pageNum} of ${totalPagesExp}`, pageWidth - margin, pageHeight - 10, {
        align: 'right',
      });
    },
  });

  // Calculate signature line position on last page
  // @ts-ignore
  let finalY = doc.lastAutoTable?.finalY || 150;
  if (finalY + 30 > pageHeight - 20) {
    doc.addPage();
    finalY = 30;
  }

  // Signature Block
  if (settings.showSignatureInPdf !== false) {
    const sigY = finalY + 16;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);

    // Business Stamp Box / Authorized Signatory
    const sigBoxX = pageWidth - margin - 50;
    doc.setDrawColor(203, 213, 225);
    doc.line(sigBoxX, sigY, sigBoxX + 50, sigY);
    doc.text(settings.signatureTitle || 'Authorized Signatory', sigBoxX + 25, sigY + 5, { align: 'center' });
    doc.setFontSize(7);
    doc.text(settings.businessName || 'Cash Khata Account', sigBoxX + 25, sigY + 9, { align: 'center' });
  }

  // Replace total pages placeholder
  if (typeof doc.putTotalPages === 'function') {
    doc.putTotalPages('{total_pages_count_string}');
  }

  const cleanAcc = accountName.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const safeDate = now.toISOString().split('T')[0];
  const fileName = `CashKhata_${cleanAcc}_${safeDate}.pdf`;

  const blob = doc.output('blob');
  return { blob, fileName, doc };
}
