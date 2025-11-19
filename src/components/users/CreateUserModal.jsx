// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\users\CreateUserModal.jsx
import { useState } from 'react';
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

const CreateUserModal = ({ open, onClose, onSuccess }) => {
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
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.roleIds.length === 0) {
      newErrors.roleIds = 'Please select at least one role';
    }

    const isAdmin = formData.roleIds.includes(1);
    if (!isAdmin && formData.stageIds.length === 0) {
      newErrors.stageIds = 'Please select at least one process stage for User role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const response = await userApi.createUser(formData);

      if (response.data.success) {
        toast.success('User created successfully');
        setFormData({
          fullName: '',
          username: '',
          email: '',
          password: '',
          roleIds: [],
          stageIds: [],
        });
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = formData.roleIds.includes(1);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New User</DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
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

          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={loading}
            fullWidth
            error={!!errors.password}
            helperText={errors.password}
          />

          {errors.roleIds && (
            <Alert severity="error">{errors.roleIds}</Alert>
          )}

          <Box>
            <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>
              Select Roles
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
            <>
              {errors.stageIds && (
                <Alert severity="error">{errors.stageIds}</Alert>
              )}

              <Box>
                <label style={{ fontWeight: 600, marginBottom: 8, display: 'block' }}>
                  Select Process Stages
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
            </>
          )}

          {isAdmin && (
            <Alert severity="info">
              Admin users have access to all process stages automatically.
            </Alert>
          )}
        </Box>
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
          {loading ? 'Creating...' : 'Create User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserModal;