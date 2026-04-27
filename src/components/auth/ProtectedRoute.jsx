import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, isLoading, hasRole } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required - support both single role and array of roles
  const hasRequiredRole = Array.isArray(requiredRole) 
    ? requiredRole.some(role => hasRole(role))
    : hasRole(requiredRole);

  if (requiredRole && !hasRequiredRole) {
    // Redirect to appropriate dashboard based on role
    if (hasRole('Admin') || hasRole('Incharge')) {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (hasRole('User')) {
      return <Navigate to="/user/transactions" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;