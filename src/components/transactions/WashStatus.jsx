import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowBack, TrendingUp, SwapHoriz, CheckCircle } from '@mui/icons-material';
import { useWashTransaction } from '../../hooks/useWashTransaction';
import LoadingSpinner from '../common/LoadingSpinner';
import StatCard from '../common/StatCard';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const WashStatus = () => {
  const navigate = useNavigate();
  const { workOrderId } = useParams();
  const { getStatus, loading } = useWashTransaction();

  const [status, setStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    fetchStatus();
  }, [workOrderId]);

  const fetchStatus = async () => {
    try {
      setLoadingStatus(true);
      const result = await getStatus(workOrderId);

      if (result.success) {
        setStatus(result.data);
      } else {
        toast.error('Failed to load wash status');
      }
    } catch (error) {
      toast.error('Error loading wash status');
      console.error('Error:', error);
    } finally {
      setLoadingStatus(false);
    }
  };

  if (loadingStatus) {
    return <LoadingSpinner size="lg" fullScreen />;
  }

  if (!status) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Work order status not found</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition duration-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  const getStageColor = (index, total) => {
    const colors = [
      { bg: 'bg-yellow-100', border: 'border-yellow-300', text: 'text-yellow-700', icon: '🏭' },
      { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700', icon: '💧' },
      { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700', icon: '🔥' },
      { bg: 'bg-green-100', border: 'border-green-300', text: 'text-green-700', icon: '🧼' },
      { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700', icon: '✨' },
    ];
    return colors[index % colors.length];
  };

  const stages = Object.entries(status.stageBalances);
  const completionPercent = Math.round(status.completionPercentage);

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg hover:bg-gray-100 transition duration-200"
        >
          <ArrowBack className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Wash Status</h1>
          <p className="text-gray-600 text-sm mt-1">
            {status.workOrderNo} - {status.styleName}
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          label="Order Quantity"
          value={status.orderQuantity.toLocaleString()}
          icon={TrendingUp}
          color="primary"
        />
        <StatCard
          label="Total Received"
          value={status.totalReceived.toLocaleString()}
          icon={CheckCircle}
          color="success"
        />
        <StatCard
          label="Total Delivered"
          value={status.totalDelivered.toLocaleString()}
          icon={SwapHoriz}
          color="warning"
        />
        <StatCard
          label="Overall Balance"
          value={status.overallBalance.toLocaleString()}
          icon={TrendingUp}
          color="danger"
        />
      </div>

      {/* Completion Progress */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Overall Completion</h2>
          <span className="text-3xl font-bold text-primary-600">{completionPercent}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${completionPercent}%` }}
          />
        </div>

        {/* Progress Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Pending</p>
            <p className="text-xl font-bold text-orange-600">
              {status.overallBalance.toLocaleString()} pcs
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Completed</p>
            <p className="text-xl font-bold text-green-600">
              {status.totalDelivered.toLocaleString()} pcs
            </p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Remaining</p>
            <p className="text-xl font-bold text-red-600">
              {(status.orderQuantity - status.totalDelivered).toLocaleString()} pcs
            </p>
          </div>
        </div>
      </div>

      {/* Stage-wise Details */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
          <h2 className="text-xl font-bold text-white">Stage-wise Progress</h2>
          <p className="text-primary-100 text-sm mt-1">
            Track the status of material across all washing stages
          </p>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stages.map(([stageName, balance], index) => {
              const color = getStageColor(index, stages.length);
              const stagePercent = balance.totalReceived > 0
                ? Math.round((balance.totalDelivered / balance.totalReceived) * 100)
                : 0;

              return (
                <div
                  key={stageName}
                  className={`border-2 ${color.border} rounded-xl p-6 ${color.bg} hover:shadow-md transition duration-200`}
                >
                  {/* Stage Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{color.icon}</span>
                    <div>
                      <h3 className={`text-lg font-bold ${color.text}`}>
                        {stageName}
                      </h3>
                      <p className="text-xs opacity-75">
                        {stagePercent}% completed
                      </p>
                    </div>
                  </div>

                  {/* Progress Metrics */}
                  <div className="space-y-3">
                    {/* Received */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">Received</span>
                        <span className={`text-sm font-bold ${color.text}`}>
                          {balance.totalReceived.toLocaleString()} pcs
                        </span>
                      </div>
                    </div>

                    {/* Delivered */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700">Delivered</span>
                        <span className={`text-sm font-bold ${color.text}`}>
                          {balance.totalDelivered.toLocaleString()} pcs
                        </span>
                      </div>
                    </div>

                    {/* Balance */}
                    <div className="pt-3 border-t-2 border-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-700">Current Balance</span>
                        <span className={`text-lg font-bold ${
                          balance.currentBalance === 0
                            ? 'text-red-600'
                            : balance.currentBalance < 100
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}>
                          {balance.currentBalance.toLocaleString()} pcs
                        </span>
                      </div>
                    </div>

                    {/* Timestamps */}
                    {(balance.lastReceiveDate || balance.lastDeliveryDate) && (
                      <div className="pt-3 border-t-2 border-gray-300 text-xs text-gray-600">
                        {balance.lastReceiveDate && (
                          <p>
                            📥 Last Received: {format(new Date(balance.lastReceiveDate), 'dd MMM, HH:mm')}
                          </p>
                        )}
                        {balance.lastDeliveryDate && (
                          <p>
                            📤 Last Delivered: {format(new Date(balance.lastDeliveryDate), 'dd MMM, HH:mm')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="w-full h-2 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                        style={{ width: `${stagePercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Work Order Details */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">📋</span> Order Details
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Work Order No</span>
              <span className="font-semibold">{status.workOrderNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Buyer</span>
              <span className="font-semibold">{status.buyer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Factory</span>
              <span className="font-semibold">{status.factory}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Line</span>
              <span className="font-semibold">{status.line}</span>
            </div>
          </div>
        </div>

        {/* Production Info */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-2xl">🎨</span> Product Info
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Style Name</span>
              <span className="font-semibold">{status.styleName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Color</span>
              <span className="font-semibold">{status.color || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Wash Type</span>
              <span className="font-semibold">{status.washType || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order Qty</span>
              <span className="font-semibold">{status.orderQuantity.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-md p-6 text-white">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span> Summary
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between opacity-90">
              <span>Total Received</span>
              <span className="font-semibold">{status.totalReceived.toLocaleString()}</span>
            </div>
            <div className="flex justify-between opacity-90">
              <span>Total Delivered</span>
              <span className="font-semibold">{status.totalDelivered.toLocaleString()}</span>
            </div>
            <div className="h-px bg-white opacity-20 my-2" />
            <div className="flex justify-between text-lg">
              <span className="font-bold">Remaining</span>
              <span className="font-bold">{status.overallBalance.toLocaleString()}</span>
            </div>
            <div className="pt-2 text-xs opacity-75">
              {completionPercent}% Complete
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => navigate(`/work-orders/${workOrderId}`)}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition duration-200"
        >
          Go to Work Order
        </button>
        <button
          onClick={fetchStatus}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition duration-200"
        >
          Refresh Status
        </button>
      </div>
    </div>
  );
};

export default WashStatus;