import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

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
      const data = response.data;

      if (data.success) {
        // Save to state
        setUser(data.user);
        setToken(data.token);
        setIsAuthenticated(true);

        // Save to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        toast.success(data.message || 'Login successful!');
        return { success: true, data, user: data.user };
      } else {
        toast.error(data.message || 'Login failed');
        return { success: false, message: data.message };
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
      const data = response.data;

      if (data.success) {
        toast.success(data.message || 'Registration successful!');
        return { success: true, data };
      } else {
        toast.error(data.message || 'Registration failed');
        return { success: false, message: data.message };
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

  // Check if user is regular user
  const isUser = () => {
    return hasRole('User');
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
    isUser,
    getCategories,
    getCategoryNames,
    hasCategory,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};