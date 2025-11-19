// D:\TusukaReact\WashRecieveDelivary_Frontend\src\utils\csvExport.js

export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get all keys from the first object
  const keys = Object.keys(data[0]);
  
  // Create CSV header
  const header = keys.join(',');
  
  // Create CSV rows
  const rows = data.map(item =>
    keys.map(key => {
      let value = item[key];
      
      // Handle null/undefined
      if (value === null || value === undefined) {
        return '';
      }
      
      // Handle dates
      if (value instanceof Date) {
        return value.toISOString();
      }
      
      // Handle strings with commas or quotes
      if (typeof value === 'string') {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }
      
      return value;
    }).join(',')
  );
  
  // Combine header and rows
  const csv = [header, ...rows].join('\n');
  
  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportTransactionsToCSV = (transactions, workOrders = []) => {
  if (!transactions || transactions.length === 0) {
    alert('No transactions to export');
    return;
  }

  // Create work order lookup map
  const workOrderMap = {};
  workOrders.forEach(wo => {
    workOrderMap[wo.id] = wo;
  });

  // Transform data for export
  const exportData = transactions.map(transaction => {
    const workOrder = workOrderMap[transaction.workOrderId];
    
    return {
      'Type': transaction.transactionType === 1 ? 'Receive' : 'Delivery',
      'Work Order No': transaction.workOrderNo,
      'FastReact No': workOrder?.fastReactNo || '-',
      'Quantity': transaction.quantity,
      'Process Stage': transaction.processStageName,
      'Date': new Date(transaction.transactionDate).toLocaleDateString('en-GB'),
      'Time': new Date(transaction.transactionDate).toLocaleTimeString('en-GB'),
      'Batch/Gate Pass': transaction.batchNo || transaction.gatePassNo || '-',
      'Style Name': transaction.styleName || workOrder?.styleName || '-',
      'Wash Type': workOrder?.washType || '-',
      'Marks': workOrder?.marks || '-',
      'Wash Target Date': workOrder?.washTargetDate ? new Date(workOrder.washTargetDate).toLocaleDateString('en-GB') : '-',
      'Color': workOrder?.color || '-',
      'Unit': workOrder?.unit || '-',
      'Factory': workOrder?.factory || '-',
      'Buyer': workOrder?.buyer || '-',
    };
  });

  const timestamp = new Date().toLocaleDateString('en-GB').replace(/\//g, '-');
  exportToCSV(exportData, `transactions_${timestamp}.csv`);
};