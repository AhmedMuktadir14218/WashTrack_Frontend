// D:\TusukaReact\WashRecieveDelivary_Frontend\src\api\processStageApi.js
import axiosInstance from './axiosConfig';

export const processStageApi = {
  // Get all stages
  getAll: () => {
    return axiosInstance.get('/processstage');
  },

  // Get single stage
  getById: (id) => {
    return axiosInstance.get(`/processstage/${id}`);
  },

  // Create stage (admin only)
  create: (data) => {
    return axiosInstance.post('/processstage', data);
  },

  // Update stage (admin only)
  update: (id, data) => {
    return axiosInstance.put(`/processstage/${id}`, data);
  },

  // Delete stage (admin only)
  delete: (id) => {
    return axiosInstance.delete(`/processstage/${id}`);
  },
};