import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { userApi } from '../../api/userApi';
import CreateUserModal from './CreateUserModal';
import EditUserModal from './EditUserModal';
import DeleteUserModal from './DeleteUserModal';

const useDebounce = (callback, delay) => {
  const timeoutRef = useRef(null);
  return useCallback((...args) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

const allRoles = ['Admin', 'Incharge', 'Planner', 'User'];

const roleBadge = {
  Admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Incharge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Planner: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  User: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

const roleDot = {
  Admin: 'bg-red-500',
  Incharge: 'bg-amber-500',
  Planner: 'bg-sky-500',
  User: 'bg-green-500',
};

const UserManagement = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      let users = [];
      let page = 1;
      const size = 100;
      let total = 0;

      const firstRes = await userApi.getAllUsers(page, size);
      if (firstRes.data.success) {
        users = firstRes.data.data.users;
        total = firstRes.data.data.totalCount;
        setTotalCount(total);

        const totalPages = Math.ceil(total / size);
        const remaining = [];
        for (let p = 2; p <= totalPages; p++) {
          try {
            const res = await userApi.getAllUsers(p, size);
            if (res.data.success) remaining.push(...res.data.data.users);
          } catch (e) {
            console.error(`Failed to fetch page ${p}`, e);
          }
        }
        users = users.concat(remaining);
      }

      setAllUsers(users);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const filteredUsers = useMemo(() => {
    let result = allUsers;
    if (appliedSearch) {
      const q = appliedSearch.toLowerCase();
      result = result.filter(
        (u) =>
          u.username?.toLowerCase().includes(q) ||
          u.fullName?.toLowerCase().includes(q)
      );
    }
    if (roleFilter) {
      result = result.filter((u) =>
        u.roles?.some((r) => r.toLowerCase() === roleFilter.toLowerCase())
      );
    }
    return result;
  }, [allUsers, appliedSearch, roleFilter]);

  const pagedUsers = useMemo(() => {
    const start = pageNumber * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, pageNumber, pageSize]);

  const filteredCount = filteredUsers.length;
  const hasFilters = searchTerm || roleFilter;
  const displayCount = hasFilters ? filteredCount : totalCount;

  const debouncedSearch = useDebounce((value) => {
    setAppliedSearch(value);
    setPageNumber(0);
  }, 400);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
    setPageNumber(0);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setAppliedSearch('');
    setRoleFilter('');
    setPageNumber(0);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const response = await userApi.deleteUser(selectedUser.id);
      if (response.data.success) {
        toast.success('User deleted successfully');
        setDeleteModalOpen(false);
        setSelectedUser(null);
        fetchAllUsers();
      }
    } catch (error) {
      toast.error('Failed to delete user');
      console.error(error);
    }
  };

  const handleUserCreated = () => {
    setCreateModalOpen(false);
    setPageNumber(0);
    fetchAllUsers();
  };

  const handleUserUpdated = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
    fetchAllUsers();
  };

  const totalPagesCount = Math.ceil(displayCount / pageSize);

  return (
    <div className="p-6 dark:bg-slate-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">User Management</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage system users and their access permissions</p>
        </div>
        <button
          onClick={() => setCreateModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-sm"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create User
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Search</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by username or name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full border border-gray-300 dark:border-slate-600 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Role Filter</label>
            <select
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-slate-200"
            >
              <option value="">All Roles</option>
              {allRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {hasFilters && (
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline transition-colors"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 flex flex-col">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="min-w-full border border-gray-200 dark:border-slate-600 divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-700 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider border border-gray-200 dark:border-slate-600">Username</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider border border-gray-200 dark:border-slate-600">Full Name</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider border border-gray-200 dark:border-slate-600">Roles</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider border border-gray-200 dark:border-slate-600">Plant / Unit</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider border border-gray-200 dark:border-slate-600">Status</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-600 dark:text-slate-300 uppercase tracking-wider border border-gray-200 dark:border-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">
                    <svg className="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </td>
                </tr>
              ) : pagedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-slate-400">
                    <svg className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="font-medium">{hasFilters ? 'No users match the current filters' : 'No users found'}</p>
                    <p className="text-sm mt-1">{hasFilters ? 'Try adjusting your search or filter' : 'Create a new user to get started'}</p>
                  </td>
                </tr>
              ) : (
                pagedUsers.map((user, index) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-slate-200 border border-gray-200 dark:border-slate-700">
                      {user.username}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300 border border-gray-200 dark:border-slate-700">
                      {user.fullName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap border border-gray-200 dark:border-slate-700">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${roleBadge[role] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap border border-gray-200 dark:border-slate-700">
                      {user.userAssigns && user.userAssigns.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.userAssigns.map((assign, idx) => (
                            <span
                              key={idx}
                              title={`${assign.plantName} - ${assign.unitName}`}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
                            >
                              {assign.unitName}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 dark:text-slate-600 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap border border-gray-200 dark:border-slate-700">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-slate-400'}`}>
                        <svg className={`h-3 w-3 ${user.isActive ? 'text-green-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          {user.isActive ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
                          )}
                        </svg>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center border border-gray-200 dark:border-slate-700">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title="Edit User"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete User"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {displayCount > 0 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-slate-700">
            <div className="text-sm text-gray-600 dark:text-slate-400">
              Showing {pageNumber * pageSize + 1} to {Math.min((pageNumber + 1) * pageSize, displayCount)} of {displayCount} users
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPageNumber(0)}
                disabled={pageNumber === 0}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:bg-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                First
              </button>
              <button
                onClick={() => setPageNumber(pageNumber - 1)}
                disabled={pageNumber === 0}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:bg-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400">
                {pageNumber + 1} / {totalPagesCount || 1}
              </span>
              <button
                onClick={() => setPageNumber(pageNumber + 1)}
                disabled={pageNumber >= totalPagesCount - 1}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:bg-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
              <button
                onClick={() => setPageNumber(totalPagesCount - 1)}
                disabled={pageNumber >= totalPagesCount - 1}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 rounded hover:bg-gray-50 dark:bg-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Last
              </button>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(parseInt(e.target.value, 10)); setPageNumber(0); }}
                className="ml-2 border border-gray-300 dark:border-slate-600 rounded px-2 py-1.5 text-sm dark:bg-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 999px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .custom-scrollbar::-webkit-scrollbar-corner { background: transparent; }
        .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #64748b; }
        .dark .custom-scrollbar { scrollbar-color: #475569 transparent; }
      `}</style>

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
    </div>
  );
};

export default UserManagement;
