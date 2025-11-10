// D:\TusukaReact\WashRecieveDelivary_Frontend\src\context\AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast'; 
// Create Context
export const AuthContext = createContext(null);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);

      if (response.success) {
        // Save to state
        setUser(response.user);
        setToken(response.token);
        setIsAuthenticated(true);

        // Save to localStorage
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        toast.success(response.message || 'Login successful!');
        return { success: true, data: response };
      } else {
        toast.error(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(userData);

      if (response.success) {
        toast.success(response.message || 'Registration successful!');
        return { success: true, data: response };
      } else {
        toast.error(response.message || 'Registration failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    authApi.logout();
    toast.success('Logged out successfully');
  };

  // Update user
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Check if user has specific role
  const hasRole = (roleName) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(roleName);
  };

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('Admin');
  };

  // Get user categories
  const getCategories = () => {
    if (!user || !user.categoryAccesses) return [];
    return user.categoryAccesses;
  };

  // Get category names only
  const getCategoryNames = () => {
    const categories = getCategories();
    return categories.map(cat => cat.categoryName);
  };

  // Check if user has access to specific category
  const hasCategory = (categoryName) => {
    if (isAdmin()) return true; // Admin has access to all
    const categories = getCategoryNames();
    return categories.includes(categoryName);
  };

  const value = {
    // State
    user,
    token,
    isAuthenticated,
    isLoading,

    // Actions
    login,
    register,
    logout,
    updateUser,

    // Utilities
    hasRole,
    isAdmin,
    getCategories,
    getCategoryNames,
    hasCategory,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};