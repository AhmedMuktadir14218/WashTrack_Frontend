import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  useTheme,
  useMediaQuery,
  Collapse
} from '@mui/material';
import {
  Dashboard,
  Assignment,
  SwapHoriz,
  Assessment,
  Settings,
  LocalLaundryService,
  ExpandLess,
  ExpandMore,
  TrendingUp,
  FilterAlt,
  AddCircle
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { People } from '@mui/icons-material';
// Update the menuItems array in Sidebar.jsx
const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard', roles: ['Admin', 'User'] },
  { text: 'Work Orders', icon: <Assignment />, path: '/admin/work-orders', roles: ['Admin', 'User'] },
  { text: 'Transactions', icon: <SwapHoriz />, path: '/admin/transactions', roles: ['Admin', 'User'] },
  { text: 'Reports', icon: <Assessment />, path: '/admin/reports', roles: ['Admin'] },
  { text: 'Manage Users', icon: <People />, path: '/admin/users', roles: ['Admin'] },   
];
const Sidebar = ({ drawerWidth, mobileOpen, handleDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { hasRole } = useAuth();

  const [expandedMenu, setExpandedMenu] = useState(null);

  const handleNavigation = (path) => {
    // console.log('Navigating to:', path);
    navigate(path);
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  const toggleSubmenu = (index) => {
    setExpandedMenu(expandedMenu === index ? null : index);
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <LocalLaundryService sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h6" fontWeight="bold">
            WRD System
          </Typography>
          <Typography variant="caption">
            Wash Receive Delivery
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, px: 2, py: 2 }}>
        {menuItems.map((item, index) => {
          const hasAccess = item.roles.some(role => hasRole(role));
          if (!hasAccess) return null;

          const isActive = location.pathname === item.path;
          const isSubmenuOpen = expandedMenu === index;

          // Menu item with submenu
          if (item.submenu) {
            return (
              <Box key={item.text}>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => toggleSubmenu(index)}
                    sx={{
                      borderRadius: 2,
                      bgcolor: isSubmenuOpen ? 'primary.light' : 'transparent',
                      color: isSubmenuOpen ? 'primary.contrastText' : 'text.primary',
                      '&:hover': {
                        bgcolor: isSubmenuOpen ? 'primary.main' : 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: isSubmenuOpen ? 'primary.contrastText' : 'inherit', minWidth: 40 }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isSubmenuOpen ? 600 : 400,
                      }}
                    />
                    {isSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>

                {/* Submenu Items */}
                <Collapse in={isSubmenuOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 4 }}>
                    {item.submenu.map(subitem => {
                      const isSubActive = location.pathname === subitem.path;
                      return (
                        <ListItem key={subitem.text} disablePadding sx={{ mb: 0.5 }}>
                          <ListItemButton
                            onClick={() => handleNavigation(subitem.path)}
                            sx={{
                              borderRadius: 2,
                              bgcolor: isSubActive ? 'primary.light' : 'transparent',
                              color: isSubActive ? 'primary.contrastText' : 'text.primary',
                              '&:hover': {
                                bgcolor: isSubActive ? 'primary.main' : 'action.hover',
                              },
                            }}
                          >
                            <ListItemIcon sx={{ color: isSubActive ? 'primary.contrastText' : 'inherit', minWidth: 40, fontSize: '0.85rem' }}>
                              {subitem.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={subitem.text}
                              primaryTypographyProps={{
                                fontWeight: isSubActive ? 600 : 400,
                                fontSize: '0.9rem',
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </Box>
            );
          }

          // Regular menu item
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? 'primary.light' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.main' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.contrastText' : 'inherit', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, bgcolor: 'grey.100' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          © 2025 WRD System
        </Typography>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Version 1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;