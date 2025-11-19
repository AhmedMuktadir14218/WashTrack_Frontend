// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\users\UserManagement.jsx
import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  IconButton,
  Chip,
  Card,
  CardHeader,
  CardContent,
  Dialog,
} from '@mui/material';
import { Edit, Delete, Add, Visibility, VisibilityOff } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { userApi } from '../../api/userApi';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import DeleteUserModal from './DeleteUserModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, [pageNumber, pageSize]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAllUsers(pageNumber + 1, pageSize);
      
      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalCount(response.data.data.totalCount);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPageNumber(newPage);
  };

  // Handle page size change
  const handleChangeRowsPerPage = (event) => {
    setPageSize(parseInt(event.target.value, 10));
    setPageNumber(0);
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  // Handle delete user
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    try {
      const response = await userApi.deleteUser(selectedUser.id);
      
      if (response.data.success) {
        toast.success('User deleted successfully');
        setDeleteModalOpen(false);
        setSelectedUser(null);
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to delete user');
      console.error(error);
    }
  };

  // Handle create user success
  const handleUserCreated = () => {
    setCreateModalOpen(false);
    setPageNumber(0);
    fetchUsers();
  };

  // Handle edit user success
  const handleUserUpdated = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
    fetchUsers();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardHeader
          title="User Management"
          subheader="Manage system users and their access permissions"
          action={
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => setCreateModalOpen(true)}
            >
              Create User
            </Button>
          }
        />

        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ bgcolor: 'primary.light' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                        Username
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                        Email
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                        Full Name
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                        Roles
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }}>
                        Status
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', color: 'white' }} align="center">
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id} hover>
                          <TableCell sx={{ fontWeight: 500 }}>
                            {user.username}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.fullName}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {user.roles.map((role) => (
                                <Chip
                                  key={role}
                                  label={role}
                                  size="small"
                                  color={role === 'Admin' ? 'error' : 'primary'}
                                  variant="outlined"
                                />
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={user.isActive ? <Visibility /> : <VisibilityOff />}
                              label={user.isActive ? 'Active' : 'Inactive'}
                              color={user.isActive ? 'success' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEditUser(user)}
                              title="Edit User"
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteUser(user)}
                              title="Delete User"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={totalCount}
                rowsPerPage={pageSize}
                page={pageNumber}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateUserModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleUserCreated}
      />

      {selectedUser && (
        <>
          <EditUserModal
            open={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            user={selectedUser}
            onSuccess={handleUserUpdated}
          />

          <DeleteUserModal
            open={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            user={selectedUser}
            onConfirm={handleConfirmDelete}
          />
        </>
      )}
    </Box>
  );
};

export default UserManagement;