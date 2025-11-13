import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthProvider';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Admin Components
import Layout from './components/layout/Layout';
import Dashboard from './components/dashboard/Dashboard';
import WorkOrderList from './components/workorders/WorkOrderList';
import WorkOrderForm from './components/workorders/WorkOrderForm';
import WorkOrderDetail from './components/workorders/WorkOrderDetail';
import BulkUpload from './components/workorders/BulkUpload';
import TransactionList from './components/transactions/TransactionList';
import TransactionFilter from './components/transactions/TransactionFilter';
import WashStatus from './components/transactions/WashStatus';
import Reports from './components/reports/Reports';

// User Components
import UserLayout from './components/layout/UserLayout';
import UserTransactionPage from './components/user/UserTransactionPage';
import WorkHistory from './components/user/WorkHistory';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#f73378',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

// Wrapper component to get location
function AppRoutes() {
  const location = useLocation();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="Admin">
            <Layout key={location.pathname} />
          </ProtectedRoute>
        }
      >
        {/* <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard key="dashboard" />} />
        <Route path="work-orders" element={<WorkOrderList key="work-orders" />} />
        <Route path="work-orders/create" element={<WorkOrderForm key="work-orders-create" />} />
        <Route path="work-orders/edit/:id" element={<WorkOrderForm key="work-orders-edit" />} />
        <Route path="work-orders/:id" element={<WorkOrderDetail key="work-orders-detail" />} />
        <Route path="work-orders/bulk-upload" element={<BulkUpload key="work-orders-bulk" />} />
        <Route path="transactions" element={<TransactionList key="transactions" />} />
        <Route path="transactions/filter" element={<TransactionFilter key="transactions-filter" />} />
        <Route path="wash-status/:workOrderId" element={<WashStatus key="wash-status" />} />
        <Route path="reports" element={<Reports key="reports" />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} /> */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard key="dashboard" />} />
        <Route path="work-orders" element={<WorkOrderList key="work-orders" />} />
        <Route path="work-orders/create" element={<WorkOrderForm key="work-orders-create" />} />
        <Route path="work-orders/bulk-upload" element={<BulkUpload key="work-orders-bulk" />} />
        <Route path="work-orders/edit/:id" element={<WorkOrderForm key="work-orders-edit" />} />
        <Route path="work-orders/:id" element={<WorkOrderDetail key="work-orders-detail" />} />
        <Route path="transactions" element={<TransactionList key="transactions" />} />
        <Route path="transactions/filter" element={<TransactionFilter key="transactions-filter" />} />
        <Route path="wash-status/:workOrderId" element={<WashStatus key="wash-status" />} />
        <Route path="reports" element={<Reports key="reports" />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* User Routes */}
      <Route
        path="/user"
        element={
          <ProtectedRoute requiredRole="User">
            <UserLayout key={location.pathname} />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="transactions" replace />} />
        <Route path="transactions" element={<UserTransactionPage key="user-transactions" />} />
        <Route path="work-history" element={<WorkHistory key="user-work-history" />} />
        <Route path="*" element={<Navigate to="transactions" replace />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Global 404 fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />

          {/* Toast Notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                iconTheme: {
                  primary: '#4caf50',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#f44336',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;