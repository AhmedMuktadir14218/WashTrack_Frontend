import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, IconButton, AppBar, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import UserSidebar from './UserSidebar';

const DRAWER_WIDTH = 280;

const UserLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <UserSidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${isCollapsed ? 80 : DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          transition: 'width 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isMobile && (
          <AppBar
            position="sticky"
            sx={{
              backgroundColor: 'white',
              color: 'text.primary',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              zIndex: theme.zIndex.drawer + 1,
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                WRD System - User Portal
              </Typography>
            </Toolbar>
          </AppBar>
        )}

        <Box sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1 }} key={location.pathname}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default UserLayout;
