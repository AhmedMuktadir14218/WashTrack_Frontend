// D:\TusukaReact\WashRecieveDelivary_Frontend\src\components\workorders\WorkOrderDetail.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CircularProgress, Chip } from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Factory,
  Person,
  Assignment,
  LocalLaundryService,
  CalendarToday,
  Numbers
} from '@mui/icons-material';
import { workOrderApi } from '../../api/workOrderApi';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { format } from 'date-fns';

const WorkOrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isAdmin } = useAuth();

  const [workOrder, setWorkOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkOrder();
  }, [id]);

  const fetchWorkOrder = async () => {
    try {
      setLoading(true);
      const response = await workOrderApi.getById(id);
      if (response.data.success) {
        setWorkOrder(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load work order details');
      console.error('Error fetching work order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this work order?')) {
      return;
    }

    try {
      const response = await workOrderApi.delete(id);
      if (response.data.success) {
        toast.success('Work order deleted successfully');
        navigate('/work-orders');
      }
    } catch (error) {
      toast.error('Failed to delete work order');
      console.error('Error deleting work order:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <CircularProgress />
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Work order not found</p>
        <button
          onClick={() => navigate('/work-orders')}
          className="mt-4 px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition duration-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  const InfoCard = ({ icon, title, value, colorClass = 'text-gray-700' }) => (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-2">
        <div className={`${colorClass}`}>{icon}</div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
      </div>
      <p className="text-lg font-semibold text-gray-800">
        {value || 'N/A'}
      </p>
    </div>
  );

  return (
    <div className="fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/work-orders')}
            className="p-2 rounded-lg hover:bg-gray-100 transition duration-200"
          >
            <ArrowBack />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {workOrder.workOrderNo}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Work Order Details
            </p>
          </div>
        </div>

        {isAdmin() && (
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/work-orders/edit/${id}`)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition duration-200 shadow-md hover:shadow-lg"
            >
              <Edit fontSize="small" />
              <span className="text-sm font-medium">Edit</span>
            </button>

            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 transition duration-200 shadow-md hover:shadow-lg"
            >
              <Delete fontSize="small" />
              <span className="text-sm font-medium">Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Basic Information */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Factory className="text-primary-600" />
          Factory Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard
            icon={<Factory fontSize="small" />}
            title="Factory"
            value={workOrder.factory}
            colorClass="text-blue-600"
          />
          <InfoCard
            icon={<Assignment fontSize="small" />}
            title="Line"
            value={workOrder.line}
            colorClass="text-green-600"
          />
          <InfoCard
            icon={<Assignment fontSize="small" />}
            title="Unit"
            value={workOrder.unit}
            colorClass="text-purple-600"
          />
          <InfoCard
            icon={<Person fontSize="small" />}
            title="Buyer"
            value={workOrder.buyer}
            colorClass="text-orange-600"
          />
        </div>
      </div>

      {/* Product Details */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Assignment className="text-primary-600" />
          Product Details
        </h2>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Style Name</p>
              <p className="font-semibold text-gray-800">{workOrder.styleName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Buyer Department</p>
              <p className="font-semibold text-gray-800">{workOrder.buyerDepartment || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">FastReact No</p>
              <p className="font-semibold text-gray-800">{workOrder.fastReactNo || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Color</p>
              <p className="font-semibold text-gray-800">{workOrder.color || 'N/A'}</p>
            </div>
            {/* <div>
              <p className="text-sm text-gray-600 mb-1">Wash Type</p>
              <Chip
                label={workOrder.washType || 'N/A'}
                color="primary"
                size="small"
              />
            </div> */}
          </div>
        </div>
      </div>

      {/* Quantities */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Numbers className="text-primary-600" />
          Quantities
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-center">
            <p className="text-xs text-blue-600 font-medium mb-1">Order Qty</p>
            <p className="text-xl font-bold text-blue-900">
              {workOrder.orderQuantity?.toLocaleString() || 0}
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-lg border border-green-200 text-center">
            <p className="text-xs text-green-600 font-medium mb-1">Cut Qty</p>
            <p className="text-xl font-bold text-green-900">
              {workOrder.cutQty?.toLocaleString() || 0}
            </p>
          </div>

          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200 text-center">
            <p className="text-xs text-purple-600 font-medium mb-1">Wash Received</p>
            <p className="text-xl font-bold text-purple-900">
              {workOrder.totalWashReceived?.toLocaleString() || 0}
            </p>
          </div>

          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200 text-center">
            <p className="text-xs text-orange-600 font-medium mb-1">Wash Delivery</p>
            <p className="text-xl font-bold text-orange-900">
              {workOrder.totalWashDelivery?.toLocaleString() || 0}
            </p>
          </div>

          <div className="p-4 bg-red-50 rounded-lg border border-red-200 text-center">
            <p className="text-xs text-red-600 font-medium mb-1">Wash Balance</p>
            <p className="text-xl font-bold text-red-900">
              {workOrder.washBalance?.toLocaleString() || 0}
            </p>
          </div>

          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 text-center">
            <p className="text-xs text-yellow-600 font-medium mb-1">From Received</p>
            <p className="text-xl font-bold text-yellow-900">
              {workOrder.fromReceived?.toLocaleString() || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <CalendarToday className="text-primary-600" />
          Important Dates
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">TOD</p>
            <p className="font-semibold text-gray-800">{formatDate(workOrder.tod)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Sewing Comp Date</p>
            <p className="font-semibold text-gray-800">{formatDate(workOrder.sewingCompDate)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">1st RCV Date</p>
            <p className="font-semibold text-gray-800">{formatDate(workOrder.firstRCVDate)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Wash Approval Date</p>
            <p className="font-semibold text-gray-800">{formatDate(workOrder.washApprovalDate)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Wash Target Date</p>
            <p className="font-semibold text-gray-800">{formatDate(workOrder.washTargetDate)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Created At</p>
            <p className="font-semibold text-gray-800">{formatDate(workOrder.createdAt)}</p>
          </div>
        </div>
      </div>

      {/* Remarks */}
      {workOrder.marks && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Marks / Remarks</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{workOrder.marks}</p>
        </div>
      )}
    </div>
  );
};

export default WorkOrderDetail;