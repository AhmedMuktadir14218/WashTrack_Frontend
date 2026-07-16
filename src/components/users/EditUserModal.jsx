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
  Divider,
  Typography,
} from '@mui/material';
import { Business, Domain } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { userApi } from '../../api/userApi';

const ROLES = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'User' },
  { id: 7, name: 'Incharge' },
  { id: 9, name: 'Planner' }, 
];

const PROCESS_STAGES = [
  { id: 1, name: '1st Dry' },
  { id: 2, name: 'Unwash' },
  { id: 3, name: '2nd Dry' },
  { id: 4, name: '1st Wash' },
  { id: 5, name: 'Final Wash' },
  { id: 6, name: '1st Dryer' },
  { id: 7, name: '2nd Dryer' },
  { id: 8, name: 'Final Dryer' },
  { id: 9, name: 'Cool Dryer' },
  { id: 10, name: 'ReDryer' },
  { id: 11, name: 'Laser' },
  { id: 12, name: 'Acid Wash' },
  { id: 13, name: 'Ozon' },
  { id: 14, name: 'Acid Neutral' }
];

const PLANTS = [
  { id: 1, name: 'TPL' },
  { id: 2, name: 'TWL' },
];

const UNITS_BY_PLANT = {
  1: [
    { id: 1, name: 'Unit 1' },
    { id: 2, name: 'Unit 2' },
    { id: 3, name: 'Unit 3' },
    { id: 4, name: 'Unit 4' },
    { id: 7, name: 'Unit 5' },
    { id: 5, name: 'TPL G' },
  ],
  2: [{ id: 6, name: 'Unit TWL' }],
};

const getRoleColor = (name) => {
  if (name === 'Admin') return 'error';
  if (name === 'Incharge') return 'warning';
  if (name === 'Planner') return 'secondary';
  return 'primary';
};

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
    unitAssignments: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && open) {
      setFormData({
        fullName: user.fullName || '',
        username: user.username || '',
        email: user.email || '',
        password: '',
        roleIds: user.roles
          .map((role) => {
            const found = ROLES.find((r) => r.name === role);
            return found ? found.id : null;
          })
          .filter((id) => id !== null),
        stageIds:
          user.processStageAccesses
            ?.map((access) => access.processStageId)
            .filter(Boolean) || [],
        unitAssignments:
          user.userAssigns?.map((a) => ({
            plantId: a.plantId,
            unitId: a.unitId,
          })) || [],
      });
      setTabValue(0);
      setErrors({});
    }
  }, [user, open]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleRoleToggle = (roleId) => {
    setFormData((prev) => {
      const newRoleIds = prev.roleIds.includes(roleId)
        ? prev.roleIds.filter((id) => id !== roleId)
        : [...prev.roleIds, roleId];

      const isAdmin = newRoleIds.includes(1);
      const needsStages = newRoleIds.includes(2) || newRoleIds.includes(9); // User or Planner
      const needsUnits = newRoleIds.includes(7) || newRoleIds.includes(9); // Incharge or Planner

      return {
        ...prev,
        roleIds: newRoleIds,
        stageIds: isAdmin || !needsStages ? [] : prev.stageIds,
        unitAssignments: needsUnits ? prev.unitAssignments : [],
      };
    });
  };

  const handleStageToggle = (stageId) => {
    setFormData((prev) => ({
      ...prev,
      stageIds: prev.stageIds.includes(stageId)
        ? prev.stageIds.filter((id) => id !== stageId)
        : [...prev.stageIds, stageId],
    }));
  };

  const handlePlantToggle = (plantId) => {
    setFormData((prev) => {
      const plantUnits = UNITS_BY_PLANT[plantId] || [];
      const allSelected = plantUnits.every((u) =>
        prev.unitAssignments.some((a) => a.unitId === u.id)
      );

      if (allSelected) {
        return {
          ...prev,
          unitAssignments: prev.unitAssignments.filter(
            (a) => a.plantId !== plantId
          ),
        };
      } else {
        const existingOtherPlants = prev.unitAssignments.filter(
          (a) => a.plantId !== plantId
        );
        const newUnits = plantUnits.map((u) => ({ plantId, unitId: u.id }));
        return {
          ...prev,
          unitAssignments: [...existingOtherPlants, ...newUnits],
        };
      }
    });
  };

  const handleUnitToggle = (plantId, unitId) => {
    setFormData((prev) => {
      const exists = prev.unitAssignments.some((a) => a.unitId === unitId);
      if (exists) {
        return {
          ...prev,
          unitAssignments: prev.unitAssignments.filter(
            (a) => a.unitId !== unitId
          ),
        };
      } else {
        return {
          ...prev,
          unitAssignments: [...prev.unitAssignments, { plantId, unitId }],
        };
      }
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    const isAdmin = formData.roleIds.includes(1);
    const isUser = formData.roleIds.includes(2);
    const isIncharge = formData.roleIds.includes(7);
    const isPlanner = formData.roleIds.includes(9);

    if (!isAdmin && (isUser || isPlanner) && formData.stageIds.length === 0) {
      newErrors.stageIds =
        'Please select at least one process stage for User/Planner role';
    }

    if ((isIncharge || isPlanner) && formData.unitAssignments.length === 0) {
      newErrors.unitAssignments =
        'Please select at least one Plant/Unit for Incharge/Planner role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleSubmit = async () => {
  if (!validate()) return;

  try {
    setLoading(true);

    const isAdmin = formData.roleIds.includes(1);
    const isUser = formData.roleIds.includes(2);
    const isIncharge = formData.roleIds.includes(7);
    const isPlanner = formData.roleIds.includes(9);

    // ====================================================
    // STEP 1: Update basic user info (NO stageIds, NO units here)
    // ====================================================
    const updateData = {
      fullName: formData.fullName,
      username: formData.username,
      email: formData.email,
    };

    if (formData.password) {
      updateData.password = formData.password;
    }

    console.log('📤 Step 1 - Update User:', updateData);
    const response = await userApi.updateUser(user.id, updateData);

    if (!response.data.success) {
      toast.error(response.data.message || 'Failed to update user');
      return;
    }

    // ====================================================
    // STEP 2: Update Roles if changed
    // ====================================================
    const originalRoles = user.roles
      .map((role) => {
        const found = ROLES.find((r) => r.name === role);
        return found ? found.id : null;
      })
      .filter((id) => id !== null);

    const rolesChanged =
      JSON.stringify(originalRoles.sort()) !==
      JSON.stringify([...formData.roleIds].sort());

    if (rolesChanged) {
      try {
        console.log('📤 Step 2 - Assign Roles:', formData.roleIds);
        await userApi.assignRoles(user.id, formData.roleIds);
      } catch (roleErr) {
        console.error('Role update failed:', roleErr.response?.data);
        toast.error(
          roleErr.response?.data?.message || 'Failed to update roles'
        );
      }
    }

    // ====================================================
    // STEP 3: Assign Process Stages (User OR Planner, not Admin)
    // ====================================================
    if (!isAdmin && (isUser || isPlanner)) {
      try {
        console.log('📤 Step 3 - Assign Stages:', formData.stageIds);
        await userApi.assignStages(user.id, formData.stageIds);
      } catch (stageErr) {
        console.error('Stage update failed:', stageErr.response?.data);
        toast.error(
          stageErr.response?.data?.message ||
            'Failed to update Process Stages'
        );
      }
    }

    // ====================================================
    // STEP 4: Assign Plant/Units (Incharge OR Planner)
    // ====================================================
    if (isIncharge || isPlanner) {
      try {
        console.log('📤 Step 4 - Assign Units:', formData.unitAssignments);
        await userApi.assignUserUnits({
          userId: user.id,
          userAssignments: formData.unitAssignments,
        });
      } catch (assignErr) {
        console.error(
          'Plant/Unit update failed:',
          assignErr.response?.data
        );
        toast.error(
          assignErr.response?.data?.message ||
            'Failed to update Plant/Unit assignments'
        );
      }
    }

    toast.success('User updated successfully');
    onSuccess();
  } catch (error) {
    console.error('❌ Update user failed');
    console.error('Status:', error.response?.status);
    console.error('Response:', error.response?.data);

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.title ||
      'Failed to update user';
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const isAdmin = formData.roleIds.includes(1);
  const isUser = formData.roleIds.includes(2);
  const isIncharge = formData.roleIds.includes(7);
  const isPlanner = formData.roleIds.includes(9);

  const showStages = !isAdmin && (isUser || isPlanner);
  const showUnits = isIncharge || isPlanner;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User: {user?.username}</DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Tabs
          value={tabValue}
          onChange={(e, value) => setTabValue(value)}
          sx={{ mb: 1, borderBottom: 1, borderColor: 'divider' }}
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
              helperText={
                errors.password || 'Leave empty to keep current password'
              }
            />
          </Box>
        </TabPanel>

        {/* Tab 3: Roles & Access */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Roles */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Roles
              </Typography>
              <FormGroup>
                {ROLES.map((role) => (
                  <FormControlLabel
                    key={role.id}
                    control={
                      <Checkbox
                        checked={formData.roleIds.includes(role.id)}
                        onChange={() => handleRoleToggle(role.id)}
                        disabled={loading}
                        color={getRoleColor(role.name)}
                      />
                    }
                    label={role.name}
                  />
                ))}
              </FormGroup>
            </Box>

            {/* Process Stages — for User or Planner (not Admin) */}
            {showStages && (
              <>
                <Divider />
                {errors.stageIds && (
                  <Alert severity="error">{errors.stageIds}</Alert>
                )}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Process Stages Access
                    {isPlanner && (
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{ ml: 1, color: 'secondary.main' }}
                      >
                        (for Planner)
                      </Typography>
                    )}
                  </Typography>
                  <FormGroup>
                    {PROCESS_STAGES.map((stage) => (
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

            {/* Plant / Unit — for Incharge or Planner */}
            {showUnits && (
              <>
                <Divider />
                {errors.unitAssignments && (
                  <Alert severity="error">{errors.unitAssignments}</Alert>
                )}
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    <Business
                      sx={{ mr: 0.5, verticalAlign: 'middle', fontSize: 18 }}
                    />
                    Assign Plant & Units
                    {isPlanner && (
                      <Typography
                        component="span"
                        variant="caption"
                        sx={{ ml: 1, color: 'secondary.main' }}
                      >
                        (for Planner)
                      </Typography>
                    )}
                  </Typography>

                  {PLANTS.map((plant) => {
                    const plantUnits = UNITS_BY_PLANT[plant.id] || [];
                    const selectedPlantUnits = plantUnits.filter((u) =>
                      formData.unitAssignments.some((a) => a.unitId === u.id)
                    );
                    const allSelected =
                      selectedPlantUnits.length === plantUnits.length &&
                      plantUnits.length > 0;
                    const someSelected =
                      selectedPlantUnits.length > 0 && !allSelected;

                    return (
                      <Box
                        key={plant.id}
                        sx={{
                          mb: 1.5,
                          p: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          bgcolor: 'grey.50',
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={allSelected}
                              indeterminate={someSelected}
                              onChange={() => handlePlantToggle(plant.id)}
                              disabled={loading}
                              color={isPlanner ? 'secondary' : 'warning'}
                            />
                          }
                          label={
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 700 }}
                            >
                              {plant.name}
                            </Typography>
                          }
                        />
                        <Box sx={{ ml: 4 }}>
                          {plantUnits.map((unit) => (
                            <FormControlLabel
                              key={unit.id}
                              control={
                                <Checkbox
                                  checked={formData.unitAssignments.some(
                                    (a) => a.unitId === unit.id
                                  )}
                                  onChange={() =>
                                    handleUnitToggle(plant.id, unit.id)
                                  }
                                  disabled={loading}
                                  size="small"
                                  color={isPlanner ? 'secondary' : 'warning'}
                                />
                              }
                              label={
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                  }}
                                >
                                  <Domain
                                    sx={{
                                      fontSize: 14,
                                      color: 'text.secondary',
                                    }}
                                  />
                                  <span style={{ fontSize: 14 }}>
                                    {unit.name}
                                  </span>
                                </Box>
                              }
                            />
                          ))}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </>
            )}

            {isAdmin && (
              <Alert severity="info">
                Admin users have access to all process stages automatically.
              </Alert>
            )}

            {isPlanner && !isAdmin && (
              <Alert severity="info">
                Planner role requires both Process Stages and Plant/Unit access.
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
  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : undefined}
>
  {loading ? 'Updating...' : 'Update User'}
</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserModal;