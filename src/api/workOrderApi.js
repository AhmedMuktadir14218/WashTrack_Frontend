// D:\TusukaReact\WashRecieveDelivary_Frontend\src\api\workOrderApi.js
import axiosInstance from './axiosConfig';

export const workOrderApi = {
  // Get all work orders
  getAll: () => {
    return axiosInstance.get('/workorder');
  },
  getPaginated: (params) => {
    return axiosInstance.get('/workorder/paginated', { params });
  },
  // Get work order by ID
  getById: (id) => {
    return axiosInstance.get(`/workorder/${id}`);
  },

  // Get work order by work order number
  getByWorkOrderNo: (workOrderNo) => {
    return axiosInstance.get(`/workorder/by-workorderno/${workOrderNo}`);
  },

  // Create work order
  create: (data) => {
    return axiosInstance.post('/workorder', data);
  },

  // Update work order
  update: (id, data) => {
    return axiosInstance.put(`/workorder/${id}`, data);
  },

  // Delete work order
  delete: (id) => {
    return axiosInstance.delete(`/workorder/${id}`);
  },

  // Bulk upload
  bulkUpload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosInstance.post('/workorder/bulk-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Download template
  downloadTemplate: () => {
    return axiosInstance.get('/workorder/download-template', {
      responseType: 'blob',
    });
  },
};