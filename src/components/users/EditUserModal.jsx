// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\users\EditUserModal.jsx
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import toast from 'react-hot-toast';
import { userApi } from '../../api/userApi';

const ROLES = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'User' },
];

const PROCESS_STAGES = [
  { id: 1, name: '1st Dry' },
  { id: 2, name: 'Unwash' },
  { id: 3, name: '2nd Dry' },
  { id: 4, name: '1st Wash' },
  { id: 5, name: 'Final Wash' },
];

const TabPanel = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ width: '100%' }}>
    {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
  </div>
);

const EditUserModal = ({ open, onClose, user, onSuccess }) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    roleIds: [],
    stageIds: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && open) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        password: '',
        roleIds: user.roles.map(role => {
          const foundRole = ROLES.find(r => r.name === role);
          return foundRole ? foundRole.id : null;
        }).filter(id => id !== null),
        stageIds: user.processStageAccesses?.map(access => access.processStageId) || [],
      });
      setTabValue(0);
    }
  }, [user, open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleToggle = (roleId) => {
    setFormData(prev => {
      const newRoleIds = prev.roleIds.includes(roleId)
        ? prev.roleIds.filter(id => id !== roleId)
        : [...prev.roleIds, roleId];

      return {
        ...prev,
        roleIds: newRoleIds,
        stageIds: newRoleIds.includes(1) ? [] : prev.stageIds,
      };
    });
  };

// const handleStageToggle = (stageId) => {
//   setFormData(prev => ({
//     ...prev,
//     stageIds: prev.stageIds.includes(stageId)
//       ? prev.stageIds.filter(id => id !== stageId)
//       : [...prev.stageIds, stageId],
//   }));
// };
const handleStageToggle = (stageId) => {
  setFormData(prev => ({
    ...prev,
    stageIds: [stageId] // replace with only the clicked stage
  }));
};
  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const updateData = {
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      if (formData.stageIds.length > 0) {
        updateData.stageIds = formData.stageIds;
      }

      const response = await userApi.updateUser(user.id, updateData);

      if (response.data.success) {
        // Also update roles if changed
        const originalRoles = user.roles.map(role => {
          const foundRole = ROLES.find(r => r.name === role);
          return foundRole ? foundRole.id : null;
        }).filter(id => id !== null);

        if (JSON.stringify(originalRoles.sort()) !== JSON.stringify(formData.roleIds.sort())) {
          await userApi.assignRoles(user.id, formData.roleIds);
        }

        toast.success('User updated successfully');
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update user';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = formData.roleIds.includes(1);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User: {user?.username}</DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Tabs
          value={tabValue}
          onChange={(e, value) => setTabValue(value)}
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Basic Info" />
          <Tab label="Security" />
          <Tab label="Roles & Access" />
        </Tabs>

        {/* Tab 1: Basic Info */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              disabled={loading}
              fullWidth
              error={!!errors.fullName}
              helperText={errors.fullName}
            />

            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              disabled={loading}
              fullWidth
              error={!!errors.username}
              helperText={errors.username}
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={loading}
              fullWidth
              error={!!errors.email}
              helperText={errors.email}
            />
          </Box>
        </TabPanel>

        {/* Tab 2: Security */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info">
              Leave password empty to keep current password
            </Alert>

            <TextField
              label="New Password (Optional)"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              disabled={loading}
              fullWidth
              error={!!errors.password}
              helperText={errors.password || 'Leave empty to keep current password'}
            />
          </Box>
        </TabPanel>

        {/* Tab 3: Roles & Access */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>
                Roles
              </label>
              <FormGroup>
                {ROLES.map(role => (
                  <FormControlLabel
                    key={role.id}
                    control={
                      <Checkbox
                        checked={formData.roleIds.includes(role.id)}
                        onChange={() => handleRoleToggle(role.id)}
                        disabled={loading}
                      />
                    }
                    label={role.name}
                  />
                ))}
              </FormGroup>
            </Box>

            {!isAdmin && formData.roleIds.includes(2) && (
              <Box>
                <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>
                  Process Stages Access
                </label>
                <FormGroup>
                  {PROCESS_STAGES.map(stage => (
                    <FormControlLabel
                      key={stage.id}
                      control={
                        <Checkbox
                          checked={formData.stageIds.includes(stage.id)}
                          onChange={() => handleStageToggle(stage.id)}
                          disabled={loading}
                        />
                      }
                      label={stage.name}
                    />
                  ))}
                </FormGroup>
              </Box>
            )}

            {isAdmin && (
              <Alert severity="info">
                Admin users have access to all process stages automatically.
              </Alert>
            )}
          </Box>
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Updating...' : 'Update User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserModal;