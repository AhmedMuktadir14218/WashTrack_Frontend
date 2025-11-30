import axiosInstance from './axiosConfig';

export const washTransactionApi = {
  // ==========================================
  // EXPORT TO CSV (SERVER-SIDE)
  // ==========================================
  /// <summary>
  /// Download transactions as CSV file with filters
  /// Supports: searchTerm, buyer, factory, processStageId, transactionTypeId, startDate, endDate
  /// </summary>
// ==========================================
// EXPORT TO CSV (SERVER-SIDE)
// ==========================================
// ==========================================
// EXPORT TO CSV (SERVER-SIDE)
// ==========================================
exportToCSV: (filters = {}) => {
  console.log('📥 exportToCSV called with filters:', filters);

  // ✅ Build URL params only with non-empty values
  const params = {};
  if (filters.searchTerm) params.searchTerm = filters.searchTerm;
  if (filters.buyer) params.buyer = filters.buyer;
  if (filters.factory) params.factory = filters.factory;
  if (filters.unit) params.unit = filters.unit; // ✅ ADDED: Unit filter
  if (filters.processStageId) params.processStageId = filters.processStageId;
  if (filters.transactionTypeId !== undefined && filters.transactionTypeId !== '') {
    params.transactionTypeId = filters.transactionTypeId;
  }
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;

  console.log('📤 CSV Export params:', params);

  return axiosInstance.get('/washtransaction/export/csv', {
    params,
    responseType: 'blob',
    headers: {
      'Accept': 'text/csv',
    }
  });
},

  // ==========================================
  // PAGINATED WITH SEARCH & FILTERS
  // ==========================================
  /// <summary>
  /// Get paginated transactions with search and filters
  /// Supports pagination, search, sorting, and advanced filters
  /// </summary>
// ==========================================
// PAGINATED WITH SEARCH & FILTERS
// ==========================================
getPaginated: (params) => {
  console.log('📄 getPaginated called with params:');
  console.log('   Page:', params.page);
  console.log('   PageSize:', params.pageSize);
  console.log('   SearchTerm:', params.searchTerm);
  console.log('   Buyer:', params.buyer);
  console.log('   Factory:', params.factory);
  console.log('   Unit:', params.unit);
  console.log('   ProcessStageId:', params.processStageId);
  console.log('   TransactionTypeId:', params.transactionTypeId);
  console.log('   StartDate:', params.startDate);
  console.log('   EndDate:', params.endDate);
  console.log('   SortBy:', params.sortBy);
  console.log('   SortOrder:', params.sortOrder);

  // ✅ Build clean params object - only non-null values
  const cleanParams = {};
  
  if (params.page) cleanParams.page = params.page;
  if (params.pageSize) cleanParams.pageSize = params.pageSize;
  if (params.searchTerm) cleanParams.searchTerm = params.searchTerm;
  if (params.buyer) cleanParams.buyer = params.buyer;
  if (params.factory) cleanParams.factory = params.factory;
  if (params.unit) cleanParams.unit = params.unit;
  if (params.processStageId) cleanParams.processStageId = params.processStageId;
  if (params.transactionTypeId !== undefined && params.transactionTypeId !== '') {
    cleanParams.transactionTypeId = params.transactionTypeId;
  }
  if (params.startDate) cleanParams.startDate = params.startDate;
  if (params.endDate) cleanParams.endDate = params.endDate;
  if (params.sortBy) cleanParams.sortBy = params.sortBy;
  if (params.sortOrder) cleanParams.sortOrder = params.sortOrder;

  console.log('📤 Clean params being sent:', cleanParams);

  return axiosInstance.get('/washtransaction/paginated', { params: cleanParams });
},
  // ==========================================
  // CREATE RECEIVE TRANSACTION
  // ==========================================
  createReceive: (data) => {
    console.log('➕ Creating receive transaction:', data);
    return axiosInstance.post('/washtransaction/receive', data);
  },

  // ==========================================
  // CREATE DELIVERY TRANSACTION
  // ==========================================
  createDelivery: (data) => {
    console.log('➕ Creating delivery transaction:', data);
    return axiosInstance.post('/washtransaction/delivery', data);
  },

  // ==========================================
  // GET ALL TRANSACTIONS (without pagination)
  // ==========================================
  getAll: () => {
    console.log('📋 Fetching all transactions');
    return axiosInstance.get('/washtransaction');
  },

  // ==========================================
  // GET TRANSACTION BY ID
  // ==========================================
  getById: (id) => {
    console.log(`📋 Fetching transaction ${id}`);
    return axiosInstance.get(`/washtransaction/${id}`);
  },

  // ==========================================
  // GET TRANSACTIONS BY WORK ORDER
  // ==========================================
  getByWorkOrder: (workOrderId) => {
    console.log(`📋 Fetching transactions for work order ${workOrderId}`);
    return axiosInstance.get(`/washtransaction/workorder/${workOrderId}`);
  },

  // ==========================================
  // GET TRANSACTIONS BY STAGE
  // ==========================================
  getByStage: (processStageId) => {
    console.log(`📋 Fetching transactions for stage ${processStageId}`);
    return axiosInstance.get(`/washtransaction/stage/${processStageId}`);
  },

  // ==========================================
  // FILTER TRANSACTIONS (POST)
  // ==========================================
  filter: (filterParams) => {
    console.log('🔍 Filtering transactions:', filterParams);
    return axiosInstance.post('/washtransaction/filter', filterParams);
  },

  // ==========================================
  // UPDATE TRANSACTION (Admin only)
  // ==========================================
  update: (id, data) => {
    console.log(`✏️ Updating transaction ${id}:`, data);
    return axiosInstance.put(`/washtransaction/${id}`, data);
  },

  // ==========================================
  // DELETE TRANSACTION (Admin only)
  // ==========================================
  delete: (id) => {
    console.log(`🗑️ Deleting transaction ${id}`);
    return axiosInstance.delete(`/washtransaction/${id}`);
  },

  // ==========================================
  // BALANCE & STATUS
  // ==========================================
  getBalance: (workOrderId) => {
    console.log(`💰 Fetching balance for work order ${workOrderId}`);
    return axiosInstance.get(`/washtransaction/balance/workorder/${workOrderId}`);
  },

  getStatus: (workOrderId) => {
    console.log(`📊 Fetching status for work order ${workOrderId}`);
    return axiosInstance.get(`/washtransaction/status/workorder/${workOrderId}`);
  },

  getAllStatus: () => {
    console.log('📊 Fetching all wash statuses');
    return axiosInstance.get('/washtransaction/status/all');
  },

  // ==========================================
  // REPORTS
  // ==========================================
  getStageSummary: () => {
    console.log('📈 Fetching stage summary');
    return axiosInstance.get('/washtransaction/summary/stages');
  },

  getReceivesByStage: (processStageId, params = {}) => {
    console.log(`📥 Fetching receives for stage ${processStageId}:`, params);
    return axiosInstance.get(
      `/washtransaction/receives/stage/${processStageId}`,
      { params }
    );
  },

  getDeliveriesByStage: (processStageId, params = {}) => {
    console.log(`📤 Fetching deliveries for stage ${processStageId}:`, params);
    return axiosInstance.get(
      `/washtransaction/deliveries/stage/${processStageId}`,
      { params }
    );
  },

  // ==========================================
  // GET ALL DATA FOR EXPORT (Helper method)
  // ==========================================
  /// <summary>
  /// Get all transaction data for export with filters
  /// Uses paginated endpoint with high pageSize to get all records
  /// </summary>
  getAllForExport: (searchTerm = '', filters = {}) => {
    console.log('📤 getAllForExport called with:', { searchTerm, filters });

    // ✅ Build clean params object
    const params = {
      page: 1,
      pageSize: 10000, // ✅ Get all records in one request
      sortBy: 'transactionDate',
      sortOrder: 'desc',
    };

    // ✅ Add search term if provided
    if (searchTerm && searchTerm.trim()) {
      params.searchTerm = searchTerm.trim();
    }

    // ✅ Add filters only if they have values
    if (filters.buyer) params.buyer = filters.buyer;
    if (filters.factory) params.factory = filters.factory;
    if (filters.processStageId) params.processStageId = filters.processStageId;
    if (filters.transactionTypeId !== undefined && filters.transactionTypeId !== '') {
      params.transactionTypeId = filters.transactionTypeId;
    }
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;

    console.log('📤 getAllForExport params:', params);

    return axiosInstance.get('/washtransaction/paginated', { params });
  },
};