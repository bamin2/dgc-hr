import { format } from 'date-fns';
import jsPDF from 'jspdf';
import { ReportColumn } from '@/types/reports';

/**
 * Report Export Utilities
 * Handles CSV, Excel, and PDF exports for all reports
 */

// Format value based on column format type
function formatValue(value: unknown, formatType?: string): string {
  if (value === null || value === undefined) return '';
  
  switch (formatType) {
    case 'currency':
      return typeof value === 'number' ? value.toFixed(2) : String(value);
    case 'percentage':
      return typeof value === 'number' ? `${value.toFixed(2)}%` : String(value);
    case 'date':
      if (typeof value === 'string' && value) {
        try {
          return format(new Date(value), 'yyyy-MM-dd');
        } catch {
          return value;
        }
      }
      return String(value);
    case 'number':
      return typeof value === 'number' ? value.toString() : String(value);
    default:
      return String(value);
  }
}

// Get nested value from object
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object' ? (current as Record<string, unknown>)[key] : undefined;
  }, obj as unknown);
}

/**
 * Export data to CSV format
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ReportColumn<T>[],
  filename: string
): void {
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Create header row
  const headers = columns.map(col => `"${col.header}"`).join(',');
  
  // Create data rows
  const rows = data.map(row => {
    return columns.map(col => {
      const value = getNestedValue(row, col.key as string);
      const formatted = formatValue(value, col.format);
      // Escape quotes and wrap in quotes
      return `"${formatted.replace(/"/g, '""')}"`;
    }).join(',');
  });

  // Combine and create blob
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Download
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Export data to Excel format (actually CSV with .xlsx extension for browser compatibility)
 * For true Excel format, we'd need a library like xlsx
 */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  columns: ReportColumn<T>[],
  filename: string
): void {
  // For now, export as CSV which Excel can open
  // The content is tab-separated for better Excel compatibility
  if (data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Create header row
  const headers = columns.map(col => col.header).join('\t');
  
  // Create data rows
  const rows = data.map(row => {
    return columns.map(col => {
      const value = getNestedValue(row, col.key as string);
      const formatted = formatValue(value, col.format);
      return formatted.replace(/\t/g, ' ');
    }).join('\t');
  });

  // Combine and create blob
  const content = [headers, ...rows].join('\n');
  const blob = new Blob(['\ufeff' + content], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  
  // Download with .xls extension for better compatibility
  downloadBlob(blob, `${filename}.xls`);
}

/**
 * PDF Export Configuration
 */
export interface PDFExportConfig<T extends Record<string, unknown>> {
  title: string;
  data: T[];
  columns: ReportColumn<T>[];
  filename: string;
  companyName?: string;
  locationName?: string;
  dateRange?: { start: string; end: string };
  includeTotals?: boolean;
  totals?: Record<string, number>;
  orientation?: 'portrait' | 'landscape';
}

/**
 * Export data to PDF format
 */
export function exportToPDF<T extends Record<string, unknown>>(config: PDFExportConfig<T>): void {
  const {
    title,
    data,
    columns,
    filename,
    companyName,
    locationName,
    dateRange,
    includeTotals = false,
    totals,
    orientation = 'landscape',
  } = config;

  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let currentY = margin;

  // Header section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, margin, currentY);
  currentY += 8;

  // Company and location info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (companyName) {
    doc.text(`Company: ${companyName}`, margin, currentY);
    currentY += 5;
  }
  
  if (locationName) {
    doc.text(`Location: ${locationName}`, margin, currentY);
    currentY += 5;
  }
  
  if (dateRange) {
    doc.text(`Period: ${dateRange.start} to ${dateRange.end}`, margin, currentY);
    currentY += 5;
  }

  doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}`, margin, currentY);
  currentY += 10;

  // Calculate column widths
  const availableWidth = pageWidth - 2 * margin;
  const colWidth = availableWidth / columns.length;

  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, currentY, availableWidth, 8, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  
  columns.forEach((col, index) => {
    const x = margin + index * colWidth + 2;
    doc.text(col.header, x, currentY + 5, { maxWidth: colWidth - 4 });
  });
  
  currentY += 10;

  // Table data
  doc.setFont('helvetica', 'normal');
  
  data.forEach((row, rowIndex) => {
    // Check if we need a new page
    if (currentY > pageHeight - 30) {
      doc.addPage();
      currentY = margin;
    }

    // Alternate row background
    if (rowIndex % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(margin, currentY - 2, availableWidth, 7, 'F');
    }

    columns.forEach((col, colIndex) => {
      const value = getNestedValue(row, col.key as string);
      const formatted = formatValue(value, col.format);
      const x = margin + colIndex * colWidth + 2;
      
      // Truncate if too long
      const maxChars = Math.floor(colWidth / 2);
      const displayText = formatted.length > maxChars 
        ? formatted.substring(0, maxChars - 2) + '..' 
        : formatted;
      
      doc.text(displayText, x, currentY + 3);
    });

    currentY += 7;
  });

  // Totals section
  if (includeTotals && totals) {
    currentY += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 5;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Totals:', margin, currentY);
    currentY += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    
    Object.entries(totals).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      doc.text(`${label}: ${typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}`, margin, currentY);
      currentY += 5;
    });
  }

  // Footer with page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Download
  doc.save(`${filename}.pdf`);
}

/**
 * Helper function to download a blob
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate filename with date
 */
export function generateReportFilename(reportName: string, extension?: string): string {
  const date = format(new Date(), 'yyyy-MM-dd');
  const sanitized = reportName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const name = `${sanitized}_${date}`;
  return extension ? `${name}.${extension}` : name;
}
