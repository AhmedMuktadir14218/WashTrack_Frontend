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
  Avatar,
  IconButton,
  Tooltip,
  Badge,
  Menu,
  MenuItem
} from '@mui/material';
import {
  SwapHoriz,
  Assessment,
  LocalLaundryService,
  ChevronLeft,
  ChevronRight,
  Logout,
  AccountCircle,
  Settings,
  History,
  Assignment,
  Person,
  AdminPanelSettings
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 80;

const menuItems = [
  { text: 'Transactions', icon: <SwapHoriz />, path: '/user/transactions', roles: ['User'] },
  { text: 'Work History', icon: <History />, path: '/user/work-history', roles: ['User'] },
  { text: 'Work Order Summary', icon: <Assignment />, path: '/user/work-order-summary', roles: ['User'] },
];

const UserSidebar = ({ drawerWidth, mobileOpen, handleDrawerToggle, isCollapsed, toggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout } = useAuth();

  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      handleDrawerToggle();
    }
  };

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const drawerContent = (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        bgcolor: 'background.default',
        transition: 'all 0.3s ease'
      }}
    >
      <Box
        sx={{
          p: isCollapsed ? 1.5 : 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          bgcolor: 'primary.main',
          color: 'white',
          minHeight: 80,
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: isCollapsed ? 0 : 2,
            justifyContent: 'center'
          }}
        >
          <LocalLaundryService 
            sx={{ 
              fontSize: isCollapsed ? 36 : 40,
              color: 'white'
            }} 
          />
          {!isCollapsed && (
            <Box sx={{ ml: 1 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                WRD System
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.9 }}>
                User Portal
              </Typography>
            </Box>
          )}
        </Box>
        
        {!isMobile && (
          <IconButton 
            onClick={toggleCollapse}
            sx={{ 
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.2)',
              },
              transition: 'all 0.2s ease'
            }}
          >
            {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
          </IconButton>
        )}
      </Box>

      <Divider />

      <Box
        sx={{
          p: isCollapsed ? 1.5 : 2,
          bgcolor: 'grey.50',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: isCollapsed ? 'column' : 'row',
            alignItems: 'center',
            gap: isCollapsed ? 1 : 2,
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            cursor: 'pointer',
          }}
          onClick={isCollapsed ? handleUserMenuOpen : undefined}
        >
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant="dot"
            sx={{
              '& .MuiBadge-badge': {
                bgcolor: 'success.main',
                color: 'white',
                border: '2px solid white',
              }
            }}
          >
            <Avatar
              sx={{
                width: isCollapsed ? 48 : 40,
                height: isCollapsed ? 48 : 40,
                bgcolor: 'primary.main',
                fontSize: isCollapsed ? '1rem' : '0.875rem',
                border: '2px solid',
                borderColor: 'primary.light',
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: '0 0 0 3px rgba(25, 118, 210, 0.3)',
                },
              }}
              onClick={handleUserMenuOpen}
            >
              {getInitials(user?.fullName)}
            </Avatar>
          </Badge>

          {!isCollapsed && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Tooltip title={user?.fullName} arrow>
                <Typography 
                  variant="subtitle2" 
                  fontWeight={600}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.fullName || 'User'}
                </Typography>
              </Tooltip>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user?.email || 'user@example.com'}
              </Typography>
              <Box
                sx={{
                  mt: 0.5,
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}
              >
                <Person sx={{ fontSize: 12, mr: 0.5 }} />
                USER
              </Box>
            </Box>
          )}

          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            onClick={handleUserMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                minWidth: 220,
                mt: 1,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                borderRadius: 2,
              }
            }}
          >
            <Box sx={{ px: 2, py: 1.5, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {user?.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
              <Box
                sx={{
                  mt: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  px: 1.5,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: 'primary.light',
                  color: 'primary.contrastText',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                }}
              >
                USER
              </Box>
            </Box>

            <Divider />

            <MenuItem onClick={() => navigate('/user/transactions')}>
              <ListItemIcon>
                <SwapHoriz fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Transactions" />
            </MenuItem>

            <MenuItem>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </MenuItem>

            <MenuItem>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </MenuItem>

            <Divider />

            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" color="error" />
              </ListItemIcon>
              <Typography color="error">Logout</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1, px: isCollapsed ? 1 : 2, py: 2 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <Tooltip 
              key={item.text} 
              title={item.text}
              placement="right"
              disableHoverListener={!isCollapsed}
              arrow
            >
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    bgcolor: isActive ? 'primary.light' : 'transparent',
                    color: isActive ? 'primary.contrastText' : 'text.primary',
                    py: isCollapsed ? 1 : 1.5,
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    px: isCollapsed ? 1 : 2,
                    borderLeft: isActive ? 4 : 0,
                    borderColor: 'primary.main',
                    '&:hover': {
                      bgcolor: isActive ? 'primary.main' : 'action.hover',
                      color: isActive ? 'white' : 'text.primary',
                    },
                  }}
                >
                  <ListItemIcon 
                    sx={{ 
                      color: isActive ? 'inherit' : 'primary.main',
                      minWidth: isCollapsed ? 'auto' : 40,
                      justifyContent: 'center'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {!isCollapsed && (
                    <ListItemText
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: isActive ? 600 : 400,
                        fontSize: '0.9rem',
                      }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      <Box 
        sx={{ 
          p: isCollapsed ? 1 : 2, 
          bgcolor: 'grey.100',
          textAlign: isCollapsed ? 'center' : 'left'
        }}
      >
        {!isCollapsed ? (
          <>
            <Typography variant="caption" color="text.secondary" display="block">
              © 2025 WRD System
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Version 1.3.0
            </Typography>
          </>
        ) : (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ transform: 'rotate(-90deg)', mt: 2 }}>
            v1.3.0
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ 
        width: { sm: isCollapsed ? DRAWER_WIDTH_COLLAPSED : drawerWidth }, 
        flexShrink: { sm: 0 },
        transition: 'width 0.3s ease',
      }}
    >
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

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: isCollapsed ? DRAWER_WIDTH_COLLAPSED : drawerWidth,
            borderRight: '1px solid',
            borderColor: 'divider',
            transition: 'width 0.3s ease',
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default UserSidebar;
