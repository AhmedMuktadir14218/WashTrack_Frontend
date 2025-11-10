// D:\TusukaReact\WashRecieveDelivary_Frontend\src\hooks\useAuth.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};