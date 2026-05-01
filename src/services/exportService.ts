import * as XLSX from 'xlsx';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { Employee } from './supabaseEmployeeService';
import type { Vendor } from './supabaseVendorService';
import type { VendorPayment } from './supabasePaymentService';
import type { PayrollPayment } from './supabasePayrollService';
import type { Task } from '../app/featureTypes';

export interface ExportColumn<T> {
  header: string;
  key: string;
  width?: number;
  formatter?: (value: unknown, row: T) => string;
}

// Helper to format currency
const formatCurrency = (value: number): string => {
  if (value === null || value === undefined) return '';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

// Helper to format date
const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US');
  } catch {
    return dateString;
  }
};

// Employee columns configuration
export const employeeExportColumns: ExportColumn<Employee>[] = [
  { header: 'Employee ID', key: 'employee_id', width: 15 },
  { header: 'First Name', key: 'first_name', width: 15 },
  { header: 'Last Name', key: 'last_name', width: 15 },
  { header: 'Email', key: 'email', width: 25 },
  { header: 'SSN', key: 'ssn', width: 15 },
  { header: 'Department', key: 'department', width: 15 },
  { header: 'Job Title', key: 'job_title', width: 20 },
  { header: 'Hire Date', key: 'hire_date', width: 12, formatter: (_, row) => formatDate(row.hire_date) },
  { header: 'Gross Pay', key: 'gross_pay', width: 12, formatter: (_, row) => formatCurrency(row.gross_pay) },
  { header: 'Address', key: 'address', width: 25 },
  { header: 'City', key: 'city', width: 15 },
  { header: 'State', key: 'state', width: 10 },
  { header: 'ZIP', key: 'zip', width: 10 },
  { header: 'Status', key: 'status', width: 12 },
];

// Vendor columns configuration
export const vendorExportColumns: ExportColumn<Vendor>[] = [
  { header: 'Vendor ID', key: 'vendor_id', width: 15 },
  { header: 'Legal Name', key: 'legal_name', width: 25 },
  { header: 'Email', key: 'email', width: 25 },
  { header: 'Tax ID Type', key: 'tax_id_type', width: 12 },
  { header: 'Tax ID', key: 'tax_id', width: 15 },
  { header: 'Entity Type', key: 'entity_type', width: 15 },
  { header: 'Category', key: 'category', width: 15 },
  { header: 'State', key: 'state', width: 10 },
  { header: 'ZIP', key: 'zip', width: 10 },
  { header: 'Address', key: 'address', width: 30 },
  { header: 'TIN Verification', key: 'tin_verification_status', width: 15 },
  { header: 'W-9 Status', key: 'w9_status', width: 15 },
];

// Vendor Payment columns configuration
export const vendorPaymentExportColumns: ExportColumn<VendorPayment>[] = [
  { header: 'Payment ID', key: 'id', width: 15 },
  { header: 'Vendor ID', key: 'vendor_id', width: 15 },
  { header: 'Payment Date', key: 'payment_date', width: 12, formatter: (_, row) => formatDate(row.payment_date) },
  { header: 'Invoice Number', key: 'invoice_number', width: 15 },
  { header: 'Amount', key: 'amount', width: 12, formatter: (_, row) => formatCurrency(row.amount) },
  { header: 'Payment State', key: 'payment_state', width: 15 },
];

// Payroll Payment columns configuration
export const payrollPaymentExportColumns: ExportColumn<PayrollPayment>[] = [
  { header: 'Payment ID', key: 'id', width: 15 },
  { header: 'Employee ID', key: 'employee_id', width: 15 },
  { header: 'Payroll Month', key: 'payroll_month', width: 12 },
  { header: 'Gross Pay', key: 'gross_pay', width: 12, formatter: (_, row) => formatCurrency(row.gross_pay) },
  { header: 'Federal Tax', key: 'federal_tax', width: 12, formatter: (_, row) => formatCurrency(row.federal_tax) },
  { header: 'State Tax', key: 'state_tax', width: 12, formatter: (_, row) => formatCurrency(row.state_tax) },
  { header: 'Social Security', key: 'social_security', width: 12, formatter: (_, row) => formatCurrency(row.social_security) },
  { header: 'Medicare', key: 'medicare', width: 12, formatter: (_, row) => formatCurrency(row.medicare) },
  { header: 'Net Pay', key: 'net_pay', width: 12, formatter: (_, row) => formatCurrency(row.net_pay) },
  { header: 'Payment Method', key: 'payment_method', width: 15 },
  { header: 'Status', key: 'status', width: 12 },
  { header: 'Pay Date', key: 'pay_date', width: 12, formatter: (_, row) => formatDate(row.pay_date || '') },
];

// Task columns configuration
export const taskExportColumns: ExportColumn<Task>[] = [
  { header: 'Task ID', key: 'id', width: 10 },
  { header: 'Title', key: 'title', width: 30 },
  { header: 'Description', key: 'description', width: 40 },
  { header: 'Category', key: 'category', width: 15 },
  { header: 'Priority', key: 'priority', width: 12 },
  { header: 'Status', key: 'status', width: 12 },
  { header: 'Due Date', key: 'due_date', width: 12, formatter: (_, row) => formatDate(row.due_date || '') },
  { header: 'Assigned To', key: 'assigned_to', width: 20 },
  { header: 'Created At', key: 'created_at', width: 12, formatter: (_, row) => formatDate(row.created_at) },
];

// Generic Excel Export Function
export function exportToExcel<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  sheetName: string = 'Data'
): void {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  // Transform data for Excel
  const excelData = data.map((row) => {
    const formattedRow: Record<string, string> = {};
    columns.forEach((col) => {
      const value = (row as Record<string, unknown>)[col.key];
      formattedRow[col.header] = col.formatter
        ? col.formatter(value, row)
        : value !== null && value !== undefined
        ? String(value)
        : '';
    });
    return formattedRow;
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);

  // Set column widths
  const colWidths = columns.map((col) => ({ wch: col.width || 15 }));
  worksheet['!cols'] = colWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate Excel file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// Generic CSV Export Function
export function exportToCSV<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string
): void {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  // Create CSV content
  const headers = columns.map((col) => col.header).join(',');
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = (row as Record<string, unknown>)[col.key];
        const formatted = col.formatter
          ? col.formatter(value, row)
          : value !== null && value !== undefined
          ? String(value)
          : '';
        // Escape quotes and wrap in quotes if contains comma
        const escaped = formatted.replace(/"/g, '""');
        return escaped.includes(',') ? `"${escaped}"` : escaped;
      })
      .join(',')
  );

  const csvContent = [headers, ...rows].join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// PDF Export Function - Creates a table-style PDF
export async function exportToPDF<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  title: string
): Promise<void> {
  if (data.length === 0) {
    throw new Error('No data to export');
  }

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  const fontSize = 10;
  const headerFontSize = 12;
  const rowHeight = 20;
  const headerHeight = 25;
  const maxRowsPerPage = Math.floor((height - 2 * margin - headerHeight - 40) / rowHeight);

  let currentY = height - margin;

  // Draw title
  page.drawText(title, {
    x: margin,
    y: currentY,
    size: headerFontSize + 4,
    font: boldFont,
    color: rgb(0, 0, 0),
  });
  currentY -= 30;

  // Draw generation date
  const dateText = `Generated: ${new Date().toLocaleDateString()}`;
  page.drawText(dateText, {
    x: margin,
    y: currentY,
    size: fontSize - 2,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  currentY -= 30;

  // Calculate column widths based on available space
  const tableWidth = width - 2 * margin;
  const totalWidth = columns.reduce((sum, col) => sum + (col.width || 15), 0);
  const scaleFactor = tableWidth / totalWidth;

  let rowIndex = 0;

  while (rowIndex < data.length) {
    // Draw headers
    let currentX = margin;
    page.drawRectangle({
      x: margin,
      y: currentY - headerHeight + 5,
      width: tableWidth,
      height: headerHeight,
      color: rgb(0.9, 0.9, 0.9),
    });

    columns.forEach((col) => {
      const colWidth = (col.width || 15) * scaleFactor;
      page.drawText(col.header, {
        x: currentX + 2,
        y: currentY - 12,
        size: fontSize,
        font: boldFont,
        color: rgb(0, 0, 0),
      });
      currentX += colWidth;
    });

    currentY -= headerHeight;

    // Draw rows for this page
    const rowsOnThisPage = Math.min(maxRowsPerPage, data.length - rowIndex);

    for (let i = 0; i < rowsOnThisPage; i++) {
      const row = data[rowIndex];
      currentX = margin;

      // Alternate row background
      if (i % 2 === 1) {
        page.drawRectangle({
          x: margin,
          y: currentY - rowHeight + 2,
          width: tableWidth,
          height: rowHeight,
          color: rgb(0.97, 0.97, 0.97),
        });
      }

      columns.forEach((col) => {
        const colWidth = (col.width || 15) * scaleFactor;
        const value = (row as Record<string, unknown>)[col.key];
        const displayValue = col.formatter
          ? col.formatter(value, row)
          : value !== null && value !== undefined
          ? String(value)
          : '';

        // Truncate if too long
        const maxChars = Math.floor(colWidth / (fontSize * 0.6));
        const truncated = displayValue.length > maxChars ? displayValue.substring(0, maxChars - 2) + '..' : displayValue;

        page.drawText(truncated, {
          x: currentX + 2,
          y: currentY - 12,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });

        currentX += colWidth;
      });

      currentY -= rowHeight;
      rowIndex++;
    }

    // Add new page if more data
    if (rowIndex < data.length) {
      page = pdfDoc.addPage();
      currentY = height - margin;
    }
  }

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.pdf`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Convenience functions for specific entity types
export const exportService = {
  // Employees
  exportEmployeesToExcel: (employees: Employee[], filename: string = 'employees') => {
    exportToExcel(employees, employeeExportColumns, filename, 'Employees');
  },
  exportEmployeesToCSV: (employees: Employee[], filename: string = 'employees') => {
    exportToCSV(employees, employeeExportColumns, filename);
  },
  exportEmployeesToPDF: async (employees: Employee[], filename: string = 'employees') => {
    await exportToPDF(employees, employeeExportColumns, filename, 'Employee List');
  },

  // Vendors
  exportVendorsToExcel: (vendors: Vendor[], filename: string = 'vendors') => {
    exportToExcel(vendors, vendorExportColumns, filename, 'Vendors');
  },
  exportVendorsToCSV: (vendors: Vendor[], filename: string = 'vendors') => {
    exportToCSV(vendors, vendorExportColumns, filename);
  },
  exportVendorsToPDF: async (vendors: Vendor[], filename: string = 'vendors') => {
    await exportToPDF(vendors, vendorExportColumns, filename, 'Vendor List');
  },

  // Vendor Payments
  exportVendorPaymentsToExcel: (payments: VendorPayment[], filename: string = 'vendor-payments') => {
    exportToExcel(payments, vendorPaymentExportColumns, filename, 'Vendor Payments');
  },
  exportVendorPaymentsToCSV: (payments: VendorPayment[], filename: string = 'vendor-payments') => {
    exportToCSV(payments, vendorPaymentExportColumns, filename);
  },
  exportVendorPaymentsToPDF: async (payments: VendorPayment[], filename: string = 'vendor-payments') => {
    await exportToPDF(payments, vendorPaymentExportColumns, filename, 'Vendor Payment List');
  },

  // Payroll Payments
  exportPayrollToExcel: (payments: PayrollPayment[], filename: string = 'payroll') => {
    exportToExcel(payments, payrollPaymentExportColumns, filename, 'Payroll');
  },
  exportPayrollToCSV: (payments: PayrollPayment[], filename: string = 'payroll') => {
    exportToCSV(payments, payrollPaymentExportColumns, filename);
  },
  exportPayrollToPDF: async (payments: PayrollPayment[], filename: string = 'payroll') => {
    await exportToPDF(payments, payrollPaymentExportColumns, filename, 'Payroll List');
  },

  // Tasks
  exportTasksToExcel: (tasks: Task[], filename: string = 'tasks') => {
    exportToExcel(tasks, taskExportColumns, filename, 'Tasks');
  },
  exportTasksToCSV: (tasks: Task[], filename: string = 'tasks') => {
    exportToCSV(tasks, taskExportColumns, filename);
  },
  exportTasksToPDF: async (tasks: Task[], filename: string = 'tasks') => {
    await exportToPDF(tasks, taskExportColumns, filename, 'Task List');
  },

  // Generic functions
  exportToExcel,
  exportToCSV,
  exportToPDF,
};

export default exportService;
