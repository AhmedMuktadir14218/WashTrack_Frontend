// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\auth\Register.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CircularProgress } from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Mail,
  Lock,
  Info,
  ArrowRight
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import backgroundImage from '../../assets/Tusuka Washing Ltd 04.png';
import logo from '../../assets/logotusuka-removebg-preview.png';

const ROLES = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'User' }
];

// ✅ CHANGED: Process Stages instead of Categories
const PROCESS_STAGES = [
  { id: 1, name: '1st Dry' },
  { id: 2, name: 'Unwash' },
  { id: 3, name: '2nd Dry' },
  { id: 4, name: '1st Wash' },
  { id: 5, name: 'Final Wash' }
];

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleIds: [],
    stageIds: [] // ✅ Changed from categoryIds
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleRoleToggle = (roleId) => {
    setFormData(prev => {
      const newRoleIds = prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId];
      
      // Clear process stages if Admin is selected
      return {
        ...prev,
        roleIds: newRoleIds,
        stageIds: newRoleIds.includes(1) ? [] : prev.stageIds
      };
    });
  };

  // const handleStageToggle = (stageId) => {
  //   setFormData(prev => ({
  //     ...prev,
  //     stageIds: prev.stageIds.includes(stageId)
  //       ? prev.stageIds.filter(id => id !== stageId)
  //       : [...prev.stageIds, stageId]
  //   }));
  // };
const handleStageToggle = (stageId) => {
  setFormData(prev => ({
    ...prev,
    stageIds: [stageId] // replace with only the clicked stage
  }));
};

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (formData.roleIds.length === 0) {
      newErrors.roleIds = 'Please select at least one role';
    }

    // ✅ Check process stages for User role
    if (formData.roleIds.includes(2) && !formData.roleIds.includes(1)) {
      if (formData.stageIds.length === 0) {
        newErrors.stageIds = 'Please select at least one process stage for User role';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const { confirmPassword, ...dataToSubmit } = formData;

    const result = await register(dataToSubmit);

    if (result.success) {
      navigate('/login');
    }
  };

  const isAdmin = formData.roleIds.includes(1);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden py-8"
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

      {/* Register Card Container */}
      <div className="relative z-10 w-full max-w-lg">
        <div className="bg-gray-300 bg-opacity-60 backdrop-blur-sm rounded-lg shadow-2xl p-8 md:p-10">
          
          {/* Logo Header */}
          <div className="text-center mb-6">
            <img 
              src={logo} 
              alt="Tusuka Logo" 
              className="h-14 md:h-16 w-auto max-w-xs mx-auto object-contain hover:scale-105 transition-transform duration-300 mb-2"
            />
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Create Account</h1>
            <p className="text-gray-700 text-sm mt-1">Register for the system</p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-2">
                Full Name
              </label>
              <div className="relative">
                <Person className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 pointer-events-none" style={{ fontSize: '18px' }} />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={isLoading}
                  autoFocus
                  placeholder="Enter your full name"
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-100 border-2 rounded-md transition-all duration-200 text-gray-900 placeholder-gray-600 font-medium ${
                    errors.fullName 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-300 focus:bg-white' 
                      : 'border-transparent focus:border-gray-800 focus:ring-2 focus:ring-gray-300 focus:bg-white'
                  } disabled:bg-gray-200 disabled:cursor-not-allowed`}
                />
              </div>
              {errors.fullName && (
                <p className="text-red-600 text-xs font-medium mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Username */}
            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-2">
                Username
              </label>
              <div className="relative">
                <Person className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 pointer-events-none" style={{ fontSize: '18px' }} />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Choose a username"
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-100 border-2 rounded-md transition-all duration-200 text-gray-900 placeholder-gray-600 font-medium ${
                    errors.username 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-300 focus:bg-white' 
                      : 'border-transparent focus:border-gray-800 focus:ring-2 focus:ring-gray-300 focus:bg-white'
                  } disabled:bg-gray-200 disabled:cursor-not-allowed`}
                />
              </div>
              {errors.username && (
                <p className="text-red-600 text-xs font-medium mt-1">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 pointer-events-none" style={{ fontSize: '18px' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter your email"
                  className={`w-full pl-10 pr-4 py-2.5 bg-gray-100 border-2 rounded-md transition-all duration-200 text-gray-900 placeholder-gray-600 font-medium ${
                    errors.email 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-300 focus:bg-white' 
                      : 'border-transparent focus:border-gray-800 focus:ring-2 focus:ring-gray-300 focus:bg-white'
                  } disabled:bg-gray-200 disabled:cursor-not-allowed`}
                />
              </div>
              {errors.email && (
                <p className="text-red-600 text-xs font-medium mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 pointer-events-none" style={{ fontSize: '18px' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Create password (min 6 characters)"
                  className={`w-full pl-10 pr-12 py-2.5 bg-gray-100 border-2 rounded-md transition-all duration-200 text-gray-900 placeholder-gray-600 font-medium ${
                    errors.password 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-300 focus:bg-white' 
                      : 'border-transparent focus:border-gray-800 focus:ring-2 focus:ring-gray-300 focus:bg-white'
                  } disabled:bg-gray-200 disabled:cursor-not-allowed`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900 transition-colors disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <VisibilityOff style={{ fontSize: '18px' }} />
                  ) : (
                    <Visibility style={{ fontSize: '18px' }} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-600 text-xs font-medium mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-800 pointer-events-none" style={{ fontSize: '18px' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Confirm password"
                  className={`w-full pl-10 pr-12 py-2.5 bg-gray-100 border-2 rounded-md transition-all duration-200 text-gray-900 placeholder-gray-600 font-medium ${
                    errors.confirmPassword 
                      ? 'border-red-500 focus:ring-2 focus:ring-red-300 focus:bg-white' 
                      : 'border-transparent focus:border-gray-800 focus:ring-2 focus:ring-gray-300 focus:bg-white'
                  } disabled:bg-gray-200 disabled:cursor-not-allowed`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900 transition-colors disabled:cursor-not-allowed"
                >
                  {showConfirmPassword ? (
                    <VisibilityOff style={{ fontSize: '18px' }} />
                  ) : (
                    <Visibility style={{ fontSize: '18px' }} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-xs font-medium mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Roles */}
            <div>
              <label className="block text-gray-800 font-semibold text-sm mb-3">
                Select Role
              </label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleToggle(role.id)}
                    disabled={isLoading}
                    className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 ${
                      formData.roleIds.includes(role.id)
                        ? 'bg-gray-800 text-white shadow-md transform scale-105'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {role.name}
                  </button>
                ))}
              </div>
              {errors.roleIds && (
                <p className="text-red-600 text-xs font-medium mt-1">{errors.roleIds}</p>
              )}
            </div>

            {/* ✅ Process Stages (only for User role) */}
            {formData.roleIds.includes(2) && !isAdmin && (
              <div>
                <label className="block text-gray-800 font-semibold text-sm mb-3">
                  Select Process Stages (User Access)
                </label>
                <div className="flex flex-wrap gap-2">
                  {PROCESS_STAGES.map((stage) => (
                    <button
                      key={stage.id}
                      type="button"
                      onClick={() => handleStageToggle(stage.id)}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 ${
                        formData.stageIds.includes(stage.id)
                          ? 'bg-green-700 text-white shadow-md transform scale-105'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {stage.name}
                    </button>
                  ))}
                </div>
                {errors.stageIds && (
                  <p className="text-red-600 text-xs font-medium mt-1">{errors.stageIds}</p>
                )}
              </div>
            )}

            {/* Admin Info */}
            {isAdmin && (
              <div className="p-3 bg-blue-100 border border-blue-400 rounded-md flex items-start gap-2">
                <Info className="text-blue-700 flex-shrink-0 mt-0.5" style={{ fontSize: '18px' }} />
                <p className="text-sm text-blue-900 font-medium">
                  Admin users have access to all process stages automatically.
                </p>
              </div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-md shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <CircularProgress size={20} color="inherit" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Register</span>
                  <ArrowRight style={{ fontSize: '20px' }} />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-800 text-sm font-medium">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-gray-900 hover:text-gray-950 font-bold hover:underline transition-colors"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;