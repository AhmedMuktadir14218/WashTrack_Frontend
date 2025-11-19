// D:\TusukaReact\WashRecieveDelivary_Frontend\src\api\userApi.js
import axiosInstance from './axiosConfig';

export const userApi = {
  // Get all users
  getAllUsers: (pageNumber = 1, pageSize = 10) => {
    return axiosInstance.get(`/user?pageNumber=${pageNumber}&pageSize=${pageSize}`);
  },

  // Get user by ID
  getUserById: (id) => {
    return axiosInstance.get(`/user/${id}`);
  },

  // Create user
  createUser: (userData) => {
    return axiosInstance.post('/user', userData);
  },

  // Update user
  updateUser: (id, userData) => {
    return axiosInstance.put(`/user/${id}`, userData);
  },

  // Delete user
  deleteUser: (id) => {
    return axiosInstance.delete(`/user/${id}`);
  },

  // Assign roles to user
  assignRoles: (id, roleIds) => {
    return axiosInstance.post(`/user/${id}/assign-roles`, { roleIds });
  },

  // Assign stages to user
  assignStages: (id, stageIds) => {
    return axiosInstance.post(`/user/${id}/assign-stages`, { stageIds });
  },

  // Toggle user status
  toggleUserStatus: (id) => {
    return axiosInstance.post(`/user/${id}/toggle-status`);
  }
};