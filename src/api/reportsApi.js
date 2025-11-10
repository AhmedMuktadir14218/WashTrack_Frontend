import axiosInstance from './axiosConfig';

export const reportsApi = {
  // Get all work orders with transactions summary
  getWorkOrdersSummary: () => {
    return axiosInstance.get('/washtransaction/summary/stages');
  },

  // Get detailed report data
  getDetailedReport: () => {
    return axiosInstance.get('/workorder');
  },

  // Get transactions for report
  getAllTransactions: () => {
    return axiosInstance.get('/washtransaction');
  },
};