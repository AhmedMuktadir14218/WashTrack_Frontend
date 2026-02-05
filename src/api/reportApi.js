// D:\TusukaReact\WashRecieveDelivary_Frontend\src\api\reportApi.js
import axiosInstance from './axiosConfig';

export const reportApi = {
  // ==========================================
  // GET TRANSACTION REPORT (MAIN ENDPOINT)
  // ==========================================
  getTransactionReport: (params) => {
    const cleanParams = {};

    // Pagination
    if (params.page) cleanParams.page = params.page;
    if (params.pageSize) cleanParams.pageSize = params.pageSize;

    // Search
    if (params.searchTerm) cleanParams.searchTerm = params.searchTerm;

    // Filters
    if (params.buyer) cleanParams.buyer = params.buyer;
    if (params.factory) cleanParams.factory = params.factory;
    if (params.unit) cleanParams.unit = params.unit;
    if (params.processStageId) cleanParams.processStageId = params.processStageId;
    if (params.transactionTypeId !== undefined && params.transactionTypeId !== '') {
      cleanParams.transactionTypeId = params.transactionTypeId;
    }

    // Transaction Date Range
    if (params.startDate) cleanParams.startDate = params.startDate;
    if (params.endDate) cleanParams.endDate = params.endDate;

    // Wash Target Date Range
    if (params.washTargetStartDate) cleanParams.washTargetStartDate = params.washTargetStartDate;
    if (params.washTargetEndDate) cleanParams.washTargetEndDate = params.washTargetEndDate;

    // Sorting
    if (params.sortBy) cleanParams.sortBy = params.sortBy;
    if (params.sortOrder) cleanParams.sortOrder = params.sortOrder;

    console.log('📤 Report API params:', cleanParams);

    return axiosInstance.get('/report/transactions', { params: cleanParams });
  },

  // ==========================================
  // GET SUMMARY ONLY
  // ==========================================
  getSummary: (params = {}) => {
    return axiosInstance.get('/report/summary', { params });
  },

  // ==========================================
  // GET FILTER OPTIONS
  // ==========================================
  getFilterOptions: () => {
    return axiosInstance.get('/report/filter-options');
  },

  // ==========================================
  // EXPORT TO CSV
  // ==========================================
  exportToCsv: (params = {}) => {
    const cleanParams = {};

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
    if (params.washTargetStartDate) cleanParams.washTargetStartDate = params.washTargetStartDate;
    if (params.washTargetEndDate) cleanParams.washTargetEndDate = params.washTargetEndDate;
    if (params.sortBy) cleanParams.sortBy = params.sortBy;
    if (params.sortOrder) cleanParams.sortOrder = params.sortOrder;

    return axiosInstance.get('/report/export/csv', {
      params: cleanParams,
      responseType: 'blob'
    });
  }
};