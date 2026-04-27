import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, IconButton, AppBar, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Sidebar from './Sidebar';

const DRAWER_WIDTH = 280;

const Layout = ({ isDarkMode, toggleTheme }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);
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
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${isCollapsed ? 80 : DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: isDarkMode ? '#0f172a' : '#f5f5f5',
          transition: 'width 0.3s ease, background-color 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isMobile && (
          <AppBar
            position="sticky"
            sx={{
              backgroundColor: isDarkMode ? '#1e293b' : 'white',
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
                WRD System
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

export default Layout;
