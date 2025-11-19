// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\workorders\WorkOrderList.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Upload,
  Download,
  Search,
  Refresh
} from '@mui/icons-material';
import { CircularProgress, IconButton, Tooltip, Chip } from '@mui/material';
import { workOrderApi } from '../../api/workOrderApi';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';

const WorkOrderList = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredData, setFilteredData] = useState([]);
// console.log('Render WorkOrderList Component',workOrders);
  // Fetch work orders
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

  // Search filter
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

  // Handle delete
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

  // Handle download template
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

  // DataGrid columns
  const columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      headerClassName: 'bg-gray-100 font-bold',
    },
    {
      field: 'workOrderNo',
      headerName: 'Work Order No',
      width: 150,
      headerClassName: 'bg-gray-100 font-bold',
      renderCell: (params) => (
        <span className="font-semibold text-primary-600">
          {params.value}
        </span>
      ),
    },
    {
      field: 'styleName',
      headerName: 'Style Name',
      width: 250,
      headerClassName: 'bg-gray-100 font-bold',
    },
    {
      field: 'buyer',
      headerName: 'Buyer',
      width: 130,
      headerClassName: 'bg-gray-100 font-bold',
    },
    {
      field: 'factory',
      headerName: 'Factory',
      width: 120,
      headerClassName: 'bg-gray-100 font-bold',
    },
    {
      field: 'line',
      headerName: 'Line',
      width: 120,
      headerClassName: 'bg-gray-100 font-bold',
    },
    {
      field: 'orderQuantity',
      headerName: 'Order Qty',
      width: 120,
      headerClassName: 'bg-gray-100 font-bold',
      renderCell: (params) => (
        <span className="font-medium text-gray-700">
          {params.value?.toLocaleString()}
        </span>
      ),
    },
    {
      field: 'washType',
      headerName: 'Wash Type',
      width: 130,
      headerClassName: 'bg-gray-100 font-bold',
      renderCell: (params) => (
        <Chip
          label={params.value || 'N/A'}
          size="small"
          color="primary"
          variant="outlined"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created Date',
      width: 130,
      headerClassName: 'bg-gray-100 font-bold',
      renderCell: (params) => (
        <span className="text-gray-600 text-sm">
          {params.value ? format(new Date(params.value), 'dd MMM yyyy') : 'N/A'}
        </span>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      headerClassName: 'bg-gray-100 font-bold',
      sortable: false,
      renderCell: (params) => (
        <div className="flex items-center gap-1">
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => navigate(`/admin/work-orders/${params.row.id}`)}
              className="text-blue-600 hover:bg-blue-50"
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>

          {isAdmin() && (
            <>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => navigate(`/admin/work-orders/edit/${params.row.id}`)}
                  className="text-green-600 hover:bg-green-50"
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  onClick={() => handleDelete(params.row.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Work Orders</h1>
          <p className="text-gray-600 text-sm mt-1">
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
      <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search work orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition duration-200"
            />
          </div>

          <button
            onClick={fetchWorkOrders}
            disabled={loading}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg flex items-center gap-2 transition duration-200 disabled:opacity-50"
          >
            <Refresh fontSize="small" />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <CircularProgress />
          </div>
        ) : (
          <div style={{ height: 600, width: '100%' }}>
            <DataGrid
              rows={filteredData}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 25, 50]}
              disableSelectionOnClick
              sx={{
                border: 'none',
                '& .MuiDataGrid-cell:focus': {
                  outline: 'none',
                },
                '& .MuiDataGrid-row:hover': {
                  backgroundColor: '#f9fafb',
                },
              }}
            />
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="mt-4 text-sm text-gray-600">
        Showing <strong>{filteredData.length}</strong> of{' '}
        <strong>{workOrders.length}</strong> work orders
      </div>
    </div>
  );
};

export default WorkOrderList;