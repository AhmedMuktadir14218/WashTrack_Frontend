// import { useNavigate, useLocation } from 'react-router-dom';
// import {
//   Drawer,
//   Box,
//   List,
//   ListItem,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Divider,
//   Typography,
//   useTheme,
//   useMediaQuery,
//   Avatar,
//   IconButton,
//   Tooltip,
//   Badge,
//   Menu,
//   MenuItem
// } from '@mui/material';
// import {
//   Dashboard,
//   Assignment,
//   SwapHoriz,
//   Assessment,
//   Settings,
//   LocalLaundryService,
//   ChevronLeft,
//   ChevronRight,
//   Logout,
//   AccountCircle,
//   Analytics,
//   People,
//   AdminPanelSettings,
//   PowerSettingsNew
// } from '@mui/icons-material';
// import { useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';

// const DRAWER_WIDTH = 260;
// const DRAWER_WIDTH_COLLAPSED = 72;

// const menuItems = [
//   { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard', roles: ['Admin', 'User'] },
//   { text: 'Work Orders', icon: <Assignment />, path: '/admin/work-orders', roles: ['Admin', 'User'] },
//   { text: 'Transactions', icon: <SwapHoriz />, path: '/admin/transactions', roles: ['Admin', 'User'] },
//   { text: 'Reports', icon: <Assessment />, path: '/admin/reports', roles: ['Admin'] },
//   { text: 'Machine Track', icon: <Analytics />, path: '/admin/machine-track', roles: ['Admin'] },
//   { text: 'Manage Users', icon: <People />, path: '/admin/users', roles: ['Admin'] },
// ];

// const Sidebar = ({ drawerWidth, mobileOpen, handleDrawerToggle, isCollapsed, toggleCollapse }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
//   const { user, logout, isAdmin, hasRole } = useAuth();

//   const [userMenuAnchor, setUserMenuAnchor] = useState(null);

//   const handleNavigation = (path) => {
//     navigate(path);
//     if (isMobile) handleDrawerToggle();
//   };

//   const handleUserMenuOpen = (event) => {
//     setUserMenuAnchor(event.currentTarget);
//   };

//   const handleUserMenuClose = () => {
//     setUserMenuAnchor(null);
//   };

//   const handleLogout = () => {
//     handleUserMenuClose();
//     logout();
//   };

//   const getInitials = (name) => {
//     if (!name) return 'U';
//     return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
//   };

//   const drawerContent = (
//     <Box
//       sx={{
//         height: '100%',
//         display: 'flex',
//         flexDirection: 'column',
//         bgcolor: '#0f172a',
//         color: '#e2e8f0',
//         transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
//       }}
//     >
//       {/* ── Logo Section ── */}
//       <Box
//         sx={{
//           px: isCollapsed ? 1.5 : 3,
//           py: 2.5,
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: isCollapsed ? 'center' : 'space-between',
//           borderBottom: '1px solid rgba(148,163,184,0.1)',
//           minHeight: 68
//         }}
//       >
//         <Box sx={{ display: 'flex', alignItems: 'center', gap: isCollapsed ? 0 : 1.5 }}>
//           <Box
//             sx={{
//               width: 38,
//               height: 38,
//               borderRadius: 2,
//               background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center',
//               flexShrink: 0
//             }}
//           >
//             <LocalLaundryService sx={{ fontSize: 22, color: 'white' }} />
//           </Box>
//           {!isCollapsed && (
//             <Box>
//               <Typography
//                 variant="subtitle1"
//                 fontWeight={700}
//                 sx={{ color: '#f1f5f9', fontSize: '1rem', lineHeight: 1.2, letterSpacing: '0.02em' }}
//               >
//                 WRD System
//               </Typography>
//               <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.65rem', letterSpacing: '0.05em' }}>
//                 WASH · RECEIVE · DELIVER
//               </Typography>
//             </Box>
//           )}
//         </Box>

//         {!isMobile && (
//           <IconButton
//             onClick={toggleCollapse}
//             size="small"
//             sx={{
//               color: '#64748b',
//               bgcolor: 'rgba(148,163,184,0.08)',
//               '&:hover': { color: '#e2e8f0', bgcolor: 'rgba(148,163,184,0.15)' },
//               transition: 'all 0.2s ease',
//               width: 28,
//               height: 28
//             }}
//           >
//             {isCollapsed ? <ChevronRight sx={{ fontSize: 18 }} /> : <ChevronLeft sx={{ fontSize: 18 }} />}
//           </IconButton>
//         )}
//       </Box>

//       {/* ── Navigation Label ── */}
//       {!isCollapsed && (
//         <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>
//           <Typography
//             variant="caption"
//             sx={{
//               color: '#475569',
//               fontSize: '0.65rem',
//               fontWeight: 600,
//               letterSpacing: '0.1em',
//               textTransform: 'uppercase'
//             }}
//           >
//             Navigation
//           </Typography>
//         </Box>
//       )}

//       {/* ── Menu Items ── */}
//       <List sx={{ flexGrow: 1, px: 1.5, py: 0.5, overflowY: 'auto' }}>
//         {menuItems.map((item) => {
//           const hasAccess = item.roles.some(role => hasRole(role));
//           if (!hasAccess) return null;

//           const isActive = location.pathname === item.path;

//           return (
//             <Tooltip
//               key={item.text}
//               title={item.text}
//               placement="right"
//               disableHoverListener={!isCollapsed}
//               arrow
//               componentsProps={{
//                 tooltip: {
//                   sx: {
//                     bgcolor: '#1e293b',
//                     color: '#e2e8f0',
//                     fontSize: '0.75rem',
//                     fontWeight: 500,
//                     px: 1.5,
//                     py: 0.75,
//                     borderRadius: 1,
//                     boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
//                   }
//                 }
//               }}
//             >
//               <ListItem disablePadding sx={{ mb: 0.25 }}>
//                 <ListItemButton
//                   onClick={() => handleNavigation(item.path)}
//                   sx={{
//                     borderRadius: 1.5,
//                     minHeight: 44,
//                     justifyContent: isCollapsed ? 'center' : 'flex-start',
//                     px: isCollapsed ? 0 : 2,
//                     position: 'relative',
//                     bgcolor: isActive ? 'rgba(59,130,246,0.15)' : 'transparent',
//                     color: isActive ? '#60a5fa' : '#94a3b8',
//                     '&:hover': {
//                       bgcolor: isActive ? 'rgba(59,130,246,0.2)' : 'rgba(148,163,184,0.08)',
//                       color: isActive ? '#93bbfd' : '#cbd5e1'
//                     },
//                     transition: 'all 0.15s ease'
//                   }}
//                 >
//                   {/* Active Indicator */}
//                   {isActive && (
//                     <Box
//                       sx={{
//                         position: 'absolute',
//                         left: 0,
//                         top: '50%',
//                         transform: 'translateY(-50%)',
//                         width: 3,
//                         height: 24,
//                         borderRadius: '0 4px 4px 0',
//                         bgcolor: '#3b82f6'
//                       }}
//                     />
//                   )}

//                   <ListItemIcon
//                     sx={{
//                       color: 'inherit',
//                       minWidth: isCollapsed ? 'auto' : 36,
//                       justifyContent: 'center',
//                       '& .MuiSvgIcon-root': { fontSize: 20 }
//                     }}
//                   >
//                     {item.icon}
//                   </ListItemIcon>

//                   {!isCollapsed && (
//                     <ListItemText
//                       primary={item.text}
//                       primaryTypographyProps={{
//                         fontWeight: isActive ? 600 : 400,
//                         fontSize: '0.85rem',
//                         letterSpacing: '0.01em'
//                       }}
//                     />
//                   )}
//                 </ListItemButton>
//               </ListItem>
//             </Tooltip>
//           );
//         })}
//       </List>

//       {/* ── Footer: User Profile ── */}
//       <Box
//         sx={{
//           borderTop: '1px solid rgba(148,163,184,0.1)',
//           bgcolor: 'rgba(15,23,42,0.6)',
//           p: isCollapsed ? 1 : 1.5,
//         }}
//       >
//         {!isCollapsed ? (
//           <Box
//             sx={{
//               display: 'flex',
//               alignItems: 'center',
//               gap: 1.5,
//               p: 1,
//               borderRadius: 1.5,
//               cursor: 'pointer',
//               transition: 'all 0.15s ease',
//               '&:hover': { bgcolor: 'rgba(148,163,184,0.08)' }
//             }}
//             onClick={handleUserMenuOpen}
//           >
//             <Badge
//               overlap="circular"
//               anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//               variant="dot"
//               sx={{
//                 '& .MuiBadge-badge': {
//                   bgcolor: isAdmin() ? '#f43f5e' : '#22c55e',
//                   border: '2px solid #0f172a',
//                   width: 10,
//                   height: 10,
//                   borderRadius: '50%'
//                 }
//               }}
//             >
//               <Avatar
//                 sx={{
//                   width: 36,
//                   height: 36,
//                   bgcolor: '#1e3a5f',
//                   color: '#60a5fa',
//                   fontSize: '0.8rem',
//                   fontWeight: 700,
//                   border: '1px solid rgba(59,130,246,0.3)'
//                 }}
//               >
//                 {getInitials(user?.fullName)}
//               </Avatar>
//             </Badge>

//             <Box sx={{ flex: 1, minWidth: 0 }}>
//               <Typography
//                 variant="body2"
//                 fontWeight={600}
//                 sx={{
//                   color: '#e2e8f0',
//                   fontSize: '0.8rem',
//                   overflow: 'hidden',
//                   textOverflow: 'ellipsis',
//                   whiteSpace: 'nowrap',
//                   lineHeight: 1.3
//                 }}
//               >
//                 {user?.fullName || 'User'}
//               </Typography>
//               <Typography
//                 variant="caption"
//                 sx={{
//                   color: '#64748b',
//                   fontSize: '0.65rem',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: 0.5
//                 }}
//               >
//                 <AdminPanelSettings sx={{ fontSize: 10 }} />
//                 {isAdmin() ? 'Administrator' : 'Operator'}
//               </Typography>
//             </Box>

//             <IconButton size="small" sx={{ color: '#64748b', '&:hover': { color: '#e2e8f0' } }}>
//               <Settings sx={{ fontSize: 16 }} />
//             </IconButton>
//           </Box>
//         ) : (
//           <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
//             <Tooltip title={user?.fullName || 'User'} placement="right" arrow>
//               <Avatar
//                 onClick={handleUserMenuOpen}
//                 sx={{
//                   width: 36,
//                   height: 36,
//                   bgcolor: '#1e3a5f',
//                   color: '#60a5fa',
//                   fontSize: '0.8rem',
//                   fontWeight: 700,
//                   cursor: 'pointer',
//                   border: '1px solid rgba(59,130,246,0.3)',
//                   '&:hover': { boxShadow: '0 0 0 2px rgba(59,130,246,0.3)' }
//                 }}
//               >
//                 {getInitials(user?.fullName)}
//               </Avatar>
//             </Tooltip>
//             <Tooltip title="Logout" placement="right" arrow>
//               <IconButton
//                 size="small"
//                 onClick={handleLogout}
//                 sx={{ color: '#64748b', '&:hover': { color: '#f43f5e' } }}
//               >
//                 <PowerSettingsNew sx={{ fontSize: 16 }} />
//               </IconButton>
//             </Tooltip>
//           </Box>
//         )}
//       </Box>

//       {/* ── User Dropdown Menu ── */}
//       <Menu
//         anchorEl={userMenuAnchor}
//         open={Boolean(userMenuAnchor)}
//         onClose={handleUserMenuClose}
//         transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
//         anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
//         PaperProps={{
//           sx: {
//             minWidth: 200,
//             mt: -1,
//             bgcolor: '#1e293b',
//             color: '#e2e8f0',
//             border: '1px solid rgba(148,163,184,0.1)',
//             borderRadius: 2,
//             boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
//             '& .MuiMenuItem-root': {
//               py: 1,
//               px: 2,
//               borderRadius: 1,
//               mx: 0.5,
//               fontSize: '0.85rem',
//               color: '#cbd5e1',
//               '&:hover': { bgcolor: 'rgba(148,163,184,0.1)' }
//             },
//             '& .MuiListItemIcon-root': { color: '#94a3b8', minWidth: 32 }
//           }
//         }}
//       >
//         <Box sx={{ px: 2, py: 1.5 }}>
//           <Typography variant="body2" fontWeight={600} sx={{ color: '#f1f5f9' }}>
//             {user?.fullName}
//           </Typography>
//           <Typography variant="caption" sx={{ color: '#64748b' }}>
//             {user?.email}
//           </Typography>
//         </Box>

//         <Divider sx={{ borderColor: 'rgba(148,163,184,0.1)', mx: 1 }} />

//         <MenuItem onClick={() => { navigate('/admin/dashboard'); handleUserMenuClose(); }}>
//           <ListItemIcon><Dashboard sx={{ fontSize: 18 }} /></ListItemIcon>
//           Dashboard
//         </MenuItem>
//         <MenuItem onClick={handleUserMenuClose}>
//           <ListItemIcon><AccountCircle sx={{ fontSize: 18 }} /></ListItemIcon>
//           Profile
//         </MenuItem>
//         <MenuItem onClick={handleUserMenuClose}>
//           <ListItemIcon><Settings sx={{ fontSize: 18 }} /></ListItemIcon>
//           Settings
//         </MenuItem>

//         <Divider sx={{ borderColor: 'rgba(148,163,184,0.1)', mx: 1 }} />

//         <MenuItem onClick={handleLogout} sx={{ color: '#f43f5e !important', '&:hover': { bgcolor: 'rgba(244,63,94,0.1) !important' } }}>
//           <ListItemIcon><Logout sx={{ fontSize: 18, color: '#f43f5e' }} /></ListItemIcon>
//           <Typography sx={{ color: '#f43f5e', fontWeight: 500 }}>Logout</Typography>
//         </MenuItem>
//       </Menu>
//     </Box>
//   );

//   return (
//     <Box
//       component="nav"
//       sx={{
//         width: { sm: isCollapsed ? DRAWER_WIDTH_COLLAPSED : drawerWidth },
//         flexShrink: { sm: 0 },
//         transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
//       }}
//     >
//       {/* Mobile Drawer */}
//       <Drawer
//         variant="temporary"
//         open={mobileOpen}
//         onClose={handleDrawerToggle}
//         ModalProps={{ keepMounted: true }}
//         sx={{
//           display: { xs: 'block', sm: 'none' },
//           '& .MuiDrawer-paper': {
//             boxSizing: 'border-box',
//             width: drawerWidth,
//             bgcolor: '#0f172a',
//             borderRight: 'none'
//           }
//         }}
//       >
//         {drawerContent}
//       </Drawer>

//       {/* Desktop Drawer */}
//       <Drawer
//         variant="permanent"
//         sx={{
//           display: { xs: 'none', sm: 'block' },
//           '& .MuiDrawer-paper': {
//             boxSizing: 'border-box',
//             width: isCollapsed ? DRAWER_WIDTH_COLLAPSED : drawerWidth,
//             bgcolor: '#0f172a',
//             borderRight: '1px solid rgba(148,163,184,0.08)',
//             transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
//             boxShadow: '2px 0 8px rgba(0,0,0,0.15)'
//           }
//         }}
//         open
//       >
//         {drawerContent}
//       </Drawer>
//     </Box>
//   );
// };

// export default Sidebar;

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
  Dashboard,
  Assignment,
  SwapHoriz,
  Assessment,
  Settings,
  LocalLaundryService,
  ChevronLeft,
  ChevronRight,
  Logout,
  AccountCircle,
  Analytics,
  People,
  AdminPanelSettings,
  PowerSettingsNew,
  LightMode,
  DarkMode,
  CalendarMonth
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';

const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 72;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/admin/dashboard', roles: ['Admin', 'Incharge','Planner'] },
  { text: 'Wash Plans', icon: <CalendarMonth />, path: '/plans', roles: ['Admin', 'Incharge','Planner'] },
  { text: 'Work Orders', icon: <Assignment />, path: '/admin/work-orders', roles: ['Admin'] },
  { text: 'Transactions', icon: <SwapHoriz />, path: '/admin/transactions', roles: ['Admin'] },
  { text: 'Reports', icon: <Assessment />, path: '/admin/reports', roles: ['Admin', 'Incharge'] },
  // { text: 'Machine Track', icon: <Analytics />, path: '/admin/machine-track', roles: ['Admin', 'Incharge'] },
  { text: 'Manage Users', icon: <People />, path: '/admin/users', roles: ['Admin'] },
];

const Sidebar = ({ drawerWidth, mobileOpen, handleDrawerToggle, isCollapsed, toggleCollapse, isDarkMode, toggleTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { user, logout, isAdmin, hasRole } = useAuth();

  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) handleDrawerToggle();
  };

  const handleUserMenuOpen = (event) => setUserMenuAnchor(event.currentTarget);
  const handleUserMenuClose = () => setUserMenuAnchor(null);
  const handleLogout = () => { handleUserMenuClose(); logout(); };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Check if current path matches or starts with menu item path
  const isActivePath = (itemPath) => {
    if (itemPath === '/plans') {
      return location.pathname === '/plans' || location.pathname === '/plans/create';
    }
    return location.pathname === itemPath;
  };

  // Theme Colors
  const bg = isDarkMode ? '#0f172a' : '#ffffff';
  const textPrimary = isDarkMode ? '#f1f5f9' : '#1e293b';
  const textSecondary = isDarkMode ? '#94a3b8' : '#64748b';
  const textMuted = isDarkMode ? '#64748b' : '#94a3b8';
  const border = isDarkMode ? 'rgba(148,163,184,0.1)' : 'rgba(226,232,240,0.8)';
  const hoverBg = isDarkMode ? 'rgba(148,163,184,0.08)' : 'rgba(241,245,249,0.8)';
  const activeBg = isDarkMode ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)';
  const activeText = isDarkMode ? '#60a5fa' : '#2563eb';
  const menuBg = isDarkMode ? '#1e293b' : '#ffffff';
  const menuHover = isDarkMode ? 'rgba(148,163,184,0.1)' : '#f8fafc';

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: bg, color: textPrimary, transition: 'all 0.3s ease', borderRight: `1px solid ${border}` }}>
      
      {/* Logo Section */}
      <Box sx={{ px: isCollapsed ? 1.5 : 3, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', borderBottom: `1px solid ${border}`, minHeight: 68 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isCollapsed ? 0 : 1.5 }}>
          <Box sx={{ width: 38, height: 38, borderRadius: 2, background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <LocalLaundryService sx={{ fontSize: 22, color: 'white' }} />
          </Box>
          {!isCollapsed && (
            <Box>
             <Typography 
  variant="subtitle1" 
  fontWeight={700} 
  sx={{ 
    color: textPrimary, 
    fontSize: '1rem', 
    lineHeight: 1.2 
  }}
>
  WashTrack
</Typography>

<Typography 
  variant="caption" 
  sx={{ 
    color: textMuted, 
    fontSize: '0.65rem', 
    letterSpacing: '0.05em' 
  }}
>
  WASH · RECEIVE · DELIVERY
</Typography>
            </Box>
          )}
        </Box>
        {!isMobile && (
          <IconButton onClick={toggleCollapse} size="small" sx={{ color: textMuted, bgcolor: hoverBg, '&:hover': { color: textPrimary, bgcolor: hoverBg }, width: 28, height: 28 }}>
            {isCollapsed ? <ChevronRight sx={{ fontSize: 18 }} /> : <ChevronLeft sx={{ fontSize: 18 }} />}
          </IconButton>
        )}
      </Box>

      {/* Navigation */}
      <List sx={{ flexGrow: 1, px: 2, py: 1.5, overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const hasAccess = item.roles.some(role => hasRole(role));
          if (!hasAccess) return null;
          const isActive = isActivePath(item.path);

          return (
            <Tooltip key={item.text} title={item.text} placement="right" disableHoverListener={!isCollapsed} arrow
              componentsProps={{ tooltip: { sx: { bgcolor: isDarkMode ? '#334155' : '#1e293b', color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 500, px: 1.5, py: 0.75, borderRadius: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' } } }}
            >
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton onClick={() => handleNavigation(item.path)} sx={{
                  borderRadius: 1.5, minHeight: 48, justifyContent: isCollapsed ? 'center' : 'flex-start', px: isCollapsed ? 0 : 2.5, position: 'relative',
                  bgcolor: isActive ? activeBg : 'transparent', color: isActive ? activeText : textSecondary,
                  '&:hover': { bgcolor: isActive ? activeBg : hoverBg, color: isActive ? activeText : textPrimary }, transition: 'all 0.15s ease'
                }}>
                  {isActive && <Box sx={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', width: 3, height: 24, borderRadius: '0 4px 4px 0', bgcolor: '#3b82f6' }} />}
                  <ListItemIcon sx={{ color: 'inherit', minWidth: isCollapsed ? 'auto' : 36, justifyContent: 'center', '& .MuiSvgIcon-root': { fontSize: 20 } }}>{item.icon}</ListItemIcon>
                  {!isCollapsed && <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 600 : 400, fontSize: '0.85rem' }} />}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      <Divider sx={{ borderColor: border }} />

      {/* Footer: Theme Toggle & User Profile */}
      <Box sx={{ p: isCollapsed ? 1 : 1.5, bgcolor: isDarkMode ? 'rgba(15,23,42,0.6)' : '#f8fafc' }}>
        
        {/* Theme Toggle */}
        <Box sx={{ display: 'flex', justifyContent: isCollapsed ? 'center' : 'space-between', alignItems: 'center', mb: isCollapsed ? 1 : 1.5, px: isCollapsed ? 0 : 1 }}>
          {!isCollapsed && <Typography variant="caption" sx={{ color: textMuted, fontSize: '0.7rem' }}>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</Typography>}
          <IconButton size="small" onClick={toggleTheme} sx={{ color: isDarkMode ? '#fbbf24' : '#6366f1', bgcolor: isDarkMode ? 'rgba(251,191,36,0.1)' : 'rgba(99,102,241,0.1)', '&:hover': { bgcolor: isDarkMode ? 'rgba(251,191,36,0.2)' : 'rgba(99,102,241,0.2)' } }}>
            {isDarkMode ? <LightMode sx={{ fontSize: 16 }} /> : <DarkMode sx={{ fontSize: 16 }} />}
          </IconButton>
        </Box>

        {/* User Profile */}
        {!isCollapsed ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1, borderRadius: 1.5, cursor: 'pointer', transition: 'all 0.15s ease', '&:hover': { bgcolor: hoverBg } }} onClick={handleUserMenuOpen}>
            <Badge overlap="circular" anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} variant="dot" sx={{ '& .MuiBadge-badge': { bgcolor: isAdmin() ? '#f43f5e' : '#22c55e', border: `2px solid ${bg}`, width: 10, height: 10, borderRadius: '50%' } }}>
              <Avatar sx={{ width: 36, height: 36, bgcolor: isDarkMode ? '#1e3a5f' : '#dbeafe', color: isDarkMode ? '#60a5fa' : '#2563eb', fontSize: '0.8rem', fontWeight: 700, border: `1px solid ${isDarkMode ? 'rgba(59,130,246,0.3)' : 'rgba(37,99,235,0.2)'}` }}>{getInitials(user?.fullName)}</Avatar>
            </Badge>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} sx={{ color: textPrimary, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{user?.fullName || 'User'}</Typography>
              <Typography variant="caption" sx={{ color: textMuted, fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: 0.5 }}><AdminPanelSettings sx={{ fontSize: 10 }} />{isAdmin() ? 'Administrator' : 'Operator'}</Typography>
            </Box>
            <IconButton size="small" sx={{ color: textMuted, '&:hover': { color: textPrimary } }}><Settings sx={{ fontSize: 16 }} /></IconButton>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Tooltip title={user?.fullName || 'User'} placement="right" arrow>
              <Avatar onClick={handleUserMenuOpen} sx={{ width: 36, height: 36, bgcolor: isDarkMode ? '#1e3a5f' : '#dbeafe', color: isDarkMode ? '#60a5fa' : '#2563eb', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', '&:hover': { boxShadow: '0 0 0 2px rgba(59,130,246,0.3)' } }}>{getInitials(user?.fullName)}</Avatar>
            </Tooltip>
            <Tooltip title="Logout" placement="right" arrow>
              <IconButton size="small" onClick={handleLogout} sx={{ color: textMuted, '&:hover': { color: '#f43f5e' } }}><PowerSettingsNew sx={{ fontSize: 16 }} /></IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>

      {/* Dropdown Menu */}
      <Menu anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={handleUserMenuClose} transformOrigin={{ horizontal: 'left', vertical: 'bottom' }} anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        PaperProps={{ sx: { minWidth: 200, mt: -1, bgcolor: menuBg, color: textPrimary, border: `1px solid ${border}`, borderRadius: 2, boxShadow: '0 16px 48px rgba(0,0,0,0.2)', '& .MuiMenuItem-root': { py: 1, px: 2, borderRadius: 1, mx: 0.5, fontSize: '0.85rem', color: textSecondary, '&:hover': { bgcolor: menuHover } }, '& .MuiListItemIcon-root': { color: textMuted, minWidth: 32 } } }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" fontWeight={600} sx={{ color: textPrimary }}>{user?.fullName}</Typography>
          <Typography variant="caption" sx={{ color: textMuted }}>{user?.email}</Typography>
        </Box>
        <Divider sx={{ borderColor: border, mx: 1 }} />
        <MenuItem onClick={() => { navigate('/admin/dashboard'); handleUserMenuClose(); }}><ListItemIcon><Dashboard sx={{ fontSize: 18 }} /></ListItemIcon>Dashboard</MenuItem>
        <MenuItem onClick={handleUserMenuClose}><ListItemIcon><AccountCircle sx={{ fontSize: 18 }} /></ListItemIcon>Profile</MenuItem>
        <MenuItem onClick={handleUserMenuClose}><ListItemIcon><Settings sx={{ fontSize: 18 }} /></ListItemIcon>Settings</MenuItem>
        <Divider sx={{ borderColor: border, mx: 1 }} />
        <MenuItem onClick={handleLogout} sx={{ color: '#f43f5e !important', '&:hover': { bgcolor: 'rgba(244,63,94,0.1) !important' } }}>
          <ListItemIcon><Logout sx={{ fontSize: 18, color: '#f43f5e' }} /></ListItemIcon>
          <Typography sx={{ color: '#f43f5e', fontWeight: 500 }}>Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { sm: isCollapsed ? DRAWER_WIDTH_COLLAPSED : drawerWidth }, flexShrink: { sm: 0 }, transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, bgcolor: bg, border: 'none' } }}
      >{drawerContent}</Drawer>
      <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: isCollapsed ? DRAWER_WIDTH_COLLAPSED : drawerWidth, bgcolor: bg, borderRight: `1px solid ${border}`, transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)', boxShadow: isDarkMode ? '2px 0 8px rgba(0,0,0,0.3)' : '2px 0 8px rgba(0,0,0,0.05)' } }} open
      >{drawerContent}</Drawer>
    </Box>
  );
};

export default Sidebar;
