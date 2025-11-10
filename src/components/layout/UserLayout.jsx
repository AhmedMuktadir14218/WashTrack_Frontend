import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import UserHeader from './UserHeader';

const UserLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      {/* Header */}
      <UserHeader />

      {/* Page Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          p: { xs: 2, sm: 3 },
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default UserLayout;