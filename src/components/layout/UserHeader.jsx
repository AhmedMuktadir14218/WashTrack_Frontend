import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Tooltip,
  Button,
  IconButton,
  Drawer,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  HistoryOutlined,
  LocalLaundryService,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';

const UserHeader = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    setDrawerOpen(false);
    logout();
    navigate('/login');
  };

  const handleWorkHistory = () => {
    handleMenuClose();
    setDrawerOpen(false);
    navigate('/user/work-history');
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

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 4 }, minHeight: { xs: 56, sm: 64 } }}>
          {/* Logo & Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <LocalLaundryService sx={{ fontSize: { xs: 32, sm: 40 }, color: 'primary.main' }} />
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold', fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                Wash Transaction
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                User Portal
              </Typography>
            </Box>
          </Box>

          {/* User Menu - Desktop */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {user?.fullName}
            </Typography>

            <Tooltip title="Account settings">
              <Button
                onClick={handleMenuOpen}
                size="small"
                sx={{ p: 0 }}
              >
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'primary.main',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                  }}
                >
                  {getInitials(user?.fullName)}
                </Avatar>
              </Button>
            </Tooltip>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {user?.fullName}
                </Typography>
              </MenuItem>
              <Typography variant="caption" sx={{ px: 2, color: 'text.secondary' }}>
                {user?.email}
              </Typography>

              <Divider sx={{ my: 1 }} />

              <MenuItem onClick={handleWorkHistory}>
                <ListItemIcon>
                  <HistoryOutlined fontSize="small" />
                </ListItemIcon>
                Work History
              </MenuItem>

              <Divider sx={{ my: 1 }} />

              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <Logout fontSize="small" color="error" />
                </ListItemIcon>
                <Typography color="error">Logout</Typography>
              </MenuItem>
            </Menu>
          </Box>

          {/* Mobile Menu Button */}
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { xs: 'flex', sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Menu
            </Typography>
            <IconButton onClick={() => setDrawerOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {user?.fullName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {user?.email}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <MenuItem
            onClick={handleWorkHistory}
            sx={{ mb: 1, borderRadius: 1 }}
          >
            <ListItemIcon>
              <HistoryOutlined fontSize="small" />
            </ListItemIcon>
            <Typography>Work History</Typography>
          </MenuItem>

          <Divider sx={{ my: 2 }} />

          <MenuItem
            onClick={handleLogout}
            sx={{ borderRadius: 1, color: 'error.main' }}
          >
            <ListItemIcon sx={{ color: 'error.main' }}>
              <Logout fontSize="small" />
            </ListItemIcon>
            <Typography>Logout</Typography>
          </MenuItem>
        </Box>
      </Drawer>
    </>
  );
};

export default UserHeader;