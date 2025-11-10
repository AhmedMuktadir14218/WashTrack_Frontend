// D:\TusukaReact\WashRecieveDelivary_Frontend\src\utils\constants.js
// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7001/api';

// Process Stages
export const PROCESS_STAGES = {
  FIRST_DRY: { value: 1, label: '1st Dry' },
  SECOND_DRY: { value: 2, label: '2nd Dry' },
  FIRST_WASH: { value: 3, label: '1st Wash' },
  FINAL_WASH: { value: 4, label: 'Final Wash' }
};

// Transaction Types
export const TRANSACTION_TYPES = {
  RECEIVE: { value: 1, label: 'Receive' },
  DELIVERY: { value: 2, label: 'Delivery' }
};

// Roles
export const ROLES = {
  ADMIN: 'Admin',
  USER: 'User'
};

// Categories
export const CATEGORIES = [
  { id: 1, name: '1st Dry' },
  { id: 2, name: '2nd Dry' },
  { id: 3, name: '1st Wash' },
  { id: 4, name: 'Final Wash' }
];

// Date Format
export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATE_TIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

// Toast Messages
export const TOAST_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  LOGIN_FAILED: 'Login failed',
  REGISTER_SUCCESS: 'Registration successful!',
  REGISTER_FAILED: 'Registration failed',
  LOGOUT_SUCCESS: 'Logged out successfully',
  UNAUTHORIZED: 'You are not authorized to access this resource',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user'
};