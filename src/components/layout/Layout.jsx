import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';

const DRAWER_WIDTH = 280;

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation(); // ✅ Add this

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
        }}
      >
        {/* Header */}
        <Header handleDrawerToggle={handleDrawerToggle} />

        {/* Page Content - Add key to force re-render */}
        <Box sx={{ p: 3 }} key={location.pathname}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;