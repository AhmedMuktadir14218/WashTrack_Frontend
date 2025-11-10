import axiosInstance from './axiosConfig';

export const washTransactionApi = {
  // ==================== RECEIVE TRANSACTIONS ====================
  createReceive: (data) => {
    return axiosInstance.post('/washtransaction/receive', data);
  },

  // ==================== DELIVERY TRANSACTIONS ====================
  createDelivery: (data) => {
    return axiosInstance.post('/washtransaction/delivery', data);
  },

  // ==================== TRANSACTION MANAGEMENT ====================
  getAll: () => {
    return axiosInstance.get('/washtransaction');
  },

  getById: (id) => {
    return axiosInstance.get(`/washtransaction/${id}`);
  },

  getByWorkOrder: (workOrderId) => {
    return axiosInstance.get(`/washtransaction/workorder/${workOrderId}`);
  },

  getByStage: (processStageId) => {
    return axiosInstance.get(`/washtransaction/stage/${processStageId}`);
  },

  filter: (filterParams) => {
    return axiosInstance.post('/washtransaction/filter', filterParams);
  },

  update: (id, data) => {
    return axiosInstance.put(`/washtransaction/${id}`, data);
  },

  delete: (id) => {
    return axiosInstance.delete(`/washtransaction/${id}`);
  },

  // ==================== BALANCE & STATUS ====================
  getBalance: (workOrderId) => {
    return axiosInstance.get(`/washtransaction/balance/workorder/${workOrderId}`);
  },

  getStatus: (workOrderId) => {
    return axiosInstance.get(`/washtransaction/status/workorder/${workOrderId}`);
  },

  getAllStatus: () => {
    return axiosInstance.get('/washtransaction/status/all');
  },

  // ==================== REPORTS ====================
  getStageSummary: () => {
    return axiosInstance.get('/washtransaction/summary/stages');
  },

  getReceivesByStage: (processStageId, params) => {
    return axiosInstance.get(
      `/washtransaction/receives/stage/${processStageId}`,
      { params }
    );
  },

  getDeliveriesByStage: (processStageId, params) => {
    return axiosInstance.get(
      `/washtransaction/deliveries/stage/${processStageId}`,
      { params }
    );
  },
};