// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\users\DeleteUserModal.jsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import { Warning } from '@mui/icons-material';

const DeleteUserModal = ({ open, onClose, user, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning sx={{ color: 'error.main' }} />
        Delete User
      </DialogTitle>

      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone!
          </Alert>

          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete the following user?
          </Typography>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Username:</strong> {user?.username}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Email:</strong> {user?.email}
            </Typography>
            <Typography variant="body2">
              <strong>Full Name:</strong> {user?.fullName}
            </Typography>
          </Box>

          <Alert severity="warning" sx={{ mt: 2 }}>
            All associated data for this user will also be deleted.
          </Alert>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
        >
          Delete User
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteUserModal;