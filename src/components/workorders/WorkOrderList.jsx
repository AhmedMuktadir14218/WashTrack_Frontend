// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\workorders\WorkOrderList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Upload,
  Download,
  Search,
  Refresh,
  ChevronLeft,
  ChevronRight
} from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { workOrderApi } from '../../api/workOrderApi';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';

const WorkOrderList = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const response = await workOrderApi.getAll();
      if (response.data.success) {
        setWorkOrders(response.data.data);
        setFilteredData(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load work orders');
      console.error('Error fetching work orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredData(workOrders);
    } else {
      const filtered = workOrders.filter((order) =>
        Object.values(order).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, workOrders]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this work order?')) {
      return;
    }

    try {
      const response = await workOrderApi.delete(id);
      if (response.data.success) {
        toast.success('Work order deleted successfully');
        fetchWorkOrders();
      }
    } catch (error) {
      toast.error('Failed to delete work order');
      console.error('Error deleting work order:', error);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await workOrderApi.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'WorkOrder_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Template downloaded successfully');
    } catch (error) {
      toast.error('Failed to download template');
      console.error('Error downloading template:', error);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  return (
    <div className="fade-in dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Work Orders</h1>
          <p className="text-gray-600 dark:text-slate-400 text-sm mt-1">
            Manage all work orders and track their status
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Tooltip title="Download Template">
            <button
              onClick={handleDownloadTemplate}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition duration-200 shadow-md hover:shadow-lg"
            >
              <Download fontSize="small" />
              <span className="text-sm font-medium">Template</span>
            </button>
          </Tooltip>

          {isAdmin() && (
            <>
              <Tooltip title="Bulk Upload">
                <button
                  onClick={() => navigate('/admin/work-orders/bulk-upload')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 transition duration-200 shadow-md hover:shadow-lg"
                >
                  <Upload fontSize="small" />
                  <span className="text-sm font-medium">Bulk Upload</span>
                </button>
              </Tooltip>

              <Tooltip title="Add New Work Order">
                <button
                  onClick={() => navigate('/admin/work-orders/create') }
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2 transition duration-200 shadow-md hover:shadow-lg"
                >
                  <Add fontSize="small" />
                  <span className="text-sm font-medium">Add New</span>
                </button>
              </Tooltip>
            </>
          )}
        </div>
      </div>

      {/* Search and Refresh */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-4 mb-6 border border-gray-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search work orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200 dark:bg-slate-700 dark:text-slate-200"
            />
          </div>

          <button
            onClick={fetchWorkOrders}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 rounded-lg flex items-center gap-2 transition duration-200 disabled:opacity-50"
          >
            <Refresh fontSize="small" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <LoadingSpinner size="lg" />
        ) : filteredData.length === 0 ? (
          <EmptyState
            title="No Work Orders"
            description="No work orders found. Try adjusting your search."
            variant="search"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">Work Order No</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">Style Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">Buyer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">Factory</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">Line</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">Order Qty</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">Wash Target</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">Created Date</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {paginatedData.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition duration-150">
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-400">{order.id}</td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-primary-600 dark:text-primary-400">{order.workOrderNo}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 dark:text-slate-300">{order.styleName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 dark:text-slate-300">{order.buyer}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 dark:text-slate-300">{order.factory}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 dark:text-slate-300">{order.line}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-700 dark:text-slate-300">
                        {order.orderQuantity?.toLocaleString() || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-slate-400">
                        {order.washTargetDate ? format(new Date(order.washTargetDate), 'dd MMM yyyy') : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600 dark:text-slate-400">
                        {order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip title="View Details">
                          <button
                            onClick={() => navigate(`/admin/work-orders/${order.id}`)}
                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition duration-200"
                          >
                            <Visibility fontSize="small" />
                          </button>
                        </Tooltip>

                        {isAdmin() && (
                          <>
                            <Tooltip title="Edit">
                              <button
                                onClick={() => navigate(`/admin/work-orders/edit/${order.id}`)}
                                className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition duration-200"
                              >
                                <Edit fontSize="small" />
                              </button>
                            </Tooltip>

                            <Tooltip title="Delete">
                              <button
                                onClick={() => handleDelete(order.id)}
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition duration-200"
                              >
                                <Delete fontSize="small" />
                              </button>
                            </Tooltip>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredData.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-6 border-t border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-700 dark:text-slate-300 font-medium">
                Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong>
              </span>
              <span className="text-sm text-gray-600 dark:text-slate-400">
                ({filteredData.length} total records)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 dark:text-slate-300"
              >
                <ChevronLeft fontSize="small" />
              </button>

              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-lg font-semibold transition duration-200 ${
                        currentPage === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="p-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200 dark:text-slate-300"
              >
                <ChevronRight fontSize="small" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 dark:text-slate-300 font-medium">
                Per page:
              </label>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
                className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 font-medium text-sm dark:bg-slate-700 dark:text-slate-200"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-600 dark:text-slate-400">
        Showing <strong className="text-gray-700 dark:text-slate-300">{paginatedData.length}</strong> of{' '}
        <strong className="text-gray-700 dark:text-slate-300">{filteredData.length}</strong> work orders
      </div>
    </div>
  );
};

export default WorkOrderList;
