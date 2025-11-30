// src/utils/csvExport.js
import { format, isValid } from 'date-fns';

/**
 * CSV Export Configuration
 * Defines column structure, formatting rules, and data transformation
 */
const CSV_CONFIG = {
  columns: [
    { key: 'id', label: 'Transaction ID', width: 12 },
    { key: 'transactionType', label: 'Type', width: 12 },
    { key: 'workOrderNo', label: 'Work Order No', width: 15 },
    { key: 'styleName', label: 'Style Name', width: 20 },
    { key: 'fastReactNo', label: 'FastReact No', width: 15 },
    { key: 'washTargetDate', label: 'Wash Target Date', width: 18 },
    { key: 'marks', label: 'Marks', width: 25 },
    { key: 'buyer', label: 'Buyer', width: 20 },
    { key: 'factory', label: 'Factory', width: 20 },
    { key: 'line', label: 'Line', width: 15 },
    { key: 'processStageName', label: 'Process Stage', width: 18 },
    { key: 'quantity', label: 'Quantity (pcs)', width: 15 },
    { key: 'batchNo', label: 'Batch No', width: 15 },
    { key: 'gatePassNo', label: 'Gate Pass No', width: 15 },
    { key: 'remarks', label: 'Remarks', width: 25 },
    { key: 'receivedBy', label: 'Received By', width: 18 },
    { key: 'deliveredTo', label: 'Delivered To', width: 18 },
    { key: 'transactionDate', label: 'Transaction Date', width: 18 },
    { key: 'transactionTime', label: 'Transaction Time', width: 15 },
    { key: 'createdByUsername', label: 'Created By', width: 18 },
    { key: 'createdAt', label: 'Created At', width: 22 }
  ],
  dateFormat: 'dd MMM yyyy',
  timeFormat: 'HH:mm:ss',
  dateTimeFormat: 'dd MMM yyyy HH:mm:ss'
};

/**
 * Date Formatter Utility
 * Safely formats dates with fallback handling
 */
class DateFormatter {
  static parseDate(dateString) {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      return isValid(date) ? date : null;
    } catch (error) {
      console.warn(`Invalid date: ${dateString}`);
      return null;
    }
  }

  static formatDate(dateString, formatPattern) {
    const date = this.parseDate(dateString);
    return date ? format(date, formatPattern) : '-';
  }

  static getDateOnly(dateString) {
    return this.formatDate(dateString, CSV_CONFIG.dateFormat);
  }

  static getTimeOnly(dateString) {
    return this.formatDate(dateString, CSV_CONFIG.timeFormat);
  }

  static getDateTime(dateString) {
    return this.formatDate(dateString, CSV_CONFIG.dateTimeFormat);
  }
}

/**
 * Transaction Data Transformer
 * Handles data enrichment and transformation
 */
class TransactionDataTransformer {
  constructor(workOrders = []) {
    this.workOrders = workOrders;
  }

  getWorkOrderById(workOrderId) {
    return this.workOrders.find(wo => wo.id === parseInt(workOrderId));
  }

  getTransactionTypeLabel(type) {
    const typeMap = {
      1: 'Receive',
      2: 'Delivery'
    };
    return typeMap[type] || 'Unknown';
  }

  transformTransaction(transaction) {
    const workOrder = this.getWorkOrderById(transaction.workOrderId);

    return {
      id: transaction.id || '-',
      transactionType: this.getTransactionTypeLabel(transaction.transactionType),
      workOrderNo: transaction.workOrderNo || '-',
      styleName: transaction.styleName || '-',
      fastReactNo: workOrder?.fastReactNo || '-',
      washTargetDate: DateFormatter.getDateOnly(workOrder?.washTargetDate),
      marks: this.sanitizeText(workOrder?.marks),
      buyer: transaction.buyer || workOrder?.buyer || '-',
      factory: transaction.factory || workOrder?.factory || '-',
      line: transaction.line || workOrder?.line || '-',
      processStageName: transaction.processStageName || '-',
      quantity: transaction.quantity ? transaction.quantity.toString() : '-',
      batchNo: transaction.batchNo || '-',
      gatePassNo: transaction.gatePassNo || '-',
      remarks: this.sanitizeText(transaction.remarks),
      receivedBy: transaction.receivedBy || '-',
      deliveredTo: transaction.deliveredTo || '-',
      transactionDate: DateFormatter.getDateOnly(transaction.transactionDate),
      transactionTime: DateFormatter.getTimeOnly(transaction.transactionDate),
      createdByUsername: transaction.createdByUsername || '-',
      createdAt: DateFormatter.getDateTime(transaction.createdAt)
    };
  }

  /**
   * Sanitize text to prevent CSV injection and handle special characters
   */
  sanitizeText(text) {
    if (!text) return '-';
    
    const sanitized = String(text)
      .trim()
      .replace(/[\r\n]+/g, ' ') // Replace newlines with space
      .substring(0, 255); // Limit length
    
    return sanitized || '-';
  }

  transformAll(transactions) {
    return transactions.map(transaction => this.transformTransaction(transaction));
  }
}

/**
 * CSV Generator
 * Handles CSV format generation and file creation
 */
class CSVGenerator {
  /**
   * Escape CSV cell value
   */
  static escapeCSVCell(value) {
    const cell = String(value || '');
    
    // Check if cell needs quoting
    if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
      return `"${cell.replace(/"/g, '""')}"`;
    }
    
    return cell;
  }

  /**
   * Generate CSV content from data
   */
  static generateContent(transformedData) {
    // Generate header row
    const headers = CSV_CONFIG.columns.map(col => this.escapeCSVCell(col.label));
    const headerRow = headers.join(',');

    // Generate data rows
    const dataRows = transformedData.map(record => {
      const row = CSV_CONFIG.columns.map(col => 
        this.escapeCSVCell(record[col.key])
      );
      return row.join(',');
    });

    // Combine header and data
    return [headerRow, ...dataRows].join('\n');
  }

  /**
   * Generate filename with timestamp
   */
  static generateFilename() {
    const timestamp = format(new Date(), 'dd-MMM-yyyy_HH-mm-ss');
    return `transactions_${timestamp}.csv`;
  }

  /**
   * Create and trigger download
   */
  static downloadCSV(content, filename) {
    try {
      // Add BOM for Excel UTF-8 compatibility
      const BOM = '\uFEFF';
      const csvWithBOM = BOM + content;

      const blob = new Blob([csvWithBOM], { 
        type: 'text/csv;charset=utf-8;' 
      });

      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      console.error('Error creating download:', error);
      throw new Error('Failed to create CSV download');
    }
  }
}

/**
 * Main Export Function
 * Professional wrapper for CSV export
 */
export const exportTransactionsToCSV = (transactions, workOrders) => {
  try {
    // Validate input
    if (!Array.isArray(transactions) || transactions.length === 0) {
      throw new Error('No transactions available for export');
    }

    if (!Array.isArray(workOrders)) {
      console.warn('Invalid workOrders array, proceeding without work order data');
    }

    // Transform data
    const transformer = new TransactionDataTransformer(workOrders || []);
    const transformedData = transformer.transformAll(transactions);

    // Generate CSV
    const csvContent = CSVGenerator.generateContent(transformedData);
    const filename = CSVGenerator.generateFilename();

    // Download
    CSVGenerator.downloadCSV(csvContent, filename);

    // Log success
    console.log(
      `✅ CSV Export Successful | Records: ${transactions.length} | File: ${filename}`
    );

    return {
      success: true,
      message: `Exported ${transactions.length} transactions`,
      recordCount: transactions.length,
      filename: filename
    };
  } catch (error) {
    console.error('❌ CSV Export Error:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    throw new Error(`CSV Export Failed: ${error.message}`);
  }
};

/**
 * Export configuration for testing or debugging
 */
export const getCSVConfig = () => CSV_CONFIG;