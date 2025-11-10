// D:\TusukaReact\WashRecieveDelivary_Frontend\src\api\authApi.js
import axiosInstance from './axiosConfig';

export const authApi = {
  // Login
  login: (credentials) => {
    return axiosInstance.post('/auth/login', credentials);
  },

  // Register
  register: (userData) => {
    return axiosInstance.post('/auth/register', userData);
  },

  // Get Profile
  getProfile: () => {
    return axiosInstance.get('/auth/profile');
  },

  // Logout (clear local data)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};