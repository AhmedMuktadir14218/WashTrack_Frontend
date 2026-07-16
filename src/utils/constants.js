// D:\TusukaReact\WashRecieveDelivary_Frontend\src\utils\constants.js
// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7001/api';

// Process Stages
export const PROCESS_STAGES = {
  FIRST_DRY: { value: 1, label: '1st Dry' },
  SECOND_DRY: { value: 2, label: '2nd Dry' },
  FIRST_WASH: { value: 3, label: '1st Wash' },
  FINAL_WASH: { value: 4, label: 'Final Wash' }, 
  FIRST_DRYER: { value: 5, label: '1st Dryer' },
  SECOND_DRYER: { value: 6, label: '2nd Dryer' },
  FINAL_DRYER: { value: 7, label: 'Final Dryer' },
  COOL_DRYER: { value: 8, label: 'Cool Dryer' },
  RE_DRYER: { value: 9, label: 'ReDryer' },
  LASER: { value: 10, label: 'Laser' },
  ACID_WASH: { value: 11, label: 'Acid Wash' },
  OZON: { value: 12, label: 'Ozon' },
  ACID_NEUTRAL: { value: 14, label: 'Acid Neutral' },
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
  { id: 4, name: 'Final Wash' },
  { id: 5, name: '1st Dryer' },
  { id: 6, name: '2nd Dryer' },
  { id: 7, name: 'Final Dryer' },
  { id: 8, name: 'Cool Dryer' },
  { id: 9, name: 'ReDryer' },
  { id: 10, name: 'Laser' },
  { id: 11, name: 'Acid Wash' },
  { id: 12, name: 'Ozon' },
  { id: 14, name: 'Acid Neutral' },
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