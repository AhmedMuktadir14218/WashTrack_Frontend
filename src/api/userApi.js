// // D:\TusukaReact\WashRecieveDelivary_Frontend\src\api\userApi.js
// import axiosInstance from './axiosConfig';

// // Helper to extract current user ID from JWT
// const getCurrentUserId = () => {
//   try {
//     const token =
//       localStorage.getItem('token') ||
//       localStorage.getItem('accessToken') ||
//       localStorage.getItem('authToken');
//     if (token) {
//       const base64Url = token.split('.')[1];
//       const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
//       const payload = JSON.parse(
//         decodeURIComponent(
//           atob(base64)
//             .split('')
//             .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
//             .join('')
//         )
//       );
//       return parseInt(
//         payload[
//           'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
//         ],
//         10
//       );
//     }
//   } catch (e) {
//     console.error('Failed to decode token:', e);
//   }
//   return null;
// };

// export const userApi = {
//   // Get all users
//   getAllUsers: (pageNumber = 1, pageSize = 10) => {
//     return axiosInstance.get(
//       `/User?pageNumber=${pageNumber}&pageSize=${pageSize}`
//     );
//   },

//   // Get user by ID
//   getUserById: (id) => {
//     return axiosInstance.get(`/User/${id}`);
//   },

//   // Create user
//   createUser: (userData) => {
//     return axiosInstance.post('/User', userData);
//   },

//   // Update user
//   updateUser: (id, userData) => {
//     return axiosInstance.put(`/User/${id}`, userData);
//   },

//   // Delete user
//   deleteUser: (id) => {
//     return axiosInstance.delete(`/User/${id}`);
//   },

//   // Assign roles to user
//   assignRoles: (id, roleIds) => {
//     return axiosInstance.post(`/User/${id}/assign-roles`, { roleIds });
//   },

//   // Assign stages to user
//   assignStages: (id, stageIds) => {
//     return axiosInstance.post(`/User/${id}/assign-stages`, { stageIds });
//   },

//   // Toggle user status
//   toggleUserStatus: (id) => {
//     return axiosInstance.post(`/User/${id}/toggle-status`);
//   },

//   // Assign plant/unit to user
//   assignUserUnits: (data) => {
//     return axiosInstance.post('/User/assign-user', {
//       userId: data.userId,
//       userAssignments: data.userAssignments,
//       createdBy: data.createdBy || getCurrentUserId(),
//     });
//   },

//   // Get current user ID
//   getCurrentUserId,
// };

// D:\TusukaReact\WashRecieveDelivary_Frontend\src\api\userApi.js
import axiosInstance from './axiosConfig';

const getCurrentUserId = () => {
  try {
    const token =
      localStorage.getItem('token') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('authToken');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(
        decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        )
      );
      return parseInt(
        payload[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ],
        10
      );
    }
  } catch (e) {
    console.error('Failed to decode token:', e);
  }
  return null;
};

export const userApi = {
  getAllUsers: (pageNumber = 1, pageSize = 10) =>
    axiosInstance.get(`/User?pageNumber=${pageNumber}&pageSize=${pageSize}`),

  getUserById: (id) => axiosInstance.get(`/User/${id}`),

  // ✅ API 1: Create user (basic info + roleIds ONLY — no stages, no units)
  createUser: (userData) => axiosInstance.post('/User', userData),

  updateUser: (id, userData) => axiosInstance.put(`/User/${id}`, userData),

  deleteUser: (id) => axiosInstance.delete(`/User/${id}`),

  // ✅ API 2a: Assign roles (separate)
  assignRoles: (id, roleIds) =>
    axiosInstance.post(`/User/${id}/assign-roles`, { roleIds }),

  // ✅ API 2b: Assign process stages (separate)
  assignStages: (id, stageIds) =>
    axiosInstance.post(`/User/${id}/assign-stages`, { stageIds }),

  toggleUserStatus: (id) => axiosInstance.post(`/User/${id}/toggle-status`),

  // ✅ API 2c: Assign plant/unit (separate)
  assignUserUnits: (data) =>
    axiosInstance.post('/User/assign-user', {
      userId: data.userId,
      userAssignments: data.userAssignments,
      createdBy: data.createdBy || getCurrentUserId(),
    }),

  getCurrentUserId,
};