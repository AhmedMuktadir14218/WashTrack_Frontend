import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Lock,
  ArrowRight,
  ErrorOutline
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import backgroundImage from '../../assets/Tusuka Washing Ltd 04.png';
import logo from '../../assets/logotusuka-removebg-preview.png';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated, isAdmin, isUser } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  // ✅ Load saved credentials on component mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('tusuka_login_credentials');
    if (savedCredentials) {
      try {
        const { username, password, rememberMe } = JSON.parse(savedCredentials);
        setFormData(prev => ({
          ...prev,
          username: username || '',
          password: password || '',
          rememberMe: rememberMe || false
        }));
      } catch (error) {
        console.error('Error loading saved credentials:', error);
      }
    }
  }, []);

  // ✅ Redirect after authentication
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin()) {
        navigate('/admin/dashboard');
      } else if (isUser()) {
        navigate('/user/transactions');
      }
    }
  }, [isAuthenticated, navigate, isAdmin, isUser]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    if (apiError) {
      setApiError('');
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    // ✅ Save credentials if "Remember Me" is checked
    if (formData.rememberMe) {
      localStorage.setItem('tusuka_login_credentials', JSON.stringify({
        username: formData.username,
        password: formData.password, // ✅ Now saving password too
        rememberMe: true
      }));
    } else {
      // ✅ Clear saved credentials if unchecked
      localStorage.removeItem('tusuka_login_credentials');
    }

    const result = await login(formData);
    
    if (result.success) {
      if (result.user?.roles?.includes('Admin')) {
        navigate('/admin/dashboard');
      } else if (result.user?.roles?.includes('User')) {
        navigate('/user/transactions');
      }
    } else {
      setApiError(result.message || 'Invalid username or password');
    }
  };

  // ✅ Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // ✅ Handle "Forgot Password" - clear saved credentials
  const handleForgotPassword = () => {
    localStorage.removeItem('tusuka_login_credentials');
    setFormData({
      username: '',
      password: '',
      rememberMe: false
    });
    setErrors({});
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-0"></div>

      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="bg-gray-300 bg-opacity-60 backdrop-blur-sm rounded-lg shadow-2xl p-8 md:p-10">
          
          {/* Logo Header */}
          <div className="text-center mb-8">
            <img 
              src={logo} 
              alt="Tusuka Logo" 
              className="h-16 md:h-20 w-auto max-w-xs mx-auto object-contain hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Error Alert */}
          {apiError && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-md flex items-start gap-3 animate-pulse">
              <ErrorOutline className="text-red-700 flex-shrink-0 mt-0.5" />
              <p className="text-red-900 text-sm font-medium">{apiError}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-gray-800 font-semibold text-sm mb-2">
                Username
              </label>
              <div className="relative">
                <Person className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 pointer-events-none" style={{ fontSize: '20px' }} />
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="username"
                  placeholder="Enter your username"
                  className={`w-full pl-10 pr-4 py-3 bg-gray-100 border-2 rounded-md transition-all duration-200 text-gray-900 placeholder-gray-600 font-medium ${
                    errors.username 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-300 focus:bg-white' 
                      : 'border-transparent focus:border-gray-800 focus:ring-2 focus:ring-gray-300 focus:bg-white'
                  } disabled:bg-gray-200 disabled:cursor-not-allowed`}
                  autoFocus
                />
              </div>
              {errors.username && (
                <p className="text-red-600 text-xs font-medium mt-1.5">{errors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-gray-800 font-semibold text-sm mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 pointer-events-none" style={{ fontSize: '20px' }} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-12 py-3 bg-gray-100 border-2 rounded-md transition-all duration-200 text-gray-900 placeholder-gray-600 font-medium ${
                    errors.password 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-300 focus:bg-white' 
                      : 'border-transparent focus:border-gray-800 focus:ring-2 focus:ring-gray-300 focus:bg-white'
                  } disabled:bg-gray-200 disabled:cursor-not-allowed`}
                />
                {/* <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-800 hover:text-gray-900 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </button> */}
              </div>
              {errors.password && (
                <p className="text-red-600 text-xs font-medium mt-1">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-4 h-4 text-gray-800 border-2 border-gray-400 rounded focus:ring-2 focus:ring-gray-800 disabled:cursor-not-allowed accent-gray-800 transition-colors"
                />
                <span className="text-gray-800 text-sm font-medium group-hover:text-gray-900 transition-colors">
                  Remember me
                </span>
              </label>
              <p
                onClick={handleForgotPassword}
                className="text-gray-800 text-sm font-medium hover:text-gray-900 underline transition-colors"
              >
                Forgot password?
              </p>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-md shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-6"
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} color="inherit" />
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight style={{ fontSize: '20px' }} />
                </>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center mt-6">
            <p className="text-gray-800 text-sm font-medium">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-gray-900 hover:text-gray-950 font-bold hover:underline transition-colors"
              >
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;