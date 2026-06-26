import axiosInstance from './axiosConfig';

export const reportApi = {
  // ==========================================
  // GET TRANSACTION REPORT (MAIN ENDPOINT)
  // ==========================================
  getTransactionReport: (params) => {
    // Map params to PascalCase as per API spec
    const queryParams = {
      Page: params.page,
      PageSize: params.pageSize,
      SearchTerm: params.searchTerm,
      Buyer: params.buyer,
      Factory: params.factory,
      Unit: params.unit,
      ProcessStageId: params.processStageId,
      TransactionTypeId: params.transactionTypeId,
      StartDate: params.startDate,
      EndDate: params.endDate,
      WashTargetStartDate: params.washTargetStartDate,
      WashTargetEndDate: params.washTargetEndDate,
      SortBy: params.sortBy,
      SortOrder: params.sortOrder,
      ShiftType: params.shiftType,
      IsCompleted: params.isCompleted
    };

    // Remove undefined/null/empty strings to keep URL clean
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined || queryParams[key] === '' || queryParams[key] === null) {
        delete queryParams[key];
      }
    });

    console.log('📤 Report API params:', queryParams);

    return axiosInstance.get('/Report/transactions', { params: queryParams });
  },

  // ==========================================
  // GET SUMMARY ONLY
  // ==========================================
  getSummary: (params = {}) => {
    const queryParams = {
      SearchTerm: params.searchTerm,
      Buyer: params.buyer,
      Factory: params.factory,
      Unit: params.unit,
      ProcessStageId: params.processStageId,
      TransactionTypeId: params.transactionTypeId,
      StartDate: params.startDate,
      EndDate: params.endDate,
      WashTargetStartDate: params.washTargetStartDate,
      WashTargetEndDate: params.washTargetEndDate,
      ShiftType: params.shiftType,
      IsCompleted: params.isCompleted
    };

    // Remove undefined/null/empty strings
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined || queryParams[key] === '' || queryParams[key] === null) {
        delete queryParams[key];
      }
    });

    return axiosInstance.get('/Report/summary', { params: queryParams });
  },

  // ==========================================
  // GET FILTER OPTIONS
  // ==========================================
  getFilterOptions: () => {
    return axiosInstance.get('/Report/filter-options');
  },

  // ==========================================
  // EXPORT TO CSV
  // ==========================================
  exportToCsv: (params = {}) => {
    const queryParams = {
      SearchTerm: params.searchTerm,
      Buyer: params.buyer,
      Factory: params.factory,
      Unit: params.unit,
      ProcessStageId: params.processStageId,
      TransactionTypeId: params.transactionTypeId,
      StartDate: params.startDate,
      EndDate: params.endDate,
      WashTargetStartDate: params.washTargetStartDate,
      WashTargetEndDate: params.washTargetEndDate,
      SortBy: params.sortBy,
      SortOrder: params.sortOrder,
      ShiftType: params.shiftType,
      IsCompleted: params.isCompleted
    };

    // Remove undefined/null/empty strings
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined || queryParams[key] === '' || queryParams[key] === null) {
        delete queryParams[key];
      }
    });

    return axiosInstance.get('/Report/export/csv', {
      params: queryParams,
      responseType: 'blob'
    });
  },

  // ==========================================
  // GET USER WORK ORDER SUMMARY
  // ==========================================
  getUserWorkOrderSummary: (userId, params = {}) => {
    const queryParams = {
      startDate: params.startDate,
      endDate: params.endDate,
      buyer: params.buyer,
      factory: params.factory,
      unit: params.unit,
      processStageId: params.processStageId,
    };

    // Remove undefined/null/empty strings
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined || queryParams[key] === '' || queryParams[key] === null) {
        delete queryParams[key];
      }
    });

    return axiosInstance.get(`/report/user-workorder-summary/${userId}`, { params: queryParams });
  },

  // ==========================================
  // GET USER TRANSACTION HISTORY
  // ==========================================
  getUserTransactions: (userId, params = {}) => {
    const queryParams = {
      startDate: params.startDate,
      endDate: params.endDate,
    };

    // Remove undefined/null/empty strings
    Object.keys(queryParams).forEach(key => {
      if (queryParams[key] === undefined || queryParams[key] === '' || queryParams[key] === null) {
        delete queryParams[key];
      }
    });

    return axiosInstance.get(`/report/user-transactions/${userId}`, { params: queryParams });
  }
};
